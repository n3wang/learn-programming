#!/usr/bin/env python3
"""Hand-authored choice string patches (exact old -> new)."""
from __future__ import annotations

import pathlib

ROOT = (
    pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"
)

# Exact full choice text replacements across MDX files.
PATCHES: dict[str, str] = {
    "A SQL table name and column name, respectively": "A SQL table identifier and a column identifier — not the tail and head vertices bound by a WITHIN edge",
    "The network": "The host network namespace shared with the node",
    "A random shard chosen per request by the application code": "A different random shard on every request, chosen in application code instead of one localhost proxy",
    "Every shard simultaneously without a proxy": "Every shard contacted in parallel with no localhost proxy to hide topology",
    "Both responses are merged into one": "Both production and experiment responses merged and returned to the client",
    "Hash a random UUID per request": "Hash a fresh random UUID on every request so the same URL hits different shards",
    "Always shard by timestamp": "Shard only by request timestamp so path locality is ignored entirely",
    "hash(timestamp) only": "hash(timestamp) only — ignoring client geography and URL path",
    "hash(client_ip, path) — every IP is unique": "hash(client_ip, path) — treating each client IP as its own shard key",
    "No sharding — use one global cache": "No sharding — one global cache node for all countries and paths",
    "So locks never expire": "So locks never expire and crashed holders block failover forever",
    "So CAS becomes optional": "So compare-and-swap becomes optional once a lease exists",
    "So etcd can delete the whole cluster": "So etcd may wipe the entire cluster when a lease TTL fires",
    "Always 50%": "Always 50% — assuming independent halves instead of 0.99⁵",
    "Ambassadors cannot call localhost without v1": "Ambassadors cannot reach localhost unless the API is already at v1",
    "No — 120 always loses to 60": "No — a 120 s worker always loses to 60 s interarrival",
    "Only if Jobs are deleted": "Only if finished Jobs are deleted from the queue first",
    "Source ambassadors for workers": "Attach source ambassadors to workers instead of scaling queue depth",
    "Because Info logs cannot include request IDs": "Because Info-level logs cannot carry request IDs, so Debug must stay enabled always",
    "Because Kubernetes forbids Error logs": "Because Kubernetes rejects Error-level log lines from application containers",
    "For every always-on web server": "For every long-running web server, including jobs that exit before scrape",
    "Instead of all logging forever": "Instead of structured logging — rely on metrics alone forever",
    "Only for Fatal log lines": "Only when the process logs at Fatal severity",
    "It removes the need for alert thresholds": "It removes the need to define alert thresholds on metric time series",
    "Because circuit breakers cannot trip": "Because circuit breakers cannot open, so retries never synchronize",
    "Local caches always use less memory than shared caches": "Local caches always consume less RAM than a shared remote cache tier",
    "404 is always correct for outages": "HTTP 404 is always the correct signal during backend outages",
    "Circuit breakers require 404": "Circuit breakers must return HTTP 404 on every open circuit",
    "Throttles only apply to reads": "Rate throttles apply only to read traffic, never to writes",
    "Session tracking requires stateful storage on every replica": "Session stickiness requires a full session store replicated on every backend replica",
    "The number of unique keys that fit in one machine’s RAM (by itself)": "The count of distinct keys that fit in one machine’s RAM, ignoring parallel fan-out",
    "That reads are always faster than writes, which treats syntax size as proof of expressiveness instead of comparing each language to the query shape it favors": "That reads are always faster than writes — confusing performance with the single-copy illusion linearizability defines",
    "Both examples represent identical kinds of facts with no difference, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Both triples encode the same kind of fact, ignoring whether the object is another vertex or a literal value",
    "Triples can never contain primitive values, only vertex references, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Triples can never use numeric literals in the object position — only references to other vertices",
    "It permanently deletes the matched facts from the database, describing a different subsystem than the rule-evaluation or storage behavior asked about": "It permanently deletes every fact that matched the rule body instead of deriving new facts from those bindings",
    "The new key is silently discarded, describing a different subsystem than the rule-evaluation or storage behavior asked about": "The new key is dropped on overflow instead of splitting the page and updating the parent pointer",
    "The entire tree is rebuilt from scratch, describing a different subsystem than the rule-evaluation or storage behavior asked about": "The entire B-tree is rebuilt from scratch on each insert instead of local page splits",
    "Encrypted delivery and compressed delivery, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Encrypted delivery and compressed delivery — wire-format concerns, not reliable versus total order",
    "Synchronous delivery and asynchronous delivery, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Synchronous RPC delivery and fire-and-forget async delivery — not the reliable versus totally ordered broadcast distinction",
    "Because roots never merge results, swapping cause and effect relative to the protocol step named in the prompt": "Because scatter-gather roots never merge partial results, leaving clients to combine leaf replies themselves",
    "Functions cannot call HTTP APIs, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Functions cannot call external HTTP APIs, so event-driven pipelines must stay purely internal",
    "Indexes only work on mainframes, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Secondary indexes only work on mainframe databases, not on cloud-native function stores",
    "Sharded caches never recalculate missed data, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Sharded caches never recompute missed keys from origin when a shard is unavailable",
    "Kubernetes restarts sharded caches more slowly, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Kubernetes deliberately slows pod restarts for sharded caches compared with replicated caches",
    "Hit rate is unrelated to shard failures, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Cache hit rate stays unchanged when an entire shard is offline because keys reroute automatically",
    "Stateless services must store session state on disk, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Stateless HTTP services must persist every session to disk on each replica to survive rollouts",
    "Databases physically cannot be queried more than once per second, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "OLTP databases physically cap clients at one poll per second, making frequent polling impossible",
    "Split brain is prevented automatically by any replicated database, without needing consensus, offered as a complete explanation but inconsistent with the mechanism named in the prompt": "Split brain is impossible once you run any replicated SQL database, with no consensus protocol required",
    "JSON does not support integers larger than 100 — which stops after «JSON does not support integers larger than 100» and never reaches the mechanism under discussion": "JSON caps integers at 100 in the spec, ignoring IEEE-754 double rounding that loses precision above 2⁵³",
    "Message loss is impossible once a webhook URL is registered — which treats «Message loss is impossible once a webhook URL is registered» as sufficient without the coordinating step the question names": "Message loss is impossible once a webhook URL is registered, as if the broker held undelivered events for offline consumers",
    "Debit and credit instructions are always applied immediately with no possibility of replay — as if «Debit and credit instructions are always applied immediately with no» alone replaced the structure the design actually adds": "Debit and credit instructions are applied once immediately, with no checkpoint replay or request-id deduplication on recovery",
    "It prevents any two users from ever seeing different data — which treats «prevents any two users from ever seeing different data» as sufficient without the coordinating step the question names": "It prevents any two users from ever seeing different data — confusing global consistency with per-user monotonic reads across lagging replicas",
    "Because sloppy quorums require synchronous replication to all n home nodes, which does not explain the behavior the question is asking about — which misses the invariant the question is targeting": "Because sloppy quorums require synchronous replication to all n home nodes, ignoring that writes may land outside the usual replica set",
    "Because liveness properties are considered unimportant and can be ignored entirely, which does not explain the behavior the question is asking about — which stops after «liveness properties are considered unimportant and can be ignored» and never reaches the mechanism under discussion": "Because liveness properties are unimportant and may be ignored entirely, unlike safety violations that must never occur even under partial failures",
    "That linearizability only applies to databases using multi-leader replication, judging languages by syntax length instead of by how well the data model fits the query": "That linearizability only applies under multi-leader replication, not the single-copy illusion every client operation should see",
    "Always 50% — assuming": "Always 50% — as if five independent 1% failure trials averaged half failures",
    "Ambassadors cannot reach localhost unless the API is already at v1": "Ambassadors cannot call localhost until the API version field is already set to v1 in the spec",
    "Whenever you use Kafka — which misses the invariant the question is targeting": "Whenever you use Kafka — even when the next stage does not need the full parallel output set",
    "Only when the process logs at Fatal severity": "Only when the process emits Fatal-level logs, not for batch jobs that exit early",
    "Local caches always consume less RAM than a shared remote cache tier": "Local process caches always use less RAM than a centralized shared cache cluster",
    "Jitter deletes the queue — which misses the invariant the question is targeting": "Jitter deletes the queue — confusing backoff randomization with removing backlog work entirely",
}


def main() -> None:
    count = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        if path.name == "02-hash-indexes-and-lsm-trees.mdx":
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in PATCHES.items():
            old_esc = old.replace("\\", "\\\\").replace("'", "\\'")
            new_esc = new.replace("\\", "\\\\").replace("'", "\\'")
            needle = f"'{old_esc}'"
            repl = f"'{new_esc}'"
            if needle in text:
                text = text.replace(needle, repl)
                count += 1
        if text != orig:
            path.write_text(text, encoding="utf-8", newline="\n")
    print(f"patches applied: {count}")


if __name__ == "__main__":
    main()
