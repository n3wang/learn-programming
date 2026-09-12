import { AiState } from '../AiState.js'
import { emptyIntent } from '../AiContext.js'

/**
 * Rush-agent states (State AI Pattern).
 * Transitions: Approach ↔ Attack ↔ Recover.
 * Intents only — FighterCombat enforces stamina / combo rules like a human.
 */

export class ApproachState extends AiState {
  get id() {
    return 'approach'
  }

  update(ctx) {
    const intent = emptyIntent()
    if (ctx.dead || ctx.oppDead) return { intent }

    if (ctx.inRange && ctx.canAttack) {
      return { intent, nextState: new AttackState() }
    }
    if (ctx.inRange && !ctx.canAttack) {
      return { intent, nextState: new RecoverState() }
    }

    const dir = ctx.toward
    intent.moveDir = dir
    if (dir < 0) intent.leftIsDown = true
    else intent.rightIsDown = true
    return { intent }
  }
}

export class AttackState extends AiState {
  get id() {
    return 'attack'
  }

  update(ctx) {
    const intent = emptyIntent()
    if (ctx.dead || ctx.oppDead) return { intent }

    if (!ctx.inRange && !ctx.swinging) {
      return { intent, nextState: new ApproachState() }
    }
    if (!ctx.canAttack && !ctx.swinging) {
      return { intent, nextState: new RecoverState() }
    }

    // Face / stay on opponent while pressing attack (same mash a player uses).
    const dir = ctx.toward
    if (dir < 0) {
      intent.leftIsDown = true
      intent.moveDir = ctx.swinging ? 0 : dir
    } else {
      intent.rightIsDown = true
      intent.moveDir = ctx.swinging ? 0 : dir
    }

    if (ctx.inRange && (ctx.canAttack || ctx.swinging)) {
      intent.attackJustDown = true
    }
    return { intent }
  }
}

export class RecoverState extends AiState {
  get id() {
    return 'recover'
  }

  update(ctx) {
    const intent = emptyIntent()
    if (ctx.dead || ctx.oppDead) return { intent }

    if (!ctx.inRange) {
      return { intent, nextState: new ApproachState() }
    }
    if (ctx.canAttack) {
      return { intent, nextState: new AttackState() }
    }
    return { intent }
  }
}
