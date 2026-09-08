// Loop policy per action, shared by every character. attack1/attack2/death/
// takeHit play once and hold their last frame; everything else loops.
export const ANIMATION_POLICY = {
  idle: { repeat: -1 },
  run: { repeat: -1 },
  jump: { repeat: -1 },
  fall: { repeat: -1 },
  takeHit: { repeat: 0 },
  attack1: { repeat: 0 },
  attack2: { repeat: 0 },
  death: { repeat: 0 }
}

// Reproduces the original's framesHold = 5 at a 60fps update rate.
export const FRAME_RATE = 12

export function animKey(characterId, action) {
  return characterId + '_' + action
}
