/**
 * Clocktower University rules. The big screen runs everything; phones send
 * moves. See the "Clocktower University: Design Plan" doc.
 *
 * Day: players move between campus rooms, learn skills (pay flat Knowledge,
 * draw 2, keep 1), use day skills, set up tonight's skills (locked once set).
 * Then everyone marks a suspect; the top accused (scaled by table size — 3
 * for 12 players) defend, and the class picks one of them to expel.
 * Night: everyone does homework (the phone counts correct answers and reports
 * them in batches), actors pick their target, queued skills resolve together
 * at the end of the timer. A locked room stops a Demon King's slay unless
 * the King sleeps in that room too; each player has one key per game.
 * Demons know the Demon King; the King does not know the Demons.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';
import {normalizePools} from '../../core/mathQuestions';
import {ACTORS, GIFT_AMOUNT, MAX_NIGHT_CASTS, MAX_SPELLS, ROLES, SPELL_COST, SPELL_DRAW, SPELLS, roomsFor} from './data';

const ROLES_S = 30;
const DAWN_S = 8;
const SUSPECT_S = 45;
const DEFENSE_PER_S = 12;
const VOTE_S = 20;
const REVEAL_S = 8;
const EXEC_S = 7;
/** Most correct answers a phone may report per second of night (anti-cheat). */
const MAX_HW_PER_S = 0.8;

/** Role counts per class size, from the plan's table; sizes in between are interpolated. */
const POINTS = [
  // players, demonkings, demons, professors, exchange
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
  const c = {demonking: at(1), demon: at(2), professor: at(3), exchange: at(4)};
  c.student = Math.max(1, n - c.demonking - c.demon - c.professor - c.exchange);
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
    [...Array(c.demonking).fill('demonking'), ...Array(c.demon).fill('demon'), ...Array(c.professor).fill('professor'), ...Array(c.exchange).fill('exchange'), ...Array(c.student).fill('student')].slice(0, n),
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
    // Lifetime correct answers (the “grade”). Buying spells does not reduce it.
    grade: Object.fromEntries(seats.map((id) => [id, 0])),
    // Spells learned: in the whole game, and in the current round (keyed by night number).
    learned: Object.fromEntries(seats.map((id) => [id, 0])),
    learnedRound: {},
    spells: Object.fromEntries(seats.map((id) => [id, []])),
    // Open draw: 3 spell keys the player must pick from (Knowledge already spent).
    offer: {},
    queued: Object.fromEntries(seats.map((id) => [id, []])),
    roleTarget: {},
    hw: {},
    hwWrong: {},
    // Practice session totals for dead players (any phase).
    practice: {},
    practiceWrong: {},
    dead: {},
    ghost: {},
    info: {},
    ready: {},
    night: 0,
    day: 0,
    nightS: Number(settings.nightSeconds || 60),
    dayS: Number(settings.dayMinutes || 4) * 60,
    // Grade needed to buy a new life; 0 disables revive.
    reviveAt: Math.max(0, Math.floor(Number(settings.reviveAt ?? 100))),
    // Homework question types (core/mathQuestions pools).
    pools: normalizePools(settings.pools),
    log: [],
    cues: [],
    // End-game recap: living good/evil grades + headcounts at each beat.
    gradeLog: [],
  };
  s.hasLeaders = seats.some((id) => s.role[id] === 'demonking');
  // Deal players over the rooms evenly.
  shuffle(seats, rng).forEach((id, i) => {
    s.room[id] = s.rooms[i % s.rooms.length];
  });
  s.phase = 'roles';
  s.deadline = ctx.now + duration(ctx, ROLES_S + Math.min(30, n));
  cue(s, 'welcome');
  return s;
}

/** Snapshot living players’ grades and good/evil counts for the end-game chart. */
function snapshotGrades(s, tag) {
  let goodGrade = 0;
  let evilGrade = 0;
  let good = 0;
  let evil = 0;
  for (const id of s.seats) {
    if (s.dead[id]) continue;
    const g = (s.grade && s.grade[id]) || 0;
    if (isEvil(s, id)) {
      evilGrade += g;
      evil += 1;
    } else {
      goodGrade += g;
      good += 1;
    }
  }
  s.gradeLog = [
    ...(s.gradeLog || []),
    {
      tag,
      night: s.night,
      day: s.day,
      goodGrade,
      evilGrade,
      total: goodGrade + evilGrade,
      good,
      evil,
    },
  ];
}

/**
 * Who this evil player privately knows.
 * Demon → living/dead Demon King(s). Demon King → nobody (empty list).
 * Good → null.
 */
export function cultOf(s, id) {
  const r = s.role[id];
  if (r === 'demon') return s.seats.filter((p) => s.role[p] === 'demonking');
  if (r === 'demonking') return [];
  return null;
}

/** Rooms where living Demons / Demon Kings sleep (legacy helper; demon night reach is own-room only). */
export function cultRooms(s) {
  const rooms = new Set();
  for (const id of alive(s)) {
    if (isEvil(s, id) && s.room[id]) rooms.add(s.room[id]);
  }
  return [...rooms];
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
  s.hwWrong = {};
  s.practice = {};
  s.practiceWrong = {};
  s.nightStart = ctx.now;
  if (s.night === 1) snapshotGrades(s, 'start');
  else if (s.day > 0) snapshotGrades(s, 'day');
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
  // Demon King: any living player after night 1 (locks checked at resolve).
  if (r === 'demonking') {
    if (s.night === 1) return [];
    return alive(s).filter((p) => p !== id);
  }
  // Demon: only others in your room (King is secret from other Demons).
  if (r === 'demon') {
    return alive(s).filter((p) => p !== id && s.room[p] === s.room[id]);
  }
  return alive(s).filter((p) => p !== id);
}

export function roleAct(s, ctx, id, target) {
  if (s.roleTarget[id] || !roleTargets(s, id).includes(target)) return false;
  s.roleTarget[id] = target;
  return true;
}

/**
 * Homework / practice: the phone reports running totals of correct and wrong
 * answers for this session. Correct raises Grade (+ Knowledge if alive);
 * wrong lowers Grade by 1 each (floor 0). Dead may practice any phase.
 */
export function homework(s, ctx, id, total, wrongs = 0) {
  if (s.over) return false;
  const dead = Boolean(s.dead[id]);
  if (!dead && s.phase !== 'night' && s.phase !== 'dawn') return false;
  const end = dead ? ctx.now : Math.min(ctx.now, s.deadline || ctx.now);
  const elapsed = Math.max(0, end - (s.nightStart || ctx.now - 60000)) / 1000 / (ctx.speed || 1);
  const cap = dead
    ? Math.ceil(elapsed * 0.5) + 40
    : Math.ceil(elapsed * MAX_HW_PER_S) + 2;
  const n = Math.max(0, Math.min(Math.floor(Number(total) || 0), cap));
  const w = Math.max(0, Math.min(Math.floor(Number(wrongs) || 0), cap + 20));
  const bag = dead ? (s.practice = s.practice || {}) : s.hw;
  const wBag = dead ? (s.practiceWrong = s.practiceWrong || {}) : (s.hwWrong = s.hwWrong || {});
  const before = bag[id] || 0;
  const wBefore = wBag[id] || 0;
  const delta = Math.max(0, n - before);
  const wrongDelta = Math.max(0, w - wBefore);
  if (delta <= 0 && wrongDelta <= 0) return false;
  if (delta > 0) bag[id] = n;
  if (wrongDelta > 0) wBag[id] = w;
  s.grade = s.grade || {};
  s.grade[id] = Math.max(0, (s.grade[id] || 0) + delta - wrongDelta);
  if (!dead) {
    if (delta > 0) s.knowledge[id] += delta * (s.role[id] === 'exchange' ? 2 : 1);
    if (wrongDelta > 0) s.knowledge[id] = Math.max(0, s.knowledge[id] - wrongDelta);
  }
  return true;
}

/** Spend grade to return from the dead (when reviveAt > 0). */
export function revive(s, ctx, id) {
  const need = s.reviveAt || 0;
  if (!need || !s.dead[id] || s.over) return false;
  if ((s.grade[id] || 0) < need) return false;
  s.grade[id] -= need;
  delete s.dead[id];
  delete s.ghost[id];
  log(s, {kind: 'revive', actor: id, cost: need});
  return true;
}

// ------------------------------------------------------------------ spells

const held = (s, id, k) => s.spells[id].find((x) => x.k === k);
const passive = (s, id, k) => !s.dead[id] && Boolean(held(s, id, k));
const hasPassive = (s, id) => (s.spells[id] || []).some((h) => SPELLS[h.k] && SPELLS[h.k].type === 'passive');

/** Players a spell may target right now. */
export function spellTargets(s, id, k) {
  const sp = SPELLS[k];
  if (sp.range === 'player') return alive(s).filter((p) => p !== id);
  if (sp.range === 'roomPlayer') return alive(s).filter((p) => p !== id && s.room[p] === s.room[id]);
  if (sp.range === 'move') return activeRooms(s).filter((r) => r !== s.room[id] && !s.locks[r]);
  return [];
}

const dayPhase = (s) => ['day', 'suspect', 'suspectReveal', 'defense', 'vote', 'voteReveal', 'dawn'].includes(s.phase);

/**
 * How many accused defend after the suspicion ballot. Scales with the living
 * table: about 1 per 4 players (3 for 12), at least 1, at most 5.
 */
export function defenseSlots(n) {
  return Math.max(1, Math.min(5, Math.round(n / 4)));
}

/** Can this player still learn a spell? Hand full (max cards) or nothing left to draw. */
export function canLearn(s, id) {
  return (s.spells[id] || []).length < MAX_SPELLS && unownedSpells(s, id).length > 0;
}

/**
 * Spells this player may still draw. Hand cap {@link MAX_SPELLS}; at most one
 * passive — once owned, other passives are hidden from the offer pool.
 */
function unownedSpells(s, id) {
  if ((s.spells[id] || []).length >= MAX_SPELLS) return [];
  const ownPassive = hasPassive(s, id);
  return Object.keys(SPELLS).filter((k) => {
    if (held(s, id, k)) return false;
    if (ownPassive && SPELLS[k].type === 'passive') return false;
    return true;
  });
}

/**
 * Pay the flat spell cost and open a draw of {@link SPELL_DRAW} random
 * unowned spells. The player must then {@link pickSpell} one of them.
 */
export function drawSpell(s, ctx, id) {
  if (s.dead[id] || !dayPhase(s) || !canLearn(s, id) || (s.offer && s.offer[id])) return false;
  if (s.knowledge[id] < SPELL_COST) return false;
  const pool = unownedSpells(s, id);
  if (!pool.length) return false;
  const offer = shuffle(pool, ctx.rng).slice(0, Math.min(SPELL_DRAW, pool.length));
  s.knowledge[id] -= SPELL_COST;
  s.offer = {...(s.offer || {}), [id]: offer};
  log(s, {kind: 'draw', actor: id});
  return true;
}

/** Keep one spell from the open draw. */
export function pickSpell(s, ctx, id, k) {
  const offer = (s.offer || {})[id];
  const sp = SPELLS[k];
  if (!sp || s.dead[id] || !dayPhase(s) || !offer || !offer.includes(k) || held(s, id, k)) return false;
  if ((s.spells[id] || []).length >= MAX_SPELLS) return false;
  if (sp.type === 'passive' && hasPassive(s, id)) return false;
  s.learned = {...s.learned, [id]: ((s.learned || {})[id] || 0) + 1};
  s.spells[id] = [...s.spells[id], {k, left: sp.uses}];
  const next = {...(s.offer || {})};
  delete next[id];
  s.offer = next;
  log(s, {kind: 'buy', actor: id, spell: k});
  return true;
}

/** @deprecated Prefer {@link drawSpell} + {@link pickSpell}; kept as an alias for older clients. */
export function buy(s, ctx, id, k) {
  if ((s.offer || {})[id]) return pickSpell(s, ctx, id, k);
  return false;
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
    if (s.phase !== 'vote' || !s.ballot || s.ballot.loud[id]) return false;
    s.ballot.loud[id] = true;
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
    if (s.role[id] === 'demon') info(s, id, {key: 'cult', player: t, yes: s.role[t] === 'professor'});
  }
  each('reveal', (id) => {
    const others = alive(s).filter((p) => p !== id && pos[p] === pos[id]);
    if (!others.length) {
      info(s, id, {key: 'revealEmpty'});
      return;
    }
    info(s, id, {
      key: 'revealRoom',
      lines: others.map((p) => ({player: p, evil: appearsEvil(p)})),
    });
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
      if (s.role[id] !== 'demonking' || !t) continue;
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
  // Flower Watch: did a Demon King vote yes yesterday?
  for (const id of alive(s)) if (passive(s, id, 'flower') && s.day > 0) info(s, id, {key: 'flower', yes: Boolean(s.leaderVotedYes)});
  s.phase = 'dawn';
  s.deadline = ctx.now + duration(ctx, DAWN_S);
  if (s.deaths.length) for (const d of s.deaths) cue(s, 'slain', {seat: ctx.seatOf(d)});
  else cue(s, 'peaceful');
  snapshotGrades(s, 'night');
  checkWin(s);
}

// ------------------------------------------------------------------ day

function startDay(s, ctx) {
  s.day += 1;
  s.accused = [];
  s.ballot = null;
  s.block = null;
  s.hush = {};
  s.leaderVotedYes = false;
  s.expelled = null;
  // Suspicion opens with the day — no separate host “open vote” step.
  s.phase = 'suspect';
  s.suspect = {};
  s.deadline = ctx.now + duration(ctx, s.dayS + Math.min(120, s.seats.length * 2));
  cue(s, 'day');
  cue(s, 'suspect');
  log(s, {kind: 'suspectOpen'});
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

function startSuspect(s, ctx) {
  s.phase = 'suspect';
  s.suspect = {};
  s.deadline = ctx.now + duration(ctx, SUSPECT_S + Math.min(30, alive(s).length));
  cue(s, 'suspect');
  log(s, {kind: 'suspectOpen'});
}

/**
 * Lock in a suspicion vote (Among Us style: no changes). Living players only.
 * When everyone living has voted, open the public reveal.
 */
export function suspectVote(s, ctx, id, target) {
  if (s.phase !== 'suspect' || s.dead[id] || s.suspect[id] != null) return false;
  if (!s.seats.includes(target) || target === id || s.dead[target]) return false;
  s.suspect[id] = target;
  log(s, {kind: 'suspect', actor: id, target});
  if (alive(s).every((p) => s.suspect[p] != null)) startSuspectReveal(s, ctx);
  return true;
}

function rankSuspects(s, ctx) {
  const living = alive(s);
  const tally = Object.fromEntries(living.map((id) => [id, 0]));
  for (const id of living) {
    const t = s.suspect[id];
    if (t && tally[t] != null) tally[t] += 1;
  }
  return living
    .map((id) => ({id, n: tally[id]}))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || (ctx.seatOf(a.id) || 0) - (ctx.seatOf(b.id) || 0));
}

/** Public reveal of suspicion votes, then defense (or skip day if nobody was named). */
function startSuspectReveal(s, ctx) {
  if (s.phase === 'suspectReveal') return;
  const ranked = rankSuspects(s, ctx);
  s.phase = 'suspectReveal';
  s.suspectRanked = ranked;
  s.deadline = ctx.now + duration(ctx, REVEAL_S);
  cue(s, 'suspect');
  log(s, {kind: 'suspectReveal', ranked: ranked.map((x) => ({id: x.id, n: x.n}))});
}

/**
 * Rank living players by suspicion votes and keep the top
 * {@link defenseSlots} (fewer if not enough people were named).
 */
function tallySuspects(s, ctx) {
  if (s.phase === 'suspect') startSuspectReveal(s, ctx);
  if (s.phase !== 'suspectReveal') return;
  const ranked = s.suspectRanked || rankSuspects(s, ctx);
  const slots = defenseSlots(alive(s).length);
  const accused = ranked.slice(0, slots);
  s.accused = accused;
  s.suspectRanked = null;
  log(s, {kind: 'suspectTally', accused: accused.map((x) => ({id: x.id, n: x.n}))});
  if (!accused.length) {
    s.block = null;
    endDay(s, ctx);
    return;
  }
  s.phase = 'defense';
  s.deadline = ctx.now + duration(ctx, Math.max(DEFENSE_PER_S, DEFENSE_PER_S * accused.length));
  cue(s, 'defense', {seat: ctx.seatOf(accused[0].id)});
}

/**
 * Open a final ballot. Pass `runoffIds` after a tie to revote among only those seats.
 */
function startFinalVote(s, ctx, runoffIds = null) {
  const pool = runoffIds && runoffIds.length ? runoffIds : (s.accused || []).map((x) => x.id);
  if (!pool.length) {
    s.block = null;
    endDay(s, ctx);
    return;
  }
  if (runoffIds) {
    const prevScores = (s.voteReveal && s.voteReveal.scores) || {};
    s.accused = pool.map((id) => ({id, n: prevScores[id] || 0}));
    s.voteRunoff = (s.voteRunoff || 0) + 1;
  } else {
    s.voteRunoff = 0;
  }
  s.phase = 'vote';
  s.ballot = {picks: {}, loud: {}, accused: pool, runoff: Boolean(runoffIds)};
  s.voteReveal = null;
  s.block = null;
  s.deadline = ctx.now + duration(ctx, VOTE_S + Math.min(20, pool.length * 4));
  cue(s, 'vote');
  log(s, {kind: runoffIds ? 'voteRunoff' : 'voteOpen', accused: pool});
}

/** Dead players keep one ghost vote on the final ballot; Hushed sit this out. */
export const canVoteYes = (s, id) => !s.hush[id] && (!s.dead[id] || !s.ghost[id]);

function fillAutoVotes(s) {
  for (const id of s.seats) {
    if (s.ballot.picks[id] != null) continue;
    if (!canVoteYes(s, id)) s.ballot.picks[id] = 'none';
  }
}

function ballotComplete(s) {
  fillAutoVotes(s);
  return s.seats.every((p) => s.ballot.picks[p] != null);
}

/**
 * Final ballot: pick one of the accused to expel, or pass (`target` null / 'none').
 * Locked once cast. When everyone has voted, open the public reveal.
 */
export function castVote(s, ctx, id, target) {
  if (s.phase !== 'vote' || !s.ballot || s.ballot.picks[id] != null) return false;
  if (!canVoteYes(s, id) && target && target !== 'none') {
    s.ballot.picks[id] = 'none';
  } else if (!target || target === 'none') {
    s.ballot.picks[id] = 'none';
  } else if (s.ballot.accused.includes(target)) {
    s.ballot.picks[id] = target;
  } else {
    return false;
  }
  if (ballotComplete(s)) startVoteReveal(s, ctx);
  return true;
}

/** @deprecated Old nominate flow — ignored. */
export function nominate() {
  return false;
}

function computeFinal(s) {
  const b = s.ballot;
  const scores = Object.fromEntries(b.accused.map((id) => [id, 0]));
  const voters = Object.fromEntries(b.accused.map((id) => [id, []]));
  for (const id of s.seats) {
    const pick = b.picks[id];
    if (!pick || pick === 'none' || scores[pick] == null) continue;
    if (s.hush[id]) continue;
    if (s.dead[id] && s.ghost[id]) continue;
    const weight = b.loud[id] && !s.dead[id] ? 2 : 1;
    scores[pick] += weight;
    voters[pick].push(id);
  }
  let bestN = 0;
  for (const id of b.accused) {
    if (scores[id] > bestN) bestN = scores[id];
  }
  const tied = bestN > 0 ? b.accused.filter((id) => scores[id] === bestN) : [];
  return {
    scores,
    voters,
    tied: tied.length >= 2 ? tied : null,
    block: tied.length === 1 ? {id: tied[0], yes: bestN} : null,
  };
}

/** Spend ghost votes / flower flags only when the day is actually decided. */
function applyVoteSideEffects(s) {
  const b = s.ballot;
  if (!b) return;
  for (const id of s.seats) {
    const pick = b.picks[id];
    if (!pick || pick === 'none') continue;
    if (s.hush[id]) continue;
    if (s.dead[id] && s.ghost[id]) continue;
    if (s.dead[id]) s.ghost[id] = true;
    if (s.role[id] === 'demonking') s.leaderVotedYes = true;
  }
}

function startVoteReveal(s, ctx) {
  if (s.phase === 'voteReveal') return;
  fillAutoVotes(s);
  const result = computeFinal(s);
  s.phase = 'voteReveal';
  s.voteReveal = result;
  s.block = result.block;
  s.deadline = ctx.now + duration(ctx, REVEAL_S);
  log(s, {kind: 'finalVote', scores: result.scores, block: s.block, tied: result.tied});
  cue(s, 'vote');
}

const MAX_RUNOFFS = 4;

function tallyFinal(s, ctx) {
  if (s.phase === 'vote') startVoteReveal(s, ctx);
  if (s.phase !== 'voteReveal') return;
  const tied = s.voteReveal && s.voteReveal.tied;
  if (tied && tied.length >= 2 && (s.voteRunoff || 0) < MAX_RUNOFFS) {
    startFinalVote(s, ctx, tied);
    return;
  }
  applyVoteSideEffects(s);
  s.hush = {};
  s.ballot = null;
  s.voteReveal = null;
  endDay(s, ctx);
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

/** Host: close the suspicion ballot early (it already opens with the day). */
export function hostEndDay(s, ctx) {
  if (s.phase === 'day') {
    startSuspect(s, ctx);
    return true;
  }
  if (s.phase === 'suspect') {
    startSuspectReveal(s, ctx);
    tallySuspects(s, ctx);
    return true;
  }
  if (s.phase === 'suspectReveal') {
    tallySuspects(s, ctx);
    return true;
  }
  if (s.phase === 'vote') {
    startVoteReveal(s, ctx);
    tallyFinal(s, ctx);
    return true;
  }
  if (s.phase === 'voteReveal') {
    tallyFinal(s, ctx);
    return true;
  }
  return false;
}

function checkWin(s) {
  if (s.over) return true;
  const living = alive(s);
  const evil = living.filter((p) => isEvil(s, p));
  const target = s.hasLeaders ? evil.filter((p) => s.role[p] === 'demonking') : evil;
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
  snapshotGrades(s, 'end');
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
      startSuspect(s, ctx);
      return true;
    case 'suspect':
      startSuspectReveal(s, ctx);
      if (s.cutTimer) {
        s.cutTimer = false;
        tallySuspects(s, ctx);
      }
      return true;
    case 'suspectReveal':
      s.cutTimer = false;
      tallySuspects(s, ctx);
      return true;
    case 'defense':
      startFinalVote(s, ctx);
      return true;
    case 'vote':
      startVoteReveal(s, ctx);
      if (s.cutTimer) {
        s.cutTimer = false;
        tallyFinal(s, ctx);
      }
      return true;
    case 'voteReveal':
      s.cutTimer = false;
      tallyFinal(s, ctx);
      return true;
    case 'execution':
      if (!s.over) startNight(s, ctx);
      return true;
    default:
      return false;
  }
}

export {freeUses};
