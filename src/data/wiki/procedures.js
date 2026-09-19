/** Add a procedure: id, title, description, href, order {prompt, items, order, why}. */

export const PROCEDURES = [
  {
    id: 'proc-stride',
    kind: 'procedure',
    title: 'Stride Scheduling',
    description:
      'Deterministic proportional-share CPU scheduling. Each job gets a stride inversely proportional to its tickets and a pass (global progress). Always run the job with the minimum pass; after a quantum, add that job’s stride to its pass. Exact shares over a cycle. New jobs need a sensible initial pass — unlike lottery, which only updates the ticket total.',
    href: '/fundamentals/computer-engineering/virtualization/proportional-share',
    order: {
      prompt: 'Order the steps of stride scheduling, from setup to after a job runs.',
      items: [
        'After the job runs a quantum, add its stride to its pass value',
        "Compute each job's stride as inversely proportional to its tickets",
        'Give every job an initial pass value',
        'Run the job whose pass value is currently the minimum',
      ],
      order: [1, 2, 3, 0],
      why: 'Strides come from ticket counts, passes start at an initial value, the scheduler always runs the minimum-pass job, and after it runs its pass advances by its stride.',
    },
  },
  {
    id: 'proc-lottery',
    kind: 'procedure',
    title: 'Lottery Scheduling',
    description:
      'Probabilistic proportional share (Waldspurger & Weihl). Tickets are the share. Each time slice, draw a winner in [0, total) and walk the list until the counter exceeds the winner. Fair over long runs; short runs can look unfair. Almost no per-job progress state, so arrivals are easy.',
    href: '/fundamentals/computer-engineering/virtualization/proportional-share',
    order: {
      prompt: 'Order one lottery scheduling slice, from tickets to the winner running.',
      items: [
        'The process that holds the winning ticket runs for the slice',
        'Walk the process list, accumulating tickets until the counter exceeds the winner',
        'Draw a winning ticket uniformly in [0, total tickets)',
        'Each job holds a ticket count equal to its target share',
      ],
      order: [3, 2, 1, 0],
      why: 'Shares are ticket counts; each slice draws a winner, scans until the range covers it, then that job runs.',
    },
  },
  {
    id: 'proc-cfs',
    kind: 'procedure',
    title: 'Completely Fair Scheduler (CFS)',
    description:
      'Linux fair-share scheduler. Each runnable job accumulates vruntime while it runs. Always pick the lowest vruntime (red-black tree, O(log n)). Slice ≈ sched_latency / n, floored by min_granularity. Nice maps to weight: heavier weight grows vruntime slower. Waking jobs get vruntime near the current tree minimum so they cannot hog after a long sleep.',
    href: '/fundamentals/computer-engineering/virtualization/proportional-share',
    order: {
      prompt: 'Order how CFS picks and accounts for the next job.',
      items: [
        'While it runs, add to its vruntime (scaled by weight)',
        'Place runnable jobs in a red-black tree keyed by vruntime',
        'Pick the job with the lowest vruntime',
        'On wake, set vruntime near the current tree minimum',
      ],
      order: [1, 2, 0, 3],
      why: 'The tree finds min vruntime; the chosen job runs and its vruntime climbs; sleepers rejoin near the min so they do not starve others.',
    },
  },
  {
    id: 'proc-mlfq',
    kind: 'procedure',
    title: 'Multi-Level Feedback Queue',
    description:
      'Many priority queues; a ready job sits on exactly one. Higher priority runs; same priority is round-robin. New jobs start at the top (assume short). A job that uses its full slice is demoted. Periodic boost of everyone to the top fights starvation and gaming.',
    href: '/fundamentals/computer-engineering/virtualization/mlfq',
    order: {
      prompt: 'Order what happens to a long, CPU-bound job under the original MLFQ rules, from arrival onward.',
      items: [
        'It settles at the bottom queue, sharing the CPU round-robin with other long jobs',
        'It repeatedly uses its full time slice and gets demoted one level each time',
        'It arrives and is placed in the topmost queue',
      ],
      order: [2, 1, 0],
      why: 'Rule 3 starts every new job at the top; a CPU-bound job keeps using its whole slice so it is demoted until it settles at the bottom.',
    },
  },
  {
    id: 'proc-syscall',
    kind: 'procedure',
    title: 'System call (trap)',
    description:
      'Protected control transfer: user code asks the OS to do privileged work. The C library stages the syscall number and arguments, then executes a trap. Hardware saves registers, raises privilege, and jumps to the trap-table handler. The OS validates and performs the work; return-from-trap restores user mode.',
    href: '/fundamentals/computer-engineering/virtualization/limited-direct-execution',
    order: {
      prompt: 'Order the steps of a system call, from user code to resuming after the trap.',
      items: [
        'Hardware saves registers to the kernel stack, raises privilege, jumps to the trap-table handler',
        'OS validates arguments and performs the requested work',
        'return-from-trap restores user mode and resumes after the trap',
        'C library places the syscall number and arguments in agreed registers/stack',
        'Executes a trap instruction',
      ],
      order: [3, 4, 0, 1, 2],
      why: 'Args are staged, trap executes, hardware vectors into the kernel, the OS does the work, and return-from-trap resumes the user process.',
    },
  },
  {
    id: 'proc-paging-translate',
    kind: 'procedure',
    title: 'Paging address translation',
    description:
      'Split a virtual address into VPN and offset. The page-table base register plus VPN locate the PTE (an extra memory access). The PFN from that PTE concatenated with the offset is the physical address, then the data is fetched. About 2× memory references without a TLB.',
    href: '/fundamentals/computer-engineering/virtualization/paging-introduction',
    order: {
      prompt: 'Order the steps of translating a virtual address under paging.',
      items: [
        'Add the PFN (from the PTE) to the offset to form the physical address',
        'Access memory at the physical address to get the actual data',
        'Split the virtual address into VPN and offset',
        'Compute the PTE address from PTBR and VPN, then fetch the PTE from memory',
      ],
      order: [2, 3, 0, 1],
      why: 'Split VA, fetch PTE via PTBR+VPN, combine PFN with offset, then access data.',
    },
  },
  {
    id: 'proc-numerical-hygiene',
    kind: 'procedure',
    title: 'Checking a numerical result',
    description:
      'A printed float mixes bugs, algorithmic truncation, round-off, and (on long jobs) random hardware events. Fix the intended algorithm first, then raise $N$ or cut $h$ until the answer settles, then ask whether the operation count could have let round-off take over, then rerun long jobs to check reproducibility.',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
    order: {
      prompt: 'Order a sane check of a long numerical job, from “is this even the right program?” to reproducibility.',
      items: [
        'If the job ran a long time, rerun it and compare (random error)',
        'If the method uses a cutoff $N$ or step $h$, raise $N$ (or cut $h$) and see the answer settle',
        'Estimate whether the operation count could have let round-off take over',
        'Separate bugs from numerical error: is this even the intended algorithm?',
      ],
      order: [3, 1, 2, 0],
      why: 'Confirm the code, shrink algorithmic error, ask whether round-off could dominate, then check reproducibility for long wall-clock runs.',
    },
  },
  {
    id: 'proc-stable-quadratic',
    kind: 'procedure',
    title: 'Stable quadratic roots',
    description:
      'When $b^{2}\\gg 4ac$, one $\\pm$ branch of the quadratic formula cancels. Choose the sign so $-b\\pm\\sqrt{\\Delta}$ adds in magnitude (use $\\mathrm{sign}(b)$), then get the tiny root from $x_1 x_2=c/a$ rather than from the cancelling formula.',
    href: '/fundamentals/math-and-science/computational-physics/03-01-errors',
    order: {
      prompt: 'Order a cancellation-safe quadratic solve (top = first).',
      items: [
        'Tiny root $x_{\\mathrm{small}}=c/(a\\,x_{\\mathrm{big}})$',
        'Discriminant $\\Delta=b^{2}-4ac$',
        'The other $\\pm$ choice would subtract two close numbers when $b^{2}\\gg 4ac$',
        'Large-magnitude root from the $\\pm$ that makes $-b\\pm\\sqrt{\\Delta}$ add',
      ],
      order: [1, 2, 3, 0],
      why: 'Δ first, notice the cancelling branch, keep the adding branch, then Vieta for the small root.',
    },
  },
  {
    id: 'proc-two-n-diagnostic',
    kind: 'procedure',
    title: 'A(N) vs A(2N) error diagnostic',
    description:
      'You rarely know the exact answer. While round-off is small, $A(N)\\simeq\\mathcal{A}+\\alpha/N^{\\beta}$. Compare $N$ and $2N$, plot $\\log_{10}|[A(N)-A(2N)]/A(2N)|$ versus $\\log_{10} N$, read $\\beta$ from the straight drop, and stop the production run before the noisy rise.',
    href: '/fundamentals/math-and-science/computational-physics/03-02-experimental-error',
    order: {
      prompt: 'Order an experimental check of convergence (top = first).',
      items: [
        'Quit the production $N$ just before the uptick (round-off taking over)',
        'Plot $\\log_{10}|[A(N)-A(2N)]/A(2N)|$ versus $\\log_{10} N$',
        'Run the algorithm at $N$ and at $2N$',
        'A straight steep drop has slope $-\\beta$ — still converging',
      ],
      order: [2, 1, 3, 0],
      why: 'Two resolutions, log–log the difference, confirm a power-law slope, stop before round-off.',
    },
  },
  {
    id: 'proc-series-recurrence',
    kind: 'procedure',
    title: 'Sum a series by term recurrence',
    description:
      'Initialize $t_1=S_1=$ first term. Each later term is a short multiple of the previous one (for sine, $t_n=-x^{2}/((2n-1)(2n-2)) t_{n-1}$). Add it, then stop when $|t_n/S_n|$ is below the requested relative tolerance — never by comparing to a library function.',
    href: '/fundamentals/math-and-science/computational-physics/03-03-power-series',
    order: {
      prompt: 'Order the sine-series loop (top = first).',
      items: [
        'If $|t/S|<\\varepsilon$, stop; else repeat',
        '$t_1\\leftarrow x$, $S\\leftarrow x$, $n\\leftarrow 1$',
        '$S\\leftarrow S+t$',
        '$n\\leftarrow n+1$, $t\\leftarrow t\\cdot(-x^{2})/((2n-1)(2n-2))$',
      ],
      order: [1, 3, 2, 0],
      why: 'Seed the first term, recur, accumulate, then test the relative size of the latest term.',
    },
  },
  {
    id: 'proc-sine-reduce',
    kind: 'procedure',
    title: 'Sine series with $2\\pi$ reduction',
    description:
      'For large $|x|$ the unreduced Taylor sum cancels and then lies. Use $\\sin(x+2n\\pi)=\\sin x$: fold $x$ into $(-\\pi,\\pi]$ with fmod, then run the term-recurrence stop on the reduced angle.',
    href: '/fundamentals/math-and-science/computational-physics/03-03b-series-labs',
    order: {
      prompt: 'Order a safe large-$x$ sine evaluation (top = first).',
      items: [
        'Run the recurrence on $y$ until $|t_n/S_n|<\\varepsilon$',
        'Shift $y$ into $(-\\pi,\\pi]$ if needed',
        'Do not trust an unreduced series once $|x|$ is tens or hundreds',
        '$y\\leftarrow \\mathrm{fmod}(x,2\\pi)$',
      ],
      order: [2, 3, 1, 0],
      why: 'Refuse the unreduced trap, fold modulo $2\\pi$, center in $(-\\pi,\\pi]$, then sum.',
    },
  },
  {
    id: 'proc-specular-ray',
    kind: 'procedure',
    title: 'Trace a specular ray in a circle',
    description:
      'Place the origin at the mirror center. Start at $\\theta=0$ (or any hit). Each bounce advances $\\theta\\leftarrow\\theta+2\\phi$. Plot $(\\cos\\theta,\\sin\\theta)$. To see finite-precision drift, round $\\phi$ and $\\theta$ to a few decimals every step and compare to the full-precision path.',
    href: '/fundamentals/math-and-science/computational-physics/03-04b-specular-bessel-labs',
    order: {
      prompt: 'Order a specular-path simulation (top = first).',
      items: [
        'Optionally round $\\phi$ and $\\theta$ to expose accumulated error',
        'Record the hit $(\\cos\\theta,\\sin\\theta)$',
        'Set $\\theta\\leftarrow 0$ (or the initial angle)',
        'Update $\\theta\\leftarrow\\theta+2\\phi$ and repeat',
      ],
      order: [2, 1, 3, 0],
      why: 'Initialize, mark the hit, step by $2\\phi$, then optionally degrade precision.',
    },
  },
  {
    id: 'proc-miller-bessel',
    kind: 'procedure',
    title: 'Compute $j_\\ell$ by Miller downward recursion',
    description:
      'Seed $j_L=j_{L+1}=1$ at large $L$, recur $j_{k-1}=(2k+1)/x\\, j_k-j_{k+1}$ down to $k=1$, then multiply every value by $(\\sin x/x)/j_0^{c}$. Compare to upward recurrence from $j_0,j_1$ to see where cancellation wins.',
    href: '/fundamentals/math-and-science/computational-physics/03-04b-specular-bessel-labs',
    order: {
      prompt: 'Order the Miller loop (top = first).',
      items: [
        'Scale the whole table by $(\\sin x/x)/j_0^{c}$',
        'Set $j_L^{c}=j_{L+1}^{c}=1$ at large $L$',
        'For $k=L,\\ldots,1$: $j_{k-1}=(2k+1)/x\\, j_k-j_{k+1}$',
        'Return the needed $j_\\ell$',
      ],
      order: [1, 2, 0, 3],
      why: 'Arbitrary high seeds, walk down, normalize to analytic $j_0$, then read $j_\\ell$.',
    },
  },
  {
    id: 'proc-lcg-check',
    kind: 'procedure',
    title: 'Sanity-check a pseudorandom generator',
    description:
      'Confirm the claimed range, plot $r_i$ vs $i$ and successive pairs $(r_i,r_{i+1})$, and refuse a lattice for serious Monte Carlo. Prefer a vetted library generator; use a toy LCG only to learn.',
    href: '/fundamentals/math-and-science/computational-physics/04-01b-monte-carlo-labs',
    order: {
      prompt: 'Order a generator preflight (top = first).',
      items: [
        'Reject a successive-pair lattice for production work',
        'Prefer an industrial generator over a homemade LCG',
        'Plot $(r_i,r_{i+1})$ and $r_i$ vs $i$',
        'Check the output range (e.g. $[0,1)$)',
      ],
      order: [1, 3, 2, 0],
      why: 'Choose a good source, verify range, plot, then refuse visible structure.',
    },
  },
  {
    id: 'proc-unit-walk',
    kind: 'procedure',
    title: 'Simulate a unit-step 2D random walk',
    description:
      'Draw $\\Delta x′,\\Delta y′$ in $[-1,1]$, normalize to length 1, accumulate. Average $R^{2}$ over $K\\approx\\sqrt{N}$ trials with different seeds and compare $\\langle R^{2}\\rangle^{1/2}$ to $\\sqrt{N}$.',
    href: '/fundamentals/math-and-science/computational-physics/04-01b-monte-carlo-labs',
    order: {
      prompt: 'Order one unit-step walk campaign (top = first).',
      items: [
        'Compare $R_{\\mathrm{rms}}$ to $\\sqrt{N}$',
        'Normalize each step to length 1 and accumulate $(x,y)$',
        'Draw independent $\\Delta x′,\\Delta y′\\in[-1,1]$',
        'Repeat for $K$ seeds; form $\\sqrt{\\langle R^{2}\\rangle}$',
      ],
      order: [2, 1, 3, 0],
      why: 'Sample, unitize and walk, average many trials, then check $\\sqrt{N}$.',
    },
  },
  {
    id: 'proc-walk-diagnostics',
    kind: 'procedure',
    title: 'Validate a random-walk $\\sqrt{N}$ campaign',
    description:
      'Average $R^{2}$ over $K$ trials, confirm cross terms are tiny relative to $R^{2}$, plot $R_{\\mathrm{rms}}$ versus $\\sqrt{N}$ from small to large $N$, and optionally repeat in 3D.',
    href: '/fundamentals/math-and-science/computational-physics/04-01b-monte-carlo-labs',
    order: {
      prompt: 'Order the walk diagnostics (top = first).',
      items: [
        'Plot $R_{\\mathrm{rms}}$ vs $\\sqrt{N}$ up to large $N$',
        'Compute $\\langle R^{2}\\rangle$ over $K$ seeds',
        'Optionally repeat with unit steps in 3D',
        'Check $\\langle\\Delta x_i\\Delta x_{j\\neq i}\\rangle/R^{2}$ and $\\langle\\Delta x_i\\Delta y_j\\rangle/R^{2}\\simeq 0$',
      ],
      order: [1, 3, 0, 2],
      why: 'Average first, verify cross terms, then the $\\sqrt{N}$ plot, then 3D if asked.',
    },
  },
  {
    id: 'proc-hp-fold',
    kind: 'procedure',
    title: 'Run an HP self-avoiding fold',
    description:
      'Start at the origin, step only to empty neighbors, drop H more often than P, stop when trapped, then score $E=-\\varepsilon f$ from non-bonded H–H contacts. Catalog many trials by length and energy.',
    href: '/fundamentals/math-and-science/computational-physics/04-01b-monte-carlo-labs',
    order: {
      prompt: 'Order one HP trial (top = first).',
      items: [
        'Score $f$ and $E=-\\varepsilon f$; store by length',
        'While free neighbors exist: step and drop H/P',
        'Place the first monomer at the origin',
        'Stop when the tip is boxed in or length hits the cap',
      ],
      order: [2, 1, 3, 0],
      why: 'Seed, grow self-avoidingly, stop, then energy-sort.',
    },
  },
  {
    id: 'proc-decay-sim',
    kind: 'procedure',
    title: 'Simulate spontaneous decay',
    description:
      'Each $\\Delta t$, every remaining nucleus decays with probability $\\lambda$. Record $t$, $\\Delta N$, and $N$ until extinction. Check that early $\\ln N$ has slope $\\approx-\\lambda$, that the slope scales with $\\lambda$, and that an exponential model beats a power law on semilog residuals.',
    href: '/fundamentals/math-and-science/computational-physics/04-02b-decay-labs',
    order: {
      prompt: 'Order a decay campaign (top = first).',
      items: [
        'Compare early-window SSE of exponential vs power law',
        'While $N>0$: sample decays, update $N$, advance $t$',
        'Fit early $\\ln N$ slope and compare to $-\\lambda$',
        'Choose $N(0)$ and $\\lambda$ (time unit)',
      ],
      order: [3, 1, 2, 0],
      why: 'Set parameters, run the stochastic loop, check the slope, then reject a power-law alternative.',
    },
  },
  {
    id: 'proc-rng-battery',
    kind: 'procedure',
    title: 'Run a quick RNG test battery',
    description:
      'Look at raw draws, plot $r_i$ vs $i$, scatter successive pairs, then compute moments for $k=1,3,7$ and $C(k)$ for small lags. Require $\\sqrt{N}|\\mathrm{error}|$ of order one and no lattice in the scatter.',
    href: '/fundamentals/math-and-science/computational-physics/04-03b-random-test-labs',
    order: {
      prompt: 'Order the RNG battery (top = first).',
      items: [
        'Compute $C(k)$ and $\\sqrt{N}|C-1/4|$',
        'Scatter $(r_i,r_{i+1})$; reject lattices',
        'Print $\\sqrt{N}|\\langle x^{k}\\rangle-1/(k+1)|$ for $k=1,3,7$',
        'Glance at values and plot $r_i$ vs $i$',
      ],
      order: [3, 1, 2, 0],
      why: 'Visual first, then moments, then lag products.',
    },
  },
  {
    id: 'proc-numerical-derivative',
    kind: 'procedure',
    title: 'Estimate a numerical derivative',
    description:
      'If both neighbors exist, use the central difference; otherwise fall back to forward. Sweep a few $h$ values and stop before $y(t\\pm h)$ collapses into machine noise.',
    href: '/fundamentals/math-and-science/computational-physics/05-01b-differentiation-labs',
    order: {
      prompt: 'Order a derivative estimate (top = first).',
      items: [
        'Reject pathologically tiny $h$ when cancellation appears',
        'Prefer $(y(t+h/2)-y(t-h/2))/h$ when possible',
        'Compare errors (or stability) across a few $h$',
        'Check whether $y(t-h/2)$ is available',
      ],
      order: [3, 1, 2, 0],
      why: 'Stencil availability, prefer central, sweep $h$, respect $\\varepsilon_m$.',
    },
  },
  {
    id: 'proc-extrapolated-derivative',
    kind: 'procedure',
    title: 'Build an extrapolated derivative',
    description:
      'Compute central differences at $h$ and $h/2$, combine with $(4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h))/3$, then sweep $\\log|\\mathcal{E}|$ vs $\\log h$ to find where truncation yields to round-off.',
    href: '/fundamentals/math-and-science/computational-physics/05-02b-extrapolated-diff-labs',
    order: {
      prompt: 'Order an extrapolated-difference workflow (top = first).',
      items: [
        'Identify the $h$ where $\\varepsilon_{\\mathrm{app}}\\simeq\\varepsilon_{\\mathrm{ro}}$ on the log–log plot',
        'Form $D_{\\mathrm{ed}}=(4 D_{\\mathrm{cd}}(h/2)-D_{\\mathrm{cd}}(h))/3$',
        'Evaluate $D_{\\mathrm{cd}}(t,h)$ and $D_{\\mathrm{cd}}(t,h/2)$',
        'If data look noisy, smooth or fit before differentiating',
      ],
      order: [2, 1, 0, 3],
      why: 'Two centrals → Richardson combo → locate the sweet spot → respect noise.',
    },
  },
  {
    id: 'proc-riemann-box-sum',
    kind: 'procedure',
    title: 'Build a left Riemann box sum',
    description:
      'Pick $N$, set $h=(b-a)/N$, evaluate $f$ at left endpoints, multiply by $h$, and compare to a known integral or a refined $N$ when assessing error.',
    href: '/fundamentals/math-and-science/computational-physics/05-03b-integration-labs',
    order: {
      prompt: 'Order a left box-counting integral (top = first).',
      items: [
        'Return $h\\sum_{i=0}^{N-1} f(a+ih)$',
        'Choose interval $[a,b]$ and panel count $N$',
        'Optionally compare to exact value or double $N$',
        'Set $h=(b-a)/N$',
      ],
      order: [1, 3, 0, 2],
      why: 'Interval and $N$ → $h$ → sum → check.',
    },
  },
  {
    id: 'proc-romberg-integral',
    kind: 'procedure',
    title: 'Romberg an integral',
    description:
      'Compute trapezoid $A(h)$ and $A(h/2)$, form $(4 A(h/2)-A(h))/3$, then verify $\\sum w_i=b-a$ on the underlying stencil and avoid pathologically large $N$.',
    href: '/fundamentals/math-and-science/computational-physics/05-03b-integration-labs',
    order: {
      prompt: 'Order a Romberg workflow (top = first).',
      items: [
        'Form $(4 A(h/2)-A(h))/3$',
        'Evaluate trapezoid $A(h)$ with $N$ panels',
        'Confirm weights sum to $b-a$ before trusting fancy rules',
        'Evaluate trapezoid $A(h/2)$ with $2N$ panels',
      ],
      order: [1, 3, 0, 2],
      why: 'Two traps → Richardson combo → sanity-check weights.',
    },
  },
  {
    id: 'proc-gauss-map-integrate',
    kind: 'procedure',
    title: 'Integrate with mapped Gauss points',
    description:
      'Load reference $(y_i,w_i\')$ on $[-1,1]$, map to $[a,b]$ (or another transform), form $\\sum w_i f(x_i)$, and check $\\sum w_i\'=2$ on the reference interval.',
    href: '/fundamentals/math-and-science/computational-physics/05-04b-gaussian-quadrature-labs',
    order: {
      prompt: 'Order a Gauss–Legendre integral (top = first).',
      items: [
        'Evaluate $\\sum w_i f(x_i)$',
        'Obtain reference nodes/weights on $[-1,1]$',
        'Confirm reference weights sum to $2$',
        'Map nodes and weights onto the target interval',
      ],
      order: [1, 2, 3, 0],
      why: 'Table → audit → map → sum.',
    },
  },
  {
    id: 'proc-mc-stone-pi',
    kind: 'procedure',
    title: 'Estimate π by stone throwing',
    description:
      'Sample $(x,y)$ uniformly in $[-1,1]^{2}$ with the chapter LCG, count disk hits, return $4\\times$ hits$/N$.',
    href: '/fundamentals/math-and-science/computational-physics/05-05b-monte-carlo-integration-labs',
    order: {
      prompt: 'Order a stone-throw π run (top = first).',
      items: [
        'Return $4\\times$ hits$/N$',
        'Initialize the chapter LCG seed',
        'For each throw, map two uniforms into $[-1,1]$',
        'Increment hits when $x^{2}+y^{2}\\le 1$',
      ],
      order: [1, 2, 3, 0],
      why: 'Seed → sample square → count disk → scale by 4.',
    },
  },
  {
    id: 'proc-mc-mean-value-nd',
    kind: 'procedure',
    title: 'Mean-value Monte Carlo in $D$ dimensions',
    description:
      'Draw $N$ uniform points in the hyper-rectangle, average $f$, multiply by the volume. Optionally average independent seeds to stabilize.',
    href: '/fundamentals/math-and-science/computational-physics/05-06b-mean-value-nd-labs',
    order: {
      prompt: 'Order a high-D mean-value estimate (top = first).',
      items: [
        'Report $V\\times$ (sample mean of $f$), optionally average trials',
        'Choose volume $V$ of the integration domain',
        'Draw $N$ points with the chapter LCG',
        'Accumulate $f$ at each point and divide by $N$',
      ],
      order: [1, 2, 3, 0],
      why: 'Volume → sample → average $f$ → scale (and maybe multi-seed).',
    },
  },
  {
    id: 'proc-mc-control-variate',
    kind: 'procedure',
    title: 'Apply a control variate',
    description:
      'Choose $g$ with known $J=\\int g$, average $f-g$ with the chapter LCG, add $J$. Compare absolute error to plain mean-value MC.',
    href: '/fundamentals/math-and-science/computational-physics/05-07b-mc-variance-reduction-labs',
    order: {
      prompt: 'Order a control-variate run (top = first).',
      items: [
        'Add known $J$ and compare $|E|$ to plain MC',
        'Pick $g$ close to $f$ with known $J=\\int g$',
        'Draw uniforms with the chapter LCG',
        'Average the residual $f(x_i)-g(x_i)$',
      ],
      order: [1, 2, 3, 0],
      why: 'Choose $g$ → sample → average residual → add $J$ and check error.',
    },
  },
  {
    id: 'proc-mc-rejection-importance',
    kind: 'procedure',
    title: 'Rejection sample then importance-average',
    description:
      'Draw $(x,W)$ in a box of height $w_0$; accept if $W\\le w(x)$. Or invert the CDF of $w$, then average $f/w$.',
    href: '/fundamentals/math-and-science/computational-physics/05-08b-importance-sampling-labs',
    order: {
      prompt: 'Order an importance estimate via inversion (top = first).',
      items: [
        'Return the sample mean of $f/w$',
        'Choose normalized weight $w\\propto f$',
        'Map $u\\sim U[0,1)$ through $F_w^{-1}$ (or reject under a box)',
        'Evaluate $f(x)/w(x)$ at each accepted sample',
      ],
      order: [1, 2, 3, 0],
      why: 'Pick $w$ → sample from $w$ → form ratio → average.',
    },
  },
  {
    id: 'proc-bisection-root',
    kind: 'procedure',
    title: 'Find a root by bisection',
    description:
      'Start from a sign-change bracket, repeatedly replace an endpoint with the midpoint so $f(x_{-})f(x_{+})$ stays negative, stop when the half-width is below $\\varepsilon$.',
    href: '/fundamentals/math-and-science/computational-physics/06-02b-bisection-labs',
    order: {
      prompt: 'Order a bisection run (top = first).',
      items: [
        'Return the final midpoint as the root',
        'Confirm $f(x_{-})\\,f(x_{+})<0$',
        'Evaluate $f$ at $x=(x_{-}+x_{+})/2$',
        'Replace $x_{+}$ or $x_{-}$ to keep the signed half; repeat until narrow',
      ],
      order: [1, 2, 3, 0],
      why: 'Bracket → midpoint → keep signed half → report midpoint.',
    },
  },
  {
    id: 'proc-newton-raphson-root',
    kind: 'procedure',
    title: 'Find a root by Newton–Raphson',
    description:
      'From a close guess, form $\\Delta x=-f/f\'$ (analytic or forward difference), optionally backtrack if $|f|$ grows, and iterate until $|f|$ or $|\\Delta x|$ is below $\\varepsilon$.',
    href: '/fundamentals/math-and-science/computational-physics/06-03b-newton-raphson-labs',
    order: {
      prompt: 'Order a Newton–Raphson run (top = first).',
      items: [
        'Stop when $|f|$ or $|\\Delta x|$ is below $\\varepsilon$',
        'Evaluate $f(x_0)$ and $f\'(x_0)$',
        'Form $\\Delta x=-f/f\'$; backtrack (halve) if $|f|$ grows',
        'Update $x\\leftarrow x+\\Delta x$ (or the accepted fraction)',
      ],
      order: [1, 2, 3, 0],
      why: 'Evaluate → correction (+ backtrack) → update → check tolerance.',
    },
  },
  {
    id: 'proc-magnetization-mt',
    kind: 'procedure',
    title: 'Build m(t) by residual search',
    description:
      'For each reduced temperature $t_i$, root-find $f(m,t_i)=m-\\tanh(m/t_i)=0$ (nontrivial branch for $t_i<1$; $m=0$ for $t_i\\ge 1$), then assemble the curve.',
    href: '/fundamentals/math-and-science/computational-physics/06-04b-magnetization-labs',
    order: {
      prompt: 'Order an m(t) sweep (top = first).',
      items: [
        'Tabulate or plot the (t,m) pairs',
        'Choose a grid of reduced temperatures tᵢ',
        'If tᵢ≥1 set m=0; else bisect/Newton f(m,tᵢ)=0',
        'Skip the trivial m=0 when tᵢ<1 if you want the ordered branch',
      ],
      order: [1, 2, 3, 0],
      why: 'Grid → root (or zero) → prefer spontaneous branch → plot.',
    },
  },
  {
    id: 'proc-tests-before-use',
    kind: 'procedure',
    title: 'Validate a matrix inverse / solve',
    description:
      'After Gauss–Jordan or elimination, check max|AA⁻¹−I|, compare to an analytic inverse if available, and verify Ax≈b (and Av≈λv for eigenclaims).',
    href: '/fundamentals/math-and-science/computational-physics/07-02b-tests-before-use-labs',
    order: {
      prompt: 'Order a trust-but-verify sequence (top = first).',
      items: [
        'Accept the result only if residuals sit near machine epsilon',
        'Compute a numerical inverse or solve Ax=b',
        'Form AA⁻¹−I and/or Ax−b (and Av−λv if relevant)',
        'Report max-abs residuals (and vs analytic inverse if known)',
      ],
      order: [1, 2, 3, 0],
      why: 'Compute → residual checks → compare gold standard → trust only if tiny.',
    },
  },
  {
    id: 'proc-matrix-code-sketches',
    kind: 'procedure',
    title: 'Assemble ND Newton and hyperfine sketch notebooks',
    description:
      'Build multidimensional Newton on string residuals (F, FD Jacobian, solve, update), then check zero-field hyperfine eigenvalues before B≠0 sweeps; plot locally.',
    href: '/fundamentals/math-and-science/computational-physics/07-06-code-listing-sketches',
    order: {
      prompt: 'Order a matrix-sketch build (top = first).',
      items: [
        'Optionally plot geometry / E_i(B) with a local toolkit (not VPython dumps)',
        'Code F(x) residuals and central-difference Jacobian for ND Newton',
        'Solve J Δx = −F; update until ‖Δx‖ and ‖F‖ are tiny',
        'Form hyperfine V; print sorted eig → W (×3), −3W; then add B terms',
      ],
      order: [1, 2, 3, 0],
      why: 'Residuals/J → Newton loop → hyperfine eig → plot.',
    },
  },
  {
    id: 'proc-string-newton-2d',
    kind: 'procedure',
    title: '2D Newton for nonlinear statics toy',
    description:
      'Pick a cos±sqrt branch if reducing angles, evaluate f and J, solve JΔx=−f, update, and filter physical roots (T>0, |sin|,|cos|≤1).',
    href: '/fundamentals/math-and-science/computational-physics/07-03b-string-problem-labs',
    order: {
      prompt: 'Order a 2D Newton / statics check (top = first).',
      items: [
        'Check residuals and physical filters (signs, bounds, sketch)',
        'Choose identity signs / initial guess near the physical branch',
        'Evaluate f and Jacobian J at the current point',
        'Solve JΔx=−f and update x←x+Δx until small',
      ],
      order: [1, 2, 3, 0],
      why: 'Branch/guess → f,J → Newton update → physics check.',
    },
  },
  {
    id: 'proc-stride-matmul-time',
    kind: 'procedure',
    title: 'Compare stride-sensitive nestings',
    description:
      'Implement row-major unit-stride and large-stride loops (SOS or matmul) that produce the same answer, then time both with perf_counter medians as N grows.',
    href: '/fundamentals/math-and-science/computational-physics/07-05b-matrix-speed-labs',
    order: {
      prompt: 'Order a stride timing study (top = first).',
      items: [
        'Plot or table median times vs N and attribute the gap to stride/cache',
        'Code two nestings that compute the same mathematical result',
        'Verify answers match on a small fixed case',
        'Time each nesting with perf_counter repeats for increasing N',
      ],
      order: [1, 2, 3, 0],
      why: 'Implement → verify → time → interpret.',
    },
  },
  {
    id: 'proc-rk2-midpoint-step',
    kind: 'procedure',
    title: 'Take a midpoint RK2 step',
    description:
      'Evaluate f at the current state, form k1=hf, sample f at the tentative midpoint y+k1/2, form k2, and set y←y+k2. Repeat with fixed h.',
    href: '/fundamentals/math-and-science/computational-physics/08-03b-ode-algorithms-labs',
    order: {
      prompt: 'Order one RK2 step (top = first).',
      items: [
        'Set y ← y + k₂',
        'Evaluate f(t,y) and form k₁ = h f',
        'Evaluate f at the midpoint (t+h/2, y+k₁/2) and form k₂ = h f',
        'Advance t ← t+h (then repeat or stop)',
      ],
      order: [1, 2, 0, 3],
      why: 'k1 → midpoint k2 → update y → advance t.',
    },
  },
  {
    id: 'proc-ode-code-sketches',
    kind: 'procedure',
    title: 'Assemble fixed-step and adaptive ODE sketches',
    description:
      'Lock RK2/RK4 + energy on harmonic and x³ first, then optionally add RK45 adaptation and Adams–Bashforth–Moulton with an RK history fill.',
    href: '/fundamentals/math-and-science/computational-physics/08-06-ode-sketches',
    order: {
      prompt: 'Order an ODE-sketch build (top = first).',
      items: [
        'Optional: RK45 error control and/or ABM predict–correct with RK startup',
        'Code shared f(t,y) and fixed-step RK2 / RK4 steppers',
        'Run harmonic and x³ forces; record energy / waveform diagnostics',
        'Swap F (soft α, drive, …) without changing the stepper',
      ],
      order: [1, 2, 3, 0],
      why: 'Steppers → diagnostics → swap F → optional RK45/ABM.',
    },
  },
  {
    id: 'proc-ode-energy-check',
    kind: 'procedure',
    title: 'Score oscillator energy drift',
    description:
      'Record E0 from the IC, integrate one period (or more), form |(E−E0)/E0|, and report −log10 of that relative error as a digits estimate.',
    href: '/fundamentals/math-and-science/computational-physics/08-03b-ode-algorithms-labs',
    order: {
      prompt: 'Order an energy-precision check (top = first).',
      items: [
        'Report −log₁₀(|(E−E₀)/E₀|) (or the relative error)',
        'Compute E₀ = ½mv² + V(x) at the initial state',
        'Integrate with fixed h for a chosen duration (e.g. one period)',
        'Recompute E and the relative drift |(E−E₀)/E₀|',
      ],
      order: [1, 2, 3, 0],
      why: 'E0 → integrate → relative drift → digits score.',
    },
  },
  {
    id: 'proc-damping-classify',
    kind: 'procedure',
    title: 'Classify viscous damping regime',
    description:
      'Compute ω0=√(k/m) and b_crit=2mω0, then label under / critical / over by comparing b to b_crit; for drives, also compute |ω−ω0|/(2π) for beats.',
    href: '/fundamentals/math-and-science/computational-physics/08-05b-friction-resonance-labs',
    order: {
      prompt: 'Order a damping / beat diagnosis (top = first).',
      items: [
        'State the regime (and beat frequency if driven)',
        'Compute ω₀ = √(k/m) and b_crit = 2mω₀',
        'Compare the physical b to b_crit',
        'If driven near resonance, form |ω−ω₀|/(2π)',
      ],
      order: [1, 2, 3, 0],
      why: 'ω0,b_crit → compare b → optional beat → conclude.',
    },
  },
  {
    id: 'proc-fourier-project-period',
    kind: 'procedure',
    title: 'Project Fourier coefficients for known T',
    description:
      'Identify period T and ω=2π/T, exploit odd/even symmetry if present, evaluate (a_n,b_n) by integrals or closed forms, then form partial sums / power a_n²+b_n².',
    href: '/fundamentals/math-and-science/computational-physics/09-01b-fourier-series-labs',
    order: {
      prompt: 'Order a Fourier series analysis (top = first).',
      items: [
        'Plot partial sums / power spectrum and check jumps (midpoint + Gibbs)',
        'Determine the period T and set ω = 2π/T',
        'Use symmetry (odd → sine only, even → cosine only) if it applies',
        'Compute a_n, b_n (analytic toy or numerical quadrature)',
      ],
      order: [1, 2, 3, 0],
      why: 'T,ω → symmetry → coefficients → visualize / power.',
    },
  },
  {
    id: 'proc-dft-nyquist-check',
    kind: 'procedure',
    title: 'Check sampling against Nyquist',
    description:
      'Compute s=1/h and f_Nyq=s/2, list highest frequencies in the signal, and either raise s, filter above Nyquist, or accept aliasing contamination.',
    href: '/fundamentals/math-and-science/computational-physics/09-03b-dft-labs',
    order: {
      prompt: 'Order a Nyquist / aliasing check (top = first).',
      items: [
        'Decide: increase s, low-pass filter, or document alias risk',
        'Compute s = 1/h and Nyquist frequency s/2',
        'Identify the highest frequency content you care about',
        'Compare that content to s/2 (and test f vs f−2s samples if suspicious)',
      ],
      order: [1, 2, 3, 0],
      why: 's,Nyquist → list f_max → compare → remediate.',
    },
  },
  {
    id: 'proc-autocorr-power-spectrum',
    kind: 'procedure',
    title: 'Estimate clean power via autocorrelation',
    description:
      'Build A(τ) from the measured y, Fourier-transform A, and interpret A(ω)/√(2π) as |S|² when noise is uncorrelated.',
    href: '/fundamentals/math-and-science/computational-physics/09-04b-noise-filtering-labs',
    order: {
      prompt: 'Order an autocorrelation power estimate (top = first).',
      items: [
        'Report |S|² ≈ A(ω)/√(2π) (semilog plot)',
        'Form the discrete autocorrelation A(τ) from y_k',
        'DFT (or FT) the autocorrelation to get A(ω)',
        'Compare to a direct |Y|² of the noisy trace',
      ],
      order: [1, 2, 0, 3],
      why: 'A(τ) → A(ω) → |S|² → compare to raw |Y|².',
    },
  },
  {
    id: 'proc-fft-multiply-filter',
    kind: 'procedure',
    title: 'Fast-filter a signal via FFT',
    description:
      'FFT the input, multiply by H(ω) (lowpass/sinc mask), inverse FFT, and compare to a time-domain tap convolution on a short test.',
    href: '/fundamentals/math-and-science/computational-physics/09-05b-filters-sinc-labs',
    order: {
      prompt: 'Order an FFT-domain filter (top = first).',
      items: [
        'Inverse-transform to get g(t) and spot-check against a tiny tap sum',
        'FFT the sampled input f',
        'Build or evaluate H(ω) on the same bins (e.g. lowpass / sinc)',
        'Form G(ω) ∝ F(ω) H(ω)',
      ],
      order: [1, 2, 3, 0],
      why: 'FFT → H → multiply → iFFT / verify.',
    },
  },
  {
    id: 'proc-bitrev-butterfly-sketch',
    kind: 'procedure',
    title: 'Sketch one radix-2 FFT stage',
    description:
      'Bit-reverse (or accept reversed output), apply butterflies with twiddles Z^k, and count log₂ N stages.',
    href: '/fundamentals/math-and-science/computational-physics/09-06b-fft-labs',
    order: {
      prompt: 'Order a tiny radix-2 pass (top = first).',
      items: [
        'Repeat for log₂ N stages (or until length-1 DFTs)',
        'Choose N=2^m and list bit-reversed indices',
        'Pair samples (y_p, y_q) and apply butterflies with the right Z',
        'Write outputs in natural or bit-rev order consistently',
      ],
      order: [1, 2, 3, 0],
      why: 'N, bit-rev → butterflies → order → next stage.',
    },
  },
  {
    id: 'proc-fft-roundtrip-assess',
    kind: 'procedure',
    title: 'Assess an FFT with round-trip and DFT timing',
    description:
      'Transform a known probe, inverse-transform with matching norms, measure residual, then time the same N against a direct DFT.',
    href: '/fundamentals/math-and-science/computational-physics/09-07b-fft-implementation-labs',
    order: {
      prompt: 'Order an FFT assessment (top = first).',
      items: [
        'Time FFT vs O(N²) DFT on the same N and compare residuals',
        'Build length N=2^n data (pad if needed) and run the forward FFT',
        'Inverse-transform with 1/N (and optional 1/√(2π) consistency)',
        'Compute max |y_out − y_in| (should be ~ machine epsilon)',
      ],
      order: [1, 2, 3, 0],
      why: 'Forward → inverse → residual → time vs DFT.',
    },
  },
  {
    id: 'proc-choose-dft-fft-sketch',
    kind: 'procedure',
    title: 'Choose complex DFT vs FFT sketch',
    description:
      'Use an O(N²) complex (or real-channel) DFT as the reference, switch to radix-2 FFT± for speed, and plot locally instead of VPython book GUIs.',
    href: '/fundamentals/math-and-science/computational-physics/09-08-fourier-code-sketches',
    order: {
      prompt: 'Order a Fourier coding workflow (top = first).',
      items: [
        'Plot or print bins locally; optionally multiply by H(ω) then iFFT',
        'Code a clear complex DFT on a known tone mix (reference)',
        'Verify odd/even → Im/Re concentration (or real-channel sine sum)',
        'Replace with FFT± switch; check round-trip and timing vs DFT',
      ],
      order: [1, 2, 3, 0],
      why: 'Reference DFT → symmetry check → FFT speed → filter/plot.',
    },
  },
  {
    id: 'proc-fourier-code-sketches',
    kind: 'procedure',
    title: 'Assemble Fourier DFT → FFT sketch notebooks',
    description:
      'Map complex DFT, real Im-channel, and FFT± sketches for a local notebook; validate with symmetry, round-trip, and timing before filters.',
    href: '/fundamentals/math-and-science/computational-physics/09-08-fourier-code-sketches',
    order: {
      prompt: 'Order the Fourier sketch map (top = first).',
      items: [
        'Wire optional H(ω) between forward and inverse; plot locally',
        'Code complex DFT on a tone mix as the O(N²) reference',
        'Add real Im-channel (or check odd→Im / even→Re)',
        'Implement FFT±; confirm iFFT≈y and time vs DFT',
      ],
      order: [1, 2, 3, 0],
      why: 'DFT reference → Im/Re check → FFT± → filter/plot.',
    },
  },
  {
    id: 'proc-stft-spectrogram-pass',
    kind: 'procedure',
    title: 'Build a simple STFT spectrogram pass',
    description:
      'Choose window width, slide τ across the record, DFT each gated chunk, and assemble |Y(ω,τ)| — then note the fixed Δt–Δω limit.',
    href: '/fundamentals/math-and-science/computational-physics/10-03b-stft-labs',
    order: {
      prompt: 'Order an STFT pass (top = first).',
      items: [
        'Plot |Y| vs (ω,τ) and discuss the fixed-window tradeoff',
        'Pick a window w (e.g. box or Hann) and a set of centers τ',
        'For each τ, form the gated samples w(t−τ) y(t)',
        'DFT each gated chunk to get Y(ω,τ)',
      ],
      order: [1, 2, 3, 0],
      why: 'Window → gate → DFT → spectrogram / critique.',
    },
  },
  {
    id: 'proc-cwt-scalogram',
    kind: 'procedure',
    title: 'Compute a reference CWT scalogram',
    description:
      'Pick a mother, build daughters on a (s,τ) grid, integrate overlaps with y(t), and plot |Y| — then optionally invert to check reconstruction.',
    href: '/fundamentals/math-and-science/computational-physics/10-04b-wavelet-transforms-labs',
    order: {
      prompt: 'Order a CWT pass (top = first).',
      items: [
        'Plot |Y(s,τ)| (scalogram) and spot-check an inverse if desired',
        'Choose mother Ψ (Morlet / Mexican hat / Haar) and a (s,τ) grid',
        'For each (s,τ), form ψ_{s,τ}(t)=s^{-1/2} Ψ((t−τ)/s)',
        'Numerically integrate Y=∫ ψ* y dt (slow O(N_s N_τ N_t) reference)',
      ],
      order: [1, 2, 3, 0],
      why: 'Mother/grid → daughters → integrate → scalogram / invert.',
    },
  },
  {
    id: 'proc-daub4-pyramid',
    kind: 'procedure',
    title: 'Apply one Daub4 pyramid analysis',
    description:
      'On length 2^n data, apply L/H, store details, decimate smooth, recurse until two smooth samples; invert to verify.',
    href: '/fundamentals/math-and-science/computational-physics/10-05b-dwt-labs',
    order: {
      prompt: 'Order a Daub4 pyramid pass (top = first).',
      items: [
        'Inverse: upsample + transpose filters; compare to input',
        'Load length N=2^n samples and Daub4 taps c₀…c₃',
        'Convolve with L and H; ↓2; append details to the output vector',
        'Recurse on the smooth half until length 2 remains',
      ],
      order: [1, 2, 3, 0],
      why: 'Load → L/H ↓2 → recurse → invert/check.',
    },
  },
  {
    id: 'proc-pca-center-cov',
    kind: 'procedure',
    title: 'Prepare a covariance matrix for PCA',
    description:
      'On an N×M (or M×N) table, center, form C = XXᵀ/(N−1), eigendecompose for ordered PCs, then project with a feature matrix F.',
    href: '/fundamentals/math-and-science/computational-physics/10-06b-pca-labs',
    order: {
      prompt: 'Order a PCA pipeline (top = first).',
      items: [
        'Eigendecompose C; project onto top-k eigenvectors (feature matrix F)',
        'Assemble the data matrix X (samples × features or detectors × times)',
        'Center each feature / detector row (subtract mean)',
        'Build C = XXᵀ/(N−1) (or pairwise cov with 1/(N−1))',
      ],
      order: [1, 2, 3, 0],
      why: 'Matrix → center → covariance → eigen / project.',
    },
  },
  {
    id: 'proc-wavelet-code-sketches',
    kind: 'procedure',
    title: 'Assemble CWT and Daub4 sketch notebooks',
    description:
      'Build a Morlet CWT (s,τ) grid on a staged signal, then a Daub4 pyramid on a chirp; invert both paths and plot locally instead of VPython.',
    href: '/fundamentals/math-and-science/computational-physics/10-07b-wavelet-code-labs',
    order: {
      prompt: 'Order a wavelet-sketch build (top = first).',
      items: [
        'Invert CWT / DWT paths; plot with a local toolkit (not VPython dumps)',
        'Code staged y(t) and Morlet Ψ; fill Y(s,τ) on a geometric-s × linear-τ grid',
        'Fill length 2ⁿ chirp; run Daub4 ↓2 pyramid to nend≈4',
        'Spot-check one CWT coefficient and one L/H Daub4 stage against hand locks',
      ],
      order: [1, 3, 2, 0],
      why: 'CWT grid → Daub4 pyramid → kernel checks → invert / plot.',
    },
  },
  {
    id: 'proc-nn-code-sketches',
    kind: 'procedure',
    title: 'Assemble NN sketch notebooks (neuron → train → tools)',
    description:
      'Validate sigmoid neuron and 2–2–1 locks, add one MSE backprop step, then map k-means / Keras Dense sketches for a local notebook.',
    href: '/fundamentals/math-and-science/computational-physics/11-11-nn-code-sketches',
    order: {
      prompt: 'Order an NN-sketch build (top = first).',
      items: [
        'Optional: k-means on (index, mass) and/or Keras one-unit Dense',
        'Code sigmoid Neuron and a 2–2–1 forward pass; match hand locks',
        'Add MSE Loss + one backprop / SGD weight update',
        'Print Loss every few epochs; only then reach for library demos',
      ],
      order: [1, 2, 3, 0],
      why: 'Locks → train step → Loss print → k-means/Keras.',
    },
  },
  {
    id: 'proc-nn-forward-train',
    kind: 'procedure',
    title: 'Forward-pass then train a shallow net',
    description:
      'Build sigmoid nodes, stack a 2–2–1 forward pass, define MSE Loss, backprop one weight, and take an SGD step.',
    href: '/fundamentals/math-and-science/computational-physics/11-03b-training-labs',
    order: {
      prompt: 'Order shallow-net training (top = first).',
      items: [
        'SGD: w ← w − η ∂ℒ/∂w; repeat / test on unseen data',
        'Code neuron y=f(w·x+b) and a 2–2–1 forward pass',
        'Mean-center features; compute MSE Loss vs labels',
        'Backprop: chain-rule ∂ℒ/∂w for a chosen weight',
      ],
      order: [1, 2, 3, 0],
      why: 'Forward → Loss → backprop → SGD / test.',
    },
  },
  {
    id: 'proc-nn-graphical-hierarchy',
    kind: 'procedure',
    title: 'Read a hierarchical line-classifier net',
    description:
      'Map pixels to input nodes, track pair detectors, combine into line hypotheses, and apply ReLU before the class readout.',
    href: '/fundamentals/math-and-science/computational-physics/11-04b-graphical-deep-net-labs',
    order: {
      prompt: 'Order the graphical deep-net story (top = first).',
      items: [
        'ReLU / readout: keep positive line evidence; emit class',
        'Encode the 2×2 (or 4×4) patch on input nodes',
        'Hidden 1: weighted sums detect local pixel pairs',
        'Hidden 2: combine pair detectors into line orientations',
      ],
      order: [1, 2, 3, 0],
      why: 'Pixels → pairs → lines → ReLU/class.',
    },
  },
  {
    id: 'proc-nn-tf-physics-check',
    kind: 'procedure',
    title: 'Sanity-check ML tooling on nuclear / Hubble math',
    description:
      'Verify A=Z+N and mass excess, mirror a GradientTape derivative by hand, then outline MSE SGD for a line fit or poly features.',
    href: '/fundamentals/math-and-science/computational-physics/11-06b-tf-sklearn-labs',
    order: {
      prompt: 'Order a tooling sanity pass (top = first).',
      items: [
        'Outline Hubble / poly B/A fit via MSE + gradients (or sklearn LinearRegression)',
        'Confirm A=Z+N on a scalar “tensor”',
        'Compute mass excess (M−A)×931.494028',
        'Hand-check ∂ℒ/∂x for ℒ=(y−mx−b)² (GradientTape mirror)',
      ],
      order: [1, 2, 3, 0],
      why: 'A → excess → autodiff check → fit sketch.',
    },
  },
  {
    id: 'proc-nn-kmeans',
    kind: 'procedure',
    title: 'Run one Lloyd k-means cycle',
    description:
      'Initialize centroids, assign each point to the nearest, update means, and optionally standardize features or decay η for a supervised linear follow-on.',
    href: '/fundamentals/math-and-science/computational-physics/11-07b-ml-clustering-labs',
    order: {
      prompt: 'Order a k-means cycle (top = first).',
      items: [
        'Update each centroid to the mean of its assigned points',
        'Choose k and initial centroids',
        'Assign every point to the nearest centroid',
        'Repeat until centroids move little (or hit max iters)',
      ],
      order: [1, 2, 0, 3],
      why: 'Init → assign → update → repeat.',
    },
  },
  {
    id: 'proc-nn-keras-fit',
    kind: 'procedure',
    title: 'Fit a Keras Dense regressor',
    description:
      'Build Sequential([Dense(1)]), compile MSE + optimizer, fit for many epochs, then read weights for the learned line.',
    href: '/fundamentals/math-and-science/computational-physics/11-08b-keras-labs',
    order: {
      prompt: 'Order a Keras linear fit (top = first).',
      items: [
        'Read get_weights() / plot y=wx+b against data',
        'Create Dense(units=1) in a Sequential model',
        'compile with MSE loss and an optimizer',
        'fit(x, y, epochs=…) and watch Loss fall',
      ],
      order: [1, 2, 3, 0],
      why: 'Layer → compile → fit → inspect weights.',
    },
  },
  {
    id: 'proc-nn-opencv-ripeness',
    kind: 'procedure',
    title: 'Score ripeness from RGB histograms',
    description:
      'Load an image, build per-channel 256-bin histograms, compare red vs green mass, optionally mask changing pixels in video.',
    href: '/fundamentals/math-and-science/computational-physics/11-09b-opencv-labs',
    order: {
      prompt: 'Order an OpenCV ripeness pass (top = first).',
      items: [
        'Compare R vs G histograms (or mean R/G) to separate ripe/green',
        'Read the image (note BGR channel order)',
        'calcHist for channels 0,1,2 with 256 bins',
        'Optional: frame-diff / MOG2 to drop static background',
      ],
      order: [1, 2, 0, 3],
      why: 'Load → hist → compare → optional background.',
    },
  },
  {
    id: 'proc-qc-separability-bell',
    kind: 'procedure',
    title: 'Test two-qubit entanglement',
    description:
      'Write amplitudes in the computational basis, check wz=xy, compare to Bell states, and optionally build Pauli tensor Hamiltonians.',
    href: '/fundamentals/math-and-science/computational-physics/12-03b-entanglement-labs',
    order: {
      prompt: 'Order an entanglement check (top = first).',
      items: [
        'Conclude entangled if wz≠xy (e.g. Bell); separable if equal',
        'Expand |Ψ⟩ in |00⟩…|11⟩ with amplitudes w,x,y,z',
        'Compute wz and xy',
        'Optional: form X⊗X etc. for a two-spin Hamiltonian',
      ],
      order: [1, 2, 0, 3],
      why: 'Basis → products → compare → optional H.',
    },
  },
  {
    id: 'proc-qc-bell-from-gates',
    kind: 'procedure',
    title: 'Build Bell |β₀₀⟩ with H and CNOT',
    description:
      'Start from |00⟩, apply Hadamard on the control qubit, then CNOT to entangle; optionally check classical XOR/AND half-adder first.',
    href: '/fundamentals/math-and-science/computational-physics/12-04-logic-gates',
    order: {
      prompt: 'Order the Bell circuit (top = first).',
      items: [
        'Apply CNOT (control = first qubit, target = second)',
        'Prepare |00⟩',
        'Apply H on the first qubit → (|0⟩+|1⟩)|0⟩/√2',
        'Read |β₀₀⟩ = (|00⟩+|11⟩)/√2',
      ],
      order: [1, 2, 0, 3],
      why: '|00⟩ → H → CNOT → Bell.',
    },
  },
  {
    id: 'proc-qc-half-adder',
    kind: 'procedure',
    title: 'Build a quantum half-adder',
    description:
      'Prepare addends, Toffoli into a clean carry qubit, then CNOT for the XOR sum; check 1+1 → sum 0 carry 1.',
    href: '/fundamentals/math-and-science/computational-physics/12-05-qc-programming',
    order: {
      prompt: 'Order half-adder steps (top = first).',
      items: [
        'CNOT(control=q0, target=q1) for sum',
        'Start with q2 = |0⟩ (carry line)',
        'Toffoli(q0,q1,q2) for carry',
        'Verify truth table (e.g. 1+1 → 0,1)',
      ],
      order: [1, 2, 0, 3],
      why: 'Clean carry → Toffoli → CNOT → check.',
    },
  },
  {
    id: 'proc-qc-ibm-bell-composer',
    kind: 'procedure',
    title: 'Build |β₀₀⟩ in IBM Composer / Qiskit',
    description:
      'Keep two qubits, drop H then CX, compare simulator histogram to hardware; mind IBM bit order.',
    href: '/fundamentals/math-and-science/computational-physics/12-06-ibm-quantum',
    order: {
      prompt: 'Order a Composer Bell run (top = first).',
      items: [
        'Run / inspect ≈½ on |00⟩ and |11⟩',
        'Create circuit; drop unused qubits',
        'Place H on q[0]',
        'Place CNOT control q[0] target q[1]',
      ],
      order: [1, 2, 3, 0],
      why: 'Trim → H → CX → run.',
    },
  },
  {
    id: 'proc-qc-grover-iterate',
    kind: 'procedure',
    title: 'Run a Grover iterate',
    description:
      'Prepare uniform superposition, apply oracle then diffuser about π√N/4 times, measure.',
    href: '/fundamentals/math-and-science/computational-physics/12-09-grover',
    order: {
      prompt: 'Order Grover steps (top = first).',
      items: [
        'Measure; expect marked |i⟩ with high probability',
        'H⊗n on |0⟩⊗n',
        'Apply oracle O (phase-flip marked state)',
        'Apply diffuser Uψ; repeat ~π√N/4 times',
      ],
      order: [1, 2, 3, 0],
      why: 'Uniform → (O·Uψ)ᵗ → measure.',
    },
  },
  {
    id: 'proc-qc-shor-factor',
    kind: 'procedure',
    title: 'Factor N with Shor’s outline',
    description:
      'Random r, gcd check, QPE period finding, then gcd(r^{T/2}±1, N).',
    href: '/fundamentals/math-and-science/computational-physics/12-10-shor',
    order: {
      prompt: 'Order Shor steps (top = first).',
      items: [
        'gcd(r^{T/2}±1, N) for factors (if T even, etc.)',
        'Pick random r; if gcd(r,N)>1 done',
        'Find period T of rˣ mod N (QPE)',
        'If T odd or r^{T/2}≡−1 (mod N), retry',
      ],
      order: [1, 2, 3, 0],
      why: 'r → period → gcd factors.',
    },
  },
  {
    id: 'proc-qc-sketch-pipeline',
    kind: 'procedure',
    title: 'Assemble Chapter 12 local sketches',
    description:
      'NumPy dipole eig → Qiskit QFT → Grover with √N → Shor QPE; never commit tokens.',
    href: '/fundamentals/math-and-science/computational-physics/12-11-qc-code-sketches',
    order: {
      prompt: 'Order the sketch pipeline (top = first).',
      items: [
        'Shor: amod15 + QPE + continued fractions',
        'Dipole H matrix + eig (NumPy)',
        'QFT₄ / QFTₙ circuit vs analytic / library',
        'Grover oracle+diffuser with R≈π√N/4',
      ],
      order: [1, 2, 3, 0],
      why: 'Entangle → QFT → Grover → Shor.',
    },
  },
  {
    id: 'proc-soft-oscillator-period',
    kind: 'procedure',
    title: 'Measure soft-oscillator period vs amplitude',
    description:
      'Integrate F=−kx(1−αx), detect successive rising zero crossings, compare T to harmonic T₀.',
    href: '/fundamentals/math-and-science/computational-physics/08-04-nonlinear-oscillation-solutions',
    order: {
      prompt: 'Order a soft-oscillator period check (top = first).',
      items: [
        'Compare T(A) to T₀=2π√(m/k); larger Aα usually stretches T',
        'Set IC x=A, v=0 with chosen α',
        'Integrate with RK2/RK4; record times of x=0, v>0',
        'T = difference between successive rising zeros',
      ],
      order: [1, 2, 3, 0],
      why: 'IC → integrate → crossings → compare T(A).',
    },
  },
  {
    id: 'proc-ft-gaussian-pair',
    kind: 'procedure',
    title: 'Explore a Fourier transform pair',
    description:
      'Pick a time-domain width, view y(t), recall that a narrower pulse has a broader Y(ω).',
    href: '/fundamentals/math-and-science/computational-physics/09-02-fourier-transforms',
    order: {
      prompt: 'Order an FT-pair exploration (top = first).',
      items: [
        'State the uncertainty: narrow in t ⇒ wide in ω',
        'Choose a Gaussian width parameter a',
        'Plot or sketch y(t)=e^{−a t²}',
        'Recall Y(ω)∝ e^{−ω²/(4a)}/√a',
      ],
      order: [1, 2, 3, 0],
      why: 'Pick a → time plot → spectrum shape → uncertainty.',
    },
  },
  {
    id: 'proc-nl-force-swap',
    kind: 'procedure',
    title: 'Swap force laws in an ODE stepper',
    description:
      'Keep dynamic form ẋ=v, v̇=F/m; only change F; re-check energy for conservative models.',
    href: '/fundamentals/math-and-science/computational-physics/08-01-nonlinear-oscillators',
    order: {
      prompt: 'Order a force-swap workflow (top = first).',
      items: [
        'Compare waveform / period / energy drift to the harmonic benchmark',
        'Write state as (x,v) with ẋ=v',
        'Replace F (e.g. −kx → −kx(1−αx) or −x³)',
        'Keep the same RK2/RK4 stepper and step size h',
      ],
      order: [1, 2, 3, 0],
      why: 'State → new F → same stepper → diagnose.',
    },
  },
  {
    id: 'proc-curve-sketch-checklist',
    kind: 'procedure',
    title: 'Curve-sketching checklist',
    description:
      'Compute $y\',y\'\'$; classify critical numbers; mono and concavity intervals; check inflection; asymptotes; end behavior; intercepts; corners/cusps; oblique asymptotes.',
    href: '/fundamentals/math-and-science/calculus/15-curve-sketching',
    order: {
      prompt: 'Order a standard sketching workflow (top = first).',
      items: [
        'Mark intercepts, corners/cusps, and any oblique asymptotes',
        'Compute $y\'$ (and $y\'\'$ if convenient)',
        'Find critical numbers; classify extrema; read mono from $y\'$',
        'Sign-chart $y\'\'$ for concavity and inflection; then asymptotes / infinity',
      ],
      order: [1, 2, 3, 0],
      why: 'Derivatives → extrema/mono → concavity/asymptotes → polish with intercepts and special points.',
    },
  },
  {
    id: 'proc-degree-radian',
    kind: 'procedure',
    title: 'Convert degrees ↔ radians',
    description:
      'Multiply degrees by π/180 to get radians; multiply radians by 180/π to get degrees. Memorize the special angles 30°, 45°, 60°, 90°, …',
    href: '/fundamentals/math-and-science/calculus/16-review-of-trigonometry',
    order: {
      prompt: 'Order a degree→radian conversion (top = first).',
      items: [
        'Simplify the multiple of π when the angle is a standard special angle',
        'Write the angle in degrees',
        'Multiply by π/180',
        'Check against the unit-circle table if applicable',
      ],
      order: [1, 2, 0, 3],
      why: 'Start from degrees → scale by π/180 → simplify → verify.',
    },
  },
  {
    id: 'proc-sketch-a-sin-bx',
    kind: 'procedure',
    title: 'Sketch y = A sin(bx)',
    description:
      'Read amplitude $|A|$, period $2\\pi/b$, frequency $b$; mark zeros, peaks, and troughs over one period; then repeat.',
    href: '/fundamentals/math-and-science/calculus/17-diff-trig-functions',
    order: {
      prompt: 'Order a sketch of $A\\sin(bx)$ (top = first).',
      items: [
        'Repeat the wave by periodicity',
        'Compute amplitude $|A|$, period $2\\pi/b$, and frequency $b$',
        'On one period, mark intercepts and max/min heights $\\pm|A|$',
        'Draw the smooth sine-shaped arc through those landmarks',
      ],
      order: [1, 2, 3, 0],
      why: 'Parameters → landmarks on one period → draw → tile.',
    },
  },
  {
    id: 'proc-angle-between-curves',
    kind: 'procedure',
    title: 'Angle between two curves',
    description:
      'At an intersection, find tangent slopes $m_1,m_2$; if $1+m_1 m_2=0$ the angle is $\\pi/2$; otherwise $\\tan\\phi=|(m_2-m_1)/(1+m_1 m_2)|$ and take the acute $\\phi$.',
    href: '/fundamentals/math-and-science/calculus/17-diff-trig-functions',
    order: {
      prompt: 'Order the angle-between-curves workflow (top = first).',
      items: [
        'If $1+m_1 m_2=0$, report $\\phi=\\pi/2$; else compute $\\tan\\phi$ and the acute $\\phi$',
        'Find an intersection point $P$',
        'Compute tangent slopes $m_1=f\'(P)$ and $m_2=g\'(P)$',
        'Recall inclination: slope $=\\tan\\alpha$',
      ],
      order: [1, 3, 2, 0],
      why: 'Intersection → slopes (via inclination) → tan formula / perpendicular check.',
    },
  },
  {
    id: 'proc-inv-trig-eval',
    kind: 'procedure',
    title: 'Evaluate inverse trig at special values',
    description:
      'Ask which angle in the function’s range has the given trig value; use the unit-circle table and odd/even properties.',
    href: '/fundamentals/math-and-science/calculus/18-inverse-trig-functions',
    order: {
      prompt: 'Order an arcsin evaluation (top = first).',
      items: [
        'Confirm the answer lies in $[-\\pi/2,\\pi/2]$',
        'Recall a special angle whose sine equals the input',
        'Apply oddness if the input is negative',
        'Write the exact radian answer',
      ],
      order: [1, 2, 0, 3],
      why: 'Table → sign → verify range → write answer.',
    },
  },
  {
    id: 'proc-free-fall-setup',
    kind: 'procedure',
    title: 'Set up a free-fall problem',
    description:
      'Choose upward +; identify $s_0,v_0$; use $v=v_0-32t$ and $s=s_0+v_0t-16t^{2}$ (ft, s); solve for the unknown time or height.',
    href: '/fundamentals/math-and-science/calculus/19-rectilinear-circular-motion',
    order: {
      prompt: 'Order a free-fall setup (top = first).',
      items: [
        'Solve with $v=v_0-32t$ and/or $s=s_0+v_0t-16t^{2}$',
        'Fix the positive direction (usually upward) and ground $s=0$',
        'Read off initial data $s_0$ and $v_0$ (signs!)',
        'Note $a=-32$ ft/s²',
      ],
      order: [1, 3, 2, 0],
      why: 'Axis → a → initials → formulas.',
    },
  },
  {
    id: 'proc-related-rates',
    kind: 'procedure',
    title: 'Solve a related-rates problem',
    description:
      'Figure → variables → relating equation → differentiate in t → substitute the instant → interpret the sign.',
    href: '/fundamentals/math-and-science/calculus/20-related-rates',
    order: {
      prompt: 'Order the related-rates workflow (top = first).',
      items: [
        'Interpret the sign of the unknown rate',
        'Draw and assign variables; write a relating equation',
        'Differentiate with respect to $t$',
        'Substitute the given instant and solve',
      ],
      order: [1, 2, 3, 0],
      why: 'Setup → d/dt → plug → interpret.',
    },
  },
  {
    id: 'proc-newton-calculus',
    kind: 'procedure',
    title: "Apply Newton's method (calculus)",
    description:
      'Pick a seed near a root of f=0; iterate x ← x − f(x)/f′(x) until digits stabilize; watch for f′≈0.',
    href: '/fundamentals/math-and-science/calculus/21-differentials-newtons-method',
    order: {
      prompt: 'Order a Newton iteration workflow (top = first).',
      items: [
        'Stop when successive iterates agree to the desired digits',
        'Choose x₀ near a suspected root with f′(x₀)≠0',
        'Compute x₁ = x₀ − f(x₀)/f′(x₀)',
        'Repeat the update from the new guess',
      ],
      order: [1, 2, 3, 0],
      why: 'Seed → first step → iterate → stop.',
    },
  },
  {
    id: 'proc-linear-approx',
    kind: 'procedure',
    title: 'Linear approximation with differentials',
    description:
      'Pick easy nearby x and Δx; evaluate f and f′; use f(x+Δx)≈f(x)+f′(x)Δx.',
    href: '/fundamentals/math-and-science/calculus/21-differentials-newtons-method',
    order: {
      prompt: 'Order a linear-approximation workflow (top = first).',
      items: [
        'Form f(x)+f′(x)Δx as the estimate',
        'Choose a nearby base point where f is easy',
        'Compute f(x) and f′(x)',
        'Identify Δx = target − base',
      ],
      order: [1, 3, 2, 0],
      why: 'Base → Δx → derivative data → estimate.',
    },
  },
  {
    id: 'proc-documentary-sale-checklist',
    kind: 'procedure',
    title: 'Brief a documentary sale',
    description:
      'Before quoting: map risks, lock the sale terms, list required documents, and verify the counterparty.',
    href: '/fundamentals/international-business/export-import/01-introduction-to-export-import',
    order: {
      prompt: 'Order a pre-deal documentary checklist (top = first).',
      items: [
        'List B/L / payment / insurance docs the deal will require',
        'Verify counterparty credentials before committing capital',
        'Name the main cross-border risks for this route and buyer',
        'Agree the master sale terms (who ships, pays, and when risk passes)',
      ],
      order: [2, 3, 0, 1],
      why: 'Risks → contract → document pack → KYC.',
    },
  },
];
