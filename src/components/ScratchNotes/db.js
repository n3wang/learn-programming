const DB_NAME = 'learn-scratch-notes';
const DB_VERSION = 1;
const STORE = 'notes';
const NOTE_ID = 'global';

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

export async function loadNote() {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(NOTE_ID);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function saveNote(patch) {
  const db = await openDb();
  try {
    const existing = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(NOTE_ID);
      req.onsuccess = () => resolve(req.result || {id: NOTE_ID});
      req.onerror = () => reject(req.error);
    });
    const next = {
      ...existing,
      ...patch,
      id: NOTE_ID,
      updatedAt: Date.now(),
    };
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put(next);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return next;
  } finally {
    db.close();
  }
}
