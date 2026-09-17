/** Romberg extrapolation for trapezoid-like A(h) — pick the equation. */

export default {
  title: 'Integration error and Romberg',
  lead:
    'Error scalings and the Richardson combo for integrals. Pick the matching equation.',
  steps: [
    {
      ask: 'Leading truncation for composite trapezoid / Simpson (smooth $f$) scales as…',
      choices: [
        {
          label:
            '$\\mathcal{E}_{\\mathrm{trap}}\\sim O(h^{2}),\\qquad\\mathcal{E}_{\\mathrm{simp}}\\sim O(h^{4})$',
          ok: true,
        },
        {
          label:
            '$\\mathcal{E}_{\\mathrm{trap}}\\sim O(h^{4}),\\qquad\\mathcal{E}_{\\mathrm{simp}}\\sim O(h^{2})$',
          ok: false,
        },
        {
          label:
            '$\\mathcal{E}_{\\mathrm{trap}}\\sim O(h),\\qquad\\mathcal{E}_{\\mathrm{simp}}\\sim O(h)$',
          ok: false,
        },
      ],
      caption: 'Suppose trapezoid-like $A(h)$ has an even-power error series.',
    },
    {
      ask: 'Write $A(h)$ and $A(h/2)$ with shared $\\alpha h^{2}$ piece:',
      choices: [
        {
          label:
            '$\\displaystyle A(h)\\simeq I+\\alpha h^{2}+\\beta h^{4},\\quad A(h/2)\\simeq I+\\frac{\\alpha h^{2}}{4}+\\frac{\\beta h^{4}}{16}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle A(h)\\simeq I+\\alpha h^{2},\\quad A(h/2)\\simeq I+4\\alpha h^{2}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle A(h)\\simeq I-\\alpha h^{2},\\quad A(h/2)\\simeq I-\\frac{\\alpha h^{2}}{2}$',
          ok: false,
        },
      ],
      caption: 'Same Richardson idea as extrapolated differences.',
    },
    {
      ask: 'Romberg’s combination that cancels $\\alpha h^{2}$ is…',
      choices: [
        {
          label:
            '$\\displaystyle A\\simeq\\frac{4}{3}A\\!\\left(\\frac{h}{2}\\right)-\\frac{1}{3}A(h)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle A\\simeq\\frac{1}{3}A\\!\\left(\\frac{h}{2}\\right)-\\frac{4}{3}A(h)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle A\\simeq\\frac{4}{3}A(h)-\\frac{1}{3}A\\!\\left(\\frac{h}{2}\\right)$',
          ok: false,
        },
      ],
      caption:
        'Equivalent: $(4A(h/2)-A(h))/3$. Works only while the $h^{2}$ term actually dominates.',
    },
    {
      ask: 'Sanity check: for $f\\equiv 1$, the weights of a complete equal-interval rule must sum to…',
      choices: [
        {
          label: '$\\displaystyle\\sum_i w_i=b-a$',
          ok: true,
        },
        {
          label: '$\\displaystyle\\sum_i w_i=1$ always',
          ok: false,
        },
        {
          label: '$\\displaystyle\\sum_i w_i=0$',
          ok: false,
        },
      ],
      caption: 'If the weight list fails that identity, the stencil is wrong before you touch a nontrivial $f$.',
    },
  ],
};
