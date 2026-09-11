import { CHARACTERS, rosterIds } from '../data/characters.js'
import { STAGES, stageThumbKey } from '../data/stages.js'
import { ANIMATION_POLICY, FRAME_RATE, animKey } from '../data/animationDefs.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload() {
    rosterIds().forEach((characterId) => {
      const character = CHARACTERS[characterId]
      for (const action in character.sprites) {
        const sprite = character.sprites[action]
        this.load.spritesheet(animKey(characterId, action), sprite.imageSrc, {
          frameWidth: sprite.frameWidth,
          frameHeight: sprite.frameHeight
        })
      }
    })

    STAGES.forEach((stage) => {
      this.load.image('stage_' + stage.id, stage.imageSrc)
      ;(stage.layers || []).forEach((layer, index) => {
        this.load.image('stage_' + stage.id + '_layer' + index, layer.src)
      })
    })
    this.load.image('background', 'img/background.png')
    this.load.spritesheet('shop', 'img/shop.png', { frameWidth: 118, frameHeight: 128 })
  }

  create() {
    rosterIds().forEach((characterId) => {
      const character = CHARACTERS[characterId]
      for (const action in character.sprites) {
        const sprite = character.sprites[action]
        const policy = ANIMATION_POLICY[action]
        this.anims.create({
          key: animKey(characterId, action),
          frames: this.anims.generateFrameNumbers(animKey(characterId, action), {
            start: 0,
            end: sprite.framesMax - 1
          }),
          frameRate: FRAME_RATE,
          repeat: policy.repeat
        })
      }
    })

    this.anims.create({
      key: 'shop_idle',
      frames: this.anims.generateFrameNumbers('shop', { start: 0, end: 5 }),
      frameRate: FRAME_RATE,
      repeat: -1
    })

    this.bakeStageThumbs()
    this.scene.start('CharacterSelect')
  }

  // Selector previews use a fixed screen-sized crop of the far layer (or the
  // single stage image) so wide panoramas aren't squashed into the thumb.
  bakeStageThumbs() {
    STAGES.forEach((stage) => {
      const sourceKey =
        stage.layers && stage.layers.length ? 'stage_' + stage.id + '_layer0' : 'stage_' + stage.id
      const source = this.textures.get(sourceKey).getSourceImage()
      const cropW = Math.min(CANVAS_WIDTH, source.width)
      const cropH = Math.min(CANVAS_HEIGHT, source.height)
      const maxX = Math.max(0, source.width - cropW)
      const cropX =
        stage.thumbCropX != null ? Phaser.Math.Clamp(stage.thumbCropX, 0, maxX) : Math.floor(maxX / 2)

      const thumbKey = stageThumbKey(stage.id)
      if (this.textures.exists(thumbKey)) this.textures.remove(thumbKey)
      const canvasTexture = this.textures.createCanvas(thumbKey, cropW, cropH)
      canvasTexture.getContext().drawImage(source, cropX, 0, cropW, cropH, 0, 0, cropW, cropH)
      canvasTexture.refresh()
    })
  }
}
