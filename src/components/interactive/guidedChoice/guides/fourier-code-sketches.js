/** Fourier code sketches: complex DFT → real Im channel → FFT± — structure only.
 *  Aligns with wiki proc-choose-dft-fft-sketch.
 */

export default {
  title: 'Fourier code sketches',
  lead:
    'Reference $O(N^2)$ complex DFT on a known tone mix, check odd/even → Im/Re, then radix-2 FFT± with round-trip and timing. Plot locally — not VPython book GUIs.',
  steps: [
    {
      caption:
        'Complex DFT: $Y_n=\\frac{1}{\\sqrt{2\\pi}}\\sum_k y_k e^{-2\\pi i kn/N}$. Odd real → Im-heavy; even → Re-heavy. Real-arithmetic Im channel is the sine projection without `complex`.',
    },
    {
      ask: 'After a working DFT reference, the next production step is…',
      choices: [
        {
          label: 'FFT with ± twiddle switch; check iFFT≈y and time vs DFT',
          ok: true,
        },
        {label: 'delete all bins except DC and quit', ok: false},
        {label: 'skip inverses because FFTs cannot invert', ok: false},
      ],
      caption:
        'Optional: multiply by $H(\\omega)$ between forward and inverse. Filters and noise labs reuse the same transform pipeline.',
    },
  ],
};
