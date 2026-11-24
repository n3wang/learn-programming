/**
 * Shared bucketing + intensity helpers for student activity heatmaps
 * (account-panel strip and professor class grid use the same scale).
 */

import React from 'react';
import {localDay} from '@site/src/api/storeClient';

export const STUDENT_ACTIVITY_POSTED_EVENT = 'student-activity-posted';

/** `YYYY-MM-DD` for the last `count` days, oldest → today. */
export function lastNDays(count, end = new Date()) {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    days.push(localDay(d));
  }
  return days;
}

/** Keep only well-formed docs for a roster (and optionally one student) within `days`. */
export function filterActivity(docs, {roster, student, days} = {}) {
  const daySet = days ? new Set(days) : null;
  return (Array.isArray(docs) ? docs : []).filter(
    (doc) =>
      doc &&
      typeof doc === 'object' &&
      doc.student &&
      doc.day &&
      (!roster || doc.roster === roster) &&
      (!student || doc.student === student) &&
      (!daySet || daySet.has(doc.day)),
  );
}

/** `{day: count}` */
export function countByDay(docs) {
  const counts = {};
  for (const doc of docs) {
    counts[doc.day] = (counts[doc.day] || 0) + 1;
  }
  return counts;
}

/** `{student: {day: count}}` */
export function countByStudentDay(docs) {
  const grid = {};
  for (const doc of docs) {
    const row = grid[doc.student] || (grid[doc.student] = {});
    row[doc.day] = (row[doc.day] || 0) + 1;
  }
  return grid;
}

export const INTENSITY_LEVELS = [
  {label: 'none', min: 0},
  {label: 'light', min: 1},
  {label: 'medium', min: 4},
  {label: 'heavy', min: 10},
];

/** 0 = none, 1 = light, 2 = medium, 3 = heavy. */
export function intensityLevel(count) {
  let level = 0;
  INTENSITY_LEVELS.forEach((entry, i) => {
    if (count >= entry.min) level = i;
  });
  return level;
}

const LEVEL_BACKGROUND = [
  'var(--ifm-color-emphasis-200)',
  'rgba(46, 160, 67, 0.35)',
  'rgba(46, 160, 67, 0.65)',
  'rgba(46, 160, 67, 1)',
];

export function HeatCell({count = 0, size = 16, title, onClick, selected = false}) {
  const level = intensityLevel(count);
  const style = {
    width: size,
    height: size,
    borderRadius: 3,
    background: LEVEL_BACKGROUND[level],
    border: selected ? '2px solid var(--ifm-color-primary)' : '1px solid rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
    padding: 0,
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
  };
  if (onClick) {
    return <button type="button" style={style} title={title} aria-label={title} onClick={onClick} />;
  }
  return <span style={{...style, display: 'inline-block'}} title={title} />;
}

export function HeatLegend({size = 12}) {
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem'}}>
      {INTENSITY_LEVELS.map((entry) => (
        <span key={entry.label} style={{display: 'inline-flex', alignItems: 'center', gap: 3}}>
          <HeatCell count={entry.min} size={size} title={entry.label} />
          <span style={{color: 'var(--ifm-color-emphasis-700)'}}>{entry.label}</span>
        </span>
      ))}
    </span>
  );
}
