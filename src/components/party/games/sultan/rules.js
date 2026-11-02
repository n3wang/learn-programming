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
import {DISTRICT, DISTRICTS, EVENTS, FRAMES, NOBLE_CHARS, basePool, charOf} from './data';

const DRAFT_S = 25;
const TURN_S = 50;
const CALL_PAUSE_S = 2;
const PROMPT_S = 15;
const PYRRHIC_S = 15;
const MAX_NUMBER = 13;

export const settingsOf = (n, raw = {}) => {
  const picks = raw.picks === 1 || raw.picks === 2 ? raw.picks : n <= 3 ? 2 : 1;
  const events = raw.events === 'on';
  return {
    picks,
    pool: ['classic', 'all'].includes(raw.pool) ? raw.pool : 'auto',
    events: events
      ? Object.keys(EVENTS).filter((k) => raw[k] !== false)
      : [],
    goal: [6, 7, 8].includes(raw.goal) ? raw.goal : n <= 3 ? 8 : 7,
    wave: n <= 7 ? 1 : 4,
    decks: n <= 8 ? 1 : 2,
    turnS: [30, 45, 60].includes(raw.turnSeconds) ? raw.turnSeconds : TURN_S,
  };
};

export const ownerOf = (s, card) => s.owner[card] || null;
export const numberOf = (card) => charOf(card).n;
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

function crownOrder(s) {
  const i = s.seats.indexOf(s.crown);
  return [...s.seats.slice(i), ...s.seats.slice(0, i)];
}

/** This round's pool: the table's characters, minus removed ones, topped up with Citizens. */
function roundPool(s) {
  const n = s.seats.length;
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
  s.events = s.st.events.map((kind) => {
    const frame = Object.keys(FRAMES)[Math.floor(ctx.rng() * 4)];
    return {kind, frame, price: FRAMES[frame].price, usedBy: null};
  });
  s.draft = {order: crownOrder(s), pos: 0, wave: [], available: shuffle(pool, ctx.rng), picked: {}};
  s.phase = 'draft';
  cue(s, 'round_start');
  cue(s, 'draft');
  nextWave(s, ctx);
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
  const pyrrhic = s.events.find((e) => e.kind === 'pyrrhic');
  if (pyrrhic && s.seats.some((id) => canUseEvent(s, id, pyrrhic))) {
    s.phase = 'pyrrhic';
    s.deadline = ctx.now + duration(ctx, PYRRHIC_S);
    cue(s, 'pyrrhic_open');
    return undefined;
  }
  return startCalling(s, ctx);
}

// ------------------------------------------------------------------ events

/** Event cards need a character of the card's colour and its tier price. */
export function canUseEvent(s, id, ev) {
  return Boolean(ev) && !ev.usedBy && s.gold[id] >= ev.price && s.hold[id].some((k) => charOf(k).frame === ev.frame);
}

const eventOf = (s, kind) => s.events.find((e) => e.kind === kind);

function payEvent(s, id, ev) {
  s.gold[id] -= ev.price;
  ev.usedBy = id;
}

/** Pyrrhic: claimed in its window before the turns. */
export function challenge(s, ctx, id, target) {
  const ev = eventOf(s, 'pyrrhic');
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
  const {a, b, bet, champA, champB} = s.duel;
  let ra;
  let rb;
  do {
    ra = roll(ctx) + statOf(champA, 'combat');
    rb = roll(ctx) + statOf(champB, 'combat');
  } while (ra === rb);
  const [win, loseCard, lose] = ra > rb ? [a, champB, b] : [b, champA, a];
  s.gold[a] -= bet;
  s.gold[b] -= bet;
  s.gold[win] += bet * 2;
  s.rolls = [{kind: 'pyrrhic', a: {who: a, card: champA, total: ra}, b: {who: b, card: champB, total: rb}}];
  removeCard(s, lose, loseCard);
  log(s, {kind: 'duel', actor: win, target: lose, card: loseCard, n: bet * 2});
  cue(s, 'duel_end');
  s.duel = null;
  return startCalling(s, ctx);
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

// ------------------------------------------------------------------ prompts

/** Open a question to one player; the turn clock waits for it. */
function ask(s, ctx, prompt) {
  s.prompt = {...prompt, deadline: ctx.now + duration(ctx, PROMPT_S)};
  s.deadline = Math.max(s.deadline || 0, s.prompt.deadline + duration(ctx, 10));
}

/** Is this player waiting on a question they caused? */
const waitingOn = (s, id) => Boolean(s.prompt) && (s.prompt.from === id || (s.prompt.eff && s.prompt.eff.actor === id));

/** An effect aimed at a player: the Priest (once per game) may cancel it first. */
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
      const bet = Math.max(s.duel.bet, Math.min(p.max, Math.floor(Number(msg.bet) || 0)));
      s.duel.bet = bet;
      ask(s, ctx, {kind: 'champion', to: s.duel.a});
      return true;
    }
    case 'champion': {
      const key = s.hold[id].includes(msg.card) ? msg.card : s.hold[id][0];
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
  if (!acting(s, id, key) || waitingOn(s, id)) return false;
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
        s.rolls = [{kind: 'lucky', a: {who: id, card: key, dice, total: won}}];
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
      const ev = eventOf(s, 'marriage');
      if (step !== 'main' || t.dated[key] || !canUseEvent(s, id, ev) || s.prompt) return false;
      const {mine, other} = msg;
      const free = (k) => s.owner[k] && s.revealed[k] && !s.married[k];
      if (mine === other || !s.hold[id].includes(mine) || !free(mine) || !free(other)) return false;
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
      const ev = eventOf(s, 'conquest');
      if (step !== 'main' || !canUseEvent(s, id, ev)) return false;
      const defender = s.seats.find((p) => p !== id && s.city[p].includes(msg.uid));
      const offer = Math.max(0, Math.floor(Number(msg.offer) || 0));
      const ally = msg.ally && msg.ally !== id && msg.ally !== defender && s.seats.includes(msg.ally) ? msg.ally : null;
      if (!defender || has(s, id, s.cards[msg.uid]) || s.gold[id] < ev.price + (ally ? offer : 0)) return false;
      payEvent(s, id, ev);
      s.conquests = [...s.conquests, {attacker: id, defender, uid: msg.uid, askAlly: ally, offer: ally ? offer : 0, ally: null}];
      log(s, {kind: 'conquer', actor: id, target: defender, card: s.cards[msg.uid]});
      return true;
    }
    case 'extravagance': {
      const ev = eventOf(s, 'extravagance');
      if (step !== 'main' || !canUseEvent(s, id, ev)) return false;
      const total = s.hold[id].reduce((n, k) => n + statOf(k, 'charisma'), 0);
      const gifts = msg.gifts || {};
      const sum = Object.entries(gifts).reduce((n, [p, v]) => n + (p !== id && s.seats.includes(p) ? Math.max(0, Math.floor(Number(v) || 0)) : 0), 0);
      if (sum !== total) return false;
      payEvent(s, id, ev);
      for (const [p, v] of Object.entries(gifts)) if (p !== id && s.seats.includes(p)) s.gold[p] += Math.max(0, Math.floor(Number(v) || 0));
      log(s, {kind: 'extravagance', actor: id, n: total});
      cue(s, 'extravagance');
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

/** Marriage date: both roll die + Charisma; the suitor's side must be higher. */
function finishDate(s, ctx, id, mine, other) {
  const a = roll(ctx) + statOf(mine, 'charisma');
  const b = roll(ctx) + statOf(other, 'charisma');
  s.rolls = [{kind: 'marriage', a: {who: id, card: mine, total: a}, b: {who: ownerOf(s, other), card: other, total: b}}];
  if (a > b && s.owner[mine] && s.owner[other] && !s.married[mine] && !s.married[other]) {
    s.married = {...s.married, [mine]: other, [other]: mine};
    cue(s, 'married');
    log(s, {kind: 'married', actor: id, card: mine, other});
  } else log(s, {kind: 'date_failed', actor: id, card: mine, other});
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
  const die = roll(ctx);
  const attack = die + combatOf(s, c.attacker) + combatOf(s, c.ally);
  const defend = combatOf(s, c.defender) + valueOf(s, c.uid);
  s.rolls = [{kind: 'conquest', a: {who: c.attacker, ally: c.ally, die, total: attack}, b: {who: c.defender, total: defend}}];
  if (attack > defend && !has(s, c.attacker, s.cards[c.uid])) {
    moveDistrict(s, c.defender, c.attacker, c.uid);
    cue(s, 'conquered');
    log(s, {kind: 'conquered', actor: c.attacker, target: c.defender, card: s.cards[c.uid]});
  } else log(s, {kind: 'held', actor: c.defender, target: c.attacker, card: s.cards[c.uid]});
  return nextConquest(s, ctx);
}

export function score(s, id) {
  const city = s.city[id].map((u) => cardOf(s, u));
  let pts = s.city[id].reduce((n, u) => n + valueOf(s, u), 0);
  const types = new Set(city.map((c) => c.type));
  const missing = ['noble', 'religious', 'trade', 'military', 'unique'].filter((t) => !types.has(t)).length;
  const haunted = city.some((c) => c.key === 'haunted-quarter') && city.length > 1;
  if (missing === 0 || (haunted && missing <= 1)) pts += 3;
  if (s.firstDone === id) pts += 4;
  else if (city.length >= s.st.goal) pts += 2;
  if (has(s, id, 'dragon-gate')) pts += 2;
  if (has(s, id, 'map-room')) pts += s.hand[id].length;
  if (has(s, id, 'imperial-treasury')) pts += s.gold[id];
  if (has(s, id, 'statue') && s.crown === id) pts += 5;
  return pts;
}

function endRound(s, ctx) {
  s.turn = null;
  if (s.lastRound) {
    s.phase = 'over';
    s.over = true;
    s.deadline = 0;
    s.scores = Object.fromEntries(s.seats.map((id) => [id, score(s, id)]));
    s.winner = [...s.seats].sort((a, b) => s.scores[b] - s.scores[a] || s.gold[b] - s.gold[a])[0];
    cue(s, 'winner', {seat: ctx.seatOf(s.winner)});
    return undefined;
  }
  return startRound(s, ctx);
}

/** Time ran out: answer the prompt, pick for sleepy seats, or end unfinished turns. */
export function timeout(s, ctx) {
  if (!s.st) return false; // a game saved by the old 8-role edition
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
  if (s.phase === 'pyrrhic') {
    startCalling(s, ctx);
    return true;
  }
  if (s.phase === 'conquest') {
    nextConquest(s, ctx);
    return true;
  }
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
      s.turn.done[key] = true;
    }
    callNext(s, ctx);
    return true;
  }
  return false;
}
