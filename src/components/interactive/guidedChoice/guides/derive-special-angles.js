/** Guided: derive standard acute values π/4, π/6, π/3. */

export default {
  title: 'Derive sin/cos of π/4, π/6, π/3',
  lead: 'Isosceles right triangle and equilateral triangle geometry.',
  steps: [
    {
      ask: 'In an isosceles right triangle with hypotenuse 1, each leg is…',
      choices: [
        {label: '√2/2, so sin(π/4)=cos(π/4)=√2/2', ok: true},
        {label: '1/2', ok: false},
        {label: '√3/2', ok: false},
      ],
      caption: 'x² + x² = 1 ⇒ x = √2/2.',
    },
    {
      ask: 'In an equilateral triangle of side 1, half-base is 1/2, so cos(π/3)=…',
      choices: [
        {label: '1/2 (then sin(π/6)=cos(π/3)=1/2 by cofunction)', ok: true},
        {label: '√3/2', ok: false},
        {label: '0', ok: false},
      ],
      caption: 'Altitude creates a π/3–π/6–π/2 triangle.',
    },
    {
      ask: 'Then sin(π/3) from Pythagorean is…',
      choices: [
        {label: '√3/2 (and cos(π/6)=sin(π/3))', ok: true},
        {label: '1/2', ok: false},
        {label: '√2/2', ok: false},
      ],
      caption: '1 − (1/2)² = 3/4.',
    },
  ],
};
