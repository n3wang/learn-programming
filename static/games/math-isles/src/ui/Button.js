import { FONT } from '../config/gameConfig.js'

// Bordered label button that can be disabled or marked selected.
export function createButton(scene, x, y, width, height, label, onClick, { fontSize = 16 } = {}) {
  const container = scene.add.container(x, y)
  const bg = scene.add.rectangle(0, 0, width, height, 0x0f172a).setStrokeStyle(3, 0xffffff)
  const text = scene.add
    .text(0, 0, label, { fontFamily: FONT, fontSize: fontSize + 'px', color: '#ffffff', align: 'center' })
    .setOrigin(0.5)
  container.add([bg, text])
  container.setSize(width, height)

  let enabled = true
  let selected = false
  const paint = (hover = false) => {
    bg.setFillStyle(selected ? 0x1d4ed8 : hover && enabled ? 0x1e293b : 0x0f172a)
    container.setAlpha(enabled ? 1 : 0.4)
  }

  bg.setInteractive({ useHandCursor: true })
  bg.on('pointerover', () => paint(true))
  bg.on('pointerout', () => paint(false))
  bg.on('pointerdown', () => {
    if (enabled) onClick()
  })

  container.setLabel = (value) => text.setText(value)
  container.setEnabled = (value) => {
    enabled = value
    paint()
  }
  container.setSelected = (value) => {
    selected = value
    paint()
  }
  return container
}
