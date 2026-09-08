// Single shared emitter used for cross-scene, per-frame signals. Scenes
// subscribe in create() and unsubscribe on the 'shutdown'/'destroy' event to
// avoid leaking listeners across restarts.
export const EventBus = new Phaser.Events.EventEmitter()
