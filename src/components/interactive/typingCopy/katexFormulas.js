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
  '\\frac{a+b}{c+d}',
  'x^{2}+2x+1',
  '(a+b)^{2}=a^{2}+2ab+b^{2}',
  'a_{n}=a_{1}+(n-1)d',
  'S_{n}=\\frac{n}{2}(a_{1}+a_{n})',
  '\\sqrt{x^{2}+y^{2}+z^{2}}',
  '\\frac{-b\\pm\\sqrt{\\Delta}}{2a}',
  '\\Delta=b^{2}-4ac',
  'A=\\pi r^{2}',
  'C=2\\pi r',
  'V=\\frac{4}{3}\\pi r^{3}',
  'd=\\sqrt{(x_{2}-x_{1})^{2}+(y_{2}-y_{1})^{2}}',
  'm=\\frac{y_{2}-y_{1}}{x_{2}-x_{1}}',
  '\\sin 30^{\\circ}=\\frac{1}{2}',
  '\\cos^{2}\\theta+\\sin^{2}\\theta=1',
  '\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}',
  'e^{i\\pi}+1=0',
  '\\log_{b}(xy)=\\log_{b}x+\\log_{b}y',
  '\\ln(ab)=\\ln a+\\ln b',
  '\\sum_{i=1}^{n} i=\\frac{n(n+1)}{2}',
  '\\prod_{i=1}^{n} i=n!',
  '\\int_{a}^{b} f(x)\\,dx',
  '\\int x^{n}\\,dx=\\frac{x^{n+1}}{n+1}+C',
  '\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^{n}=e',
  'f\'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}',
  '\\frac{d}{dx}x^{n}=nx^{n-1}',
  '\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n} x_{i}',
  '\\sigma^{2}=\\frac{1}{n}\\sum_{i=1}^{n}(x_{i}-\\mu)^{2}',
  'P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}',
  'A\\cup B',
  'A\\cap B',
  'A\\subseteq B',
  'x\\in S',
  'x\\notin S',
  '\\forall x\\in\\mathbb{R}',
  '\\exists y\\in\\mathbb{Z}',
  '\\mathbb{N}',
  'a\\equiv b\\pmod{n}',
  'a\\approx b',
  'a\\propto b',
  '\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|\\cos\\theta',
  '\\hat{i}',
  '\\binom{n}{k}=\\frac{n!}{k!(n-k)!}',
  '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  '\\begin{cases} 2x+y=5 \\\\ x-y=1 \\end{cases}',
  '\\text{area}=\\frac{1}{2}ab\\sin C',
  '\\gcd(a,b)',
  '\\min(a,b)',
  '\\max(a,b)',
  '\\lfloor x\\rfloor',
  '\\lceil x\\rceil',
  '\\pm 3',
  '\\mp x',
  '\\cdots',
  '\\ldots',
  '\\partial f',
  '\\nabla f',
  '\\infty',
  '\\emptyset',
  '\\therefore a=b',
  '\\because a=b',
  '\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b',
  '\\cos(a+b)=\\cos a\\cos b-\\sin a\\sin b',
  'a_{n}=ar^{n-1}',
  'S_{n}=\\frac{a(1-r^{n})}{1-r}',
  '\\left|\\vec{a}\\right|',
  '\\det(A)=ad-bc',
  '\\exp(x)=e^{x}',
  '\\arcsin x',
  '\\arccos x',
  '\\arctan x',
  '\\sec\\theta=\\frac{1}{\\cos\\theta}',
  '\\csc\\theta',
  '\\cot\\theta',
  'a\\sim b',
  'a\\cong b',
  'l\\perp m',
  'A\\subset B',
  'A\\supset B',
  'P\\implies Q',
  'p\\land q',
  'p\\lor q',
  '\\neg p',
  '\\mathbf{F}=m\\mathbf{a}',
  '\\mathrm{d}x',
  '\\frac{\\partial^{2}f}{\\partial x^{2}}',
  '\\nabla\\cdot\\vec{F}',
  '\\oint_{C} f\\,ds',
  '\\int_{-\\infty}^{\\infty}e^{-x^{2}}\\,dx=\\sqrt{\\pi}',
  '\\log_{2}8=3',
  '\\sqrt[n]{x}',
  '\\frac{a}{b}\\cdot\\frac{c}{d}=\\frac{ac}{bd}',
  '\\left\\{x\\mid x>0\\right\\}',
  '\\boxed{x=2}',
  '\\overbrace{a+b+c}^{3}',
  '\\underbrace{1+2+\\cdots+n}_{n}',
  '\\cfrac{1}{1+\\cfrac{1}{1+x}}',
  '\\begin{matrix} 1 & 0 \\\\ 0 & 1 \\end{matrix}',
  '\\binom{n}{0}=1',
  'x_{1},x_{2},\\ldots,x_{n}',
  '\\sum_{i=1}^{n}(x_{i}-\\bar{x})^{2}',
  'P(A\\cup B)=P(A)+P(B)-P(A\\cap B)',
  '\\vec{a}\\times\\vec{b}',
  'a\\bmod n',
  '\\mp\\sqrt{2}',
  '30^{\\circ}',
  '\\ge 0',
  '\\le 1',
  'x\\not\\in S',
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

function texBand(tex) {
  const cmds = (String(tex).match(/\\[a-zA-Z]+/g) || []).length;
  const braces = (String(tex).match(/[{}]/g) || []).length;
  const score = cmds * 3 + braces + Math.floor(String(tex).length / 8);
  if (score <= 6) return 'easy';
  if (score <= 16) return 'medium';
  return 'hard';
}

export function drawMathFormulas(count, {commands = false, difficulty} = {}) {
  const want = Math.max(1, count || 1);
  let source = commands || difficulty ? KATEX_FORMULAS.filter((tex) => tex.includes('\\')) : KATEX_FORMULAS;
  if (difficulty) {
    const band = source.filter((tex) => texBand(tex) === difficulty);
    if (band.length) source = band;
  }
  const pool = shuffle(source.length ? source : KATEX_FORMULAS);
  const drawn = [];
  while (drawn.length < want) {
    const need = want - drawn.length;
    drawn.push(...pool.slice(0, need));
    if (drawn.length < want) pool.push(...shuffle(source));
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
  times: {en: 'A multiplication sign, or a cross product. \\times.', zh: '乘号，或叉积。\\times。'},
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
  prod: {en: 'A product. \\prod_{i=1}^{n} multiplies from i = 1 to n.', zh: '连乘。\\prod_{i=1}^{n} 从 i = 1 乘到 n。'},
  gcd: {en: 'Greatest common divisor.', zh: '最大公约数。'},
  min: {en: 'The smaller of the values.', zh: '这些值中较小的那个。'},
  max: {en: 'The larger of the values.', zh: '这些值中较大的那个。'},
  text: {en: 'Upright words inside math. \\text{area}.', zh: '数学里的正体文字。\\text{area}。'},
  circ: {en: 'A degree mark. 30^{\\circ}.', zh: '度数符号。30^{\\circ}。'},
  mid: {en: 'A vertical bar. “Given that” in probability, or the separator in a set builder.', zh: '竖线。表示概率里的“在…条件下”，或集合构造式里的分隔符。'},
  pmod: {en: 'A parenthesized modulus. a\\equiv b\\pmod{n}.', zh: '带括号的模。a\\equiv b\\pmod{n}。'},
  equiv: {en: 'Congruent or equivalent. a\\equiv b.', zh: '全等或等价。a\\equiv b。'},
  approx: {en: 'Approximately equal.', zh: '约等于。'},
  propto: {en: 'Proportional to.', zh: '正比于。'},
  cup: {en: 'Union of sets. A\\cup B.', zh: '集合的并。A\\cup B。'},
  cap: {en: 'Intersection of sets. A\\cap B.', zh: '集合的交。A\\cap B。'},
  subseteq: {en: 'Subset or equal. A\\subseteq B.', zh: '子集或相等。A\\subseteq B。'},
  in: {en: 'Element of a set. x\\in S.', zh: '属于某个集合。x\\in S。'},
  notin: {en: 'Not an element of a set.', zh: '不属于某个集合。'},
  forall: {en: 'For all. \\forall x.', zh: '对所有。\\forall x。'},
  exists: {en: 'There exists. \\exists y.', zh: '存在。\\exists y。'},
  mathbb: {en: 'Blackboard-bold letters. \\mathbb{R} is the real numbers.', zh: '黑板粗体。\\mathbb{R} 是实数集。'},
  emptyset: {en: 'The empty set.', zh: '空集。'},
  floor: {en: 'The floor function, via \\lfloor and \\rfloor.', zh: '下取整，用 \\lfloor 和 \\rfloor。'},
  lfloor: {en: 'Left floor bracket.', zh: '下取整的左括号。'},
  rfloor: {en: 'Right floor bracket.', zh: '下取整的右括号。'},
  lceil: {en: 'Left ceiling bracket.', zh: '上取整的左括号。'},
  rceil: {en: 'Right ceiling bracket.', zh: '上取整的右括号。'},
  cdots: {en: 'Centered dots, for a continued product or list.', zh: '居中的省略号，表示连乘或列表未完。'},
  ldots: {en: 'Low dots, for a continued list or sum.', zh: '靠下的省略号，表示列表或求和未完。'},
  partial: {en: 'A partial derivative.', zh: '偏导数。'},
  nabla: {en: 'The gradient operator.', zh: '梯度算子。'},
  therefore: {en: 'Therefore.', zh: '所以。'},
  because: {en: 'Because.', zh: '因为。'},
  hat: {en: 'A hat over a letter. \\hat{i} is a unit vector.', zh: '字母上方的帽子。\\hat{i} 是单位向量。'},
  bar: {en: 'A bar over a letter. Often a mean.', zh: '字母上方的横线。常表示平均值。'},
  pmatrix: {en: 'A matrix with parentheses.', zh: '带圆括号的矩阵。'},
  mu: {en: 'The Greek letter μ. Often a mean.', zh: '希腊字母 μ。常表示平均值。'},
  sigma: {en: 'The Greek letter σ. Often a standard deviation.', zh: '希腊字母 σ。常表示标准差。'},
  gamma: {en: 'The Greek letter γ.', zh: '希腊字母 γ。'},
  lambda: {en: 'The Greek letter λ.', zh: '希腊字母 λ。'},
  phi: {en: 'The Greek letter φ.', zh: '希腊字母 φ。'},
  omega: {en: 'The Greek letter ω.', zh: '希腊字母 ω。'},
  prime: {en: 'A prime mark, used for a derivative. f\' is also written f^{\\prime}.', zh: '撇号，用于导数。f\' 也可以写成 f^{\\prime}。'},
  mp: {en: 'Minus or plus. The opposite order of \\pm.', zh: '负正号。和 \\pm 的顺序相反。'},
  sim: {en: 'Similar, or asymptotically similar.', zh: '相似，或渐近相似。'},
  cong: {en: 'Congruent.', zh: '全等。'},
  perp: {en: 'Perpendicular.', zh: '垂直。'},
  subset: {en: 'A proper subset. A\\subset B.', zh: '真子集。A\\subset B。'},
  supset: {en: 'A proper superset.', zh: '真超集。'},
  implies: {en: 'Implies. P\\implies Q.', zh: '蕴含。P\\implies Q。'},
  land: {en: 'Logical and.', zh: '逻辑与。'},
  lor: {en: 'Logical or.', zh: '逻辑或。'},
  neg: {en: 'Logical not.', zh: '逻辑非。'},
  mathbf: {en: 'Bold math letters. \\mathbf{F} is a bold F.', zh: '粗体数学字母。\\mathbf{F} 是粗体 F。'},
  mathrm: {en: 'Upright roman letters. \\mathrm{d}x is an upright d.', zh: '正体罗马字母。\\mathrm{d}x 是正体的 d。'},
  exp: {en: 'The exponential function. \\exp(x) is e^x.', zh: '指数函数。\\exp(x) 就是 e^x。'},
  arcsin: {en: 'Inverse sine.', zh: '反正弦。'},
  arccos: {en: 'Inverse cosine.', zh: '反余弦。'},
  arctan: {en: 'Inverse tangent.', zh: '反正切。'},
  sec: {en: 'Secant. 1 / cosine.', zh: '正割。余弦的倒数。'},
  csc: {en: 'Cosecant. 1 / sine.', zh: '余割。正弦的倒数。'},
  cot: {en: 'Cotangent. 1 / tangent.', zh: '余切。正切的倒数。'},
  oint: {en: 'A closed-path integral.', zh: '环路积分。'},
  det: {en: 'Determinant.', zh: '行列式。'},
  div: {en: 'A division sign. Also written as the divergence of a vector field with \\nabla\\cdot.', zh: '除号。向量场的散度也可写成 \\nabla\\cdot。'},
  boxed: {en: 'Draw a box around a formula.', zh: '给公式加方框。'},
  overbrace: {en: 'A brace above a formula, with an optional label.', zh: '公式上方的大括号，可以带标注。'},
  underbrace: {en: 'A brace below a formula, with an optional label.', zh: '公式下方的大括号，可以带标注。'},
  cfrac: {en: 'A continued fraction, built from nested fractions.', zh: '连分数，由嵌套的分数构成。'},
  matrix: {en: 'A matrix with no surrounding delimiters.', zh: '不带外层括号的矩阵。'},
  bmod: {en: 'A binary modulus operator. a\\bmod n.', zh: '二元的模运算。a\\bmod n。'},
  ge: {en: 'Greater than or equal. Same idea as \\geq.', zh: '大于或等于。和 \\geq 一样。'},
  le: {en: 'Less than or equal. Same idea as \\leq.', zh: '小于或等于。和 \\leq 一样。'},
  not: {en: 'Negate the next relation. x\\not\\in S.', zh: '否定后面的关系。x\\not\\in S。'},
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
