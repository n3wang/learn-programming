import { CANVAS_WIDTH, CANVAS_HEIGHT, FONT } from '../config/gameConfig.js'
import { DIFFICULTIES } from '../core/mathProblems.js'
import { createButton } from '../ui/Button.js'

const MAX_DIGITS = 5

// Modal overlay: one problem, typed or tapped in, one attempt. Reports back
// through data.onDone(correct) and then stops itself.
export class MathScene extends Phaser.Scene {
  constructor() {
    super('Math')
  }

  init(data) {
    this.data_ = data
    this.answer = ''
    this.finished = false
  }

  create() {
    const { problem, title, reward } = this.data_
    const cx = CANVAS_WIDTH / 2
    const top = 38

    // Full-screen blocker so nothing underneath can be clicked.
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.7).setOrigin(0, 0).setInteractive()
    this.add.rectangle(cx, top + 250, 520, 500, 0x0f172a).setStrokeStyle(4, 0xfacc15)

    this.add
      .text(cx, top + 28, title, { fontFamily: FONT, fontSize: '20px', color: '#ffffff', align: 'center' })
      .setOrigin(0.5)
    this.add
      .text(cx, top + 58, 'Solve it to collect: ' + reward, {
        fontFamily: FONT,
        fontSize: '17px',
        color: '#fde68a',
        align: 'center'
      })
      .setOrigin(0.5)
    this.add
      .text(cx, top + 86, DIFFICULTIES[problem.difficulty].label.toUpperCase(), {
        fontFamily: FONT,
        fontSize: '12px',
        color: '#64748b'
      })
      .setOrigin(0.5)

    this.add
      .text(cx, top + 130, problem.text + ' = ?', {
        fontFamily: FONT,
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    this.add.rectangle(cx, top + 196, 220, 52, 0x1e293b).setStrokeStyle(3, 0x94a3b8)
    this.answerText = this.add
      .text(cx, top + 196, '', { fontFamily: FONT, fontSize: '34px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5)
    this.feedback = this.add
      .text(cx, top + 244, '', { fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', align: 'center' })
      .setOrigin(0.5)

    this.pad = []
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Del', '0', 'OK']
    keys.forEach((key, i) => {
      const x = cx + ((i % 3) - 1) * 84
      const y = top + 292 + Math.floor(i / 3) * 52
      const button = createButton(this, x, y, 76, 44, key, () => this.press(key), { fontSize: 20 })
      this.pad.push(button)
    })

    this.continueButton = createButton(this, cx, top + 350, 240, 54, 'Continue', () => this.close(), {
      fontSize: 22
    })
    this.continueButton.setVisible(false)

    this.input.keyboard.on('keydown', (event) => this.handleKey(event))
    this.renderAnswer()
  }

  handleKey(event) {
    if (this.finished) {
      if (event.key === 'Enter' || event.key === ' ') this.close()
      return
    }
    if (/^[0-9]$/.test(event.key)) this.press(event.key)
    else if (event.key === 'Backspace') this.press('Del')
    else if (event.key === 'Enter') this.press('OK')
  }

  press(key) {
    if (this.finished) return
    if (key === 'Del') this.answer = this.answer.slice(0, -1)
    else if (key === 'OK') return this.submit()
    else if (this.answer.length < MAX_DIGITS) this.answer += key
    this.renderAnswer()
  }

  renderAnswer() {
    this.answerText.setText(this.answer || '_')
  }

  submit() {
    if (!this.answer) return
    const { problem } = this.data_
    this.correct = Number(this.answer) === problem.answer
    this.finished = true
    this.feedback
      .setColor(this.correct ? '#4ade80' : '#f87171')
      .setText(this.correct ? 'Correct!' : 'Not quite — the answer was ' + problem.answer)
    this.pad.forEach((b) => b.setVisible(false))
    this.continueButton.setVisible(true)
  }

  close() {
    const done = this.data_.onDone
    this.scene.stop()
    done(this.correct)
  }
}
