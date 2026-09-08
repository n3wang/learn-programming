import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result')
  }

  init(data) {
    this.resultText = data.resultText
  }

  create() {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.55).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, this.resultText, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '24px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    const fight = this.scene.get('Fight')

    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, 260, 40, 'Rematch', () => {
      fight.restartMatch()
    })
    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80, 260, 40, 'Change Fighters', () => {
      fight.goToSelect()
    })
  }
}
