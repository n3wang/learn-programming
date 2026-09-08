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
let testMode = false
let lastHitText = 'Last hit: none'
const hitPopups = []

function setFacing(fighter, faceRight) {
  const box = fighter.baseAttackBox
  const flip = faceRight !== (fighter.naturalFaces === 'right')
  fighter.faceRight = faceRight
  fighter.flip = flip
  fighter.attackBox.offset.x = flip ? -(box.offset.x + box.width) : box.offset.x
  fighter.attackBox.offset.y = (fighter.height - box.height) / 2
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

let hoverStats = { p1: null, p2: null }

function specialAttackNames(character) {
  const names = []
  if (character.skills.airCombo) names.push('Air drop')
  if (character.skills.dashCombo) names.push('Dash')
  if (character.skills.mirror) names.push('Mirror')
  if (character.skills.afterimage) names.push('Afterimage')
  return names
}

function attackSpeedLabel(character) {
  const frames = character.sprites.attack1.framesMax * 5
  return Math.round((60 / frames) * 10) / 10
}

function statsMarkup(character) {
  const specials = specialAttackNames(character)
  return (
    'base damage: ' +
    character.attackDamage.attack1 +
    '<br>movement speed: ' +
    character.moveSpeed +
    '<br>attack speed: ' +
    attackSpeedLabel(character) +
    '<br>jump: ' +
    Math.abs(character.jumpVelocity) +
    '<br>special attacks: [' +
    specials.join(', ') +
    ']'
  )
}

function renderCharacterStats() {
  const p1Id = hoverStats.p1 || p1Character
  const p2Id = hoverStats.p2 || p2Character
  document.querySelector('#characterStatsP1').innerHTML = statsMarkup(getCharacter(p1Id))
  document.querySelector('#characterStatsP2').innerHTML = statsMarkup(getCharacter(p2Id))
}

function cropIdlePortrait(image, framesMax) {
  const frameWidth = image.width / framesMax
  const frameHeight = image.height
  const scan = document.createElement('canvas')
  scan.width = frameWidth
  scan.height = frameHeight
  const scanCtx = scan.getContext('2d')
  scanCtx.drawImage(image, 0, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)
  const pixels = scanCtx.getImageData(0, 0, frameWidth, frameHeight).data

  let minX = frameWidth
  let minY = frameHeight
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (pixels[(y * frameWidth + x) * 4 + 3] < 16) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX) {
    minX = 0
    minY = 0
    maxX = frameWidth - 1
    maxY = Math.floor(frameHeight * 0.45)
  }

  const spriteWidth = maxX - minX + 1
  const spriteHeight = maxY - minY + 1
  const headHeight = Math.max(24, Math.round(spriteHeight * 0.55))
  const portrait = document.createElement('canvas')
  portrait.width = 72
  portrait.height = 72
  const portraitCtx = portrait.getContext('2d')
  portraitCtx.imageSmoothingEnabled = false
  portraitCtx.drawImage(
    image,
    minX,
    minY,
    spriteWidth,
    headHeight,
    8,
    6,
    56,
    56
  )
  return portrait
}

function portraitCard(id, side) {
  const character = getCharacter(id)
  const selected = side === 'p1' ? p1Character === id : p2Character === id
  const color = side === 'p1' ? '#ef4444' : '#3b82f6'
  const card = document.createElement('button')
  card.type = 'button'
  card.style.display = 'flex'
  card.style.flexDirection = 'column'
  card.style.alignItems = 'center'
  card.style.gap = '6px'
  card.style.padding = '4px'
  card.className = 'portrait'
  card.style.background = 'transparent'
  card.style.borderColor = selected ? color : 'white'

  const face = document.createElement('canvas')
  face.width = 72
  face.height = 72
  face.style.background = 'transparent'
  card.appendChild(face)

  const mark = document.createElement('div')
  mark.style.width = '56px'
  mark.style.height = '8px'
  mark.style.background = selected ? color : 'transparent'
  card.appendChild(mark)

  const image = new Image()
  image.onload = () => {
    const portrait = cropIdlePortrait(image, character.sprites.idle.framesMax)
    face.getContext('2d').drawImage(portrait, 0, 0)
  }
  image.src = character.sprites.idle.imageSrc

  card.addEventListener('click', () => {
    if (side === 'p1') {
      p1Character = id
      applyCharacter(player, p1Character, 'left')
    } else {
      p2Character = id
      applyCharacter(enemy, p2Character, 'right')
    }
    hoverStats[side] = null
    renderRoster()
  })
  card.addEventListener('mouseenter', () => {
    hoverStats[side] = id
    renderCharacterStats()
  })
  card.addEventListener('mouseleave', () => {
    hoverStats[side] = null
    renderCharacterStats()
  })
  return card
}

function renderRoster() {
  const pickerRow = document.querySelector('#pickerRow')
  const rosterP1 = document.querySelector('#rosterP1')
  const rosterP2 = document.querySelector('#rosterP2')
  pickerRow.innerHTML = ''
  rosterP1.innerHTML = ''
  rosterP2.innerHTML = ''

  pickerRow.innerHTML =
    'P1: ' + getCharacter(p1Character).name + '<br>P2: ' + getCharacter(p2Character).name

  rosterIds().forEach((id) => {
    rosterP1.appendChild(portraitCard(id, 'p1'))
    rosterP2.appendChild(portraitCard(id, 'p2'))
  })

  renderCharacterStats()
}

function drawColorMarker(fighter, color) {
  c.fillStyle = color
  c.fillRect(fighter.position.x - 6, fighter.position.y + fighter.height + 4, fighter.width + 12, 8)
}

function drawPlayerMarkers() {
  drawColorMarker(player, '#ef4444')
  drawColorMarker(enemy, '#3b82f6')
}

function syncStaminaBars() {
  document.querySelector('#playerStamina').style.width = player.stamina + '%'
  document.querySelector('#enemyStamina').style.width = enemy.stamina + '%'
}

function drawBox(box, color) {
  c.save()
  c.strokeStyle = color
  c.lineWidth = 2
  c.strokeRect(box.position.x, box.position.y, box.width, box.height)
  c.restore()
}

function attackPreviewBox(fighter) {
  const box = fighter.baseAttackBox
  const flip = fighter.flip
  const offsetX = flip ? -(box.offset.x + box.width) : box.offset.x
  return {
    position: {
      x: fighter.position.x + offsetX,
      y: fighter.position.y + (fighter.height - box.height) / 2
    },
    width: box.width,
    height: box.height
  }
}

function farEdgeX(box) {
  return box.position.x + box.width
}

function syncTestReadout() {
  const readout = document.querySelector('#testReadout')
  if (!testMode) {
    readout.style.display = 'none'
    return
  }
  const damage = player.kit.attackDamage
  const reach = player.baseAttackBox.width
  readout.style.display = 'block'
  readout.innerHTML =
    'Test dummy<br>Attack 1: ' +
    damage.attack1 +
    ' &nbsp; Attack 2: ' +
    damage.attack2 +
    '<br>Reach: ' +
    reach +
    'px<br>' +
    lastHitText
}

function spawnHitPopup(target, text) {
  hitPopups.push({
    x: target.position.x + target.width / 2,
    y: target.position.y + 20,
    text,
    life: 50
  })
}

function drawHitPopups() {
  for (let i = hitPopups.length - 1; i >= 0; i--) {
    const popup = hitPopups[i]
    popup.y -= 0.6
    popup.life -= 1
    c.save()
    c.globalAlpha = Math.max(0, popup.life / 50)
    c.fillStyle = '#fde68a'
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText(popup.text, popup.x, popup.y)
    c.restore()
    if (popup.life <= 0) hitPopups.splice(i, 1)
  }
}

function drawTestScene() {
  const dummyBox = {
    position: { x: enemy.position.x, y: enemy.position.y },
    width: enemy.width,
    height: enemy.height
  }
  drawBox(dummyBox, 'rgba(255,255,255,0.85)')

  const preview = player.isSwinging() ? player.attackBox : attackPreviewBox(player)
  drawBox(preview, player.isSwinging() ? '#facc15' : 'rgba(250, 204, 21, 0.45)')

  const edge = player.faceRight ? farEdgeX(preview) : preview.position.x
  c.save()
  c.strokeStyle = '#facc15'
  c.beginPath()
  c.moveTo(edge, preview.position.y - 8)
  c.lineTo(edge, preview.position.y + preview.height + 8)
  c.stroke()
  c.fillStyle = '#facc15'
  c.font = '8px "Press Start 2P"'
  c.textAlign = 'center'
  c.fillText('edge', edge, preview.position.y - 12)
  c.restore()
  drawHitPopups()
}

function syncMenuChrome() {
  const choosing = !fightStarted
  ;[
    '#rosterP1',
    '#rosterP2',
    '#chooseTitle',
    '#pickerRow',
    '#randomCharacters',
    '#characterStatsP1',
    '#characterStatsP2'
  ].forEach((selector) => {
    document.querySelector(selector).style.display = choosing ? '' : 'none'
  })
  document.querySelector('#rosterP1').style.display = choosing ? 'flex' : 'none'
  document.querySelector('#rosterP2').style.display = choosing ? 'flex' : 'none'
  document.querySelector('#pickerRow').style.display = choosing ? 'flex' : 'none'
  document.querySelector('#startFight').innerHTML = choosing ? 'Start' : 'Resume'
  document.querySelector('#restartFight').style.display = choosing ? 'none' : 'block'
}

function setPaused(paused) {
  gamePaused = paused
  const menu = document.querySelector('#pauseMenu')
  menu.style.display = paused ? 'flex' : 'none'
  syncMenuChrome()

  if (paused) {
    pauseTimer()
    return
  }

  if (fightStarted) resumeTimer()
}

applyCharacter(player, p1Character, 'left')
applyCharacter(enemy, p2Character, 'right')
renderRoster()
syncMenuChrome()
syncStaminaBars()

document.querySelector('#randomCharacters').addEventListener('click', () => {
  p1Character = randomCharacterId()
  p2Character = randomCharacterId()
  applyCharacter(player, p1Character, 'left')
  applyCharacter(enemy, p2Character, 'right')
  hoverStats = { p1: null, p2: null }
  renderRoster()
})

function resetFighters(spawn) {
  pauseTimer()
  keys.a.pressed = false
  keys.d.pressed = false
  keys.ArrowLeft.pressed = false
  keys.ArrowRight.pressed = false

  applyCharacter(player, p1Character, 'left')
  applyCharacter(enemy, p2Character, 'right')

  player.position.x = spawn.playerX
  enemy.position.x = spawn.enemyX
  player.position.y = 330
  enemy.position.y = 330
  player.velocity.x = 0
  player.velocity.y = 0
  enemy.velocity.x = 0
  enemy.velocity.y = 0
  player.health = player.maxHealth
  enemy.health = enemy.maxHealth
  player.stamina = player.maxStamina
  enemy.stamina = enemy.maxStamina
  player.dead = false
  enemy.dead = false
  player.isAttacking = false
  enemy.isAttacking = false

  gsap.set('#playerHealth', { width: '100%' })
  gsap.set('#enemyHealth', { width: '100%' })
  syncStaminaBars()

  timer = 60
  document.querySelector('#timer').innerHTML = timer
}

function returnToSelect() {
  testMode = false
  matchOver = false
  fightStarted = false
  gamePaused = true
  hoverStats = { p1: null, p2: null }
  lastHitText = 'Last hit: none'
  hitPopups.length = 0
  resetFighters({ playerX: playerSpawnX, enemyX: enemySpawnX })
  document.querySelector('#displayText').style.display = 'none'
  document.querySelector('#pauseMenu').style.display = 'flex'
  syncTestReadout()
  syncMenuChrome()
  renderRoster()
}

document.querySelector('#restartMatch').addEventListener('click', returnToSelect)
document.querySelector('#restartFight').addEventListener('click', returnToSelect)

function startTestRange() {
  testMode = true
  fightStarted = true
  matchOver = false
  gamePaused = false
  lastHitText = 'Last hit: none'
  hitPopups.length = 0
  document.querySelector('#pauseMenu').style.display = 'none'
  document.querySelector('#displayText').style.display = 'none'
  pauseTimer()

  player.position.x = 180
  enemy.position.x = 520
  player.position.y = 330
  enemy.position.y = 330
  player.velocity.x = 0
  player.velocity.y = 0
  enemy.velocity.x = 0
  enemy.velocity.y = 0
  player.health = player.kit.maxHealth
  enemy.health = enemy.kit.maxHealth
  player.stamina = player.maxStamina
  enemy.stamina = enemy.maxStamina
  player.dead = false
  enemy.dead = false
  player.isAttacking = false
  enemy.isAttacking = false
  applyCharacter(player, p1Character, 'left')
  applyCharacter(enemy, p2Character, 'right')
  enemy.position.x = 520
  setFacing(enemy, false)
  gsap.set('#playerHealth', { width: '100%' })
  gsap.set('#enemyHealth', { width: '100%' })
  syncStaminaBars()
  syncTestReadout()
}

document.querySelector('#testRange').addEventListener('click', startTestRange)

document.querySelector('#startFight').addEventListener('click', () => {
  testMode = false
  syncTestReadout()
  if (!fightStarted) {
    fightStarted = true
    resetFighters({ playerX: playerSpawnX, enemyX: enemySpawnX })
    gamePaused = false
    document.querySelector('#pauseMenu').style.display = 'none'
    syncMenuChrome()
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
    drawPlayerMarkers()
    return
  }

  player.regenStamina(dt)
  enemy.regenStamina(dt)
  syncStaminaBars()

  player.update()
  enemy.update()
  drawPlayerMarkers()

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
  if (testMode) {
    enemy.velocity.x = 0
    enemy.switchSprite('idle')
  } else if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
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
    const raw = player.hitDamage()
    const damage = !testMode && enemySplits ? raw * splitDamageTaken : raw
    const dealt = Math.max(1, Math.round(damage))
    enemy.takeHit(dealt)
    if (testMode) {
      enemy.health = enemy.kit.maxHealth
      enemy.dead = false
      if (enemy.image === enemy.sprites.death.image) {
        enemy.image = enemy.sprites.idle.image
        enemy.framesMax = enemy.sprites.idle.framesMax
        enemy.framesCurrent = 0
      }
      const attackName = player.currentAttack === 'attack2' ? 'Attack 2' : 'Attack 1'
      lastHitText = 'Last hit: ' + attackName + ' for ' + dealt
      spawnHitPopup(enemy, '-' + dealt)
      syncTestReadout()
    }
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

  if (testMode) drawTestScene()

  // end game based on health
  if (!testMode && (enemy.health <= 0 || player.health <= 0)) {
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

  if (testMode && event.key.startsWith('Arrow')) return

  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        if (player.noteBackForward(1) && player.mirror(enemy)) syncStaminaBars()
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        if (player.noteBackForward(-1) && player.mirror(enemy)) syncStaminaBars()
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
        if (enemy.noteBackForward(1) && enemy.mirror(player)) syncStaminaBars()
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        if (enemy.noteBackForward(-1) && enemy.mirror(player)) syncStaminaBars()
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
