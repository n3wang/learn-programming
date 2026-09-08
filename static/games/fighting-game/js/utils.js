const stagePadding = 8

function clampToStage(fighter) {
  const minX = stagePadding
  const maxX = canvas.width - fighter.width - stagePadding
  if (fighter.position.x < minX) {
    fighter.position.x = minX
    if (fighter.velocity.x < 0) fighter.velocity.x = 0
  } else if (fighter.position.x > maxX) {
    fighter.position.x = maxX
    if (fighter.velocity.x > 0) fighter.velocity.x = 0
  }
}

const clashOverlap = 3 / 5
const clashWindow = 120

function clashOpen(fighter, now) {
  return fighter.isSwinging() || now < (fighter.clashUntil || 0)
}

function hitZone(fighter, which) {
  const box = fighter.attackBox
  const damageWidth = box.width * clashOverlap
  const safeWidth = box.width - damageWidth
  const safe = which === 'safe'
  const x = fighter.faceRight
    ? box.position.x + (safe ? damageWidth : 0)
    : box.position.x + (safe ? 0 : safeWidth)
  return {
    position: { x, y: box.position.y },
    width: safe ? safeWidth : damageWidth,
    height: box.height
  }
}

function boxesOverlap(a, b) {
  return (
    a.position.x + a.width >= b.position.x &&
    a.position.x <= b.position.x + b.width &&
    a.position.y + a.height >= b.position.y &&
    a.position.y <= b.position.y + b.height
  )
}

function zoneHitsBody(fighter, which, body) {
  return boxesOverlap(hitZone(fighter, which), body)
}

function facingEachOther(a, b) {
  const aCenter = a.position.x + a.width / 2
  const bCenter = b.position.x + b.width / 2
  const aTowardB = a.faceRight ? bCenter >= aCenter : bCenter <= aCenter
  const bTowardA = b.faceRight ? aCenter >= bCenter : aCenter <= bCenter
  return aTowardB && bTowardA
}

function attackRangesClash(a, b) {
  if (!facingEachOther(a, b)) return false
  return boxesOverlap(hitZone(a, 'damage'), hitZone(b, 'damage'))
}

function hittingFromBehind(attacker, defender) {
  const attackerCenter = attacker.position.x + attacker.width / 2
  const defenderCenter = defender.position.x + defender.width / 2
  const defenderFacingAttacker = defender.faceRight
    ? attackerCenter >= defenderCenter
    : attackerCenter <= defenderCenter
  return !defenderFacingAttacker
}

function tipOnlyHit(attacker, defender) {
  if (!boxesOverlap(attacker.attackBox, defender)) return false
  return !zoneHitsBody(attacker, 'damage', defender) && zoneHitsBody(attacker, 'safe', defender)
}

function safeClash(a, b, now) {
  if (!a.isSwinging() || !b.isSwinging() || !facingEachOther(a, b)) return false
  if (hittingFromBehind(a, b) || hittingFromBehind(b, a)) return false
  if (attackRangesClash(a, b)) return false
  return (
    boxesOverlap(hitZone(a, 'safe'), hitZone(b, 'safe')) ||
    boxesOverlap(hitZone(a, 'safe'), b.attackBox) ||
    boxesOverlap(hitZone(b, 'safe'), a.attackBox)
  )
}

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

let timer = 60
let timerId
let gamePaused = true
let matchOver = false
let matchEndingAt = 0
const healthBarMs = 800

function finishMatchLater(now) {
  if (matchOver || matchEndingAt) return
  pauseTimer()
  matchEndingAt = now + healthBarMs
}

function determineWinner({ player, enemy, timerId }) {
  if (matchOver) return
  matchOver = true
  matchEndingAt = 0
  player.queuedAttack = null
  enemy.queuedAttack = null
  if (player.health < enemy.health || player.health <= 0) player.fallDown()
  if (enemy.health < player.health || enemy.health <= 0) enemy.fallDown()
  clearTimeout(timerId)
  document.querySelector('#displayText').style.display = 'flex'
  const result = document.querySelector('#resultText')
  if (player.health === enemy.health) {
    result.innerHTML = 'Tie'
  } else if (player.health > enemy.health) {
    result.innerHTML = 'Player 1 Wins'
  } else if (player.health < enemy.health) {
    result.innerHTML = 'Player 2 Wins'
  }
}

function decreaseTimer() {
  if (gamePaused) return

  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000)
    timer--
    document.querySelector('#timer').innerHTML = timer
  }

  if (timer === 0) {
    determineWinner({ player, enemy, timerId })
  }
}

function pauseTimer() {
  clearTimeout(timerId)
}

function resumeTimer() {
  if (gamePaused || timer <= 0) return
  clearTimeout(timerId)
  timerId = setTimeout(decreaseTimer, 1000)
}
