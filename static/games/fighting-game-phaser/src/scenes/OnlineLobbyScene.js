import { GameState, teardownOnline } from '../state/GameState.js'
import { NetClient } from '../net/NetClient.js'
import { getPlayerName, getRoomId, socketsSupported } from '../net/netConfig.js'
import { resolveCharacterId, resolveStageId } from '../net/netSync.js'
import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'
import { UI, UI_FONT } from '../ui/strings.js'

const CONNECT_TIMEOUT_MS = 5000

/**
 * Matchmaking waiting room. Owns the socket until a match starts, then hands
 * it to FightScene through GameState. Any failure here is a dead end that
 * returns to character select with local play untouched.
 */
export class OnlineLobbyScene extends Phaser.Scene {
  constructor() {
    super('OnlineLobby')
  }

  create() {
    this.matched = false
    this.subscriptions = []

    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x111111).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, 150, UI.onlineTitle, {
        fontFamily: UI_FONT,
        fontSize: '30px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    this.statusText = this.add
      .text(CANVAS_WIDTH / 2, 240, UI.onlineConnecting, {
        fontFamily: UI_FONT,
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      })
      .setOrigin(0.5, 0.5)

    this.detailText = this.add
      .text(CANVAS_WIDTH / 2, 300, '', {
        fontFamily: UI_FONT,
        fontSize: '14px',
        color: '#9ca3af',
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5, 0.5)

    this.backButton = createButton(this, CANVAS_WIDTH / 2, 380, 260, 40, UI.cancel, () => this.leave())

    this.events.once('shutdown', () => this.cleanup())

    if (!socketsSupported()) {
      this.showOffline()
      return
    }
    this.startMatchmaking()
  }

  async startMatchmaking() {
    // A stale socket from a previous match must not leak into this one.
    teardownOnline()

    const net = new NetClient()
    GameState.net = net

    this.listen(net, 'queued', (msg) => {
      this.statusText.setText(UI.onlineWaiting)
      this.detailText.setText(
        UI.onlineWaitingCount + (msg.waiting || 1) + '\n' + this.identityLine()
      )
    })
    this.listen(net, 'match', (msg) => this.onMatch(msg))
    this.listen(net, 'close', () => {
      if (!this.matched) this.showOffline(UI.onlineLost)
    })
    this.listen(net, 'error', (msg) => {
      console.warn('[net] server error', msg && msg.message)
    })

    const ok = await net.connect({ timeoutMs: CONNECT_TIMEOUT_MS })
    // The scene may already be gone if the player backed out while connecting.
    if (!this.scene.isActive('OnlineLobby')) return
    if (!ok) {
      this.showOffline()
      return
    }

    this.statusText.setText(UI.onlineWaiting)
    this.detailText.setText(this.identityLine())
    net.queue({
      name: getPlayerName(),
      character: GameState.p1Character,
      stage: GameState.stageId,
      room: getRoomId()
    })
  }

  identityLine() {
    return UI.onlineYou + '：' + getPlayerName() + '　　' + UI.onlineNotice
  }

  onMatch(msg) {
    if (this.matched) return
    this.matched = true

    const isHost = msg.role === 'host'
    const p1 = msg.p1 || {}
    const p2 = msg.p2 || {}

    GameState.online.active = true
    GameState.online.role = isHost ? 'host' : 'guest'
    GameState.online.side = isHost ? 'p1' : 'p2'
    GameState.online.matchId = msg.matchId || null
    GameState.online.seed = Number(msg.seed) || 0
    GameState.online.youName = (msg.you && msg.you.name) || getPlayerName()
    GameState.online.opponentName = (msg.opponent && msg.opponent.name) || UI.onlineOpponent
    GameState.online.p1Name = p1.name || ''
    GameState.online.p2Name = p2.name || ''

    // Both clients render the same world: P1 on the left, P2 on the right.
    GameState.p1Character = resolveCharacterId(p1.character, 'samurai')
    GameState.p2Character = resolveCharacterId(p2.character, 'kenji')
    GameState.stageId = resolveStageId(msg.stage, GameState.stageId)
    GameState.mode = 'match'

    this.statusText.setText(UI.onlineMatched)
    this.detailText.setText(
      GameState.online.p1Name + '  vs  ' + GameState.online.p2Name + '\n' +
        UI.onlineYouAre +
        '：' +
        (isHost ? UI.onlineLeftFighter : UI.onlineRightFighter)
    )
    this.backButton.setVisibleButton(false)

    this.time.delayedCall(900, () => {
      if (!this.scene.isActive('OnlineLobby')) return
      this.releaseSubscriptions()
      this.scene.start('Fight')
    })
  }

  showOffline(message = UI.onlineOffline) {
    this.statusText.setText(message)
    this.detailText.setText('')
    this.backButton.setLabel(UI.back)
    this.backButton.setVisibleButton(true)
  }

  listen(net, type, handler) {
    net.on(type, handler)
    this.subscriptions.push([net, type, handler])
  }

  releaseSubscriptions() {
    for (const [net, type, handler] of this.subscriptions) net.off(type, handler)
    this.subscriptions.length = 0
  }

  leave() {
    teardownOnline()
    this.scene.start('CharacterSelect')
  }

  cleanup() {
    this.releaseSubscriptions()
    // Only tear the socket down if we are NOT handing it to FightScene.
    if (!this.matched) teardownOnline()
  }
}
