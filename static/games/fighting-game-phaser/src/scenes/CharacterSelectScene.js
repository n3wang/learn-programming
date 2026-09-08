import { CHARACTERS, rosterIds, getCharacter, randomCharacterId } from '../data/characters.js'
import { STAGES } from '../data/stages.js'
import { GameState } from '../state/GameState.js'
import { PortraitCard } from '../ui/PortraitCard.js'
import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

function specialAttackNames(character) {
  const names = []
  if (character.skills.airCombo) names.push('Air drop')
  if (character.skills.dashCombo) names.push('Dash')
  if (character.skills.mirror) names.push('Mirror')
  if (character.skills.afterimage) names.push('Afterimage')
  return names
}

function attackSpeedLabel(character) {
  const frames = character.sprites.attack1.framesMax * 5
  return Math.round((60 / frames) * 10) / 10
}

function statsText(character) {
  const specials = specialAttackNames(character)
  return (
    character.name +
    '\n\nbase damage: ' +
    character.attackDamage.attack1 +
    '\nmovement speed: ' +
    character.moveSpeed +
    '\nattack speed: ' +
    attackSpeedLabel(character) +
    '\njump: ' +
    Math.abs(character.jumpVelocity) +
    '\nspecials: ' +
    specials.join(', ')
  )
}

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect')
  }

  create() {
    GameState.mode = 'match'
    this.hoverStats = { p1: null, p2: null }
    this.cardsP1 = []
    this.cardsP2 = []

    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x111111).setOrigin(0, 0)
    this.add
      .text(CANVAS_WIDTH / 2, 34, 'Choose Fighters', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)

    this.pickerRow = this.add
      .text(CANVAS_WIDTH / 2, 66, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5, 0.5)

    this.buildRosters()
    this.buildMapPicker()
    this.buildStatsPanels()
    this.buildButtons()
    this.refresh()
  }

  buildRosters() {
    const ids = rosterIds()
    const startY = 130
    const gap = 96
    ids.forEach((id, index) => {
      const y = startY + index * gap
      this.cardsP1.push(
        new PortraitCard(this, 96, y, getCharacter(id), 'p1', {
          selected: GameState.p1Character === id,
          onSelect: (charId) => this.selectCharacter('p1', charId),
          onHover: (charId) => this.setHover('p1', charId)
        })
      )
      this.cardsP2.push(
        new PortraitCard(this, CANVAS_WIDTH - 96, y, getCharacter(id), 'p2', {
          selected: GameState.p2Character === id,
          onSelect: (charId) => this.selectCharacter('p2', charId),
          onHover: (charId) => this.setHover('p2', charId)
        })
      )
    })
  }

  buildMapPicker() {
    this.mapCards = []
    const startX = CANVAS_WIDTH / 2 - ((STAGES.length - 1) * 150) / 2
    STAGES.forEach((stage, index) => {
      const x = startX + index * 150
      const y = 170
      const container = this.add.container(x, y)
      const border = this.add
        .rectangle(0, 0, 128, 72, 0x000000, 0)
        .setStrokeStyle(4, GameState.stageId === stage.id ? 0xfacc15 : 0xffffff)
      const thumb = this.add.image(0, 0, 'stage_' + stage.id).setDisplaySize(120, 68)
      const label = this.add
        .text(0, 46, stage.name, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#ffffff'
        })
        .setOrigin(0.5, 0.5)
      container.add([thumb, border, label])
      border.setInteractive({ useHandCursor: true })
      border.on('pointerdown', () => {
        GameState.stageId = stage.id
        this.refreshMapPicker()
      })
      this.mapCards.push({ stage, border })
    })
  }

  refreshMapPicker() {
    this.mapCards.forEach(({ stage, border }) => {
      border.setStrokeStyle(4, GameState.stageId === stage.id ? 0xfacc15 : 0xffffff)
    })
  }

  buildStatsPanels() {
    const panelWidth = 280
    const panelHeight = 150
    this.statsP1Bg = this.add
      .rectangle(24, CANVAS_HEIGHT - 24 - panelHeight, panelWidth, panelHeight, 0x000000, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(4, 0xef4444)
    this.statsP1 = this.add.text(24 + 12, CANVAS_HEIGHT - 24 - panelHeight + 10, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      lineSpacing: 8
    })

    this.statsP2Bg = this.add
      .rectangle(
        CANVAS_WIDTH - 24 - panelWidth,
        CANVAS_HEIGHT - 24 - panelHeight,
        panelWidth,
        panelHeight,
        0x000000,
        0.82
      )
      .setOrigin(0, 0)
      .setStrokeStyle(4, 0x3b82f6)
    this.statsP2 = this.add.text(
      CANVAS_WIDTH - 24 - panelWidth + 12,
      CANVAS_HEIGHT - 24 - panelHeight + 10,
      '',
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffffff',
        lineSpacing: 8
      }
    )
  }

  buildButtons() {
    const centerX = CANVAS_WIDTH / 2
    createButton(this, centerX, 300, 260, 40, 'Random Characters', () => {
      GameState.p1Character = randomCharacterId()
      GameState.p2Character = randomCharacterId()
      this.hoverStats = { p1: null, p2: null }
      this.refresh()
    })
    createButton(this, centerX, 350, 260, 40, 'Start', () => {
      GameState.mode = 'match'
      this.scene.start('Fight')
    })
    createButton(this, centerX, 400, 260, 40, 'Test Range', () => {
      GameState.mode = 'test'
      this.scene.start('Fight')
    })
  }

  selectCharacter(side, id) {
    if (side === 'p1') GameState.p1Character = id
    else GameState.p2Character = id
    this.hoverStats[side] = null
    this.refresh()
  }

  setHover(side, id) {
    this.hoverStats[side] = id
    this.refreshStats()
  }

  refresh() {
    this.cardsP1.forEach((card) => card.setSelected(card.character.id === GameState.p1Character))
    this.cardsP2.forEach((card) => card.setSelected(card.character.id === GameState.p2Character))
    this.pickerRow.setText(
      'P1: ' + CHARACTERS[GameState.p1Character].name + '    P2: ' + CHARACTERS[GameState.p2Character].name
    )
    this.refreshStats()
  }

  refreshStats() {
    const p1Id = this.hoverStats.p1 || GameState.p1Character
    const p2Id = this.hoverStats.p2 || GameState.p2Character
    this.statsP1.setText(statsText(CHARACTERS[p1Id]))
    this.statsP2.setText(statsText(CHARACTERS[p2Id]))
  }
}
