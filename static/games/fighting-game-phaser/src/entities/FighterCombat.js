import { CLASH_WINDOW_MS } from '../config/gameConfig.js'

// Owns the attack/combo state machine: attack1 -> queued attack2, the
// air-combo and dash-combo teleport-then-attack2 chains, the double-tap
// "mirror" blink-behind-opponent skill, stamina spend for attacks/jump, and
// the attackBox derived from facing. Consumes plain PlayerIntent objects —
// never touches keyboard/Phaser input directly — so the same code drives
// both a human InputController and the Test Range DummyController.
export class FighterCombat {
  constructor(fighter) {
    this.fighter = fighter
    this.kit = null
    this.baseAttackBox = { offset: { x: 0, y: 0 }, hitWidth: 0, hitHeight: 0 }
    this.hitFrame = 4
    this.isAttacking = false
    this.currentAttack = null
    this.lastFinishedAttack = null
    this.attackFinishedAt = 0
    this.attackLift = 0
    this.comboKind = null
    this.queuedAttack = null
    this.lastTapDir = 0
    this.lastTapAt = 0
    this.clashUntil = 0
    this.directionLocked = false
  }

  setCharacter(character) {
    this.kit = character
    this.baseAttackBox = {
      offset: { ...character.attackBox.offset },
      hitWidth: character.attackBox.width,
      hitHeight: character.attackBox.height
    }
    this.hitFrame = character.sprites.attack1.hitFrame
    this.isAttacking = false
    this.currentAttack = null
    this.lastFinishedAttack = null
    this.attackFinishedAt = 0
    this.attackLift = 0
    this.comboKind = null
    this.queuedAttack = null
    this.lastTapDir = 0
    this.lastTapAt = 0
    this.clashUntil = 0
    this.directionLocked = false
  }

  hitDamage() {
    const key = this.currentAttack === 'attack2' ? 'attack2' : 'attack1'
    return this.kit.attackDamage[key]
  }

  // Recomputes attackBox.offset/size from current facing — call whenever
  // facing changes (see Fighter#setFacing).
  applyFacingToAttackBox() {
    const fighter = this.fighter
    const box = this.baseAttackBox
    fighter.attackBox.offset.x = fighter.flip ? -(box.offset.x + box.hitWidth) : box.offset.x
    fighter.attackBox.offset.y = (fighter.hitHeight - box.hitHeight) / 2
    fighter.attackBox.hitWidth = box.hitWidth
    fighter.attackBox.hitHeight = box.hitHeight
  }

  syncAttackBoxPosition() {
    const fighter = this.fighter
    fighter.attackBox.position.x = fighter.position.x + fighter.attackBox.offset.x
    fighter.attackBox.position.y = fighter.position.y + fighter.attackBox.offset.y
  }

  jump() {
    const fighter = this.fighter
    if (fighter.dead || !fighter.motion.onGround()) return false
    if (!fighter.health.spendStamina(this.kit.jumpCost)) return false
    fighter.motion.velocity.y = this.kit.jumpVelocity
    return true
  }

  beginAttack(name, now) {
    const fighter = this.fighter
    fighter.animator.beginAttack(name)
    this.isAttacking = true
    this.currentAttack = name
    this.hitFrame = this.kit.sprites[name].hitFrame
    this.lastFinishedAttack = null
    this.clashUntil = now + CLASH_WINDOW_MS
    if (this.kit.skills.lockDirection) this.directionLocked = true
  }

  markAttackFinished() {
    this.lastFinishedAttack = this.currentAttack
    this.attackFinishedAt = performance.now()
    this.currentAttack = null
    this.attackLift = 0
    this.directionLocked = false
  }

  queueFollowUp(kind, opponent) {
    if (this.queuedAttack) return false
    if (!this.fighter.health.spendStamina(this.kit.attackCost)) return false
    this.queuedAttack = { kind, opponent }
    return true
  }

  releaseQueuedAttack(now) {
    const fighter = this.fighter
    if (fighter.dead || !this.queuedAttack || !fighter.animator.holdDone) return
    if (this.currentAttack !== 'attack1') return

    const queued = this.queuedAttack
    this.queuedAttack = null
    this.comboKind = null
    this.attackLift = 0

    if (queued.kind === 'air') {
      fighter.leaveAfterimage()
      fighter.motion.teleportTo(fighter.position.x + fighter.forwardDir() * this.skillDistance(this.kit.airX, this.kit.airK))
    } else if (queued.kind === 'dash') {
      fighter.leaveAfterimage()
      fighter.motion.teleportTo(fighter.position.x + fighter.forwardDir() * this.skillDistance(this.kit.dashX, this.kit.dashK))
    }

    this.beginAttack('attack2', now)
  }

  skillDistance(x, k) {
    return Math.abs(this.kit.jumpVelocity) * x + this.kit.moveSpeed * k
  }

  mirrorCost() {
    return this.kit.attackCost / 2
  }

  enemyInDirection(opponent, dir) {
    const fighter = this.fighter
    const myCenter = fighter.position.x + fighter.hitWidth / 2
    const theirCenter = opponent.position.x + opponent.hitWidth / 2
    const dx = theirCenter - myCenter
    const thatWay = dir > 0 ? dx > 0 : dx < 0
    const reach = this.baseAttackBox.hitWidth * this.kit.mirrorReach
    return thatWay && Math.abs(dx) <= reach
  }

  // Same direction twice within mirrorWindow, with an enemy that way: blink
  // behind them.
  noteDoubleTap(dir, now) {
    const doubled = this.lastTapDir === dir && now - this.lastTapAt <= this.kit.mirrorWindow
    this.lastTapDir = dir
    this.lastTapAt = now
    return doubled
  }

  mirror(opponent, dir) {
    const fighter = this.fighter
    if (fighter.dead || !opponent || opponent.dead) return false
    if (!this.kit.skills.mirror) return false
    if (fighter.isSwinging() || this.queuedAttack) return false
    if ((fighter.trackIndex || 0) !== (opponent.trackIndex || 0)) return false
    if (!this.enemyInDirection(opponent, dir)) return false
    if (!fighter.health.spendStamina(this.mirrorCost())) return false

    fighter.leaveAfterimage(true)
    const theirCenter = opponent.position.x + opponent.hitWidth / 2
    const landOnRight = theirCenter >= fighter.position.x + fighter.hitWidth / 2
    const step =
      opponent.hitWidth / 2 + fighter.hitWidth / 2 + this.skillDistance(this.kit.mirrorX, this.kit.mirrorK)
    const targetX = landOnRight ? theirCenter + step - fighter.hitWidth / 2 : theirCenter - step - fighter.hitWidth / 2
    fighter.motion.teleportTo(targetX)
    fighter.setFacing(!landOnRight)
    return true
  }

  attack({ movingForward = false, opponent = null, now = performance.now() } = {}) {
    const fighter = this.fighter
    if (fighter.dead) return false
    if (fighter.animator.isPlaying('attack2') || this.queuedAttack) return false

    const inAir = !fighter.motion.onGround()
    const followUp =
      fighter.animator.isPlaying('attack1') ||
      (this.lastFinishedAttack === 'attack1' && now - this.attackFinishedAt < this.kit.comboWindow)

    // Second press is stored and plays only after the first swing finishes.
    if (fighter.animator.isPlaying('attack1')) {
      if (this.comboKind === 'air') return this.queueFollowUp('air', opponent)
      if (this.comboKind === 'dash' || (this.kit.skills.dashCombo && movingForward)) {
        return this.queueFollowUp('dash', opponent)
      }
      return this.queueFollowUp('combo', opponent)
    }

    if (!fighter.health.spendStamina(this.kit.attackCost)) return false

    // Air skill: first swing hits upward. The queued follow-up drops and
    // steps forward.
    if (this.kit.skills.airCombo && inAir && !followUp) {
      this.comboKind = 'air'
      this.attackLift = 0
      fighter.motion.velocity.y = Math.min(fighter.motion.velocity.y, -6)
      this.beginAttack('attack1', now)
      return true
    }

    // Dash skill: while running forward, the queued follow-up blinks
    // farther ahead.
    if (this.kit.skills.dashCombo && !inAir && movingForward && !followUp) {
      this.comboKind = 'dash'
      this.attackLift = 0
      this.beginAttack('attack1', now)
      return true
    }

    this.comboKind = null
    this.attackLift = 0
    this.beginAttack(followUp ? 'attack2' : 'attack1', now)
    return true
  }
}
