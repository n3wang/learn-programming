// Auto-crops a 72x72 head-and-shoulders portrait out of a character's idle
// spritesheet by alpha-scanning its first frame — same approach as the
// original's cropIdlePortrait, just reading from an already-loaded Phaser
// texture instead of a freshly-loaded Image. Registers the crop as a new
// Phaser canvas texture (memoized) so callers just get a texture key back.
export function getPortraitTextureKey(scene, characterId, spriteKey, framesMax) {
  const textureKey = 'portrait_' + characterId
  if (scene.textures.exists(textureKey)) return textureKey

  const source = scene.textures.get(spriteKey).getSourceImage()
  const frameWidth = source.width / framesMax
  const frameHeight = source.height

  const scan = document.createElement('canvas')
  scan.width = frameWidth
  scan.height = frameHeight
  const scanCtx = scan.getContext('2d')
  scanCtx.drawImage(source, 0, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)
  const pixels = scanCtx.getImageData(0, 0, frameWidth, frameHeight).data

  let minX = frameWidth
  let minY = frameHeight
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < frameHeight; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (pixels[(y * frameWidth + x) * 4 + 3] < 16) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX) {
    minX = 0
    minY = 0
    maxX = frameWidth - 1
    maxY = Math.floor(frameHeight * 0.45)
  }

  const spriteWidth = maxX - minX + 1
  const spriteHeight = maxY - minY + 1
  const headHeight = Math.max(24, Math.round(spriteHeight * 0.55))

  const portrait = document.createElement('canvas')
  portrait.width = 72
  portrait.height = 72
  const portraitCtx = portrait.getContext('2d')
  portraitCtx.imageSmoothingEnabled = false
  portraitCtx.drawImage(source, minX, minY, spriteWidth, headHeight, 8, 6, 56, 56)

  scene.textures.addCanvas(textureKey, portrait)
  return textureKey
}
