// Add a fighter by calling defineCharacter() with overrides and registering
// it in CHARACTERS below. Fields you omit are inherited from DEFAULT_CHARACTER.

/** Built-in Samurai / Kenji frame size — other packs are auto-fit to this. */
export const BASE_FRAME_SIZE = 200

const DEFAULT_CHARACTER = {
  name: '战士',
  faces: 'right',
  scale: 2.5,
  offset: { x: 215, y: 157 },
  maxHealth: 100,
  maxStamina: 100,
  // Stamina regained per second while not at max — defaults to half of
  // maxStamina/sec (full regen in 2s), same as the original's fixed rate.
  staminaRegen: 30,
  moveSpeed: 5,
  // Apex jump height scales with velocity squared, so a 34% height cut
  // needs jumpVelocity scaled by sqrt(0.66) (~0.812), not by 0.66 directly.
  jumpVelocity: -16.2,
  jumpCost: 10,
  attackCost: 50,
  comboWindow: 450,
  mirrorWindow: 250,
  mirrorReach: 1.5,
  attackDamage: {
    attack1: 20,
    attack2: 35
  },
  skills: {
    airCombo: true,
    dashCombo: true,
    afterimage: true,
    mirror: true,
    // When true, facing and reverse movement are locked for the swing.
    // Off for now so it can be acquired later.
    lockDirection: false
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

/**
 * Uniform fit so a pack's native frame matches BASE_FRAME_SIZE on screen.
 * ~100×100 art → ×2; 200×200 → ×1. Applied on top of the default scale (2.5).
 */
export function frameSizeFit(frameWidth, frameHeight) {
  const fw = Math.max(1, Number(frameWidth) || BASE_FRAME_SIZE)
  const fh = Math.max(1, Number(frameHeight) || BASE_FRAME_SIZE)
  return BASE_FRAME_SIZE / Math.max(fw, fh)
}

/** Phaser draw scale for a pack: defaultScale × (200 / max(frameW, frameH)) × sizeMultiplier. */
export function displayScaleForFrame(
  frameWidth,
  frameHeight,
  baseScale = DEFAULT_CHARACTER.scale,
  sizeMultiplier = 1
) {
  const mult = Number(sizeMultiplier) > 0 ? Number(sizeMultiplier) : 1
  return baseScale * frameSizeFit(frameWidth, frameHeight) * mult
}

/** Kenji / default 200×200 pack on-screen frame height (reference for student packs). */
export const KENJI_REF = {
  name: '剑士',
  frameWidth: BASE_FRAME_SIZE,
  frameHeight: BASE_FRAME_SIZE,
  scale: DEFAULT_CHARACTER.scale,
  get drawHeight() {
    return this.frameHeight * this.scale
  },
  get drawWidth() {
    return this.frameWidth * this.scale
  }
}

/** Sprite draw offset so soles (footY) sit on the hurtbox bottom. */
export function drawOffsetForFrame({
  frameWidth,
  frameHeight,
  scale,
  footY,
  hitWidth = 50,
  hitHeight = 150
}) {
  const fw = Math.max(1, Number(frameWidth) || BASE_FRAME_SIZE)
  const fh = Math.max(1, Number(frameHeight) || BASE_FRAME_SIZE)
  const fy = Number(footY) > 0 ? Number(footY) : fh
  return {
    x: Math.round((fw * scale - hitWidth) / 2),
    y: Math.max(0, Math.round(fy * scale - hitHeight))
  }
}

function sampleFrameSize(sprites) {
  const sample = sprites?.idle || sprites?.attack1 || (sprites && Object.values(sprites)[0])
  if (!sample) return { frameWidth: BASE_FRAME_SIZE, frameHeight: BASE_FRAME_SIZE }
  return {
    frameWidth: Number(sample.frameWidth) || BASE_FRAME_SIZE,
    frameHeight: Number(sample.frameHeight) || BASE_FRAME_SIZE
  }
}

/**
 * Non-200×200 packs inherit default scale/offset meant for Samurai art.
 * Auto-fit scale + recompute draw offset so ~100px sheets match 200px packs.
 */
export function applyFrameAutoScale(overrides) {
  const src = overrides && typeof overrides === 'object' ? { ...overrides } : {}
  const { frameWidth, frameHeight } = sampleFrameSize(src.sprites)
  const mult = Number(src.sizeMultiplier) > 0 ? Number(src.sizeMultiplier) : 1
  // Always re-fit when frames differ from 200×200, or when a size multiplier is set.
  if (frameWidth === BASE_FRAME_SIZE && frameHeight === BASE_FRAME_SIZE && mult === 1) return src

  const scale = displayScaleForFrame(frameWidth, frameHeight, DEFAULT_CHARACTER.scale, mult)
  src.scale = scale
  src.offset = drawOffsetForFrame({
    frameWidth,
    frameHeight,
    scale,
    footY: src.footY
  })
  return src
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
// clankFrame (0-based) is the frame a full clash freezes this swing on; omit
// it to fall back to DEFAULT_CLANK_FRAME.
function sprite(imageSrc, framesMax, hitFrame, clankFrame) {
  return { imageSrc, framesMax, hitFrame, clankFrame, frameWidth: 200, frameHeight: 200 }
}

export const CHARACTERS = {
  samurai: defineCharacter({
    name: '武士',
    faces: 'right',
    moveSpeed: 4.5,
    jumpVelocity: -12.6,
    jumpCost: 12,
    attackDamage: { attack1: 22, attack2: 42 },
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
      attack1: sprite('img/samuraiMack/Attack1.png', 6, 4, 4),
      attack2: sprite('img/samuraiMack/Attack2.png', 6, 4, 4),
      takeHit: sprite('img/samuraiMack/Take Hit - white silhouette.png', 4),
      death: sprite('img/samuraiMack/Death.png', 6)
    }
  }),

  kenji: defineCharacter({
    name: '剑士',
    faces: 'left',
    offset: { y: 167 },
    moveSpeed: 6,
    jumpVelocity: -15,
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

export function registerCharacter(id, overrides) {
  const cleaned = {}
  for (const key of Object.keys(overrides || {})) {
    if (overrides[key] !== undefined) cleaned[key] = overrides[key]
  }
  const fitted = applyFrameAutoScale(cleaned)
  const def = defineCharacter(fitted)
  CHARACTERS[id] = Object.freeze({
    ...def,
    author: fitted.author || null
  })
  return CHARACTERS[id]
}
