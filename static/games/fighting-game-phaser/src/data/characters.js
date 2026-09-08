// Add a fighter by calling defineCharacter() with overrides and registering
// it in CHARACTERS below. Fields you omit are inherited from DEFAULT_CHARACTER.

const DEFAULT_CHARACTER = {
  name: 'Fighter',
  faces: 'right',
  scale: 2.5,
  offset: { x: 215, y: 157 },
  maxHealth: 100,
  maxStamina: 100,
  moveSpeed: 5,
  jumpVelocity: -20,
  jumpCost: 10,
  attackCost: 50,
  comboWindow: 450,
  mirrorWindow: 250,
  mirrorReach: 1.5,
  crossTrackScale: 1,
  attackDamage: {
    attack1: 20,
    attack2: 35
  },
  skills: {
    airCombo: true,
    dashCombo: true,
    afterimage: true,
    mirror: true
  },
  // distance = abs(jumpVelocity) * x + moveSpeed * k
  dashX: 1,
  dashK: 20,
  airX: 2.5,
  airK: 12.5,
  mirrorX: 0.5,
  mirrorK: 1,
  airAttackLift: -110,
  afterimageOpacity: 0.42,
  afterimageFade: 0.012,
  attackBox: {
    offset: { x: 100, y: 50 },
    width: 160,
    height: 50
  },
  sprites: null
}

function deepMerge(base, overrides) {
  const out = { ...base }
  for (const key of Object.keys(overrides)) {
    const value = overrides[key]
    if (value && typeof value === 'object' && !Array.isArray(value) && base[key]) {
      out[key] = deepMerge(base[key], value)
    } else {
      out[key] = value
    }
  }
  return out
}

function defineCharacter(overrides) {
  return Object.freeze(deepMerge(DEFAULT_CHARACTER, overrides))
}

// Every animation frame in both spritesheet packs is exactly 200x200px, so
// frameWidth/frameHeight default to that and don't need to be repeated below.
function sprite(imageSrc, framesMax, hitFrame) {
  return { imageSrc, framesMax, hitFrame, frameWidth: 200, frameHeight: 200 }
}

export const CHARACTERS = {
  samurai: defineCharacter({
    name: 'Samurai',
    faces: 'right',
    moveSpeed: 4.5,
    jumpVelocity: -18,
    jumpCost: 12,
    attackDamage: { attack1: 22, attack2: 42 },
    crossTrackScale: 0.5,
    airAttackLift: -120,
    afterimageOpacity: 0.36,
    attackBox: {
      offset: { x: 100, y: 50 },
      width: 190,
      height: 55
    },
    sprites: {
      idle: sprite('img/samuraiMack/Idle.png', 8),
      run: sprite('img/samuraiMack/Run.png', 8),
      jump: sprite('img/samuraiMack/Jump.png', 2),
      fall: sprite('img/samuraiMack/Fall.png', 2),
      attack1: sprite('img/samuraiMack/Attack1.png', 6, 4),
      attack2: sprite('img/samuraiMack/Attack2.png', 6, 4),
      takeHit: sprite('img/samuraiMack/Take Hit - white silhouette.png', 4),
      death: sprite('img/samuraiMack/Death.png', 6)
    }
  }),

  kenji: defineCharacter({
    name: 'Kenji',
    faces: 'left',
    offset: { y: 167 },
    moveSpeed: 6,
    jumpVelocity: -22,
    jumpCost: 8,
    attackCost: 40,
    attackDamage: { attack1: 16, attack2: 30 },
    airAttackLift: -100,
    afterimageOpacity: 0.5,
    attackBox: {
      offset: { x: -170, y: 50 },
      width: 150,
      height: 48
    },
    sprites: {
      idle: sprite('img/kenji/Idle.png', 4),
      run: sprite('img/kenji/Run.png', 8),
      jump: sprite('img/kenji/Jump.png', 2),
      fall: sprite('img/kenji/Fall.png', 2),
      attack1: sprite('img/kenji/Attack1.png', 4, 2),
      attack2: sprite('img/kenji/Attack2.png', 4, 2),
      takeHit: sprite('img/kenji/Take hit.png', 3),
      death: sprite('img/kenji/Death.png', 7)
    }
  })
}

export function rosterIds() {
  return Object.keys(CHARACTERS)
}

export function randomCharacterId() {
  const ids = rosterIds()
  return ids[Math.floor(Math.random() * ids.length)]
}

export function getCharacter(id) {
  const character = CHARACTERS[id]
  if (!character) throw new Error('Unknown character: ' + id)
  if (!character.sprites) throw new Error(id + ' is missing sprites')
  return { ...character, id }
}
