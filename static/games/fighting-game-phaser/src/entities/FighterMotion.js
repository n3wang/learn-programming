import { GRAVITY, LANE_SWAP_BASE_RATE, LANE_SWAP_REFERENCE_JUMP } from '../config/gameConfig.js'
import { stageTracks } from '../data/stages.js'
import { clampToStage } from '../combat/geometry.js'

// Owns a fighter's kinematic state (plain numbers, not a Phaser physics
// body) — position/velocity, per-stage-track "floor", lane-swap tween and
// stage clamping. The "floor" is one of N fixed Y values per stage, and
// lane-swap/mirror/dash/knockback are scripted teleports, not collision
// responses, so Arcade Physics would add ceremony without buying anything.
export class FighterMotion {
  constructor(fighter, x, y) {
    this.fighter = fighter
    this.position = { x, y }
    this.velocity = { x: 0, y: 0 }
    this.trackIndex = 0
    this.laneSwap = null
    this.currentStage = null
  }

  setStage(stage) {
    this.currentStage = stage
  }

  tracks() {
    return stageTracks(this.currentStage)
  }

  trackFloor() {
    const tracks = this.tracks()
    const index = Math.max(0, Math.min(this.trackIndex || 0, tracks.length - 1))
    return tracks[index].y
  }

  placeOnTrack(index = 0) {
    const tracks = this.tracks()
    this.trackIndex = Math.max(0, Math.min(index, tracks.length - 1))
    this.laneSwap = null
    this.position.y = tracks[this.trackIndex].y
    this.velocity.y = 0
  }

  onGround() {
    if (this.laneSwap) return false
    return this.position.y >= this.trackFloor() - 1 && this.velocity.y === 0
  }

  swapTrack() {
    const tracks = this.tracks()
    if (tracks.length < 2 || this.fighter.dead || this.laneSwap || !this.onGround()) return false
    const next = ((this.trackIndex || 0) + 1) % tracks.length
    this.laneSwap = {
      from: this.position.y,
      to: tracks[next].y,
      next,
      t: 0
    }
    return true
  }

  // Bigger jumpers hop lanes faster: rate scales linearly with jump velocity
  // magnitude, matching LANE_SWAP_BASE_RATE at LANE_SWAP_REFERENCE_JUMP.
  laneSwapRate() {
    const jump = Math.abs(this.fighter.combat.kit.jumpVelocity)
    return LANE_SWAP_BASE_RATE * (jump / LANE_SWAP_REFERENCE_JUMP)
  }

  knockBack(distance) {
    this.position.x -= this.fighter.forwardDir() * distance
    clampToStage(this.fighter)
    this.velocity.x = 0
  }

  teleportTo(x) {
    this.position.x = x
    clampToStage(this.fighter)
    this.position.y = this.trackFloor()
    this.velocity.x = 0
    this.velocity.y = 0
  }

  update() {
    this.position.x += this.velocity.x
    clampToStage(this.fighter)

    if (this.laneSwap) {
      this.laneSwap.t = Math.min(1, this.laneSwap.t + this.laneSwapRate())
      const t = this.laneSwap.t
      const hop = Math.sin(t * Math.PI) * 48
      this.position.y = this.laneSwap.from + (this.laneSwap.to - this.laneSwap.from) * t - hop
      this.velocity.y = 0
      if (t >= 1) {
        this.trackIndex = this.laneSwap.next
        this.position.y = this.laneSwap.to
        this.laneSwap = null
      }
      return
    }

    this.position.y += this.velocity.y
    const floor = this.trackFloor()
    if (this.position.y >= floor) {
      this.velocity.y = 0
      this.position.y = floor
    } else {
      this.velocity.y += GRAVITY
    }
  }
}
