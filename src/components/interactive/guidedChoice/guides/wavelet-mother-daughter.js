/** Mother → daughters Ψ_{a,τ} — pick the equation. */

export default {
  title: 'Mother and daughter wavelets',
  lead:
    'Global DFTs miss *when* bands turn on. Wavelets expand $y$ in localized packets — pick the daughter formula.',
  steps: [
    {
      ask: 'From a mother $\\Psi(t)$, daughters at scale $a$ and translate $\\tau$ are…',
      choices: [
        {
          label:
            '$\\displaystyle \\Psi_{a,\\tau}(t)=\\dfrac{1}{\\sqrt{|a|}}\\,\\Psi\\!\\left(\\dfrac{t-\\tau}{a}\\right)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\Psi_{a,\\tau}(t)=\\sqrt{|a|}\\,\\Psi\\!\\left(\\dfrac{t-\\tau}{a}\\right)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\Psi_{a,\\tau}(t)=\\Psi(at-\\tau)$ (no $1/\\sqrt{|a|}$, wrong argument)',
          ok: false,
        },
      ],
      caption:
        'Mothers (Morlet, Mexican hat, Haar, Daubechies, …) are localized in time and frequency. Scale $a$ sets the band; $\\tau$ sets when.',
    },
    {
      ask: 'Why is a plain DFT of the staged multi-tone incomplete for the stated problem?',
      choices: [
        {
          label:
            'It reports frequencies without resolving when each regime is active',
          ok: true,
        },
        {
          label: 'Sine waves cannot fit $\\sin(2\\pi t)$ at all',
          ok: false,
        },
        {
          label: '$N$ cannot exceed $12$',
          ok: false,
        },
      ],
      caption:
        'Next: wave packets obey $\\Delta t\\,\\Delta\\omega\\gtrsim 2\\pi$, which limits any time–frequency tile — including STFT windows.',
    },
  ],
};
