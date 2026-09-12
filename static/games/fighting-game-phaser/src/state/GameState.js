import { randomCharacterId } from '../data/characters.js'
import { STAGES } from '../data/stages.js'

// Match configuration chosen once in CharacterSelectScene and read by
// FightScene / PauseScene / ResultScene. Not for per-frame data — see
// EventBus for that.
export const GameState = {
  p1Character: 'samurai',
  p2Character: 'kenji',
  stageId: STAGES[0].id,
  mode: 'match', // 'match' | 'test'
  skipSelect: false
}

export function randomizeCharacters() {
  GameState.p1Character = randomCharacterId()
  GameState.p2Character = randomCharacterId()
}
