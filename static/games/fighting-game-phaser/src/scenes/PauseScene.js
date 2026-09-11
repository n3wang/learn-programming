import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause')
  }

  create() {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.72).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 110, 'Paused', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    const fight = this.scene.get('Fight')

    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, 260, 40, 'Resume', () => {
      fight.setPaused(false)
    })
    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, 260, 40, 'Controls', () => {
      this.scene.launch('Controls')
    })
    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80, 260, 40, 'Restart', () => {
      fight.restartMatch()
    })
    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140, 260, 40, 'Change Fighters', () => {
      fight.goToSelect()
    })
  }
}
