/**
 * Blood on the Clocktower, Trouble Brewing, pure. The big screen is the
 * Storyteller, so every ability resolves automatically.
 *
 * Anti-leak rules: every night the Storyteller calls every role in the night
 * order, in play or not; roles nobody holds still get a random pause, so the
 * timing tells nobody anything. All phones show the same night screen.
 *
 * 5–15 seats use the standard setup table; 16 seats add a 10th Townsfolk.
 * Roles are never repeated (info roles depend on it).
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';

export const ROLES = {
  washerwoman: {team: 'townsfolk', emoji: '🧺', en: 'Washerwoman', zh: '洗衣妇', ab: {en: 'Night 1: learn that one of two players is a particular Townsfolk.', zh: '首夜：得知两名玩家之一是某个镇民角色。'}},
  librarian: {team: 'townsfolk', emoji: '📚', en: 'Librarian', zh: '图书管理员', ab: {en: 'Night 1: learn that one of two players is a particular Outsider (or that there are none).', zh: '首夜：得知两名玩家之一是某个外来者（或没有外来者）。'}},
  investigator: {team: 'townsfolk', emoji: '🔎', en: 'Investigator', zh: '调查员', ab: {en: 'Night 1: learn that one of two players is a particular Minion.', zh: '首夜：得知两名玩家之一是某个爪牙。'}},
  chef: {team: 'townsfolk', emoji: '👨‍🍳', en: 'Chef', zh: '厨师', ab: {en: 'Night 1: learn how many pairs of evil players sit next to each other.', zh: '首夜：得知有多少对邪恶玩家相邻而坐。'}},
  empath: {team: 'townsfolk', emoji: '💞', en: 'Empath', zh: '共情者', ab: {en: 'Each night: learn how many of your 2 living neighbours are evil.', zh: '每晚：得知你两侧存活的邻座中有几个邪恶玩家。'}},
  fortuneteller: {team: 'townsfolk', emoji: '🔮', en: 'Fortune Teller', zh: '占卜师', ab: {en: 'Each night: pick 2 players; learn if either is the Demon. One good player reads “yes” to you.', zh: '每晚：选择两名玩家，得知其中是否有恶魔。有一名善良玩家会被你误判为恶魔。'}},
  undertaker: {team: 'townsfolk', emoji: '⚰️', en: 'Undertaker', zh: '送葬者', ab: {en: 'Each night after the first: learn the role of the player executed today.', zh: '非首夜：得知今天被处决玩家的角色。'}},
  monk: {team: 'townsfolk', emoji: '🙏', en: 'Monk', zh: '僧侣', ab: {en: 'Each night after the first: protect another player from the Demon.', zh: '非首夜：保护另一名玩家不被恶魔杀害。'}},
  ravenkeeper: {team: 'townsfolk', emoji: '🐦‍⬛', en: 'Ravenkeeper', zh: '守鸦人', ab: {en: 'If you die at night, pick a player and learn their role.', zh: '若你在夜晚死亡，选择一名玩家并得知其角色。'}},
  virgin: {team: 'townsfolk', emoji: '🕯️', en: 'Virgin', zh: '贞洁者', ab: {en: 'The first time you are nominated, if the nominator is a Townsfolk, they are executed at once.', zh: '你第一次被提名时，若提名者是镇民，他立即被处决。'}},
  slayer: {team: 'townsfolk', emoji: '🏹', en: 'Slayer', zh: '猎手', ab: {en: 'Once per game, by day: publicly pick a player; if they are the Demon, they die.', zh: '每局一次，白天公开选择一名玩家：若他是恶魔，他死亡。'}},
  soldier: {team: 'townsfolk', emoji: '🪖', en: 'Soldier', zh: '士兵', ab: {en: 'The Demon can’t kill you.', zh: '恶魔无法杀死你。'}},
  mayor: {team: 'townsfolk', emoji: '🎩', en: 'Mayor', zh: '镇长', ab: {en: 'If 3 players live and nobody is executed, good wins. If you’d die at night, someone else might.', zh: '若只剩三人且当天无人被处决，善良获胜。你在夜晚将死时，可能由别人代替。'}},
  butler: {team: 'outsider', emoji: '🤵', en: 'Butler', zh: '管家', ab: {en: 'Each night pick a master; tomorrow you may only vote yes if they vote yes.', zh: '每晚选择一名主人；明天只有主人投赞成时你才能投赞成。'}},
  drunk: {team: 'outsider', emoji: '🍺', en: 'Drunk', zh: '酒鬼', ab: {en: 'You think you are a Townsfolk, but you are not, and your information may be wrong.', zh: '你以为自己是镇民，其实不是，你的信息可能是错的。'}},
  recluse: {team: 'outsider', emoji: '🏚️', en: 'Recluse', zh: '陌客', ab: {en: 'You might register as evil, even as a Minion or Demon.', zh: '你可能被当作邪恶，甚至是爪牙或恶魔。'}},
  saint: {team: 'outsider', emoji: '😇', en: 'Saint', zh: '圣徒', ab: {en: 'If you are executed, your team loses.', zh: '若你被处决，你的阵营失败。'}},
  poisoner: {team: 'minion', emoji: '🧪', en: 'Poisoner', zh: '投毒者', ab: {en: 'Each night pick a player: their ability fails until tomorrow night.', zh: '每晚选择一名玩家：他的能力失效到明晚。'}},
  spy: {team: 'minion', emoji: '🕵️', en: 'Spy', zh: '间谍', ab: {en: 'Each night you see every role. You might register as good.', zh: '每晚你能看到所有角色。你可能被当作善良。'}},
  scarletwoman: {team: 'minion', emoji: '💋', en: 'Scarlet Woman', zh: '红唇女郎', ab: {en: 'If the Demon dies with 5+ players alive, you become the Demon.', zh: '若恶魔在 5 人以上存活时死亡，你成为恶魔。'}},
  baron: {team: 'minion', emoji: '🎖️', en: 'Baron', zh: '男爵', ab: {en: 'There are 2 extra Outsiders in play.', zh: '场上多出两个外来者。'}},
  imp: {team: 'demon', emoji: '😈', en: 'Imp', zh: '小恶魔', ab: {en: 'Each night after the first: kill a player. If you kill yourself, a Minion becomes the Imp.', zh: '非首夜：杀死一名玩家。若你杀死自己，一名爪牙成为小恶魔。'}},
};

const KEYS = Object.keys(ROLES);
const byTeam = (team) => KEYS.filter((k) => ROLES[k].team === team);
export const isEvilRole = (k) => ROLES[k].team === 'minion' || ROLES[k].team === 'demon';

/** Townsfolk / Outsiders / Minions per seat count (16 adds a Townsfolk). */
const SETUP = {
  5: [3, 0, 1], 6: [3, 1, 1], 7: [5, 0, 1], 8: [5, 1, 1], 9: [5, 2, 1], 10: [7, 0, 2], 11: [7, 1, 2],
  12: [7, 2, 2], 13: [9, 0, 3], 14: [9, 1, 3], 15: [9, 2, 3], 16: [10, 2, 3],
};

export const FIRST_NIGHT = ['poisoner', 'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortuneteller', 'butler', 'spy'];
export const OTHER_NIGHTS = ['poisoner', 'monk', 'imp', 'ravenkeeper', 'empath', 'fortuneteller', 'undertaker', 'butler', 'spy'];
const CHOOSE = {poisoner: 1, monk: 1, imp: 1, ravenkeeper: 1, fortuneteller: 2, butler: 1};

const ROLES_S = 20;
const CALL_S = 25;
const INFO_S = 10;
const EMPTY_MIN_S = 3;
const EMPTY_MAX_S = 6;
const DAWN_S = 7;
const DEFENSE_S = 20;
const VOTE_S = 15;
const EXEC_S = 7;

export const alive = (s) => s.seats.filter((id) => !s.dead[id]);
/** The role a seat believes it has (the Drunk thinks it is a Townsfolk). */
export const shownRole = (s, id) => (s.role[id] === 'drunk' ? s.drunkAs : s.role[id]);
const impaired = (s, id) => s.role[id] === 'drunk' || s.poisoned === id;
const hasWorking = (s, id, role) => s.role[id] === role && !impaired(s, id) && !s.dead[id];

export function setupClocktower(seats, settings, ctx) {
  const n = seats.length;
  let [tf, out, min] = SETUP[n];
  const minions = shuffle(byTeam('minion'), ctx.rng).slice(0, min);
  if (minions.includes('baron')) {
    tf -= 2;
    out += 2;
  }
  const townsfolk = shuffle(byTeam('townsfolk'), ctx.rng);
  const inTf = townsfolk.slice(0, tf);
  const outsiders = shuffle(byTeam('outsider'), ctx.rng).slice(0, out);
  const roles = shuffle([...inTf, ...outsiders, ...minions, 'imp'], ctx.rng);
  const s = {
    seats,
    role: Object.fromEntries(seats.map((id, i) => [id, roles[i]])),
    dead: {},
    ghostVote: {},
    night: 0,
    day: 0,
    dayS: Number(settings.dayMinutes || 4) * 60,
    info: {},
    ready: {},
    log: [],
    cues: [],
    used: {},
  };
  const notInPlay = townsfolk.filter((k) => !inTf.includes(k));
  s.drunkAs = outsiders.includes('drunk') ? notInPlay.shift() || 'soldier' : null;
  const goodOut = byTeam('outsider').filter((k) => !outsiders.includes(k));
  s.bluffs = [...notInPlay, ...goodOut].slice(0, 3);
  const good = seats.filter((id) => !isEvilRole(s.role[id]));
  s.redHerring = good[Math.floor(ctx.rng() * good.length)];
  s.phase = 'roles';
  s.deadline = ctx.now + duration(ctx, ROLES_S);
  cue(s, 'welcome');
  return s;
}

/** What the evil team knows at the start. */
export function evilInfo(s, id) {
  const r = s.role[id];
  if (!isEvilRole(r)) return null;
  const demon = s.seats.find((p) => s.role[p] === 'imp');
  const minions = s.seats.filter((p) => ROLES[s.role[p]].team === 'minion');
  return r === 'imp' ? {demon, minions, bluffs: s.bluffs} : {demon, minions};
}

export function markReady(s, ctx, id) {
  if (s.phase !== 'roles') return false;
  s.ready[id] = true;
  if (s.seats.every((p) => s.ready[p])) startNight(s, ctx);
  return true;
}

// ------------------------------------------------------------------ night

function startNight(s, ctx) {
  s.night += 1;
  s.phase = 'night';
  s.order = s.night === 1 ? FIRST_NIGHT : OTHER_NIGHTS;
  s.callIdx = -1;
  s.deaths = [];
  s.protected = null;
  if (s.night > 1) s.poisoned = null;
  cue(s, 'dusk');
  nextCall(s, ctx);
}

function actorFor(s, roleKey) {
  if (roleKey === 'ravenkeeper') return s.seats.find((id) => shownRole(s, id) === 'ravenkeeper' && s.deaths.includes(id)) || null;
  return s.seats.find((id) => shownRole(s, id) === roleKey && !s.dead[id]) || null;
}

function nextCall(s, ctx) {
  s.callIdx += 1;
  if (s.callIdx >= s.order.length) return dawn(s, ctx);
  const roleKey = s.order[s.callIdx];
  const actor = actorFor(s, roleKey);
  const wait = EMPTY_MIN_S + ctx.rng() * (EMPTY_MAX_S - EMPTY_MIN_S);
  s.call = {role: roleKey, actor, choose: CHOOSE[roleKey] || 0, info: null};
  cue(s, `wake_${roleKey}`);
  if (!actor) {
    s.deadline = ctx.now + duration(ctx, wait);
    return undefined;
  }
  if (!s.call.choose) {
    s.call.info = infoFor(s, ctx, actor, roleKey, null);
    if (s.call.info) pushInfo(s, actor, s.call.info);
    s.deadline = ctx.now + duration(ctx, INFO_S);
  } else {
    s.deadline = ctx.now + duration(ctx, CALL_S);
  }
  return undefined;
}

function pushInfo(s, id, info) {
  s.info[id] = [...(s.info[id] || []), {night: s.night, ...info}];
}

/** Legal picks for the current night call. */
export function callTargets(s) {
  const c = s.call;
  if (!c || !c.actor) return [];
  if (c.role === 'monk' || c.role === 'butler') return alive(s).filter((id) => id !== c.actor);
  if (c.role === 'imp' || c.role === 'poisoner') return alive(s);
  return [...s.seats];
}

export function nightChoice(s, ctx, id, targets) {
  const c = s.call;
  if (s.phase !== 'night' || !c || c.actor !== id || c.done) return false;
  if (!c.choose) {
    c.done = true;
    nextCall(s, ctx);
    return true;
  }
  const legal = callTargets(s);
  const picks = [...new Set((targets || []).filter((t) => legal.includes(t)))].slice(0, c.choose);
  if (picks.length !== c.choose) return false;
  c.done = true;
  resolveChoice(s, ctx, id, c.role, picks);
  nextCall(s, ctx);
  return true;
}

function resolveChoice(s, ctx, id, roleKey, picks) {
  const working = !impaired(s, id);
  const [a, b] = picks;
  if (roleKey === 'poisoner' && working) s.poisoned = a;
  if (roleKey === 'monk' && working) s.protected = a;
  if (roleKey === 'butler') s.master = a;
  if (roleKey === 'fortuneteller' || roleKey === 'ravenkeeper') pushInfo(s, id, infoFor(s, ctx, id, roleKey, picks));
  if (roleKey === 'imp' && working) impKill(s, ctx, id, a);
  log(s, {kind: 'night', role: roleKey, actor: id, targets: picks});
}

function impKill(s, ctx, imp, target) {
  if (target === imp) {
    // Star-pass: a Minion (the Scarlet Woman first) becomes the Imp.
    s.dead[imp] = true;
    s.deaths.push(imp);
    const minions = alive(s).filter((p) => ROLES[s.role[p]].team === 'minion');
    const heir = minions.find((p) => s.role[p] === 'scarletwoman') || minions[0];
    if (heir) s.role[heir] = 'imp';
    return;
  }
  let victim = target;
  if (hasWorking(s, victim, 'mayor') && ctx.rng() < 0.5) {
    const others = alive(s).filter((p) => p !== victim && p !== imp);
    victim = others[Math.floor(ctx.rng() * others.length)] || victim;
  }
  if (victim === s.protected || hasWorking(s, victim, 'soldier')) return;
  s.dead[victim] = true;
  s.deaths.push(victim);
}

// ------------------------------------------------------------------ information

const registersEvil = (s, ctx, id) => {
  const r = s.role[id];
  if (r === 'recluse') return ctx.rng() < 0.5;
  if (r === 'spy') return ctx.rng() < 0.5;
  return isEvilRole(r);
};

function otherThan(s, ctx, not) {
  const pool = s.seats.filter((p) => !not.includes(p));
  return pool[Math.floor(ctx.rng() * pool.length)];
}

function livingNeighbours(s, id) {
  const n = s.seats.length;
  const i = s.seats.indexOf(id);
  const out = [];
  for (const step of [-1, 1]) {
    for (let k = 1; k < n; k++) {
      const p = s.seats[(i + step * k + n * n) % n];
      if (p === id) break;
      if (!s.dead[p]) {
        out.push(p);
        break;
      }
    }
  }
  return [...new Set(out)];
}

/** The information a role learns; wrong (but plausible) when the seat is drunk or poisoned. */
function infoFor(s, ctx, id, roleKey, picks) {
  const lie = impaired(s, id);
  const rnd = (list) => list[Math.floor(ctx.rng() * list.length)];
  const pair = (target, roleShown) => ({kind: 'pair', players: shuffle([target, otherThan(s, ctx, [id, target])], ctx.rng), role: roleShown});
  switch (roleKey) {
    case 'washerwoman': {
      const tf = s.seats.filter((p) => p !== id && ROLES[s.role[p]].team === 'townsfolk');
      if (lie || !tf.length) return pair(otherThan(s, ctx, [id]), rnd(byTeam('townsfolk')));
      const t = rnd(tf);
      return pair(t, s.role[t]);
    }
    case 'librarian': {
      const os = s.seats.filter((p) => p !== id && ROLES[s.role[p]].team === 'outsider');
      if (lie) return pair(otherThan(s, ctx, [id]), rnd(byTeam('outsider')));
      if (!os.length) return {kind: 'none', team: 'outsider'};
      const t = rnd(os);
      return pair(t, s.role[t]);
    }
    case 'investigator': {
      const ms = s.seats.filter((p) => p !== id && (ROLES[s.role[p]].team === 'minion' || (s.role[p] === 'recluse' && ctx.rng() < 0.5)));
      if (lie || !ms.length) return pair(otherThan(s, ctx, [id]), rnd(byTeam('minion')));
      const t = rnd(ms);
      return pair(t, ROLES[s.role[t]].team === 'minion' ? s.role[t] : rnd(byTeam('minion')));
    }
    case 'chef': {
      if (lie) return {kind: 'number', n: Math.floor(ctx.rng() * 3)};
      let pairs = 0;
      const n = s.seats.length;
      for (let i = 0; i < n; i++) if (isEvilRole(s.role[s.seats[i]]) && isEvilRole(s.role[s.seats[(i + 1) % n]])) pairs += 1;
      return {kind: 'number', n: pairs};
    }
    case 'empath': {
      if (lie) return {kind: 'number', n: Math.floor(ctx.rng() * 3)};
      return {kind: 'number', n: livingNeighbours(s, id).filter((p) => registersEvil(s, ctx, p)).length};
    }
    case 'fortuneteller': {
      if (lie) return {kind: 'yesno', players: picks, yes: ctx.rng() < 0.5};
      const yes = picks.some((p) => s.role[p] === 'imp' || p === s.redHerring || (s.role[p] === 'recluse' && ctx.rng() < 0.5));
      return {kind: 'yesno', players: picks, yes};
    }
    case 'undertaker': {
      if (!s.executedToday) return null;
      return {kind: 'role', player: s.executedToday, role: lie ? rnd(KEYS) : s.role[s.executedToday]};
    }
    case 'ravenkeeper': {
      const t = picks[0];
      return {kind: 'role', player: t, role: lie ? rnd(KEYS) : s.role[t]};
    }
    case 'spy':
      return {kind: 'grimoire'};
    default:
      return null;
  }
}

// ------------------------------------------------------------------ day

function dawn(s, ctx) {
  s.phase = 'dawn';
  s.call = null;
  s.deadline = ctx.now + duration(ctx, DAWN_S);
  if (s.deaths.length) {
    for (const d of s.deaths) cue(s, 'died', {seat: ctx.seatOf(d)});
    log(s, {kind: 'died', targets: [...s.deaths]});
  } else {
    cue(s, 'peaceful');
  }
  checkWin(s, ctx);
}

function startDay(s, ctx) {
  s.day += 1;
  s.phase = 'day';
  s.executedToday = null;
  s.nominated = {};
  s.nominators = {};
  s.block = null;
  s.vote = null;
  s.dayLeft = duration(ctx, s.dayS);
  s.deadline = ctx.now + s.dayLeft;
  cue(s, 'day');
}

export function nominate(s, ctx, id, target) {
  if (s.phase !== 'day' || s.dead[id] || s.nominators[id] || s.nominated[target] || s.dead[target] || !s.seats.includes(target)) return false;
  s.nominators[id] = true;
  s.nominated[target] = true;
  s.dayLeft = Math.max(0, s.deadline - ctx.now);
  log(s, {kind: 'nominate', actor: id, target});
  // Virgin: the first nomination by a real Townsfolk executes the nominator.
  if (s.role[target] === 'virgin' && !s.used.virgin && !impaired(s, target)) {
    s.used.virgin = true;
    if (ROLES[s.role[id]].team === 'townsfolk') {
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
export const canVoteYes = (s, id) => !s.dead[id] || !s.ghostVote[id];

export function castVote(s, ctx, id, yes) {
  if (s.phase !== 'vote' || s.vote.votes[id] != null) return false;
  s.vote.votes[id] = yes && canVoteYes(s, id) ? 'yes' : 'no';
  if (s.seats.every((p) => s.vote.votes[p] != null)) tally(s, ctx);
  return true;
}

function tally(s, ctx) {
  const v = s.vote;
  // The Butler's yes only counts if their master voted yes.
  for (const id of s.seats) {
    if (v.votes[id] === 'yes' && hasWorking(s, id, 'butler') && s.master && v.votes[s.master] !== 'yes') v.votes[id] = 'no';
  }
  let yes = 0;
  for (const id of s.seats) {
    if (v.votes[id] !== 'yes') continue;
    yes += 1;
    if (s.dead[id]) s.ghostVote[id] = true; // ghost vote spent
  }
  const need = Math.ceil(alive(s).length / 2);
  v.yes = yes;
  if (yes >= need) {
    if (!s.block || yes > s.block.yes) s.block = {id: v.nominee, yes};
    else if (yes === s.block.yes) s.block = {id: null, yes};
  }
  log(s, {kind: 'voted', target: v.nominee, n: yes});
  s.lastVote = v;
  s.vote = null;
  s.phase = 'day';
  s.deadline = ctx.now + Math.max(duration(ctx, 10), s.dayLeft);
}

export function slay(s, ctx, id, target) {
  if ((s.phase !== 'day' && s.phase !== 'defense') || shownRole(s, id) !== 'slayer' || s.used[`slayer:${id}`] || s.dead[id] || s.dead[target]) return false;
  s.used[`slayer:${id}`] = true;
  log(s, {kind: 'slay', actor: id, target});
  if (hasWorking(s, id, 'slayer') && s.role[target] === 'imp') {
    killDemon(s, ctx, target);
    cue(s, 'demon_dies');
  } else {
    cue(s, 'slayer_miss');
  }
  checkWin(s, ctx);
  return true;
}

function killDemon(s, ctx, id) {
  s.dead[id] = true;
  const sw = alive(s).find((p) => s.role[p] === 'scarletwoman' && !impaired(s, p));
  if (sw && alive(s).length + 1 >= 5) s.role[sw] = 'imp';
}

function execute(s, ctx, id) {
  s.executedToday = id;
  cue(s, 'executed', {seat: ctx.seatOf(id)});
  log(s, {kind: 'executed', target: id});
  if (s.role[id] === 'saint' && !impaired(s, id)) {
    s.dead[id] = true;
    return win(s, 'evil', 'saint');
  }
  if (s.role[id] === 'imp') killDemon(s, ctx, id);
  else s.dead[id] = true;
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  return checkWin(s, ctx);
}

function endDay(s, ctx) {
  if (s.block && s.block.id) return execute(s, ctx, s.block.id);
  cue(s, 'no_execution');
  const living = alive(s);
  if (living.length === 3 && living.some((p) => hasWorking(s, p, 'mayor'))) return win(s, 'good', 'mayor');
  s.phase = 'execution';
  s.deadline = ctx.now + duration(ctx, EXEC_S);
  return undefined;
}

function checkWin(s, ctx) {
  if (s.over) return true;
  const living = alive(s);
  if (!living.some((p) => s.role[p] === 'imp')) return win(s, 'good', 'demonDead');
  if (living.length <= 2) return win(s, 'evil', 'twoLeft');
  return false;
}

function win(s, team, why) {
  s.phase = 'over';
  s.over = true;
  s.winner = team;
  s.winWhy = why;
  s.deadline = 0;
  cue(s, team === 'good' ? 'win_good' : 'win_evil');
  return true;
}

export function hostEndDay(s, ctx) {
  if (s.phase !== 'day') return false;
  endDay(s, ctx);
  return true;
}

/** Clock ran out on the current step. */
export function timeout(s, ctx) {
  switch (s.phase) {
    case 'roles':
      startNight(s, ctx);
      return true;
    case 'night': {
      const c = s.call;
      if (c && c.actor && c.choose && !c.done) {
        const legal = shuffle(callTargets(s), ctx.rng);
        return nightChoice(s, ctx, c.actor, legal.slice(0, c.choose));
      }
      nextCall(s, ctx);
      return true;
    }
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
