/**
 * Week-by-week gradebook on springbackend `/api/store/gradebook_weeks`.
 * One document per (roster, week):
 *
 * {
 *   roster: 'chuyi', weekStart: '2026-11-23', title: 'Week 12', published: false,
 *   columns: [{id, type: 'behavior'|'homework'|'quiz'|'exam'|'activity', name, max}],
 *   scores: {[student]: {[columnId]: number}},
 *   comments: {[student]: string}
 * }
 */

import {createDocument, listDocuments, replaceDocument, deleteDocument} from '@site/src/api/storeClient';

export const GRADEBOOK_COLLECTION = 'gradebook_weeks';

export const COLUMN_TYPES = {
  behavior: {label: 'Behavior', zh: '课堂表现', max: 10, color: '#7c3aed'},
  homework: {label: 'Homework', zh: '作业', max: 10, color: '#0891b2'},
  quiz: {label: 'Quiz', zh: '小测', max: 10, color: '#d97706'},
  exam: {label: 'Exam', zh: '考试', max: 100, color: '#dc2626'},
  activity: {label: 'Activity', zh: '网站活动', max: 20, color: '#16a34a'},
};

/**
 * Letter-style marks a cell may hold instead of a number, with the share of the column's
 * max they count as. `-` = excused: shown, but left out of totals.
 */
export const GRADE_MARKS = {
  优: 1,
  '优-': 0.9,
  良: 0.8,
  '良-': 0.7,
  及格: 0.6,
  差: 0.5,
  不及格: 0.4,
  未交: 0,
  '-': null,
};

/** Latin shortcuts so marks can be typed without an IME. */
const MARK_SHORTCUTS = {
  y: '优',
  'y-': '优-',
  l: '良',
  'l-': '良-',
  j: '及格',
  c: '差',
  b: '不及格',
  w: '未交',
};

export function isMark(value) {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(GRADE_MARKS, value);
}

/**
 * Parse what a teacher typed/pasted into a cell.
 * '' → null (clear) · number → number · mark or shortcut → mark · anything else → undefined (invalid).
 */
export function parseScoreInput(text) {
  const t = String(text ?? '')
    .trim()
    .replace(/[·.。]+$/, '')
    .replace(/－|—/g, '-');
  if (t === '') return null;
  if (isMark(t)) return t;
  const short = MARK_SHORTCUTS[t.toLowerCase()];
  if (short) return short;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** Fraction of the column max a stored value is worth, or null if it does not count. */
export function scoreFraction(value, col) {
  if (typeof value === 'number' && Number.isFinite(value)) return col.max ? value / col.max : null;
  if (isMark(value)) return GRADE_MARKS[value];
  return null;
}

export function hasScore(value) {
  return (typeof value === 'number' && Number.isFinite(value)) || isMark(value);
}

/** Turn a fraction (0–1) back into a mark, so homework can be shown as letters. */
export function fractionToMark(f) {
  if (f === null || f === undefined) return null;
  if (f >= 0.95) return '优';
  if (f >= 0.85) return '优-';
  if (f >= 0.75) return '良';
  if (f >= 0.65) return '良-';
  if (f >= 0.55) return '及格';
  if (f > 0) return '差';
  return '未交';
}

/** Display title: stored "Week 12" → 第12周. */
export function weekTitle(week) {
  const t = String(week?.title || '').trim();
  const m = t.match(/^week\s*(\d+)$/i);
  if (m) return `第${m[1]}周`;
  return t || week?.weekStart || '';
}

function stripMeta(doc) {
  const {_id, _createdAt, _updatedAt, ...rest} = doc || {};
  return rest;
}

export function sanitizeWeek(raw) {
  const doc = raw && typeof raw === 'object' ? raw : {};
  return {
    ...doc,
    roster: String(doc.roster || ''),
    weekStart: String(doc.weekStart || ''),
    title: String(doc.title || ''),
    published: Boolean(doc.published),
    columns: Array.isArray(doc.columns)
      ? doc.columns
          .filter((c) => c && c.id)
          .map((c) => ({
            id: String(c.id),
            type: COLUMN_TYPES[c.type] ? c.type : 'quiz',
            name: String(c.name || ''),
            max: Number(c.max) > 0 ? Number(c.max) : 10,
          }))
      : [],
    scores: doc.scores && typeof doc.scores === 'object' ? doc.scores : {},
    comments: doc.comments && typeof doc.comments === 'object' ? doc.comments : {},
  };
}

/** All weeks for a roster, oldest → newest. */
export async function listGradebookWeeks(roster) {
  const docs = await listDocuments(GRADEBOOK_COLLECTION);
  return docs
    .filter((d) => d && d.roster === roster && d.weekStart)
    .map(sanitizeWeek)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export async function createGradebookWeek(week) {
  return sanitizeWeek(await createDocument(GRADEBOOK_COLLECTION, stripMeta(sanitizeWeek(week))));
}

export async function saveGradebookWeek(week) {
  return sanitizeWeek(await replaceDocument(GRADEBOOK_COLLECTION, week._id, stripMeta(week)));
}

export async function deleteGradebookWeek(week) {
  return deleteDocument(GRADEBOOK_COLLECTION, week._id);
}

export function newColumnId() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Sum of entered scores and of the max of the columns that have a score. */
export function studentWeekTotal(week, student) {
  const row = week.scores?.[student] || {};
  let got = 0;
  let max = 0;
  for (const col of week.columns) {
    const f = scoreFraction(row[col.id], col);
    if (f === null) continue;
    got += f * col.max;
    max += col.max;
  }
  got = Math.round(got * 10) / 10;
  return {got, max, pct: max ? Math.round((got / max) * 100) : null};
}
