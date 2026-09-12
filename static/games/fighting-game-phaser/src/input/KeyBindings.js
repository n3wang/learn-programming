// P1 uses WASD (left side of the keyboard), P2 uses arrow keys (right side).
// Lane-swap is bound to the Shift key on the SAME side as each player's own
// controls: P1 -> Left Shift, P2 -> Right Shift.
import { UI } from '../ui/strings.js'

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
    UI.player1,
    '  ' + UI.move + '        ' + keyLabel(P1_KEYS.left) + ' / ' + keyLabel(P1_KEYS.right),
    '  ' + UI.jump + '        ' + keyLabel(P1_KEYS.jump),
    '  ' + UI.attack + '        ' + keyLabel(P1_KEYS.attack),
    '  ' + UI.laneSwap + '     ' + UI.leftShift,
    '',
    UI.player2,
    '  ' + UI.move + '        ' + keyLabel(P2_KEYS.left) + ' / ' + keyLabel(P2_KEYS.right),
    '  ' + UI.jump + '        ' + keyLabel(P2_KEYS.jump),
    '  ' + UI.attack + '        ' + keyLabel(P2_KEYS.attack),
    '  ' + UI.laneSwap + '     ' + UI.rightShift,
    '',
    UI.pause + '         Esc'
  ]
}
