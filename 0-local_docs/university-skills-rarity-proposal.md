# Skills proposal — 1 use · B–S · Clocktower art · archetypes · room *targets*

**Status:** proposal only for uses / rarity / new skills / gates  
**Parent:** `university-skills.md`  
**Art folder:** `static/img/party/clocktower/role-*.webp`

## Live already

- Draw size **2, keep 1**; hand **max 3** skills; **max 1** passive
- Room fog + counts on host; night room card on phone
- **Demon** (`demon` / 魔): knows the **Demon King**; investigates **own room** only
- **Demon King** (`demonking` / 魔王): does **not** know Demons; may **slay any** living player after night 1 (locks can still block)

## Decisions (not synced — skills)

1. **Every active → `uses: 1`.** Passives keep one-shot / always-on models.
2. **Weaken actives** by dropping **tier** or using **`randomRoommate`** (random other living player in your room; no-op if alone). Not on passives.
3. **Archetypes** use role ids: `student` · `exchange` · `professor` · `demon` · `demonking`.
4. Wording: say **Demon / Demon King** (魔 / 魔王), not Cultist / Cult Leader.

### Range shorthand

| Range | Meaning |
| --- | --- |
| `self` | you |
| `player` | choose any living other |
| `roomPlayer` | choose other in your room |
| `randomRoommate` | engine picks random other in your room |
| `move` | choose a room to move to |

---

## Archetype gates

```js
archetypes: null | ['student'] | ['professor'] | ['demon'] | ['demonking'] | ['demon','demonking'] | …
```

---

## Suggested pull weights

| Tier | Weight |
| --- | --- |
| **B** | 4 |
| **A** | 2 |
| **S** | 1 |

---

## Existing skills (sync later: all actives → 1 use)

| id | Art | Tier | Uses → | Notes |
| --- | --- | --- | --- | --- |
| lantern | empath | B | **1** | evil count in your room |
| step | acrobat | B | **1** | move after locks |
| gift | sage | B | **1** | give Knowledge |
| flower | flowergirl | B | passive 0 | whether a **Demon King** voted yes |
| protection | monk | A | **1** | protect any |
| ignition | slayer | A | **1** | slay roomPlayer |
| disguise | spy | A | **1** | look good |
| loud | towncrier | A | **1** | double vote |
| hush | butler | A | **1** | silence vote |
| secondwind | fool | A | passive 1 | first lethal fail |
| sanctuary | tealady | S | **1** | protect your room |
| reveal | seamstress | S | **1** | sides in your room |

---

## Proposed new skills

**All actives: `uses: 1`.**

### Open pool

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| chamber | Same Dorm / 同寝 | `chambermaid` | night | `randomRoommate` | **B** | Learn **side** of a random roommate. |
| knight | Tainted Wing / 污翼 | `knight` | night | `roomPlayer` | **B** | Pick someone in your room: if they are a **Demon**, they are slain; otherwise **you** are slain. |
| raven | Last Glimpse / 临终一瞥 | `ravenkeeper` | passive | `self` | **A** | When slain: names of others in the killer’s room. |
| soldier | Iron Student / 铁生 | `soldier` | passive | `self` | **A** | First **Demon King** slay on you fails. |
| banshee | Ghost Ballot / 鬼票 | `banshee` | passive | `self` | **A** | Once after expulsion, cast one final-ballot vote as ghost. |
| advocate | Devil’s Pardon / 赦免 | `devilsadvocate` | day | `randomRoommate` | **B** | A random roommate cannot be expelled today. |
| fortune | Twin Probe / 双探 | `fortuneteller` | night | `self` | **B** | Two random other roommates (need ≥2): is **either** a Demon? |

### Student — `['student']`

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| philosopher | Guest Chair / 客座 | `philosopher` | night | `randomRoommate` | **A** | Once act as Professor: good/evil of a random roommate. |

### Exchange — `['exchange']`

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| drunk | Tipsy Alibi / 醉辩 | `drunk` | night | `randomRoommate` | **B** | Learn true side of a random roommate. |
| recluseveil | Deep Cover / 深潜 | `magician` | night | `self` | **S** | Tonight role actions treat you as a normal good Student. |

### Professor — `['professor']`

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| washer | Office Hours / 答疑 | `washerwoman` | night | `self` | **B** | Two names from your room; one is a **Demon** — or “no Demon here”. |
| exorcist | Banishing Strike / 驱魔一击 | `exorcist` | night | `randomRoommate` | **S** | If that random roommate is a **Demon**, they are slain immediately. |

### Demon — `['demon']`

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| poisonroom | Tainted Dorm / 污寝 | `widow` | night | `randomRoommate` | **B** | Random roommate: alignment/Professor reads flip wrong tonight. |
| godfather | Fall Guy / 替罪 | `godfather` | passive | `self` | **S** | First time a **Demon King** would be expelled, you die instead. |
| scarlet | Heir / 继位 | `scarletwoman` | passive | `self` | **A** | If a Demon King dies and ≥5 live, you become **Demon King** (you still won’t learn other Demons). |

### Demon King — `['demonking']`

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| fear | Fear Mark / 恐惧标记 | `fearmonger` | day | `randomRoommate` | **B** | Mark a random roommate; if they are not expelled today, learn whether they are good or evil. |
| ojo | Named Prey / 点名猎物 | `ojo` | night | `randomRoommate` | **A** | Tonight’s slay ignores **locks** only if the target is the rolled roommate (you see the name when casting). |

### Evil either — `['demon','demonking']`

| id | Name EN / ZH | Art | Type | Range | Tier | Ability |
| --- | --- | --- | --- | --- | --- | --- |
| noDashii | Hall Poison / 廊毒 | `nodashii` | night | `self` | **B** | Everyone else in your room gets false alignment if read tonight. |

---

## Art checklist

**Already used:** librarian, recluse, investigator, poisoner, imp, monk, tealady, slayer, fool, seamstress, empath, flowergirl, towncrier, butler, acrobat, spy, sage  

**Reserved:** chambermaid, knight, ravenkeeper, soldier, banshee, philosopher, drunk, magician, washerwoman, fortuneteller, exorcist, widow, godfather, scarletwoman, fearmonger, ojo, devilsadvocate, nodashii  

---

## Implementation notes (skills — later)

1. `uses: 1` on every active; `rarity` + optional `archetypes` (`demon` / `demonking`).
2. `randomRoommate` resolve helper.
3. Keep evil info asymmetry when shipping `scarlet` / King skills — King still blind to Demons after succession unless you deliberately change that.
