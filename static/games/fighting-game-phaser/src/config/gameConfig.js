export const CANVAS_WIDTH = 1024
export const CANVAS_HEIGHT = 576
export const GRAVITY = 0.7
export const STAGE_PADDING = 8
export const MATCH_SECONDS = 60
export const HEALTH_BAR_MS = 800

// When both fighters are swinging into each other at once, each only takes
// this fraction of the hit instead of the full damage.
export const SPLIT_DAMAGE_TAKEN = 0.2
export const SPLIT_KNOCKBACK = 55
export const SPLIT_STAMINA_COST = 15
export const SPLIT_PUSH_COOLDOWN_MS = 280
export const SAFE_CLASH_COOLDOWN_MS = 280

// Fraction of an attack box, measured from its far edge, that counts as a
// "safe" tip hit rather than a damaging hit.
export const CLASH_OVERLAP = 3 / 5
export const CLASH_WINDOW_MS = 120

// How long a full-clash ("clank") freeze-frame holds before the attack is
// released back to idle/movement.
export const CLANK_FREEZE_MS = 200

// Lane-swap tween speed scales with a character's jump: swapTrack()'s t
// advances by LANE_SWAP_BASE_RATE * (abs(jumpVelocity) / LANE_SWAP_REFERENCE_JUMP)
// per frame, so a bigger jumper also hops lanes faster.
export const LANE_SWAP_BASE_RATE = 0.045
export const LANE_SWAP_REFERENCE_JUMP = 20

export const PLAYER_SPAWN_X = 120
export const ENEMY_SPAWN_X = 860
export const TEST_PLAYER_X = 180
export const TEST_ENEMY_X = 520

// Max center-to-center gap between fighters. Keeps both on screen when the
// camera tracks their midpoint on wide scrolling stages.
export const MAX_FIGHTER_SEPARATION = 780

// Camera catch-up on wide stages (higher = snappier). Soft-follows the
// fighters' midpoint so mirrors/drops/dashes don't snap the view.
export const CAMERA_FOLLOW_RATE = 5.5
export const CAMERA_EDGE_PADDING = 48
