---
sidebar_position: 1
title: Math and Science
---

# Math and Science

The quantitative bedrock underneath everything else in this library — the math and physics that algorithms, graphics, physics engines, and electronics all quietly assume you already have. This section builds that foundation up from first principles, with interactive visualizers wherever intuition is easier to build by manipulating something than by reading about it.

## Calculus

Single-variable tools that show up everywhere: extrema, Rolle, the Mean Value Theorem (Law of the Mean), and reading increasing/decreasing behavior from $f'$.

- [13. Law of the Mean · Increasing and Decreasing](/fundamentals/math-and-science/calculus/law-of-the-mean) — relative extrema, Rolle, MVT geometry, monotone from $f'$, with explorers and drills.
- [13b. Law of the Mean — Practice](/fundamentals/math-and-science/calculus/13b-law-of-the-mean-practice) — EquationWorksheet drills + guided proofs (Rolle, MVT, monotone, extended mean).
- [14. Maximum and Minimum Values](/fundamentals/math-and-science/calculus/maximum-minimum-values) — critical numbers, first/second derivative tests, absolute extrema on $[a,b]$.
- [14b. Max/Min — Practice](/fundamentals/math-and-science/calculus/14b-maximum-minimum-practice) — EquationWorksheet drills + guided proofs (domain extrema, tests, applied optimization).
- [15. Curve Sketching · Concavity · Symmetry](/fundamentals/math-and-science/calculus/curve-sketching) — $f''$ cup/cap, inflection, asymptotes, even/odd, sketching checklist.
- [15b. Curve Sketching — Practice](/fundamentals/math-and-science/calculus/15b-curve-sketching-practice) — concavity/inflection drills, tangents, cubic & rational sketches.
- [16. Review of Trigonometry](/fundamentals/math-and-science/calculus/review-of-trigonometry) — radians, unit-circle sine/cosine, addition formulas, double/half-angle, triangle laws.
- [16b. Trig Review — Practice](/fundamentals/math-and-science/calculus/16b-trigonometry-practice) — convert, arc length, evaluate, polar, proofs of addition / triangle laws.
- [17. Differentiation of Trig Functions](/fundamentals/math-and-science/calculus/diff-trig-functions) — $(\sin x)'=\cos x$, chain rule, amplitude/period, related-rate angles.
- [17b. Trig Derivatives — Practice](/fundamentals/math-and-science/calculus/17b-trig-diff-practice) — differentiate, evaluate, applications.
- [18. Inverse Trig Functions](/fundamentals/math-and-science/calculus/inverse-trig-functions) — ranges, derivatives, algebraic identities.
- [18b. Inverse Trig — Practice](/fundamentals/math-and-science/calculus/18b-inverse-trig-practice) — evaluate and differentiate arcsin/arccos/arctan.
- [19. Rectilinear & Circular Motion](/fundamentals/math-and-science/calculus/rectilinear-circular-motion) — $v=ds/dt$, $a=dv/dt$, free fall, circular $\omega$.
- [19b. Motion — Practice](/fundamentals/math-and-science/calculus/19b-motion-practice) — path analysis, total distance, free-fall drills.
- [20. Related Rates](/fundamentals/math-and-science/calculus/related-rates) — link rates via geometry; sliding ladder.
- [20b. Related Rates — Practice](/fundamentals/math-and-science/calculus/20b-related-rates-practice) — balloons, funnels, ships, shadows, troughs.
- [21. Differentials · Newton's Method](/fundamentals/math-and-science/calculus/differentials-newtons-method) — linear approx, $df$, Newton root finding.
- [21b. Differentials · Newton — Practice](/fundamentals/math-and-science/calculus/21b-differentials-newtons-practice) — cube roots, $dy$, implicit $dy/dx$, Newton.

## Computational Physics

Numerical experiments: what a computer can actually compute, and how truncation, round-off, and uncontrolled events pollute the printout.

- [3.1 Errors](/fundamentals/math-and-science/computational-physics/03-01-errors) — random, approximation, and round-off error; how floats store a mantissa and an exponent.
- [3.2 Experimental error investigation](/fundamentals/math-and-science/computational-physics/03-02-experimental-error) — approximation vs round-off vs $N$, the best step count, and the $A(N)$ vs $A(2N)$ diagnostic.
- [3.3 Errors with power series](/fundamentals/math-and-science/computational-physics/03-03-power-series) — sine by recurrence; stop when $|t_n/S_n|$ is small.
- [3.3b Series labs](/fundamentals/math-and-science/computational-physics/03-03b-series-labs) — implement, assess, reduce mod $2\pi$, and compare a bad factorial version.
- [3.4 Specular reflection and Bessel theory](/fundamentals/math-and-science/computational-physics/03-04-specular-bessel-theory) — correlated $e^{-x}$ error, closed specular orbits, Miller downward $j_\ell$.
- [3.4b Specular and Bessel labs](/fundamentals/math-and-science/computational-physics/03-04b-specular-bessel-labs) — ray paths with four-digit rounding; up vs down Bessel recursion.
- [4.1 Monte Carlo — random numbers](/fundamentals/math-and-science/computational-physics/04-01-monte-carlo-random) — LCG, random walks, brain obstacles, HP folding.
- [4.1b Monte Carlo labs](/fundamentals/math-and-science/computational-physics/04-01b-monte-carlo-labs) — period, $\langle R^{2}\\rangle$, cross terms, obstructed $R_{\mathrm{rms}}$, HP energy.
- [4.2 Spontaneous decay](/fundamentals/math-and-science/computational-physics/04-02-spontaneous-decay) — stochastic vs exponential $N(t)$; Geiger-like finite-$N$ bumps.
- [4.2b Decay labs](/fundamentals/math-and-science/computational-physics/04-02b-decay-labs) — trajectory, $\ln N$ slope vs $\lambda$, exponential vs power law.
- [4.3 Testing random distributions](/fundamentals/math-and-science/computational-physics/04-03-random-tests) — look / scatter / moments / $C(k)$ checks for a uniform RNG.
- [4.3b RNG test labs](/fundamentals/math-and-science/computational-physics/04-03b-random-test-labs) — $\sqrt{N}$ moment errors and lag-product $C(k)$.
- [5.1 Differentiation algorithms](/fundamentals/math-and-science/computational-physics/05-01-differentiation) — forward vs central differences; $O(h)$ vs $O(h^{2})$.
- [5.1b Differentiation labs](/fundamentals/math-and-science/computational-physics/05-01b-differentiation-labs) — implement both stencils; error on $\sin t$.
- [5.2 Extrapolated difference](/fundamentals/math-and-science/computational-physics/05-02-extrapolated-diff) — Richardson $D_{\mathrm{ed}}$, second derivatives, truncation vs round-off.
- [5.2b Extrapolated-difference labs](/fundamentals/math-and-science/computational-physics/05-02b-extrapolated-diff-labs) — FD/CD/ED errors; $y''$ stencils; $\log|\mathcal{E}|$ vs $\log h$.
- [5.3 Integration algorithms](/fundamentals/math-and-science/computational-physics/05-03-integration) — spectrum $N(1)$; Riemann / trap / Simpson; Romberg; $\sum w_i=b-a$.
- [5.3b Integration labs](/fundamentals/math-and-science/computational-physics/05-03b-integration-labs) — left/midpoint, trap/Simpson, Romberg, weight audit.
- [5.4 Gaussian quadrature](/fundamentals/math-and-science/computational-physics/05-04-gaussian-quadrature) — $W(x)g(x)$; Legendre nodes; mappings; degree $2N-1$ exactness.
- [5.4b Gaussian quadrature labs](/fundamentals/math-and-science/computational-physics/05-04b-gaussian-quadrature-labs) — four-point table, affine map, $\int e^{-x}$, half-line map.
- [5.5 Monte Carlo integration](/fundamentals/math-and-science/computational-physics/05-05-monte-carlo-integration) — stone throwing, $\pi$, log–log error vs trap/Simpson/Gauss.
- [5.5b Monte Carlo integration labs](/fundamentals/math-and-science/computational-physics/05-05b-monte-carlo-integration-labs) — LCG $\pi$ estimates; mean-value $\int e^{-x}$.
- [5.6 Mean-value theorem and high-D Monte Carlo](/fundamentals/math-and-science/computational-physics/05-06-mean-value-nd) — $I=(b-a)\langle f\rangle$; $\sigma_I\sim\sigma_f/\sqrt{N}$; 10D check.
- [5.6b Mean-value and high-D labs](/fundamentals/math-and-science/computational-physics/05-06b-mean-value-nd-labs) — 1D mean value; 10D single trial and 16-seed average.
- [5.7 Monte Carlo variance reduction](/fundamentals/math-and-science/computational-physics/05-07-mc-variance-reduction) — peaked $f$; control variates $\int(f-g)+J$.
- [5.7b Variance-reduction labs](/fundamentals/math-and-science/computational-physics/05-07b-mc-variance-reduction-labs) — plain vs CV for $e^{-x}$ with $g=1-x$.
- [5.8 Importance sampling](/fundamentals/math-and-science/computational-physics/05-08-importance-sampling) — $\langle f/w\rangle$; von Neumann rejection; Fig. 5.7.
- [5.8b Importance-sampling labs](/fundamentals/math-and-science/computational-physics/05-08b-importance-sampling-labs) — rejection counts; inverse-CDF importance.
- [5.9 Integration reference sketches](/fundamentals/math-and-science/computational-physics/05-09-integration-reference-sketches) — original trap / Gauss-map / rejection stubs.
- [6.1 Quantum bound states](/fundamentals/math-and-science/computational-physics/06-01-quantum-bound-states) — square-well matching; $g(E)=0$; trial-and-error search preview.
- [6.2 Bisection search](/fundamentals/math-and-science/computational-physics/06-02-bisection-search) — interval halving; linear convergence; Fig. 6.1.
- [6.2b Bisection labs](/fundamentals/math-and-science/computational-physics/06-02b-bisection-labs) — cubic root; $g(8),g(8.8)$; $E_B$; $V_0=20$.
- [6.3 Newton–Raphson search](/fundamentals/math-and-science/computational-physics/06-03-newton-raphson) — tangent update; forward-difference $f'$; backtracking; Figs. 6.2–6.3.
- [6.3b Newton–Raphson labs](/fundamentals/math-and-science/computational-physics/06-03b-newton-raphson-labs) — cubic / well roots; vs bisection iters; $V_0=20$; backtrack.
- [6.4 Magnetization search](/fundamentals/math-and-science/computational-physics/06-04-magnetization-search) — mean-field $m=\tanh(m/t)$; search $f(m,t)=0$; Fig. 6.4.
- [6.4b Magnetization labs](/fundamentals/math-and-science/computational-physics/06-04b-magnetization-labs) — bisect/Newton at $t=0.5$; $m(t)$ grid through $T_c$.
- [6.5 Lagrange interpolation](/fundamentals/math-and-science/computational-physics/06-01-lagrange-interpolation) — local polynomials through tabulated points (book §6.5).
- [7.3 Matrices in Python](/fundamentals/math-and-science/computational-physics/07-01-matrices-in-python) — lists vs NumPy; `*` vs `dot`; `linalg.solve` / `eig`.
- [7.3b Matrices in Python labs](/fundamentals/math-and-science/computational-physics/07-01b-matrices-in-python-labs) — elementwise add; matmul; elementwise `*`; Gaussian solve.
- [7.4 Tests before use](/fundamentals/math-and-science/computational-physics/07-02-tests-before-use) — $AA^{-1}\!\approx\!I$; solve checks; eigen residuals; Hilbert caution.
- [7.4b Tests-before-use labs](/fundamentals/math-and-science/computational-physics/07-02b-tests-before-use-labs) — Gauss–Jordan inverse; residuals; two rhs; eigenpair; Hilbert $N=5$.
- [7.5 Two masses on a string](/fundamentals/math-and-science/computational-physics/07-03-string-problem) — nonlinear statics; $\cos=\pm\sqrt{1-\sin^{2}}$; 2D Newton toy.
- [7.5b String-problem labs](/fundamentals/math-and-science/computational-physics/07-03b-string-problem-labs) — $\pm\sqrt{1-s^{2}}$; Newton on circle $\cap$ line.
- [7.6 Spin states and hyperfine](/fundamentals/math-and-science/computational-physics/07-04-hyperfine) — Pauli product $V$; triplet $+W$, singlet $-3W$; $\Delta E=4W$.
- [7.6b Hyperfine labs](/fundamentals/math-and-science/computational-physics/07-04b-hyperfine-labs) — build $V$; middle eigs; full spectrum; splitting factor.
- [7.7 Speeding up matrix computing](/fundamentals/math-and-science/computational-physics/07-05-matrix-speed) — timing; stride; matmul nestings; FD/CD on arrays.
- [7.7b Matrix-speed labs](/fundamentals/math-and-science/computational-physics/07-05b-matrix-speed-labs) — map / SAXPY; row vs col; SOS nestings; both matmuls; FD/CD.
- [7.8 Code-listing sketches](/fundamentals/math-and-science/computational-physics/07-06-code-listing-sketches) — original Newton-ND / hyperfine sketches (no textbook dumps).
- [8.1 Nonlinear oscillators](/fundamentals/math-and-science/computational-physics/08-01-nonlinear-oscillators) — soft α and $|x|^p$ forces; bound vs unbound.
- [8.2–8.3 ODE review and dynamic form](/fundamentals/math-and-science/computational-physics/08-02-ode-form-and-review) — order, linear vs nonlinear, $y=(x,v)$.
- [8.4 ODE algorithms](/fundamentals/math-and-science/computational-physics/08-03-ode-algorithms) — Euler, RK2 midpoint, RK4 structure; fixed $h$.
- [8.4b ODE algorithm labs](/fundamentals/math-and-science/computational-physics/08-03b-ode-algorithms-labs) — locked Euler/RK2/RK4 steps; energy digits.
- [8.5 Nonlinear oscillation solutions](/fundamentals/math-and-science/computational-physics/08-04-nonlinear-oscillation-solutions) — same steppers, new $F(x)$; period vs amplitude.
- [8.5b Nonlinear oscillation labs](/fundamentals/math-and-science/computational-physics/08-04b-nonlinear-oscillation-labs) — RK2 on $F=-x^{3}$; energy place-markers.
- [8.6 Friction, resonances, and beats](/fundamentals/math-and-science/computational-physics/08-05-friction-resonance) — $b$ vs $2m\omega_0$; beat frequency.
- [8.6b Friction and resonance labs](/fundamentals/math-and-science/computational-physics/08-05b-friction-resonance-labs) — critical $b$; $|\omega-\omega_0|/(2\pi)$.
- [8.7 ODE solver sketches](/fundamentals/math-and-science/computational-physics/08-06-ode-sketches) — original RK2/RK4/RK45/ABM structure (no VPython dumps).
- [9.1 Fourier series](/fundamentals/math-and-science/computational-physics/09-01-fourier-series) — period $T$, $(a_n,b_n)$, sawtooth / half-wave; Gibbs.
- [9.1b Fourier series labs](/fundamentals/math-and-science/computational-physics/09-01b-fourier-series-labs) — locked $b_n$, partial sums, half-wave $a_2$, power.
- [9.2 Fourier transforms](/fundamentals/math-and-science/computational-physics/09-02-fourier-transforms) — continuous FT pair; power $|Y|^2$; δ consistency.
- [9.2b Fourier transform labs](/fundamentals/math-and-science/computational-physics/09-02b-fourier-transforms-labs) — $1/\sqrt{2\pi}$; $|Y|^2$; $2\pi$ prefactor.
- [9.3 Discrete Fourier transforms](/fundamentals/math-and-science/computational-physics/09-03-discrete-fourier-transforms) — DFT sum; Nyquist; aliasing; assessment menu.
- [9.3b DFT labs](/fundamentals/math-and-science/computational-physics/09-03b-dft-labs) — $\omega_1$, $s$, coarse samples, alias match, power ratios, one DFT bin.
- [9.4 Noise filtering](/fundamentals/math-and-science/computational-physics/09-04-noise-filtering) — correlation / autocorrelation → $|S|^2$.
- [9.4b Noise filtering labs](/fundamentals/math-and-science/computational-physics/09-04b-noise-filtering-labs) — $A(0)$; $\sqrt{2\pi}$; noisy sample; $|S|^2$ from $A$.
- [9.4.3–9.4.4 Filters and sinc](/fundamentals/math-and-science/computational-physics/09-05-filters-and-sinc) — convolution theorem; RC $H(\omega)$; windowed sinc + Hamming.
- [9.4c Filter & sinc labs](/fundamentals/math-and-science/computational-physics/09-05b-filters-sinc-labs) — $|H|$; taps; Hamming; sinc center.
- [9.5 Fast Fourier transform](/fundamentals/math-and-science/computational-physics/09-06-fft) — butterflies; bit reversal; $N\log N$.
- [9.5b FFT labs](/fundamentals/math-and-science/computational-physics/09-06b-fft-labs) — cost ratio; $Z$; butterfly; bit-rev order.
- [9.6 FFT implementation](/fundamentals/math-and-science/computational-physics/09-07-fft-implementation) — $N=2^n$; $y_m=m+mi$; bitrev + stages; assessment.
- [9.6b FFT implementation labs](/fundamentals/math-and-science/computational-physics/09-07b-fft-implementation-labs) — pad length; DC; physics $Y_0$; round-trip.
- [9.8 Fourier code sketches](/fundamentals/math-and-science/computational-physics/09-08-fourier-code-sketches) — original complex DFT / real Im / FFT± sketches (no VPython dumps).
- [10.1 Wavelet analysis](/fundamentals/math-and-science/computational-physics/10-01-wavelet-analysis) — nonstationary spectra; mother/daughter wavelets.
- [10.1b Wavelet intro labs](/fundamentals/math-and-science/computational-physics/10-01b-wavelet-intro-labs) — piecewise $y(t)$; Mexican hat at 0.
- [10.2 Wave packets and uncertainty](/fundamentals/math-and-science/computational-physics/10-02-wave-packets-uncertainty) — $\Delta t\Delta\omega\gtrsim 2\pi$.
- [10.2b Wave-packet labs](/fundamentals/math-and-science/computational-physics/10-02b-wave-packets-labs) — widths; FWHM; $C$.
- [10.3 Short-time Fourier](/fundamentals/math-and-science/computational-physics/10-03-short-time-fourier) — sliding window $Y(\omega,\tau)$.
- [10.3b STFT labs](/fundamentals/math-and-science/computational-physics/10-03b-stft-labs) — box window; gated samples.
- [10.4 Wavelet transforms](/fundamentals/math-and-science/computational-physics/10-04-wavelet-transforms) — $Y(s,\tau)$; $\omega=2\pi/s$; CWT scan / scalogram.
- [10.4b Wavelet transform labs](/fundamentals/math-and-science/computational-physics/10-04b-wavelet-transforms-labs) — scale map; mother/daughter; Haar.
- [10.5 Discrete wavelet transforms](/fundamentals/math-and-science/computational-physics/10-05-discrete-wavelet-transforms) — dyadic DWT; pyramid L/H; Daub4.
- [10.5b DWT labs](/fundamentals/math-and-science/computational-physics/10-05b-dwt-labs) — taps; $\sum c_i^2$; $H$ on ramp; stages.
- [10.6 Principal components analysis](/fundamentals/math-and-science/computational-physics/10-06-principal-components) — covariance matrix $C=XX^{T}/(N-1)$; eigen PCs; Smith demo.
- [10.6b PCA labs](/fundamentals/math-and-science/computational-physics/10-06b-pca-labs) — iris warmup; Smith 2D: $C$, $\lambda_1$, PC₁, project.
- [10.7 Wavelet code sketches](/fundamentals/math-and-science/computational-physics/10-07-wavelet-code-sketches) — original Morlet CWT / Daub4 pyramid sketches (no VPython dumps).
- [10.7b Wavelet code labs](/fundamentals/math-and-science/computational-physics/10-07b-wavelet-code-labs) — Morlet; geometric $s$; CWT point; chirp; Daub4 $L$; pyramid stages.
- [11.1 Neural networks intro](/fundamentals/math-and-science/computational-physics/11-01-neural-networks-intro) — bio neurons; Perceptron; AI/ML/deep learning.
- [11.1b NN intro labs](/fundamentals/math-and-science/computational-physics/11-01b-neural-networks-intro-labs) — $10^{11}$; threshold fire.
- [11.2 Simple neural network](/fundamentals/math-and-science/computational-physics/11-02-simple-neural-network) — weighted sum; sigmoid/tanh/ReLU; 2–2–1 forward.
- [11.2b Simple NN labs](/fundamentals/math-and-science/computational-physics/11-02b-simple-nn-labs) — $\Sigma=-4$; $y\approx 0.7216$.
- [11.3 Training and backpropagation](/fundamentals/math-and-science/computational-physics/11-03-training-backprop) — MSE Loss; chain rule; SGD; meson-track toy.
- [11.3b Training labs](/fundamentals/math-and-science/computational-physics/11-03b-training-labs) — MSE; forward; $f'$; $\partial\mathcal{L}/\partial w_1$; SGD step.
- [11.4 Graphical deep net](/fundamentals/math-and-science/computational-physics/11-04-graphical-deep-net) — hierarchical pixels→pairs→lines; ReLU.
- [11.4b Deep-net labs](/fundamentals/math-and-science/computational-physics/11-04b-graphical-deep-net-labs) — vertical probe; ReLU; two-bit scores.
- [11.5 ML software (Part II)](/fundamentals/math-and-science/computational-physics/11-05-ml-software-part2) — TensorFlow tensors; sklearn columns; install sketch.
- [11.5b ML software labs](/fundamentals/math-and-science/computational-physics/11-05b-ml-software-labs) — $A=Z+N$; rank/shape; column layout.
- [11.6 TF / sklearn examples](/fundamentals/math-and-science/computational-physics/11-06-tensorflow-sklearn-examples) — mass excess; GradientTape; Hubble MSE; poly features.
- [11.6b TF / sklearn labs](/fundamentals/math-and-science/computational-physics/11-06b-tf-sklearn-labs) — excess; $\partial\mathcal{L}/\partial x$; poly $A^{2}$; mean $B/A$.
- [11.7 ML clustering](/fundamentals/math-and-science/computational-physics/11-07-ml-clustering) — $k$-means; supervised perceptron/SGD; particle masses.
- [11.7b Clustering labs](/fundamentals/math-and-science/computational-physics/11-07b-ml-clustering-labs) — assign; update centroids; $z$-score; $\eta(t)$.
- [11.8 Keras](/fundamentals/math-and-science/computational-physics/11-08-keras-deep-learning) — Dense layers; Hubble `units=1` fit.
- [11.8b Keras labs](/fundamentals/math-and-science/computational-physics/11-08b-keras-labs) — $y=wx+b$; ReLU; param count.
- [11.9 OpenCV](/fundamentals/math-and-science/computational-physics/11-09-opencv-image-processing) — RGB histograms; background subtraction.
- [11.9b OpenCV labs](/fundamentals/math-and-science/computational-physics/11-09b-opencv-labs) — $256^3$; hist count; frame MAD / mask.
- [11.10 Explore ML data](/fundamentals/math-and-science/computational-physics/11-10-explore-ml-repositories) — public physics / Kaggle / CERN sets.
- [11.11 NN code sketches](/fundamentals/math-and-science/computational-physics/11-11-nn-code-sketches) — original neuron / net / k-means / Keras sketches.
- [11.11b Sketch labs](/fundamentals/math-and-science/computational-physics/11-11b-nn-code-labs) — sigmoid neuron; 2–2–1; feature row.
- [12.1 Dirac notation](/fundamentals/math-and-science/computational-physics/12-01-dirac-notation) — kets, bras, $|0\rangle/|1\rangle$.
- [12.1b Dirac labs](/fundamentals/math-and-science/computational-physics/12-01b-dirac-notation-labs) — $2^n$; projector; conjugate bracket.
- [12.2 Qubits](/fundamentals/math-and-science/computational-physics/12-02-qubits) — Bloch sphere; tensor products.
- [12.2b Qubit labs](/fundamentals/math-and-science/computational-physics/12-02b-qubits-labs) — norm; Bloch amps; Kronecker.
- [12.3 Entanglement](/fundamentals/math-and-science/computational-physics/12-03-entanglement) — Bell; $wz=xy$; Pauli; dipole $H$.
- [12.3b Entanglement labs](/fundamentals/math-and-science/computational-physics/12-03b-entanglement-labs) — separability measure; $H_{ij}$; $X|0\rangle$.
- [12.4 Logic gates](/fundamentals/math-and-science/computational-physics/12-04-logic-gates) — classical NodeLab; X/Y/Z/H; CNOT; Bell wire.
- [12.4b Gate labs](/fundamentals/math-and-science/computational-physics/12-04b-logic-gates-labs) — XOR/NOR; $H_{00}$; phase; CNOT/CZ/Toffoli indices.
- [12.5 Cirq circuits](/fundamentals/math-and-science/computational-physics/12-05-qc-programming) — H, measure, SWAP, CNOT, Toffoli; half/full adder.
- [12.5b Cirq labs](/fundamentals/math-and-science/computational-physics/12-05b-qc-programming-labs) — $H|0\rangle$; $H^2$; half-adder $1+1$.
- [12.6 IBM Quantum](/fundamentals/math-and-science/computational-physics/12-06-ibm-quantum) — account, Composer, endianness.
- [12.7 Qiskit](/fundamentals/math-and-science/computational-physics/12-07-qiskit) — Bell circuit; Aer vs hardware; token hygiene.
- [12.7b Qiskit labs](/fundamentals/math-and-science/computational-physics/12-07b-qiskit-labs) — Bell amp; IBM `01` → $q_0$; wire H→CX.
- [12.8 QFT](/fundamentals/math-and-science/computational-physics/12-08-qft) — $\mathrm{QFT}_4$; $Z_4=-i$; H / $P$ / SWAP.
- [12.8b QFT labs](/fundamentals/math-and-science/computational-physics/12-08b-qft-labs) — $Z_4$; matrix entry; $|2\rangle=|10\rangle$.
- [12.9 Grover](/fundamentals/math-and-science/computational-physics/12-09-grover) — oracle; diffuser; $\pi\sqrt N/4$.
- [12.9b Grover labs](/fundamentals/math-and-science/computational-physics/12-09b-grover-labs) — $n=4$; $|9\rangle$; $V_8=90$.
- [12.10 Shor](/fundamentals/math-and-science/computational-physics/12-10-shor) — period finding; QPE; factor $15$.
- [12.10b Shor labs](/fundamentals/math-and-science/computational-physics/12-10b-shor-labs) — $\gcd$; $T=4$; factors $3,5$.
- [12.11 QC sketches](/fundamentals/math-and-science/computational-physics/12-11-qc-code-sketches) — dipole $H$; QFTₙ; Grover; Shor (structure only).
- [12.11b Sketch labs](/fundamentals/math-and-science/computational-physics/12-11b-qc-code-labs) — $H_{00}$; Grover $R$ with $\sqrt{16}$; `04b`.

## Planned Topics

### Linear Algebra
- Vectors, dot products, and cross products — interactive visualizer
- Matrices as transformations (rotation, scale, shear)
- Eigenvalues and eigenvectors, geometrically

### Calculus
- Derivatives as rates of change, integrals as accumulation
- Limits and continuity
- Multivariable calculus: gradients, partial derivatives, and optimization

### Probability and Statistics
- Random variables, distributions, and expectation
- Bayes' theorem — interactive demo
- Hypothesis testing and confidence intervals

### Physics Fundamentals
- Kinematics and Newtonian mechanics
- Energy, momentum, and conservation laws
- Waves, oscillations, and basic electromagnetism
