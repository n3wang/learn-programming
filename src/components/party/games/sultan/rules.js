/**
 * City of the Sultan, variant edition (Citadels-like), pure.
 *
 * A round: secret character selection in crown order (waves of 4 at big
 * tables), an optional Pyrrhic duel, then characters are called by number
 * 0 → 13 and every card of that number takes its turn at the same time:
 * gather (2 coins, or draw 2 keep 1), use the ability, build. Conquests
 * resolve at the end of the round. A city of `goal` districts ends the game
 * after that round.
 *
 * Questions to other players (a deal, a bet, the Priest's shield) are
 * `s.prompt`: one at a time, answered on that phone or defaulted on timeout.
 * Full rules: the "City of the Sultan: Variant Rules Plan" doc.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';
import {checkAnswer, makeQuestion, normalizePools} from '../../core/mathQuestions';
import {DISTRICT, DISTRICTS, EVENTS, FRAMES, NOBLE_CHARS, basePool, charOf, commandTierCounts} from './data';

const DRAFT_S = 25;
// Auction selection: a math round earns coins, then everyone bids at once.
// Per character a player picks: 2-pick games get twice the problems, coins and time.
const AUCTION_S = 120;
export const QUIZ_N = 3;
export const NO_MATH_CAP = 3;
/** Round 1: 1 problem per pick (+ gift below); later rounds: QUIZ_N per pick. */
export const quizCount = (s) => (s.round === 1 ? 1 : QUIZ_N) * s.st.picks;
/** Free bid-purse coins on round 1 so players still get a full purse after one solve. */
const quizGift = (s) => (s.round === 1 && s.st.math !== 'off' ? 2 * s.st.picks : 0);
const TURN_S = 50;
const CALL_PAUSE_S = 2;
const PROMPT_S = 15;
const PYRRHIC_S = 15;
const DICE_S = 5;
const MAX_NUMBER = 13;

export const settingsOf = (n, raw = {}) => {
  const picks = raw.picks === 1 || raw.picks === 2 ? raw.picks : n <= 3 ? 2 : 1;
  // Sultan's Madness is built on the events, so it always has them on.
  // 'says' kept as a legacy alias for madness.
  const mode = raw.mode === 'says' || raw.mode === 'madness' ? 'madness' : 'classic';
  const events = raw.events === 'on' || mode === 'madness';
  const kinds = Object.keys(EVENTS).filter((k) => raw[k] !== false);
  return {
    picks,
    mode,
    pool: ['classic', 'all'].includes(raw.pool) ? raw.pool : 'auto',
    events: events ? (kinds.length || mode !== 'madness' ? kinds : Object.keys(EVENTS)) : [],
    goal: [6, 7, 8, 9].includes(raw.goal) ? raw.goal : n <= 3 ? 8 : 7,
    wave: n <= 7 ? 1 : 4,
    // One district set per 8 players (ceil): 20 → 3, 64 → 8.
    decks: Math.max(1, Math.ceil(n / 8)),
    turnS: [30, 45, 60, 90, 120].includes(raw.turnSeconds) ? raw.turnSeconds : TURN_S,
    select: raw.select === 'auction' ? 'auction' : 'pick',
    math: raw.math === 'off' ? 'off' : 'on',
    mathPools: normalizePools(raw.mathPools),
    // Default on: dates / marriage only between male and female characters.
    heteroDates: raw.heteroDates !== false,
  };
};

/** True when these two characters may date under the table’s marriage rule. */
export function canDatePair(s, a, b) {
  if (!a || !b || a === b) return false;
  if (!s.st || s.st.heteroDates === false) return true;
  const ga = charOf(a) && charOf(a).gender;
  const gb = charOf(b) && charOf(b).gender;
  return Boolean(ga && gb && ga !== gb);
}

export const ownerOf = (s, card) => s.owner[card] || null;
export const numberOf = (card) => charOf(card).n;

/** District letter in seat order: A–Z, then AA, AB… (never a seat number). */
export function districtLetter(i) {
  let n = i + 1;
  let out = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

export const letterOf = (s, id) => (s.seats.includes(id) ? districtLetter(s.seats.indexOf(id)) : '?');

/**
 * Contested rolls (marriage / conquest / pyrrhic): two sides `a` and `b`,
 * each with a `who` (player id). Same player may own both (dating your own
 * pair) — keys stay distinct so each character still gets its own die.
 * Tap before the 5s deadline → +1 attention; auto-launch otherwise.
 */
function beginDice(s, ctx, spec) {
  const [whoA, whoB] = spec.rollers || [];
  if (!whoA || !whoB) return;
  s.dice = {
    kind: spec.kind,
    meta: spec.meta || {},
    after: spec.after,
    sides: {
      a: {who: whoA, launched: false, bonus: 0, face: null},
      b: {who: whoB, launched: false, bonus: 0, face: null},
    },
    deadline: ctx.now + duration(ctx, DICE_S),
    revealed: false,
  };
  s.deadline = Math.max(s.deadline || 0, s.dice.deadline + duration(ctx, 4));
}

export const diceHasPlayer = (d, id) => Boolean(d && Object.values(d.sides || {}).some((side) => side.who === id));

export function launchDice(s, ctx, id) {
  const d = s.dice;
  if (!d || d.revealed) return false;
  // One tap launches one of your unlaunched sides (same player can own both).
  const next = Object.values(d.sides).find((side) => side.who === id && !side.launched);
  if (!next) return false;
  next.launched = true;
  next.bonus = ctx.now < d.deadline ? 1 : 0;
  if (Object.values(d.sides).every((side) => side.launched)) settleDice(s, ctx);
  return true;
}

function forceLaunchRemaining(s, ctx) {
  const d = s.dice;
  if (!d || d.revealed) return false;
  for (const side of Object.values(d.sides)) {
    if (!side.launched) {
      side.launched = true;
      side.bonus = 0;
    }
  }
  settleDice(s, ctx);
  return true;
}

function settleDice(s, ctx) {
  const d = s.dice;
  if (!d || d.revealed) return;
  for (const side of Object.values(d.sides)) side.face = roll(ctx);
  d.revealed = true;
  d.revealAt = ctx.now;
  // Short settle window only — do not keep the long pre-roll deadline or the
  // table sits idle after both sides already threw.
  s.deadline = d.revealAt + 1300;
  // Leave faces on state ~1.2s so phones can play the 3D settle, then applyDiceOutcome via tick.
}

function sideTotal(s, key, base) {
  const side = s.dice && s.dice.sides && s.dice.sides[key];
  if (!side) return base || 0;
  return (side.face || 0) + (side.bonus || 0) + (base || 0);
}

function applyDiceOutcome(s, ctx) {
  const d = s.dice;
  if (!d || !d.sides || !d.sides.a || !d.sides.b) {
    s.dice = null;
    return;
  }
  if (d.after === 'marriage') {
    const {suitor, mine, other} = d.meta || {};
    const otherOwner = d.meta.otherOwner || ownerOf(s, other);
    const chaMine = mine && charOf(mine) ? charOf(mine).charisma : 0;
    const chaOther = other && charOf(other) ? charOf(other).charisma : 0;
    let a = sideTotal(s, 'a', chaMine);
    let b = sideTotal(s, 'b', chaOther);
    // Fresh faces only if the totals tied after bonuses (keep tap bonuses).
    while (a === b) {
      d.sides.a.face = roll(ctx);
      d.sides.b.face = roll(ctx);
      a = sideTotal(s, 'a', chaMine);
      b = sideTotal(s, 'b', chaOther);
    }
    s.rolls = [
      {
        kind: 'marriage',
        command: commandSnap(s, suitor, 'marriage'),
        a: {who: suitor, card: mine, die: d.sides.a.face, bonus: d.sides.a.bonus, total: a},
        b: {who: otherOwner, card: other, die: d.sides.b.face, bonus: d.sides.b.bonus, total: b},
        ok: a > b,
        at: ctx.now,
      },
    ];
    if (a > b && s.owner[mine] && s.owner[other] && !s.married[mine] && !s.married[other]) {
      s.married = {...s.married, [mine]: other, [other]: mine};
      cue(s, 'married');
      log(s, {kind: 'married', actor: suitor, card: mine, other});
      completeCommand(s, ctx, 'marriage', suitor);
      // Invitee with a marriage command: if either dating character meets their tier, theirs breaks too.
      if (otherOwner && otherOwner !== suitor) maybeBreakCommand(s, ctx, otherOwner, 'marriage', [mine, other]);
    } else log(s, {kind: 'date_failed', actor: suitor, card: mine, other});
    s.dice = null;
    return;
  }
  if (d.after === 'conquest') {
    const c = s.conquests && s.conquests[d.meta && d.meta.index];
    if (!c) {
      s.dice = null;
      return nextConquest(s, ctx);
    }
    const attack = sideTotal(s, 'a', combatOf(s, c.attacker) + combatOf(s, c.ally));
    const defend = sideTotal(s, 'b', combatOf(s, c.defender) + valueOf(s, c.uid));
    s.rolls = [
      {
        kind: 'conquest',
        command: commandSnap(s, c.attacker, 'conquest'),
        a: {
          who: c.attacker,
          ally: c.ally,
          cards: (s.hold[c.attacker] || []).filter((k) => s.revealed[k]),
          allyCards: c.ally ? (s.hold[c.ally] || []).filter((k) => s.revealed[k]) : [],
          die: d.sides.a.face,
          bonus: d.sides.a.bonus,
          total: attack,
        },
        b: {
          who: c.defender,
          cards: (s.hold[c.defender] || []).filter((k) => s.revealed[k]),
          die: d.sides.b.face,
          bonus: d.sides.b.bonus,
          total: defend,
        },
        card: s.cards[c.uid],
        won: attack > defend && !has(s, c.attacker, s.cards[c.uid]),
        at: ctx.now,
      },
    ];
    s.dice = null;
    if (attack > defend && !has(s, c.attacker, s.cards[c.uid])) {
      moveDistrict(s, c.defender, c.attacker, c.uid);
      cue(s, 'conquered');
      log(s, {kind: 'conquered', actor: c.attacker, target: c.defender, card: s.cards[c.uid]});
      completeCommand(s, ctx, 'conquest', c.attacker);
    } else log(s, {kind: 'held', actor: c.defender, target: c.attacker, card: s.cards[c.uid]});
    nextConquest(s, ctx);
    return;
  }
  if (d.after === 'duel') {
    if (!s.duel) {
      s.dice = null;
      return;
    }
    const {a, b, bet, champA, champB} = s.duel;
    const combatA = champA && charOf(champA) ? charOf(champA).combat : 0;
    const combatB = champB && charOf(champB) ? charOf(champB).combat : 0;
    let ra = sideTotal(s, 'a', combatA);
    let rb = sideTotal(s, 'b', combatB);
    while (ra === rb) {
      d.sides.a.face = roll(ctx);
      d.sides.b.face = roll(ctx);
      ra = sideTotal(s, 'a', combatA);
      rb = sideTotal(s, 'b', combatB);
    }
    const [win, loseCard, lose] = ra > rb ? [a, champB, b] : [b, champA, a];
    s.gold[a] -= bet;
    s.gold[b] -= bet;
    s.gold[win] += bet * 2;
    s.rolls = [
      {
        kind: 'pyrrhic',
        command: commandSnap(s, a, 'pyrrhic'),
        a: {who: a, card: champA, die: d.sides.a.face, bonus: d.sides.a.bonus, total: ra},
        b: {who: b, card: champB, die: d.sides.b.face, bonus: d.sides.b.bonus, total: rb},
        lost: loseCard,
        at: ctx.now,
      },
    ];
    if (lose && loseCard) removeCard(s, lose, loseCard);
    log(s, {kind: 'duel', actor: win, target: lose, card: loseCard, n: bet * 2});
    completeCommand(s, ctx, 'pyrrhic', a);
    // Challenged player with a duel command: if either champion meets their tier, theirs breaks too.
    maybeBreakCommand(s, ctx, b, 'pyrrhic', [champA, champB]);
    cue(s, 'duel_end');
    s.duel = null;
    s.dice = null;
    startCalling(s, ctx);
  }
}
export const statOf = (card, stat) => charOf(card)[stat];
const cardOf = (s, uid) => DISTRICT[s.cards[uid]];
export const valueOf = (s, uid) => cardOf(s, uid).cost + (s.invest[uid] || 0);
const has = (s, id, key) => s.city[id].some((u) => s.cards[u] === key);
const roll = (ctx) => 1 + Math.floor(ctx.rng() * 6);
const neighbours = (s, id) => {
  const i = s.seats.indexOf(id);
  const n = s.seats.length;
  return n < 2 ? [] : [...new Set([s.seats[(i + n - 1) % n], s.seats[(i + 1) % n]])].filter((p) => p !== id);
};

export function setupSultan(seats, ctx, raw = {}) {
  const n = seats.length;
  const st = settingsOf(n, raw);
  const s = {
    seats,
    st,
    gold: {},
    hand: {},
    city: {},
    cards: {},
    invest: {},
    deck: [],
    crown: seats[Math.floor(ctx.rng() * n)],
    round: 0,
    lastRound: false,
    firstDone: null,
    removed: [],
    married: {},
    priestUsed: false,
    reserved: {},
    hold: {},
    owner: {},
    revealed: {},
    prompt: null,
    rolls: [],
    log: [],
    cues: [],
  };
  let uid = 0;
  for (let d = 0; d < st.decks; d++) {
    for (const [key, , , copies] of DISTRICTS) {
      for (let c = 0; c < copies; c++) {
        s.cards[uid] = key;
        s.deck.push(uid);
        uid += 1;
      }
    }
  }
  s.deck = shuffle(s.deck, ctx.rng);
  for (const id of seats) {
    s.gold[id] = 2;
    s.hand[id] = s.deck.splice(0, 4);
    s.city[id] = [];
  }
  cue(s, 'welcome');
  startRound(s, ctx);
  return s;
}

/** Seats from the crown holder round the table, without players who are out. */
function crownOrder(s) {
  const i = Math.max(0, s.seats.indexOf(s.crown));
  return [...s.seats.slice(i), ...s.seats.slice(0, i)].filter((id) => !isOut(s, id));
}

/** This round's pool: the table's characters, minus removed ones, topped up with Citizens. */
function roundPool(s) {
  const n = Math.max(1, activeSeats(s).length);
  const pool = basePool(n, s.st.pool, s.st.picks).filter((k) => !s.removed.includes(k));
  let extra = 4;
  while (pool.length < n * s.st.picks + 2) {
    const key = `citizen${extra}`;
    extra += 1;
    if (!s.removed.includes(key)) pool.push(key);
  }
  return pool;
}

function startRound(s, ctx) {
  s.round += 1;
  s.hold = Object.fromEntries(s.seats.map((id) => [id, []]));
  s.owner = {};
  s.revealed = {};
  s.priestUsed = false;
  s.silenced = [];
  s.robbed = {};
  s.conquests = [];
  s.prompt = null;
  s.rolls = [];
  s.turn = null;
  s.calling = -1;
  let pool = roundPool(s);
  // Public: which characters are in this round (the Fighter guesses among them).
  s.poolKeys = [...pool];
  // The Princess's reserved character comes first, free and on top of the picks.
  for (const [id, key] of Object.entries(s.reserved)) {
    if (pool.includes(key) && s.seats.includes(id)) {
      const pair = [key, s.married[key]].filter((k) => k && pool.includes(k));
      pool = pool.filter((k) => !pair.includes(k));
      for (const k of pair) giveCard(s, id, k);
    }
  }
  s.reserved = {};
  dealCommands(s, ctx);
  cue(s, 'round_start');
  if (s.st.select === 'auction') return startQuiz(s, ctx, pool);
  s.draft = {order: crownOrder(s), pos: 0, wave: [], available: shuffle(pool, ctx.rng), picked: {}};
  s.phase = 'draft';
  cue(s, 'draft');
  return nextWave(s, ctx);
}

// ------------------------------------------------------------------ auction selection
//
// Instead of picking in turn, everyone gets one shared window (AUCTION_S per
// pick: 2 min, or 4 min when each player takes two characters): first
// QUIZ_N problems per pick (+1 bid-coin each in a round purse; round 1 is
// one problem + two gifted coins per pick), then secret bids. Finishing the
// math early leaves more time to bid. You may bid only the purse (math off:
// up to NO_MATH_CAP per pick of your own gold). Highest bid wins; ties →
// crown first, then seat order. Only winners pay from the purse; coins you
// do not spend on a win are added to your treasure. Citizens are not
// auctioned: they are what you get when you win nothing.

const isCitizen = (k) => /^citizen/.test(k);
const newQuiz = (s, ctx) => (s.st.math === 'off' ? [] : Array.from({length: quizCount(s)}, () => ({...makeQuestion(s.st.mathPools, ctx.rng), state: null})));

function startQuiz(s, ctx, pool) {
  s.phase = 'auction';
  const gift = quizGift(s);
  s.auction = {
    lots: shuffle(pool.filter((k) => !isCitizen(k)), ctx.rng),
    citizens: pool.filter(isCitizen),
    quiz: Object.fromEntries(activeSeats(s).map((id) => [id, newQuiz(s, ctx)])),
    earned: Object.fromEntries(activeSeats(s).map((id) => [id, gift])),
    bids: {},
    won: {},
  };
  s.deadline = ctx.now + duration(ctx, AUCTION_S * s.st.picks);
  cue(s, 'draft');
  return undefined;
}

/** Math problems this player has not answered yet (0 once done, or outside the auction). */
export const quizLeft = (s, id) => (s.phase === 'auction' && s.auction.quiz[id] ? s.auction.quiz[id].filter((q) => !q.state).length : 0);

/** One try per problem: right earns 1 coin into this round’s bid purse (not treasure yet). */
export function answerQuiz(s, ctx, id, index, value) {
  const q = s.phase === 'auction' && s.auction.quiz[id] && s.auction.quiz[id][index];
  if (!q || q.state) return false;
  q.given = value == null ? '' : String(value);
  q.state = checkAnswer(q, value) ? 'ok' : 'wrong';
  if (q.state === 'ok') s.auction.earned[id] = (s.auction.earned[id] || 0) + 1;
  return true;
}

/** Coins this player may bid: math purse, or up to NO_MATH_CAP×picks of their gold. */
export const bidCap = (s, id) =>
  s.st.math === 'off' ? Math.min(s.gold[id], NO_MATH_CAP * s.st.picks) : s.auction.earned[id] || 0;
export const hasBid = (s, id) => s.phase === 'auction' && Boolean(s.auction.bids[id]);
/** Bidding opens for a player once their math is done. */
export const canBid = (s, id) => s.phase === 'auction' && s.seats.includes(id) && !isOut(s, id) && quizLeft(s, id) === 0;

/** Clean a bid message into {key: amount}, or null if it breaks a rule. */
export function cleanBids(s, id, raw) {
  const bids = {};
  for (const [key, v] of Object.entries(raw || {})) {
    const n = Math.floor(Number(v) || 0);
    if (n <= 0) continue;
    if (!s.auction.lots.includes(key)) return null;
    bids[key] = n;
  }
  if (Object.values(bids).reduce((a, b) => a + b, 0) > bidCap(s, id)) return null;
  return bids;
}

/** Place (or change) bids; the auction closes once everyone has bid, or at the deadline. */
export function placeBids(s, ctx, id, raw) {
  if (!canBid(s, id)) return false;
  const bids = cleanBids(s, id, raw);
  if (!bids) return false;
  s.auction.bids[id] = bids;
  if (activeSeats(s).every((p) => s.auction.bids[p])) resolveAuction(s, ctx);
  return true;
}

// ------------------------------------------------------------------ late joiners

/**
 * A player who joins mid-game gets a seat with the starting coins and hand.
 * During an auction they join it at once (with their own problems); in a
 * pick draft or later in the round they wait for the next round.
 */
export function joinLate(s, ctx, id) {
  if (s.over || s.seats.includes(id)) return false;
  s.seats = [...s.seats, id];
  s.gold[id] = 2;
  s.hand[id] = s.deck.splice(0, 4);
  s.city[id] = [];
  s.hold[id] = [];
  if (s.phase === 'auction' && s.auction) {
    s.auction.quiz[id] = newQuiz(s, ctx);
    s.auction.earned[id] = quizGift(s);
  }
  log(s, {kind: 'joined', actor: id});
  return true;
}

function resolveAuction(s, ctx) {
  const a = s.auction;
  const order = crownOrder(s);
  const left = Object.fromEntries(s.seats.map((id) => [id, s.st.picks]));
  const won = Object.fromEntries(s.seats.map((id) => [id, []]));
  const paid = Object.fromEntries(s.seats.map((id) => [id, 0]));
  const mathOn = s.st.math !== 'off';
  let lots = [...a.lots];
  const entries = s.seats
    .flatMap((id) => Object.entries(a.bids[id] || {}).map(([key, n]) => ({id, key, n})))
    .sort((x, y) => y.n - x.n || order.indexOf(x.id) - order.indexOf(y.id));
  // All bids on each lot (for the phone’s short reveal animation).
  const lotBids = {};
  for (const {id, key, n} of entries) (lotBids[key] ||= []).push({id, n});
  const revealLots = [];
  const awarded = new Set();
  for (const {id, key, n} of entries) {
    // Math: pay from the round purse. Math off: pay from treasure.
    const purse = mathOn ? (a.earned[id] || 0) - paid[id] : s.gold[id] - paid[id];
    if (!lots.includes(key) || left[id] < 1 || purse < n) continue;
    const partner = s.married[key] && lots.includes(s.married[key]) ? s.married[key] : null;
    // Same rule as the pick draft: in 2-pick games a married pair needs both picks.
    if (partner && s.st.picks >= 2 && left[id] < 2) continue;
    const take = [key, partner].filter(Boolean);
    lots = lots.filter((k) => !take.includes(k));
    for (const k of take) giveCard(s, id, k);
    left[id] -= s.st.picks >= 2 ? take.length : 1;
    paid[id] += n;
    won[id].push({key, paid: n});
    if (partner) won[id].push({key: partner, paid: 0});
    if (!awarded.has(key)) {
      awarded.add(key);
      revealLots.push({key, bids: lotBids[key] || [], winner: id, paid: n, take});
    }
  }
  // Lots that drew bids but nobody won them (all lost) still appear in the reveal.
  for (const key of Object.keys(lotBids)) {
    if (awarded.has(key)) continue;
    revealLots.push({key, bids: lotBids[key], winner: null, paid: 0, take: []});
  }
  // Bank the purse: unspent (and losing) bid coins become treasure; winners’ payments leave.
  for (const id of s.seats) {
    if (mathOn) s.gold[id] += (a.earned[id] || 0) - paid[id];
    else s.gold[id] -= paid[id];
  }
  // Nothing won (or a pick to spare): first a random leftover character,
  // handed out from the crown going right; once those run out, a Citizen
  // (there are always more Citizens).
  for (const id of order) {
    while (left[id] > 0 && lots.length) {
      const open = lots.filter((key) => {
        const partner = s.married[key] && lots.includes(s.married[key]) ? s.married[key] : null;
        return !(partner && s.st.picks >= 2 && left[id] < 2);
      });
      if (!open.length) break;
      const key = open[Math.floor(ctx.rng() * open.length)];
      const partner = s.married[key] && lots.includes(s.married[key]) ? s.married[key] : null;
      const take = [key, partner].filter(Boolean);
      lots = lots.filter((k) => !take.includes(k));
      for (const k of take) giveCard(s, id, k);
      left[id] -= s.st.picks >= 2 ? take.length : 1;
      for (const k of take) won[id].push({key: k, paid: 0, leftover: true});
    }
  }
  const citizens = [...a.citizens];
  let extra = 4;
  const nextCitizen = () => {
    if (citizens.length) return citizens.shift();
    while (s.removed.includes(`citizen${extra}`) || s.owner[`citizen${extra}`]) extra += 1;
    const key = `citizen${extra}`;
    extra += 1;
    return key;
  };
  const given = [];
  for (const id of order) {
    while (left[id] > 0) {
      const key = nextCitizen();
      giveCard(s, id, key);
      given.push(key);
      won[id].push({key, paid: 0, citizen: true});
      left[id] -= 1;
    }
  }
  a.won = won;
  a.reveal = {round: s.round, lots: revealLots};
  // The Fighter guesses among the characters in play this round.
  s.poolKeys = [...a.lots, ...given];
  s.draft = {order, pos: order.length, wave: [], available: lots, picked: {}};
  log(s, {kind: 'auction', n: entries.length});
  return afterDraft(s, ctx);
}

function giveCard(s, id, key) {
  s.hold[id] = [...s.hold[id], key];
  s.owner[key] = id;
}

function nextWave(s, ctx) {
  const d = s.draft;
  if (d.pos >= d.order.length) return afterDraft(s, ctx);
  d.wave = d.order.slice(d.pos, d.pos + s.st.wave);
  d.pos += d.wave.length;
  for (const id of d.wave) d.picked[id] = 0;
  s.deadline = ctx.now + duration(ctx, DRAFT_S);
  return undefined;
}

/** Picks a player still needs this round. */
export const picksLeft = (s, id) => (s.phase === 'draft' && s.draft.wave.includes(id) ? s.st.picks - s.draft.picked[id] : 0);

/** Can this player take this card now (a married pair counts as two in 2-pick games)? */
export function canPick(s, id, key) {
  const left = picksLeft(s, id);
  if (left < 1 || !s.draft.available.includes(key)) return false;
  const partner = s.married[key];
  if (partner && s.draft.available.includes(partner) && s.st.picks >= 2 && left < 2) return false;
  return true;
}

export function draftPick(s, ctx, id, key) {
  if (!canPick(s, id, key)) return false;
  const d = s.draft;
  const take = [key];
  const partner = s.married[key];
  if (partner && d.available.includes(partner)) take.push(partner);
  d.available = d.available.filter((k) => !take.includes(k));
  for (const k of take) giveCard(s, id, k);
  // In 1-pick games the partner comes free; in 2-pick games it uses the second pick.
  d.picked[id] += s.st.picks >= 2 ? take.length : 1;
  if (d.wave.every((w) => d.picked[w] >= s.st.picks)) nextWave(s, ctx);
  return true;
}

function afterDraft(s, ctx) {
  s.unpicked = [...s.draft.available];
  if (s.seats.some((id) => canUseEvent(s, id, commandFor(s, id, 'pyrrhic')))) {
    s.phase = 'pyrrhic';
    s.deadline = ctx.now + duration(ctx, PYRRHIC_S);
    cue(s, 'pyrrhic_open');
    return undefined;
  }
  return startCalling(s, ctx);
}

// ------------------------------------------------------------------ commands
//
// Commands (the Sultan's decrees) are personal and secret: each player holds
// one card. New cards are dealt only every COMMAND_DEAL_EVERY rounds (1, 5,
// 9…), so finishing early does not hand you another decree right away. Frame
// tier: Stone < Bronze < Silver < Gold (keys brown/green/blue/gold). Start it
// with a character of that tier or higher. Starting is free, once a round;
// success pays 4/8/12/16 and the card is broken for good — it never returns
// to the pool. Pulled into someone else's duel or date with the same kind: if
// any character in play meets your tier, yours succeeds too. Each card must
// succeed within COMMAND_ROUNDS rounds. Classic: miss it and that player is
// out. Sultan's Madness (co-op): miss any and everyone loses; empty the
// finite pool to win. Pool size scales with the table (see commandTierCounts).
// One redraw / game.

const TIER = {brown: 0, green: 1, blue: 2, gold: 3};
export const REWARD = {brown: 4, green: 8, blue: 12, gold: 16};
export const COMMAND_ROUNDS = 4;
/** Issue fresh commands only on these rounds (1-indexed): 1, 5, 9… */
export const COMMAND_DEAL_EVERY = 4;
export const meetsTier = (key, frame) => TIER[charOf(key).frame] >= TIER[frame];
const makeCommand = (kind, frame) => ({kind, frame, reward: REWARD[frame], tried: 0, done: false});

export const isOut = (s, id) => Boolean(s.out && s.out[id]);
export const activeSeats = (s) => s.seats.filter((id) => !isOut(s, id));
/** Live games may still carry the old `missions` field — fold it into `commands`. */
function commandsBag(s) {
  if (!s.commands && s.missions) s.commands = s.missions;
  if (!s.commands) s.commands = {};
  return s.commands;
}

/** This player's open command (of that kind, if given), or null. Failed/out commands stay for display. */
export const commandFor = (s, id, kind) => {
  const m = commandsBag(s)[id];
  return m && !m.done && !m.failed && (!kind || m.kind === kind) ? m : null;
};
export function canUseEvent(s, id, ev) {
  return Boolean(ev) && !ev.done && ev.tried !== s.round && !isOut(s, id) && s.hold[id].some((k) => meetsTier(k, ev.frame));
}

/** Starting a command is free; it only uses up this round's try. */
function payEvent(s, id, ev) {
  ev.tried = s.round;
}

const isMadness = (s) => s.st && (s.st.mode === 'madness' || s.st.mode === 'says');

/** Finite pool of {kind, frame} copies; broken commands never re-enter. */
function buildCommandDeck(kinds, n, rng) {
  const counts = commandTierCounts(n);
  const deck = [];
  for (const kind of kinds) {
    for (const [frame, copies] of Object.entries(counts)) {
      for (let i = 0; i < copies; i++) deck.push({kind, frame});
    }
  }
  return shuffle(deck, rng);
}

function ensureCommandPool(s, ctx) {
  if (isMadness(s)) {
    if (!s.says) {
      const deck = buildCommandDeck(s.st.events, s.seats.length, ctx.rng);
      s.says = {deck, broken: [], total: deck.length, result: null};
    }
    return s.says.deck;
  }
  if (!s.commandPool) {
    s.commandPool = buildCommandDeck(s.st.events, s.seats.length, ctx.rng);
    s.commandBroken = [];
  }
  return s.commandPool;
}

function drawCard(s, ctx) {
  const pool = ensureCommandPool(s, ctx);
  return pool.length ? pool.shift() : null;
}

/** Round start: on deal waves only, every active player without an open command gets one. */
function dealCommands(s, ctx) {
  if (!s.st.events.length) return;
  // Keep the table calmer: no new decrees until the previous wave's window has turned over.
  if ((s.round - 1) % COMMAND_DEAL_EVERY !== 0) return;
  commandsBag(s);
  ensureCommandPool(s, ctx);
  for (const id of activeSeats(s)) {
    if (commandFor(s, id)) continue;
    const c = drawCard(s, ctx);
    s.commands[id] = c ? {...makeCommand(c.kind, c.frame), due: s.round + COMMAND_ROUNDS - 1} : null;
  }
}

/** Once a game: swap your command for a fresh card (the deadline stays). Unfinished cards go back into the pool; only broken ones stay out. */
export function redrawCommand(s, ctx, id) {
  const m = commandFor(s, id);
  if (!m || s.over || isOut(s, id) || (s.redraws && s.redraws[id])) return false;
  const pool = ensureCommandPool(s, ctx);
  const c = drawCard(s, ctx);
  if (!c) return false;
  // Unfinished — return to the bottom of the pool (never treat as broken).
  pool.push({kind: m.kind, frame: m.frame});
  s.redraws = {...(s.redraws || {}), [id]: true};
  s.commands[id] = {...makeCommand(c.kind, c.frame), due: m.due};
  return true;
}

/** A command succeeded: pay the reward; the card is broken and never returns to the pool. */
function completeCommand(s, ctx, kind, who) {
  const m = commandFor(s, who, kind);
  if (!m) return;
  s.gold[who] += m.reward;
  m.done = true;
  log(s, {kind: 'command', actor: who, card: kind, n: m.reward});
  if (isMadness(s)) s.says.broken = [...s.says.broken, {kind: m.kind, frame: m.frame, by: who}];
  else s.commandBroken = [...(s.commandBroken || []), {kind: m.kind, frame: m.frame, by: who}];
}

/**
 * Opportunistic break: you were pulled into someone else's duel/date, hold the
 * same kind of command, and one of the characters in play meets your tier —
 * your card succeeds too (you did not need to start it yourself).
 */
function maybeBreakCommand(s, ctx, who, kind, agents) {
  if (!who || isOut(s, who)) return false;
  const m = commandFor(s, who, kind);
  if (!m || !(agents || []).some((k) => k && meetsTier(k, m.frame))) return false;
  completeCommand(s, ctx, kind, who);
  return true;
}

/** Snapshot of the command that started an arena show (survives after the command is done). */
export function commandSnap(s, id, kind) {
  const m = s.commands && s.commands[id];
  if (m && (!kind || m.kind === kind)) {
    return {kind: m.kind, frame: m.frame, who: id, due: m.due, failed: Boolean(m.failed), done: Boolean(m.done)};
  }
  return kind ? {kind, frame: 'gold', who: id} : null;
}

function finishGame(s) {
  s.phase = 'over';
  s.over = true;
  s.deadline = 0;
  s.scoreCards = Object.fromEntries(s.seats.map((id) => [id, scoreBreakdown(s, id)]));
  s.scores = Object.fromEntries(s.seats.map((id) => [id, s.scoreCards[id].total]));
  const pool = activeSeats(s).length ? activeSeats(s) : s.seats;
  s.winner = [...pool].sort((a, b) => s.scores[b] - s.scores[a] || s.gold[b] - s.gold[a])[0];
}

/**
 * Round end: a command past its deadline puts its player out (classic) or
 * loses the game for everyone (Sultan's Madness). Done cards are cleared for
 * a new deal (broken cards stay out of the pool). Returns true when over.
 */
function commandsRoundEnd(s) {
  if (!s.commands) return false;
  const madness = isMadness(s);
  for (const id of s.seats) {
    const m = commandFor(s, id);
    if (!m || isOut(s, id) || s.round < m.due) continue;
    if (madness) {
      s.says.result = 'lose';
      s.says.missed = {kind: m.kind, frame: m.frame};
      finishGame(s);
      cue(s, 'says_lose');
      return true;
    }
    s.out = {...(s.out || {}), [id]: true};
    // Keep the card on the dead phone with a failed flag (never returns to the pool).
    s.commands[id] = {...m, failed: true};
    log(s, {kind: 'out', actor: id, card: m.kind});
    cue(s, 'player_out');
  }
  for (const id of s.seats) if (s.commands[id] && s.commands[id].done && !s.commands[id].failed) s.commands[id] = null;
  if (madness && !s.says.deck.length && s.seats.every((id) => !s.commands[id])) {
    s.says.result = 'win';
    finishGame(s);
    cue(s, 'says_win');
    return true;
  }
  if (!madness && s.seats.length > 1 && activeSeats(s).length <= 1) {
    finishGame(s);
    cue(s, 'winner');
    return true;
  }
  return false;
}

/** Pyrrhic: claimed in its window before the turns. */
export function challenge(s, ctx, id, target) {
  const ev = commandFor(s, id, 'pyrrhic');
  if (s.phase !== 'pyrrhic' || s.prompt || !canUseEvent(s, id, ev)) return false;
  if (target === id || !s.seats.includes(target) || !s.hold[target].length) return false;
  payEvent(s, id, ev);
  log(s, {kind: 'challenge', actor: id, target});
  cue(s, 'pyrrhic');
  return targetPlayer(s, ctx, {kind: 'pyrrhic', actor: id, target});
}

function startDuel(s, ctx, eff) {
  const bet = Math.min(1, s.gold[eff.actor], s.gold[eff.target]);
  s.duel = {a: eff.actor, b: eff.target, bet};
  ask(s, ctx, {kind: 'raise', to: eff.target, from: eff.actor, max: Math.max(bet, Math.min(5, s.gold[eff.actor], s.gold[eff.target]))});
}

function finishDuel(s, ctx) {
  const {a, b} = s.duel || {};
  if (!a || !b) {
    s.duel = null;
    return startCalling(s, ctx);
  }
  beginDice(s, ctx, {kind: 'pyrrhic', after: 'duel', rollers: [a, b]});
  return undefined;
}

/** A character leaves the game for good (Pyrrhic): its partner is single again. */
function removeCard(s, id, key) {
  s.removed = [...s.removed, key];
  s.hold[id] = s.hold[id].filter((k) => k !== key);
  delete s.owner[key];
  const partner = s.married[key];
  if (partner) {
    delete s.married[partner];
    delete s.married[key];
  }
}

/**
 * Host kick mid-game: drop the seat from the table and queue a room kick.
 * Their hand returns to the deck; characters are removed for the rest of the game.
 */
export function kickSeat(s, id) {
  if (!id || s.over || !s.seats.includes(id)) return false;
  if (s.seats.length <= 1) return false;
  // Clear anything that was waiting on this player.
  if (s.prompt && (s.prompt.to === id || s.prompt.from === id || (s.prompt.eff && s.prompt.eff.actor === id))) s.prompt = null;
  if (s.dice && Object.values(s.dice.sides || {}).some((side) => side.who === id)) s.dice = null;
  if (s.duel && (s.duel.a === id || s.duel.b === id)) s.duel = null;
  if (s.conquests) s.conquests = s.conquests.filter((c) => c.attacker !== id && c.defender !== id && c.ally !== id && c.askAlly !== id);
  if (Array.isArray(s.hand[id])) s.deck.push(...s.hand[id]);
  for (const key of [...(s.hold[id] || [])]) removeCard(s, id, key);
  if (s.crown === id) {
    const rest = s.seats.filter((p) => p !== id);
    s.crown = rest[0] || null;
  }
  s.seats = s.seats.filter((p) => p !== id);
  delete s.gold[id];
  delete s.hand[id];
  delete s.city[id];
  delete s.hold[id];
  if (s.commands) delete s.commands[id];
  if (s.out) delete s.out[id];
  if (s.reserved) delete s.reserved[id];
  if (s.redraws) delete s.redraws[id];
  if (s.turn && s.turn.cards) {
    s.turn.cards = s.turn.cards.filter((k) => s.owner[k]);
    if (!s.turn.cards.length) s.turn = null;
  }
  log(s, {kind: 'kick', actor: id});
  s.pendingKicks = [...(s.pendingKicks || []), id];
  if (activeSeats(s).length <= 1) {
    finishGame(s);
    cue(s, 'winner');
  }
  return true;
}

// ------------------------------------------------------------------ prompts

/** Open a question to one player; the turn clock waits for it. */
function ask(s, ctx, prompt) {
  s.prompt = {...prompt, deadline: ctx.now + duration(ctx, PROMPT_S)};
  s.deadline = Math.max(s.deadline || 0, s.prompt.deadline + duration(ctx, 10));
}

/** Is this player waiting on a question they caused? */
/** True when this player started a prompt and must wait for the reply (others may keep acting). */
export const waitingOn = (s, id) => Boolean(s.prompt) && (s.prompt.from === id || (s.prompt.eff && s.prompt.eff.actor === id));

/**
 * Soft actions (princess reserve, commands) stay open after your characters
 * finish until calling ends — End turn / wait on a date without losing them.
 */
export const softWindow = (s) => s.phase === 'call' && Boolean(s.turn);

/** True once every character you hold has been called and finished this wave. */
export function softReady(s, id) {
  if (!softWindow(s) || isOut(s, id)) return false;
  const hold = s.hold[id] || [];
  if (!hold.length) return false;
  const t = s.turn;
  return hold.every((k) => {
    const n = numberOf(k);
    return n == null || n < (s.calling || 0) || (t && t.done[k]);
  });
}

export function canSoftReserve(s, id) {
  return softReady(s, id) && s.hold[id].includes('princess') && !s.reserved[id] && (s.unpicked || []).some((k) => !Object.values(s.reserved).includes(k));
}

export function canSoftCommand(s, id, kind) {
  if (!softReady(s, id) || s.prompt) return false;
  return canUseEvent(s, id, commandFor(s, id, kind));
}

/** Princess reserve / commands after your turn, until calling ends. */
export function softAction(s, ctx, id, msg) {
  if (!softReady(s, id)) return false;
  switch (msg.action) {
    case 'reserve': {
      if (!canSoftReserve(s, id)) return false;
      if (!(s.unpicked || []).includes(msg.pick) || Object.values(s.reserved).includes(msg.pick)) return false;
      s.reserved[id] = msg.pick;
      log(s, {kind: 'reserved', actor: id});
      return true;
    }
    case 'marry': {
      const ev = commandFor(s, id, 'marriage');
      if (!canSoftCommand(s, id, 'marriage')) return false;
      const {mine, other} = msg;
      const free = (k) => s.owner[k] && s.revealed[k] && !s.married[k];
      if (mine === other || !s.hold[id].includes(mine) || !free(mine) || !free(other) || !canDatePair(s, mine, other)) return false;
      payEvent(s, id, ev);
      const otherOwner = ownerOf(s, other);
      if (otherOwner !== id) {
        ask(s, ctx, {kind: 'date', to: otherOwner, from: id, mine, other});
        return true;
      }
      finishDate(s, ctx, id, mine, other);
      return true;
    }
    case 'conquer': {
      const ev = commandFor(s, id, 'conquest');
      if (!canSoftCommand(s, id, 'conquest')) return false;
      const defender = s.seats.find((p) => p !== id && s.city[p].includes(msg.uid));
      const offer = Math.max(0, Math.floor(Number(msg.offer) || 0));
      const ally = msg.ally && msg.ally !== id && msg.ally !== defender && s.seats.includes(msg.ally) ? msg.ally : null;
      if (!defender || has(s, id, s.cards[msg.uid]) || s.gold[id] < (ally ? offer : 0)) return false;
      payEvent(s, id, ev);
      s.conquests = [...s.conquests, {attacker: id, defender, uid: msg.uid, askAlly: ally, offer: ally ? offer : 0, ally: null}];
      log(s, {kind: 'conquer', actor: id, target: defender, card: s.cards[msg.uid]});
      return true;
    }
    case 'extravagance': {
      const ev = commandFor(s, id, 'extravagance');
      if (!canSoftCommand(s, id, 'extravagance')) return false;
      const total = s.hold[id].reduce((n, k) => n + statOf(k, 'charisma'), 0);
      const gifts = msg.gifts || {};
      const sum = Object.entries(gifts).reduce((n, [p, v]) => n + (p !== id && s.seats.includes(p) ? Math.max(0, Math.floor(Number(v) || 0)) : 0), 0);
      if (sum !== total) return false;
      payEvent(s, id, ev);
      for (const [p, v] of Object.entries(gifts)) if (p !== id && s.seats.includes(p)) s.gold[p] += Math.max(0, Math.floor(Number(v) || 0));
      log(s, {kind: 'extravagance', actor: id, n: total});
      s.rolls = [
        {
          kind: 'extravagance',
          command: commandSnap(s, id, 'extravagance'),
          a: {who: id, total, cards: (s.hold[id] || []).filter((k) => s.revealed[k])},
          gifts: Object.fromEntries(Object.entries(gifts).filter(([p, v]) => p !== id && s.seats.includes(p) && v > 0)),
          at: ctx.now,
        },
      ];
      cue(s, 'extravagance');
      completeCommand(s, ctx, 'extravagance', id);
      return true;
    }
    default:
      return false;
  }
}

/** An effect aimed at a player: the Priest (once per round) may cancel it first. */
function targetPlayer(s, ctx, eff) {
  const t = eff.target;
  const priestHolder = s.hold[t] && s.hold[t].includes('priest');
  if (t !== eff.actor && priestHolder && !s.priestUsed) {
    ask(s, ctx, {kind: 'shield', to: t, eff});
    return true;
  }
  applyEffect(s, ctx, eff);
  return true;
}

function applyEffect(s, ctx, eff) {
  switch (eff.kind) {
    case 'pyrrhic':
      return startDuel(s, ctx, eff);
    case 'steal':
      s.turn.stealFrom[eff.card] = eff.target;
      return undefined;
    case 'swap': {
      const mine = s.hand[eff.actor];
      s.hand[eff.actor] = s.hand[eff.target];
      s.hand[eff.target] = mine;
      // Also swap secret commands (silent): if they have none, you give yours and end up with none.
      if (!s.commands) s.commands = {};
      const myCommand = s.commands[eff.actor] || null;
      s.commands[eff.actor] = s.commands[eff.target] || null;
      s.commands[eff.target] = myCommand;
      log(s, {kind: 'swap', actor: eff.actor, target: eff.target});
      return undefined;
    }
    case 'destroy':
      if (!s.city[eff.target].includes(eff.uid)) return undefined;
      s.gold[eff.actor] -= eff.price;
      s.city[eff.target] = s.city[eff.target].filter((u) => u !== eff.uid);
      delete s.invest[eff.uid];
      s.deck.push(eff.uid);
      cue(s, 'destroyed');
      log(s, {kind: 'destroyed', actor: eff.actor, target: eff.target, card: s.cards[eff.uid]});
      return undefined;
    case 'buy':
      if (!s.city[eff.target].includes(eff.uid) || s.gold[eff.actor] < eff.price) return undefined;
      s.gold[eff.actor] -= eff.price;
      s.gold[eff.target] += eff.price;
      moveDistrict(s, eff.target, eff.actor, eff.uid);
      log(s, {kind: 'bought', actor: eff.actor, target: eff.target, card: s.cards[eff.uid]});
      return undefined;
    case 'conquest':
      return resolveConquest(s, ctx, eff);
    default:
      return undefined;
  }
}

function moveDistrict(s, from, to, uid) {
  s.city[from] = s.city[from].filter((u) => u !== uid);
  s.city[to] = [...s.city[to], uid];
  checkGoal(s, to);
}

/** Answer the open prompt (only its addressee may). */
export function answer(s, ctx, id, msg) {
  const p = s.prompt;
  if (!p || p.to !== id) return false;
  s.prompt = null;
  switch (p.kind) {
    case 'shield':
      if (msg.yes) {
        s.priestUsed = true;
        s.revealed.priest = true;
        cue(s, 'shield');
        log(s, {kind: 'shield', actor: id, target: p.eff.actor});
        if (p.eff.kind === 'pyrrhic') return startCalling(s, ctx) || true;
        if (p.eff.kind === 'conquest') return nextConquest(s, ctx) || true;
        return true;
      }
      applyEffect(s, ctx, p.eff);
      return true;
    case 'raise': {
      // Stale raise after the duel was cleared (timeout / hot reload): drop it.
      if (!s.duel) return startCalling(s, ctx) || true;
      const bet = Math.max(s.duel.bet || 1, Math.min(p.max || 1, Math.floor(Number(msg.bet) || 0)));
      s.duel.bet = bet;
      ask(s, ctx, {kind: 'champion', to: s.duel.a});
      return true;
    }
    case 'champion': {
      if (!s.duel) return startCalling(s, ctx) || true;
      const hold = s.hold[id] || [];
      const key = hold.includes(msg.card) ? msg.card : hold[0];
      if (!key) {
        s.duel = null;
        return startCalling(s, ctx) || true;
      }
      if (id === s.duel.a) {
        s.duel.champA = key;
        ask(s, ctx, {kind: 'champion', to: s.duel.b});
        return true;
      }
      s.duel.champB = key;
      finishDuel(s, ctx);
      return true;
    }
    case 'date':
      // Agreeing is free; refusing (or no answer) costs the suitor 1 coin. The date happens either way.
      if (!msg.yes && s.gold[p.from] > 0) {
        s.gold[p.from] -= 1;
        s.gold[id] += 1;
      }
      finishDate(s, ctx, p.from, p.mine, p.other);
      return true;
    case 'ally': {
      const c = s.conquests[p.index];
      if (msg.yes && s.gold[c.attacker] >= c.offer) {
        c.ally = id;
        s.gold[c.attacker] -= c.offer;
        s.gold[id] += c.offer;
      }
      targetPlayer(s, ctx, {kind: 'conquest', actor: c.attacker, target: c.defender, index: p.index});
      return true;
    }
    default:
      return false;
  }
}

/** Default answer when a prompt times out. */
function promptTimeout(s, ctx) {
  const p = s.prompt;
  const def = {shield: {yes: false}, raise: {bet: 0}, champion: {card: null}, date: {yes: false}, ally: {yes: false}}[p.kind] || {};
  return answer(s, ctx, p.to, def);
}

// ------------------------------------------------------------------ calling

function startCalling(s, ctx) {
  s.phase = 'call';
  s.calling = -1;
  return callNext(s, ctx);
}

const cardsWithNumber = (s, num) => crownOrder(s).flatMap((id) => s.hold[id].filter((k) => numberOf(k) === num));

/**
 * Call the next number. Every character with that number acts in parallel on
 * one shared `turnS` clock; `callNext` runs again only when all are done
 * (or the shared deadline force-ends the rest).
 */
function callNext(s, ctx) {
  let num = s.calling + 1;
  while (num <= MAX_NUMBER && !cardsWithNumber(s, num).length) num += 1;
  if (num > MAX_NUMBER) return startConquests(s, ctx);
  s.calling = num;
  const cards = cardsWithNumber(s, num);
  s.turn = {num, cards, step: {}, built: {}, uses: {}, drawn: {}, done: {}, again: {}, smithy: {}, lab: {}, dated: {}, stealFrom: {}};
  cue(s, `call_${num}`);
  for (const key of cards) {
    s.revealed[key] = true;
    const id = ownerOf(s, key);
    // The Weaver shows itself beside its owner's first called character.
    if (s.hold[id].includes('weaver')) s.revealed.weaver = true;
    if (s.silenced.includes(num)) {
      s.turn.done[key] = true;
      log(s, {kind: 'silenced', actor: id, card: key});
      const bandits = ['banditA', 'banditB'];
      const boss = ownerOf(s, 'banditA');
      if (boss && bandits.every((b) => ownerOf(s, b) === boss) && boss !== id && s.gold[id] > 0) {
        s.gold[id] -= 1;
        s.gold[boss] += 1;
      }
      continue;
    }
    startTurn(s, ctx, key);
  }
  if (cards.every((k) => s.turn.done[k])) {
    cue(s, 'silenced');
    s.turn.pause = true;
    s.deadline = ctx.now + duration(ctx, CALL_PAUSE_S);
    return undefined;
  }
  // One shared window for every seat holding this number.
  s.deadline = ctx.now + duration(ctx, s.st.turnS);
  return undefined;
}

/** Double effects this round (the Weaver). */
const times = (s, id) => (s.hold[id].includes('weaver') ? 2 : 1);

/** Districts of a type, the School of Magic counting as every type. */
const typeCount = (s, id, type) => s.city[id].filter((u) => cardOf(s, u).type === type || s.cards[u] === 'school-of-magic').length;
const nobleChars = (s, id) => s.hold[id].filter((k) => NOBLE_CHARS.includes(k)).length;

function startTurn(s, ctx, key) {
  const id = ownerOf(s, key);
  const x = times(s, id);
  s.turn.step[key] = 'income';
  s.turn.uses[key] = 0;
  // Robbed: the thief takes what the owner holds as the turn starts.
  const thief = s.robbed[numberOf(key)];
  if (thief && thief !== id && s.gold[id] > 0) {
    s.gold[thief] += s.gold[id];
    log(s, {kind: 'robbed', actor: thief, target: id, n: s.gold[id]});
    s.gold[id] = 0;
    cue(s, 'robbed');
  }
  const base = key.startsWith('citizen') ? 'citizen' : key;
  switch (base) {
    case 'citizen':
      s.gold[id] += x;
      break;
    case 'king':
      if (s.crown !== id) cue(s, 'crown_moves');
      s.crown = id;
      s.gold[id] += x * typeCount(s, id, 'noble');
      break;
    case 'princess':
      s.gold[id] += x * s.hold[id].length;
      break;
    case 'official':
      if (nobleChars(s, id)) s.gold[id] += x;
      for (const p of neighbours(s, id)) if (nobleChars(s, p)) s.gold[p] += x;
      break;
    case 'merchant':
      s.gold[id] += x * (1 + [id, ...neighbours(s, id)].reduce((n, p) => n + nobleChars(s, p), 0) + typeCount(s, id, 'trade'));
      break;
    case 'priest':
      s.gold[id] += x * typeCount(s, id, 'religious');
      break;
    case 'general':
      s.gold[id] += x * typeCount(s, id, 'military');
      break;
    case 'scholar':
      s.gold[id] += s.city[id].reduce((n, u) => n + (s.invest[u] || 0), 0);
      break;
    case 'builder':
      s.hand[id].push(...draw(s, 2 * x));
      break;
    default:
  }
}

function draw(s, k) {
  return s.deck.splice(0, k);
}

const buildLimit = (key) => (key === 'builder' ? 2 : 1);

/** Is it this card's turn, owned by this player, and not finished? */
export function acting(s, id, key) {
  return s.phase === 'call' && s.turn && s.turn.cards.includes(key) && ownerOf(s, key) === id && !s.turn.done[key];
}

export function canBuild(s, id, key, uid) {
  const card = cardOf(s, uid);
  if (!card || !acting(s, id, key) || s.turn.step[key] !== 'main' || !s.hand[id].includes(uid)) return false;
  if ((s.turn.built[key] || 0) >= buildLimit(key)) return false;
  return s.gold[id] >= card.cost && !has(s, id, card.key);
}

const usesLeft = (s, id, key) => times(s, id) - (s.turn.uses[key] || 0);

/** Numbers the Bandit may silence or the Thief rob. */
export function nameableNumbers(s, key) {
  const from = key === 'thief' ? 4 : 2;
  return Array.from({length: MAX_NUMBER - from + 1}, (_, i) => from + i).filter((n) => !s.silenced.includes(n) && n > s.calling);
}

/** Players the Fighter may question: they still hide a character. */
export function hiddenPlayers(s, id) {
  return s.seats.filter((p) => p !== id && s.hold[p].some((k) => !s.revealed[k]));
}

/** Districts the General may destroy: [{owner, uid, price}]. */
export function generalTargets(s, id) {
  return s.seats
    .filter((o) => o !== id && s.city[o].length < s.st.goal)
    .flatMap((o) => s.city[o].filter((u) => s.cards[u] !== 'keep').map((u) => ({owner: o, uid: u, price: Math.max(0, valueOf(s, u) - 1)})))
    .filter((t) => t.price <= s.gold[id]);
}

/** Districts the Official may buy: value +1, not one you already have. */
export function officialTargets(s, id) {
  return s.seats
    .filter((o) => o !== id)
    .flatMap((o) => s.city[o].map((u) => ({owner: o, uid: u, price: valueOf(s, u) + 1})))
    .filter((t) => t.price <= s.gold[id] && !has(s, id, s.cards[t.uid]));
}

function checkGoal(s, id) {
  if (s.city[id].length >= s.st.goal) {
    if (!s.firstDone) s.firstDone = id;
    if (!s.lastRound) {
      s.lastRound = true;
      cue(s, 'last_round');
    }
  }
}

/** One action for one of this player's cards whose turn it is. */
export function turnAction(s, ctx, id, msg) {
  const key = msg.card;
  const onTurn = key && acting(s, id, key);
  // Soft command after your characters finish (no card / wrong card).
  if (!onTurn) return softAction(s, ctx, id, msg);
  // Dice rollers resolve the roll first; other same-number seats keep acting.
  if (s.dice && diceHasPlayer(s.dice, id)) return false;
  // Waiting on a reply you started: keep building / using abilities, but don't
  // open another prompt (date / conquest ally / duel) until they answer.
  if (waitingOn(s, id) && (msg.action === 'marry' || msg.action === 'conquer' || msg.action === 'challenge')) return false;
  const t = s.turn;
  const step = t.step[key];
  const ability = (fn) => {
    if (step !== 'main' || usesLeft(s, id, key) < 1) return false;
    const ok = fn();
    if (ok) t.uses[key] = (t.uses[key] || 0) + 1;
    return ok;
  };
  switch (msg.action) {
    case 'gold':
      if (step !== 'income') return false;
      s.gold[id] += 2;
      t.step[key] = 'main';
      return true;
    case 'cards': {
      if (step !== 'income') return false;
      const cards = draw(s, 2);
      if (has(s, id, 'library') || cards.length < 2) {
        s.hand[id].push(...cards);
        t.step[key] = 'main';
      } else {
        t.drawn[key] = cards;
        t.step[key] = 'keep';
      }
      return true;
    }
    case 'keep': {
      const drawn = t.drawn[key] || [];
      if (step !== 'keep' || !drawn.includes(msg.uid)) return false;
      s.hand[id].push(msg.uid);
      s.deck.push(...drawn.filter((u) => u !== msg.uid));
      t.drawn[key] = null;
      t.step[key] = 'main';
      return true;
    }
    case 'build': {
      if (!canBuild(s, id, key, msg.uid)) return false;
      const card = cardOf(s, msg.uid);
      s.gold[id] -= card.cost;
      s.hand[id] = s.hand[id].filter((u) => u !== msg.uid);
      s.city[id].push(msg.uid);
      t.built[key] = (t.built[key] || 0) + 1;
      log(s, {kind: 'built', actor: id, card: card.key});
      cue(s, `build_${card.type}`);
      checkGoal(s, id);
      return true;
    }
    case 'silence':
      return ability(() => {
        if (!['banditA', 'banditB'].includes(key) || !nameableNumbers(s, key).includes(msg.number)) return false;
        s.silenced = [...s.silenced, msg.number];
        log(s, {kind: 'named', actor: id, number: msg.number, verb: 'silence'});
        return true;
      });
    case 'rob':
      return ability(() => {
        if (key !== 'thief' || !nameableNumbers(s, key).includes(msg.number) || s.robbed[msg.number]) return false;
        s.robbed[msg.number] = id;
        log(s, {kind: 'named', actor: id, number: msg.number, verb: 'rob'});
        return true;
      });
    case 'guess':
      return ability(() => {
        if (key !== 'fighter' || !hiddenPlayers(s, id).includes(msg.target) || !charOf(msg.guess)) return false;
        const right = s.hold[msg.target].includes(msg.guess) && !s.revealed[msg.guess];
        log(s, {kind: 'guess', actor: id, target: msg.target, card: msg.guess, right});
        if (right && s.city[msg.target].length) targetPlayer(s, ctx, {kind: 'steal', actor: id, target: msg.target, card: key});
        return true;
      });
    case 'steal': {
      const from = t.stealFrom[key];
      if (!from || !s.city[from].includes(msg.uid) || has(s, id, s.cards[msg.uid])) return false;
      delete t.stealFrom[key];
      moveDistrict(s, from, id, msg.uid);
      log(s, {kind: 'stole', actor: id, target: from, card: s.cards[msg.uid]});
      return true;
    }
    case 'swapHand':
      return ability(() => {
        if (key !== 'mage' || !s.seats.includes(msg.target) || msg.target === id) return false;
        return targetPlayer(s, ctx, {kind: 'swap', actor: id, target: msg.target});
      });
    case 'redraw':
      return ability(() => {
        const out = (msg.uids || []).filter((u) => s.hand[id].includes(u));
        if (key !== 'mage' || !out.length) return false;
        s.hand[id] = s.hand[id].filter((u) => !out.includes(u));
        s.deck.push(...out);
        s.hand[id].push(...draw(s, out.length + 1));
        return true;
      });
    case 'reserve':
      return ability(() => {
        if (key !== 'princess' || !(s.unpicked || []).includes(msg.pick) || Object.values(s.reserved).includes(msg.pick)) return false;
        s.reserved[id] = msg.pick;
        log(s, {kind: 'reserved', actor: id});
        return true;
      });
    case 'buy':
      return ability(() => {
        const tg = key === 'official' && officialTargets(s, id).find((x) => x.uid === msg.uid);
        return tg ? targetPlayer(s, ctx, {kind: 'buy', actor: id, target: tg.owner, uid: tg.uid, price: tg.price}) : false;
      });
    case 'destroy':
      return ability(() => {
        const tg = key === 'general' && generalTargets(s, id).find((x) => x.uid === msg.uid);
        return tg ? targetPlayer(s, ctx, {kind: 'destroy', actor: id, target: tg.owner, uid: tg.uid, price: tg.price}) : false;
      });
    case 'invest':
      return ability(() => {
        const n = Math.floor(Number(msg.n) || 0);
        if (key !== 'scholar' || !s.city[id].includes(msg.uid) || n < 1 || n > 2 || s.gold[id] < n) return false;
        s.gold[id] -= n;
        s.invest[msg.uid] = (s.invest[msg.uid] || 0) + n;
        return true;
      });
    case 'gamble':
      return ability(() => {
        if (key !== 'lucky' || s.gold[id] < 1) return false;
        s.gold[id] -= 1;
        const dice = s.hold[id].includes('twins') ? [roll(ctx), roll(ctx)] : [roll(ctx)];
        const won = dice.reduce((a, b) => a + b, 0) - 1;
        s.gold[id] += won;
        s.rolls = [{kind: 'lucky', a: {who: id, card: key, dice, total: won}, at: ctx.now}];
        log(s, {kind: 'gamble', actor: id, n: won});
        return true;
      });
    case 'smithy':
      if (step !== 'main' || t.smithy[key] || !has(s, id, 'smithy') || s.gold[id] < 2) return false;
      t.smithy[key] = true;
      s.gold[id] -= 2;
      s.hand[id].push(...draw(s, 3));
      return true;
    case 'lab':
      if (step !== 'main' || t.lab[key] || !has(s, id, 'laboratory') || !s.hand[id].includes(msg.uid)) return false;
      t.lab[key] = true;
      s.hand[id] = s.hand[id].filter((u) => u !== msg.uid);
      s.deck.push(msg.uid);
      s.gold[id] += 2;
      return true;
    case 'marry': {
      const ev = commandFor(s, id, 'marriage');
      if (step !== 'main' || t.dated[key] || !canUseEvent(s, id, ev) || s.prompt) return false;
      const {mine, other} = msg;
      const free = (k) => s.owner[k] && s.revealed[k] && !s.married[k];
      if (mine === other || !s.hold[id].includes(mine) || !free(mine) || !free(other) || !canDatePair(s, mine, other)) return false;
      payEvent(s, id, ev);
      t.dated[key] = true;
      const otherOwner = ownerOf(s, other);
      if (otherOwner !== id) {
        ask(s, ctx, {kind: 'date', to: otherOwner, from: id, mine, other});
        return true;
      }
      finishDate(s, ctx, id, mine, other);
      return true;
    }
    case 'conquer': {
      const ev = commandFor(s, id, 'conquest');
      if (step !== 'main' || !canUseEvent(s, id, ev)) return false;
      const defender = s.seats.find((p) => p !== id && s.city[p].includes(msg.uid));
      const offer = Math.max(0, Math.floor(Number(msg.offer) || 0));
      const ally = msg.ally && msg.ally !== id && msg.ally !== defender && s.seats.includes(msg.ally) ? msg.ally : null;
      if (!defender || has(s, id, s.cards[msg.uid]) || s.gold[id] < (ally ? offer : 0)) return false;
      payEvent(s, id, ev);
      s.conquests = [...s.conquests, {attacker: id, defender, uid: msg.uid, askAlly: ally, offer: ally ? offer : 0, ally: null}];
      log(s, {kind: 'conquer', actor: id, target: defender, card: s.cards[msg.uid]});
      return true;
    }
    case 'extravagance': {
      const ev = commandFor(s, id, 'extravagance');
      if (step !== 'main' || !canUseEvent(s, id, ev)) return false;
      const total = s.hold[id].reduce((n, k) => n + statOf(k, 'charisma'), 0);
      const gifts = msg.gifts || {};
      const sum = Object.entries(gifts).reduce((n, [p, v]) => n + (p !== id && s.seats.includes(p) ? Math.max(0, Math.floor(Number(v) || 0)) : 0), 0);
      if (sum !== total) return false;
      payEvent(s, id, ev);
      for (const [p, v] of Object.entries(gifts)) if (p !== id && s.seats.includes(p)) s.gold[p] += Math.max(0, Math.floor(Number(v) || 0));
      log(s, {kind: 'extravagance', actor: id, n: total});
      // Shown on the host as the plaza arena.
      s.rolls = [
        {
          kind: 'extravagance',
          command: commandSnap(s, id, 'extravagance'),
          a: {who: id, total, cards: (s.hold[id] || []).filter((k) => s.revealed[k])},
          gifts: Object.fromEntries(Object.entries(gifts).filter(([p, v]) => p !== id && s.seats.includes(p) && v > 0)),
          at: ctx.now,
        },
      ];
      cue(s, 'extravagance');
      completeCommand(s, ctx, 'extravagance', id);
      return true;
    }
    case 'end': {
      if (step === 'income' || step === 'keep') return false;
      // The Twins take a second full turn right away.
      if (key === 'twins' && !t.again[key]) {
        t.again[key] = true;
        t.step[key] = 'income';
        t.built[key] = 0;
        t.uses[key] = 0;
        t.smithy[key] = false;
        t.lab[key] = false;
        t.dated[key] = false;
        cue(s, 'twins_again');
        return true;
      }
      t.done[key] = true;
      if (t.cards.every((k) => t.done[k])) callNext(s, ctx);
      return true;
    }
    default:
      return false;
  }
}

/** Marriage date: both sides roll (tap for +1) die + Charisma; suitor must be higher. */
function finishDate(s, ctx, id, mine, other) {
  const otherOwner = ownerOf(s, other);
  if (!otherOwner || !s.owner[mine]) return;
  beginDice(s, ctx, {
    kind: 'marriage',
    after: 'marriage',
    rollers: [id, otherOwner],
    meta: {suitor: id, mine, other, otherOwner},
  });
}

// ------------------------------------------------------------------ conquest + round end

function startConquests(s, ctx) {
  s.turn = null;
  s.phase = 'conquest';
  s.conquestAt = -1;
  return nextConquest(s, ctx);
}

function nextConquest(s, ctx) {
  s.conquestAt += 1;
  const c = s.conquests[s.conquestAt];
  if (!c) return endRound(s, ctx);
  if (!s.city[c.defender].includes(c.uid)) return nextConquest(s, ctx);
  s.deadline = ctx.now + duration(ctx, PROMPT_S * 2);
  if (c.askAlly) {
    ask(s, ctx, {kind: 'ally', to: c.askAlly, from: c.attacker, index: s.conquestAt});
    return undefined;
  }
  return targetPlayer(s, ctx, {kind: 'conquest', actor: c.attacker, target: c.defender, index: s.conquestAt});
}

const combatOf = (s, id) => (id ? s.hold[id].reduce((n, k) => n + statOf(k, 'combat'), 0) : 0);

function resolveConquest(s, ctx, eff) {
  const c = s.conquests[eff.index];
  if (!c || !c.attacker || !c.defender) return nextConquest(s, ctx);
  beginDice(s, ctx, {
    kind: 'conquest',
    after: 'conquest',
    rollers: [c.attacker, c.defender],
    meta: {index: eff.index},
  });
  return undefined;
}

export function score(s, id) {
  return scoreBreakdown(s, id).total;
}

/** Points + line items + flavour notes for the end-game table. */
export function scoreBreakdown(s, id) {
  const city = s.city[id].map((u) => cardOf(s, u));
  const buildings = s.city[id].map((u) => {
    const d = cardOf(s, u);
    return {uid: u, key: d.key, pts: valueOf(s, u), en: d.en, zh: d.zh};
  });
  const districts = buildings.reduce((n, b) => n + b.pts, 0);
  const lines = [{id: 'districts', pts: districts, en: 'Districts', zh: '区域'}];
  const effects = [];
  const types = new Set(city.map((c) => c.type));
  const missing = ['noble', 'religious', 'trade', 'military', 'unique'].filter((t) => !types.has(t)).length;
  const haunted = city.some((c) => c.key === 'haunted-quarter') && city.length > 1;
  if (missing === 0 || (haunted && missing <= 1)) {
    lines.push({id: 'types', pts: 3, en: 'All five types', zh: '五种类型齐全'});
    if (haunted && missing === 1) effects.push({en: 'Haunted Quarter filled a missing type.', zh: '鬼街补齐了缺失的类型。'});
  }
  if (s.firstDone === id) {
    lines.push({id: 'first', pts: 4, en: 'First to finish', zh: '最先完成'});
    effects.push({en: 'First city to reach the goal.', zh: '最先达到目标城区数。'});
  } else if (city.length >= s.st.goal) {
    lines.push({id: 'finish', pts: 2, en: 'Finished city', zh: '完成城区'});
  }
  if (has(s, id, 'dragon-gate')) {
    lines.push({id: 'dragon-gate', pts: 2, en: 'Dragon Gate', zh: '龙门'});
    effects.push({en: 'Dragon Gate: +2.', zh: '龙门：+2。'});
  }
  if (has(s, id, 'map-room')) {
    const n = s.hand[id].length;
    lines.push({id: 'map-room', pts: n, en: `Map Room (${n} in hand)`, zh: `地图室（手牌 ${n}）`});
    effects.push({en: `Map Room scored ${n} from cards in hand.`, zh: `地图室按手牌计 ${n} 分。`});
  }
  if (has(s, id, 'imperial-treasury')) {
    const n = s.gold[id];
    lines.push({id: 'imperial-treasury', pts: n, en: `Imperial Treasury (${n} gold)`, zh: `帝国金库（${n} 金币）`});
    effects.push({en: `Imperial Treasury scored leftover gold (${n}).`, zh: `帝国金库按剩余金币计 ${n} 分。`});
  }
  if (has(s, id, 'statue') && s.crown === id) {
    lines.push({id: 'statue', pts: 5, en: 'Statue (crown)', zh: '雕像（持有王冠）'});
    effects.push({en: 'Statue: +5 while holding the crown.', zh: '雕像：持有王冠时 +5。'});
  }
  if (isOut(s, id)) effects.push({en: 'Executed: command timed out.', zh: '已处决：敕令超时。'});
  const married = (s.hold[id] || []).filter((k) => s.married[k]);
  if (married.length) effects.push({en: `Couple: ${married.map((k) => charOf(k).en).join(', ')}.`, zh: `一对：${married.map((k) => charOf(k).zh).join('、')}。`});
  if (s.crown === id) effects.push({en: 'Held the crown at the end.', zh: '终局持有王冠。'});
  const total = lines.reduce((n, row) => n + row.pts, 0);
  return {total, lines, effects, buildings};
}

function endRound(s, ctx) {
  s.turn = null;
  if (commandsRoundEnd(s)) return undefined;
  if (isMadness(s)) return startRound(s, ctx);
  if (s.lastRound) {
    finishGame(s);
    cue(s, 'winner', {letter: letterOf(s, s.winner)});
    return undefined;
  }
  return startRound(s, ctx);
}

/** Time ran out: answer the prompt, pick for sleepy seats, or end unfinished turns. */
export function timeout(s, ctx) {
  if (!s.st) return false; // a game saved by the old 8-role edition
  if (s.dice) {
    if (!s.dice.revealed) {
      if (ctx.now < s.dice.deadline) return false;
      return forceLaunchRemaining(s, ctx);
    }
    if (ctx.now < (s.dice.revealAt || 0) + 1200) return false;
    applyDiceOutcome(s, ctx);
    return true;
  }
  if (s.prompt) {
    if (ctx.now < s.prompt.deadline) return false;
    const done = promptTimeout(s, ctx);
    if (s.phase === 'call') s.deadline = Math.max(s.deadline, ctx.now + duration(ctx, 15));
    return done;
  }
  if (s.phase === 'draft') {
    for (const id of [...s.draft.wave]) {
      while (s.phase === 'draft' && s.draft.wave.includes(id) && picksLeft(s, id) > 0) {
        const options = s.draft.available.filter((k) => canPick(s, id, k));
        if (!options.length) {
          s.draft.picked[id] = s.st.picks;
          if (s.draft.wave.every((w) => s.draft.picked[w] >= s.st.picks)) nextWave(s, ctx);
          break;
        }
        draftPick(s, ctx, id, options[Math.floor(ctx.rng() * options.length)]);
      }
    }
    return true;
  }
  // Unanswered problems earn nothing; no bid by the deadline means no bid.
  if (s.phase === 'auction') {
    resolveAuction(s, ctx);
    return true;
  }
  if (s.phase === 'pyrrhic') {
    startCalling(s, ctx);
    return true;
  }
  if (s.phase === 'conquest') {
    nextConquest(s, ctx);
    return true;
  }
  // Shared number window expired: auto-finish every seat still acting, then advance.
  if (s.phase === 'call' && s.turn) {
    if (s.turn.pause) {
      callNext(s, ctx);
      return true;
    }
    for (const key of s.turn.cards) {
      if (s.turn.done[key]) continue;
      const id = ownerOf(s, key);
      if (s.turn.step[key] === 'income') s.gold[id] += 2;
      if (s.turn.step[key] === 'keep') {
        const drawn = s.turn.drawn[key] || [];
        if (drawn.length) {
          s.hand[id].push(drawn[0]);
          s.deck.push(...drawn.slice(1));
        }
      }
      // Twins mid-double-turn: don't grant a free second pass on timeout.
      s.turn.done[key] = true;
    }
    callNext(s, ctx);
    return true;
  }
  return false;
}
