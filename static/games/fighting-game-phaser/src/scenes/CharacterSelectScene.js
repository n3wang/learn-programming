import { CHARACTERS, rosterIds, getCharacter, randomCharacterId } from '../data/characters.js'
import { STAGES, stageThumbKey } from '../data/stages.js'
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
  if (character.skills.lockDirection) names.push('Lock')
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
const MAP_PAGE_SIZE = 3
const MAP_SPACING = 150
const ROSTER_PAGE_SIZE = 6
const ROSTER_COLS = 2
const ROSTER_ROWS = 3
const ROSTER_GAP_X = 92
const ROSTER_GAP_Y = 92

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

function pageCount(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize))
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
    this.mapCards = []
    this.mapPage = 0
    this.rosterPage = { p1: 0, p2: 0 }
    this.rosterIds = rosterIds()

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

    this.buildMapPicker()
    this.buildRosters()
    this.buildStatsPanels()
    this.buildButtons()
    this.refresh()
  }

  buildMapPicker() {
    const y = 118
    const startX = CANVAS_WIDTH / 2 - ((MAP_PAGE_SIZE - 1) * MAP_SPACING) / 2

    this.mapPrevBtn = createButton(this, startX - 100, y, 44, 40, '<', () => {
      this.mapPage = Math.max(0, this.mapPage - 1)
      this.refreshMapPicker()
    })
    this.mapNextBtn = createButton(this, startX + (MAP_PAGE_SIZE - 1) * MAP_SPACING + 100, y, 44, 40, '>', () => {
      this.mapPage = Math.min(pageCount(STAGES.length, MAP_PAGE_SIZE) - 1, this.mapPage + 1)
      this.refreshMapPicker()
    })

    STAGES.forEach((stage, index) => {
      const slot = index % MAP_PAGE_SIZE
      const x = startX + slot * MAP_SPACING
      const container = this.add.container(x, y)
      const border = this.add
        .rectangle(0, 0, 128, 72, 0x000000, 0)
        .setStrokeStyle(4, GameState.stageId === stage.id ? 0xfacc15 : 0xffffff)
      const thumb = this.add.image(0, 0, stageThumbKey(stage.id)).setDisplaySize(120, 68)
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
      this.mapCards.push({ stage, index, border, container })
    })

    // Jump to the page that contains the current stage.
    const selectedIndex = STAGES.findIndex((stage) => stage.id === GameState.stageId)
    if (selectedIndex >= 0) this.mapPage = Math.floor(selectedIndex / MAP_PAGE_SIZE)
    this.refreshMapPicker()
  }

  refreshMapPicker() {
    const pages = pageCount(STAGES.length, MAP_PAGE_SIZE)
    this.mapPage = Phaser.Math.Clamp(this.mapPage, 0, pages - 1)

    this.mapCards.forEach(({ stage, index, border, container }) => {
      const onPage = Math.floor(index / MAP_PAGE_SIZE) === this.mapPage
      container.setVisible(onPage)
      if (onPage) {
        border.setInteractive({ useHandCursor: true })
        border.setStrokeStyle(4, GameState.stageId === stage.id ? 0xfacc15 : 0xffffff)
      } else {
        border.disableInteractive()
      }
    })

    this.mapPrevBtn.setVisibleButton(pages > 1)
    this.mapNextBtn.setVisibleButton(pages > 1)
    this.mapPrevBtn.list[0].setAlpha(this.mapPage > 0 ? 1 : 0.35)
    this.mapNextBtn.list[0].setAlpha(this.mapPage < pages - 1 ? 1 : 0.35)
  }

  rosterSlotPosition(side, slot) {
    const col = slot % ROSTER_COLS
    const row = Math.floor(slot / ROSTER_COLS)
    if (side === 'p1') {
      return { x: 70 + col * ROSTER_GAP_X, y: 185 + row * ROSTER_GAP_Y }
    }
    return {
      x: CANVAS_WIDTH - 70 - (ROSTER_COLS - 1 - col) * ROSTER_GAP_X,
      y: 185 + row * ROSTER_GAP_Y
    }
  }

  buildRosters() {
    this.rosterIds.forEach((id, index) => {
      const slot = index % ROSTER_PAGE_SIZE
      const p1Pos = this.rosterSlotPosition('p1', slot)
      const p2Pos = this.rosterSlotPosition('p2', slot)

      this.cardsP1.push({
        index,
        card: new PortraitCard(this, p1Pos.x, p1Pos.y, getCharacter(id), 'p1', {
          selected: GameState.p1Character === id,
          onSelect: (charId) => this.selectCharacter('p1', charId),
          onHover: (charId) => this.setHover('p1', charId)
        })
      })
      this.cardsP2.push({
        index,
        card: new PortraitCard(this, p2Pos.x, p2Pos.y, getCharacter(id), 'p2', {
          selected: GameState.p2Character === id,
          onSelect: (charId) => this.selectCharacter('p2', charId),
          onHover: (charId) => this.setHover('p2', charId)
        })
      })
    })

    const arrowY = 152
    this.rosterPrevP1 = createButton(this, 70, arrowY, 44, 32, '<', () => this.shiftRosterPage('p1', -1))
    this.rosterNextP1 = createButton(this, 70 + ROSTER_GAP_X, arrowY, 44, 32, '>', () =>
      this.shiftRosterPage('p1', 1)
    )
    this.rosterPrevP2 = createButton(this, CANVAS_WIDTH - 70 - ROSTER_GAP_X, arrowY, 44, 32, '<', () =>
      this.shiftRosterPage('p2', -1)
    )
    this.rosterNextP2 = createButton(this, CANVAS_WIDTH - 70, arrowY, 44, 32, '>', () =>
      this.shiftRosterPage('p2', 1)
    )

    this.ensureRosterPageShows('p1', GameState.p1Character)
    this.ensureRosterPageShows('p2', GameState.p2Character)
    this.refreshRosterPages()
  }

  shiftRosterPage(side, delta) {
    const pages = pageCount(this.rosterIds.length, ROSTER_PAGE_SIZE)
    this.rosterPage[side] = Phaser.Math.Clamp(this.rosterPage[side] + delta, 0, pages - 1)
    this.refreshRosterPages()
  }

  ensureRosterPageShows(side, characterId) {
    const index = this.rosterIds.indexOf(characterId)
    if (index < 0) return
    this.rosterPage[side] = Math.floor(index / ROSTER_PAGE_SIZE)
  }

  refreshRosterPages() {
    const pages = pageCount(this.rosterIds.length, ROSTER_PAGE_SIZE)

    const apply = (entries, side) => {
      const page = Phaser.Math.Clamp(this.rosterPage[side], 0, pages - 1)
      this.rosterPage[side] = page
      entries.forEach(({ index, card }) => {
        const onPage = Math.floor(index / ROSTER_PAGE_SIZE) === page
        card.setVisible(onPage)
        card.setSelected(
          card.character.id === (side === 'p1' ? GameState.p1Character : GameState.p2Character)
        )
      })
    }

    apply(this.cardsP1, 'p1')
    apply(this.cardsP2, 'p2')

    const showArrows = pages > 1
    ;[
      [this.rosterPrevP1, this.rosterPage.p1 > 0],
      [this.rosterNextP1, this.rosterPage.p1 < pages - 1],
      [this.rosterPrevP2, this.rosterPage.p2 > 0],
      [this.rosterNextP2, this.rosterPage.p2 < pages - 1]
    ].forEach(([btn, enabled]) => {
      btn.setVisibleButton(showArrows)
      btn.list[0].setAlpha(enabled ? 1 : 0.35)
    })
  }

  buildStatsPanels() {
    const panelWidth = 280
    const panelHeight = 150
    const innerWidth = panelWidth - 24
    this.statsInnerWidth = innerWidth

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
    createButton(this, centerX, 280, 260, 40, 'Random Characters', () => {
      GameState.p1Character = randomCharacterId()
      GameState.p2Character = randomCharacterId()
      this.hoverStats = { p1: null, p2: null }
      this.ensureRosterPageShows('p1', GameState.p1Character)
      this.ensureRosterPageShows('p2', GameState.p2Character)
      this.refresh()
    })
    createButton(this, centerX, 330, 260, 40, 'Start', () => {
      GameState.mode = 'match'
      this.scene.start('Fight')
    })
    createButton(this, centerX, 380, 260, 40, 'Test Range', () => {
      GameState.mode = 'test'
      this.scene.start('Fight')
    })
    createButton(this, centerX, 430, 260, 40, 'Controls', () => {
      this.scene.launch('Controls')
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
    this.refreshRosterPages()
    this.refreshMapPicker()
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
