import { EventBus } from '../state/EventBus.js'
import { HEALTH_BAR_MS } from '../config/gameConfig.js'

// One red/indigo health bar, draining from the outer edge inward (right
// edge for P1, left edge for P2) exactly like the original's HTML bars.
export class HealthBar {
  constructor(scene, { x, y, width, height, side, anchor }) {
    this.scene = scene
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.side = side
    this.anchor = anchor // 'left' | 'right' — which edge stays fixed as it drains
    this.fraction = 1

    this.track = scene.add.rectangle(x, y, width, height, 0xdc2626).setOrigin(0, 0)
    this.border = scene.add.rectangle(x, y, width, height).setOrigin(0, 0).setStrokeStyle(4, 0xffffff)
    this.fill = scene.add.rectangle(x, y, width, height, 0x818cf8).setOrigin(0, 0)
    this.positionFill()

    this.onHealthChanged = (payload) => {
      if (payload.side !== side) return
      this.setFraction(Math.max(0, payload.health) / payload.maxHealth)
    }
    EventBus.on('health-changed', this.onHealthChanged)
  }

  positionFill() {
    const filledWidth = this.width * this.fraction
    if (this.anchor === 'right') {
      this.fill.setPosition(this.x + (this.width - filledWidth), this.y)
    } else {
      this.fill.setPosition(this.x, this.y)
    }
    this.fill.width = filledWidth
  }

  setFraction(fraction) {
    this.scene.tweens.add({
      targets: this,
      fraction,
      duration: HEALTH_BAR_MS,
      onUpdate: () => this.positionFill()
    })
  }

  snapTo(fraction) {
    this.scene.tweens.killTweensOf(this)
    this.fraction = fraction
    this.positionFill()
  }

  destroy() {
    EventBus.off('health-changed', this.onHealthChanged)
    this.track.destroy()
    this.border.destroy()
    this.fill.destroy()
  }
}
