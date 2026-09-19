import {pickOne} from './mathRandom';

/** Linear approximation drills. */
export function genLinearApprox({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Approximate $\\sqrt[3]{124}$ using $f(x)=x^{1/3}$, $x=125$, $\\Delta x=-1$.',
      steps: [
        '$f(125)=5$, $f\'(x)=\\frac13 x^{-2/3}$, $f\'(125)=1/75$.',
        '$\\sqrt[3]{124}\\approx 5+(1/75)(-1)=374/75\\approx 4.9867$.',
      ],
      answer: '$\\approx 4.9867$ (true $\\approx 4.9866$).',
    };
  }
  return pickOne([
    {
      prompt:
        'Approximate $\\sin 61^\\circ$ from $\\sin(\\pi/3)$ with $\\Delta x=\\pi/180$.',
      steps: [
        '$f=\\sin$, $f(\\pi/3)=\\sqrt{3}/2$, $f\'=\\cos(\\pi/3)=1/2$.',
        '$\\sin 61^\\circ\\approx \\sqrt{3}/2+(\\pi/360)\\approx 0.8747$.',
      ],
      answer: '$\\approx 0.8747$ (true $\\approx 0.8746$).',
    },
    {
      prompt:
        'Cube side $x$ grows by $1\\%$. Approximate the relative change in $V=x^{3}$.',
      steps: [
        '$\\Delta x=0.01x$, $dV\\approx 3x^{2}\\cdot 0.01x=0.03x^{3}$.',
        'Volume increases by about $3\\%$.',
      ],
      answer: '$\\Delta V\\approx 0.03x^{3}$ ($\\approx 3\\%$).',
    },
    {
      prompt: 'Estimate $\\sqrt{16.2}$ with $x=16$, $\\Delta x=0.2$.',
      steps: ['$f\'(16)=1/8$ ⇒ $4+(1/8)(0.2)=4.025$.'],
      answer: '$4.025$.',
    },
    {
      prompt: 'Approximate $\\sqrt[4]{17}$ from $x=16$, $\\Delta x=1$.',
      steps: [
        '$f=x^{1/4}$, $f(16)=2$, $f\'(16)=1/(4\\cdot 8)=1/32$.',
        '$2+(1/32)=2.03125$.',
      ],
      answer: '$2.03125$.',
    },
    {
      prompt: 'Approximate $\\cos 59^\\circ$ from $\\cos(\\pi/3)$ with $\\Delta x=-\\pi/180$.',
      steps: [
        '$f\'=-\\sin(\\pi/3)=-\\sqrt{3}/2$.',
        '$\\tfrac12+(\\sqrt{3}/2)(\\pi/180)\\approx 0.5151$.',
      ],
      answer: '$\\approx 0.5151$.',
    },
  ]);
}

/** Error / small-change applications. */
export function genErrorDifferentials({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt:
        'Circular plate: radius $5\\to 5.06$. Estimate $\\Delta A$ for $A=\\pi r^{2}$.',
      steps: [
        '$dA=2\\pi r\\,dr=2\\pi\\cdot 5\\cdot 0.06=0.6\\pi\\approx 1.88$ in².',
      ],
      answer: '$0.6\\pi\\approx 1.88$ in².',
    };
  }
  return pickOne([
    {
      prompt: 'Approximate $\\Delta(x^{3})$ as $x$ goes $5\\to 5.01$.',
      steps: ['$d(x^{3})=3x^{2}\\,dx=3\\cdot 25\\cdot 0.01=0.75$.'],
      answer: '$0.75$.',
    },
    {
      prompt: 'Approximate $\\Delta(1/x)$ as $x$ goes $1\\to 0.98$.',
      steps: ['$d(1/x)=-dx/x^{2}=-( -0.02)/1=0.02$.'],
      answer: '$0.02$ (value increases).',
    },
    {
      prompt:
        'Ice ball $r:10\\to 9.8$. Estimate decrease in volume and surface.',
      steps: [
        '$dV=4\\pi r^{2}\\,dr=4\\pi\\cdot 100\\cdot(-0.2)=-80\\pi$.',
        '$dS=8\\pi r\\,dr=8\\pi\\cdot 10\\cdot(-0.2)=-16\\pi$.',
      ],
      answer: 'Volume $\\downarrow 80\\pi$; surface $\\downarrow 16\\pi$.',
    },
    {
      prompt:
        '$v=\\sqrt{64.4 h}$; $h=100\\pm 0.5$. Estimate error in $v$.',
      steps: [
        '$dv=(32.2/\\sqrt{64.4 h})\\,dh$; at $h=100$, $|dv|\\approx 0.2$ ft/s.',
      ],
      answer: '$\\approx 0.2$ ft/s.',
    },
    {
      prompt:
        'Fly 2 mi above the equator vs along it. Extra distance?',
      steps: [
        'Circumference $C=2\\pi R$; $dC=2\\pi\\,dR=2\\pi\\cdot 2\\approx 12.6$ mi.',
      ],
      answer: '$\\approx 12.6$ mi.',
    },
    {
      prompt:
        'Area to $\\pm 0.1$ in²; $|dr|\\le 0.001$. Max $r$ for $A=\\pi r^{2}$?',
      steps: [
        '$|dA|=2\\pi r|dr|\\le 0.1$ ⇒ $r\\le 0.1/(2\\pi\\cdot 0.001)\\approx 16$.',
      ],
      answer: '$r\\le 16$ in.',
    },
    {
      prompt: '$pV=20$, $p=5\\pm 0.02$. Estimate $V$.',
      steps: [
        '$V=4$; $dV=-20\\,dp/p^{2}=-20(0.02)/25=-0.016$.',
      ],
      answer: '$V=4\\pm 0.016$.',
    },
    {
      prompt: '$F=1/r^{2}$, $F=4\\pm 0.05$. Estimate $r$.',
      steps: [
        '$r=1/2$; $dF=-2/r^{3}\\,dr$ ⇒ $|dr|=|dF|\\cdot r^{3}/2\\approx 0.003$.',
      ],
      answer: '$r=0.5\\pm 0.003$.',
    },
  ]);
}

/** Compute dy for explicit f. */
export function genDifferentialDy({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.45) {
    return {
      prompt: 'Find $dy$ if $y=x^{3}+4x^{2}-5x+6$.',
      steps: ['$dy=(3x^{2}+8x-5)\\,dx$.'],
      answer: '$(3x^{2}+8x-5)\\,dx$.',
    };
  }
  return pickOne([
    {
      prompt: 'Find $dy$ if $y=(2x^{3}+5)^{3/2}$.',
      steps: [
        '$dy=\\tfrac32(2x^{3}+5)^{1/2}\\cdot 6x^{2}\\,dx=9x^{2}(2x^{3}+5)^{1/2}\\,dx$.',
      ],
      answer: '$9x^{2}\\sqrt{2x^{3}+5}\\,dx$.',
    },
    {
      prompt: 'Find $dy$ if $y=(x^{3}+2x+1)/(x^{2}+3)$.',
      steps: [
        'Quotient rule in differentials.',
        '$dy=\\dfrac{x^{4}+7x^{2}-2x+6}{(x^{2}+3)^{2}}\\,dx$.',
      ],
      answer: '$\\dfrac{x^{4}+7x^{2}-2x+6}{(x^{2}+3)^{2}}\\,dx$.',
    },
    {
      prompt: 'Find $dy$ if $y=\\cos^{2}(2x)+\\sin(3x)$.',
      steps: [
        '$dy=(-4\\sin 2x\\cos 2x+3\\cos 3x)\\,dx=(-2\\sin 4x+3\\cos 3x)\\,dx$.',
      ],
      answer: '$(-2\\sin 4x+3\\cos 3x)\\,dx$.',
    },
    {
      prompt: 'Find $dy$ if $y=(5-x)^{3}$.',
      steps: ['$dy=-3(5-x)^{2}\\,dx$.'],
      answer: '$-3(5-x)^{2}\\,dx$.',
    },
    {
      prompt: 'Find $dy$ if $y=(\\sin x)/x$.',
      steps: ['$dy=\\dfrac{x\\cos x-\\sin x}{x^{2}}\\,dx$.'],
      answer: '$\\dfrac{x\\cos x-\\sin x}{x^{2}}\\,dx$.',
    },
    {
      prompt: 'Find $dy$ if $y=\\arccos(2x)$.',
      steps: ['$dy=\\dfrac{-2}{\\sqrt{1-4x^{2}}}\\,dx$.'],
      answer: '$\\dfrac{-2}{\\sqrt{1-4x^{2}}}\\,dx$.',
    },
    {
      prompt: 'Find $dy$ if $y=\\cos(bx^{2})$.',
      steps: ['$dy=-2bx\\sin(bx^{2})\\,dx$.'],
      answer: '$-2bx\\sin(bx^{2})\\,dx$.',
    },
  ]);
}

/** Implicit / parametric dy/dx via differentials. */
export function genDyDxDifferentials({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'From $xy+x-2y=5$, find $dy/dx$ using differentials.',
      steps: [
        '$x\\,dy+y\\,dx+dx-2\\,dy=0$.',
        '$dy/dx=-(y+1)/(x-2)$.',
      ],
      answer: '$-(y+1)/(x-2)$.',
    };
  }
  return pickOne([
    {
      prompt: 'From $2x/y-3y/x=8$, show $dy/dx=y/x$ (where defined).',
      steps: [
        'Clear denominators after writing $d(\\ldots)=0$.',
        'Factor $(2x^{2}+3y^{2})$; cancel to get $dy/dx=y/x$.',
      ],
      answer: '$dy/dx=y/x$.',
    },
    {
      prompt:
        'Parametric: $x=3\\cos\\theta-\\cos 3\\theta$, $y=3\\sin\\theta-\\sin 3\\theta$. Find $dy/dx$.',
      steps: [
        '$dx=(-3\\sin\\theta+3\\sin 3\\theta)\\,d\\theta$, $dy=(3\\cos\\theta-3\\cos 3\\theta)\\,d\\theta$.',
        '$dy/dx=(\\cos\\theta-\\cos 3\\theta)/(-\\sin\\theta+\\sin 3\\theta)$.',
      ],
      answer:
        '$\\dfrac{\\cos\\theta-\\cos 3\\theta}{-\\sin\\theta+\\sin 3\\theta}$.',
    },
    {
      prompt: 'From $2xy^{3}+3x^{2}y=1$, find $dy/dx$.',
      steps: [
        'Product rules → collect $dy,dx$.',
        '$dy/dx=-\\dfrac{2y(y^{2}+3x)}{3x(2y^{2}+x)}$.',
      ],
      answer: '$-\\dfrac{2y(y^{2}+3x)}{3x(2y^{2}+x)}$.',
    },
    {
      prompt: 'From $xy=\\sin(x-y)$, find $dy/dx$.',
      steps: [
        '$x\\,dy+y\\,dx=\\cos(x-y)(dx-dy)$.',
        '$dy/dx=\\dfrac{\\cos(x-y)-y}{\\cos(x-y)+x}$.',
      ],
      answer: '$\\dfrac{\\cos(x-y)-y}{\\cos(x-y)+x}$.',
    },
  ]);
}

/** Newton root drills. */
export function genNewtonRoots({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt:
        'Newton for $x^{3}+2x-5=0$ with $x_{0}=1$. Give $x_{1}$ and the stabilized root.',
      steps: [
        '$x_{n+1}=(2x_{n}^{3}+5)/(3x_{n}^{2}+2)$.',
        '$x_{1}=7/5=1.4$; converges to $\\approx 1.328268856$.',
      ],
      answer: '$x_{1}=1.4$; root $\\approx 1.3282689$.',
    };
  }
  return pickOne([
    {
      prompt:
        'Newton for $2\\cos x-x^{2}=0$ with $x_{0}=1$. Approximate the positive root.',
      steps: [
        '$f\'=-2(x+\\sin x)$; even $f$ ⇒ roots $\\pm r$.',
        'Converges to $r\\approx 1.02168995$.',
      ],
      answer: '$\\approx\\pm 1.02169$.',
    },
    {
      prompt: 'Newton for $\\sqrt{3}$ via $f(x)=x^{2}-3$, $x_{0}=1$. Give $x_{1}$ and $x_{2}$.',
      steps: ['$x_{1}=2$, $x_{2}=7/4=1.75$.'],
      answer: '$2$; $1.75$.',
    },
    {
      prompt: 'Newton $x^{3}+3x+1=0$ to four decimals.',
      steps: ['Unique real root near $0$; converges to $-0.3222$.'],
      answer: '$-0.3222$.',
    },
    {
      prompt: 'Newton $x-\\cos x=0$ to four decimals.',
      steps: ['Fixed-point of $\\cos$; $\\approx 0.7391$.'],
      answer: '$0.7391$.',
    },
    {
      prompt: 'Newton for $\\sqrt[4]{3}$ and $\\sqrt{5}$ (Heron) to four decimals.',
      steps: [
        '$\\sqrt[4]{3}\\approx 1.3161$; Heron $x\\leftarrow\\tfrac12(x+r/x)$ gives $\\sqrt{5}\\approx 2.2361$.',
      ],
      answer: '$1.3161$; $2.2361$.',
    },
    {
      prompt: 'Newton on $\\cos x+1=0$ (to get $\\pi$). Why slow near the root?',
      steps: [
        'Root is $\\pi$; $f\'(\\pi)=-\\sin\\pi=0$ — flat tangent slows convergence.',
        'Still can approach $\\approx 3.141592654$ with care.',
      ],
      answer: '$\\pi\\approx 3.141592654$ (flat $f\'$ at root).',
    },
    {
      prompt: 'Positive root of $\\cos x=x/2$ by Newton.',
      steps: ['$f=\\cos x-x/2$; converges to $\\approx 1.029866529$.'],
      answer: '$\\approx 1.0299$.',
    },
  ]);
}

/** Newton failure modes. */
export function genNewtonFailures({requireNiceAnswer} = {}) {
  if (requireNiceAnswer && Math.random() < 0.5) {
    return {
      prompt: 'Why does Newton fail for $x^{1/3}=0$ with $x_{0}=1$?',
      steps: [
        '$f\'(x)=\\tfrac13 x^{-2/3}$; update $x_{n+1}=-2x_n$ oscillates / diverges.',
      ],
      answer: 'Iterates $x\\mapsto -2x$ diverge; $f\'$ blows up at $0$.',
    };
  }
  return pickOne([
    {
      prompt:
        'For $x^{3}-3x^{2}+3x+2=0$ with $x_{0}=1$, why does Newton fail?',
      steps: [
        '$f\'(x)=3(x-1)^{2}$; $f\'(1)=0$ — division by zero / horizontal tangent.',
      ],
      answer: '$f\'(x_{0})=0$.',
    },
    {
      prompt:
        'Piecewise $f=\\pm\\sqrt{|x-2|}$ with $x_{0}=3$: what goes wrong?',
      steps: [
        'Cusp / infinite slope at the root $x=2$; tangent from $x_{0}=3$ does not settle.',
      ],
      answer: 'Not a smooth simple root; Newton leaves the basin.',
    },
  ]);
}

/** Mixed. */
export function genSuppDifferentialsMixed({requireNiceAnswer} = {}) {
  const gens = [
    genLinearApprox,
    genErrorDifferentials,
    genDifferentialDy,
    genDyDxDifferentials,
    genNewtonRoots,
    genNewtonFailures,
  ];
  return pickOne(gens)({requireNiceAnswer});
}
