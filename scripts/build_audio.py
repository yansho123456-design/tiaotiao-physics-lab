#!/usr/bin/env python3
"""
Synthesize scene-by-scene narration audio into build/mix.wav + build/timeline.js + build/narration.srt.
Default speed is 1.3x (+30% rate + silence trim) so pacing is brisk and natural,
and timeline.js is measured from the final sped-up segments so visuals stay 100% in sync.
"""
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REF_WAV = os.path.abspath(os.path.join(HERE, "..", "references", "voice_ref", "ref_voice.wav"))

REPLACEMENTS = [
    (r"v[₀_0]+", "初速度 v 零"),
    (r"v[ₜ_t]+", "末速度 v t"),
    (r"L_B", "L B"),
    (r"L_C", "L C"),
    (r"S_B", "S B"),
    (r"S_C", "S C"),
    (r"R_B", "R B"),
    (r"R_C", "R C"),
    (r"m/s²|m/s\^2", "米每二次方秒"),
    (r"m/s", "米每秒"),
    (r"m²", "平方米"),
    (r"m³", "立方米"),
    (r"Δx", "位移变化量 delta x"),
    (r"Δv", "速度变化量 delta v"),
    (r"ΔΦ", "磁通量变化量 delta phi"),
    (r"μ", "动摩擦因数 miu"),
    (r"ρ", "电阻率 rou"),
    (r"ω", "角速度 omega"),
    (r"θ", "夹角 theta"),
]


def get_ffmpeg() -> str:
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        return sys_ff
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def normalize_physics_tts(text: str) -> str:
    out = text
    for pat, rep in REPLACEMENTS:
        out = re.sub(pat, rep, out)
    return out


def probe_duration(ffmpeg_exe: str, audio_path: str) -> float:
    proc = subprocess.run(
        [ffmpeg_exe, "-i", audio_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", proc.stderr)
    if not m:
        return 2.5
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))


def fmt_srt_time(sec: float) -> str:
    ms = int(round((sec % 1) * 1000))
    total = int(sec)
    return f"{total // 3600:02d}:{(total // 60) % 60:02d}:{total % 60:02d},{ms:03d}"


def synth_custom_clone_api(text: str, out_path: str) -> bool:
    endpoint = os.environ.get("TTS_CLONE_ENDPOINT")
    if not endpoint or not os.path.exists(REF_WAV):
        return False
    payload = json.dumps({"text": text, "ref_audio_path": REF_WAV}).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    api_key = os.environ.get("TTS_CLONE_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    req = urllib.request.Request(endpoint, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        with open(out_path, "wb") as f:
            f.write(resp.read())
    return True


async def synth_edge_tts(text: str, out_path: str) -> None:
    import edge_tts
    # +30% (= 1.3x) speech rate directly in neural TTS for crisp natural pitch
    comm = edge_tts.Communicate(text, "zh-CN-YunxiNeural", rate="+30%")
    await comm.save(out_path)


def postprocess_segment(ffmpeg_exe: str, raw_path: str, final_path: str, extra_atempo: float = 1.0) -> None:
    """Trim leading/trailing silence and optionally apply atempo so pacing is tight."""
    af = "silenceremove=start_periods=1:start_silence=0.04:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.06:start_threshold=-45dB,areverse"
    if abs(extra_atempo - 1.0) > 1e-3:
        af = f"atempo={extra_atempo:.3f}," + af
    subprocess.run(
        [ffmpeg_exe, "-y", "-i", raw_path, "-af", af, "-ar", "24000", "-ac", "1", final_path],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python3 build_audio.py <课题目录>")
        return 2
    lesson_dir = os.path.abspath(sys.argv[1])
    script_path = os.path.join(lesson_dir, "script.json")
    if not os.path.exists(script_path):
        print(f"[ERROR] 缺少 {script_path}", file=sys.stderr)
        return 1

    ffmpeg_exe = get_ffmpeg()
    data = json.load(open(script_path, encoding="utf-8"))
    build_dir = os.path.join(lesson_dir, "build")
    seg_dir = os.path.join(build_dir, "segs")
    os.makedirs(seg_dir, exist_ok=True)

    use_cloud = bool(os.environ.get("TTS_CLONE_ENDPOINT"))
    if not use_cloud:
        print("[INFO] 使用 1.3 倍速 edge-tts 男声合成音频与同步时间轴。")

    cur_t = 0.5
    timeline_scenes = []
    audio_items = []
    srt_lines = []
    srt_idx = 1

    for s_idx, sc in enumerate(data.get("scenes", [])):
        sc_start = cur_t
        if s_idx > 0:
            cur_t += 0.35
        sc_lines = []
        for l_idx, ln in enumerate(sc.get("lines", [])):
            zh = ln["zh"]
            spoken = normalize_physics_tts(ln.get("spoken", zh))
            raw_file = os.path.join(seg_dir, f"{sc['id']}_{l_idx}_raw.mp3")
            seg_file = os.path.join(seg_dir, f"{sc['id']}_{l_idx}.wav")
            if use_cloud:
                synth_custom_clone_api(spoken, raw_file)
                postprocess_segment(ffmpeg_exe, raw_file, seg_file, extra_atempo=1.3)
            else:
                asyncio.run(synth_edge_tts(spoken, raw_file))
                postprocess_segment(ffmpeg_exe, raw_file, seg_file, extra_atempo=1.0)
            dur = probe_duration(ffmpeg_exe, seg_file)
            line_start = round(cur_t, 3)
            line_end = round(cur_t + dur, 3)
            sc_lines.append({"zh": zh, "en": ln.get("en", ""), "start": line_start, "end": line_end})
            audio_items.append({"file": seg_file, "start": line_start})
            srt_lines.append(f"{srt_idx}\n{fmt_srt_time(line_start)} --> {fmt_srt_time(line_end)}\n{zh}\n")
            srt_idx += 1
            cur_t += dur + 0.22
        sc_end = round(cur_t + 0.25, 3)
        cur_t = sc_end
        timeline_scenes.append({"id": sc["id"], "start": round(sc_start, 3), "end": sc_end, "lines": sc_lines})

    total_dur = round(cur_t + 0.5, 3)

    mix_wav = os.path.join(build_dir, "mix.wav")
    if audio_items:
        cmd = [ffmpeg_exe, "-y", "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono:d={total_dur}"]
        filters = []
        mix_labels = ["[0:a]"]
        for i, item in enumerate(audio_items, 1):
            cmd.extend(["-i", item["file"]])
            delay_ms = int(round(item["start"] * 1000))
            filters.append(f"[{i}:a]aresample=24000,adelay={delay_ms}|{delay_ms}[a{i}]")
            mix_labels.append(f"[a{i}]")
        filters.append(f"{''.join(mix_labels)}amix=inputs={len(audio_items) + 1}:normalize=0[aout]")
        cmd.extend(["-filter_complex", ";".join(filters), "-map", "[aout]", "-t", str(total_dur), mix_wav])
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    tl_obj = {"duration": total_dur, "fps": 30, "preview_only": False, "scenes": timeline_scenes}
    with open(os.path.join(build_dir, "timeline.js"), "w", encoding="utf-8") as f:
        f.write("window.TIMELINE=" + json.dumps(tl_obj, ensure_ascii=False) + ";\n")
    with open(os.path.join(build_dir, "narration.srt"), "w", encoding="utf-8") as f:
        f.write("\n".join(srt_lines))

    print(f"[OK] 已生成 1.3x 课程音频与时间轴: {mix_wav} (总时长 {total_dur:.2f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
