/**
 * 1920x1080 (16:9) 3Blue1Brown 电影级全屏分镜渲染：必修3 第44讲 第7题
 */
window.renderPhysicsScene = function (ctx, t, env, sim, p, data) {
  const { w, h, P, simT, smoothstep } = env;
  const { drawLabelPill, drawVector } = window.Phys3B1B;

  ctx.save();
  ctx.fillStyle = "rgba(12, 15, 26, 0.85)";
  ctx.fillRect(0, 0, w, 78);
  ctx.strokeStyle = "rgba(88, 196, 221, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 78);
  ctx.lineTo(w, 78);
  ctx.stroke();

  ctx.fillStyle = "rgba(88, 196, 221, 0.16)";
  ctx.strokeStyle = P.blue;
  ctx.beginPath();
  ctx.roundRect(36, 18, 390, 42, 21);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = P.blue;
  ctx.font = "700 20px 'PingFang SC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.lessonTag, 36 + 195, 39);

  ctx.fillStyle = P.text;
  ctx.font = "700 26px 'PingFang SC', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("7. 长方体导体 (3m×2m×1m)：B面流入电阻为 R，侧面 C 流入电阻为（ D. 4R ）", 456, 39);
  ctx.restore();

  function drawIsoCuboid(cx, cy, a, b, c, mode, phaseT, alpha = 1) {
    if (alpha <= 0.01) return;
    const scale = 58;
    const W = b * scale * 1.3;
    const H = c * scale * 1.3;
    const D = a * scale * 0.85;
    const dx = D * 0.72;
    const dy = -D * 0.52;
    const x0 = cx - (W + dx) / 2;
    const y0 = cy + (H - dy) / 2;

    const FBL = { x: x0, y: y0 }, FBR = { x: x0 + W, y: y0 };
    const FTL = { x: x0, y: y0 - H }, FTR = { x: x0 + W, y: y0 - H };
    const BBL = { x: x0 + dx, y: y0 + dy }, BBR = { x: x0 + W + dx, y: y0 + dy };
    const BTL = { x: x0 + dx, y: y0 - H + dy }, BTR = { x: x0 + W + dx, y: y0 - H + dy };
    const isB = mode === "B";
    const activeColor = isB ? P.blue : P.gold;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(FBL.x, FBL.y); ctx.lineTo(BBL.x, BBL.y);
    ctx.moveTo(BBL.x, BBL.y); ctx.lineTo(BBR.x, BBR.y);
    ctx.moveTo(BBL.x, BBL.y); ctx.lineTo(BTL.x, BTL.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(88, 196, 221, 0.08)";
    ctx.beginPath();
    ctx.moveTo(FBL.x, FBL.y); ctx.lineTo(FBR.x, FBR.y);
    ctx.lineTo(FTR.x, FTR.y); ctx.lineTo(FTL.x, FTL.y);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = isB ? "rgba(88, 196, 221, 0.36)" : "rgba(88, 196, 221, 0.12)";
    ctx.beginPath();
    ctx.moveTo(FTL.x, FTL.y); ctx.lineTo(FTR.x, FTR.y);
    ctx.lineTo(BTR.x, BTR.y); ctx.lineTo(BTL.x, BTL.y);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = !isB ? "rgba(244, 208, 63, 0.36)" : "rgba(88, 196, 221, 0.12)";
    ctx.beginPath();
    ctx.moveTo(FBR.x, FBR.y); ctx.lineTo(BBR.x, BBR.y);
    ctx.lineTo(BTR.x, BTR.y); ctx.lineTo(FTR.x, FTR.y);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = "#ECEFF4";
    ctx.lineWidth = 2.6;
    [[FBL, FBR], [FBR, FTR], [FTR, FTL], [FTL, FBL], [FTL, BTL], [BTL, BTR], [BTR, FTR], [FBR, BBR], [BBR, BTR]].forEach(([p1, p2]) => {
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    });

    ctx.save();
    ctx.shadowColor = P.red;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = P.red;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    if (isB) { ctx.moveTo(FTL.x, FTL.y); ctx.lineTo(FBL.x, FBL.y); }
    else { ctx.moveTo(FBR.x, FBR.y); ctx.lineTo(FBL.x, FBL.y); }
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 16; i++) {
      const u = (i * 0.37) % 1, v = (i * 0.61 + 0.15) % 1;
      const prog = (phaseT * (isB ? 1.05 : 0.6) + i / 16) % 1;
      const px = isB ? FTL.x + u * W + v * dx : FBR.x + v * dx - prog * W;
      const py = isB ? FTL.y + v * dy + prog * H : FBR.y - u * H + v * dy;
      ctx.fillStyle = activeColor;
      ctx.beginPath(); ctx.arc(px, py, 4.2, 0, Math.PI * 2); ctx.fill();
    }

    const fontPill = "700 18px 'PingFang SC', sans-serif";
    if (isB) {
      const topCx = (FTL.x + BTR.x) / 2, topCy = (FTL.y + BTR.y) / 2;
      drawVector(ctx, topCx, topCy - 72, 0, 58, P.blue, "", 1);
      drawLabelPill(ctx, "电流从顶面 B 流入 ↓", topCx, topCy - 90, P.blue, fontPill);
      drawLabelPill(ctx, `有效长度 L_B = ${c} m`, FTL.x - 86, (FTL.y + FBL.y) / 2, P.red, fontPill);
      drawLabelPill(ctx, `横截面 S_B = ${a}×${b} = ${(a * b).toFixed(1)} m²`, topCx, topCy + 22, P.blue, fontPill);
      drawLabelPill(ctx, "基准电阻 R_B = 1.00 R", cx, FBL.y + 48, P.green, fontPill);
    } else {
      const rightCx = (FBR.x + BTR.x) / 2, rightCy = (FBR.y + BTR.y) / 2;
      drawVector(ctx, rightCx + 84, rightCy, -68, 0, P.gold, "", 1);
      drawLabelPill(ctx, "← 电流从侧面 C 流入", rightCx + 110, rightCy - 34, P.gold, fontPill);
      drawLabelPill(ctx, `有效长度 L_C = ${b} m`, (FBL.x + FBR.x) / 2, FBL.y + 28, P.red, fontPill);
      drawLabelPill(ctx, `横截面 S_C = ${a}×${c} = ${(a * c).toFixed(1)} m²`, rightCx + 10, rightCy + 34, P.gold, fontPill);
      drawLabelPill(ctx, `电阻 R_C = (L_C/L_B)² R = ${sim.ratioCB.toFixed(2)} R`, cx, FBL.y + 68, P.gold, fontPill);
    }
    ctx.restore();
  }

  drawIsoCuboid(310, 355, p.a, p.b, p.c, "B", t, 1.0);
  const cAlpha = smoothstep(simT(t, 3.2, 4.5));
  drawIsoCuboid(790, 355, p.a, p.b, p.c, "C", t, Math.max(0.25, cAlpha));

  const boardX = 1090, boardW = 790;
  function drawStepCard(y, hBox, borderColor, title, lines, appearT) {
    const prog = smoothstep(simT(t, appearT, appearT + 0.9));
    if (prog <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = prog;
    ctx.translate(0, (1 - prog) * 18);
    ctx.fillStyle = "rgba(18, 23, 42, 0.88)";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(boardX, y, boardW, hBox, 14); ctx.fill(); ctx.stroke();

    ctx.fillStyle = borderColor;
    ctx.font = "700 22px 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(title, boardX + 24, y + 18);

    ctx.fillStyle = P.text;
    ctx.font = "500 20px 'PingFang SC', sans-serif";
    lines.forEach((ln, i) => ctx.fillText(ln, boardX + 24, y + 56 + i * 34));
    ctx.restore();
  }

  drawStepCard(110, 165, P.blue, "第 1 步：顺着电流箭头找「对应长度 L」（必修3 第44讲）", [
    `• 从顶面 B 向下流：穿过的棱是高 ⇒ L_B = c = ${p.c} m，S_B = ${sim.SB.toFixed(1)} m²`,
    `• 从侧面 C 向左流：穿过的棱是宽 ⇒ L_C = b = ${p.b} m，S_C = ${sim.SC.toFixed(1)} m²`,
  ], 0.3);

  drawStepCard(295, 165, P.gold, "第 2 步：跳跳老师「珍珠奶茶吸管比喻」与等体积变形", [
    "• 同一块长方体换面接入，总体积 V = L · S 恒定不变！",
    "• 长度 L 变为 n 倍，横截面积 S 必连带变为 1/n，阻碍作用翻 n² 倍",
  ], 4.0);

  drawStepCard(480, 185, P.green, "第 3 步：等体积平方律秒杀（结论与常规法双验算）", [
    `• 秒杀公式：R_C / R_B = (L_C / L_B)² = (${p.b} / ${p.c})² = ${sim.ratioCB.toFixed(2)}`,
    `• 决定式验算：R_B = ρ·${p.c}/${sim.SB.toFixed(0)} = R  ⇒  R_C = ρ·${p.b}/${sim.SC.toFixed(0)} = ${sim.ratioCB.toFixed(2)} R`,
    "• 本题标准数值下 R_C = 4R，直接选 D！",
  ], 8.0);

  const chartX = 48, chartY = 685, chartW = 1000, chartH = 275;
  ctx.save();
  ctx.fillStyle = "rgba(18, 23, 42, 0.86)";
  ctx.strokeStyle = "rgba(88, 196, 221, 0.28)";
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.roundRect(chartX, chartY, chartW, chartH, 14); ctx.fill(); ctx.stroke();

  ctx.fillStyle = P.gold;
  ctx.font = "700 21px 'PingFang SC', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("三面接入电阻对比：R ∝ L²（越细长电阻越大，越扁平电阻越小）", chartX + 26, chartY + 34);

  const items = [
    { name: `B 面接入 (L_B = ${p.c}m, 最扁)`, ratio: 1.0, color: P.blue },
    { name: `C 面接入 (L_C = ${p.b}m, 中等)`, ratio: sim.ratioCB, color: P.gold },
    { name: `A 面接入 (L_A = ${p.a}m, 最细长)`, ratio: sim.ratioAB, color: P.purple },
  ];
  const maxRatio = Math.max(4.5, ...items.map((it) => it.ratio));
  const barLeft = chartX + 310, barMaxW = chartW - 440;
  const grow = smoothstep(simT(t, 0.5, 2.0));

  items.forEach((it, idx) => {
    const ry = chartY + 72 + idx * 62;
    ctx.fillStyle = P.text;
    ctx.font = "600 19px 'PingFang SC', sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(it.name, barLeft - 18, ry + 18);

    const bw = Math.max(12, (it.ratio / maxRatio) * barMaxW * grow);
    ctx.fillStyle = it.color + "44";
    ctx.strokeStyle = it.color;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.roundRect(barLeft, ry, bw, 34, 7); ctx.fill(); ctx.stroke();

    ctx.fillStyle = it.color;
    ctx.font = "700 20px Inter, 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${it.ratio.toFixed(2)} R`, barLeft + bw + 14, ry + 18);
  });
  ctx.restore();

  drawStepCard(685, 275, P.red, "跳跳防坑指南（卡 bixiu3-44-c06 / c14 / c17）", [
    "1. 别把边长与面积搞混：顺着电流方向穿过的那条边才是 L！",
    "2. 电阻率 ρ 只由材料和温度决定，换面通电时 ρ 绝对不变！",
    "3. 「R 之比 = L 之比的平方」仅在总体积 V 不变时成立！",
    "（点击下方「🎛️ 调参实验」或「📸 课上原图」可随时互动查看）",
  ], 12.0);
};
