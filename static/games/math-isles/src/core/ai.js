import { RESOURCES, COSTS, PIECE_LIMITS, BANK_RATIO } from '../config/gameConfig.js'
import { pips } from './board.js'

// A deliberately simple, fully deterministic bot: it scores spots by dice
// odds and resource variety, breaks every tie by lowest id, and never rolls
// a die of its own. Same board + same dice = same bot decisions.

function tileTypes(game, vertexId) {
  const types = new Set()
  for (const tid of game.board.vertices[vertexId].tileIds) {
    const resource = game.board.tiles[tid].resource
    if (resource !== 'desert') types.add(resource)
  }
  return types
}

function ownedTypes(game, playerId) {
  const owned = new Set()
  for (const [vid, building] of game.buildings) {
    if (building.owner === playerId) tileTypes(game, vid).forEach((t) => owned.add(t))
  }
  return owned
}

export function vertexScore(game, vertexId, playerId) {
  const types = tileTypes(game, vertexId)
  const owned = ownedTypes(game, playerId)
  let score = 0
  for (const tid of game.board.vertices[vertexId].tileIds) score += pips(game.board.tiles[tid].number)
  for (const t of types) if (!owned.has(t)) score += 1.5
  return score + types.size * 0.25
}

function bestVertex(game, playerId, vertexIds) {
  let best = null
  let bestScore = -Infinity
  for (const vid of vertexIds) {
    const score = vertexScore(game, vid, playerId)
    if (score > bestScore) {
      best = vid
      bestScore = score
    }
  }
  return best
}

export function aiSetupSettlement(game, playerId) {
  return bestVertex(game, playerId, game.legalSettlementVertices(playerId, true))
}

export function aiSetupRoad(game, playerId) {
  return bestRoadToward(game, playerId, game.legalSetupRoadEdges())
}

// Pick the road whose far end is the most valuable place to settle next.
function bestRoadToward(game, playerId, edgeIds) {
  let best = null
  let bestScore = -Infinity
  for (const eid of edgeIds) {
    const edge = game.board.edges[eid]
    let score = 0
    for (const vid of [edge.a, edge.b]) {
      if (game.buildings.has(vid)) continue
      const free = !game.board.vertices[vid].neighbors.some((n) => game.buildings.has(n))
      if (free) score = Math.max(score, vertexScore(game, vid, playerId))
    }
    if (score > bestScore) {
      best = eid
      bestScore = score
    }
  }
  return best
}

function goalFor(game, playerId) {
  const p = game.player(playerId)
  if (p.settlements.size < PIECE_LIMITS.settlement && game.legalSettlementVertices(playerId).length > 0) {
    return 'settlement'
  }
  if (p.settlements.size < PIECE_LIMITS.settlement && p.roads.size < PIECE_LIMITS.road) return 'road'
  if (p.settlements.size > 0 && p.cities.size < PIECE_LIMITS.city) return 'city'
  return null
}

function tradeFor(game, playerId, goal) {
  if (!goal) return null
  const hand = game.player(playerId).resources
  const cost = COSTS[goal]
  let give = null
  let get = null
  for (const r of RESOURCES) {
    const surplus = hand[r] - (cost[r] || 0)
    if (surplus >= BANK_RATIO && (give === null || surplus > hand[give] - (cost[give] || 0))) give = r
  }
  for (const r of RESOURCES) {
    const missing = (cost[r] || 0) - hand[r]
    if (missing > 0 && (get === null || missing > (cost[get] || 0) - hand[get])) get = r
  }
  return give && get ? { type: 'trade', give, get } : null
}

// One decision at a time; the scene calls this until it returns null.
export function aiNextAction(game, playerId) {
  if (game.canBuild('settlement', playerId)) {
    return { type: 'settlement', vertex: bestVertex(game, playerId, game.legalSettlementVertices(playerId)) }
  }
  if (game.canBuild('city', playerId)) {
    return { type: 'city', vertex: bestVertex(game, playerId, game.legalCityVertices(playerId)) }
  }
  const goal = goalFor(game, playerId)
  if (goal === 'road' && game.canBuild('road', playerId)) {
    return { type: 'road', edge: bestRoadToward(game, playerId, game.legalRoadEdges(playerId)) }
  }
  return tradeFor(game, playerId, goal)
}

export function executeAction(game, playerId, action) {
  switch (action.type) {
    case 'settlement':
      return game.buildSettlement(playerId, action.vertex)
    case 'city':
      return game.buildCity(playerId, action.vertex)
    case 'road':
      return game.buildRoad(playerId, action.edge)
    case 'trade':
      return game.bankTrade(playerId, action.give, action.get)
    default:
      return false
  }
}

export function describeAction(action) {
  switch (action.type) {
    case 'settlement':
      return 'builds a settlement'
    case 'city':
      return 'upgrades a settlement to a city'
    case 'road':
      return 'builds a road'
    case 'trade':
      return 'trades ' + BANK_RATIO + ' ' + action.give + ' for 1 ' + action.get
    default:
      return 'does something'
  }
}
