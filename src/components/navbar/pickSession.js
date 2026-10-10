/** Live admin pick, kept for the floating dock after the settings menu closes. */

export const PICK_SESSION_EVENT = 'class-pick-session';
const STORAGE_KEY = 'class-pick-live';

function emptyState() {
  return {open: false, byRoster: {}};
}

function sanitizeState(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const byRoster = {};
  const source = raw.byRoster && typeof raw.byRoster === 'object' ? raw.byRoster : {};
  for (const [rosterId, slot] of Object.entries(source)) {
    if (!rosterId || !slot || typeof slot !== 'object') {
      continue;
    }
    const name = typeof slot.name === 'string' ? slot.name.trim() : '';
    const recent = Array.isArray(slot.recent)
      ? slot.recent.filter((item) => typeof item === 'string' && item.trim()).slice(0, 5)
      : [];
    if (!name && recent.length === 0) {
      continue;
    }
    byRoster[rosterId] = {
      name: name || recent[0] || '',
      recent: recent.length > 0 ? recent : name ? [name] : [],
    };
  }
  return {
    open: Boolean(raw.open) && Object.keys(byRoster).length > 0,
    byRoster,
  };
}

export function readPickSession() {
  if (typeof sessionStorage === 'undefined') {
    return emptyState();
  }
  try {
    return sanitizeState(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return emptyState();
  }
}

function writePickSession(next) {
  const safe = sanitizeState(next);
  if (typeof sessionStorage !== 'undefined') {
    if (!safe.open) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PICK_SESSION_EVENT, {detail: safe}));
  }
  return safe;
}

/** Remember a draw for this course and open the dock. */
export function rememberPick({rosterId, name}) {
  const safeRoster = String(rosterId || '');
  const safeName = typeof name === 'string' ? name.trim() : '';
  if (!safeRoster || !safeName) {
    return readPickSession();
  }
  const prev = readPickSession();
  const slot = prev.byRoster[safeRoster] || {name: '', recent: []};
  const recent = [safeName, ...slot.recent.filter((item) => item !== safeName)].slice(0, 5);
  return writePickSession({
    open: true,
    byRoster: {
      ...prev.byRoster,
      [safeRoster]: {name: safeName, recent},
    },
  });
}

export function clearPickSession() {
  return writePickSession(emptyState());
}
