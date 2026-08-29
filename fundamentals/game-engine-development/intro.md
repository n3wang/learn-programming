---
sidebar_position: 1
title: Game Engine Development
---

# Game Engine Development

A game engine is one of the largest, most performance-sensitive pieces of software a team will ever build — real-time rendering, physics, audio, animation, gameplay scripting, memory management, and tooling all running together, every frame, for hours at a stretch. This section builds up the engineering foundations that make that possible: the C++ language decisions, coding disciplines, and low-level systems knowledge that every professional game programmer eventually needs, whether they're shipping a AAA title or building a hobby engine from scratch.

## Game Engine Architecture

Foundational software-engineering knowledge for game programmers — object-oriented design, C++ language evolution, coding standards, and the error-handling philosophy that separates "crashes in a demo" from "ships to ten million players."

- [Fundamentals of Software Engineering for Games](./game-engine-architecture/fundamentals-of-software-engineering) — OOP review (encapsulation, inheritance, polymorphism, composition, the RAII/janitor pattern), the evolution of the C++ standard, choosing which language features to actually use, and how professional engines detect and handle errors (return codes, exceptions, assertions, compile-time checks)
- [Data, Code, and Memory Layout](./game-engine-architecture/data-code-and-memory-layout) — numeric bases, signed/unsigned integers and two's complement, fixed- and floating-point (IEEE-754, subnormals, machine epsilon, ULP), portable sized types, endianness and byte-swapping, declarations/definitions/linkage, the executable image (text/data/BSS/rodata), the stack and heap, and object layout (alignment, padding, vtables)
- [Computer Hardware Fundamentals](./game-engine-architecture/computer-hardware-fundamentals) — the von Neumann architecture, CPU components (ALU, FPU/VPU, registers, control unit), the clock and why clock speed isn't processing power, ROM/RAM and bus widths, and machine/assembly language (ISAs, instruction encoding, addressing modes)
- [Memory Architectures](./game-engine-architecture/memory-architectures) — memory mapping and memory-mapped I/O, video RAM, virtual memory (pages, the MMU, page faults, the TLB), the memory gap and register files, cache hierarchies (cache lines, associativity, replacement/write policy, coherency, avoiding misses), and NUMA (PS3 SPU local stores, PS2 scratchpad)
- [Concurrency and Parallelism](./game-engine-architecture/concurrency-and-parallelism) — the FLOPS growth curve, defining concurrency vs. parallelism, implicit vs. explicit parallelism, task vs. data parallelism, Flynn's Taxonomy (SISD/SIMD/MISD/MIMD, plus GPU-oriented SIMT), and why concurrency and parallelism are orthogonal concepts
- [Implicit Parallelism](./game-engine-architecture/implicit-parallelism) — pipelining recap, latency vs. throughput, pipeline depth trade-offs, data/branch/structural dependencies and stalls, instruction reordering and out-of-order execution, speculative execution, predication (branchless masked-select code), superscalar CPUs, and VLIW (PS2 VU0/VU1)
- [Explicit Parallelism](./game-engine-architecture/explicit-parallelism) — hyperthreading (shared back end, duplicated front end), multicore CPUs (PS4/Xbox One APUs), symmetric vs. asymmetric multiprocessing (SMP vs. the PS3's Cell AMP design), and a pointer to distributed computing
- [Operating System Fundamentals](./game-engine-architecture/operating-system-fundamentals) — the kernel and protection rings, hardware/software interrupts, system calls, preemptive multitasking, processes (anatomy and virtual memory map), threads (lifecycle, joining, polling/blocking/yielding, context switching, priority/affinity, TLS), fibers, and user-level threads/coroutines
- [Introduction to Concurrent Programming](./game-engine-architecture/introduction-to-concurrent-programming) — Rob Pike's definition of concurrency, message passing vs. shared memory, race conditions and Heisenbugs, data races (with a hands-on interleaving-simulation exercise), and atomicity (invocation/response, serialization)
- [Thread Synchronization Primitives](./game-engine-architecture/thread-synchronization-primitives) — mutexes (POSIX/C++11/Windows) and RAII locking, Windows critical sections and futexes, condition variables (busy-waiting vs. sleep/wake, spurious wakeups), semaphores (mutex vs. binary semaphore, producer-consumer, building one from a mutex+CV), and a code activity building a real atomic spinlock
- [Problems with Lock-Based Concurrency](./game-engine-architecture/problems-with-lock-based-concurrency) — deadlock and the Coffman conditions (with a global-lock-ordering code activity), livelock, starvation, priority inversion, and the dining philosophers
- [Rules of Thumb for Concurrency](./game-engine-architecture/rules-of-thumb-for-concurrency) — global ordering rules (why doubly linked lists resist concurrency), transaction-based algorithms, minimizing contention, and the trade-offs of blanket thread safety
- [Causes of Data Races and Atomic Instructions](./game-engine-architecture/causes-of-data-races-and-atomic-instructions) — the blocking/obstruction-free/lock-free/wait-free hierarchy, the three true causes of data races, and atomic instructions (test-and-set, compare-and-swap, the ABA problem, load-linked/store-conditional) with a CAS-retry-loop code exercise
- [Memory Fences and the C++ Memory Model](./game-engine-architecture/memory-fences-and-the-cpp-memory-model) — why volatile doesn't help in C/C++, compiler barriers, the MESI cache coherency protocol and how it can still go wrong, memory fences (acquire/release/full fence), and std::atomic with explicit memory_order (with a code exercise)
- [Spin Locks and Lock-Free Data Structures](./game-engine-architecture/spin-locks-and-lock-free-data-structures) — a correctly-fenced spin lock, scoped/reentrant/readers-writer locks, lock-not-needed assertions, and a from-scratch lock-free linked list (with two code exercises)

## Planned Topics

### Core Engine Systems
- Subsystem start-up/shutdown order and the game loop
- Memory management: stack/pool/frame allocators, alignment, fragmentation
- Resource management and the asset pipeline

### Concurrent Programming
- SIMD vector processing and GPGPU programming

### Low-Level Foundations
- Data-oriented design vs. object-oriented design

### Rendering Engine
- The rendering pipeline, front-to-back
- Scene graphs and spatial partitioning (BVH, octrees)
- Shaders and the programmable pipeline

### Gameplay Systems
- Entity/component architectures (vs. classic OOP hierarchies)
- Event systems and messaging
- Scripting language integration

### Physics & Animation
- Collision detection broad/narrow phases
- Rigid body dynamics basics
- Skeletal animation and blending

---

*Pages coming soon — check back or contribute a page using the template.*
