import fibpics from './games/fibpics';
import powergrab from './games/powergrab';
import secrethitler from './games/secrethitler';
import sultan from './games/sultan';
import clocktower from './games/clocktower';

/**
 * Every game on the /party menu. Bets & Wagers keeps its own host/phone
 * screens (src/components/BetsAndWagers); the others run in the shared
 * shell (core/HostShell, core/PlayerShell) and follow the module contract
 * documented in core/HostShell.js.
 */
export const WAGERS = {
  id: 'wagers',
  emoji: '🎲',
  title: {en: 'School Quiz', zh: '课堂测验'},
  blurb: {
    en: 'Class trivia: guess the number, then pick the closest answer.',
    zh: '课堂问答：先猜数字，再选最接近的答案。',
  },
  players: {min: 3, max: 64},
  minutes: 15,
  coverTint: '#ffc914',
};

export const GAMES = [fibpics, powergrab, secrethitler, sultan, clocktower];

/** What the /party menu shows, Wagers first. */
export const MENU = [WAGERS, ...GAMES];

export function findGame(id) {
  return GAMES.find((game) => game.id === id) || null;
}
