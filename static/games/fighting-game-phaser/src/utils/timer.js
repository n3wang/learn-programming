import { EventBus } from '../state/EventBus.js'
import { MATCH_SECONDS } from '../config/gameConfig.js'

// Replaces the original's setTimeout chain with a Phaser TimerEvent, still
// emitting 'timer-tick' (seconds remaining) and 'timer-end' on the shared
// EventBus so UIScene/FightScene react without a direct reference to this.
export class MatchTimer {
  constructor(scene) {
    this.scene = scene
    this.seconds = MATCH_SECONDS
    this.event = null
  }

  reset() {
    this.pause()
    this.seconds = MATCH_SECONDS
    EventBus.emit('timer-tick', this.seconds)
  }

  resume() {
    if (this.event || this.seconds <= 0) return
    this.event = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tick()
    })
  }

  pause() {
    if (this.event) {
      this.event.remove()
      this.event = null
    }
  }

  tick() {
    this.seconds = Math.max(0, this.seconds - 1)
    EventBus.emit('timer-tick', this.seconds)
    if (this.seconds === 0) {
      this.pause()
      EventBus.emit('timer-end')
    }
  }

  destroy() {
    this.pause()
  }
}
