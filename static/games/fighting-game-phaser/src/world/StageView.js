import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_FIGHTER_SEPARATION,
  CAMERA_FOLLOW_RATE,
  CAMERA_EDGE_PADDING
} from '../config/gameConfig.js'
import { stageWidth } from '../data/stages.js'
import { clampToStage } from '../combat/geometry.js'
import { layoutStageBackdrop, stageBackdropZoom } from './stageBackdrop.js'

// Builds the stage backdrop (single image or parallax stack) and keeps the
// camera locked to the fighters' midpoint on wide maps.
export class StageView {
  constructor(scene, stage) {
    this.scene = scene
    this.stage = stage
    this.width = stageWidth(stage)
    this.scrollX = 0

    // Letterbox fill behind cropped / contained art.
    scene.add.rectangle(0, 0, this.width, CANVAS_HEIGHT, 0x111111).setOrigin(0, 0).setDepth(-40)

    const zoom = stageBackdropZoom(stage)
    const fit = stage.fit || 'cover'

    if (stage.layers && stage.layers.length) {
      stage.layers.forEach((layer, index) => {
        const key = 'stage_' + stage.id + '_layer' + index
        const image = this.placeBackdrop(scene, key, zoom, fit, layer.depth ?? index - 30)
        image.setScrollFactor(layer.scrollFactor, 1)
        if (layer.alpha != null) image.setAlpha(layer.alpha)
        if (layer.tint != null) image.setTint(layer.tint)
      })
    } else {
      this.placeBackdrop(scene, 'stage_' + stage.id, zoom, fit, -10)
    }

    if (stage.shop) {
      scene.add.sprite(600, 128, 'shop').setOrigin(0, 0).setScale(2.75).setDepth(-5).play('shop_idle')
    }

    scene.cameras.main.setBounds(0, 0, this.width, CANVAS_HEIGHT)
    scene.cameras.main.setScroll(0, 0)
  }

  placeBackdrop(scene, key, zoom, fit, depth) {
    const image = scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(depth)
    const src = scene.textures.exists(key) ? scene.textures.get(key).getSourceImage() : null
    const layout = layoutStageBackdrop(src?.width || this.width, src?.height || CANVAS_HEIGHT, {
      stageW: this.width,
      canvasH: CANVAS_HEIGHT,
      zoom,
      fit
    })
    image.setPosition(layout.x, layout.y)
    image.setDisplaySize(layout.w, layout.h)
    return image
  }

  updateCamera(player, enemy, dt = 1 / 60) {
    if (this.width <= CANVAS_WIDTH) {
      this.scrollX = 0
      this.scene.cameras.main.setScroll(0, 0)
      return
    }

    const mid =
      (player.position.x + player.hitWidth / 2 + enemy.position.x + enemy.hitWidth / 2) / 2
    const ideal = Phaser.Math.Clamp(mid - CANVAS_WIDTH / 2, 0, this.width - CANVAS_WIDTH)

    // Exponential ease toward the midpoint — large teleports (mirror / drop /
    // dash) trail behind instead of snapping.
    const alpha = 1 - Math.exp(-CAMERA_FOLLOW_RATE * Math.max(dt, 0))
    let next = this.scrollX + (ideal - this.scrollX) * alpha

    // Never let a fighter leave the frame while the camera is catching up.
    const pad = CAMERA_EDGE_PADDING
    const leftMost = Math.min(player.position.x, enemy.position.x)
    const rightMost = Math.max(
      player.position.x + player.hitWidth,
      enemy.position.x + enemy.hitWidth
    )
    const minScroll = Math.max(0, rightMost + pad - CANVAS_WIDTH)
    const maxScroll = Math.min(this.width - CANVAS_WIDTH, Math.max(0, leftMost - pad))
    if (minScroll <= maxScroll) {
      next = Phaser.Math.Clamp(next, minScroll, maxScroll)
    } else {
      // Fighters wider than the soft window — fall back to ideal framing.
      next = ideal
    }

    this.scrollX = next
    this.scene.cameras.main.setScroll(this.scrollX, 0)
  }

  toScreen(x, y) {
    return { x: x - this.scrollX, y: y }
  }
}

// Pulls fighters toward each other when their centers drift past maxSep,
// then re-clamps to the stage so walls win over the soft separation.
export function enforceMaxSeparation(a, b, maxSep = MAX_FIGHTER_SEPARATION) {
  const aCenter = a.position.x + a.hitWidth / 2
  const bCenter = b.position.x + b.hitWidth / 2
  const dist = Math.abs(aCenter - bCenter)
  if (dist <= maxSep) return

  const overflow = (dist - maxSep) / 2
  if (aCenter < bCenter) {
    a.position.x += overflow
    b.position.x -= overflow
  } else {
    a.position.x -= overflow
    b.position.x += overflow
  }

  clampToStage(a)
  clampToStage(b)

  // If a wall blocked one side, shove the free fighter the rest of the way.
  const aCenter2 = a.position.x + a.hitWidth / 2
  const bCenter2 = b.position.x + b.hitWidth / 2
  const dist2 = Math.abs(aCenter2 - bCenter2)
  if (dist2 <= maxSep) return

  const left = aCenter2 <= bCenter2 ? a : b
  const right = aCenter2 <= bCenter2 ? b : a
  const mid = (aCenter2 + bCenter2) / 2
  left.position.x = mid - maxSep / 2 - left.hitWidth / 2
  right.position.x = mid + maxSep / 2 - right.hitWidth / 2
  clampToStage(left)
  clampToStage(right)
}
