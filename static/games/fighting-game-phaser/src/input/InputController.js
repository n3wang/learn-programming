// Backed by real keyboard keys. Exposes pollIntent(), read once per fighter
// per frame from FightScene.update(). "moveDir" replicates the original's
// last-key-pressed-wins tie-break: whichever of left/right was pressed most
// recently wins, and stays in effect even if the other key is also held,
// until that key is released (it does not fall back to the other held key).
export class InputController {
  constructor(scene, bindings) {
    const kb = scene.input.keyboard
    this.left = kb.addKey(bindings.left)
    this.right = kb.addKey(bindings.right)
    this.jump = kb.addKey(bindings.jump)
    this.attack = kb.addKey(bindings.attack)
    this.lastKey = null // 'left' | 'right' | null

    this.left.on('down', () => {
      this.lastKey = 'left'
    })
    this.right.on('down', () => {
      this.lastKey = 'right'
    })
  }

  pollIntent() {
    let moveDir = 0
    if (this.lastKey === 'left' && this.left.isDown) moveDir = -1
    else if (this.lastKey === 'right' && this.right.isDown) moveDir = 1

    return {
      moveDir,
      leftIsDown: this.left.isDown,
      rightIsDown: this.right.isDown,
      leftJustDown: Phaser.Input.Keyboard.JustDown(this.left),
      rightJustDown: Phaser.Input.Keyboard.JustDown(this.right),
      jumpJustDown: Phaser.Input.Keyboard.JustDown(this.jump),
      attackJustDown: Phaser.Input.Keyboard.JustDown(this.attack)
    }
  }

  reset() {
    this.lastKey = null
  }
}
