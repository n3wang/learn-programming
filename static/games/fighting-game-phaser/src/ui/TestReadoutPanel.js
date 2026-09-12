import { EventBus } from '../state/EventBus.js'
import { UI, UI_FONT } from './strings.js'

// The Test Range debug readout: dummy attack stats + reach + last-hit text.
export class TestReadoutPanel {
  constructor(scene, x, y) {
    this.text = scene.add.text(x, y, '', {
      fontFamily: UI_FONT,
      fontSize: '14px',
      color: '#ffffff',
      lineSpacing: 8
    })
    this.lastHitText = UI.lastHitNone

    this.onHit = (text) => {
      this.lastHitText = text
      this.render()
    }
    EventBus.on('test-hit-text', this.onHit)
  }

  setFighter(fighter) {
    this.fighter = fighter
    this.lastHitText = UI.lastHitNone
    this.render()
  }

  render() {
    if (!this.fighter) return
    const damage = this.fighter.combat.kit.attackDamage
    const reach = this.fighter.combat.baseAttackBox.hitWidth
    let damageLine =
      UI.attack1 + ': ' + damage.attack1 + '   ' + UI.attack2 + ': ' + damage.attack2
    if (damage.attack3 != null) {
      damageLine += '   ' + UI.attack3 + ': ' + damage.attack3
    }
    this.text.setText(
      UI.testDummy +
        '\n' +
        damageLine +
        '\n' +
        UI.reach +
        ': ' +
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
