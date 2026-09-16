/** Trapezoid / Simpson errors and Romberg extrapolation. */

export default {
  title: 'Integration error and Romberg',
  lead: 'Equal-spacing rules are weighted sums. How do their errors scale, and how do you cancel the leading $h^{2}$ term?',
  steps: [
    {
      caption: 'Taylor estimates give $\\mathcal{E}_{\\mathrm{trap}}\\sim O(h^{2})$ and $\\mathcal{E}_{\\mathrm{simp}}\\sim O(h^{4})$. Simpson usually wins with fewer points — until round-off at huge $N$.',
    },
    {
      ask: 'Romberg’s combination $(4 A(h/2)-A(h))/3$ is designed to…',
      choices: [
        {label: 'cancel the leading $O(h^{2})$ error when $A$ is trapezoid-like', ok: true},
        {label: 'remove all floating-point noise', ok: false},
        {label: 'replace $f$ by its derivative', ok: false},
      ],
      caption: 'Same Richardson idea as extrapolated differences. It fails if a different power of $h$ dominates.',
    },
    {
      ask: 'A quick check that your weight list is sane: $\\sum w_i$ must equal…',
      choices: [
        {label: '$b-a$ (integral of $f\\equiv 1$)', ok: true},
        {label: 'always $1$', ok: false},
        {label: '$\\varepsilon_m$', ok: false},
      ],
      caption: 'Elementary trapezoid / Simpson / 3/8 / Milne blocks must pass this identity before you trust a nontrivial integrand.',
    },
  ],
};
