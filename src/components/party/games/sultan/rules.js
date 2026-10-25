/**
 * City of the Sultan rules (Citadels-like), pure.
 *
 * Each round every seat secretly drafts a role; roles are then called 1 → 8
 * and their holders take a turn: income (2 gold, or draw 2 keep 1), the
 * role's ability, then build. The first city to reach the goal ends the game
 * after that round.
 *
 * 16-seat defaults (meant to be replaced by the teacher's own plan, see
 * SCALING below): several copies of each role, a wave draft where up to 4
 * seats pick at once, and every holder of a called role plays at the same time.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';

export const ROLES = {
  1: {key: 'blade', emoji: '🗡️', tint: '#5f27cd', en: 'Shadow Blade', zh: '影刺'},
  2: {key: 'thief', emoji: '🦊', tint: '#a0522d', en: 'Bazaar Thief', zh: '集市盗贼'},
  3: {key: 'astrologer', emoji: '🔭', tint: '#0abde3', en: 'Astrologer', zh: '星象师'},
  4: {key: 'sultan', emoji: '👑', tint: '#f4a62a', en: 'Sultan', zh: '苏丹', color: 'royal'},
  5: {key: 'sage', emoji: '📜', tint: '#2e86de', en: 'Grand Sage', zh: '大智者', color: 'scholarly'},
  6: {key: 'merchant', emoji: '🐫', tint: '#1fb5a8', en: 'Caravan Master', zh: '商队首领', color: 'trade'},
  7: {key: 'architect', emoji: '📐', tint: '#ff9f43', en: 'Master Architect', zh: '建筑大师'},
  8: {key: 'pasha', emoji: '⚔️', tint: '#b8323f', en: 'Pasha', zh: '帕夏', color: 'military'},
};

export const COLORS = {
  royal: {emoji: '👑', tint: '#f4c542', en: 'Royal', zh: '王室'},
  scholarly: {emoji: '📜', tint: '#5dade2', en: 'Scholarly', zh: '学术'},
  trade: {emoji: '🪙', tint: '#58d68d', en: 'Trade', zh: '商贸'},
  military: {emoji: '⚔️', tint: '#ec7063', en: 'Military', zh: '军事'},
  wonder: {emoji: '✨', tint: '#af7ac5', en: 'Wonder', zh: '奇观'},
};

/** [key, color, cost, copies, en, zh, emoji] */
const DISTRICTS = [
  ['palace', 'royal', 5, 3, 'Palace', '宫殿', '🕌'],
  ['citadel', 'royal', 4, 4, 'Citadel', '城堡', '🏰'],
  ['manor', 'royal', 3, 5, 'Manor', '府邸', '🏡'],
  ['school', 'scholarly', 1, 3, 'School', '学堂', '🏫'],
  ['library', 'scholarly', 2, 3, 'Library', '图书馆', '📚'],
  ['observatory', 'scholarly', 3, 3, 'Observatory', '天文台', '🔭'],
  ['wisdom', 'scholarly', 5, 2, 'House of Wisdom', '智慧宫', '🏛️'],
  ['bazaar', 'trade', 1, 5, 'Bazaar', '集市', '🛍️'],
  ['caravanserai', 'trade', 2, 4, 'Caravanserai', '商队驿站', '🐪'],
  ['spice', 'trade', 3, 3, 'Spice Market', '香料市场', '🌶️'],
  ['harbor', 'trade', 4, 3, 'Harbor', '港口', '⚓'],
  ['jeweler', 'trade', 5, 2, 'Jeweler', '珠宝行', '💎'],
  ['watchtower', 'military', 1, 3, 'Watchtower', '瞭望塔', '🗼'],
  ['barracks', 'military', 2, 3, 'Barracks', '兵营', '⛺'],
  ['fortress', 'military', 3, 3, 'Fortress', '堡垒', '🏯'],
  ['arsenal', 'military', 5, 2, 'Arsenal', '军械库', '🛡️'],
  ['treasury', 'wonder', 6, 1, 'Royal Treasury', '王室宝库', '💰'],
  ['gardens', 'wonder', 6, 1, 'Hanging Gardens', '空中花园', '🌿'],
  ['lighthouse', 'wonder', 5, 1, 'Great Lighthouse', '大灯塔', '🗽'],
  ['gate', 'wonder', 5, 1, 'Caravan Gate', '商队之门', '🚪'],
  ['walls', 'wonder', 6, 1, 'Great Walls', '城墙', '🧱'],
];

export const DISTRICT = Object.fromEntries(DISTRICTS.map(([key, color, cost, , en, zh, emoji]) => [key, {key, color, cost, en, zh, emoji}]));

/**
 * The knobs for big tables, in one place so the teacher's own 16-seat plan
 * can replace them: role copies, draft wave size, deck copies, city goal.
 */
export function SCALING(n) {
  return {
    copies: n <= 7 ? 1 : n <= 14 ? 2 : 3,
    wave: n <= 7 ? 1 : 4,
    decks: n <= 8 ? 1 : 2,
    goal: n <= 8 ? 7 : 6,
    startGold: 2,
    startCards: 4,
  };
}

const DRAFT_S = 20;
const TURN_S = 45;
const CALL_PAUSE_S = 2;

const cardOf = (s, uid) => DISTRICT[s.cards[uid]];

export function setupSultan(seats, ctx) {
  const n = seats.length;
  const k = SCALING(n);
  const s = {
    seats,
    scale: k,
    gold: {},
    hand: {},
    city: {},
    cards: {}, // uid → district key
    deck: [],
    crown: seats[Math.floor(ctx.rng() * n)],
    round: 0,
    lastRound: false,
    firstDone: null,
    log: [],
    cues: [],
  };
  let uid = 0;
  for (let d = 0; d < k.decks; d++) {
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
    s.gold[id] = k.startGold;
    s.hand[id] = s.deck.splice(0, k.startCards);
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

function startRound(s, ctx) {
  s.round += 1;
  s.roleOf = {};
  s.killed = [];
  s.robbed = {};
  const pool = [];
  for (let r = 1; r <= 8; r++) for (let c = 0; c < s.scale.copies; c++) pool.push(r);
  let shuffled = shuffle(pool, ctx.rng);
  // Some roles go face down so the last picker can't be sure who has what.
  const spare = Math.max(0, shuffled.length - s.seats.length - Math.max(2, s.scale.wave * 2));
  shuffled = shuffled.slice(spare);
  s.draft = {order: crownOrder(s), pos: 0, pool: shuffled, offers: {}, wave: []};
  s.phase = 'draft';
  cue(s, 'round_start');
  cue(s, 'draft');
  nextWave(s, ctx);
}

function nextWave(s, ctx) {
  const d = s.draft;
  if (d.pos >= d.order.length) return startCalling(s, ctx);
  d.wave = d.order.slice(d.pos, d.pos + s.scale.wave);
  d.pos += d.wave.length;
  d.offers = {};
  if (d.wave.length === 1) {
    d.offers[d.wave[0]] = [...new Set(d.pool)].sort((a, b) => a - b);
  } else {
    // Each seat in the wave gets its own options (up to 3), taken from the pool
    // for now and shared out evenly so nobody in the wave is left with none.
    const pool = shuffle(d.pool, ctx.rng);
    const per = Math.max(1, Math.min(3, Math.floor(pool.length / d.wave.length)));
    for (const id of d.wave) {
      const offer = [];
      for (let i = 0; i < pool.length && offer.length < per; i++) {
        if (!offer.includes(pool[i])) {
          offer.push(pool[i]);
          pool.splice(i, 1);
          i -= 1;
        }
      }
      // A pool run dry still offers something: any role, as an extra copy.
      d.offers[id] = offer.length ? offer : [1 + Math.floor(ctx.rng() * 8)];
    }
    d.pool = pool;
  }
  s.deadline = ctx.now + duration(ctx, DRAFT_S);
  return undefined;
}

export function draftPick(s, ctx, id, role) {
  const d = s.draft;
  if (s.phase !== 'draft' || !d.wave.includes(id) || s.roleOf[id] || !(d.offers[id] || []).includes(role)) return false;
  s.roleOf[id] = role;
  if (s.scale.wave === 1) {
    d.pool.splice(d.pool.indexOf(role), 1);
  } else {
    d.pool.push(...d.offers[id].filter((r, i) => i !== d.offers[id].indexOf(role)));
  }
  delete d.offers[id];
  if (d.wave.every((w) => s.roleOf[w])) nextWave(s, ctx);
  return true;
}

function startCalling(s, ctx) {
  s.phase = 'call';
  s.calling = 0;
  callNext(s, ctx);
}

function callNext(s, ctx) {
  s.calling += 1;
  if (s.calling > 8) return endRound(s, ctx);
  const r = s.calling;
  const holders = crownOrder(s).filter((id) => s.roleOf[id] === r);
  s.turn = {role: r, actors: holders, step: {}, built: {}, used: {}, drawn: {}, done: {}};
  cue(s, `call_${ROLES[r].key}`);
  if (!holders.length) {
    cue(s, 'no_answer');
    s.turn.empty = true;
    s.deadline = ctx.now + duration(ctx, CALL_PAUSE_S);
    return undefined;
  }
  if (s.killed.includes(r)) {
    cue(s, 'slain');
    log(s, {kind: 'slain', role: r});
    s.turn.slain = true;
    s.deadline = ctx.now + duration(ctx, CALL_PAUSE_S);
    return undefined;
  }
  if (s.robbed[r]) {
    const thief = s.robbed[r];
    let total = 0;
    for (const id of holders) {
      total += s.gold[id];
      s.gold[id] = 0;
    }
    s.gold[thief] += total;
    cue(s, 'robbed');
    log(s, {kind: 'robbed', actor: thief, role: r, n: total});
  }
  for (const id of holders) startTurn(s, ctx, id);
  s.deadline = ctx.now + duration(ctx, TURN_S);
  return undefined;
}

function colorCount(s, id, color) {
  return s.city[id].filter((u) => cardOf(s, u).color === color).length;
}

function startTurn(s, ctx, id) {
  const r = s.roleOf[id];
  const role = ROLES[r];
  s.turn.step[id] = 'income';
  if (r === 4) {
    if (s.crown !== id) cue(s, 'crown_moves');
    s.crown = id;
  }
  if (role.color) s.gold[id] += colorCount(s, id, role.color);
  if (r === 6) s.gold[id] += 1;
  if (r === 7) s.hand[id].push(...draw(s, 2));
  if (s.city[id].some((u) => s.cards[u] === 'gate')) s.gold[id] += 1;
}

function draw(s, k) {
  return s.deck.splice(0, k);
}

/** Build limit this turn. */
const buildLimit = (s, id) => (s.roleOf[id] === 7 ? 3 : 1);

export function canBuild(s, id, uid) {
  const card = cardOf(s, uid);
  if (!card || !s.hand[id].includes(uid)) return false;
  if ((s.turn.built[id] || 0) >= buildLimit(s, id)) return false;
  if (s.gold[id] < card.cost) return false;
  return !s.city[id].some((u) => s.cards[u] === card.key);
}

/** Which roles the Blade or the Thief may name. */
export function nameableRoles(s, id) {
  const r = s.roleOf[id];
  if (r === 1) return [2, 3, 4, 5, 6, 7, 8];
  if (r === 2) return [3, 4, 5, 6, 7, 8].filter((x) => !s.killed.includes(x));
  return [];
}

/** Districts the Pasha may knock down: [{owner, uid, price}]. */
export function pashaTargets(s, id) {
  const out = [];
  for (const owner of s.seats) {
    if (owner === id || s.city[owner].length >= s.scale.goal) continue;
    if (s.roleOf[owner] === 5 && !s.killed.includes(5)) continue;
    const walls = s.city[owner].some((u) => s.cards[u] === 'walls') ? 1 : 0;
    for (const uid of s.city[owner]) {
      const price = Math.max(0, cardOf(s, uid).cost - 1 + walls);
      if (price <= s.gold[id]) out.push({owner, uid, price});
    }
  }
  return out;
}

/** One action from the seat whose turn it is. */
export function turnAction(s, ctx, id, msg) {
  if (s.phase !== 'call' || !s.turn || !s.turn.actors.includes(id) || s.turn.done[id]) return false;
  const step = s.turn.step[id];
  const r = s.roleOf[id];
  switch (msg.action) {
    case 'gold':
      if (step !== 'income') return false;
      s.gold[id] += 2;
      s.turn.step[id] = 'main';
      return true;
    case 'cards': {
      if (step !== 'income') return false;
      const cards = draw(s, 2);
      if (s.city[id].some((u) => s.cards[u] === 'lighthouse')) {
        s.hand[id].push(...cards);
        s.turn.step[id] = 'main';
      } else {
        s.turn.drawn[id] = cards;
        s.turn.step[id] = 'keep';
      }
      return true;
    }
    case 'keep': {
      const drawn = s.turn.drawn[id] || [];
      if (step !== 'keep' || !drawn.includes(msg.uid)) return false;
      s.hand[id].push(msg.uid);
      s.deck.push(...drawn.filter((u) => u !== msg.uid));
      s.turn.drawn[id] = null;
      s.turn.step[id] = 'main';
      return true;
    }
    case 'build': {
      if (step !== 'main' || !canBuild(s, id, msg.uid)) return false;
      const card = cardOf(s, msg.uid);
      s.gold[id] -= card.cost;
      s.hand[id] = s.hand[id].filter((u) => u !== msg.uid);
      s.city[id].push(msg.uid);
      s.turn.built[id] = (s.turn.built[id] || 0) + 1;
      log(s, {kind: 'built', actor: id, card: card.key});
      cue(s, `build_${card.color}`);
      if (s.city[id].length >= s.scale.goal) {
        if (!s.firstDone) s.firstDone = id;
        if (!s.lastRound) {
          s.lastRound = true;
          cue(s, 'last_round');
        }
      }
      return true;
    }
    case 'name': {
      if (step !== 'main' || s.turn.used[id] || !nameableRoles(s, id).includes(msg.role)) return false;
      if (r === 1) {
        s.killed.push(msg.role);
        log(s, {kind: 'named', actor: id, role: msg.role, verb: 'blade'});
      } else if (r === 2) {
        s.robbed[msg.role] = s.robbed[msg.role] || id;
        log(s, {kind: 'named', actor: id, role: msg.role, verb: 'thief'});
      }
      s.turn.used[id] = true;
      return true;
    }
    case 'swapHand': {
      if (step !== 'main' || r !== 3 || s.turn.used[id] || !s.seats.includes(msg.target) || msg.target === id) return false;
      const mine = s.hand[id];
      s.hand[id] = s.hand[msg.target];
      s.hand[msg.target] = mine;
      s.turn.used[id] = true;
      log(s, {kind: 'swap', actor: id, target: msg.target});
      return true;
    }
    case 'redraw': {
      if (step !== 'main' || r !== 3 || s.turn.used[id]) return false;
      const k = s.hand[id].length;
      s.deck.push(...s.hand[id]);
      s.hand[id] = draw(s, k);
      s.turn.used[id] = true;
      return true;
    }
    case 'destroy': {
      if (step !== 'main' || r !== 8 || s.turn.used[id]) return false;
      const t = pashaTargets(s, id).find((x) => x.uid === msg.uid);
      if (!t) return false;
      s.gold[id] -= t.price;
      s.city[t.owner] = s.city[t.owner].filter((u) => u !== t.uid);
      s.deck.push(t.uid);
      s.turn.used[id] = true;
      cue(s, 'destroyed');
      log(s, {kind: 'destroyed', actor: id, target: t.owner, card: s.cards[t.uid]});
      return true;
    }
    case 'end': {
      if (step === 'income' || step === 'keep') return false;
      s.turn.done[id] = true;
      if (s.turn.actors.every((a) => s.turn.done[a])) callNext(s, ctx);
      return true;
    }
    default:
      return false;
  }
}

export function score(s, id) {
  const city = s.city[id].map((u) => cardOf(s, u));
  let pts = city.reduce((n, c) => n + c.cost, 0);
  if (city.some((c) => c.key === 'treasury')) pts += 2;
  const colors = new Set(city.map((c) => c.color));
  const gardens = city.some((c) => c.key === 'gardens');
  const missing = ['royal', 'scholarly', 'trade', 'military', 'wonder'].filter((c) => !colors.has(c)).length;
  if (missing === 0 || (gardens && missing <= 1)) pts += 3;
  if (s.firstDone === id) pts += 4;
  else if (city.length >= s.scale.goal) pts += 2;
  return pts;
}

function endRound(s, ctx) {
  if (s.lastRound) {
    s.phase = 'over';
    s.over = true;
    s.deadline = 0;
    s.scores = Object.fromEntries(s.seats.map((id) => [id, score(s, id)]));
    s.winner = [...s.seats].sort((a, b) => s.scores[b] - s.scores[a] || s.gold[b] - s.gold[a])[0];
    cue(s, 'winner', {seat: ctx.seatOf(s.winner)});
    return;
  }
  startRound(s, ctx);
}

/** Time ran out: pick for sleepy seats, end unfinished turns. */
export function timeout(s, ctx) {
  if (s.phase === 'draft') {
    for (const id of [...s.draft.wave]) {
      if (s.roleOf[id]) continue;
      const offer = s.draft.offers[id] || [];
      if (offer.length) draftPick(s, ctx, id, offer[Math.floor(ctx.rng() * offer.length)]);
    }
    return true;
  }
  if (s.phase === 'call') {
    if (s.turn.empty || s.turn.slain) {
      callNext(s, ctx);
      return true;
    }
    for (const id of s.turn.actors) {
      if (s.turn.done[id]) continue;
      if (s.turn.step[id] === 'income') s.gold[id] += 2;
      if (s.turn.step[id] === 'keep') {
        const drawn = s.turn.drawn[id] || [];
        if (drawn.length) {
          s.hand[id].push(drawn[0]);
          s.deck.push(...drawn.slice(1));
        }
      }
      s.turn.done[id] = true;
    }
    callNext(s, ctx);
    return true;
  }
  return false;
}
