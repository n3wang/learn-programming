export const CANVAS_WIDTH = 1024
export const CANVAS_HEIGHT = 576
export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

export const WIN_POINTS = 8
export const BANK_RATIO = 4

export const RESOURCES = ['wood', 'brick', 'sheep', 'wheat', 'ore']

export const RESOURCE_INFO = {
  wood: { label: 'Wood', terrain: 'Forest', color: 0x2e7d32, text: '#ffffff' },
  brick: { label: 'Brick', terrain: 'Hills', color: 0xc2410c, text: '#ffffff' },
  sheep: { label: 'Sheep', terrain: 'Pasture', color: 0x86efac, text: '#14532d' },
  wheat: { label: 'Wheat', terrain: 'Fields', color: 0xfacc15, text: '#422006' },
  ore: { label: 'Ore', terrain: 'Mountains', color: 0x94a3b8, text: '#0f172a' },
  desert: { label: 'Desert', terrain: 'Desert', color: 0xe7d3a0, text: '#422006' }
}

export const COSTS = {
  road: { wood: 1, brick: 1 },
  settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1 },
  city: { wheat: 2, ore: 3 }
}

export const PIECE_LIMITS = { road: 15, settlement: 5, city: 4 }

// Player 0 is always the human; the rest are deterministic bots.
export const PLAYERS = [
  { id: 0, name: 'You', human: true, color: 0x2563eb },
  { id: 1, name: 'Ada (bot)', human: false, color: 0xdc2626 },
  { id: 2, name: 'Bo (bot)', human: false, color: 0xf8fafc }
]

export const BOARD_CENTER = { x: 360, y: 312 }
export const HEX_SIZE = 52
