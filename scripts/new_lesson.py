#!/usr/bin/env python3
"""Initialize a self-contained 3B1B lesson directory from templates/."""
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = os.path.join(HERE, "..", "templates")


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python3 new_lesson.py <输出目录>")
        return 2
    out_dir = os.path.abspath(sys.argv[1])
    os.makedirs(out_dir, exist_ok=True)
    for fname in ("index.html", "engine.js", "phys.js", "lesson_data.js", "anim.js"):
        shutil.copy2(os.path.join(TEMPLATES, fname), os.path.join(out_dir, fname))

    narration_path = os.path.join(out_dir, "narration.json")
    if not os.path.exists(narration_path):
        sample = [
            {"id": "seg1", "start": 0.0, "end": 3.0, "text": "先做跳跳老师说的必做两步：分析第一阶段摩擦力和加速度。"},
            {"id": "seg2", "start": 3.0, "end": 6.5, "text": "注意 v-t 图像里两曲线围成的阴影面积，就是滑块相对木板的位移。"},
        ]
        with open(narration_path, "w", encoding="utf-8") as f:
            json.dump(sample, f, ensure_ascii=False, indent=2)

    print(f"[OK] 已初始化 3B1B 交互课题目录: {out_dir}")
    print(f"     浏览器打开: file://{os.path.join(out_dir, 'index.html')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
