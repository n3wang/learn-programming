/** Control variates: pick the right equation at each derivation step. */

export default {
  title: 'Control-variate derivation',
  lead:
    'One sentence, one equation — at each step pick the formula that matches (lookalikes included).',
  steps: [
    {
      caption:
        'Pick a comparison function $g$ that tracks $f$ closely. Which closeness condition do we require?',
      ask: 'Which equation encodes “$g$ tracks $f$”?',
      choices: [
        {label: '$|f(x)-g(x)|\\le\\varepsilon$', ok: true},
        {label: '$|f(x)+g(x)|\\le\\varepsilon$', ok: false},
        {label: '$|f(x)\\cdot g(x)|\\le\\varepsilon$', ok: false},
      ],
    },
    {
      ask: 'And $g$ must have a known exact integral. That known piece is…',
      choices: [
        {label: '$J=\\displaystyle\\int_a^b g(x)\\,\\mathrm{d}x$', ok: true},
        {label: '$J=\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x$', ok: false},
        {label: '$J=\\displaystyle\\int_a^b \\bigl(f(x)-g(x)\\bigr)\\,\\mathrm{d}x$', ok: false},
      ],
      caption:
        'Exact $J$ will carry the bulk of the answer; Monte Carlo only cleans up the leftover.',
    },
    {
      ask: 'Rewrite the target $I=\\int_a^b f$ as a small correction plus the known piece:',
      choices: [
        {
          label: '$I=\\displaystyle\\int_a^b\\bigl(f-g\\bigr)+J$',
          ok: true,
        },
        {
          label: '$I=\\displaystyle\\int_a^b\\bigl(f+g\\bigr)-J$',
          ok: false,
        },
        {
          label: '$I=J-\\displaystyle\\int_a^b\\bigl(f-g\\bigr)$',
          ok: false,
        },
      ],
      caption: 'Identity: $\\int f=\\int(f-g)+\\int g$.',
    },
    {
      ask: 'Estimate only the residual by uniform Monte Carlo on $[a,b]$:',
      choices: [
        {
          label:
            '$I\\simeq\\dfrac{b-a}{N}\\sum_{i=1}^{N}\\bigl(f(x_i)-g(x_i)\\bigr)+J$',
          ok: true,
        },
        {
          label:
            '$I\\simeq\\dfrac{b-a}{N}\\sum_{i=1}^{N} f(x_i)\\quad\\text{(ignore $g$ and $J$)}$',
          ok: false,
        },
        {
          label:
            '$I\\simeq\\dfrac{b-a}{N}\\sum_{i=1}^{N}\\bigl(f(x_i)+g(x_i)\\bigr)-J$',
          ok: false,
        },
      ],
      caption:
        'On $[0,1]$ the prefactor $b-a$ is $1$. Pays off when $\\mathrm{Var}(f-g)<\\mathrm{Var}(f)$ — e.g. $f=e^{-x}$, $g=1-x$, $J=1/2$.',
    },
  ],
};
