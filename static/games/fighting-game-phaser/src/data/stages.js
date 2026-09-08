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
    tracks: [{ y: 330 }, { y: 168 }]
  }
]

export function stageTracks(stage) {
  return stage.tracks && stage.tracks.length ? stage.tracks : [{ y: 330 }]
}

export function getStage(id) {
  return STAGES.find((stage) => stage.id === id) || STAGES[0]
}

export function randomStage() {
  return STAGES[Math.floor(Math.random() * STAGES.length)]
}
