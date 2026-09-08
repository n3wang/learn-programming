import {
  SPLIT_DAMAGE_TAKEN,
  SPLIT_KNOCKBACK,
  SPLIT_STAMINA_COST,
  SPLIT_PUSH_COOLDOWN_MS,
  SAFE_CLASH_COOLDOWN_MS,
  CLASH_WINDOW_MS
} from '../config/gameConfig.js'
import {
  sameLane,
  tipOnlyHit,
  facingEachOther,
  hittingFromBehind,
  boxesOverlap,
  attackRangesClash,
  safeClash
} from './geometry.js'

function clashOpen(fighter, now) {
  return fighter.isSwinging() || now < (fighter.combat.clashUntil || 0)
}

// Owns the stateful per-frame clash orchestration that the original inlined
// into animate(): hit-frame detection, tip/landed/safe classification (only
// within the same lane — attacks never reach across tracks), the
// split-damage clash (both fighters mid-swing into each other, which also
// freezes both swings on their clank frame instead of playing them through)
// vs the safe tip-clash ("swoosh", no damage), and damage/knockback/stamina
// application. Returns a plain result describing what happened so FightScene
// can react (popups, EventBus, afterimages) without this class touching
// Phaser or UI at all.
export class ClashResolver {
  constructor() {
    this.lastSplitPush = 0
    this.lastSafeClash = 0
    this.splitArmed = { player: false, enemy: false }
  }

  resolve(player, enemy, now, { testMode = false } = {}) {
    const result = {
      splitClash: false,
      safeClash: false,
      playerLanded: false,
      enemyLanded: false,
      playerDamage: 0,
      enemyDamage: 0,
      playerAttackName: player.currentAttack,
      enemyAttackName: enemy.currentAttack
    }

    const playerHitFrame = player.combat.isAttacking && player.animator.frameIndex === player.combat.hitFrame
    const enemyHitFrame = enemy.combat.isAttacking && enemy.animator.frameIndex === enemy.combat.hitFrame
    if (playerHitFrame) player.combat.clashUntil = now + CLASH_WINDOW_MS
    if (enemyHitFrame) enemy.combat.clashUntil = now + CLASH_WINDOW_MS

    const sharedLane = sameLane(player, enemy)
    const playerTip =
      sharedLane &&
      playerHitFrame &&
      tipOnlyHit(player, enemy) &&
      enemy.isSwinging() &&
      facingEachOther(player, enemy) &&
      !hittingFromBehind(player, enemy)
    const enemyTip =
      sharedLane &&
      enemyHitFrame &&
      tipOnlyHit(enemy, player) &&
      player.isSwinging() &&
      facingEachOther(player, enemy) &&
      !hittingFromBehind(enemy, player)
    const playerLanded = playerHitFrame && !playerTip && sharedLane && boxesOverlap(player.attackBox, enemy)
    const enemyLanded = enemyHitFrame && !enemyTip && sharedLane && boxesOverlap(enemy.attackBox, player)
    const playerSafe = playerTip
    const enemySafe = enemyTip

    const splitClash =
      sharedLane && clashOpen(player, now) && clashOpen(enemy, now) && attackRangesClash(player, enemy)
    const tippedClash = sharedLane && safeClash(player, enemy)
    let playerSplits = false
    let enemySplits = false

    if (splitClash) {
      if (now - this.lastSplitPush > SPLIT_PUSH_COOLDOWN_MS) {
        this.lastSplitPush = now
        this.splitArmed.player = player.stamina >= SPLIT_STAMINA_COST
        this.splitArmed.enemy = enemy.stamina >= SPLIT_STAMINA_COST
        player.knockBack(SPLIT_KNOCKBACK)
        enemy.knockBack(SPLIT_KNOCKBACK)
        if (this.splitArmed.player) player.health.drainStamina(SPLIT_STAMINA_COST)
        if (this.splitArmed.enemy) enemy.health.drainStamina(SPLIT_STAMINA_COST)
        player.animator.freezeAtClankFrame()
        enemy.animator.freezeAtClankFrame()
        result.splitClash = true
      }
      playerSplits = this.splitArmed.player
      enemySplits = this.splitArmed.enemy
    } else if ((tippedClash || playerSafe || enemySafe) && now - this.lastSafeClash > SAFE_CLASH_COOLDOWN_MS) {
      this.lastSafeClash = now
      result.safeClash = true
    }

    if (playerSafe) {
      player.combat.isAttacking = false
    } else if (playerLanded) {
      const raw = player.hitDamage()
      const damage = !testMode && enemySplits ? raw * SPLIT_DAMAGE_TAKEN : raw
      const dealt = Math.max(1, Math.round(damage))
      enemy.takeHit(dealt)
      if (testMode) {
        enemy.health.reset(enemy.combat.kit.maxHealth, enemy.health.maxStamina, enemy.health.staminaRegenPerSecond)
        enemy.dead = false
        if (enemy.animator.isDying()) enemy.animator.switchSprite('idle')
      }
      player.combat.isAttacking = false
      result.playerLanded = true
      result.playerDamage = dealt
    }

    if (player.combat.isAttacking && player.animator.frameIndex === player.combat.hitFrame) {
      player.combat.isAttacking = false
    }

    if (enemySafe) {
      enemy.combat.isAttacking = false
    } else if (enemyLanded) {
      const raw = enemy.hitDamage()
      const damage = playerSplits ? raw * SPLIT_DAMAGE_TAKEN : raw
      const dealt = Math.max(1, Math.round(damage))
      player.takeHit(dealt)
      enemy.combat.isAttacking = false
      result.enemyLanded = true
      result.enemyDamage = dealt
    }

    if (enemy.combat.isAttacking && enemy.animator.frameIndex === enemy.combat.hitFrame) {
      enemy.combat.isAttacking = false
    }

    return result
  }
}
