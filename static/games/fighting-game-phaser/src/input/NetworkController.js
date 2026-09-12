import { NEUTRAL_INTENT } from '../net/netSync.js'

/** Frames of remote input the host will buffer before fast-forwarding. */
const MAX_BACKLOG = 3

/**
 * Same pollIntent() shape as InputController, fed by the guest over the wire.
 *
 * The two clients tick on independent rAF clocks, so the buffer smooths the
 * mismatch: a starved frame repeats the held state with its edge flags
 * cleared (so a tap is never applied twice), and a backlog is collapsed into
 * one intent with the edges OR-ed together (so a tap is never dropped).
 */
export class NetworkController {
  constructor() {
    this.pending = []
    this.held = { ...NEUTRAL_INTENT }
  }

  receive(intent) {
    if (!intent) return
    this.pending.push(intent)
    // Guard against a client that floods or a long tab-out backlog.
    if (this.pending.length > 30) this.pending.splice(0, this.pending.length - 30)
  }

  pollIntent() {
    if (!this.pending.length) {
      return {
        ...this.held,
        leftJustDown: false,
        rightJustDown: false,
        jumpJustDown: false,
        attackJustDown: false,
        laneSwap: false
      }
    }

    const intent = { ...this.pending.shift() }
    while (this.pending.length > MAX_BACKLOG) {
      const extra = this.pending.shift()
      intent.leftJustDown = intent.leftJustDown || extra.leftJustDown
      intent.rightJustDown = intent.rightJustDown || extra.rightJustDown
      intent.jumpJustDown = intent.jumpJustDown || extra.jumpJustDown
      intent.attackJustDown = intent.attackJustDown || extra.attackJustDown
      intent.laneSwap = intent.laneSwap || extra.laneSwap
      intent.moveDir = extra.moveDir
      intent.leftIsDown = extra.leftIsDown
      intent.rightIsDown = extra.rightIsDown
    }

    this.held = {
      ...intent,
      leftJustDown: false,
      rightJustDown: false,
      jumpJustDown: false,
      attackJustDown: false,
      laneSwap: false
    }
    return intent
  }

  reset() {
    this.pending.length = 0
    this.held = { ...NEUTRAL_INTENT }
  }
}
