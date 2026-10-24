/**
 * Bets & Wagers rules — pure functions, no network, no React.
 *
 * Every guess is a number of at most five digits (a decimal point allowed,
 * e.g. 343 or 3.14), so a phone never asks for more and the board fits on one
 * row. "Place it" questions skip guessing: players put coins on fixed options.
 */

import mathPack from '@site/src/data/party/math.json';
import physicsPack from '@site/src/data/party/physics.json';
import electronicsPack from '@site/src/data/party/electronics.json';
import roboticsPack from '@site/src/data/party/robotics.json';
import {PLACE_ODDS, placePack} from './placePack';

export const PACKS = [mathPack, physicsPack, electronicsPack, roboticsPack, placePack];
export {PLACE_ODDS};
/** The reusable A1 coin every seat always has. It is never spent. */
export const A1_COINS = 1;
export const WRITER_BONUS = 3;
/** The rare "smaller than all" slot, when it appears, pays 2 to 1. */
export const SMALLER_ODDS = 2;
export const MAX_ODDS = 5;
export const GUESS_SECONDS = 30;
export const BET_SECONDS = 30;
/** Coin questions have no guessing phase, so reading time goes into betting. */
export const PLACE_SECONDS = 40;
export const MIN_PLAYERS = 3;
/** Keep in sync with PartyRoom.MAX_MEMBERS in springbackend. */
export const MAX_PLAYERS = 12;
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

/** Random draw without repeats; `rng` is injectable for tests. */
export function pickQuestionIds(packIds, count, rng = Math.random) {
  const pool = questionsForPacks(packIds).map((q) => q.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
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
 * @param guesses {[playerId]: number}
 */
export function buildBoard(guesses, unit) {
  const unique = [];
  for (const [playerId, value] of Object.entries(guesses)) {
    if (!isValidGuess(value)) continue;
    const existing = unique.find((slot) => slot.value === value);
    if (existing) existing.authors.push(playerId);
    else unique.push({value, authors: [playerId]});
  }
  unique.sort((a, b) => a.value - b.value);

  const count = unique.length;
  const middles = count % 2 === 1 ? [(count - 1) / 2] : [count / 2 - 1, count / 2];
  const slots = unique.map((slot, i) => {
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
  let winner = null;
  for (const slot of board) {
    if (slot.value != null && slot.value <= Number(answer)) winner = slot.key;
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
 * at most its bank. Multiple-choice (`place`) may hold only one coin total.
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

/**
 * Score a number-line round in coins. Bank coins on the winning slot pay
 * amount × odds (those coins are spent). A1 on it pays the odds and returns.
 * Whoever wrote the winning guess gets a flat coin bonus.
 *
 * @returns {winner, deltas: {[playerId]: number}}
 */
export function settleRound({board, answer, bets, playerIds}) {
  const winner = winningSlotKey(board, answer);
  const winning = winner ? board.find((slot) => slot.key === winner) : null;
  const deltas = {};
  for (const playerId of playerIds) {
    const bonus = winning && winning.authors.includes(playerId) ? WRITER_BONUS : 0;
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
export function applyBotMoves(g, rng = Math.random) {
  const question = g.questionIds && g.questionIds[g.round] != null ? findQuestion(g.questionIds[g.round]) : null;
  if (!question) return false;
  let moved = false;
  for (const [playerId, player] of Object.entries(g.players || {})) {
    if (!isBot(player, playerId)) continue;
    if (g.phase === 'guess' && g.guesses[playerId] == null) {
      g.guesses[playerId] = botGuessValue(question, rng);
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

/** One per seat; MAX_PLAYERS of them. */
export const PLAYER_COLORS = [
  '#e4572e', '#17bebb', '#ffc914', '#76b041', '#8e44ad', '#2e86de',
  '#ff6f91', '#a0522d', '#00b894', '#636e72', '#1e3799', '#badc58',
];
