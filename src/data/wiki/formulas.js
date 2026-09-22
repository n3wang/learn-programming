/**
 * Add a formula: id, title, formula, description, href, tex (and texAlts).
 * Optional explorer id (FormulaExplorer preset) and order (browse ranking).
 */

export const FORMULAS = [
  {
    id: 'formula-bayes',
    kind: 'formula',
    title: 'Bayes’ rule',
    formula: '$P(A\\mid B) = \\dfrac{P(B\\mid A)\\,P(A)}{P(B)}$',
    description:
      'Posterior $P(A\\mid B)$ updates the prior $P(A)$ after seeing evidence $B$. $P(B\\mid A)$ is the likelihood. $P(B)$ is the marginal of the evidence. Rare events plus a nonzero false-positive rate keep the posterior modest even when the test looks accurate.',
    explorer: 'bayes',
    tex: 'P(A\\mid B)=\\dfrac{P(B\\mid A)P(A)}{P(B)}',
    texAlts: [
      'P(A|B)=\\frac{P(B|A)P(A)}{P(B)}',
      'P(A\\mid B)=\\frac{P(B\\mid A)\\,P(A)}{P(B)}',
    ],
    href: '/fundamentals/data-science/lesson-2-probability',
    order: {
      prompt: 'Order the pieces of Bayes’ rule as written: P(A|B) = … (numerator first, then denominator).',
      items: [
        'P(B) — marginal / evidence',
        'P(A) — prior',
        'P(B|A) — likelihood',
      ],
      order: [2, 1, 0],
      why: 'P(A|B) = P(B|A)·P(A) / P(B) — likelihood × prior, over the marginal of B.',
    },
  },
  {
    id: 'formula-profit',
    kind: 'formula',
    title: '利润与利润率',
    formula: '$\\text{利润} = \\text{售价} - \\text{进价},\\quad \\text{利润率} = \\dfrac{\\text{利润}}{\\text{进价}} \\times 100\\%$',
    description:
      '盈利 25% 是进价的 25%，不是售价的 25%。亏损同理。已知其中两个量可以求第三个。',
    href: '/classes/math-1/cost-price-profit-loss',
    tex: '\\text{利润}=\\text{售价}-\\text{进价}',
    texAlts: [
      '\\text{利润率}=\\dfrac{\\text{利润}}{\\text{进价}}\\times 100\\%',
      '利润=售价-进价',
    ],
    order: {
      prompt: '已知进价和利润率，求售价——排出计算顺序。',
      items: [
        '售价 = 进价 + 利润',
        '利润 = 进价 × 利润率',
        '确认利润率是相对于进价，不是相对于售价',
      ],
      order: [2, 1, 0],
      why: '先钉住「相对进价」，再算利润，最后加回进价得售价。',
    },
  },
  {
    id: 'formula-sin-taylor',
    kind: 'formula',
    title: 'Sine series truncation',
    formula:
      '$\\sin x = \\displaystyle\\sum_{n=1}^{N} \\dfrac{(-1)^{n-1} x^{2n-1}}{(2n-1)!} + \\mathcal{E}(x,N)$',
    description:
      'The infinite sine series is exact. Stopping at $N$ terms leaves algorithmic error $\\mathcal{E}(x,N)$ — the ignored tail. For a good truncation $\\mathcal{E}$ shrinks as $N$ grows; for this series you also need $N \\gg |x|$.',
    explorer: 'sinTaylor',
    tex: '\\sin x=\\sum_{n=1}^{N}\\frac{(-1)^{n-1}x^{2n-1}}{(2n-1)!}+\\mathcal{E}(x,N)',
    texAlts: [
      '\\sin(x)=\\sum_{n=1}^{N}\\frac{(-1)^{n-1}x^{2n-1}}{(2n-1)!}+E(x,N)',
      '\\sin x=\\sum_{n=1}^{N}\\dfrac{(-1)^{n-1}x^{2n-1}}{(2n-1)!}+\\mathcal{E}(x,N)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
    order: {
      prompt: 'Order the sine truncation as written: exact sum, then finite recipe, then leftover.',
      items: [
        'Ignored tail $\\mathcal{E}(x,N)$ from $n=N+1$ to $\\infty$',
        'Keep $N$ terms of the series',
        'Infinite sum equals $\\sin x$',
      ],
      order: [2, 1, 0],
      why: 'Exact infinite sum, then a finite $N$-term recipe, then the leftover tail.',
    },
  },
  {
    id: 'formula-float-scientific',
    kind: 'formula',
    title: 'Floating-point scientific form',
    formula: '$a = m \\times 10^{e}$',
    description:
      'Normalize so the exponent $e$ is a small integer (usually stored exactly) and the mantissa $m$ carries the significant figures. Digits of $m$ past the format width are rounded away. Relative error is $|\\tilde a-a|/|a|$, set by how many digits of $m$ survived — not by how large $10^{e}$ is. IEEE double keeps about 15–16 decimal digits of $m$.',
    explorer: 'floatMantissa',
    tex: 'a=m\\times 10^{e}',
    texAlts: [
      'a=m\\cdot 10^e',
      'a=m\\times10^{e}',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
    order: {
      prompt: 'Order how a large float is stored (top = first).',
      items: [
        'Digits of $m$ beyond the format width are rounded or dropped',
        'Write $a=m\\times 10^{e}$ so the exponent is a small integer',
        'Store $e$ at full precision (it is small)',
        'Relative error is $|\\tilde a-a|/|a|$, set by how many digits of $m$ survived',
      ],
      order: [1, 2, 0, 3],
      why: 'Normalize, keep the small exponent, truncate the mantissa; leftover is a relative error on $m$.',
    },
  },
  {
    id: 'formula-roundoff-identity',
    kind: 'formula',
    title: 'Cancelled identity under round-off',
    formula: '$2\\left(\\dfrac{1}{3}\\right)-\\dfrac{2}{3}\\;\\stackrel{?}{=}\\;0$',
    description:
      'On a machine that keeps finitely many decimal places, $1/3$ and $2/3$ cannot both be stored exactly, so $2(1/3)-2/3$ is a tiny residual instead of $0$. Repeating that residual turns small garbage into large garbage. This is round-off, not truncation of a series.',
    explorer: 'roundoffRepeat',
    tex: '2\\left(\\frac{1}{3}\\right)-\\frac{2}{3}=0',
    texAlts: [
      '2(1/3)-2/3=0',
      '2\\cdot\\frac{1}{3}-\\frac{2}{3}=0',
      '2\\left(\\dfrac{1}{3}\\right)-\\dfrac{2}{3}=0',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
  },
  {
    id: 'formula-stored-relative',
    kind: 'formula',
    title: 'Stored value as relative noise',
    formula: '$x_c \\simeq x(1+\\epsilon_x)$',
    description:
      'The computer’s $x_c$ is the exact $x$ times a factor $1+\\epsilon_x$, with $|\\epsilon_x|$ on the order of machine precision. All later error estimates (subtraction, products, functions, random-walk accumulation) start from this model.',
    explorer: 'subtractCancel',
    tex: 'x_c\\simeq x(1+\\epsilon_x)',
    texAlts: [
      'x_c\\approx x(1+\\epsilon_x)',
      'x_c=x(1+\\epsilon_x)',
      'x_c\\simeq x(1+\\epsilon_{x})',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
  },
  {
    id: 'formula-roundoff-walk',
    kind: 'formula',
    title: 'Round-off random walk',
    formula: '$\\epsilon_{\\mathrm{ro}}\\simeq\\sqrt{N}\\,\\epsilon_m$',
    description:
      'Each rounding event is a step of length $\\epsilon_m$. If the steps point randomly, the net relative error after $N$ operations scales as $\\sqrt{N}\\,\\epsilon_m$. If they do not cancel, use $N\\epsilon_m$; some recurrences grow like $N!$.',
    explorer: 'roundoffWalk',
    tex: '\\epsilon_{\\mathrm{ro}}\\simeq\\sqrt{N}\\epsilon_m',
    texAlts: [
      '\\epsilon_{ro}\\approx\\sqrt{N}\\epsilon_m',
      '\\epsilon_{\\mathrm{ro}}\\simeq\\sqrt{N}\\,\\epsilon_m',
      'e_{ro}\\simeq\\sqrt{N} e_m',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
  },
  {
    id: 'formula-eps-app',
    kind: 'formula',
    title: 'Algorithmic error vs steps',
    formula: '$\\epsilon_{\\mathrm{app}}\\simeq\\dfrac{\\alpha}{N^{\\beta}}$',
    description:
      'Once a method is in its converging regime, the leftover typically falls as an inverse power of the step count. $\\alpha$ and $\\beta$ are empirical and may drift; that the error falls at all is what “the algorithm works” means.',
    explorer: 'errorTradeoff',
    tex: '\\epsilon_{\\mathrm{app}}\\simeq\\frac{\\alpha}{N^{\\beta}}',
    texAlts: [
      '\\epsilon_{app}\\approx\\alpha/N^{\\beta}',
      '\\epsilon_{\\mathrm{app}}\\simeq\\dfrac{\\alpha}{N^\\beta}',
      'e_{app}\\simeq\\alpha N^{-\\beta}',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-02-experimental-error',
  },
  {
    id: 'formula-eps-tot',
    kind: 'formula',
    title: 'Total numerical error',
    formula: '$\\epsilon_{\\mathrm{tot}}\\simeq\\dfrac{\\alpha}{N^{\\beta}}+\\sqrt{N}\\,\\epsilon_m$',
    description:
      'Add falling algorithmic error to rising random-walk round-off. The sum has a trough at $N^{*}=(2\\alpha\\beta/\\epsilon_m)^{1/(\\beta+1/2)}$. $-\\log_{10}(\\epsilon_{\\mathrm{tot}})$ is the number of decimal places you can quote.',
    explorer: 'errorTradeoff',
    tex: '\\epsilon_{\\mathrm{tot}}\\simeq\\frac{\\alpha}{N^{\\beta}}+\\sqrt{N}\\epsilon_m',
    texAlts: [
      '\\epsilon_{tot}\\approx\\alpha/N^{\\beta}+\\sqrt{N}\\epsilon_m',
      '\\epsilon_{\\mathrm{tot}}\\simeq\\dfrac{\\alpha}{N^{\\beta}}+\\sqrt{N}\\,\\epsilon_m',
      'e_{tot}\\simeq\\alpha N^{-\\beta}+\\sqrt{N}e_m',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-02-experimental-error',
  },
  {
    id: 'formula-sine-term-recurrence',
    kind: 'formula',
    title: 'Sine-series term recurrence',
    formula: '$t_n=\\dfrac{-x^{2}}{(2n-1)(2n-2)}t_{n-1},\\quad t_1=x$',
    description:
      'Do not build $x^{2n-1}$ and $(2n-1)!$ separately — they overflow and they are slow. Each sine term is the previous term times $-x^{2}/((2n-1)(2n-2))$. Stop when $|t_n/S_n|$ is below the tolerance.',
    explorer: 'sinTermStop',
    tex: 't_n=\\frac{-x^{2}}{(2n-1)(2n-2)}t_{n-1}',
    texAlts: [
      't_n=-x^2/((2n-1)(2n-2)) t_{n-1}',
      't_{n}=\\dfrac{-x^{2}}{(2n-1)(2n-2)}t_{n-1}',
      'term_n=\\frac{-x^2}{(2n-1)(2n-2)}term_{n-1}',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-03-power-series',
  },
  {
    id: 'formula-series-stop',
    kind: 'formula',
    title: 'Relative stop for a series',
    formula: '$\\left|\\dfrac{t_n}{S_n}\\right|<\\varepsilon$',
    description:
      'While round-off is small, the last term is a proxy for the omitted tail. For one part in $10^{8}$, take $\\varepsilon=10^{-8}$. Asking for $\\varepsilon$ at or below machine precision may make the loop unable to finish.',
    explorer: 'sinTermStop',
    tex: '\\left|\\frac{t_n}{S_n}\\right|<\\varepsilon',
    texAlts: [
      '|t_n/S_n|<\\varepsilon',
      '\\left|\\dfrac{t_n}{S_n}\\right|<\\epsilon',
      '|term/sum|<eps',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-03-power-series',
  },
  {
    id: 'formula-specular-step',
    kind: 'formula',
    title: 'Specular bounce on a circle',
    formula: '$\\theta_{\\mathrm{new}}=\\theta_{\\mathrm{old}}+2\\phi$',
    description:
      'In a circular mirror with angle parameter $\\phi$, each reflection advances the polar hit angle by $2\\phi$. The path closes when $\\phi/\\pi$ is rational. Rounding $\\phi$ and $\\theta$ each step accumulates relative error with bounce count.',
    tex: '\\theta_{\\mathrm{new}}=\\theta_{\\mathrm{old}}+2\\phi',
    texAlts: [
      '\\theta_{new}=\\theta_{old}+2\\phi',
      'theta_new = theta_old + 2 phi',
      '\\theta\\leftarrow\\theta+2\\phi',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
  },
  {
    id: 'formula-bessel-recurrence',
    kind: 'formula',
    title: 'Spherical Bessel recurrence',
    formula: '$j_{\\ell+1}=\\dfrac{2\\ell+1}{x}j_\\ell-j_{\\ell-1}$',
    description:
      'The same three-term relation runs upward or downward. Upward from $j_0,j_1$ suffers subtractive cancellation into $n_\\ell$. Downward from large $L$ plus $j_0=\\sin x/x$ normalization (Miller) is the stable route.',
    explorer: 'besselUpDown',
    tex: 'j_{\\ell+1}=\\frac{2\\ell+1}{x}j_{\\ell}-j_{\\ell-1}',
    texAlts: [
      'j_{l+1}=(2l+1)/x j_l - j_{l-1}',
      'j_{\\ell-1}=\\frac{2\\ell+1}{x}j_{\\ell}-j_{\\ell+1}',
      'j_{n+1}=\\dfrac{2n+1}{x}j_n-j_{n-1}',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
  },
  {
    id: 'formula-miller-normalize',
    kind: 'formula',
    title: 'Miller normalization for $j_\\ell$',
    formula: '$j_\\ell^{\\mathrm{N}}=j_\\ell^{c}\\,\\dfrac{j_0^{\\mathrm{anal}}}{j_0^{c}},\\quad j_0^{\\mathrm{anal}}=\\dfrac{\\sin x}{x}$',
    description:
      'After downward recursion with arbitrary high-$\\ell$ seeds, relative $\\ell$-dependence is right but the overall scale is not. Multiply every $j_\\ell^{c}$ by the ratio of analytic $j_0$ to the computed $j_0^{c}$.',
    explorer: 'besselJl',
    tex: 'j_{\\ell}^{\\mathrm{N}}=j_{\\ell}^{c}\\frac{j_0^{\\mathrm{anal}}}{j_0^{c}}',
    texAlts: [
      'j_l = j_l^c * (sin(x)/x) / j_0^c',
      'j_{\\ell}^{N}=j_{\\ell}^{c}\\dfrac{\\sin x/x}{j_0^{c}}',
      'scale = (sin x / x) / j[0]',
    ],
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
  },
  {
    id: 'formula-lcg',
    kind: 'formula',
    title: 'Linear congruent generator',
    formula: '$r_{i+1}=(a r_i+c)\\bmod M$',
    description:
      'The classic pseudorandom integer update. Divide by $M$ for $[0,1)$; scale $x=A+(B-A)r$ for a general interval. Prefer a vetted library generator for production, and always plot successive pairs before trusting a homemade LCG.',
    explorer: 'lcgScatter',
    tex: 'r_{i+1}=(a r_i+c)\\bmod M',
    texAlts: [
      'r = (a*r + c) % M',
      'r_{n+1}=(ar_n+c)\\mod M',
      'remainder((a r + c)/M)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'formula-walk-rms',
    kind: 'formula',
    title: 'Random-walk RMS distance',
    formula: '$R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}$',
    description:
      'For an isotropic random walk the mean vector displacement vanishes, but $\\langle R^{2}\\rangle\\simeq N r_{\\mathrm{rms}}^{2}$. Average many independent trials — a single path can sit far from $\\sqrt{N}$.',
    explorer: 'walkRms',
    tex: 'R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}',
    texAlts: [
      'R_rms ≈ sqrt(N) * r_rms',
      '\\langle R^{2}\\rangle^{1/2}\\simeq\\sqrt{N} r_{\\mathrm{rms}}',
      'R_rms = sqrt(N) for unit steps',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'formula-einstein-D',
    kind: 'formula',
    title: 'Einstein diffusion estimate',
    formula: '$D\\simeq\\dfrac{R_{\\mathrm{rms}}^{2}}{2 d t}$',
    description:
      'Effective diffusivity from an RMS walk length in $d$ dimensions over time $t$. Obstacles that shrink $R_{\\mathrm{rms}}$ shrink $D$ with $R_{\\mathrm{rms}}^{2}$.',
    tex: 'D\\simeq\\frac{R_{\\mathrm{rms}}^{2}}{2 d t}',
    texAlts: [
      'D = R_rms^2 / (2 d t)',
      'D\\approx R_{\\mathrm{rms}}^{2}/(2dt)',
      'D ~ <R^2> / (2 d t)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'formula-hp-energy',
    kind: 'formula',
    title: 'HP lattice folding energy',
    formula: '$E=-\\varepsilon f$',
    description:
      'Toy protein energy on a self-avoiding lattice walk: $f$ counts non-bonded hydrophobic–hydrophobic neighbor contacts. Polar contacts do not lower $E$. Native-like states maximize $f$.',
    tex: 'E=-\\varepsilon f',
    texAlts: ['E = -eps * f', 'E=-\\epsilon f', 'energy = -epsilon * HH_contacts'],
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'formula-decay-rate',
    kind: 'formula',
    title: 'Discrete radioactive decay',
    formula: '$\\dfrac{\\Delta N}{\\Delta t}=-\\lambda N$',
    description:
      'Each nucleus has constant decay probability per unit time. The activity falls with $N$. Exponential $N(0)e^{-\\lambda t}$ is the large-$N$ continuum limit; small samples are stochastic (Geiger-like).',
    explorer: 'decaySemilog',
    tex: '\\frac{\\Delta N}{\\Delta t}=-\\lambda N',
    texAlts: [
      'dN/dt = -lambda N',
      '\\Delta N/\\Delta t=-\\lambda N',
      'N(t)=N(0)e^{-\\lambda t}',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-02-spontaneous-decay',
  },
  {
    id: 'formula-decay-exponential',
    kind: 'formula',
    title: 'Exponential decay law',
    formula: '$N(t)=N(0)e^{-\\lambda t},\\quad \\lambda=1/\\tau$',
    description:
      'Continuum solution of $dN/dt=-\\lambda N$. On a semilog plot the early slope is $-\\lambda$, independent of $N(0)$ while $N$ stays large.',
    explorer: 'decaySlope',
    tex: 'N(t)=N(0)e^{-\\lambda t}',
    texAlts: [
      'N = N0 * exp(-lambda * t)',
      'N(t)=N(0)e^{-t/\\tau}',
      '\\ln N = \\ln N_0 - \\lambda t',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-02-spontaneous-decay',
  },
  {
    id: 'formula-rng-moment',
    kind: 'formula',
    title: 'Uniform sample moment test',
    formula: '$\\langle x^{k}\\rangle\\simeq\\dfrac{1}{k+1},\\quad \\sqrt{N}\\left|\\langle x^{k}\\rangle-\\dfrac{1}{k+1}\\right|=O(1)$',
    description:
      'For uniforms on $[0,1]$, the $k$th moment is $1/(k+1)$. If the $\\sqrt{N}$-scaled error stays order one, deviations look like sampling noise (randomness) rather than a fixed bias.',
    explorer: 'rngMoment',
    tex: '\\sqrt{N}\\left|\\frac{1}{N}\\sum x_i^{k}-\\frac{1}{k+1}\\right|',
    texAlts: [
      'mean(x^k) ≈ 1/(k+1)',
      '\\langle x^k\\rangle=1/(k+1)',
      'sqrt(N)*|moment - 1/(k+1)|',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-03-random-tests',
  },
  {
    id: 'formula-rng-Ck',
    kind: 'formula',
    title: 'Lag product $C(k)$',
    formula: '$C(k)=\\dfrac{1}{N}\\sum_i x_i x_{i+k}\\simeq\\dfrac{1}{4}$',
    description:
      'Independent uniforms give $\\iint xy\\,dx\\,dy=1/4$. Matching $C(k)$ is necessary for uncorrelated draws at lag $k$, but still plot successive pairs — averages can hide lattices.',
    explorer: 'rngCorrCk',
    tex: 'C(k)=\\frac{1}{N}\\sum_i x_i x_{i+k}',
    texAlts: [
      'C(k) ≈ 1/4',
      'mean(x_i * x_{i+k}) = 1/4',
      'C_k=\\langle x_i x_{i+k}\\rangle',
    ],
    href: '/fundamentals/math-and-science/computational-physics/04-03-random-tests',
  },
  {
    id: 'formula-forward-diff',
    kind: 'formula',
    title: 'Forward difference',
    formula: '$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{fd}}=\\dfrac{y(t+h)-y(t)}{h}$',
    description:
      'Chord from $t$ to $t+h$. Truncation error is typically $O(h)$. Tiny $h$ invites subtractive cancellation against $\\varepsilon_m$.',
    explorer: 'diffForwardCentral',
    tex: '\\frac{y(t+h)-y(t)}{h}',
    texAlts: [
      '(y(t+h)-y(t))/h',
      'D_fd = (y_{n+1}-y_n)/h',
      'forward difference',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-01-differentiation',
  },
  {
    id: 'formula-central-diff',
    kind: 'formula',
    title: 'Central difference',
    formula: '$\\left.\\dfrac{dy}{dt}\\right|_{\\mathrm{cd}}=\\dfrac{y(t+h/2)-y(t-h/2)}{h}$',
    description:
      'Symmetric stencil: even powers of $h$ cancel, leaving $O(h^{2})$ truncation error. Exact on quadratics.',
    explorer: 'diffForwardCentral',
    tex: '\\frac{y(t+h/2)-y(t-h/2)}{h}',
    texAlts: [
      '(y(t+h/2)-y(t-h/2))/h',
      'D_cd = (y_{n+1}-y_{n-1})/(2h)',
      'central difference',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-01-differentiation',
  },
  {
    id: 'formula-extrapolated-diff',
    kind: 'formula',
    title: 'Extrapolated (extended) difference',
    formula:
      '$D_{\\mathrm{ed}}=\\dfrac{4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h)}{3}=\\dfrac{8\\bigl(y(t+h/4)-y(t-h/4)\\bigr)-\\bigl(y(t+h/2)-y(t-h/2)\\bigr)}{3h}$',
    description:
      'Richardson combination of two central estimates cancels the leading $O(h^{2})$ error, leaving typically $O(h^{4})$ until round-off dominates. Fragile on noisy data.',
    explorer: 'diffExtrapolated',
    tex: '\\frac{4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h)}{3}',
    texAlts: [
      '(4*D_cd(h/2)-D_cd(h))/3',
      '(8*(y(t+h/4)-y(t-h/4))-(y(t+h/2)-y(t-h/2)))/(3*h)',
      'extended difference',
      'extrapolated difference',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-02-extrapolated-diff',
  },
  {
    id: 'formula-central-second-diff',
    kind: 'formula',
    title: 'Central second derivative',
    formula: "$y''(t)\\simeq\\dfrac{y(t+h)+y(t-h)-2y(t)}{h^{2}}$",
    description:
      'Central difference of a first central difference. More cancellation than for $y\'$; optimal $h$ is usually larger. For $y=\\cos t$, exact $y\'\'=-\\cos t$.',
    explorer: 'diffSecond',
    tex: '\\frac{y(t+h)+y(t-h)-2y(t)}{h^{2}}',
    texAlts: [
      '(y(t+h)-2*y(t)+y(t-h))/h^2',
      'central second difference',
      "y'' stencil",
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-02-extrapolated-diff',
  },
  {
    id: 'formula-riemann-weighted-sum',
    kind: 'formula',
    title: 'Quadrature as a weighted sum',
    formula: '$\\displaystyle\\int_a^b f(x)\\,dx \\simeq \\sum_{i=1}^{N} f(x_i)\\,w_i$',
    description:
      'Every practical integration rule picks nodes $x_i$ and weights $w_i$. Equal-width left boxes use $w_i=h=(b-a)/N$ and $x_i=a+(i-1)h$.',
    explorer: 'riemannBox',
    tex: '\\sum_{i=1}^{N} f(x_i) w_i',
    texAlts: [
      'sum f(x_i) w_i',
      'quadrature weighted sum',
      'Riemann sum',
      'numerical integration',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
  },
  {
    id: 'formula-simpson-composite',
    kind: 'formula',
    title: 'Composite Simpson rule',
    formula:
      '$\\displaystyle\\int_a^b f\\simeq\\dfrac{h}{3}\\bigl(f_0+4f_1+2f_2+\\cdots+4f_{N-1}+f_N\\bigr)$ ($N$ even)',
    description:
      'Parabola on each pair of equal panels. Leading truncation typically $O(h^{4})$ — usually fewer points than trapezoid for the same accuracy.',
    explorer: 'trapSimpsonError',
    tex: '\\frac{h}{3}(f_0+4f_1+2f_2+\\cdots+f_N)',
    texAlts: [
      'simpson rule',
      '(h/3)*(f0+4*f1+2*f2+...+fN)',
      'composite simpson',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
  },
  {
    id: 'formula-romberg-quad',
    kind: 'formula',
    title: 'Romberg extrapolation',
    formula: '$A\\simeq\\dfrac{4}{3}A(h/2)-\\dfrac{1}{3}A(h)$',
    description:
      'Richardson combination of two trapezoid (or other $O(h^{2})$) integrals cancels the leading $h^{2}$ error, leaving typically $O(h^{4})$ until round-off.',
    explorer: 'rombergExtra',
    tex: '\\frac{4}{3}A(h/2)-\\frac{1}{3}A(h)',
    texAlts: [
      '(4*A(h/2)-A(h))/3',
      'Romberg integration',
      'Richardson quadrature',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
  },
  {
    id: 'formula-gauss-legendre-weight',
    kind: 'formula',
    title: 'Gauss–Legendre nodes and weights',
    formula: '$P_N(y_i)=0,\\quad w_i=\\dfrac{2}{(1-y_i^{2})[P_N\'(y_i)]^{2}}$',
    description:
      'N interior nodes (never ±1) make $\\sum w_i g(y_i)$ exact for every polynomial g of degree ≤ 2N−1 on [−1,1]. Map affinely to [a,b] by scaling weights with (b−a)/2.',
    explorer: 'gaussLegendre',
    tex: 'w_i = 2 / ((1-y_i^2) [P_N\'(y_i)]^2)',
    texAlts: [
      'Gauss-Legendre',
      'Gaussian quadrature',
      'Legendre roots',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-04-gaussian-quadrature',
  },
  {
    id: 'formula-gauss-affine-map',
    kind: 'formula',
    title: 'Affine map of Gauss points',
    formula:
      '$x_i=\\dfrac{b+a}{2}+\\dfrac{b-a}{2}y_i,\\quad w_i=\\dfrac{b-a}{2}w_i\'$',
    description:
      'Standard map from reference nodes on [−1,1] onto a finite interval [a,b]. Infinite ranges use rational maps instead.',
    explorer: 'gaussLegendre',
    tex: 'x=((b+a)+(b-a)y)/2',
    texAlts: [
      'map Gauss points',
      '(b-a)/2 * w',
      'affine quadrature map',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-04-gaussian-quadrature',
  },
  {
    id: 'formula-mc-stone-pi',
    kind: 'formula',
    title: 'Stone-throwing estimator for π',
    formula: '$\\pi\\simeq 4\\,N_{\\mathrm{hit}}/N,\\quad (x,y)\\in[-1,1]^{2}$',
    description:
      'Uniform samples in the square of area 4; hits inside the unit disk estimate π/4. Statistical error falls like 1/√N.',
    explorer: 'mcStonePi',
    tex: '\\pi \\simeq 4 N_{hit}/N',
    texAlts: [
      'pi approx 4 hits/N',
      'stone throwing pi',
      'Monte Carlo circle',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-05-monte-carlo-integration',
  },
  {
    id: 'formula-mc-mean-value',
    kind: 'formula',
    title: 'Mean-value Monte Carlo integral',
    formula:
      '$I=(b-a)\\langle f\\rangle,\\quad \\langle f\\rangle\\approx\\dfrac{1}{N}\\sum_{i=1}^{N} f(x_i),\\quad w_i=\\dfrac{b-a}{N}$',
    description:
      'Replace the unknown mean-value height by a sample average. Uncertainty scales as σ_f/√N (times interval length).',
    explorer: 'mcMeanValue',
    tex: 'I = (b-a) <f>',
    texAlts: [
      'mean value Monte Carlo',
      '(b-a) average of f',
      'sigma_I ~ sigma_f / sqrt(N)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-06-mean-value-nd',
  },
  {
    id: 'formula-mc-10d-sum-sq',
    kind: 'formula',
    title: '10D sum-of-coordinates squared',
    formula:
      '$I=\\displaystyle\\int_{[0,1]^{10}}\\Biggl(\\sum_{i=1}^{10} x_i\\Biggr)^{2}d^{10}x=\\dfrac{155}{6}$',
    description:
      'Smooth high-D calibration for mean-value Monte Carlo. Plain sampling keeps error ~1/√N independent of dimension.',
    explorer: 'mcMeanValue',
    tex: 'I = int (sum x_i)^2 = 155/6',
    texAlts: [
      '10D Monte Carlo integral',
      '155/6',
      'sum of coordinates squared',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-06-mean-value-nd',
  },
  {
    id: 'formula-mc-control-variate',
    kind: 'formula',
    title: 'Control-variate Monte Carlo',
    formula:
      '$I=\\displaystyle\\int(f-g)+J,\\quad J=\\int g,\\quad I\\simeq\\dfrac{1}{N}\\sum\\bigl(f(x_i)-g(x_i)\\bigr)+J$',
    description:
      'Estimate only the residual when g tracks f and J is known. Goal: Var(f−g) < Var(f). Calibration: f=e^{-x}, g=1−x, J=1/2 on [0,1].',
    explorer: 'mcControlVariate',
    tex: 'I = int(f-g) + J',
    texAlts: [
      'control variate Monte Carlo',
      '(1/N) sum (f-g) + J',
      'Var(f-g) < Var(f)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-07-mc-variance-reduction',
  },
  {
    id: 'formula-mc-importance',
    kind: 'formula',
    title: 'Importance-sampling estimator',
    formula:
      '$I=\\displaystyle\\int w\\,\\dfrac{f}{w}=\\Biggl\\langle\\dfrac{f}{w}\\Biggr\\rangle,\\quad x\\sim w$',
    description:
      'Sample from weight w∝f to flatten f/w. von Neumann rejection draws x~w by accepting throws under the curve inside a box of height w₀.',
    explorer: 'mcRejection',
    tex: 'I = <f/w> with x ~ w',
    texAlts: [
      'importance sampling',
      'average f over w',
      'von Neumann rejection',
    ],
    href: '/fundamentals/math-and-science/computational-physics/05-08-importance-sampling',
  },
  {
    id: 'formula-square-well-even',
    kind: 'formula',
    title: 'Even square-well matching residual',
    formula:
      '$g(E)=\\sqrt{E}\\,\\cot\\sqrt{V_0-E}-\\sqrt{V_0-E}=0\\quad(\\hbar=1,\\,2m=1,\\,a=1)$',
    description:
      'Equivalent to √(V₀−E) tan√(V₀−E)=√E. For V₀=10 the even bound energy on [8.0, 8.8] is E_B≈8.5927852752.',
    explorer: 'squareWellEven',
    tex: 'g(E)=\\sqrt{E}\\cot\\sqrt{V_0-E}-\\sqrt{V_0-E}',
    texAlts: [
      'sqrt(E) cot sqrt(V0-E) - sqrt(V0-E) = 0',
      'sqrt(V0-E) tan sqrt(V0-E) = sqrt(E)',
      'even square well bound energy',
    ],
    href: '/fundamentals/math-and-science/computational-physics/06-01-quantum-bound-states',
  },
  {
    id: 'formula-bisection-midpoint',
    kind: 'formula',
    title: 'Bisection midpoint update',
    formula:
      '$x=\\dfrac{x_{-}+x_{+}}{2},\\quad \\text{keep the half with }f(x_{-})f(x)<0$',
    description:
      'Each step halves a sign-change bracket. After N steps width → W/2ᴺ (linear convergence).',
    explorer: 'bisectionSearch',
    tex: 'x=(x_-+x_+)/2',
    texAlts: [
      'bisection midpoint',
      'interval halving',
      'keep signed half',
    ],
    href: '/fundamentals/math-and-science/computational-physics/06-02-bisection-search',
  },
  {
    id: 'formula-newton-correction',
    kind: 'formula',
    title: 'Newton–Raphson correction',
    formula: '$\\Delta x=-\\dfrac{f(x_0)}{f\'(x_0)},\\quad x\\leftarrow x_0+\\Delta x$',
    description:
      'Zero of the local linear model. Use analytic f′ or a forward difference. Backtrack (halve Δx) if |f| grows.',
    explorer: 'newtonRaphson',
    tex: '\\Delta x=-f(x_0)/f\'(x_0)',
    texAlts: [
      'Delta x = -f/f\'',
      'newton raphson update',
      'tangent intercept root',
    ],
    href: '/fundamentals/math-and-science/computational-physics/06-03-newton-raphson',
  },
  {
    id: 'formula-magnetization-reduced',
    kind: 'formula',
    title: 'Reduced magnetization self-consistency',
    formula: '$m=\\tanh\\!\\left(\\dfrac{m}{t}\\right),\\quad f(m,t)=m-\\tanh(m/t)$',
    description:
      'Weiss mean-field in reduced units. Root-find f at fixed t; spontaneous m>0 only for t<1. At t=0.5, m≈0.957504.',
    explorer: 'magnetizationSearch',
    tex: 'm=\\tanh(m/t)',
    texAlts: [
      'm = tanh(m/t)',
      'f(m,t)=m-tanh(m/t)',
      'mean field magnetization',
    ],
    href: '/fundamentals/math-and-science/computational-physics/06-04-magnetization-search',
  },
  {
    id: 'formula-hyperfine-splitting',
    kind: 'formula',
    title: 'Hyperfine singlet–triplet splitting',
    formula: '$\\Delta E=W-(-3W)=4W$',
    description:
      'For V=W σe·σp in the product basis, eigenvalues are W (×3, triplet) and −3W (singlet). The gap is 4W (21 cm / 1420 MHz in lab units).',
    tex: '\\Delta E=4W',
    texAlts: [
      'Delta E = 4W',
      'W - (-3W) = 4W',
      'hyperfine splitting',
    ],
    href: '/fundamentals/math-and-science/computational-physics/07-04-hyperfine',
  },
  {
    id: 'formula-cos-from-sin',
    kind: 'formula',
    title: 'Cosine from sine (±sqrt)',
    formula: '$c=\\pm\\sqrt{1-s^{2}},\\quad s=\\sin\\theta,\\;c=\\cos\\theta$',
    description:
      'Identity reduction for nonlinear statics. Prefer +sqrt when geometry needs cos>0; the minus sign is another branch.',
    tex: 'c=\\pm\\sqrt{1-s^2}',
    texAlts: [
      'cos = ±sqrt(1-sin^2)',
      'c = +sqrt(1-s^2)',
      'trigonometric identity branch',
    ],
    href: '/fundamentals/math-and-science/computational-physics/07-03-string-problem',
  },
  {
    id: 'formula-soft-anharmonic-force',
    kind: 'formula',
    title: 'Soft anharmonic restoring force',
    formula: '$F=-kx(1-\\alpha x)\\quad\\text{from }V\\approx\\tfrac12 kx^{2}(1-\\tfrac23\\alpha x)$',
    description:
      'Cubic correction to a harmonic well. Restoring only while x<1/α; beyond that the force can flip and the orbit may unbound.',
    tex: 'F=-kx(1-\\alpha x)',
    texAlts: [
      'F = -kx(1-alpha x)',
      'V ≈ ½kx²(1−⅔αx)',
      'soft anharmonic spring',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-01-nonlinear-oscillators',
  },
  {
    id: 'formula-power-law-oscillator',
    kind: 'formula',
    title: 'Power-law oscillator force',
    formula: '$V=\\dfrac{k}{p}|x|^{p},\\quad F=-k x^{p-1}\\ (p\\ \\text{even})$',
    description:
      'Even wells with odd-power restoring force. Only p=2 is harmonic (isochronous); other p have amplitude-dependent periods.',
    tex: 'F=-k x^{p-1}',
    texAlts: [
      'F = -k x^{p-1}',
      'V = k|x|^p / p',
      'power law oscillator',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-01-nonlinear-oscillators',
  },
  {
    id: 'formula-ode-dynamic-form',
    kind: 'formula',
    title: 'Dynamic form for Newton ODEs',
    formula: '$y^{(0)}=x,\\; y^{(1)}=v,\\quad \\dot y^{(0)}=y^{(1)},\\; \\dot y^{(1)}=F/m$',
    description:
      'Rewrite x″=F/m as a first-order system for Euler/RK steppers. Example: (x,v)=(0.5,0.2), F=−x ⇒ (f0,f1)=(0.2,−0.5).',
    tex: '\\dot y^{(0)}=y^{(1)},\\ \\dot y^{(1)}=F/m',
    texAlts: [
      'dy0/dt = y1, dy1/dt = F/m',
      'y0=x, y1=v',
      'first order system mechanics',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-02-ode-form-and-review',
  },
  {
    id: 'formula-euler-step',
    kind: 'formula',
    title: 'Forward Euler step',
    formula: '$\\mathbf y_{n+1}=\\mathbf y_n+h\\,\\mathbf f(t_n,\\mathbf y_n)$',
    description:
      'Local truncation O(h²). Uses only the left-endpoint slope. Harmonic lab: one step from (0,1) with h=0.01 → (0.01,1).',
    explorer: 'harmonicEulerRk',
    tex: 'y_{n+1}=y_n+h f(t_n,y_n)',
    texAlts: [
      'y ← y + h f',
      'forward Euler',
      'Euler ODE step',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-03-ode-algorithms',
  },
  {
    id: 'formula-rk2-midpoint',
    kind: 'formula',
    title: 'Midpoint RK2 step',
    formula:
      '$k_1=hf(t,y),\\; k_2=hf(t+h/2,y+k_1/2),\\; y\\leftarrow y+k_2$',
    description:
      'Sample the slope at a tentative midpoint, then take a full step. One-step lab lock: (0.0100000000, 0.9980260791).',
    explorer: 'harmonicEulerRk',
    tex: 'y \\leftarrow y + k_2,\\ k_2=h f(t+h/2,y+k_1/2)',
    texAlts: [
      'RK2 midpoint',
      'k1=hf, k2=hf(mid), y+=k2',
      'improved Euler midpoint',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-03-ode-algorithms',
  },
  {
    id: 'formula-critical-damping',
    kind: 'formula',
    title: 'Critical viscous damping',
    formula: '$b_{\\mathrm{crit}}=2m\\omega_0,\\quad \\omega_0=\\sqrt{k/m}$',
    description:
      'Underdamped for b<b_crit (rings), overdamped for b>b_crit. With m=1, ω0=1 → b_crit=2.',
    tex: 'b_{crit}=2m\\omega_0',
    texAlts: [
      'b = 2 m omega0',
      'critical damping',
      'under over damped',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-05-friction-resonance',
  },
  {
    id: 'formula-beat-frequency',
    kind: 'formula',
    title: 'Beat frequency (driven oscillator)',
    formula: '$f_{\\mathrm{beat}}=\\dfrac{|\\omega-\\omega_0|}{2\\pi}$',
    description:
      'Interference of nearby drive and natural frequencies. For ω=2π·1.1 and ω0=2π, f_beat=0.1.',
    tex: 'f_{beat}=|\\omega-\\omega_0|/(2\\pi)',
    texAlts: [
      'beat frequency |ω−ω0|/(2π)',
      'f_beat = 0.1 for 10% detuning',
      'beats driven oscillator',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-05-friction-resonance',
  },
  {
    id: 'formula-fourier-series',
    kind: 'formula',
    title: 'Fourier series (known period)',
    formula:
      '$y=\\dfrac{a_0}{2}+\\sum_{n=1}^{\\infty}(a_n\\cos n\\omega t+b_n\\sin n\\omega t),\\ \\omega=2\\pi/T$',
    description:
      'Trigonometric least-squares expansion of a period-T signal. Intensity at harmonic n scales as a_n²+b_n².',
    explorer: 'sawtoothFourierSum',
    tex: 'y=a_0/2+\\sum(a_n\\cos n\\omega t+b_n\\sin n\\omega t)',
    texAlts: [
      'Fourier series a_n b_n',
      'omega = 2 pi / T',
      'harmonic expansion period T',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-01-fourier-series',
  },
  {
    id: 'formula-sawtooth-bn',
    kind: 'formula',
    title: 'Sawtooth sine coefficients',
    formula: '$b_n=\\dfrac{2}{n\\pi}(-1)^{n+1}$',
    description:
      'Odd sawtooth on (−T/2,T/2). Pure sine series; |b_n|∝1/n. Lab locks: b1=0.6366197724, b2=−0.3183098862.',
    explorer: 'sawtoothFourierSum',
    tex: 'b_n=2(-1)^{n+1}/(n\\pi)',
    texAlts: [
      'b_n = 2 (-1)^{n+1} / (n pi)',
      'sawtooth Fourier bn',
      'odd ramp sine series',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-01-fourier-series',
  },
  {
    id: 'formula-fourier-transform-pair',
    kind: 'formula',
    title: 'Fourier transform pair (physics norm)',
    formula:
      '$Y(\\omega)=\\int y(t)\\dfrac{e^{-i\\omega t}}{\\sqrt{2\\pi}}\\,\\mathrm{d}t,\\quad y(t)=\\int Y(\\omega)\\dfrac{e^{i\\omega t}}{\\sqrt{2\\pi}}\\,\\mathrm{d}\\omega$',
    description:
      'Continuous spectrum for nonperiodic signals. Power spectrum is |Y|²; consistency uses 2π δ(ω′−ω).',
    explorer: 'fourierGaussianPair',
    tex: 'Y(\\omega)=\\int y(t) e^{-i\\omega t}/\\sqrt{2\\pi}\\,dt',
    texAlts: [
      'Fourier transform 1/sqrt(2pi)',
      'inverse Fourier transform',
      'power spectrum |Y|^2',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-02-fourier-transforms',
  },
  {
    id: 'formula-dft-sum',
    kind: 'formula',
    title: 'Discrete Fourier transform',
    formula:
      '$Y_n=\\dfrac{1}{\\sqrt{2\\pi}}\\sum_{k=0}^{N-1} y_k e^{-2\\pi i kn/N},\\quad \\omega_n=n\\dfrac{2\\pi}{Nh}$',
    description:
      'Trapezoid FT on a period-T=Nh window. Sampling rate s=1/h; Nyquist s/2. Lab lock Re Y1≈1.5957691216 for cos bin.',
    explorer: 'dftNyquistAlias',
    tex: 'Y_n=(1/\\sqrt{2\\pi})\\sum y_k e^{-2\\pi i kn/N}',
    texAlts: [
      'DFT sum',
      'omega_n = n 2pi / (N h)',
      'Nyquist s/2',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-03-discrete-fourier-transforms',
  },
  {
    id: 'formula-autocorr-power',
    kind: 'formula',
    title: 'Autocorrelation → power spectrum',
    formula: '$A(\\omega)=\\sqrt{2\\pi}\\,|S(\\omega)|^2$',
    description:
      'FT of the autocorrelation of a noisy measurement approximates the pure-signal power spectrum when noise is uncorrelated.',
    tex: 'A(\\omega)=\\sqrt{2\\pi}|S(\\omega)|^2',
    texAlts: [
      'autocorrelation power spectrum',
      'A = sqrt(2pi) |S|^2',
      'noise reduction correlation',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-04-noise-filtering',
  },
  {
    id: 'formula-convolution-theorem-filter',
    kind: 'formula',
    title: 'Convolution theorem (filtering)',
    formula: '$g=f*h \\quad\\Rightarrow\\quad G(\\omega)=\\sqrt{2\\pi}\\,F(\\omega)H(\\omega)$',
    description:
      'Linear filters multiply spectra. RC: H_lp=1/(1+iωτ), H_hp=iωτ/(1+iωτ). At ωτ=1, |H|=1/√2.',
    explorer: 'rcFilterGain',
    tex: 'G=\\sqrt{2\\pi} F H',
    texAlts: [
      'convolution theorem filter',
      'G = sqrt(2pi) F H',
      'lowpass highpass RC',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-05-filters-and-sinc',
  },
  {
    id: 'formula-hamming-sinc',
    kind: 'formula',
    title: 'Hamming-windowed sinc kernel',
    formula:
      '$h[i]\\,w[i],\\quad w[i]=0.54-0.46\\cos(2\\pi i/M)$',
    description:
      'Truncate ideal sinc lowpass, taper with Hamming to reduce Gibbs. Center limit of unnormalized kernel is 2πω_c.',
    tex: 'w[i]=0.54-0.46\\cos(2\\pi i/M)',
    texAlts: [
      'Hamming window',
      'windowed sinc filter',
      'w = 0.54 - 0.46 cos',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-05-filters-and-sinc',
  },
  {
    id: 'formula-fft-cost',
    kind: 'formula',
    title: 'FFT complexity',
    formula: '$\\mathrm{DFT}\\sim N^{2},\\quad \\mathrm{FFT}\\sim N\\log_2 N$',
    description:
      'Butterfly stages reuse twiddles. N=1024 → roughly 100× fewer multiplies. Bit-reverse restores natural bin order.',
    explorer: 'fftCostScaling',
    tex: 'FFT \\sim N\\log_2 N',
    texAlts: [
      'FFT N log N',
      'Cooley Tukey',
      'butterfly bit reversal',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-06-fft',
  },
  {
    id: 'formula-fft-probe-dc',
    kind: 'formula',
    title: 'FFT probe DC (unnormalized)',
    formula: '$y_m=m+mi\\ (m=0..15)\\ \\Rightarrow\\ Y_0=\\sum y_m=120+120i$',
    description:
      'N=16=2^4 needs 4 butterfly stages. Physics scale: Y0/√(2π) ≈ 47.8730736482(1+i). Assess with iFFT round-trip vs DFT timing.',
    tex: 'Y_0=\\sum_{m=0}^{15}(m+mi)=120+120i',
    texAlts: [
      'ym = m + m i',
      'FFT DC sum',
      'N=16 four stages',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-07-fft-implementation',
  },
  {
    id: 'formula-mexican-hat',
    kind: 'formula',
    title: 'Mexican-hat mother wavelet',
    formula: '$\\Psi(t)=\\bigl(1-t^{2}/\\sigma^{2}\\bigr)e^{-t^{2}/(2\\sigma^{2})}$',
    description:
      'Second derivative of a Gaussian. At σ=1, t=0 → Ψ=1. Scale/translate to build daughters for time–frequency analysis.',
    tex: '\\Psi(t)=(1-t^2/\\sigma^2)e^{-t^2/(2\\sigma^2)}',
    texAlts: [
      'Mexican hat wavelet',
      'Morlet and Haar mothers',
      'daughter wavelet scale translate',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-01-wavelet-analysis',
  },
  {
    id: 'formula-fourier-uncertainty',
    kind: 'formula',
    title: 'Fourier uncertainty (wave packets)',
    formula: '$\\Delta t\\,\\Delta\\omega \\gtrsim 2\\pi$',
    description:
      'N-cycle burst: Δt=N·2π/ω0, Δω=ω0/N. Product equals 2π for that width definition; C=ΔtΔω/(2π).',
    explorer: 'uncertaintyPacket',
    tex: '\\Delta t \\Delta\\omega \\gtrsim 2\\pi',
    texAlts: [
      'uncertainty principle Fourier',
      'Delta t Delta omega',
      'wave packet width',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-02-wave-packets-uncertainty',
  },
  {
    id: 'formula-stft',
    kind: 'formula',
    title: 'Short-time Fourier transform',
    formula:
      '$Y^{(\\mathrm{ST})}(\\omega,\\tau)=\\int \\dfrac{e^{i\\omega t}}{\\sqrt{2\\pi}} w(t-\\tau) y(t)\\,\\mathrm{d}t$',
    description:
      'Slide a localized window; spectrogram over (ω,τ). Fixed width ⇒ fixed Δt–Δω tradeoff; wavelets vary scale.',
    tex: 'Y(ST)(\\omega,\\tau)=\\int e^{i\\omega t}/\\sqrt{2\\pi}\\, w(t-\\tau) y(t)\\,dt',
    texAlts: [
      'short time Fourier transform',
      'STFT spectrogram',
      'windowed Fourier transform',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-03-short-time-fourier',
  },
  {
    id: 'formula-cwt',
    kind: 'formula',
    title: 'Continuous wavelet transform',
    formula:
      '$Y(s,\\tau)=\\int \\psi_{s,\\tau}^*(t) y(t)\\,\\mathrm{d}t,\\quad \\psi_{s,\\tau}=s^{-1/2}\\Psi((t-\\tau)/s)$',
    description:
      'Overlap with scaled/translated mothers. ω=2π/s. Small s resolves fine detail. Zero-mean mothers with vanishing moments preferred.',
    explorer: 'waveletScaleFreq',
    tex: 'Y(s,\\tau)=\\int \\psi_{s,\\tau}^*(t) y(t)\\,dt',
    texAlts: [
      'continuous wavelet transform',
      'omega = 2 pi / s',
      'daughter wavelet 1/sqrt(s)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-04-wavelet-transforms',
  },
  {
    id: 'formula-daub4',
    kind: 'formula',
    title: 'Daubechies-4 filter taps',
    formula:
      '$c_0=\\dfrac{1+\\sqrt{3}}{4\\sqrt{2}},\\; c_1=\\dfrac{3+\\sqrt{3}}{4\\sqrt{2}},\\; c_2=\\dfrac{3-\\sqrt{3}}{4\\sqrt{2}},\\; c_3=\\dfrac{1-\\sqrt{3}}{4\\sqrt{2}}$',
    description:
      'Orthogonal L/H pair with vanishing moments on constants and linears. Σc²=1; H·ramp≈0; pyramid ↓2 multiresolution.',
    explorer: 'daub4Coeffs',
    tex: 'c_0=(1+\\sqrt{3})/(4\\sqrt{2})',
    texAlts: [
      'Daubechies 4',
      'Daub4 filter coefficients',
      'DWT pyramid lowpass highpass',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-05-discrete-wavelet-transforms',
  },
  {
    id: 'formula-sample-covariance',
    kind: 'formula',
    title: 'Sample covariance matrix',
    formula:
      '$\\mathrm{cov}(A,B)=\\dfrac1{N-1}\\sum a_i b_i,\\quad C=\\dfrac1{N-1}\\mathbf X\\mathbf X^{T}$',
    description:
      'Center features first. Diagonal of C = variances; off-diagonal = channel correlations. Eigenvectors of C are principal components; eigenvalues are variances along those axes.',
    explorer: 'pca2dDemo',
    tex: 'C=\\frac1{N-1}XX^{T}',
    texAlts: [
      'sample covariance',
      'PCA covariance matrix XX^T',
      'principal components eigenvalues',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-06-principal-components',
  },
  {
    id: 'formula-nn-sigmoid-neuron',
    kind: 'formula',
    title: 'AI neuron with logistic activation',
    formula:
      '$y=f(w_1 x_1+w_2 x_2+b),\\quad f(z)=\\dfrac{1}{1+e^{-z}}$',
    description:
      'Weighted sum plus bias, then a smooth activation. Logistic σ∈(0,1); tanh∈(-1,1); ReLU=max(0,x). Learnable params = weights and biases.',
    explorer: 'nnSigmoidNeuron',
    tex: 'y=\\sigma(w\\cdot x+b)',
    texAlts: [
      'perceptron sigmoid neuron',
      'logistic activation neural network',
      'weighted sum bias',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-02-simple-neural-network',
  },
  {
    id: 'formula-nn-mse-sgd',
    kind: 'formula',
    title: 'MSE Loss and SGD update',
    formula:
      '$\\mathcal{L}=\\dfrac1N\\sum(y^{c}-y^{p})^{2},\\quad w\\leftarrow w-\\eta\\dfrac{\\partial\\mathcal{L}}{\\partial w}$',
    description:
      'Train by lowering mean squared error. Backprop supplies ∂ℒ/∂w via the chain rule; η is the learning rate. For logistic f, f′=f(1−f).',
    explorer: 'nnLossSgd',
    tex: 'w\\leftarrow w-\\eta\\partial\\mathcal{L}/\\partial w',
    texAlts: [
      'MSE loss backpropagation',
      'stochastic gradient descent neural net',
      'learning rate eta',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-03-training-backprop',
  },
  {
    id: 'formula-nn-mass-excess',
    kind: 'formula',
    title: 'Nuclear mass excess',
    formula: '$\\Delta=(M-A)\\,\\mathrm{u}\\times 931.494028\\,\\mathrm{MeV}/c^{2}$',
    description:
      'Convert the Dalton difference between atomic mass M and mass number A into energy units. Used as a TensorFlow / notebook sanity check.',
    explorer: 'nnMassExcess',
    tex: '\\Delta=(M-A)\\times 931.494028',
    texAlts: [
      'mass excess MeV',
      'Dalton to MeV conversion nuclear',
      'hydrogen isotope mass excess',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-06-tensorflow-sklearn-examples',
  },
  {
    id: 'formula-nn-kmeans-assign',
    kind: 'formula',
    title: 'k-means assignment',
    formula: '$\\mathrm{label}(x)=\\arg\\min_j\\|x-c_j\\|^2,\\quad c_j\\leftarrow\\mathrm{mean}\\{x:\\mathrm{label}=j\\}$',
    description:
      'Unsupervised clustering: assign points to nearest centroids, then replace centroids by cluster means until stable. Inertia = within-cluster sum of squares.',
    explorer: 'nnKmeans1d',
    tex: 'c_j\\leftarrow\\mathrm{mean}(\\mathrm{cluster}_j)',
    texAlts: [
      'k-means centroid update',
      'Lloyd algorithm clustering',
      'unsupervised particle mass clusters',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-07-ml-clustering',
  },
  {
    id: 'formula-nn-dense-linear',
    kind: 'formula',
    title: 'Keras Dense units=1',
    formula: '$y=wx+b\\quad(\\texttt{Dense(units=1)})$',
    description:
      'A single fully connected unit with linear activation is ordinary linear regression — used as a Keras Hubble toy before deeper stacks.',
    explorer: 'nnDenseLinear',
    tex: 'y=wx+b',
    texAlts: [
      'keras dense linear layer',
      'fully connected units equals one',
      'Hubble fit dense',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-08-keras-deep-learning',
  },
  {
    id: 'formula-nn-rgb-tones',
    kind: 'formula',
    title: '8-bit RGB tone space',
    formula: '$256^{3}=16{,}777{,}216\\ \\text{colors},\\quad \\text{hist: counts in bins }0\\ldots255$',
    description:
      'One byte per channel. Per-channel histograms (OpenCV calcHist) compare ripe vs green fruit; frame differences drop static backgrounds.',
    tex: '256^3=16777216',
    texAlts: [
      'RGB 256 levels histogram',
      'OpenCV calcHist',
      'background subtraction frame difference',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-09-opencv-image-processing',
  },
  {
    id: 'formula-qc-bloch',
    kind: 'formula',
    title: 'Bloch-sphere qubit',
    formula:
      '$|\\psi\\rangle=\\cos(\\theta/2)|0\\rangle+e^{i\\phi}\\sin(\\theta/2)|1\\rangle,\\quad |u|^{2}+|v|^{2}=1$',
    description:
      'Pure single-qubit states as directions on the Bloch sphere. θ=0 → |0⟩; θ=π → |1⟩.',
    explorer: 'qcBlochAmps',
    tex: '|\\psi\\rangle=\\cos(\\theta/2)|0\\rangle+e^{i\\phi}\\sin(\\theta/2)|1\\rangle',
    texAlts: [
      'Bloch sphere qubit',
      'qubit normalization',
      'computational basis |0> |1>',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-02-qubits',
  },
  {
    id: 'formula-qc-separability',
    kind: 'formula',
    title: 'Two-qubit separability',
    formula: '$|\\Psi\\rangle=[w,x,y,z]^{T}\\text{ separable}\\iff wz=xy$',
    description:
      'Product states satisfy wz=xy. Bell states fail the test and are entangled. Pauli X,Y,Z act as single-qubit gates.',
    explorer: 'qcSeparability',
    tex: 'wz=xy',
    texAlts: [
      'Bell state entanglement',
      'separable tensor product',
      'two qubit amplitudes',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-03-entanglement',
  },
  {
    id: 'formula-qc-hadamard',
    kind: 'formula',
    title: 'Hadamard gate',
    formula: '$H=\\dfrac1{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix},\\quad H|0\\rangle=|+\\rangle$',
    description:
      'Maps Z-eigenstates to X-eigenstates and creates equal superpositions. Pair with CNOT to build Bell |β₀₀⟩.',
    explorer: 'qcHadamard',
    tex: 'H=\\frac1{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}',
    texAlts: [
      'Hadamard matrix',
      'quantum NOT X gate',
      'CNOT controlled not',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-04-logic-gates',
  },
  {
    id: 'formula-qc-half-adder',
    kind: 'formula',
    title: 'Quantum half-adder bits',
    formula: '$\\mathrm{sum}=q_0\\oplus q_1,\\quad \\mathrm{carry}=q_0 q_1$',
    description:
      'Toffoli writes carry; CNOT writes XOR sum. Same truth table as classical half-adder.',
    explorer: 'qcHalfAdder',
    tex: '\\mathrm{sum}=q_0\\oplus q_1',
    texAlts: [
      'half adder XOR AND',
      'Toffoli carry CNOT sum',
      'quantum full adder',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-05-qc-programming',
  },
  {
    id: 'formula-qc-qft4',
    kind: 'formula',
    title: 'QFT₄ matrix / Z₄',
    formula: '$Z_4=e^{-i\\pi/2}=-i,\\quad \\mathrm{QFT}_4[0,0]=\\tfrac12$',
    description:
      'Two-qubit QFT: Hadamards, controlled P(π/2), SWAP. Links DFT phases to gate circuits.',
    explorer: 'qcHadamard',
    tex: 'Z_4=e^{-i\\pi/2}=-i',
    texAlts: [
      'quantum Fourier transform',
      'QFT4 matrix',
      'phase gate P(pi/2)',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-08-qft',
  },
  {
    id: 'formula-qc-grover-iters',
    kind: 'formula',
    title: 'Grover iteration count',
    formula: '$t\\approx\\dfrac{\\pi}{4}\\sqrt{N}$',
    description:
      'Optimal number of oracle+diffuser rounds before measuring the marked state.',
    explorer: 'qcGroverIters',
    tex: 't\\approx\\frac{\\pi}{4}\\sqrt{N}',
    texAlts: [
      'Grover search iterations',
      'oracle diffuser amplify',
      'pi sqrt N over 4',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-09-grover',
  },
  {
    id: 'formula-soft-oscillator',
    kind: 'formula',
    title: 'Soft oscillator force',
    formula: '$F=-kx(1-\\alpha x)$',
    description:
      'Amplitude-dependent period: larger Aα softens the restoring force and stretches T.',
    explorer: 'softOscillatorPeriod',
    tex: 'F=-kx(1-\\alpha x)',
    texAlts: [
      'soft spring nonlinear oscillator',
      'period vs amplitude',
      'anharmonic force law',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-04-nonlinear-oscillation-solutions',
  },
  {
    id: 'formula-ode-energy',
    kind: 'formula',
    title: 'Oscillator energy diagnostic',
    formula: '$E=\\dfrac12 v^2+\\dfrac12\\omega^2 x^2$',
    description:
      'Conserved for the exact harmonic flow; numerical |E−E₀| diagnoses Euler vs RK2 drift.',
    explorer: 'odeEnergyDrift',
    tex: 'E=\\frac12 v^2+\\frac12\\omega^2 x^2',
    texAlts: [
      'mechanical energy oscillator',
      'Euler RK2 energy drift',
      'ODE accuracy check',
    ],
    href: '/fundamentals/math-and-science/computational-physics/08-03-ode-algorithms',
  },
  {
    id: 'formula-stft-window',
    kind: 'formula',
    title: 'STFT window tradeoff',
    formula: '$\\Delta t\\,\\Delta f\\gtrsim \\mathrm{const}$',
    description:
      'Wider STFT window sharpens frequency bins but blurs onset time.',
    explorer: 'stftWindowTradeoff',
    tex: '\\Delta t\\Delta f\\gtrsim const',
    texAlts: [
      'short time Fourier window',
      'spectrogram resolution tradeoff',
      'time frequency uncertainty',
    ],
    href: '/fundamentals/math-and-science/computational-physics/10-03-short-time-fourier',
  },
  {
    id: 'formula-autocorr-lag',
    kind: 'formula',
    title: 'Autocorrelation lag peaks',
    formula: '$A(\\tau)=\\langle y(t)y(t+\\tau)\\rangle$',
    description:
      'Hidden period T appears as peaks of A(τ) near τ=T,2T,… even when noise hides the raw sinusoid.',
    explorer: 'autocorrLagPeak',
    tex: 'A(\\tau)=\\langle y(t)y(t+\\tau)\\rangle',
    texAlts: [
      'autocorrelation function',
      'noise filtering period',
      'power spectrum Wiener',
    ],
    href: '/fundamentals/math-and-science/computational-physics/09-04-noise-filtering',
  },
  {
    id: 'formula-shor-phase-period',
    kind: 'formula',
    title: 'QPE phase to period',
    formula: '$\\phi\\approx S/T$',
    description:
      'Continued fractions turn a measured phase into period candidate T for Shor post-processing.',
    explorer: 'shorPhaseToPeriod',
    tex: '\\phi\\approx S/T',
    texAlts: [
      'quantum phase estimation period',
      'continued fraction Shor',
      'factoring phase readout',
    ],
    href: '/fundamentals/math-and-science/computational-physics/12-10-shor',
  },
  {
    id: 'formula-matrix-mul-flops',
    kind: 'formula',
    title: 'Dense matrix-multiply flops',
    formula: '$\\mathrm{flops}\\approx 2n^{3}$',
    description:
      'Leading flop count for C=AB with n×n dense matrices. Memory is O(n²); wall time also depends on cache and stride.',
    explorer: 'matrixMulFlops',
    tex: 'flops\\approx 2n^3',
    texAlts: [
      '2n^3 matrix multiply',
      'dense matmul flop count',
      'n by n times n by n',
    ],
    href: '/fundamentals/math-and-science/computational-physics/07-05-matrix-speed',
  },
  {
    id: 'formula-opencv-hist-bins',
    kind: 'formula',
    title: 'RGB histogram bin count',
    formula: '$N_{\\mathrm{bins}}=b^{3}\\;\\text{(joint RGB)}$',
    description:
      'Per-channel length is b; a joint RGB histogram has b³ cells. Full 8-bit images often use b=256 ⇒ 256³ = 16,777,216.',
    explorer: 'opencvHistBins',
    tex: 'N_{bins}=b^3',
    texAlts: [
      'RGB histogram bins',
      'joint color cube b cubed',
      '256^3 OpenCV hist',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-09-opencv-image-processing',
  },
  {
    id: 'formula-nn-layer-params',
    kind: 'formula',
    title: 'Dense layer parameter count',
    formula: '$n_{\\mathrm{params}}=n_{\\mathrm{in}}n_{\\mathrm{out}}+n_{\\mathrm{out}}$',
    description:
      'Weights plus biases for a Dense(in→out) layer. Sum over layers for the whole net’s trainable size.',
    explorer: 'nnLayerParams',
    tex: 'n_{params}=n_{in}n_{out}+n_{out}',
    texAlts: [
      'dense layer params',
      'weights plus biases',
      'in times out plus out',
    ],
    href: '/fundamentals/math-and-science/computational-physics/11-04-graphical-deep-net',
  },
  {
    id: 'formula-arc-length-radians',
    kind: 'formula',
    title: 'Arc length in radians',
    formula: '$s=r\\theta$',
    description:
      'On a circle of radius $r$, a central angle of $\\theta$ radians subtends arc length $s=r\\theta$. Requires radian measure (not degrees).',
    explorer: 'degreeRadianConvert',
    tex: 's=r\\theta',
    texAlts: ['s = r theta', 'arc length equals radius times radians'],
    href: '/fundamentals/math-and-science/calculus/review-of-trigonometry',
  },
  {
    id: 'formula-trig-pythagorean',
    kind: 'formula',
    title: 'Pythagorean identity',
    formula: '$\\sin^{2}\\theta+\\cos^{2}\\theta=1$',
    description:
      'Follows from the unit-circle definition: the terminal point $(\\cos\\theta,\\sin\\theta)$ has distance 1 from the origin.',
    explorer: 'unitCircleValues',
    tex: '\\sin^{2}\\theta+\\cos^{2}\\theta=1',
    texAlts: ['sin^2 + cos^2 = 1', 'sine squared plus cosine squared'],
    href: '/fundamentals/math-and-science/calculus/review-of-trigonometry',
  },
  {
    id: 'formula-cos-u-minus-v',
    kind: 'formula',
    title: 'Cosine of a difference',
    formula: '$\\cos(u-v)=\\cos u\\cos v+\\sin u\\sin v$',
    description:
      'Starting identity for angle arithmetic. Replace $v$ by $-v$ for $\\cos(u+v)$; combine with cofunctions for sine addition formulas.',
    explorer: 'trigAdditionExplorer',
    tex: '\\cos(u-v)=\\cos u\\cos v+\\sin u\\sin v',
    texAlts: ['cos(u-v)', 'cosine difference formula'],
    href: '/fundamentals/math-and-science/calculus/review-of-trigonometry',
  },
  {
    id: 'formula-law-of-cosines',
    kind: 'formula',
    title: 'Law of cosines',
    formula: '$c^{2}=a^{2}+b^{2}-2ab\\cos\\theta$',
    description:
      'In any triangle, the square of a side equals the sum of squares of the other two minus twice their product times the cosine of the included angle. Pythagoras when $\\theta=\\pi/2$.',
    explorer: 'trigDoubleHalfExplorer',
    tex: 'c^{2}=a^{2}+b^{2}-2ab\\cos\\theta',
    texAlts: ['law of cosines', 'c^2 = a^2 + b^2 - 2ab cos'],
    href: '/fundamentals/math-and-science/calculus/review-of-trigonometry',
  },
  {
    id: 'formula-lim-sin-theta',
    kind: 'formula',
    title: 'lim (sin θ)/θ = 1',
    formula: '$\\lim_{\\theta\\to 0}\\dfrac{\\sin\\theta}{\\theta}=1$',
    description:
      'Fundamental radian limit. Implies $\\lim(1-\\cos\\theta)/\\theta=0$ after rationalizing with $1+\\cos\\theta$. Degrees break this limit.',
    explorer: 'limSinThetaExplorer',
    tex: '\\lim_{\\theta\\to 0}\\frac{\\sin\\theta}{\\theta}=1',
    texAlts: ['lim sin theta / theta = 1', 'sine over theta limit'],
    href: '/fundamentals/math-and-science/calculus/diff-trig-functions',
  },
  {
    id: 'formula-dx-sin-cos',
    kind: 'formula',
    title: 'Derivatives of sin and cos',
    formula: '$D_x(\\sin x)=\\cos x,\\quad D_x(\\cos x)=-\\sin x$',
    description:
      'From the difference quotient plus $\\sin\\theta/\\theta\\to 1$ and $(1-\\cos\\theta)/\\theta\\to 0$. Cosine follows by the Chain Rule via $\\cos x=\\sin(\\pi/2-x)$.',
    explorer: 'trigDerivValuesExplorer',
    tex: '(\\sin x)\'=\\cos x,\\ (\\cos x)\'=-\\sin x',
    texAlts: ['derivative of sine is cosine', 'Dx sin = cos'],
    href: '/fundamentals/math-and-science/calculus/diff-trig-functions',
  },
  {
    id: 'formula-amp-period-freq',
    kind: 'formula',
    title: 'Amplitude, period, frequency',
    formula: '$y=A\\sin(bx):\\; |A|,\\; p=2\\pi/b,\\; f=b$',
    description:
      'Vertical scale $|A|$ is amplitude; $b$ stretches the argument so one cycle needs $bx$ to advance $2\\pi$. Frequency $f=b$ counts waves over length $2\\pi$; always $pf=2\\pi$.',
    explorer: 'ampPeriodFreqExplorer',
    tex: 'p=2\\pi/b,\\ f=b,\\ \\mathrm{amp}=|A|',
    texAlts: ['period 2pi/b', 'amplitude abs A frequency b'],
    href: '/fundamentals/math-and-science/calculus/diff-trig-functions',
  },
  {
    id: 'formula-dx-tan-sec',
    kind: 'formula',
    title: 'Derivatives of tan and sec',
    formula: '$D_x(\\tan x)=\\sec^{2}x,\\quad D_x(\\sec x)=\\tan x\\,\\sec x$',
    description:
      'Quotient/reciprocal rules from $\\sin$ and $\\cos$. Companion formulas: $(\\cot)\'=-\\csc^{2}$, $(\\csc)\'=-\\cot\\csc$.',
    explorer: 'trigDerivValuesExplorer',
    tex: '(\\tan x)\'=\\sec^{2}x,\\ (\\sec x)\'=\\tan x\\sec x',
    texAlts: ['derivative of tan is sec squared', 'Dx sec = tan sec'],
    href: '/fundamentals/math-and-science/calculus/diff-trig-functions',
  },
  {
    id: 'formula-dx-arcsin',
    kind: 'formula',
    title: 'Derivative of arcsin',
    formula: '$D_x(\\arcsin x)=\\dfrac{1}{\\sqrt{1-x^{2}}}$',
    description:
      'From $\\sin y=x$ and $\\cos y=\\sqrt{1-x^{2}}$ on the range $[-\\pi/2,\\pi/2]$. Domain $|x|<1$ for the derivative.',
    explorer: 'invTrigDerivExplorer',
    tex: '(\\arcsin x)\'=\\frac{1}{\\sqrt{1-x^{2}}}',
    texAlts: ['derivative of arcsin', '1 over square root 1 minus x squared'],
    href: '/fundamentals/math-and-science/calculus/inverse-trig-functions',
  },
  {
    id: 'formula-dx-arccos',
    kind: 'formula',
    title: 'Derivative of arccos',
    formula: '$D_x(\\arccos x)=-\\dfrac{1}{\\sqrt{1-x^{2}}}$',
    description:
      'Opposite sign of arcsin′. Consistent with $\\arcsin x+\\arccos x=\\pi/2$.',
    explorer: 'invTrigDerivExplorer',
    tex: '(\\arccos x)\'=-\\frac{1}{\\sqrt{1-x^{2}}}',
    texAlts: ['derivative of arccos', 'negative arcsin derivative'],
    href: '/fundamentals/math-and-science/calculus/inverse-trig-functions',
  },
  {
    id: 'formula-dx-arctan',
    kind: 'formula',
    title: 'Derivative of arctan',
    formula: '$D_x(\\arctan x)=\\dfrac{1}{1+x^{2}}$',
    description:
      'From $\\tan y=x$ and $\\sec^{2}y=1+\\tan^{2}y$. Defined for all real $x$; horizontal asymptotes $y=\\pm\\pi/2$ on the graph.',
    explorer: 'invTrigDerivExplorer',
    tex: '(\\arctan x)\'=\\frac{1}{1+x^{2}}',
    texAlts: ['derivative of arctan', '1 over 1 plus x squared'],
    href: '/fundamentals/math-and-science/calculus/inverse-trig-functions',
  },
  {
    id: 'formula-free-fall-s',
    kind: 'formula',
    title: 'Free-fall position (ft, s)',
    formula: '$s=s_0+v_0 t-16t^{2}$',
    description:
      'With upward positive and $a=-32\\ \\mathrm{ft/s^{2}}$: $v=v_0-32t$ integrates to this $s$. Metric: use $-4.9t^{2}$ with $a=-9.8$.',
    explorer: 'freeFallExplorer',
    tex: 's=s_0+v_0 t-16t^{2}',
    texAlts: ['free fall position', 's0 + v0 t - 16 t squared'],
    href: '/fundamentals/math-and-science/calculus/rectilinear-circular-motion',
  },
  {
    id: 'formula-velocity-acceleration',
    kind: 'formula',
    title: 'Velocity and acceleration',
    formula: '$v=\\dfrac{ds}{dt},\\quad a=\\dfrac{dv}{dt}=\\dfrac{d^{2}s}{dt^{2}}$',
    description:
      'Rectilinear motion: velocity is the derivative of position; acceleration is the derivative of velocity. Speed is $|v|$.',
    explorer: 'freeFallExplorer',
    tex: 'v=\\frac{ds}{dt},\\ a=\\frac{dv}{dt}',
    texAlts: ['v = ds/dt', 'a = dv/dt'],
    href: '/fundamentals/math-and-science/calculus/rectilinear-circular-motion',
  },
  {
    id: 'formula-angular-velocity',
    kind: 'formula',
    title: 'Angular velocity and acceleration',
    formula: '$\\omega=\\dfrac{d\\theta}{dt},\\quad\\alpha=\\dfrac{d\\omega}{dt}$',
    description:
      'For circular motion with central angle $\\theta(t)$ in radians. Coordinates: $x=r\\cos\\theta$, $y=r\\sin\\theta$.',
    explorer: 'circularMotionExplorer',
    tex: '\\omega=\\frac{d\\theta}{dt},\\ \\alpha=\\frac{d\\omega}{dt}',
    texAlts: ['omega = d theta / dt', 'angular acceleration'],
    href: '/fundamentals/math-and-science/calculus/rectilinear-circular-motion',
  },
  {
    id: 'formula-ladder-related-rates',
    kind: 'formula',
    title: 'Sliding ladder rates',
    formula: '$x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}=0\\quad(x^{2}+y^{2}=L^{2})$',
    description:
      'Differentiate Pythagoras in $t$. Then $dy/dt=-(x/y)\\,dx/dt$. Negative means the top slides down.',
    explorer: 'ladderRelatedRates',
    tex: 'x\\frac{dx}{dt}+y\\frac{dy}{dt}=0',
    texAlts: ['related rates ladder', 'x x-dot + y y-dot = 0'],
    href: '/fundamentals/math-and-science/calculus/related-rates',
  },
  {
    id: 'formula-sphere-volume-surface-rates',
    kind: 'formula',
    title: 'Sphere volume and surface rates',
    formula: '$\\dfrac{dV}{dt}=4\\pi r^{2}\\dfrac{dr}{dt},\\quad\\dfrac{dS}{dt}=8\\pi r\\dfrac{dr}{dt}$',
    description:
      'From $V=\\tfrac43\\pi r^{3}$ and $S=4\\pi r^{2}$. With $dV/dt=-2$, one gets $dS/dt=-4/r$.',
    tex: '\\frac{dV}{dt}=4\\pi r^{2}\\frac{dr}{dt},\\ \\frac{dS}{dt}=8\\pi r\\frac{dr}{dt}',
    texAlts: ['dV/dt = 4 pi r^2 dr/dt', 'dS/dt = 8 pi r dr/dt', 'sphere related rates'],
    href: '/fundamentals/math-and-science/calculus/20b-related-rates-practice',
  },
  {
    id: 'formula-shadow-tip-speed',
    kind: 'formula',
    title: 'Shadow tip speed',
    formula: '$V=\\dfrac{Hv}{H-h}$',
    description:
      'Object height $h$, light height $H$, object speed $v$. Tip speed is proportional to $v$; blows up as $h\\to H$.',
    tex: 'V=\\frac{Hv}{H-h}',
    texAlts: ['shadow tip velocity', 'V = Hv/(H-h)'],
    href: '/fundamentals/math-and-science/calculus/20b-related-rates-practice',
  },
  {
    id: 'formula-linear-approximation',
    kind: 'formula',
    title: 'Linear approximation',
    formula: '$f(x+\\Delta x)\\approx f(x)+f\'(x)\\Delta x$',
    description:
      'Tangent-line estimate. Equivalent form: $\\Delta y\\approx f\'(x)\\,\\Delta x=df$.',
    explorer: 'linearApproximation',
    tex: 'f(x+\\Delta x)\\approx f(x)+f\'(x)\\Delta x',
    texAlts: ['linear approximation', 'f(x+dx) approx f + f\' dx', 'differential approximation'],
    href: '/fundamentals/math-and-science/calculus/differentials-newtons-method',
  },
  {
    id: 'formula-differential-df',
    kind: 'formula',
    title: 'Differential of f',
    formula: '$df=f\'(x)\\,dx$',
    description:
      'With $dx=\\Delta x$. Then $df/dx=f\'(x)$ when $dx\\neq 0$.',
    tex: 'df=f\'(x)\\,dx',
    texAlts: ['df = f\'(x) dx', 'differential'],
    href: '/fundamentals/math-and-science/calculus/differentials-newtons-method',
  },
  {
    id: 'formula-newton-method-calculus',
    kind: 'formula',
    title: "Newton's method update",
    formula: '$x_{n+1}=x_n-\\dfrac{f(x_n)}{f\'(x_n)}$',
    description:
      'Tangent intercept iteration for $f(x)=0$. For $\\sqrt{a}$: $x_{n+1}=(x_n^{2}+a)/(2x_n)$.',
    explorer: 'newtonSqrt3',
    tex: 'x_{n+1}=x_n-\\frac{f(x_n)}{f\'(x_n)}',
    texAlts: ['newton method', 'x = x - f/f\'', "newton's iteration"],
    href: '/fundamentals/math-and-science/calculus/differentials-newtons-method',
  },
];
