// Add a new fighter by copying an entry into ROSTER.
// Only override what differs from CHARACTER_DEFAULTS.

const CHARACTER_DEFAULTS = {
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
  attackDamage: {
    attack1: 20,
    attack2: 35
  },
  skills: {
    airCombo: true,
    dashCombo: true,
    afterimage: true
  },
  airStep: 110,
  dashStep: 220,
  airAttackLift: -110,
  afterimageOpacity: 0.42,
  afterimageFade: 0.012,
  attackBox: {
    offset: { x: 100, y: 50 },
    width: 160,
    height: 50
  }
}

const ROSTER = {
  samurai: {
    name: 'Samurai',
    faces: 'right',
    offset: { x: 215, y: 157 },
    moveSpeed: 4.5,
    jumpVelocity: -18,
    jumpCost: 12,
    attackCost: 50,
    attackDamage: {
      attack1: 22,
      attack2: 42
    },
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
  },
  kenji: {
    name: 'Kenji',
    faces: 'left',
    offset: { x: 215, y: 167 },
    moveSpeed: 6,
    jumpVelocity: -22,
    jumpCost: 8,
    attackCost: 40,
    attackDamage: {
      attack1: 16,
      attack2: 30
    },
    airStep: 130,
    dashStep: 260,
    airAttackLift: -100,
    afterimageOpacity: 0.5,
    attackBox: {
      offset: { x: -170, y: 50 },
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
  }
}

function rosterIds() {
  return Object.keys(ROSTER)
}

function getCharacter(id) {
  const entry = ROSTER[id]
  if (!entry) throw new Error('Unknown character: ' + id)

  const attackBox = entry.attackBox || {}
  return {
    id,
    name: entry.name || CHARACTER_DEFAULTS.name,
    faces: entry.faces || CHARACTER_DEFAULTS.faces,
    scale: entry.scale || CHARACTER_DEFAULTS.scale,
    offset: { ...CHARACTER_DEFAULTS.offset, ...(entry.offset || {}) },
    maxHealth: entry.maxHealth || CHARACTER_DEFAULTS.maxHealth,
    maxStamina: entry.maxStamina || CHARACTER_DEFAULTS.maxStamina,
    moveSpeed: entry.moveSpeed || CHARACTER_DEFAULTS.moveSpeed,
    jumpVelocity: entry.jumpVelocity || CHARACTER_DEFAULTS.jumpVelocity,
    jumpCost: entry.jumpCost || CHARACTER_DEFAULTS.jumpCost,
    attackCost: entry.attackCost || CHARACTER_DEFAULTS.attackCost,
    comboWindow: entry.comboWindow || CHARACTER_DEFAULTS.comboWindow,
    attackDamage: {
      ...CHARACTER_DEFAULTS.attackDamage,
      ...(entry.attackDamage || {})
    },
    skills: {
      ...CHARACTER_DEFAULTS.skills,
      ...(entry.skills || {})
    },
    airStep: entry.airStep || CHARACTER_DEFAULTS.airStep,
    dashStep: entry.dashStep || CHARACTER_DEFAULTS.dashStep,
    airAttackLift: entry.airAttackLift || CHARACTER_DEFAULTS.airAttackLift,
    afterimageOpacity: entry.afterimageOpacity || CHARACTER_DEFAULTS.afterimageOpacity,
    afterimageFade: entry.afterimageFade || CHARACTER_DEFAULTS.afterimageFade,
    attackBox: {
      offset: {
        ...CHARACTER_DEFAULTS.attackBox.offset,
        ...(attackBox.offset || {})
      },
      width: attackBox.width || CHARACTER_DEFAULTS.attackBox.width,
      height: attackBox.height || CHARACTER_DEFAULTS.attackBox.height
    },
    sprites: entry.sprites
  }
}
