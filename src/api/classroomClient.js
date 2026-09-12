/** Thin client for springbackend classroom APIs (`/api/classroom`). */

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  DEFAULT_API_BASE,
  apiBaseCandidates,
  getApiBaseUrl,
  isNetworkFailure,
  normalizeApiBase,
  rememberApiBaseUrl,
} from '@site/src/api/apiBase';

export {getApiBaseUrl, rememberApiBaseUrl, readStoredApiBaseUrl, isLocalApiBase} from '@site/src/api/apiBase';

export function resolveApiBaseUrl(customFields) {
  const fromConfig =
    customFields && typeof customFields.apiBaseUrl === 'string'
      ? customFields.apiBaseUrl.trim()
      : '';
  if (fromConfig) {
    return normalizeApiBase(fromConfig);
  }
  return DEFAULT_API_BASE;
}

/** Hook-friendly accessor when inside React components. */
export function useApiBaseUrl() {
  const {siteConfig} = useDocusaurusContext();
  return resolveApiBaseUrl(siteConfig?.customFields);
}

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
        ...(options.body && !(options.body instanceof FormData)
          ? {'Content-Type': 'application/json'}
          : {}),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`Classroom API ${res.status}: ${text || res.statusText}`);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) {
      return null;
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Same local → deployed retry as Piston: if the configured base is a local
 * Spring Boot that is not running, fall through to the deployed backend and
 * remember it, so every later call (and the game) goes straight there.
 */
async function classroomFetch(path, options = {}) {
  const candidates = apiBaseCandidates(getApiBaseUrl());
  let lastError;
  for (let i = 0; i < candidates.length; i++) {
    try {
      const result = await fetchFromBase(candidates[i], path, options);
      if (i > 0) rememberApiBaseUrl(candidates[i]);
      return result;
    } catch (err) {
      lastError = err;
      // A real HTTP status means we reached a backend — do not shop around.
      if (!isNetworkFailure(err)) throw err;
    }
  }
  throw lastError;
}

/** Multipart POST with the same local → remote fallback as JSON calls. */
async function classroomMultipartFetch(path, formData, options = {}) {
  const candidates = apiBaseCandidates(getApiBaseUrl());
  let lastError;
  for (let i = 0; i < candidates.length; i++) {
    const base = candidates[i];
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`Classroom API ${res.status}: ${text || res.statusText}`);
        err.status = res.status;
        throw err;
      }
      if (i > 0) rememberApiBaseUrl(base);
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      lastError = err;
      if (!isNetworkFailure(err)) throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

export async function fetchRosters() {
  return classroomFetch('/api/classroom/rosters');
}

export async function fetchStudents(rosterSlug) {
  return classroomFetch(
    `/api/classroom/rosters/${encodeURIComponent(rosterSlug)}/students`,
  );
}

export async function fetchDayStats(rosterSlug, day) {
  const params = new URLSearchParams({rosterSlug: String(rosterSlug || '')});
  if (day) {
    params.set('day', String(day));
  }
  return classroomFetch(`/api/classroom/day-stats?${params}`);
}

export async function fetchBehaviorDates(rosterSlug) {
  const params = new URLSearchParams({rosterSlug: String(rosterSlug || '')});
  const data = await classroomFetch(`/api/classroom/day-stats/dates?${params}`);
  return Array.isArray(data?.dates) ? data.dates : [];
}

export async function applyDayStat({rosterSlug, day, name, action}) {
  return classroomFetch('/api/classroom/day-stats/apply', {
    method: 'POST',
    body: JSON.stringify({
      rosterSlug,
      day: day || undefined,
      name,
      action,
    }),
  });
}

export async function fetchNotes({rosterSlug, since} = {}) {
  const params = new URLSearchParams();
  if (rosterSlug) {
    params.set('rosterSlug', String(rosterSlug));
  }
  if (since) {
    params.set('since', String(since));
  }
  const qs = params.toString();
  return classroomFetch(`/api/classroom/notes${qs ? `?${qs}` : ''}`);
}

export async function fetchAssignments(rosterSlug) {
  const params = new URLSearchParams();
  if (rosterSlug) {
    params.set('rosterSlug', String(rosterSlug));
  }
  const qs = params.toString();
  return classroomFetch(`/api/classroom/assignments${qs ? `?${qs}` : ''}`);
}

export async function fetchSubmissions({rosterSlug, status, since} = {}) {
  const params = new URLSearchParams();
  if (rosterSlug) {
    params.set('rosterSlug', String(rosterSlug));
  }
  if (status) {
    params.set('status', String(status));
  }
  if (since) {
    params.set('since', String(since));
  }
  const qs = params.toString();
  return classroomFetch(`/api/classroom/submissions${qs ? `?${qs}` : ''}`);
}

export async function fetchRosterTsv(rosterSlug) {
  return classroomFetch(
    `/api/classroom/rosters/${encodeURIComponent(rosterSlug)}/tsv`,
  );
}

export async function saveRosterTsv(rosterSlug, {tsv, mode = 'replace'} = {}) {
  return classroomFetch(
    `/api/classroom/rosters/${encodeURIComponent(rosterSlug)}/tsv`,
    {
      method: 'PUT',
      body: JSON.stringify({tsv, mode}),
      timeoutMs: 15000,
    },
  );
}

/** Returns true if the local Spring Boot classroom API responds. */
export async function pingClassroomApi() {
  try {
    await classroomFetch('/api/classroom/rosters', {timeoutMs: 1500});
    return true;
  } catch {
    return false;
  }
}

export async function fetchGamePacks(kind) {
  const params = new URLSearchParams();
  if (kind) {
    params.set('kind', String(kind));
  }
  const qs = params.toString();
  return classroomFetch(`/api/classroom/game-packs${qs ? `?${qs}` : ''}`, {
    timeoutMs: 5000,
  });
}

export async function fetchGamePack(id) {
  return classroomFetch(`/api/classroom/game-packs/${encodeURIComponent(id)}`, {
    timeoutMs: 5000,
  });
}

export async function createGamePack({kind, name, rosterSlug, ownerName, meta}) {
  return classroomFetch('/api/classroom/game-packs', {
    method: 'POST',
    body: JSON.stringify({kind, name, rosterSlug, ownerName, meta}),
    timeoutMs: 10000,
  });
}

export async function updateGamePack(id, {rosterSlug, ownerName, name, meta, published}) {
  return classroomFetch(`/api/classroom/game-packs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({rosterSlug, ownerName, name, meta, published}),
    timeoutMs: 10000,
  });
}

export async function deleteGamePack(id, {rosterSlug, ownerName}) {
  return classroomFetch(`/api/classroom/game-packs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    body: JSON.stringify({rosterSlug, ownerName}),
    timeoutMs: 10000,
  });
}

export async function uploadGamePackFile(id, {role, rosterSlug, ownerName, file}) {
  const form = new FormData();
  form.append('role', role);
  form.append('rosterSlug', rosterSlug);
  form.append('ownerName', ownerName);
  form.append('file', file);
  return classroomMultipartFetch(
    `/api/classroom/game-packs/${encodeURIComponent(id)}/files`,
    form,
    {timeoutMs: 30000},
  );
}

export function gamePackFileUrl(relativeOrAbsolute) {
  if (!relativeOrAbsolute) {
    return '';
  }
  if (/^https?:\/\//i.test(relativeOrAbsolute)) {
    return relativeOrAbsolute;
  }
  const base = getApiBaseUrl();
  return `${base}${relativeOrAbsolute.startsWith('/') ? '' : '/'}${relativeOrAbsolute}`;
}

export async function fetchMediaLibrary(collection) {
  const params = new URLSearchParams({collection: String(collection || '')});
  return classroomFetch(`/api/classroom/media-library?${params}`, {
    timeoutMs: 5000,
  });
}

export async function addMediaLibraryUrl({
  collection,
  title,
  url,
  adminPassword,
  createdBy,
  sortOrder,
}) {
  return classroomFetch('/api/classroom/media-library/url', {
    method: 'POST',
    body: JSON.stringify({
      collection,
      title,
      url,
      adminPassword,
      createdBy,
      sortOrder,
    }),
    timeoutMs: 10000,
  });
}

export async function uploadMediaLibraryFile({
  collection,
  title,
  adminPassword,
  createdBy,
  sortOrder,
  file,
}) {
  const form = new FormData();
  form.append('collection', collection);
  form.append('title', title);
  form.append('adminPassword', adminPassword);
  if (createdBy) {
    form.append('createdBy', createdBy);
  }
  if (sortOrder != null) {
    form.append('sortOrder', String(sortOrder));
  }
  form.append('file', file);
  return classroomMultipartFetch('/api/classroom/media-library/upload', form, {
    timeoutMs: 30000,
  });
}

export async function deleteMediaLibraryItem(id, {adminPassword}) {
  return classroomFetch(`/api/classroom/media-library/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    body: JSON.stringify({adminPassword}),
    timeoutMs: 10000,
  });
}
