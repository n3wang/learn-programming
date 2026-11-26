import ddia from './ddia';

/**
 * Lesson flag catalog. Each flag:
 *   {id, title, series, paths, sidebarPaths?, format?, separator?, parts: [{from, seg}]}
 * - `paths`: lesson pages the flag belongs to (shown as links in the flags tab).
 * - `sidebarPaths`: pages that turn green on capture (defaults to `paths`; `[]` = none).
 * - `format`: wrapper around the joined parts (default `FLAG{{{parts}}}`), `separator` default `-`.
 */
export const LESSON_FLAGS = [...ddia];

const BY_ID = new Map(LESSON_FLAGS.map((f) => [f.id, f]));
const BY_SOURCE = new Map();
LESSON_FLAGS.forEach((flag) => {
  flag.parts.forEach((part, index) => {
    BY_SOURCE.set(part.from, {flag, index, total: flag.parts.length});
  });
});

export function getFlag(flagId) {
  return BY_ID.get(flagId) || null;
}

/** `{flag, index, total}` for a challenge id, or null when it is not part of any flag. */
export function flagForSource(sourceId) {
  return BY_SOURCE.get(sourceId) || null;
}

export function flagSegments(flag) {
  return flag.parts.map((p) => String(p.seg).toUpperCase());
}

export function flagString(flag) {
  const sep = flag.separator ?? '-';
  const format = flag.format || 'FLAG{{{parts}}}';
  return format.replace('{{parts}}', flagSegments(flag).join(sep));
}

export function sidebarPathsFor(flag) {
  return Array.isArray(flag.sidebarPaths) ? flag.sidebarPaths : flag.paths || [];
}

export function normalizePath(path) {
  return String(path || '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '') || '/';
}
