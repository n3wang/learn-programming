import { getPortraitTextureKey } from './PortraitCropper.js'
import { animKey } from '../data/animationDefs.js'
import { UI, UI_FONT } from './strings.js'

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
    this.author = scene.add
      .text(0, 48, character.author ? UI.by + character.author : '', {
        fontFamily: UI_FONT,
        fontSize: '10px',
        color: '#d1d5db',
        align: 'center'
      })
      .setOrigin(0.5, 0)
    this.container.add([this.border, this.portrait, this.mark, this.author])
    this.container.setSize(80, character.author ? 96 : 80)

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

  setVisible(visible) {
    this.container.setVisible(visible)
    if (!visible) this.border.disableInteractive()
    else this.border.setInteractive({ useHandCursor: true })
  }

  destroy() {
    this.container.destroy()
  }
}
