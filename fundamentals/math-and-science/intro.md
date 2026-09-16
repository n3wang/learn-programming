---
sidebar_position: 1
title: Math and Science
---

# Math and Science

The quantitative bedrock underneath everything else in this library — the math and physics that algorithms, graphics, physics engines, and electronics all quietly assume you already have. This section builds that foundation up from first principles, with interactive visualizers wherever intuition is easier to build by manipulating something than by reading about it.

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
