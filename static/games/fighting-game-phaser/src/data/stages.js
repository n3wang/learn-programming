import { CANVAS_WIDTH } from '../config/gameConfig.js'

export const STAGES = [
  {
    id: 'classic',
    name: 'Classic',
    imageSrc: 'img/bg/classic.png',
    shop: true,
    tracks: [{ y: 330 }]
  },
  {
    id: 'mountain',
    name: 'Mountain',
    imageSrc: 'img/bg/mountain.png',
    shop: false,
    tracks: [{ y: 330 }]
  },
  {
    id: 'arena',
    name: 'Arena',
    imageSrc: 'img/bg/arena.png',
    shop: false,
    tracks: [{ y: 320 }, { y: 280 }]
  },
  {
    id: 'town',
    name: 'Town',
    imageSrc: 'img/bg/town_wide_z3.png',
    shop: false,
    width: 3072,
    // Selector preview: crop of the far layer (castles / ridgeline).
    thumbCropX: 1024,
    tracks: [{ y: 330 }],
    layers: [
      { src: 'img/bg/town_wide_z3.png', scrollFactor: 0.45, depth: -30 },
      { src: 'img/bg/town_wide_z2.png', scrollFactor: 0.72, depth: -20 },
      { src: 'img/bg/town_wide_z1.png', scrollFactor: 1, depth: -10 }
    ]
  },
  {
    id: 'forest_night',
    name: 'Forest',
    imageSrc: 'img/bg/forest_night_z3.png',
    shop: false,
    width: 3072,
    thumbCropX: 1024,
    tracks: [{ y: 330 }],
    layers: [
      { src: 'img/bg/forest_night_z3.png', scrollFactor: 0.45, depth: -30 },
      { src: 'img/bg/forest_night_z2.png', scrollFactor: 0.72, depth: -20 },
      { src: 'img/bg/forest_night_z1.png', scrollFactor: 1, depth: -10 }
    ]
  }
]

export function stageTracks(stage) {
  return stage.tracks && stage.tracks.length ? stage.tracks : [{ y: 330 }]
}

export function stageWidth(stage) {
  return stage?.width || CANVAS_WIDTH
}

export function stageThumbKey(stageId) {
  return 'stage_' + stageId + '_thumb'
}

export function getStage(id) {
  return STAGES.find((stage) => stage.id === id) || STAGES[0]
}

export function randomStage() {
  return STAGES[Math.floor(Math.random() * STAGES.length)]
}
