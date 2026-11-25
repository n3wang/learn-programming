import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {L} from '../../core/strings';
import {ARENA_EDGE, ARENA_TILE, BUILT_TILE, DISTRICT, EMPTY_TILE, ROAD_TILE, TYPES, isoDistrict, isoTile} from './data';
import styles from './sultan.module.css';

/**
 * 64 px isometric pixel art for the Sultan: every built district stands on a
 * paved plot with its value above it, inside a border in the owner's colour.
 * Stat events get an arena floor of their own (see ARENA_TILE).
 *
 * Geometry (at 1×): a floor tile's top face is a 58 × 29 diamond whose centre
 * sits at (32, 43) in its 64 px image, so neighbours are 29 px across and
 * 14.5 px down. Cells are drawn back to front (col + row) so taller
 * buildings overlap the plots behind them, never the ones in front.
 */
const DX = 29;
const DY = 14.5;
const PX = 64;
const CITY_COLS = 3;
const CITY_CELLS = 9;

/**
 * Indices (row-major 3×3) that are decorative green blockers for a goal size.
 *   9 → full grid
 *   8 → green centre
 *   7 → opposite corners
 *   6 → middle road row
 *   5 → plus / cross arms
 *   4 → only the four corners buildable
 */
const CITY_BLOCKS = {
  9: [],
  8: [4],
  7: [0, 8],
  6: [3, 4, 5],
  5: [1, 3, 5, 7],
  4: [1, 3, 4, 5, 7],
  3: [1, 2, 3, 5, 6, 7],
  2: [1, 2, 3, 4, 5, 6, 7],
  1: [1, 2, 3, 4, 5, 6, 7, 8],
};

function cityBlockers(buildable) {
  const n = Math.max(1, Math.min(CITY_CELLS, buildable));
  if (CITY_BLOCKS[n]) return CITY_BLOCKS[n];
  return Array.from({length: CITY_CELLS - n}, (_, i) => CITY_CELLS - 1 - i);
}

function IsoImg({path, className, style, alt = ''}) {
  const src = useBaseUrl(`/img/party/${path}`);
  return <img src={src} alt={alt} className={className} style={style} draggable={false} decoding="async" />;
}

/** cells: [{tile, art?, title?, key?, onClick?, value?, hot?}]; laid out `cols` wide, row by row. */
export function IsoGrid({cells, cols = 4, scale = 1, children, className = ''}) {
  const n = cells.length;
  const c = Math.max(1, Math.min(cols, n));
  const rows = Math.max(1, Math.ceil(n / c));
  const width = ((c - 1 + rows - 1) * DX + PX) * scale;
  const height = ((c - 1 + rows - 1) * DY + PX) * scale;
  return (
    <span className={`${styles.isoGrid} ${className}`} style={{width, height}}>
      {cells.map((cell, i) => {
        const col = i % c;
        const row = Math.floor(i / c);
        const pos = {left: ((col - row + rows - 1) * DX) * scale, top: (col + row) * DY * scale, width: PX * scale, height: PX * scale, zIndex: (col + row) * 2};
        const Tag = cell.onClick ? 'button' : 'span';
        return (
          <Tag
            key={cell.key || i}
            type={cell.onClick ? 'button' : undefined}
            className={styles.isoCell}
            style={pos}
            title={cell.title}
            onClick={
              cell.onClick
                ? (e) => {
                    e.stopPropagation();
                    cell.onClick(e);
                  }
                : undefined
            }
            data-hot={Boolean(cell.hot)}>
            <IsoImg path={isoTile(cell.tile)} className={styles.isoTile} />
            {cell.art && <IsoImg path={cell.art} className={styles.isoBuilding} alt={cell.title || ''} />}
            {cell.value != null && (
              <span
                className={styles.isoValue}
                style={{
                  fontSize: Math.max(9, 13 * scale),
                  ...(cell.valueTint ? {'--value-tint': cell.valueTint} : null),
                }}>
                {cell.value}
              </span>
            )}
          </Tag>
        );
      })}
      {children && <span className={styles.isoOverlay}>{children}</span>}
    </span>
  );
}

/**
 * One player's city is always a 3×3 iso grid. Buildable plots (bare earth →
 * cobblestone) fill up to `goal`; leftover cells are leafy-green blockers in a
 * fixed pattern (centre park for 8, opposite corners for 7, middle road for 6…).
 * city: [{uid, key, value?, invest?, ok?}]; `hot` marks uids to highlight.
 */
/** A grid's natural size at 1× (px), for fitting it into a box. */
export function isoSize(n = CITY_CELLS, cols = CITY_COLS) {
  const c = Math.max(1, Math.min(cols, n));
  const rows = Math.max(1, Math.ceil(n / c));
  return {width: (c - 1 + rows - 1) * DX + PX, height: (c - 1 + rows - 1) * DY + PX};
}

/**
 * `fit` = {width, height}: scale the city to fill that box instead of using
 * `scale`. `bare` draws the plots without the bordered frame (the caller
 * frames it, e.g. the host's player card).
 */
export function CityPlot({city, goal, color = '#2a1630', scale = 1, lang = 'en', onTap, label, hot = [], showValues = true, fit, bare = false}) {
  const buildable = Math.min(CITY_CELLS, Math.max(goal || CITY_CELLS, (city && city.length) || 0));
  const blocked = new Set(cityBlockers(buildable));
  if (fit) {
    const nat = isoSize(CITY_CELLS, CITY_COLS);
    scale = Math.max(0.2, Math.min(fit.width / nat.width, fit.height / nat.height));
  }
  let builtAt = 0;
  const cells = Array.from({length: CITY_CELLS}, (_, i) => {
    if (blocked.has(i)) {
      return {key: `park-${i}`, tile: ROAD_TILE, title: lang === 'zh' ? '绿地' : 'Park'};
    }
    const c = city && city[builtAt];
    builtAt += 1;
    if (!c) return {key: `empty-${i}`, tile: EMPTY_TILE};
    const d = DISTRICT[c.key];
    const value = c.value != null ? c.value : d.cost + (c.invest || 0);
    return {
      key: c.uid,
      tile: BUILT_TILE,
      art: isoDistrict(c.key),
      value: showValues ? value : null,
      valueTint: (TYPES[d.type] && TYPES[d.type].tint) || null,
      hot: hot.includes(c.uid),
      title: `${L(d, lang)} · ${L(TYPES[d.type], lang)} · ${value}`,
      onClick: onTap ? () => onTap(c) : undefined,
    };
  });
  if (bare) return <IsoGrid cells={cells} cols={CITY_COLS} scale={scale} />;
  return (
    <span className={styles.cityPlot} style={{'--owner': color}}>
      {label && (
        <span className={styles.cityLetter} aria-label={String(label)}>
          {label}
        </span>
      )}
      <IsoGrid cells={cells} cols={CITY_COLS} scale={scale} />
    </span>
  );
}

/** An event's arena: a 3 × 3 floor (marriage gets a meadow edge), with whatever stands on it overlaid. */
export function ArenaFloor({kind, centerArt, scale = 1, children}) {
  const floor = ARENA_TILE[kind];
  const edge = ARENA_EDGE[kind] || floor;
  const cells = Array.from({length: 9}, (_, i) => ({tile: i === 4 ? floor : edge === floor || i % 2 === 1 ? floor : edge, art: i === 4 ? centerArt : undefined}));
  return (
    <IsoGrid cells={cells} cols={3} scale={scale} className={styles.arena}>
      {children}
    </IsoGrid>
  );
}
