import { CHARACTERS, rosterIds } from '../data/characters.js'
import { STAGES, stageThumbKey } from '../data/stages.js'
import { ANIMATION_POLICY, FRAME_RATE, animKey } from '../data/animationDefs.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'
import { GameState } from '../state/GameState.js'

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
        const key = animKey(characterId, action)
        if (this.anims.exists(key)) this.anims.remove(key)
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(key, {
            start: 0,
            end: sprite.framesMax - 1
          }),
          frameRate: FRAME_RATE,
          repeat: policy.repeat
        })
      }
    })

    if (!this.anims.exists('shop_idle')) {
      this.anims.create({
        key: 'shop_idle',
        frames: this.anims.generateFrameNumbers('shop', { start: 0, end: 5 }),
        frameRate: FRAME_RATE,
        repeat: -1
      })
    }

    this.bakeStageThumbs()

    if (!CHARACTERS[GameState.p1Character]) GameState.p1Character = 'samurai'
    if (!CHARACTERS[GameState.p2Character]) GameState.p2Character = 'kenji'
    if (!STAGES.some((stage) => stage.id === GameState.stageId)) {
      GameState.stageId = STAGES[0].id
    }

    if (GameState.skipSelect) {
      GameState.mode = 'test'
      this.scene.start('Fight')
    } else {
      this.scene.start('CharacterSelect')
    }
  }

  bakeStageThumbs() {
    STAGES.forEach((stage) => {
      const sourceKey =
        stage.layers && stage.layers.length ? 'stage_' + stage.id + '_layer0' : 'stage_' + stage.id
      if (!this.textures.exists(sourceKey)) return
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
