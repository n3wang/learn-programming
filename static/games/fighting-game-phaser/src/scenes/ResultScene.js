import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'
import { UI, UI_FONT } from '../ui/strings.js'
import { EventBus } from '../state/EventBus.js'

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result')
  }

  init(data) {
    this.resultText = data.resultText
  }

  create() {
    const fight = this.scene.get('Fight')
    const online = !!fight.online
    const opponentGone = !!fight.opponentGone

    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.55).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, this.resultText, {
        fontFamily: UI_FONT,
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    this.noticeText = this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 14, '', {
        fontFamily: UI_FONT,
        fontSize: '14px',
        color: '#9ca3af'
      })
      .setOrigin(0.5, 0.5)

    // Online rematches need both players, so the button reports who is ready.
    if (!online || !opponentGone) {
      this.rematchButton = createButton(
        this,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 20,
        260,
        40,
        UI.rematch,
        () => (online ? fight.requestRematch() : fight.restartMatch())
      )
    }

    createButton(
      this,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 80,
      260,
      40,
      online ? UI.leaveMatch : UI.changeFighters,
      () => fight.goToSelect()
    )

    if (online) {
      this.onRematchState = (state) => this.refreshRematch(state)
      EventBus.on('online-rematch-state', this.onRematchState)
      this.events.once('shutdown', () => EventBus.off('online-rematch-state', this.onRematchState))
      this.refreshRematch(fight.rematchState())
    }
  }

  refreshRematch(state) {
    if (!state) return
    if (state.opponentGone) {
      if (this.rematchButton) this.rematchButton.setVisibleButton(false)
      this.noticeText.setText(UI.onlineOpponentLeft)
      return
    }
    if (state.mine && !state.opponent) {
      this.noticeText.setText(UI.onlineRematchWait)
      return
    }
    if (!state.mine && state.opponent) {
      this.noticeText.setText(UI.onlineOpponent + '：' + UI.rematch + ' ?')
      return
    }
    this.noticeText.setText('')
  }
}
