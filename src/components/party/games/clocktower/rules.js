/**
 * Blood on the Clocktower with the big screen as Storyteller, so every
 * ability resolves automatically. Characters live in ./roles.js.
 *
 * Night: every phone with a choice picks at the same time. When all have
 * chosen (or the clock runs out), the choices resolve in the official order
 * (drunk and poison first, then protection, then kills), the night's dead get
 * any last wish (Ravenkeeper, Moonchild, Klutz), and then every phone reads
 * its information at once. Conflicts never depend on who tapped first.
 *
 * Setup: 5–15 seats use the standard table; bigger games keep about a quarter
 * of the seats evil and add a Demon per 15 players (up to 4). With more than
 * one Demon, evil also wins once it is at least half of the living players.
 * Script "tb" is Trouble Brewing (characters may repeat in big games); "all"
 * uses every character in roles.js, repeating only when they run out.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';
import {DIFFICULTY, EDITIONS, ROLES, TEAMS, WHEN, editionOf, wikiUrl} from './roles';

export {DIFFICULTY, EDITIONS, ROLES, TEAMS, WHEN, editionOf, wikiUrl};

const KEYS = Object.keys(ROLES);
const team = (k) => ROLES[k].team;
export const isEvilRole = (k) => team(k) === 'minion' || team(k) === 'demon';
export const isDemonRole = (k) => team(k) === 'demon';

const SETUP = {
  5: [3, 0, 1], 6: [3, 1, 1], 7: [5, 0, 1], 8: [5, 1, 1], 9: [5, 2, 1], 10: [7, 0, 2], 11: [7, 1, 2],
  12: [7, 2, 2], 13: [9, 0, 3], 14: [9, 1, 3], 15: [9, 2, 3],
};

/** How many of each character type a game of n seats starts with (before the Baron). */
export function counts(n) {
  if (SETUP[n]) {
    const [townsfolk, outsider, minion] = SETUP[n];
    return {townsfolk, outsider, minion, demon: 1};
  }
  const demon = Math.min(4, Math.max(1, Math.round(n / 15)));
  const evil = Math.round(n / 4);
  const outsider = Math.round((n - evil) * 0.15);
  return {townsfolk: n - evil - outsider, outsider, minion: evil - demon, demon};
}

/**
 * The role packs in play. A difficulty preset picks packs; "custom" uses the
 * host's own pack choice; "auto" grows with the class: Beginner up to 15
 * seats, Advanced up to 30, then Expert (big games need many characters).
 */
export function packsFor(settings, n) {
  const d = settings.difficulty || 'auto';
  if (d === 'custom' && Array.isArray(settings.packs) && settings.packs.length) return settings.packs;
  if (DIFFICULTY[d]) return DIFFICULTY[d].packs;
  return DIFFICULTY[n <= 15 ? 'beginner' : n <= 30 ? 'advanced' : 'expert'].packs;
}
/** Characters in these packs (Trouble Brewing fills any team a custom choice leaves empty). */
export function scriptKeys(packs) {
  const keys = KEYS.filter((k) => packs.includes(editionOf(k)));
  for (const t of ['townsfolk', 'outsider', 'minion', 'demon']) if (!keys.some((k) => team(k) === t)) keys.push(...KEYS.filter((k) => team(k) === t && ROLES[k].tb));
  return keys;
}

/** How many characters each player may choose between at the reveal (1 = no choice). */
export function choicesFor(settings, n) {
  const v = settings.variants || 'auto';
  if (v === 'off') return 1;
  if (v === 2 || v === 3) return v;
  return n <= 12 ? 3 : n <= 30 ? 2 : 1;
}

/** Evil characters whose setup effect is already built into the seating or counts: never swapped. */
const FIXED = ['baron', 'godfather', 'xaan', 'summoner', 'kazali', 'legion', 'lordoftyphon', 'fanggu', 'vigormortis', 'riot', 'leviathan', 'lilmonsta', 'marionette', 'drunk'];

const CHOOSE_S = 45;
const FOLLOW_S = 25;
const INFO_S = 25;
const ROLES_S = 30;
const DAWN_S = 7;
const DEFENSE_S = 20;
const VOTE_S = 15;
const EXEC_S = 7;
const LASTWORD_S = 25;
const TINKER_CHANCE = 0.12;

/** Never handed out twice: their setup effect or win condition only makes sense once. */
const NO_REPEAT = ['baron', 'heretic', 'mastermind', 'drunk', 'king', 'choirboy', 'poppygrower', 'magician', 'marionette', 'summoner', 'boffin', 'xaan', 'vizier', 'eviltwin', 'organgrinder', 'mezepheles', 'goblin', 'boomdandy', 'legion', 'lilmonsta', 'leviathan', 'riot', 'kazali', 'lordoftyphon', 'yaggababble'];

/** Minions whose setup effect a Kazali can't reproduce when it picks Minions at night. */
const SETUP_MINIONS = ['baron', 'godfather', 'xaan', 'summoner', 'marionette', 'boffin', 'eviltwin', 'mezepheles', 'vizier'];

/** Secret phrases for the Yaggababble. */
const PHRASES = [
  {en: 'to be honest', zh: '说实话'}, {en: 'I have a feeling', zh: '我有种感觉'}, {en: 'think about it', zh: '想一想'},
  {en: 'no way', zh: '不可能'}, {en: 'trust me', zh: '相信我'}, {en: 'good point', zh: '有道理'},
];

/** Good abilities a Boffin can lend a Demon (ones that work without a night choice). */
const BOFFIN_GIFTS = ['soldier', 'fool', 'slayer', 'mayor', 'sage', 'virgin'];

/** Secret words for the Mezepheles. */
const WORDS = [
  {en: 'lantern', zh: '灯笼'}, {en: 'river', zh: '河流'}, {en: 'pepper', zh: '胡椒'}, {en: 'violin', zh: '小提琴'},
  {en: 'thunder', zh: '雷声'}, {en: 'garden', zh: '花园'}, {en: 'mirror', zh: '镜子'}, {en: 'honey', zh: '蜂蜜'},
];

/** Kills resolve in this order, after drunk, poison and protection (see resolveNight). */
const KILL_ORDER = ['gambler', 'acrobat', 'imp', 'pukka', 'nodashii', 'shabaloth', 'alhadikhia', 'fanggu', 'kazali', 'lilmonsta', 'lleech', 'lordoftyphon', 'ojo', 'po', 'vigormortis', 'vortox', 'zombuul', 'godfather', 'wizard', 'assassin'];

export const alive = (s) => s.seats.filter((id) => !s.dead[id]);
/** The character a seat believes it has (the Drunk thinks it is a Townsfolk). */
export const shownRole = (s, id) => (s.role[id] === 'drunk' || s.role[id] === 'marionette' ? s.drunkAs[id] : s.role[id]);
const rnd = (list, rng) => list[Math.floor(rng() * list.length)];
const seatIndex = (s, id) => s.seats.indexOf(id);

// ------------------------------------------------------------------ setup

function draw(pool, count, rng, taken) {
  const out = [];
  let bag = [];
  while (out.length < count) {
    if (!bag.length) {
      const fresh = pool.filter((k) => !taken.includes(k) && !out.includes(k));
      bag = shuffle(fresh.length ? fresh : pool.filter((k) => !NO_REPEAT.includes(k)), rng);
      if (!bag.length) break;
    }
    const k = bag.pop();
    if (NO_REPEAT.includes(k) && (out.includes(k) || taken.includes(k))) continue;
    out.push(k);
  }
  return out;
}

export function setupClocktower(seats, settings, ctx) {
  const rng = ctx.rng;
  const n = seats.length;
  const script = packsFor(settings, n);
  const pool = scriptKeys(script);
  const of = (t) => pool.filter((k) => team(k) === t);
  const c = counts(n);
  const minions = draw(of('minion'), c.minion, rng, []);
  // The Summoner starts the game with one Demon fewer (none in small games).
  let demons = draw(of('demon'), c.demon - (minions.includes('summoner') ? 1 : 0), rng, []);
  let tf = c.townsfolk;
  let out = c.outsider;
  let kazaliMinions = [];
  let monsta = false;
  if (demons.includes('legion')) {
    // Legion: the usual split reversed, every evil seat is Legion.
    const good = Math.max(2, c.minion + c.demon);
    demons = Array(n - good).fill('legion');
    minions.length = 0;
    out = Math.round(good * 0.15);
  } else {
    // Lil' Monsta is not a player: its seat becomes one more Minion.
    if (demons.includes('lilmonsta')) {
      demons.splice(demons.indexOf('lilmonsta'), 1);
      monsta = true;
      minions.push(...draw(of('minion').filter((k) => !minions.includes(k) && k !== 'summoner'), 1, rng, []));
    }
    // Lord of Typhon: one more Minion.
    if (demons.includes('lordoftyphon')) minions.push(...draw(of('minion').filter((k) => !minions.includes(k) && k !== 'summoner'), 1, rng, []));
    // Kazali: Minion seats start as good players; the Kazali picks who turns on night 1.
    if (demons.includes('kazali')) {
      kazaliMinions = draw(of('minion').filter((k) => !SETUP_MINIONS.includes(k)), minions.length, rng, []);
      minions.length = 0;
    }
    if (demons.includes('fanggu')) out += 1;
    if (demons.includes('vigormortis')) out = Math.max(0, out - 1);
  }
  if (minions.includes('baron')) {
    tf -= 2;
    out += 2;
  }
  if (minions.includes('godfather') && tf > 1) {
    tf -= 1;
    out += 1;
  }
  // Xaan: there are X Outsiders and night X poisons every Townsfolk (X ≥ 1).
  if (minions.includes('xaan') && out < 1) {
    tf -= 1;
    out = 1;
  }
  const outsiders = draw(of('outsider'), Math.min(out, n), rng, []);
  tf = n - demons.length - minions.length - outsiders.length;
  const townsfolk = draw(of('townsfolk'), tf, rng, []);
  // The Choirboy only works with a King in play.
  const cb = townsfolk.indexOf('choirboy');
  if (cb >= 0 && !townsfolk.includes('king')) townsfolk[cb] = 'king';

  let roles = shuffle([...townsfolk, ...outsiders, ...minions, ...demons], rng);
  // Lord of Typhon: every evil character in one line, the Lord in the middle (a Marionette next to it).
  if (roles.includes('lordoftyphon')) {
    const goodRoles = roles.filter((k) => !isEvilRole(k));
    const others = shuffle(roles.filter((k) => isEvilRole(k) && k !== 'lordoftyphon'), rng).sort((a, b) => (a === 'marionette') - (b === 'marionette'));
    const mid = Math.ceil(others.length / 2);
    const line = [...others.slice(0, mid), 'lordoftyphon', ...others.slice(mid)];
    const at = Math.floor(rng() * (goodRoles.length + 1));
    roles = [...goodRoles.slice(0, at), ...line, ...goodRoles.slice(at)];
  }
  // The Marionette sits next to a Demon.
  const mi = roles.indexOf('marionette');
  const di = roles.findIndex(isDemonRole);
  if (mi >= 0 && di >= 0 && !roles.includes('lordoftyphon')) {
    const next = (di + 1) % roles.length;
    [roles[mi], roles[next]] = [roles[next], roles[mi]];
  }
  const role = Object.fromEntries(seats.map((id, i) => [id, roles[i]]));
  const inPlay = new Set(roles);
  const s = {
    seats,
    script,
    pool,
    role,
    startRole: {...role},
    evil: Object.fromEntries(seats.map((id) => [id, isEvilRole(role[id])])),
    multiDemon: demons.length > 1,
    dead: {},
    ghostVote: {},
    night: 0,
    day: 0,
    dayS: Number(settings.dayMinutes || 4) * 60,
    chooseS: Number(settings.nightSeconds || CHOOSE_S),
    info: {},
    news: {},
    ready: {},
    log: [],
    cues: [],
    used: {},
    drunkAs: {},
    redHerring: {},
    bluffs: {},
    perm: {},
    temp: {},
    longDrunk: {},
    preached: {},
    grandchild: {},
    lastPick: {},
    pukka: {},
    balloon: {},
    master: {},
    banshee: {},
    nominations: {},
    tasks: {},
    boffin: {},
    kazaliMinions,
    lilmonsta: monsta,
    legion: demons.includes('legion'),
    lleechHost: {},
    zombuulAlive: {},
    vigor: {},
    vigorPoison: {},
    poCharged: {},
    yagg: {},
    monstaRole: {},
    goodExecuted: 0,
    twin: {},
    fear: {},
    goblinClaim: {},
  };
  const spareTf = shuffle(of('townsfolk').filter((k) => !inPlay.has(k)), rng);
  for (const id of seats) {
    if (role[id] === 'drunk' || role[id] === 'marionette') s.drunkAs[id] = spareTf.shift() || rnd(of('townsfolk'), rng);
  }
  s.choiceSize = choicesFor(settings, n);
  s.choices = offerChoices(s, ctx, s.choiceSize, new Set([...inPlay, ...Object.values(s.drunkAs), ...kazaliMinions]));
  s.phase = 'roles';
  s.deadline = ctx.now + duration(ctx, ROLES_S + Math.min(30, n) + (s.choiceSize > 1 ? 20 : 0));
  cue(s, 'welcome');
  return s;
}

/**
 * Roguelike pick: each player sees their dealt character plus a few others of
 * the same type that nobody else holds or is offered, and keeps one. Setup
 * characters (FIXED) are never swapped; the Drunk/Marionette choose among
 * Townsfolk, which changes only what they think they are.
 */
function offerChoices(s, ctx, size, used) {
  const offers = {};
  if (size > 1) {
    const taken = new Set(used);
    for (const id of shuffle(s.seats, ctx.rng)) {
      const dealt = shownRole(s, id);
      if (FIXED.includes(s.role[id]) && s.role[id] !== 'drunk' && s.role[id] !== 'marionette') continue;
      const t = team(dealt);
      const extra = shuffle(s.pool.filter((k) => team(k) === t && !taken.has(k) && !FIXED.includes(k) && !NO_REPEAT.includes(k)), ctx.rng).slice(0, size - 1);
      for (const k of extra) taken.add(k);
      if (extra.length) offers[id] = shuffle([dealt, ...extra], ctx.rng);
    }
  }
  return offers;
}

/** A player keeps one of their offered characters. */
function choose(s, id, pick) {
  const list = s.choices[id];
  if (!list || !list.includes(pick)) return;
  if (s.role[id] === 'drunk' || s.role[id] === 'marionette') s.drunkAs[id] = pick;
  else s.role[id] = pick;
}

/** After the reveal (and any choices): bluffs, red herrings and start-of-game knowledge. */
function finalizeSetup(s, ctx) {
  const rng = ctx.rng;
  const {seats, role, pool} = s;
  s.startRole = {...role};
  const inPlay = new Set(Object.values(role));
  // Characters someone was offered but didn't keep are known not to be in play: never bluffs.
  const offered = new Set(seats.flatMap((id) => s.choices[id] || []));
  // Each Demon gets 3 good characters that are not in play to bluff.
  const spareGood = shuffle(pool.filter((k) => !isEvilRole(k) && !inPlay.has(k) && !offered.has(k) && k !== 'drunk' && !Object.values(s.drunkAs).includes(k)), rng);
  for (const id of seats) if (isDemonRole(role[id])) s.bluffs[id] = spareGood.splice(0, 3);
  // The Snitch gives every Minion 3 bluffs too.
  if (inPlay.has('snitch')) for (const id of seats) if (team(role[id]) === 'minion') s.bluffs[id] = spareGood.splice(0, 3);
  for (const id of seats) if (role[id] === 'summoner') s.bluffs[id] = spareGood.splice(0, 3);
  setupMinions(s, ctx, inPlay);
  setupDemons(s, ctx);
  const good = seats.filter((id) => !s.evil[id]);
  for (const id of seats) if (shownRole(s, id) === 'fortuneteller') s.redHerring[id] = rnd(good, rng);
  s.poppyHidden = seats.some((id) => role[id] === 'poppygrower');
  if (s.vizier) cue(s, 'vizier', {seat: ctx.seatOf(s.vizier)});
  if (seats.some((p) => role[p] === 'leviathan')) cue(s, 'leviathan');
}

/** Demons with start-of-game knowledge or a babysitter. */
function setupDemons(s, ctx) {
  for (const id of s.seats) if (s.role[id] === 'yaggababble') news(s, id, {key: 'phrase', word: rnd(PHRASES, ctx.rng)});
  // Lil' Monsta: dealt to nobody; a Minion babysits it (and "is the Demon").
  if (s.lilmonsta) passMonsta(s, ctx);
}

/** Lil' Monsta moves to a living Minion (maybe the same one). Babysitting replaces their own ability. */
function passMonsta(s, ctx) {
  const holder = s.seats.find((p) => s.role[p] === 'lilmonsta' && !s.dead[p]);
  const sitters = alive(s).filter((p) => s.evil[p] && (p === holder || (team(s.role[p]) === 'minion' && s.role[p] !== 'marionette')));
  if (!sitters.length) return;
  const next = rnd(sitters, ctx.rng);
  if (next === holder) return;
  if (holder) s.role[holder] = s.monstaRole[holder] || s.startRole[holder];
  s.monstaRole[next] = s.role[next];
  s.role[next] = 'lilmonsta';
  news(s, next, {key: 'babysit'});
}

/** Start-of-game knowledge for Minions that change the setup (told on night 1). */
function setupMinions(s, ctx, inPlay) {
  const rng = ctx.rng;
  const good = s.seats.filter((id) => !s.evil[id]);
  const demons = s.seats.filter((id) => isDemonRole(s.role[id]));
  for (const id of s.seats) {
    const r = s.role[id];
    if (r === 'boffin' && demons.length) {
      const gift = rnd(BOFFIN_GIFTS.filter((k) => !inPlay.has(k)), rng);
      const demon = rnd(demons, rng);
      if (gift) {
        s.boffin[demon] = gift;
        news(s, id, {key: 'boffin', player: demon, role: gift});
        news(s, demon, {key: 'boffin', player: demon, role: gift});
      }
    }
    if (r === 'eviltwin' && good.length) {
      const twin = rnd(good, rng);
      s.twin[id] = twin;
      news(s, id, {key: 'twin', player: twin, role: s.role[twin]});
      news(s, twin, {key: 'twin', player: id, role: 'eviltwin'});
    }
    if (r === 'mezepheles') news(s, id, {key: 'word', word: rnd(WORDS, rng)});
    if (r === 'vizier') s.vizier = id;
    if (r === 'xaan') s.xaanNight = Math.max(1, s.seats.filter((p) => team(s.role[p]) === 'outsider').length);
  }
}

/** What an evil player knows about their team: other Demons, Minions and their bluffs. */
export function evilInfo(s, id) {
  if (!s.evil[id] || s.role[id] === 'marionette') return null;
  const me = s.role[id];
  const bluffs = s.bluffs[id] || null;
  if (s.poppyHidden) return {demons: [], minions: [], bluffs, hidden: true};
  const magician = s.seats.filter((p) => s.role[p] === 'magician');
  const demons = s.seats.filter((p) => p !== id && s.evil[p] && isDemonRole(s.role[p]));
  const minions = s.seats.filter((p) => p !== id && s.evil[p] && team(s.role[p]) === 'minion' && (isDemonRole(me) || s.role[p] !== 'marionette'));
  // The Magician looks like a Minion to the Demons and like a Demon to the Minions.
  const bySeat = (list) => list.sort((a, b) => seatIndex(s, a) - seatIndex(s, b));
  if (isDemonRole(me)) return {demons, minions: bySeat([...minions, ...magician]), bluffs};
  return {demons: bySeat([...demons, ...magician]), minions, bluffs};
}

export function markReady(s, ctx, id, pick) {
  if (s.phase !== 'roles') return false;
  if (pick) choose(s, id, pick);
  s.ready[id] = true;
  if (s.seats.every((p) => s.ready[p])) startNight(s, ctx);
  return true;
}

// ------------------------------------------------------------------ drunk, poison, protection

function livingNeighbours(s, id) {
  const n = s.seats.length;
  const i = seatIndex(s, id);
  const out = [];
  for (const step of [-1, 1]) {
    for (let k = 1; k < n; k++) {
      const p = s.seats[(((i + step * k) % n) + n) % n];
      if (p === id) break;
      if (!s.dead[p]) {
        out.push(p);
        break;
      }
    }
  }
  return [...new Set(out)];
}

/** The No Dashii poisons the nearest living Townsfolk on each side. */
function noDashiiVictims(s) {
  const out = [];
  const n = s.seats.length;
  for (const d of s.seats) {
    if (s.role[d] !== 'nodashii' || s.dead[d]) continue;
    const i = seatIndex(s, d);
    for (const step of [-1, 1]) {
      for (let k = 1; k < n; k++) {
        const p = s.seats[(((i + step * k) % n) + n) % n];
        if (p === d) break;
        if (!s.dead[p] && team(s.role[p]) === 'townsfolk') {
          out.push(p);
          break;
        }
      }
    }
  }
  return out;
}

/** Drunk or poisoned: the ability silently fails or gives wrong information. */
export function impaired(s, id) {
  if (s.role[id] === 'drunk' || s.role[id] === 'marionette') return true;
  if (s.temp[id] || s.perm[id]) return true;
  if (s.longDrunk[id] && s.night < s.longDrunk[id]) return true;
  if (s.preached[id] && team(s.role[id]) === 'minion') return true;
  if (s.minstrelUntil && s.night < s.minstrelUntil && s.role[id] !== 'minstrel') return true;
  if (Object.values(s.pukka).includes(id)) return true;
  // Vigormortis: each Minion it killed poisons a Townsfolk neighbour while it lives.
  if (Object.values(s.vigorPoison).includes(id) && s.seats.some((p) => s.role[p] === 'vigormortis' && !s.dead[p])) return true;
  return noDashiiVictims(s).includes(id);
}

/** Has this ability: their own character, or one a Boffin lent their Demon. */
const has = (s, id, role) => s.role[id] === role || s.boffin[id] === role;
const works = (s, id, role) => has(s, id, role) && !s.dead[id] && !impaired(s, id);

const registersEvil = (s, ctx, id) => {
  if (s.role[id] === 'recluse') return ctx.rng() < 0.5;
  if (s.role[id] === 'spy') return ctx.rng() < 0.5;
  return Boolean(s.evil[id]);
};
const registersDemon = (s, ctx, id) => isDemonRole(s.role[id]) || (s.role[id] === 'recluse' && ctx.rng() < 0.3);

function teaLadyShield(s, id) {
  return s.seats.some((p) => {
    if (!works(s, p, 'tealady')) return false;
    const nb = livingNeighbours(s, p);
    return nb.length === 2 && nb.every((q) => !s.evil[q]) && nb.includes(id);
  });
}

function news(s, id, item) {
  s.news[id] = [...(s.news[id] || []), item];
}

// ------------------------------------------------------------------ death

/** Try to kill a player. `by.demon` is the killing Demon; `by.force` ignores protection. */
function tryKill(s, ctx, id, by = {}) {
  if (s.dead[id]) return false;
  if (!by.force) {
    if (s.safe && s.safe[id]) return false;
    if (works(s, id, 'sailor')) return false;
    if (teaLadyShield(s, id)) return false;
    if (by.demon && ((s.safeFromDemon && s.safeFromDemon[id]) || works(s, id, 'soldier'))) return false;
    if (works(s, id, 'fool') && !s.used[`fool:${id}`]) {
      s.used[`fool:${id}`] = true;
      return false;
    }
  }
  die(s, ctx, id, by);
  return true;
}

function die(s, ctx, id, by = {}) {
  if (s.dead[id] && !s.zombuulAlive[id]) return;
  const r = s.role[id];
  // Lleech: can't die while its host lives.
  if (r === 'lleech' && s.lleechHost[id] && !s.dead[s.lleechHost[id]]) return;
  // Zombuul: the first death is fake (it looks dead, but lives on).
  if (r === 'zombuul' && !s.zombuulUsed) {
    s.zombuulUsed = true;
    s.zombuulAlive[id] = true;
    s.dead[id] = true;
    if (s.phase === 'night') s.deaths.push(id);
    else s.dayDeaths = [...(s.dayDeaths || []), id];
    return;
  }
  const wasFake = Boolean(s.zombuulAlive[id]);
  delete s.zombuulAlive[id];
  const livingBefore = alive(s).length;
  const working = !impaired(s, id);
  const atNight = s.phase === 'night';
  s.dead[id] = true;
  if (wasFake) {
    // the town already saw this death
  } else if (atNight) s.deaths.push(id);
  else s.dayDeaths = [...(s.dayDeaths || []), id];

  if (by.demon) {
    for (const gm of s.seats) if (s.grandchild[gm] === id && works(s, gm, 'grandmother')) die(s, ctx, gm, {});
    if (r === 'king') for (const cb of s.seats) if (works(s, cb, 'choirboy')) news(s, cb, {key: 'choirboy', player: by.demon, role: s.role[by.demon]});
    if (has(s, id, 'sage') && working) {
      const other = rnd(s.seats.filter((p) => p !== id && p !== by.demon), ctx.rng);
      news(s, id, {key: 'sage', players: shuffle([by.demon, other], ctx.rng)});
    }
    if (r === 'banshee' && working) {
      s.banshee[id] = true;
      cue(s, 'banshee', {seat: ctx.seatOf(id)});
    }
  }
  if (r === 'farmer' && working && atNight) {
    const heir = rnd(alive(s).filter((p) => !s.evil[p] && s.role[p] !== 'farmer'), ctx.rng);
    if (heir) {
      s.role[heir] = 'farmer';
      news(s, heir, {key: 'farmer'});
    }
  }
  if (r === 'sweetheart' && working) {
    const victim = rnd(alive(s).filter((p) => !isDemonRole(s.role[p])), ctx.rng);
    if (victim) s.perm[victim] = true;
  }
  if (r === 'poppygrower' && s.poppyHidden) {
    s.poppyHidden = false;
    for (const p of s.seats) if (s.evil[p]) news(s, p, {key: 'poppy'});
  }
  if (team(r) === 'outsider' && !atNight) s.outsiderDiedToday = true;
  if (isDemonRole(r)) {
    // Star-pass (an Imp killing itself) or the Scarlet Woman: a Minion takes over.
    const minions = alive(s).filter((p) => s.evil[p] && team(s.role[p]) === 'minion');
    const sw = minions.find((p) => works(s, p, 'scarletwoman'));
    const heir = by.jump ? null : sw && livingBefore >= 5 ? sw : by.starpass ? minions[Math.floor(ctx.rng() * minions.length)] : null;
    if (heir) {
      s.role[heir] = r;
      news(s, heir, {key: 'becameDemon', role: r});
      if (s.pukka[id] !== undefined) s.pukka[heir] = s.pukka[id];
    }
    delete s.pukka[id];
  }
  // A Lleech dies with its host.
  for (const l of s.seats) if (s.lleechHost[l] === id && s.role[l] === 'lleech') die(s, ctx, l, {});
  const shown = shownRole(s, id);
  if (atNight && (shown === 'ravenkeeper' || r === 'moonchild' || r === 'klutz')) s.follow.push(id);
  if (!atNight && (r === 'moonchild' || r === 'klutz')) s.lastword = [...(s.lastword || []), id];
}

/** Fang Gu: the first Outsider it would kill becomes an evil Fang Gu, and the old one dies. */
function fangJump(s, ctx, demon, target) {
  if (!tryKill(s, ctx, target, {demon})) return;
  s.fangJumped = true;
  s.dead[target] = false;
  s.deaths = s.deaths.filter((p) => p !== target);
  s.follow = s.follow.filter((p) => p !== target);
  s.role[target] = 'fanggu';
  s.evil[target] = true;
  news(s, target, {key: 'becameDemon', role: 'fanggu'});
  die(s, ctx, demon, {jump: true});
}

/** The nearest Townsfolk clockwise or anticlockwise (whichever is closer). */
function nearestTownsfolk(s, id) {
  const n = s.seats.length;
  const i = seatIndex(s, id);
  for (let k = 1; k < n; k++) {
    for (const step of [1, -1]) {
      const p = s.seats[(((i + step * k) % n) + n) % n];
      if (team(s.role[p]) === 'townsfolk') return p;
    }
  }
  return null;
}

function demonKill(s, ctx, demon, target) {
  let victim = target;
  if (works(s, victim, 'mayor') && ctx.rng() < 0.5) {
    const others = alive(s).filter((p) => p !== victim && !s.evil[p]);
    victim = rnd(others, ctx.rng) || victim;
  }
  return tryKill(s, ctx, victim, {demon});
}

// ------------------------------------------------------------------ night tasks

/** What this seat's character does tonight: {n, from, character, optional} or {} (info only) or null. */
function nightSpec(s, id) {
  const role = shownRole(s, id);
  const spec = ROLES[role].night;
  const first = s.night === 1;
  if (role === 'godfather') return first ? {} : s.outsiderDiedToday ? {n: 1, from: 'alive'} : null;
  if (role === 'king') return first || s.seats.filter((p) => s.dead[p]).length >= alive(s).length ? {} : null;
  if (role === 'summoner') return s.night === 3 && !s.summoned ? {n: 1, from: 'alive', character: true, charFrom: 'demon'} : null;
  if (role === 'kazali') return first ? (s.kazaliMinions.length ? {n: s.kazaliMinions.length, from: 'others'} : null) : {n: 1, from: 'alive'};
  if (role === 'lleech' && first) return {n: 1, from: 'aliveOthers'};
  if (role === 'po' && !first && s.poCharged[id]) return {n: 3, from: 'alive'};
  if (role === 'zombuul' && (s.dayDeaths || []).length) return null;
  if (!spec || (first ? !spec.first : !spec.other)) return null;
  if (spec.once && s.used[`${role}:${id}`]) return null;
  if (role === 'undertaker' && !s.executedToday) return null;
  return spec;
}

/** Legal picks for a task. */
export function targetsFor(s, id, task) {
  if (!task) return [];
  let list;
  switch (task.from) {
    case 'alive':
      list = alive(s);
      break;
    case 'aliveOthers':
      list = alive(s).filter((p) => p !== id);
      break;
    case 'others':
      list = s.seats.filter((p) => p !== id);
      break;
    case 'dead':
      list = s.seats.filter((p) => s.dead[p]);
      break;
    case 'riot':
      list = alive(s).filter((p) => !s.nominated[p]);
      break;
    default:
      list = [...s.seats];
  }
  if (task.role === 'exorcist' || task.role === 'devilsadvocate') list = list.filter((p) => p !== s.lastPick[id]);
  if (task.role === 'kazali' && s.night === 1) list = list.filter((p) => !s.evil[p]);
  return list;
}

/** Characters a task may name: Gambler/Courtier any, Cerenovus good, Pit-Hag not in play, Summoner a Demon. */
export function characterOptions(s, task) {
  const from = task && task.charFrom;
  if (from === 'good') return s.pool.filter((k) => !isEvilRole(k));
  if (from === 'demon') return s.pool.filter(isDemonRole);
  if (from === 'notInPlay') {
    const inPlay = new Set(Object.values(s.role));
    return s.pool.filter((k) => !inPlay.has(k) && !['drunk', 'marionette', 'summoner'].includes(k));
  }
  return s.pool;
}

function startNight(s, ctx) {
  if (s.night === 0) finalizeSetup(s, ctx);
  s.night += 1;
  s.phase = 'night';
  s.stage = 'choose';
  s.deaths = [];
  s.follow = [];
  s.temp = {};
  s.safe = {};
  s.safeFromDemon = {};
  s.exorcised = {};
  s.advocate = null;
  s.cursed = null;
  s.woke = {};
  s.tasks = {};
  s.infoRoles = [];
  // Mezepheles: the good player who said the word turns evil tonight.
  if (s.mezTarget) {
    if (!s.evil[s.mezTarget] && !s.dead[s.mezTarget]) {
      s.evil[s.mezTarget] = true;
      news(s, s.mezTarget, {key: 'turnedEvil'});
    }
    s.mezTarget = null;
  }
  // Xaan: on night X every Townsfolk is poisoned until dusk.
  if (s.xaanNight === s.night && s.seats.some((p) => works(s, p, 'xaan'))) {
    for (const p of s.seats) if (team(s.role[p]) === 'townsfolk') s.temp[p] = true;
  }
  s.dilemma = null;
  s.riotDay = false;
  // Leviathan: when day 5 ends with it alive, evil wins.
  if (s.day >= 5 && s.seats.some((p) => works(s, p, 'leviathan'))) return win(s, 'evil', 'leviathan');
  if (s.lilmonsta && s.night > 1) passMonsta(s, ctx);
  const vigorOn = s.seats.some((p) => s.role[p] === 'vigormortis' && !s.dead[p]);
  // Who acts: the living, a "dead" Zombuul, and Minions the Vigormortis killed.
  const actors = s.seats.filter((p) => !s.dead[p] || s.zombuulAlive[p] || (vigorOn && s.vigor[p]));
  for (const id of actors) {
    const spec = nightSpec(s, id);
    if (!spec) continue;
    const role = shownRole(s, id);
    if (spec.n == null) {
      s.infoRoles.push(id);
      continue;
    }
    const task = {role, n: spec.n, from: spec.from, character: Boolean(spec.character), charFrom: spec.charFrom || null, optional: Boolean(spec.optional), done: false};
    if (targetsFor(s, id, task).length < task.n) {
      if (!task.optional) continue;
      task.n = 0;
      if (!task.character) continue;
    }
    s.tasks[id] = task;
    s.woke[id] = true;
  }
  cue(s, 'dusk');
  s.deadline = ctx.now + duration(ctx, s.chooseS || CHOOSE_S);
  if (!Object.keys(s.tasks).length) resolveNight(s, ctx);
}

/** A phone answers its night task (pick players / a character, skip, or OK after reading). */
export function nightChoice(s, ctx, id, msg = {}) {
  const inNight = ['night', 'lastword', 'boom', 'riot'].includes(s.phase);
  const task = s.tasks[id];
  if (!inNight || !task || task.done) return false;
  if (task.read) {
    task.done = true;
  } else if (msg.skip && task.optional) {
    task.done = true;
    task.skipped = true;
  } else {
    const legal = targetsFor(s, id, task);
    const picks = [...new Set((msg.targets || []).filter((t) => legal.includes(t)))];
    if (picks.length !== task.n) return false;
    if (task.character && !characterOptions(s, task).includes(msg.character)) return false;
    task.picks = picks;
    task.guess = task.character ? msg.character : null;
    task.done = true;
  }
  if (Object.values(s.tasks).every((t) => t.done)) advance(s, ctx);
  return true;
}

function advance(s, ctx) {
  if (s.phase === 'lastword') return resolveLastWord(s, ctx);
  if (s.phase === 'boom') return resolveBoom(s, ctx);
  if (s.phase === 'riot') return resolveRiot(s, ctx);
  if (s.stage === 'choose') return resolveNight(s, ctx);
  if (s.stage === 'follow') return resolveFollow(s, ctx);
  return dawn(s, ctx);
}

/** Random legal answers for phones that ran out of time. */
function autoAnswer(s, ctx) {
  for (const [id, task] of Object.entries(s.tasks)) {
    if (task.done) continue;
    if (task.dilemma) {
      task.picks = [];
      task.done = true;
      continue;
    }
    if (task.read || task.optional) {
      task.done = true;
      task.skipped = !task.read;
      continue;
    }
    task.picks = shuffle(targetsFor(s, id, task), ctx.rng).slice(0, task.n);
    task.guess = task.character ? rnd(characterOptions(s, task), ctx.rng) : null;
    task.done = true;
  }
}

function resolveNight(s, ctx) {
  const chosen = s.tasks;
  s.chosen = chosen;
  const each = (role, fn) => {
    for (const id of s.seats) {
      const t = chosen[id];
      if (t && t.role === role && !t.skipped && t.picks) fn(id, t.picks, t, !impaired(s, id));
    }
  };
  const once = (id, role) => {
    s.used[`${role}:${id}`] = true;
  };

  // Organ Grinder: a confirmed choice (no player) means "drunk tonight".
  each('organgrinder', (id) => {
    s.temp[id] = true;
  });
  each('sailor', (id, [t], _, ok) => ok && (s.temp[t] = true));
  each('courtier', (id, _, task, ok) => {
    once(id, 'courtier');
    if (ok) for (const p of s.seats) if (s.role[p] === task.guess) s.longDrunk[p] = s.night + 3;
  });
  each('innkeeper', (id, picks, _, ok) => {
    if (!ok) return;
    for (const p of picks) s.safe[p] = true;
    s.temp[rnd(picks, ctx.rng)] = true;
  });
  each('exorcist', (id, [t], _, ok) => {
    s.lastPick[id] = t;
    if (ok && isDemonRole(s.role[t])) {
      s.exorcised[t] = true;
      news(s, t, {key: 'exorcised', player: id});
    }
  });
  each('preacher', (id, [t], _, ok) => {
    if (ok && team(s.role[t]) === 'minion' && !s.preached[t]) {
      s.preached[t] = true;
      news(s, t, {key: 'preached'});
    }
  });
  each('poisoner', (id, [t], _, ok) => ok && (s.temp[t] = true));
  each('widow', (id, [t], _, ok) => {
    if (ok) s.perm[t] = true;
    news(s, id, {key: 'grimoire', grim: grimoire(s)});
    const told = rnd(s.seats.filter((p) => !s.evil[p]), ctx.rng);
    if (ok && told) news(s, told, {key: 'widow'});
  });
  each('devilsadvocate', (id, [t], _, ok) => {
    s.lastPick[id] = t;
    if (ok) s.advocate = t;
  });
  each('witch', (id, [t], _, ok) => ok && (s.cursed = t));
  each('monk', (id, [t], _, ok) => ok && (s.safeFromDemon[t] = true));
  each('snakecharmer', (id, [t], _, ok) => {
    if (!ok || !isDemonRole(s.role[t]) || s.dead[t]) return;
    const demonRole = s.role[t];
    s.role[id] = demonRole;
    s.evil[id] = true;
    s.role[t] = 'snakecharmer';
    s.evil[t] = false;
    s.perm[t] = true;
    if (s.pukka[t] !== undefined) {
      s.pukka[id] = s.pukka[t];
      delete s.pukka[t];
    }
    news(s, id, {key: 'becameDemon', role: demonRole});
    news(s, t, {key: 'charmed', role: 'snakecharmer'});
  });
  each('butler', (id, [t]) => {
    s.master[id] = t;
  });
  each('cerenovus', (id, [t], task, ok) => ok && news(s, t, {key: 'mad', role: task.guess}));
  each('harpy', (id, [a, b], _, ok) => ok && news(s, a, {key: 'harpy', player: b}));
  each('fearmonger', (id, [t], _, ok) => {
    if (!ok) return;
    if (s.fear[id] !== t) cue(s, 'fear');
    s.fear[id] = t;
  });
  each('pithag', (id, [t], task, ok) => {
    if (!ok || !task.guess || Object.values(s.role).includes(task.guess)) return;
    s.role[t] = task.guess;
    delete s.drunkAs[t];
    if (isEvilRole(task.guess)) s.evil[t] = true;
    news(s, t, {key: 'becameRole', role: task.guess});
  });
  each('summoner', (id, [t], task, ok) => {
    s.summoned = true;
    if (!ok || !task.guess) return;
    s.role[t] = task.guess;
    s.evil[t] = true;
    delete s.drunkAs[t];
    news(s, t, {key: 'becameDemon', role: task.guess});
    news(s, id, {key: 'summoned', player: t, role: task.guess});
  });
  each('nightwatchman', (id, [t], _, ok) => {
    once(id, 'nightwatchman');
    if (ok) news(s, t, {key: 'watch', player: id});
  });

  // Night 1: the Kazali turns its picks into Minions; the Lleech picks its host.
  if (s.night === 1) {
    each('kazali', (id, picks) => {
      picks.forEach((p, i) => {
        const minion = s.kazaliMinions[i];
        if (!minion) return;
        s.role[p] = minion;
        s.evil[p] = true;
        delete s.drunkAs[p];
        news(s, p, {key: 'madeMinion', role: minion, player: id});
      });
    });
    each('lleech', (id, [t]) => {
      s.lleechHost[id] = t;
      s.perm[t] = true;
    });
  }
  // Po: choosing nobody charges three kills for the next night.
  for (const [id, t] of Object.entries(chosen)) if (t.role === 'po' && s.night > 1) s.poCharged[id] = Boolean(t.skipped);

  // Kills, in order.
  if (s.moonCurse) {
    if (!s.evil[s.moonCurse]) tryKill(s, ctx, s.moonCurse, {});
    s.moonCurse = null;
  }
  for (const role of KILL_ORDER) {
    if (role === 'gambler') each('gambler', (id, [t], task, ok) => ok && s.role[t] !== task.guess && tryKill(s, ctx, id, {}));
    else if (role === 'acrobat') each('acrobat', (id, [t], _, ok) => ok && impaired(s, t) && tryKill(s, ctx, id, {}));
    else if (role === 'godfather') each('godfather', (id, [t], _, ok) => ok && tryKill(s, ctx, t, {}));
    else if (role === 'wizard')
      each('wizard', (id, [t], _, ok) => {
        once(id, 'wizard');
        if (ok && tryKill(s, ctx, t, {})) s.wish = true;
      });
    else if (role === 'assassin')
      each('assassin', (id, [t], _, ok) => {
        once(id, 'assassin');
        if (ok) tryKill(s, ctx, t, {force: true});
      });
    else
      each(role, (id, picks, task, ok) => {
        // Demons: the role may have moved (star-pass, Snake Charmer) — only a living Demon kills.
        if (!isDemonRole(s.role[id]) || (s.dead[id] && !s.zombuulAlive[id]) || s.exorcised[id] || !ok) return;
        if (role === 'pukka') {
          const prev = s.pukka[id];
          s.pukka[id] = picks[0];
          if (prev && !s.noKill) {
            delete s.pukka[id];
            demonKill(s, ctx, id, prev);
            s.pukka[id] = picks[0];
          }
          return;
        }
        if (s.night === 1 || s.noKill) return;
        if (role === 'imp' && picks[0] === id) {
          die(s, ctx, id, {demon: id, starpass: true});
          return;
        }
        if (role === 'alhadikhia') {
          // Everyone sees the three; they choose to live or die in the next step.
          s.dilemma = picks.filter((p) => !s.dead[p]);
          return;
        }
        if (role === 'ojo') {
          const holders = alive(s).filter((p) => s.role[p] === task.guess);
          const victim = holders[0] || rnd(alive(s).filter((p) => !s.evil[p]), ctx.rng);
          if (victim) demonKill(s, ctx, id, victim);
          return;
        }
        for (const t of picks) {
          if (role === 'fanggu' && !s.fangJumped && team(s.role[t]) === 'outsider' && t !== id) {
            fangJump(s, ctx, id, t);
            continue;
          }
          const wasMinion = team(s.role[t]) === 'minion';
          demonKill(s, ctx, id, t);
          if (role === 'vigormortis' && wasMinion && s.dead[t]) {
            s.vigor[t] = true;
            const near = nearestTownsfolk(s, t);
            if (near) s.vigorPoison[t] = near;
          }
        }
      });
  }
  // Legion: a good player might die each night.
  if (s.legion && s.night > 1 && !s.noKill) {
    const legion = alive(s).find((p) => works(s, p, 'legion'));
    const victim = rnd(alive(s).filter((p) => !s.evil[p]), ctx.rng);
    if (legion && victim) demonKill(s, ctx, legion, victim);
  }
  // Yaggababble: one death per time the phrase was said today.
  for (const y of s.seats) {
    if (!works(s, y, 'yaggababble') || s.noKill) continue;
    for (let i = 0; i < (s.yagg[y] || 0); i++) {
      const victim = rnd(alive(s).filter((p) => !s.evil[p]), ctx.rng);
      if (victim) demonKill(s, ctx, y, victim);
    }
  }
  if (s.night > 1) for (const id of alive(s)) if (works(s, id, 'tinker') && ctx.rng() < TINKER_CHANCE) die(s, ctx, id, {});
  each('professor', (id, [t], _, ok) => {
    once(id, 'professor');
    if (ok && s.dead[t] && team(s.role[t]) === 'townsfolk') {
      s.dead[t] = false;
      delete s.ghostVote[t];
      s.deaths = s.deaths.filter((p) => p !== t);
    }
  });
  s.noKill = false;
  log(s, {kind: 'night', n: s.night, deaths: [...s.deaths]});

  // Last wishes of tonight's dead.
  const follow = {};
  for (const id of s.follow) {
    const r = shownRole(s, id);
    follow[id] = r === 'ravenkeeper' ? {role: r, n: 1, from: 'all', done: false} : {role: s.role[id], n: 1, from: 'alive', done: false};
  }
  for (const p of s.dilemma || []) if (!s.dead[p] && !follow[p]) follow[p] = {role: 'alhadikhia', n: 0, optional: true, dilemma: true, done: false};
  if (Object.keys(follow).length) {
    s.stage = 'follow';
    s.tasks = follow;
    s.deadline = ctx.now + duration(ctx, FOLLOW_S);
    return;
  }
  infoStage(s, ctx);
}

function resolveFollow(s, ctx) {
  // Al-Hadikhia: those who chose to die, die; if all chose to live, all die.
  const dilemma = Object.entries(s.tasks).filter(([, t]) => t.dilemma);
  if (dilemma.length) {
    const allLive = dilemma.every(([, t]) => !t.skipped);
    for (const [p, t] of dilemma) if (allLive || t.skipped) die(s, ctx, p, {});
  }
  for (const [id, task] of Object.entries(s.tasks)) {
    if (task.dilemma) continue;
    const [t] = task.picks || [];
    if (!t) continue;
    const ok = !impaired(s, id);
    if (task.role === 'ravenkeeper') news(s, id, {key: 'role', player: t, role: ok ? s.role[t] : rnd(s.pool, ctx.rng)});
    if (task.role === 'moonchild' && ok && !s.evil[t]) tryKill(s, ctx, t, {});
    if (task.role === 'klutz' && ok && s.evil[t]) {
      log(s, {kind: 'klutz', actor: id, target: t});
      return win(s, 'evil', 'klutz');
    }
  }
  return infoStage(s, ctx);
}

// ------------------------------------------------------------------ information

function grimoire(s) {
  return s.seats.map((p) => [p, s.role[p]]);
}

/** The information a character learns; wrong (but plausible) when the seat is drunk or poisoned. */
function infoFor(s, ctx, id, role, task, forceLie = false) {
  const rng = ctx.rng;
  const lie = forceLie || impaired(s, id);
  const others = s.seats.filter((p) => p !== id);
  const ofTeam = (t) => s.pool.filter((k) => team(k) === t);
  const picks = (task && task.picks) || [];
  const pair = (target, shown) => ({key: 'pair', players: shuffle([target, rnd(others.filter((p) => p !== target), rng)], rng), role: shown});
  const yes = (truth) => (lie ? rng() < 0.5 : truth);
  switch (role) {
    case 'washerwoman': {
      const tf = others.filter((p) => team(s.role[p]) === 'townsfolk');
      if (lie || !tf.length) return pair(rnd(others, rng), rnd(ofTeam('townsfolk'), rng));
      const t = rnd(tf, rng);
      return pair(t, s.role[t]);
    }
    case 'librarian': {
      const os = others.filter((p) => team(s.role[p]) === 'outsider');
      if (lie) return pair(rnd(others, rng), rnd(ofTeam('outsider'), rng));
      if (!os.length) return {key: 'none'};
      const t = rnd(os, rng);
      return pair(t, s.role[t]);
    }
    case 'investigator': {
      const ms = others.filter((p) => team(s.role[p]) === 'minion' || (s.role[p] === 'recluse' && rng() < 0.5));
      if (lie || !ms.length) return pair(rnd(others, rng), rnd(ofTeam('minion'), rng));
      const t = rnd(ms, rng);
      return pair(t, team(s.role[t]) === 'minion' ? s.role[t] : rnd(ofTeam('minion'), rng));
    }
    case 'chef': {
      if (lie) return {key: 'chef', n: Math.floor(rng() * 3)};
      const n = s.seats.length;
      const ev = s.seats.map((p) => registersEvil(s, ctx, p));
      let pairs = 0;
      for (let i = 0; i < n; i++) if (ev[i] && ev[(i + 1) % n]) pairs += 1;
      return {key: 'chef', n: pairs};
    }
    case 'empath':
      return {key: 'empath', n: lie ? Math.floor(rng() * 3) : livingNeighbours(s, id).filter((p) => registersEvil(s, ctx, p)).length};
    case 'fortuneteller':
      return {key: 'ft', players: picks, yes: yes(picks.some((p) => registersDemon(s, ctx, p) || p === s.redHerring[id]))};
    case 'undertaker':
      return {key: 'undertaker', player: s.executedToday, role: lie ? rnd(s.pool, rng) : s.executedRole};
    case 'grandmother': {
      const t = rnd(others.filter((p) => !s.evil[p]), rng);
      if (!t) return null;
      s.grandchild[id] = t;
      return {key: 'grandchild', player: t, role: lie ? rnd(s.pool.filter((k) => !isEvilRole(k)), rng) : s.role[t]};
    }
    case 'clockmaker': {
      if (lie) return {key: 'clock', n: 1 + Math.floor(rng() * 3)};
      const n = s.seats.length;
      let best = 0;
      for (const d of s.seats.filter((p) => isDemonRole(s.role[p]))) {
        for (const m of s.seats.filter((p) => team(s.role[p]) === 'minion')) {
          const gap = Math.abs(seatIndex(s, d) - seatIndex(s, m));
          const dist = Math.min(gap, n - gap);
          if (!best || dist < best) best = dist;
        }
      }
      return {key: 'clock', n: best};
    }
    case 'dreamer': {
      const t = picks[0];
      const good = s.pool.filter((k) => !isEvilRole(k));
      const evil = s.pool.filter(isEvilRole);
      if (lie) return {key: 'dreamer', player: t, roles: shuffle([rnd(good, rng), rnd(evil, rng)], rng)};
      const real = s.role[t];
      const other = isEvilRole(real) ? rnd(good, rng) : rnd(evil, rng);
      return {key: 'dreamer', player: t, roles: shuffle([real, other], rng)};
    }
    case 'flowergirl':
      return {key: 'flower', yes: yes(Boolean(s.demonVoted))};
    case 'towncrier':
      return {key: 'crier', yes: yes(Boolean(s.minionNominated))};
    case 'oracle':
      return {key: 'oracle', n: lie ? Math.floor(rng() * 3) : s.seats.filter((p) => s.dead[p] && registersEvil(s, ctx, p)).length};
    case 'seamstress': {
      s.used[`seamstress:${id}`] = true;
      const [a, b] = picks;
      return {key: 'seam', players: picks, yes: yes(registersEvil(s, ctx, a) === registersEvil(s, ctx, b))};
    }
    case 'noble': {
      const evil = others.filter((p) => s.evil[p]);
      const good = shuffle(others.filter((p) => !s.evil[p]), rng);
      if (lie || !evil.length || good.length < 2) return {key: 'noble', players: shuffle(others, rng).slice(0, 3)};
      return {key: 'noble', players: shuffle([rnd(evil, rng), good[0], good[1]], rng)};
    }
    case 'balloonist': {
      const last = s.balloon[id];
      const pool = others.filter((p) => (lie ? true : team(s.role[p]) !== last));
      const t = rnd(pool.length ? pool : others, rng);
      s.balloon[id] = team(s.role[t]);
      return {key: 'balloon', player: t};
    }
    case 'shugenja': {
      const n = s.seats.length;
      const i = seatIndex(s, id);
      const stepsTo = (step) => {
        for (let k = 1; k < n; k++) if (s.evil[s.seats[(((i + step * k) % n) + n) % n]]) return k;
        return n;
      };
      const cw = stepsTo(1);
      const ccw = stepsTo(-1);
      const dir = lie ? (rng() < 0.5 ? 'cw' : 'ccw') : cw === ccw ? (rng() < 0.5 ? 'cw' : 'ccw') : cw < ccw ? 'cw' : 'ccw';
      return {key: 'shugenja', dir};
    }
    case 'king': {
      if (s.night === 1) return null;
      const t = rnd(alive(s).filter((p) => p !== id), rng);
      return t ? {key: 'role', player: t, role: lie ? rnd(s.pool, rng) : s.role[t]} : null;
    }
    case 'steward': {
      const t = rnd(others.filter((p) => (lie ? true : !s.evil[p])), rng);
      return {key: 'steward', player: t};
    }
    case 'knight': {
      const pool = shuffle(others.filter((p) => (lie ? true : !isDemonRole(s.role[p]))), rng);
      return {key: 'knight', players: pool.slice(0, 2)};
    }
    case 'villageidiot':
      return {key: 'idiot', player: picks[0], yes: yes(registersEvil(s, ctx, picks[0]))};
    case 'chambermaid':
      return {key: 'maid', players: picks, n: lie ? Math.floor(rng() * 3) : picks.filter((p) => s.woke[p]).length};
    case 'spy':
      return {key: 'grimoire', grim: grimoire(s)};
    case 'wraith':
      return {key: 'wraith', players: s.seats.filter((p) => p !== id && s.evil[p] && s.woke[p])};
    case 'godfather': {
      const outs = s.seats.filter((p) => team(s.role[p]) === 'outsider').map((p) => s.role[p]);
      return {key: 'outsiders', roles: lie ? shuffle(ofTeam('outsider'), rng).slice(0, outs.length) : outs};
    }
    default:
      return null;
  }
}

function infoStage(s, ctx) {
  s.stage = 'info';
  // Night 1: the Demons learn who the King is.
  if (s.night === 1) {
    const king = s.seats.find((p) => s.role[p] === 'king');
    if (king) for (const d of s.seats) if (isDemonRole(s.role[d])) news(s, d, {key: 'king', player: king});
  }
  const chosen = s.chosen || {};
  const vortox = s.seats.some((p) => works(s, p, 'vortox'));
  const roleInfo = [...s.infoRoles, ...Object.keys(chosen)].filter((id) => !s.dead[id]);
  // The Chambermaid counts who woke, so she reads last.
  const last = (p) => ['chambermaid', 'wraith'].includes(shownRole(s, p));
  roleInfo.sort((a, b) => last(a) - last(b));
  for (const id of roleInfo) {
    const task = chosen[id];
    if (task && task.skipped) continue;
    // A character changed tonight (Pit-Hag, Snake Charmer…): no information from the old choice.
    if (task && task.role !== shownRole(s, id)) continue;
    const spec = ROLES[shownRole(s, id)].night;
    if (!task && spec && spec.n) continue;
    let item = infoFor(s, ctx, id, shownRole(s, id), task);
    // Vortox: Townsfolk information is always false.
    if (item && vortox && team(shownRole(s, id)) === 'townsfolk') {
      const truth = JSON.stringify(item);
      for (let i = 0; i < 12; i++) {
        item = infoFor(s, ctx, id, shownRole(s, id), task, true);
        if (JSON.stringify(item) !== truth) break;
      }
    }
    if (item) {
      news(s, id, item);
      s.woke[id] = true;
    }
  }
  const tasks = {};
  for (const [id, items] of Object.entries(s.news)) {
    if (!items.length) continue;
    s.info[id] = [...(s.info[id] || []), ...items.map((x) => ({night: s.night, ...x}))];
    tasks[id] = {read: true, items, done: false};
  }
  s.news = {};
  s.tasks = tasks;
  if (s.over) return undefined;
  if (!Object.keys(tasks).length) return dawn(s, ctx);
  s.deadline = ctx.now + duration(ctx, INFO_S);
  return undefined;
}

// ------------------------------------------------------------------ day

function dawn(s, ctx) {
  if (s.over) return true;
  s.phase = 'dawn';
  s.stage = null;
  s.tasks = {};
  s.safe = {};
  s.safeFromDemon = {};
  s.deadline = ctx.now + duration(ctx, DAWN_S);
  if (s.deaths.length) {
    for (const d of s.deaths) cue(s, 'died', {seat: ctx.seatOf(d)});
    log(s, {kind: 'died', targets: [...s.deaths]});
  } else {
    cue(s, 'peaceful');
  }
  return checkWin(s, ctx);
}

function startDay(s, ctx) {
  s.day += 1;
  s.phase = 'day';
  s.executedToday = null;
  s.executedRole = null;
  s.nominated = {};
  s.nominations = {};
  s.block = null;
  s.vote = null;
  s.demonVoted = false;
  s.minionNominated = false;
  s.outsiderDiedToday = false;
  s.dayDeaths = [];
  s.lastVote = null;
  s.yagg = {};
  // Riot: on day 3 the Minions become Riot too, and every nominee dies.
  if (s.day === 3 && s.seats.some((p) => works(s, p, 'riot'))) {
    for (const p of alive(s)) {
      if (s.evil[p] && team(s.role[p]) === 'minion') {
        s.role[p] = 'riot';
        news(s, p, {key: 'becameDemon', role: 'riot'});
      }
    }
    s.riotDay = true;
  }
  s.dayLeft = duration(ctx, s.dayS + Math.min(120, s.seats.length * 2));
  s.deadline = ctx.now + s.dayLeft;
  cue(s, s.mastermindDay === 'active' ? 'mastermind' : s.riotDay ? 'riot' : 'day');
}

const bansheeOn = (s, id) => Boolean(s.banshee[id]) && !impaired(s, id);

/** May this seat nominate now? */
export function canNominate(s, id) {
  if (s.phase !== 'day') return false;
  const limit = bansheeOn(s, id) ? 2 : 1;
  if (s.dead[id] && !bansheeOn(s, id)) return false;
  if ((s.nominations[id] || 0) >= limit) return false;
  if (s.role[id] === 'golem' && s.used[`golem:${id}`]) return false;
  return true;
}

export function nominate(s, ctx, id, target) {
  if (!canNominate(s, id) || s.nominated[target] || !s.seats.includes(target)) return false;
  s.nominations[id] = (s.nominations[id] || 0) + 1;
  s.nominated[target] = true;
  s.dayLeft = Math.max(0, s.deadline - ctx.now);
  log(s, {kind: 'nominate', actor: id, target});
  if (team(s.role[id]) === 'minion') s.minionNominated = true;
  if (s.day === 1 && works(s, id, 'princess')) s.princessPick = target;
  if (s.riotDay) return riotKill(s, ctx, target);
  // Witch: the cursed player dies when they nominate (while more than 3 live).
  if (s.cursed === id && alive(s).length > 3) {
    s.cursed = null;
    die(s, ctx, id, {});
    cue(s, 'died', {seat: ctx.seatOf(id)});
    if (checkWin(s, ctx)) return true;
  }
  // Golem: one nomination per game; a non-Demon nominee dies at once.
  if (s.role[id] === 'golem') {
    s.used[`golem:${id}`] = true;
    if (!impaired(s, id) && !isDemonRole(s.role[target])) {
      die(s, ctx, target, {});
      cue(s, 'died', {seat: ctx.seatOf(target)});
      checkWin(s, ctx);
      return true;
    }
  }
  // Virgin: the first nomination by a real Townsfolk executes the nominator.
  if (has(s, target, 'virgin') && !s.used[`virgin:${target}`] && !impaired(s, target)) {
    s.used[`virgin:${target}`] = true;
    if (team(s.role[id]) === 'townsfolk') {
      cue(s, 'nominate', {seat: ctx.seatOf(target)});
      execute(s, ctx, id);
      return true;
    }
  }
  s.vote = {nominator: id, nominee: target, votes: {}};
  s.phase = 'defense';
  s.deadline = ctx.now + duration(ctx, DEFENSE_S);
  cue(s, 'nominate', {seat: ctx.seatOf(target)});
  return true;
}

/** Can this seat vote yes at all right now (dead seats need their ghost vote)? */
export const canVoteYes = (s, id) => !s.dead[id] || !s.ghostVote[id] || bansheeOn(s, id);
/** The Zealot must vote yes while 5 or more live. */
export const mustVoteYes = (s, id) => s.role[id] === 'zealot' && !s.dead[id] && alive(s).length >= 5;

export function castVote(s, ctx, id, yes) {
  if (s.phase !== 'vote' || s.vote.votes[id] != null) return false;
  const want = mustVoteYes(s, id) || yes;
  s.vote.votes[id] = want && canVoteYes(s, id) ? 'yes' : 'no';
  if (s.seats.every((p) => s.vote.votes[p] != null)) tally(s, ctx);
  return true;
}

function tally(s, ctx) {
  const v = s.vote;
  for (const id of s.seats) {
    if (v.votes[id] == null) v.votes[id] = mustVoteYes(s, id) ? 'yes' : 'no';
    // The Butler's yes only counts if their master voted yes.
    if (v.votes[id] === 'yes' && works(s, id, 'butler') && s.master[id] && v.votes[s.master[id]] !== 'yes') v.votes[id] = 'no';
  }
  let yes = 0;
  // Legion: if only evil players voted, the vote counts for nothing.
  const onlyEvil = !s.seats.some((p) => v.votes[p] === 'yes' && !s.evil[p]);
  const legionBlock = onlyEvil && s.seats.some((p) => works(s, p, 'legion'));
  for (const id of s.seats) {
    if (v.votes[id] !== 'yes' || legionBlock) continue;
    yes += bansheeOn(s, id) ? 2 : 1;
    if (isDemonRole(s.role[id])) s.demonVoted = true;
    if (s.dead[id] && !bansheeOn(s, id)) s.ghostVote[id] = true; // ghost vote spent
  }
  const need = Math.ceil(alive(s).length / 2);
  v.yes = yes;
  if (yes >= need) {
    if (!s.block || yes > s.block.yes) s.block = {id: v.nominee, yes, by: v.nominator};
    else if (yes === s.block.yes) s.block = {id: null, yes};
  }
  // The Vizier may execute at once if any good player voted yes.
  v.goodYes = s.seats.some((p) => v.votes[p] === 'yes' && !s.evil[p]);
  log(s, {kind: 'voted', target: v.nominee, n: yes});
  s.lastVote = v;
  s.vote = null;
  s.phase = 'day';
  s.deadline = ctx.now + Math.max(duration(ctx, 10), s.dayLeft);
}

export function slay(s, ctx, id, target) {
  if ((s.phase !== 'day' && s.phase !== 'defense') || (shownRole(s, id) !== 'slayer' && s.boffin[id] !== 'slayer') || s.used[`slayer:${id}`] || s.dead[id] || s.dead[target]) return false;
  s.used[`slayer:${id}`] = true;
  log(s, {kind: 'slay', actor: id, target});
  if (works(s, id, 'slayer') && registersDemon(s, ctx, target)) {
    die(s, ctx, target, {});
    cue(s, 'demon_dies');
  } else {
    cue(s, 'slayer_miss');
  }
  checkWin(s, ctx);
  return true;
}

function execute(s, ctx, id, by = null) {
  s.executedToday = id;
  s.executedRole = s.role[id];
  log(s, {kind: 'executed', target: id});
  const r = s.role[id];
  // Leviathan: a second good execution hands evil the game.
  if (!s.evil[id] && s.seats.some((p) => works(s, p, 'leviathan'))) {
    s.goodExecuted += 1;
    if (s.goodExecuted > 1) {
      cue(s, 'executed', {seat: ctx.seatOf(id)});
      s.dead[id] = true;
      return win(s, 'evil', 'leviathan');
    }
  }
  if (s.mastermindDay === 'active') {
    cue(s, 'executed', {seat: ctx.seatOf(id)});
    s.dead[id] = true;
    return win(s, s.evil[id] ? 'good' : 'evil', 'mastermind');
  }
  // Devil's Advocate: tonight's pick survives execution.
  if (s.advocate === id) {
    cue(s, 'survived', {seat: ctx.seatOf(id)});
    return afterDeaths(s, ctx);
  }
  // Vizier: can't die by day.
  if (works(s, id, 'vizier')) {
    cue(s, 'survived', {seat: ctx.seatOf(id)});
    return afterDeaths(s, ctx);
  }
  // Psychopath: survives unless they lose rock-paper-scissors to the nominator.
  if (works(s, id, 'psychopath') && by) {
    if (ctx.rng() < 0.5) {
      cue(s, 'roshambo_win', {seat: ctx.seatOf(id)});
      return afterDeaths(s, ctx);
    }
    cue(s, 'roshambo_lose', {seat: ctx.seatOf(id)});
  }
  cue(s, 'executed', {seat: ctx.seatOf(id)});
  if (works(s, id, 'saint')) {
    s.dead[id] = true;
    return win(s, 'evil', 'saint');
  }
  // Evil Twin: executing the good twin hands evil the game.
  if (s.seats.some((t) => s.twin[t] === id && works(s, t, 'eviltwin'))) {
    s.dead[id] = true;
    return win(s, 'evil', 'twin');
  }
  // Fearmonger: their chosen player, nominated by them and executed, loses for their team.
  if (by && works(s, by, 'fearmonger') && s.fear[by] === id) {
    s.dead[id] = true;
    return win(s, s.evil[id] ? 'good' : 'evil', 'fearmonger');
  }
  // Goblin: claimed when nominated today and executed: evil wins.
  if (works(s, id, 'goblin') && s.goblinClaim[id] === s.day) {
    s.dead[id] = true;
    return win(s, 'evil', 'goblin');
  }
  // Boomdandy: all but 3 die, then the 3 point at someone.
  if (works(s, id, 'boomdandy')) {
    s.dead[id] = true;
    return boom(s, ctx);
  }
  const minion = team(r) === 'minion';
  die(s, ctx, id, {});
  if (!s.dead[id] || s.zombuulAlive[id]) log(s, {kind: 'survived', target: id});
  if (minion && s.seats.some((p) => works(s, p, 'minstrel'))) s.minstrelUntil = s.night + 2;
  if (s.day === 1 && s.princessPick === id) s.noKill = true;
  if (checkWin(s, ctx, id)) return true;
  return afterDeaths(s, ctx);
}

/** Moonchild / Klutz who died by day pick a player before night falls. */
function afterDeaths(s, ctx) {
  const ids = (s.lastword || []).filter((p) => s.dead[p]);
  s.lastword = [];
  if (ids.length) {
    s.phase = 'lastword';
    s.tasks = Object.fromEntries(ids.map((p) => [p, {role: s.role[p], n: 1, from: 'alive', done: false}]));
    s.deadline = ctx.now + duration(ctx, LASTWORD_S);
    return false;
  }
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  return false;
}

/** Riot day: the nominee dies at once and must nominate the next player. */
function riotKill(s, ctx, target) {
  s.nominated[target] = true;
  s.vote = null;
  die(s, ctx, target, {});
  cue(s, 'died', {seat: ctx.seatOf(target)});
  if (checkWin(s, ctx)) return true;
  const next = alive(s).filter((p) => !s.nominated[p]);
  if (!next.length) {
    s.phase = 'execution';
    s.deadline = ctx.now + duration(ctx, EXEC_S);
    return true;
  }
  s.phase = 'riot';
  s.tasks = {[target]: {role: 'riot', n: 1, from: 'riot', done: false}};
  s.deadline = ctx.now + duration(ctx, LASTWORD_S);
  return true;
}

function resolveRiot(s, ctx) {
  const [task] = Object.values(s.tasks);
  const [t] = (task && task.picks) || [];
  s.tasks = {};
  if (t) return riotKill(s, ctx, t);
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  return false;
}

/** Boomdandy: keep a Demon and 2 others alive; those 3 each point at a player. */
function boom(s, ctx) {
  cue(s, 'boom');
  const living = shuffle(alive(s), ctx.rng);
  const demon = living.find((p) => isDemonRole(s.role[p]));
  const keep = [...(demon ? [demon] : []), ...living.filter((p) => p !== demon)].slice(0, 3);
  for (const p of living) if (!keep.includes(p)) die(s, ctx, p, {});
  s.lastword = [];
  s.phase = 'boom';
  s.tasks = Object.fromEntries(keep.map((p) => [p, {role: 'boomdandy', n: 1, from: 'alive', done: false}]));
  s.deadline = ctx.now + duration(ctx, LASTWORD_S);
  return false;
}

function resolveBoom(s, ctx) {
  const count = {};
  for (const task of Object.values(s.tasks)) for (const t of task.picks || []) count[t] = (count[t] || 0) + 1;
  const top = Math.max(0, ...Object.values(count));
  const most = Object.keys(count).filter((p) => count[p] === top);
  s.tasks = {};
  if (most.length) {
    const victim = rnd(most, ctx.rng);
    die(s, ctx, victim, {});
    cue(s, 'died', {seat: ctx.seatOf(victim)});
  }
  s.lastword = [];
  if (checkWin(s, ctx)) return true;
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  return false;
}

/** Day powers a phone can use right now: [{power, targets}] (targets: seat ids, or null for none). */
export function dayPowers(s, id) {
  const out = [];
  const day = s.phase === 'day';
  if (day && works(s, id, 'psychopath') && s.used[`psychopath:${id}`] !== s.day && !Object.keys(s.nominated).length) {
    out.push({power: 'psychopath', targets: alive(s).filter((p) => p !== id)});
  }
  if (s.phase === 'defense' && s.vote.nominee === id && s.role[id] === 'goblin' && s.goblinClaim[id] !== s.day) {
    out.push({power: 'goblin', targets: null});
  }
  if (day && s.role[id] === 'mezepheles' && !s.dead[id] && !s.used[`mezepheles:${id}`]) {
    out.push({power: 'mezepheles', targets: s.seats.filter((p) => p !== id && !s.dead[p])});
  }
  if ((day || s.phase === 'defense') && works(s, id, 'yaggababble') && (s.yagg[id] || 0) < 3) out.push({power: 'yaggababble', targets: null, count: s.yagg[id] || 0});
  const v = s.lastVote;
  if (day && works(s, id, 'vizier') && v && v.goodYes && !v.vizierDone && !s.dead[v.nominee] && !s.executedToday) {
    out.push({power: 'vizier', targets: [v.nominee]});
  }
  return out;
}

export function usePower(s, ctx, id, power, target) {
  const p = dayPowers(s, id).find((x) => x.power === power);
  if (!p || (p.targets && !p.targets.includes(target))) return false;
  log(s, {kind: 'power', power, actor: id, target});
  if (power === 'psychopath') {
    s.used[`psychopath:${id}`] = s.day;
    die(s, ctx, target, {});
    cue(s, 'psychopath', {seat: ctx.seatOf(target)});
    checkWin(s, ctx);
  }
  if (power === 'goblin') {
    s.goblinClaim[id] = s.day;
    cue(s, 'goblin', {seat: ctx.seatOf(id)});
  }
  if (power === 'yaggababble') s.yagg[id] = (s.yagg[id] || 0) + 1;
  if (power === 'mezepheles') {
    s.used[`mezepheles:${id}`] = true;
    if (!impaired(s, id)) s.mezTarget = target;
  }
  if (power === 'vizier') {
    s.lastVote.vizierDone = true;
    cue(s, 'vizier_execute');
    execute(s, ctx, target, s.lastVote.nominator);
  }
  return true;
}

/** Organ Grinder: votes and tallies are hidden from the big screen. */
export const secretVotes = (s) => s.seats.some((p) => works(s, p, 'organgrinder'));

function resolveLastWord(s, ctx) {
  for (const [id, task] of Object.entries(s.tasks)) {
    const [t] = task.picks || [];
    if (!t || impaired(s, id)) continue;
    if (task.role === 'moonchild') s.moonCurse = t;
    if (task.role === 'klutz' && s.evil[t]) return win(s, 'evil', 'klutz');
  }
  s.tasks = {};
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  return false;
}

function endDay(s, ctx) {
  if (s.block && s.block.id) return execute(s, ctx, s.block.id, s.block.by);
  // Riot day with nobody nominated: the screen makes the first nomination.
  if (s.riotDay && !Object.keys(s.nominated).length && alive(s).length) return riotKill(s, ctx, rnd(alive(s), ctx.rng));
  cue(s, 'no_execution');
  // Vortox: a day without an execution hands evil the game.
  if (!s.executedToday && s.seats.some((p) => works(s, p, 'vortox'))) return win(s, 'evil', 'vortox');
  if (s.mastermindDay === 'active') return win(s, 'evil', 'mastermind');
  const living = alive(s);
  if (living.length === 3 && living.some((p) => works(s, p, 'mayor'))) return win(s, 'good', 'mayor');
  return afterDeaths(s, ctx);
}

function checkWin(s, ctx, executed) {
  if (s.over) return true;
  const living = alive(s);
  const fakeDead = s.seats.filter((p) => s.zombuulAlive[p]);
  if (!living.some((p) => isDemonRole(s.role[p])) && !fakeDead.length) {
    if (s.mastermindDay) return false;
    // A living Summoner who has not summoned yet keeps the game going.
    if (living.some((p) => s.role[p] === 'summoner' && !s.summoned)) return false;
    // Evil Twin: good can't win while both twins live.
    if (living.some((t) => s.twin[t] && s.role[t] === 'eviltwin' && !impaired(s, t) && !s.dead[s.twin[t]])) return false;
    if (executed && living.some((p) => works(s, p, 'mastermind'))) {
      s.mastermindDay = 'pending';
      return false;
    }
    return win(s, 'good', 'demonDead');
  }
  if (s.legion) {
    // Legion: good can't win with one good player left.
    if (living.filter((p) => !s.evil[p]).length <= 1) return win(s, 'evil', 'legion');
    return false;
  }
  if (living.length + fakeDead.length <= 2) return win(s, 'evil', 'twoLeft');
  if (s.multiDemon) {
    const evil = living.filter((p) => s.evil[p]).length;
    if (evil >= living.length - evil) return win(s, 'evil', 'parity');
  }
  return false;
}

function win(s, side, why) {
  if (s.over) return true;
  let winner = side;
  // Heretic: whoever wins, loses.
  if (s.seats.some((p) => s.role[p] === 'heretic' && !impaired(s, p))) {
    winner = side === 'good' ? 'evil' : 'good';
    s.heretic = true;
  }
  s.phase = 'over';
  s.over = true;
  s.winner = winner;
  s.winWhy = why;
  s.deadline = 0;
  s.tasks = {};
  cue(s, winner === 'good' ? 'win_good' : 'win_evil');
  return true;
}

export function hostEndDay(s, ctx) {
  if (s.phase !== 'day') return false;
  endDay(s, ctx);
  return true;
}

/** Phones still to answer the current night (or last-word) step. */
export const pendingTasks = (s) => Object.values(s.tasks || {}).filter((t) => !t.done).length;

/** Clock ran out on the current step. */
export function timeout(s, ctx) {
  switch (s.phase) {
    case 'roles':
      startNight(s, ctx);
      return true;
    case 'night':
    case 'lastword':
    case 'boom':
    case 'riot':
      autoAnswer(s, ctx);
      advance(s, ctx);
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
      if (s.over) return true;
      if (s.mastermindDay === 'pending') {
        s.mastermindDay = 'active';
        startDay(s, ctx);
      } else {
        startNight(s, ctx);
      }
      return true;
    default:
      return false;
  }
}
