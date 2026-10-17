// Pointy-top hexes in axial (q, r) coordinates, unit size 1. Views scale and
// translate these to pixels.
const SQRT3 = Math.sqrt(3)

export function hexCenter(q, r) {
  return { x: SQRT3 * (q + r / 2), y: 1.5 * r }
}

export function hexCorners(q, r) {
  const c = hexCenter(q, r)
  const corners = []
  for (let i = 0; i < 6; i++) {
    const angle = ((60 * i - 30) * Math.PI) / 180
    corners.push({ x: c.x + Math.cos(angle), y: c.y + Math.sin(angle) })
  }
  return corners
}

// Corners shared by neighbouring hexes round to the same key.
export function pointKey(p) {
  return Math.round(p.x * 1000) + ',' + Math.round(p.y * 1000)
}

export function hexDistance(a, b) {
  const dq = a.q - b.q
  const dr = a.r - b.r
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2
}
