import { createButton } from '../ui/Button.js'
import { controlsLines } from '../input/KeyBindings.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'
import { UI, UI_FONT } from '../ui/strings.js'

export class ControlsScene extends Phaser.Scene {
  constructor() {
    super('Controls')
  }

  create() {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.85).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, 48, UI.controlsTitle, {
        fontFamily: UI_FONT,
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, controlsLines().join('\n'), {
        fontFamily: UI_FONT,
        fontSize: '16px',
        color: '#ffffff',
        align: 'left',
        lineSpacing: 8
      })
      .setOrigin(0.5, 0.5)

    // Online, both players drive their own fighter with the 玩家1 keys.
    const fight = this.scene.get('Fight')
    if (fight && fight.online) {
      this.add
        .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 104, UI.onlineNotice, {
          fontFamily: UI_FONT,
          fontSize: '14px',
          color: '#facc15'
        })
        .setOrigin(0.5, 0.5)
    }

    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 56, 200, 40, UI.back, () => {
      this.scene.stop()
    })
  }
}
