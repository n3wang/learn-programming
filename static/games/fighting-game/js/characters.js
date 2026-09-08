// Add a fighter by extending BaseCharacter and registering it in ROSTER.
// Fields you omit are inherited from BaseCharacter.

class BaseCharacter {
  constructor() {
    this.name = 'Fighter'
    this.faces = 'right'
    this.scale = 2.5
    this.offset = { x: 215, y: 157 }
    this.maxHealth = 100
    this.maxStamina = 100
    this.moveSpeed = 5
    this.jumpVelocity = -20
    this.jumpCost = 10
    this.attackCost = 50
    this.comboWindow = 450
    this.mirrorWindow = 250
    this.mirrorReach = 1.5
    this.attackDamage = {
      attack1: 20,
      attack2: 35
    }
    this.skills = {
      airCombo: true,
      dashCombo: true,
      afterimage: true,
      mirror: true
    }
    this.airStep = 110
    this.dashStep = 220
    this.airAttackLift = -110
    this.afterimageOpacity = 0.42
    this.afterimageFade = 0.012
    this.attackBox = {
      offset: { x: 100, y: 50 },
      width: 160,
      height: 50
    }
    this.sprites = null
  }

  apply(overrides = {}) {
    if (overrides.offset) this.offset = { ...this.offset, ...overrides.offset }
    if (overrides.attackDamage) {
      this.attackDamage = { ...this.attackDamage, ...overrides.attackDamage }
    }
    if (overrides.skills) this.skills = { ...this.skills, ...overrides.skills }
    if (overrides.attackBox) {
      this.attackBox = {
        ...this.attackBox,
        ...overrides.attackBox,
        offset: {
          ...this.attackBox.offset,
          ...(overrides.attackBox.offset || {})
        }
      }
    }

    const nested = new Set(['offset', 'attackDamage', 'skills', 'attackBox'])
    for (const key of Object.keys(overrides)) {
      if (!nested.has(key)) this[key] = overrides[key]
    }
    return this
  }
}

class Samurai extends BaseCharacter {
  constructor() {
    super()
    this.apply({
      name: 'Samurai',
      faces: 'right',
      moveSpeed: 4.5,
      jumpVelocity: -18,
      jumpCost: 12,
      attackDamage: { attack1: 22, attack2: 42 },
      airStep: 90,
      dashStep: 180,
      airAttackLift: -120,
      afterimageOpacity: 0.36,
      attackBox: {
        offset: { x: 100, y: 50 },
        width: 190,
        height: 55
      },
      sprites: {
        idle: { imageSrc: './img/samuraiMack/Idle.png', framesMax: 8 },
        run: { imageSrc: './img/samuraiMack/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/samuraiMack/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/samuraiMack/Fall.png', framesMax: 2 },
        attack1: { imageSrc: './img/samuraiMack/Attack1.png', framesMax: 6, hitFrame: 4 },
        attack2: { imageSrc: './img/samuraiMack/Attack2.png', framesMax: 6, hitFrame: 4 },
        takeHit: {
          imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
          framesMax: 4
        },
        death: { imageSrc: './img/samuraiMack/Death.png', framesMax: 6 }
      }
    })
  }
}

class Kenji extends BaseCharacter {
  constructor() {
    super()
    this.apply({
      name: 'Kenji',
      faces: 'left',
      offset: { y: 167 },
      moveSpeed: 6,
      jumpVelocity: -22,
      jumpCost: 8,
      attackCost: 40,
      attackDamage: { attack1: 16, attack2: 30 },
      airStep: 130,
      dashStep: 260,
      airAttackLift: -100,
      afterimageOpacity: 0.5,
      attackBox: {
        offset: { x: -170 },
        width: 150,
        height: 48
      },
      sprites: {
        idle: { imageSrc: './img/kenji/Idle.png', framesMax: 4 },
        run: { imageSrc: './img/kenji/Run.png', framesMax: 8 },
        jump: { imageSrc: './img/kenji/Jump.png', framesMax: 2 },
        fall: { imageSrc: './img/kenji/Fall.png', framesMax: 2 },
        attack1: { imageSrc: './img/kenji/Attack1.png', framesMax: 4, hitFrame: 2 },
        attack2: { imageSrc: './img/kenji/Attack2.png', framesMax: 4, hitFrame: 2 },
        takeHit: { imageSrc: './img/kenji/Take hit.png', framesMax: 3 },
        death: { imageSrc: './img/kenji/Death.png', framesMax: 7 }
      }
    })
  }
}

const ROSTER = {
  samurai: Samurai,
  kenji: Kenji
}

function rosterIds() {
  return Object.keys(ROSTER)
}

function randomCharacterId() {
  const ids = rosterIds()
  return ids[Math.floor(Math.random() * ids.length)]
}

function getCharacter(id) {
  const Type = ROSTER[id]
  if (!Type) throw new Error('Unknown character: ' + id)
  const character = new Type()
  character.id = id
  if (!character.sprites) throw new Error(id + ' is missing sprites')
  return character
}
