import { AiStrategy } from '../AiStrategy.js'
import { ApproachState } from '../states/RushStates.js'

/**
 * Simple aggressive policy: close distance, attack when stamina allows.
 * Swap via createAiStrategy('rush') — add new strategies beside this file.
 */
export class RushAttackStrategy extends AiStrategy {
  get id() {
    return 'rush'
  }

  createInitialState() {
    return new ApproachState()
  }
}
