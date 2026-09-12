/** Shared API base URL resolution for docs + static Phaser game. */

export const API_BASE_STORAGE_KEY = 'learn_api_base_url';
export const DEFAULT_API_BASE = 'http://localhost:8080';
/** Deployed springbackend — used whenever a local one is not answering. */
export const REMOTE_API_BASE = 'https://springbackend.l.l0l.in';

export function normalizeApiBase(url) {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/$/, '');
}

export function isLocalApiBase(url) {
  try {
    const host = new URL(url).hostname;
    return host === '127.0.0.1' || host === 'localhost' || host === '[::1]';
  } catch {
    return false;
  }
}

export function rememberApiBaseUrl(url) {
  const normalized = normalizeApiBase(url);
  if (!normalized || typeof window === 'undefined') return normalized;
  try {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, normalized);
  } catch {
    // private mode / blocked storage
  }
  window.__LEARN_API_BASE_URL__ = normalized;
  return normalized;
}

export function readStoredApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeApiBase(window.localStorage.getItem(API_BASE_STORAGE_KEY) || '');
  } catch {
    return '';
  }
}

/**
 * Resolve API base without React.
 * Order: window inject → localStorage → build default (localhost in dev).
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    if (window.__LEARN_API_BASE_URL__) {
      return normalizeApiBase(window.__LEARN_API_BASE_URL__);
    }
    const stored = readStoredApiBaseUrl();
    if (stored) return stored;
  }
  return DEFAULT_API_BASE;
}

/**
 * Bases to try in order. A local base is only ever a first choice — if no
 * backend is running on this machine the deployed one still answers, which is
 * what keeps a student's laptop working without a local Spring Boot.
 */
export function apiBaseCandidates(preferred = getApiBaseUrl()) {
  const first = normalizeApiBase(preferred) || DEFAULT_API_BASE;
  if (!isLocalApiBase(first) || first === REMOTE_API_BASE) return [first];
  return [first, REMOTE_API_BASE];
}

export function isNetworkFailure(err) {
  if (!err) return false;
  if (err.name === 'TypeError' || err.name === 'AbortError') return true;
  return /Failed to fetch|NetworkError|ECONNREFUSED|Load failed|fetch failed/i.test(
    String(err.message || err),
  );
}
