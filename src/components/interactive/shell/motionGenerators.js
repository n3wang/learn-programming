import {pickOne} from './mathRandom';

/** Prob 1 style: evaluate v and a at a time. */
export function genMotionVaAtT({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'For $s=\\tfrac12 t^{3}-2t$, find $v$ and $a$ at $t=2$.',
      steps: [
        '$v=\\tfrac32 t^{2}-2$ ⇒ $v(2)=4$.',
        '$a=3t$ ⇒ $a(2)=6$.',
      ],
      answer: '$v=4$; $a=6$.',
    };
  }
  const c = pickOne([1, 2, 3]);
  return {
    prompt: `For $s=t^{3}-${c}t$, find $v$ and $a$ at $t=2$.`,
    steps: [
      `$v=3t^{2}-${c}$ ⇒ $v(2)=12-${c}$.`,
      `$a=6t$ ⇒ $a(2)=12$.`,
    ],
    answer: `$v=${12 - c}$; $a=12$.`,
  };
}

/** Prob 2–3 style: intervals from factored v, a. */
export function genMotionIntervals({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'For $s=t^{3}-6t^{2}+9t+4$: when is $s$ increasing? When does direction change?',
      steps: [
        '$v=3(t-1)(t-3)$; $s$ increasing for $t<1$ and $t>3$.',
        'Turns at $t=1$ and $t=3$ ($v=0$, $a\\neq 0$).',
      ],
      answer: 'Inc. on $(-\\infty,1)\\cup(3,\\infty)$; turns at $1,3$.',
    };
  }
  return pickOne([
    {
      prompt:
        'For $s=t^{3}-9t^{2}+24t$: when is $s$ decreasing? When is $v$ increasing?',
      steps: [
        '$v=3(t-2)(t-4)$ ⇒ $s$ decreasing on $(2,4)$.',
        '$a=6(t-3)$ ⇒ $v$ increasing for $t>3$.',
      ],
      answer: 'Dec. on $(2,4)$; $v$ inc. for $t>3$.',
    },
    {
      prompt:
        'For $s=t^{3}-6t^{2}+9t+4$: find $s$ and $a$ when $v=0$.',
      steps: [
        '$t=1$: $s=8$, $a=-6$; $t=3$: $s=4$, $a=6$.',
      ],
      answer: '$(s,a)=(8,-6)$ and $(4,6)$.',
    },
  ]);
}

/** Total distance with turns. */
export function genTotalDistance({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'For $s=t^{3}-9t^{2}+24t$, total distance in first 5 seconds?',
      steps: [
        'Turns at $t=2,4$: $s(0)=0$, $s(2)=20$, $s(4)=16$, $s(5)=20$.',
        'Distance $20+|16-20|+|20-16|=28$.',
      ],
      answer: '$28$ ft.',
    };
  }
  return {
    prompt:
      'Particle: $s(0)=3$, moves left to $s(2.5)=-27/16$, then to $s(3)=0$. Total distance on $[0,3]$?',
    steps: [
      '$3-(-27/16)+|0-(-27/16)|=3+27/16+27/16=51/8$.',
    ],
    answer: '$51/8$.',
  };
}

/** Free-fall drills. */
export function genFreeFallDrill({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Stone: $s=112t-16t^{2}$. (a) $v$ at $t=3$ and $t=4$. (b) Max height time and value.',
      steps: [
        '$v=112-32t$: $v(3)=16$, $v(4)=-16$.',
        'Peak $v=0$ ⇒ $t=3.5$, $s=196$ ft.',
      ],
      answer: '$16$; $-16$; $3.5$ s; $196$ ft.',
    };
  }
  return pickOne([
    {
      prompt:
        'Dropped from $1024$ ft ($v_0=0$). When does it hit, and with what speed?',
      steps: [
        '$1024-16t^{2}=0$ ⇒ $t=8$.',
        '$v=-32\\cdot 8=-256$ ft/s; speed $256$ ft/s.',
      ],
      answer: '$t=8$ s; speed $256$ ft/s.',
    },
    {
      prompt:
        'Rocket: $v_0=192$ ft/s from ground. Max height time and height? Return time?',
      steps: [
        '$v=192-32t=0$ ⇒ $t=6$, $s=576$ ft.',
        'Ground again at $t=12$; impact speed $192$ ft/s.',
      ],
      answer: '$6$ s; $576$ ft; $12$ s.',
    },
    {
      prompt: 'Convert $256$ ft/s to mi/h using $x\\ \\mathrm{ft/s}=\\tfrac{15}{22}x$ mi/h.',
      steps: ['$\\tfrac{15}{22}\\cdot 256=174\\tfrac{6}{11}$ mi/h.'],
      answer: '$174\\tfrac{6}{11}$ mi/h.',
    },
  ]);
}

/** Circular θ, ω, α. */
export function genCircularDrill({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'From rest: $\\theta=t^{3}/50-t$. Find $\\theta,\\omega,\\alpha$ at $t=10$.',
      steps: [
        '$\\theta=10$ rad.',
        '$\\omega=3t^{2}/50-1=5$ rad/s.',
        '$\\alpha=6t/50=6/5$ rad/s².',
      ],
      answer: '$10$; $5$; $6/5$.',
    };
  }
  const k = pickOne([2, 3, 4]);
  return {
    prompt: `If $\\theta=${k}t^{2}$, find $\\omega$ and $\\alpha$ at $t=2$.`,
    steps: [
      `$\\omega=2\\cdot${k}t=${2 * k}t$ ⇒ $\\omega(2)=${4 * k}$.`,
      `$\\alpha=${2 * k}$ (constant).`,
    ],
    answer: `$\\omega=${4 * k}$; $\\alpha=${2 * k}$.`,
  };
}

/** Mixed. */
export function genSuppMotionMixed({requireNiceAnswer} = {}) {
  const gens = [
    genMotionVaAtT,
    genMotionIntervals,
    genTotalDistance,
    genFreeFallDrill,
    genCircularDrill,
    genSuppSpeedSnapshot,
    genSuppDirectionChanges,
    genSuppFreeFallExtra,
    genSuppDistancePaths,
  ];
  return pickOne(gens)({requireNiceAnswer});
}

/** Prob 10: snapshot of position, direction, speed trend. */
export function genSuppSpeedSnapshot({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'For $s=t^{3}-6t^{2}+9t$: at $t=1/2$ and $t=3/2$, give direction and whether speed is increasing.',
      steps: [
        '$v=3(t-1)(t-3)$, $a=6(t-2)$.',
        '$t=1/2$: $v>0$, $a<0$ ⇒ right, speed decreasing.',
        '$t=3/2$: $v<0$, $a<0$ ⇒ left, speed increasing.',
      ],
      answer: 'Right, slowing; left, speeding up.',
    };
  }
  return pickOne([
    {
      prompt:
        'For $s=t^{3}-6t^{2}+9t$ at $t=5/2$: position, direction, speed trend?',
      steps: [
        '$s=5/8$; $v=-9/4$ (left); $a>0$ with $v<0$ ⇒ speed decreasing.',
      ],
      answer: '$s=5/8$; left; speed decreasing.',
    },
    {
      prompt:
        'For $s=t^{3}-6t^{2}+9t$ at $t=4$: $s$, $v$, and speed trend?',
      steps: ['$s=4$; $v=9$ (right); $a>0$ ⇒ speed increasing.'],
      answer: '$s=4$; right at $9$ ft/s; speeding up.',
    },
  ]);
}

/** Prob 11–12: reverse / direction-change times. */
export function genSuppDirectionChanges({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Locomotive $s=3t^{4}-44t^{3}+144t^{2}$. When is it in reverse ($v<0$ on the usual forward axis)?',
      steps: [
        '$v=12t(t-3)(t-8)$ (factor).',
        'For $t>0$: $v<0$ on $(3,8)$.',
      ],
      answer: '$3<t<8$.',
    };
  }
  return pickOne([
    {
      prompt:
        'Where do direction changes occur for $s=t^{3}-9t^{2}+24t$?',
      steps: ['$v=3(t-2)(t-4)$; turns at $t=2,4$.'],
      answer: '$t=2$ and $t=4$.',
    },
    {
      prompt:
        'Does $s=t^{3}-3t^{2}+3t+3$ ever change direction?',
      steps: [
        '$v=3(t-1)^{2}\\ge 0$; double root at $t=1$ is not a turn.',
      ],
      answer: 'No turns.',
    },
    {
      prompt:
        'Direction changes for $s=2t^{3}-12t^{2}+18t-5$?',
      steps: ['$v=6(t-1)(t-3)$; turns at $1$ and $3$.'],
      answer: '$t=1$ and $t=3$.',
    },
    {
      prompt:
        'Direction changes for $s=3t^{4}-28t^{3}+90t^{2}-108t$?',
      steps: [
        'Factor $v$; only a genuine extremum at $t=1$ among the candidates listed in the book.',
      ],
      answer: 'At $t=1$ (book).',
    },
  ]);
}

/** Prob 13–14, 16–17, 20 free fall extras. */
export function genSuppFreeFallExtra({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt:
        'Ball from roof: $s=96t-16t^{2}$ relative to roof; street is $112$ ft below. Velocity when it hits the street?',
      steps: [
        'Street: $s=-112=96t-16t^{2}$ ⇒ $16t^{2}-96t-112=0$ ⇒ $t^{2}-6t-7=0$ ⇒ $t=7$ ($t\\ge 0$).',
        '$v=96-32t$; $v(7)=-128$ ft/s.',
      ],
      answer: '$-128$ ft/s (book uses $s=96t-16t^{2}$ from roof).',
    };
  }
  return pickOne([
    {
      prompt:
        'For $s=64t-16t^{2}$, show velocity is halved after the first $48$ ft of rise.',
      steps: [
        '$v=64-32t$; $v_0=64$.',
        '$48=64t-16t^{2}$ ⇒ $t^{2}-4t+3=0$ ⇒ $t=1$ (rising).',
        '$v(1)=32=v_0/2$.',
      ],
      answer: 'At $s=48$, $v=32=v_0/2$.',
    },
    {
      prompt: 'Stone dropped down a $144$ ft well: when does it hit?',
      steps: ['$144-16t^{2}=0$ ⇒ $t=3$ s.'],
      answer: '$3$ s.',
    },
    {
      prompt:
        'Dropped from a $10$-story building ($100$ ft). Impact speed in mi/h?',
      steps: [
        '$100-16t^{2}=0$ ⇒ $t=2.5$; $|v|=80$ ft/s.',
        '$\\tfrac{15}{22}\\cdot 80=54\\tfrac{6}{11}$ mi/h.',
      ],
      answer: '$54\\tfrac{6}{11}$ mi/h.',
    },
    {
      prompt:
        'Thrown straight up from ground; returns after $15$ s. Initial $v_0$?',
      steps: [
        'Flight time $2v_0/32=15$ ⇒ $v_0=240$ ft/s.',
      ],
      answer: '$240$ ft/s.',
    },
    {
      prompt:
        'From roof edge: $s=96t-16t^{2}$ (up from roof). At $t=2$: height above street ($112$ ft below roof), $v$, direction?',
      steps: [
        '$s(2)=128$ above roof ⇒ $128+112=240$ ft above street.',
        '$v(2)=96-64=32$ upward.',
      ],
      answer: '$240$ ft above street; $32$ ft/s up.',
    },
  ]);
}

/** Prob 15, 18–19 path distance. */
export function genSuppDistancePaths({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Wheel $\\theta=128t-12t^{2}$. Find $\\omega$ and $\\alpha$ at $t=3$.',
      steps: [
        '$\\omega=128-24t$ ⇒ $\\omega(3)=56$.',
        '$\\alpha=-24$.',
      ],
      answer: '$\\omega=56$ rad/s; $\\alpha=-24$ rad/s².',
    };
  }
  return pickOne([
    {
      prompt:
        'Car $s=8t^{3}-12t^{2}+6t-1$ from $t=0$ to $t=1$. Total distance?',
      steps: [
        '$v=6(2t-1)^{2}\\ge 0$ — no reverse.',
        '$s(1)-s(0)=1-(-1)=2$ miles.',
      ],
      answer: '$2$ miles.',
    },
    {
      prompt:
        'Car $s=5t-t^{2}$ from $t=0$ to $t=3$. Total distance?',
      steps: [
        '$v=5-2t=0$ at $t=2.5$; $s(0)=0$, $s(2.5)=6.25$, $s(3)=6$.',
        'Distance $6.25+|6-6.25|=6.5$ miles.',
      ],
      answer: '$6.5$ miles.',
    },
  ]);
}
