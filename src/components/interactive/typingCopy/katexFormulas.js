/** Short KaTeX sources used as the math typing corpus. */
export const KATEX_FORMULAS = [
  'a+b',
  'x-y',
  '2x+3',
  'x^2',
  'y^3',
  'a_1',
  'x_{n}',
  '\\frac{1}{2}',
  '\\frac{a}{b}',
  '\\frac{x+1}{2}',
  '\\sqrt{x}',
  '\\sqrt{a^2+b^2}',
  '\\sqrt[3]{8}',
  'x \\leq 5',
  'y \\geq 0',
  'a \\neq b',
  '3 \\times 4',
  'a \\cdot b',
  '\\pi r^2',
  '2\\pi r',
  '\\frac{1}{2}bh',
  'E=mc^2',
  'a^2+b^2=c^2',
  'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
  '\\sin\\theta',
  '\\cos\\theta',
  '\\tan\\theta',
  '\\sin^2\\theta+\\cos^2\\theta=1',
  '\\log_{10} x',
  '\\ln e',
  '\\sum_{i=1}^{n} i',
  '\\sum_{k=0}^{n} x^k',
  '\\int_{0}^{1} x\\,dx',
  '\\lim_{x\\to 0} \\frac{\\sin x}{x}',
  '\\binom{n}{k}',
  'n! = n\\times(n-1)',
  '\\vec{v}',
  '\\overline{AB}',
  '\\angle ABC',
  '\\triangle ABC',
  '\\alpha+\\beta',
  '\\Delta y',
  '\\infty',
  'f(x)=x^2+1',
  'y=mx+b',
  '\\begin{cases} x+y=3 \\\\ x-y=1 \\end{cases}',
  '|x-2|',
  '\\left(x+1\\right)^2',
  '\\dfrac{n(n+1)}{2}',
];

function shuffle(items) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

export function drawMathFormulas(count, {commands = false} = {}) {
  const want = Math.max(1, count || 1);
  const source = commands ? KATEX_FORMULAS.filter((tex) => tex.includes('\\')) : KATEX_FORMULAS;
  const pool = shuffle(source.length ? source : KATEX_FORMULAS);
  const drawn = [];
  while (drawn.length < want) {
    const need = want - drawn.length;
    drawn.push(...pool.slice(0, need));
    if (drawn.length < want) pool.push(...shuffle(source.length ? source : KATEX_FORMULAS));
    else break;
  }
  return drawn.slice(0, want);
}

export function sameTex(typed, expected) {
  const norm = (s) => String(s).trim().replace(/\s+/g, '');
  return norm(typed) === norm(expected);
}

export const KATEX_COMMAND_DOCS = {
  frac: {en: 'A fraction. \\frac{1}{2} is one half.', zh: '分数。\\frac{1}{2} 是二分之一。'},
  dfrac: {en: 'A display-style fraction, even inside a line.', zh: '显示样式的分数，即使写在一行里。'},
  sqrt: {en: 'A square root. \\sqrt[3]{8} is a cube root.', zh: '平方根。\\sqrt[3]{8} 是立方根。'},
  sum: {en: 'A summation. \\sum_{i=1}^{n} adds from i = 1 to n.', zh: '求和。\\sum_{i=1}^{n} 从 i = 1 加到 n。'},
  int: {en: 'An integral. Limits go in _ and ^.', zh: '积分。上下限写在 _ 和 ^ 里。'},
  lim: {en: 'A limit. \\lim_{x\\to 0} as x approaches 0.', zh: '极限。\\lim_{x\\to 0} 表示 x 趋于 0。'},
  binom: {en: 'A binomial coefficient. \\binom{n}{k} is n choose k.', zh: '二项式系数。\\binom{n}{k} 是从 n 个里取 k 个。'},
  sin: {en: 'Sine. \\sin\\theta is sin of theta.', zh: '正弦。\\sin\\theta 是 theta 的正弦。'},
  cos: {en: 'Cosine.', zh: '余弦。'},
  tan: {en: 'Tangent.', zh: '正切。'},
  log: {en: 'Logarithm. \\log_{10} x is log base 10.', zh: '对数。\\log_{10} x 是以 10 为底的对数。'},
  ln: {en: 'Natural logarithm.', zh: '自然对数。'},
  pi: {en: 'The constant π.', zh: '常数 π。'},
  theta: {en: 'The Greek letter θ. Often an angle.', zh: '希腊字母 θ。常表示角。'},
  alpha: {en: 'The Greek letter α.', zh: '希腊字母 α。'},
  beta: {en: 'The Greek letter β.', zh: '希腊字母 β。'},
  Delta: {en: 'The Greek letter Δ. Often a change.', zh: '希腊字母 Δ。常表示变化量。'},
  infty: {en: 'Infinity.', zh: '无穷。'},
  leq: {en: 'Less than or equal. x \\leq 5.', zh: '小于或等于。x \\leq 5。'},
  geq: {en: 'Greater than or equal.', zh: '大于或等于。'},
  neq: {en: 'Not equal.', zh: '不等于。'},
  pm: {en: 'Plus or minus.', zh: '正负号。'},
  times: {en: 'A multiplication sign.', zh: '乘号。'},
  cdot: {en: 'A centered dot, used as multiplication.', zh: '居中的点，用作乘法。'},
  vec: {en: 'An arrow over a letter. \\vec{v} is a vector.', zh: '字母上方的箭头。\\vec{v} 是向量。'},
  overline: {en: 'A bar over letters. \\overline{AB} is a segment.', zh: '字母上方的横线。\\overline{AB} 是线段。'},
  angle: {en: 'An angle symbol.', zh: '角的符号。'},
  triangle: {en: 'A triangle symbol.', zh: '三角形符号。'},
  left: {en: 'A stretchy left delimiter. Pair it with \\right.', zh: '可伸缩的左括号。与 \\right 成对使用。'},
  right: {en: 'A stretchy right delimiter. Pair it with \\left.', zh: '可伸缩的右括号。与 \\left 成对使用。'},
  begin: {en: 'Start an environment, such as cases.', zh: '开始一个环境，例如 cases。'},
  end: {en: 'End the matching environment.', zh: '结束配对的环境。'},
  cases: {en: 'A brace with several lines. Separate rows with \\\\.', zh: '带大括号的多行式。行与行之间用 \\\\。'},
  to: {en: 'An arrow, used in limits. x\\to 0.', zh: '箭头，用在极限里。x\\to 0。'},
};

export function docsForTex(tex, lang = 'en') {
  const hits = [];
  const seen = new Set();
  const tokens = String(tex || '').match(/\\[a-zA-Z]+/g) || [];
  for (const raw of tokens) {
    const name = raw.slice(1);
    if (seen.has(name) || !KATEX_COMMAND_DOCS[name]) continue;
    seen.add(name);
    const entry = KATEX_COMMAND_DOCS[name];
    hits.push({token: raw, doc: lang === 'zh' ? entryText(entry, 'zh') : entryText(entry, 'en')});
  }
  return hits;
}

function entryText(entry, lang) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  return lang === 'zh' ? entry.zh || entry.en || '' : entry.en || entry.zh || '';
}
