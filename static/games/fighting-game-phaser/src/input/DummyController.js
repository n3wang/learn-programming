// Same pollIntent() interface as InputController, always "do nothing" —
// drives the Test Range enemy so FighterCombat stays fully agnostic to
// whether it's fed by a human or a dummy.
export class DummyController {
  pollIntent() {
    return {
      moveDir: 0,
      leftIsDown: false,
      rightIsDown: false,
      leftJustDown: false,
      rightJustDown: false,
      jumpJustDown: false,
      attackJustDown: false
    }
  }

  reset() {}
}
