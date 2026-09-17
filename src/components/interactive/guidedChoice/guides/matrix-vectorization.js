/** Matmul nesting, stride, and FD/CD on arrays — equation picks. */

export default {
  title: 'Matrix multiply and array derivatives',
  lead:
    'Same flops, different wall time — and the same stride mindset for FD/CD. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'Matrix multiply $C=AB$ has entries…',
      choices: [
        {
          label:
            '$\\displaystyle c_{ij}=\\sum_{k=1}^{N} a_{ik}\\,b_{kj}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle c_{ij}=\\sum_{k=1}^{N} a_{ki}\\,b_{jk}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle c_{ij}=a_{ij}\\,b_{ij}$ (Hadamard only)',
          ok: false,
        },
      ],
      caption:
        'Both $O(N^{3})$ triple loops can return the same $C$; nesting decides cache hits.',
    },
    {
      ask: 'On a row-major $N\\times M$ layout, flat index and column stride are…',
      choices: [
        {
          label:
            '$\\displaystyle \\mathrm{flat}(i,j)\\simeq iM+j,\\quad \\Delta_{\\mathrm{col}}=M$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\mathrm{flat}(i,j)\\simeq i+j,\\quad \\Delta_{\\mathrm{col}}=1$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\mathrm{flat}(i,j)\\simeq iN+j,\\quad \\Delta_{\\mathrm{col}}=N^{2}$',
          ok: false,
        },
      ],
      caption:
        'Unit stride along a row ($\\Delta j=+1$); stride $M$ down a column. Prefer nestings that stream rows of $A$.',
    },
    {
      ask: 'Forward and central differences on a sampled $y[i]$ are…',
      choices: [
        {
          label:
            '$\\displaystyle y\'_i\\approx\\dfrac{y_{i+1}-y_i}{h},\\qquad y\'_i\\approx\\dfrac{y_{i+1}-y_{i-1}}{2h}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y\'_i\\approx\\dfrac{y_{i+1}+y_i}{h},\\qquad y\'_i\\approx\\dfrac{y_{i+1}+y_{i-1}}{2h}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y\'_i\\approx h(y_{i+1}-y_i),\\qquad y\'_i\\approx 2h(y_{i+1}-y_{i-1})$',
          ok: false,
        },
      ],
      caption:
        'A single pass (or sliced `y[1:]-y[:-1]`) beats an index-by-index Python loop for $N\\gtrsim 10^{5}$. Time with `perf_counter` medians.',
    },
  ],
};
