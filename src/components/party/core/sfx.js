import {useEffect} from 'react';

/**
 * Party / quiz sound effects. Each file is loaded once per tab and replayed
 * from a small pool so a burst of taps does not refetch the mp3.
 */

const POOL = 3;

const SRC = {
  tap: '/audio/tiles/tile_select_01.wav',
  place: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Piece Impact - 1.mp3',
  place2: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Piece Impact - 2.mp3',
  move: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Piece Move - 1.mp3',
  deal: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Deck Deal - 1.mp3',
  deal2: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Deck Deal - 2.mp3',
  shuffle: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Deck Shuffle - 1.mp3',
  shuffle2: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Deck Shuffle - 2.mp3',
  dice: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Dice Roll - 1.mp3',
  pickup: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Dice Pickup - 1.mp3',
  flip: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Paper Flip - 1.mp3',
  move2: '/audio/decks/JDSherbert - Tabletop Games SFX Pack - Piece Move - 2.mp3',
  pop: '/audio/pops/bubble_pop_01.wav',
  invalid: '/audio/tiles/swap_invalid_01.wav',
  win: '/audio/game_flow/level_complete_01.wav',
  lose: '/audio/game_flow/level_fail_01.wav',
  start: '/audio/game_flow/level_start_01.wav',
  tick: '/audio/game_flow/timer_tick_01.wav',
  bonus: '/audio/rewards/bonus_01.wav',
  hint: '/audio/game_flow/hint_01.wav',
};

const ALIAS = {
  place: ['place', 'place2'],
  deal: ['deal', 'deal2'],
  shuffle: ['shuffle', 'shuffle2'],
  move: ['move', 'move2'],
};

/** url → HTMLAudioElement[] */
const nodes = new Map();
const pick = new Map();
let unlocked = false;
let primed = false;

function href(path) {
  return encodeURI(path);
}

function makeNode(url) {
  const audio = new Audio(href(url));
  audio.preload = 'auto';
  audio.setAttribute('playsinline', '');
  return audio;
}

function poolFor(url) {
  let list = nodes.get(url);
  if (!list) {
    list = [makeNode(url)];
    nodes.set(url, list);
  }
  return list;
}

function acquire(url) {
  const list = poolFor(url);
  let audio = list.find((node) => node.paused || node.ended);
  if (!audio && list.length < POOL) {
    audio = makeNode(url);
    list.push(audio);
  }
  if (!audio) audio = list[0];
  return audio;
}

/** Warm the catalog in the background. Safe to call more than once. */
export function preloadSfx() {
  if (typeof window === 'undefined' || primed) return;
  primed = true;
  Object.values(SRC).forEach((url) => {
    const audio = poolFor(url)[0];
    try {
      audio.load();
    } catch {
      // private mode
    }
  });
}

/**
 * iOS only starts download/play after a user gesture. Mute-play-rewind the
 * pool so later play() calls are allowed.
 */
export function unlockSfx() {
  if (typeof window === 'undefined' || unlocked) return;
  unlocked = true;
  preloadSfx();
  nodes.forEach((list) => {
    list.forEach((audio) => {
      audio.muted = true;
      const go = audio.play();
      if (go && typeof go.then === 'function') {
        go.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        }).catch(() => {
          audio.muted = false;
        });
      } else {
        audio.muted = false;
      }
    });
  });
}

/** Several deal/move hits in a row — a hand hitting the table. */
export function playSfxBurst(id, count = 3, gap = 85) {
  if (typeof window === 'undefined') return;
  const n = Math.max(1, Math.min(8, Number(count) || 1));
  for (let i = 0; i < n; i++) {
    window.setTimeout(() => playSfx(id, {volume: 0.72}), i * gap);
  }
}

/** Tabletop clip for a game voice cue (`round_start`, `draft`, `role_reveal`…). */
export function sfxForCue(id) {
  const key = String(id || '');
  if (/round_start|welcome|draw_start|dusk|day|^turn$/.test(key)) return 'start';
  if (/draft|role_reveal|nominate|draw|cards|reshuffle|fake_start|duo_swap|power_peek/.test(key)) return 'deal';
  if (/chaos|deadlock|shuffle/.test(key)) return 'shuffle';
  if (/vote_open|vote_start|^vote$/.test(key)) return 'tap';
  if (/vote_pass|law_liberal|claim_true|win_|everyone_right|reveal_truth/.test(key)) return 'win';
  if (/vote_fail|law_fascist|claim_false|nobody_right|slain|died|executed|player_out/.test(key)) return 'lose';
  if (/last_round|danger|overthrow|challenge|veto|ten_credits/.test(key)) return 'hint';
  if (/build_|audit|journalist|enacted|fake_start|keep/.test(key)) return 'flip';
  if (/crown|winner|bonus|round_end/.test(key)) return 'bonus';
  if (/destroyed|card_lost|caught_/.test(key)) return 'place';
  return null;
}

export function playCueSfx(id) {
  const sound = sfxForCue(id);
  if (!sound) return;
  if (sound === 'deal') playSfxBurst('deal', 4, 75);
  else if (sound === 'start') {
    playSfx('start');
    playSfxBurst('deal', 3, 80);
  } else playSfx(sound);
}

/** Play a named clip. Overlapping taps reuse a free node or restart the oldest. */
export function playSfx(id, {volume = 0.85} = {}) {
  if (typeof window === 'undefined') return;
  const names = ALIAS[id] || [id];
  const n = (pick.get(id) || 0) % names.length;
  pick.set(id, n + 1);
  const url = SRC[names[n]];
  if (!url) return;
  const audio = acquire(url);
  audio.volume = volume;
  audio.muted = false;
  try {
    audio.currentTime = 0;
  } catch {
    // not loaded yet
  }
  audio.play().catch(() => {});
}

/** Cached play for one-off URLs (host voice lines). */
export function playUrl(url, {onError} = {}) {
  if (typeof window === 'undefined' || !url) return Promise.resolve();
  const audio = acquire(url);
  audio.onerror = onError || null;
  try {
    audio.currentTime = 0;
  } catch {
    // not loaded yet
  }
  const go = audio.play();
  if (onError && go && typeof go.catch === 'function') go.catch(onError);
  return go || Promise.resolve();
}

/** Preload the catalog and unlock on the first tap anywhere on this page. */
export function usePartySfx() {
  useEffect(() => {
    preloadSfx();
    const unlock = () => unlockSfx();
    window.addEventListener('pointerdown', unlock, {capture: true, once: true});
    window.addEventListener('keydown', unlock, {capture: true, once: true});
    return () => {
      window.removeEventListener('pointerdown', unlock, {capture: true});
      window.removeEventListener('keydown', unlock, {capture: true});
    };
  }, []);
}
