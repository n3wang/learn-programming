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
];
