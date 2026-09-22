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
    id: 'problem-gauss-mapping',
    kind: 'problem',
    title: 'Map Gauss–Legendre onto [a,b]',
    description:
      'From reference (yᵢ,wᵢ′) on [−1,1], pick the affine node map and Jacobian weight factor for a general [a,b] (and variants for [0,∞)).',
    sample: 'gauss-mapping',
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
  {
    id: 'problem-mc-variance-reduction',
    kind: 'problem',
    title: 'Reduce Monte Carlo variance with a control',
    description:
      'Explain when uniform sampling wastes effort, rewrite I=∫(f−g)+J, and compare plain vs CV on e^{-x} with g=1−x.',
    sample: 'mc-variance-reduction',
    href: '/fundamentals/math-and-science/computational-physics/05-07-mc-variance-reduction',
  },
  {
    id: 'problem-importance-sampling',
    kind: 'problem',
    title: 'Importance sample an integral',
    description:
      'Write I=⟨f/w⟩ with x~w, choose w∝f, and use rejection or inverse CDF to draw from w.',
    sample: 'importance-sampling',
    href: '/fundamentals/math-and-science/computational-physics/05-08-importance-sampling',
  },
  {
    id: 'problem-bisection-search',
    kind: 'problem',
    title: 'Trap a root by bisection',
    description:
      'Given a continuous residual with a sign-change bracket, apply interval halving, explain linear W/2ᴺ convergence, and apply it to the even square-well g(E).',
    sample: 'bisection-search',
    href: '/fundamentals/math-and-science/computational-physics/06-02-bisection-search',
  },
  {
    id: 'problem-newton-raphson',
    kind: 'problem',
    title: 'Refine a root by Newton–Raphson',
    description:
      'From a close guess, apply Δx=−f/f′ (difference derivative OK), compare iteration count with bisection, and use backtracking when |f| grows — including the even square-well g(E).',
    sample: 'newton-raphson',
    href: '/fundamentals/math-and-science/computational-physics/06-03-newton-raphson',
  },
  {
    id: 'problem-magnetization-search',
    kind: 'problem',
    title: 'Map m(t) by residual search',
    description:
      'At fixed reduced t, root-find m−tanh(m/t)=0 with bisection and Newton, compare iteration counts, and tabulate the spontaneous branch down through Tc.',
    sample: 'magnetization-search',
    href: '/fundamentals/math-and-science/computational-physics/06-04-magnetization-search',
  },
  {
    id: 'problem-subtractive-cancellation',
    kind: 'problem',
    title: 'Explain subtractive cancellation',
    description:
      'Show why b≃c makes a=b−c lose significant digits, how |b/a| magnifies the leftover, and rewrite e^(−x) or a quadratic root to avoid it.',
    sample: 'subtractive-cancellation',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
  },
  {
    id: 'problem-richardson-cancel-h2',
    kind: 'problem',
    title: 'Cancel the O(h²) difference error',
    description:
      'From D(h)=y′+αh²+… and D(h/2)=y′+αh²/4+…, form (4D(h/2)−D(h))/3 and state the new leading order.',
    sample: 'richardson-cancel-h2',
    href: '/fundamentals/math-and-science/computational-physics/05-02-extrapolated-diff',
  },
  {
    id: 'problem-trap-simpson-weights',
    kind: 'problem',
    title: 'Build Trapezoid and Simpson weights',
    description:
      'Stitch single-panel trapezoids into h/2(f0+2∑+fN), then upgrade pairs of panels to Simpson’s (1,4,2,…,1)/3 pattern and compare error orders.',
    sample: 'trap-simpson-weights',
    href: '/fundamentals/math-and-science/computational-physics/05-03-integration',
  },
  {
    id: 'problem-square-well-residual',
    kind: 'problem',
    title: 'Derive the even square-well residual',
    description:
      'Start from √(V0−E) tan√(V0−E)=√E, rewrite as g(E)=√E cot√(V0−E)−√(V0−E), and explain why a sign-change bracket is required.',
    sample: 'square-well-residual',
    href: '/fundamentals/math-and-science/computational-physics/06-01-quantum-bound-states',
  },
  {
    id: 'problem-newton-delta-from-taylor',
    kind: 'problem',
    title: 'Derive the Newton correction',
    description:
      'Linearize f(x0+Δx)≈f+f′Δx, set the model to zero to get Δx=−f/f′, and name the flat-derivative failure mode.',
    sample: 'newton-delta-from-taylor',
    href: '/fundamentals/math-and-science/computational-physics/06-03-newton-raphson',
  },
  {
    id: 'problem-weiss-mean-field-reduce',
    kind: 'problem',
    title: 'Reduce Weiss magnetism to m(t)',
    description:
      'From M=Nμ tanh(λμM/kBT), introduce m, t, Tc to reach m=tanh(m/t) and the residual f=m−tanh(m/t); locate Tc.',
    sample: 'weiss-mean-field-reduce',
    href: '/fundamentals/math-and-science/computational-physics/06-04-magnetization-search',
  },
  {
    id: 'problem-lagrange-basis-product',
    kind: 'problem',
    title: 'Build the Lagrange basis λᵢ',
    description:
      'Construct λᵢ(x)=∏_{j≠i}(x−xⱼ)/(xᵢ−xⱼ) so λᵢ(xₖ)=δᵢₖ, then form g=∑ gᵢλᵢ and state the degree.',
    sample: 'lagrange-basis-product',
    href: '/fundamentals/math-and-science/computational-physics/06-01-lagrange-interpolation',
  },
  {
    id: 'problem-linear-ls-normal-eqs',
    kind: 'problem',
    title: 'Derive linear least-squares normals',
    description:
      'From ∂χ²/∂aₘ=0 for g=a1+a2x, assemble the weighted sums and solve for a1,a2; log-linearize exponential decay.',
    sample: 'linear-ls-normal-eqs',
    href: '/fundamentals/math-and-science/computational-physics/06-03-exponential-decay-least-squares',
  },
  {
    id: 'problem-chi2-stationarity',
    kind: 'problem',
    title: 'Turn χ² into a nonlinear system',
    description:
      'Write ∂χ²/∂aₘ=0 for Breit–Wigner parameters, explain why the resulting fₘ(a)=0 system is nonlinear, and choose multidimensional Newton.',
    sample: 'chi2-stationarity',
    href: '/fundamentals/math-and-science/computational-physics/06-04-nonlinear-resonance-fit',
  },
  {
    id: 'problem-bw-partials-newton',
    kind: 'problem',
    title: 'Breit–Wigner partials and residuals',
    description:
      'For g=a1/[(x−a2)²+a3], pick ∂g/∂aₘ and the three stationarity residuals f1=f2=f3=0, then solve with multidimensional Newton.',
    sample: 'bw-partials-newton',
    href: '/fundamentals/math-and-science/computational-physics/06-04-nonlinear-resonance-fit',
  },
  {
    id: 'problem-tests-before-use',
    kind: 'problem',
    title: 'Trust a matrix inverse with residuals',
    description:
      'After Gauss–Jordan, check max|AA⁻¹−I| against machine ε, compare to an analytic inverse, and verify Ax≈b / Av≈λv before trusting the numbers.',
    sample: 'tests-before-use',
    href: '/fundamentals/math-and-science/computational-physics/07-02-tests-before-use',
  },
  {
    id: 'problem-string-statics-newton',
    kind: 'problem',
    title: 'Nonlinear statics with cos±sqrt and Newton',
    description:
      'Reduce angles with c=±√(1−s²) (prefer + when cos>0), run 2D Newton with Jacobian JΔx=−f, and reject unphysical roots.',
    sample: 'string-statics-newton',
    href: '/fundamentals/math-and-science/computational-physics/07-03-string-problem',
  },
  {
    id: 'problem-hyperfine-spin',
    kind: 'problem',
    title: 'Build hyperfine V and its 4W gap',
    description:
      'Form V=W σe·σp in the product basis, read triplet W×3 vs singlet −3W, and report ΔE/W=4.',
    sample: 'hyperfine-spin',
    href: '/fundamentals/math-and-science/computational-physics/07-04-hyperfine',
  },
  {
    id: 'problem-matrix-vectorization',
    kind: 'problem',
    title: 'Think in vector ops and stride',
    description:
      'Contrast Python element loops with vectorized maps/SAXPY/matvec, and explain why row-major matvec walks rows with unit stride.',
    sample: 'matrix-vectorization',
    href: '/fundamentals/math-and-science/computational-physics/07-05-matrix-speed',
  },
  {
    id: 'problem-matrix-stride-matmul',
    kind: 'problem',
    title: 'Compare stride and matmul nestings',
    description:
      'Explain row-major strides (1 vs M), why column-outer SOS can be slower, implement both matmul nestings that yield the same C, and time them locally with perf_counter medians.',
    sample: 'matrix-vectorization',
    href: '/fundamentals/math-and-science/computational-physics/07-05b-matrix-speed-labs',
  },
  {
    id: 'problem-nonlinear-oscillator-models',
    kind: 'problem',
    title: 'Build F from anharmonic V(x)',
    description:
      'Differentiate soft V≈½kx²(1−⅔αx) and power-law V=k|x|^p/p, state when motion is harmonic, and warn about unbound soft trajectories past x=1/α.',
    sample: 'nonlinear-oscillator-models',
    href: '/fundamentals/math-and-science/computational-physics/08-01-nonlinear-oscillators',
  },
  {
    id: 'problem-ode-dynamic-form',
    kind: 'problem',
    title: 'Cast Newton as a first-order system',
    description:
      'Introduce y0=x, y1=v, write f=(v,F/m), and evaluate a sample RHS for a harmonic spring.',
    sample: 'ode-dynamic-form',
    href: '/fundamentals/math-and-science/computational-physics/08-02-ode-form-and-review',
  },
  {
    id: 'problem-euler-rk2-step',
    kind: 'problem',
    title: 'Compare Euler and RK2 on a harmonic orbit',
    description:
      'Take one Euler and one RK2 step from (0,1), integrate to t=0.25, and compare to A sin(ωt) plus an energy-digit score.',
    sample: 'euler-rk2-step',
    href: '/fundamentals/math-and-science/computational-physics/08-03-ode-algorithms',
  },
  {
    id: 'problem-rk4-weights',
    kind: 'problem',
    title: 'Assemble classic RK4 stages and weights',
    description:
      'Pick the four stage slopes k1…k4 (endpoint / mid / mid / endpoint) and the weighted update y←y+(k1+2k2+2k3+k4)/6.',
    sample: 'rk4-weights',
    href: '/fundamentals/math-and-science/computational-physics/08-03-ode-algorithms',
  },
  {
    id: 'problem-energy-precision-ode',
    kind: 'problem',
    title: 'Quantify ODE accuracy with energy digits',
    description:
      'After integrating one period, form |(E−E0)/E0| and report −log10 as a digits estimate; contrast RK4 vs Euler.',
    sample: 'energy-precision-ode',
    href: '/fundamentals/math-and-science/computational-physics/08-03b-ode-algorithms-labs',
  },
  {
    id: 'problem-friction-damping-regimes',
    kind: 'problem',
    title: 'Classify damping and compute beat frequency',
    description:
      'Compare b to 2mω0 for under/critical/over regimes, and evaluate |ω−ω0|/(2π) for a near-resonant drive.',
    sample: 'friction-damping-regimes',
    href: '/fundamentals/math-and-science/computational-physics/08-05-friction-resonance',
  },
  {
    id: 'problem-fourier-series-coefficients',
    kind: 'problem',
    title: 'Expand a period-T signal in harmonics',
    description:
      'State ω=2π/T, project (a_n,b_n), use odd/even shortcuts, and interpret Gibbs midpoint convergence for a sawtooth.',
    sample: 'fourier-series-coefficients',
    href: '/fundamentals/math-and-science/computational-physics/09-01-fourier-series',
  },
  {
    id: 'problem-fourier-transform-pair',
    kind: 'problem',
    title: 'State the continuous FT pair and power spectrum',
    description:
      'Write forward/inverse transforms with 1/√(2π), define |Y|², and recall the 2πδ consistency identity.',
    sample: 'fourier-transform-pair',
    href: '/fundamentals/math-and-science/computational-physics/09-02-fourier-transforms',
  },
  {
    id: 'problem-dft-nyquist-alias',
    kind: 'problem',
    title: 'Apply Nyquist and spot aliasing',
    description:
      'From h compute s and s/2; explain when f and f−2s share samples; contrast coarse vs fine sampling of two sinusoids.',
    sample: 'dft-nyquist-alias',
    href: '/fundamentals/math-and-science/computational-physics/09-03-discrete-fourier-transforms',
  },
  {
    id: 'problem-autocorrelation-power',
    kind: 'problem',
    title: 'Recover |S|² via autocorrelation',
    description:
      'Form A(τ) for y=s+n, argue noise averages out, and relate A(ω) to √(2π)|S|².',
    sample: 'autocorrelation-power',
    href: '/fundamentals/math-and-science/computational-physics/09-04-noise-filtering',
  },
  {
    id: 'problem-convolution-filter-sinc',
    kind: 'problem',
    title: 'Filter via convolution / sinc',
    description:
      'State G=√(2π)FH, contrast RC lowpass vs highpass, and explain Hamming-windowed sinc truncation.',
    sample: 'convolution-filter-sinc',
    href: '/fundamentals/math-and-science/computational-physics/09-05-filters-and-sinc',
  },
  {
    id: 'problem-fft-butterfly-bitrev',
    kind: 'problem',
    title: 'Explain FFT butterflies and bit reversal',
    description:
      'Compare N² vs N log N, write one butterfly, and produce the 3-bit reversed order 0..7.',
    sample: 'fft-butterfly-bitrev',
    href: '/fundamentals/math-and-science/computational-physics/09-06-fft',
  },
  {
    id: 'problem-fft-implementation-roundtrip',
    kind: 'problem',
    title: 'Implement and assess a tiny FFT',
    description:
      'Enforce N=2^n, bit-reverse, run butterflies on ym=m+mi, scale DC, and verify FFT∘iFFT plus DFT timing.',
    sample: 'fft-implementation-roundtrip',
    href: '/fundamentals/math-and-science/computational-physics/09-07-fft-implementation',
  },
  {
    id: 'problem-wavelet-mother-daughter',
    kind: 'problem',
    title: 'Motivate wavelets for nonstationary tones',
    description:
      'Explain why a global DFT fails on staged multi-tone y(t), and how scale/translate of a mother builds a localized basis.',
    sample: 'wavelet-mother-daughter',
    href: '/fundamentals/math-and-science/computational-physics/10-01-wavelet-analysis',
  },
  {
    id: 'problem-wave-packet-uncertainty',
    kind: 'problem',
    title: 'Estimate Δt, Δω, and C',
    description:
      'For an N-cycle burst compute Δt and Δω, form the product vs 2π, and interpret the uncertainty tradeoff.',
    sample: 'wave-packet-uncertainty',
    href: '/fundamentals/math-and-science/computational-physics/10-02-wave-packets-uncertainty',
  },
  {
    id: 'problem-stft-window',
    kind: 'problem',
    title: 'Define and apply an STFT window',
    description:
      'Write Y(ω,τ) with w(t−τ), evaluate gated samples, and state the fixed-width limitation vs wavelets.',
    sample: 'stft-window',
    href: '/fundamentals/math-and-science/computational-physics/10-03-short-time-fourier',
  },
  {
    id: 'problem-cwt-scale-tau',
    kind: 'problem',
    title: 'Build and interpret a CWT scalogram',
    description:
      'Form daughters ψ_{s,τ}, map s↔ω, scan τ then s, and explain why staged multi-tones light up more small-s bands later in τ.',
    sample: 'cwt-scale-tau',
    href: '/fundamentals/math-and-science/computational-physics/10-04-wavelet-transforms',
  },
  {
    id: 'problem-dwt-pyramid-daub4',
    kind: 'problem',
    title: 'Run a Daub4 pyramid DWT',
    description:
      'State dyadic (s,τ), build L/H from Daub4 taps, ↓2 recurse on smooth coeffs, and invert with transpose filters.',
    sample: 'dwt-pyramid-daub4',
    href: '/fundamentals/math-and-science/computational-physics/10-05-discrete-wavelet-transforms',
  },
  {
    id: 'problem-pca-variance-covariance',
    kind: 'problem',
    title: 'Center features and form covariances for PCA',
    description:
      'Compute means, sample variances, and C=XXᵀ/(N−1); eigendecompose for PCs and project with a feature matrix.',
    sample: 'pca-variance-covariance',
    href: '/fundamentals/math-and-science/computational-physics/10-06-principal-components',
  },
  {
    id: 'problem-cwt-dwt-code-sketches',
    kind: 'problem',
    title: 'Wire Morlet CWT and Daub4 pyramid sketches',
    description:
      'Outline a local CWT (s,τ) grid and a Daub4 chirp pyramid, then state how to round-trip-check without textbook VPython listings.',
    sample: 'cwt-dwt-code-sketches',
    href: '/fundamentals/math-and-science/computational-physics/10-07-wavelet-code-sketches',
  },
  {
    id: 'problem-nn-bio-artificial',
    kind: 'problem',
    title: 'Relate biological spikes to artificial nodes',
    description:
      'Contrast dendritic integration / action potentials with weighted-sum + activation neurons, and state what “learning” changes.',
    sample: 'nn-bio-artificial',
    href: '/fundamentals/math-and-science/computational-physics/11-01-neural-networks-intro',
  },
  {
    id: 'problem-nn-forward-sigmoid',
    kind: 'problem',
    title: 'Compute a shallow-net forward pass',
    description:
      'Form Σ=w·x+b, apply logistic/tanh/ReLU, and evaluate a small 2–2–1 network by hand.',
    sample: 'nn-forward-sigmoid',
    href: '/fundamentals/math-and-science/computational-physics/11-02-simple-neural-network',
  },
  {
    id: 'problem-nn-loss-backprop',
    kind: 'problem',
    title: 'Lower Loss with backprop and SGD',
    description:
      'Write MSE Loss, differentiate a logistic net with the chain rule, and take a learning-rate step on one weight.',
    sample: 'nn-loss-backprop',
    href: '/fundamentals/math-and-science/computational-physics/11-03-training-backprop',
  },
  {
    id: 'problem-nn-graphical-deep',
    kind: 'problem',
    title: 'Explain a hierarchical line-classifier net',
    description:
      'Describe how successive hidden layers turn pixels into pairs and line classes, including inactivity at zero and ReLU gating.',
    sample: 'nn-graphical-deep',
    href: '/fundamentals/math-and-science/computational-physics/11-04-graphical-deep-net',
  },
  {
    id: 'problem-nn-tf-tensors',
    kind: 'problem',
    title: 'Use tensor rank/shape and A=Z+N',
    description:
      'State rank vs shape, reshape a feature column for sklearn, and compute mass number from Z and N.',
    sample: 'nn-tf-tensors',
    href: '/fundamentals/math-and-science/computational-physics/11-05-ml-software-part2',
  },
  {
    id: 'problem-nn-tf-physics-examples',
    kind: 'problem',
    title: 'Run nuclear / Hubble checks for ML stacks',
    description:
      'Compute mass excess, mirror GradientTape on a linear residual, and state how MSE SGD fits Hubble or poly B/A data.',
    sample: 'nn-tf-physics-examples',
    href: '/fundamentals/math-and-science/computational-physics/11-06-tensorflow-sklearn-examples',
  },
  {
    id: 'problem-nn-kmeans-clustering',
    kind: 'problem',
    title: 'Cluster particle masses with k-means',
    description:
      'Distinguish supervised vs unsupervised learning, run assign/update steps for k=3 on masses, and state why scaling helps linear classifiers.',
    sample: 'nn-kmeans-clustering',
    href: '/fundamentals/math-and-science/computational-physics/11-07-ml-clustering',
  },
  {
    id: 'problem-nn-keras-dense',
    kind: 'problem',
    title: 'Build a Keras Dense linear fit',
    description:
      'Explain Dense(units=1), compile/fit, and recover y=wx+b for a Hubble-style regression.',
    sample: 'nn-keras-dense',
    href: '/fundamentals/math-and-science/computational-physics/11-08-keras-deep-learning',
  },
  {
    id: 'problem-nn-opencv-rgb',
    kind: 'problem',
    title: 'Use RGB histograms and frame differences',
    description:
      'State 256³ color capacity, build tone histograms for ripeness, and describe background subtraction on video.',
    sample: 'nn-opencv-rgb',
    href: '/fundamentals/math-and-science/computational-physics/11-09-opencv-image-processing',
  },
  {
    id: 'problem-nn-explore-repos',
    kind: 'problem',
    title: 'Plan a baseline on a public ML dataset',
    description:
      'Pick a physics/ML repository dataset and outline features, supervised vs not, a simple baseline, and a hold-out metric.',
    sample: 'nn-explore-repos',
    href: '/fundamentals/math-and-science/computational-physics/11-10-explore-ml-repositories',
  },
  {
    id: 'problem-qc-dirac-ket',
    kind: 'problem',
    title: 'Use Dirac notation for qubits',
    description:
      'Relate kets, bras, brackets, and outer products; identify |0⟩/|1⟩ with spin-½ basis vectors.',
    sample: 'qc-dirac-ket',
    href: '/fundamentals/math-and-science/computational-physics/12-01-dirac-notation',
  },
  {
    id: 'problem-qc-qubit-bloch',
    kind: 'problem',
    title: 'Normalize a qubit and form tensor products',
    description:
      'Enforce |u|²+|v|²=1, read Bloch amplitudes, and Kronecker-multiply two qubits into ℂ⁴.',
    sample: 'qc-qubit-bloch',
    href: '/fundamentals/math-and-science/computational-physics/12-02-qubits',
  },
  {
    id: 'problem-qc-entanglement-bell',
    kind: 'problem',
    title: 'Detect entanglement and build Pauli tensors',
    description:
      'Apply wz=xy, recognize Bell states, and evaluate entries of dipole H ∝ XX+YY+ZZ−3ZZ.',
    sample: 'qc-entanglement-bell',
    href: '/fundamentals/math-and-science/computational-physics/12-03-entanglement',
  },
  {
    id: 'problem-qc-logic-gates',
    kind: 'problem',
    title: 'Wire classical gates and quantum Bell circuit',
    description:
      'Truth-table XOR/AND half-adder; map X/H/CNOT/CZ/Toffoli; H then CNOT builds |β₀₀⟩.',
    sample: 'qc-logic-gates',
    href: '/fundamentals/math-and-science/computational-physics/12-04-logic-gates',
  },
  {
    id: 'problem-qc-cirq-circuits',
    kind: 'problem',
    title: 'Simulate Cirq-style circuits and half-adders',
    description:
      'H²=I, X then H → |−⟩, SWAP/CNOT bit flips, Toffoli carry + CNOT sum.',
    sample: 'qc-cirq-circuits',
    href: '/fundamentals/math-and-science/computational-physics/12-05-qc-programming',
  },
  {
    id: 'problem-qc-qiskit-bell',
    kind: 'problem',
    title: 'Qiskit Bell, IBM endianness, transpile',
    description:
      'H→CX Bell amps, |wz−xy|, rightmost = q0, simulator vs noisy hardware.',
    sample: 'qc-qiskit-bell',
    href: '/fundamentals/math-and-science/computational-physics/12-07-qiskit',
  },
  {
    id: 'problem-qc-qft',
    kind: 'problem',
    title: 'Build and read QFT₄',
    description:
      'Z₄=-i, matrix prefactor 1/2, Qiskit |2⟩=|10⟩, H/P/SWAP circuit.',
    sample: 'qc-qft',
    href: '/fundamentals/math-and-science/computational-physics/12-08-qft',
  },
  {
    id: 'problem-qc-grover',
    kind: 'problem',
    title: 'Amplify a marked state with Grover',
    description:
      'n=log₂N qubits, oracle phase flip, diffuser, ~π√N/4 rounds; decode table value.',
    sample: 'qc-grover',
    href: '/fundamentals/math-and-science/computational-physics/12-09-grover',
  },
  {
    id: 'problem-qc-shor',
    kind: 'problem',
    title: 'Factor via period finding (Shor outline)',
    description:
      'gcd, phase→T, gcd(r^{T/2}±1,N); toy N=15 → 3×5.',
    sample: 'qc-shor',
    href: '/fundamentals/math-and-science/computational-physics/12-10-shor',
  },
  {
    id: 'problem-qc-code-sketches',
    kind: 'problem',
    title: 'Wire Chapter 12 notebook sketches',
    description:
      'Map dipole eig, QFT₄, Grover √N vs √n trap, Shor Fraction/gcd — without pasting book listings.',
    sample: 'qc-code-sketches',
    href: '/fundamentals/math-and-science/computational-physics/12-11-qc-code-sketches',
  },
  {
    id: 'problem-concavity-inflection',
    kind: 'problem',
    title: 'Concavity and inflection from y″',
    description:
      'Factor or sign-chart y″; list up/down intervals; keep only roots where y″ changes sign (reject x⁴-type false candidates).',
    sample: 'inflection-points',
    href: '/fundamentals/math-and-science/calculus/15b-curve-sketching-practice',
  },
  {
    id: 'problem-oblique-asymptote-sketch',
    kind: 'problem',
    title: 'Rational sketch with oblique asymptote',
    description:
      'Polynomial division → y=mx+b+r(x); vertical poles; classify critical numbers; confirm remainder→0 at infinity.',
    sample: 'asymptotes',
    href: '/fundamentals/math-and-science/calculus/15b-curve-sketching-practice',
  },
  {
    id: 'problem-deg-rad-convert',
    kind: 'problem',
    title: 'Convert degrees ↔ radians',
    description:
      'Scale by π/180 or 180/π; reduce angles into $[0,2π)$ by adding/subtracting full turns.',
    sample: 'radians-arc-length',
    href: '/fundamentals/math-and-science/calculus/16b-trigonometry-practice',
  },
  {
    id: 'problem-polar-rect',
    kind: 'problem',
    title: 'Polar ↔ rectangular coordinates',
    description:
      'Use $x=r\\cos\\theta$, $y=r\\sin\\theta$ and $r=\\sqrt{x^{2}+y^{2}}$ with quadrant-correct $\\theta$.',
    sample: 'prove-polar-rect',
    href: '/fundamentals/math-and-science/calculus/16b-trigonometry-practice',
  },
  {
    id: 'problem-trig-key-limits',
    kind: 'problem',
    title: 'Apply lim (sin θ)/θ',
    description:
      'Recognize forms that rewrite to $\\sin\\theta/\\theta$ or $(1-\\cos\\theta)/\\theta$; keep angles in radians.',
    sample: 'prove-lim-sin-theta',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-amp-period-wave',
    kind: 'problem',
    title: 'Read amplitude / period / frequency',
    description:
      'From $y=A\\sin(bx)$ or $A\\cos(bx)$, extract $|A|$, $p=2\\pi/b$, and $f=b$; sketch one period.',
    sample: 'trig-amp-period',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-angle-between-curves',
    kind: 'problem',
    title: 'Angle between curves at an intersection',
    description:
      'Find $P$, slopes $m_1,m_2$, then $\\tan\\phi=|(m_2-m_1)/(1+m_1 m_2)|$ (or conclude perpendicular).',
    sample: 'angle-between-curves',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-dx-sin-proof',
    kind: 'problem',
    title: 'Prove Dₓ(sin x) = cos x',
    description:
      'Difference quotient → addition formula → apply lim (sin Δx)/Δx = 1 and lim (cos Δx−1)/Δx = 0.',
    sample: 'prove-dx-sin',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-dx-tan-sec',
    kind: 'problem',
    title: 'Prove tan′ and sec′ formulas',
    description:
      'Quotient rule on sin/cos for sec²; reciprocal/chain on 1/cos for tan·sec (or differentiate tan²+1=sec²).',
    sample: 'prove-dx-tan-sec',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-trig-limits-rewrite',
    kind: 'problem',
    title: 'Rewrite trig limits via sin u / u',
    description:
      'Factor constants so each factor is (sin u)/u or u/(sin u); also (tan x)/x = (sin x)/x · sec x.',
    sample: 'lim-sin-theta',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-trig-related-rates',
    kind: 'problem',
    title: 'Related rates with cot / csc',
    description:
      'Relate geometry (x = h cot θ), differentiate in t, plug special angles (csc 30°=2).',
    sample: 'trig-related-rates',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-sketch-sin-plus-cos',
    kind: 'problem',
    title: 'Sketch sin x + cos x',
    description:
      'Crits where tan x = 1; classify with f″=−(sin+cos); inflections where tan x = −1.',
    sample: 'sketch-sin-plus-cos',
    href: '/fundamentals/math-and-science/calculus/17b-trig-diff-practice',
  },
  {
    id: 'problem-arcsin-eval',
    kind: 'problem',
    title: 'Evaluate arcsin / arccos / arctan',
    description:
      'Match special values to the correct range; use oddness for negatives.',
    sample: 'arcsin-definition',
    href: '/fundamentals/math-and-science/calculus/inverse-trig-functions',
  },
  {
    id: 'problem-dx-arcsin',
    kind: 'problem',
    title: 'Derive (arcsin)′',
    description:
      'Implicit differentiation of sin y = x; pick +√(1−x²) on [−π/2, π/2].',
    sample: 'derive-arcsin',
    href: '/fundamentals/math-and-science/calculus/inverse-trig-functions',
  },
  {
    id: 'problem-dx-arcsec',
    kind: 'problem',
    title: 'Prove (sec⁻¹)′',
    description:
      'From sec y = x get tan y sec y · y′ = 1; tan y = +√(x²−1) on the chosen range.',
    sample: 'prove-dx-arcsec',
    href: '/fundamentals/math-and-science/calculus/18b-inverse-trig-practice',
  },
  {
    id: 'problem-arcsin-plus-arccos',
    kind: 'problem',
    title: 'arcsin + arccos = π/2',
    description:
      'Show the derivative is 0, then evaluate at x=0 to name the constant.',
    sample: 'prove-arcsin-arccos',
    href: '/fundamentals/math-and-science/calculus/18b-inverse-trig-practice',
  },
  {
    id: 'problem-mural-viewing',
    kind: 'problem',
    title: 'Maximize mural viewing angle',
    description:
      'θ = arctan(12x/(x²+108)); critical point x=6√3 ≈ 10.4 ft.',
    sample: 'mural-viewing-angle',
    href: '/fundamentals/math-and-science/calculus/18b-inverse-trig-practice',
  },
  {
    id: 'problem-arctan-plus-arccot',
    kind: 'problem',
    title: 'arctan + arccot = π/2',
    description: 'Derivative vanishes; evaluate at 0.',
    sample: 'prove-arctan-arccot',
    href: '/fundamentals/math-and-science/calculus/18b-inverse-trig-practice',
  },
  {
    id: 'problem-light-illumination',
    kind: 'problem',
    title: 'Maximize edge illumination',
    description:
      'I = kx/(x²+R²)^{3/2} over a circular plot; critical height R/√2.',
    sample: 'light-illumination-max',
    href: '/fundamentals/math-and-science/calculus/18b-inverse-trig-practice',
  },
  {
    id: 'problem-rectilinear-va',
    kind: 'problem',
    title: 'Find v and a from s(t)',
    description:
      'Differentiate position for velocity; differentiate again for acceleration; interpret signs and turns.',
    sample: 'rectilinear-velocity',
    href: '/fundamentals/math-and-science/calculus/rectilinear-circular-motion',
  },
  {
    id: 'problem-free-fall',
    kind: 'problem',
    title: 'Free-fall with s₀ and v₀',
    description:
      'Use v = v₀−32t and s = s₀+v₀t−16t² (upward +) to find height, time of peak, or impact.',
    sample: 'free-fall-peak-impact',
    href: '/fundamentals/math-and-science/calculus/19b-motion-practice',
  },
  {
    id: 'problem-total-distance-motion',
    kind: 'problem',
    title: 'Total distance with direction changes',
    description:
      'Find times where v=0 and s has an extremum; sum |Δs| between consecutive checkpoints.',
    sample: 'analyze-rectilinear-s',
    href: '/fundamentals/math-and-science/calculus/19b-motion-practice',
  },
  {
    id: 'problem-speed-vs-velocity',
    kind: 'problem',
    title: 'When speed increases',
    description:
      'Compare signs of v and a: same sign ⇒ speeding up; opposite ⇒ slowing down. Prove via S=|v|.',
    sample: 'prove-speed-signs',
    href: '/fundamentals/math-and-science/calculus/19b-motion-practice',
  },
  {
    id: 'problem-sliding-ladder',
    kind: 'problem',
    title: 'Sliding ladder related rates',
    description:
      'From x²+y²=L² get x x′+y y′=0; solve for y′ at a given x and x′.',
    sample: 'sliding-ladder',
    href: '/fundamentals/math-and-science/calculus/related-rates',
  },
  {
    id: 'problem-sphere-surface-rate',
    kind: 'problem',
    title: 'Sphere volume → surface rate',
    description:
      'From dV/dt get dr/dt, then dS/dt = 8πr dr/dt (or −4/r when dV/dt=−2).',
    sample: 'sphere-related-rates',
    href: '/fundamentals/math-and-science/calculus/20b-related-rates-practice',
  },
  {
    id: 'problem-cone-funnel',
    kind: 'problem',
    title: 'Conical funnel / sand pile',
    description:
      'Similar triangles → V(h) or V(r); differentiate; plug the instant.',
    sample: 'cone-funnel-rates',
    href: '/fundamentals/math-and-science/calculus/20b-related-rates-practice',
  },
  {
    id: 'problem-ships-distance',
    kind: 'problem',
    title: 'Two ships distance rate',
    description:
      'Write D² from coordinates; D′ = (…)/D; sign tells approaching vs separating.',
    sample: 'ships-distance-rates',
    href: '/fundamentals/math-and-science/calculus/20b-related-rates-practice',
  },
  {
    id: 'problem-linear-approx-sqrt',
    kind: 'problem',
    title: 'Linear approximation (square root)',
    description:
      'Pick nearby easy x and Δx; use f(x+Δx)≈f(x)+f′(x)Δx for f=√x.',
    sample: 'linear-approx-differential',
    href: '/fundamentals/math-and-science/calculus/differentials-newtons-method',
  },
  {
    id: 'problem-differential-rules',
    kind: 'problem',
    title: 'Differential df and algebra',
    description:
      'Identify df=f′Δx, dx=Δx, and product/quotient differential rules.',
    sample: 'differential-rules',
    href: '/fundamentals/math-and-science/calculus/differentials-newtons-method',
  },
  {
    id: 'problem-newton-sqrt3',
    kind: 'problem',
    title: "Newton's method for √3",
    description:
      'From f(x)=x²−3 get xₙ₊₁=(xₙ²+3)/(2xₙ); iterate from a seed.',
    sample: 'newton-sqrt3',
    href: '/fundamentals/math-and-science/calculus/differentials-newtons-method',
  },
  {
    id: 'problem-approx-cbrt-sin',
    kind: 'problem',
    title: 'Linear approx — cube root & sine',
    description:
      'Nearby easy base + Δx; keep trig Δx in radians (π/180 per degree).',
    sample: 'approx-cbrt-sin',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-cube-volume-pct',
    kind: 'problem',
    title: 'Percent change via differentials',
    description:
      'For V=x³ and Δx=0.01x, ΔV≈0.03x³ (about 3%).',
    sample: 'cube-volume-differential',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-compute-dy',
    kind: 'problem',
    title: 'Compute the differential dy',
    description:
      'Chain / quotient / trig: write dy = (…) dx.',
    sample: 'compute-dy',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-dydx-differentials',
    kind: 'problem',
    title: 'dy/dx from differentials',
    description:
      'd(both sides); collect dy and dx; form the ratio.',
    sample: 'dydx-from-differentials',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-newton-poly-trig',
    kind: 'problem',
    title: 'Newton on polynomial / trig equations',
    description:
      'Sketch for a seed; iterate; use even/odd symmetry when present.',
    sample: 'newton-poly-trig',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-error-differentials',
    kind: 'problem',
    title: 'Error estimates via differentials',
    description:
      'Propagate Δx through f′(x)Δx: areas, volumes, pV, inverse-square, etc.',
    sample: 'error-differentials',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-newton-failures',
    kind: 'problem',
    title: "When Newton's method fails",
    description:
      'f′(xₙ)=0, vertical tangents, or iterates that leave the basin (e.g. x↦−2x for x^{1/3}).',
    sample: 'newton-failures',
    href: '/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice',
  },
  {
    id: 'problem-export-import-risk-map',
    kind: 'problem',
    title: 'Export–import risk map',
    description:
      'Match transport, non-payment, quality, and documentary failures to the right control.',
    sample: 'export-import-risk-map',
    href: '/fundamentals/international-business/export-import/introduction-to-export-import',
  },
  {
    id: 'problem-export-risk-controls',
    kind: 'problem',
    title: 'Match export risk to a control',
    description:
      'Culture/spec ambiguity, quality before payment, and transit loss each need a different instrument.',
    sample: 'export-risk-controls',
    href: '/fundamentals/international-business/export-import/introduction-to-export-import',
  },
  {
    id: 'problem-trade-institutions',
    kind: 'problem',
    title: 'Trade institutions at a glance',
    description:
      'ICC (UCP/Incoterms), UNCITRAL (CISG), WTO (government rules) — who owns which layer.',
    sample: 'trade-institutions',
    href: '/fundamentals/international-business/export-import/introduction-to-export-import',
  },
];
