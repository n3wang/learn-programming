---
sidebar_position: 4
title: Fighting game workshop (plan)
---

# Fighting game workshop — student characters & backgrounds

Students upload **characters** and **backgrounds** from the learning site, store them permanently, share them with the class, show **author** under each item, and delete **only their own**. Soft cap: **10 characters + 10 stages** per student.

If the backend is unreachable, the game still runs with built-in packs only (current behaviour).

## Product rules

| Rule | Spec |
| --- | --- |
| Quota | 10 characters and 10 stages per student (separate) |
| Visibility | Class-shared: anyone can **use** published packs in-game |
| Edit | Author can replace files / rename / tweak meta |
| Delete | Author only (soft-delete). Admin can purge |
| Built-ins | Samurai, Kenji, Classic, Mountain, Arena, Town, Forest (`author = null`) |
| Attribution | Select UI: `by {display_name}` under portrait / map thumb |
| Offline | No backend → play built-ins; workshop shows offline; uploads disabled |

## Pack shapes

**Character** — spritesheets for `idle, run, jump, fall, attack1, attack2, takeHit, death` plus frame metadata and kit overrides (damage, speed, jump). No student-supplied JS.

**Stage** — single image or parallax `z3/z2/z1`, width, track Y, optional tint/alpha, thumbnail crop.

## Storage

- **MongoDB** (`learn_game.game_asset_packs`) for pack metadata, ownership, quotas, tracks
- **site-c file API** (`https://c.l.l0l.in`) for PNG binaries → Koofr + `public_url`
- Spring classroom API remains the game’s catalog front door (`/api/classroom/game-packs`)
- Soft-delete via `archivedAt`; remote file delete is best-effort
- Postgres still holds rosters/students for owner checks

## Auth (MVP)

Named student from site settings session (`rosterId` + `name`) sent on write APIs. Same openness as other `/api/classroom/**` endpoints. Passkeys later.

| Action | Who |
| --- | --- |
| List published packs | Anyone |
| Upload / edit / delete | Owner (matched by roster + display name) |
| Unpublish / purge | Admin |

## Learning-page UX

On the fighting-game doc page:

1. **My Workshop** — own packs, quota `n/10`, Edit / Delete / **Test this character**
2. **Class Gallery** — everyone’s packs
3. **Upload wizard** — character or stage
4. Game iframe / new-tab link keeps working offline

**Test this character** opens the Phaser game in test-range mode with that pack as P1 (dummy P2).

## Game integration

1. Boot: try `GET /api/classroom/game-packs` (short timeout)
2. On success, merge remote characters/stages into select + preload
3. On failure / empty, use built-ins only
4. Show author under custom cards

## API

```
GET    /api/classroom/game-packs?kind=
GET    /api/classroom/game-packs/{id}
POST   /api/classroom/game-packs
POST   /api/classroom/game-packs/{id}/files
PATCH  /api/classroom/game-packs/{id}
DELETE /api/classroom/game-packs/{id}
GET    /api/classroom/game-packs/files/{fileId}   // binary
```

## Online 1v1

The select screen's opponent toggle cycles **1 vs 1（本机）→ 1 vs 电脑 → 1 vs 1（联机）**. Online opens a lobby that queues on the Spring relay and waits for a second student to press online.

| Piece | Spec |
| --- | --- |
| Transport | Raw WebSocket at `/ws/fight` (no STOMP/SockJS), URL derived from the same API base as the pack catalog; `?ws=` overrides |
| Matchmaking | FIFO queue per room (`?room=`, default `default`); the longest-waiting client hosts |
| Netcode | **Host-authoritative**: P1's browser simulates both fighters and streams snapshots; P2 streams inputs back. The server only relays — it never parses game frames |
| Framing | Both clients render the identical world (P1 left, P2 right); the guest plays the right-hand fighter with the 玩家1 keys, and bars are tagged `（你）` |
| Host's picks win | Stage comes from the host; each player brings their own character |
| Unknown packs | A character/stage the other browser never loaded falls back to a built-in locally — the host still drives the fight |
| Pause | Esc online opens a non-blocking menu; one client can never freeze the other |
| Rematch | Both sides must ask; the host fires the restart cue |
| Identity | `?name=`, else a remembered generated handle |
| Offline | Connect failure, no `WebSocket`, or an old backend → lobby says 离线 and local 1v1 / 1v PC are untouched |

Server messages: `welcome` `queued` `match` `opponent-left` `pong` `error`. Relayed verbatim between the pair: `in` (input), `st` (snapshot), `ev` (popup / end / rematch). `GET /api/classroom/fight/status` reports `online` / `waiting` / `matches`.

## Safety

- PNG only; size limits per file
- Server image sniff
- No executable student code in packs

## Phases

| Phase | Status |
| --- | --- |
| 1 – MVP: Mongo metadata + site-c uploads, stage+tracks workshop, author, delete, offline-safe game | **done** |
| 1b – 编程 lesson: pixel background + track lines | **done** |
| 1c – 联机 1v1: Spring WebSocket relay, host-authoritative netcode, offline-safe | **done** |
| 2 – richer kit/parallax editors, portrait crop | planned |
| 3 – passkeys, approve-to-publish, fork/remix | planned |
