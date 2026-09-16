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
];
