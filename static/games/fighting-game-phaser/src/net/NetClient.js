import { getFightSocketUrl, socketsSupported } from './netConfig.js'

export const NET_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSED: 'closed',
  ERROR: 'error'
}

const PING_INTERVAL_MS = 4000

/**
 * Minimal WebSocket wrapper for the online fight relay.
 *
 * Every method is soft-fail by design: with no backend, no WebSocket support
 * or a dropped link, nothing throws — `connect()` resolves false and `send()`
 * returns false, so the rest of the game keeps running offline.
 *
 * Message types: 'welcome' | 'queued' | 'match' | 'in' | 'st' | 'ev' |
 * 'opponent-left' | 'pong' | 'error', plus the local pseudo-events
 * 'open' | 'close' (emitted once the socket goes away for any reason).
 */
export class NetClient {
  constructor(url = getFightSocketUrl()) {
    this.url = url
    this.socket = null
    this.status = NET_STATUS.IDLE
    this.latency = 0
    this.playerId = null
    this.handlers = new Map()
    this.pingTimer = null
    this.closeEmitted = false
  }

  on(type, handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type).add(handler)
    return handler
  }

  off(type, handler) {
    const set = this.handlers.get(type)
    if (set) set.delete(handler)
  }

  emit(type, payload) {
    const set = this.handlers.get(type)
    if (!set) return
    // Copy: a handler may unsubscribe itself (the lobby does on 'match').
    for (const handler of [...set]) {
      try {
        handler(payload)
      } catch (err) {
        console.warn('[net] handler failed', type, err)
      }
    }
  }

  isOpen() {
    return !!this.socket && this.socket.readyState === 1
  }

  /** Resolves true once the socket is open, false on any failure/timeout. */
  connect({ timeoutMs = 5000 } = {}) {
    if (this.isOpen()) return Promise.resolve(true)
    if (!socketsSupported() || !this.url) {
      this.status = NET_STATUS.ERROR
      return Promise.resolve(false)
    }

    this.status = NET_STATUS.CONNECTING
    this.closeEmitted = false

    return new Promise((resolve) => {
      let settled = false
      const finish = (ok) => {
        if (settled) return
        settled = true
        resolve(ok)
      }

      let socket
      try {
        socket = new WebSocket(this.url)
      } catch {
        this.status = NET_STATUS.ERROR
        finish(false)
        return
      }
      this.socket = socket

      const timer = setTimeout(() => {
        if (!settled) {
          this.status = NET_STATUS.ERROR
          try {
            socket.close()
          } catch {
            // already dead
          }
          finish(false)
        }
      }, timeoutMs)

      socket.onopen = () => {
        clearTimeout(timer)
        this.status = NET_STATUS.OPEN
        this.startPing()
        this.emit('open', null)
        finish(true)
      }

      socket.onmessage = (event) => this.receive(event.data)

      socket.onerror = () => {
        if (this.status !== NET_STATUS.OPEN) this.status = NET_STATUS.ERROR
      }

      socket.onclose = () => {
        clearTimeout(timer)
        this.stopPing()
        const wasOpen = this.status === NET_STATUS.OPEN
        this.status = wasOpen ? NET_STATUS.CLOSED : NET_STATUS.ERROR
        if (!this.closeEmitted) {
          this.closeEmitted = true
          this.emit('close', { wasOpen })
        }
        finish(false)
      }
    })
  }

  receive(raw) {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }
    if (!msg || typeof msg !== 'object') return

    if (msg.type === 'welcome') this.playerId = msg.id
    if (msg.type === 'pong') {
      this.latency = Math.max(0, Date.now() - (Number(msg.t) || Date.now()))
    }
    this.emit(msg.type, msg)
    this.emit('*', msg)
  }

  send(payload) {
    if (!this.isOpen()) return false
    try {
      this.socket.send(JSON.stringify(payload))
      return true
    } catch {
      return false
    }
  }

  queue({ name, character, stage, room }) {
    return this.send({ type: 'queue', name, character, stage, room })
  }

  cancel() {
    return this.send({ type: 'cancel' })
  }

  leave() {
    return this.send({ type: 'leave' })
  }

  startPing() {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      this.send({ type: 'ping', t: Date.now() })
    }, PING_INTERVAL_MS)
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  close() {
    this.stopPing()
    const socket = this.socket
    this.socket = null
    this.status = NET_STATUS.CLOSED
    if (!socket) return
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    try {
      socket.close()
    } catch {
      // already dead
    }
  }

  destroy() {
    this.close()
    this.handlers.clear()
  }
}
