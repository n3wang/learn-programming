import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

/**
 * Layout a stage bitmap inside the fight box.
 * - cover: uniform scale, fill the box (crop overflow) — preserves aspect
 * - bottom-aligned so ground at the bottom of the art stays on-screen
 * - zoom > 1 enlarges further (crops more) for padded / logo-heavy uploads
 */
export function layoutStageBackdrop(
  srcW,
  srcH,
  {
    stageW = CANVAS_WIDTH,
    canvasH = CANVAS_HEIGHT,
    zoom = 1,
    fit = 'cover'
  } = {}
) {
  if (!srcW || !srcH) {
    return { x: 0, y: 0, w: stageW, h: canvasH }
  }

  const z = Math.max(1, Number(zoom) || 1)

  if (fit === 'stretch') {
    return { x: 0, y: 0, w: stageW, h: canvasH }
  }

  const base =
    fit === 'contain'
      ? Math.min(stageW / srcW, canvasH / srcH)
      : Math.max(stageW / srcW, canvasH / srcH)
  const scale = base * z
  const w = srcW * scale
  const h = srcH * scale
  const x = (stageW - w) / 2
  // Prefer bottom: keeps floors visible when cropping tall art / zooming.
  const y = canvasH - h
  return { x, y, w, h }
}

export function stageBackdropZoom(stage) {
  const z = Number(stage?.bgZoom ?? stage?.meta?.bgZoom)
  return Number.isFinite(z) && z >= 1 ? z : 1
}
