import {randInt, pickOne} from './mathRandom';

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function fmtFrac(num, den) {
  const g = gcd(num, den);
  num /= g;
  den /= g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  if (den === 1) return `${num}`;
  const sign = num < 0 ? '-' : '';
  return `${sign}\\dfrac{${Math.abs(num)}}{${den}}`;
}

/** Prob 1 style: absolute extrema on natural domains. */
export function genAbsOnDomain({requireNiceAnswer} = {}) {
  const book = {
    prompt:
      'Locate absolute max/min on the natural domain: (a) $y=-x^{2}$ (b) $y=(x-3)^{2}$ (c) $y=\\sqrt{25-4x^{2}}$ (d) $y=\\sqrt{x-4}$.',
    steps: [
      '(a) Parabola down: abs max $0$ at $x=0$; no abs min (range $(-\\infty,0]$).',
      '(b) Parabola up: abs min $0$ at $x=3$; no abs max.',
      '(c) Upper semicircle/ellipse: abs max $5$ at $x=0$; abs min $0$ at $x=\\pm 5/2$.',
      '(d) Abs min $0$ at $x=4$; no abs max.',
    ],
    answer: '(a) max $0$ at $0$. (b) min $0$ at $3$. (c) max $5$ at $0$, min $0$ at $\\pm 5/2$. (d) min $0$ at $4$.',
  };
  if (requireNiceAnswer && Math.random() < 0.4) return book;

  const kind = pickOne(['down', 'up', 'sqrt', 'half']);
  if (kind === 'down') {
    const k = pickOne([1, 2, 3]);
    return {
      prompt: `Locate absolute extrema of $y=-${k}x^{2}$ on $\\mathbb{R}$.`,
      steps: [`$y\\le 0$ with equality only at $x=0$.`, 'Opens downward — abs max, no abs min.'],
      answer: `Abs max $0$ at $x=0$; no absolute minimum.`,
    };
  }
  if (kind === 'up') {
    const h = pickOne([1, 2, 3, 4]);
    return {
      prompt: `Locate absolute extrema of $y=(x-${h})^{2}$ on $\\mathbb{R}$.`,
      steps: [`Vertex at $(${h},0)$ is the global bottom.`],
      answer: `Abs min $0$ at $x=${h}$; no absolute maximum.`,
    };
  }
  if (kind === 'sqrt') {
    const R = pickOne([2, 3, 4, 5]);
    return {
      prompt: `Locate absolute extrema of $y=\\sqrt{${R * R}-x^{2}}$ (upper semicircle).`,
      steps: [
        `Domain $[-${R},${R}]$. Max at $x=0$: $y=${R}$.`,
        `Min $0$ at the endpoints $x=\\pm ${R}$.`,
      ],
      answer: `Abs max ${R} at $0$; abs min $0$ at $\\pm ${R}$.`,
    };
  }
  const a = pickOne([1, 2, 3, 4]);
  return {
    prompt: `Locate absolute extrema of $y=\\sqrt{x-${a}}$ on its domain.`,
    steps: [`Domain $[${a},\\infty)$. Value $0$ only at $x=${a}$; grows without bound.`],
    answer: `Abs min $0$ at $x=${a}$; no absolute maximum.`,
  };
}

/** Prob 2 style: cubic analysis with second-derivative test. */
export function genCubicExtremaAnalysis({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt:
        'For $f(x)=\\dfrac{1}{3}x^{3}+\\dfrac{1}{2}x^{2}-6x+8$: find critical numbers; classify relative extrema; state mono intervals.',
      steps: [
        "$f'=x^{2}+x-6=(x+3)(x-2)$ $\\Rightarrow$ critical $-3,\\,2$.",
        "$f''=2x+1$: $f''(-3)=-5<0$ (rel max), $f''(2)=5>0$ (rel min).",
        'Increasing on $(-\\infty,-3)$ and $(2,\\infty)$; decreasing on $(-3,2)$.',
      ],
      answer: 'Crit $-3,2$; rel max at $-3$; rel min at $2$; mono as above.',
    };
  }
  // f'=(x-r)(x-s)=x²-(r+s)x+rs, take f = x³/3 - (r+s)x²/2 + rs x
  const r = -pickOne([2, 3, 4]);
  const s = pickOne([1, 2, 3]);
  const sum = r + s;
  const prod = r * s;
  const fppAt = (x) => 2 * x - sum;
  const maxAt = r < s ? r : s; // more negative critical often max for this cubic shape when leading +
  // For monic cubic, left crit is max, right is min when f'' changes - to +
  const left = Math.min(r, s);
  const right = Math.max(r, s);
  return {
    prompt: `For a cubic with $f'(x)=(x-(${r}))(x-(${s}))$, find critical numbers, use $f''(x)=2x-(${sum})$ to classify, and state mono intervals.`,
    steps: [
      `Critical numbers: $${r}$ and $${s}$.`,
      `$f''(${left})=${fppAt(left)}$ ${fppAt(left) < 0 ? '<0 ⇒ rel max' : '>0 ⇒ rel min'}; $f''(${right})=${fppAt(right)}$ ${fppAt(right) < 0 ? '<0 ⇒ rel max' : '>0 ⇒ rel min'}.`,
      `Sign of $f'$: increasing on $(-\\infty,${left})$ and $(${right},\\infty)$; decreasing on $(${left},${right})$.`,
    ],
    answer: `Crit $${r},${s}$; classify via $f''$; mono intervals as in steps.`,
  };
}

/** Prob 4–5 / 7: no critical / cusp critical / first-deriv test. */
export function genSpecialCritical({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Examine $f(x)=\\dfrac{1}{x-2}$ for relative extrema and mono intervals.',
      steps: [
        "$f'=-(x-2)^{-2}<0$ wherever defined; never $0$.",
        '$x=2$ is not in the domain ⇒ no critical numbers ⇒ no relative extrema.',
        'Decreasing on $(-\\infty,2)$ and on $(2,\\infty)$ separately.',
      ],
      answer: 'No relative extrema; decreasing on each side of the asymptote $x=2$.',
    },
    {
      prompt: 'Locate relative extrema of $f(x)=2+x^{2/3}$ and mono intervals.',
      steps: [
        "$f'=\\dfrac{2}{3}x^{-1/3}$; critical at $0$ ($f'$ undefined).",
        '$f\'<0$ for $x<0$, $f\'>0$ for $x>0$ ⇒ $\\{-,+\\}$ ⇒ abs/rel min at $0$.',
      ],
      answer: 'Absolute (and relative) minimum at $x=0$; dec on $(-\\infty,0)$, inc on $(0,\\infty)$.',
    },
    {
      prompt: 'Determine relative extrema of $f(x)=(x-2)^{2/3}$ (first-derivative test).',
      steps: [
        "$f'=\\dfrac{2}{3}(x-2)^{-1/3}$; critical at $2$ ($f'$ undefined).",
        'For $x<2$, $f\'<0$; for $x>2$, $f\'>0$ ⇒ $\\{-,+\\}$ ⇒ relative min at $2$.',
      ],
      answer: 'Relative minimum at $x=2$.',
    },
  ];
  if (requireNiceAnswer) return pickOne(items);
  return pickOne(items);
}

/** Prob 6 second-derivative applications. */
export function genSecondDerivApps({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Use the second-derivative test on $f(x)=x(12-2x)^{2}$.',
      steps: [
        'Critical numbers $x=2$ and $x=6$ (from $f\'=12(x-6)(x-2)$).',
        '$f\'\'(x)=24(x-4)$: $f\'\'(2)<0$ (rel max), $f\'\'(6)>0$ (rel min).',
      ],
      answer: 'Rel max at $2$; rel min at $6$.',
    };
  }
  return {
    prompt: 'Use the second-derivative test on $f(x)=x^{2}+\\dfrac{250}{x}$ ($x>0$).',
    steps: [
      "$f'=2x-250/x^{2}=0\\Rightarrow x^{3}=125\\Rightarrow x=5$.",
      "$f''(5)=2+500/125=6>0$ ⇒ relative minimum at $x=5$.",
    ],
    answer: 'Relative minimum at $x=5$.',
  };
}

/** Optimization: product max with fixed sum (prob 10). */
export function genOptProductSum({requireNiceAnswer} = {}) {
  const S = requireNiceAnswer && Math.random() < 0.5 ? 50 : pickOne([20, 30, 40, 50, 60]);
  return {
    prompt: `Among positive $u,v$ with $u+v=${S}$, maximize the product $P=uv$.`,
    steps: [
      `$P=u(${S}-u)=${S}u-u^{2}$ on $[0,${S}]$.`,
      `$P'=${S}-2u=0\\Rightarrow u=${S / 2}$, $v=${S / 2}$.`,
      `Table / second-derivative test: max $P=${(S / 2) * (S / 2)}$.`,
    ],
    answer: `$u=v=${S / 2}$, max product $${(S * S) / 4}$.`,
  };
}

/** Optimization: P=(S-x)x² (prob 11). */
export function genOptPartSquare({requireNiceAnswer} = {}) {
  const S = requireNiceAnswer && Math.random() < 0.5 ? 120 : pickOne([60, 90, 120, 150]);
  const crit = (2 * S) / 3;
  const other = S - crit;
  // P=(S-x)x², P'=x(2S-3x) wait book: P=(120-x)x², dP/dx=3x(80-x), crit 0 and 80
  // P = (S-x) x^2, P' = 2x(S-x) - x^2 = x(2S-3x), crit 0 and 2S/3
  // Book said 3x(80-x) for S=120: 2S/3=80. Yes.
  return {
    prompt: `Split ${S} into parts $x$ and ${S}-x$ to maximize $P=(${S}-x)x^{2}$ on $[0,${S}]$.`,
    steps: [
      `$P'=x(2\\cdot${S}-3x)$; critical numbers $0$ and $${fmtFrac(2 * S, 3)}$.`,
      `Compare $P(0), P(${fmtFrac(2 * S, 3)}), P(${S})$ — maximum at $x=${fmtFrac(2 * S, 3)}$.`,
    ],
    answer: `Parts $${fmtFrac(2 * S, 3)}$ and $${fmtFrac(S, 3)}$ (here ${crit} and ${other} when integer).`,
  };
}

/** Closed can / open can surface (prob 14 simplified). */
export function genOptCylinder({requireNiceAnswer} = {}) {
  const V = requireNiceAnswer && Math.random() < 0.5 ? 64 : pickOne([27, 64, 125]);
  const open = Math.random() < 0.5;
  if (open) {
    return {
      prompt: `Open cylinder, volume ${V}. Minimize metal $A=2\\pi r h+\\pi r^{2}$ with $\\pi r^{2}h=${V}$.`,
      steps: [
        `$h=${V}/(\\pi r^{2})$, $A=${2 * V}/r+\\pi r^{2}$.`,
        `$A'=0\\Rightarrow \\pi r^{3}=${V}\\Rightarrow r=\\sqrt[3]{${V}/\\pi}$, and $h=r$.`,
        'First-derivative sign change / unique critical number ⇒ absolute min.',
      ],
      answer: `Open can: $r=h=\\sqrt[3]{${V}/\\pi}$.`,
    };
  }
  return {
    prompt: `Closed cylinder, volume ${V}. Minimize $A=2\\pi rh+2\\pi r^{2}$.`,
    steps: [
      `$A=${2 * V}/r+2\\pi r^{2}$.`,
      `$A'=0\\Rightarrow \\pi r^{3}=${V / 2}$ (book: $64\\Rightarrow r=2\\sqrt[3]{4/\\pi}$, $h=2r$).`,
      'Unique positive critical number ⇒ absolute minimum surface.',
    ],
    answer: `Closed: $h=2r$ with $r=\\sqrt[3]{${V}/(2\\pi)}$.`,
  };
}

/** Profit max (prob 15 style). */
export function genOptProfit({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'Cost $\\tfrac14 x^{2}+35x+25$, price $50-\\tfrac12 x$. Maximize daily profit; check average cost critical point.',
      steps: [
        '$P=x(50-\\tfrac12 x)-(\\tfrac14 x^{2}+35x+25)$; $P\'=15-\\tfrac32 x=0\\Rightarrow x=10$.',
        "$P''=-3/2<0$ ⇒ max profit at $10$ sets/day.",
        'Average cost $C=\\tfrac14 x+35+25/x$; $C\'=0$ also at $x=10$ (rel min).',
      ],
      answer: 'Output $x=10$ maximizes profit; average cost has a relative min there too.',
    };
  }
  const a = pickOne([40, 50, 60]);
  return {
    prompt: `Price per item $${a}-x$, cost $x^{2}+10x+5$. Maximize profit $P=x(${a}-x)-(x^{2}+10x+5)$ for $x>0$.`,
    steps: [
      `$P=(${a}-10)x-2x^{2}-5$; $P'=${a - 10}-4x=0\\Rightarrow x=${fmtFrac(a - 10, 4)}$.`,
      "$P''=-4<0$ ⇒ relative (hence absolute, unique crit) maximum.",
    ],
    answer: `Produce $x=${fmtFrac(a - 10, 4)}$ items per day.`,
  };
}

/** Prob 3 style: factored cubic derivative / mono intervals. */
export function genQuarticCritSketch({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'For $f(x)=x^{4}+2x^{3}-3x^{2}-4x+4$ with $f\'(x)=2(x-1)(2x+1)(x+2)$: list critical numbers, classify via $f\'\'$, state mono intervals.',
      steps: [
        'Critical: $1$, $-1/2$, $-2$.',
        '$f\'\'(1)>0$ min; $f\'\'(-1/2)<0$ max; $f\'\'(-2)>0$ min.',
        'Inc on $(-2,-1/2)$ and $(1,\\infty)$; dec on $(-\\infty,-2)$ and $(-1/2,1)$.',
      ],
      answer: 'Crit $-2,-1/2,1$; mins at $-2,1$; max at $-1/2$; mono as above.',
    };
  }
  const a = pickOne([-3, -2, -1]);
  const b = pickOne([-1, 0]);
  const c = pickOne([1, 2]);
  return {
    prompt: `Suppose $f'(x)=(x-(${a}))(x-(${b}))(x-(${c}))$ with three distinct real zeros. List critical numbers and the mono pattern from the sign chart of $f'$.`,
    steps: [
      `Critical numbers: $${a}$, $${b}$, $${c}$ (assume ordered $${a}<${b}<${c}$).`,
      'Cubic factor with positive leading coeff: $f\'$ is $-$ left of leftmost root, then alternates.',
      'Inc where $f\'>0$, dec where $f\'<0$.',
    ],
    answer: `Critical $${a},${b},${c}$; sign-chart $f'$ for mono intervals.`,
  };
}

/** Prob 12 poster margins (scaled). */
export function genOptPoster({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'Poster area $18\\,\\mathrm{ft}^{2}$; top/bottom margins $9$ in ($3/4$ ft each side of height? book: $1$ ft total vertical margin), side margins $6$ in ($1/2$ ft each). Maximize printed area $A=(x-1)(18/x-3/2)$.',
      steps: [
        "$A' = 18/x^{2}-3/2=0\\Rightarrow x=2\\sqrt{3}$.",
        "$A''=-36/x^{3}<0$ at the critical number ⇒ relative max.",
        'Unique critical number on $(0,\\infty)$ ⇒ absolute max; other side $3\\sqrt{3}$ ft.',
      ],
      answer: 'Dimensions $2\\sqrt{3}$ ft by $3\\sqrt{3}$ ft.',
    };
  }
  const area = pickOne([12, 18, 24]);
  return {
    prompt: `Sheet area $${area}$. Printed area $A=(x-1)(${area}/x-1)$ (1 ft margins each direction). Maximize $A$ for $x>1$.`,
    steps: [
      `$A'=${area}/x^{2}-1=0\\Rightarrow x=\\sqrt{${area}}$.`,
      'Second-derivative / unique critical number ⇒ absolute max of printed area.',
    ],
    answer: `Optimal width $x=\\sqrt{${area}}$ (then height $${area}/x$).`,
  };
}

/** Prob 13 ships — minimize distance. */
export function genOptShips({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'At $t=0$, ship B is 65 mi east of A. B sails west at 10 mi/h, A south at 15 mi/h. When are they nearest, and how near?',
      steps: [
        '$D^{2}=(15t)^{2}+(65-10t)^{2}$; minimize $D$ via $dD/dt=0$.',
        '$(325t-650)/D=0\\Rightarrow t=2$ h (11 a.m. if start 9 a.m.).',
        'First-derivative test $\\{-,+\\}$ + unique crit ⇒ abs min; $D=15\\sqrt{13}$ mi.',
      ],
      answer: 'Nearest at $t=2$ h; distance $15\\sqrt{13}$ mi.',
    };
  }
  const east = pickOne([40, 50, 65]);
  const vB = pickOne([8, 10, 12]);
  const vA = pickOne([12, 15, 16]);
  // D²=(vA t)²+(east-vB t)²; d/dt of D² = 2 vA² t + 2(east-vB t)(-vB)=0
  // vA² t - vB(east - vB t)=0 ⇒ (vA²+vB²)t = vB east ⇒ t = vB*east/(vA²+vB²)
  const tNum = vB * east;
  const tDen = vA * vA + vB * vB;
  return {
    prompt: `B starts ${east} mi east of A; B west at ${vB} mi/h, A south at ${vA} mi/h. Find $t$ minimizing separation.`,
    steps: [
      `$D^{2}=(${vA}t)^{2}+(${east}-${vB}t)^{2}$.`,
      `Set derivative of $D^{2}$ to $0$: $t=\\dfrac{${tNum}}{${tDen}}$.`,
      'Unique positive critical number + first-derivative test ⇒ absolute minimum distance.',
    ],
    answer: `$t=${fmtFrac(tNum, tDen)}$ hours after start.`,
  };
}

/** Prob 16 locomotive cost per mile. */
export function genOptLocomotive({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Fuel cost $\\propto v^{2}$; \\$25/h at $25$ mi/h. Other costs \\$100/h. Minimize cost per mile $C=(v/25+100)/v$.',
      steps: [
        '$k=1/25$; $C=v/25+100/v$.',
        "$C'=1/25-100/v^{2}=0\\Rightarrow v=50$.",
        "$C''>0$ at $50$ + unique crit on $(0,\\infty)$ ⇒ abs min.",
      ],
      answer: 'Most economical speed $50$ mi/h.',
    };
  }
  const other = pickOne([80, 100, 120]);
  // C = v/25 + other/v; C'=1/25 - other/v²=0 ⇒ v²=25*other ⇒ v=5√other
  return {
    prompt: `Fuel cost $v^{2}/25$ dollars per hour; fixed costs $${other}$/h. Minimize $C=(v/25+${other})/v$ for $v>0$.`,
    steps: [
      `$C'=1/25-${other}/v^{2}=0\\Rightarrow v=5\\sqrt{${other}}$.`,
      'Second-derivative test + uniqueness ⇒ absolute minimum cost/mile.',
    ],
    answer: `Speed $v=5\\sqrt{${other}}$ mi/h.`,
  };
}

/** Prob 17 boat to shore (Snell-type). */
export function genOptBoat({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'Boat 5 mi offshore at P; destination B is 6 mi along shore from nearest point A. Row 2 mi/h, walk 4 mi/h. Land at C with $AC=x$ to minimize time.',
      steps: [
        '$t=\\sqrt{25+x^{2}}/2+(6-x)/4$.',
        "$t'=0\\Rightarrow 2x=\\sqrt{25+x^{2}}\\Rightarrow x=(5/3)\\sqrt{3}\\approx 2.89$.",
        'Check endpoints / unique interior crit for absolute min time.',
      ],
      answer: 'Land about $2.89$ mi from A toward B ($x=\\tfrac{5}{3}\\sqrt{3}$).',
    };
  }
  const offshore = pickOne([3, 4, 5]);
  const along = pickOne([5, 6, 8]);
  const row = 2;
  const walk = 4;
  return {
    prompt: `Offshore ${offshore} mi; walk ${along} mi along shore. Row ${row} mi/h, walk ${walk} mi/h. Set up $t(x)$ and the equation $t'=0$.`,
    steps: [
      `$t=\\sqrt{${offshore * offshore}+x^{2}}/${row}+(${along}-x)/${walk}$.`,
      `$t'=0\\Leftrightarrow \\dfrac{x}{${row}\\sqrt{${offshore * offshore}+x^{2}}}=\\dfrac{1}{${walk}}$ (Snell form).`,
    ],
    answer: `Solve $\\dfrac{x}{${row}\\sqrt{${offshore}^{2}+x^{2}}}=\\dfrac{1}{${walk}}$ for landing offset $x$.`,
  };
}

/** Prob 18 river fence: x=2y. */
export function genOptFence({requireNiceAnswer} = {}) {
  return {
    prompt:
      'Rectangular field along a straight river (no fence on river side). Fixed area $A=xy$. Show least fencing $F=x+2y$ occurs when length $x$ is twice the width $y$.',
    steps: [
      'From $A$ constant: $y+x\\,dy/dx=0\\Rightarrow dy/dx=-y/x$.',
      '$dF/dx=1+2\\,dy/dx=0\\Rightarrow dy/dx=-1/2$.',
      'Equate: $-y/x=-1/2\\Rightarrow x=2y$. Second-derivative test confirms a minimum.',
    ],
    answer: 'Least fence when length along the river is twice the width ($x=2y$).',
  };
}

/** Prob 19 cone about sphere. */
export function genOptConeSphere({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.6) {
    return {
      prompt:
        'Right circular cone circumscribed about a sphere of radius $8$. With apex-to-center distance $y$ ($y>8$), show $V=\\dfrac{64\\pi(y+8)^{2}}{3(y-8)}$ and find the critical $y$.',
      steps: [
        'Similar triangles: $x/8=(y+8)/\\sqrt{y^{2}-64}$.',
        '$V=\\pi x^{2}(y+8)/3$ reduces to the displayed formula.',
        "$V'\\propto(y+8)(y-24)/(y-8)^{2}=0\\Rightarrow y=24$ (with $y>8$).",
        'Then height $y+8=32$, base radius $x=8\\sqrt{2}$.',
      ],
      answer: 'Critical $y=24$; cone height $32$, base radius $8\\sqrt{2}$.',
    };
  }
  const R = pickOne([4, 6, 8]);
  return {
    prompt: `Cone about a sphere of radius $${R}$. Using similar triangles with apex-to-center $y>${R}$, write $V(y)$ and the condition $V'=0$.`,
    steps: [
      `$x/${R}=(y+${R})/\\sqrt{y^{2}-${R * R}}$.`,
      `$V\\propto (y+${R})^{2}/(y-${R})$; critical when $y=${3 * R}$ (book pattern $y=24$ for $R=8$).`,
    ],
    answer: `For radius $${R}$, expect critical $y=${3 * R}$ (height $${4 * R}$).`,
  };
}

/** Prob 20: max-area rectangle in parabola y²=4px cut by x=a. */
export function genOptParabolaRect({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'Max-area rectangle inscribed in $y^{2}=4px$ cut by $x=a$. With corner $(x,y)$ on the parabola, $A=2y(a-x)=2ay-y^{3}/(2p)$. Find critical $y$ and the dimensions.',
      steps: [
        "$A'=2a-3y^{2}/(2p)=0\\Rightarrow y=\\sqrt{4ap/3}$.",
        'Width $a-x=2a/3$; height $2y=(4/3)\\sqrt{3ap}$.',
        "$A''=-3y/p<0$ + unique crit ⇒ absolute maximum area.",
      ],
      answer: 'Height $\\dfrac{4}{3}\\sqrt{3ap}$, depth $2a/3$.',
    };
  }
  const a = pickOne([3, 4, 6, 9]);
  const p = pickOne([1, 2, 3]);
  return {
    prompt: `Parabola $y^{2}=4\\cdot${p}\\,x$ cut by $x=${a}$. Maximize inscribed rectangle area $A=2y(${a}-y^{2}/(4\\cdot${p}))$.`,
    steps: [
      `$A'=2\\cdot${a}-3y^{2}/(2\\cdot${p})=0\\Rightarrow y=\\sqrt{4\\cdot${a}\\cdot${p}/3}$.`,
      `Depth along $x$: $a-x=2a/3=${(2 * a) / 3}$.`,
    ],
    answer: `$y=\\sqrt{${(4 * a * p) / 3}}$; depth $${(2 * a) / 3}$.`,
  };
}

/** Prob 21: max-volume cylinder in a sphere. */
export function genOptCylInSphere({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.55) {
    return {
      prompt:
        'Right circular cylinder inscribed in a sphere of radius $R$. With half-height $h$ and base radius $r$ ($r^{2}+h^{2}=R^{2}$), maximize $V=2\\pi r^{2}h$. Show the full height is $2R/\\sqrt{3}$.',
      steps: [
        'From $r^{2}+h^{2}=R^{2}$: $dh/dr=-r/h$.',
        "$dV/dr=0\\Rightarrow r^{2}=2h^{2}$, so $R^{2}=3h^{2}\\Rightarrow h=R/\\sqrt{3}$.",
        'Full height $2h=2R/\\sqrt{3}$. Second-derivative / uniqueness ⇒ max volume.',
      ],
      answer: 'Cylinder height $2R/\\sqrt{3}$.',
    };
  }
  const R = pickOne([3, 6, 8, 9]);
  return {
    prompt: `Sphere radius $${R}$. Inscribed cylinder: relate $r,h$ by $r^{2}+h^{2}=R^{2}$ and find the height $2h$ maximizing volume.`,
    steps: [
      `$V=2\\pi r^{2}h$; at max, $r^{2}=2h^{2}$.`,
      `$h=${R}/\\sqrt{3}$, full height $2${R}/\\sqrt{3}$.`,
    ],
    answer: `Height $2\\cdot${R}/\\sqrt{3}$.`,
  };
}

/** Prob 22 / 30: shortest beam or ladder over a wall. */
export function genOptShortestBeam({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Brace a building with a beam over a parallel wall $10$ ft high and $8$ ft from the building. Minimize $L$ (Fig. 14-16 style).',
      steps: [
        'Similar triangles: $y=10(x+8)/x$; $L=(x+8)\\sqrt{x^{2}+100}/x$.',
        "$L'\\propto(x^{3}-800)/(\\cdots)=0\\Rightarrow x=2\\sqrt[3]{100}$.",
        'Shortest length $(\\sqrt[3]{100}+4)^{3/2}$ ft; first-derivative test + uniqueness ⇒ absolute min.',
      ],
      answer: '$L=(\\sqrt[3]{100}+4)^{3/2}$ ft at $x=2\\sqrt[3]{100}$.',
    };
  }
  // Prob 30 style: wall 8 ft, distance 27/8 ft
  return {
    prompt:
      'Wall $8$ ft high is $27/8$ ft from a house. Shortest ladder leaning over the wall (same similar-triangles setup as the beam problem).',
    steps: [
      'Critical when $x^{3}=8^{3}\\cdot(27/8)$ in the book pattern, or equate $L\'=0$.',
      'Book answer: shortest ladder $15\\tfrac{5}{8}$ ft.',
    ],
    answer: 'Shortest ladder $15\\tfrac{5}{8}$ ft.',
  };
}

/** Supp 23(f–i): classify relative extrema (first-derivative / factor). */
export function genSuppRelExtremaClassify({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Classify relative extrema of $f(x)=(x^{2}-4)^{2}$.',
      steps: [
        "$f'=4x(x^{2}-4)$; critical $0,\\pm 2$.",
        'Rel max $16$ at $x=0$; rel min $0$ at $x=\\pm 2$.',
      ],
      answer: 'Max $16$ at $0$; min $0$ at $\\pm 2$.',
    },
    {
      prompt: 'Classify relative extrema of $f(x)=(x-4)^{4}(x+3)^{3}$.',
      steps: [
        'Critical at $4$, $-3$, and an interior factor zero $x=0$ (book).',
        'Rel max $6912$ at $0$; rel min $0$ at $4$; neither at $-3$.',
      ],
      answer: 'Max $6912$ at $0$; min $0$ at $4$; neither at $-3$.',
    },
    {
      prompt: 'Classify relative extrema of $f(x)=x^{3}+48/x$ ($x\\neq 0$).',
      steps: [
        "$f'=3x^{2}-48/x^{2}=0\\Rightarrow x^{4}=16\\Rightarrow x=\\pm 2$.",
        'Rel max $-32$ at $-2$; rel min $32$ at $2$.',
      ],
      answer: 'Max $-32$ at $-2$; min $32$ at $2$.',
    },
    {
      prompt: 'Classify relative extrema of $f(x)=(x-1)^{1/3}(x+2)^{2/3}$.',
      steps: [
        'Critical where derivative vanishes or is undefined: $-2,\\,0,\\,1$.',
        'Rel max $0$ at $-2$; rel min $-\\sqrt[3]{4}$ at $0$; neither at $1$.',
      ],
      answer: 'Max $0$ at $-2$; min $-\\sqrt[3]{4}$ at $0$; neither at $1$.',
    },
  ];
  return pickOne(items);
}

/** Supp 25: least-squares / mean of a_i. */
export function genSuppSumSquaresMin({requireNiceAnswer} = {}) {
  const n = requireNiceAnswer && Math.random() < 0.5 ? 3 : pickOne([3, 4, 5]);
  const vals = Array.from({length: n}, () => randInt(1, 9));
  const sum = vals.reduce((s, v) => s + v, 0);
  const mean = fmtFrac(sum, n);
  const list = vals.map((v) => `a_{i}=${v}`).join(', ');
  return {
    prompt: `Show $y=\\sum_{i=1}^{n}(a_i-x)^{2}$ has an absolute min at the mean. Example: ${list}.`,
    steps: [
      "$y'= -2\\sum(a_i-x)=0\\Rightarrow x=(\\sum a_i)/n$.",
      "$y''=2n>0$ ⇒ absolute minimum at the arithmetic mean.",
    ],
    answer: `Absolute min at $x=${mean}$.`,
  };
}

/** Supp 26: absolute extrema on an interval. */
export function genSuppAbsOnInterval({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Absolute extrema of $y=-x^{2}$ on $(-2,2)$.',
      steps: ['Open interval: max $0$ at $x=0$; no absolute min (approaches $-4$ at ends but ends excluded).'],
      answer: 'Abs max $0$ at $0$; no abs min on the open interval.',
    },
    {
      prompt: 'Absolute extrema of $y=(x-3)^{2}$ on $[0,4]$.',
      steps: ['Crit $x=3$: $y=0$ (min). Endpoints: $y(0)=9$, $y(4)=1$.'],
      answer: 'Max $9$ at $0$; min $0$ at $3$.',
    },
    {
      prompt: 'Absolute extrema of $y=\\sqrt{25-4x^{2}}$ on $[-2,2]$.',
      steps: ['Max $5$ at $0$; at $\\pm 2$: $y=3$.'],
      answer: 'Max $5$ at $0$; min $3$ at $\\pm 2$.',
    },
    {
      prompt: 'Absolute extrema of $y=\\sqrt{x-4}$ on $[4,29]$.',
      steps: ['Increasing: min $0$ at $4$; max $5$ at $29$.'],
      answer: 'Max $5$ at $29$; min $0$ at $4$.',
    },
  ];
  if (requireNiceAnswer) return pickOne(items);
  return pickOne(items);
}

/** Supp 27–28: two-number optimizations. */
export function genSuppTwoNumbers({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt: 'Positive numbers sum to $20$. Maximize product; minimize sum of squares; maximize (one)$^{2}$(other)$^{3}$.',
      steps: [
        '(a) $10,10$. (b) $10,10$. (c) Critical from $P=x^{2}(20-x)^{3}$ ⇒ $8$ and $12$.',
      ],
      answer: '(a) $10,10$; (b) $10,10$; (c) $8,12$.',
    },
    {
      prompt: 'Positive numbers product $16$. Minimize sum; minimize $x+y^{2}$ with $xy=16$.',
      steps: ['(a) $4,4$. (b) $8$ and $2$.'],
      answer: '(a) $4,4$; (b) $8,2$.',
    },
  ];
  return pickOne(items);
}

/** Supp applied: box cost, order size, triangle area, distance, coil, etc. */
export function genSuppAppliedOpt({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt:
        'Open box, square ends, volume $6400$. Base $\$0.75/\\mathrm{ft}^{2}$, sides $\$0.25/\\mathrm{ft}^{2}$. Most economical dimensions?',
      steps: ['Cost $C=0.75x^{2}+0.25\\cdot 4xh$ with $x^{2}h=6400$.', 'Critical ⇒ $20\\times 20\\times 16$.'],
      answer: '$20\\times 20\\times 16$.',
    },
    {
      prompt:
        'Charges $\$30$ per thousand up to $50{,}000$; then $-37.5\\phi$ per extra thousand. Order size maximizing receipts?',
      steps: ['Revenue function in thousands $n$; critical at $n=65$.'],
      answer: '$65{,}000$.',
    },
    {
      prompt: 'Line through $(3,4)$ cutting min-area first-quadrant triangle. Find its equation.',
      steps: ['Intercepts $a,b$ with $4/a+3/b=1$ form; minimize $\\tfrac12 ab$.', 'Result $4x+3y-24=0$.'],
      answer: '$4x+3y-24=0$.',
    },
    {
      prompt: 'On $y=4-x^{2}$ in Q1, point where tangent + axes make min-area triangle.',
      steps: ['Tangent at $(x_0,4-x_0^{2})$; minimize triangle area.', 'Book: $(2\\sqrt{3}/3,\\,8/3)$.'],
      answer: '$(2\\sqrt{3}/3,\\,8/3)$.',
    },
    {
      prompt: 'Minimum distance from $(4,2)$ to the parabola $y^{2}=8x$.',
      steps: ['Minimize $(x-4)^{2}+(y-2)^{2}$ subject to $y^{2}=8x$.', 'Distance $2\\sqrt{2}$.'],
      answer: '$2\\sqrt{2}$.',
    },
    {
      prompt: 'Force $F=kx/(x^{2}+r^{2})^{5/2}$. Show $F$ is greatest when $x=r/2$.',
      steps: ["$F'=0\\Rightarrow$ numerator factor $r^{2}-4x^{2}=0$ (for $x>0$) $\\Rightarrow x=r/2$."],
      answer: 'Max force at $x=\\tfrac12 r$.',
    },
    {
      prompt: 'Work $\\propto E^{2}R/(r+R)^{2}$. Show max when external $R$ equals internal $r$.',
      steps: ["Differentiate wrt $R$: critical at $R=r$; second-derivative / uniqueness ⇒ max."],
      answer: 'Greatest work when $R=r$.',
    },
    {
      prompt: 'Max-area rectangle inscribed in $x^{2}/400+y^{2}/225=1$ (sides parallel to axes).',
      steps: ['$A=4xy$ with ellipse constraint ⇒ $20\\sqrt{2}\\times 15\\sqrt{2}$.'],
      answer: '$20\\sqrt{2}\\times 15\\sqrt{2}$.',
    },
    {
      prompt: 'Max-volume cone inscribed in a sphere of radius $r$. Find cone base radius $R$.',
      steps: ['Similar triangles / $V=\\tfrac13\\pi R^{2}h$; critical $R=\\tfrac23 r\\sqrt{2}$.'],
      answer: '$R=\\dfrac{2}{3}r\\sqrt{2}$.',
    },
    {
      prompt: 'Cylinder inscribed in a cone of base radius $r$: (a) max volume radius; (b) max lateral area radius.',
      steps: ['(a) $R=\\tfrac23 r$. (b) $R=\\tfrac12 r$.'],
      answer: '(a) $2r/3$; (b) $r/2$.',
    },
    {
      prompt: 'Conical tent of fixed volume: show least material when height $h=r\\sqrt{2}$.',
      steps: ['$A=\\pi r\\sqrt{r^{2}+h^{2}}$ (book note uses $\\pi(r^{2}+h^{2})$ form — lateral+floor variant).', 'With $V$ fixed, critical ratio $h=r\\sqrt{2}$.'],
      answer: 'Least material when $h=r\\sqrt{2}$.',
    },
    {
      prompt: 'Cylinder of max lateral area inscribed in a sphere of radius $8$. Dimensions?',
      steps: ['Same geometry as Prob 21 with lateral $2\\pi rh$ maximized.', 'Book: $h=2r=8\\sqrt{2}$.'],
      answer: '$h=2r=8\\sqrt{2}$.',
    },
  ];
  return pickOne(items);
}

/** Supp 35–36 style: implicit y-extrema / numeric absolute on interval. */
export function genSuppImplicitOrNumeric({requireNiceAnswer} = {}) {
  const items = [
    {
      prompt:
        'From $2x^{2}-4xy+3y^{2}-8x+8y-1=0$, find max/min values of $y$ (implicit differentiation).',
      steps: [
        'Differentiate, set $dy/dx=0$, solve with the original equation.',
        'Max at $(5,3)$; min at $(-1,-3)$.',
      ],
      answer: 'Max $(5,3)$; min $(-1,-3)$.',
    },
    {
      prompt:
        'Absolute max/min of $f(x)=x^{5}-3x^{2}-8x-3$ on $[-1,2]$ (three decimals; GC OK).',
      steps: [
        'Solve $f\'=0$ numerically on the interval; compare with endpoints.',
        'Max $\\approx 1.191$ at $x\\approx -0.866$; min $\\approx -14.786$ at $x\\approx 1.338$.',
      ],
      answer: 'Max $\\approx 1.191$ at $-0.866$; min $\\approx -14.786$ at $1.338$.',
    },
  ];
  return pickOne(items);
}

export function genSuppExtremaMixed(opts) {
  return pickOne([
    genSuppRelExtremaClassify,
    genSuppSumSquaresMin,
    genSuppAbsOnInterval,
    genSuppTwoNumbers,
    genSuppAppliedOpt,
    genSuppImplicitOrNumeric,
    genOptParabolaRect,
    genOptCylInSphere,
    genOptShortestBeam,
  ])(opts);
}

export function genExtremaMixed(opts) {
  return pickOne([
    genAbsOnDomain,
    genCubicExtremaAnalysis,
    genQuarticCritSketch,
    genSpecialCritical,
    genSecondDerivApps,
    genOptProductSum,
    genOptPartSquare,
    genOptCylinder,
    genOptProfit,
    genOptPoster,
    genOptShips,
    genOptLocomotive,
    genOptBoat,
    genOptFence,
    genOptConeSphere,
    genOptParabolaRect,
    genOptCylInSphere,
    genOptShortestBeam,
  ])(opts);
}
