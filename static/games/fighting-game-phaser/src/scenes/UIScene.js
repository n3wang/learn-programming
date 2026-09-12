import { HealthBar } from '../ui/HealthBar.js'
import { StaminaBar } from '../ui/StaminaBar.js'
import { TimerDisplay } from '../ui/TimerDisplay.js'
import { HitPopupLayer } from '../ui/HitPopup.js'
import { TestReadoutPanel } from '../ui/TestReadoutPanel.js'
import { CANVAS_WIDTH } from '../config/gameConfig.js'
import { UI, UI_FONT } from '../ui/strings.js'

const PADDING = 20
const BAR_HEIGHT = 30
const STAMINA_HEIGHT = 10
const TIMER_WIDTH = 100
const TIMER_HEIGHT = 50
const GAP = 6

// Launched in parallel with FightScene and rendered on top. Purely reactive
// to EventBus events — never reaches into Fighter/FightScene internals.
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI')
  }

  init(data) {
    this.testMode = data.testMode
    this.player = data.player
    this.online = data.online || null
    this.pingText = null
    this.pingEvent = null
  }

  create() {
    const barWidth = (CANVAS_WIDTH - PADDING * 2 - TIMER_WIDTH - GAP * 2) / 2

    this.playerHealth = new HealthBar(this, {
      x: PADDING,
      y: PADDING,
      width: barWidth,
      height: BAR_HEIGHT,
      side: 'player',
      anchor: 'right'
    })
    this.playerStamina = new StaminaBar(this, {
      x: PADDING,
      y: PADDING + BAR_HEIGHT + GAP,
      width: barWidth,
      height: STAMINA_HEIGHT,
      side: 'player',
      anchor: 'right'
    })

    this.enemyHealth = new HealthBar(this, {
      x: PADDING + barWidth + GAP + TIMER_WIDTH + GAP,
      y: PADDING,
      width: barWidth,
      height: BAR_HEIGHT,
      side: 'enemy',
      anchor: 'left'
    })
    this.enemyStamina = new StaminaBar(this, {
      x: PADDING + barWidth + GAP + TIMER_WIDTH + GAP,
      y: PADDING + BAR_HEIGHT + GAP,
      width: barWidth,
      height: STAMINA_HEIGHT,
      side: 'enemy',
      anchor: 'left'
    })

    this.timer = new TimerDisplay(this, {
      x: PADDING + barWidth + GAP,
      y: PADDING,
      width: TIMER_WIDTH,
      height: TIMER_HEIGHT
    })

    this.popups = new HitPopupLayer(this)

    if (this.online) this.buildOnlineLabels()

    if (this.testMode) {
      this.testReadout = new TestReadoutPanel(this, 20, 500)
      this.testReadout.setFighter(this.player)
    }

    this.events.once('shutdown', () => this.cleanup())
  }

  // Both clients render P1 on the left, so a "you" tag is what tells the two
  // players apart rather than mirroring the whole world for the guest.
  buildOnlineLabels() {
    const style = { fontFamily: UI_FONT, fontSize: '12px', color: '#e5e7eb' }
    const tag = (name, isYou) =>
      (name || UI.onlineOpponent) + (isYou ? '（' + UI.onlineYou + '）' : '')

    this.add.text(PADDING, PADDING + BAR_HEIGHT + GAP + STAMINA_HEIGHT + 4,
      tag(this.online.p1Name, this.online.side === 'p1'), style)

    this.add
      .text(
        CANVAS_WIDTH - PADDING,
        PADDING + BAR_HEIGHT + GAP + STAMINA_HEIGHT + 4,
        tag(this.online.p2Name, this.online.side === 'p2'),
        style
      )
      .setOrigin(1, 0)

    this.pingText = this.add
      .text(CANVAS_WIDTH / 2, PADDING + TIMER_HEIGHT + 6, '', {
        fontFamily: UI_FONT,
        fontSize: '11px',
        color: '#9ca3af'
      })
      .setOrigin(0.5, 0)
    this.pingEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.refreshPing()
    })
    this.refreshPing()
  }

  refreshPing() {
    if (!this.pingText) return
    const net = this.online && this.online.net
    if (!net || !net.isOpen()) {
      this.pingText.setText(UI.onlineLost)
      return
    }
    this.pingText.setText(UI.onlinePing + Math.round(net.latency) + ' ms')
  }

  cleanup() {
    if (this.pingEvent) this.pingEvent.remove()
    this.playerHealth.destroy()
    this.playerStamina.destroy()
    this.enemyHealth.destroy()
    this.enemyStamina.destroy()
    this.timer.destroy()
    this.popups.destroy()
    if (this.testReadout) this.testReadout.destroy()
  }
}
