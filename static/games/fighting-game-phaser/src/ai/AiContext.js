/** Shared empty PlayerIntent — same shape as InputController / DummyController. */
export function emptyIntent() {
  return {
    moveDir: 0,
    leftIsDown: false,
    rightIsDown: false,
    leftJustDown: false,
    rightJustDown: false,
    jumpJustDown: false,
    attackJustDown: false
  }
}

/** Horizontal gap between hurtboxes (0 if overlapping). */
export function hurtboxGap(a, b) {
  const aL = a.position.x
  const aR = a.position.x + a.hitWidth
  const bL = b.position.x
  const bR = b.position.x + b.hitWidth
  if (aR < bL) return bL - aR
  if (bR < aL) return aL - bR
  return 0
}

/** Signed direction from self toward opponent center (−1 | 1). */
export function dirToward(self, opponent) {
  const selfC = self.position.x + self.hitWidth / 2
  const oppC = opponent.position.x + opponent.hitWidth / 2
  return oppC >= selfC ? 1 : -1
}

export function attackReach(self) {
  const kit = self.combat?.kit
  if (!kit) return 60
  const box = kit.attackBoxes?.attack1 || kit.attackBox
  return (box?.width || 60) + 8
}

export function canAffordAttack(self) {
  const cost = self.combat?.kit?.attackCost ?? 50
  return (self.health?.stamina ?? 0) >= cost
}

/**
 * Read-only snapshot passed into AI states each frame.
 * Keep combat rules in FighterCombat — AI only emits intents.
 */
export function buildAiContext(self, opponent) {
  const gap = hurtboxGap(self, opponent)
  const reach = attackReach(self)
  return {
    self,
    opponent,
    gap,
    reach,
    inRange: gap <= reach,
    toward: dirToward(self, opponent),
    canAttack: canAffordAttack(self),
    swinging: !!self.isSwinging?.(),
    dead: !!self.dead,
    oppDead: !!opponent?.dead
  }
}
