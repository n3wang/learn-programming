import { loadRemoteCatalog, applyLaunchQuery } from '../data/remoteCatalog.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  async create() {
    // Soft-fail: built-ins always work if the classroom API is down.
    await loadRemoteCatalog({ timeoutMs: 2000 })
    applyLaunchQuery()
    this.scene.start('Preload')
  }
}
