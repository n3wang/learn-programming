---
sidebar_position: 4
title: Student activity + professor heatmap (plan)
---

# Student activity + professor heatmap (plan)

Track when students are logged in and working on homework / lesson activities, then show a **professor heatmap** of who did work on which days.

Uses the existing **springbackend** (same host as party WebSockets and `/api/classroom`):

| Concern | Endpoint / module |
| --- | --- |
| Backend host | `apiBase.js` → local `http://localhost:8080`, fallback `https://springbackend.l.l0l.in` |
| Party games | `/ws/party` via `partyClient.js` |
| Classroom | `/api/classroom/**` via `classroomClient.js` |
| Activity events (this plan) | `/api/store/**` via `storeClient.js` (Postgres `jsonb` document store — **not** MongoDB) |

Related: [student-data-platform.md](./student-data-platform.md) (rosters / day-stats), JSON Document Store prototype notes (backend `StoreController`).

---

## Goal

1. **Student side** — when a student has picked their name (roster dock) and is using the site, post lightweight activity events.
2. **Student self-view** — in the gear **ACCOUNT** panel (under the name / 提交作业 / Log out row), show a **12-day activity heatmap** for that student, plus a line under it with the **total activity count** in that window.
3. **Professor side** — a page that loads those events and draws a class heatmap (student × day, intensity = activity count or active minutes).
4. **No new DB product** — reuse `/api/store` collections; keep `/api/classroom` for rosters and pick points.

---

## Document shape

Collection name: `student_activity`

```json
{
  "roster": "chuyi",
  "student": "张三",
  "kind": "login" | "lesson" | "interact" | "exercise" | "heartbeat",
  "path": "/fundamentals/...",
  "day": "2026-11-23",
  "meta": {}
}
```

Server adds `_id`, `_createdAt`, `_updatedAt` on create.

| `kind` | When to fire |
| --- | --- |
| `login` | Student selects / confirms name in roster dock (once per session day) |
| `lesson` | Meaningful page view of a lesson / homework route (debounced) |
| `exercise` | Pass a CodeExercise / quiz / practice widget (optional v2) |
| `interact` | Click a control (检查 / 下一题 / 显示解答 / options) or type an answer inside page content — at most 1 per minute, `meta.action` = last control label, `meta.actions` = clicks folded in |
| `heartbeat` | Every 5 min while the tab is visible **and** the student scrolled / typed / clicked since the last one |

`day` = local calendar `YYYY-MM-DD` (same class-day idea as day-stats; timezone policy still open — default browser local for prototype).

---

## Frontend pieces

### Already done

- [x] `src/api/apiBase.js` — shared base URL + local → remote fallback  
- [x] `src/api/storeClient.js` — store CRUD + `postStudentActivity` / `fetchStudentActivity`  
- [x] Document store live on springbackend (`/api/store/**`, `permitAll` prototype)

### To build

| # | Item | Notes |
| --- | --- | --- |
| 1 | **Activity reporter hook** | e.g. `useStudentActivityReporter` — reads active roster + student name from existing dock/local state; posts `login` once; heartbeats while visible; optional `lesson` on pathname change |
| 2 | **Wire into Root / StudentPickDock** | Only post when a real roster student is selected (not anonymous / empty) |
| 3 | **Account-panel 12-day heatmap** | In `SiteLoginPanel` ACCOUNT section (below name + 提交作业 / Log out, above SETTINGS): compact strip of the **previous 12 days** for the logged-in student; under it, text like `245 activities (12 days)` |
| 4 | **Professor heatmap page** | New route under docs or a navbar “Class activity” page — pick roster, date range, load `GET /api/store/student_activity`, filter client-side |
| 5 | **Shared heatmap bits** | Small presentational component + helper to bucket events by `day` (reuse for account strip and professor grid). Avoid heavy chart libs |
| 6 | **Empty / offline states** | Account panel: hide strip or show empty cells if store down / no events. Professor page: “backend offline”. Student posting: fail quietly |
| 7 | **(Optional) Filter noise** | Cap heartbeats; skip same-path lesson spam; ignore `localhost` authoring if desired |

---

## Account panel heatmap (student self-view)

Placement: gear menu → **ACCOUNT** → after the 提交作业 / Log out row, **before SETTINGS**.

```
ACCOUNT
曹迪娜 · 初一
[ 提交作业 ]  [ Log out ]

[▓][░][·][▓][▓][░][·][▓][░][▓][·][▓]   ← last 12 days (oldest → today)
245 activities (12 days)

SETTINGS
…
```

| Detail | Choice |
| --- | --- |
| Window | Rolling **12 days** ending today (include today) |
| Who | Only the currently logged-in student + their roster |
| Data | `fetchStudentActivity()` then filter `roster` + `student` + `day` in range (or a thin helper that returns per-day counts) |
| Cell | One square per day; intensity from event count that day (empty / light / medium / heavy) |
| Caption | Total events in the 12-day window, e.g. `N activities (12 days)` / `N 次活动（近12天）` |
| Refresh | Load when panel opens (and after login); optional silent refresh on heartbeat success |
| Logged out | Do not show the heatmap strip |

Shared with professor view: same intensity scale / day bucketing helpers so colors mean the same thing.

---

## Professor heatmap UX (sketch)

```
[ Roster: 初一 ▾ ]  [ Last 14 days ▾ ]  [ Refresh ]

           Mon 11  Tue 12  Wed 13  ...
张三         ▓▓      ░░      ▓▓▓
李四         ░       ▓▓      ·
…
```

- Click cell → list events that day (path + kind + time).  
- Intensity legend: none / light / medium / heavy.  
- Sort by name or by total activity.

---

## Security / prototype limits

`/api/store` is **public** (`permitAll`) — anyone who can reach the API can read/write/wipe collections.

Acceptable for classroom LAN / trusted prototype. Before wider deploy:

- Auth or shared teacher token for reads of `student_activity`
- Students may only `POST` their own events (or use a write-only proxy)
- Do not put secrets in document bodies

---

## Out of scope (this plan)

- Replacing `/api/classroom` day-stats / pick points  
- Passkeys / student accounts  
- Server-side aggregation / SQL reports (client aggregates v1)  
- MongoDB  
- Deep analytics (time-on-task accuracy, anti-cheat)

---

## Suggested build order

1. Confirm store reachable: `GET https://springbackend.l.l0l.in/api/store` (and local `:8080` when running).  
2. Manual smoke: `POST /api/store/student_activity` with one sample doc; list collection.  
3. Hook reporter into student identity (dock) — `login` + `heartbeat` only.  
4. Day-bucket helper + compact 12-day strip; mount in ACCOUNT panel with activity total caption.  
5. Professor page: fetch + filter + class heatmap grid (reuse helpers).  
6. Add `lesson` / `exercise` kinds once both views are useful.  
7. Harden (debounce, auth) when the prototype sticks.

---

## Acceptance checks

- [ ] Student with roster name selected creates documents in `student_activity` on springbackend  
- [ ] Events include `roster`, `student`, `day`, `kind`  
- [ ] ACCOUNT panel shows a **12-day** heatmap for the logged-in student when the gear menu is open  
- [ ] Caption under the strip reports the **total activity count** for those 12 days  
- [ ] Professor page shows a cell for that student/day after refresh  
- [ ] Same `API_BASE_URL` / fallback path as party games (local Boot, else `springbackend.l.l0l.in`)  
- [ ] No crash if backend is down (student site still works; account strip degrades calmly)

---

## Open choices

- Heartbeat interval (2 vs 5 minutes) and whether hidden tabs pause.  
- Heatmap intensity: raw event count vs unique 5-minute buckets.  
- Class day timezone: `Asia/Shanghai` vs teacher browser.  
- Whether authoring on `localhost` should post activity at all.
