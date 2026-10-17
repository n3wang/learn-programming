import { shuffle } from './rng.js'
import { hexCenter, hexCorners, pointKey, hexDistance } from './hexMath.js'

const BOARD_RADIUS = 2 // 19 hexes
const TILE_POOL = [
  ...Array(4).fill('wood'),
  ...Array(4).fill('sheep'),
  ...Array(4).fill('wheat'),
  ...Array(3).fill('brick'),
  ...Array(3).fill('ore'),
  'desert'
]
const NUMBER_POOL = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]

// Dots on a number token: how likely the number is to be rolled.
export function pips(number) {
  return number ? 6 - Math.abs(7 - number) : 0
}

function hexCoords() {
  const coords = []
  for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r++) {
    for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q++) {
      if (Math.abs(q + r) <= BOARD_RADIUS) coords.push({ q, r })
    }
  }
  return coords
}

function assignNumbers(rng, tiles) {
  const land = tiles.filter((t) => t.resource !== 'desert')
  // Like the real game, try to keep the two hottest numbers (6/8) apart.
  for (let attempt = 0; attempt < 200; attempt++) {
    const numbers = shuffle(rng, NUMBER_POOL)
    land.forEach((tile, i) => (tile.number = numbers[i]))
    const clash = land.some((a) =>
      land.some(
        (b) => a !== b && hexDistance(a, b) === 1 && [6, 8].includes(a.number) && [6, 8].includes(b.number)
      )
    )
    if (!clash) return
  }
}

export function createBoard(rng) {
  const resources = shuffle(rng, TILE_POOL)
  const tiles = hexCoords().map((c, id) => ({
    id,
    q: c.q,
    r: c.r,
    resource: resources[id],
    number: null,
    vertexIds: [],
    center: hexCenter(c.q, c.r)
  }))
  assignNumbers(rng, tiles)

  const vertices = []
  const vertexByKey = new Map()
  for (const tile of tiles) {
    hexCorners(tile.q, tile.r).forEach((corner) => {
      const key = pointKey(corner)
      let vertex = vertexByKey.get(key)
      if (!vertex) {
        vertex = { id: vertices.length, x: corner.x, y: corner.y, tileIds: [], neighbors: [], edgeIds: [] }
        vertices.push(vertex)
        vertexByKey.set(key, vertex)
      }
      vertex.tileIds.push(tile.id)
      tile.vertexIds.push(vertex.id)
    })
  }

  const edges = []
  const edgeByKey = new Map()
  for (const tile of tiles) {
    for (let i = 0; i < 6; i++) {
      const a = tile.vertexIds[i]
      const b = tile.vertexIds[(i + 1) % 6]
      const key = Math.min(a, b) + '-' + Math.max(a, b)
      if (edgeByKey.has(key)) continue
      const edge = { id: edges.length, a, b }
      edges.push(edge)
      edgeByKey.set(key, edge)
      vertices[a].neighbors.push(b)
      vertices[b].neighbors.push(a)
      vertices[a].edgeIds.push(edge.id)
      vertices[b].edgeIds.push(edge.id)
    }
  }

  return { tiles, vertices, edges }
}

export function otherEnd(edge, vertexId) {
  return edge.a === vertexId ? edge.b : edge.a
}
