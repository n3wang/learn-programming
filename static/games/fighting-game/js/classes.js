class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 }
  }) {
    this.position = position
    this.width = 50
    this.height = 150
    this.image = new Image()
    this.image.src = imageSrc
    this.scale = scale
    this.framesMax = framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 5
    this.offset = offset
  }

  draw() {
    const frameWidth = this.image.width / this.framesMax
    const drawWidth = frameWidth * this.scale
    const drawHeight = this.image.height * this.scale
    const drawX = this.position.x - this.offset.x
    const drawY = this.position.y - this.offset.y

    if (!this.flip) {
      c.drawImage(
        this.image,
        this.framesCurrent * frameWidth,
        0,
        frameWidth,
        this.image.height,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      )
      return
    }

    const anchor = this.position.x + this.width / 2
    c.save()
    c.translate(anchor, 0)
    c.scale(-1, 1)
    c.translate(-anchor, 0)
    c.drawImage(
      this.image,
      this.framesCurrent * frameWidth,
      0,
      frameWidth,
      this.image.height,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    )
    c.restore()
  }

  animateFrames() {
    this.framesElapsed++

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++
      } else {
        this.framesCurrent = 0
      }
    }
  }

  update() {
    this.draw()
    this.animateFrames()
  }
}

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined }
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    })

    this.velocity = velocity
    this.width = 50
    this.height = 150
    this.lastKey
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    }
    this.color = color
    this.isAttacking = false
    this.health = 100
    this.maxStamina = 100
    this.stamina = 100
    this.hitFrame = 4
    this.flip = false
    this.currentAttack = null
    this.lastFinishedAttack = null
    this.attackFinishedAt = 0
    this.faceRight = true
    this.attackLift = 0
    this.comboKind = null
    this.queuedAttack = null
    this.kit = getCharacter('samurai')
    this.skills = { ...this.kit.skills }
    this.afterimages = []
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 5
    this.sprites = sprites
    this.dead = false

    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image()
      sprites[sprite].image.src = sprites[sprite].imageSrc
    }
  }

  drawAfterimages() {
    for (const ghost of this.afterimages) {
      const frameWidth = ghost.image.width / ghost.framesMax
      const drawWidth = frameWidth * ghost.scale
      const drawHeight = ghost.image.height * ghost.scale
      const drawX = ghost.position.x - ghost.offset.x
      const drawY = ghost.position.y - ghost.offset.y

      c.save()
      c.globalAlpha = ghost.opacity
      if (ghost.flip) {
        const anchor = ghost.position.x + ghost.width / 2
        c.translate(anchor, 0)
        c.scale(-1, 1)
        c.translate(-anchor, 0)
      }
      c.drawImage(
        ghost.image,
        ghost.framesCurrent * frameWidth,
        0,
        frameWidth,
        ghost.image.height,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      )
      c.restore()
    }
  }

  draw() {
    this.drawAfterimages()
    super.draw()
  }

  update() {
    this.draw()
    if (!this.dead) this.animateFrames()
    this.releaseQueuedAttack()
    const fade = (this.kit && this.kit.afterimageFade) || 0.012
    this.afterimages = this.afterimages.filter((ghost) => {
      ghost.opacity -= fade
      return ghost.opacity > 0.04
    })

    // attack boxes
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y

    // draw the attack box
    // c.fillRect(
    //   this.attackBox.position.x,
    //   this.attackBox.position.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // )

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // gravity function
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
      this.velocity.y = 0
      this.position.y = 330
    } else this.velocity.y += gravity
  }

  onGround() {
    return this.position.y >= 330 && this.velocity.y === 0
  }

  regenStamina(dt) {
    if (this.dead || this.stamina >= this.maxStamina) return
    this.stamina = Math.min(this.maxStamina, this.stamina + (this.maxStamina / 2) * dt)
  }

  spendStamina(amount) {
    if (this.stamina < amount) return false
    this.stamina -= amount
    return true
  }

  drainStamina(amount) {
    this.stamina = Math.max(0, this.stamina - amount)
  }

  jump() {
    if (this.dead || !this.onGround()) return false
    if (!this.spendStamina(this.kit.jumpCost)) return false
    this.velocity.y = this.kit.jumpVelocity
    return true
  }

  hitDamage() {
    const key = this.currentAttack === 'attack2' ? 'attack2' : 'attack1'
    return this.kit.attackDamage[key]
  }

  loadCharacter(character, faceRight) {
    this.kit = character
    this.characterId = character.id
    this.naturalFaces = character.faces
    this.scale = character.scale
    this.offset = { ...character.offset }
    this.maxHealth = character.maxHealth
    this.maxStamina = character.maxStamina
    this.skills = { ...character.skills }
    this.baseAttackBox = {
      offset: { ...character.attackBox.offset },
      width: character.attackBox.width,
      height: character.attackBox.height
    }
    this.sprites = {}
    for (const name in character.sprites) {
      this.sprites[name] = {
        imageSrc: character.sprites[name].imageSrc,
        framesMax: character.sprites[name].framesMax,
        hitFrame: character.sprites[name].hitFrame,
        image: new Image()
      }
      this.sprites[name].image.src = character.sprites[name].imageSrc
    }
    this.hitFrame = character.sprites.attack1.hitFrame
    this.attackLift = 0
    this.comboKind = null
    this.queuedAttack = null
    this.attackHoldDone = false
    this.currentAttack = null
    this.lastFinishedAttack = null
    this.attackFinishedAt = 0
    this.isAttacking = false
    this.afterimages = []
    this.image = this.sprites.idle.image
    this.framesMax = this.sprites.idle.framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    setFacing(this, faceRight)
  }

  animateFrames() {
    this.framesElapsed++

    if (this.framesElapsed % this.framesHold !== 0) return

    const attacking =
      this.currentAttack &&
      this.sprites[this.currentAttack] &&
      this.image === this.sprites[this.currentAttack].image

    if (this.framesCurrent < this.framesMax - 1) {
      this.framesCurrent++
      return
    }

    if (attacking) {
      this.attackHoldDone = true
      return
    }

    if (this.image === this.sprites.death.image) {
      this.dead = true
      return
    }

    this.framesCurrent = 0
  }

  isPlaying(name) {
    const sprite = this.sprites[name]
    if (!sprite || !sprite.image) return false
    return this.image === sprite.image && !this.attackHoldDone
  }

  isSwinging() {
    return this.isPlaying('attack1') || this.isPlaying('attack2')
  }

  beginAttack(name) {
    this.attackHoldDone = false
    this.chainInto = name
    this.switchSprite(name)
    this.chainInto = null
    this.isAttacking = true
    this.currentAttack = name
    this.hitFrame = this.sprites[name].hitFrame
    this.lastFinishedAttack = null
  }

  queueFollowUp(kind, opponent) {
    if (this.queuedAttack) return false
    if (!this.spendStamina(this.kit.attackCost)) return false
    this.queuedAttack = { kind, opponent }
    return true
  }

  releaseQueuedAttack() {
    if (this.dead || !this.queuedAttack || !this.attackHoldDone) return
    if (this.currentAttack !== 'attack1') return

    const queued = this.queuedAttack
    this.queuedAttack = null
    this.comboKind = null
    this.attackLift = 0

    if (queued.kind === 'air') {
      this.teleportForward(this.kit.airStep, queued.opponent)
    } else if (queued.kind === 'dash') {
      this.teleportForward(this.kit.dashStep, queued.opponent)
    }

    this.beginAttack('attack2')
  }

  forwardDir() {
    return this.faceRight ? 1 : -1
  }

  knockBack(distance) {
    this.position.x -= this.forwardDir() * distance
    this.position.x = Math.max(40, Math.min(canvas.width - 90, this.position.x))
    this.velocity.x = 0
  }

  leaveAfterimage() {
    if (!this.kit.skills.afterimage || !this.image) return
    this.afterimages.push({
      image: this.image,
      framesCurrent: this.framesCurrent,
      framesMax: this.framesMax,
      position: { x: this.position.x, y: this.position.y },
      offset: { x: this.offset.x, y: this.offset.y },
      flip: this.flip,
      scale: this.scale,
      width: this.width,
      opacity: this.kit.afterimageOpacity
    })
  }

  teleportForward(distance, opponent) {
    this.leaveAfterimage()
    this.position.x += this.forwardDir() * distance
    this.position.x = Math.max(40, Math.min(canvas.width - 90, this.position.x))
    this.position.y = 330
    this.velocity.x = 0
    this.velocity.y = 0

    if (!opponent) return
    const myCenter = this.position.x + this.width / 2
    const theirCenter = opponent.position.x + opponent.width / 2
    if (Math.abs(myCenter - theirCenter) < 10) return
    setFacing(this, myCenter < theirCenter)
  }

  attack({ movingForward = false, opponent = null } = {}) {
    if (this.dead) return false
    if (this.isPlaying('attack2') || this.queuedAttack) return false

    const inAir = !this.onGround()
    const followUp =
      this.isPlaying('attack1') ||
      (this.lastFinishedAttack === 'attack1' &&
        performance.now() - this.attackFinishedAt < this.kit.comboWindow)

    // Second press is stored and plays only after the first swing finishes.
    if (this.isPlaying('attack1')) {
      if (this.comboKind === 'air') return this.queueFollowUp('air', opponent)
      if (this.comboKind === 'dash' || (this.kit.skills.dashCombo && movingForward)) {
        return this.queueFollowUp('dash', opponent)
      }
      return this.queueFollowUp('combo', opponent)
    }

    if (!this.spendStamina(this.kit.attackCost)) return false

    // Air skill: first swing hits upward. The queued follow-up drops and steps forward.
    if (this.kit.skills.airCombo && inAir && !followUp) {
      this.comboKind = 'air'
      this.attackLift = this.kit.airAttackLift
      if (this.baseAttackBox) {
        this.attackBox.offset.y = this.baseAttackBox.offset.y + this.attackLift
      }
      this.velocity.y = Math.min(this.velocity.y, -6)
      this.beginAttack('attack1')
      return true
    }

    // Dash skill: while running forward, the queued follow-up blinks farther ahead.
    if (this.kit.skills.dashCombo && !inAir && movingForward && !followUp) {
      this.comboKind = 'dash'
      this.attackLift = 0
      this.beginAttack('attack1')
      return true
    }

    this.comboKind = null
    this.attackLift = 0
    this.beginAttack(followUp ? 'attack2' : 'attack1')
    return true
  }

  fallDown() {
    if (!this.sprites || !this.sprites.death) return
    if (this.image === this.sprites.death.image) return

    this.queuedAttack = null
    this.currentAttack = null
    this.isAttacking = false
    this.attackHoldDone = true
    this.comboKind = null
    this.velocity.x = 0
    this.velocity.y = 0
    this.position.y = 330
    this.image = this.sprites.death.image
    this.framesMax = this.sprites.death.framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
  }

  takeHit(damage = 20) {
    this.health -= damage

    if (this.health <= 0) {
      this.fallDown()
    } else if (!this.isPlaying('attack1') && !this.isPlaying('attack2')) {
      this.switchSprite('takeHit')
    }
  }

  switchSprite(sprite) {
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1)
        this.dead = true
      return
    }

    // overriding all other animations with the attack animation
    if (
      (this.isPlaying('attack1') || this.isPlaying('attack2')) &&
      sprite !== this.chainInto
    )
      return

    // hitstun blocks movement, but not a new attack — both can swing at once
    if (
      sprite !== 'attack1' &&
      sprite !== 'attack2' &&
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    )
      return

    if (
      this.currentAttack &&
      sprite !== 'attack1' &&
      sprite !== 'attack2' &&
      this.sprites[this.currentAttack] &&
      this.image === this.sprites[this.currentAttack].image
    ) {
      this.lastFinishedAttack = this.currentAttack
      this.attackFinishedAt = performance.now()
      this.currentAttack = null
      this.attackLift = 0
    }

    switch (sprite) {
      case 'idle':
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image
          this.framesMax = this.sprites.idle.framesMax
          this.framesCurrent = 0
        }
        break
      case 'run':
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image
          this.framesMax = this.sprites.run.framesMax
          this.framesCurrent = 0
        }
        break
      case 'jump':
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image
          this.framesMax = this.sprites.jump.framesMax
          this.framesCurrent = 0
        }
        break

      case 'fall':
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image
          this.framesMax = this.sprites.fall.framesMax
          this.framesCurrent = 0
        }
        break

      case 'attack1':
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image
          this.framesMax = this.sprites.attack1.framesMax
          this.framesCurrent = 0
        }
        break

      case 'attack2':
        if (this.image !== this.sprites.attack2.image) {
          this.image = this.sprites.attack2.image
          this.framesMax = this.sprites.attack2.framesMax
          this.framesCurrent = 0
        }
        break

      case 'takeHit':
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image
          this.framesMax = this.sprites.takeHit.framesMax
          this.framesCurrent = 0
        }
        break

      case 'death':
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image
          this.framesMax = this.sprites.death.framesMax
          this.framesCurrent = 0
        }
        break
    }
  }
}
