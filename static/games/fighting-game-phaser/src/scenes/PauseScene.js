import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'
import { UI, UI_FONT } from '../ui/strings.js'

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause')
  }

  create() {
    const fight = this.scene.get('Fight')
    // Online, the fight keeps running behind this menu — one client cannot
    // pause the other, so there is nothing to restart locally either.
    const online = !!fight.online

    this.add
      .rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, online ? 0.5 : 0.72)
      .setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 110, online ? UI.onlineTitle : UI.paused, {
        fontFamily: UI_FONT,
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, 260, 40, UI.resume, () => {
      fight.closeMenu()
    })
    createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20, 260, 40, UI.controls, () => {
      this.scene.launch('Controls')
    })
    if (!online) {
      createButton(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80, 260, 40, UI.restart, () => {
        fight.restartMatch()
      })
    }
    createButton(
      this,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + (online ? 80 : 140),
      260,
      40,
      online ? UI.leaveMatch : UI.changeFighters,
      () => fight.goToSelect()
    )
  }
}
