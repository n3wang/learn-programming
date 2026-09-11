import { Fighter } from '../entities/Fighter.js'
import { ClashResolver } from '../combat/ClashResolver.js'
import { InputController } from '../input/InputController.js'
import { DummyController } from '../input/DummyController.js'
import { P1_KEYS, P2_KEYS, LANE_SWAP_CODE } from '../input/KeyBindings.js'
import { GameState } from '../state/GameState.js'
import { EventBus } from '../state/EventBus.js'
import { MatchTimer } from '../utils/timer.js'
import { getCharacter } from '../data/characters.js'
import { getStage } from '../data/stages.js'
import { PLAYER_SPAWN_X, ENEMY_SPAWN_X, TEST_PLAYER_X, TEST_ENEMY_X, HEALTH_BAR_MS } from '../config/gameConfig.js'

export class FightScene extends Phaser.Scene {
  constructor() {
    super('Fight')
  }

  create() {
    this.testMode = GameState.mode === 'test'
    this.stage = getStage(GameState.stageId)
    this.matchOver = false
    this.matchEndingAt = 0
    this.paused = false

    this.add.image(0, 0, 'stage_' + this.stage.id).setOrigin(0, 0)
    if (this.stage.shop) {
      this.add.sprite(600, 128, 'shop').setOrigin(0, 0).setScale(2.75).play('shop_idle')
    }

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

    this.clashResolver = new ClashResolver()
    this.matchTimer = new MatchTimer(this)

    this.p1Input = new InputController(this, P1_KEYS)
    this.p2Input = this.testMode ? new DummyController() : new InputController(this, P2_KEYS)

    this.scene.launch('UI', { testMode: this.testMode, player: this.player, enemy: this.enemy })

    if (!this.testMode) {
      this.matchTimer.reset()
      this.matchTimer.resume()
    }

    this.onTimerEnd = () => this.determineWinner()
    EventBus.on('timer-end', this.onTimerEnd)

    this.rawKeyHandler = (event) => this.onRawKeyDown(event)
    window.addEventListener('keydown', this.rawKeyHandler)

    this.events.once('shutdown', () => this.cleanup())
  }

  cleanup() {
    window.removeEventListener('keydown', this.rawKeyHandler)
    EventBus.off('timer-end', this.onTimerEnd)
    this.matchTimer.destroy()
  }

  onRawKeyDown(event) {
    if (event.code === LANE_SWAP_CODE.p1) {
      event.preventDefault()
      if (!event.repeat && !this.paused && !this.matchOver && !this.matchEndingAt) this.player.swapTrack()
      return
    }
    if (event.code === LANE_SWAP_CODE.p2) {
      event.preventDefault()
      if (!event.repeat && !this.paused && !this.matchOver && !this.matchEndingAt) this.enemy.swapTrack()
      return
    }
    if (event.key === 'Escape') {
      if (!this.matchOver && !this.matchEndingAt) this.setPaused(!this.paused)
    }
  }

  setPaused(paused) {
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

  restartMatch() {
    this.scene.stop('UI')
    this.scene.stop('Controls')
    this.scene.stop('Pause')
    this.scene.stop('Result')
    this.scene.restart()
  }

  goToSelect() {
    this.scene.stop('UI')
    this.scene.stop('Controls')
    this.scene.stop('Pause')
    this.scene.stop('Result')
    this.scene.start('CharacterSelect')
  }

  applyIntent(fighter, opponent, intent) {
    if (!fighter.dead && intent.attackJustDown) {
      fighter.attack({
        movingForward: fighter.faceRight ? intent.rightIsDown : intent.leftIsDown,
        opponent
      })
    }

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

  spawnBetweenPopup(text) {
    const player = this.player
    const enemy = this.enemy
    const x = (player.position.x + player.hitWidth / 2 + enemy.position.x + enemy.hitWidth / 2) / 2
    const y = Math.min(player.position.y, enemy.position.y) + 28
    EventBus.emit('popup', { x, y, text })
  }

  spawnHitPopup(target, text) {
    EventBus.emit('popup', { x: target.position.x + target.hitWidth / 2, y: target.position.y + 20, text })
  }

  reactToClash(result) {
    if (result.splitClash) {
      this.spawnBetweenPopup('clank')
    } else if (result.safeClash) {
      this.spawnBetweenPopup('swoosh')
      if (this.testMode) EventBus.emit('test-hit-text', 'Last hit: swoosh')
    }

    if (result.playerLanded) {
      if (this.testMode) {
        const attackName = result.playerAttackName === 'attack2' ? 'Attack 2' : 'Attack 1'
        EventBus.emit('test-hit-text', 'Last hit: ' + attackName + ' for ' + result.playerDamage)
        this.spawnHitPopup(this.enemy, '-' + result.playerDamage)
      }
    }
  }

  finishMatchLater(now) {
    if (this.matchOver || this.matchEndingAt) return
    this.matchTimer.pause()
    this.matchEndingAt = now + HEALTH_BAR_MS
  }

  determineWinner() {
    if (this.matchOver) return
    this.matchOver = true
    this.matchEndingAt = 0
    this.player.combat.queuedAttack = null
    this.enemy.combat.queuedAttack = null
    if (this.player.health.health < this.enemy.health.health || this.player.health.health <= 0) this.player.fallDown()
    if (this.enemy.health.health < this.player.health.health || this.enemy.health.health <= 0) this.enemy.fallDown()
    this.matchTimer.pause()

    let resultText
    if (this.player.health.health === this.enemy.health.health) resultText = 'Tie'
    else if (this.player.health.health > this.enemy.health.health) resultText = 'Player 1 Wins'
    else resultText = 'Player 2 Wins'

    this.scene.launch('Result', { resultText })
  }

  update(time, delta) {
    if (this.matchOver) return
    const dt = Math.min(delta / 1000, 0.05)
    const now = performance.now()

    this.player.regenStamina(dt)
    this.enemy.regenStamina(dt)

    this.player.update()
    this.enemy.update()

    this.playerMarker.setPosition(this.player.position.x - 6, this.player.position.y + this.player.hitHeight + 4)
    this.playerMarker.width = this.player.hitWidth + 12
    this.enemyMarker.setPosition(this.enemy.position.x - 6, this.enemy.position.y + this.enemy.hitHeight + 4)
    this.enemyMarker.width = this.enemy.hitWidth + 12

    this.player.velocity.x = 0
    this.enemy.velocity.x = 0

    this.applyIntent(this.player, this.enemy, this.p1Input.pollIntent())
    this.applyIntent(this.enemy, this.player, this.p2Input.pollIntent())

    const result = this.clashResolver.resolve(this.player, this.enemy, now, { testMode: this.testMode })
    this.reactToClash(result)

    if (!this.testMode) {
      if (!this.matchEndingAt && (this.player.health.health <= 0 || this.enemy.health.health <= 0)) {
        this.finishMatchLater(now)
        this.player.velocity.x = 0
        this.enemy.velocity.x = 0
      }
      if (this.matchEndingAt && now >= this.matchEndingAt) this.determineWinner()
    }
  }
}
