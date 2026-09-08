const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

// When both fighters are swinging, each only takes this fraction of the hit.
const splitDamageTaken = 0.2
const splitKnockback = 55
const splitStaminaCost = 15
let lastSplitPush = 0
let splitArmed = { player: false, enemy: false }

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

function createFighter(position) {
  const base = getCharacter('samurai')
  const sprites = {}
  for (const name in base.sprites) {
    sprites[name] = {
      imageSrc: base.sprites[name].imageSrc,
      framesMax: base.sprites[name].framesMax,
      hitFrame: base.sprites[name].hitFrame
    }
  }
  return new Fighter({
    position,
    velocity: { x: 0, y: 0 },
    imageSrc: base.sprites.idle.imageSrc,
    framesMax: base.sprites.idle.framesMax,
    scale: base.scale,
    offset: { ...base.offset },
    sprites,
    attackBox: {
      offset: { ...base.attackBox.offset },
      width: base.attackBox.width,
      height: base.attackBox.height
    }
  })
}

const playerSpawnX = 120
const enemySpawnX = 860

const player = createFighter({ x: playerSpawnX, y: 330 })
const enemy = createFighter({ x: enemySpawnX, y: 330 })

let p1Character = 'samurai'
let p2Character = 'kenji'
let fightStarted = false

function setFacing(fighter, faceRight) {
  const box = fighter.baseAttackBox
  const flip = faceRight !== (fighter.naturalFaces === 'right')
  fighter.faceRight = faceRight
  fighter.flip = flip
  fighter.attackBox.offset.x = flip ? -(box.offset.x + box.width) : box.offset.x
  fighter.attackBox.offset.y = box.offset.y + (fighter.attackLift || 0)
  fighter.attackBox.width = box.width
  fighter.attackBox.height = box.height
}

function faceOpponent(fighter, opponent) {
  const fighterCenter = fighter.position.x + fighter.width / 2
  const opponentCenter = opponent.position.x + opponent.width / 2
  const gap = fighterCenter - opponentCenter
  if (Math.abs(gap) < 10) return
  setFacing(fighter, gap < 0)
}

function applyCharacter(fighter, characterId, side) {
  fighter.loadCharacter(getCharacter(characterId), side === 'left')
}

function syncCharacterLabels() {
  document.querySelector('#p1Choice').innerHTML = 'P1: ' + getCharacter(p1Character).name
  document.querySelector('#p2Choice').innerHTML = 'P2: ' + getCharacter(p2Character).name
}

function syncStaminaBars() {
  document.querySelector('#playerStamina').style.width = player.stamina + '%'
  document.querySelector('#enemyStamina').style.width = enemy.stamina + '%'
}

function setPaused(paused) {
  gamePaused = paused
  const menu = document.querySelector('#pauseMenu')
  menu.style.display = paused ? 'flex' : 'none'
  document.querySelector('#startFight').innerHTML = fightStarted ? 'Resume' : 'Start'

  if (paused) {
    pauseTimer()
    return
  }

  if (fightStarted) resumeTimer()
}

applyCharacter(player, p1Character, 'left')
applyCharacter(enemy, p2Character, 'right')
syncCharacterLabels()
syncStaminaBars()

document.querySelector('#switchCharacters').addEventListener('click', () => {
  const nextP1 = p2Character
  p2Character = p1Character
  p1Character = nextP1
  applyCharacter(player, p1Character, 'left')
  applyCharacter(enemy, p2Character, 'right')
  syncCharacterLabels()
})

function restartMatch() {
  pauseTimer()
  matchOver = false
  keys.a.pressed = false
  keys.d.pressed = false
  keys.ArrowLeft.pressed = false
  keys.ArrowRight.pressed = false

  player.position.x = playerSpawnX
  enemy.position.x = enemySpawnX
  player.position.y = 330
  enemy.position.y = 330
  player.velocity.x = 0
  player.velocity.y = 0
  enemy.velocity.x = 0
  enemy.velocity.y = 0
  player.health = 100
  enemy.health = 100
  player.stamina = 100
  enemy.stamina = 100
  player.dead = false
  enemy.dead = false
  player.isAttacking = false
  enemy.isAttacking = false

  applyCharacter(player, p1Character, 'left')
  applyCharacter(enemy, p2Character, 'right')

  gsap.set('#playerHealth', { width: '100%' })
  gsap.set('#enemyHealth', { width: '100%' })
  syncStaminaBars()

  timer = 60
  document.querySelector('#timer').innerHTML = timer
  document.querySelector('#displayText').style.display = 'none'
  gamePaused = false
  decreaseTimer()
}

document.querySelector('#restartMatch').addEventListener('click', restartMatch)

document.querySelector('#startFight').addEventListener('click', () => {
  if (!fightStarted) {
    fightStarted = true
    gamePaused = false
    document.querySelector('#pauseMenu').style.display = 'none'
    document.querySelector('#startFight').innerHTML = 'Resume'
    decreaseTimer()
    return
  }

  setPaused(false)
})

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

let lastTimestamp = 0

function animate(time) {
  window.requestAnimationFrame(animate)
  const now = time || performance.now()
  const dt = lastTimestamp ? Math.min((now - lastTimestamp) / 1000, 0.05) : 0
  lastTimestamp = now

  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  if (!matchOver) {
    faceOpponent(player, enemy)
    faceOpponent(enemy, player)
  }

  if (gamePaused) {
    player.draw()
    enemy.draw()
    return
  }

  player.regenStamina(dt)
  enemy.regenStamina(dt)
  syncStaminaBars()

  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -player.kit.moveSpeed
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = player.kit.moveSpeed
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -enemy.kit.moveSpeed
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = enemy.kit.moveSpeed
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // Resolve both swings before applying hits so a clash doesn't cancel one attack.
  const playerLanded =
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === player.hitFrame

  const enemyLanded =
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === enemy.hitFrame

  const splitClash = player.isSwinging() && enemy.isSwinging()
  let playerSplits = false
  let enemySplits = false

  if (splitClash && (playerLanded || enemyLanded)) {
    if (now - lastSplitPush > 280) {
      lastSplitPush = now
      splitArmed.player = player.stamina >= splitStaminaCost
      splitArmed.enemy = enemy.stamina >= splitStaminaCost
      player.knockBack(splitKnockback)
      enemy.knockBack(splitKnockback)
      if (splitArmed.player) player.drainStamina(splitStaminaCost)
      if (splitArmed.enemy) enemy.drainStamina(splitStaminaCost)
      syncStaminaBars()
    }
    playerSplits = splitArmed.player
    enemySplits = splitArmed.enemy
  }

  if (playerLanded) {
    const damage = enemySplits ? player.hitDamage() * splitDamageTaken : player.hitDamage()
    enemy.takeHit(Math.max(1, Math.round(damage)))
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === player.hitFrame) {
    player.isAttacking = false
  }

  if (enemyLanded) {
    const damage = playerSplits ? enemy.hitDamage() * splitDamageTaken : enemy.hitDamage()
    player.takeHit(Math.max(1, Math.round(damage)))
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === enemy.hitFrame) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight'
  ) {
    event.preventDefault()
  }

  if (event.key === 'Escape') {
    if (fightStarted && timer > 0 && player.health > 0 && enemy.health > 0) {
      setPaused(!gamePaused)
    }
    return
  }

  if (gamePaused || matchOver || event.repeat) return

  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.jump()
        syncStaminaBars()
        break
      case ' ':
        player.attack({
          movingForward: player.faceRight ? keys.d.pressed : keys.a.pressed,
          opponent: enemy
        })
        syncStaminaBars()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.jump()
        syncStaminaBars()
        break
      case 'ArrowDown':
        enemy.attack({
          movingForward: enemy.faceRight
            ? keys.ArrowRight.pressed
            : keys.ArrowLeft.pressed,
          opponent: player
        })
        syncStaminaBars()
        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})
