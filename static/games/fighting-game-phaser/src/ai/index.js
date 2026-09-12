/**
 * AI agent API surface — Strategy + State patterns.
 *
 * Controllers:
 *   AiController — pollIntent() like InputController / DummyController
 *
 * Strategies (switchable personalities):
 *   createAiStrategy('rush') — Approach → Attack → Recover
 *   Register more in strategies/registry.js
 *
 * States live under states/; each update() returns { intent, nextState? }.
 */
export { AiController } from './AiController.js'
export { AiStrategy } from './AiStrategy.js'
export { AiState } from './AiState.js'
export { createAiStrategy, listAiStrategies } from './strategies/registry.js'
export {
  emptyIntent,
  buildAiContext,
  hurtboxGap,
  dirToward,
  attackReach,
  canAffordAttack
} from './AiContext.js'
