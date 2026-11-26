# Lesson flags (CTF)

Scratch Notes tab **`flags`** (beside decks). Finish quizzes/exercises → unlock segments → type the full flag in the modal. Captured lesson → **green rect** before sidebar link text.

Pilot: all five DDIA chapter pages.

---

## Locked choices

| | |
| --- | --- |
| UI | `flags` tab only — no page-bottom widget |
| Capture | Submit joined segments in the modal (works from any page) |
| Multi-page flags | Allowed |
| Sidebar | Green rect only on full capture (no yellow) |
| Local | Always |
| Store | Only when `role === 'student'`; key by **student name** alone (unique across classes). `roster` = optional last-seen meta, never in doc id |
| Authoring | `flagSegment="WORD"` on challenge; catalog orders `from` ids |

---

## Flow

1. Pass quiz/exercise with `flagSegment` → **reveal toast only** (on the lesson): ASCII **monster** (hash of `flagId` — same creature for that flag) + `n/N · WORD`. Student must note the word; it is **not** stored in a readable list in the UI.
2. Open **flags** tab → monster, progress count only (e.g. `3/6`), submit input. **Never show segment words, slot labels, or `????` patterns in the modal** (avoids cheating / peeking).
3. Capture → local + Store (`lesson_flags`) + activity `kind: 'flag'`.
4. Sidebar: green rect before each path on that flag.

Help behind **`?`**: how flags work, that words appear only when you finish a challenge, assemble and submit here — no segment spoilers in the help text either.

---

## Monster (reveal)

- Deterministic ASCII face/creature from hash(`flagId`) — pick limbs/eyes/horns from a small template set (or one procedural block).
- Unique **per flag**, stable across segments and reloads.
- Toast on challenge finish (word + `n/N`). Modal shows the **monster only** (identity of which flag), never the words.
- Locally may still record that a source was completed for the `n/N` counter — do not render the stored words in the flags tab.

---

## Catalog + authoring

```js
// src/data/lessonFlags/ddia.js
{
  id: 'ddia-ch04-encoding',
  title: 'Formats for Encoding Data',
  series: 'ddia',
  paths: ['/fundamentals/.../formats-for-encoding-data'],
  format: 'FLAG{{{parts}}}',
  separator: '-',
  parts: [
    { from: 'ddia-encoding-fundamentals' },
    { from: 'exercise-length-prefixed' },
    // …
  ],
}
```

```mdx
<MultipleChoice id="ddia-encoding-fundamentals" flagSegment="BACK" ... />
<CodeExercise heading="exercise-length-prefixed" flagSegment="LENPFX" ... />
```

DDIA default: one flag per chapter → that page’s sidebar green. Extra multi-page flags: `sidebarPaths: []` if they should not drive greens.

---

## Persistence

**Local** `lesson-flags:v1` — `revealed[sourceId]`, `captured[flagId]`; event `lesson-flags-change`.

**Store** collection `lesson_flags`, doc id `${sanitize(student)}__${flagId}`:

```json
{
  "student": "Nelson Wang",
  "roster": "chuyi",
  "flagId": "ddia-ch04-encoding",
  "flag": "FLAG{BACK-COMPAT-LENPFX-TAGS-BYNAME-AVRO}",
  "segments": ["BACK", "COMPAT", "LENPFX", "TAGS", "BYNAME", "AVRO"],
  "completedAt": "…"
}
```

Submit check: trim, upper, optional `FLAG{}` wrap; join resolved parts. Reveal not required to submit.

---

## Wire

| Piece | Notes |
| --- | --- |
| `lessonFlagStore` | reveal / capture / `capturedPaths()` |
| `flagMonster(flagId)` | ASCII from hash |
| `MultipleChoice` / `CodeExercise` | `flagSegment` → reveal + monster toast |
| `FlagsPanel` | list, monster, `n/N` only, input, **`?` help** — no segment text |
| Sidebar link swizzle | `menu__link--flag-captured` + green rect |

---

## DDIA segments

Form: `FLAG{A-B-…}`

### Ch.1 graphs — `ddia-ch01-graphs`
| from | seg |
| --- | --- |
| `ge-ddia-property-graphs` | `PROPGRAPH` |
| `ge-ddia-cypher` | `CYPHER` |
| `ge-ddia-sparql` | `TRIPLE` |
| `ge-ddia-datalog` | `DATALOG` |

`FLAG{PROPGRAPH-CYPHER-TRIPLE-DATALOG}`

### Ch.2 hash/LSM — `ddia-ch02-hash-lsm`
| from | seg |
| --- | --- |
| `exercise-toy-db` | `APPEND` |
| `ddia-storage-toy-db` | `INDEXCOST` |
| `ddia-storage-hash-index` | `BITCASK` |
| `exercise-compaction` | `COMPACT` |
| `ddia-storage-lsm` | `SSTABLE` |

`FLAG{APPEND-INDEXCOST-BITCASK-COMPACT-SSTABLE}`

### Ch.3 B-trees — `ddia-ch03-btrees`
| from | seg |
| --- | --- |
| `ddia-storage-btree-structure` | `BTREE` |
| `ddia-storage-comparison` | `WRITEAMP` |
| `ddia-storage-other-indexes` | `SECONDARY` |

`FLAG{BTREE-WRITEAMP-SECONDARY}`

### Ch.4 encoding — `ddia-ch04-encoding`
| from | seg |
| --- | --- |
| `ddia-encoding-fundamentals` | `BACK` |
| `ddia-encoding-textual-formats` | `COMPAT` |
| `exercise-length-prefixed` | `LENPFX` |
| `ddia-encoding-thrift-protobuf` | `TAGS` |
| `ddia-encoding-avro` | `BYNAME` |
| `exercise-schema-resolution` | `AVRO` |

`FLAG{BACK-COMPAT-LENPFX-TAGS-BYNAME-AVRO}`

### Ch.5 dataflow — `ddia-ch05-dataflow`
| from | seg |
| --- | --- |
| `ddia-dataflow-databases` | `OUTLIVES` |
| `exercise-idempotent-retry` | `IDEMPOTENT` |
| `ddia-dataflow-rpc` | `REST` |
| `exercise-pubsub` | `PUBSUB` |
| `ddia-dataflow-messaging` | `BROKER` |

`FLAG{OUTLIVES-IDEMPOTENT-REST-PUBSUB-BROKER}`

---

## Build order

1. Catalog + store + monster helper  
2. `flagSegment` hooks + reveal toast  
3. MDX segments (tables above)  
4. Flags tab + `?`  
5. Sidebar green  
6. Student Store sync  

Out of scope: yellow sidebar, hashing segments for secrecy, non-DDIA, gradebook column.

---

## Implementation notes (2026-11-26)

- Files: `src/data/lessonFlags/{catalog,ddia,store,sync,monster}.js`, `src/components/LessonFlags/*` (`RevealToast`, `FlagsPanel`, `LessonFlagsSync`, `useLessonFlags`), swizzle `src/theme/DocSidebarItem/Link`.
- Catalog parts carry `seg` as well as `from` — submissions are checked against the catalog so a flag can be submitted without having visited every page. MDX `flagSegment` is what the toast shows; a dev-only console warning fires if the two differ.
- Sidebar class is `menu__list-item--flag-captured` on the `<li>` (via `item.className`): the original link spreads props after its own `menu__link` className, so a className prop would replace it.
- Finished quizzes get a **Show flag piece** button (re-fires the toast) so quizzes completed before flags existed don't need a restart. CodeExercise re-reveals on any all-pass check.
- Store upsert: `PUT /api/store/lesson_flags/{id}`, falling back to `POST` with `_id` on 404. On student login, `LessonFlagsSync` pulls their captures and pushes local-only ones.
