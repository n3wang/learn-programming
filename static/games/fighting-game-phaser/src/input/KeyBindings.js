// P1 uses WASD + Space (left hand), P2 uses arrow keys + Down (right hand).
// Lane-swap is bound to the OTHER hand's Shift key on purpose, matching the
// original: P1 -> Right Shift, P2 -> Left Shift.
export const P1_KEYS = { left: 'A', right: 'D', jump: 'W', attack: 'SPACE' }
export const P2_KEYS = { left: 'LEFT', right: 'RIGHT', jump: 'UP', attack: 'DOWN' }

export const LANE_SWAP_CODE = { p1: 'ShiftRight', p2: 'ShiftLeft' }
