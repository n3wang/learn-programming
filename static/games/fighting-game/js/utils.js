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

function determineWinner({ player, enemy, timerId }) {
  if (matchOver) return
  matchOver = true
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
