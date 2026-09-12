import { CHARACTERS } from '../data/characters.js'
import { STAGES } from '../data/stages.js'

// Wire format is deliberately positional: these frames go out ~60x a second
// per client, so field names would dominate the payload.

const ANIM_NAMES = ['idle', 'run', 'jump', 'fall', 'attack1', 'attack2', 'attack3', 'takeHit', 'death']

const FLAG_LEFT_DOWN = 1
const FLAG_RIGHT_DOWN = 2
const FLAG_LEFT_JUST = 4
const FLAG_RIGHT_JUST = 8
const FLAG_JUMP_JUST = 16
const FLAG_ATTACK_JUST = 32
const FLAG_LANE_SWAP = 64

export const NEUTRAL_INTENT = Object.freeze({
  moveDir: 0,
  leftIsDown: false,
  rightIsDown: false,
  leftJustDown: false,
  rightJustDown: false,
  jumpJustDown: false,
  attackJustDown: false,
  laneSwap: false
})

export function encodeIntent(intent) {
  let flags = 0
  if (intent.leftIsDown) flags |= FLAG_LEFT_DOWN
  if (intent.rightIsDown) flags |= FLAG_RIGHT_DOWN
  if (intent.leftJustDown) flags |= FLAG_LEFT_JUST
  if (intent.rightJustDown) flags |= FLAG_RIGHT_JUST
  if (intent.jumpJustDown) flags |= FLAG_JUMP_JUST
  if (intent.attackJustDown) flags |= FLAG_ATTACK_JUST
  if (intent.laneSwap) flags |= FLAG_LANE_SWAP
  return [intent.moveDir | 0, flags]
}

export function decodeIntent(data) {
  if (!Array.isArray(data) || data.length < 2) return { ...NEUTRAL_INTENT }
  const moveDir = Math.max(-1, Math.min(1, Number(data[0]) || 0))
  const flags = Number(data[1]) || 0
  return {
    moveDir,
    leftIsDown: (flags & FLAG_LEFT_DOWN) !== 0,
    rightIsDown: (flags & FLAG_RIGHT_DOWN) !== 0,
    leftJustDown: (flags & FLAG_LEFT_JUST) !== 0,
    rightJustDown: (flags & FLAG_RIGHT_JUST) !== 0,
    jumpJustDown: (flags & FLAG_JUMP_JUST) !== 0,
    attackJustDown: (flags & FLAG_ATTACK_JUST) !== 0,
    laneSwap: (flags & FLAG_LANE_SWAP) !== 0
  }
}

/**
 * Per-fighter animation bookkeeping the host keeps so the guest can tell a
 * re-triggered swing (attack1 straight after attack1) from a continuing one.
 */
export function createAnimTracker() {
  return { name: null, frame: 0, epoch: 0 }
}

function bumpAnimEpoch(fighter, tracker) {
  const name = fighter.animator.currentAnim
  const frame = fighter.animator.frameIndex
  if (name !== tracker.name || frame < tracker.frame) tracker.epoch++
  tracker.name = name
  tracker.frame = frame
  return tracker.epoch
}

export function encodeFighter(fighter, tracker) {
  const epoch = bumpAnimEpoch(fighter, tracker)
  const animIndex = ANIM_NAMES.indexOf(fighter.animator.currentAnim)
  return [
    Math.round(fighter.position.x),
    Math.round(fighter.position.y),
    fighter.faceRight ? 1 : 0,
    animIndex < 0 ? 0 : animIndex,
    fighter.animator.frameIndex | 0,
    epoch,
    Math.round(fighter.health.health),
    Math.round(fighter.health.stamina),
    fighter.motion.trackIndex | 0,
    fighter.dead ? 1 : 0,
    Math.round(fighter.health.maxHealth),
    Math.round(fighter.health.maxStamina)
  ]
}

/** Mirror of {@link createAnimTracker} for the replaying side. */
export function createAnimCache() {
  return { name: null, epoch: -1 }
}

/**
 * Applies one authoritative fighter snapshot. The guest never simulates: even
 * the animation frame is driven from the host so hits land on the same frame
 * on both screens.
 */
export function applyFighterSnapshot(fighter, data, cache) {
  if (!Array.isArray(data) || data.length < 12) return

  fighter.position.x = Number(data[0]) || 0
  fighter.position.y = Number(data[1]) || 0

  const faceRight = data[2] === 1
  if (fighter.faceRight !== faceRight) fighter.setFacing(faceRight)

  const name = ANIM_NAMES[data[3]] || 'idle'
  const epoch = Number(data[5]) || 0
  const animator = fighter.animator
  if (cache.name !== name || cache.epoch !== epoch) {
    cache.name = name
    cache.epoch = epoch
    animator.currentAnim = name
    animator.holdDone = false
    const key = animator.key(name)
    if (fighter.scene.anims.exists(key)) fighter.play(key)
  }

  const anim = fighter.anims.currentAnim
  if (anim && anim.frames.length) {
    const index = Phaser.Math.Clamp(Number(data[4]) || 0, 0, anim.frames.length - 1)
    fighter.anims.setCurrentFrame(anim.frames[index])
    fighter.anims.pause()
  }

  const health = fighter.health
  const maxHealth = Number(data[10]) || health.maxHealth
  const maxStamina = Number(data[11]) || health.maxStamina
  const nextHealth = Number(data[6]) || 0
  const nextStamina = Number(data[7]) || 0
  if (health.health !== nextHealth || health.maxHealth !== maxHealth) {
    health.maxHealth = maxHealth
    health.health = nextHealth
    health.emitHealth()
  }
  if (health.stamina !== nextStamina || health.maxStamina !== maxStamina) {
    health.maxStamina = maxStamina
    health.stamina = nextStamina
    health.emitStamina()
  }

  fighter.motion.trackIndex = Number(data[8]) || 0
  fighter.motion.laneSwap = null
  fighter.dead = data[9] === 1

  fighter.combat.syncAttackBoxPosition()
  fighter.syncTransform()
  fighter.setDepth(fighter.position.y)
}

/**
 * The opponent may be using a workshop pack this browser never loaded (drafts
 * live in their localStorage). Falling back keeps the match playable — the
 * host stays authoritative, so only the artwork differs.
 */
export function resolveCharacterId(id, fallback) {
  return id && CHARACTERS[id] ? id : fallback
}

export function resolveStageId(id, fallback = STAGES[0].id) {
  return id && STAGES.some((stage) => stage.id === id) ? id : fallback
}
