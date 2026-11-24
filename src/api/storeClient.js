/**
 * JSON document store client for springbackend `/api/store/**`.
 * Same base URL + local → deployed fallback as party sockets and classroom APIs.
 *
 * @see apiBase.js — DEFAULT_API_BASE / REMOTE_API_BASE (springbackend.l.l0l.in)
 */

import {
  apiBaseCandidates,
  getApiBaseUrl,
  isNetworkFailure,
  rememberApiBaseUrl,
} from '@site/src/api/apiBase';

const ACTIVITY_COLLECTION = 'student_activity';

async function fetchFromBase(base, path, options) {
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 4000);
  try {
    const res = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? {'Content-Type': 'application/json'} : {}),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`Store API ${res.status}: ${text || res.statusText}`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Local Spring Boot first when configured, then deployed springbackend. */
async function storeFetch(path, options = {}) {
  const candidates = apiBaseCandidates(getApiBaseUrl());
  let lastError;
  for (let i = 0; i < candidates.length; i++) {
    try {
      const result = await fetchFromBase(candidates[i], path, options);
      if (i > 0) rememberApiBaseUrl(candidates[i]);
      return result;
    } catch (err) {
      lastError = err;
      if (!isNetworkFailure(err)) throw err;
    }
  }
  throw lastError;
}

function collectionPath(collection, id) {
  const base = `/api/store/${encodeURIComponent(collection)}`;
  return id ? `${base}/${encodeURIComponent(id)}` : base;
}

/** Local calendar day `YYYY-MM-DD` (class-day style). */
export function localDay(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function listCollections() {
  return storeFetch('/api/store');
}

export async function listDocuments(collection) {
  const data = await storeFetch(collectionPath(collection));
  return Array.isArray(data) ? data : [];
}

export async function getDocument(collection, id) {
  return storeFetch(collectionPath(collection, id));
}

export async function createDocument(collection, body) {
  return storeFetch(collectionPath(collection), {
    method: 'POST',
    body: JSON.stringify(body || {}),
  });
}

export async function replaceDocument(collection, id, body) {
  return storeFetch(collectionPath(collection, id), {
    method: 'PUT',
    body: JSON.stringify(body || {}),
  });
}

export async function patchDocument(collection, id, body) {
  return storeFetch(collectionPath(collection, id), {
    method: 'PATCH',
    body: JSON.stringify(body || {}),
  });
}

export async function deleteDocument(collection, id) {
  return storeFetch(collectionPath(collection, id), {method: 'DELETE'});
}

export async function deleteCollection(collection) {
  return storeFetch(collectionPath(collection), {method: 'DELETE'});
}

/**
 * Record one student activity event on springbackend.
 * @param {{roster: string, student: string, kind?: string, path?: string, day?: string, meta?: object}} event
 */
export async function postStudentActivity(event) {
  const {
    roster,
    student,
    kind = 'heartbeat',
    path = typeof window !== 'undefined' ? window.location.pathname : '',
    day = localDay(),
    meta,
  } = event || {};
  if (!roster || !student) {
    throw new Error('postStudentActivity requires roster and student');
  }
  return createDocument(ACTIVITY_COLLECTION, {
    roster: String(roster),
    student: String(student),
    kind: String(kind),
    path: String(path || ''),
    day: String(day),
    ...(meta && typeof meta === 'object' ? {meta} : {}),
  });
}

/** All activity docs (caller filters / aggregates for heatmap). */
export async function fetchStudentActivity() {
  return listDocuments(ACTIVITY_COLLECTION);
}

export {ACTIVITY_COLLECTION};
