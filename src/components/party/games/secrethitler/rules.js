/**
 * Secret Hitler rules, pure (original theme, CC BY-NC-SA 4.0 game by
 * Goat, Wolf & Cabbage). Extended to 16 seats:
 * - team table for 11–16, a bigger policy deck (8 L / 15 F);
 * - 11+ seats: a three-seat government (President → Clerk → Chancellor);
 * - filler roles: Journalist (11+), Bodyguard (13+), Infiltrator (15+);
 * - 14+ seats: the first investigation is a public audit instead.
 */

import {cue, duration, log, shuffle} from '../../core/partyCore';

const LIBERALS = {5: 3, 6: 4, 7: 4, 8: 5, 9: 5, 10: 6, 11: 7, 12: 7, 13: 8, 14: 9, 15: 9, 16: 10};
const REVEAL_S = 15;
const NOMINATE_S = 45;
const VOTE_S = 30;
const VOTE_SHOW_S = 6;
const LEGISLATE_S = 30;
const ENACT_SHOW_S = 6;
const POWER_S = 40;

export const LIB_TRACK = 5;
export const FAS_TRACK = 6;

/** Presidential power unlocked by each fascist policy (index = policies - 1). */
export function powerTrack(n) {
  if (n <= 6) return [null, null, 'peek', 'execute', 'execute', null];
  if (n <= 8) return [null, 'investigate', 'special', 'execute', 'execute', null];
  if (n <= 10) return ['investigate', 'investigate', 'special', 'execute', 'execute', null];
  if (n <= 13) return ['investigate', 'investigate', 'special', 'execute', 'execute', null];
  return ['audit', 'investigate', 'special', 'execute', 'execute', null];
}

export const party = (role) => (role === 'liberal' || role === 'journalist' || role === 'bodyguard' ? 'liberal' : 'fascist');
/** What an investigation shows: the Infiltrator passes as a Liberal. */
export const shownParty = (role) => (role === 'infiltrator' ? 'liberal' : party(role));

export const alive = (s) => s.seats.filter((id) => !s.dead[id]);

export function setupSecretHitler(seats, ctx) {
  const n = seats.length;
  const libs = LIBERALS[n];
  const fas = n - libs - 1;
  const roles = ['hitler'];
  for (let i = 0; i < fas; i++) roles.push(i === 0 && n >= 15 ? 'infiltrator' : 'fascist');
  for (let i = 0; i < libs; i++) roles.push(i === 0 && n >= 11 ? 'journalist' : i === 1 && n >= 13 ? 'bodyguard' : 'liberal');
  const dealt = shuffle(roles, ctx.rng);
  const big = n >= 11;
  const s = {
    seats,
    role: Object.fromEntries(seats.map((id, i) => [id, dealt[i]])),
    hitlerKnows: n <= 6,
    clerkSeat: big,
    deck: shuffle([...Array(big ? 8 : 6).fill('L'), ...Array(big ? 15 : 11).fill('F')], ctx.rng),
    discard: [],
    lib: 0,
    fas: 0,
    tracker: 0,
    powers: powerTrack(n),
    dead: {},
    ready: {},
    presIdx: -1,
    special: null,
    last: {president: null, chancellor: null, clerk: null},
    votes: {},
    used: {journalist: false, bodyguard: false},
    privateNote: {},
    log: [],
    cues: [],
  };
  s.phase = 'roles';
  s.deadline = ctx.now + duration(ctx, REVEAL_S);
  cue(s, 'welcome');
  cue(s, 'role_reveal');
  return s;
}

/** Who a seat knows from the start (their team-mates). */
export function knownTo(s, id) {
  const r = s.role[id];
  if (party(r) !== 'fascist') return [];
  if (r === 'hitler' && !s.hitlerKnows) return [];
  return s.seats.filter((o) => o !== id && party(s.role[o]) === 'fascist');
}

function draw(s, k) {
  if (s.deck.length < k) {
    s.deck = shuffle([...s.deck, ...s.discard], s.rng || Math.random);
    s.discard = [];
  }
  return s.deck.splice(0, k);
}

function nextPresident(s, ctx) {
  const living = alive(s);
  let id;
  if (s.special) {
    id = s.special;
    s.special = null;
  } else {
    const n = s.seats.length;
    let i = s.presIdx;
    do {
      i = (i + 1) % n;
    } while (s.dead[s.seats[i]]);
    s.presIdx = i;
    id = s.seats[i];
  }
  s.gov = {president: id, chancellor: null, clerk: null};
  s.phase = 'nominate';
  s.votes = {};
  s.hand = null;
  s.deadline = ctx.now + duration(ctx, NOMINATE_S);
  if (living.length) cue(s, 'nominate', {seat: ctx.seatOf(id)});
}

/** Seats that may be nominated (term limits). */
export function eligible(s) {
  const living = alive(s);
  const banned = [s.gov.president, s.last.chancellor, s.last.clerk];
  if (living.length > 5) banned.push(s.last.president);
  return living.filter((id) => !banned.includes(id));
}

export function nominate(s, ctx, id, chancellor, clerk) {
  if (s.phase !== 'nominate' || id !== s.gov.president) return false;
  const ok = eligible(s);
  if (!ok.includes(chancellor)) return false;
  if (s.clerkSeat) {
    if (!ok.includes(clerk) || clerk === chancellor) return false;
    s.gov.clerk = clerk;
  }
  s.gov.chancellor = chancellor;
  s.phase = 'vote';
  s.votes = {};
  s.deadline = ctx.now + duration(ctx, VOTE_S);
  cue(s, 'vote_open');
  return true;
}

export function vote(s, ctx, id, ja) {
  if (s.phase !== 'vote' || s.dead[id] || s.votes[id] != null) return false;
  s.votes[id] = ja ? 'ja' : 'nein';
  if (alive(s).every((p) => s.votes[p] != null)) closeVote(s, ctx);
  return true;
}

function closeVote(s, ctx) {
  const ja = Object.values(s.votes).filter((v) => v === 'ja').length;
  const nein = Object.values(s.votes).filter((v) => v === 'nein').length;
  s.voteResult = ja > nein;
  s.phase = 'voteShow';
  s.deadline = ctx.now + duration(ctx, VOTE_SHOW_S);
  cue(s, s.voteResult ? 'vote_pass' : 'vote_fail');
}

function afterVoteShow(s, ctx) {
  log(s, {kind: s.voteResult ? 'elected' : 'rejected', ...s.gov});
  if (!s.voteResult) {
    s.tracker += 1;
    if (s.tracker >= 3) return chaos(s, ctx);
    if (s.tracker === 2) cue(s, 'deadlock');
    return nextPresident(s, ctx);
  }
  s.tracker = 0;
  s.last = {...s.gov};
  if (s.fas >= 3 && s.role[s.gov.chancellor] === 'hitler') return win(s, ctx, 'fascist', 'hitlerElected');
  s.hand = draw(s, s.clerkSeat ? 4 : 3);
  s.phase = 'president';
  s.deadline = ctx.now + duration(ctx, LEGISLATE_S);
  return undefined;
}

function chaos(s, ctx) {
  cue(s, 'chaos');
  const [top] = draw(s, 1);
  s.tracker = 0;
  s.last = {president: null, chancellor: null, clerk: null};
  enact(s, ctx, top, false);
}

/** President (or Clerk) throws one card away and passes the rest on. */
export function discardCard(s, ctx, id, index) {
  const who = s.phase === 'president' ? s.gov.president : s.phase === 'clerk' ? s.gov.clerk : null;
  if (!who || id !== who || !s.hand || index < 0 || index >= s.hand.length) return false;
  s.discard.push(s.hand.splice(index, 1)[0]);
  s.phase = s.phase === 'president' && s.clerkSeat ? 'clerk' : 'chancellor';
  if (s.phase === 'chancellor') s.lastHand = [...s.hand];
  s.deadline = ctx.now + duration(ctx, LEGISLATE_S);
  return true;
}

export function enactCard(s, ctx, id, index) {
  if (s.phase !== 'chancellor' || id !== s.gov.chancellor || !s.hand || index < 0 || index >= s.hand.length) return false;
  const card = s.hand.splice(index, 1)[0];
  s.discard.push(...s.hand);
  s.hand = null;
  enact(s, ctx, card, true);
  return true;
}

export function proposeVeto(s, ctx, id) {
  if (s.phase !== 'chancellor' || id !== s.gov.chancellor || s.fas < 5) return false;
  s.phase = 'veto';
  s.deadline = ctx.now + duration(ctx, LEGISLATE_S);
  cue(s, 'veto');
  return true;
}

export function answerVeto(s, ctx, id, agree) {
  if (s.phase !== 'veto' || id !== s.gov.president) return false;
  if (agree) {
    s.discard.push(...s.hand);
    s.hand = null;
    log(s, {kind: 'vetoed', ...s.gov});
    s.tracker += 1;
    if (s.tracker >= 3) return chaos(s, ctx) || true;
    nextPresident(s, ctx);
  } else {
    s.phase = 'chancellor';
    s.vetoRefused = true;
    s.deadline = ctx.now + duration(ctx, LEGISLATE_S);
  }
  return true;
}

function enact(s, ctx, card, withPower) {
  if (card === 'L') s.lib += 1;
  else s.fas += 1;
  s.lastPolicy = card;
  log(s, {kind: 'enacted', card, ...(withPower ? s.gov : {})});
  cue(s, card === 'L' ? 'law_liberal' : 'law_fascist');
  if (s.lib >= LIB_TRACK) return win(s, ctx, 'liberal', 'policies');
  if (s.fas >= FAS_TRACK) return win(s, ctx, 'fascist', 'policies');
  if (card === 'F' && s.fas === 3) cue(s, 'danger_zone');
  s.pendingPower = card === 'F' && withPower ? s.powers[s.fas - 1] : null;
  s.phase = 'enacted';
  s.deadline = ctx.now + duration(ctx, ENACT_SHOW_S);
  return undefined;
}

function afterEnacted(s, ctx) {
  const power = s.pendingPower;
  s.pendingPower = null;
  if (!power) return nextPresident(s, ctx);
  s.power = {kind: power, president: s.gov.president, result: null};
  if (power === 'audit') {
    const pick = s.discard.length ? s.discard[Math.floor(ctx.rng() * s.discard.length)] : null;
    s.power.result = pick;
    cue(s, 'audit');
  } else if (power === 'peek') {
    if (s.deck.length < 3) {
      s.deck = shuffle([...s.deck, ...s.discard], ctx.rng);
      s.discard = [];
    }
    s.power.result = s.deck.slice(0, 3);
    cue(s, 'power_peek');
  } else {
    cue(s, `power_${power}`);
  }
  s.phase = 'power';
  s.deadline = ctx.now + duration(ctx, POWER_S);
  return undefined;
}

export function powerTargets(s) {
  if (!s.power) return [];
  const pres = s.power.president;
  return alive(s).filter((id) => id !== pres && !(s.power.kind === 'investigate' && s.investigated && s.investigated[id]));
}

/** The President uses the power: a target for investigate / special / execute, or just "done". */
export function usePower(s, ctx, id, target) {
  if (s.phase !== 'power' || id !== s.power.president) return false;
  const {kind} = s.power;
  if (kind === 'peek' || kind === 'audit') {
    s.power = null;
    nextPresident(s, ctx);
    return true;
  }
  if (kind === 'investigate' && s.power.result) {
    s.power = null;
    nextPresident(s, ctx);
    return true;
  }
  if (!powerTargets(s).length) {
    // Nobody left to aim at (everyone already investigated): the power lapses.
    s.power = null;
    nextPresident(s, ctx);
    return true;
  }
  if (!powerTargets(s).includes(target)) return false;
  if (kind === 'investigate') {
    s.investigated = {...(s.investigated || {}), [target]: true};
    s.power.result = {target, party: shownParty(s.role[target])};
    log(s, {kind: 'investigated', president: id, target});
    return true;
  }
  if (kind === 'special') {
    s.special = target;
    log(s, {kind: 'special', president: id, target});
    s.power = null;
    nextPresident(s, ctx);
    return true;
  }
  if (kind === 'execute') {
    if (s.role[target] === 'bodyguard' && !s.used.bodyguard) {
      s.used.bodyguard = true;
      log(s, {kind: 'guarded', target});
      cue(s, 'guarded');
    } else {
      s.dead[target] = true;
      log(s, {kind: 'executed', president: id, target});
      cue(s, 'executed', {seat: ctx.seatOf(target)});
      if (s.role[target] === 'hitler') {
        s.power = null;
        return win(s, ctx, 'liberal', 'hitlerShot') || true;
      }
    }
    s.power = null;
    nextPresident(s, ctx);
    return true;
  }
  return false;
}

/** The Journalist's one look at what the last Chancellor was handed. */
export function useJournalist(s, id) {
  if (s.role[id] !== 'journalist' || s.used.journalist || !s.lastHand || s.dead[id]) return false;
  s.used.journalist = true;
  s.privateNote[id] = {kind: 'journalist', cards: [...s.lastHand]};
  return true;
}

export function markReady(s, ctx, id) {
  if (s.phase !== 'roles') return false;
  s.ready[id] = true;
  if (s.seats.every((p) => s.ready[p])) nextPresident(s, ctx);
  return true;
}

function win(s, ctx, team, why) {
  s.phase = 'over';
  s.over = true;
  s.winner = team;
  s.winWhy = why;
  s.deadline = 0;
  cue(s, team === 'liberal' ? 'win_liberal' : 'win_fascist');
  return true;
}

/** Clock ran out: take a sensible default so a sleeping phone never stalls the table. */
export function timeout(s, ctx) {
  const rnd = (list) => list[Math.floor(ctx.rng() * list.length)];
  switch (s.phase) {
    case 'roles':
      nextPresident(s, ctx);
      return true;
    case 'nominate': {
      const ok = eligible(s);
      const c = rnd(ok);
      const k = rnd(ok.filter((x) => x !== c));
      return nominate(s, ctx, s.gov.president, c, k);
    }
    case 'vote':
      closeVote(s, ctx);
      return true;
    case 'voteShow':
      afterVoteShow(s, ctx);
      return true;
    case 'president':
    case 'clerk':
      return discardCard(s, ctx, s.phase === 'president' ? s.gov.president : s.gov.clerk, Math.floor(ctx.rng() * s.hand.length));
    case 'chancellor':
      return enactCard(s, ctx, s.gov.chancellor, 0);
    case 'veto':
      return answerVeto(s, ctx, s.gov.president, false);
    case 'enacted':
      afterEnacted(s, ctx);
      return true;
    case 'power': {
      const targets = powerTargets(s);
      return usePower(s, ctx, s.power.president, s.power.kind === 'investigate' && s.power.result ? null : rnd(targets));
    }
    default:
      return false;
  }
}
