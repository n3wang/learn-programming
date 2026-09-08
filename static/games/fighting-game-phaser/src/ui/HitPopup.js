import { EventBus } from '../state/EventBus.js'

// Floating damage/clank/swoosh text that drifts up and fades — spawned by
// FightScene reacting to a ClashResolver result, via a single 'popup' event
// carrying {x, y, text}.
export class HitPopupLayer {
  constructor(scene) {
    this.scene = scene
    this.onPopup = ({ x, y, text }) => this.spawn(x, y, text)
    EventBus.on('popup', this.onPopup)
  }

  spawn(x, y, text) {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#fde68a'
      })
      .setOrigin(0.5, 1)
      .setDepth(10000)

    this.scene.tweens.add({
      targets: label,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => label.destroy()
    })
  }

  destroy() {
    EventBus.off('popup', this.onPopup)
  }
}
