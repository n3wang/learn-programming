/** Thin client for springbackend classroom APIs (`/api/classroom`). */

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const DEFAULT_API_BASE = 'http://localhost:8080';

export function resolveApiBaseUrl(customFields) {
  const fromConfig =
    customFields && typeof customFields.apiBaseUrl === 'string'
      ? customFields.apiBaseUrl.trim()
      : '';
  if (fromConfig) {
    return fromConfig.replace(/\/$/, '');
  }
  return DEFAULT_API_BASE;
}

/** Hook-friendly accessor when inside React components. */
export function useApiBaseUrl() {
  const {siteConfig} = useDocusaurusContext();
  return resolveApiBaseUrl(siteConfig?.customFields);
}

/**
 * Read api base without React (IndexedDB layer).
 * Prefers Root.js inject (`window.__LEARN_API_BASE_URL__`), else localhost.
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.__LEARN_API_BASE_URL__) {
    return String(window.__LEARN_API_BASE_URL__).replace(/\/$/, '');
  }
  return DEFAULT_API_BASE;
}

async function classroomFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 4000);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? {'Content-Type': 'application/json'} : {}),
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

/** Returns true if the local Spring Boot classroom API responds. */
export async function pingClassroomApi() {
  try {
    await classroomFetch('/api/classroom/rosters', {timeoutMs: 1500});
    return true;
  } catch {
    return false;
  }
}
