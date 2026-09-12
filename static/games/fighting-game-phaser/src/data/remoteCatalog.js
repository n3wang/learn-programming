import { registerCharacter, displayScaleForFrame, drawOffsetForFrame } from './characters.js'
import { registerStage } from './stages.js'
import { GameState } from '../state/GameState.js'

const CHARACTER_ROLES = ['idle', 'run', 'jump', 'fall', 'attack1', 'attack2', 'takeHit', 'death']
const OPTIONAL_CHARACTER_ROLES = ['attack3']

/** Mirrors CharacterHitboxWorkshop STAT_SPECS / STAT_BUDGET (keep in sync). */
const STAT_BUDGET = 5
const STAT_MIN_POINTS = -3
const STAT_SPECS = {
  maxHealth: { base: 100, perPoint: 15, maxPoints: 5, minPoints: STAT_MIN_POINTS },
  maxStamina: { base: 100, perPoint: 15, maxPoints: 5, minPoints: STAT_MIN_POINTS },
  moveSpeed: { base: 5, perPoint: 0.5, maxPoints: 5, minPoints: STAT_MIN_POINTS },
  staminaRegen: { base: 30, perPoint: 5, maxPoints: 5, minPoints: STAT_MIN_POINTS },
  attackBase: { base: 20, perPoint: 4, maxPoints: 5, minPoints: STAT_MIN_POINTS },
  jumpPower: { base: 16.2, perPoint: 1.2, maxPoints: 5, minPoints: STAT_MIN_POINTS },
  jumpCost: { base: 10, perPoint: 2, maxPoints: 5, minPoints: STAT_MIN_POINTS, invert: true },
  attackCost: { base: 50, perPoint: 5, maxPoints: 5, minPoints: STAT_MIN_POINTS, invert: true }
}
const DEFAULT_STAT_POINTS = {
  maxHealth: 0,
  maxStamina: 0,
  moveSpeed: 0,
  staminaRegen: 0,
  attackBase: 0,
  jumpPower: 0,
  jumpCost: 0,
  attackCost: 0
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

function resolveStatPoints(raw) {
  const out = { ...DEFAULT_STAT_POINTS }
  if (!raw || typeof raw !== 'object') return out
  for (const key of Object.keys(STAT_SPECS)) {
    if (raw[key] != null) {
      const spec = STAT_SPECS[key]
      out[key] = clamp(Number(raw[key]) || 0, spec.minPoints, spec.maxPoints)
    }
  }
  const spent = Object.values(out).reduce((a, b) => a + b, 0)
  if (spent > STAT_BUDGET) return { ...DEFAULT_STAT_POINTS }
  return out
}

function statsFromPoints(points) {
  const p = resolveStatPoints(points)
  const value = (key) => {
    const spec = STAT_SPECS[key]
    const delta = p[key] * spec.perPoint
    return spec.invert ? spec.base - delta : spec.base + delta
  }
  const attack1 = Math.round(value('attackBase'))
  const attack2 = Math.round(attack1 * 1.75)
  const attack3 = Math.round(attack1 * 2.5)
  const jumpPower = value('jumpPower')
  return {
    maxHealth: Math.round(value('maxHealth')),
    maxStamina: Math.round(value('maxStamina')),
    moveSpeed: value('moveSpeed'),
    staminaRegen: Math.round(value('staminaRegen')),
    attackDamage: { attack1, attack2, attack3 },
    jumpVelocity: -Math.abs(jumpPower),
    jumpCost: Math.max(1, Math.round(value('jumpCost'))),
    attackCost: Math.max(1, Math.round(value('attackCost')))
  }
}

const API_BASE_STORAGE_KEY = 'learn_api_base_url'
/** Mirrors REMOTE_API_BASE in src/api/apiBase.js (keep in sync). */
const REMOTE_API_BASE = 'https://springbackend.l.l0l.in'

function isLocalApiBase(url) {
  try {
    const host = new URL(url).hostname
    return host === '127.0.0.1' || host === 'localhost' || host === '[::1]'
  } catch {
    return false
  }
}

/** Deployed backend to fall back on, from the build-time bake when present. */
export function getGameApiFallback() {
  if (typeof window === 'undefined') return REMOTE_API_BASE
  const fromQuery = new URLSearchParams(window.location.search).get('apiFallback')
  if (fromQuery) return fromQuery.replace(/\/$/, '')
  if (window.__FIGHT_API_FALLBACK__) {
    return String(window.__FIGHT_API_FALLBACK__).replace(/\/$/, '')
  }
  return REMOTE_API_BASE
}

/**
 * Bases to try in order. A local base is only ever a first choice: on a laptop
 * with no Spring Boot running, the deployed backend still answers instead of
 * the whole thing failing with ERR_CONNECTION_REFUSED.
 */
export function gameApiBaseCandidates(preferred = getGameApiBase()) {
  const first = String(preferred || '').replace(/\/$/, '')
  const fallback = getGameApiFallback()
  if (!first) return [fallback]
  if (!isLocalApiBase(first) || first === fallback) return [first]
  return [first, fallback]
}

function rememberGameApiBase(url) {
  const normalized = String(url || '').replace(/\/$/, '')
  if (!normalized || typeof window === 'undefined') return normalized
  try {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, normalized)
  } catch {
    // ignore
  }
  window.__LEARN_API_BASE_URL__ = normalized
  return normalized
}

/** A base we have actually reached this session — beats every guess below. */
let confirmedApiBase = null

export function setConfirmedGameApiBase(url) {
  confirmedApiBase = rememberGameApiBase(url) || null
  return confirmedApiBase
}

export function getGameApiBase() {
  if (confirmedApiBase) return confirmedApiBase
  if (typeof window === 'undefined') return 'http://localhost:8080'
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('api')
  if (fromQuery) return rememberGameApiBase(fromQuery)

  if (window.__FIGHT_API_BASE__) {
    return rememberGameApiBase(window.__FIGHT_API_BASE__)
  }

  try {
    const stored = window.localStorage.getItem(API_BASE_STORAGE_KEY)
    if (stored) return String(stored).replace(/\/$/, '')
  } catch {
    // ignore
  }

  try {
    if (window.parent && window.parent !== window && window.parent.__LEARN_API_BASE_URL__) {
      return rememberGameApiBase(window.parent.__LEARN_API_BASE_URL__)
    }
  } catch {
    // cross-origin parent
  }

  if (window.__LEARN_API_BASE_URL__) {
    return String(window.__LEARN_API_BASE_URL__).replace(/\/$/, '')
  }

  return 'http://localhost:8080'
}

export function absoluteAssetUrl(path, apiBase = getGameApiBase()) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}

export function remoteCharacterId(packId) {
  const raw = String(packId || '')
  return raw.startsWith('remote_') ? raw : 'remote_' + raw
}

function fileMap(pack, apiBase) {
  const out = {}
  for (const file of pack.files || []) {
    out[file.role] = absoluteAssetUrl(file.url, apiBase)
  }
  return out
}

function characterFromPack(pack, apiBase) {
  const files = fileMap(pack, apiBase)
  if (!CHARACTER_ROLES.every((role) => files[role])) return null
  const meta = pack.meta || {}
  const frameWidth = Number(meta.frameWidth) || 200
  const frameHeight = Number(meta.frameHeight) || 200
  const spriteMeta = meta.sprites || {}
  const sprites = {}
  for (const role of CHARACTER_ROLES) {
    const spec = spriteMeta[role] || {}
    sprites[role] = {
      imageSrc: files[role],
      framesMax: Number(spec.framesMax) || 4,
      hitFrame: spec.hitFrame != null ? Number(spec.hitFrame) : undefined,
      clankFrame: spec.clankFrame != null ? Number(spec.clankFrame) : undefined,
      frameWidth,
      frameHeight
    }
  }
  for (const role of OPTIONAL_CHARACTER_ROLES) {
    if (!files[role]) continue
    const spec = spriteMeta[role] || {}
    sprites[role] = {
      imageSrc: files[role],
      framesMax: Number(spec.framesMax) || 4,
      hitFrame: spec.hitFrame != null ? Number(spec.hitFrame) : undefined,
      clankFrame: spec.clankFrame != null ? Number(spec.clankFrame) : undefined,
      frameWidth,
      frameHeight
    }
  }
  return {
    id: remoteCharacterId(pack.id),
    name: pack.name,
    author: pack.author || null,
    faces: meta.faces === 'left' ? 'left' : 'right',
    moveSpeed: meta.moveSpeed,
    jumpVelocity: meta.jumpVelocity,
    attackDamage: meta.attackDamage,
    footY: meta.footY != null ? Number(meta.footY) : undefined,
    // scale/offset applied in registerCharacter via applyFrameAutoScale
    sprites
  }
}

function stageFromPack(pack, apiBase) {
  const files = fileMap(pack, apiBase)
  const meta = pack.meta || {}
  const mode = meta.mode === 'parallax' ? 'parallax' : 'single'
  const id = 'remote_stage_' + pack.id
  if (mode === 'parallax') {
    if (!files.z1 || !files.z2 || !files.z3) return null
    return {
      id,
      name: pack.name,
      author: pack.author || null,
      imageSrc: files.z3,
      shop: false,
      width: Number(meta.width) || 3072,
      bgZoom: Number(meta.bgZoom) > 0 ? Number(meta.bgZoom) : 1,
      fit: meta.fit === 'stretch' || meta.fit === 'contain' ? meta.fit : 'cover',
      thumbCropX: meta.thumbCropX != null ? Number(meta.thumbCropX) : 1024,
      tracks: Array.isArray(meta.tracks) && meta.tracks.length ? meta.tracks : [{ y: 330 }],
      layers: [
        { src: files.z3, scrollFactor: 0.45, depth: -30 },
        {
          src: files.z2,
          scrollFactor: 0.72,
          depth: -20,
          tint: meta.z2Tint,
          alpha: meta.z2Alpha
        },
        { src: files.z1, scrollFactor: 1, depth: -10 }
      ]
    }
  }
  if (!files.image) return null
  return {
    id,
    name: pack.name,
    author: pack.author || null,
    imageSrc: files.image,
    shop: false,
    width: Number(meta.width) || 1024,
    bgZoom: Number(meta.bgZoom) > 0 ? Number(meta.bgZoom) : 1,
    fit: meta.fit === 'stretch' || meta.fit === 'contain' ? meta.fit : 'cover',
    tracks: Array.isArray(meta.tracks) && meta.tracks.length ? meta.tracks : [{ y: 330 }]
  }
}

async function fetchPacks(apiBase, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${apiBase}/api/classroom/game-packs`, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) return null
    const packs = await res.json()
    return Array.isArray(packs) ? packs : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function loadRemoteCatalog({ timeoutMs = 2000 } = {}) {
  let apiBase = null
  let packs = null
  for (const candidate of gameApiBaseCandidates()) {
    packs = await fetchPacks(candidate, timeoutMs)
    if (packs) {
      apiBase = candidate
      break
    }
  }
  if (!packs) return { ok: false, characters: 0, stages: 0 }
  // Pack file URLs — and the fight socket — follow whichever backend answered.
  setConfirmedGameApiBase(apiBase)

  try {
    let characters = 0
    let stages = 0
    for (const pack of packs) {
      if (pack.kind === 'character') {
        const def = characterFromPack(pack, apiBase)
        if (def) {
          registerCharacter(def.id, def)
          characters++
        }
      } else if (pack.kind === 'stage') {
        const def = stageFromPack(pack, apiBase)
        if (def) {
          registerStage(def)
          stages++
        }
      }
    }
    return { ok: true, characters, stages }
  } catch {
    return { ok: false, characters: 0, stages: 0 }
  }
}

const WORKSHOP_DRAFT_KEY = 'fg-character-draft-v1'
const WORKSHOP_LIBRARY_KEY = 'fg-character-library-v1'
const CLASSIC_IDS = new Set(['samurai', 'kenji'])

function frameBoxToGameAttackBox(box, frameW, frameH, scale, footY) {
  const drawOff = drawOffsetForFrame({ frameWidth: frameW, frameHeight: frameH, scale, footY })
  return {
    offset: {
      x: Math.round(box.x * scale - drawOff.x),
      y: Math.round(box.y * scale - drawOff.y)
    },
    width: Math.max(1, Math.round(box.w * scale)),
    height: Math.max(1, Math.round(box.h * scale))
  }
}

function registerDraftCharacter(draft) {
  if (!draft?.sprites || !draft?.attacks) return null
  const fw = Number(draft.frameWidth) || 82
  const fh = Number(draft.frameHeight) || 105
  const sizeMultiplier = Number(draft.sizeMultiplier) > 0 ? Number(draft.sizeMultiplier) : 1
  const scale = displayScaleForFrame(fw, fh, undefined, sizeMultiplier)
  const attackKeys = Object.keys(draft.attacks).filter((k) => draft.attacks[k]?.box)
  if (!attackKeys.includes('attack1') || !attackKeys.includes('attack2')) return null
  const footY =
    Number(draft.footY) > 0
      ? Number(draft.footY)
      : fw === 82 && fh === 105
        ? 72
        : fw === 126 && fh === 126
          ? 82
          : fh
  const attackBoxes = {}
  for (const key of attackKeys) {
    attackBoxes[key] = frameBoxToGameAttackBox(draft.attacks[key].box, fw, fh, scale, footY)
  }
  const sprite = (role, hitFrame) => {
    const s = draft.sprites[role]
    if (!s?.src) return null
    return {
      imageSrc: s.src,
      framesMax: Number(s.framesMax) || 4,
      frameWidth: fw,
      frameHeight: fh,
      hitFrame: hitFrame != null ? Number(hitFrame) : undefined,
      clankFrame: hitFrame != null ? Number(hitFrame) : undefined
    }
  }
  const roles = ['idle', 'run', 'jump', 'fall', 'takeHit', 'death', ...attackKeys]
  const sprites = {}
  for (const role of roles) {
    const hit = draft.attacks[role] ? draft.attacks[role].hitFrame : undefined
    const def = sprite(role, hit)
    if (!def) return null
    sprites[role] = def
  }
  const combat = statsFromPoints(draft.statPoints)
  const id = String(draft.id || 'draft_char')
  if (CLASSIC_IDS.has(id)) return null
  registerCharacter(id, {
    name: draft.name || '工坊角色',
    author: draft.author || null,
    faces: draft.faces === 'left' ? 'left' : 'right',
    scale,
    sizeMultiplier,
    footY,
    offset: drawOffsetForFrame({ frameWidth: fw, frameHeight: fh, scale, footY }),
    maxHealth: combat.maxHealth,
    maxStamina: combat.maxStamina,
    moveSpeed: combat.moveSpeed,
    staminaRegen: combat.staminaRegen,
    attackDamage: combat.attackDamage,
    jumpVelocity: combat.jumpVelocity,
    jumpCost: combat.jumpCost,
    attackCost: combat.attackCost,
    attackBox: attackBoxes.attack1,
    attackBoxes,
    sprites
  })
  return id
}

/** Load all workshop library characters (+ migrate legacy single draft). */
export function loadWorkshopCharacterDraft() {
  if (typeof window === 'undefined') return null
  try {
    let registered = []
    const libRaw = JSON.parse(window.localStorage.getItem(WORKSHOP_LIBRARY_KEY) || 'null')
    const entries = libRaw?.entries && typeof libRaw.entries === 'object' ? libRaw.entries : null
    if (entries) {
      for (const draft of Object.values(entries)) {
        const id = registerDraftCharacter(draft)
        if (id) registered.push(id)
      }
      return libRaw.activeId && registered.includes(libRaw.activeId)
        ? libRaw.activeId
        : registered[0] || null
    }

    // Legacy single-draft key
    const draft = JSON.parse(window.localStorage.getItem(WORKSHOP_DRAFT_KEY) || 'null')
    return registerDraftCharacter(draft)
  } catch {
    return null
  }
}

export function applyLaunchQuery() {
  if (typeof window === 'undefined') return
  const q = new URLSearchParams(window.location.search)
  if (q.get('mode') === 'test') {
    GameState.mode = 'test'
    GameState.skipSelect = true
  }
  const p1 = q.get('p1')
  if (p1) {
    // Workshop drafts use ids like draft_brucer — do not force remote_ prefix.
    GameState.p1Character = p1.startsWith('remote_') || p1.startsWith('draft_') ? p1 : remoteCharacterId(p1)
  }
  const p2 = q.get('p2')
  if (p2) {
    GameState.p2Character = p2.startsWith('remote_') || p2.startsWith('draft_') ? p2 : remoteCharacterId(p2)
  } else if (q.get('draft') === '1' && q.get('mode') === 'test') {
    GameState.p2Character = 'samurai'
  }
  const stage = q.get('stage')
  if (stage) {
    GameState.stageId = stage.startsWith('remote_') ? stage : 'remote_stage_' + stage
  }
}
