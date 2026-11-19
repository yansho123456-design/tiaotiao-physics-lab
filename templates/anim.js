/**
 * 第 11 题：探究渐进弹簧特性实验 —— 3Blue1Brown 5幕教学课程视频 (TIMELINE + S.at() 驱动)
 */
window.COURSE_TAGS = {
  intro: ["01", "原题审题"],
  caliper: ["02", "(1) 游标卡尺读数"],
  photogate: ["03", "(2)(3) 光电门与能量转化"],
  curve: ["04", "(3) 渐进弹簧 x³ 规律"],
  outro: ["05", "答案汇总与防坑"],
};

(function () {
  const { drawImageCard, hiBoxNorm } = window.Draw3B1B;
  const { drawLabelPill, drawVector } = window.Phys3B1B;

  const imgs = {};
  [
    ["prob", "assets/problem.jpg"],
    ["vernier", "assets/vernier_demo.png"],
    ["airtrack", "assets/airtrack.png"],
    ["convert", "assets/convert.png"],
  ].forEach(([k, src]) => {
    const im = new Image();
    im.src = src;
    imgs[k] = im;
  });

  function drawCardBox(ctx, x, y, w, h, color, title, lines, alpha) {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(18, 23, 42, 0.9)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = "700 24px 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(title, x + 26, y + 18);
    ctx.fillStyle = "#ECEFF4";
    ctx.font = "500 21px 'PingFang SC', sans-serif";
    lines.forEach((ln, idx) => ctx.fillText(ln, x + 26, y + 60 + idx * 36));
    ctx.restore();
  }

  // 绘制高清 3Blue1Brown 10 分度游标卡尺（还原图2：主尺 4mm + 游标尺第2格对齐 = 4.2mm）
  function drawVernierCaliper(ctx, x0, y0, S) {
    const pxPerMm = 36; // 1 mm = 36 px
    const splitY = y0 + 115;

    ctx.save();
    // 主尺框
    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.strokeStyle = "#58C4DD";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x0 - 30, y0, 860, 115, 8);
    ctx.fill();
    ctx.stroke();

    // 主尺刻度 (0 ~ 22 mm)
    ctx.strokeStyle = "#ECEFF4";
    ctx.fillStyle = "#ECEFF4";
    for (let m = 0; m <= 22; m++) {
      const mx = x0 + 20 + m * pxPerMm;
      const tickH = m % 10 === 0 ? 44 : m % 5 === 0 ? 32 : 20;
      ctx.lineWidth = m % 10 === 0 ? 2.6 : 1.8;
      ctx.beginPath();
      ctx.moveTo(mx, splitY);
      ctx.lineTo(mx, splitY - tickH);
      ctx.stroke();
      if (m % 10 === 0) {
        ctx.font = "700 24px Inter, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        const label = m === 0 ? "0" : m === 10 ? "1" : "2 cm";
        ctx.fillText(label, mx, splitY - 58);
      }
    }

    // 游标尺框：零刻度位于 4.2 mm 处，左端头部在 3.2 mm 处
    const zeroX = x0 + 20 + 3.2 * pxPerMm;
    const headX = zeroX - 34;
    const vWidth = 10 * 0.9 * pxPerMm + 68;
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#F4D03F";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(headX, splitY, vWidth, 110, 8);
    ctx.fill();
    ctx.stroke();

    // 游标尺 10 个格 (每格 0.9 mm)
    for (let k = 0; k <= 10; k++) {
      const vx = zeroX + k * 0.9 * pxPerMm;
      const tickH = k % 5 === 0 ? 36 : 24;
      ctx.strokeStyle = k === 2 ? "#83C167" : "#ECEFF4";
      ctx.lineWidth = k === 2 ? 3.2 : 1.8;
      ctx.beginPath();
      ctx.moveTo(vx, splitY);
      ctx.lineTo(vx, splitY + tickH);
      ctx.stroke();
      if (k === 0 || k === 5 || k === 10) {
        ctx.fillStyle = "#F4D03F";
        ctx.font = "700 22px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(k), vx, splitY + 66);
      }
    }

    // 动画高亮 1：副尺零刻度线与左边主尺 3 mm 刻度
    const pZero = S.P(S.at(2, 0.2), 0.6);
    if (pZero > 0.01) {
      const m3X = x0 + 20 + 3 * pxPerMm;
      ctx.save();
      ctx.globalAlpha = pZero;
      ctx.strokeStyle = "#FC6255";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(zeroX, splitY - 52);
      ctx.lineTo(zeroX, splitY + 95);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabelPill(ctx, "副尺 0 刻度线（主尺看它左边：3 mm）", zeroX - 20, splitY + 135, "#FC6255", "700 18px 'PingFang SC', sans-serif");
      drawLabelPill(ctx, "主尺 3 mm", m3X, splitY - 92, "#FC6255", "700 18px 'PingFang SC', sans-serif");
      ctx.restore();
    }

    // 动画高亮 2：第 2 格对齐主尺 5 mm 中长线
    const pAlign = S.P(S.at(3, 0.2), 0.6);
    if (pAlign > 0.01) {
      const alignX = zeroX + 2 * 0.9 * pxPerMm; // 3.2 + 1.8 = 5.0 mm
      ctx.save();
      ctx.globalAlpha = pAlign;
      ctx.shadowColor = "#83C167";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "#83C167";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(alignX, splitY, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      drawLabelPill(ctx, "第 2 格对齐主尺 5mm 中长线 → 0.2 mm", alignX + 110, splitY - 92, "#83C167", "700 18px 'PingFang SC', sans-serif");
      ctx.restore();
    }

    ctx.restore();
  }

  const SC = {};

  // 第 1 幕：原题审题
  SC.intro = (ctx, lt, S, env) => {
    const { w } = env;
    ctx.save();
    ctx.fillStyle = "#ECEFF4";
    ctx.font = "700 38px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("第 11 题 · 气垫导轨与光电门探究「渐进弹簧」特性", w / 2, 108);
    ctx.restore();

    const rect = drawImageCard(ctx, imgs.prob, w / 2, 520, 1280, 720, S.P(0.1, 0.6), "#58C4DD");
    // 依次高亮：图1气垫导轨 / 图2游标卡尺 / 三问与表格
    hiBoxNorm(ctx, rect, [[0.08, 0.22, 0.41, 0.41]], "#58C4DD", S.P(S.at(1, 0.2), 0.5));
    hiBoxNorm(ctx, rect, [[0.43, 0.19, 0.76, 0.41]], "#F4D03F", S.P(S.at(2, 0.2), 0.5));
    hiBoxNorm(ctx, rect, [[0.07, 0.42, 0.85, 0.88]], "#83C167", S.P(S.at(3, 0.2), 0.5));
  };

  // 第 2 幕：第(1)问 游标卡尺读数 + 跳跳必修3第55讲原图
  SC.caliper = (ctx, lt, S) => {
    drawLabelPill(ctx, "图 2 放大演示：10 分度游标卡尺（分度值 0.1 mm，不估读）", 480, 130, "#F4D03F", "700 22px 'PingFang SC', sans-serif");
    drawVernierCaliper(ctx, 70, 190, S);

    drawCardBox(ctx, 50, 520, 880, 380, "#58C4DD", "第 (1) 问 · 跳跳游标卡尺读数四步（必修3 第55讲）", [
      "① 定分度值：副尺 10 格 ⇒ 1 mm / 10 = 0.1 mm（结果必为 1 位小数）",
      "② 读主尺：找副尺「0 刻度线」左边第一条主尺刻度 ⇒ 3 mm",
      "   （易错：千万别看副尺左端的头，否则会错读成 2 mm！）",
      "③ 读副尺：副尺第 2 格与主尺 5 mm 中长线完全对齐 ⇒ 2 × 0.1 = 0.2 mm",
      "④ 算结果：d = 3 mm + 0.2 mm = 3.2 mm   【第 (1) 空填：3.2】",
    ], S.P(S.at(0, 0.3), 0.6));

    // 右侧展示跳跳课上原图
    drawImageCard(ctx, imgs.vernier, 1420, 480, 840, 620, S.P(S.at(1, 0.2), 0.7), "#F4D03F");
    drawLabelPill(ctx, "跳跳必修3 第55讲原图：红线看副尺零刻度，蓝线别看副尺的头", 1420, 845, "#F4D03F", "700 20px 'PingFang SC', sans-serif");
  };

  // 第 3 幕：第(2)(3)问前半 气垫导轨动态仿真 + 能量转化
  SC.photogate = (ctx, lt, S) => {
    // 左上：气垫导轨动画
    const trackX = 60, trackY = 360, trackW = 860;
    ctx.save();
    ctx.fillStyle = "rgba(18, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(88, 196, 221, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(45, 110, 890, 360, 14);
    ctx.fill();
    ctx.stroke();

    drawLabelPill(ctx, "气垫导轨动态仿真：压缩 x → 过原长 O 点分离 → 匀速过光电门", 490, 145, "#58C4DD", "700 20px 'PingFang SC', sans-serif");

    // 导轨与左挡板
    ctx.strokeStyle = "#ECEFF4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trackX, trackY - 90);
    ctx.lineTo(trackX, trackY);
    ctx.lineTo(trackX + trackW, trackY);
    ctx.stroke();

    const oX = trackX + 420; // 原长 O 点
    const gateX = trackX + 700; // 光电门位置
    // O 点虚线
    ctx.strokeStyle = "#94A3B8";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(oX, trackY - 80);
    ctx.lineTo(oX, trackY + 35);
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabelPill(ctx, "原长 O 点", oX, trackY + 52, "#94A3B8", "600 17px 'PingFang SC', sans-serif");

    // 光电门
    ctx.strokeStyle = "#83C167";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gateX, trackY);
    ctx.lineTo(gateX, trackY - 95);
    ctx.stroke();
    ctx.fillStyle = "#83C167";
    ctx.beginPath();
    ctx.arc(gateX, trackY - 95, 12, 0, Math.PI * 2);
    ctx.fill();
    drawLabelPill(ctx, "光电门 (测 Δt)", gateX, trackY - 125, "#83C167", "700 17px 'PingFang SC', sans-serif");

    // 周期动画：0~1.5s 弹簧加速推到 O 点；1.5~3.2s 匀速过光电门
    const cyc = (lt % 4.0) / 4.0;
    const startX = trackX + 210; // 压缩位置
    let blockX;
    if (cyc < 0.45) {
      const p = cyc / 0.45;
      blockX = startX + (oX - startX) * (p * p);
    } else {
      const p = (cyc - 0.45) / 0.55;
      blockX = oX + (trackX + trackW - 90 - oX) * p;
    }
    const springEnd = Math.min(blockX, oX);

    // 弹簧折线
    const coils = 12;
    ctx.strokeStyle = "#F4D03F";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(trackX, trackY - 28);
    for (let i = 1; i <= coils; i++) {
      const sx = trackX + ((springEnd - trackX) * (i - 0.5)) / coils;
      const sy = trackY - 28 + (i % 2 === 0 ? -14 : 14);
      ctx.lineTo(sx, sy);
    }
    ctx.lineTo(springEnd, trackY - 28);
    ctx.stroke();

    // 滑块与挡光片
    ctx.fillStyle = "rgba(88, 196, 221, 0.35)";
    ctx.strokeStyle = "#58C4DD";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(blockX, trackY - 52, 74, 52, 6);
    ctx.fill();
    ctx.stroke();
    // 挡光片 d
    ctx.fillStyle = "#FC6255";
    ctx.fillRect(blockX + 32, trackY - 92, 10, 40);
    drawLabelPill(ctx, "挡光片 d", blockX + 37, trackY - 110, "#FC6255", "600 15px 'PingFang SC', sans-serif");
    ctx.restore();

    // 左下：跳跳课上原图（气垫导轨光电门 & 势能变动能）
    drawImageCard(ctx, imgs.airtrack, 270, 720, 420, 320, S.P(S.at(1, 0.1), 0.6), "#58C4DD");
    drawLabelPill(ctx, "动量第1讲：气垫导轨+光电门", 270, 910, "#58C4DD", "600 17px 'PingFang SC', sans-serif");
    drawImageCard(ctx, imgs.convert, 720, 720, 420, 320, S.P(S.at(3, 0.1), 0.6), "#F4D03F");
    drawLabelPill(ctx, "必修2第54讲：弹性势能转化为动能", 720, 910, "#F4D03F", "600 17px 'PingFang SC', sans-serif");

    // 右侧：公式推导黑板
    drawCardBox(ctx, 970, 110, 890, 320, "#58C4DD", "第 (2) 问 · 极短时间平均速度 = 瞬时速度（必修1 第6讲）", [
      "• 挡光片宽度 d 很窄，挡光时间 Δt 极短",
      "• 用微元法思想，极短时间内的平均速度即为通过光电门的瞬时速度：",
      "      v = d / Δt",
      "• 【第 (2) 空填： d / Δt 】",
    ], S.P(S.at(1, 0.2), 0.6));

    drawCardBox(ctx, 970, 465, 890, 445, "#83C167", "第 (3) 问前半 · 弹性势能全部转化为滑块动能（必修2 第50/54讲）", [
      "• 光电门在 O 点右侧 → 滑块到光电门时弹簧已恢复原长（E_p末 = 0）",
      "• 气垫导轨近似光滑无摩擦，弹簧弹性势能全部转化为滑块动能：",
      "      E_p = E_k = ½ m v²",
      "• 将 v = d / Δt 代入得：",
      "      E_p = ½ m (d / Δt)² = m d² / [ 2 (Δt)² ]",
      "• 【第 (3) 问第一空填： md² / (2Δt²) 】",
    ], S.P(S.at(2, 0.3), 0.6));
  };

  // 第 4 幕：第(3)问后半 渐进弹簧数据表与 x³ 曲线可视化
  SC.curve = (ctx, lt, S) => {
    // 左半屏：E_p - x 坐标系对比 (x² vs x³)
    const gx = 90, gy = 140, gw = 820, gh = 760;
    ctx.save();
    ctx.fillStyle = "rgba(18, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(88, 196, 221, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 14);
    ctx.fill();
    ctx.stroke();

    const ox = gx + 100, oy = gy + gh - 80;
    const pw = gw - 160, ph = gh - 160;
    ctx.strokeStyle = "#ECEFF4";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy - ph);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox + pw, oy);
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "700 20px Inter, 'PingFang SC', sans-serif";
    ctx.fillText("E_p / E_p0", ox - 40, oy - ph - 20);
    ctx.fillText("x / x_0", ox + pw - 20, oy + 42);

    const mapX = (u) => ox + (u / 4.3) * pw;
    const mapY = (v) => oy - (v / 68) * ph;

    // 虚线对比：普通弹簧 E_p ∝ x²
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    for (let u = 0; u <= 4.1; u += 0.05) {
      const px = mapX(u), py = mapY(u * u);
      if (u === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabelPill(ctx, "普通弹簧：E_p ∝ x² (4x₀ 时仅 16E_p0)", mapX(3.2), mapY(10.2) + 28, "#94A3B8", "600 16px 'PingFang SC', sans-serif");

    // 实线：渐进弹簧 E_p ∝ x³
    const curveProg = S.P(S.at(2, 0.2), 1.2);
    if (curveProg > 0.01) {
      ctx.save();
      ctx.shadowColor = "#F4D03F";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "#F4D03F";
      ctx.lineWidth = 4;
      ctx.beginPath();
      const uMax = 4.05 * curveProg;
      for (let u = 0; u <= uMax; u += 0.04) {
        const px = mapX(u), py = mapY(u * u * u);
        if (u === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 四个实验数据点 (1,1), (2,8), (3,27), (4,64)
    const pts = [
      [1, 1, "1³ = 1"],
      [2, 8, "2³ = 8"],
      [3, 27, "3³ = 27"],
      [4, 64, "4³ = 64"],
    ];
    pts.forEach(([u, v, lab], idx) => {
      const pPt = S.P(S.at(1, idx * 0.35), 0.5);
      if (pPt <= 0.01) return;
      const px = mapX(u), py = mapY(v);
      ctx.save();
      ctx.globalAlpha = pPt;
      ctx.strokeStyle = "rgba(244, 208, 63, 0.3)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, oy);
      ctx.lineTo(px, py);
      ctx.lineTo(ox, py);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ECEFF4";
      ctx.font = "700 18px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${u}x₀`, px, oy + 28);
      ctx.textAlign = "right";
      ctx.fillText(`${v}E_p0`, ox - 12, py + 6);

      ctx.shadowColor = "#FC6255";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#FC6255";
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      drawLabelPill(ctx, lab, px - 42, py - 22, "#F4D03F", "700 16px Inter, sans-serif");
      ctx.restore();
    });
    ctx.restore();

    // 右半屏：表格幂次规律推导
    drawCardBox(ctx, 960, 140, 880, 420, "#F4D03F", "第 (3) 问后半 · 表格数据幂次规律拆解", [
      "• 当 x = 1 x₀ 时：E_p =  1 E_p0 = 1³ · E_p0",
      "• 当 x = 2 x₀ 时：E_p =  8 E_p0 = 2³ · E_p0",
      "• 当 x = 3 x₀ 时：E_p = 27 E_p0 = 3³ · E_p0",
      "• 当 x = 4 x₀ 时：E_p = 64 E_p0 = 4³ · E_p0",
      "",
      "⇒ 系数 1, 8, 27, 64 恰好是压缩量倍数的立方 (n³)！",
    ], S.P(S.at(1, 0.1), 0.6));

    drawCardBox(ctx, 960, 600, 880, 300, "#83C167", "最终结论（区分普通弹簧与渐进弹簧）", [
      "• 普通弹簧满足胡克定律，E_p = ½kx² ∝ x²",
      "• 本题「渐进弹簧」越压越硬，由实验表格可得：",
      "      E_p 与 x³ 成正比！   【最后一空填：x³】",
    ], S.P(S.at(3, 0.1), 0.6));
  };

  // 第 5 幕：结尾答案汇总与防坑
  SC.outro = (ctx, lt, S, env) => {
    const { w } = env;
    ctx.save();
    ctx.fillStyle = "#F4D03F";
    ctx.font = "700 40px 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("第 11 题 · 标准答案汇总与三大考场防坑指南", w / 2, 125);
    ctx.restore();

    drawCardBox(ctx, 160, 180, 1600, 220, "#83C167", "✅ 本题全四空标准答案", [
      "(1) 挡光片宽度 d = 3.2 mm",
      "(2) 通过光电门速度 v = d / Δt",
      "(3) 弹性势能 E_p = md² / [ 2(Δt)² ]  ；  根据表格数据可得 E_p 与  x³  成正比",
    ], S.P(0.1, 0.6));

    drawCardBox(ctx, 160, 435, 1600, 210, "#58C4DD", "⚠️ 跳跳防坑 1：游标卡尺读数（必修3 第55讲）", [
      "• 读主尺一定认准副尺的「0 刻度线」，千万别用副尺左端的边缘去卡！",
      "• 游标卡尺不估读，10 分度以 mm 为单位必须保留 1 位小数（3.2 mm）。",
    ], S.P(S.at(1, 0.1), 0.6));

    drawCardBox(ctx, 160, 680, 1600, 210, "#FC6255", "⚠️ 跳跳防坑 2 & 3：光电门位置与新情景表格题", [
      "• 光电门必须放在原长 O 点右侧，确保滑块到达光电门时弹簧已恢复原长、弹性势能全部转为动能。",
      "• 遇到「渐进弹簧」等新信息题，切忌死背 ½kx²，直接算表格倍数 1、8、27、64 = 1³、2³、3³、4³！",
    ], S.P(S.at(2, 0.1), 0.6));
  };

  window.COURSE_SCENES = SC;
})();
