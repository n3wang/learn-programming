# Clocktower University — Skills

Edit this file when you want to change skill balance or wording.  
**Code source of truth:** `src/components/party/games/university/data.js` (`SPELLS`)  
**Night resolution:** `src/components/party/games/university/rules.js` (`resolveNight` / `cast`)

After you rewrite abilities here, tell the agent to sync `data.js` + rules.

## Economy

| Setting | Value | Code |
| --- | --- | --- |
| Learn cost | 6 Knowledge | `SPELL_COST` |
| Draw size | 2, keep 1 | `SPELL_DRAW` |
| Max skills held | 3 (actives + passive) | `MAX_SPELLS` |
| Max passives / player | 1 (other passives stay out of draws) | `unownedSpells` |
| Max night uses queued | 2 | `MAX_NIGHT_CASTS` |

## Campus

| Setting | Value | Code |
| --- | --- | --- |
| Room count | `clamp(floor(n/3), 2, 5)` — e.g. 2 @ 6p, 3 @ 9p, max 5 | `roomsFor` |
| Day visibility | Rooms for moving; **who sleeps where is hidden** | player + host UI |
| Night visibility | Phone **room card**: your room + living roommates | `view.sleepRoom` / `view.roommates` |
| Demon targets | Other living players in **your own room** | `roleTargets` (`demon`) |
| Demon King slay | Any living player after night 1 (locks may block) | `roleTargets` (`demonking`) |
| Evil info | Demons know Demon King(s); King does **not** know Demons | `cultOf` |

Rarity / new-skill draft (Clocktower art, archetypes, room as *target/intel* not required theme): `university-skills-rarity-proposal.md`

## Fields

- **id** — key in `SPELLS`
- **type** — `night` (queued) · `day` (instant) · `passive`
- **range** — `self` · `player` · `roomPlayer` · `room` · `move`
- **uses** — charges (`0` = unlimited)

---

## Skills

### protection — Protection / 守护

| | |
| --- | --- |
| type | night |
| range | player |
| uses | 2 |
| en | They can’t be slain tonight. |
| zh | 今晚他不会被击倒。 |

### sanctuary — Sanctuary / 圣所

| | |
| --- | --- |
| type | night |
| range | room |
| uses | 1 |
| en | Up to 4 players in your room can’t be slain tonight. |
| zh | 你房间里最多 4 名玩家今晚不会被击倒。 |

### ignition — Sudden Ignition / 骤燃

| | |
| --- | --- |
| type | night |
| range | roomPlayer |
| uses | 1 |
| en | A player in your room is slain tonight (protection still stops it). |
| zh | 你房间里的一名玩家今晚被击倒（守护仍可阻止）。 |

### secondwind — Second Wind / 回气

| | |
| --- | --- |
| type | passive |
| range | self |
| uses | 1 |
| en | The first time you would be slain, you survive. |
| zh | 你第一次将被击倒时，你会幸存。 |

### reveal — Reveal Light / 显形之光

| | |
| --- | --- |
| type | night |
| range | room *(boosted: was roomPlayer)* |
| uses | 2 |
| en | Learn whether **each other player in your room** is good or evil. |
| zh | 得知你房间里**每一名其他玩家**是善良还是邪恶。 |

### lantern — Lantern Count / 灯笼计数

| | |
| --- | --- |
| type | night |
| range | room |
| uses | 1 |
| en | Learn how many evil players sleep in your room. |
| zh | 得知你房间里有几名邪恶玩家。 |

### flower — Flower Watch / 花之守望

| | |
| --- | --- |
| type | passive |
| range | self |
| uses | 0 (always on) |
| en | Every morning, learn whether a Demon King voted yes yesterday. |
| zh | 每天早上得知昨天是否有魔王投了赞成票。 |

### loud — Loud Voice / 大嗓门

| | |
| --- | --- |
| type | day |
| range | self |
| uses | 2 |
| en | Your final expulsion vote counts twice. |
| zh | 你最终开除票算两票。 |

### hush — Hush / 噤声

| | |
| --- | --- |
| type | day |
| range | player |
| uses | 1 |
| en | They can’t vote on the final expulsion ballot. |
| zh | 他不能投最终开除票。 |

### step — Shadow Step / 暗影步

| | |
| --- | --- |
| type | night |
| range | move |
| uses | 2 |
| en | Move to another room tonight, after the locks are set (not into a locked room). |
| zh | 今晚在上锁之后换到另一个房间（不能进入上锁的房间）。 |

### disguise — Disguise / 伪装

| | |
| --- | --- |
| type | night |
| range | self |
| uses | 1 |
| en | Tonight you look good to every skill and ability. |
| zh | 今晚所有技能和能力都会把你看成善良。 |

### gift — Gift of Knowledge / 知识馈赠

| | |
| --- | --- |
| type | day |
| range | player |
| uses | 0 (unlimited) |
| en | Give a player 5 of your Knowledge. |
| zh | 送给一名玩家 5 点知识。 |

---

## Notes for boosts

- Edit the **en / zh** lines and range/uses above.
- If **range** or night behavior changes, `rules.js` must change too (not only the text).
- Example already applied: **reveal** now scans the whole room.
