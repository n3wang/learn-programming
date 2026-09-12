import { RushAttackStrategy } from './RushAttackStrategy.js'

const REGISTRY = {
  rush: () => new RushAttackStrategy()
}

/**
 * Factory for switchable AI strategies (Strategy Pattern).
 * @param {string} [id]
 * @returns {import('../AiStrategy.js').AiStrategy}
 */
export function createAiStrategy(id = 'rush') {
  const factory = REGISTRY[id] || REGISTRY.rush
  return factory()
}

export function listAiStrategies() {
  return Object.keys(REGISTRY)
}
