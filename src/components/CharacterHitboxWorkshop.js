/**
 * CharacterHitboxWorkshop — design iterations
 *
 * v1: Frame scrubber + “设为伤害帧” + drag rect on canvas.
 * v2: FormulaExplorer layout (preview | draggers + stats), Attack1/2 tabs,
 *     play loop, Chinese UI, localStorage draft.
 * v3: props {preset, allowUpload} for lesson 4c (fixed Brucer) → 4d (own PNGs);
 *     per-attack boxes; “试玩” writes draft for fighting-game BootScene.
 * v4: idle / run / jump tabs + point-budgeted combat stats (no attack draggers
 *     on motion tabs).
 * v5: idle size vs Kenji + decimal sizeMultiplier.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getApiBaseUrl} from '@site/src/api/classroomClient';
import styles from './fightingGameWorkshop.module.css';

const DRAFT_KEY = 'fg-character-draft-v1';
/** Multi-character saves: { entries: { [id]: draft }, activeId?: string } */
const LIBRARY_KEY = 'fg-character-library-v1';
const GAME_BASE = '/games/fighting-game-phaser';
/** Classic roster — never overwrite by name. */
const CLASSIC_NAMES = new Set(['武士', '剑士']);
const CLASSIC_IDS = new Set(['samurai', 'kenji']);
/** Same base as fighting-game DEFAULT_CHARACTER / BASE_FRAME_SIZE. */
const BASE_FRAME_SIZE = 200;
const BASE_SCALE = 2.5;
/** Kenji (剑士) on-screen frame size — student packs should stay near or below this. */
const KENJI_DRAW_H = BASE_FRAME_SIZE * BASE_SCALE; // 500
const KENJI_IDLE_SRC = `${GAME_BASE}/img/kenji/Idle.png`;
const KENJI_FRAMES_MAX = 4;
/** Fine-tune after auto-fit to 200×200; decimals allowed (e.g. 0.75). */
const SIZE_MULT_MIN = 0.4;
const SIZE_MULT_MAX = 1.2;
const SIZE_MULT_STEP = 0.05;
const DEFAULT_SIZE_MULTIPLIER = 0.85;

/**
 * Gift points on top of DEFAULT_CHARACTER bases (fighting-game characters.js).
 * + spends a point; − below 0 lowers the base and refunds a usable point.
 * For costs (`invert`), + makes the cost cheaper.
 */
export const STAT_BUDGET = 5;
/** How far below base a single stat may go (−1 → more points to spend elsewhere). */
export const STAT_MIN_POINTS = -3;

/** Mirrors DEFAULT_CHARACTER + attack1 base (attack2 = ×1.75). */
export const STAT_SPECS = {
  maxHealth: {
    label: '生命',
    base: 100,
    perPoint: 15,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    format: (v) => String(Math.round(v)),
  },
  maxStamina: {
    label: '耐力',
    base: 100,
    perPoint: 15,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    format: (v) => String(Math.round(v)),
  },
  moveSpeed: {
    label: '移动速度',
    base: 5,
    perPoint: 0.5,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    format: (v) => v.toFixed(1),
  },
  staminaRegen: {
    label: '耐力恢复',
    base: 30,
    perPoint: 5,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    format: (v) => String(Math.round(v)) + '/秒',
  },
  attackBase: {
    label: '基础攻击',
    base: 20,
    perPoint: 4,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    format: (v) => String(Math.round(v)),
  },
  jumpPower: {
    label: '跳跃高度',
    base: 16.2,
    perPoint: 1.2,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    format: (v) => v.toFixed(1),
  },
  jumpCost: {
    label: '跳跃耗耐',
    base: 10,
    perPoint: 2,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    invert: true, // + → cheaper
    format: (v) => String(Math.round(v)),
  },
  attackCost: {
    label: '攻击耗耐',
    base: 50,
    perPoint: 5,
    maxPoints: 5,
    minPoints: STAT_MIN_POINTS,
    invert: true,
    format: (v) => String(Math.round(v)),
  },
};

/** Start at base character stats — all gift points unspent. */
export const DEFAULT_STAT_POINTS = {
  maxHealth: 0,
  maxStamina: 0,
  moveSpeed: 0,
  staminaRegen: 0,
  attackBase: 0,
  jumpPower: 0,
  jumpCost: 0,
  attackCost: 0,
};

const MOTION_TABS = [
  {id: 'idle', label: '待机', kind: 'motion'},
  {id: 'run', label: '移动', kind: 'motion'},
  {id: 'jump', label: '跳跃', kind: 'motion'},
  {id: 'death', label: '死亡', kind: 'motion'},
];

const ATTACK_TAB_META = {
  attack1: {id: 'attack1', label: '攻击 1', kind: 'attack'},
  attack2: {id: 'attack2', label: '攻击 2', kind: 'attack'},
  attack3: {id: 'attack3', label: '攻击 3', kind: 'attack'},
};

/** Uniform fit so ~100px sheets match default 200×200 packs on screen. */
function displayScaleForFrame(frameWidth, frameHeight, sizeMultiplier = 1) {
  const fw = Math.max(1, Number(frameWidth) || BASE_FRAME_SIZE);
  const fh = Math.max(1, Number(frameHeight) || BASE_FRAME_SIZE);
  const mult = Number(sizeMultiplier) > 0 ? Number(sizeMultiplier) : 1;
  return BASE_SCALE * (BASE_FRAME_SIZE / Math.max(fw, fh)) * mult;
}

function clampSizeMultiplier(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return DEFAULT_SIZE_MULTIPLIER;
  return clamp(Math.round(v / SIZE_MULT_STEP) * SIZE_MULT_STEP, SIZE_MULT_MIN, SIZE_MULT_MAX);
}

function drawOffsetForFrame(frameWidth, frameHeight, scale, footY) {
  const fw = Math.max(1, Number(frameWidth) || BASE_FRAME_SIZE);
  const fh = Math.max(1, Number(frameHeight) || BASE_FRAME_SIZE);
  const fy = Number(footY) > 0 ? Number(footY) : fh;
  return {
    x: Math.round((fw * scale - 50) / 2),
    y: Math.max(0, Math.round(fy * scale - 150)),
  };
}

/** Brucer: 82×105 cells (Attack sheets 328×105 → 4 frames). */
export const BRUCER_PRESET = {
  id: 'brucer',
  name: '布鲁瑟',
  frameWidth: 82,
  frameHeight: 105,
  // Opaque feet sit near y≈72; ~33px empty pad under soles — do not use frameHeight.
  footY: 72,
  faces: 'right',
  attackKeys: ['attack1', 'attack2'],
  sprites: {
    idle: {src: `${GAME_BASE}/img/mobs/brucer/Idle.png`, framesMax: 4},
    run: {src: `${GAME_BASE}/img/mobs/brucer/Run.png`, framesMax: 8},
    jump: {src: `${GAME_BASE}/img/mobs/brucer/Jump.png`, framesMax: 2},
    fall: {src: `${GAME_BASE}/img/mobs/brucer/Fall.png`, framesMax: 2},
    attack1: {src: `${GAME_BASE}/img/mobs/brucer/Attack1.png`, framesMax: 4},
    attack2: {src: `${GAME_BASE}/img/mobs/brucer/Attack2.png`, framesMax: 4},
    takeHit: {src: `${GAME_BASE}/img/mobs/brucer/Hit.png`, framesMax: 4},
    death: {src: `${GAME_BASE}/img/mobs/brucer/Death.png`, framesMax: 4},
  },
  attacks: {
    attack1: {hitFrame: 2, box: {x: 42, y: 28, w: 36, h: 40}},
    attack2: {hitFrame: 2, box: {x: 48, y: 36, w: 32, h: 28}},
  },
};

/** Chinese hero: 126×126 cells (Idle 10 / Run 8 / Attacks 7·6·9). */
export const CHINESE_HERO_PRESET = {
  id: 'chinese_hero',
  name: '侠客',
  frameWidth: 126,
  frameHeight: 126,
  footY: 82,
  faces: 'right',
  attackKeys: ['attack1', 'attack2', 'attack3'],
  sprites: {
    idle: {src: `${GAME_BASE}/img/mobs/chinese_hero/Idle.png`, framesMax: 10},
    run: {src: `${GAME_BASE}/img/mobs/chinese_hero/Run.png`, framesMax: 8},
    jump: {src: `${GAME_BASE}/img/mobs/chinese_hero/Going Up.png`, framesMax: 3},
    fall: {src: `${GAME_BASE}/img/mobs/chinese_hero/Going Down.png`, framesMax: 3},
    attack1: {src: `${GAME_BASE}/img/mobs/chinese_hero/Attack1.png`, framesMax: 7},
    attack2: {src: `${GAME_BASE}/img/mobs/chinese_hero/Attack2.png`, framesMax: 6},
    attack3: {src: `${GAME_BASE}/img/mobs/chinese_hero/Attack3.png`, framesMax: 9},
    takeHit: {src: `${GAME_BASE}/img/mobs/chinese_hero/Take Hit.png`, framesMax: 3},
    death: {src: `${GAME_BASE}/img/mobs/chinese_hero/Death.png`, framesMax: 11},
  },
  attacks: {
    attack1: {hitFrame: 3, box: {x: 70, y: 40, w: 48, h: 50}},
    attack2: {hitFrame: 3, box: {x: 72, y: 36, w: 50, h: 48}},
    attack3: {hitFrame: 5, box: {x: 74, y: 30, w: 52, h: 55}},
  },
};

const FEMALE_KNIGHT_ASSET = `${GAME_BASE}/img/mobs/female_hero_knight`;

/**
 * Female knight: 180×180 cells. Sprites start empty — lesson 4e downloads + uploads.
 * Expected frames: Idle 11 / Run 8 / Jump·Fall 3 / Attack1·2 7 / Take Hit 4 / Death 11.
 */
export const FEMALE_HERO_KNIGHT_PRESET = {
  id: 'female_hero_knight',
  name: '女骑士',
  frameWidth: 180,
  frameHeight: 180,
  footY: 148,
  faces: 'right',
  requireUpload: true,
  attackKeys: ['attack1', 'attack2'],
  motionTabs: [
    {id: 'idle', label: '待机', kind: 'motion'},
    {id: 'run', label: '移动', kind: 'motion'},
    {id: 'jump', label: '跳跃', kind: 'motion'},
    {id: 'fall', label: '下落', kind: 'motion'},
    {id: 'takeHit', label: '受击', kind: 'motion'},
    {id: 'death', label: '死亡', kind: 'motion'},
  ],
  /** Course PNGs for the Download button — not preloaded into the editor. */
  packDownloads: {
    idle: `${FEMALE_KNIGHT_ASSET}/Idle.png`,
    run: `${FEMALE_KNIGHT_ASSET}/Run.png`,
    jump: `${FEMALE_KNIGHT_ASSET}/Jump.png`,
    fall: `${FEMALE_KNIGHT_ASSET}/Fall.png`,
    attack1: `${FEMALE_KNIGHT_ASSET}/Attack1.png`,
    attack2: `${FEMALE_KNIGHT_ASSET}/Attack2.png`,
    takeHit: `${FEMALE_KNIGHT_ASSET}/Take Hit.png`,
    death: `${FEMALE_KNIGHT_ASSET}/Death.png`,
  },
  sprites: {
    idle: {src: '', framesMax: 11},
    run: {src: '', framesMax: 8},
    jump: {src: '', framesMax: 3},
    fall: {src: '', framesMax: 3},
    attack1: {src: '', framesMax: 7},
    attack2: {src: '', framesMax: 7},
    takeHit: {src: '', framesMax: 4},
    death: {src: '', framesMax: 11},
  },
  attacks: {
    attack1: {hitFrame: 3, box: {x: 100, y: 50, w: 60, h: 70}},
    attack2: {hitFrame: 3, box: {x: 105, y: 45, w: 58, h: 75}},
  },
};

const SAMURAI_MACK_ASSET = `${GAME_BASE}/img/samuraiMack`;

/**
 * Samurai Mack: 200×200 cells. Empty editor — lesson 4f download → recolor → upload.
 * Frames: Idle·Run 8 / Jump·Fall 2 / Attack1·2 6 / Take Hit 4 / Death 6.
 */
export const SAMURAI_MACK_PRESET = {
  id: 'samurai_mack',
  name: '蓝武士',
  frameWidth: 200,
  frameHeight: 200,
  footY: 190,
  faces: 'right',
  requireUpload: true,
  attackKeys: ['attack1', 'attack2'],
  motionTabs: [
    {id: 'idle', label: '待机', kind: 'motion'},
    {id: 'run', label: '移动', kind: 'motion'},
    {id: 'jump', label: '跳跃', kind: 'motion'},
    {id: 'fall', label: '下落', kind: 'motion'},
    {id: 'takeHit', label: '受击', kind: 'motion'},
    {id: 'death', label: '死亡', kind: 'motion'},
  ],
  packDownloads: {
    idle: `${SAMURAI_MACK_ASSET}/Idle.png`,
    run: `${SAMURAI_MACK_ASSET}/Run.png`,
    jump: `${SAMURAI_MACK_ASSET}/Jump.png`,
    fall: `${SAMURAI_MACK_ASSET}/Fall.png`,
    attack1: `${SAMURAI_MACK_ASSET}/Attack1.png`,
    attack2: `${SAMURAI_MACK_ASSET}/Attack2.png`,
    takeHit: `${SAMURAI_MACK_ASSET}/Take Hit.png`,
    death: `${SAMURAI_MACK_ASSET}/Death.png`,
  },
  sprites: {
    idle: {src: '', framesMax: 8},
    run: {src: '', framesMax: 8},
    jump: {src: '', framesMax: 2},
    fall: {src: '', framesMax: 2},
    attack1: {src: '', framesMax: 6},
    attack2: {src: '', framesMax: 6},
    takeHit: {src: '', framesMax: 4},
    death: {src: '', framesMax: 6},
  },
  attacks: {
    attack1: {hitFrame: 4, box: {x: 100, y: 40, w: 90, h: 50}},
    attack2: {hitFrame: 4, box: {x: 95, y: 35, w: 95, h: 55}},
  },
};

const PRESETS = {
  brucer: BRUCER_PRESET,
  chinese_hero: CHINESE_HERO_PRESET,
  female_hero_knight: FEMALE_HERO_KNIGHT_PRESET,
  samurai_mack: SAMURAI_MACK_PRESET,
};

function tabsForPreset(preset) {
  const keys = preset.attackKeys || ['attack1', 'attack2'];
  const motion = preset.motionTabs || MOTION_TABS;
  return [...motion, ...keys.map((k) => ATTACK_TAB_META[k]).filter(Boolean)];
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function loadDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const lib = loadLibrary();
    if (lib.activeId && lib.entries[lib.activeId]) return lib.entries[lib.activeId];
    const raw = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
    return raw && typeof raw === 'object' ? raw : null;
  } catch {
    return null;
  }
}

/** Prefer library/active draft only when it matches this lesson preset. */
function loadDraftForPreset(presetId) {
  const saved = loadDraft();
  if (!saved) return null;
  const savedPreset = saved.preset || (saved.frameWidth === 82 ? 'brucer' : null);
  if (savedPreset === presetId) return saved;
  if (typeof window === 'undefined') return null;
  try {
    const lib = loadLibrary();
    const match = Object.values(lib.entries || {}).find((e) => e?.preset === presetId);
    return match || null;
  } catch {
    return null;
  }
}

function saveDraft(draft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadLibrary() {
  if (typeof window === 'undefined') return {entries: {}};
  try {
    const raw = JSON.parse(window.localStorage.getItem(LIBRARY_KEY) || 'null');
    if (raw?.entries && typeof raw.entries === 'object') {
      return {entries: {...raw.entries}, activeId: raw.activeId || null};
    }
  } catch {
    // ignore
  }
  // Migrate legacy single draft into the library once.
  try {
    const legacy = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
    if (legacy?.sprites && legacy?.attacks && legacy?.name) {
      const id = String(legacy.id || characterIdFromName(legacy.name));
      if (!CLASSIC_IDS.has(id) && !CLASSIC_NAMES.has(String(legacy.name).trim())) {
        const entries = {[id]: {...legacy, id}};
        const lib = {entries, activeId: id};
        window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
        return lib;
      }
    }
  } catch {
    // ignore
  }
  return {entries: {}, activeId: null};
}

function characterIdFromName(name) {
  const slug =
    String(name || '角色')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\u4e00-\u9fff-]/g, '')
      .slice(0, 40) || 'char';
  return 'draft_' + slug;
}

function findLibraryIdByName(entries, name) {
  const n = String(name || '').trim();
  for (const [id, entry] of Object.entries(entries || {})) {
    if (entry && String(entry.name || '').trim() === n) return id;
  }
  return null;
}

/**
 * Save by name: new name → new character; same name → overwrite.
 * Classic 武士 / 剑士 are protected.
 */
export function saveCharacterToLibrary(draft) {
  const name = String(draft?.name || '').trim();
  if (!name) return {ok: false, error: '请填写角色名称'};
  if (CLASSIC_NAMES.has(name)) {
    return {ok: false, error: `不能覆盖经典角色「${name}」`};
  }

  const lib = loadLibrary();
  let id = findLibraryIdByName(lib.entries, name);
  const isNew = !id;
  if (!id) {
    id = characterIdFromName(name);
    // Avoid colliding with an existing different-name entry that shares the slug.
    if (lib.entries[id] && String(lib.entries[id].name || '').trim() !== name) {
      id = characterIdFromName(name + '_' + Date.now().toString(36));
    }
  }
  if (CLASSIC_IDS.has(id)) {
    return {ok: false, error: '不能覆盖经典角色'};
  }

  const saved = {
    ...draft,
    id,
    name,
    updatedAt: Date.now(),
  };
  lib.entries[id] = saved;
  lib.activeId = id;
  window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
  saveDraft(saved);
  return {ok: true, isNew, id, name};
}

function frameBoxToGameAttackBox(box, frameW, frameH, scale, footY) {
  // Map frame-pixel damage rect → attackBox relative to hurtbox top-left.
  // Must subtract sprite draw offset so the box sits on the fist/weapon, not
  // shifted an extra ~offset.x to the right (looked like absurd reach).
  const drawOff = drawOffsetForFrame(frameW, frameH, scale, footY);
  return {
    offset: {
      x: Math.round(box.x * scale - drawOff.x),
      y: Math.round(box.y * scale - drawOff.y),
    },
    width: Math.max(1, Math.round(box.w * scale)),
    height: Math.max(1, Math.round(box.h * scale)),
  };
}

export function resolveStatPoints(raw) {
  const out = {...DEFAULT_STAT_POINTS};
  if (!raw || typeof raw !== 'object') return out;
  for (const key of Object.keys(STAT_SPECS)) {
    if (raw[key] != null) {
      const spec = STAT_SPECS[key];
      out[key] = clamp(
        Number(raw[key]) || 0,
        spec.minPoints ?? STAT_MIN_POINTS,
        spec.maxPoints,
      );
    }
  }
  const spent = Object.values(out).reduce((a, b) => a + b, 0);
  // Old over-budget drafts → clear gifts and start from base.
  if (spent > STAT_BUDGET) return {...DEFAULT_STAT_POINTS};
  return out;
}

export function statsFromPoints(points) {
  const p = resolveStatPoints(points);
  const value = (key) => {
    const spec = STAT_SPECS[key];
    const delta = p[key] * spec.perPoint;
    return spec.invert ? spec.base - delta : spec.base + delta;
  };
  const attack1 = Math.round(value('attackBase'));
  const attack2 = Math.round(attack1 * 1.75);
  const attack3 = Math.round(attack1 * 2.5);
  const jumpPower = value('jumpPower');
  return {
    maxHealth: Math.round(value('maxHealth')),
    maxStamina: Math.round(value('maxStamina')),
    moveSpeed: value('moveSpeed'),
    staminaRegen: Math.round(value('staminaRegen')),
    attackDamage: {attack1, attack2, attack3},
    jumpVelocity: -Math.abs(jumpPower),
    jumpCost: Math.max(1, Math.round(value('jumpCost'))),
    attackCost: Math.max(1, Math.round(value('attackCost'))),
  };
}

/** Build a registerCharacter-compatible pack from workshop draft. */
export function draftToGameCharacter(draft) {
  const fw = draft.frameWidth || 82;
  const fh = draft.frameHeight || 105;
  const sizeMultiplier = clampSizeMultiplier(draft.sizeMultiplier);
  const scale = displayScaleForFrame(fw, fh, sizeMultiplier);
  const attackKeys = Object.keys(draft.attacks || {}).filter((k) => draft.attacks[k]?.box);
  const footY =
    Number(draft.footY) > 0
      ? Number(draft.footY)
      : fw === 82 && fh === 105
        ? 72
        : fw === 126 && fh === 126
          ? 82
          : fh;
  const combat = statsFromPoints(draft.statPoints);
  const attackBoxes = {};
  for (const key of attackKeys) {
    attackBoxes[key] = frameBoxToGameAttackBox(draft.attacks[key].box, fw, fh, scale, footY);
  }
  const sprite = (role, hitFrame) => {
    const s = draft.sprites[role];
    if (!s?.src) return null;
    return {
      imageSrc: s.src,
      framesMax: s.framesMax,
      frameWidth: fw,
      frameHeight: fh,
      hitFrame: hitFrame != null ? hitFrame : undefined,
      clankFrame: hitFrame != null ? hitFrame : undefined,
    };
  };
  const sprites = {
    idle: sprite('idle'),
    run: sprite('run'),
    jump: sprite('jump'),
    fall: sprite('fall'),
    takeHit: sprite('takeHit'),
    death: sprite('death'),
  };
  for (const key of attackKeys) {
    sprites[key] = sprite(key, draft.attacks[key].hitFrame);
  }
  return {
    id: draft.id || 'student_char',
    name: draft.name || '我的角色',
    author: draft.author || null,
    faces: draft.faces || 'right',
    scale,
    sizeMultiplier,
    footY,
    offset: drawOffsetForFrame(fw, fh, scale, footY),
    maxHealth: combat.maxHealth,
    maxStamina: combat.maxStamina,
    moveSpeed: combat.moveSpeed,
    staminaRegen: combat.staminaRegen,
    attackDamage: combat.attackDamage,
    jumpVelocity: combat.jumpVelocity,
    jumpCost: combat.jumpCost,
    attackCost: combat.attackCost,
    attackBox: attackBoxes.attack1,
    attackBoxes,
    sprites,
  };
}

function ParamDragger({label, valueText, hint, min, max, step = 1, value, onChange, disabled}) {
  return (
    <div className={styles.param}>
      <div className={styles.paramHead}>
        <span className={styles.paramLabel}>{label}</span>
        <span className={styles.paramValue}>{valueText}</span>
      </div>
      {hint ? <span className={styles.paramHint}>{hint}</span> : null}
      <input
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function HitboxCanvas({
  imageUrl,
  frameWidth,
  frameHeight,
  framesMax,
  frameIndex,
  box,
  onBoxChange,
  editable = true,
  zoom = 3,
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const w = frameWidth * zoom;
    const h = frameHeight * zoom;
    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    if (!imageUrl) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.fillText('请先下载并上传 PNG', 12, Math.round(h / 2));
      return undefined;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(
        img,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        w,
        h,
      );
      if (box && editable) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(box.x * zoom, box.y * zoom, box.w * zoom, box.h * zoom);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(239,68,68,0.22)';
        ctx.fillRect(box.x * zoom, box.y * zoom, box.w * zoom, box.h * zoom);
        ctx.fillStyle = '#facc15';
        ctx.font = '12px sans-serif';
        ctx.fillText('伤害盒', box.x * zoom + 4, box.y * zoom + 14);
      }
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl, frameWidth, frameHeight, framesMax, frameIndex, box, zoom, editable]);

  function clientToBox(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * frameWidth;
    const y = ((e.clientY - rect.top) / rect.height) * frameHeight;
    return {x, y};
  }

  function onPointerDown(e) {
    if (!editable || !onBoxChange) return;
    const p = clientToBox(e);
    dragRef.current = {x0: p.x, y0: p.y};
    canvasRef.current.setPointerCapture(e.pointerId);
    onBoxChange({
      x: Math.round(p.x),
      y: Math.round(p.y),
      w: 1,
      h: 1,
    });
  }

  function onPointerMove(e) {
    if (!editable || !dragRef.current || !onBoxChange) return;
    const p = clientToBox(e);
    const x = Math.round(Math.min(dragRef.current.x0, p.x));
    const y = Math.round(Math.min(dragRef.current.y0, p.y));
    const w = Math.round(Math.abs(p.x - dragRef.current.x0));
    const h = Math.round(Math.abs(p.y - dragRef.current.y0));
    onBoxChange({
      x: clamp(x, 0, frameWidth - 1),
      y: clamp(y, 0, frameHeight - 1),
      w: clamp(w, 1, frameWidth - x),
      h: clamp(h, 1, frameHeight - y),
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.previewFrame}
      style={{
        cursor: editable ? 'crosshair' : 'default',
        maxWidth: '100%',
        imageRendering: 'pixelated',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}

function SizeComparePanel({
  frameWidth,
  frameHeight,
  sizeMultiplier,
  onMultiplierChange,
  studentIdleSrc,
  studentFramesMax,
}) {
  const scale = displayScaleForFrame(frameWidth, frameHeight, sizeMultiplier);
  const drawH = Math.round(frameHeight * scale);
  const drawW = Math.round(frameWidth * scale);
  const vsKenji = drawH / KENJI_DRAW_H;
  const tooBig = vsKenji > 1.02;
  const previewUnit = 100 / KENJI_DRAW_H;

  return (
    <div style={{marginBottom: 12}}>
      <span className={styles.sectionLabel}>体型</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 14,
          minHeight: 110,
          padding: '6px 0',
          marginBottom: 8,
          background: 'var(--ifm-color-emphasis-100, #f2f2f2)',
          borderRadius: 4,
        }}
      >
        <SizeSilhouette
          label="你"
          src={studentIdleSrc}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
          framesMax={studentFramesMax}
          cssH={Math.max(24, drawH * previewUnit)}
          cssW={Math.max(16, drawW * previewUnit)}
        />
        <SizeSilhouette
          label="剑士"
          src={KENJI_IDLE_SRC}
          frameWidth={BASE_FRAME_SIZE}
          frameHeight={BASE_FRAME_SIZE}
          framesMax={KENJI_FRAMES_MAX}
          cssH={KENJI_DRAW_H * previewUnit}
          cssW={KENJI_DRAW_H * previewUnit}
        />
      </div>
      <ParamDragger
        label="尺寸倍率"
        valueText={`${sizeMultiplier.toFixed(2)}${tooBig ? ' · 偏大' : ''}`}
        min={SIZE_MULT_MIN}
        max={SIZE_MULT_MAX}
        step={SIZE_MULT_STEP}
        value={sizeMultiplier}
        onChange={(v) => onMultiplierChange(clampSizeMultiplier(v))}
      />
    </div>
  );
}

function SizeSilhouette({label, src, frameWidth, frameHeight, framesMax, cssH, cssW}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return undefined;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      const w = Math.max(1, Math.round(cssW));
      const h = Math.max(1, Math.round(cssH));
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, frameWidth, frameHeight, 0, 0, w, h);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, frameWidth, frameHeight, framesMax, cssH, cssW]);

  return (
    <div style={{textAlign: 'center'}}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: Math.round(cssW),
          height: Math.round(cssH),
          imageRendering: 'pixelated',
          border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
          background: '#111',
        }}
      />
      <span className={styles.statLabel} style={{marginTop: 4}}>
        {label}
      </span>
    </div>
  );
}

function StatsBudgetPanel({statPoints, onChange}) {
  const spent = useMemo(
    () => Object.values(statPoints).reduce((a, b) => a + b, 0),
    [statPoints],
  );
  const remaining = STAT_BUDGET - spent;
  const combat = statsFromPoints(statPoints);

  function addPoint(key) {
    const pts = statPoints[key] || 0;
    const spec = STAT_SPECS[key];
    if (remaining <= 0 || pts >= spec.maxPoints) return;
    onChange({...statPoints, [key]: pts + 1});
  }

  function removePoint(key) {
    const pts = statPoints[key] || 0;
    const min = STAT_SPECS[key].minPoints ?? STAT_MIN_POINTS;
    if (pts <= min) return;
    onChange({...statPoints, [key]: pts - 1});
  }

  return (
    <div>
      <div className={styles.paramHead} style={{marginBottom: 10}}>
        <span className={styles.sectionLabel} style={{marginBottom: 0}}>
          属性
        </span>
        <span className={styles.paramValue}>可用 {remaining}</span>
      </div>
      {Object.keys(STAT_SPECS).map((key) => {
        const spec = STAT_SPECS[key];
        const pts = statPoints[key] || 0;
        const val = spec.invert
          ? spec.base - pts * spec.perPoint
          : spec.base + pts * spec.perPoint;
        const min = spec.minPoints ?? STAT_MIN_POINTS;
        const canMinus = pts > min;
        const canPlus = remaining > 0 && pts < spec.maxPoints;
        return (
          <div key={key} className={styles.statRow}>
            <div className={styles.statRowMain}>
              <div className={styles.paramHead}>
                <span className={styles.paramLabel}>{spec.label}</span>
                <span className={styles.paramValue}>{spec.format(val)}</span>
              </div>
            </div>
            <div className={styles.statStepper}>
              <button
                type="button"
                className={styles.stepBtn}
                disabled={!canMinus}
                aria-label={`${spec.label} −`}
                onClick={() => removePoint(key)}
              >
                −
              </button>
              <span className={styles.stepCount}>{pts}</span>
              <button
                type="button"
                className={styles.stepBtn}
                disabled={!canPlus}
                aria-label={`${spec.label} +`}
                onClick={() => addPoint(key)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
      <div className={styles.stats} style={{marginTop: 4}}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>攻击1</span>
          <div className={styles.statValue}>{combat.attackDamage.attack1}</div>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>攻击2</span>
          <div className={styles.statValue}>{combat.attackDamage.attack2}</div>
        </div>
        {combat.attackDamage.attack3 != null ? (
          <div className={styles.stat}>
            <span className={styles.statLabel}>攻击3</span>
            <div className={styles.statValue}>{combat.attackDamage.attack3}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * @param {'brucer'|'chinese_hero'|'female_hero_knight'|'samurai_mack'} preset
 * @param {boolean} allowUpload   force upload UI (also auto for requireUpload presets)
 */
export default function CharacterHitboxWorkshop({
  preset = 'brucer',
  allowUpload = false,
} = {}) {
  const base = PRESETS[preset] || BRUCER_PRESET;
  const needsUpload = allowUpload || !!base.requireUpload;
  const tabs = useMemo(() => tabsForPreset(base), [base]);
  const saved = typeof window !== 'undefined' ? loadDraftForPreset(base.id) : null;
  const [name, setName] = useState(() => saved?.name || base.name);
  const [characterId, setCharacterId] = useState(
    () => saved?.id || 'draft_' + (base.id || 'char'),
  );
  const [tab, setTab] = useState('idle');
  const [sprites, setSprites] = useState(() => {
    const merged = structuredClone(base.sprites);
    if (saved?.sprites) {
      for (const role of Object.keys(merged)) {
        if (saved.sprites[role]?.src) {
          merged[role] = {
            ...merged[role],
            ...saved.sprites[role],
          };
        }
      }
    }
    return merged;
  });
  const [attacks, setAttacks] = useState(() => {
    const initial = structuredClone(base.attacks);
    if (saved?.attacks) {
      for (const key of Object.keys(initial)) {
        if (saved.attacks[key]) initial[key] = {...initial[key], ...saved.attacks[key]};
      }
    }
    return initial;
  });
  const [statPoints, setStatPoints] = useState(() => resolveStatPoints(saved?.statPoints));
  const [sizeMultiplier, setSizeMultiplier] = useState(() =>
    clampSizeMultiplier(saved?.sizeMultiplier ?? DEFAULT_SIZE_MULTIPLIER),
  );
  const [viewFrame, setViewFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const uploadRef = useRef(null);

  const tabMeta = tabs.find((t) => t.id === tab) || tabs[0];
  const isAttack = tabMeta.kind === 'attack';
  const sprite = sprites[tab] || base.sprites[tab];
  const attack = isAttack ? attacks[tab] : null;
  const framesMax = Math.max(1, Number(sprite?.framesMax) || 1);
  const missingRoles = useMemo(
    () => Object.keys(sprites).filter((role) => !sprites[role]?.src),
    [sprites],
  );

  function missingUploadMessage() {
    if (!missingRoles.length) return '';
    const labels = missingRoles.map((id) => {
      const t = tabs.find((x) => x.id === id);
      return t?.label || id;
    });
    return `还缺上传：${labels.join('、')}`;
  }

  useEffect(() => {
    setPlaying(false);
    setViewFrame(isAttack && attack ? attack.hitFrame : 0);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sprite?.src) setPlaying(false);
  }, [sprite?.src]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => {
      setViewFrame((f) => (f + 1) % framesMax);
    }, 180);
    return () => window.clearInterval(id);
  }, [playing, framesMax]);

  const draft = useMemo(
    () => ({
      id: characterId,
      name,
      author: null,
      faces: base.faces,
      sizeMultiplier,
      scale: displayScaleForFrame(base.frameWidth, base.frameHeight, sizeMultiplier),
      frameWidth: base.frameWidth,
      frameHeight: base.frameHeight,
      footY: base.footY,
      sprites,
      attacks,
      statPoints,
      preset: base.id,
      updatedAt: Date.now(),
    }),
    [name, characterId, attacks, statPoints, sizeMultiplier, sprites, base],
  );

  const updateAttack = useCallback((key, patch) => {
    setAttacks((prev) => ({...prev, [key]: {...prev[key], ...patch}}));
  }, []);

  const updateBox = useCallback(
    (box) => {
      if (!isAttack) return;
      updateAttack(tab, {box});
    },
    [isAttack, tab, updateAttack],
  );

  function setHitFrameHere() {
    if (!isAttack) return;
    updateAttack(tab, {hitFrame: viewFrame});
    setMessage(`${tabMeta.label} 伤害帧 → ${viewFrame + 1}`);
  }

  function resetStats() {
    setStatPoints({...DEFAULT_STAT_POINTS});
    setMessage('赠点已清空');
  }

  function handleSave() {
    if (needsUpload && missingRoles.length) {
      setMessage(missingUploadMessage());
      return;
    }
    const result = saveCharacterToLibrary(draft);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setCharacterId(result.id);
    setName(result.name);
    setMessage(result.isNew ? `已新建「${result.name}」` : `已覆盖「${result.name}」`);
  }

  function handlePlay() {
    if (needsUpload && missingRoles.length) {
      setMessage(missingUploadMessage());
      return;
    }
    const result = saveCharacterToLibrary(draft);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setCharacterId(result.id);
    setName(result.name);
    const url = `${GAME_BASE}/index.html?${new URLSearchParams({
      draft: '1',
      p1: result.id,
      mode: 'test',
      api: getApiBaseUrl(),
    }).toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function downloadUrlAsPng(src, fileName, okMessage) {
    if (!src) {
      setMessage('没有可下载的图片');
      return;
    }
    try {
      let href = src;
      let revoke = null;
      if (!src.startsWith('data:')) {
        const res = await fetch(src);
        const blob = await res.blob();
        href = URL.createObjectURL(blob);
        revoke = href;
      }
      const a = document.createElement('a');
      a.href = href;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (revoke) URL.revokeObjectURL(revoke);
      setMessage(okMessage || `已下载 ${fileName}`);
    } catch {
      setMessage('下载失败');
    }
  }

  /** Course pack assets (above the editor on upload lessons). */
  async function handlePackDownload(role) {
    const src = base.packDownloads?.[role];
    const label = tabs.find((t) => t.id === role)?.label || role;
    await downloadUrlAsPng(src, `${role}.png`, `已下载「${label}」素材 ${role}.png`);
  }

  /** Current editor sheet (only when a sprite is already loaded). */
  async function handleDownloadPng() {
    if (!sprite?.src) {
      setMessage('当前标签还没有图，请先上传');
      return;
    }
    await downloadUrlAsPng(sprite.src, `${tab}.png`, `已下载 ${tab}.png`);
  }

  function handleUploadClick() {
    uploadRef.current?.click();
  }

  function handleUploadFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.png$/i.test(file.name) && file.type !== 'image/png') {
      setMessage('请上传 PNG');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const fw = base.frameWidth;
        const frames = Math.max(1, Math.round(img.width / fw));
        setSprites((prev) => ({
          ...prev,
          [tab]: {
            ...prev[tab],
            src: dataUrl,
            framesMax: frames,
          },
        }));
        setPlaying(false);
        setViewFrame(0);
        setMessage(`已替换「${tabMeta.label}」精灵表（${frames} 帧）`);
      };
      img.onerror = () => setMessage('图片无法读取');
      img.src = dataUrl;
    };
    reader.onerror = () => setMessage('读取失败');
    reader.readAsDataURL(file);
  }

  const hasSprite = !!sprite?.src;

  return (
    <div>
      {needsUpload && base.packDownloads ? (
        <div className={styles.packDownload} style={{marginBottom: 16}}>
          <span className={styles.sectionLabel}>素材下载（编辑器外）</span>
          <p className={styles.paramHint} style={{marginBottom: 8}}>
            先在这里下载 PNG
            {base.id === 'samurai_mack' ? '，改色后再' : '，再'}在下方编辑器对应标签里
            <strong>上传</strong>。未上传时编辑器只有「上传」。
            {missingRoles.length
              ? `（还剩 ${missingRoles.length} 个未上传）`
              : '（全部已上传）'}
          </p>
          <div className={styles.actions} style={{marginTop: 0}}>
            {tabs.map((t) => {
              const href = base.packDownloads[t.id];
              if (!href) return null;
              const done = !!sprites[t.id]?.src;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => handlePackDownload(t.id)}
                >
                  下载 {t.label}
                  {done ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={styles.modeTabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {needsUpload && !sprites[t.id]?.src ? ' ·' : ''}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.previewCol}>
          <span className={styles.sectionLabel}>
            {tabMeta.label} · {viewFrame + 1}/{framesMax}
            {isAttack && attack && viewFrame === attack.hitFrame ? ' · 伤害帧' : ''}
          </span>
          <HitboxCanvas
            imageUrl={sprite.src}
            frameWidth={base.frameWidth}
            frameHeight={base.frameHeight}
            framesMax={framesMax}
            frameIndex={Math.min(viewFrame, framesMax - 1)}
            box={isAttack && attack ? attack.box : null}
            onBoxChange={updateBox}
            editable={isAttack && hasSprite}
          />
        </div>

        <div className={styles.controlsCol}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>名称</span>
            <input
              className={styles.input}
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {hasSprite ? (
            <ParamDragger
              label="帧"
              valueText={`${viewFrame + 1}`}
              min={0}
              max={Math.max(0, framesMax - 1)}
              value={Math.min(viewFrame, framesMax - 1)}
              onChange={(v) => {
                setPlaying(false);
                setViewFrame(v);
              }}
            />
          ) : null}

          <input
            ref={uploadRef}
            type="file"
            accept="image/png,.png"
            style={{display: 'none'}}
            onChange={handleUploadFile}
          />

          <div className={styles.actions} style={{marginTop: 0}}>
            {hasSprite ? (
              <button type="button" className={styles.btnGhost} onClick={() => setPlaying((p) => !p)}>
                {playing ? '暂停' : '播放'}
              </button>
            ) : null}
            {hasSprite && !needsUpload ? (
              <button type="button" className={styles.btnGhost} onClick={handleDownloadPng}>
                下载
              </button>
            ) : null}
            <button type="button" className={styles.btnGhost} onClick={handleUploadClick}>
              上传
            </button>
            {isAttack && hasSprite ? (
              <button type="button" className={styles.btnPrimary} onClick={setHitFrameHere}>
                设为伤害帧
              </button>
            ) : null}
          </div>

          {isAttack && attack ? (
            <>
              <ParamDragger
                label="盒 X"
                valueText={String(attack.box.x)}
                min={0}
                max={base.frameWidth - 1}
                value={attack.box.x}
                onChange={(x) =>
                  updateBox({
                    ...attack.box,
                    x,
                    w: clamp(attack.box.w, 1, base.frameWidth - x),
                  })
                }
              />
              <ParamDragger
                label="盒 Y"
                valueText={String(attack.box.y)}
                min={0}
                max={base.frameHeight - 1}
                value={attack.box.y}
                onChange={(y) =>
                  updateBox({
                    ...attack.box,
                    y,
                    h: clamp(attack.box.h, 1, base.frameHeight - y),
                  })
                }
              />
              <ParamDragger
                label="盒 宽"
                valueText={String(attack.box.w)}
                min={1}
                max={base.frameWidth}
                value={attack.box.w}
                onChange={(w) =>
                  updateBox({
                    ...attack.box,
                    w: clamp(w, 1, base.frameWidth - attack.box.x),
                  })
                }
              />
              <ParamDragger
                label="盒 高"
                valueText={String(attack.box.h)}
                min={1}
                max={base.frameHeight}
                value={attack.box.h}
                onChange={(h) =>
                  updateBox({
                    ...attack.box,
                    h: clamp(h, 1, base.frameHeight - attack.box.y),
                  })
                }
              />
            </>
          ) : (
            <>
              {tab === 'idle' ? (
                <SizeComparePanel
                  frameWidth={base.frameWidth}
                  frameHeight={base.frameHeight}
                  sizeMultiplier={sizeMultiplier}
                  onMultiplierChange={setSizeMultiplier}
                  studentIdleSrc={sprites.idle.src}
                  studentFramesMax={sprites.idle.framesMax}
                />
              ) : null}
              <StatsBudgetPanel statPoints={statPoints} onChange={setStatPoints} />
              <div className={styles.actions} style={{marginTop: 8}}>
                <button type="button" className={styles.btnGhost} onClick={resetStats}>
                  重置赠点
                </button>
              </div>
            </>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.btnPrimary} onClick={handleSave}>
              保存
            </button>
            <button type="button" className={styles.btnGhost} onClick={handlePlay}>
              试玩
            </button>
          </div>
          {message ? <p className={styles.note}>{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
