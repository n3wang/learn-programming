import { CHARACTERS, rosterIds, getCharacter, randomCharacterId } from '../data/characters.js'
import { STAGES } from '../data/stages.js'
import { GameState } from '../state/GameState.js'
import { PortraitCard } from '../ui/PortraitCard.js'
import { createButton } from '../ui/Button.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig.js'

function specialAttackNames(character) {
  const names = []
  if (character.skills.airCombo) names.push('Drop')
  if (character.skills.dashCombo) names.push('Dash')
  if (character.skills.mirror) names.push('Mirror')
  if (character.skills.afterimage) names.push('Image')
  return names
}

function attackSpeedLabel(character) {
  const frames = character.sprites.attack1.framesMax * 5
  return Math.round((60 / frames) * 10) / 10
}

function headerText(character) {
  return (
    character.name +
    '\n\nbase damage: ' +
    character.attackDamage.attack1 +
    '\nmovement speed: ' +
    character.moveSpeed +
    '\nattack speed: ' +
    attackSpeedLabel(character) +
    '\njump: ' +
    Math.abs(character.jumpVelocity)
  )
}

const STATS_FONT = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '10px',
  color: '#ffffff',
  lineSpacing: 8
}

const SPECIALS_MAX_LINES = 2

// Wraps `raw` to fit `maxWidth` using `probe`'s style, capped at `maxLines`
// lines — the last line gets trimmed down to fit with a trailing "..." if
// there would have been more content than that.
function wrapAndClamp(probe, raw, maxWidth, maxLines) {
  probe.setWordWrapWidth(maxWidth, true)
  const lines = probe.getWrappedText(raw)
  if (lines.length <= maxLines) return lines.join('\n')

  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  probe.setWordWrapWidth(null)
  while (last.length > 0) {
    probe.setText(last + '...')
    if (probe.width <= maxWidth) break
    last = last.slice(0, -1).trimEnd()
  }
  kept[maxLines - 1] = last + '...'
  return kept.join('\n')
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
    const innerWidth = panelWidth - 24
    this.statsInnerWidth = innerWidth

    // Off-screen, invisible — used only to measure/wrap text (see wrapAndClamp).
    this.textProbe = this.add.text(0, 0, '', STATS_FONT).setVisible(false)

    const p1X = 24
    const p1Y = CANVAS_HEIGHT - 24 - panelHeight
    this.statsP1Bg = this.add
      .rectangle(p1X, p1Y, panelWidth, panelHeight, 0x000000, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(4, 0xef4444)
    this.statsP1 = this.add.text(p1X + 12, p1Y + 10, '', STATS_FONT)
    this.specialsP1 = this.add.text(p1X + 12, p1Y + panelHeight - 24, '', STATS_FONT)

    const p2X = CANVAS_WIDTH - 24 - panelWidth
    const p2Y = CANVAS_HEIGHT - 24 - panelHeight
    this.statsP2Bg = this.add
      .rectangle(p2X, p2Y, panelWidth, panelHeight, 0x000000, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(4, 0x3b82f6)
    this.statsP2 = this.add.text(p2X + 12, p2Y + 10, '', STATS_FONT)
    this.specialsP2 = this.add.text(p2X + 12, p2Y + panelHeight - 34, '', STATS_FONT)
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
    this.statsP1.setText(headerText(CHARACTERS[p1Id]))
    this.statsP2.setText(headerText(CHARACTERS[p2Id]))
    this.specialsP1.setText(
      wrapAndClamp(this.textProbe, specialAttackNames(CHARACTERS[p1Id]).join(', '), this.statsInnerWidth, SPECIALS_MAX_LINES)
    )
    this.specialsP2.setText(
      wrapAndClamp(this.textProbe, specialAttackNames(CHARACTERS[p2Id]).join(', '), this.statsInnerWidth, SPECIALS_MAX_LINES)
    )
  }
}
