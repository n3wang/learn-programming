/** Covariance and C=XXᵀ/(N−1) — pick the equation. */

export default {
  title: 'PCA variance and covariance',
  lead:
    'After centering, the covariance matrix encodes channel variances and correlations. Pick the matching formulas.',
  steps: [
    {
      ask: 'Centered channels $a_i$, $b_i$. The sample covariance is…',
      choices: [
        {
          label:
            '$\\displaystyle \\mathrm{cov}(A,B)=\\dfrac{1}{N-1}\\sum_{i=1}^{N} a_i b_i$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\mathrm{cov}(A,B)=\\dfrac{1}{N}\\sum_{i=1}^{N} a_i b_i$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\mathrm{cov}(A,B)=\\dfrac{1}{N-1}\\sum_{i=1}^{N}(a_i+b_i)^{2}$',
          ok: false,
        },
      ],
      caption:
        'Variance is the diagonal case $\\mathrm{var}(x)=\\mathrm{cov}(x,x)$. Positive cov ⇒ channels move together.',
    },
    {
      ask: 'Stack $M$ centered detector rows into $M\\times N$ matrix $\\mathbf X$. The covariance matrix is…',
      choices: [
        {
          label: '$\\displaystyle C=\\dfrac{1}{N-1}\\,\\mathbf X\\mathbf X^{T}$',
          ok: true,
        },
        {
          label: '$\\displaystyle C=\\dfrac{1}{N-1}\\,\\mathbf X^{T}\\mathbf X$',
          ok: false,
        },
        {
          label: '$\\displaystyle C=\\mathbf X\\mathbf X^{T}$ (no $1/(N-1)$)',
          ok: false,
        },
      ],
      caption:
        'PCA = eigendecompose $C$: eigenvalues = variances along principal directions. Order by $\\lambda$; project onto kept PCs.',
    },
  ],
};
