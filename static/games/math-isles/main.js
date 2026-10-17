import { MenuScene } from './src/scenes/MenuScene.js'
import { GameScene } from './src/scenes/GameScene.js'
import { MathScene } from './src/scenes/MathScene.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './src/config/gameConfig.js'

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#0b1220',
  scene: [MenuScene, GameScene, MathScene]
})
