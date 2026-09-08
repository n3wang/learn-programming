import { EventBus } from '../state/EventBus.js'

// The Test Range debug readout: dummy attack stats + reach + last-hit text.
export class TestReadoutPanel {
  constructor(scene, x, y) {
    this.text = scene.add.text(x, y, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      lineSpacing: 10
    })
    this.lastHitText = 'Last hit: none'

    this.onHit = (text) => {
      this.lastHitText = text
      this.render()
    }
    EventBus.on('test-hit-text', this.onHit)
  }

  setFighter(fighter) {
    this.fighter = fighter
    this.lastHitText = 'Last hit: none'
    this.render()
  }

  render() {
    if (!this.fighter) return
    const damage = this.fighter.combat.kit.attackDamage
    const reach = this.fighter.combat.baseAttackBox.hitWidth
    this.text.setText(
      'Test dummy\n' +
        'Attack 1: ' +
        damage.attack1 +
        '   Attack 2: ' +
        damage.attack2 +
        '\nReach: ' +
        reach +
        'px\n' +
        this.lastHitText
    )
  }

  destroy() {
    EventBus.off('test-hit-text', this.onHit)
    this.text.destroy()
  }
}
