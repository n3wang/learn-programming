/** Daily classroom behavior records (points / absent) in IndexedDB. */

export const CLASS_BEHAVIOR_DB = 'learn-class-behavior';
export const CLASS_BEHAVIOR_DB_VERSION = 1;
export const CLASS_BEHAVIOR_STORE = 'daily';
export const CLASS_BEHAVIOR_CHANGE_EVENT = 'class-behavior-change';

export const PLUS_POINTS = 1;
export const MINUS_POINTS = -1;

function req(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(CLASS_BEHAVIOR_DB, CLASS_BEHAVIOR_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CLASS_BEHAVIOR_STORE)) {
        const store = db.createObjectStore(CLASS_BEHAVIOR_STORE, {keyPath: 'id'});
        store.createIndex('byDate', 'date', {unique: false});
        store.createIndex('byRoster', 'rosterId', {unique: false});
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open behavior DB'));
  });
}

async function withStore(mode, fn) {
  const db = await openDb();
  try {
    const tx = db.transaction(CLASS_BEHAVIOR_STORE, mode);
    const store = tx.objectStore(CLASS_BEHAVIOR_STORE);
    return await fn(store);
  } finally {
    db.close();
  }
}

/** Local calendar date YYYY-MM-DD. */
export function localDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    return localDateKey(new Date());
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function behaviorRecordId(dateKey, rosterId) {
  return `${String(dateKey || '')}|${String(rosterId || '')}`;
}

function emptyRecord(dateKey, rosterId) {
  return {
    id: behaviorRecordId(dateKey, rosterId),
    date: String(dateKey || ''),
    rosterId: String(rosterId || ''),
    students: {},
    updatedAt: Date.now(),
  };
}

function sanitizeStudentEntry(raw) {
  if (!raw || typeof raw !== 'object') {
    return {points: 0, absent: false};
  }
  const points = Number(raw.points);
  return {
    points: Number.isFinite(points) ? points : 0,
    absent: Boolean(raw.absent),
  };
}

function sanitizeRecord(raw, dateKey, rosterId) {
  const base = emptyRecord(dateKey, rosterId);
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const students = {};
  const source =
    raw.students && typeof raw.students === 'object' ? raw.students : {};
  for (const [name, entry] of Object.entries(source)) {
    if (!name || typeof name !== 'string') {
      continue;
    }
    students[name] = sanitizeStudentEntry(entry);
  }
  return {
    ...base,
    id: behaviorRecordId(dateKey, rosterId),
    date: String(raw.date || dateKey || ''),
    rosterId: String(raw.rosterId || rosterId || ''),
    students,
    updatedAt: Number(raw.updatedAt) || Date.now(),
  };
}

function notifyBehaviorChange(detail) {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(CLASS_BEHAVIOR_CHANGE_EVENT, {detail: detail || {}}),
  );
}

export async function getDailyBehavior(dateKey, rosterId) {
  const date = String(dateKey || localDateKey());
  const roster = String(rosterId || '');
  try {
    const row = await withStore('readonly', (store) =>
      req(store.get(behaviorRecordId(date, roster))),
    );
    return sanitizeRecord(row, date, roster);
  } catch {
    return emptyRecord(date, roster);
  }
}

export async function saveDailyBehavior(record) {
  const date = String(record?.date || localDateKey());
  const rosterId = String(record?.rosterId || '');
  const next = sanitizeRecord(
    {...record, updatedAt: Date.now()},
    date,
    rosterId,
  );
  try {
    await withStore('readwrite', (store) => req(store.put(next)));
    notifyBehaviorChange({date, rosterId, record: next});
    return next;
  } catch {
    return next;
  }
}

export async function listBehaviorDates(rosterId = null) {
  try {
    const rows = await withStore('readonly', (store) => req(store.getAll()));
    const dates = new Set();
    for (const row of rows || []) {
      if (!row || typeof row !== 'object') {
        continue;
      }
      if (rosterId && String(row.rosterId) !== String(rosterId)) {
        continue;
      }
      if (row.date) {
        dates.add(String(row.date));
      }
    }
    return [...dates].sort().reverse();
  } catch {
    return [];
  }
}

export async function listDailyBehaviors(dateKey = null) {
  try {
    const rows = await withStore('readonly', (store) => {
      if (dateKey) {
        const index = store.index('byDate');
        return req(index.getAll(String(dateKey)));
      }
      return req(store.getAll());
    });
    return (rows || [])
      .filter((row) => row && typeof row === 'object')
      .map((row) =>
        sanitizeRecord(row, row.date || dateKey || '', row.rosterId || ''),
      );
  } catch {
    return [];
  }
}

/**
 * Apply +1 / -1 / absent for one student on a day.
 * Never throws; returns the updated (or best-effort) record.
 */
export async function applyStudentBehavior({
  dateKey = localDateKey(),
  rosterId,
  name,
  action,
}) {
  const safeName = typeof name === 'string' ? name.trim() : '';
  const safeRoster = String(rosterId || '');
  const date = String(dateKey || localDateKey());
  if (!safeName || !safeRoster) {
    return getDailyBehavior(date, safeRoster);
  }

  const current = await getDailyBehavior(date, safeRoster);
  const students = {...(current.students || {})};
  const prev = sanitizeStudentEntry(students[safeName]);

  if (action === 'absent') {
    students[safeName] = {...prev, absent: true};
  } else if (action === 'plus') {
    students[safeName] = {
      points: prev.points + PLUS_POINTS,
      absent: false,
    };
  } else if (action === 'minus') {
    students[safeName] = {
      points: prev.points + MINUS_POINTS,
      absent: false,
    };
  } else {
    return current;
  }

  return saveDailyBehavior({
    ...current,
    students,
  });
}

/** Weight: lower / closer-to-zero scores are more likely. */
export function selectionWeight(points) {
  const p = Number(points);
  const safe = Number.isFinite(p) ? p : 0;
  return Math.pow(2, -safe);
}

/**
 * Weighted random pick among roster names still in the pool.
 * Absent students excluded. Unknown/missing behavior treated as 0.
 */
export function pickWeightedStudent(rosterNames, behaviorRecord, avoidName = null) {
  const names = Array.isArray(rosterNames)
    ? rosterNames.filter((n) => typeof n === 'string' && n.trim())
    : [];
  const students =
    behaviorRecord && typeof behaviorRecord.students === 'object'
      ? behaviorRecord.students
      : {};

  const pool = names.filter((name) => {
    const entry = sanitizeStudentEntry(students[name]);
    return !entry.absent;
  });

  if (pool.length === 0) {
    return null;
  }
  if (pool.length === 1) {
    return pool[0];
  }

  const weighted = pool.map((name) => {
    const entry = sanitizeStudentEntry(students[name]);
    return {name, weight: Math.max(selectionWeight(entry.points), 1e-6)};
  });

  // Prefer not to immediately re-pick the same student when alternatives exist.
  const candidates =
    avoidName && weighted.some((w) => w.name !== avoidName)
      ? weighted.filter((w) => w.name !== avoidName)
      : weighted;

  const total = candidates.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const item of candidates) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.name;
    }
  }
  return candidates[candidates.length - 1]?.name || null;
}

/**
 * Merge a saved daily record with the current roster for display.
 * Current roster names first; leftover historical names marked former.
 */
export function mergeRosterWithBehavior(rosterNames, behaviorRecord) {
  const currentNames = Array.isArray(rosterNames)
    ? rosterNames.filter((n) => typeof n === 'string' && n)
    : [];
  const students =
    behaviorRecord && typeof behaviorRecord.students === 'object'
      ? behaviorRecord.students
      : {};

  const seen = new Set();
  const rows = [];

  for (const name of currentNames) {
    seen.add(name);
    const entry = sanitizeStudentEntry(students[name]);
    rows.push({
      name,
      points: entry.points,
      absent: entry.absent,
      former: false,
    });
  }

  for (const [name, raw] of Object.entries(students)) {
    if (!name || seen.has(name)) {
      continue;
    }
    const entry = sanitizeStudentEntry(raw);
    rows.push({
      name,
      points: entry.points,
      absent: entry.absent,
      former: true,
    });
  }

  return rows;
}
