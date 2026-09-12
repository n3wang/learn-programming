import { randomCharacterId } from '../data/characters.js'
import { STAGES } from '../data/stages.js'

/** Opponent toggle order on the select screen. */
export const OPPONENT_MODES = ['human', 'cpu', 'online']

// Match configuration chosen once in CharacterSelectScene and read by
// FightScene / PauseScene / ResultScene. Not for per-frame data — see
// EventBus for that.
export const GameState = {
  p1Character: 'samurai',
  p2Character: 'kenji',
  stageId: STAGES[0].id,
  opponent: 'human', // 'human' | 'cpu' | 'online' — 1v1 / 1v PC / 1v1 online
  aiStrategy: 'rush', // createAiStrategy id
  mode: 'match', // 'match' | 'test'
  skipSelect: false,
  // Live online match, filled in by OnlineLobbyScene. `active` is the single
  // flag FightScene checks — everything online stays off when it is false.
  online: {
    active: false,
    role: null, // 'host' | 'guest'
    side: null, // 'p1' | 'p2'
    matchId: null,
    seed: 0,
    youName: '',
    opponentName: '',
    p1Name: '',
    p2Name: ''
  },
  /** Shared NetClient while an online match is live (null offline). */
  net: null
}

export function cycleOpponent() {
  const index = OPPONENT_MODES.indexOf(GameState.opponent)
  GameState.opponent = OPPONENT_MODES[(index + 1) % OPPONENT_MODES.length]
  return GameState.opponent
}

export function resetOnlineState() {
  GameState.online.active = false
  GameState.online.role = null
  GameState.online.side = null
  GameState.online.matchId = null
  GameState.online.seed = 0
  GameState.online.youName = ''
  GameState.online.opponentName = ''
  GameState.online.p1Name = ''
  GameState.online.p2Name = ''
}

/** Drops the socket too — call when leaving online play for good. */
export function teardownOnline() {
  if (GameState.net) {
    GameState.net.destroy()
    GameState.net = null
  }
  resetOnlineState()
}

export function randomizeCharacters() {
  GameState.p1Character = randomCharacterId()
  GameState.p2Character = randomCharacterId()
}
