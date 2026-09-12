import { registerCharacter } from './characters.js'
import { registerStage } from './stages.js'
import { GameState } from '../state/GameState.js'

const CHARACTER_ROLES = ['idle', 'run', 'jump', 'fall', 'attack1', 'attack2', 'takeHit', 'death']

export function getGameApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:8080'
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('api')
  if (fromQuery) return fromQuery.replace(/\/$/, '')
  try {
    if (window.parent && window.parent !== window && window.parent.__LEARN_API_BASE_URL__) {
      return String(window.parent.__LEARN_API_BASE_URL__).replace(/\/$/, '')
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
  return {
    id: remoteCharacterId(pack.id),
    name: pack.name,
    author: pack.author || null,
    faces: meta.faces === 'left' ? 'left' : 'right',
    moveSpeed: meta.moveSpeed,
    jumpVelocity: meta.jumpVelocity,
    attackDamage: meta.attackDamage,
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

export async function loadRemoteCatalog({ timeoutMs = 2000 } = {}) {
  const apiBase = getGameApiBase()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${apiBase}/api/classroom/game-packs`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) return { ok: false, characters: 0, stages: 0 }
    const packs = await res.json()
    if (!Array.isArray(packs)) return { ok: false, characters: 0, stages: 0 }

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
  } finally {
    clearTimeout(timer)
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
    GameState.p1Character = remoteCharacterId(p1)
  }
  const p2 = q.get('p2')
  if (p2) {
    GameState.p2Character = remoteCharacterId(p2)
  }
  const stage = q.get('stage')
  if (stage) {
    GameState.stageId = stage.startsWith('remote_') ? stage : 'remote_stage_' + stage
  }
}
