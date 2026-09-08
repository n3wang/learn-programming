import { getPortraitTextureKey } from './PortraitCropper.js'
import { animKey } from '../data/animationDefs.js'

const SIDE_COLOR = { p1: 0xef4444, p2: 0x3b82f6 }

// A single roster portrait card: cropped headshot + selection underline.
// Click selects, hover reports stats via onHover(id|null).
export class PortraitCard {
  constructor(scene, x, y, character, side, { selected, onSelect, onHover }) {
    this.scene = scene
    this.character = character
    this.side = side

    const textureKey = getPortraitTextureKey(
      scene,
      character.id,
      animKey(character.id, 'idle'),
      character.sprites.idle.framesMax
    )

    this.container = scene.add.container(x, y)
    this.border = scene.add
      .rectangle(0, 0, 80, 80)
      .setStrokeStyle(4, selected ? SIDE_COLOR[side] : 0xffffff)
    this.portrait = scene.add.image(0, -4, textureKey)
    this.mark = scene.add.rectangle(0, 34, 56, 8, selected ? SIDE_COLOR[side] : 0x000000, selected ? 1 : 0)
    this.container.add([this.border, this.portrait, this.mark])
    this.container.setSize(80, 80)

    this.border.setInteractive({ useHandCursor: true })
    this.border.on('pointerdown', () => onSelect(character.id))
    this.border.on('pointerover', () => onHover(character.id))
    this.border.on('pointerout', () => onHover(null))
  }

  setSelected(selected) {
    const color = selected ? SIDE_COLOR[this.side] : 0xffffff
    this.border.setStrokeStyle(4, color)
    this.mark.setFillStyle(selected ? SIDE_COLOR[this.side] : 0x000000, selected ? 1 : 0)
  }

  destroy() {
    this.container.destroy()
  }
}
