/**
 * “问 ChatGPT” for the 综合练习 runner: turn the problem on screen, the student's
 * answers and the reference solution into a Chinese prompt asking for a simple,
 * step-by-step explanation, and open it in ChatGPT (same URL scheme ScratchNotes uses).
 */

const CHATGPT_URL = 'https://chatgpt.com/?prompt=';
// Keep the whole URL comfortably short; Chinese text grows ~9× when percent-encoded.
const MAX_ENCODED = 7000;

/**
 * Readable plain text of a rendered problem / solution node:
 * KaTeX → its TeX source in $…$, SVG figures and buttons dropped, blocks on new lines.
 */
export function readableText(node) {
  if (!node || typeof document === 'undefined') return '';
  const clone = node.cloneNode(true);
  clone.querySelectorAll('.katex').forEach((k) => {
    const tex = k.querySelector('annotation[encoding="application/x-tex"]');
    const display = Boolean(k.closest('.katex-display'));
    // Colour macros only matter on screen: \textcolor{#1565c0}{x} → x
    const text = (tex ? tex.textContent.trim() : k.textContent).replace(
      /\\(?:textcolor|color)\{[^{}]*\}\{([^{}]*)\}/g,
      '$1',
    );
    k.replaceWith(document.createTextNode(display ? `\n$$${text}$$\n` : `$${text}$`));
  });
  // Step badges (设 / 列 / 解 / 答 / 验 …) → 【设】 so they don't run into the text.
  clone.querySelectorAll('[class*="badge"]').forEach((b) => {
    const label = b.textContent.trim();
    b.replaceWith(document.createTextNode(label ? `【${label}】` : ''));
  });
  clone.querySelectorAll('svg, button, input, script, style, [aria-hidden="true"]').forEach((n) => n.remove());
  clone.querySelectorAll('td, th').forEach((el) => el.append(' | '));
  clone.querySelectorAll('div, p, li, tr, br, h1, h2, h3, h4, h5, h6').forEach((el) => el.append('\n'));
  return String(clone.textContent || '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function clip(text, max) {
  return text.length <= max ? text : `${text.slice(0, max)}……（后面省略）`;
}

/**
 * @param {object} ctx
 * @param {string} ctx.topic     e.g. "5.3 实际问题 · 工程：整理图书"
 * @param {string} ctx.problem   readable problem text
 * @param {string} ctx.solution  readable reference solution
 * @param {string} ctx.student   what the student entered (or a note that they did not)
 */
export function buildExplainPrompt({ topic, problem, solution, student }) {
  const make = (p, s) =>
    [
      `我是一名初中生，正在做「${topic}」的练习，这道题我没有弄懂。`,
      '请用简单易懂的中文给我讲解：',
      '1. 先用一两句话说清楚题目在问什么、已知什么；',
      '2. 找出关键的数量关系（相等或不等关系），说明为什么这样列式；',
      '3. 一步一步解，每一步都说明理由，不要跳步；',
      '4. 如果我的作答有错，指出错在哪一步、为什么错；',
      '5. 最后给我一道类似的小练习（先不给答案）。',
      '数学式子可以用 LaTeX 写。',
      '',
      '【题目】',
      p,
      '',
      '【我的作答】',
      student,
      '',
      '【参考解答】',
      s,
    ].join('\n');

  // Trim the solution first, then the problem, until the encoded URL fits.
  let pMax = problem.length;
  let sMax = solution.length;
  let text = make(problem, solution);
  while (encodeURIComponent(text).length > MAX_ENCODED && (sMax > 80 || pMax > 120)) {
    if (sMax > 80) sMax = Math.floor(sMax * 0.8);
    else pMax = Math.floor(pMax * 0.85);
    text = make(clip(problem, pMax), clip(solution, sMax));
  }
  return text;
}

export function openChatGpt(prompt) {
  if (typeof window === 'undefined') return;
  window.open(`${CHATGPT_URL}${encodeURIComponent(prompt)}`, '_blank', 'noopener,noreferrer');
}
