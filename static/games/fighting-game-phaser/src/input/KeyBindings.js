// P1 uses WASD + Space (left side of the keyboard), P2 uses arrow keys +
// Down (right side). Lane-swap is bound to the Shift key on the SAME side
// as each player's own controls: P1 -> Left Shift, P2 -> Right Shift.
export const P1_KEYS = { left: 'A', right: 'D', jump: 'W', attack: 'SPACE' }
export const P2_KEYS = { left: 'LEFT', right: 'RIGHT', jump: 'UP', attack: 'DOWN' }

export const LANE_SWAP_CODE = { p1: 'ShiftLeft', p2: 'ShiftRight' }
