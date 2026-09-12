import { getGameApiBase } from '../data/remoteCatalog.js'

const NAME_KEY = 'fg-online-name-v1'

/**
 * Socket URL for the Spring matchmaking relay. Derived from the same API base
 * the pack catalog uses, so a `?api=` override moves both. `?ws=` overrides
 * just the socket (handy when the relay sits behind a different proxy).
 */
export function getFightSocketUrl() {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  const override = params.get('ws')
  if (override) return override

  let base = getGameApiBase()
  if (!/^https?:\/\//i.test(base)) {
    base = window.location.origin + (base.startsWith('/') ? base : '/' + base)
  }
  return base.replace(/^http/i, 'ws').replace(/\/$/, '') + '/ws/fight'
}

/** Separate queues per class/room so two lessons don't match into each other. */
export function getRoomId() {
  if (typeof window === 'undefined') return 'default'
  const room = new URLSearchParams(window.location.search).get('room')
  return room && room.trim() ? room.trim().slice(0, 40) : 'default'
}

/**
 * Display name shown to the opponent. `?name=` wins; otherwise a generated
 * handle is remembered so the same browser keeps its name between matches.
 */
export function getPlayerName() {
  if (typeof window === 'undefined') return '玩家'
  const fromQuery = new URLSearchParams(window.location.search).get('name')
  if (fromQuery && fromQuery.trim()) return fromQuery.trim().slice(0, 24)
  try {
    const saved = window.localStorage.getItem(NAME_KEY)
    if (saved && saved.trim()) return saved.trim().slice(0, 24)
    const generated = '玩家' + Math.floor(100 + Math.random() * 900)
    window.localStorage.setItem(NAME_KEY, generated)
    return generated
  } catch {
    // Private mode / storage disabled — a throwaway name still works.
    return '玩家' + Math.floor(100 + Math.random() * 900)
  }
}

export function socketsSupported() {
  return typeof window !== 'undefined' && typeof window.WebSocket === 'function'
}
