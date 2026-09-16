/** Closed ray when φ/π is rational. */

export default {
  title: 'Closing a specular orbit',
  lead: 'Inside a circular mirror, each bounce advances $\\theta$ by $2\\phi$. When does the ray retrace itself?',
  steps: [
    {
      caption: 'Angles on a circle are mod $2\\pi$: $\\theta$ and $\\theta+2\\pi$ are the same hit point.',
    },
    {
      ask: 'After $m$ bounces the advance is $2 m \\phi$. The path closes when…',
      choices: [
        {label: '$2 m \\phi = 2\\pi n$ for integers $m,n$ — i.e. $\\phi/\\pi$ is rational', ok: true},
        {label: '$\\phi$ equals $\\pi/2$ only', ok: false},
        {label: 'the radius is an integer', ok: false},
      ],
      caption: 'So $\\phi/\\pi=n/m$ yields a finite polygonal figure. Irrational multiples densely fill chords.',
    },
    {
      ask: 'Rounding $\\phi$ and $\\theta$ to four decimals each bounce…',
      choices: [
        {label: 'injects a tiny angle error that grows with the number of steps', ok: true},
        {label: 'has no effect because reflection is exact', ok: false},
        {label: 'only changes the circle’s radius', ok: false},
      ],
      caption: 'Same story as any long finite-precision iteration: relative error climbs with step count.',
    },
  ],
};
