const DB_NAME = 'learn-wiki';
const DB_VERSION = 1;
const STORE = 'progress';

export const WIKI_PROGRESS_EVENT = 'wiki-progress';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, {keyPath: 'id'});
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, fn) {
  return openDb().then(async (db) => {
    try {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      return await fn(store);
    } finally {
      db.close();
    }
  });
}

function req(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function emit() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(WIKI_PROGRESS_EVENT));
  }
}

export async function listWikiProgress() {
  const rows = await withStore('readonly', (store) => req(store.getAll()));
  const map = {};
  (rows || []).forEach((row) => {
    if (row && row.id) {
      map[row.id] = row;
    }
  });
  return map;
}

async function patchProgress(id, patch) {
  const next = await withStore('readwrite', async (store) => {
    const existing = (await req(store.get(id))) || {id};
    const row = {...existing, ...patch, id, updatedAt: Date.now()};
    await req(store.put(row));
    return row;
  });
  emit();
  return next;
}

export function markWikiViewed(id) {
  return patchProgress(id, {viewedAt: Date.now()});
}

export function markWikiStudied(id) {
  const now = Date.now();
  return patchProgress(id, {viewedAt: now, studiedAt: now});
}

export function markWikiLearned(id) {
  const now = Date.now();
  return patchProgress(id, {viewedAt: now, studiedAt: now, passedAt: now, learnedAt: now});
}

/** @deprecated use markWikiStudied / markWikiLearned */
export function markWikiPassed(id) {
  return markWikiLearned(id);
}

export async function toggleWikiBookmark(id) {
  const next = await withStore('readwrite', async (store) => {
    const existing = (await req(store.get(id))) || {id};
    const row = {
      ...existing,
      id,
      bookmarked: !existing.bookmarked,
      updatedAt: Date.now(),
    };
    await req(store.put(row));
    return row;
  });
  emit();
  return next;
}
