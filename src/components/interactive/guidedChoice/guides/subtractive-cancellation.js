/** Subtractive cancellation and quotient relative error — pick the matching equation. */

export default {
  title: 'Subtractive cancellation',
  lead:
    'Each step states a goal; pick the matching equation among three lookalikes.',
  steps: [
    {
      ask: 'A stored float carries relative noise $\\epsilon_x$. Which model is that?',
      choices: [
        {label: '$x_c\\simeq x(1+\\epsilon_x)$', ok: true},
        {label: '$x_c\\simeq x+\\epsilon_x$ (absolute only, no relative factor)', ok: false},
        {label: '$x_c\\simeq x/(1+\\epsilon_x)$', ok: false},
      ],
      caption: 'Feed that model into a difference $a=b-c$.',
    },
    {
      ask: 'After $a_c\\simeq b(1+\\epsilon_b)-c(1+\\epsilon_c)$, the relative factor $a_c/a$ expands to…',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+\\epsilon_b\\frac{b}{a}-\\epsilon_c\\frac{c}{a}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+\\epsilon_b\\frac{a}{b}-\\epsilon_c\\frac{a}{c}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+\\epsilon_b\\epsilon_c$',
          ok: false,
        },
      ],
      caption:
        'Nothing forces the last two terms to cancel. The dangerous case is $b\\simeq c$.',
    },
    {
      ask: 'When $b\\simeq c$ (so $a$ is tiny), the worst-case relative error is…',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+\\frac{b}{a}\\max\\bigl(|\\epsilon_b|,|\\epsilon_c|\\bigr)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+\\frac{a}{b}\\max\\bigl(|\\epsilon_b|,|\\epsilon_c|\\bigr)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+|\\epsilon_b\\epsilon_c|$',
          ok: false,
        },
      ],
      caption:
        'The factor $b/a$ is huge — cancelled heads leave noisy mantissa tails magnified.',
    },
    {
      ask: 'For a single quotient $a=b/c$, linearize $(1+\\epsilon_b)/(1+\\epsilon_c)$. Which expansion?',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq(1+\\epsilon_b)(1-\\epsilon_c)\\simeq 1+\\epsilon_b-\\epsilon_c$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq(1+\\epsilon_b)(1+\\epsilon_c)\\simeq 1+\\epsilon_b+\\epsilon_c$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+\\epsilon_b\\epsilon_c$ only',
          ok: false,
        },
      ],
      caption: 'Drop $\\epsilon^{2}$ and take absolute values (signs unknown).',
    },
    {
      ask: 'Worst-case relative error for $b/c$ (or $bc$) is therefore…',
      choices: [
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+|\\epsilon_b|+|\\epsilon_c|$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq 1+|\\epsilon_b|-|\\epsilon_c|$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\frac{a_c}{a}\\simeq |1+\\epsilon_b|+|1+\\epsilon_c|$',
          ok: false,
        },
      ],
      caption:
        'Lab rule: add relative uncertainties. Multiplication obeys the same worst-case sum.',
    },
  ],
};
