import { FighterMotion } from './FighterMotion.js'
import { FighterCombat } from './FighterCombat.js'
import { FighterAnimator } from './FighterAnimator.js'
import { FighterHealth } from './FighterHealth.js'
import { AfterimageTrail } from './AfterimageTrail.js'

const FRAME_SIZE = 200 // every character animation frame is 200x200px

// Thin coordinator (a real Phaser Sprite) delegating to single-responsibility
// collaborators. Exposes the flat property surface (position, velocity,
// hitWidth/hitHeight, faceRight, attackBox, trackIndex, characterId,
// currentAttack, isSwinging()) that src/combat/geometry.js and ClashResolver
// expect, so those stay simple/pure instead of reaching through sub-objects.
export class Fighter extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, side) {
    super(scene, x, y, '__DEFAULT')
    this.side = side // 'player' | 'enemy'
    this.hitWidth = 50
    this.hitHeight = 150
    this.faceRight = true
    this.flip = false
    this.naturalFaces = 'right'
    this.characterId = null
    this.offset = { x: 0, y: 0 }
    this.dead = false
    this.attackBox = {
      position: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      hitWidth: 0,
      hitHeight: 0
    }

    this.motion = new FighterMotion(this, x, y)
    this.combat = new FighterCombat(this)
    this.animator = new FighterAnimator(this)
    this.health = new FighterHealth(this, side)
    this.afterimages = new AfterimageTrail(scene, this)

    this.setOrigin(0.5, 0)
    scene.add.existing(this)
  }

  get position() {
    return this.motion.position
  }

  get velocity() {
    return this.motion.velocity
  }

  get trackIndex() {
    return this.motion.trackIndex
  }

  get currentAttack() {
    return this.combat.currentAttack
  }

  get stamina() {
    return this.health.stamina
  }

  get maxStamina() {
    return this.health.maxStamina
  }

  isSwinging() {
    return this.animator.isSwinging()
  }

  forwardDir() {
    return this.faceRight ? 1 : -1
  }

  setStage(stage) {
    this.motion.setStage(stage)
  }

  setFacing(faceRight) {
    const flip = faceRight !== (this.naturalFaces === 'right')
    this.faceRight = faceRight
    this.flip = flip
    this.combat.applyFacingToAttackBox()
  }

  loadCharacter(character, faceRight) {
    this.characterId = character.id
    this.naturalFaces = character.faces
    this.offset = { ...character.offset }
    this.combat.setCharacter(character)
    this.animator.setCharacter(character.id)
    this.health.reset(character.maxHealth, character.maxStamina)
    this.dead = false
    this.setVisible(true)
    this.setFacing(faceRight)
    this.animator.switchSprite('idle')
    this.syncTransform()
  }

  leaveAfterimage(force = false) {
    this.afterimages.leave(this.combat.kit.afterimageOpacity, force)
  }

  jump() {
    return this.combat.jump()
  }

  attack(options) {
    return this.combat.attack({ ...options, now: performance.now() })
  }

  mirror(opponent, dir) {
    return this.combat.mirror(opponent, dir)
  }

  noteDoubleTap(dir) {
    return this.combat.noteDoubleTap(dir, performance.now())
  }

  swapTrack() {
    return this.motion.swapTrack()
  }

  knockBack(distance) {
    this.motion.knockBack(distance)
  }

  hitDamage() {
    return this.combat.hitDamage()
  }

  takeHit(damage = 20) {
    const died = this.health.takeHit(damage)
    if (died) {
      this.fallDown()
    } else if (!this.animator.isPlaying('attack1') && !this.animator.isPlaying('attack2')) {
      this.animator.playTakeHit()
    }
  }

  fallDown() {
    if (this.dead || this.animator.isDying()) return
    this.combat.queuedAttack = null
    this.combat.currentAttack = null
    this.combat.isAttacking = false
    this.combat.comboKind = null
    this.motion.velocity.x = 0
    this.motion.velocity.y = 0
    this.motion.laneSwap = null
    this.motion.position.y = this.motion.trackFloor()
    this.animator.playDeath()
  }

  switchSprite(name) {
    this.animator.switchSprite(name)
  }

  // Places the visual sprite so its texture matches the original canvas
  // draw math: drawn top-left at (position - offset), mirrored about the
  // hitbox's own horizontal center when facing is flipped. Every frame is
  // a constant 200x200px, so the flip math only needs the current scale.
  syncTransform() {
    const scale = this.combat.kit.scale
    const drawWidth = FRAME_SIZE * scale
    const unflippedCenterX = this.position.x - this.offset.x + drawWidth / 2
    const anchor = this.position.x + this.hitWidth / 2
    this.x = this.flip ? 2 * anchor - unflippedCenterX : unflippedCenterX
    this.y = this.position.y - this.offset.y
    this.setScale(scale)
    this.setFlipX(this.flip)
  }

  regenStamina(dt) {
    this.health.regenStamina(dt)
  }

  update() {
    this.combat.releaseQueuedAttack(performance.now())
    this.combat.syncAttackBoxPosition()
    this.motion.update()
    this.syncTransform()
    this.setDepth(this.position.y)
  }

  destroy(fromScene) {
    this.afterimages.destroy()
    super.destroy(fromScene)
  }
}
