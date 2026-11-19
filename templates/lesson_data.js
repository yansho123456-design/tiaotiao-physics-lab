/**
 * 16:9 3Blue1Brown 视频分镜数据：必修3 第44讲《电阻定律》第7题
 */
window.LESSON_DATA = {
  lessonTag: "必修3 · 第44讲 | 电阻定律与等体积变形",
  title: "长方体导体换面通电：从 B 面到 C 面电阻变几倍？",
  chapters: [
    { title: "① 审题与 B 面通电", start: 0.0, end: 4.0 },
    { title: "② C 面通电与吸管比喻", start: 4.0, end: 8.0 },
    { title: "③ 等体积平方律秒杀", start: 8.0, end: 12.0 },
    { title: "④ 三面对比与防坑总结", start: 12.0, end: 16.0 },
  ],
  sliders: [
    { key: "a", label: "长方体长度 a（前后）", min: 1.0, max: 6.0, step: 0.5, value: 3.0, unit: "m" },
    { key: "b", label: "长方体宽度 b（左右）", min: 1.0, max: 6.0, step: 0.5, value: 2.0, unit: "m" },
    { key: "c", label: "长方体高度 c（上下）", min: 0.5, max: 4.0, step: 0.5, value: 1.0, unit: "m" },
  ],
  figures: [
    {
      caption: "跳跳课上板书（必修3 第44讲）：上下接入时长度取高 c，电阻最小；横着接入时长度取 a，电阻最大，R 之比等于长度之比的平方",
      url: "https://panda-1.tail2e9885.ts.net/wuli/img/bixiu3-44-q7-two-ways.png",
    },
    {
      caption: "跳跳课上板书：不同接线柱接入时先找对应长度，再用平方关系求电阻之比",
      url: "https://panda-1.tail2e9885.ts.net/wuli/img/bixiu3-44-q8-lengths.png",
    },
    {
      caption: "老师的珍珠奶茶吸管比喻：又长又细电阻大，又短又粗电阻小",
      url: "https://panda-1.tail2e9885.ts.net/wuli/img/bixiu3-44-straw.png",
    },
  ],
  subtitles: [
    { start: 0.0, end: 3.9, text: "第 1 幕：看清电流箭头！从上表面 B 流入向下走，走过的有效长度是高 L_B = 1m，电阻为 R" },
    { start: 4.0, end: 7.9, text: "第 2 幕：改从右侧面 C 流入向左走，有效长度变为宽 L_C = 2m，像吸管变长又变细" },
    { start: 8.0, end: 11.9, text: "第 3 幕：跳跳秒杀结论——总体积不变时，电阻之比等于对应长度之比的平方：(2/1)² = 4！" },
    { start: 12.0, end: 16.0, text: "第 4 幕：因此 R_C = 4R，选 D！记住：顺着电流箭头找它穿过的那条棱，就是长度 L" },
  ],
  compute(p) {
    const V = p.a * p.b * p.c;
    const LB = p.c, SB = p.a * p.b;
    const LC = p.b, SC = p.a * p.c;
    const LA = p.a, SA = p.b * p.c;
    const ratioCB = (LC * LC) / (LB * LB);
    const ratioAB = (LA * LA) / (LB * LB);
    return {
      V, LB, SB, LC, SC, LA, SA, ratioCB, ratioAB,
      duration: 16.0,
      readoutHtml: `
        <b>总体积 V =</b> ${V.toFixed(1)} m³（恒定不变）<br/>
        <b>B 面流入：</b>L_B = ${LB}m, S_B = ${SB.toFixed(1)}m² ⇒ <b>1.00 R</b><br/>
        <b>C 面流入：</b>L_C = ${LC}m, S_C = ${SC.toFixed(1)}m² ⇒ <b style="color:#F4D03F">R_C = ${ratioCB.toFixed(2)} R</b><br/>
        <b>A 面流入：</b>L_A = ${LA}m, S_A = ${SA.toFixed(1)}m² ⇒ <span style="color:#58C4DD">R_A = ${ratioAB.toFixed(2)} R</span>
      `,
    };
  },
};
