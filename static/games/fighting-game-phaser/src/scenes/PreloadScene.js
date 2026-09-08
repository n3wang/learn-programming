import { CHARACTERS, rosterIds } from '../data/characters.js'
import { STAGES } from '../data/stages.js'
import { ANIMATION_POLICY, FRAME_RATE, animKey } from '../data/animationDefs.js'

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

    STAGES.forEach((stage) => this.load.image('stage_' + stage.id, stage.imageSrc))
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

    this.scene.start('CharacterSelect')
  }
}
