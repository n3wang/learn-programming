/** Guided proof: lim θ→0 (sin θ)/θ = 1 via area squeeze (Fig. 17-11). */

export default {
  title: 'Proof — lim (sin θ)/θ = 1',
  lead: 'Geometric squeeze on the unit circle (radians). Evenness ⇒ only θ→0⁺.',
  steps: [
    {
      ask: 'Why is it enough to prove the limit as θ→0⁺?',
      choices: [
        {label: 'sin(−θ)/(−θ) = sin θ/θ, so the even quotient has the same two-sided limit', ok: true},
        {label: 'Sine is undefined for negative θ', ok: false},
        {label: 'Cosine is odd', ok: false},
      ],
      caption: 'The quotient is even; one-sided limit controls both sides.',
    },
    {
      ask: 'On the unit circle with central angle θ, sector areas give the inequality…',
      choices: [
        {
          label: '½ θ cos²θ ≤ ½ sin θ cos θ ≤ ½ θ',
          ok: true,
        },
        {label: '½ θ ≤ ½ sin θ ≤ ½ θ cos²θ', ok: false},
        {label: 'θ ≤ sin θ ≤ cos θ', ok: false},
      ],
      caption: 'Sector COD ≤ △COB ≤ sector AOB (Fig. 17-11).',
    },
    {
      ask: 'Dividing by ½θ cos θ > 0 yields…',
      choices: [
        {label: 'cos θ ≤ (sin θ)/θ ≤ 1/cos θ', ok: true},
        {label: '(sin θ)/θ ≤ cos θ ≤ 1/cos θ', ok: false},
        {label: 'θ ≤ sin θ ≤ 1', ok: false},
      ],
      caption: 'Squeeze between cos θ and sec θ.',
    },
    {
      ask: 'As θ→0⁺, both cos θ and 1/cos θ → 1, so the squeezed limit is…',
      choices: [
        {label: '1', ok: true},
        {label: '0', ok: false},
        {label: '∞', ok: false},
      ],
      caption: '1 ≤ lim ≤ 1 forces lim (sin θ)/θ = 1.',
    },
  ],
};
