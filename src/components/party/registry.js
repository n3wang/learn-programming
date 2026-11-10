import fibpics from './games/fibpics';
import powergrab from './games/powergrab';
import secrethitler from './games/secrethitler';
import sultan from './games/sultan';
import clocktower from './games/clocktower';
import university from './games/university';
import lifesim from './games/lifesim';

/**
 * Every game on the /party menu. Bets & Wagers keeps its own host/phone
 * screens (src/components/BetsAndWagers); the others run in the shared
 * shell (core/HostShell, core/PlayerShell) and follow the module contract
 * documented in core/HostShell.js.
 *
 * Modules with `externalUrl` skip HostShell and open a QR desk page instead.
 */
export const WAGERS = {
  id: 'wagers',
  logo: 'clocktower/role-gambler.webp',
  title: {en: 'Math and Wagers', zh: '数学与竞猜'},
  blurb: {
    en: 'Roll your math. Knowledge and strategy.',
    zh: '用数学开局。知识与策略。',
  },
  players: {min: 3, max: 64},
  minutes: 15,
  coverTint: '#ffc914',
};

export const GAMES = [fibpics, powergrab, secrethitler, sultan, clocktower, university, lifesim];

/** Games left off the /party menu for now; their host links (/party/host?game=…) still work. */
const HIDDEN = ['fibpics', 'clocktower', 'secrethitler'];

/** What the /party menu shows, Wagers first. */
export const MENU = [WAGERS, ...GAMES.filter((game) => !HIDDEN.includes(game.id))];

export function findGame(id) {
  return GAMES.find((game) => game.id === id) || null;
}
