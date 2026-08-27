const DB_NAME = 'learn-programming-labs';
const DB_VERSION = 1;
const STORE = 'labs';

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

export async function loadLab(id) {
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

export async function saveLab(id, patch) {
    const db = await openDb();
    try {
        const existing = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(id);
            req.onsuccess = () => resolve(req.result || {id, steps: {}});
            req.onerror = () => reject(req.error);
        });
        const next = {
            ...existing,
            ...patch,
            id,
            steps: patch.steps != null ? patch.steps : existing.steps || {},
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

export async function saveLabStep(labId, stepKey, stepData) {
    const existing = (await loadLab(labId).catch(() => null)) || {id: labId, steps: {}};
    const steps = {...(existing.steps || {}), [stepKey]: stepData};
    return saveLab(labId, {steps});
}

export function stepHasProgress(step) {
    if (!step) {
        return false;
    }
    const notes = (step.notes || '').trim();
    const images = step.images || [];
    return notes.length > 0 || images.length > 0;
}
