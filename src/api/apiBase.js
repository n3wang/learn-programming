/** Shared API base URL resolution for docs + static Phaser game. */

export const API_BASE_STORAGE_KEY = 'learn_api_base_url';
export const DEFAULT_API_BASE = 'http://localhost:8080';

export function normalizeApiBase(url) {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/$/, '');
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
