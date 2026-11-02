/**
 * Clocktower University rules. The big screen runs everything; phones send
 * moves. See the "Clocktower University: Design Plan" doc.
 *
 * Day: players move between campus rooms, buy spells with Knowledge, cast day
 * spells, set up tonight's spells (locked once set), nominate and vote.
 * Night: everyone does homework (the phone counts correct answers and reports
 * them in batches), actors pick their target, queued spells resolve together
 * at the end of the timer. A locked room stops a Cult Leader's slay unless
 * the Leader sleeps in that room too; each player has one key per game.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';
import {normalizePools} from '../../core/mathQuestions';
import {ACTORS, GIFT_AMOUNT, MAX_NIGHT_CASTS, MAX_SPELLS, ROLES, SPELLS, SPELLS_PER_ROUND, roomsFor} from './data';

const ROLES_S = 30;
const DAWN_S = 8;
const DEFENSE_S = 15;
const VOTE_S = 15;
const EXEC_S = 7;
/** Most correct answers a phone may report per second of night (anti-cheat). */
const MAX_HW_PER_S = 0.8;

/** Role counts per class size, from the plan's table; sizes in between are interpolated. */
const POINTS = [
  // players, leaders, cultists, professors, exchange
  [5, 0, 1, 1, 0],
  [8, 0, 1, 1, 1],
  [15, 1, 3, 2, 2],
  [30, 1, 5, 3, 3],
  [64, 2, 10, 6, 6],
];

export function counts(n) {
  let i = 0;
  while (i < POINTS.length - 2 && n > POINTS[i + 1][0]) i += 1;
  const a = POINTS[i];
  const b = POINTS[i + 1];
  const t = Math.max(0, Math.min(1, (n - a[0]) / (b[0] - a[0])));
  const at = (k) => Math.round(a[k] + (b[k] - a[k]) * t);
  const c = {leader: at(1), cultist: at(2), professor: at(3), exchange: at(4)};
  c.student = Math.max(1, n - c.leader - c.cultist - c.professor - c.exchange);
  return c;
}

export const alive = (s) => s.seats.filter((id) => !s.dead[id]);
export const isEvil = (s, id) => ROLES[s.role[id]].side === 'evil';
// Games saved before the six-room campus have no `rooms`: they get an empty map, not a crash.
export const activeRooms = (s) => s.rooms || [];

export function setupUniversity(seats, settings, ctx) {
  const rng = ctx.rng;
  const n = seats.length;
  const c = counts(n);
  const deck = shuffle(
    [...Array(c.leader).fill('leader'), ...Array(c.cultist).fill('cultist'), ...Array(c.professor).fill('professor'), ...Array(c.exchange).fill('exchange'), ...Array(c.student).fill('student')].slice(0, n),
    rng,
  );
  const s = {
    seats,
    role: Object.fromEntries(seats.map((id, i) => [id, deck[i] || 'student'])),
    rooms: roomsFor(n),
    room: {},
    key: Object.fromEntries(seats.map((id) => [id, true])),
    lockTonight: {},
    locks: {},
    knowledge: Object.fromEntries(seats.map((id) => [id, 0])),
    // Spells learned: in the whole game, and in the current round (keyed by night number).
    learned: Object.fromEntries(seats.map((id) => [id, 0])),
    learnedRound: {},
    spells: Object.fromEntries(seats.map((id) => [id, []])),
    queued: Object.fromEntries(seats.map((id) => [id, []])),
    roleTarget: {},
    hw: {},
    dead: {},
    ghost: {},
    info: {},
    ready: {},
    night: 0,
    day: 0,
    nightS: Number(settings.nightSeconds || 60),
    dayS: Number(settings.dayMinutes || 4) * 60,
    // Homework question types (core/mathQuestions pools).
    pools: normalizePools(settings.pools),
    log: [],
    cues: [],
  };
  s.hasLeaders = seats.some((id) => s.role[id] === 'leader');
  // Deal players over the rooms evenly.
  shuffle(seats, rng).forEach((id, i) => {
    s.room[id] = s.rooms[i % s.rooms.length];
  });
  s.phase = 'roles';
  s.deadline = ctx.now + duration(ctx, ROLES_S + Math.min(30, n));
  cue(s, 'welcome');
  return s;
}

/** The Cult: every evil player knows the others. */
export function cultOf(s, id) {
  if (!isEvil(s, id)) return null;
  return s.seats.filter((p) => p !== id && isEvil(s, p));
}

export function markReady(s, ctx, id) {
  if (s.phase !== 'roles') return false;
  s.ready[id] = true;
  if (s.seats.every((p) => s.ready[p])) startNight(s, ctx);
  return true;
}

function info(s, id, item) {
  s.info[id] = [...(s.info[id] || []), {night: s.night, day: s.day, ...item}];
}

// ------------------------------------------------------------------ night

function startNight(s, ctx) {
  s.night += 1;
  s.phase = 'night';
  s.roleTarget = {};
  s.hw = {};
  s.nightStart = ctx.now;
  // Locks: a player who chose to lock spends their one key on the room they sleep in.
  s.locks = {};
  for (const id of alive(s)) {
    if (s.lockTonight[id] && s.key[id]) {
      s.locks[s.room[id]] = true;
      s.key[id] = false;
    }
  }
  s.lockTonight = {};
  s.deadline = ctx.now + duration(ctx, s.nightS);
  cue(s, 'dusk');
}

/** Who a role may target tonight. */
export function roleTargets(s, id) {
  const r = s.role[id];
  if (!ACTORS.includes(r) || s.dead[id] || s.phase !== 'night') return [];
  if (r === 'leader' && s.night === 1) return [];
  return alive(s).filter((p) => p !== id);
}

export function roleAct(s, ctx, id, target) {
  if (s.roleTarget[id] || !roleTargets(s, id).includes(target)) return false;
  s.roleTarget[id] = target;
  return true;
}

/** Homework: the phone reports how many correct answers it has this night (a running total). */
export function homework(s, ctx, id, total) {
  if (s.phase !== 'night' && s.phase !== 'dawn') return false;
  const cap = Math.ceil((Math.max(0, Math.min(ctx.now, s.deadline) - (s.nightStart || 0)) / 1000 / (ctx.speed || 1)) * MAX_HW_PER_S) + 2;
  const n = Math.max(0, Math.min(Math.floor(Number(total) || 0), cap));
  const before = s.hw[id] || 0;
  if (n <= before) return false;
  const gain = (n - before) * (s.role[id] === 'exchange' ? 2 : 1);
  s.hw[id] = n;
  s.knowledge[id] += gain;
  return true;
}

// ------------------------------------------------------------------ spells

const held = (s, id, k) => s.spells[id].find((x) => x.k === k);
const passive = (s, id, k) => !s.dead[id] && Boolean(held(s, id, k));

/** Players a spell may target right now. */
export function spellTargets(s, id, k) {
  const sp = SPELLS[k];
  if (sp.range === 'player') return alive(s).filter((p) => p !== id);
  if (sp.range === 'roomPlayer') return alive(s).filter((p) => p !== id && s.room[p] === s.room[id]);
  if (sp.range === 'move') return activeRooms(s).filter((r) => r !== s.room[id] && !s.locks[r]);
  return [];
}

const dayPhase = (s) => ['day', 'defense', 'vote', 'dawn'].includes(s.phase);

/** Can this player still learn a spell: under the game limit and none yet this round? */
export function canLearn(s, id) {
  const r = (s.learnedRound || {})[id];
  const thisRound = r && r.night === s.night ? r.n : 0;
  return ((s.learned || {})[id] || 0) < MAX_SPELLS && thisRound < SPELLS_PER_ROUND;
}

export function buy(s, ctx, id, k) {
  const sp = SPELLS[k];
  if (!sp || s.dead[id] || !dayPhase(s) || held(s, id, k)) return false;
  if (!canLearn(s, id) || s.knowledge[id] < sp.cost) return false;
  s.knowledge[id] -= sp.cost;
  s.learned = {...s.learned, [id]: ((s.learned || {})[id] || 0) + 1};
  const r = (s.learnedRound || {})[id];
  s.learnedRound = {...s.learnedRound, [id]: {night: s.night, n: (r && r.night === s.night ? r.n : 0) + 1}};
  s.spells[id] = [...s.spells[id], {k, left: sp.uses}];
  log(s, {kind: 'buy', actor: id, spell: k});
  return true;
}

function spend(s, id, k) {
  const h = held(s, id, k);
  if (!h || h.left === 0) return;
  h.left -= 1;
  if (h.left <= 0) s.spells[id] = s.spells[id].filter((x) => x !== h);
}

/** Uses still free for a spell, after tonight's queue. */
function freeUses(s, id, k) {
  const h = held(s, id, k);
  if (!h) return 0;
  if (h.left === 0) return Infinity;
  return h.left - s.queued[id].filter((q) => q.k === k).length;
}

/**
 * Cast a spell. Night spells may be set up by day or cast at night; either
 * way they queue for tonight and can't be changed. Day spells act at once.
 */
export function cast(s, ctx, id, k, target) {
  const sp = SPELLS[k];
  if (!sp || s.dead[id] || sp.type === 'passive' || freeUses(s, id, k) < 1) return false;
  const needs = ['player', 'roomPlayer', 'move'].includes(sp.range);
  if (needs && !spellTargets(s, id, k).includes(target)) return false;
  if (sp.type === 'night') {
    if (!(s.phase === 'night' || dayPhase(s)) || s.queued[id].length >= MAX_NIGHT_CASTS) return false;
    s.queued[id] = [...s.queued[id], {k, target: needs ? target : null}];
    return true;
  }
  // Day spells.
  if (!dayPhase(s)) return false;
  if (k === 'loud') {
    if (s.phase !== 'vote' || !s.vote || s.vote.loud[id]) return false;
    s.vote.loud[id] = true;
  }
  if (k === 'hush') s.hush[target] = true;
  if (k === 'gift') {
    if (s.knowledge[id] < GIFT_AMOUNT) return false;
    s.knowledge[id] -= GIFT_AMOUNT;
    s.knowledge[target] += GIFT_AMOUNT;
    info(s, target, {key: 'gifted', player: id, n: GIFT_AMOUNT});
  }
  spend(s, id, k);
  log(s, {kind: 'cast', actor: id, spell: k, target});
  return true;
}

// ------------------------------------------------------------------ night end

function resolveNight(s, ctx) {
  const rng = ctx.rng;
  const pos = {...s.room};
  const looksGood = {};
  const safe = {};
  const deaths = [];
  const casts = [];
  for (const id of alive(s)) for (const q of s.queued[id]) casts.push({id, ...q});
  const each = (k, fn) => {
    for (const c of casts) {
      if (c.k !== k || s.dead[c.id]) continue;
      fn(c.id, c.target);
      spend(s, c.id, k);
    }
  };
  // Movement first, then disguise and protection, then information, then slays.
  each('step', (id, room) => {
    if (room && !s.locks[room]) pos[id] = room;
  });
  each('disguise', (id) => {
    looksGood[id] = true;
  });
  const appearsEvil = (p) => !looksGood[p] && (isEvil(s, p) || s.role[p] === 'exchange');
  each('protection', (id, t) => {
    safe[t] = true;
  });
  each('sanctuary', (id) => {
    const here = shuffle(alive(s).filter((p) => pos[p] === pos[id] && p !== id), rng);
    for (const p of [id, ...here].slice(0, 4)) safe[p] = true;
  });
  // Information.
  for (const id of alive(s)) {
    const t = s.roleTarget[id];
    if (!t) continue;
    if (s.role[id] === 'professor') info(s, id, {key: 'prof', player: t, evil: appearsEvil(t)});
    if (s.role[id] === 'cultist') info(s, id, {key: 'cult', player: t, yes: s.role[t] === 'professor'});
  }
  each('reveal', (id, t) => {
    if (pos[t] !== pos[id]) info(s, id, {key: 'gone', player: t});
    else info(s, id, {key: 'reveal', player: t, evil: appearsEvil(t)});
  });
  each('lantern', (id) => {
    const n = alive(s).filter((p) => p !== id && pos[p] === pos[id] && appearsEvil(p)).length;
    info(s, id, {key: 'lantern', room: pos[id], n});
  });
  // Slays.
  const slay = (t, by) => {
    if (s.dead[t] || safe[t]) return;
    if (passive(s, t, 'secondwind')) {
      spend(s, t, 'secondwind');
      info(s, t, {key: 'secondwind'});
      return;
    }
    s.dead[t] = true;
    deaths.push(t);
    log(s, {kind: 'slain', target: t, by});
  };
  if (s.night > 1) {
    for (const id of alive(s)) {
      const t = s.roleTarget[id];
      if (s.role[id] !== 'leader' || !t) continue;
      // A locked room keeps out a Leader who sleeps elsewhere.
      if (s.locks[pos[t]] && pos[id] !== pos[t]) continue;
      slay(t, id);
    }
  }
  each('ignition', (id, t) => {
    if (pos[t] === pos[id]) slay(t, id);
  });
  for (const id of s.seats) s.queued[id] = [];
  s.deaths = deaths;
}


function dawn(s, ctx) {
  resolveNight(s, ctx);
  // Flower Watch: did a Cult Leader vote yes yesterday?
  for (const id of alive(s)) if (passive(s, id, 'flower') && s.day > 0) info(s, id, {key: 'flower', yes: Boolean(s.leaderVotedYes)});
  s.phase = 'dawn';
  s.deadline = ctx.now + duration(ctx, DAWN_S);
  if (s.deaths.length) for (const d of s.deaths) cue(s, 'slain', {seat: ctx.seatOf(d)});
  else cue(s, 'peaceful');
  checkWin(s);
}

// ------------------------------------------------------------------ day

function startDay(s, ctx) {
  s.day += 1;
  s.phase = 'day';
  s.nominated = {};
  s.nominators = {};
  s.block = null;
  s.vote = null;
  s.lastVote = null;
  s.hush = {};
  s.leaderVotedYes = false;
  s.expelled = null;
  s.dayLeft = duration(ctx, s.dayS + Math.min(120, s.seats.length * 2));
  s.deadline = ctx.now + s.dayLeft;
  cue(s, 'day');
}

export function moveTo(s, ctx, id, room) {
  if (s.dead[id] || !dayPhase(s) || !activeRooms(s).includes(room) || s.room[id] === room) return false;
  s.room[id] = room;
  return true;
}

export function setLock(s, ctx, id, on) {
  if (s.dead[id] || !dayPhase(s) || !s.key[id]) return false;
  s.lockTonight[id] = Boolean(on);
  return true;
}

export function nominate(s, ctx, id, target) {
  if (s.phase !== 'day' || s.dead[id] || s.nominators[id] || s.nominated[target] || s.dead[target] || !s.seats.includes(target) || target === id) return false;
  s.nominators[id] = true;
  s.nominated[target] = true;
  s.dayLeft = Math.max(0, s.deadline - ctx.now);
  s.vote = {nominator: id, nominee: target, votes: {}, loud: {}};
  s.phase = 'defense';
  s.deadline = ctx.now + duration(ctx, DEFENSE_S);
  cue(s, 'nominate', {seat: ctx.seatOf(target)});
  log(s, {kind: 'nominate', actor: id, target});
  return true;
}

/** Dead players keep one ghost vote; a Hushed player sits this vote out. */
export const canVoteYes = (s, id) => !s.hush[id] && (!s.dead[id] || !s.ghost[id]);

export function castVote(s, ctx, id, yes) {
  if (s.phase !== 'vote' || s.vote.votes[id] != null) return false;
  s.vote.votes[id] = yes && canVoteYes(s, id) ? 'yes' : 'no';
  if (s.seats.every((p) => s.vote.votes[p] != null)) tally(s, ctx);
  return true;
}

function tally(s, ctx) {
  const v = s.vote;
  let yes = 0;
  for (const id of s.seats) {
    if (v.votes[id] !== 'yes') continue;
    yes += v.loud[id] && !s.dead[id] ? 2 : 1;
    if (s.dead[id]) s.ghost[id] = true;
    if (s.role[id] === 'leader') s.leaderVotedYes = true;
  }
  const need = Math.ceil(alive(s).length / 2);
  v.yes = yes;
  if (yes >= need) {
    if (!s.block || yes > s.block.yes) s.block = {id: v.nominee, yes};
    else if (yes === s.block.yes) s.block = {id: null, yes};
  }
  log(s, {kind: 'voted', target: v.nominee, n: yes});
  s.hush = {};
  s.lastVote = v;
  s.vote = null;
  s.phase = 'day';
  s.deadline = ctx.now + Math.max(duration(ctx, 10), s.dayLeft);
}

function endDay(s, ctx) {
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  if (s.block && s.block.id) {
    const id = s.block.id;
    s.expelled = id;
    s.dead[id] = true;
    cue(s, 'expelled', {seat: ctx.seatOf(id)});
    log(s, {kind: 'expelled', target: id});
    checkWin(s);
  } else {
    cue(s, 'no_expel');
  }
}

export function hostEndDay(s, ctx) {
  if (s.phase !== 'day') return false;
  endDay(s, ctx);
  return true;
}

function checkWin(s) {
  if (s.over) return true;
  const living = alive(s);
  const evil = living.filter((p) => isEvil(s, p));
  const target = s.hasLeaders ? evil.filter((p) => s.role[p] === 'leader') : evil;
  if (!target.length) return win(s, 'good', s.hasLeaders ? 'leadersOut' : 'cultOut');
  if (evil.length >= living.length - evil.length) return win(s, 'evil', 'parity');
  return false;
}

function win(s, side, why) {
  s.phase = 'over';
  s.over = true;
  s.winner = side;
  s.winWhy = why;
  s.deadline = 0;
  cue(s, side === 'good' ? 'win_good' : 'win_evil');
  return true;
}

export function timeout(s, ctx) {
  switch (s.phase) {
    case 'roles':
      startNight(s, ctx);
      return true;
    case 'night':
      dawn(s, ctx);
      return true;
    case 'dawn':
      if (!s.over) startDay(s, ctx);
      return true;
    case 'day':
      endDay(s, ctx);
      return true;
    case 'defense':
      s.phase = 'vote';
      s.deadline = ctx.now + duration(ctx, VOTE_S);
      cue(s, 'vote');
      return true;
    case 'vote':
      tally(s, ctx);
      return true;
    case 'execution':
      if (!s.over) startNight(s, ctx);
      return true;
    default:
      return false;
  }
}

export {freeUses};
