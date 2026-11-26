/**
 * Lesson flag progress (CTF-style).
 *
 * Local (`lesson-flags:v1`, always):
 *   revealed[sourceId] = {flagId, at}   — a challenge was finished (word itself is NOT stored)
 *   captured[flagId]   = {at, flag, segments} — submitted correctly; permanent, snapshot of
 *                        the flag at capture time (survives catalog changes)
 *
 * Store (`lesson_flags`, students only): doc id `${sanitize(student)}__${flagId}`.
 */
import {
  LESSON_FLAGS,
  flagForSource,
  flagSegments,
  flagString,
  getFlag,
  normalizePath,
  sidebarPathsFor,
} from './catalog';

export const LESSON_FLAGS_KEY = 'lesson-flags:v1';
export const LESSON_FLAGS_CHANGE_EVENT = 'lesson-flags-change';
/** Fired on challenge finish; FlagRevealToast shows the monster + word. */
export const LESSON_FLAG_REVEAL_EVENT = 'lesson-flag-reveal';
export const LESSON_FLAGS_COLLECTION = 'lesson_flags';

function emptyState() {
  return {revealed: {}, captured: {}};
}

export function readFlagState() {
  if (typeof window === 'undefined') {
    return emptyState();
  }
  try {
    const raw = JSON.parse(window.localStorage.getItem(LESSON_FLAGS_KEY) || 'null');
    if (!raw || typeof raw !== 'object') {
      return emptyState();
    }
    return {
      revealed: raw.revealed && typeof raw.revealed === 'object' ? raw.revealed : {},
      captured: raw.captured && typeof raw.captured === 'object' ? raw.captured : {},
    };
  } catch {
    return emptyState();
  }
}

function writeFlagState(next) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LESSON_FLAGS_KEY, JSON.stringify(next));
  } catch {
    // ignore blocked storage
  }
  window.dispatchEvent(new CustomEvent(LESSON_FLAGS_CHANGE_EVENT, {detail: {state: next}}));
}

/**
 * Mark a challenge finished and show the reveal toast.
 * `segment` is the MDX `flagSegment` prop (displayed); falls back to the catalog word.
 */
export function revealSegment(sourceId, segment) {
  const hit = flagForSource(sourceId);
  if (!hit || typeof window === 'undefined') {
    return null;
  }
  const {flag, index, total} = hit;
  const catalogSeg = flagSegments(flag)[index];
  const seg = String(segment || catalogSeg).toUpperCase();
  if (process.env.NODE_ENV !== 'production' && segment && seg !== catalogSeg) {
    // eslint-disable-next-line no-console
    console.warn(`[lesson-flags] ${sourceId}: flagSegment "${seg}" ≠ catalog "${catalogSeg}"`);
  }
  const state = readFlagState();
  if (!state.revealed[sourceId]) {
    writeFlagState({
      ...state,
      revealed: {...state.revealed, [sourceId]: {flagId: flag.id, at: Date.now()}},
    });
  }
  const detail = {flagId: flag.id, title: flag.title, index, total, seg};
  window.dispatchEvent(new CustomEvent(LESSON_FLAG_REVEAL_EVENT, {detail}));
  return detail;
}

export function revealedCount(flag, state = readFlagState()) {
  return flag.parts.filter((p) => state.revealed[p.from]).length;
}

export function isCaptured(flagId, state = readFlagState()) {
  return Boolean(state.captured[flagId]);
}

/** Uppercase, drop whitespace, unwrap an optional `FLAG{…}`. */
function normalizeAnswer(text) {
  let s = String(text || '').trim().toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^FLAG\{(.*)\}$/);
  if (m) {
    s = m[1];
  }
  return s;
}

export function checkFlag(flagId, text) {
  const flag = getFlag(flagId);
  if (!flag) {
    return false;
  }
  return normalizeAnswer(text) === normalizeAnswer(flagString(flag));
}

/** Record a correct capture locally. Returns true when the answer is right. */
export function captureFlag(flagId, text) {
  if (!checkFlag(flagId, text)) {
    return false;
  }
  const flag = getFlag(flagId);
  markCaptured(flagId, {at: Date.now(), flag: flagString(flag), segments: flagSegments(flag)});
  return true;
}

/**
 * Merge a capture (local submit or Store sync). Captures are permanent: once a flag id is
 * captured it stays captured even if the catalog later adds/removes segments or drops the
 * flag. Keeps the earliest time and the flag as it was when first captured (snapshot).
 */
export function markCaptured(flagId, {at, flag, segments} = {}) {
  const state = readFlagState();
  const prev = state.captured[flagId];
  const when = Number(at) || Date.now();
  const incoming = {
    at: when,
    ...(flag ? {flag: String(flag)} : {}),
    ...(Array.isArray(segments) ? {segments: segments.map(String)} : {}),
  };
  let next;
  if (!prev) {
    next = incoming;
  } else if (when < prev.at) {
    next = {...prev, ...incoming};
  } else {
    // Keep prev; only fill in a missing snapshot.
    next = {...incoming, ...prev};
  }
  if (prev && JSON.stringify(prev) === JSON.stringify(next)) {
    return;
  }
  writeFlagState({...state, captured: {...state.captured, [flagId]: next}});
}

/** Normalized lesson paths whose flag is captured (drive the sidebar green rect). */
export function capturedPaths(state = readFlagState()) {
  const out = new Set();
  LESSON_FLAGS.forEach((flag) => {
    if (state.captured[flag.id]) {
      sidebarPathsFor(flag).forEach((p) => out.add(normalizePath(p)));
    }
  });
  return out;
}

export function sanitizeStudent(name) {
  return String(name || '')
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');
}

export function storeDocId(student, flagId) {
  return `${sanitizeStudent(student)}__${flagId}`;
}

/**
 * Store body for a captured flag, from the local snapshot (falls back to the current
 * catalog). Null when neither knows the flag.
 */
export function captureDoc({student, roster, flagId, at, snapshot}) {
  const flag = getFlag(flagId);
  const flagText = snapshot?.flag || (flag ? flagString(flag) : null);
  if (!flagText) {
    return null;
  }
  return {
    student: String(student),
    ...(roster ? {roster: String(roster)} : {}),
    flagId,
    flag: flagText,
    segments: snapshot?.segments || (flag ? flagSegments(flag) : []),
    completedAt: new Date(Number(at) || Date.now()).toISOString(),
  };
}
