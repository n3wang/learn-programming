/**
 * Essay Lab storage.
 *
 * Everything goes through the EssayStore interface below. Today the only
 * implementation is IndexedDB in this browser (personal mode). A future
 * competitive mode can provide a remote implementation with the same methods
 * (backed by an API) and swap it in via getEssayStore() without touching the UI.
 *
 * interface EssayStore {
 *   mode: 'local' | 'remote'
 *   getPlayer(): Promise<{id, displayName}>
 *   setDisplayName(name): Promise<Player>
 *   listEssays(): Promise<Essay[]>
 *   saveEssay(essay): Promise<Essay>
 *   deleteEssay(id): Promise<void>
 *   listProgress(): Promise<{[citationId]: Progress}>
 *   recordQuizAttempt(citationId, quizId, correct): Promise<Progress>
 *   listVotes(): Promise<{[essayId]: {score, mine}}>
 *   vote(essayId, value /* -1 | 0 | 1 *\/): Promise<void>
 * }
 */

export const ESSAY_LAB_CHANGE_EVENT = 'essay-lab-change';
export const SCHEMA_VERSION = 1;

const DB_NAME = 'learn-essay-lab';
const DB_VERSION = 1;
const STORES = {
  essays: 'essays',
  progress: 'progress',
  votes: 'votes',
  meta: 'meta',
};

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.essays)) {
        db.createObjectStore(STORES.essays, {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains(STORES.progress)) {
        db.createObjectStore(STORES.progress, {keyPath: 'citationId'});
      }
      if (!db.objectStoreNames.contains(STORES.votes)) {
        db.createObjectStore(STORES.votes, {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, {keyPath: 'key'});
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function req(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(name, mode, fn) {
  const db = await openDb();
  try {
    const tx = db.transaction(name, mode);
    // Attach completion handlers before any request runs, so the event can't be missed.
    const done = new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    const result = await fn(tx.objectStore(name));
    await done;
    return result;
  } finally {
    db.close();
  }
}

function notify(kind) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ESSAY_LAB_CHANGE_EVENT, {detail: {kind}}));
  }
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createLocalStore() {
  async function getPlayer() {
    const existing = await withStore(STORES.meta, 'readonly', (s) => req(s.get('player')));
    if (existing) {
      return existing.value;
    }
    const player = {id: newId('p'), displayName: ''};
    await withStore(STORES.meta, 'readwrite', (s) => req(s.put({key: 'player', value: player})));
    return player;
  }

  return {
    mode: 'local',

    getPlayer,

    async setDisplayName(displayName) {
      const player = {...(await getPlayer()), displayName: String(displayName || '').slice(0, 60)};
      await withStore(STORES.meta, 'readwrite', (s) => req(s.put({key: 'player', value: player})));
      notify('player');
      return player;
    },

    async listEssays() {
      const rows = await withStore(STORES.essays, 'readonly', (s) => req(s.getAll()));
      return (rows || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    },

    async saveEssay(essay) {
      const player = await getPlayer();
      const now = Date.now();
      const next = {
        status: 'draft',
        ...essay,
        schemaVersion: SCHEMA_VERSION,
        id: essay.id || newId('e'),
        authorId: essay.authorId || player.id,
        authorName: essay.authorName ?? player.displayName,
        createdAt: essay.createdAt || now,
        updatedAt: now,
      };
      if (next.status === 'published' && !next.publishedAt) {
        next.publishedAt = now;
      }
      await withStore(STORES.essays, 'readwrite', (s) => req(s.put(next)));
      notify('essays');
      return next;
    },

    async deleteEssay(id) {
      await withStore(STORES.essays, 'readwrite', (s) => req(s.delete(id)));
      notify('essays');
    },

    async listProgress() {
      const rows = await withStore(STORES.progress, 'readonly', (s) => req(s.getAll()));
      return Object.fromEntries((rows || []).map((r) => [r.citationId, r]));
    },

    async recordQuizAttempt(citationId, quizId, correct) {
      const result = await withStore(STORES.progress, 'readwrite', async (s) => {
        const prev = (await req(s.get(citationId))) || {
          citationId,
          attempts: 0,
          correct: 0,
          firstTryCorrect: null,
          unlockedAt: null,
          history: [],
        };
        const now = Date.now();
        const next = {
          ...prev,
          attempts: prev.attempts + 1,
          correct: prev.correct + (correct ? 1 : 0),
          firstTryCorrect: prev.firstTryCorrect ?? Boolean(correct),
          unlockedAt: prev.unlockedAt || (correct ? now : null),
          lastSeenAt: now,
          history: [...(prev.history || []), {quizId, correct: Boolean(correct), at: now}].slice(-50),
        };
        await req(s.put(next));
        return next;
      });
      notify('progress');
      return result;
    },

    async listVotes() {
      const player = await getPlayer();
      const rows = await withStore(STORES.votes, 'readonly', (s) => req(s.getAll()));
      const out = {};
      for (const row of rows || []) {
        const entry = out[row.essayId] || {score: 0, mine: 0};
        entry.score += row.value;
        if (row.voterId === player.id) {
          entry.mine = row.value;
        }
        out[row.essayId] = entry;
      }
      return out;
    },

    async vote(essayId, value) {
      const player = await getPlayer();
      const id = `${essayId}:${player.id}`;
      await withStore(STORES.votes, 'readwrite', (s) =>
        value === 0
          ? req(s.delete(id))
          : req(s.put({id, essayId, voterId: player.id, value: value > 0 ? 1 : -1, at: Date.now()})),
      );
      notify('votes');
    },
  };
}

let store = null;

/** Returns the active store. Swap the implementation here for competitive mode. */
export function getEssayStore() {
  if (!store) {
    store = createLocalStore();
  }
  return store;
}
