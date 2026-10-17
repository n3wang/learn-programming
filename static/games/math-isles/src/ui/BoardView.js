import { RESOURCE_INFO, FONT } from '../config/gameConfig.js'

const HOUSE = [
  [-9, 9],
  [-9, -3],
  [0, -12],
  [9, -3],
  [9, 9]
]

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

// Draws the island and the pieces on it, and lets the player pick one of a
// highlighted set of vertices (settlements/cities) or edges (roads).
export class BoardView {
  constructor(scene, model, { x, y, size }) {
    this.scene = scene
    this.model = model
    this.cx = x
    this.cy = y
    this.size = size
    this.inputEnabled = true

    this.vertexPos = model.board.vertices.map((v) => this.toScreen(v))
    this.tileLayer = scene.add.graphics()
    this.pieceLayer = scene.add.graphics()
    this.highlightLayer = scene.add.graphics()

    this.candidates = []
    this.hover = -1
    this.onPick = null

    this.drawTiles()
    this.drawPieces()

    scene.input.on('pointermove', (pointer) => this.handleMove(pointer))
    scene.input.on('pointerdown', (pointer) => this.handleDown(pointer))
  }

  toScreen(u) {
    return { x: this.cx + u.x * this.size, y: this.cy + u.y * this.size }
  }

  tileCenter(tile) {
    return this.toScreen(tile.center)
  }

  drawTiles() {
    const g = this.tileLayer
    const labelStyle = { fontFamily: FONT, fontSize: '11px', color: '#000000' }
    for (const tile of this.model.board.tiles) {
      const info = RESOURCE_INFO[tile.resource]
      const pts = tile.vertexIds.map((id) => this.vertexPos[id])
      g.fillStyle(info.color, 1)
      g.fillPoints(pts, true)
      g.lineStyle(3, 0x1f2937, 1)
      g.strokePoints(pts, true)

      const c = this.tileCenter(tile)
      this.scene.add
        .text(c.x, c.y - 26, info.terrain, { ...labelStyle, color: info.text })
        .setOrigin(0.5)
        .setAlpha(0.9)
      if (!tile.number) continue
      g.fillStyle(0xfef3c7, 1)
      g.fillCircle(c.x, c.y + 6, 17)
      g.lineStyle(2, 0x92400e, 1)
      g.strokeCircle(c.x, c.y + 6, 17)
      const hot = tile.number === 6 || tile.number === 8
      this.scene.add
        .text(c.x, c.y + 6, String(tile.number), {
          fontFamily: FONT,
          fontSize: '17px',
          fontStyle: 'bold',
          color: hot ? '#b91c1c' : '#1f2937'
        })
        .setOrigin(0.5)
    }
  }

  drawPieces() {
    const g = this.pieceLayer
    g.clear()
    const colorOf = (id) => this.model.player(id).color

    for (const [edgeId, owner] of this.model.roadOwner) {
      const edge = this.model.board.edges[edgeId]
      const a = this.vertexPos[edge.a]
      const b = this.vertexPos[edge.b]
      g.lineStyle(11, 0x000000, 1)
      g.lineBetween(a.x, a.y, b.x, b.y)
      g.lineStyle(7, colorOf(owner), 1)
      g.lineBetween(a.x, a.y, b.x, b.y)
    }

    for (const [vertexId, building] of this.model.buildings) {
      const p = this.vertexPos[vertexId]
      const k = building.type === 'city' ? 1.4 : 1
      const pts = HOUSE.map(([hx, hy]) => ({ x: p.x + hx * k, y: p.y + hy * k }))
      g.fillStyle(colorOf(building.owner), 1)
      g.fillPoints(pts, true)
      g.lineStyle(building.type === 'city' ? 3 : 2, building.type === 'city' ? 0xfacc15 : 0x000000, 1)
      g.strokePoints(pts, true)
    }
  }

  // Briefly ring every tile showing the rolled number.
  flashNumber(number) {
    for (const tile of this.model.board.tiles) {
      if (tile.number !== number) continue
      const c = this.tileCenter(tile)
      const ring = this.scene.add.circle(c.x, c.y + 6, 19).setStrokeStyle(5, 0xffffff)
      this.scene.tweens.add({
        targets: ring,
        scale: 2.4,
        alpha: 0,
        duration: 800,
        repeat: 1,
        onComplete: () => ring.destroy()
      })
    }
  }

  // ---- picking ----

  showCandidates(kind, ids, onPick) {
    this.candidates = ids.map((id) => {
      if (kind === 'vertex') return { kind, id, pos: this.vertexPos[id] }
      const edge = this.model.board.edges[id]
      return { kind, id, a: this.vertexPos[edge.a], b: this.vertexPos[edge.b] }
    })
    this.onPick = onPick
    this.hover = -1
    this.drawHighlights()
  }

  clearCandidates() {
    this.candidates = []
    this.onPick = null
    this.hover = -1
    this.highlightLayer.clear()
  }

  nearestCandidate(pointer) {
    const p = { x: pointer.x, y: pointer.y }
    let best = -1
    let bestDist = 18
    this.candidates.forEach((c, i) => {
      const d = c.kind === 'vertex' ? Math.hypot(p.x - c.pos.x, p.y - c.pos.y) : distanceToSegment(p, c.a, c.b)
      if (d < bestDist) {
        best = i
        bestDist = d
      }
    })
    return best
  }

  handleMove(pointer) {
    if (!this.inputEnabled || !this.candidates.length) return
    const hover = this.nearestCandidate(pointer)
    if (hover === this.hover) return
    this.hover = hover
    this.drawHighlights()
  }

  handleDown(pointer) {
    if (!this.inputEnabled || !this.candidates.length) return
    const i = this.nearestCandidate(pointer)
    if (i < 0) return
    const { id } = this.candidates[i]
    const done = this.onPick
    this.clearCandidates()
    if (done) done(id)
  }

  drawHighlights() {
    const g = this.highlightLayer
    g.clear()
    this.candidates.forEach((c, i) => {
      const hot = i === this.hover
      if (c.kind === 'vertex') {
        g.fillStyle(0xffffff, hot ? 0.95 : 0.5)
        g.fillCircle(c.pos.x, c.pos.y, hot ? 13 : 10)
        g.lineStyle(2, 0x000000, 1)
        g.strokeCircle(c.pos.x, c.pos.y, hot ? 13 : 10)
      } else {
        g.lineStyle(hot ? 15 : 12, 0x000000, 0.7)
        g.lineBetween(c.a.x, c.a.y, c.b.x, c.b.y)
        g.lineStyle(hot ? 10 : 7, 0xffffff, hot ? 1 : 0.75)
        g.lineBetween(c.a.x, c.a.y, c.b.x, c.b.y)
      }
    })
  }
}
