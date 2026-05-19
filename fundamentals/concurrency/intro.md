---
sidebar_position: 1
title: Concurrency
---

# Concurrency

Concurrency is one of the hardest topics in software engineering — bugs are non-deterministic, hard to reproduce, and can lie dormant for years. This section covers the primitives, patterns, and mental models needed to write correct concurrent code.

## Planned Topics

### OS-Level Concurrency
- Threads vs. processes — what the OS actually schedules
- Context switching cost and cache thrashing
- Thread stacks and the TLS (thread-local storage)

### Synchronization Primitives
- Mutexes and lock granularity — interactive lock contention demo
- Condition variables: wait/notify patterns
- Semaphores: counting vs. binary
- Read-write locks

### Classic Problems
- Producer-consumer (bounded buffer)
- Dining philosophers — interactive deadlock visualizer
- Readers-writers problem

### Memory Models
- Cache coherence protocols (MESI) — interactive state machine
- Memory ordering: sequential consistency, acquire/release, relaxed
- Happens-before relation and the Java/C++ memory model
- `volatile` and what it doesn't guarantee

### Lock-Free Programming
- CAS (compare-and-swap) and ABA problem
- Lock-free stack and queue
- Hazard pointers and epoch-based reclamation

### Modern Async Models
- Event loop and non-blocking I/O
- async/await — how it desugars to state machines
- Go goroutines and channels
- Structured concurrency

---

*Pages coming soon — check back or contribute a page using the template.*
