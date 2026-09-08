const POOL_SIZE = 6

// A small pool of ghost sprites that copy the fighter's current texture
// frame/flip/position and fade out via a Phaser tween — replaces the
// original's manual per-frame opacity-decrement array.
export class AfterimageTrail {
  constructor(scene, fighter) {
    this.scene = scene
    this.fighter = fighter
    this.pool = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const ghost = scene.add.sprite(0, 0, fighter.texture.key, fighter.frame.name)
      ghost.setVisible(false)
      ghost.setActive(false)
      ghost.setDepth(fighter.depth)
      this.pool.push(ghost)
    }
    this.cursor = 0
  }

  leave(opacity, force = false) {
    const fighter = this.fighter
    if (!force && !fighter.combat.kit.skills.afterimage) return

    const ghost = this.pool[this.cursor]
    this.cursor = (this.cursor + 1) % this.pool.length

    this.scene.tweens.killTweensOf(ghost)
    ghost.setTexture(fighter.texture.key, fighter.frame.name)
    ghost.setPosition(fighter.x, fighter.y)
    ghost.setOrigin(fighter.originX, fighter.originY)
    ghost.setScale(fighter.scaleX, fighter.scaleY)
    ghost.setFlipX(fighter.flipX)
    ghost.setDepth(fighter.depth - 0.001)
    ghost.setAlpha(opacity)
    ghost.setVisible(true)
    ghost.setActive(true)

    // Original faded by afterimageFade per frame at 60fps (opacity -= fade
    // each tick); convert that same total frame count to a tween duration.
    const fadeFrames = opacity / fighter.combat.kit.afterimageFade
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: fadeFrames * (1000 / 60),
      onComplete: () => {
        ghost.setVisible(false)
        ghost.setActive(false)
      }
    })
  }

  destroy() {
    this.pool.forEach((ghost) => ghost.destroy())
    this.pool.length = 0
  }
}
