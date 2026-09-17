/** Grover oracle, diffuser, iteration count — pick the equation. */

export default {
  title: 'Grover search',
  lead:
    'Oracle phase-flips the marked state; the diffuser reflects about the mean. Pick the matching formulas.',
  steps: [
    {
      ask: 'The oracle that phase-marks index $i$ (with $f(i)=1$) acts as…',
      choices: [
        {
          label: '$\\displaystyle \\mathcal{O}|k\\rangle=(-1)^{f(k)}|k\\rangle$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\mathcal{O}|k\\rangle=|k\\oplus i\\rangle$ (bit-string add)',
          ok: false,
        },
        {
          label: '$\\displaystyle \\mathcal{O}|k\\rangle=|0\\rangle$ for all $k$',
          ok: false,
        },
      ],
      caption:
        'Uniform start: $|\\psi\\rangle=H^{\\otimes n}|0\\rangle^{\\otimes n}=N^{-1/2}\\sum_k|k\\rangle$. Next — amplify.',
    },
    {
      ask: 'The diffuser reflecting amplitudes about their mean is…',
      choices: [
        {
          label: '$\\displaystyle U_\\psi=2|\\psi\\rangle\\langle\\psi|-I$',
          ok: true,
        },
        {
          label: '$\\displaystyle U_\\psi=|\\psi\\rangle\\langle\\psi|$ (projector only)',
          ok: false,
        },
        {
          label: '$\\displaystyle U_\\psi=I-2|\\psi\\rangle\\langle\\psi|$ (sign flipped)',
          ok: false,
        },
      ],
      caption:
        'Geometrically: each amplitude $\\alpha_k\\mapsto 2\\bar\\alpha-\\alpha_k$. One Grover iterate is $G=U_\\psi\\mathcal{O}$.',
    },
    {
      ask: 'Optimal number of Grover iterates for one marked item among $N$ is about…',
      choices: [
        {
          label: '$\\displaystyle t\\sim\\dfrac{\\pi}{4}\\sqrt{N}$',
          ok: true,
        },
        {
          label: '$\\displaystyle t\\sim N$',
          ok: false,
        },
        {
          label: '$\\displaystyle t\\sim\\dfrac{\\pi}{4}N$',
          ok: false,
        },
      ],
      caption:
        'For $N=16$, $t\\approx\\pi\\sqrt{16}/4\\approx 3$. More iterates over-rotate and can lower success probability.',
    },
  ],
};
