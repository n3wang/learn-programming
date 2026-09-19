/** Guided proof: polar → Cartesian via similar triangles. */

export default {
  title: 'Proof — polar to rectangular',
  lead: 'Similar right triangles scale the unit-circle point by r.',
  steps: [
    {
      ask: 'On ray OA, the unit point F is…',
      choices: [
        {label: '(cos θ, sin θ)', ok: true},
        {label: '(r, θ)', ok: false},
        {label: '(1, 1)', ok: false},
      ],
      caption: 'Definition of sine and cosine on the unit circle.',
    },
    {
      ask: '△ADO ~ △FEO with OA = r and OF = 1 implies…',
      choices: [
        {label: 'x / cos θ = r / 1 = y / sin θ', ok: true},
        {label: 'x = cos θ only', ok: false},
        {label: 'r = x + y', ok: false},
      ],
      caption: 'Corresponding sides are proportional.',
    },
    {
      ask: 'Therefore…',
      choices: [
        {label: 'x = r cos θ and y = r sin θ', ok: true},
        {label: 'x = r sin θ and y = r cos θ', ok: false},
        {label: 'θ = r', ok: false},
      ],
      caption: 'Other quadrants reduce to QI by signs of cos/sin.',
    },
  ],
};
