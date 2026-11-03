# Clocktower University — Skills

**Code source of truth:** `src/components/party/games/university/data.js` (`SPELLS`)  
**Night / cast resolution:** `src/components/party/games/university/rules.js`  
**Rarity design notes:** `university-skills-rarity-proposal.md`

## Economy

| Setting | Value |
| --- | --- |
| Learn cost | 6 Knowledge (`SPELL_COST`) |
| Draw | 2 keep 1, **weighted by rarity** B:4 A:2 S:1 |
| Hand | max 3; max 1 passive |
| Night queue | max 2 |
| Actives | **1 use** each |
| Archetypes | optional `archetypes: ['student'…]` gate on draw |

## Ranges

`self` · `player` · `roomPlayer` · `randomRoommate` · `room` · `move`

## Catalog (id · rarity · type · range)

### Open

| id | R | Type | Range | EN |
| --- | --- | --- | --- | --- |
| lantern | B | night | room | Lantern Count |
| step | B | night | move | Shadow Step |
| gift | B | day | player | Gift of Knowledge |
| flower | B | passive | self | Flower Watch |
| chamber | B | night | randomRoommate | Same Dorm |
| knight | B | night | roomPlayer | Tainted Wing |
| advocate | B | day | randomRoommate | Devil’s Pardon |
| fortune | B | night | self | Twin Probe |
| protection | A | night | player | Protection |
| ignition | A | night | roomPlayer | Sudden Ignition |
| disguise | A | night | self | Disguise |
| loud | A | day | self | Loud Voice |
| hush | A | day | player | Hush |
| secondwind | A | passive | self | Second Wind |
| raven | A | passive | self | Last Glimpse |
| soldier | A | passive | self | Iron Student |
| banshee | A | passive | self | Ghost Ballot |
| sanctuary | S | night | room | Sanctuary |
| reveal | S | night | room | Reveal Light |

### Role-gated

| id | Role | R | Type | Range | EN |
| --- | --- | --- | --- | --- | --- |
| philosopher | student | A | night | randomRoommate | Guest Chair |
| drunk | exchange | B | night | randomRoommate | Tipsy Alibi |
| recluseveil | exchange | S | night | self | Deep Cover |
| washer | professor | B | night | self | Office Hours |
| exorcist | professor | S | night | randomRoommate | Banishing Strike |
| poisonroom | demon | B | night | randomRoommate | Tainted Dorm |
| scarlet | demon | A | passive | self | Heir |
| godfather | demon | S | passive | self | Fall Guy |
| fear | demonking | B | day | randomRoommate | Fear Mark |
| ojo | demonking | A | night | randomRoommate | Named Prey |
| noDashii | demon/demonking | B | night | self | Hall Poison |

Edit `data.js` for wording/uses/rarity; change `rules.js` when behavior or range changes.
