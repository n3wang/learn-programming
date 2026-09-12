// Test Range: draw hurtboxes + attack areas so workshop hitboxes are visible.

function attackDefFromKit(kit, name) {
  const per = kit.attackBoxes && kit.attackBoxes[name]
  if (per) {
    return {
      offset: { x: per.offset.x, y: per.offset.y },
      width: per.width,
      height: per.height
    }
  }
  if (name === 'attack1' && kit.attackBox) {
    return {
      offset: { ...kit.attackBox.offset },
      width: kit.attackBox.width,
      height: kit.attackBox.height
    }
  }
  return null
}

function worldRect(fighter, def) {
  const w = def.width
  const h = def.height
  // Match FighterCombat.applyFacingToAttackBox — flip about hurtbox center.
  const ox = fighter.flip ? fighter.hitWidth - def.offset.x - w : def.offset.x
  const oy = def.offset.y
  return {
    x: fighter.position.x + ox,
    y: fighter.position.y + oy,
    w,
    h
  }
}

export class TestHitboxOverlay {
  constructor(scene) {
    this.gfx = scene.add.graphics().setDepth(900)
  }

  redraw(player, enemy) {
    const g = this.gfx
    g.clear()
    this.drawHurtbox(player, 0x4ade80)
    this.drawHurtbox(enemy, 0x60a5fa)
    this.drawAttackAreas(player)
  }

  drawHurtbox(fighter, color) {
    if (!fighter || fighter.dead) return
    const g = this.gfx
    g.lineStyle(2, color, 0.85)
    g.strokeRect(fighter.position.x, fighter.position.y, fighter.hitWidth, fighter.hitHeight)
  }

  drawAttackAreas(fighter) {
    if (!fighter?.combat?.kit) return
    const kit = fighter.combat.kit
    const swinging = fighter.isSwinging()
    const current = fighter.combat.currentAttack
    const onHit =
      swinging && fighter.animator.frameIndex === fighter.combat.hitFrame

    const colors = { attack1: 0xef4444, attack2: 0xf97316, attack3: 0xeab308 }
    const names = ['attack1', 'attack2']
    if (kit.sprites?.attack3 || kit.attackBoxes?.attack3) names.push('attack3')

    for (const name of names) {
      const def = attackDefFromKit(kit, name)
      if (!def) continue
      const rect = worldRect(fighter, def)
      const isActive = swinging && current === name
      const color = colors[name] || 0xef4444

      if (isActive) {
        gFill(this.gfx, rect, color, onHit ? 0.5 : 0.28)
        this.gfx.lineStyle(2, color, 1)
      } else {
        this.gfx.lineStyle(2, color, 0.55)
      }
      this.gfx.strokeRect(rect.x, rect.y, rect.w, rect.h)
    }
  }

  destroy() {
    this.gfx.destroy()
  }
}

function gFill(gfx, rect, color, alpha) {
  gfx.fillStyle(color, alpha)
  gfx.fillRect(rect.x, rect.y, rect.w, rect.h)
}
