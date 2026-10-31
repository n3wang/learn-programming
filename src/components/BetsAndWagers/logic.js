/**
 * Bets & Wagers rules — pure functions, no network, no React.
 *
 * Every guess is a number of at most five digits (a decimal point allowed,
 * e.g. 343 or 3.14), so a phone never asks for more and the board fits on one
 * row. "Place it" questions skip guessing: players put coins on fixed options.
 */

import grade7Pack from '@site/src/data/party/grade7.json';
import grade8Pack from '@site/src/data/party/grade8.json';
import classicPack from '@site/src/data/party/classic.json';
import electronicsPack from '@site/src/data/party/electronics.json';
import {PLACE_ODDS, placePack} from './placePack';
import {noteFor} from '@site/src/data/party/notes';

export const PACKS = [grade7Pack, grade8Pack, classicPack, electronicsPack, placePack];
/** Deck ids from older saved games → the deck that now holds their questions. */
const RENAMED_PACKS = {math: 'classic', physics: 'classic', robotics: 'electronics'};

/** A saved deck selection with old ids mapped forward and unknown ones dropped; all decks if nothing is left. */
export function migratePackIds(packIds) {
  const known = new Set(PACKS.map((pack) => pack.id));
  const ids = (Array.isArray(packIds) ? packIds : []).map((id) => RENAMED_PACKS[id] || id).filter((id) => known.has(id));
  return ids.length ? [...new Set(ids)] : PACKS.map((pack) => pack.id);
}
export {PLACE_ODDS};
/** The reusable A1 coin every seat always has. It is never spent. */
export const A1_COINS = 1;
export const WRITER_BONUS = 2;
/** Card owners whose guess is this close to the real answer earn CLOSE_BONUS. */
export const CLOSE_RANGE = 5;
export const CLOSE_BONUS = 1;
/** Bank coins every seat starts a game with (A1 is separate and always present). */
export const STARTING_COINS = 3;
/** Bank + A1 on one answer. Stops a fat pile on a single card. */
export const MAX_SLOT_COINS = 10;
/** Distinct number-line answers on the board, after grouping identical guesses. */
export const MAX_ANSWERS = 12;
/** The rare "smaller than all" slot, when it appears, pays 2 to 1. */
export const SMALLER_ODDS = 2;
export const MAX_ODDS = 5;
export const GUESS_SECONDS = 30;
export const BET_SECONDS = 30;
/** Coin questions have no guessing phase, so reading time goes into betting. */
export const PLACE_SECONDS = 40;
export const MIN_PLAYERS = 3;
/** Keep in sync with PartyRoom.MAX_MEMBERS in springbackend. */
export const MAX_PLAYERS = 64;
/** Host-only seats. They never join the relay. */
export const BOT_ID_PREFIX = 'bot:';
export const ROUND_CHOICES = [5, 7, 10];
export const SMALLER_KEY = 'smaller';
export const MAX_GUESS_DIGITS = 5;
/** Pictures in static/avatars: avatar1.png … avatar43.png. */
export const AVATAR_COUNT = 43;
export const MAX_GUESS = 10 ** MAX_GUESS_DIGITS - 1;

// ---------------------------------------------------------------- numbers

/** How many digits a typed number uses, the decimal point not counted. */
export function digitCount(text) {
  return String(text).replace(/\D/g, '').length;
}

/** "1,876" → 1876, "3.14" → 3.14. Null unless it is a number of 1 to 5 digits. */
export function parseGuess(text) {
  if (text == null) return null;
  const cleaned = String(text).replace(/[\s,]/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned) || digitCount(cleaned) > MAX_GUESS_DIGITS) return null;
  return Number(cleaned);
}

/** What the host accepts from a phone: a number in range with at most 5 digits. */
export function isValidGuess(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_GUESS) return false;
  return digitCount(String(value).replace(/^0\./, '.')) <= MAX_GUESS_DIGITS;
}

/** 86400 → "86,400", 3.5 → "3.5", but a year stays "1895". */
export function formatNumber(value, unit) {
  return unit === 'year' ? String(value) : Number(value).toLocaleString('en-US', {maximumFractionDigits: 4});
}

/** " km" after a number; nothing for years ("1895", not "1895 year"). */
export function unitSuffix(question, lang = 'en') {
  if (!question) return '';
  if (lang === 'zh') {
    // Chinese keeps 年 for years ("1905年") and puts other units after a space.
    if (!question.unitZh) return '';
    return question.unit === 'year' ? question.unitZh : ` ${question.unitZh}`;
  }
  return question.unit && question.unit !== 'year' ? ` ${question.unit}` : '';
}

/** The read-back under the guess box: "= 12,742 km", "= 1895", "= 1905年". */
export function describeGuess(value, question, lang = 'en') {
  return formatNumber(value, question && question.unit) + unitSuffix(question, lang);
}

/** A question's text, topic and image alt in the screen's language. */
export function localized(question, lang) {
  if (!question) return null;
  const zh = lang === 'zh';
  return {
    text: (zh && question.textZh) || question.text,
    topic: (zh && question.topicZh) || question.topic,
    alt: question.image ? (zh && question.image.altZh) || question.image.alt : '',
    note: noteFor(question, lang),
  };
}

// ---------------------------------------------------------------- reactions

/** The six emoji a phone can send; the host shows only these. */
export const REACTIONS = [
  {key: 'laugh', emoji: '😂'},
  {key: 'sad', emoji: '😢'},
  {key: 'confused', emoji: '😕'},
  {key: 'wow', emoji: '😮'},
  {key: 'thumbs', emoji: '👍'},
  {key: 'party', emoji: '🎉'},
];

export function reactionEmoji(key) {
  const found = REACTIONS.find((r) => r.key === key);
  return found ? found.emoji : null;
}

// ---------------------------------------------------------------- avatars

export function isValidAvatar(n) {
  return Number.isInteger(n) && n >= 1 && n <= AVATAR_COUNT;
}

export function avatarPath(n) {
  return `/avatars/avatar${n}.png`;
}

export function randomAvatar(rng = Math.random) {
  return 1 + Math.floor(rng() * AVATAR_COUNT);
}

// ---------------------------------------------------------------- questions

export function questionsForPacks(packIds) {
  return PACKS.filter((pack) => packIds.includes(pack.id)).flatMap((pack) =>
    pack.questions.map((q) => ({...q, topic: pack.title, topicZh: pack.titleZh})),
  );
}

/** Fresh 0…1 each call. Math.random is the fallback if crypto is a webpack stub. */
export function unitRandom() {
  const web = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (web && typeof web.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    web.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
}

export function shuffleList(items, rng = unitRandom) {
  const list = items.slice();
  const roll = typeof rng === 'function' ? rng : unitRandom;
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(roll() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/**
 * Random hand for one game. Each selected pack is shuffled, pack order is
 * shuffled, then we draw round-robin so a fat pack cannot flood the set.
 * IDs in `avoid` (recent games) are used only after every unused id is taken.
 */
export function pickQuestionIds(packIds, count, rng = unitRandom, avoid = []) {
  const roll = typeof rng === 'function' ? rng : unitRandom;
  const avoidSet = new Set(Array.isArray(avoid) ? avoid : []);
  const groups = shuffleList(
    PACKS.filter((pack) => packIds.includes(pack.id))
      .map((pack) => shuffleList(pack.questions.map((q) => q.id), roll))
      .filter((ids) => ids.length),
    roll,
  );
  if (!groups.length) return [];

  const pool = groups.reduce((n, ids) => n + ids.length, 0);
  const want = Math.min(Math.max(0, Number(count) || 0), pool);
  if (!want) return [];

  const picked = [];
  const leftover = [];
  let gi = Math.floor(roll() * groups.length);
  while (picked.length + leftover.length < want && groups.some((ids) => ids.length)) {
    const group = groups[gi % groups.length];
    gi += 1;
    if (!group.length) continue;
    const id = group.shift();
    if (avoidSet.has(id)) leftover.push(id);
    else picked.push(id);
  }
  const fill = shuffleList(leftover, roll);
  while (picked.length < want && fill.length) picked.push(fill.shift());
  return shuffleList(picked, roll);
}

export function findQuestion(id) {
  for (const pack of PACKS) {
    const q = pack.questions.find((item) => item.id === id);
    if (q) return {...q, topic: pack.title, topicZh: pack.titleZh};
  }
  return null;
}

// ---------------------------------------------------------------- board

/**
 * Sort guesses into slots. The middle guess (or the two middle guesses) pays
 * 2 to 1, each step outward pays one more, capped at 5 to 1.
 *
 * Identical numbers share a slot. If more than MAX_ANSWERS distinct values
 * arrived, keep the MAX_ANSWERS whose first lock came in first (speed).
 *
 * @param guesses {[playerId]: number}
 * @param arrivedAt {[playerId]: number} first-lock timestamps
 */
export function buildBoard(guesses, unit, arrivedAt = {}) {
  const unique = [];
  let seen = 0;
  for (const [playerId, value] of Object.entries(guesses)) {
    if (!isValidGuess(value)) continue;
    const at = Number(arrivedAt[playerId]);
    const stamp = Number.isFinite(at) ? at : seen;
    const existing = unique.find((slot) => slot.value === value);
    if (existing) {
      existing.authors.push(playerId);
      existing.firstAt = Math.min(existing.firstAt, stamp);
    } else {
      unique.push({value, authors: [playerId], firstAt: stamp, order: seen});
    }
    seen += 1;
  }
  unique.sort((a, b) => a.firstAt - b.firstAt || a.order - b.order);
  const kept = unique.slice(0, MAX_ANSWERS);
  kept.sort((a, b) => a.value - b.value);

  const count = kept.length;
  const middles = count % 2 === 1 ? [(count - 1) / 2] : [count / 2 - 1, count / 2];
  const slots = kept.map((slot, i) => {
    const distance = Math.min(...middles.map((m) => Math.abs(i - m)));
    return {
      key: `s${i + 1}`,
      value: slot.value,
      label: formatNumber(slot.value, unit),
      odds: Math.min(2 + distance, MAX_ODDS),
      authors: slot.authors,
    };
  });
  return [{key: SMALLER_KEY, value: null, label: 'Smaller than all', odds: SMALLER_ODDS, authors: []}, ...slots];
}

/** Highest guess that does not go over the answer. If every guess is over,
 *  "smaller" wins only when that slot is actually on the board. */
export function winningSlotKey(board, answer) {
  const target = typeof answer === 'number' && Number.isFinite(answer) ? answer : parseGuess(answer);
  if (target == null) {
    return board.some((slot) => slot.key === SMALLER_KEY) ? SMALLER_KEY : null;
  }
  let winner = null;
  for (const slot of board) {
    if (slot.value == null) continue;
    const value = Number(slot.value);
    if (!Number.isFinite(value)) continue;
    if (value <= target) winner = slot.key;
  }
  if (winner) return winner;
  return board.some((slot) => slot.key === SMALLER_KEY) ? SMALLER_KEY : null;
}

/** A coin question's options as board slots, all paying PLACE_ODDS. */
export function placeBoard(question) {
  return question.options.map((option) => ({
    key: option.key,
    value: null,
    label: option.label,
    detail: option.detail,
    odds: PLACE_ODDS,
    authors: [],
  }));
}

/** Bank coins a seat actually holds. Older saves stored this as `score`. */
export function playerCoins(player) {
  if (!player) return 0;
  if (typeof player.coins === 'number' && Number.isFinite(player.coins)) {
    return Math.max(0, Math.floor(player.coins));
  }
  return Math.max(0, Math.floor(player.score || 0));
}

export function isBotId(playerId) {
  return typeof playerId === 'string' && playerId.startsWith(BOT_ID_PREFIX);
}

export function isBot(player, playerId) {
  return Boolean(player && player.bot) || isBotId(playerId);
}

/** First unused seat colour, wrapping the palette if a room somehow fills it. */
export function nextPlayerColor(used = []) {
  return PLAYER_COLORS.find((c) => !used.includes(c)) || PLAYER_COLORS[used.length % PLAYER_COLORS.length];
}

export function normalizePlayer(player) {
  if (!player) return player;
  player.coins = playerCoins(player);
  player.bot = Boolean(player.bot);
  return player;
}

/** A1 (always 1) plus banked coins that can actually be lost. */
export function chipAllowance(player) {
  return A1_COINS + playerCoins(player);
}

function chipCount(chip) {
  return (chip.a1 ? 1 : 0) + Math.max(0, Math.floor(Number(chip.amount) || 0));
}

/** How many coins (A1 + bank) sit on one slot across every locked bet. */
export function slotCoinCount(bets, slotKey) {
  let total = 0;
  for (const chips of Object.values(bets || {})) {
    for (const chip of chips || []) {
      if (chip.slot === slotKey) total += chipCount(chip);
    }
  }
  return total;
}

/** Coloured tokens on a slot, A1 first, so the board can draw the pile. */
export function slotTokens(bets, players, slotKey) {
  const tokens = [];
  for (const [playerId, chips] of Object.entries(bets || {})) {
    const player = players[playerId];
    if (!player) continue;
    for (const chip of chips || []) {
      if (chip.slot !== slotKey) continue;
      if (chip.a1) tokens.push({playerId, name: player.name, color: player.color, avatar: player.avatar, kind: 'a1'});
      const bank = Math.max(0, Math.floor(Number(chip.amount) || 0));
      for (let i = 0; i < bank; i++) tokens.push({playerId, name: player.name, color: player.color, avatar: player.avatar, kind: 'bank'});
    }
  }
  return tokens;
}

function settleChips(chips, winnerKey, odds, writerBonus = 0) {
  let bank = 0;
  let bankWon = 0;
  let a1Won = false;
  for (const chip of chips || []) {
    const amount = Math.max(0, Math.floor(Number(chip.amount) || 0));
    bank += amount;
    if (chip.slot !== winnerKey) continue;
    bankWon += amount;
    if (chip.a1) a1Won = true;
  }
  // Bank coins are spent. A1 always returns, and pays `odds` extra coins on a hit.
  return -bank + bankWon * odds + (a1Won ? odds : 0) + writerBonus;
}

/**
 * Score a multiple-choice question in coins: A1 on the right option pays
 * PLACE_ODDS and comes back; bank coins on it pay the same and are returned
 * in the payout. Coins on any other option are lost (A1 still returns).
 */
export function settlePlace({question, bets, playerIds}) {
  const deltas = {};
  for (const playerId of playerIds) {
    deltas[playerId] = settleChips(bets[playerId], question.answer, PLACE_ODDS);
  }
  return {winner: question.answer, deltas};
}

/**
 * Drop unknown slots and bad amounts. Each seat may place its one A1 plus
 * at most its bank, and at most MAX_SLOT_COINS on one answer. Multiple-choice
 * (`place`) may hold only one coin total.
 */
export function sanitizeBet(chips, board, player, options = {}) {
  if (!Array.isArray(chips) || !board) return null;
  const keys = new Set(board.map((slot) => slot.key));
  const bySlot = new Map();
  let a1Count = 0;
  for (const chip of chips) {
    if (!chip || !keys.has(chip.slot)) continue;
    const amount = Math.max(0, Math.floor(Number(chip.amount) || 0));
    const a1 = chip.a1 ? 1 : 0;
    if (!amount && !a1) continue;
    a1Count += a1;
    const prev = bySlot.get(chip.slot) || {slot: chip.slot, amount: 0, a1: 0};
    prev.amount += amount;
    prev.a1 += a1;
    const room = MAX_SLOT_COINS - (prev.a1 ? 1 : 0);
    prev.amount = Math.min(prev.amount, Math.max(0, room));
    bySlot.set(chip.slot, prev);
  }
  if (a1Count > 1) return null;
  const clean = [...bySlot.values()].filter((chip) => chip.amount > 0 || chip.a1);
  const bank = clean.reduce((sum, chip) => sum + chip.amount, 0);
  const tokens = bank + a1Count;
  if (bank > playerCoins(player)) return null;
  if (options.place && tokens > 1) return null;
  return clean;
}

/** True when a submitted guess sits within CLOSE_RANGE of the real answer. */
export function isCloseGuess(value, answer) {
  const target = typeof answer === 'number' && Number.isFinite(answer) ? answer : parseGuess(answer);
  if (target == null || typeof value !== 'number' || !Number.isFinite(value)) return false;
  return Math.abs(value - target) <= CLOSE_RANGE;
}

/**
 * Score a number-line round in coins. Bank coins on the winning slot pay
 * amount × odds (those coins are spent). A1 on it pays the odds and returns.
 * Whoever wrote the winning guess gets a flat coin bonus. Owners of a guess
 * within CLOSE_RANGE of the answer also get CLOSE_BONUS (stacks with writer).
 *
 * @returns {winner, deltas: {[playerId]: number}}
 */
export function settleRound({board, answer, bets, playerIds}) {
  const winner = winningSlotKey(board, answer);
  const winning = winner ? board.find((slot) => slot.key === winner) : null;
  const closeAuthors = new Set();
  for (const slot of board || []) {
    if (slot.value == null || !isCloseGuess(slot.value, answer)) continue;
    for (const id of slot.authors) closeAuthors.add(id);
  }
  const deltas = {};
  for (const playerId of playerIds) {
    let bonus = 0;
    if (winning && winning.authors.includes(playerId)) bonus += WRITER_BONUS;
    if (closeAuthors.has(playerId)) bonus += CLOSE_BONUS;
    deltas[playerId] = settleChips(bets[playerId], winner, winning ? winning.odds : 0, bonus);
  }
  return {winner, deltas};
}

/** Most coins first; equal piles share a rank. */
export function rankPlayers(players) {
  const sorted = Object.entries(players)
    .map(([playerId, p]) => ({
      playerId,
      name: p.name,
      color: p.color,
      avatar: p.avatar,
      bot: Boolean(p.bot),
      coins: playerCoins(p),
    }))
    .sort((a, b) => b.coins - a.coins);
  let rank = 0;
  return sorted.map((row, i) => {
    if (i === 0 || row.coins !== sorted[i - 1].coins) rank = i + 1;
    return {...row, rank};
  });
}

/** A slightly messy guess around the real answer, so bots look like a class. */
export function botGuessValue(question, rng = Math.random) {
  const answer = Number(question && question.answer);
  let value;
  if (question && question.unit === 'year' && Number.isFinite(answer)) {
    value = Math.round(answer + (rng() - 0.42) * (16 + rng() * 70));
  } else if (Number.isFinite(answer) && answer > 0) {
    const noise = (rng() - 0.38) * (0.35 + rng() * 0.85);
    value = 10 ** (Math.log10(answer) + noise);
    value = answer >= 20 || Number.isInteger(answer) ? Math.round(value) : Math.round(value * 100) / 100;
  } else {
    value = Math.round(rng() * 900);
  }
  if (!(value >= 0)) value = 0;
  if (digitCount(String(value)) > MAX_GUESS_DIGITS) {
    value = Number(String(Math.floor(Math.abs(value))).slice(0, MAX_GUESS_DIGITS));
  }
  return isValidGuess(value) ? value : Math.min(MAX_GUESS, Math.max(0, Math.round(Math.abs(Number(value)) || 1)));
}

/** One A1, sometimes a spare bank coin, biased toward the bot's own guess. */
export function botChips(question, board, player, playerId, rng = Math.random) {
  if (!board || !board.length) return [];
  const place = question && question.type === 'place';
  let slot;
  if (place) {
    slot = rng() < 0.35 ? board.find((s) => s.key === question.answer) : board[Math.floor(rng() * board.length)];
  } else {
    const own = board.find((s) => s.authors.includes(playerId));
    if (rng() < 0.16) slot = board[0];
    else slot = own && rng() < 0.7 ? own : board[1 + Math.floor(rng() * Math.max(1, board.length - 1))];
  }
  if (!slot) slot = board[0];
  const spend = place ? 0 : Math.min(playerCoins(player), rng() < 0.45 ? 1 + Math.floor(rng() * 2) : 0);
  return [{slot: slot.key, amount: spend, a1: 1}];
}

/** Fill in any bot that has not guessed or bet yet. Returns whether anyone moved. */
export function applyBotMoves(g, rng = Math.random, now = Date.now()) {
  const question = g.questionIds && g.questionIds[g.round] != null ? findQuestion(g.questionIds[g.round]) : null;
  if (!question) return false;
  let moved = false;
  let stamp = now;
  for (const [playerId, player] of Object.entries(g.players || {})) {
    if (!isBot(player, playerId)) continue;
    if (g.phase === 'guess' && g.guesses[playerId] == null) {
      g.guesses[playerId] = botGuessValue(question, rng);
      if (!g.guessAt) g.guessAt = {};
      g.guessAt[playerId] = stamp;
      stamp += 1;
      moved = true;
    }
    if (g.phase === 'bet' && g.board && g.bets[playerId] == null) {
      g.bets[playerId] = botChips(question, g.board, player, playerId, rng);
      moved = true;
    }
  }
  return moved;
}

/** "Sam" twice becomes "Sam 2". */
export function uniqueName(name, takenNames) {
  if (!takenNames.includes(name)) return name;
  let n = 2;
  while (takenNames.includes(`${name} ${n}`)) n += 1;
  return `${name} ${n}`;
}

/** Seat colours; extras wrap this palette. */
export const PLAYER_COLORS = [
  '#e4572e', '#17bebb', '#ffc914', '#76b041', '#8e44ad', '#2e86de',
  '#ff6f91', '#a0522d', '#00b894', '#636e72', '#1e3799', '#badc58',
];
