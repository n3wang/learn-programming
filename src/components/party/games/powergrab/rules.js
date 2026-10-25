/**
 * Power Grab rules (Coup-like), pure. ORBIT-9 station theme.
 *
 * Turn → declare an action. A role action can be challenged; aid, strike and
 * skim can be blocked; a block can be challenged too. Losing a challenge or
 * being hit costs one face-down card. Last seat with cards wins.
 *
 * 9+ seats: the Inspector joins the deck, and (unless switched off) seats
 * split into two factions that may only target each other.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';

export const ROLES = {
  quartermaster: {emoji: '📦', tint: '#ffb020', en: 'Quartermaster', zh: '军需官'},
  phantom: {emoji: '🗡️', tint: '#b388ff', en: 'Phantom', zh: '影刃'},
  smuggler: {emoji: '🦝', tint: '#7bed9f', en: 'Smuggler', zh: '走私者'},
  envoy: {emoji: '🕊️', tint: '#3df2ff', en: 'Envoy', zh: '特使'},
  warden: {emoji: '🛡️', tint: '#70a1ff', en: 'Warden', zh: '安保官'},
  inspector: {emoji: '🔍', tint: '#ff6f91', en: 'Inspector', zh: '审讯官'},
};

export const ACTIONS = {
  income: {emoji: '🪙', gain: 1},
  aid: {emoji: '🤝', gain: 2, blockers: 'any', blockRoles: ['quartermaster']},
  overthrow: {emoji: '💥', cost: 7, target: true},
  tax: {emoji: '📦', claim: 'quartermaster', gain: 3},
  strike: {emoji: '🗡️', claim: 'phantom', cost: 3, target: true, blockers: 'target', blockRoles: ['warden']},
  skim: {emoji: '🦝', claim: 'smuggler', target: true, blockers: 'target', blockRoles: ['smuggler', 'envoy', 'inspector']},
  reshuffle: {emoji: '🕊️', claim: 'envoy'},
  inspect: {emoji: '🔍', claim: 'inspector', target: true},
  convert: {emoji: '🔄'},
};

const TURN_S = 30;
const WINDOW_S = 8;
const LOSE_S = 15;
const PICK_S = 20;
export const MUST_OVERTHROW = 10;

export const hidden = (s, id) => s.hands[id].filter((c) => !c.up);
export const isAlive = (s, id) => hidden(s, id).length > 0;
export const aliveIds = (s) => s.seats.filter((id) => isAlive(s, id));
export const holds = (s, id, role) => hidden(s, id).some((c) => c.role === role);

export function rolesInPlay(n) {
  const roles = ['quartermaster', 'phantom', 'smuggler', 'envoy', 'warden'];
  if (n >= 9) roles.push('inspector');
  return roles;
}

export function setupPowerGrab(seats, settings, ctx) {
  const roles = rolesInPlay(seats.length);
  const copies = Math.max(3, Math.ceil((2 * seats.length + 3) / roles.length));
  const deck = shuffle(
    roles.flatMap((r) => Array(copies).fill(r)),
    ctx.rng,
  );
  const s = {
    seats,
    roles,
    copies,
    deck,
    hands: {},
    credits: {},
    faction: {},
    factions: settings.factions !== 'off' && seats.length >= 9,
    reserve: 0,
    ghostPick: {},
    ghostScore: {},
    log: [],
    cues: [],
    turnIdx: 0,
  };
  seats.forEach((id, i) => {
    s.hands[id] = [
      {role: s.deck.pop(), up: false},
      {role: s.deck.pop(), up: false},
    ];
    s.credits[id] = 2;
    s.faction[id] = i % 2 === 0 ? 'blue' : 'orange';
  });
  cue(s, 'welcome');
  beginTurn(s, ctx, 0);
  return s;
}

/** May `actor` aim at `target` (alive, someone else, and the other faction if factions are on)? */
export function canTarget(s, actor, target) {
  if (!target || target === actor || !isAlive(s, target)) return false;
  if (!s.factions) return true;
  const alive = aliveIds(s);
  const oneFaction = alive.every((id) => s.faction[id] === s.faction[alive[0]]);
  return oneFaction || s.faction[target] !== s.faction[actor];
}

export function legalActions(s, id) {
  const c = s.credits[id];
  if (c >= MUST_OVERTHROW) return ['overthrow'];
  const list = ['income', 'aid', 'tax', 'skim', 'reshuffle'];
  if (c >= 3) list.push('strike');
  if (c >= 7) list.push('overthrow');
  if (s.roles.includes('inspector')) list.push('inspect');
  if (s.factions && c >= 1) list.push('convert');
  return list;
}

function beginTurn(s, ctx, idx) {
  const n = s.seats.length;
  let i = idx % n;
  for (let k = 0; k < n && !isAlive(s, s.seats[i]); k++) i = (i + 1) % n;
  s.turnIdx = i;
  s.actor = s.seats[i];
  s.phase = 'turn';
  s.action = null;
  s.block = null;
  s.responses = {};
  s.deadline = ctx.now + duration(ctx, TURN_S);
  cue(s, 'turn', {seat: ctx.seatOf(s.actor)});
  if (s.credits[s.actor] >= MUST_OVERTHROW) cue(s, 'ten_credits');
}

function endTurn(s, ctx) {
  const alive = aliveIds(s);
  if (alive.length <= 1) {
    s.phase = 'over';
    s.over = true;
    s.winner = alive[0] || null;
    s.deadline = 0;
    if (s.winner) cue(s, 'winner', {seat: ctx.seatOf(s.winner)});
    return;
  }
  beginTurn(s, ctx, s.turnIdx + 1);
}

/** Phone or bot declares the turn's action. Returns false if not allowed. */
export function declare(s, ctx, actor, type, target) {
  if (s.phase !== 'turn' || actor !== s.actor) return false;
  const a = ACTIONS[type];
  if (!a || !legalActions(s, actor).includes(type)) return false;
  if (type === 'convert') {
    const other = target && target !== actor;
    const cost = other ? 2 : 1;
    if (s.credits[actor] < cost || (other && !isAlive(s, target))) return false;
    s.credits[actor] -= cost;
    s.reserve += cost;
    const who = other ? target : actor;
    s.faction[who] = s.faction[who] === 'blue' ? 'orange' : 'blue';
    log(s, {kind: 'convert', actor, target: who});
    cue(s, 'faction_switch');
    endTurn(s, ctx);
    return true;
  }
  if (a.target && !canTarget(s, actor, target)) return false;
  if (a.cost) s.credits[actor] -= a.cost;
  s.action = {type, actor, target: a.target ? target : null, claim: a.claim || null, paid: a.cost || 0};
  log(s, {kind: 'declare', actor, type, target: s.action.target});
  if (a.claim) cue(s, `claim_${a.claim}`);
  if (type === 'overthrow') {
    cue(s, 'overthrow');
    loseCard(s, ctx, target, 'end');
    return true;
  }
  if (a.claim) openWindow(s, ctx, 'challenge');
  else if (a.blockers) openBlock(s, ctx);
  else resolve(s, ctx);
  return true;
}

function openWindow(s, ctx, phase) {
  s.phase = phase;
  s.responses = {};
  s.deadline = ctx.now + duration(ctx, WINDOW_S);
}

/** Who may answer in the current window. */
export function responders(s) {
  const alive = aliveIds(s);
  if (s.phase === 'challenge') return alive.filter((id) => id !== s.action.actor);
  if (s.phase === 'block') {
    const a = ACTIONS[s.action.type];
    if (a.blockers === 'target') return isAlive(s, s.action.target) ? [s.action.target] : [];
    return alive.filter((id) => id !== s.action.actor);
  }
  if (s.phase === 'blockChallenge') return alive.filter((id) => id !== s.block.by);
  return [];
}

export function blockRoles(s) {
  const a = s.action && ACTIONS[s.action.type];
  return a && a.blockRoles ? a.blockRoles.filter((r) => s.roles.includes(r)) : [];
}

function openBlock(s, ctx) {
  const a = ACTIONS[s.action.type];
  if (!a.blockers) return resolve(s, ctx);
  openWindow(s, ctx, 'block');
  if (!responders(s).length) resolve(s, ctx);
  return undefined;
}

/** Reveal a proven card, shuffle it back and draw a fresh one. */
function proveAndSwap(s, ctx, id, role) {
  const hand = s.hands[id];
  const i = hand.findIndex((c) => !c.up && c.role === role);
  s.deck.push(role);
  s.deck = shuffle(s.deck, ctx.rng);
  hand[i] = {role: s.deck.pop(), up: false};
}

/** A phone answers a window: {answer: 'pass' | 'challenge' | 'block', role}. */
export function respond(s, ctx, id, answer, role) {
  if (!['challenge', 'block', 'blockChallenge'].includes(s.phase)) return false;
  if (!responders(s).includes(id) || s.responses[id]) return false;
  if (answer === 'pass') {
    s.responses[id] = 'pass';
    if (responders(s).every((r) => s.responses[r])) windowClosed(s, ctx);
    return true;
  }
  if (answer === 'challenge' && (s.phase === 'challenge' || s.phase === 'blockChallenge')) {
    s.responses[id] = 'challenge';
    cue(s, 'challenge');
    if (s.phase === 'challenge') {
      const {actor, claim} = s.action;
      log(s, {kind: 'challenge', actor: id, target: actor, role: claim});
      if (holds(s, actor, claim)) {
        cue(s, 'claim_true');
        proveAndSwap(s, ctx, actor, claim);
        loseCard(s, ctx, id, 'afterChallenge');
      } else {
        cue(s, 'claim_false');
        cue(s, `caught_${claim}`);
        s.credits[actor] += s.action.paid; // a failed strike gives its credits back
        loseCard(s, ctx, actor, 'end');
      }
    } else {
      const {by, claim} = s.block;
      log(s, {kind: 'challenge', actor: id, target: by, role: claim});
      if (holds(s, by, claim)) {
        cue(s, 'claim_true');
        proveAndSwap(s, ctx, by, claim);
        loseCard(s, ctx, id, 'end');
      } else {
        cue(s, 'claim_false');
        cue(s, `caught_${claim}`);
        loseCard(s, ctx, by, 'resolve');
      }
    }
    return true;
  }
  if (answer === 'block' && s.phase === 'block' && blockRoles(s).includes(role)) {
    s.block = {by: id, claim: role};
    log(s, {kind: 'block', actor: id, role});
    cue(s, `block_${role}`);
    openWindow(s, ctx, 'blockChallenge');
    if (!responders(s).length) windowClosed(s, ctx);
    return true;
  }
  return false;
}

function windowClosed(s, ctx) {
  if (s.phase === 'challenge') afterChallenge(s, ctx);
  else if (s.phase === 'block') resolve(s, ctx);
  else if (s.phase === 'blockChallenge') {
    // The block stands.
    cue(s, 'blocked');
    log(s, {kind: 'blocked', actor: s.block.by});
    endTurn(s, ctx);
  }
}

function afterChallenge(s, ctx) {
  if (!isAlive(s, s.action.actor)) return endTurn(s, ctx);
  if (ACTIONS[s.action.type].blockers) return openBlock(s, ctx);
  return resolve(s, ctx);
}

function resolve(s, ctx) {
  const {type, actor, target} = s.action;
  const a = ACTIONS[type];
  if (a.gain) s.credits[actor] += a.gain;
  if (type === 'skim' && isAlive(s, target)) {
    const n = Math.min(2, s.credits[target]);
    s.credits[target] -= n;
    s.credits[actor] += n;
  }
  if (type === 'strike') {
    if (isAlive(s, target)) return loseCard(s, ctx, target, 'end');
  }
  if (type === 'reshuffle') {
    const drawn = [s.deck.pop(), s.deck.pop()].filter(Boolean);
    s.pick = {kind: 'exchange', id: actor, options: [...hidden(s, actor).map((c) => c.role), ...drawn], keep: hidden(s, actor).length};
    s.phase = 'exchange';
    s.deadline = ctx.now + duration(ctx, PICK_S);
    return undefined;
  }
  if (type === 'inspect' && isAlive(s, target)) {
    const cards = hidden(s, target);
    const card = cards[Math.floor(ctx.rng() * cards.length)];
    s.pick = {kind: 'inspect', id: actor, target, role: card.role};
    s.phase = 'inspect';
    s.deadline = ctx.now + duration(ctx, PICK_S);
    return undefined;
  }
  return endTurn(s, ctx);
}

/** `id` must give up a face-down card; `next` says what happens after. */
function loseCard(s, ctx, id, next) {
  s.lose = {id, next};
  if (hidden(s, id).length <= 1) return finishLose(s, ctx, hidden(s, id)[0] ? s.hands[id].indexOf(hidden(s, id)[0]) : -1);
  s.phase = 'lose';
  s.deadline = ctx.now + duration(ctx, LOSE_S);
  return undefined;
}

export function finishLose(s, ctx, cardIndex) {
  const {id, next} = s.lose;
  const card = s.hands[id][cardIndex];
  if (card && !card.up) {
    card.up = true;
    log(s, {kind: 'lost', actor: id, role: card.role});
    cue(s, 'card_lost');
    // Ghost brokers who called this seat score.
    for (const [ghost, pickId] of Object.entries(s.ghostPick)) {
      if (pickId === id) s.ghostScore[ghost] = (s.ghostScore[ghost] || 0) + 1;
    }
    s.ghostPick = {};
    if (!isAlive(s, id)) {
      log(s, {kind: 'out', actor: id});
      cue(s, 'player_out', {seat: ctx.seatOf(id)});
    }
  }
  s.lose = null;
  if (aliveIds(s).length <= 1) return endTurn(s, ctx);
  if (next === 'afterChallenge') return afterChallenge(s, ctx);
  if (next === 'resolve') return resolve(s, ctx);
  return endTurn(s, ctx);
}

export function finishExchange(s, ctx, keepIdx) {
  const {id, options, keep} = s.pick;
  const chosen = [...new Set((keepIdx || []).filter((i) => i >= 0 && i < options.length))].slice(0, keep);
  while (chosen.length < keep) {
    const next = options.findIndex((_, i) => !chosen.includes(i));
    chosen.push(next);
  }
  const kept = chosen.map((i) => options[i]);
  options.forEach((r, i) => {
    if (!chosen.includes(i)) s.deck.push(r);
  });
  s.deck = shuffle(s.deck, ctx.rng);
  const up = s.hands[id].filter((c) => c.up);
  s.hands[id] = [...up, ...kept.map((role) => ({role, up: false}))];
  s.pick = null;
  endTurn(s, ctx);
}

export function finishInspect(s, ctx, swap) {
  const {target, role} = s.pick;
  if (swap && isAlive(s, target)) proveAndSwap(s, ctx, target, role);
  log(s, {kind: swap ? 'inspectSwap' : 'inspectKeep', actor: s.pick.id, target});
  s.pick = null;
  endTurn(s, ctx);
}

/** The clock ran out on the current step. */
export function timeout(s, ctx) {
  if (s.phase === 'turn') {
    const actor = s.actor;
    if (s.credits[actor] >= MUST_OVERTHROW) {
      const target = aliveIds(s).find((id) => canTarget(s, actor, id));
      return declare(s, ctx, actor, 'overthrow', target);
    }
    return declare(s, ctx, actor, 'income');
  }
  if (['challenge', 'block', 'blockChallenge'].includes(s.phase)) {
    windowClosed(s, ctx);
    return true;
  }
  if (s.phase === 'lose') {
    const first = s.hands[s.lose.id].findIndex((c) => !c.up);
    finishLose(s, ctx, first);
    return true;
  }
  if (s.phase === 'exchange') {
    finishExchange(s, ctx, []);
    return true;
  }
  if (s.phase === 'inspect') {
    finishInspect(s, ctx, false);
    return true;
  }
  return false;
}
