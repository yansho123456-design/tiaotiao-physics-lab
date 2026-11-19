#!/usr/bin/env python3
"""Environment check for tiaotiao-physics-lab (Mode 1 web & Mode 2 --video)."""
import importlib.util
import os
import shutil
import sys

TIAOTIAO_REF = "/Users/yan/.gemini/config/skills/tiaotiao-physics/references/INDEX.md"
VOICE_REF = os.path.join(os.path.dirname(__file__), "..", "references", "voice_ref", "ref_voice.wav")


def has_mod(name: str) -> bool:
    return importlib.util.find_spec(name) is not None


def main() -> int:
    video_mode = "--video" in sys.argv
    ok = True
    print("=== 模式 1（交互网页）环境检查 ===")
    print(f"  tiaotiao-physics 知识库: {'OK' if os.path.exists(TIAOTIAO_REF) else 'MISSING'}")
    if not os.path.exists(TIAOTIAO_REF):
        ok = False
    print(f"  sympy 精确计算: {'OK' if has_mod('sympy') else 'MISSING (可选，建议安装)'}")

    if video_mode:
        print("\n=== 模式 2（1080p MP4 视频导出）环境检查 ===")
        print(f"  参考声线音频 ref_voice.wav: {'OK' if os.path.exists(VOICE_REF) else 'MISSING'}")
        pw = has_mod("playwright")
        ff = bool(shutil.which("ffmpeg")) or has_mod("imageio_ffmpeg")
        tts_cloud = any(os.environ.get(k) for k in ("DASHSCOPE_API_KEY", "MINIMAX_API_KEY", "TTS_CLONE_ENDPOINT"))
        tts_edge = has_mod("edge_tts")
        print(f"  playwright (录屏): {'OK' if pw else 'MISSING'}")
        print(f"  ffmpeg / imageio_ffmpeg: {'OK' if ff else 'MISSING'}")
        print(f"  云端声线克隆 Key: {'OK' if tts_cloud else '未配置 (将自动降级 edge-tts 预览)'}")
        if not tts_cloud:
            print(f"  edge-tts (免费预览备选): {'OK' if tts_edge else 'MISSING'}")
        if not (pw and ff and (tts_cloud or tts_edge)):
            ok = False
            print("\n[建议安装命令（使用 uv，无需 Homebrew）]")
            print("  uv pip install sympy playwright imageio-ffmpeg edge-tts")
            print("  uv run playwright install chromium")

    print("\n" + ("ALL OK" if ok else "CHECK INCOMPLETE"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
