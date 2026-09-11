import { createButton } from '../ui/Button.js'
import { controlsLines } from '../input/KeyBindings.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

export class ControlsScene extends Phaser.Scene {
  constructor() {
    super('Controls')
  }

  create() {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.85).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, 48, 'Controls', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, controlsLines().join('\n'), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ffffff',
        align: 'left',
        lineSpacing: 10
      })
      .setOrigin(0.5, 0.5)

    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 56, 200, 40, 'Back', () => {
      this.scene.stop()
    })
  }
}
