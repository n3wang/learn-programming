import { RESOURCES, COSTS, PIECE_LIMITS, PLAYERS, WIN_POINTS, BANK_RATIO } from '../config/gameConfig.js'
import { createBoard } from './board.js'

const emptyHand = () => Object.fromEntries(RESOURCES.map((r) => [r, 0]))

export function gainsFor(entries, playerId) {
  const gains = emptyHand()
  for (const e of entries) if (e.playerId === playerId) gains[e.resource] += e.amount
  return gains
}

export function totalOf(hand) {
  return RESOURCES.reduce((sum, r) => sum + hand[r], 0)
}

// Pure game rules — no Phaser, no timers. Scenes and the bot both drive it
// through the same methods, so the bot can never do anything a player can't.
export class Game {
  constructor({ rng = Math.random, playerDefs = PLAYERS } = {}) {
    this.rng = rng
    this.board = createBoard(rng)
    this.players = playerDefs.map((def) => ({
      ...def,
      resources: emptyHand(),
      roads: new Set(),
      settlements: new Set(),
      cities: new Set()
    }))
    this.buildings = new Map() // vertexId -> { owner, type: 'settlement' | 'city' }
    this.roadOwner = new Map() // edgeId -> playerId

    const ids = this.players.map((p) => p.id)
    this.setupOrder = [...ids, ...[...ids].reverse()] // snake draft: 0 1 2 2 1 0
    this.setupIndex = 0
    this.setupStage = 'settlement' // then 'road'
    this.setupVertex = null

    this.phase = 'setup' // setup -> roll <-> main -> over
    this.current = this.setupOrder[0]
    this.lastRoll = null
    this.winner = null
  }

  player(id) {
    return this.players[id]
  }

  handSize(id) {
    return totalOf(this.player(id).resources)
  }

  victoryPoints(id) {
    const p = this.player(id)
    return p.settlements.size + 2 * p.cities.size
  }

  // ---- placement rules ----

  canPlaceSettlement(playerId, vertexId, setup = false) {
    const vertex = this.board.vertices[vertexId]
    if (this.buildings.has(vertexId)) return false
    // Distance rule: no settlement on a vertex next to another building.
    if (vertex.neighbors.some((n) => this.buildings.has(n))) return false
    if (setup) return true
    return vertex.edgeIds.some((e) => this.roadOwner.get(e) === playerId)
  }

  legalSettlementVertices(playerId, setup = false) {
    return this.board.vertices.filter((v) => this.canPlaceSettlement(playerId, v.id, setup)).map((v) => v.id)
  }

  legalCityVertices(playerId) {
    return [...this.player(playerId).settlements]
  }

  canPlaceRoad(playerId, edgeId) {
    if (this.roadOwner.has(edgeId)) return false
    const edge = this.board.edges[edgeId]
    if (this.phase === 'setup') return edge.a === this.setupVertex || edge.b === this.setupVertex
    return [edge.a, edge.b].some((vid) => {
      const building = this.buildings.get(vid)
      if (building) return building.owner === playerId
      // Empty corner: connect through one of our own roads.
      return this.board.vertices[vid].edgeIds.some((e) => e !== edgeId && this.roadOwner.get(e) === playerId)
    })
  }

  legalRoadEdges(playerId) {
    return this.board.edges.filter((e) => this.canPlaceRoad(playerId, e.id)).map((e) => e.id)
  }

  legalSetupRoadEdges() {
    return this.legalRoadEdges(this.current)
  }

  // ---- setup phase ----

  placeSetupSettlement(playerId, vertexId) {
    if (this.phase !== 'setup' || this.setupStage !== 'settlement' || this.current !== playerId) return false
    if (!this.canPlaceSettlement(playerId, vertexId, true)) return false
    this.putSettlement(playerId, vertexId)
    this.setupVertex = vertexId
    this.setupStage = 'road'
    // The second settlement pays out one card per neighbouring land tile.
    if (this.player(playerId).settlements.size === 2) {
      for (const tid of this.board.vertices[vertexId].tileIds) {
        const resource = this.board.tiles[tid].resource
        if (resource !== 'desert') this.player(playerId).resources[resource] += 1
      }
    }
    return true
  }

  placeSetupRoad(playerId, edgeId) {
    if (this.phase !== 'setup' || this.setupStage !== 'road' || this.current !== playerId) return false
    if (!this.canPlaceRoad(playerId, edgeId)) return false
    this.putRoad(playerId, edgeId)
    this.setupIndex += 1
    this.setupVertex = null
    this.setupStage = 'settlement'
    if (this.setupIndex >= this.setupOrder.length) {
      this.phase = 'roll'
      this.current = this.setupOrder[0]
    } else {
      this.current = this.setupOrder[this.setupIndex]
    }
    return true
  }

  // ---- dice and production ----

  roll() {
    if (this.phase !== 'roll') return null
    const d1 = 1 + Math.floor(this.rng() * 6)
    const d2 = 1 + Math.floor(this.rng() * 6)
    this.lastRoll = { d1, d2, total: d1 + d2 }
    this.phase = 'main'
    return this.lastRoll
  }

  // Everything a roll would pay out, without handing it over: the scene
  // decides who collects automatically and who must solve a problem first.
  production(total) {
    const entries = []
    if (total === 7) return entries
    for (const tile of this.board.tiles) {
      if (tile.number !== total) continue
      for (const vid of tile.vertexIds) {
        const building = this.buildings.get(vid)
        if (!building) continue
        entries.push({
          playerId: building.owner,
          tileId: tile.id,
          resource: tile.resource,
          amount: building.type === 'city' ? 2 : 1
        })
      }
    }
    return entries
  }

  grant(playerId, gains) {
    for (const r of RESOURCES) this.player(playerId).resources[r] += gains[r] || 0
  }

  // ---- building ----

  canAfford(playerId, cost) {
    const hand = this.player(playerId).resources
    return Object.entries(cost).every(([r, n]) => hand[r] >= n)
  }

  canBuild(kind, playerId) {
    if (this.phase !== 'main' || this.current !== playerId) return false
    if (!this.canAfford(playerId, COSTS[kind])) return false
    const p = this.player(playerId)
    if (kind === 'road') return p.roads.size < PIECE_LIMITS.road && this.legalRoadEdges(playerId).length > 0
    if (kind === 'settlement') {
      return p.settlements.size < PIECE_LIMITS.settlement && this.legalSettlementVertices(playerId).length > 0
    }
    return p.cities.size < PIECE_LIMITS.city && p.settlements.size > 0
  }

  buildRoad(playerId, edgeId) {
    if (!this.canBuild('road', playerId) || !this.canPlaceRoad(playerId, edgeId)) return false
    this.pay(playerId, COSTS.road)
    this.putRoad(playerId, edgeId)
    return true
  }

  buildSettlement(playerId, vertexId) {
    if (!this.canBuild('settlement', playerId) || !this.canPlaceSettlement(playerId, vertexId)) return false
    this.pay(playerId, COSTS.settlement)
    this.putSettlement(playerId, vertexId)
    this.checkWin(playerId)
    return true
  }

  buildCity(playerId, vertexId) {
    if (!this.canBuild('city', playerId) || !this.player(playerId).settlements.has(vertexId)) return false
    this.pay(playerId, COSTS.city)
    const p = this.player(playerId)
    p.settlements.delete(vertexId)
    p.cities.add(vertexId)
    this.buildings.set(vertexId, { owner: playerId, type: 'city' })
    this.checkWin(playerId)
    return true
  }

  bankTrade(playerId, give, get) {
    if (this.phase !== 'main' || this.current !== playerId || give === get) return false
    const hand = this.player(playerId).resources
    if (hand[give] < BANK_RATIO) return false
    hand[give] -= BANK_RATIO
    hand[get] += 1
    return true
  }

  endTurn() {
    if (this.phase !== 'main') return false
    this.current = (this.current + 1) % this.players.length
    this.phase = 'roll'
    return true
  }

  // ---- internals ----

  pay(playerId, cost) {
    const hand = this.player(playerId).resources
    for (const [r, n] of Object.entries(cost)) hand[r] -= n
  }

  putRoad(playerId, edgeId) {
    this.roadOwner.set(edgeId, playerId)
    this.player(playerId).roads.add(edgeId)
  }

  putSettlement(playerId, vertexId) {
    this.buildings.set(vertexId, { owner: playerId, type: 'settlement' })
    this.player(playerId).settlements.add(vertexId)
  }

  checkWin(playerId) {
    if (this.victoryPoints(playerId) >= WIN_POINTS) {
      this.winner = playerId
      this.phase = 'over'
    }
  }
}
