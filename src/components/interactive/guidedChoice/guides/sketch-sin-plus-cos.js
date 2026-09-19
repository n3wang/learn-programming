/** Guided: sketch sin x + cos x. */

export default {
  title: 'Sketch sin x + cos x',
  lead: 'Critical numbers where tan x = 1; second-derivative test.',
  steps: [
    {
      ask: 'f′(x)=cos x − sin x = 0 iff…',
      choices: [
        {label: 'tan x = 1 (e.g. π/4, 5π/4 on [0,2π])', ok: true},
        {label: 'sin x = 0', ok: false},
        {label: 'x = 0 only', ok: false},
      ],
      caption: 'cos = sin ⇒ tan = 1.',
    },
    {
      ask: 'f″=−(sin+cos); at π/4 and 5π/4 we get…',
      choices: [
        {
          label: 'Relative max √2 at π/4; relative min −√2 at 5π/4',
          ok: true,
        },
        {label: 'Both maxima', ok: false},
        {label: 'No extrema', ok: false},
      ],
      caption: 'f″(π/4)=−√2<0; f″(5π/4)=√2>0.',
    },
    {
      ask: 'Inflection where f″=0 means…',
      choices: [
        {
          label: 'tan x = −1 → 3π/4, 7π/4 with y=0',
          ok: true,
        },
        {label: 'Only at x=0', ok: false},
        {label: 'Never', ok: false},
      ],
      caption: 'sin = −cos on those angles.',
    },
  ],
};
