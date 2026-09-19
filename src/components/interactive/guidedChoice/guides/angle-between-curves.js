/** Guided: inclination and angle between curves. */

export default {
  title: 'Angle between curves',
  lead: 'Inclination α with m = tan α; acute angle between tangents.',
  steps: [
    {
      ask: 'If a nonvertical line has slope m and inclination α, then…',
      choices: [
        {label: 'm = tan α', ok: true},
        {label: 'm = sin α', ok: false},
        {label: 'm = α', ok: false},
      ],
      caption: 'Rise/run on the unit circle is sin α / cos α.',
    },
    {
      ask: 'At an intersection, the angle between two curves means…',
      choices: [
        {
          label: 'The smaller angle between their tangent lines',
          ok: true,
        },
        {label: 'The angle between their normals only', ok: false},
        {label: 'Always π/2', ok: false},
      ],
      caption: 'Use tan φ = |(m₂−m₁)/(1+m₁ m₂)| when 1+m₁m₂ ≠ 0.',
    },
    {
      ask: 'If 1 + m₁ m₂ = 0, the tangents are…',
      choices: [
        {label: 'Perpendicular', ok: true},
        {label: 'Parallel', ok: false},
        {label: 'Undefined slopes only', ok: false},
      ],
      caption: 'Product of slopes −1 ⇔ right angle.',
    },
  ],
};
