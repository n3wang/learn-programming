const DB_NAME = 'learn-programming-code';
const DB_VERSION = 1;
const STORE = 'drafts';

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

export function fnv1a(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
}

export function slugifyAnchor(text) {
    return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function makeDraftId(kind, pathname, identity) {
    return `${kind}:${fnv1a(`${pathname}\0${identity}`)}`;
}

export async function loadDraft(id) {
    const db = await openDb();
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } finally {
        db.close();
    }
}

export async function saveDraft(id, patch) {
    const db = await openDb();
    try {
        const existing = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(id);
            req.onsuccess = () => resolve(req.result || {id});
            req.onerror = () => reject(req.error);
        });
        const next = {
            ...existing,
            ...patch,
            id,
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

export async function deleteDraft(id) {
    const db = await openDb();
    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } finally {
        db.close();
    }
    notifyCodeProgress();
}

/** Progress list only after the student edits (or finishes / bookmarks). */
export function countsTowardProgress(row) {
    return Boolean(row && (row.modified || row.completed || row.bookmarked));
}

export const CODE_PROGRESS_EVENT = 'learn-code-progress';

export function notifyCodeProgress() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CODE_PROGRESS_EVENT));
    }
}

export async function listDrafts() {
    const db = await openDb();
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    } finally {
        db.close();
    }
}

/**
 * Upsert practice metadata. Does not create a progress row for untouched starters —
 * pass `modified: true` (or completed) when the student has edited the code.
 */
export async function registerPractice(id, meta) {
    const existing = await loadDraft(id);
    const modified = meta.modified != null ? Boolean(meta.modified) : Boolean(existing?.modified);
    const completed = meta.completed != null ? Boolean(meta.completed) : Boolean(existing?.completed);

    // Looking / running alone must not create a tracked entry.
    if (!existing && !modified && !completed && !meta.bookmarked) {
        return null;
    }

    const next = existing
        ? {
              ...existing,
              id,
              kind: 'practice',
              title: meta.title ?? existing.title,
              pathname: meta.pathname ?? existing.pathname,
              chapter: meta.chapter ?? existing.chapter,
              lang: meta.lang ?? existing.lang,
              plannedTotal: meta.plannedTotal ?? existing.plannedTotal,
              starter: existing.starter || meta.starter,
              hash: meta.hash || existing.hash,
              code: meta.code != null ? meta.code : existing.code,
              modified,
              completed,
          }
        : {
              id,
              code: meta.code != null ? meta.code : meta.starter || '',
              stdin: meta.stdin || '',
              kind: 'practice',
              title: meta.title,
              pathname: meta.pathname,
              chapter: meta.chapter,
              lang: meta.lang,
              plannedTotal: meta.plannedTotal,
              starter: meta.starter,
              hash: meta.hash,
              completed,
              modified,
              updatedAt: Date.now(),
          };

    const db = await openDb();
    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).put({...next, updatedAt: Date.now()});
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } finally {
        db.close();
    }
    if (countsTowardProgress(next) && (!existing || !countsTowardProgress(existing))) {
        notifyCodeProgress();
    }
    return next;
}

/** @deprecated Use registerPractice */
export const registerExam = registerPractice;

export async function markPracticeComplete(id, extra = {}) {
    const existing = await loadDraft(id);
    const already = existing?.completed;
    const next = {
        ...(existing || {id}),
        ...extra,
        kind: existing?.kind === 'exam' ? 'practice' : existing?.kind || 'practice',
        completed: true,
        modified: true,
        completedAt: already ? existing.completedAt : Date.now(),
        id,
        updatedAt: Date.now(),
    };
    const db = await openDb();
    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).put(next);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } finally {
        db.close();
    }
    notifyCodeProgress();
    return next;
}

/** @deprecated Use markPracticeComplete */
export const markExamComplete = markPracticeComplete;

export function isPracticeDraft(row) {
    return row?.kind === 'practice' || row?.kind === 'exam';
}

export async function toggleDraftBookmark(id) {
    const existing = await loadDraft(id);
    if (!existing) {
        return null;
    }
    const saved = await saveDraft(id, {
        bookmarked: !existing.bookmarked,
        code: existing.code,
        stdin: existing.stdin,
    });
    notifyCodeProgress();
    return saved;
}
