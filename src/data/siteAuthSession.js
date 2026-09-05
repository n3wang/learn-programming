/** Simple client-only auth session (no backend). Stored in sessionStorage. */

import {
  CLASS_ROSTERS,
  NAME_APPROX_OVERRIDES,
  NAME_PINYIN_OVERRIDES,
} from '@site/src/data/classRosters';

export const SITE_AUTH_STORAGE_KEY = 'site-auth-session';
export const SITE_AUTH_CHANGE_EVENT = 'site-auth-change';

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin';
export const STUDENT_PASSWORD = 'student';

/** Strip tone marks / accents so "cao" matches "Cáo". */
function foldForSearch(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function emptyAuth() {
  return {
    role: null,
    name: null,
    rosterId: null,
    rosterLabel: null,
    loggedInAt: null,
  };
}

function sanitizeAuth(raw) {
  if (!raw || typeof raw !== 'object') {
    return emptyAuth();
  }
  const role = raw.role === 'admin' || raw.role === 'student' ? raw.role : null;
  if (!role) {
    return emptyAuth();
  }
  return {
    role,
    name: raw.name ? String(raw.name) : role === 'admin' ? ADMIN_USERNAME : null,
    rosterId: raw.rosterId ? String(raw.rosterId) : null,
    rosterLabel: raw.rosterLabel ? String(raw.rosterLabel) : null,
    loggedInAt: Number(raw.loggedInAt) || Date.now(),
  };
}

export function readSiteAuth() {
  if (typeof window === 'undefined') {
    return emptyAuth();
  }
  try {
    const raw = window.sessionStorage.getItem(SITE_AUTH_STORAGE_KEY);
    if (!raw) {
      return emptyAuth();
    }
    return sanitizeAuth(JSON.parse(raw));
  } catch {
    return emptyAuth();
  }
}

function writeSiteAuth(auth) {
  const next = sanitizeAuth(auth);
  if (typeof window !== 'undefined') {
    try {
      if (!next.role) {
        window.sessionStorage.removeItem(SITE_AUTH_STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(SITE_AUTH_STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent(SITE_AUTH_CHANGE_EVENT, {detail: {auth: next}}),
    );
  }
  return next;
}

/** Flat login directory: admin + every roster student (null-safe). */
export function listLoginDirectory() {
  const rows = [
    {
      id: 'admin',
      kind: 'admin',
      name: ADMIN_USERNAME,
      rosterId: null,
      rosterLabel: 'Admin',
      pinyin: 'admin',
      approx: 'admin',
      searchText: 'admin administrator 管理员',
    },
  ];

  const rosters = CLASS_ROSTERS && typeof CLASS_ROSTERS === 'object' ? CLASS_ROSTERS : {};
  for (const roster of Object.values(rosters)) {
    if (!roster || typeof roster !== 'object') {
      continue;
    }
    const names = Array.isArray(roster.names) ? roster.names : [];
    for (const name of names) {
      if (!name || typeof name !== 'string') {
        continue;
      }
      const pinyin = NAME_PINYIN_OVERRIDES[name] || '';
      const approx = NAME_APPROX_OVERRIDES[name] || '';
      rows.push({
        id: `${roster.id || 'roster'}:${name}`,
        kind: 'student',
        name,
        rosterId: roster.id || null,
        rosterLabel: roster.label || roster.id || '',
        pinyin,
        approx,
        searchText: foldForSearch(
          [name, pinyin, approx, roster.label, roster.id].filter(Boolean).join(' '),
        ),
      });
    }
  }
  return rows;
}

export function filterLoginDirectory(query, limit = 12) {
  const raw = String(query || '').trim();
  const q = foldForSearch(raw);
  const all = listLoginDirectory();
  if (!raw) {
    return all.slice(0, Math.min(limit, all.length));
  }

  const scored = [];
  for (const row of all) {
    const name = row.name || '';
    const nameFold = foldForSearch(name);
    const pinyin = foldForSearch(row.pinyin);
    const approx = foldForSearch(row.approx);
    const roster = foldForSearch(`${row.rosterLabel || ''} ${row.rosterId || ''}`);
    const searchText = row.searchText || '';
    const hit =
      name.includes(raw) ||
      nameFold.includes(q) ||
      pinyin.includes(q) ||
      approx.includes(q) ||
      roster.includes(q) ||
      searchText.includes(q);
    if (!hit) {
      continue;
    }
    let score = 50;
    if (name === raw || nameFold === q) {
      score = 0;
    } else if (name.startsWith(raw) || nameFold.startsWith(q)) {
      score = 1;
    } else if (pinyin.startsWith(q) || approx.startsWith(q)) {
      score = 2;
    }
    scored.push({row, score});
  }
  scored.sort(
    (a, b) =>
      a.score - b.score || String(a.row.name).localeCompare(String(b.row.name), 'zh'),
  );
  return scored.slice(0, limit).map((s) => s.row);
}

/**
 * @param {{ account: object, password: string }} input
 * account from listLoginDirectory / filter results
 */
export function loginWithAccount({account, password}) {
  const pwd = String(password || '');
  if (!account || typeof account !== 'object') {
    return {ok: false, error: 'Pick a name from the list.', auth: emptyAuth()};
  }

  if (account.kind === 'admin' || account.name === ADMIN_USERNAME) {
    if (pwd !== ADMIN_PASSWORD) {
      return {ok: false, error: 'Wrong admin password.', auth: emptyAuth()};
    }
    const auth = writeSiteAuth({
      role: 'admin',
      name: ADMIN_USERNAME,
      rosterId: null,
      rosterLabel: 'Admin',
      loggedInAt: Date.now(),
    });
    return {ok: true, auth};
  }

  if (pwd !== STUDENT_PASSWORD) {
    return {ok: false, error: 'Wrong student password.', auth: emptyAuth()};
  }

  const auth = writeSiteAuth({
    role: 'student',
    name: account.name || null,
    rosterId: account.rosterId || null,
    rosterLabel: account.rosterLabel || null,
    loggedInAt: Date.now(),
  });
  return {ok: true, auth};
}

export function logoutSiteAuth() {
  return writeSiteAuth(emptyAuth());
}

export function isAdminAuth(auth = readSiteAuth()) {
  return auth?.role === 'admin';
}
