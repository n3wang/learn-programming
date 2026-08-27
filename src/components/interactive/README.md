# Interactive lesson embeds

Lesson demos (steppers, graphs, pyramids) live here so they share one look and one import path.

## Layout

```text
src/components/interactive/
  CpuPipelineSimulator.js      # space-time grid + StepControls
  ZeroOneBfsSimulator.js       # graph + deque + StepControls
  CacheHierarchyVisualizer.js  # pyramid + click-to-inspect
  BranchPredictorSimulator.js  # state machine + sequence runner
  ProcessStateSimulator.js     # Running/Ready/Blocked over time
  ProcessApiSimulator.js       # fork / wait / exec / redirect steppers
  LimitedDirectExecutionSimulator.js  # modes, traps, timer, context switch
  SchedulingIntroSimulator.js         # FIFO, SJF, STCF, RR timelines
  MlfqSimulator.js                 # multi-level feedback queue demos
  ProportionalShareSimulator.js    # lottery / stride / CFS
  MultiprocessorSchedulingSimulator.js  # SQMS / MQMS / affinity
  CpuVirtualizationRecapSimulator.js    # Ch. 11 arc recap stepper
  MemoryVirtualizationDialogueSimulator.js  # Ch. 12 memory VM preview
  AddressSpaceSimulator.js              # Ch. 13 physical vs virtual layout
  AddressTranslationSimulator.js        # Ch. 15 base/bounds translation
  SegmentationSimulator.js              # Ch. 16 per-segment translation
  FreeSpaceSimulator.js                 # Ch. 17 split/coalesce/policies
  PagingIntroSimulator.js               # Ch. 18 VPN/PFN translation
  TlbSimulator.js                       # Ch. 19 TLB hit/miss & ASID
  SmallerPageTablesSimulator.js         # Ch. 20 multi-level page tables
  BeyondPhysMechanismsSimulator.js      # Ch. 21 swap / present / faults
  PageReplacementSimulator.js           # Ch. 22 OPT/FIFO/LRU/Clock
  CompleteVmSystemsSimulator.js         # Ch. 23 VAX/VMS + Linux VM
  ConcurrencyIntroSimulator.js          # Ch. 26 threads / races
  LocksSimulator.js                     # Ch. 28 mutex / TAS / ticket / park
  ConcurrentStructuresSimulator.js      # Ch. 29 counters / lists / queues / hash
  ConditionVariablesSimulator.js        # Ch. 30 CV / producer-consumer
  SemaphoresSimulator.js                # Ch. 31 binary / PC / R/W / philosophers
  ConcurrencyBugsSimulator.js           # Ch. 32 atomicity / order / deadlock
  EventBasedConcurrencySimulator.js     # Ch. 33 event loop / select / AIO
  IoDevicesSimulator.js                 # Ch. 36 buses / IRQ / DMA / drivers
  HardDiskDrivesSimulator.js            # Ch. 37 geometry / scheduling
  RaidSimulator.js                      # Ch. 38 striping / mirror / parity
  FilesAndDirectoriesSimulator.js       # Ch. 39 fds / links / mount
  VsfsSimulator.js                      # Ch. 40 vsfs layout / access paths
  FfsSimulator.js                       # Ch. 41 FFS groups / locality
  CrashConsistencySimulator.js          # Ch. 42 fsck / journaling
  LfsSimulator.js                       # Ch. 43 LFS segments / imap / cleaning
  FlashSsdSimulator.js                  # Ch. 44 NAND / FTL / wear leveling
  DataIntegritySimulator.js             # Ch. 45 checksums / LSEs / scrubbing
  PersistenceDialogueSimulator.js       # Ch. 46 persistence recap dialogue
  DistributedSystemsSimulator.js        # Ch. 48 UDP / reliable msg / RPC
  NfsSimulator.js                       # Ch. 49 NFS stateless / cache
  AfsSimulator.js                       # Ch. 50 AFS callbacks / whole-file
  shell/
    CEBlock.js                 # card + titled sections
    StepControls.js            # Reset / Prev / Next
    ColorLegend.js             # color keys
    _template.js               # copy this for a new demo
```

## Design rules (what we learned)

1. **Frame first.** Every demo is a `CEBlock` with a short title and subtitle. Inner chunks are `CEBlock.Section`. Do not invent a second card style.

2. **One idea per step.** Pipeline uses clock cycles; 0-1 BFS uses one pop or one edge relax. Students should see *what changed* in the caption, not a full algorithm dump.

3. **Legend + controls at the bottom.** `ColorLegend` then `StepControls` (when the demo is a stepper). Same button labels everywhere.

4. **Data above UI.** Arrays of `{ key, label, color, desc }` or precomputed `frames[]`. Keep the render function dumb.

5. **MDX only embeds.** Prose, tables, and quizzes stay in the lesson file. The component does not teach the whole topic.

```mdx
import ZeroOneBfsSimulator from "@site/src/components/interactive/ZeroOneBfsSimulator.js";

## Interactive deque

<ZeroOneBfsSimulator />
```

6. **Copy the template.** `shell/_template.js` → `interactive/MyDemo.js`, then a lesson `.mdx` that imports it.

## Live pages

| Demo | Lesson |
|---|---|
| CPU pipeline | `/fundamentals/computer-engineering/virtualization/cpu-pipeline` |
| Cache hierarchy | `/fundamentals/computer-engineering/virtualization/cache-hierarchy` |
| Branch predictor | `/fundamentals/computer-engineering/virtualization/branch-prediction` |
| 0-1 BFS | `/fundamentals/algorithms/bfs` |
