/** Pick the algebra that does not cancel when b² ≫ 4ac. */

export default {
  title: 'Tiny quadratic root',
  lead: 'Solve $x^{2}+x+10^{-12}=0$. Here $b^{2}\\gg 4ac$, so one of the $\\pm$ textbook forms will cancel.',
  steps: [
    {
      caption: 'Both closed forms are equal in exact arithmetic. On a computer, $b^{2}-4ac$ is only a hair less than $b^{2}$, so $\\sqrt{\\Delta}\\approx|b|$.',
    },
    {
      ask: 'With $b>0$, which formula subtracts two nearly equal numbers?',
      choices: [
        {label: '$(-b+\\sqrt{\\Delta})/(2a)$', ok: true},
        {label: '$(-b-\\sqrt{\\Delta})/(2a)$', ok: false},
        {label: '$x=c/(a x)$ using the large root for $x$', ok: false},
      ],
      caption: '$-b$ and $+\\sqrt{\\Delta}$ are both about $-b$ vs $+|b|$. Their difference is the tiny root, built from least-significant bits.',
      panel: 'Use the sign that makes $-b\\pm\\sqrt{\\Delta}$ add in magnitude, then Vieta: $x_{\\mathrm{small}}=c/(a x_{\\mathrm{big}})$.',
    },
    {
      ask: 'After you have the large-magnitude root $x_{\\mathrm{big}}$, the stable tiny root is…',
      choices: [
        {label: '$c/(a\\, x_{\\mathrm{big}})$  (because $x_1 x_2=c/a$)', ok: true},
        {label: '$(-b+\\sqrt{\\Delta})/(2a)$ again', ok: false},
        {label: '$x_{\\mathrm{big}}/2$', ok: false},
      ],
      caption: 'One multiply-divide with the already-good large root. No subtraction of close floats.',
    },
  ],
};
