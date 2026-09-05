---
sidebar_position: 3
title: Student data platform (draft)
---

# Student data platform (draft)

Notes toward moving classroom session data (rosters, pick-student behavior, drafts, submissions) off browser IndexedDB into a real backend — without forcing every field to exist.

## Why not keep IndexedDB forever

IndexedDB on the teacher laptop is fine for a single session:

- participation points / absent for “today”
- local pick weights

It falls apart when you want:

- the same roster on phone + classroom PC
- students signing in with a passkey
- draft code that survives browser clears
- 编程 “problem of the day” with screenshots
- reports across weeks

So: keep IndexedDB as an optional **offline cache**, but treat a server DB as source of truth.

## What “flexible” should mean here

For this service, flexible means:

1. **Almost every student field is optional** (name is the only hard requirement in practice; even email / passkey / pronunciation can be null).
2. **Rosters change** (students leave 初二; names get fixed; 编程 list is small and different).
3. **Different class types need different artifacts** (math participation vs 编程 screenshot + code).
4. **Schema can grow** without rewriting old rows (JSON blobs / nullable columns / append-only events).

### Recommendation

**PostgreSQL (managed: Supabase or plain Postgres) + object storage for files.**

| Option | Fit | Why |
| --- | --- | --- |
| **Postgres + JSONB** (Supabase) | Best default | Optional fields as nullable columns *or* JSON; strong queries for reports; Supabase gives Auth + Storage (screenshots) quickly |
| **PocketBase** (SQLite) | Fastest solo MVP | Single binary, collections, file uploads, simple admin UI — great until you need heavy multi-teacher analytics |
| **Turso / libSQL** | Edge SQLite | Nice if you want SQLite semantics globally; weaker story for big binary screenshots unless paired with R2/S3 |
| MongoDB | Only if documents are the primary model | Flexible, but joins for “roster × daily progress × submissions” get messier than SQL |

**Pick Supabase (Postgres) if** you want students to log in, upload screenshots, and sync drafts soon.  
**Pick PocketBase if** you want something running this weekend with almost no ops.

Avoid designing around a single giant Mongo “student document” for everything — participation-by-day and submissions are naturally tabular / event-like.

## Core entities (null-safe)

All timestamps UTC. Soft-delete with `archived_at` rather than hard deletes when a student leaves mid-term (reports stay coherent).

### `rosters`

One class list (初一 / 初二 / 编程 / …).

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `slug` | text | `chuyi`, `chuer`, `biancheng` |
| `label` | text | `初一`, `编程` |
| `kind` | text | `math` \| `programming` \| `other` (drives which submission UI) |
| `archived_at` | timestamptz null | |

### `students`

Roster membership. **Everything except `id` + `roster_id` can be null/empty** if you want — but you will usually at least store a display name.

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `roster_id` | uuid | FK → rosters |
| `display_name` | text null | Chinese name as shown in picker |
| `pinyin` | text null | curated pronunciation |
| `approx_pronunciation` | text null | English-ish hint |
| `email` | citext null | optional contact |
| `passkey_credential` | jsonb null | WebAuthn credential(s); null until enrolled |
| `passkey_user_handle` | text null | stable handle for WebAuthn |
| `external_ids` | jsonb null | future LMS / Discord / etc. |
| `meta` | jsonb null | bag for one-off fields |
| `archived_at` | timestamptz null | left school; keep history |

Unique optional: partial unique index on `(roster_id, email)` where email is not null.  
Do **not** unique on `display_name` alone (duplicates across years / 严景涵 on two lists).

### `student_day_stats` (sync of today’s pick behavior)

Replaces the current IndexedDB `date|rosterId` record, one row per student per day.

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `student_id` | uuid | FK |
| `roster_id` | uuid | denormalized for easy queries |
| `day` | date | local class day (store timezone policy in app config) |
| `points` | numeric | default 0; `+1` / `−1` (or whatever weights you choose) |
| `absent` | boolean | default false; excluded from random pool |
| `updated_at` | timestamptz | |

Unique `(student_id, day)`.

Weight for random select can stay app-side: prefer students with points closer to 0 among `absent = false`.

### `student_notes`

Teacher or student notes (personal, not necessarily graded).

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `student_id` | uuid null | null = roster-wide note |
| `roster_id` | uuid | |
| `author_role` | text | `teacher` \| `student` \| `system` |
| `body` | text | |
| `created_at` / `updated_at` | timestamptz | |

### `code_drafts`

Personal in-progress code (lesson runners, homework scratchpads).

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `student_id` | uuid | |
| `lesson_key` | text | stable id like `python/lesson-3` or exercise slug |
| `language` | text null | `python`, `java`, … |
| `source` | text | draft body |
| `revision` | int | optimistic concurrency |
| `updated_at` | timestamptz | |

Unique `(student_id, lesson_key)`.

### Manual submissions (编程 “problem of the day”)

Split **assignment definition** from **student handles / uploads**.

#### `assignments`

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `roster_id` | uuid | usually 编程 |
| `title` | text | “Problem of the day — Sep 5” |
| `prompt_md` | text null | optional markdown prompt |
| `day` | date null | when it was the featured problem |
| `accepts` | text[] | e.g. `{screenshot,code,link,note}` |
| `meta` | jsonb null | expected filenames, max size, etc. |

#### `submissions`

One attempt (or the current attempt) by a student for an assignment.

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `assignment_id` | uuid | |
| `student_id` | uuid | |
| `status` | text | `draft` \| `submitted` \| `reviewed` |
| `note` | text null | student comment |
| `code` | text null | pasted / uploaded text |
| `link_url` | text null | GitHub / Replit / etc. |
| `score` | numeric null | optional teacher score |
| `teacher_feedback` | text null | |
| `submitted_at` | timestamptz null | |
| `updated_at` | timestamptz | |

Unique `(assignment_id, student_id)` if you only want one live submission per problem; otherwise drop unique and keep history rows.

#### `submission_assets`

Screenshots and other binaries (in object storage; DB holds metadata).

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `submission_id` | uuid | |
| `kind` | text | `screenshot` \| `file` \| `other` |
| `storage_path` | text | S3/Supabase path |
| `mime_type` | text null | |
| `byte_size` | int null | |
| `created_at` | timestamptz | |

## Auth sketch (passkey)

- Teacher: password or passkey to admin.
- Student: optional **passkey** bound to `students.passkey_credential`; until enrolled, teacher can still mark +/−/absent by name only.
- Never require email to participate in class picking.

## Sync model (browser ↔ server)

1. **Teacher session (pick student)**  
   Write-through to `student_day_stats`; cache last day in IndexedDB for offline classroom Wi‑Fi.
2. **Drafts**  
   Debounced upsert to `code_drafts` keyed by `(student_id, lesson_key)` + `revision`.
3. **编程 submissions**  
   Create/update `submissions`, upload files to storage, insert `submission_assets`.
4. **Roster edits**  
   Archive students instead of deleting; randomizer and reports skip `archived_at` unless viewing history.

## Null-safety rules (product)

- Missing pronunciation → generate from name client-side (current `pinyin-pro` fallback), do not block save.
- Missing email / passkey → student still appears in roster and reports.
- Student removed from roster mid-year → `archived_at` set; old `student_day_stats` / submissions remain queryable as “former”.
- Unknown `lesson_key` or deleted assignment → show row as orphan in reports, never crash UI.
- All API responses treat absent keys as defaults (`points: 0`, `absent: false`, empty arrays).

## Suggested build order

1. Postgres (or PocketBase) + `rosters` / `students` import from current `classRosters.js`.
2. API for `student_day_stats` and point the settings picker at it (keep IndexedDB fallback).
3. Misc **Student reports** page reads from API by `day` + roster.
4. `code_drafts` behind lesson editors.
5. `assignments` / `submissions` / Storage for 编程 problem-of-the-day + screenshots.

## Open choices (decide later)

- Local “class day” timezone (China `Asia/Shanghai` vs teacher browser local).
- Whether `−` is −1 or −0.2 for pick weights.
- One submission per assignment vs full attempt history.
- Student self-serve passkey enrollment vs teacher-issued invite codes.

## Related today

- Client pick + daily points: settings gear → Pick student (IndexedDB).
- Reports UI: [Student reports](./student-reports).
- Roster source of truth in repo: `src/data/classRosters.js` (seed data for the future DB).
