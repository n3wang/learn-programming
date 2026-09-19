import {pickOne} from './mathRandom';

/** Sphere / balloon. */
export function genSphereRates({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Gas escapes a sphere at $2$ ft³/min. How fast is surface area shrinking when $r=12$?',
      steps: [
        '$dV/dt=-2=4\\pi r^{2}\\,dr/dt$.',
        '$dS/dt=8\\pi r\\,dr/dt=-4/r=-1/3$ at $r=12$.',
      ],
      answer: 'Shrinking at $1/3$ ft²/min.',
    };
  }
  return pickOne([
    {
      prompt:
        'When is $dS/dt=dr/dt$ for a sphere $S=4\\pi r^{2}$?',
      steps: ['$8\\pi r\\,dr/dt=dr/dt$ ⇒ $r=1/(8\\pi)$ (if $dr/dt\\neq 0$).'],
      answer: '$r=1/(8\\pi)$.',
    },
    {
      prompt: 'Oil slick: $dr/dt=3$ m/min, $r=200$. Find $dA/dt$ for $A=\\pi r^{2}$.',
      steps: ['$dA/dt=2\\pi r\\,dr/dt=1200\\pi$ m²/min.'],
      answer: '$1200\\pi$ m²/min.',
    },
  ]);
}

/** Cone / funnel / sand pile. */
export function genConeRates({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Funnel $R=4$, $H=8$; $dV/dt=-1$ in³/s. How fast is the level dropping when 2 in from the top?',
      steps: [
        '$r=h/2$, $V=\\pi h^{3}/12$, $dh/dt=-4/(\\pi h^{2})$.',
        'At $h=6$: $dh/dt=-1/(9\\pi)$ in/s.',
      ],
      answer: '$1/(9\\pi)$ in/s downward.',
    };
  }
  return pickOne([
    {
      prompt:
        'Sand pile $h=(4/3)r$. If $r=3$ and $dr/dt=1/4$ ft/min, find $dV/dt$.',
      steps: [
        '$V=(4/9)\\pi r^{3}$, $dV/dt=(4/3)\\pi r^{2}\\,dr/dt=3\\pi$.',
      ],
      answer: '$3\\pi$ ft³/min.',
    },
    {
      prompt:
        'Same pile: $r=6$, $dV/dt=24$. Find $dr/dt$.',
      steps: ['$24=(4/3)\\pi\\cdot 36\\,dr/dt$ ⇒ $dr/dt=1/(2\\pi)$.'],
      answer: '$1/(2\\pi)$ ft/min.',
    },
    {
      prompt:
        'Conical reservoir $R=3$, $H=10$; $dV/dt=-4$. Depth $h=6$: find $dh/dt$ and $dr/dt$.',
      steps: [
        '$r=(3/10)h$, $V=\\pi r^{2}h/3=\\pi h^{3}/100$… book: $dh/dt=-100/(81\\pi)$, $dr/dt=-10/(27\\pi)$.',
      ],
      answer: '$100/(81\\pi)$ down; $10/(27\\pi)$ radius shrinking.',
    },
  ]);
}

/** Ships / trains distance. */
export function genDistanceRates({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Ships: $D^{2}=(32-16t)^{2}+(12t)^{2}$. At $t=1$ and $t=2$, are they approaching or separating?',
      steps: [
        '$dD/dt=(400t-512)/D$.',
        '$t=1$: $-5.6$ (approaching); $t=2$: $+12$ (separating).',
      ],
      answer: 'Approach $5.6$; separate $12$ mi/h.',
    };
  }
  return pickOne([
    {
      prompt: 'When do those ships cease approaching, and how far apart?',
      steps: [
        '$dD/dt=0$ ⇒ $t=1.28$; $D=19.2$ mi.',
      ],
      answer: '$1.28$ h; $19.2$ mi.',
    },
    {
      prompt:
        'Balloon rises $15$ ft/s over $A$; $B$ is $30$ ft from $A$. Rate of change of distance from $B$ when height is $40$?',
      steps: [
        '$D^{2}=30^{2}+h^{2}$; $D\\,D\'=h\\,h\'$ ⇒ $D\'=12$ at $h=40$, $D=50$.',
      ],
      answer: '$12$ ft/s.',
    },
    {
      prompt:
        'Kite at height $150$; moves horizontally $20$ ft/s. String rate when $250$ ft away?',
      steps: [
        '$z^{2}=x^{2}+150^{2}$; $z=250$ ⇒ $x=200$; $z\'=16$ ft/s.',
      ],
      answer: '$16$ ft/s.',
    },
  ]);
}

/** Ladder / rectangle / shadow / trough. */
export function genClassicRates({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt:
        'Rectangle area $50$ constant; $dx/dt=2$. Find $dP/dt$ when $x=5$ and when $x=10$.',
      steps: [
        '$xy=50$, $x y\'+y\\cdot 2=0$.',
        '$x=5$: $y\'=-4$, $P\'=-4$; $x=10$: $y\'=-1$, $P\'=2$.',
      ],
      answer: '$-4$; $+2$ in/s.',
    };
  }
  return pickOne([
    {
      prompt:
        '20 ft ladder; foot away at $2$ ft/s. When foot is $12$ ft out, how fast is the top falling?',
      steps: [
        '$y=16$; $y\'=-(x/y)x\'=-3/2$ ft/s.',
      ],
      answer: '$3/2$ ft/s downward.',
    },
    {
      prompt:
        'Man $5$ ft tall walks $4$ ft/s from a $20$ ft light. Tip of shadow speed? Shadow length rate?',
      steps: [
        'Similar triangles: tip speed $16/3$; length rate $4/3$ ft/s.',
      ],
      answer: '$16/3$; $4/3$ ft/s.',
    },
    {
      prompt:
        'Trough $8\\times 2$ top (rectangular), water in at $2$ ft³/min. Surface rise rate when depth is $1$ ft?',
      steps: [
        'Horizontal surface area is constant $8\\cdot 2=16$ ft².',
        '$dV/dt=16\\,dh/dt=2$ ⇒ $dh/dt=1/8$ ft/min.',
      ],
      answer: '$1/8$ ft/min.',
    },
    {
      prompt:
        'Cylindrical tank radius $6$; liquid in at $8$ ft³/min. How fast does the surface rise?',
      steps: [
        '$V=\\pi r^{2}h=36\\pi h$; $h\'=8/(36\\pi)=2/(9\\pi)$.',
      ],
      answer: '$2/(9\\pi)$ ft/min.',
    },
  ]);
}

/** Pulley, barge, hyperbola point. */
export function genMiscRates({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.4) {
    return {
      prompt:
        'Truck–pulley: when weight is raised $x=6$ and $dy/dt=9$, find $dx/dt$.',
      steps: [
        '$y^{2}=(30+x)^{2}-18^{2}$; at $x=6$, $y=18\\sqrt{3}$.',
        '$dx/dt=(9/2)\\sqrt{3}$ ft/s.',
      ],
      answer: '$(9/2)\\sqrt{3}$ ft/s.',
    };
  }
  return pickOne([
    {
      prompt:
        'Shadow tip: object height $h$, light $H$, object speed $v$. Formula for tip speed $V$?',
      steps: ['$V=Hv/(H-h)$.'],
      answer: '$V=\\dfrac{Hv}{H-h}$.',
    },
    {
      prompt:
        'Point on $x^{2}-4y^{2}=36$; $dx/dt=20$ at $(10,4)$. Find $dy/dt$.',
      steps: ['$2x x\'-8y y\'=0$ ⇒ $y\'=50$.'],
      answer: '$50$ units/s.',
    },
    {
      prompt:
        'On $y=x^{2}-2x$, where is $dy/dt=2\\,dx/dt$?',
      steps: ['$(2x-2)x\'=2x\'$ ⇒ $x=2$ (if $x\'\\neq 0$); point $(2,0)$.'],
      answer: '$(2,0)$.',
    },
    {
      prompt:
        'Barge deck $10$ ft below dock; $24$ ft away, approaching at $3/4$ ft/s. Cable pull-in rate?',
      steps: [
        '$z^{2}=x^{2}+10^{2}$; $z\'=(x/z)x\'=9/13$ ft/s.',
      ],
      answer: '$9/13$ ft/s.',
    },
  ]);
}

/** Mixed. */
export function genSuppRelatedRatesMixed({requireNiceAnswer} = {}) {
  const gens = [
    genSphereRates,
    genConeRates,
    genDistanceRates,
    genClassicRates,
    genMiscRates,
  ];
  return pickOne(gens)({requireNiceAnswer});
}
