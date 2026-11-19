---
name: tiaotiao-physics-lab
description: 融合跳跳学长高中物理系统课教法与 3Blue1Brown 视觉风格的物理题目讲解技能。支持文字/截图/随机出题三入口，SymPy 精确验算，自动合成 1.3 倍速同步语音并渲染生成支持任意设备打开、可右键另存为 MP4 视频的 16:9 跨设备单文件 HTML 课程。
metadata:
  display_name: 跳跳物理实验室（教学课程视频）
  display_name_en: Tiaotiao Physics Lab (16:9 Course Video & Interactive HTML)
  description_zh: 融合跳跳学长高中物理系统课教法与 3Blue1Brown 视觉风格的物理题目讲解技能。支持文字/截图/随机出题三入口，SymPy 精确验算，自动合成 1.3 倍速同步语音并渲染生成支持任意设备打开、可右键另存为 MP4 视频的 16:9 跨设备单文件 HTML 课程。
  description_en: Turns Chinese high school physics problems into 16:9 narrated explainer videos and portable single-file HTML courses using Tiaotiao's 367-lesson pedagogy and SymPy verification.
  category: 教育学习
  version: 1.0.0
  author: 跳跳学长
---

# 跳跳物理实验室（16:9 教学课程视频）

按跳跳学长高中物理系统课（必修 1、2、3 及选修共 367 讲）的讲法，将高中物理题目转化为 **16:9 完整教学课程视频**，并封装为**跨设备通用的单文件 `.html`（内嵌 1080p MP4 `<video>`，支持任意设备打开与直接右键另存为视频）**。

## 内置材料

- `references/INDEX.md`：总目录（347 个概念条目与 367 讲讲次代号）。
- `references/concepts/concept-vol-*.md`：概念条目分卷（含 `SOURCE: concepts/<英文名>.md` 标记与卡片出处）。
- `references/lessons/lesson-vol-*.md`：课程分卷（含 `SOURCE: lessons/<讲次代号>.md` 标记、知识卡、口诀、易错点、例题与课上配图链接）。
- `scripts/find.py` / `scripts/search_tiaotiao.py`：关键词检索脚本（支持直接检索内置分卷或本地已安装的 `tiaotiao-physics`）。

---

## 工作流（严格按顺序执行）

### 第 1 步：三入口接题与确认
1. **文字题**：提取已知条件、待求量与物理过程。
2. **题目截图**：完整识别题干、图中字母/数值/图像坐标。
3. **随机/变式出题**：先查跳跳知识库对应讲次的例题，再做参数微调或变式。
- 若非高中物理问题，只回复：「我只答高中物理问题」。

### 第 2 步：检索跳跳物理教法（先查再讲，不凭印象）
运行本技能目录下的检索脚本：
```bash
python3 scripts/search_tiaotiao.py 关键词1 关键词2
```
- 换用同义词多搜一次（如「板块」「滑块木板」「共速」）。
- 读取命中的 `concepts` 与 `lessons` 原文，提取：
  1. **讲次出处**（如「必修1 第72讲」）；
  2. **老师解题主线与口诀**（如「劫富济贫」「指心减背心」「板块必做两步」）；
  3. **高频易错点**；
  4. **课上配图链接**（只从 `lessons` 原样抄 `![图说](https://...)`，最多 4 张，严禁编造）。
- 知识库未讲到的部分，注明「这部分跳跳的课里还没讲到」。

### 第 3 步：Python 精确建模与验算
使用 `lib/physics_kernel.py`（结合 `sympy` 或分段解析运动学类 `PiecewiseMotion`）验证所有数值解、符号表达式与临界条件。

### 第 4 步：合成 1.3 倍速同步语音、渲染 1080p 视频并打包为「跨设备单文件 HTML」
1. 编写 5 幕结构分镜讲稿 `script.json`（`01 原题审题` → `02 物理可视化` → `03 跳跳课堂与相似母题截图` → `04 具体题目公式推导` → `05 结尾总结与防坑`）与画布脚本 `anim.js`。
2. 合成 1.3 倍速语音与精确同步时间轴 `build/timeline.js`：
   ```bash
   python3 scripts/build_audio.py <课题目录>
   ```
3. 一键渲染 1080p MP4 并打包为**跨设备单文件 HTML（`<课题名>_course.html`）**：
   ```bash
   python3 scripts/bundle_single_html.py <课题目录>
   ```

---

## 硬性规则与画面规范（必须严格遵守）

1. **禁止出现风格/技术自述文字（第四面墙禁令）**：
   - 视频画面、章节胶囊（`COURSE_TAGS`）、标题、图注中**严禁**出现 `3B1B`、`3Blue1Brown`、`动态重构`、`矢量重构` 等技术说明字样，只展示纯粹的物理教学内容。
2. **标准 5 幕教学课程结构（由真实语音时间轴 `TIMELINE` + `S.at()` 驱动）**：
   - 严禁做成一屏塞满的仪表盘；必须按 `01 原题审题` → `02 物理可视化` → `03 跳跳课堂与相似母题截图` → `04 具体题目公式推导` → `05 结尾复盘与防坑` 分幕演绎。
3. **1.3 倍速同步语音**：
   - 配音默认 **1.3 倍速** 并裁切首尾空白，由 `build_audio.py` 根据实测时长生成 `build/timeline.js`，确保画面动画与配音 100% 同步。
4. **跨设备单文件 HTML 交付（支持右键下载视频）**：
   - 最终通过 `bundle_single_html.py` 将 1080p MP4 内嵌为原生 `<video>` 内存 Blob 生成唯一单文件 `<课题名>_course.html`，支持任意设备打开、进度条丝滑拖拽，以及直接在画面上 **「右键 → 将视频另存为…」** 导出 `.mp4`。
5. **色板与防遮挡**：
   - 背景 `#0c0f1a`，网格 `rgba(88,196,221,0.06)`，主蓝 `#58C4DD`，琥珀金 `#F4D03F`，珊瑚红 `#FC6255`，翡翠绿 `#83C167`，紫罗兰 `#9A72AC`。标签带深色半透明衬底，严禁文字与图形重叠。
