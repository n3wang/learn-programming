/** ODE solver sketches: RK2/RK4, RK45 adapt, ABM — structure only. */

export default {
  title: 'ODE code sketches',
  lead:
    'Sandbox locks teach fixed-step RK2/RK4 + energy. Local notebooks can add RK45 adaptation and Adams–Bashforth–Moulton — without pasting textbook VPython listings.',
  steps: [
    {
      caption:
        'Fixed step: share $\\mathbf f(t,\\mathbf y)$; RK2 mid-point then full; RK4 four stages with $h/6$ weights. Swap $F$ (harmonic, $|x|^p$, soft $\\alpha$, drive) without changing the stepper.',
    },
    {
      ask: 'Before trusting RK45 or ABM on a stiff drive, the safest first check is…',
      choices: [
        {
          label: 'energy / waveform diagnostics on fixed-step RK2/RK4 for harmonic and $x^3$',
          ok: true,
        },
        {label: 'skip steppers and only print $h$', ok: false},
        {label: 'require VPython springs on a CDN', ok: false},
      ],
      caption:
        'RK45: shared stages → $\\|y_5-y_4\\|$ vs tol → grow/shrink $h$. ABM: RK fill of $\\mathbf f$ history, predict (AB), correct (AM). Plot locally; this course grades stdout locks.',
    },
  ],
};
