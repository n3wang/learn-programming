import { CANVAS_WIDTH, CANVAS_HEIGHT, FONT, WIN_POINTS } from '../config/gameConfig.js'
import { DIFFICULTIES, generateProblem } from '../core/mathProblems.js'
import { Settings } from '../state/settings.js'
import { createButton } from '../ui/Button.js'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu')
  }

  create() {
    const cx = CANVAS_WIDTH / 2
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x16324f).setOrigin(0, 0)
    this.add
      .text(cx, 66, 'Math Isles', { fontFamily: FONT, fontSize: '56px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5)
    this.add
      .text(cx, 116, 'a solo hex-island building game', { fontFamily: FONT, fontSize: '20px', color: '#93c5fd' })
      .setOrigin(0.5)

    const rules = [
      'Roll the dice, collect resources, build roads, settlements and cities.',
      'First to ' + WIN_POINTS + ' victory points wins. Two bots play against you.',
      '',
      'The twist: when a bot rolls YOUR number, you only collect',
      'if you solve a math problem. On your own turn, resources are free.'
    ]
    this.add
      .text(cx, 215, rules.join('\n'), {
        fontFamily: FONT,
        fontSize: '19px',
        color: '#e2e8f0',
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5)

    this.add
      .text(cx, 322, 'Math difficulty', { fontFamily: FONT, fontSize: '18px', color: '#fde68a' })
      .setOrigin(0.5)

    this.diffButtons = {}
    const keys = Object.keys(DIFFICULTIES)
    keys.forEach((key, i) => {
      const x = cx + (i - 1) * 190
      this.diffButtons[key] = createButton(this, x, 366, 170, 46, DIFFICULTIES[key].label, () => {
        Settings.difficulty = key
        this.refreshDifficulty()
      }, { fontSize: 20 })
    })

    this.blurb = this.add.text(cx, 412, '', { fontFamily: FONT, fontSize: '16px', color: '#cbd5e1' }).setOrigin(0.5)
    this.sample = this.add
      .text(cx, 440, '', { fontFamily: FONT, fontSize: '16px', color: '#94a3b8' })
      .setOrigin(0.5)

    createButton(this, cx, 502, 240, 54, 'Start game', () => this.scene.start('Game'), { fontSize: 24 })
    this.refreshDifficulty()
  }

  refreshDifficulty() {
    for (const key of Object.keys(this.diffButtons)) this.diffButtons[key].setSelected(key === Settings.difficulty)
    this.blurb.setText(DIFFICULTIES[Settings.difficulty].blurb)
    this.sample.setText('e.g.  ' + generateProblem(Settings.difficulty).text + ' = ?')
  }
}
