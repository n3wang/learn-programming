/**
 * Strategy Pattern — swappable AI personality / policy.
 * A strategy only decides the initial state; transitions live in states
 * (or a strategy can expose helpers states call).
 *
 * Add smarter agents by registering a new strategy + its states.
 */
export class AiStrategy {
  get id() {
    return 'base'
  }

  /** @returns {import('./AiState.js').AiState} */
  createInitialState() {
    throw new Error('AiStrategy.createInitialState must be implemented')
  }
}
