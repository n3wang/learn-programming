/** Add a problem type: id, title, description, href, sample (GuidedChoiceExplanation preset id). */

export const PROBLEMS = [
  {
    id: 'problem-solve-transpose',
    kind: 'problem',
    title: '移项与合并同类项',
    description:
      '解一元一次方程：把含未知数的项移到一边、常数移到另一边（移项变号），合并同类项，再把未知数的系数化为 1。',
    sample: 'solve-transpose',
    href: '/classes/math-1/solving-linear-equations',
  },
  {
    id: 'problem-cost-profit',
    kind: 'problem',
    title: '进价利润应用题',
    description: '由进价、利润率（或亏损率）求利润和售价。引导里每一步选对了才翻到下一步。',
    sample: 'cost-profit-book',
    href: '/classes/math-1/cost-price-profit-loss',
  },
  {
    id: 'problem-error-kind',
    kind: 'problem',
    title: 'Which numerical error?',
    description:
      'Given a story (truncated series, short mantissa, long unreproducible run), name the dominant family: approximation, round-off, or random. The sample walks one simulation that has all three.',
    sample: 'error-kind-classify',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
  },
  {
    id: 'problem-avoid-cancellation',
    kind: 'problem',
    title: 'Rewrite to avoid cancellation',
    description:
      'When $b^{2}\\gg 4ac$ (or when summing a huge alternating series for a tiny result), pick the algebra that does not subtract two close large numbers. Sample: the tiny quadratic root via the large root and $x_1 x_2=c/a$.',
    sample: 'quadratic-stable-root',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
  },
  {
    id: 'problem-error-tradeoff-stop',
    kind: 'problem',
    title: 'Where to stop a converging run',
    description:
      'On a log–log relative-error plot, a steep drop is $\\alpha/N^{\\beta}$; a noisy rise is $\\sqrt{N}\\,\\epsilon_m$. Stop just before the trough. If you lack the exact answer, use $A(N)$ vs $A(2N)$ as the diagnostic.',
    sample: 'error-tradeoff-stop',
    href: '/fundamentals/math-and-science/computational-physics/03-02-experimental-error',
  },
  {
    id: 'problem-series-stop',
    kind: 'problem',
    title: 'When to stop a power series',
    description:
      'A finite Taylor sum needs a stop rule that does not peek at a table: halt when the latest term is a small fraction of the running sum, and build that term from the previous one by a short recurrence.',
    sample: 'sine-series-stop',
    href: '/fundamentals/math-and-science/computational-physics/03-03-power-series',
  },
  {
    id: 'problem-specular-close',
    kind: 'problem',
    title: 'When a specular orbit closes',
    description:
      'Inside a circular mirror each bounce advances $\\theta$ by $2\\phi$. Decide when the ray retraces a finite figure, and what four-digit rounding does to a long path.',
    sample: 'specular-close-orbit',
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
  },
  {
    id: 'problem-bessel-miller',
    kind: 'problem',
    title: 'Stable spherical Bessel by Miller downward',
    description:
      'Upward $j_\\ell$ recurrence looks easy and then dies by Neumann pollution. Choose Miller downward recursion and $j_0=\\sin x/x$ normalization instead.',
    sample: 'bessel-miller-down',
    href: '/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory',
  },
  {
    id: 'problem-lcg-pseudo',
    kind: 'problem',
    title: 'Trusting a pseudorandom generator',
    description:
      'Computers emit pseudorandom streams. Decide what uniform vs random means, why an LCG is predictable in principle, and what a successive-pair lattice implies.',
    sample: 'lcg-pseudo-random',
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'problem-walk-rms',
    kind: 'problem',
    title: 'Why a random walk spreads like √N',
    description:
      'Cross terms in $R^{2}$ average away for an isotropic walk, leaving $R_{\\mathrm{rms}}\\simeq\\sqrt{N}\\, r_{\\mathrm{rms}}$. One path is noisy — average many trials.',
    sample: 'random-walk-rms',
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'problem-brain-obstacles',
    kind: 'problem',
    title: 'Diffusion with extracellular obstacles',
    description:
      'Circular barriers model extracellular spaces in brain tissue. Compare free vs stop/bounce walks and map the drop in $R_{\\mathrm{rms}}$ onto Einstein’s $D\\propto R_{\\mathrm{rms}}^{2}/(2dt)$.',
    sample: 'brain-diffusion-obstacles',
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'problem-hp-fold',
    kind: 'problem',
    title: 'Self-avoiding HP protein fold',
    description:
      'Grow a self-avoiding lattice chain of hydrophobic and polar monomers. Score $E=-\\varepsilon f$ from non-bonded H–H contacts and hunt low-energy compact cores.',
    sample: 'protein-hp-fold',
    href: '/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random',
  },
  {
    id: 'problem-spontaneous-decay',
    kind: 'problem',
    title: 'Stochastic vs exponential decay',
    description:
      'Simulate nucleus-by-nucleus decay with fixed λ. Relate Geiger-like fluctuations at small N to the smooth exponential envelope that appears only for large N.',
    sample: 'spontaneous-decay',
    href: '/fundamentals/math-and-science/computational-physics/04-02-spontaneous-decay',
  },
  {
    id: 'problem-rng-uniform-tests',
    kind: 'problem',
    title: 'Test a uniform pseudorandom stream',
    description:
      'Combine visual checks with moment and lag-product statistics. Uniformity needs ⟨xᵏ⟩≈1/(k+1); independence at lag k needs C(k)≈1/4 — and √N|error| should stay O(1).',
    sample: 'rng-uniform-tests',
    href: '/fundamentals/math-and-science/computational-physics/04-03-random-tests',
  },
  {
    id: 'problem-forward-central-diff',
    kind: 'problem',
    title: 'Choose a finite-difference derivative',
    description:
      'Given tabulated y(t), decide between forward and central differences, and explain the O(h) vs O(h²) truncation story and the ε_m floor at tiny h.',
    sample: 'forward-central-diff',
    href: '/fundamentals/math-and-science/computational-physics/05-01-differentiation',
  },
  {
    id: 'problem-extrapolated-diff',
    kind: 'problem',
    title: 'Extrapolate a central difference',
    description:
      'Combine D_cd(h) and D_cd(h/2) into D_ed, recognize O(h⁴) truncation, and know when noise makes a high-order stencil a bad idea.',
    sample: 'extrapolated-diff',
    href: '/fundamentals/math-and-science/computational-physics/05-02-extrapolated-diff',
  },
  {
    id: 'problem-riemann-box-counting',
    kind: 'problem',
    title: 'Integrate by box counting',
    description:
      'Turn ∫f into Σ f(x_i) w_i with equal-width left or midpoint boxes, and connect a rate spectrum dN/dt to a particle count N(1).',
    sample: 'riemann-box-counting',
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
  },
  {
    id: 'problem-romberg-integration',
    kind: 'problem',
    title: 'Choose Simpson or Romberg',
    description:
      'Compare O(h²) trapezoid vs O(h⁴) Simpson, apply Romberg’s (4 A(h/2)−A(h))/3, and know why N→∞ is not the accuracy strategy.',
    sample: 'romberg-integration',
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
  },
  {
    id: 'problem-gaussian-quadrature',
    kind: 'problem',
    title: 'Apply Gaussian quadrature',
    description:
      'Use Legendre nodes/weights, map them onto [a,b], and explain why N points can be exact through degree 2N−1.',
    sample: 'gaussian-quadrature',
    href: '/fundamentals/math-and-science/computational-physics/05-04-gaussian-quadrature',
  },
  {
    id: 'problem-monte-carlo-integration',
    kind: 'problem',
    title: 'Estimate an integral by Monte Carlo',
    description:
      'Use stone throwing or mean-value sampling, know the 1/√N error law, and compare log–log slopes to trap/Simpson/Gauss.',
    sample: 'monte-carlo-integration',
    href: '/fundamentals/math-and-science/computational-physics/05-05-monte-carlo-integration',
  },
  {
    id: 'problem-mean-value-nd',
    kind: 'problem',
    title: 'Apply mean-value MC in high D',
    description:
      'Write I ≈ V⟨f⟩, explain σ_I ~ σ_f/√N, and contrast M^D grids with sampling on a 10D calibration integral.',
    sample: 'mean-value-nd',
    href: '/fundamentals/math-and-science/computational-physics/05-06-mean-value-nd',
  },
];
