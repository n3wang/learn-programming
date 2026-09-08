import { animKey, DEFAULT_CLANK_FRAME } from '../data/animationDefs.js'
import { CLANK_FREEZE_MS } from '../config/gameConfig.js'

// Animations that play once and hold their last frame rather than looping.
const HOLDING_NAMES = new Set(['attack1', 'attack2', 'takeHit'])

// Wraps sprite.anims.play() and reproduces the original's switchSprite()
// interrupt-priority rules: an in-progress attack/death animation can't be
// interrupted by movement (FighterCombat.beginAttack() plays the chained
// follow-up directly, bypassing this guard entirely), hitstun blocks
// non-attack switches until the takeHit animation finishes its one
// playthrough, and finishing an attack (holding its last frame) while
// something else is requested is the moment combat state gets told "that
// attack is over" via fighter.combat.markAttackFinished().
export class FighterAnimator {
  constructor(fighter) {
    this.fighter = fighter
    this.characterId = null
    this.currentAnim = null
    this.holdDone = false
    // 0-based, mirrors the original's manual framesCurrent counter (Phaser's
    // own frame.index numbering isn't relied on) — reset when a new
    // animation starts/loops, incremented on every displayed-frame change.
    this.frameIndex = 0

    fighter.on('animationstart', () => {
      this.frameIndex = 0
    })
    fighter.on('animationrepeat', () => {
      this.frameIndex = 0
    })
    fighter.on('animationupdate', () => {
      this.frameIndex++
    })
    fighter.on('animationcomplete', (anim) => this.onAnimationComplete(anim.key))
  }

  setCharacter(characterId) {
    this.characterId = characterId
    this.currentAnim = null
    this.holdDone = false
    this.frameIndex = 0
  }

  key(name) {
    return animKey(this.characterId, name)
  }

  onAnimationComplete(fullKey) {
    if (!this.currentAnim || fullKey !== this.key(this.currentAnim)) return
    if (HOLDING_NAMES.has(this.currentAnim)) {
      this.holdDone = true
    } else if (this.currentAnim === 'death') {
      this.fighter.dead = true
    }
  }

  isPlaying(name) {
    if (HOLDING_NAMES.has(name)) return this.currentAnim === name && !this.holdDone
    return this.currentAnim === name
  }

  isSwinging() {
    return this.isPlaying('attack1') || this.isPlaying('attack2')
  }

  isDying() {
    return this.currentAnim === 'death'
  }

  // Forces an attack animation to start, bypassing the normal interrupt
  // guard — used by FighterCombat when a swing actually begins/chains.
  beginAttack(name) {
    this.holdDone = false
    this.currentAnim = name
    this.fighter.play(this.key(name))
  }

  // Full clash ("clank"): force the current swing straight to its clank
  // frame — even if it hasn't gotten there yet — and hold it briefly before
  // releasing back to idle/movement, instead of playing the swing through.
  freezeAtClankFrame() {
    if (!this.isSwinging()) return
    const spriteDef = this.fighter.combat.kit.sprites[this.currentAnim]
    const target = spriteDef.clankFrame ?? DEFAULT_CLANK_FRAME
    this.freezeAtFrame(target, CLANK_FREEZE_MS)
  }

  freezeAtFrame(frameIndex, durationMs) {
    const anim = this.fighter.anims.currentAnim
    if (!anim) return
    const clamped = Math.max(0, Math.min(frameIndex, anim.frames.length - 1))
    this.fighter.anims.setCurrentFrame(anim.frames[clamped])
    this.fighter.anims.pause()
    this.frameIndex = clamped

    const frozenAttack = this.currentAnim
    this.fighter.scene.time.delayedCall(durationMs, () => {
      if (this.currentAnim === frozenAttack) this.holdDone = true
    })
  }

  playTakeHit() {
    if (this.isSwinging()) return
    this.holdDone = false
    this.currentAnim = 'takeHit'
    this.fighter.play(this.key('takeHit'))
  }

  playDeath() {
    this.currentAnim = 'death'
    this.fighter.play(this.key('death'))
  }

  // General movement/state-driven animation request (idle/run/jump/fall).
  switchSprite(name) {
    if (this.isDying()) return
    if (this.isSwinging()) return
    if (name !== 'attack1' && name !== 'attack2' && this.currentAnim === 'takeHit' && !this.holdDone) return

    const combat = this.fighter.combat
    if (
      combat.currentAttack &&
      name !== 'attack1' &&
      name !== 'attack2' &&
      this.currentAnim === combat.currentAttack
    ) {
      combat.markAttackFinished()
    }

    if (this.currentAnim === name) return
    this.currentAnim = name
    this.fighter.play(this.key(name))
  }
}
