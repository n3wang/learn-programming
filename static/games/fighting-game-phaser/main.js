import { BootScene } from './src/scenes/BootScene.js'
import { PreloadScene } from './src/scenes/PreloadScene.js'
import { CharacterSelectScene } from './src/scenes/CharacterSelectScene.js'
import { FightScene } from './src/scenes/FightScene.js'
import { UIScene } from './src/scenes/UIScene.js'
import { PauseScene } from './src/scenes/PauseScene.js'
import { ResultScene } from './src/scenes/ResultScene.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './src/config/gameConfig.js'

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#000000',
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scene: [BootScene, PreloadScene, CharacterSelectScene, FightScene, UIScene, PauseScene, ResultScene]
})
