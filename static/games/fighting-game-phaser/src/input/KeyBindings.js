// P1 uses WASD (left side of the keyboard), P2 uses arrow keys (right side).
// Lane-swap is bound to the Shift key on the SAME side as each player's own
// controls: P1 -> Left Shift, P2 -> Right Shift.
export const P1_KEYS = { left: 'A', right: 'D', jump: 'W', attack: 'S' }
export const P2_KEYS = { left: 'LEFT', right: 'RIGHT', jump: 'UP', attack: 'DOWN' }

export const LANE_SWAP_CODE = { p1: 'ShiftLeft', p2: 'ShiftRight' }

const KEY_LABELS = {
  LEFT: '←',
  RIGHT: '→',
  UP: '↑',
  DOWN: '↓',
  SPACE: 'Space'
}

export function keyLabel(key) {
  return KEY_LABELS[key] || key
}

export function controlsLines() {
  return [
    'Player 1',
    '  Move        ' + keyLabel(P1_KEYS.left) + ' / ' + keyLabel(P1_KEYS.right),
    '  Jump        ' + keyLabel(P1_KEYS.jump),
    '  Attack      ' + keyLabel(P1_KEYS.attack),
    '  Lane swap   Left Shift',
    '',
    'Player 2',
    '  Move        ' + keyLabel(P2_KEYS.left) + ' / ' + keyLabel(P2_KEYS.right),
    '  Jump        ' + keyLabel(P2_KEYS.jump),
    '  Attack      ' + keyLabel(P2_KEYS.attack),
    '  Lane swap   Right Shift',
    '',
    'Pause         Esc'
  ]
}
