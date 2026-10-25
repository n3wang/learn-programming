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
  title: {en: 'Bets & Wagers', zh: '竞猜下注'},
  blurb: {
    en: 'Guess a number, then bet coins on whose guess is closest. Trivia decks from class.',
    zh: '先猜数字，再用金币押谁最接近。题库来自课堂。',
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
