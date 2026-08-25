const DB_NAME = 'learn-scratch-notes';
const DB_VERSION = 2;
const STORE = 'notes';
const PREFS_ID = '__prefs';

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

export function newNoteId() {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadPrefs() {
  return withStore('readonly', (store) => req(store.get(PREFS_ID)));
}

export async function savePrefs(patch) {
  return withStore('readwrite', async (store) => {
    const existing = (await req(store.get(PREFS_ID))) || {id: PREFS_ID};
    const next = {...existing, ...patch, id: PREFS_ID};
    await req(store.put(next));
    return next;
  });
}

export async function listNotes() {
  const rows = await withStore('readonly', (store) => req(store.getAll()));
  const notes = (rows || []).filter((row) => row && row.id !== PREFS_ID && row.type !== 'prefs');
  const legacy = notes.find((row) => row.id === 'global' && row.body && !row.title);
  if (legacy) {
    const migrated = {
      id: newNoteId(),
      title: 'Note 1',
      body: legacy.body || '',
      kind: 'note',
      updatedAt: legacy.updatedAt || Date.now(),
    };
    await withStore('readwrite', async (store) => {
      await req(store.put(migrated));
      await req(store.delete('global'));
    });
    return listNotes();
  }
  return notes
    .filter((row) => row.kind === 'note' || row.body != null)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function saveNoteRecord(note) {
  const next = {
    kind: 'note',
    title: 'Untitled',
    body: '',
    ...note,
    updatedAt: Date.now(),
  };
  await withStore('readwrite', (store) => req(store.put(next)));
  return next;
}

export async function deleteNoteRecord(id) {
  await withStore('readwrite', (store) => req(store.delete(id)));
}
