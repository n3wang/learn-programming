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
import {PLACE_ODDS, placePack} from './placePack';

export const PACKS = [mathPack, physicsPack, electronicsPack, placePack];
export {PLACE_ODDS};
export const FREE_CHIPS = 2;
export const WRITER_BONUS = 3;
export const SMALLER_ODDS = 6;
export const MAX_ODDS = 5;
export const GUESS_SECONDS = 30;
export const BET_SECONDS = 30;
/** Coin questions have no guessing phase, so reading time goes into betting. */
export const PLACE_SECONDS = 40;
export const MIN_PLAYERS = 3;
/** Keep in sync with PartyRoom.MAX_MEMBERS in springbackend. */
export const MAX_PLAYERS = 12;
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
 * 2 to 1, each step outward pays one more, capped at 5 to 1. The fixed
 * "smaller than all" slot pays 6 to 1.
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

/** Highest guess that does not go over the answer; "smaller" when all are over. */
export function winningSlotKey(board, answer) {
  let winner = SMALLER_KEY;
  for (const slot of board) {
    if (slot.value != null && slot.value <= Number(answer)) winner = slot.key;
  }
  return winner;
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

/**
 * Score a coin question: each coin on the right option pays PLACE_ODDS, coins
 * elsewhere are lost, and coins beyond the free ones still cost points.
 */
export function settlePlace({question, bets, playerIds}) {
  const deltas = {};
  for (const playerId of playerIds) {
    const chips = bets[playerId] || [];
    const placed = chips.reduce((sum, chip) => sum + chip.amount, 0);
    const paid = Math.max(0, placed - FREE_CHIPS);
    const won = chips.filter((chip) => chip.slot === question.answer).reduce((sum, chip) => sum + chip.amount, 0);
    deltas[playerId] = won * PLACE_ODDS - paid;
  }
  return {winner: question.answer, deltas};
}

/** How many chips a player may place: the free ones plus points already banked. */
export function chipAllowance(score) {
  return FREE_CHIPS + Math.max(0, Math.floor(score || 0));
}

/** Drop unknown slots and bad amounts; refuse a bet over the allowance. */
export function sanitizeBet(chips, board, score) {
  if (!Array.isArray(chips)) return null;
  const keys = new Set(board.map((slot) => slot.key));
  const totals = new Map();
  for (const chip of chips) {
    const amount = Math.floor(Number(chip && chip.amount));
    if (!chip || !keys.has(chip.slot) || !(amount > 0)) continue;
    totals.set(chip.slot, (totals.get(chip.slot) || 0) + amount);
  }
  const clean = [...totals].map(([slot, amount]) => ({slot, amount}));
  const placed = clean.reduce((sum, chip) => sum + chip.amount, 0);
  return placed <= chipAllowance(score) ? clean : null;
}

/**
 * Score one round. Chips on the winning slot pay amount × odds. Chips beyond
 * the free ones are paid for out of the player's score, win or lose. Whoever
 * wrote the winning guess gets a flat bonus.
 *
 * @returns {winner, deltas: {[playerId]: number}}
 */
export function settleRound({board, answer, bets, playerIds}) {
  const winner = winningSlotKey(board, answer);
  const winning = board.find((slot) => slot.key === winner);
  const deltas = {};
  for (const playerId of playerIds) {
    const chips = bets[playerId] || [];
    const placed = chips.reduce((sum, chip) => sum + chip.amount, 0);
    const paid = Math.max(0, placed - FREE_CHIPS);
    const won = chips
      .filter((chip) => chip.slot === winner)
      .reduce((sum, chip) => sum + chip.amount * winning.odds, 0);
    const bonus = winning.authors.includes(playerId) ? WRITER_BONUS : 0;
    deltas[playerId] = won + bonus - paid;
  }
  return {winner, deltas};
}

/** Highest score first; equal scores share a rank. */
export function rankPlayers(players) {
  const sorted = Object.entries(players)
    .map(([playerId, p]) => ({playerId, name: p.name, color: p.color, avatar: p.avatar, score: p.score}))
    .sort((a, b) => b.score - a.score);
  let rank = 0;
  return sorted.map((row, i) => {
    if (i === 0 || row.score !== sorted[i - 1].score) rank = i + 1;
    return {...row, rank};
  });
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
