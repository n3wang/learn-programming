/** Shared Piston execute URL + fetch with local → remote fallback. */

export const REMOTE_PISTON_EXECUTE_URL =
  'https://piston.l.l0l.in/api/v2/execute';
export const LOCAL_PISTON_EXECUTE_URL =
  'http://127.0.0.1:2000/api/v2/execute';

export function normalizePistonExecuteUrl(url) {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/$/, '');
}

export function isLocalPistonUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === '127.0.0.1' || host === 'localhost';
  } catch {
    return false;
  }
}

/**
 * Resolve execute endpoint.
 * Order: explicit `api` prop → siteConfig customFields → remote default.
 */
export function resolvePistonExecuteUrl(api, siteConfig) {
  if (api) {
    return normalizePistonExecuteUrl(api);
  }
  const fromConfig = siteConfig?.customFields?.pistonExecuteUrl;
  if (fromConfig) {
    return normalizePistonExecuteUrl(String(fromConfig));
  }
  return REMOTE_PISTON_EXECUTE_URL;
}

export function pistonConnectUrl(executeUrl) {
  const url = new URL(executeUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = url.pathname.replace(/\/execute\/?$/, '/connect');
  return url.toString();
}

function isNetworkFailure(err) {
  if (!err) return false;
  if (err.name === 'TypeError' || err.name === 'AbortError') return true;
  return /Failed to fetch|NetworkError|ECONNREFUSED|Load failed|fetch failed/i.test(
    String(err.message || err),
  );
}

/**
 * POST (or other) to Piston. If the preferred URL is local and unreachable,
 * retry once against the deployed instance.
 */
export async function fetchPistonExecute(endpoint, init) {
  const preferred = normalizePistonExecuteUrl(endpoint) || REMOTE_PISTON_EXECUTE_URL;
  try {
    return await fetch(preferred, init);
  } catch (err) {
    if (
      isLocalPistonUrl(preferred) &&
      preferred !== REMOTE_PISTON_EXECUTE_URL &&
      isNetworkFailure(err)
    ) {
      return fetch(REMOTE_PISTON_EXECUTE_URL, init);
    }
    throw err;
  }
}
