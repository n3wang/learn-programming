// A reusable bordered button + centered label (CJK-capable font).
import { UI_FONT } from './strings.js'

export function createButton(scene, x, y, width, height, label, onClick) {
  const container = scene.add.container(x, y)
  const bg = scene.add.rectangle(0, 0, width, height, 0x000000).setStrokeStyle(4, 0xffffff)
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: UI_FONT,
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 20 }
    })
    .setOrigin(0.5, 0.5)
  container.add([bg, text])
  container.setSize(width, height)
  bg.setInteractive({ useHandCursor: true })
  bg.on('pointerover', () => bg.setFillStyle(0x1f2937))
  bg.on('pointerout', () => bg.setFillStyle(0x000000))
  bg.on('pointerdown', () => onClick())

  container.setLabel = (value) => text.setText(value)
  container.setVisibleButton = (value) => container.setVisible(value)
  return container
}
