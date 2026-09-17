/** Why AA^{-1}≈I (and related residual checks) measure floating-point trust. */

export default {
  title: 'Tests before use',
  lead: 'A matrix inverse or solve is only as good as its residual. Before trusting $A^{-1}$ or $\\mathbf x$, ask how close $AA^{-1}$ is to $I$ and how $A\\mathbf x$ compares to $\\mathbf b$.',
  steps: [
    {
      caption:
        'Gauss–Jordan on the augmented block $[A\\mid I]$ turns the left half into $I$ and the right half into a numerical $A^{-1}$. Round-off means the product $AA^{-1}$ is rarely exact $I$.',
    },
    {
      ask: 'The check $\\max\\|AA^{-1}-I\\|$ mainly tells you…',
      choices: [
        {
          label: 'how much floating-point error accumulated in the inverse (near machine ε is excellent)',
          ok: true,
        },
        {label: 'that A is singular if the residual is nonzero', ok: false},
        {label: 'the analytic closed form of A^{-1}', ok: false},
      ],
      caption:
        'For a well-conditioned $3\\times 3$ test matrix, residuals at $\\sim 10^{-16}$ mean the inverse is trustworthy at double precision — not that every later solve is exact.',
    },
    {
      ask: 'Prefer solving $A\\mathbf x=\\mathbf b$ with elimination on $[A\\mid\\mathbf b]$ rather than forming $A^{-1}\\mathbf b$ because…',
      choices: [
        {
          label: 'a full inverse does more work and can magnify round-off compared with a direct solve',
          ok: true,
        },
        {label: 'inverses are mathematically undefined for every matrix', ok: false},
        {label: 'elimination cannot handle integer right-hand sides', ok: false},
      ],
      caption:
        'Still verify $A\\mathbf x\\approx\\mathbf b$, and for eigenclaims check $\\|A\\mathbf v-\\lambda\\mathbf v\\|$. Ill-conditioned cases (e.g. Hilbert) need residual scrutiny even when the exact answer is simple.',
    },
  ],
};
