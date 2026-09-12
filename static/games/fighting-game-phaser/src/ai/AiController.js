import { buildAiContext, emptyIntent } from './AiContext.js'
import { createAiStrategy } from './strategies/registry.js'

function emptyIntentFallback() {
  return emptyIntent()
}

/**
 * Drop-in controller with the same pollIntent() contract as InputController /
 * DummyController. Holds a Strategy; the Strategy owns a State machine.
 *
 * FightScene wires this for P2 when GameState.opponent === 'cpu'.
 */
export class AiController {
  /**
   * @param {object} self Fighter this AI drives
   * @param {object} opponent Fighter to react to
   * @param {import('./AiStrategy.js').AiStrategy} [strategy]
   */
  constructor(self, opponent, strategy = createAiStrategy('rush')) {
    this.self = self
    this.opponent = opponent
    this.strategy = strategy
    this.state = strategy.createInitialState()
    this.state.enter?.(buildAiContext(self, opponent))
  }

  /** Hot-swap personality mid-match (future UI / difficulty). */
  setStrategy(strategy) {
    const ctx = buildAiContext(this.self, this.opponent)
    this.state.exit?.(ctx)
    this.strategy = strategy
    this.state = strategy.createInitialState()
    this.state.enter?.(ctx)
  }

  setStrategyId(id) {
    this.setStrategy(createAiStrategy(id))
  }

  pollIntent() {
    const ctx = buildAiContext(this.self, this.opponent)
    let intent = emptyIntentFallback()
    // Allow one immediate transition so Approach→Attack can act same frame.
    for (let i = 0; i < 3; i++) {
      const result = this.state.update(ctx) || {}
      intent = result.intent || intent
      if (!result.nextState) break
      this.state.exit?.(ctx)
      this.state = result.nextState
      this.state.enter?.(ctx)
    }
    return intent
  }

  reset() {
    const ctx = buildAiContext(this.self, this.opponent)
    this.state.exit?.(ctx)
    this.state = this.strategy.createInitialState()
    this.state.enter?.(ctx)
  }
}
