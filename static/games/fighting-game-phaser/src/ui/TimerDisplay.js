import { EventBus } from '../state/EventBus.js'

export class TimerDisplay {
  constructor(scene, { x, y, width, height }) {
    scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0, 0).setStrokeStyle(4, 0xffffff)
    this.text = scene.add
      .text(x + width / 2, y + height / 2, '60', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    this.onTick = (seconds) => this.text.setText(String(seconds))
    EventBus.on('timer-tick', this.onTick)
  }

  destroy() {
    EventBus.off('timer-tick', this.onTick)
    this.text.destroy()
  }
}
