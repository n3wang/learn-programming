import { EventBus } from '../state/EventBus.js'

export class FighterHealth {
  constructor(fighter, side) {
    this.fighter = fighter
    this.side = side // 'player' | 'enemy' — used to tag EventBus payloads
    this.maxHealth = 100
    this.maxStamina = 100
    this.health = 100
    this.stamina = 100
  }

  reset(maxHealth, maxStamina) {
    this.maxHealth = maxHealth
    this.maxStamina = maxStamina
    this.health = maxHealth
    this.stamina = maxStamina
    this.emitHealth()
    this.emitStamina()
  }

  emitHealth() {
    EventBus.emit('health-changed', { side: this.side, health: this.health, maxHealth: this.maxHealth })
  }

  emitStamina() {
    EventBus.emit('stamina-changed', { side: this.side, stamina: this.stamina, maxStamina: this.maxStamina })
  }

  regenStamina(dt) {
    if (this.fighter.dead || this.stamina >= this.maxStamina) return
    this.stamina = Math.min(this.maxStamina, this.stamina + (this.maxStamina / 2) * dt)
    this.emitStamina()
  }

  spendStamina(amount) {
    if (this.stamina < amount) return false
    this.stamina -= amount
    this.emitStamina()
    return true
  }

  drainStamina(amount) {
    this.stamina = Math.max(0, this.stamina - amount)
    this.emitStamina()
  }

  takeHit(damage = 20) {
    this.health = Math.max(0, this.health - damage)
    this.emitHealth()
    return this.health <= 0
  }

  isDead() {
    return this.health <= 0
  }
}
