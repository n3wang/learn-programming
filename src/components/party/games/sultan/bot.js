/**
 * City of the Sultan bots: one move at a time, pure (shared by the game and
 * the headless tests). They use every ability and event now and then.
 */

import {DISTRICT, EVENTS, charOf} from './data';
import {acting, canBuild, canPick, canUseEvent, generalTargets, hiddenPlayers, nameableNumbers, officialTargets, picksLeft, statOf} from './rules';

const pick = (list, rng) => list[Math.floor(rng() * list.length)];
const costOf = (s, uid) => DISTRICT[s.cards[uid]].cost;

function answerPrompt(s, id, rng) {
  const p = s.prompt;
  switch (p.kind) {
    case 'shield':
      return {action: 'answer', yes: rng() < 0.6};
    case 'raise':
      return {action: 'answer', bet: 1 + Math.floor(rng() * p.max)};
    case 'champion': {
      const best = [...s.hold[id]].sort((a, b) => statOf(b, 'combat') - statOf(a, 'combat'))[0];
      return {action: 'answer', card: best};
    }
    default:
      return {action: 'answer', yes: rng() < 0.5};
  }
}

export function botMove(s, id, rng) {
  if (s.over) return null;
  if (s.prompt) return s.prompt.to === id ? answerPrompt(s, id, rng) : null;
  if (s.phase === 'draft') {
    if (picksLeft(s, id) < 1) return null;
    const options = s.draft.available.filter((k) => canPick(s, id, k));
    return options.length ? {action: 'draft', card: pick(options, rng)} : null;
  }
  if (s.phase === 'pyrrhic') {
    const ev = s.events.find((e) => e.kind === 'pyrrhic');
    const foes = s.seats.filter((p) => p !== id && s.hold[p].length);
    if (canUseEvent(s, id, ev) && foes.length && rng() < 0.15) return {action: 'challenge', target: pick(foes, rng)};
    return null;
  }
  if (s.phase !== 'call' || !s.turn) return null;
  const key = s.turn.cards.find((k) => acting(s, id, k));
  if (!key) return null;
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
  // Events, now and then.
  const ev = (kind) => s.events.find((e) => e.kind === kind);
  if (canUseEvent(s, id, ev('marriage')) && !t.dated[key] && rng() < 0.3) {
    const others = Object.keys(s.owner).filter((k) => k !== key && s.revealed[k] && !s.married[k]);
    if (!s.married[key] && others.length) return act({action: 'marry', mine: key, other: pick(others, rng)});
  }
  if (canUseEvent(s, id, ev('conquest')) && rng() < 0.3) {
    const targets = s.seats.filter((p) => p !== id).flatMap((p) => s.city[p]).filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u]));
    const allies = s.seats.filter((p) => p !== id);
    if (targets.length) return act({action: 'conquer', uid: pick(targets, rng), ally: rng() < 0.5 ? pick(allies, rng) : null, offer: 1});
  }
  if (canUseEvent(s, id, ev('extravagance')) && rng() < 0.3) {
    const total = s.hold[id].reduce((n, k) => n + charOf(k).charisma, 0);
    const others = s.seats.filter((p) => p !== id);
    const gifts = {};
    for (let i = 0; i < total; i++) gifts[others[i % others.length]] = (gifts[others[i % others.length]] || 0) + 1;
    return act({action: 'extravagance', gifts});
  }
  const buildable = s.hand[id].filter((u) => canBuild(s, id, key, u)).sort((a, b) => costOf(s, b) - costOf(s, a));
  if (buildable.length) return act({action: 'build', uid: buildable[0]});
  return act({action: 'end'});
}

export const EVENT_KEYS = Object.keys(EVENTS);
