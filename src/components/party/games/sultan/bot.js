/**
 * City of the Sultan bots: one move at a time, pure (shared by the game and
 * the headless tests). They use every ability now and then, chase their own
 * command, and are generous: they accept every date and alliance, never raise
 * a duel's bet, and share Extravagance coins as evenly as they can.
 */

import {DISTRICT, EVENTS, charOf} from './data';
import {acting, bidCap, canBuild, canPick, canSoftCommand, canSoftReserve, canUseEvent, diceHasPlayer, generalTargets, hasBid, hiddenPlayers, meetsTier, commandFor, nameableNumbers, officialTargets, picksLeft, softReady, statOf} from './rules';

const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const costOf = (s, uid) => DISTRICT[s.cards[uid]].cost;

function answerPrompt(s, id, rng) {
  const p = s.prompt;
  switch (p.kind) {
    case 'shield':
      return {action: 'answer', yes: rng() < 0.6};
    case 'raise':
      return {action: 'answer', bet: 1};
    case 'champion': {
      const best = [...s.hold[id]].sort((a, b) => statOf(b, 'combat') - statOf(a, 'combat'))[0];
      return {action: 'answer', card: best};
    }
    default:
      // A date or an ally request: always yes.
      return {action: 'answer', yes: true};
  }
}

export function botMove(s, id, rng) {
  if (s.over) return null;
  if (s.dice && !s.dice.revealed && diceHasPlayer(s.dice, id) && Object.values(s.dice.sides).some((side) => side.who === id && !side.launched)) {
    return {action: 'launchDice'};
  }
  if (s.prompt) {
    if (s.prompt.to === id) return answerPrompt(s, id, rng);
    // Waiting on a reply: end the turn so calling can move; soft command after.
    const stuck = s.phase === 'call' && s.turn && s.turn.cards.find((k) => acting(s, id, k));
    if (stuck) return {action: 'end', card: stuck};
    return null;
  }
  // A command none of my characters can start, with time running out: use the one redraw.
  const mine = commandFor(s, id);
  if (mine && !(s.redraws && s.redraws[id]) && s.round >= mine.due - 1 && s.hold[id].length && !s.hold[id].some((k) => meetsTier(k, mine.frame))) return {action: 'redraw'};
  if (s.phase === 'auction') {
    const qs = s.auction.quiz[id] || [];
    const i = qs.findIndex((q) => !q.state);
    if (i >= 0) return {action: 'quiz', index: i, value: rng() < 0.8 ? qs[i].a : `${qs[i].a}1`};
    if (hasBid(s, id)) return null;
    // All earned coins on one character, or split over two.
    const cap = bidCap(s, id);
    const lots = [...s.auction.lots].sort(() => rng() - 0.5);
    const bids = {};
    if (cap > 0 && lots.length) {
      const first = cap >= 2 && rng() < 0.4 ? cap - 1 : cap;
      bids[lots[0]] = first;
      if (cap - first > 0 && lots[1]) bids[lots[1]] = cap - first;
    }
    return {action: 'bid', bids};
  }
  if (s.phase === 'draft') {
    if (picksLeft(s, id) < 1) return null;
    const options = s.draft.available.filter((k) => canPick(s, id, k));
    return options.length ? {action: 'draft', card: pick(options, rng)} : null;
  }
  if (s.phase === 'pyrrhic') {
    const ev = commandFor(s, id, 'pyrrhic');
    const foes = s.seats.filter((p) => p !== id && s.hold[p].length);
    if (canUseEvent(s, id, ev) && foes.length && rng() < 0.85) return {action: 'challenge', target: pick(foes, rng)};
    return null;
  }
  if (s.phase !== 'call' || !s.turn) return null;
  const key = s.turn.cards.find((k) => acting(s, id, k));
  if (!key) {
    // Soft window: princess reserve + commands after characters finish.
    if (!softReady(s, id)) return null;
    const free = (s.unpicked || []).filter((k) => !Object.values(s.reserved).includes(k));
    if (canSoftReserve(s, id) && free.length) return {action: 'reserve', pick: pick(free, rng)};
    if (canSoftCommand(s, id, 'marriage') && rng() < 0.85) {
      const suitors = s.hold[id].filter((k) => s.revealed[k] && !s.married[k]);
      if (suitors.length) {
        const mine = pick(suitors, rng);
        const others = Object.keys(s.owner).filter((k) => k !== mine && s.revealed[k] && !s.married[k]);
        if (others.length) return {action: 'marry', mine, other: pick(others, rng)};
      }
    }
    if (canSoftCommand(s, id, 'conquest') && rng() < 0.85) {
      const targets = s.seats.filter((p) => p !== id).flatMap((p) => s.city[p]).filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u]));
      const allies = s.seats.filter((p) => p !== id);
      if (targets.length) return {action: 'conquer', uid: pick(targets, rng), ally: rng() < 0.5 ? pick(allies, rng) : null, offer: 1};
    }
    if (canSoftCommand(s, id, 'extravagance') && rng() < 0.85) {
      const total = s.hold[id].reduce((n, k) => n + charOf(k).charisma, 0);
      const others = s.seats.filter((p) => p !== id).sort((a, b) => s.gold[a] - s.gold[b]);
      const gifts = {};
      for (let i = 0; i < total; i++) gifts[others[i % others.length]] = (gifts[others[i % others.length]] || 0) + 1;
      return {action: 'extravagance', gifts};
    }
    return null;
  }
  const t = s.turn;
  const step = t.step[key];
  const act = (msg) => ({...msg, card: key});
  if (step === 'income') {
    const affordable = s.hand[id].some((u) => costOf(s, u) <= s.gold[id] + 2);
    return act({action: affordable || s.deck.length < 2 ? 'gold' : 'cards'});
  }
  if (step === 'keep') {
    const best = [...t.drawn[key]].sort((a, b) => costOf(s, b) - costOf(s, a))[0];
    return act({action: 'keep', uid: best});
  }
  if (t.stealFrom[key]) {
    const loot = s.city[t.stealFrom[key]].filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u]));
    if (loot.length) return act({action: 'steal', uid: pick(loot, rng)});
  }
  const used = t.uses[key] || 0;
  const twice = s.hold[id].includes('weaver') ? 2 : 1;
  if (used < twice && rng() < 0.7) {
    const nums = nameableNumbers(s, key);
    if (['banditA', 'banditB'].includes(key) && nums.length) return act({action: 'silence', number: pick(nums, rng)});
    if (key === 'thief' && nums.length) return act({action: 'rob', number: pick(nums, rng)});
    if (key === 'fighter') {
      const targets = hiddenPlayers(s, id);
      const guesses = (s.poolKeys || []).filter((k) => !s.hold[id].includes(k) && !s.revealed[k]);
      if (targets.length && guesses.length) return act({action: 'guess', target: pick(targets, rng), guess: pick(guesses, rng)});
    }
    if (key === 'mage') {
      const richest = s.seats.filter((o) => o !== id).sort((a, b) => s.hand[b].length - s.hand[a].length)[0];
      if (richest && s.hand[richest].length > s.hand[id].length + 1) return act({action: 'swapHand', target: richest});
      if (s.hand[id].length) return act({action: 'redraw', uids: [s.hand[id][0]]});
    }
    const free = (s.unpicked || []).filter((k) => !Object.values(s.reserved).includes(k));
    if (key === 'princess' && free.length) return act({action: 'reserve', pick: pick(free, rng)});
    if (key === 'official') {
      const buys = officialTargets(s, id);
      if (buys.length && rng() < 0.4) return act({action: 'buy', uid: pick(buys, rng).uid});
    }
    if (key === 'general') {
      const hits = generalTargets(s, id);
      if (hits.length && rng() < 0.4) return act({action: 'destroy', uid: pick(hits, rng).uid});
    }
    if (key === 'scholar' && s.city[id].length && s.gold[id] >= 1) return act({action: 'invest', uid: pick(s.city[id], rng), n: Math.min(2, s.gold[id])});
    if (key === 'lucky' && s.gold[id] >= 1) return act({action: 'gamble'});
  }
  // Commands, now and then; in Sultan's Madness the table needs them done.
  // Their command is theirs alone and has a deadline: go for it.
  const eager = 0.85;
  const ev = (kind) => commandFor(s, id, kind);
  if (canUseEvent(s, id, ev('marriage')) && !t.dated[key] && rng() < eager) {
    const others = Object.keys(s.owner).filter((k) => k !== key && s.revealed[k] && !s.married[k]);
    if (!s.married[key] && others.length) return act({action: 'marry', mine: key, other: pick(others, rng)});
  }
  if (canUseEvent(s, id, ev('conquest')) && rng() < eager) {
    const targets = s.seats.filter((p) => p !== id).flatMap((p) => s.city[p]).filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u]));
    const allies = s.seats.filter((p) => p !== id);
    if (targets.length) return act({action: 'conquer', uid: pick(targets, rng), ally: rng() < 0.5 ? pick(allies, rng) : null, offer: 1});
  }
  if (canUseEvent(s, id, ev('extravagance')) && rng() < eager) {
    const total = s.hold[id].reduce((n, k) => n + charOf(k).charisma, 0);
    // Poorest first, then round again: as even as possible.
    const others = s.seats.filter((p) => p !== id).sort((a, b) => s.gold[a] - s.gold[b]);
    const gifts = {};
    for (let i = 0; i < total; i++) gifts[others[i % others.length]] = (gifts[others[i % others.length]] || 0) + 1;
    return act({action: 'extravagance', gifts});
  }
  const buildable = s.hand[id].filter((u) => canBuild(s, id, key, u)).sort((a, b) => costOf(s, b) - costOf(s, a));
  if (buildable.length) return act({action: 'build', uid: buildable[0]});
  return act({action: 'end'});
}

export const EVENT_KEYS = Object.keys(EVENTS);
