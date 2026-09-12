import { Fighter } from '../entities/Fighter.js'
import { ClashResolver } from '../combat/ClashResolver.js'
import { InputController } from '../input/InputController.js'
import { DummyController } from '../input/DummyController.js'
import { NetworkController } from '../input/NetworkController.js'
import { AiController, createAiStrategy } from '../ai/index.js'
import { P1_KEYS, P2_KEYS, LANE_SWAP_CODE } from '../input/KeyBindings.js'
import { GameState, teardownOnline } from '../state/GameState.js'
import { EventBus } from '../state/EventBus.js'
import { MatchTimer } from '../utils/timer.js'
import { getCharacter } from '../data/characters.js'
import { getStage } from '../data/stages.js'
import { StageView, enforceMaxSeparation } from '../world/StageView.js'
import {
  PLAYER_SPAWN_X,
  ENEMY_SPAWN_X,
  TEST_PLAYER_X,
  TEST_ENEMY_X,
  HEALTH_BAR_MS,
  MATCH_END_FALLBACK_MS
} from '../config/gameConfig.js'
import { UI } from '../ui/strings.js'
import { TestHitboxOverlay } from '../ui/TestHitboxOverlay.js'
import {
  encodeIntent,
  decodeIntent,
  encodeFighter,
  applyFighterSnapshot,
  createAnimTracker,
  createAnimCache
} from '../net/netSync.js'

export class FightScene extends Phaser.Scene {
  constructor() {
    super('Fight')
  }

  create() {
    this.testMode = GameState.mode === 'test'

    // Online was requested but the link died between lobby and fight: bail out
    // rather than silently starting a match nobody else is in.
    if (!this.testMode && GameState.opponent === 'online' && !this.onlineLinkReady()) {
      teardownOnline()
      this.scene.start('CharacterSelect')
      return
    }

    this.online =
      !this.testMode && GameState.opponent === 'online' && GameState.online.active
        ? GameState.online
        : null
    this.net = this.online ? GameState.net : null
    this.isHost = !!this.online && this.online.role === 'host'
    this.isGuest = !!this.online && this.online.role === 'guest'
    this.opponentGone = false
    this.onlineMenuOpen = false
    this.pendingLaneSwap = false
    this.myRematch = false
    this.opponentRematch = false
    this.latestSnapshot = null
    this.snapshotSeq = 0
    this.lastAppliedSeq = -1

    this.stage = getStage(GameState.stageId)
    this.matchOver = false
    this.matchEndingAt = 0
    this.paused = false

    this.stageView = new StageView(this, this.stage)

    const spawnX = this.testMode ? TEST_PLAYER_X : PLAYER_SPAWN_X
    const enemySpawnX = this.testMode ? TEST_ENEMY_X : ENEMY_SPAWN_X

    this.player = new Fighter(this, spawnX, 330, 'player')
    this.enemy = new Fighter(this, enemySpawnX, 330, 'enemy')
    this.player.setStage(this.stage)
    this.enemy.setStage(this.stage)
    this.player.loadCharacter(getCharacter(GameState.p1Character), true)
    this.enemy.loadCharacter(getCharacter(GameState.p2Character), false)
    this.player.motion.placeOnTrack(0)
    this.enemy.motion.placeOnTrack(0)
    this.player.position.x = spawnX
    this.enemy.position.x = enemySpawnX

    this.playerMarker = this.add.rectangle(0, 0, 1, 8, 0xef4444).setOrigin(0, 0)
    this.enemyMarker = this.add.rectangle(0, 0, 1, 8, 0x3b82f6).setOrigin(0, 0)
    this.testHitboxes = this.testMode ? new TestHitboxOverlay(this) : null

    this.clashResolver = new ClashResolver()
    this.matchTimer = new MatchTimer(this)

    // Online guests drive the RIGHT fighter, but still with the P1 keys —
    // both screens show the identical world, so only the target differs.
    this.p1Input = new InputController(this, P1_KEYS)
    this.p2Input = this.createP2Controller()

    this.hostAnimTrackers = this.isHost
      ? { player: createAnimTracker(), enemy: createAnimTracker() }
      : null
    this.guestAnimCaches = this.isGuest
      ? { player: createAnimCache(), enemy: createAnimCache() }
      : null

    this.stageView.updateCamera(this.player, this.enemy)

    this.scene.launch('UI', {
      testMode: this.testMode,
      player: this.player,
      enemy: this.enemy,
      online: this.online
        ? {
            side: this.online.side,
            p1Name: this.online.p1Name,
            p2Name: this.online.p2Name,
            net: this.net
          }
        : null
    })

    if (!this.testMode) {
      this.matchTimer.reset()
      // The host owns match time; the guest just displays what it is told.
      if (!this.isGuest) this.matchTimer.resume()
    }

    this.onTimerEnd = () => this.beginMatchEnd(performance.now())
    EventBus.on('timer-end', this.onTimerEnd)

    this.rawKeyHandler = (event) => this.onRawKeyDown(event)
    window.addEventListener('keydown', this.rawKeyHandler)

    this.attachNetHandlers()

    this.events.once('shutdown', () => this.cleanup())
  }

  onlineLinkReady() {
    return !!(GameState.online.active && GameState.net && GameState.net.isOpen())
  }

  createP2Controller() {
    if (this.testMode) return new DummyController()
    if (this.isHost) return new NetworkController()
    // The guest simulates nothing — both fighters replay host snapshots.
    if (this.isGuest) return new DummyController()
    if (GameState.opponent === 'cpu') {
      return new AiController(
        this.enemy,
        this.player,
        createAiStrategy(GameState.aiStrategy || 'rush')
      )
    }
    return new InputController(this, P2_KEYS)
  }

  // ------------------------------------------------------------ networking

  attachNetHandlers() {
    if (!this.net) return
    this.netHandlers = {
      in: (msg) => {
        if (this.isHost && this.p2Input instanceof NetworkController) {
          this.p2Input.receive(decodeIntent(msg.d))
        }
      },
      st: (msg) => {
        if (this.isGuest) this.latestSnapshot = msg
      },
      ev: (msg) => this.onNetEvent(msg),
      'opponent-left': () => this.onOpponentGone(UI.onlineOpponentLeft),
      close: () => this.onOpponentGone(UI.onlineLost)
    }
    for (const [type, handler] of Object.entries(this.netHandlers)) {
      this.net.on(type, handler)
    }
  }

  detachNetHandlers() {
    if (!this.net || !this.netHandlers) return
    for (const [type, handler] of Object.entries(this.netHandlers)) {
      this.net.off(type, handler)
    }
    this.netHandlers = null
  }

  sendNet(payload) {
    if (!this.net) return false
    return this.net.send(payload)
  }

  onNetEvent(msg) {
    switch (msg.e) {
      case 'end':
        if (this.isGuest) this.finishOnlineMatch(msg.r)
        break
      case 'popup':
        EventBus.emit('popup', { x: msg.x, y: msg.y, text: msg.text })
        break
      case 'rematch':
        this.opponentRematch = true
        EventBus.emit('online-rematch-state', this.rematchState())
        this.tryStartRematch()
        break
      case 'rematch-go':
        if (this.isGuest) this.restartMatch()
        break
      default:
        break
    }
  }

  onOpponentGone(reason) {
    if (this.opponentGone) return
    this.opponentGone = true
    if (this.online) this.online.active = false
    if (this.matchOver) {
      EventBus.emit('online-rematch-state', this.rematchState())
      return
    }
    this.freezeWorld()
    this.matchOver = true
    this.matchEndingAt = 0
    this.scene.launch('Result', { resultText: reason })
  }

  /** Host: authoritative world state, every frame, for the guest to replay. */
  sendSnapshot() {
    if (!this.isHost) return
    this.sendNet({
      type: 'st',
      n: this.snapshotSeq++,
      p: encodeFighter(this.player, this.hostAnimTrackers.player),
      e: encodeFighter(this.enemy, this.hostAnimTrackers.enemy),
      tm: this.matchTimer.seconds
    })
  }

  /** Guest: local keys go to the host, which owns both fighters. */
  sendLocalIntent() {
    const intent = this.p1Input.pollIntent()
    if (this.pendingLaneSwap) {
      intent.laneSwap = true
      this.pendingLaneSwap = false
    }
    this.sendNet({ type: 'in', d: encodeIntent(intent) })
  }

  applyLatestSnapshot() {
    const snapshot = this.latestSnapshot
    if (!snapshot) return
    // Frames can arrive out of order on a lossy link — never rewind.
    const seq = Number(snapshot.n) || 0
    if (seq < this.lastAppliedSeq) return
    this.lastAppliedSeq = seq

    applyFighterSnapshot(this.player, snapshot.p, this.guestAnimCaches.player)
    applyFighterSnapshot(this.enemy, snapshot.e, this.guestAnimCaches.enemy)

    const seconds = Number(snapshot.tm)
    if (Number.isFinite(seconds) && seconds !== this.matchTimer.seconds) {
      this.matchTimer.seconds = seconds
      EventBus.emit('timer-tick', seconds)
    }
  }

  // ----------------------------------------------------------------- match

  cleanup() {
    window.removeEventListener('keydown', this.rawKeyHandler)
    EventBus.off('timer-end', this.onTimerEnd)
    this.matchTimer.destroy()
    this.detachNetHandlers()
  }

  commandsLocked() {
    return this.matchOver || !!this.matchEndingAt
  }

  onRawKeyDown(event) {
    if (event.code === LANE_SWAP_CODE.p1) {
      event.preventDefault()
      if (event.repeat || this.paused || this.commandsLocked()) return
      // The guest owns no simulation: queue the swap for the host instead.
      if (this.isGuest) this.pendingLaneSwap = true
      else this.player.swapTrack()
      return
    }
    if (event.code === LANE_SWAP_CODE.p2) {
      event.preventDefault()
      if (
        GameState.opponent === 'human' &&
        !event.repeat &&
        !this.paused &&
        !this.commandsLocked()
      ) {
        this.enemy.swapTrack()
      }
      return
    }
    if (event.key === 'Escape') {
      if (!this.commandsLocked()) this.toggleMenu()
    }
  }

  /** Esc: a real pause locally, a non-blocking overlay online. */
  toggleMenu() {
    if (this.online) {
      this.onlineMenuOpen = !this.onlineMenuOpen
      if (this.onlineMenuOpen) this.scene.launch('Pause')
      else this.closeMenu()
      return
    }
    this.setPaused(!this.paused)
  }

  closeMenu() {
    if (this.online) {
      this.onlineMenuOpen = false
      this.scene.stop('Controls')
      this.scene.stop('Pause')
      return
    }
    this.setPaused(false)
  }

  setPaused(paused) {
    // Pausing online would freeze only one side, so the menu floats instead.
    if (this.online) {
      if (paused) this.toggleMenu()
      else this.closeMenu()
      return
    }
    this.paused = paused
    if (paused) {
      this.matchTimer.pause()
      this.scene.pause()
      this.scene.pause('UI')
      this.scene.launch('Pause')
    } else {
      this.scene.resume()
      this.scene.resume('UI')
      if (!this.testMode) this.matchTimer.resume()
      this.scene.stop('Controls')
      this.scene.stop('Pause')
    }
  }

  applyIntent(fighter, opponent, intent) {
    if (!fighter.dead && intent.attackJustDown) {
      fighter.attack({
        movingForward: fighter.faceRight ? intent.rightIsDown : intent.leftIsDown,
        opponent
      })
    }

    // Only remote intents carry laneSwap — local players use the raw key path.
    if (intent.laneSwap) fighter.swapTrack()

    const locked = !fighter.dead && fighter.locksDirection()

    if (!fighter.dead) {
      if (intent.rightJustDown) {
        if (!(fighter.noteDoubleTap(1) && fighter.mirror(opponent, 1)) && !locked) fighter.setFacing(true)
      }
      if (intent.leftJustDown) {
        if (!(fighter.noteDoubleTap(-1) && fighter.mirror(opponent, -1)) && !locked) fighter.setFacing(false)
      }
      if (intent.jumpJustDown) fighter.jump()
    }

    const forward = fighter.faceRight ? 1 : -1
    const moveDir = locked && intent.moveDir === -forward ? 0 : intent.moveDir

    if (fighter.motion.laneSwap) {
      fighter.switchSprite('jump')
    } else if (moveDir < 0) {
      if (!locked) fighter.setFacing(false)
      fighter.velocity.x = -fighter.combat.kit.moveSpeed
      fighter.switchSprite('run')
    } else if (moveDir > 0) {
      if (!locked) fighter.setFacing(true)
      fighter.velocity.x = fighter.combat.kit.moveSpeed
      fighter.switchSprite('run')
    } else {
      fighter.switchSprite('idle')
    }

    if (fighter.velocity.y < 0) fighter.switchSprite('jump')
    else if (fighter.velocity.y > 0) fighter.switchSprite('fall')
  }

  emitPopup(x, y, text) {
    EventBus.emit('popup', { x, y, text })
    // Screen coords match on both clients: the camera follows synced positions.
    if (this.isHost) this.sendNet({ type: 'ev', e: 'popup', x, y, text })
  }

  spawnBetweenPopup(text) {
    const player = this.player
    const enemy = this.enemy
    const worldX = (player.position.x + player.hitWidth / 2 + enemy.position.x + enemy.hitWidth / 2) / 2
    const worldY = Math.min(player.position.y, enemy.position.y) + 28
    const screen = this.stageView.toScreen(worldX, worldY)
    this.emitPopup(screen.x, screen.y, text)
  }

  spawnHitPopup(target, text) {
    const screen = this.stageView.toScreen(target.position.x + target.hitWidth / 2, target.position.y + 20)
    this.emitPopup(screen.x, screen.y, text)
  }

  reactToClash(result) {
    if (result.splitClash) {
      this.spawnBetweenPopup('clank')
    } else if (result.safeClash) {
      this.spawnBetweenPopup('swoosh')
      if (this.testMode) EventBus.emit('test-hit-text', UI.lastHitSwoosh)
    }

    if (result.playerLanded) {
      if (this.testMode) {
        const attackName =
          result.playerAttackName === 'attack3'
            ? UI.attack3
            : result.playerAttackName === 'attack2'
              ? UI.attack2
              : UI.attack1
        EventBus.emit(
          'test-hit-text',
          UI.lastHitPrefix + attackName + UI.lastHitFor + result.playerDamage
        )
        this.spawnHitPopup(this.enemy, '-' + result.playerDamage)
      }
    }
  }

  /** Lock input/AI and let death (or timer KO) play before the result menu. */
  beginMatchEnd(now = performance.now()) {
    if (this.matchOver || this.matchEndingAt) return
    if (this.isGuest) return // the host calls the end of an online match
    this.matchTimer.pause()
    this.matchEndingAt = now
    this.player.combat.queuedAttack = null
    this.enemy.combat.queuedAttack = null
    this.player.velocity.x = 0
    this.enemy.velocity.x = 0
    this.ensureLoserDeaths()
  }

  ensureLoserDeaths() {
    const pH = this.player.health.health
    const eH = this.enemy.health.health
    if (pH === eH) {
      this.player.fallDown()
      this.enemy.fallDown()
      return
    }
    if (pH < eH) this.player.fallDown()
    else this.enemy.fallDown()
  }

  deathAnimsFinished() {
    // isDying() stays true on the final death frame; dead flips when the clip ends.
    for (const f of [this.player, this.enemy]) {
      if (f.animator.isDying() && !f.dead) return false
    }
    return true
  }

  endSequenceReady(now) {
    if (now >= this.matchEndingAt + MATCH_END_FALLBACK_MS) return true
    if (now < this.matchEndingAt + HEALTH_BAR_MS) return false
    return this.deathAnimsFinished()
  }

  winnerCode() {
    const p = this.player.health.health
    const e = this.enemy.health.health
    if (p === e) return 'tie'
    return p > e ? 'p1' : 'p2'
  }

  resultTextFor(code) {
    if (code === 'tie') return UI.tie
    if (this.online) {
      const iWon = code === this.online.side
      return iWon ? UI.youWin : UI.youLose
    }
    if (code === 'p1') return UI.p1Wins
    return GameState.opponent === 'cpu' ? UI.cpuWins : UI.p2Wins
  }

  freezeWorld() {
    // Freeze on the final death pose; Result stays interactive on top.
    this.anims.pauseAll()
    this.tweens.pauseAll()
    this.time.paused = true
    this.matchTimer.pause()
  }

  determineWinner() {
    if (this.matchOver) return
    this.matchOver = true
    this.matchEndingAt = 0
    this.player.combat.queuedAttack = null
    this.enemy.combat.queuedAttack = null
    this.ensureLoserDeaths()

    const code = this.winnerCode()
    if (this.isHost) {
      // Final pose first, so the guest freezes on the same frame we do.
      this.sendSnapshot()
      this.sendNet({ type: 'ev', e: 'end', r: code })
    }

    this.freezeWorld()
    this.scene.launch('Result', { resultText: this.resultTextFor(code) })
  }

  /** Guest side of {@link determineWinner} — the host already decided. */
  finishOnlineMatch(code) {
    if (this.matchOver) return
    this.applyLatestSnapshot()
    this.matchOver = true
    this.matchEndingAt = 0
    this.freezeWorld()
    this.scene.launch('Result', { resultText: this.resultTextFor(code) })
  }

  // -------------------------------------------------------------- rematch

  rematchState() {
    return {
      mine: this.myRematch,
      opponent: this.opponentRematch,
      opponentGone: this.opponentGone
    }
  }

  requestRematch() {
    if (!this.online || this.opponentGone) return
    if (this.myRematch) return
    this.myRematch = true
    this.sendNet({ type: 'ev', e: 'rematch' })
    EventBus.emit('online-rematch-state', this.rematchState())
    this.tryStartRematch()
  }

  tryStartRematch() {
    if (!this.online || this.opponentGone) return
    if (!this.myRematch || !this.opponentRematch) return
    if (this.isHost) {
      this.sendNet({ type: 'ev', e: 'rematch-go' })
      this.restartMatch()
    }
    // The guest waits for 'rematch-go' so both restart from the host's cue.
  }

  leaveOnlineMatch() {
    if (!this.online) return
    if (this.net) this.net.leave()
    teardownOnline()
    this.online = null
    this.net = null
  }

  resumeWorld() {
    this.time.paused = false
    this.anims.resumeAll()
    this.tweens.resumeAll()
  }

  restartMatch() {
    this.resumeWorld()
    this.scene.stop('UI')
    this.scene.stop('Controls')
    this.scene.stop('Pause')
    this.scene.stop('Result')
    this.scene.restart()
  }

  goToSelect() {
    this.resumeWorld()
    this.leaveOnlineMatch()
    this.scene.stop('UI')
    this.scene.stop('Controls')
    this.scene.stop('Pause')
    this.scene.stop('Result')
    this.scene.start('CharacterSelect')
  }

  // --------------------------------------------------------------- update

  updateMarkers() {
    this.playerMarker.setPosition(this.player.position.x - 6, this.player.position.y + this.player.hitHeight + 4)
    this.playerMarker.width = this.player.hitWidth + 12
    this.enemyMarker.setPosition(this.enemy.position.x - 6, this.enemy.position.y + this.enemy.hitHeight + 4)
    this.enemyMarker.width = this.enemy.hitWidth + 12
    if (this.testHitboxes) this.testHitboxes.redraw(this.player, this.enemy)
  }

  updateGuest(dt) {
    this.sendLocalIntent()
    this.applyLatestSnapshot()
    this.stageView.updateCamera(this.player, this.enemy, dt)
    this.updateMarkers()
  }

  update(time, delta) {
    if (this.matchOver) return
    const dt = Math.min(delta / 1000, 0.05)
    const now = performance.now()

    if (this.isGuest) {
      this.updateGuest(dt)
      return
    }

    this.player.regenStamina(dt)
    this.enemy.regenStamina(dt)

    this.player.update()
    this.enemy.update()
    enforceMaxSeparation(this.player, this.enemy)
    this.stageView.updateCamera(this.player, this.enemy, dt)
    this.updateMarkers()

    this.player.velocity.x = 0
    this.enemy.velocity.x = 0

    this.sendSnapshot()

    // KO / timer end: no player or AI commands; death anim keeps playing.
    if (this.matchEndingAt) {
      if (this.endSequenceReady(now)) this.determineWinner()
      return
    }

    this.applyIntent(this.player, this.enemy, this.p1Input.pollIntent())
    this.applyIntent(this.enemy, this.player, this.p2Input.pollIntent())

    const result = this.clashResolver.resolve(this.player, this.enemy, now, { testMode: this.testMode })
    this.reactToClash(result)

    if (!this.testMode) {
      if (this.player.health.health <= 0 || this.enemy.health.health <= 0) {
        this.beginMatchEnd(now)
      }
    }
  }
}
