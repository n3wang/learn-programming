# Host screen animations — proposal

**Status:** elimination + dawn slain fly implemented (`HostElimLayer`); other beats still proposed  

**Surface:** Clocktower University **host / big screen** (`HostView` in `university/index.js`)  
**Existing motion:** vote face `votePop` on grade cards; campus day/night art swap (no motion yet)

Goal: make phase beats readable from the back of the room — one clear focal animation at a time, then settle back into the calm grade board + campus layout.

---

## Principles

1. **One hero beat per event.** Don’t animate the whole board at once.
2. **Reuse the real grade card.** Same seat color, avatar, name, score — don’t invent a second card design.
3. **Return to rest.** After the beat, the card sits in its normal grades slot (`data-dead` / `data-slain` styles).
4. **Respect timers.** Prefer finishing inside the existing phase window (`execution` ~7s, `dawn` ~8s, `voteReveal` ~8s) or extend that phase by ~1–2s if needed.
5. **Reduced motion.** If `prefers-reduced-motion: reduce`, skip fly/scale; only flash border + final dead style.

---

## 1. Elimination (day) — **must-have**

**Trigger:** `phase === 'execution'` and `s.expelled` is set (also cover Fall Guy victim).

**Storyboard**

| t | What happens |
| --- | --- |
| 0.0s | Grade card for the expelled seat is still in the grid (optional: dim others). |
| 0.0–0.45s | **Lift:** card clones (or FLIP) to screen center, scales ~1.6–1.9, soft dim scrim behind. |
| 0.45–1.1s | **Mark:** border + fill turn **red** (`#c2213b` family); short pulse; banner already says “{name} is expelled.” |
| 1.1–1.7s | **Disable:** opacity drops, grayscale kicks in (same look as `gradeCard[data-dead]`). |
| 1.7–2.3s | **Return:** FLIP / reverse fly back into the grades grid slot; scrim fades. |
| 2.3s+ | Resting dead card in place; roster may re-sort by grade on next paint. |

**Implementation sketch**

- Component: `HostElimAnim` overlaid on `.host` (portal optional).
- Source of truth: measure `#grade-{seatId}` with `getBoundingClientRect`, animate a floating clone with CSS vars `--x0/--y0/--x1/--y1` or Web Animations API.
- Hide the grid original (`visibility: hidden`) while the clone flies so it doesn’t double.
- On complete: unhide grid card with `data-dead` (and clear clone).

**Edge cases**

- **Nobody expelled:** short center toast only (“Nobody is expelled”) — no card flight.
- **Godfather swap:** animate the **actual** `s.expelled` id (the Fall Guy), not the original accused.
- **Revive later:** if they buy a life, reverse: dead → brief center flash green/cream → live card in grid (optional follow-up).

---

## 2. Night slain (dawn) — same choreography, multi-cast

**Trigger:** `phase === 'dawn'` and `s.deaths.length > 0`.

**Behavior:** play the elimination sequence **once per death**, queued (e.g. 2.4s each), red = night kill (`data-slain` red border already defined). Banner copy stays “Slain tonight: …”.

If peaceful dawn: soft campus pulse only (no cards).

---

## 3. Other host beats (nice-to-have)

| Beat | Trigger | Motion idea |
| --- | --- | --- |
| **Day ↔ night** | `phase` night / dayish | Campus art crossfade 400ms; shell `--bg` already transitions — keep that. |
| **Suspicion open** | enter `suspect` | Brief yellow pulse on grade board header; no card fly. |
| **Vote reveal** | `voteReveal` | Keep staggered `votePop` on faces; optionally scale up the current leader card in-place (no center fly). |
| **Defense stand** | `defense` | Accused cards get a shared yellow “on the stand” outline; bounce seat badges once. |
| **Good / evil win** | `over` | Confetti or side-tint wash; grade cards of winning side subtle glow; losing side already greyed if dead. |
| **Room lock night** | night + `locks[r]` | Small lock icon pop on that room card (already tagged). |

---

## 4. Timing vs game clock

| Phase | Today | Suggestion with anim |
| --- | --- | --- |
| `execution` | `EXEC_S` ≈ 7s | Keep ≥ 1 expulsion anim (~2.3s). If multiple never happen on day. |
| `dawn` | `DAWN_S` ≈ 8s | If `deaths.length` ≥ 3, either shorten per-card to ~1.6s or bump dawn by `+1.5×(n-2)` s in rules. |
| Host skip (F) | cuts timer | Cancel in-flight anim; snap cards to final dead state. |

---

## 5. Technical notes

- Prefer **FLIP** (First/Last/Invert/Play) so layout changes (roster re-sort by grade) don’t desync the return slot.
- Do **not** put elimination anim on phones — host-only spectacle; phones already get toast / voice.
- CSS module hooks: `.elimScrim`, `.elimFly`, `@keyframes elimPulseRed`, reuse `.gradeCard[data-dead]` / `[data-slain]` for the resting look.
- State: local React `elimQueue: id[]` derived from `s.expelled` / `s.deaths` + phase key so re-entry doesn’t replay forever (`playedKey = execution-${day}-${expelled}`).

---

## 6. Acceptance (elimination)

- [ ] Expulsion shows **one** card centered, turns **red**, then **disabled**, then **lands** in grades.
- [ ] Rest of board readable (scrim ≤ 45% opacity).
- [ ] Reduced-motion path skips flight.
- [ ] F-skip ends on final dead card in grid.
- [ ] Fall Guy animates the correct seat.

---

## Out of scope (for now)

- Per-skill cast FX on host  
- Phone-side elimination drama  
- 3D / particle blood — keep flat toon (ink border + red fill)
