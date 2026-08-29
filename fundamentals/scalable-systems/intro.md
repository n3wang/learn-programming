---
sidebar_position: 1
title: Scalable Systems
---

# Scalable Systems

Every system that outgrows a single machine — or a single, simple data model — runs into the same handful of hard problems: how to represent data so it stays fast to query as it grows, how to keep multiple copies of that data consistent, how to split it across machines without losing correctness, and how to reason clearly about what "correct" even means once concurrency and network failures are in the picture. This section builds up that body of knowledge from first principles, grounded in how real, large-scale data systems are actually built.

## Designing Data-Intensive Applications

Foundational knowledge for anyone building systems that must reliably store, query, and process data at scale — data models, storage engines, replication, partitioning, transactions, and the consistency guarantees that hold it all together.

- [Graph-Like Data Models](./designing-data-intensive-applications/graph-like-data-models) — the property graph model, the Cypher query language, expressing graph traversals in SQL via recursive CTEs, the triple-store model and SPARQL, Datalog, and how graph databases differ from the old CODASYL network model
- [Hash Indexes and LSM-Trees](./designing-data-intensive-applications/hash-indexes-and-lsm-trees) — the append-only log at the heart of every storage engine, hash indexes and Bitcask, SSTables and the sparse in-memory index, memtables and write-ahead logs, and LSM-trees (LevelDB/RocksDB, Bloom filters, compaction strategies)
- [B-Trees and Other Indexing Structures](./designing-data-intensive-applications/b-trees-and-other-indexing-structures) — B-tree pages and branching factor, write-ahead logs and latches for reliability, B-trees vs. LSM-trees (write amplification), secondary indexes, heap files, clustered/covering indexes, multi-dimensional indexes (R-trees), full-text/fuzzy search, and in-memory databases
- [Formats for Encoding Data](./designing-data-intensive-applications/formats-for-encoding-data) — backward/forward compatibility, why language-specific encodings are risky, JSON/XML pitfalls, Thrift/Protocol Buffers (field tags and schema evolution rules), and Avro (writer's/reader's schema resolution)
- [Modes of Dataflow](./designing-data-intensive-applications/modes-of-dataflow) — dataflow through databases (data outlives code), REST vs. SOAP, the problems with RPC (with an idempotent-retry code exercise), and message-passing dataflow (brokers and distributed actor frameworks)

## Distributed Data

How to keep the same data correct and available across many machines — replication, partitioning, transactions, and the consistency and consensus guarantees that make distributed systems reason-about-able at all.

- [Leaders and Followers](./distributed-data/leaders-and-followers) — leader-based replication, synchronous vs. asynchronous replication, setting up new followers, handling node outages and failover, and how replication logs are actually implemented (statement-based, WAL shipping, logical/row-based, trigger-based)
- [Problems with Replication Lag](./distributed-data/problems-with-replication-lag) — eventual consistency, read-after-write consistency, monotonic reads (with a sticky-routing code exercise), and consistent prefix reads
- [Multi-Leader Replication](./distributed-data/multi-leader-replication) — when multiple leaders make sense (multi-datacenter, offline clients, collaborative editing), handling write conflicts (with a cart-merging code exercise), automatic conflict resolution (CRDTs), and replication topologies
- [Leaderless Replication](./distributed-data/leaderless-replication) — Dynamo-style writes/reads, read repair and anti-entropy, quorums (n/w/r) and their real limitations, sloppy quorums and hinted handoff, and detecting concurrent writes (happens-before, last write wins, version vectors, with a sibling-resolution code exercise)
- [Partitioning of Key-Value Data](./distributed-data/partitioning-of-key-value-data) — why partitioning is necessary, key range partitioning, hash partitioning (with a partition-assignment code exercise), and relieving hot spots caused by a single overloaded key
- [Partitioning and Secondary Indexes](./distributed-data/partitioning-and-secondary-indexes) — document-partitioned (local) indexes and scatter/gather (with a code exercise), and term-partitioned (global) indexes and their async-update trade-off
- [Rebalancing and Request Routing](./distributed-data/rebalancing-and-request-routing) — why hash-mod-N rebalancing fails (with a code exercise quantifying the churn), fixed/dynamic/proportional partitioning strategies, automatic vs. manual rebalancing, and request routing (ZooKeeper vs. gossip)
- [Faults, Partial Failures, and Unreliable Networks](./distributed-data/faults-partial-failures-and-unreliable-networks) — why partial failure is the defining trait of distributed systems, HPC vs. cloud fault philosophies, the six ways a network request can silently fail, detecting faults, timeouts and queueing (with a fault-detector code exercise), and circuit- vs. packet-switched networks
- [Unreliable Clocks](./distributed-data/unreliable-clocks) — time-of-day vs. monotonic clocks, why NTP synchronization is less reliable than you'd hope, the dangers of last-write-wins timestamps, TrueTime-style confidence intervals (with a code exercise), and process pauses (GC, VM suspension, hard real-time systems)
- [Knowledge, Truth, and Lies](./distributed-data/knowledge-truth-and-lies) — why truth is defined by quorum majority, fencing tokens for safe leader/lock handoff (with a code exercise), Byzantine faults and when they actually matter, and system models (safety vs. liveness properties)
- [Linearizability](./distributed-data/linearizability) — the recency guarantee precisely defined, linearizability vs. serializability, where it's actually needed (locking, uniqueness constraints, cross-channel races), which replication methods can deliver it, and the CAP theorem properly understood
- [Ordering Guarantees](./distributed-data/ordering-guarantees) — causality as a partial order vs. linearizability's total order, Lamport timestamps (with a code exercise), why timestamp ordering alone isn't sufficient, and total order broadcast (equivalent to both linearizable storage and consensus itself)
- [Distributed Transactions and Two-Phase Commit](./distributed-data/distributed-transactions-and-two-phase-commit) — the FLP impossibility result (and why it doesn't doom real systems), 2PC's system of promises (with a vote-tally code exercise), coordinator failure and in-doubt transactions, XA transactions, and the real operational costs of distributed transactions
- [Fault-Tolerant Consensus](./distributed-data/fault-tolerant-consensus) — the four formal consensus properties, why consensus algorithms are usually total order broadcast algorithms, epoch numbers and overlapping quorums (with a code exercise) resolving the leader-election chicken-and-egg problem, and ZooKeeper/etcd as coordination services

## Derived Data

How large, derived datasets — search indexes, recommendation tables, caches, analytics stores — actually get built and kept in sync with a system of record: batch processing, messaging systems and partitioned logs, change data capture, event sourcing, and the correctness and ethical questions that come with building on top of all of it.

- [Batch Processing with Unix and MapReduce](./derived-data/batch-processing-with-unix-and-mapreduce) — services vs. batch vs. stream processing, the Unix philosophy (uniform interfaces, separation of logic/wiring, transparency), and MapReduce/HDFS fundamentals (the shuffle, chained workflows) with a top-N-URL-counter code exercise
- [Joins in MapReduce](./derived-data/joins-in-mapreduce) — reduce-side sort-merge joins and GROUP BY, handling skewed/hot keys, and map-side joins (broadcast, partitioned, merge) with two code exercises
- [Beyond MapReduce: Dataflow Engines and Graphs](./derived-data/beyond-mapreduce-dataflow-engines-and-graphs) — batch job outputs (search indexes, bulk-loaded key-value stores, human fault tolerance), Hadoop vs. MPP databases, dataflow engines (Spark/Tez/Flink) and recomputation-based fault tolerance, and the Pregel/BSP graph model (with a superstep code exercise)
- [Transmitting Event Streams](./derived-data/transmitting-event-streams) — direct messaging vs. message brokers, load balancing vs. fan-out, acknowledgments and the message-reordering problem (with a consumer-offset code exercise), partitioned logs vs. traditional messaging, disk space and slow consumers, and replaying old messages
- [Databases and Streams](./derived-data/databases-and-streams) — the dual-writes race condition, change data capture (implementation strategies, initial snapshots, log compaction, with a compaction code exercise), and event sourcing (deriving current state, commands vs. events, with a replay code exercise)
- [Data Integration and the Limits of Total Order](./derived-data/data-integration-and-the-limits-of-total-order) — combining specialized tools by deriving data, derived data vs. distributed transactions, why total ordering stops scaling, and capturing causality across systems (with a causal-reference code exercise)
- [Unifying Batch and Stream Processing](./derived-data/unifying-batch-and-stream-processing) — maintaining derived state asynchronously, reprocessing data for application evolution, the lambda architecture and its practical problems, and unifying batch/stream engines (with a lambda-merge code exercise)
- [Unbundling Databases](./derived-data/unbundling-databases) — composing storage technologies, CREATE INDEX as reprocessing (with a code exercise), the meta-database of everything, federated vs. unbundled databases, and what's still missing
- [Designing Applications Around Dataflow](./derived-data/designing-applications-around-dataflow) — application code as a derivation function, separating app code from state, dataflow vs. ordinary job queues, and stream processors vs. services (with a stream-table-join code exercise)
- [Observing Derived State](./derived-data/observing-derived-state) — the write path vs. read path (with a cache-vs-index code exercise), stateful offline-capable clients, pushing state changes to clients, end-to-end event streams, reads as events, and multi-partition query processing
- [Correctness and Integrity in Dataflow Systems](./derived-data/correctness-and-integrity-in-dataflow-systems) — exactly-once semantics and the end-to-end argument (with a request-deduplication code exercise), enforcing uniqueness constraints via partitioned logs (with a username-claiming code exercise) and multi-partition requests, timeliness vs. integrity, coordination-avoiding design, and auditing/trust-but-verify
- [Ethics of Data-Intensive Applications](./derived-data/ethics-of-data-intensive-applications) — bias and accountability in predictive analytics, self-reinforcing feedback loops, surveillance and consent, privacy as a decision right, data as an asset, and lessons from the Industrial Revolution

## Distributed Systems

The foundational vocabulary and trade-offs distributed systems keep coming back to — APIs and RPCs, latency and reliability measurement, percentiles, idempotency, delivery semantics, relational and data consistency, the CAP theorem, and how orchestrators like Kubernetes use health checks to manage running services.

- [Important Distributed System Concepts](./distributed-systems/important-distributed-system-concepts) — APIs and RPCs (sync vs. async, IDLs, SLOs), latency and attribution, defining reliability (the HTTP status-code gray area), why percentiles beat averages, idempotency, at-least-once vs. at-most-once delivery, relational integrity, strong vs. eventual consistency and the CAP theorem, and orchestration (liveness vs. readiness health checks)
- [The Sidecar Pattern](./distributed-systems/sidecar-pattern) — co-scheduled containers in a Pod, TLS termination for legacy HTTP apps, dynamic configuration via shared volumes, modular utility sidecars (PID namespace), git-sync PaaS workflows, and designing reusable sidecar APIs
- [Ambassadors](./distributed-systems/ambassador-pattern) — client-side proxies that broker sharded storage, environment-specific service discovery, and A/B request splitting; hands-on StatefulSet + twemproxy and nginx experiment manifests
- [Replicated Load-Balanced Services](./distributed-systems/replicated-load-balanced-services) — stateless replicas behind a Service, readiness probes, session stickiness, Varnish caching tier, and nginx SSL termination
- [Sharded Services](./distributed-systems/sharded-services) — sharded caches vs replicated caches, memcache + twemproxy, shared shard routers, shard keys, consistent hashing, and hot shards

## Planned Topics

### Data Models and Storage
- Relational vs. document vs. graph data models — trade-offs and when each fits
- Column-oriented storage for analytics

---

*Pages coming soon — check back or contribute a page using the template.*
