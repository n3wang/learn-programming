# Party games: plan for more games beside Bets & Wagers

Goal: a `/party` main menu where the host picks a game, then everything works
the way Bets & Wagers does now: one big screen, phones join with a room code,
and the host screen runs the game.

These are free, non-commercial classroom "sim games" based on real games. Education mechanics come later.

| Game (id) | Based on | Theme | Players | Core loop | Effort |
| --- | --- | --- | --- | --- | --- |
| **画中有诈 / Fib Pics** (`fibpics`) | Drawful | **None.** Plain screens in the Wagers style | 3–16 | draw a prompt → others write fake titles → vote | ★★☆☆ |
| **夺权 / Power Grab** (`powergrab`) | Coup | Orbital space station ORBIT-9, year 2190 | 2–16 | hidden roles, bluff actions, challenge or block | ★★★☆ |
| **秘密希特勒 / Secret Hitler** (`secrethitler`) | Secret Hitler | **Original theme**: Liberals, Fascists, Hitler, 1930s parliament | 5–16 | hidden teams, elect a government, pass policies, use powers | ★★★☆ |
| **苏丹之城 / City of the Sultan** (`sultan`) | Citadels | Desert sultanate, bazaars, palaces | per your plan, up to 16 | draft a secret role each round, build districts with gold | ★★★☆ |
| **血染钟楼 / Blood on the Clocktower** (`clocktower`) | Blood on the Clocktower | **Classic theme**: the town of Ravenswood Bluff, Trouble Brewing roles | 5–16 | night abilities, day talk, nominate and vote, good vs evil | ★★★★ |

Build order: **Fib Pics → Power Grab → Secret Hitler → City of the Sultan → Blood on the Clocktower**.
Each game adds one new piece of shared infrastructure: drawing, then hidden hands and response windows,
then team reveals and group votes, then card drafting, then a night phase run by the screen.

### Status (2026-10-25)

| Piece | State |
| --- | --- |
| Relay (springbackend `party/`) | ✅ `input` frame for game actions, rooms up to 64 members, 64 KB frames, new unit test (25/25 pass). **Not deployed yet**: until it is, phones fall back to wrapping their input in a `bet` frame, and the live relay still caps rooms at 12 members. |
| Shared core (`src/components/party/core/`) | ✅ Host shell, phone shell, `/party` menu, seat ring, bots, test mode, placeholder sprites, voice with subtitles |
| Fib Pics | ✅ Built. Tested with 16 bots (duo mode) and a real phone |
| Power Grab | ✅ Built. Tested with 16 bots (factions, ghost brokers) and a real phone |
| Secret Hitler | ✅ Built. Tested with 16 bots (three-seat government, filler roles) and a real phone; 120 headless games at 5–16 seats all finish |
| City of the Sultan | ✅ Built with **default** 16-seat scaling (see §3.4, `SCALING()` in `sultan/rules.js`). Tested with 16 bots and a real phone; ready for your own 16-player plan |
| Blood on the Clocktower | ✅ Built (Trouble Brewing, screen as Storyteller). Tested with 16 bots and a real phone (night screen, nominate, vote, death, end reveal); 200 headless games at 5–16 seats all finish; role setup checked for every seat count |

---

## 0. The pattern every game follows

Each game must meet all of these before it counts as done:

| Requirement | What it means |
| --- | --- |
| **16 players** | Every game supports at least 16 seated players. Where the original game stops earlier, we add, invent or repeat roles (see "Scaling to 16" in each game). Anyone past the limit joins as audience. |
| **Bots** | "Add a bot / Add 3 bots / Fill to 16" in the lobby. Bots must be able to play every phase, including drawing and writing. A bot-only game must run from start to finish. |
| **Test mode** | `?test=1` on the host page: timers ×0.2, voice muted, and a **seat inspector** that shows any seat's phone screen next to the board and lets you play as that seat. `?seed=123` makes shuffles repeatable so a bug can be replayed. |
| **Theme** | Each game declares its screen theme (background, palette, music mood) and a matching phone skin. Fib Pics has none; Secret Hitler and Blood on the Clocktower keep their original themes. |
| **Voice** | A narrator voice and character voices, played **only on the big screen**, always with on-screen subtitles and a mute toggle. See §5. |
| **Seat numbers** | Players are seated 1–16 around the screen. Voice lines say "3号" instead of names, so every line can be pre-recorded (generated or typed names can't be). |
| **Same controls** | Same join form (room code, 🎲 generated name, avatar grid), toon buttons, avatars, emoji reactions and lobby as Bets & Wagers. |
| **Pure rules** | Rules live in plain functions (`rules.js`) that take the state and return changes, with no React or network. |

The shared UI (buttons, lobby, player chips) keeps the bold Wagers style everywhere. The theme changes the background,
the palette accents, the art, the music and the voices.

---

## 1. What we already had

| Piece | Where | Reused as |
| --- | --- | --- |
| WebSocket relay, rooms, codes, resume after reload | `src/api/partyClient.js`, springbackend `/ws/party` | as is, plus an `input` frame (§2.3) |
| Host is the referee; each phone gets its own `state` message (`to: playerId`) | `HostScreen.js` → `viewFor` | same idea in `HostShell`: **this gives us hidden information** (secret roles, hands) |
| Join form, generated names, locked names, avatars (43), reactions, countdown, connection badge | `BetsAndWagers/ui.js`, `names.js`, `strings.js` | imported directly by the party core |
| Coins and coin piles | `ui.js` (`Coin`, `CoinPile`, `AnimatedBank`) | Power Grab credits, Sultan gold |
| Saving game state to localStorage | `readJson` / `writeJson` | per-game key `party-host-<game>-v1` |

## 2. Architecture (built)

### 2.1 Folder layout

Bets & Wagers stays where it is, untouched, so it keeps playing exactly as before.

```
src/components/party/
  core/
    HostShell.js        big screen: room, lobby, bots, timers, voice, seat inspector
    PlayerShell.js      phone: Wagers-style join form, lobby, then the game's PhoneView
    partyCore.js        seats, 16 colours, bots, seeded dice, voice cues, durations
    SeatRing.js         up to 16 seats on an ellipse around the board
    Sprite.js           art with an emoji placeholder until the file exists
    voice.js            plays the cue mp3, or the browser's speech as a placeholder; subtitles
    strings.js          shell strings (falls back to Wagers' table)
    party.module.css    toon look + per-game theme classes
  menu/GameMenu.js      the /party game picker
  games/
    fibpics/            index.js (module + views)  drawing.js  prompts.js  fibpics.module.css
    powergrab/          rules.js  index.js  powergrab.module.css
    secrethitler/       rules.js  index.js  secrethitler.module.css
    sultan/             rules.js  index.js  sultan.module.css
    clocktower/         rules.js  index.js  clocktower.module.css
  registry.js           the menu list + findGame(id)
src/pages/party/
  index.js              /party menu
  host.js               ?game=<id> → HostShell, no game → Wagers host
  play.js               ?game=<id> → PlayerShell, no game → Wagers phone
static/img/party/<game>/     sprites (placeholders until the files exist)
static/audio/party/<game>/   voice clips
```

### 2.2 Game module interface

```js
export default {
  id: 'powergrab',
  emoji: '🛰️',
  title: {en: 'Power Grab', zh: '夺权'},
  blurb: {en: '…', zh: '…'},
  players: {min: 2, max: 16},
  minutes: 15,
  themeClass,                               // a theme from party.module.css (none for Fib Pics)
  defaultSettings: {…},
  voiceLines: {cueId: {en, zh}},            // what each voice cue says ({seat} → "3号")
  setup(g, seats, ctx) → state,             // deal roles, start the first phase
  input(state, g, playerId, msg, ctx) → bool,  // a phone (or bot) action; false = ignored
  tick(state, g, ctx) → bool,               // the phase's deadline ran out: take the default
  view(state, g, playerId, ctx) → object,   // what one phone may see (the anti-cheat line)
  bot(state, g, botId, ctx) → msg | null,   // the move a bot makes now, as if from its phone
  hostInput(state, g, msg, ctx),            // optional host buttons (skip)
  SettingsView, HostView, PhoneView,        // React components
};
```

`ctx` carries the dice (`rng`), the clock (`now`), the test-mode `speed`, the screen `lang`, and `seatOf(id)` for voice lines.

### 2.3 Relay (springbackend, done)

- Phones send every game action as `{type: 'input', …}`; the relay stamps the sender's `playerId` and forwards it to the host.
- Which game a room plays travels in the room settings (`settings.game`), which phones can read with `peek` before joining. A phone that types a code on the wrong page is sent to the right one.
- `MAX_MEMBERS` raised from 12 to 64, and the frame limit from 16 KB to 64 KB (drawings).
- Until the new relay is deployed, phones fall back to `{type: 'bet', input: …}`, which the old relay already forwards.

### 2.4 Main menu (`/party`)

- A grid of game cards: cover art (emoji placeholder until `static/img/party/<game>/cover.webp` exists), name, players, length and a short description.
- Bets & Wagers opens `/party/host`; the others open `/party/host?game=<id>`. The QR code sends phones to `/party/play?room=CODE&game=<id>`.

### 2.5 Hidden-information rules (Power Grab, Secret Hitler, Sultan, Clocktower)

- Only `view` decides what reaches a phone. Never send another player's cards "to hide later in the UI".
- The big screen shows **public** information only. Secret roles go to phones only.
- **Voice lines follow the same rule.** A line plays only when the event it describes is public. A secret role's voice plays only when that card becomes public: claimed, called, revealed, or shown at the end.
- Every phone shows **the same busy screen** during secret phases (night, drafting, legislation), so nobody can tell who is acting by watching who taps.
- Caveat: the full state lives in the host browser. Someone at the host laptop could read it in devtools. That is fine for class, but keep the host laptop with the teacher.

### 2.6 Screen layout for 16 seats

- `SeatRing` lays 2–16 seats on an ellipse around the board. Each seat shows the avatar, a seat-number badge, the name, and game badges (credits, cards, votes, plaques).
- From 13 seats on, avatars shrink and names truncate. Tested at 1280×720 with 16 seats.
- Seat numbers are fixed in join order when the game starts, because the voice lines depend on them.

---

## 3. The games

Each game has the same sections: **Theme & screen · Rules · Scaling to 16 · Bots · Voice · Sprites**.

### 3.1 Fib Pics 画中有诈 (Drawful), built

#### Theme & screen
**No theme.** The plain Wagers look: cream background, white toon cards, ink borders. The drawing sits in a white frame on the left and the titles on the right.

#### Rules (one round)
1. Each artist gets a secret prompt and draws it on their phone (75 s). Tools: 8 colours, eraser, 2 pen widths, undo.
2. The screen replays one drawing stroke by stroke. Everyone else writes a fake title (45 s).
3. The screen lists the real title and the fakes, shuffled. Players vote on their phones (25 s).
4. Reveal: +2 for picking the real title, the artists get +1 per right guess, and the authors of a fake get +1 per player they fooled.
5. After every drawing of the round: scores. After the last round: awards for best detective, master liar and clearest artist.

Prompt decks: **class** (平角, 射线 AB, 余角, 鸡兔同笼, 电容充电, 舵机, …), **silly**, or both. 1–3 rounds.

#### Scaling to 16 (built)
- **Duo mode** (9+ players, on by default, host can switch it off): seats pair up, and an odd seat joins the last pair as a trio. A duo **relay-draws** on one canvas: partner 1 draws for 35 s, then partner 2 continues the same picture. A duo submits one fake (the first teammate to send). Votes stay individual. 16 players → 8 drawings per round, at most 8 titles on screen.
- Identical fakes merge into one option, and a "fake" that matches the real title is refused ("That is the real title! Write a different one.").
- Drawings travel as strokes on a 256×192 grid, at most 1500 points, about 12 KB.

#### Bots (built)
- Draw a doodle of random circles and scribbles (placeholder for a small library of recorded doodles).
- Write a fake from a decoy list ("很累的三角形", "被狗吃掉的作业", …).
- Vote for the real title 40% of the time.

#### Voice
One neutral narrator, **The Host 主持人**: a friendly game-show voice, upbeat, clear, mid-tempo.

| Cue | When | Line (中文 / English) | Tone & delivery |
| --- | --- | --- | --- |
| `welcome` | game starts | 欢迎来到画中有诈。画得要像，骗得要真。 / Welcome to Fib Pics. Draw well, lie better. | Bright, smiling; small pause after the first sentence |
| `draw_start` | drawing begins | 拿起画笔！把你的秘密题目画出来，别让邻座看见。 / Pick up your pens! Draw your secret prompt, and don't let your neighbour peek. | Energetic, rising |
| `duo_swap` | relay hand-off | 换手！搭档接着画。 / Switch! Partners, finish the picture. | Snappy, like a whistle |
| `fake_start` | fakes begin | 这画的是什么？编一个能骗过所有人的名字。 / What is this masterpiece? Invent a title that fools everyone. | Sly, teasing; rising on "所有人" |
| `vote_start` | voting begins | 真的只有一个。投票吧。 / Only one title is real. Vote. | Lower, serious; two short sentences |
| `reveal_truth` | real title shown | 真相大白！ / Here is the truth! | Big, triumphant |
| `nobody_right` | nobody guessed | 没有一个人猜中……画家，该练练画画了。 / Nobody got it… maybe some drawing lessons? | Mock pity, a sigh first |
| `everyone_right` | all guessed | 全都猜中了！画得太清楚了。 / Everyone got it! What a clear drawing. | Warm, applause tone |
| `round_end` | scores | 看看现在的得分。 / Let's look at the scores. | Relaxed |
| `winner` | game end | 最后的赢家是……{seat}！ / And the winner is… {seat}! | Drumroll pause, then a warm swell |

#### Sprites
Fib Pics needs almost no art. The drawings are the art.

| Minimum (≈4) | Nice to have (+≈6) |
| --- | --- |
| Cover art (16:9 + square) | Confetti burst for "fooled everyone" |
| Pen, brush, eraser, undo icons (emoji for now) | 真 / 骗 stamp animation on the reveal |
| | Detective, liar and artist award badges |

---

### 3.2 Power Grab 夺权 (Coup), built

#### Theme & screen
**轨道站 ORBIT-9 / Orbital Station ORBIT-9, year 2190.** The station's founder has vanished, and every department head wants control. The station AI, HALO, narrates and reports to whoever wins.

| | |
| --- | --- |
| Background | Station bridge with a large window showing Earth slowly turning. In the center, a holographic round table where the seats sit. |
| Palette | deep space `#070b16`, hologram cyan `#3df2ff`, alert amber `#ffb020`, danger red `#ff3b5c` |
| Motion | Faint scanlines on the hologram, slowly drifting stars, and a red alarm sweep when someone launches an overthrow. |
| Music mood | Low synth pads with a pulse that speeds up during response windows. |
| Phone skin | Dark glass "wrist terminal" with cyan HUD lines. Your two role cards look like holographic ID badges. |

#### Rules (own names)
Everyone starts with 2 face-down role cards and 2 **credits**. On your turn you take one action.

| Action | Effect | Who can block |
| --- | --- | --- |
| Income | +1 credit | — |
| Station aid | +2 credits | Quartermaster |
| **Overthrow** | pay 7: target loses a card. Required at 10+ credits | — (cannot be stopped) |
| Quartermaster 军需官: levy | +3 credits | — |
| Phantom 影刃: strike | pay 3: target loses a card | Warden |
| Smuggler 走私者: skim | take 2 credits from a player | Smuggler, Envoy, Inspector |
| Envoy 特使: reshuffle | draw 2 from the deck, keep 2 of your 4 | — |
| Warden 安保官 | (blocks strike only) | — |
| Inspector 审讯官 *(9+ players)* | look at one of a player's cards, and may force them to swap it with the deck | — |

Any player may **challenge** a claimed role. If the claim was true, the challenger loses a card and the claimer swaps the revealed card for a new one. If it was false, the claimer loses a card.

**New tech:** the **response window**, a short timer after every claim in which phones show "Challenge / Block / Let it pass". It is a small state machine: `action → (challenge?) → (block?) → (challenge the block?) → resolve`. Write it as a pure function with a test for every path.

#### Scaling to 16
The problems: long waits between turns, a deck too small for 32 cards in hands, and knocked-out players with nothing to do.

| Idea | How it works | Verdict |
| --- | --- | --- |
| **Bigger deck + 6th role** | 9+ players add the Inspector. Copies per role scale with players: `ceil((2 × players + 3) / roles)`, so 16 players → 6 roles × 6 copies = 36 cards. | ✅ built |
| **Two factions** (9+ players, host can switch off) | Each player has a faction badge, 蓝区 (Blue Deck) or 橙区 (Orange Deck). You may only strike, skim or overthrow the **other** faction, unless everyone left is in one faction. Changing your own badge costs 1 credit and changing someone else's costs 2; that money goes into a station reserve. | ✅ built |
| **Ghost brokers** | Knocked-out players stay in as brokers: on their phone they call "who loses the next card". Each correct call is a ghost point. | ✅ built |
| **Fast pacing** | 30 s turn timer (income on timeout), 8 s response windows, the first challenge or block wins, silence counts as a pass. | ✅ built |
| Tournament tables | Split 13–16 players into two tables of 6–8 shown side by side; the winners play a final. | Optional "tournament" setting. |
| Teams of two sharing coins | 8 duos, each player holds 1 card. | ❌ Too confusing about who may claim what. |

#### Bots
- **Honest by default, bluffing 25% of the time.** Overthrow at 7+ credits, aiming at the player with the most credits.
- **Challenge** when more copies of a role have been claimed than exist, otherwise 10% of the time.
- **Block** when holding the blocking role, and bluff a block 15% of the time when targeted.

#### Voice
Voice roles:

| Voice | Character | Casting notes |
| --- | --- | --- |
| **HALO** (narrator) | Station AI | Female, calm, precise, slightly synthetic (light vocoder or ring modulation in post), deadpan humor, even pace |
| Quartermaster 军需官 | Supply chief | Older man, gruff, low, practical, a bit tired |
| Phantom 影刃 | Assassin | Androgynous whisper, cold, slow, very close to the mic |
| Smuggler 走私者 | Black marketeer | Young woman, cocky, fast, grinning delivery with small laughs |
| Envoy 特使 | Diplomat | Smooth baritone, polite, unhurried, with long pauses |
| Warden 安保官 | Security chief | Woman, military, clipped, hard consonants |
| Inspector 审讯官 | Internal affairs | Dry, nasal, suspicious, drawn-out vowels |

Narrator cues (HALO):

| Cue | When | Line (中文 / English) | Tone & delivery |
| --- | --- | --- | --- |
| `welcome` | lobby | ORBIT-9 指挥权空缺。候选人请就位。 / ORBIT-9 command is vacant. Candidates, take your seats. | Even, official; flat falling end |
| `turn` | turn starts | 3号，请行动。 / Seat 3, your move. | Neutral prompt. Seat number from the seat clips. Short |
| `challenge` | someone challenges | 有人提出质疑！ / Challenge raised! | Alarm tone, rising, faster |
| `claim_true` | challenge fails | 核实无误，说的是真话。 / Verified. The claim was true. | Cool, a touch smug |
| `claim_false` | bluff caught | 谎言被识破。 / Deception detected. | Cold, slow, falling |
| `blocked` | action blocked | 行动已被拦截。 / Action intercepted. | Matter-of-fact |
| `overthrow` | overthrow action | 警报！政变！ / Alert! Overthrow! | Loud, with a siren under it; reverb |
| `card_lost` | a card is lost | 影响力下降。 / Influence lost. | Clinical |
| `player_out` | player eliminated | 3号已失去全部影响力，转为幽灵经纪人。 / Seat 3 has lost all influence and becomes a ghost broker. | Somber, slower |
| `faction_switch` | badge changed | 阵营变更已记录。 / Faction change logged. | Bureaucratic, bored |
| `ten_credits` | 10+ credits | 资金超标，必须发动政变。 / Credit limit exceeded. An overthrow is mandatory. | Firm warning |
| `winner` | game end | 新指挥官诞生：3号。HALO 向您效忠。 / New commander: seat 3. HALO is at your service. | Grand, then softly obedient on the second sentence |

Card voices (play when the role is **claimed** or **revealed**, both public):

| Card | Claim line | Caught bluffing (said by the impostor's claimed role) | Block line |
| --- | --- | --- | --- |
| Quartermaster | 税款到账，三个信用点。 / Levy collected. Three credits. — flat, matter-of-fact ↘ | 你根本不管仓库！ / You don't run my stores! — gruff, offended | 援助？先过我这关。 / Aid? Through me first. — grumbling |
| Phantom | 目标……已锁定。 / Target… locked. — whisper, pause, clipped | 冒牌货。 / An imitation. — icy whisper | — |
| Smuggler | 借两个，回头还——也许吧。 / Borrowing two. I'll pay you back… maybe. — playful ↗, laugh at the end | 嘿，那是我的招牌！ / Hey, that's my trademark! — indignant, fast | 别碰我的货。 / Hands off my cargo. — sharp, grinning |
| Envoy | 让我……重新考虑一下立场。 / Let me… reconsider my position. — measured, long ellipsis | 外交豁免？你没有。 / Diplomatic immunity? Not you. — polite disdain | 我们谈谈，不必动手。 / Let's talk, not grab. — soothing |
| Warden | — | 安保名单上没有你。 / You're not on my roster. — clipped | 此路不通。 / Not on my watch. — hard stop, stern |
| Inspector | 把证件拿出来。 / Papers, please. — nasal, drawn out | 伪造证件，很有意思。 / Forged papers. Interesting. — dry, suspicious | 这次交易……需要审查。 / This transfer… needs review. — slow, suspicious |

#### Sprites

| Minimum (≈18) | Nice to have (+≈14) |
| --- | --- |
| Cover art | Each role with a second "revealed" pose |
| Bridge background (Earth window) + hologram table | Animated card flip (CSS 3D, no art) |
| **6 role cards** (shared holo-badge frame) | Lost-card "glitch" overlay |
| Card back (station logo) | Bluff caught animation (hologram breaking apart) |
| Credit chip and reserve pile | HALO "eye" that pulses with the voice |
| 7 action icons (income, aid, overthrow, levy, strike, skim, reshuffle) + inspect icon | Red alarm sweep overlay |
| Challenge icon and block icon (shield) | Winner commander insignia |
| Faction badges: Blue Deck, Orange Deck | Ghost broker chip (translucent) |

---

### 3.3 Secret Hitler 秘密希特勒 (original theme), code written

#### Theme & screen
**The original theme:** a 1930s German parliament. The **Liberals 自由党** (majority) don't know anyone; the hidden **Fascists 法西斯党** know each other and **Hitler 希特勒**, who only knows his team in 5–6 player games.

| | |
| --- | --- |
| Background | Cream poster paper with fine diagonal hatching (`themeReich`). Later: a parliament hall with a speaker's desk. |
| Palette | paper `#f4e4c1`, ink brown `#2a1d14`, Liberal blue `#7fb3e6` / `#3c6e9f`, Fascist red `#e8735a` / `#b3261e`, poster orange `#f08a24` |
| Board | Two policy tracks in the middle of the seat ring: blue (5 slots, 🏆 at the end), red (6 slots, with the power icon on each slot for this player count, 💀 at the end). The election tracker (3 dots) and deck/discard counts sit underneath. |
| Seats | 🎩 President, 📜 Chancellor, 🖋️ Clerk plaques; ✓ while voting; JA / NEIN on every seat when the votes are revealed together; ☠️ for executed players; every role shown at the end. |
| Music mood | Low brass and a slow snare; a single drum hit when a policy is enacted. |
| Phone skin | Same cream paper. The role card is **hold-to-reveal**, so a neighbour can't read it over a shoulder. |

#### Rules
1. **Roles** (15 s): everyone holds to see their role and taps "I've seen it".
2. **Nomination:** the President (rotates) nominates a Chancellor. Term limits: the last Chancellor (and the last President, with more than 5 alive) can't be nominated.
3. **Election:** everyone alive votes Ja / Nein at the same time; votes are shown together for 6 s. More Ja than Nein elects the government. Three failed elections in a row enact the top policy automatically (no power).
4. **Legislation:** the President draws 3, secretly discards 1, and passes 2 to the Chancellor, who enacts 1. After 5 Fascist policies the Chancellor may propose a veto; if the President agrees, both cards are discarded and the tracker moves.
5. **Powers** from Fascist policies (5–6 players: peek, execute, execute · 7–8: investigate, special election, execute, execute · 9–10: investigate, investigate, special election, execute, execute).
6. **Win:** Liberals with 5 Liberal policies or by executing Hitler. Fascists with 6 Fascist policies, or by electing Hitler Chancellor after 3 Fascist policies.

Every phase has a timer with a safe default (random legal nomination, unanswered votes don't count, random discard, first card enacted, veto refused, random power target), so a sleeping phone never stalls the table.

#### Scaling to 16 (built in the rules)

| Players | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Liberals | 3 | 4 | 4 | 5 | 5 | 6 | 7 | 7 | 8 | 9 | 9 | 10 |
| Fascists + Hitler | 1+1 | 1+1 | 2+1 | 2+1 | 3+1 | 3+1 | 3+1 | 4+1 | 4+1 | 4+1 | 5+1 | 5+1 |

| Idea | How it works | State |
| --- | --- | --- |
| **Three-seat government** (11+) | President + Chancellor + **Clerk 书记**. The President draws 4 and discards 1, the Clerk gets 3 and discards 1, the Chancellor gets 2 and enacts 1. More people per government, more stories to cross-check. | ✅ built |
| **Bigger deck** (11+) | 8 Liberal / 15 Fascist instead of 6 / 11. | ✅ built |
| **Powers 11–16** | investigate · investigate · special election · execute · execute. At 14+, the first investigation becomes a **public audit**: one random discarded policy is shown to everyone. | ✅ built |
| **Journalist 记者** (11+, Liberal) | Once per game, privately see the two policies the last Chancellor was handed. | ✅ built |
| **Bodyguard 保镖** (13+, Liberal) | The first time they are executed, they survive. | ✅ built |
| **Infiltrator 潜伏者** (15+, Fascist) | Shows as Liberal when investigated. | ✅ built |
| Two chambers voting separately | Split the table into two houses. | ❌ too slow |

#### Bots (built)
- **Liberal bots:** vote Ja 60% of the time; discard Fascist and enact Liberal whenever they can.
- **Fascist bots:** nominate team-mates 70% of the time; vote Ja for governments with a Fascist; discard Liberal and enact Fascist (25% chance of playing Liberal early to look trustworthy).
- **Powers:** random target among the players they're allowed to pick.

#### Voice
Voice roles:

| Voice | Character | Casting notes |
| --- | --- | --- |
| **The Speaker of Parliament 议长** (narrator) | Chairs the session | Booming, formal, middle-aged; chamber echo added in post; a gavel knock before announcements |
| Liberal 自由党 | Ordinary deputy | Earnest, warm, a little nervous |
| Fascist 法西斯党 | Party member | Smooth, cold, confident |
| Hitler 希特勒 | The hidden leader | Restrained and quiet, then hard and clipped on the last word |
| Journalist / Bodyguard / Infiltrator | 11+ roles | Journalist: quick, curious. Bodyguard: big, calm. Infiltrator: friendly, then turns cold mid-line |

Narrator cues (these are the lines in `secrethitler/index.js`):

| Cue | When | Line (中文 / English) | Tone & delivery |
| --- | --- | --- | --- |
| `welcome` | game starts | 议会开会！ / Parliament is in session. | Gavel, then booming |
| `role_reveal` | roles phase | 请拿起手机，按住查看身份。别让邻座看到。 / Pick up your phone and hold to see your role. Let no one see. | Hushed, slow, conspiratorial |
| `nominate` | new President | {seat}总统，请提名总理。 / President {seat}: nominate your Chancellor. | Formal, measured |
| `vote_open` | election | 全体表决！ / All members, vote! | Big, commanding |
| `vote_pass` | elected | 表决通过。 / The government is elected. | Satisfied, falling |
| `vote_fail` | rejected | 表决否决。 / The government is rejected. | Flat, disappointed |
| `deadlock` | 2 failures | 议会再次陷入僵局…… / Parliament is deadlocked again… | Worried, trailing off |
| `chaos` | 3 failures | 混乱！民众强行通过了一项法案！ / Chaos! The people force a policy through! | Shouted over crowd noise |
| `law_liberal` | Liberal policy | 一项自由党法案生效。 / A Liberal policy is enacted. | Warm, hopeful |
| `law_fascist` | Fascist policy | 一项法西斯法案……生效了。 / A Fascist policy… has been enacted. | Ominous, low, long pause |
| `power_investigate` | power | 总统可以调查一名玩家的党派。 / The President may investigate one player's loyalty. | Grave, deliberate |
| `power_peek` | power | 总统可以查看接下来的三张法案。 / The President may look at the next three policies. | Secretive |
| `power_special` | power | 总统将亲自指定下一任总统。 / The President will choose the next President. | Formal |
| `power_execute` | power | 总统必须处决一名玩家。 / The President must execute a player. | Heavy, slow, tense |
| `executed` | execution | {seat}被处决了。 / {seat} has been executed. | Somber; single drum hit |
| `guarded` | Bodyguard saves | 保镖挡下了子弹！没有人死去。 / The Bodyguard steps in! Nobody dies. | Surprised, relieved |
| `audit` | 14+ power | 公开审计：一张被弃掉的法案公开了。 / Public audit: one discarded policy is revealed. | Investigative, suspenseful |
| `danger_zone` | 3rd Fascist policy | 警告：从现在起，若希特勒当选总理，法西斯党获胜。 / Warning: from now on, if Hitler is elected Chancellor, the Fascists win. | Urgent, slower on "希特勒" |
| `veto` | veto proposed | 总理提议否决本次法案。 / The Chancellor proposes a veto. | Surprised, formal |
| `win_liberal` | Liberals win | 自由党拯救了共和国！ / The Liberals have saved the republic! | Triumphant, swelling |
| `win_fascist` | Fascists win | 法西斯党夺取了政权。 / The Fascists have seized power. | Cold, final |

Card voices (only at the end-of-game role reveal, or when the Bodyguard saves someone):

| Card | Line | Tone |
| --- | --- | --- |
| Liberal | 我一直相信你们。 / I trusted you all along. | Earnest |
| Fascist | 你们一直在投我们的票。 / You kept voting for us. | Smooth, smug |
| Hitler | 你们早该多看我一眼。 / You should have looked at me twice. | Quiet, then hard |
| Journalist | 独家新闻：我看到了！ / Exclusive: I saw it! | Quick, excited |
| Bodyguard | 想动他？先过我。 / You want him? Through me. | Calm, heavy |
| Infiltrator | 我一直是你们的朋友……才怪。 / I've always been your friend… not. | Friendly, then cold |

#### Sprites
Paths used by the code (`static/img/party/secrethitler/…`); emoji placeholders show until they exist.

| Minimum (≈20) | Nice to have (+≈12) |
| --- | --- |
| Cover art | 2–3 Liberal and Fascist art variants |
| `role-liberal`, `role-fascist`, `role-hitler` | Hold-to-reveal envelope animation |
| `role-journalist`, `role-bodyguard`, `role-infiltrator` (11+) | Policy "stamp" when it lands on a track |
| `party-liberal`, `party-fascist` (investigation result) | Parliament hall background |
| `policy-liberal`, `policy-fascist` + policy back | Executed seat overlay |
| `vote-ja`, `vote-nein` | Term-limited marker |
| President, Chancellor, Clerk plaques | Win banners with art |
| Liberal and Fascist track boards | |
| 5 power icons (investigate, special, peek, execute, audit) | |

---

### 3.4 City of the Sultan 苏丹之城 (Citadels-like)

> **Scaling to 16 follows your own plan.** Until then the game runs on built-in defaults, all in `SCALING(n)` in `sultan/rules.js`:
> - role copies: 1 (≤7 seats), 2 (8–14), 3 (15–16); some roles go face down each day
> - **wave draft**: up to 4 seats pick at the same time from their own 2–3 options (one at a time with ≤7 seats)
> - every holder of a called role plays at the same time
> - district deck doubled from 9 seats; city goal 7 buildings (≤8 seats) or 6 (9+)
>
> Paste your 16-player plan into "Scaling to 16" and the knobs above get replaced.

#### Theme & screen
**苏丹之城 / City of the Sultan.** A desert sultanate at the height of the caravan trade. Each player builds a quarter of the city, hoping the Sultan will name theirs the jewel of the realm.

| | |
| --- | --- |
| Background | City skyline at dusk: palace domes, minaret-like towers, bazaar awnings and an oasis, with lanterns lighting up as the round goes on. Each player's row is a strip of sandstone ground where their districts appear. |
| Palette | dusk indigo `#1d1b4b`, saffron `#f4a62a`, turquoise tile `#1fb5a8`, sandstone `#e9cfa3`, ruby `#b8323f` |
| Motion | Lanterns flicker, sand drifts slowly across the bottom, and a gold-dust burst plays when a district is built. The calling of each role sweeps a spotlight across the skyline. |
| Music mood | Oud and frame drum, mid tempo. It drops to a single drone when the Shadow Blade is called. |
| Phone skin | Geometric tile border (turquoise and gold) with a parchment card area. |

#### Rules (base, before your 16-player plan)
Each round, players secretly draft one of **8 roles** in crown order. Roles are called in number order, and each one's owner then takes a turn: take 2 gold **or** draw 2 district cards and keep 1, then build 1 district. The first city with 7 districts ends the game after that round; score district values plus bonuses.

| # | Role | Ability (base) | District color it rewards |
| --- | --- | --- | --- |
| 1 | Shadow Blade 影刺 | Name a role; that role skips its turn this round | — |
| 2 | Bazaar Thief 集市盗贼 | Name a role; take all its gold when it is called | — |
| 3 | Astrologer 星象师 | Swap your hand with a player, or swap cards with the deck | — |
| 4 | Sultan 苏丹 | Take the crown (picks first next round) | royal (gold) |
| 5 | Grand Sage 大智者 | The Pasha can't destroy your districts | scholarly (blue) |
| 6 | Caravan Master 商队首领 | +1 gold | trade (green) |
| 7 | Master Architect 建筑大师 | Draw 2 more cards; may build up to 3 | — |
| 8 | Pasha 帕夏 | Pay to destroy a district | military (red) |

District colors: **royal** (palaces, gold), **scholarly** (observatory, library, blue), **trade** (bazaar, caravanserai, green), **military** (fort, barracks, red), **wonders** (purple: special abilities).

#### Scaling to 16, engine requirements to check against your plan
- **Draft for up to 16 players:** either several copies of each role, a second "court" of roles, or a split into two courts/cities. The draft code must not assume each role is unique.
- **Calling order with shared roles:** decide how ties are ordered when two players hold the same role (seat order after the crown?).
- **Screen:** 16 city rows don't fit as rows. Plan two columns of 8 compact skylines, or a ring of mini-cities around a central palace.
- **Phone hand UI** that scrolls smoothly with 10+ cards.
- **Deck size:** roughly 4–5 district cards per player, so about 70 cards at 16 players. Art is still per building name (§3.4 Sprites).

#### Bots
- **Draft greedily:** Architect when holding many cards, Caravan Master when owning green districts, Sultan when the crown matters, otherwise the role that pays the most gold.
- **Build** the most expensive district they can afford. Take gold when the hand has something affordable next turn, otherwise draw.
- **Shadow Blade and Thief targets:** the role they expect the leader to take.

#### Voice
Voice roles:

| Voice | Character | Casting notes |
| --- | --- | --- |
| **The Court Herald 宫廷传令官** (narrator) | Royal herald and storyteller | Rich warm baritone, storyteller rhythm, slightly theatrical. Read like *One Thousand and One Nights* |
| Shadow Blade 影刺 | Assassin | Whisper, still, almost no inflection |
| Bazaar Thief 集市盗贼 | Street thief | Quick, cheeky, young, laughing |
| Astrologer 星象师 | Stargazer | Dreamy, airy, slow, with a light echo |
| Sultan 苏丹 | Ruler | Deep, regal, slow, commanding, with a short brass sting under it |
| Grand Sage 大智者 | Elder scholar | Calm, kind, elderly, soft |
| Caravan Master 商队首领 | Merchant | Jovial, booming laugh, camel bells under it |
| Master Architect 建筑大师 | Builder | Energetic, precise, quick |
| Pasha 帕夏 | General | Gruff, loud, military |

Narrator cues (Herald):

| Cue | When | Line (中文 / English) | Tone & delivery |
| --- | --- | --- | --- |
| `welcome` | lobby | 欢迎来到苏丹之城，黄金与沙丘之地。 / Welcome to the City of the Sultan, land of gold and dunes. | Storytelling, warm, unhurried |
| `round_start` | new round | 宫殿的鼓声响起，新的一天开始了。 / The palace drums sound. A new day begins. | Drum hit, then bright |
| `draft` | draft phase | 请秘密挑选你今天的身份。 / Choose your role for today, in secret. | Hushed, intimate |
| `call_role` | each role called | 传召——苏丹！ / Summoning… the Sultan! | Ceremonial; long "传召——"; the role name is a separate clip per role |
| `no_answer` | role not drafted | ……无人应召。 / …No one answers. | Pause first, then quiet, puzzled |
| `slain` | killed role skips | 今夜，商队首领没能醒来。 / Tonight, the Caravan Master did not wake. | Grave, slow |
| `robbed` | Thief collects | 钱袋空了！盗贼得手了。 / The purse is empty! The thief strikes. | Surprised, quick |
| `build_royal` / `build_scholarly` / `build_trade` / `build_military` / `build_wonder` | district built | 一座宫殿落成。 / 一座学府落成。 / 一座集市落成。 / 一座堡垒落成。 / 一座奇观落成！ (A palace / a house of learning / a bazaar / a fortress rises. A wonder rises!) | Pleased, a little grander for wonders |
| `destroyed` | Pasha destroys | 帕夏的军队推倒了一座建筑。 / The Pasha's army tears a building down. | Heavy, rumble under it |
| `crown_moves` | Sultan takes crown | 王冠易主。 / The crown changes hands. | Regal, short |
| `last_round` | 7th district | 第一座城已满七座建筑！这是最后一轮。 / The first city has seven buildings! This is the final round. | Excited, urgent |
| `winner` | game end | 苏丹之城的传奇，属于3号。 / The legend of the Sultan's city belongs to seat 3. | Grand, slow, swelling music |

Card voices (played when the role is **called** in turn order, which is public):

| Card | Line | Tone |
| --- | --- | --- |
| Shadow Blade | 今夜，有人不会醒来。 / Tonight, someone will not wake. | Still whisper |
| Bazaar Thief | 这袋金子……现在归我了。 / This purse… is mine now. | Cheeky, giggling |
| Astrologer | 星辰说，你的牌该换一换了。 / The stars say your cards should change. | Dreamy, floating |
| Sultan | 王冠归我。全城听令！ / The crown is mine. The city obeys! | Deep, regal, commanding |
| Grand Sage | 智慧之所，刀剑不入。 / No sword enters the house of wisdom. | Calm, kind |
| Caravan Master | 驼铃一响，黄金万两！ / When the camel bells ring, the gold pours in! | Jovial, big laugh |
| Master Architect | 图纸画好了，再建两座！ / Plans are drawn. Two more buildings! | Energetic, quick |
| Pasha | 城墙？拆了它！ / A wall? Tear it down! | Gruff, loud |

Add your extra roles from the 16-player plan in the same format.

#### Sprites

| Minimum (≈34) | Nice to have (+≈22) |
| --- | --- |
| Cover art | Second art per role for "called" |
| Dusk skyline background + sandstone row strip | Lantern and sand particle sprites |
| **8 role cards** + role card back | Small and large district card views |
| **District cards:** 3 per base color × 4 colors = 12, plus 3 wonders | 6–8 more wonders |
| District card back | Night version of the skyline (for the Shadow Blade call) |
| 5 color badges (crown, scroll, scales, sword, star) | Gold-dust burst when building |
| Crown token | "Slain" and "robbed" overlays on a role |
| Gold coin (reuse, recolored saffron) | End-game palace podium |
| Herald portrait (corner of the screen) | Extra role cards for your 16-player plan |

---

### 3.5 Blood on the Clocktower 血染钟楼 (classic theme), build last

#### Theme & screen
**The classic theme:** the town of Ravenswood Bluff, its clock tower, and the **Imp 小恶魔** who kills one townsperson each night. Good (Townsfolk and Outsiders) against evil (Minions and the Demon). The script is **Trouble Brewing 暗流涌动**.

| | |
| --- | --- |
| Background | `themeClock`: a night sky with moonlight over the town square, and a dark red glow from below. By day (`data-day`) it turns to warm parchment. Later: a town-square illustration with the clock tower in the middle. |
| Palette | night `#12101c`, moonlight `#c9d6ff`, violet `#c9a2ff`, blood red `#c2213b`, day parchment `#e9dcc0` |
| Board | The seats sit around a large clock face like hour marks (the `SeatRing`). The clock hands show the phase. Dead seats show a shroud and whether they still have their ghost vote. |
| Music mood | By day: a slow, uneasy waltz. By night: a low cello drone with a distant bell. |
| Phone skin | Old-paper role token with the role's ability text. At night every phone turns the same dark blue. |

#### Rules
**The screen is the Storyteller**, so every ability resolves automatically. Every phone shows the same screen at night (§2.5).

**Loop:** night (the Storyteller calls **every role on the script** in night order, **including roles not in play**, each with a random 4–9 s wait, so silence and timing leak nothing) → dawn (who died) → day (talk in person, with a timer) → nominations and votes on phones → execution → repeat. Dead players keep one ghost vote for the rest of the game.

**Script: Trouble Brewing, 22 roles**:

| Team | Role | Ability (short, our own wording) |
| --- | --- | --- |
| Townsfolk | Washerwoman 洗衣妇 | Night 1: learn that one of two players is a particular Townsfolk |
| Townsfolk | Librarian 图书管理员 | Night 1: learn that one of two players is a particular Outsider (or that there are none) |
| Townsfolk | Investigator 调查员 | Night 1: learn that one of two players is a particular Minion |
| Townsfolk | Chef 厨师 | Night 1: learn how many pairs of evil players sit next to each other |
| Townsfolk | Empath 共情者 | Each night: learn how many of your 2 living neighbours are evil |
| Townsfolk | Fortune Teller 占卜师 | Each night: pick 2 players and learn whether either is the Demon (one good player always reads "yes") |
| Townsfolk | Undertaker 送葬者 | Each night after the first: learn the role of the player executed today |
| Townsfolk | Monk 僧侣 | Each night after the first: protect one other player from the Demon |
| Townsfolk | Ravenkeeper 守鸦人 | If killed at night: pick a player and learn their role |
| Townsfolk | Virgin 贞洁者 | The first time you're nominated, if the nominator is a Townsfolk, they are executed at once |
| Townsfolk | Slayer 猎手 | Once per game, by day: publicly pick a player; if they are the Demon, they die |
| Townsfolk | Soldier 士兵 | The Demon can't kill you |
| Townsfolk | Mayor 镇长 | If only 3 players live and nobody is executed, good wins. If killed at night, someone else might die instead |
| Outsider | Butler 管家 | Each night pick a master; you may only vote if your master votes (the phone enforces it) |
| Outsider | Drunk 酒鬼 | You think you are a Townsfolk, but your ability doesn't work and your information may be wrong |
| Outsider | Recluse 陌客 | You might register as evil, or as a Minion or Demon |
| Outsider | Saint 圣徒 | If you are executed, your team loses |
| Minion | Poisoner 投毒者 | Each night: poison a player; their ability fails (gives wrong information) until the next night |
| Minion | Spy 间谍 | Each night: see the full Grimoire on your phone. You might register as good |
| Minion | Scarlet Woman 红唇女郎 | If the Demon dies while 5+ players are alive, you become the Demon |
| Minion | Baron 男爵 | Setup: there are 2 extra Outsiders |
| Demon | Imp 小恶魔 | Each night after the first: kill a player. If you kill yourself, a Minion becomes the Imp |

The Demon learns 3 good roles that are not in play (bluffs) on night 1; Minions learn who the Demon is.

**New tech:** the night-order engine, false information (poisoned players and the Drunk get wrong answers chosen by the rules), "registers as" rules for the Recluse and Spy, and the same-screen rule.

#### Scaling to 16
The original runs 5–15 players (with Travellers beyond). Role counts here:

| Players | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Townsfolk | 3 | 3 | 5 | 5 | 5 | 7 | 7 | 7 | 9 | 9 | 9 | 10 |
| Outsiders | 0 | 1 | 0 | 1 | 2 | 0 | 1 | 2 | 0 | 1 | 2 | 2 |
| Minions | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 | 3 |
| Demon | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

| Idea | How it works | Verdict |
| --- | --- | --- |
| **Use all of Trouble Brewing** | 16 players need 10 Townsfolk in play plus 3 not-in-play Townsfolk as the Imp's bluffs: exactly the script's **13 Townsfolk**. | ✅ Needed; at 16 every Townsfolk card is used. |
| **No repeated roles** | Info roles depend on each role being unique ("one of these two is the Chef"). Repeating them breaks the logic. | ✅ Never repeat roles in this game. |
| **Day pacing at 16** | Day timer 5 min, each player nominates at most once per day, 30 s defense, a majority of living players needed to execute. | ✅ |
| **Travellers 旅行者** for late joiners | Someone who joins mid-game gets a simple Traveller seat (one vote, can be exiled, team chosen at random by the screen). | Optional |
| A second Demon | | ❌ Too punishing; a 3rd Minion does the job. |
| Dead-player bonus | Dead players privately guess the Demon each day; correct guesses earn points on a "ghost detective" board. | ✅ Keeps the dead engaged. |

#### Bots
- **Night:** random legal choices. The Imp prefers players who claimed information roles.
- **Day:** bots make at most 3 nominations a day between them, leaving room for humans. Vote yes 40% of the time; evil bots never vote to execute a team-mate.
- **Evil bots** claim one of the Imp's 3 bluffs. Bots can't talk; their claim appears on the screen when a human asks ("ask 7号 their role").

#### Voice
Voice roles:

| Voice | Character | Casting notes |
| --- | --- | --- |
| **The Storyteller 说书人** (narrator) | Runs the town | Older, warm, gravelly, slow; slightly spooky but kind, like a ghost story by the fire |
| Role voices (22) | Each script role | Used **only** in the rules tutorial and the end-of-game reveal, never during play. One short line each, in character |

Narrator cues:

| Cue | When | Line (中文 / English) | Tone & delivery |
| --- | --- | --- | --- |
| `welcome` | game starts | 欢迎来到鸦木布拉夫小镇。天黑以后……小心恶魔。 / Welcome to Ravenswood Bluff. After dark… beware the Demon. | Warm, then a whisper after the pause |
| `dusk` | night begins | 夜幕降临，所有人闭上眼睛…… / Night falls. Everyone, close your eyes… | Slow, soft, falling; bell chime first |
| `wake_<role>` | night order, ×22 | 洗衣妇，醒来。 / Washerwoman, wake. | Calm, even, **identical delivery for every role** so nothing stands out |
| `sleep` | after each call | 睡去吧。 / Sleep. | Same every time, very soft |
| `dawn` | morning | 天亮了，钟声响起。 / Dawn. The bell rings. | Bell toll, then relieved |
| `died` | someone died | 昨夜……{seat}死了。 / Last night… {seat} died. | Grave, slow; pause before the seat |
| `peaceful` | nobody died | 昨夜……平安无事。 / Last night… all was quiet. | Pause, then gentle relief |
| `day` | discussion | 讨论吧。钟声再响时，就要提名了。 / Talk now. When the bell rings again, nominations open. | Steady |
| `nominate` | nomination | {seat}被提名了。请为自己辩护。 / {seat} is nominated. Speak in your defense. | Formal, serious |
| `vote` | voting | 举起你的手……现在。 / Raise your hands… now. | Hushed, then sharp on "现在" |
| `executed` | execution | {seat}被处决了。 / {seat} is executed. | Somber |
| `no_execution` | no majority | 今天，没有人被处决。 / Today, no one is executed. | Neutral, thoughtful |
| `slayer_miss` | Slayer misses | 什么也没有发生。 / Nothing happens. | Flat, a little ominous |
| `demon_dies` | Demon dies | 一声尖叫……然后是寂静。 / A scream… then silence. | Startled, then hushed |
| `win_good` | good wins | 恶魔被消灭了，钟声重新响起。 / The Demon is destroyed, and the bell rings again. | Joyful, warm swell |
| `win_evil` | evil wins | 钟楼……再也不报时了。 / The clock tower… never strikes again. | Slow, sad, final |

Card voices (tutorial and end reveal), one line per role, for example:

| Card | Line | Tone |
| --- | --- | --- |
| Washerwoman | 这件衬衫是谁的？我知道。 / Whose shirt is this? I know. | Cheerful, brisk |
| Empath | 我能感觉到……身边有寒意。 / I can feel it… a chill beside me. | Soft, sensitive |
| Fortune Teller | 水晶球说，就是他们之中的一个。 / The crystal says it's one of these two. | Mysterious |
| Monk | 今晚，我为你祈祷。 / Tonight, I pray for you. | Gentle, protective |
| Slayer | 一箭定胜负！ / One arrow decides it! | Bold, loud |
| Saint | 千万别处决我…… / Please don't execute me… | Pleading, innocent |
| Poisoner | 一滴就够了。 / One drop is enough. | Sly, sweet |
| Spy | 我什么都看见了。 / I see everything. | Smug, quiet |
| Imp | 闭上眼睛……做个好梦。 / Close your eyes… sweet dreams. | Deep whisper, slow, creepy-sweet |

Write the other 13 roles' lines in the same style when the scripts are recorded.

#### Sprites

| Minimum (≈32) | Nice to have (+≈20) |
| --- | --- |
| Cover art | Large role art beside each token |
| Town square with clock face, day and night (2) | Dusk variant |
| **22 role tokens** (round, shared frame; blue ring for good, red for evil) | Animated clock hands and bell |
| Death shroud overlay for an avatar | Execution animation |
| Ghost-vote token | Evil reveal animation at the end |
| Nomination hand and vote hand (2) | Reminder tokens ("poisoned", "protected", "Drunk", "master") ≈6 |
| Moon and sun icons | Fog and crow particle layers |
| Good win / evil win banners (2) | Storyteller portrait |

---

## 4. Shared sprite kit (make once, use in every game)

`Sprite` draws a striped placeholder card with an emoji and a label until the file exists, so every game is playable before any art is made. Drop a file into `static/img/party/<game>/` with the right name and it appears, with no code change.

| Asset | Count | Notes |
| --- | --- | --- |
| Game cover, 16:9 (1600×900) at `static/img/party/<game>/cover.webp` | 1 per game | used on the `/party` menu card |
| Card frame (portrait 5:7, 750×1050) | 1 frame, recoloured per game | the art goes inside |
| Round token frame (512×512) | 1 | Clocktower roles, Power Grab action chips |
| Icon set (SVG, 24 px grid) | ≈25 | timer, check, cross, crown, shield, sword, eye, moon, sun, vote, lock, speaker, mute… |
| Avatars | reuse 43 | ghost/evil looks with CSS filters, not new art |

**Style rules:** flat colours, thick dark outlines, one light source, and **no text baked into the art** (text is translated in code).
Secret Hitler and Blood on the Clocktower art follows their own classic look but keeps the outline style.

**Files:** PNG or WebP with transparency at 2× display size, SVG for icons.
Path: `static/img/party/<game>/<kind>-<name>.webp`, e.g. `powergrab/role-quartermaster.webp`, `secrethitler/policy-fascist.webp`.

### Sprite totals

| Game | Minimum | Nice |
| --- | --- | --- |
| Shared kit | ≈30 (mostly icons) | ≈40 |
| Fib Pics | ≈4 | ≈10 |
| Power Grab | ≈18 | ≈32 |
| Secret Hitler | ≈20 | ≈32 |
| City of the Sultan | ≈34 (before your 16-player extras) | ≈56 |
| Blood on the Clocktower | ≈32 | ≈52 |
| **Total** | **≈138** | **≈222** |

Real illustrations (the expensive kind): 5 covers + 4 backgrounds + 6 Power Grab roles + 6 Secret Hitler roles +
8 Sultan roles + 15 districts + 22 Clocktower tokens = **≈66 drawings**. Everything else is icons, frames or CSS.

---

## 5. Voice production

### 5.1 How it plays (built)
- Only the big screen plays sound. Phones stay silent, so no phone gives away a secret role.
- Every line also appears as a subtitle at the bottom of the screen. The host has a 🔊/🔇 voice toggle; test mode starts muted.
- The rules queue a cue (`cue(state, 'vote_open', {seat})`); the screen plays every cue it hasn't played yet. A reloaded host screen doesn't repeat old lines, and a fast game keeps only the newest 2 queued lines.
- Each game's `voiceLines` in `index.js` is both the code's source **and** the recording script: export it to a CSV for the voice actor or the TTS tool.
- **Placeholder:** until a clip exists, the browser's built-in speech reads the line (Chinese or English voice).

### 5.2 Seat numbers
Lines with `{seat}` say "3号" / "seat 3". For recorded audio, each narrator records **1号 … 16号** (and "seat one … sixteen") as separate short clips, joined at play time (`died_pre` + `seat_3` + `died_post`). Record them in the same tone as the lines they join.

### 5.3 Files and format
- Path read by the code: `static/audio/party/<game>/<cue>.<lang>.mp3`, e.g. `secrethitler/law_fascist.zh.mp3`.
- Mono, exported as 64–96 kbps MP3, normalized to about −16 LUFS, silence trimmed to under 100 ms at both ends.
- Record **Chinese first** (the class language), English second.

### 5.4 Line counts (estimate, per language)

| Game | Narrator cues | Card lines | Seat clips | Total |
| --- | --- | --- | --- | --- |
| Fib Pics | 10 | — | 16 | ≈26 |
| Power Grab | 12 | 6 roles × 3 = 18 | 16 | ≈46 |
| Secret Hitler | 21 | 6 | 16 | ≈43 |
| City of the Sultan | 17 + 8 role names | 8 (+ your extras) | 16 | ≈49 |
| Blood on the Clocktower | 16 + 22 wake + 1 sleep | 22 | 16 | ≈77 |
| **Total** | | | | **≈241 lines per language** |

### 5.5 Who records
- **Students as voice actors** is a fun class project: the casting notes work as role sheets.
- **AI TTS** for quick drafts: one consistent voice preset per voice role.
- **Mixed:** TTS for testing, real voices for the final version. Cue ids stay the same, so files can be swapped one at a time.

---

## 6. Milestones

1. ✅ **Core.** Relay `input` frame + 64 seats + 64 KB frames; shared host and phone shells, `/party` menu, seat ring, bots, test mode, placeholder sprites, voice and subtitles. Wagers untouched.
2. ✅ **Fib Pics.** Canvas and stroke compression, duo mode, prompt decks, bots.
3. ✅ **Power Grab.** Challenge/block engine, factions, ghost brokers, station theme, HALO and role voice lines.
4. ✅ **Secret Hitler.** Three-seat government, bigger deck, filler roles, bots, original theme.
5. ✅ **City of the Sultan.** Wave draft, simultaneous turns for shared roles, hand UI, district deck, dusk theme. Next: swap in your 16-player plan.
6. ✅ **Blood on the Clocktower.** Night-order engine calling every role, false information, Spy grimoire, Virgin/Slayer/Saint/Mayor/Scarlet Woman, ghost votes, Butler, Storyteller voice lines.
7. ⏳ **Deploy the relay** and record or generate the voice clips.

**Definition of done for each game:**
- a 16-bot game from start to finish in test mode
- a game with real phones
- all voice cues present in Chinese, with subtitles
- a real class test
- later: unit tests for each `rules.js`

## 7. Legal and naming

These are free, non-commercial classroom sim games. Two of them keep their original names and themes:

- **Secret Hitler** is released under **CC BY-NC-SA 4.0** (Goat, Wolf & Cabbage). Non-commercial use with credit is allowed; anything adapted from its text or art must keep the same license. The game card credits it.
- **Blood on the Clocktower** (The Pandemonium Institute) is used with its classic roles for class only; role abilities are written in our own short words, and no official art is copied.
- Fib Pics, Power Grab and City of the Sultan use their own names, art and rules text. A small credits line says "Based on Drawful / Coup / Citadels".

## 8. Open questions

- Should the scores from all games feed into one shared class leaderboard?
- Voices: students, TTS, or both? Chinese only at first?
- Who makes the art: hand-drawn, commissioned, or AI-assisted and then cleaned up to the outline style?
- City of the Sultan: your 16-player plan (extra roles, courts, deck size).
