import { RESOURCES, RESOURCE_INFO, COSTS, WIN_POINTS, FONT, CANVAS_WIDTH } from '../config/gameConfig.js'
import { createButton } from './Button.js'

const PANEL_X = 650
const PANEL_W = CANVAS_WIDTH - PANEL_X - 18
const LOG_LINES = 6

const text = (scene, x, y, value, size = 14, color = '#e2e8f0', extra = {}) =>
  scene.add.text(x, y, value, { fontFamily: FONT, fontSize: size + 'px', color, ...extra })

// Right-hand panel (scores, hand, dice, action buttons, log) plus the status
// line above the board. It only displays state and reports clicks.
export class Hud {
  constructor(scene, handlers) {
    this.scene = scene
    scene.add.rectangle(PANEL_X - 12, 0, CANVAS_WIDTH - PANEL_X + 12, 576, 0x0b1220).setOrigin(0, 0)

    this.status = text(scene, 20, 16, '', 20, '#ffffff', { wordWrap: { width: 610 }, lineSpacing: 4 })

    text(scene, PANEL_X, 14, 'First to ' + WIN_POINTS + ' victory points wins', 12, '#94a3b8')
    this.playerRows = [0, 1, 2].map((i) => {
      const y = 38 + i * 30
      return {
        marker: text(scene, PANEL_X, y, '', 14, '#facc15'),
        swatch: scene.add.rectangle(PANEL_X + 28, y + 9, 14, 14, 0xffffff).setStrokeStyle(2, 0x000000),
        name: text(scene, PANEL_X + 42, y, '', 15, '#ffffff'),
        vp: text(scene, PANEL_X + 215, y, '', 15, '#fde68a'),
        cards: text(scene, PANEL_X + 268, y, '', 15, '#cbd5e1')
      }
    })

    this.dice = text(scene, PANEL_X, 134, 'Dice: —', 22, '#ffffff', { fontStyle: 'bold' })

    this.cards = {}
    RESOURCES.forEach((res, i) => {
      const info = RESOURCE_INFO[res]
      const x = PANEL_X + i * 69
      const rect = scene.add.rectangle(x, 176, 62, 70, info.color).setOrigin(0, 0).setStrokeStyle(3, 0x000000)
      rect.setInteractive({ useHandCursor: true })
      rect.on('pointerdown', () => handlers.onResource(res))
      text(scene, x + 31, 184, info.label, 12, info.text).setOrigin(0.5, 0)
      const count = text(scene, x + 31, 220, '0', 26, info.text, { fontStyle: 'bold' }).setOrigin(0.5, 0)
      this.cards[res] = { rect, count }
    })

    const bw = (PANEL_W - 10) / 2
    const left = PANEL_X + bw / 2
    const right = PANEL_X + bw + 10 + bw / 2
    this.buttons = {
      roll: createButton(scene, left, 288, bw, 38, 'Roll dice', handlers.onRoll),
      end: createButton(scene, right, 288, bw, 38, 'End turn', handlers.onEnd),
      road: createButton(scene, left, 334, bw, 38, 'Road', () => handlers.onBuild('road')),
      settlement: createButton(scene, right, 334, bw, 38, 'Settlement', () => handlers.onBuild('settlement')),
      city: createButton(scene, left, 380, bw, 38, 'City', () => handlers.onBuild('city')),
      bank: createButton(scene, right, 380, bw, 38, 'Bank 4:1', handlers.onBank)
    }

    const cost = (kind) =>
      Object.entries(COSTS[kind])
        .map(([r, n]) => n + ' ' + r)
        .join(' + ')
    text(
      scene,
      PANEL_X,
      408,
      'Road: ' + cost('road') + '\nSettlement (1 pt): ' + cost('settlement') + '\nCity (2 pts): ' + cost('city'),
      11,
      '#94a3b8',
      { lineSpacing: 2 }
    )

    this.logLines = []
    this.logText = text(scene, PANEL_X, 462, '', 12, '#cbd5e1', { wordWrap: { width: PANEL_W }, lineSpacing: 2 })
  }

  setStatus(message) {
    this.status.setText(message)
  }

  setDice(roll) {
    this.dice.setText(roll ? 'Dice: ' + roll.d1 + ' + ' + roll.d2 + ' = ' + roll.total : 'Dice: —')
  }

  addLog(message) {
    this.logLines.push(message)
    if (this.logLines.length > LOG_LINES) this.logLines.shift()
    this.logText.setText(this.logLines.join('\n'))
  }

  // view: { players, hand, flags, tradeMode, tradeGive }
  refresh(view) {
    view.players.forEach((p, i) => {
      const row = this.playerRows[i]
      row.marker.setText(p.current ? '▶' : '')
      row.swatch.setFillStyle(p.color)
      row.name.setText(p.name)
      row.vp.setText(p.vp + ' pt')
      row.cards.setText(p.cards + ' cards')
    })

    for (const res of RESOURCES) {
      const { rect, count } = this.cards[res]
      count.setText(String(view.hand[res]))
      const pickable =
        (view.tradeMode === 'give' && view.hand[res] >= 4) ||
        (view.tradeMode === 'get' && res !== view.tradeGive)
      rect.setStrokeStyle(pickable ? 5 : 3, pickable ? 0xffffff : 0x000000)
      rect.setAlpha(view.tradeMode === 'give' && !pickable ? 0.5 : 1)
    }

    const f = view.flags
    this.buttons.roll.setEnabled(f.canRoll)
    this.buttons.end.setEnabled(f.canEnd)
    for (const kind of ['road', 'settlement', 'city']) this.buttons[kind].setEnabled(f.canBuild[kind])
    this.buttons.bank.setEnabled(f.canBank)
    this.buttons.bank.setSelected(!!view.tradeMode)
  }
}
