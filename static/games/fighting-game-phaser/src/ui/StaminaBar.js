import { EventBus } from '../state/EventBus.js'

export class StaminaBar {
  constructor(scene, { x, y, width, height, side, anchor }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.anchor = anchor

    this.track = scene.add.rectangle(x, y, width, height, 0x3f3f46).setOrigin(0, 0)
    this.border = scene.add.rectangle(x, y, width, height).setOrigin(0, 0).setStrokeStyle(3, 0xffffff)
    this.fill = scene.add.rectangle(x, y, width, height, 0xeab308).setOrigin(0, 0)

    this.onStaminaChanged = (payload) => {
      if (payload.side !== side) return
      this.setFraction(Math.max(0, payload.stamina) / payload.maxStamina)
    }
    EventBus.on('stamina-changed', this.onStaminaChanged)
    this.setFraction(1)
  }

  setFraction(fraction) {
    const filledWidth = this.width * fraction
    if (this.anchor === 'right') {
      this.fill.setPosition(this.x + (this.width - filledWidth), this.y)
    } else {
      this.fill.setPosition(this.x, this.y)
    }
    this.fill.width = filledWidth
  }

  destroy() {
    EventBus.off('stamina-changed', this.onStaminaChanged)
    this.track.destroy()
    this.border.destroy()
    this.fill.destroy()
  }
}
