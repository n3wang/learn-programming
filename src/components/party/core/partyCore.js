/**
 * Shared rules plumbing for the /party games (everything except Bets & Wagers,
 * which keeps its own screens). Pure functions only: no React, no network.
 *
 * A game module (see ../registry.js) owns `g.state`; the shell owns the rest
 * of `g`: seats, names, avatars, bots, the room settings and the phase.
 */

import {isValidAvatar, randomAvatar, shuffleList, uniqueName, unitRandom} from '@site/src/components/BetsAndWagers/logic';
import {generateName, isGeneratedName} from '@site/src/components/BetsAndWagers/names';

/** Every game seats at least this many; more people join as audience. Keep ≤ PartyRoom.MAX_MEMBERS. */
export const MAX_SEATS = 16;
export const BOT_ID_PREFIX = 'bot:';
/** Wagers' twelve seat colours plus four more, so sixteen seats never share one. */
export const SEAT_COLORS = [
  '#e4572e', '#17bebb', '#ffc914', '#76b041', '#8e44ad', '#2e86de',
  '#ff6f91', '#a0522d', '#00b894', '#636e72', '#1e3799', '#badc58',
  '#f368e0', '#0abde3', '#ff9f43', '#5f27cd',
];

export const isBotId = (id) => String(id).startsWith(BOT_ID_PREFIX);

/** Test mode (`?test=1`): timers ×0.2, the seat inspector, voice muted. */
export function isTestMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('test') === '1';
}

/** `?seed=123` makes every shuffle repeatable so a bug can be replayed. */
export function makeRng(seed) {
  if (seed == null || seed === '') return unitRandom;
  let a = Number(seed) >>> 0 || 1;
  // mulberry32
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const shuffle = (list, rng) => shuffleList(list, rng);
export const pick = (list, rng) => list[Math.floor(rng() * list.length)];

export function newShellGame(gameId, mod, prefs = {}) {
  return {
    gameId,
    phase: 'lobby',
    players: {},
    nextBot: 1,
    lockedNames: prefs.lockedNames !== false,
    settings: {...(mod.defaultSettings || {})},
    state: null,
  };
}

/** Seats in join order; the seat number is fixed once a game starts. */
export function seatedIds(g) {
  return Object.keys(g.players).sort((a, b) => g.players[a].joinedAt - g.players[b].joinedAt);
}

export function seatPlayer(g, playerId, {name, avatar, bot = false}, now = Date.now()) {
  const used = Object.values(g.players).map((p) => p.color);
  g.players[playerId] = {
    name,
    avatar: isValidAvatar(avatar) ? avatar : bot ? randomAvatar() : null,
    color: SEAT_COLORS.find((c) => !used.includes(c)) || SEAT_COLORS[used.length % SEAT_COLORS.length],
    connected: true,
    bot,
    joinedAt: now + Object.keys(g.players).length / 1000,
    seat: 0,
  };
}

/** A phone's name as the room allows it: locked rooms keep generated names only. */
export function admittedName(g, wanted, lang) {
  const others = Object.values(g.players).map((p) => p.name);
  if (g.lockedNames && !isGeneratedName(wanted)) return generateName(lang, others);
  return uniqueName(wanted, others);
}

export function addBot(g, lang) {
  const n = g.nextBot || 1;
  g.nextBot = n + 1;
  const id = `${BOT_ID_PREFIX}${n}`;
  seatPlayer(g, id, {name: generateName(lang, Object.values(g.players).map((p) => p.name)), bot: true});
  return id;
}

/** Number seats 1…N in join order (the voice lines say "seat 3", never a name). */
export function numberSeats(g) {
  seatedIds(g).forEach((id, i) => {
    g.players[id].seat = i + 1;
  });
}

export function seatLabel(g, id, lang) {
  const p = g.players[id];
  if (!p) return '?';
  return lang === 'zh' ? `${p.seat}号` : `#${p.seat}`;
}

/** Seconds → milliseconds, shortened in test mode. */
export function duration(ctx, seconds) {
  return Math.round(seconds * 1000 * (ctx.speed || 1));
}

/**
 * Queue a voice line. The shell plays every cue it has not played yet (by
 * `seq`), so a reloaded host screen does not repeat old lines.
 */
export function cue(state, id, vars = {}) {
  state.cueSeq = (state.cueSeq || 0) + 1;
  state.cues = [...(state.cues || []).slice(-6), {seq: state.cueSeq, id, vars}];
}

/** "{seat}" in a voice line → the seat's spoken label. */
export function fillVars(text, vars, lang) {
  return text.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    if (v == null) return '';
    if (k === 'seat') return lang === 'zh' ? `${v}号` : `seat ${v}`;
    return String(v);
  });
}

/** A short public log line for the big screen. */
export function log(state, entry) {
  state.log = [...(state.log || []), entry].slice(-40);
}
