/** Guided: finish higher-order mean value — F′ telescopes to K. */

export default {
  title: 'Proof finish — higher-order Law of the Mean',
  lead: 'After Rolle gives F′(x₀)=0, the derivative telescopes down to K.',
  steps: [
    {
      ask: 'Differentiating the auxiliary $F$ produces a long sum that…',
      choices: [
        {
          label: 'Telescopes: intermediate $f^{(k)}$ terms cancel, leaving only the $f^{(n)}$ piece and the $-Kn(b-x)^{n-1}$ term',
          ok: true,
        },
        {label: 'All vanishes identically for every $x$', ok: false},
        {label: 'Forces $f$ to be linear', ok: false},
      ],
      caption: 'Each bracket is “next Taylor term minus previous.”',
    },
    {
      ask: 'At the Rolle point $x_0$, $F\'(x_0)=0$ becomes…',
      choices: [
        {
          label:
            "$\\dfrac{f^{(n)}(x_0)}{(n-1)!}(b-x_0)^{n-1}-Kn(b-x_0)^{n-1}=0$",
          ok: true,
        },
        {label: '$K=0$ always', ok: false},
        {label: '$f^{(n)}(x_0)=n!$ only', ok: false},
      ],
      caption: 'Cancel the common $(b-x_0)^{n-1}$ factor (since $x_0\\ne b$).',
    },
    {
      ask: 'Solving for $K$ yields…',
      choices: [
        {label: "$K=\\dfrac{f^{(n)}(x_0)}{n!}$, which turns identity (2) into formula (1)", ok: true},
        {label: '$K=f(a)$', ok: false},
        {label: '$K=b-a$', ok: false},
      ],
      caption: 'That $K$ is exactly the Lagrange remainder coefficient.',
    },
  ],
};
