// Pure, stateless geometry/clash helpers. No Phaser types, no globals, no
// clock reads. Every box-shaped argument (a fighter used as a hurtbox, an
// attack box, or a hitZone) exposes: position {x,y}, hitWidth, hitHeight.
// Fighters additionally expose: faceRight, attackBox, trackIndex,
// isSwinging(). Attacks never reach across tracks — every hit check is
// gated by sameLane() in ClashResolver. (hitWidth/hitHeight are used
// instead of the more obvious width/height so Fighter — a real Phaser
// Sprite — never collides with Phaser's own width/height accessors, which
// are tied to texture size and scale, not this game's fixed 50x150 hitbox.)
import { CLASH_OVERLAP, STAGE_PADDING, CANVAS_WIDTH } from '../config/gameConfig.js'

export function clampToStage(fighter) {
  const minX = STAGE_PADDING
  const maxX = CANVAS_WIDTH - fighter.hitWidth - STAGE_PADDING
  if (fighter.position.x < minX) {
    fighter.position.x = minX
    if (fighter.velocity.x < 0) fighter.velocity.x = 0
  } else if (fighter.position.x > maxX) {
    fighter.position.x = maxX
    if (fighter.velocity.x > 0) fighter.velocity.x = 0
  }
}

export function boxesOverlap(a, b) {
  return (
    a.position.x + a.hitWidth >= b.position.x &&
    a.position.x <= b.position.x + b.hitWidth &&
    a.position.y + a.hitHeight >= b.position.y &&
    a.position.y <= b.position.y + b.hitHeight
  )
}

// Splits an attacker's attack box into a "safe" tip zone (the far end,
// nearest the edge of reach) vs a "damage" zone (the near end).
export function hitZone(fighter, which) {
  const box = fighter.attackBox
  const damageWidth = box.hitWidth * CLASH_OVERLAP
  const safeWidth = box.hitWidth - damageWidth
  const safe = which === 'safe'
  const x = fighter.faceRight
    ? box.position.x + (safe ? damageWidth : 0)
    : box.position.x + (safe ? 0 : safeWidth)
  return {
    position: { x, y: box.position.y },
    hitWidth: safe ? safeWidth : damageWidth,
    hitHeight: box.hitHeight
  }
}

export function zoneHitsBody(fighter, which, body) {
  return boxesOverlap(hitZone(fighter, which), body)
}

export function facingEachOther(a, b) {
  const aCenter = a.position.x + a.hitWidth / 2
  const bCenter = b.position.x + b.hitWidth / 2
  const aTowardB = a.faceRight ? bCenter >= aCenter : bCenter <= aCenter
  const bTowardA = b.faceRight ? aCenter >= bCenter : aCenter <= bCenter
  return aTowardB && bTowardA
}

export function attackRangesClash(a, b) {
  if (!facingEachOther(a, b)) return false
  return boxesOverlap(hitZone(a, 'damage'), hitZone(b, 'damage'))
}

export function hittingFromBehind(attacker, defender) {
  const attackerCenter = attacker.position.x + attacker.hitWidth / 2
  const defenderCenter = defender.position.x + defender.hitWidth / 2
  const defenderFacingAttacker = defender.faceRight
    ? attackerCenter >= defenderCenter
    : attackerCenter <= defenderCenter
  return !defenderFacingAttacker
}

export function tipOnlyHit(attacker, defender) {
  if (!boxesOverlap(attacker.attackBox, defender)) return false
  return !zoneHitsBody(attacker, 'damage', defender) && zoneHitsBody(attacker, 'safe', defender)
}

// Both fighters mid-swing, facing each other, tips only (not a real clash
// and not hitting from behind) — a harmless "swoosh" pass.
export function safeClash(a, b) {
  if (!a.isSwinging() || !b.isSwinging() || !facingEachOther(a, b)) return false
  if (hittingFromBehind(a, b) || hittingFromBehind(b, a)) return false
  if (attackRangesClash(a, b)) return false
  return (
    boxesOverlap(hitZone(a, 'safe'), hitZone(b, 'safe')) ||
    boxesOverlap(hitZone(a, 'safe'), b.attackBox) ||
    boxesOverlap(hitZone(b, 'safe'), a.attackBox)
  )
}

export function sameLane(a, b) {
  return (a.trackIndex || 0) === (b.trackIndex || 0)
}
