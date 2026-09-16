/** Add a theorem: id, title, statement, description, href, order {prompt, items, order, why}. */

export const THEOREMS = [
  {
    id: 'thm-complement-equal',
    kind: 'theorem',
    title: '同角（或等角）的余角相等',
    statement: '若 $\\angle 2$ 与 $\\angle 3$ 都是 $\\angle 1$ 的余角，则 $\\angle 2 = \\angle 3$。',
    description:
      '两个角的和为 $90^\\circ$ 则互余。若角 2 与角 3 都是角 1 的余角，则角 2 $= 90^\\circ -$ 角 1，角 3 $= 90^\\circ -$ 角 1，所以角 2 $=$ 角 3。补角（和为 $180^\\circ$）有同样的性质。',
    href: '/classes/math-1/complementary-angles',
    order: {
      prompt: '推导「同角的余角相等」——排出步骤。',
      items: [
        '所以 $\\angle 2 = \\angle 3$',
        '$\\angle 2 = 90^\\circ - \\angle 1$，且 $\\angle 3 = 90^\\circ - \\angle 1$',
        '$\\angle 1$ 与 $\\angle 2$ 互余，$\\angle 1$ 与 $\\angle 3$ 互余',
      ],
      order: [2, 1, 0],
      why: '两个余角都等于直角减去同一个角，因此相等。',
    },
  },
  {
    id: 'thm-ineq-prop-3',
    kind: 'theorem',
    title: '不等式的性质 3',
    statement: '若 $a > b$ 且 $c < 0$，则 $ac < bc$（两边乘同一个负数，不等号方向改变）。',
    description:
      '性质 1：两边加或减同一个数，方向不变。性质 2：两边乘（或除以）正数，方向不变。性质 3：乘数为负时方向改变。除法等于乘倒数，符号相同。两边都乘 0 会失去原来的不等关系。',
    href: '/classes/math-2/inequality-properties',
    order: {
      prompt: '解不等式时，这些变形按什么顺序用？（从「像等式」到「负数要翻号」。）',
      items: [
        '若还要乘或除以负数，把不等号方向反过来（性质 3）',
        '两边加或减同一个数或式子，方向不变（性质 1）',
        '两边乘或除以同一个正数，方向不变（性质 2）',
      ],
      order: [1, 2, 0],
      why: '先做加减（方向不变），再乘除正数（仍不变），只有乘除负数时才翻号。',
    },
  },
  {
    id: 'thm-truncation-convergent',
    kind: 'theorem',
    title: 'Truncation of a convergent scheme',
    statement:
      'If a discrete method is consistent with the mathematics, algorithmic error $\\mathcal{E}\\to 0$ as $N\\to\\infty$. For the sine Taylor sum, a useful truncation also needs $N \\gg |x|$.',
    description:
      'Infinite series, infinitesimal steps, and varying coefficients are replaced by finite recipes. The leftover is algorithmic error. For a good method it shrinks as $N$ grows and vanishes in the $N\\to\\infty$ limit. The sine series is exact as an infinite sum; after $N$ terms the tail $\\mathcal{E}(x,N)$ is large unless $N$ is much larger than $|x|$.',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
    order: {
      prompt: 'Order the argument that a truncated sine series can still be accurate (top = start).',
      items: [
        'The leftover $\\mathcal{E}(x,N)$ is the tail from $N+1$ to $\\infty$',
        'For this series the size of $N$ must be set by $x$: you need $N \\gg |x|$',
        'The infinite sum equals $\\sin x$ exactly',
        'A good algorithm makes $\\mathcal{E}\\to 0$ as $N\\to\\infty$',
      ],
      order: [2, 0, 3, 1],
      why: 'Exact infinite sum, finite recipe leaves a tail, the tail should vanish with N, and for sine that N has to outrun |x|.',
    },
  },
  {
    id: 'thm-subtractive-cancellation',
    kind: 'theorem',
    title: 'Subtractive cancellation',
    statement:
      'If you subtract two large numbers and the result is small, that small number is less significant than either of the large ones.',
    description:
      'Store $x_c\\simeq x(1+\\epsilon_x)$. For $a=b-c$ the relative error is about $1+(b/a)(\\epsilon_b-\\epsilon_c)$. When $b\\simeq c$, $a$ is small so $b/a$ is huge, and the leftover is built from the noisy least-significant bits. Plan for the worst sign on $\\epsilon_b-\\epsilon_c$. Rewrite (for example $e^{-x}=1/e^{x}$) instead of summing a huge alternating series.',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
    order: {
      prompt: 'Order why a small difference of two large floats is untrustworthy (top = start).',
      items: [
        'The factor $b/a$ multiplies whatever relative noise did not cancel',
        'Each stored value is $x_c\\simeq x(1+\\epsilon_x)$',
        'When $b\\simeq c$, the leading digits cancel and $a$ is small',
        'The leftover $a$ is assembled from the least-significant bits',
      ],
      order: [1, 2, 3, 0],
      why: 'Approximate storage, then a close subtraction wipes the accurate heads, then $b/a$ magnifies the noisy tails.',
    },
  },
  {
    id: 'thm-best-n-tradeoff',
    kind: 'theorem',
    title: 'Best $N$ for total error',
    statement:
      'Total error $\\epsilon_{\\mathrm{tot}}\\simeq\\alpha/N^{\\beta}+\\sqrt{N}\\,\\epsilon_m$ is smallest near the $N$ where approximation error and round-off are comparable. Extra steps past that trough buy round-off, not accuracy.',
    description:
      'Algorithmic error typically falls as $\\alpha/N^{\\beta}$. Uncorrelated round-off grows like $\\sqrt{N}\\,\\epsilon_m$. Their sum has a minimum at $N^{*}=(2\\alpha\\beta/\\epsilon_m)^{1/(\\beta+1/2)}$. A faster method (larger $\\beta$) reaches that trough at smaller $N$, so it is often both cheaper and less rounded. On a $\\log_{10}$ error plot, $-\\log_{10}(\\epsilon)$ is the number of decimal places.',
    href: '/fundamentals/math-and-science/computational-physics/03-02-experimental-error',
    order: {
      prompt: 'Order how total error usually depends on $N$ (top = small $N$).',
      items: [
        'Round-off $\\sqrt{N}\\,\\epsilon_m$ dominates and $\\epsilon_{\\mathrm{tot}}$ creeps up',
        'A trough where $\\epsilon_{\\mathrm{app}}\\simeq\\epsilon_{\\mathrm{ro}}$ — the best practical $N$',
        'Approximation $\\alpha/N^{\\beta}$ dominates; the log–log plot drops steeply',
      ],
      order: [2, 1, 0],
      why: 'Converge first, meet in the middle, then round-off wins.',
    },
  },
  {
    id: 'thm-term-as-remainder',
    kind: 'theorem',
    title: 'Last term as truncation proxy',
    statement:
      'If round-off is not yet in charge, the first omitted term of a convergent series is a usable estimate of the truncation error. Stop when that term is a small fraction of the running sum.',
    description:
      'An infinite series is not an algorithm. The finite sine sum stops when $|t_n/S_n|<\\varepsilon$ (for example $10^{-8}$), not when the printout matches a table. For large $|x|$ many terms grow before they shrink, so $N$ must outrun $|x|$. Do not form $x^{2n-1}/(2n-1)!$ from scratch.',
    href: '/fundamentals/math-and-science/computational-physics/03-03-power-series',
    order: {
      prompt: 'Order one safe sine-series step (top = start).',
      items: [
        'Stop when $|t_n/S_n|<\\varepsilon$',
        'Set $t_1=x$ and $S_1=x$',
        'Do not form $x^{2n-1}$ and $(2n-1)!$ separately',
        'Update $t_n=-x^{2}/((2n-1)(2n-2))\\, t_{n-1}$, then $S\\leftarrow S+t_n$',
      ],
      order: [1, 2, 3, 0],
      why: 'Initialize, refuse the overflow-prone quotient, recur, then test |term/sum|.',
    },
  },
  {
    id: 'thm-closed-specular-orbit',
    kind: 'theorem',
    title: 'Closed specular orbit',
    statement:
      'A ray that advances by $2\\phi$ on a circle closes into a finite figure if and only if $\\phi/\\pi$ is rational (identifying $\\theta$ with $\\theta+2\\pi$).',
    description:
      'Specular reflection in a circular mirror sends $\\theta\\leftarrow\\theta+2\\phi$ each bounce. Rational $\\phi/\\pi=n/m$ makes the ray fall on itself; irrational multiples dense-fill chords. Four-digit rounding injects angle error that grows with bounce count.',
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
    order: {
      prompt: 'Order why a rounded long orbit drifts (top = start).',
      items: [
        'Relative error in hit points grows with the number of bounces',
        'Each step adds $2\\phi$, possibly after rounding $\\phi$ and $\\theta$',
        'A tiny angle error is injected every reflection',
        'Full-precision rational $\\phi/\\pi$ would have closed',
      ],
      order: [3, 1, 2, 0],
      why: 'Ideal closed orbit, then rounded steps, injected error, accumulation with bounce count.',
    },
  },
  {
    id: 'thm-miller-bessel',
    kind: 'theorem',
    title: 'Miller downward recursion for $j_\\ell$',
    statement:
      'Upward recurrence for spherical Bessel $j_\\ell$ mixes in $n_\\ell$ by subtractive cancellation. Start at large $L$ with arbitrary seeds, recur downward, then rescale so $j_0=\\sin x/x$.',
    description:
      'Both $j_\\ell$ and $n_\\ell$ obey the same three-term recurrence. When $|n_\\ell|\\gg|j_\\ell|$, upward steps turn cancellation into Neumann garbage. Miller’s device walks down (errors shrink) and fixes absolute scale from the known $j_0$.',
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
    order: {
      prompt: 'Order Miller’s algorithm (top = first).',
      items: [
        'Normalize every $j_\\ell^{c}$ by $j_0^{\\mathrm{anal}}/j_0^{c}$',
        'Pick large $L$; set $j_{L+1}^{c}$ and $j_L^{c}$ to arbitrary seeds',
        'Recur downward with $j_{\\ell-1}=(2\\ell+1)/x\\, j_\\ell-j_{\\ell+1}$',
        'Read off the needed $j_\\ell$ at the physical $x$',
      ],
      order: [1, 2, 0, 3],
      why: 'Seed high, walk down, rescale to analytic $j_0$, then use the table.',
    },
  },
  {
    id: 'thm-walk-rms',
    kind: 'theorem',
    title: 'Random-walk RMS distance',
    statement:
      'For an isotropic random walk with RMS step $r_{\\mathrm{rms}}$, the mean vector displacement vanishes while $R_{\\mathrm{rms}}=\\langle R^{2}\\rangle^{1/2}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}$.',
    description:
      'Expand $R^{2}$; cross terms average to zero. What remains is $N$ copies of $\\langle r^{2}\\rangle$. Diffusion spreads like $\\sqrt{N}$, not like a straight line of length $N r_{\\mathrm{rms}}$.',
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
    order: {
      prompt: 'Order the RMS-walk argument (top = first).',
      items: [
        'Conclude $R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}$',
        'Expand $R^{2}$ into squares plus cross terms',
        'Average: cross terms cancel; diagonal terms give $N\\langle r^{2}\\rangle$',
        'Note $\\langle\\vec{R}\\rangle\\simeq 0$ by symmetry',
      ],
      order: [1, 2, 0, 3],
      why: 'Expand, cancel cross terms, take the square root, remember the vector mean is zero.',
    },
  },
  {
    id: 'thm-decay-mean-field',
    kind: 'theorem',
    title: 'Exponential decay as a large-$N$ limit',
    statement:
      'Independent nuclei with constant hazard $\\lambda$ obey $\\Delta N/\\Delta t=-\\lambda N$ in expectation. As $N\\to\\infty$ and $\\Delta t\\to 0$ this becomes $dN/dt=-\\lambda N$ with $N(t)=N(0)e^{-\\lambda t}$.',
    description:
      'Finite samples remain stochastic: semilog $N(t)$ develops bumps as $N$ shrinks. Early slope of $\\ln N$ is still $\\approx-\\lambda$ when $N$ is large, independent of $N(0)$.',
    href: '/fundamentals/math-and-science/computational-physics/04-02-spontaneous-decay',
    order: {
      prompt: 'Order the path from micro-law to exponential (top = first).',
      items: [
        'Integrate to $N(t)=N(0)e^{-\\lambda t}$',
        'Write $\\langle\\Delta N\\rangle=-\\lambda N\\Delta t$',
        'Take $N\\to\\infty$, $\\Delta t\\to 0$ to get $dN/dt=-\\lambda N$',
        'Assign each nucleus a constant decay probability per $\\Delta t$',
      ],
      order: [3, 1, 2, 0],
      why: 'Micro hazard → expected difference equation → continuum DE → exponential.',
    },
  },
  {
    id: 'thm-uniform-moment',
    kind: 'theorem',
    title: 'Uniform moment and $1/\\sqrt{N}$ noise',
    statement:
      'For i.i.d. uniforms on $[0,1]$, $\\langle x^{k}\\rangle\\to 1/(k+1)$ and the sampling error is typically $O(1/\\sqrt{N})$, so $\\sqrt{N}|\\langle x^{k}\\rangle-1/(k+1)|$ stays order one.',
    description:
      'Matching the integral test supports uniformity. Order-one $\\sqrt{N}$ residuals support the randomness assumption behind the error model. Still reject generators that fail successive-pair scatterplots.',
    href: '/fundamentals/math-and-science/computational-physics/04-03-random-tests',
    order: {
      prompt: 'Order a quantitative uniformity check (top = first).',
      items: [
        'Confirm $\\sqrt{N}|\\mathrm{error}|$ is $O(1)$',
        'Draw $N$ uniforms from the generator under test',
        'Compare $\\langle x^{k}\\rangle$ to $1/(k+1)$ for several $k$',
        'Also scatter successive pairs before trusting the means',
      ],
      order: [1, 2, 0, 3],
      why: 'Sample, compare moments, check the $\\sqrt{N}$ scale, and never skip the scatter plot.',
    },
  },
  {
    id: 'thm-central-diff-order',
    kind: 'theorem',
    title: 'Central difference is $O(h^{2})$',
    statement:
      'Expanding $y(t\\pm h/2)$ shows that even powers of $h$ cancel in $y(t+h/2)-y(t-h/2)$, so $(y(t+h/2)-y(t-h/2))/h = y\'(t)+O(h^{2})$.',
    description:
      'Forward difference keeps an $O(h)$ bias from $y\'\'$. Central difference is exact on quadratics. Both still suffer round-off when $h$ is pathologically small.',
    href: '/fundamentals/math-and-science/computational-physics/05-01-differentiation',
    order: {
      prompt: 'Order the central-difference error argument (top = first).',
      items: [
        'Conclude the leading error is $O(h^{2})$ after dividing by $h$',
        'Write Taylor series for $y(t+h/2)$ and $y(t-h/2)$',
        'Subtract: even powers cancel; odd powers beyond $h y\'$ remain',
        'Form $(y(t+h/2)-y(t-h/2))/h$',
      ],
      order: [1, 2, 3, 0],
      why: 'Expand both sides, subtract, divide, read the order.',
    },
  },
  {
    id: 'thm-richardson-ed-order',
    kind: 'theorem',
    title: 'Extrapolated difference is $O(h^{4})$',
    statement:
      'If $D_{\\mathrm{cd}}(h)=y\'+c h^{2}+O(h^{4})$, then $(4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h))/3=y\'+O(h^{4})$: the $h^{2}$ coefficients cancel.',
    description:
      'Same idea as Richardson extrapolation for integration. On noisy data the higher-order stencil can still lose to a coarser smooth fit.',
    href: '/fundamentals/math-and-science/computational-physics/05-02-extrapolated-diff',
    order: {
      prompt: 'Order the Richardson cancellation argument (top = first).',
      items: [
        'Form $(4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h))/3$ and read $O(h^{4})$',
        'Write $D_{\\mathrm{cd}}(h)=y\'+c h^{2}+O(h^{4})$',
        'Note $D_{\\mathrm{cd}}(h/2)=y\'+c(h/2)^{2}+O(h^{4})=y\'+(c/4)h^{2}+O(h^{4})$',
        'Observe the $h^{2}$ terms cancel in the linear combination',
      ],
      order: [1, 2, 3, 0],
      why: 'Assume the $h^{2}$ model, write the half-step, combine, conclude.',
    },
  },
  {
    id: 'thm-riemann-box-limit',
    kind: 'theorem',
    title: 'Riemann limit is a box sum',
    statement:
      'For integrable $f$, $\\int_a^b f=\\lim_{h\\to 0} h\\sum f(x_i)$ over equal panels of width $h$. Numerical quadrature keeps finite $N$ and chooses $(x_i,w_i)$ deliberately.',
    description:
      'Box counting is the finite-$h$ ancestor of every $\\sum f_i w_i$ rule. Later methods (trapezoid, Simpson, Gauss) only change the nodes and weights.',
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
    order: {
      prompt: 'Order the box-counting story (top = first).',
      items: [
        'Recognize practical rules as finite $\\sum f(x_i)w_i$',
        'Picture the area under $f$ as a sum of panel areas',
        'Write the Riemann limit $h\\sum f(x_i)$ as $h\\to 0$',
        'Stop at finite $N$ and pick concrete sample locations',
      ],
      order: [1, 2, 3, 0],
      why: 'Area → Riemann limit → freeze $N$ → weighted sum.',
    },
  },
  {
    id: 'thm-romberg-h2-cancel',
    kind: 'theorem',
    title: 'Romberg cancels $O(h^{2})$',
    statement:
      'If $A(h)=I+\\alpha h^{2}+O(h^{4})$, then $(4 A(h/2)-A(h))/3=I+O(h^{4})$.',
    description:
      'Same Richardson pattern as extrapolated differences. Useful only while the $h^{2}$ term dominates the error.',
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
    order: {
      prompt: 'Order the Romberg argument (top = first).',
      items: [
        'Form $(4 A(h/2)-A(h))/3$ and read $O(h^{4})$',
        'Assume $A(h)=I+\\alpha h^{2}+O(h^{4})$',
        'Write $A(h/2)=I+\\alpha(h/2)^{2}+O(h^{4})$',
        'Observe the $\\alpha h^{2}$ terms cancel',
      ],
      order: [1, 2, 3, 0],
      why: 'Model → half-step → cancel → conclude.',
    },
  },
  {
    id: 'thm-gauss-degree-2n-1',
    kind: 'theorem',
    title: 'Gauss–Legendre is exact through degree $2N-1$',
    statement:
      'With nodes at the zeros of $P_N$ and the classical weights, $\\sum_{i=1}^{N} w_i g(y_i)=\\int_{-1}^{1} g$ for every polynomial $g$ of degree at most $2N-1$.',
    description:
      'Write $g=q P_N+r$. Orthogonality removes $\\int q P_N$; $P_N(y_i)=0$ removes the discrete $q$ term; an $N$-point rule integrates the degree-$\\le N$ remainder exactly.',
    href: '/fundamentals/math-and-science/computational-physics/05-04-gaussian-quadrature',
    order: {
      prompt: 'Order the Gauss exactness argument (top = first).',
      items: [
        'Conclude the discrete rule matches $\\int r$ exactly',
        'Write $g=q P_N+r$ with $\\deg r\\le N$',
        'Use orthogonality: $\\int q P_N=0$',
        'Choose nodes so $P_N(y_i)=0$, killing $\\sum w_i q(y_i)P_N(y_i)$',
      ],
      order: [1, 2, 3, 0],
      why: 'Split → orthogonality → roots → exact remainder.',
    },
  },
  {
    id: 'thm-mc-error-sqrt-n',
    kind: 'theorem',
    title: 'Plain Monte Carlo error scales as $1/\\sqrt{N}$',
    statement:
      'For independent uniform samples, the standard error of the mean-value integral estimator is proportional to $\\sigma_f/\\sqrt{N}$ (times the domain volume), independent of dimension $D$.',
    description:
      'Variance of the sample mean is $\\sigma_f^{2}/N$. Product grids cost $M^{D}$; Monte Carlo still uses $N$ evaluations with the same $1/\\sqrt{N}$ law.',
    href: '/fundamentals/math-and-science/computational-physics/05-06-mean-value-nd',
    order: {
      prompt: 'Order the MC error argument (top = first).',
      items: [
        'Conclude $\\sigma_I\\propto\\sigma_f/\\sqrt{N}$ independent of $D$',
        'Write $I\\simeq V\\langle f\\rangle$ with sample mean $\\langle f\\rangle$',
        'Note $\\mathrm{Var}(\\langle f\\rangle)=\\sigma_f^{2}/N$ for i.i.d. samples',
        'Contrast with a product grid needing $M^{D}$ nodes',
      ],
      order: [1, 2, 0, 3],
      why: 'Estimator → variance of mean → $1/\\sqrt{N}$ → grid explosion.',
    },
  },
  {
    id: 'thm-pond-area-ratio',
    kind: 'theorem',
    title: 'Area ratio by uniform sampling',
    statement:
      'If points are drawn uniformly in a region of known area $A_{\\mathrm{box}}$, then $A_{\\mathrm{pond}}/A_{\\mathrm{box}}=\\Pr(\\mathrm{hit})=\\lim N_{\\mathrm{pond}}/N$.',
    description:
      'Stone throwing is Monte Carlo integration of the indicator of the pond. The unit-disk case recovers $\\pi\\simeq 4N_{\\mathrm{hit}}/N$.',
    href: '/fundamentals/math-and-science/computational-physics/05-05-monte-carlo-integration',
    order: {
      prompt: 'Order the stone-throwing argument (top = first).',
      items: [
        'Estimate $A_{\\mathrm{pond}}\\simeq (N_{\\mathrm{pond}}/N)A_{\\mathrm{box}}$',
        'Draw $N$ uniform points in the known box',
        'Count hits inside the pond',
        'Identify the hit fraction with the area ratio',
      ],
      order: [1, 2, 3, 0],
      why: 'Throw → count → equate fraction to area ratio → scale by $A_{\\mathrm{box}}$.',
    },
  },
];
