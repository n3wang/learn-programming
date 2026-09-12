/**
 * State AI Pattern — one concrete state owns behaviour for a while,
 * then returns a different state instance to transition.
 *
 * update(ctx) → { intent, nextState? }
 */
export class AiState {
  get id() {
    return 'base'
  }

  enter(_ctx) {}

  exit(_ctx) {}

  /** @returns {{ intent: object, nextState?: AiState|null }} */
  update(_ctx) {
    throw new Error('AiState.update must be implemented')
  }
}
