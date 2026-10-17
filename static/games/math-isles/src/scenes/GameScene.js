import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FONT,
  RESOURCES,
  BANK_RATIO,
  BOARD_CENTER,
  HEX_SIZE
} from '../config/gameConfig.js'
import { Game, gainsFor, totalOf } from '../core/game.js'
import { aiSetupSettlement, aiSetupRoad, aiNextAction, executeAction, describeAction } from '../core/ai.js'
import { generateProblem } from '../core/mathProblems.js'
import { Settings } from '../state/settings.js'
import { BoardView } from '../ui/BoardView.js'
import { Hud } from '../ui/Hud.js'
import { createButton } from '../ui/Button.js'

const AI_STEP_MS = 700
const MAX_AI_ACTIONS = 25

const describeGains = (gains) =>
  RESOURCES.filter((r) => gains[r] > 0)
    .map((r) => gains[r] + ' ' + r)
    .join(', ')

// Runs the match as one linear async story (setup, then turn after turn),
// awaiting either a bot's timed step, a human click, or the math modal.
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  create() {
    // NB: Phaser scenes already own `this.game`, so the rules live in `model`.
    this.model = new Game()
    this.humanId = this.model.players.find((p) => p.human).id
    this.pending = null // an in-flight board pick
    this.tradeMode = null // null | 'give' | 'get'
    this.tradeGive = null
    this.awaitingRoll = false
    this.humanActing = false
    this.modalOpen = false
    this.rollResolve = null
    this.endResolve = null

    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x16324f).setOrigin(0, 0)
    this.board = new BoardView(this, this.model, { x: BOARD_CENTER.x, y: BOARD_CENTER.y, size: HEX_SIZE })
    this.hud = new Hud(this, {
      onRoll: () => this.rollResolve && this.rollResolve(),
      onEnd: () => this.onEndTurn(),
      onBuild: (kind) => this.onBuild(kind),
      onBank: () => this.onBank(),
      onResource: (res) => this.onResource(res)
    })
    this.input.keyboard.on('keydown-ESC', () => this.cancelAction())

    this.refresh()
    this.runMatch().catch((err) => console.error(err))
  }

  // ---- small helpers ----

  wait(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve))
  }

  setStatus(message) {
    this.hud.setStatus(message)
  }

  log(message) {
    this.hud.addLog(message)
  }

  refresh() {
    const m = this.model
    const me = this.humanId
    const acting = this.humanActing && !this.modalOpen
    const hand = m.player(me).resources
    this.board.drawPieces()
    this.hud.refresh({
      players: m.players.map((p) => ({
        name: p.name,
        color: p.color,
        vp: m.victoryPoints(p.id),
        cards: m.handSize(p.id),
        current: m.current === p.id && m.phase !== 'over'
      })),
      hand,
      tradeMode: this.tradeMode,
      tradeGive: this.tradeGive,
      flags: {
        canRoll: this.awaitingRoll && !this.modalOpen,
        canEnd: acting,
        canBuild: {
          road: acting && m.canBuild('road', me),
          settlement: acting && m.canBuild('settlement', me),
          city: acting && m.canBuild('city', me)
        },
        canBank: acting && (!!this.tradeMode || RESOURCES.some((r) => hand[r] >= BANK_RATIO))
      }
    })
  }

  // Highlights `ids` on the board and resolves with the one clicked, or null
  // if the pick is cancelled.
  pick(kind, ids, message) {
    this.cancelPick()
    this.setStatus(message)
    return new Promise((resolve) => {
      this.pending = { resolve }
      this.board.showCandidates(kind, ids, (id) => {
        this.pending = null
        resolve(id)
      })
    })
  }

  cancelPick() {
    if (!this.pending) return
    const { resolve } = this.pending
    this.pending = null
    this.board.clearCandidates()
    resolve(null)
  }

  // ---- match flow ----

  async runMatch() {
    await this.runSetup()
    while (this.model.phase !== 'over') {
      const pid = this.model.current
      if (this.model.player(pid).human) await this.humanTurn()
      else await this.aiTurn(pid)
      if (this.model.phase === 'over') break
      this.model.endTurn()
    }
    this.showGameOver()
  }

  async runSetup() {
    const m = this.model
    while (m.phase === 'setup') {
      const pid = m.current
      const p = m.player(pid)
      const second = m.setupIndex >= m.players.length

      if (m.setupStage === 'settlement') {
        let vertex
        if (p.human) {
          const hint = second ? ' (you collect one card per neighbouring tile)' : ''
          do {
            vertex = await this.pick(
              'vertex',
              m.legalSettlementVertices(pid, true),
              'Place your ' + (second ? 'second' : 'first') + ' settlement' + hint + '.'
            )
          } while (vertex === null)
        } else {
          this.setStatus(p.name + ' is placing a settlement…')
          await this.wait(AI_STEP_MS)
          vertex = aiSetupSettlement(m, pid)
        }
        m.placeSetupSettlement(pid, vertex)
        this.log(p.name + ' placed a settlement.')
      } else {
        let edge
        if (p.human) {
          do {
            edge = await this.pick('edge', m.legalSetupRoadEdges(), 'Now place a road next to that settlement.')
          } while (edge === null)
        } else {
          this.setStatus(p.name + ' is placing a road…')
          await this.wait(AI_STEP_MS)
          edge = aiSetupRoad(m, pid)
        }
        m.placeSetupRoad(pid, edge)
      }
      this.refresh()
    }
  }

  async humanTurn() {
    this.setStatus('Your turn — roll the dice.')
    this.awaitingRoll = true
    this.refresh()
    await new Promise((resolve) => (this.rollResolve = resolve))
    this.awaitingRoll = false
    this.rollResolve = null

    await this.handleRoll(this.model.roll(), this.humanId)

    this.humanActing = true
    this.setStatus('Build, trade with the bank (4 of one for 1 of another), or end your turn.')
    this.refresh()
    await new Promise((resolve) => (this.endResolve = resolve))
    this.humanActing = false
    this.endResolve = null
    this.cancelAction()
    this.refresh()
  }

  async aiTurn(pid) {
    const m = this.model
    const p = m.player(pid)
    this.setStatus(p.name + ' is rolling…')
    this.refresh()
    await this.wait(AI_STEP_MS)
    await this.handleRoll(m.roll(), pid)

    for (let i = 0; i < MAX_AI_ACTIONS; i++) {
      const action = aiNextAction(m, pid)
      if (!action) break
      this.setStatus(p.name + ' ' + describeAction(action) + '.')
      executeAction(m, pid, action)
      this.log(p.name + ' ' + describeAction(action) + '.')
      this.refresh()
      await this.wait(AI_STEP_MS)
      if (m.phase === 'over') return
    }
  }

  // Pays out a roll. Everyone collects automatically — except the human on a
  // bot's turn, who has to earn it by solving a problem.
  async handleRoll(roll, rollerId) {
    const m = this.model
    const roller = m.player(rollerId)
    this.hud.setDice(roll)
    this.board.flashNumber(roll.total)
    this.log(roller.name + ' rolled ' + roll.total + '.')

    if (roll.total === 7) {
      this.log('A 7: nobody collects.')
      this.refresh()
      await this.wait(AI_STEP_MS)
      return
    }

    const entries = m.production(roll.total)
    let humanGains = null
    for (const p of m.players) {
      const gains = gainsFor(entries, p.id)
      if (totalOf(gains) === 0) continue
      if (p.human && rollerId !== p.id) {
        humanGains = gains
        continue
      }
      m.grant(p.id, gains)
      this.log(p.name + ' collects ' + describeGains(gains) + '.')
    }
    this.refresh()

    if (humanGains) await this.runMathChallenge(roller, roll, humanGains)
    else if (rollerId !== this.humanId) this.log('Not your number — nothing to solve.')
    await this.wait(AI_STEP_MS / 2)
  }

  async runMathChallenge(roller, roll, gains) {
    const problem = generateProblem(Settings.difficulty)
    this.setStatus(roller.name + ' rolled ' + roll.total + ' — that is your number!')
    this.modalOpen = true
    this.board.inputEnabled = false
    this.refresh()

    const correct = await new Promise((resolve) => {
      this.scene.launch('Math', {
        problem,
        title: roller.name + ' rolled ' + roll.total + ' — your number!',
        reward: describeGains(gains),
        onDone: resolve
      })
    })

    this.modalOpen = false
    this.board.inputEnabled = true
    if (correct) {
      this.model.grant(this.humanId, gains)
      this.log('Correct! You collect ' + describeGains(gains) + '.')
    } else {
      this.log('Missed ' + problem.text + ' = ' + problem.answer + ' — no resources.')
    }
    this.refresh()
  }

  // ---- human actions (called by HUD buttons while it is your turn) ----

  async onBuild(kind) {
    const m = this.model
    const me = this.humanId
    if (!this.humanActing || this.modalOpen) return
    this.cancelAction()

    const ids =
      kind === 'road'
        ? m.legalRoadEdges(me)
        : kind === 'settlement'
          ? m.legalSettlementVertices(me)
          : m.legalCityVertices(me)
    const message = {
      road: 'Pick where to build a road (Esc to cancel).',
      settlement: 'Pick where to build a settlement (Esc to cancel).',
      city: 'Pick a settlement to upgrade to a city (Esc to cancel).'
    }[kind]

    const id = await this.pick(kind === 'road' ? 'edge' : 'vertex', ids, message)
    if (id === null) return this.restoreStatus()

    const built =
      kind === 'road' ? m.buildRoad(me, id) : kind === 'settlement' ? m.buildSettlement(me, id) : m.buildCity(me, id)
    if (built) this.log('You built a ' + kind + '.')
    this.restoreStatus()
    this.refresh()
    if (m.phase === 'over' && this.endResolve) this.endResolve()
  }

  onBank() {
    if (!this.humanActing || this.modalOpen) return
    if (this.tradeMode) return this.cancelAction()
    this.cancelPick()
    this.tradeMode = 'give'
    this.setStatus('Bank trade: pick a resource to give (needs ' + BANK_RATIO + '). Esc to cancel.')
    this.refresh()
  }

  onResource(res) {
    if (!this.tradeMode || this.modalOpen) return
    const hand = this.model.player(this.humanId).resources
    if (this.tradeMode === 'give') {
      if (hand[res] < BANK_RATIO) return
      this.tradeGive = res
      this.tradeMode = 'get'
      this.setStatus('Giving ' + BANK_RATIO + ' ' + res + ' — now pick the resource you want.')
    } else {
      if (res === this.tradeGive) return
      if (this.model.bankTrade(this.humanId, this.tradeGive, res)) {
        this.log('You traded ' + BANK_RATIO + ' ' + this.tradeGive + ' for 1 ' + res + '.')
      }
      this.tradeMode = null
      this.tradeGive = null
      this.restoreStatus()
    }
    this.refresh()
  }

  onEndTurn() {
    if (this.humanActing && !this.modalOpen && this.endResolve) this.endResolve()
  }

  cancelAction() {
    if (!this.humanActing) return
    this.cancelPick()
    if (this.tradeMode) {
      this.tradeMode = null
      this.tradeGive = null
      this.refresh()
    }
    this.restoreStatus()
  }

  restoreStatus() {
    if (this.humanActing) this.setStatus('Build, trade with the bank (4 of one for 1 of another), or end your turn.')
  }

  // ---- end of game ----

  showGameOver() {
    const winner = this.model.player(this.model.winner)
    const cx = CANVAS_WIDTH / 2
    this.board.inputEnabled = false
    this.setStatus(winner.human ? 'You win!' : winner.name + ' wins.')
    this.refresh()

    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.6).setOrigin(0, 0).setInteractive()
    this.add
      .text(cx, 210, winner.human ? 'You win!' : winner.name + ' wins', {
        fontFamily: FONT,
        fontSize: '56px',
        fontStyle: 'bold',
        color: winner.human ? '#4ade80' : '#f87171'
      })
      .setOrigin(0.5)
    const scores = this.model.players.map((p) => p.name + ': ' + this.model.victoryPoints(p.id) + ' pts').join('     ')
    this.add.text(cx, 270, scores, { fontFamily: FONT, fontSize: '20px', color: '#e2e8f0' }).setOrigin(0.5)
    createButton(this, cx, 350, 240, 54, 'Play again', () => this.scene.restart(), { fontSize: 22 })
    createButton(this, cx, 420, 240, 54, 'Menu', () => this.scene.start('Menu'), { fontSize: 22 })
  }
}
