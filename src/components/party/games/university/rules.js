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
 * When living players exceed the host `demonKillAt` threshold (default 10),
 * Demons' night pick slays a roommate. At or below that count, Demons vote a
 * kill target (King sees the votes; if there is no King, that vote slays).
 * Demon King slays ignore room locks.
 * Actors with a night pick must choose before homework counts.
 */

import {cue, duration, log, pick, shuffle} from '../../core/partyCore';
import {normalizePools} from '../../core/mathQuestions';
import {ACTORS, GIFT_AMOUNT, MAX_NIGHT_CASTS, MAX_SPELLS, RARITY_WEIGHT, ROLES, SPELL_COST, SPELL_DRAW, SPELLS, roomsFor} from './data';

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
/** Default alive-count above which Demons gain a base roommate kill (host can change). */
export const DEMON_KILL_ALIVE_DEFAULT = 10;
/** Large tables: Demons (cultists) gain a base roommate kill. Threshold is `s.demonKillAt`. */
export const demonCanKill = (s) => {
  const at = Number(s.demonKillAt);
  const threshold = Number.isFinite(at) ? at : DEMON_KILL_ALIVE_DEFAULT;
  return alive(s).length > threshold;
};
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
    // When living players exceed this, Demons get roommate kills instead of kill-votes.
    demonKillAt: Math.max(0, Math.floor(Number(settings.demonKillAt ?? DEMON_KILL_ALIVE_DEFAULT))),
    // Host big screen: list who is in each room during the day (night stays secret).
    showRooms: Boolean(settings.showRooms),
    // Host: floating +1/−1 from a player's room when homework scores.
    showHwPop: settings.showHwPop !== false,
    hwPops: [],
    // Knowledge cost to draw skills (host: 3 / 6 / 8).
    spellCost: [3, 6, 8].includes(Number(settings.spellCost))
      ? Number(settings.spellCost)
      : SPELL_COST,
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

/** Dead players keep grinding Grade via practice — seed from tonight's hw so totals don't double-count. */
function beginGhostPractice(s, id, now) {
  s.practice = s.practice || {};
  s.practiceWrong = s.practiceWrong || {};
  s.practiceSince = s.practiceSince || {};
  if (s.practice[id] == null) s.practice[id] = s.hw[id] || 0;
  if (s.practiceWrong[id] == null) s.practiceWrong[id] = (s.hwWrong && s.hwWrong[id]) || 0;
  if (!s.practiceSince[id]) s.practiceSince[id] = now || Date.now();
}

function startNight(s, ctx) {
  s.night += 1;
  s.phase = 'night';
  s.roleTarget = {};
  s.hw = {};
  s.hwWrong = {};
  // Keep dead players' practice counters across nights so they can keep doing math.
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
  // Demon King: any living player after night 1 (locks never block the slay).
  if (r === 'demonking') {
    if (s.night === 1) return [];
    return alive(s).filter((p) => p !== id);
  }
  // Demon: large table = roommate kill; small table = kill vote (any living).
  if (r === 'demon') {
    if (demonCanKill(s)) {
      return alive(s).filter((p) => p !== id && s.room[p] === s.room[id]);
    }
    return alive(s).filter((p) => p !== id);
  }
  // Professor: once per night, someone sleeping in your room only.
  if (r === 'professor') {
    return alive(s).filter((p) => p !== id && s.room[p] === s.room[id]);
  }
  return alive(s).filter((p) => p !== id);
}

/** Alignment read at the moment of a Professor investigate (queued masks count). */
export function instantReadEvil(s, target) {
  const queued = (pid, k) => (s.queued[pid] || []).some((q) => q.k === k);
  if (queued(target, 'disguise') || queued(target, 'recluseveil')) return false;
  return isEvil(s, target) || s.role[target] === 'exchange';
}

export function roleAct(s, ctx, id, target) {
  if (s.roleTarget[id] || !roleTargets(s, id).includes(target)) return false;
  s.roleTarget[id] = target;
  // Professor: learn good/evil immediately (one investigate per night, room only).
  if (s.role[id] === 'professor') {
    info(s, id, {key: 'prof', player: target, evil: instantReadEvil(s, target), instant: true});
  }
  return true;
}

/** Living actors must lock in their night pick before homework. */
export function mustPickRoleFirst(s, id) {
  if (s.dead[id] || s.phase !== 'night') return false;
  return roleTargets(s, id).length > 0 && !s.roleTarget[id];
}

/**
 * Homework / practice: the phone reports running totals of correct and wrong
 * answers for this session. Correct raises Grade (+ Knowledge if alive);
 * wrong lowers Grade by 1 each (floor 0). Dead may practice any phase, any time.
 */
export function homework(s, ctx, id, total, wrongs = 0) {
  if (s.over) return false;
  const dead = Boolean(s.dead[id]);
  if (!dead && s.phase !== 'night' && s.phase !== 'dawn') return false;
  if (!dead && mustPickRoleFirst(s, id)) return false;
  if (dead) beginGhostPractice(s, id, ctx.now);
  const speed = ctx.speed || 1;
  let cap;
  if (dead) {
    const since = (s.practiceSince && s.practiceSince[id]) || ctx.now;
    const elapsed = Math.max(0, (ctx.now - since) / 1000 / speed);
    // Steady grind for ghosts — not tied to the living night timer.
    cap = Math.ceil(elapsed * MAX_HW_PER_S) + Math.max(20, (s.practice[id] || 0) + 5);
  } else {
    const end = Math.min(ctx.now, s.deadline || ctx.now);
    const elapsed = Math.max(0, end - (s.nightStart || ctx.now - 60000)) / 1000 / speed;
    cap = Math.ceil(elapsed * MAX_HW_PER_S) + 2;
  }
  const n = Math.max(0, Math.min(Math.floor(Number(total) || 0), cap));
  const w = Math.max(0, Math.min(Math.floor(Number(wrongs) || 0), cap + 20));
  const bag = dead ? s.practice : s.hw;
  const wBag = dead ? s.practiceWrong : (s.hwWrong = s.hwWrong || {});
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
  if (s.showHwPop) {
    const room = s.room[id] || null;
    const stamp = ctx.now;
    const pops = [];
    for (let i = 0; i < delta; i += 1) {
      pops.push({key: `${stamp}+${id}-${i}`, player: id, room, n: 1});
    }
    for (let i = 0; i < wrongDelta; i += 1) {
      pops.push({key: `${stamp}-${id}-${i}`, player: id, room, n: -1});
    }
    if (pops.length) s.hwPops = [...(s.hwPops || []), ...pops].slice(-48);
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

/** Living others in `id`'s room (optional position map after moves). */
function roommatesOf(s, id, pos = s.room) {
  const room = pos[id];
  if (!room) return [];
  return alive(s).filter((p) => p !== id && pos[p] === room);
}

/** Players a spell may target right now. */
export function spellTargets(s, id, k) {
  const sp = SPELLS[k];
  if (sp.range === 'player') {
    const others = alive(s).filter((p) => p !== id);
    // Protection can cover yourself (self-ward vs Demon kills).
    if (k === 'protection') return [id, ...others];
    return others;
  }
  if (sp.range === 'roomPlayer') return roommatesOf(s, id);
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
 * passive; archetype-gated skills only for matching roles.
 */
function unownedSpells(s, id) {
  if ((s.spells[id] || []).length >= MAX_SPELLS) return [];
  const ownPassive = hasPassive(s, id);
  const role = s.role[id];
  return Object.keys(SPELLS).filter((k) => {
    if (held(s, id, k)) return false;
    const sp = SPELLS[k];
    if (ownPassive && sp.type === 'passive') return false;
    if (sp.archetypes && sp.archetypes.length && !sp.archetypes.includes(role)) return false;
    return true;
  });
}

/** Weighted sample without replacement using {@link RARITY_WEIGHT}. */
function weightedDraw(pool, n, rng) {
  const bag = [...pool];
  const out = [];
  while (out.length < n && bag.length) {
    const weights = bag.map((k) => RARITY_WEIGHT[SPELLS[k].rarity] || RARITY_WEIGHT.B);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let idx = bag.length - 1;
    for (let i = 0; i < bag.length; i += 1) {
      r -= weights[i];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    out.push(bag[idx]);
    bag.splice(idx, 1);
  }
  return out;
}

/**
 * Pay the flat spell cost and open a draw of {@link SPELL_DRAW} weighted
 * unowned spells. The player must then {@link pickSpell} one of them.
 */
export function spellCostOf(s) {
  const n = Number(s.spellCost);
  return [3, 6, 8].includes(n) ? n : SPELL_COST;
}

export function drawSpell(s, ctx, id) {
  if (s.dead[id] || !dayPhase(s) || !canLearn(s, id) || (s.offer && s.offer[id])) return false;
  const cost = spellCostOf(s);
  if (s.knowledge[id] < cost) return false;
  const pool = unownedSpells(s, id);
  if (!pool.length) return false;
  const offer = weightedDraw(pool, Math.min(SPELL_DRAW, pool.length), ctx.rng);
  s.knowledge[id] -= cost;
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
    // Ojo: lock in prey now so the King sees the name before acting.
    if (k === 'ojo') {
      const prey = pick(roommatesOf(s, id), ctx.rng);
      if (!prey) return false;
      s.ojoPrey = {...(s.ojoPrey || {}), [id]: prey};
      info(s, id, {key: 'ojo', player: prey});
      target = prey;
    }
    s.queued[id] = [...s.queued[id], {k, target: needs || k === 'ojo' ? target : null}];
    return true;
  }
  // Day spells.
  if (!dayPhase(s)) return false;
  if (k === 'loud') {
    if (s.phase !== 'vote' || !s.ballot || s.ballot.loud[id]) return false;
    s.ballot.loud[id] = true;
  } else if (k === 'hush') {
    s.hush[target] = true;
  } else if (k === 'gift') {
    if (s.knowledge[id] < GIFT_AMOUNT) return false;
    s.knowledge[id] -= GIFT_AMOUNT;
    s.knowledge[target] += GIFT_AMOUNT;
    info(s, target, {key: 'gifted', player: id, n: GIFT_AMOUNT});
  } else if (k === 'advocate') {
    const t = pick(roommatesOf(s, id), ctx.rng);
    if (!t) return false;
    s.pardon = {...(s.pardon || {}), [t]: true};
    info(s, id, {key: 'advocate', player: t});
    target = t;
  } else if (k === 'fear') {
    const t = pick(roommatesOf(s, id), ctx.rng);
    if (!t) return false;
    s.fearMark = {...(s.fearMark || {}), [id]: t};
    info(s, id, {key: 'fearMark', player: t});
    target = t;
  }
  spend(s, id, k);
  log(s, {kind: 'cast', actor: id, spell: k, target});
  return true;
}

// ------------------------------------------------------------------ night end

function noteDeath(s, id) {
  if (passive(s, id, 'banshee')) {
    spend(s, id, 'banshee');
    s.extraGhost = {...(s.extraGhost || {}), [id]: true};
  }
}

function maybeScarlet(s, deadId) {
  if (s.role[deadId] !== 'demonking') return;
  const living = alive(s);
  if (living.length < 5) return;
  const heirs = living.filter((p) => passive(s, p, 'scarlet'));
  if (!heirs.length) return;
  const heir = heirs[0];
  spend(s, heir, 'scarlet');
  s.role[heir] = 'demonking';
  s.hasLeaders = true;
  info(s, heir, {key: 'scarlet'});
}

function resolveNight(s, ctx) {
  const rng = ctx.rng;
  const pos = {...s.room};
  const looksGood = {};
  const veiled = {};
  const poisonFlip = {};
  const hallPoison = {};
  const safe = {};
  const deaths = [];
  const casts = [];
  // After round 2: Demons who could act but picked nobody are inactive (AFK).
  const idleDemons =
    s.night > 2
      ? alive(s).filter((id) => s.role[id] === 'demon' && !s.roleTarget[id] && roleTargets(s, id).length > 0)
      : [];
  for (const id of alive(s)) for (const q of s.queued[id]) casts.push({id, ...q});
  const each = (k, fn) => {
    for (const c of casts) {
      if (c.k !== k || s.dead[c.id]) continue;
      fn(c.id, c.target);
      spend(s, c.id, k);
    }
  };
  // Movement first, then masks / poison / protection, then information, then slays.
  each('step', (id, room) => {
    if (room && !s.locks[room]) pos[id] = room;
  });
  each('disguise', (id) => {
    looksGood[id] = true;
  });
  each('recluseveil', (id) => {
    veiled[id] = true;
  });
  each('poisonroom', (id) => {
    const t = pick(roommatesOf(s, id, pos), rng);
    if (t) poisonFlip[t] = true;
  });
  each('noDashii', (id) => {
    hallPoison[pos[id]] = true;
  });
  const trueEvil = (p) => isEvil(s, p);
  const appearsEvil = (p, reader) => {
    if (veiled[p]) return false;
    let evil = !looksGood[p] && (isEvil(s, p) || s.role[p] === 'exchange');
    if (poisonFlip[p]) evil = !evil;
    if (reader && hallPoison[pos[reader]] && pos[p] === pos[reader] && p !== reader) evil = !evil;
    return evil;
  };
  each('protection', (id, t) => {
    safe[t] = true;
  });
  each('nightwatch', (id) => {
    safe[id] = true;
  });
  each('allnighter', (id) => {
    safe[id] = true;
  });
  each('sanctuary', (id) => {
    const here = shuffle(roommatesOf(s, id, pos), rng);
    for (const p of [id, ...here].slice(0, 4)) safe[p] = true;
  });
  // Snapshot before slays: >10 alive → Demon roommate kill; ≤10 → kill vote.
  const cultistsKill = demonCanKill(s);
  // Professor investigate already resolved instantly on pick — do not repeat at dawn.
  each('reveal', (id) => {
    const others = roommatesOf(s, id, pos);
    if (!others.length) {
      info(s, id, {key: 'revealEmpty'});
      return;
    }
    info(s, id, {key: 'revealRoom', lines: others.map((p) => ({player: p, evil: appearsEvil(p, id)}))});
  });
  each('lantern', (id) => {
    const n = roommatesOf(s, id, pos).filter((p) => appearsEvil(p, id)).length;
    info(s, id, {key: 'lantern', room: pos[id], n});
  });
  each('chamber', (id) => {
    const t = pick(roommatesOf(s, id, pos), rng);
    if (!t) info(s, id, {key: 'alone'});
    else info(s, id, {key: 'chamber', player: t, evil: appearsEvil(t, id)});
  });
  each('philosopher', (id) => {
    const t = pick(roommatesOf(s, id, pos), rng);
    if (!t) info(s, id, {key: 'alone'});
    else info(s, id, {key: 'prof', player: t, evil: appearsEvil(t, id)});
  });
  each('drunk', (id) => {
    const t = pick(roommatesOf(s, id, pos), rng);
    if (!t) info(s, id, {key: 'alone'});
    else info(s, id, {key: 'drunk', player: t, evil: trueEvil(t)});
  });
  each('fortune', (id) => {
    const others = roommatesOf(s, id, pos);
    if (others.length < 2) {
      info(s, id, {key: 'fortuneNeed'});
      return;
    }
    const pair = shuffle(others, rng).slice(0, 2);
    const yes = pair.some((p) => s.role[p] === 'demon');
    info(s, id, {key: 'fortune', a: pair[0], b: pair[1], yes});
  });
  each('washer', (id) => {
    const others = roommatesOf(s, id, pos);
    const demons = others.filter((p) => s.role[p] === 'demon');
    if (!demons.length) {
      info(s, id, {key: 'washerNone'});
      return;
    }
    const demon = pick(demons, rng);
    const decoyPool = others.filter((p) => p !== demon);
    const decoy = decoyPool.length ? pick(decoyPool, rng) : demon;
    const names = shuffle([demon, decoy], rng);
    info(s, id, {key: 'washer', a: names[0], b: names[1]});
  });
  // Slays.
  // Night-slay only. Day expulsion is a separate path (Devil’s Pardon / vote) — never uses `slay`.
  const slay = (t, by, {king = false} = {}) => {
    if (s.dead[t] || safe[t]) return false;
    // Demons are protected from Demon King night-slays (no evil teamkill).
    if (king && s.role[t] === 'demon') {
      info(s, t, {key: 'cultGuard'});
      if (by) info(s, by, {key: 'cultGuardKing', player: t});
      return false;
    }
    if (king && passive(s, t, 'soldier')) {
      spend(s, t, 'soldier');
      info(s, t, {key: 'soldier'});
      return false;
    }
    // Dorm Armor: first non–Demon King night-slay (cultist roommate kill, Ignition, …).
    if (!king && passive(s, t, 'dormplate')) {
      spend(s, t, 'dormplate');
      info(s, t, {key: 'dormplate'});
      return false;
    }
    // Stone Skin: first night-slay while alone in the room.
    if (passive(s, t, 'golemhide') && roommatesOf(s, t, pos).length === 0) {
      spend(s, t, 'golemhide');
      info(s, t, {key: 'golemhide'});
      return false;
    }
    if (passive(s, t, 'secondwind')) {
      spend(s, t, 'secondwind');
      info(s, t, {key: 'secondwind'});
      return false;
    }
    if (passive(s, t, 'raven') && by) {
      spend(s, t, 'raven');
      const names = roommatesOf(s, by, pos).filter((p) => p !== t);
      info(s, t, {key: 'raven', lines: names.map((p) => ({player: p}))});
    }
    s.dead[t] = true;
    beginGhostPractice(s, t, ctx.now);
    deaths.push(t);
    noteDeath(s, t);
    log(s, {kind: 'slain', target: t, by});
    maybeScarlet(s, t);
    return true;
  };
  if (s.night > 1) {
    for (const id of alive(s)) {
      const t = s.roleTarget[id];
      if (s.role[id] !== 'demonking' || !t) continue;
      // Locks never stop the King — they can slay anyone instantly.
      slay(t, id, {king: true});
    }
  }
  // Demons (cultists):
  // >10 alive → roommate kill.
  // ≤10 with no King → their vote is the kill (any living target).
  // ≤10 with a King → vote only (King executes; shown live on King's phone).
  if (cultistsKill || !s.hasLeaders) {
    for (const id of alive(s)) {
      const t = s.roleTarget[id];
      if (s.role[id] !== 'demon' || !t || s.dead[t]) continue;
      if (cultistsKill && pos[t] !== pos[id]) continue;
      slay(t, id);
    }
  }
  each('ignition', (id, t) => {
    if (pos[t] === pos[id]) slay(t, id);
  });
  each('knight', (id, t) => {
    if (pos[t] !== pos[id]) return;
    if (s.role[t] === 'demon') slay(t, id);
    else slay(id, id);
  });
  each('exorcist', (id) => {
    const t = pick(roommatesOf(s, id, pos), rng);
    if (t && s.role[t] === 'demon') slay(t, id);
  });
  each('ojo', () => {});
  // Inactive Demon → pass role to a living Student (after the second round).
  for (const id of idleDemons) {
    if (s.dead[id] || s.role[id] !== 'demon') continue;
    const pool = alive(s).filter((p) => p !== id && s.role[p] === 'student');
    const fallback = alive(s).filter((p) => p !== id && !isEvil(s, p));
    const heir = pick(pool.length ? pool : fallback, rng);
    if (!heir) continue;
    s.role[id] = 'student';
    s.role[heir] = 'demon';
    s.cultHeirOf = {...(s.cultHeirOf || {}), [heir]: s.night};
    info(s, id, {key: 'cultAway', player: heir});
    info(s, heir, {key: 'cultHeir', player: id});
    log(s, {kind: 'cultTransfer', from: id, to: heir});
    cue(s, 'cultTransfer', {from: ctx.seatOf(id), to: ctx.seatOf(heir)});
  }
  for (const id of s.seats) s.queued[id] = [];
  s.ojoPrey = {};
  s.room = pos;
  s.deaths = deaths;
}


function dawn(s, ctx) {
  resolveNight(s, ctx);
  // Flower Watch: did a Demon King vote yes yesterday?
  for (const id of alive(s)) if (passive(s, id, 'flower') && s.day > 0) info(s, id, {key: 'flower', yes: Boolean(s.leaderVotedYes)});
  s.phase = 'dawn';
  // Extra beat time when several night kills need host card animations.
  const dawnExtra = Math.max(0, (s.deaths.length - 2) * 1.5);
  s.deadline = ctx.now + duration(ctx, DAWN_S + dawnExtra);
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
  s.pardon = {};
  s.fearMark = {};
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

/** Dead players keep one ghost vote (Banshee: one extra). Hushed sit this out. */
export const canVoteYes = (s, id) => !s.hush[id] && (!s.dead[id] || !s.ghost[id] || Boolean(s.extraGhost && s.extraGhost[id]));

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
    const vote = b.picks[id];
    if (!vote || vote === 'none' || scores[vote] == null) continue;
    if (s.hush[id]) continue;
    if (s.dead[id] && s.ghost[id] && !(s.extraGhost && s.extraGhost[id])) continue;
    const weight = b.loud[id] && !s.dead[id] ? 2 : 1;
    scores[vote] += weight;
    voters[vote].push(id);
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
    const vote = b.picks[id];
    if (!vote || vote === 'none') continue;
    if (s.hush[id]) continue;
    if (s.dead[id] && s.ghost[id] && !(s.extraGhost && s.extraGhost[id])) continue;
    if (s.dead[id]) {
      if (s.ghost[id] && s.extraGhost && s.extraGhost[id]) {
        const next = {...s.extraGhost};
        delete next[id];
        s.extraGhost = next;
      } else {
        s.ghost[id] = true;
      }
    }
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
  let expelled = null;
  if (s.block && s.block.id) {
    let id = s.block.id;
    if (s.pardon && s.pardon[id]) {
      cue(s, 'no_expel');
      info(s, id, {key: 'pardoned'});
    } else {
      // Fall Guy: first Demon King expulsion kills the godfather instead.
      if (s.role[id] === 'demonking') {
        const gf = alive(s).find((p) => p !== id && passive(s, p, 'godfather'));
        if (gf) {
          spend(s, gf, 'godfather');
          info(s, gf, {key: 'godfather'});
          info(s, id, {key: 'godfatherSave'});
          id = gf;
        }
      }
      expelled = id;
      s.expelled = id;
      s.dead[id] = true;
      beginGhostPractice(s, id, ctx.now);
      noteDeath(s, id);
      cue(s, 'expelled', {seat: ctx.seatOf(id)});
      log(s, {kind: 'expelled', target: id});
      maybeScarlet(s, id);
      checkWin(s);
    }
  } else {
    cue(s, 'no_expel');
  }
  // Fear Mark: if marked roommate was not expelled, learn their side.
  for (const [caster, mark] of Object.entries(s.fearMark || {})) {
    if (s.dead[caster] || !mark || mark === expelled || s.dead[mark]) continue;
    info(s, caster, {key: 'fear', player: mark, evil: isEvil(s, mark)});
  }
  s.fearMark = {};
  s.pardon = {};
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
