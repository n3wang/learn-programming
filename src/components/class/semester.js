/**
 * Two semesters per year:
 *   上半 = Feb – Jul        (key `2026-1`)
 *   下半 = Aug – next Jan   (key `2026-2`)
 * plus a remembered class + semester choice shared by the gradebook / report pages.
 */

import React, {useCallback, useEffect, useState} from 'react';
import {parseDayKey} from '@site/src/components/class/weekUtils';

const PREFS_KEY = 'class-admin-prefs';
const PREFS_EVENT = 'class-admin-prefs-change';

export function semesterKeyOf(dayKeyOrDate) {
  const d = dayKeyOrDate instanceof Date ? dayKeyOrDate : parseDayKey(dayKeyOrDate);
  const m = d.getMonth() + 1;
  if (m === 1) return `${d.getFullYear() - 1}-2`;
  return `${d.getFullYear()}-${m >= 8 ? 2 : 1}`;
}

export function currentSemesterKey() {
  return semesterKeyOf(new Date());
}

export function parseSemesterKey(key) {
  const [y, h] = String(key || currentSemesterKey()).split('-').map(Number);
  return {year: y, half: h === 1 ? 1 : 2};
}

export function semesterLabel(key) {
  const {year, half} = parseSemesterKey(key);
  return `${year} ${half === 1 ? '上半' : '下半'}`;
}

/** First calendar day of the semester. */
export function semesterStart(key) {
  const {year, half} = parseSemesterKey(key);
  return half === 1 ? new Date(year, 1, 1) : new Date(year, 7, 1);
}

function readPrefs() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(PREFS_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writePrefs(patch) {
  if (typeof window === 'undefined') return;
  const next = {...readPrefs(), ...patch};
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(PREFS_EVENT, {detail: next}));
}

/**
 * Remembered roster + semester. Roster falls back to the first one; semester defaults
 * to the current one, and a stored choice resets once a new semester begins.
 */
export function useClassPrefs(rosterIds, {preferRoster} = {}) {
  const pick = useCallback(() => {
    const prefs = readPrefs();
    const rosterId =
      (preferRoster && rosterIds.includes(preferRoster) && preferRoster) ||
      (rosterIds.includes(prefs.rosterId) && prefs.rosterId) ||
      rosterIds[0] ||
      '';
    const now = currentSemesterKey();
    const semester = prefs.semester && prefs.semesterChosenIn === now ? prefs.semester : now;
    return {rosterId, semester};
  }, [rosterIds, preferRoster]);

  const [state, setState] = useState(() => ({rosterId: rosterIds[0] || '', semester: currentSemesterKey()}));

  useEffect(() => {
    setState(pick());
    const sync = () => setState(pick());
    window.addEventListener(PREFS_EVENT, sync);
    return () => window.removeEventListener(PREFS_EVENT, sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRosterId = useCallback((rosterId) => {
    setState((s) => ({...s, rosterId}));
    writePrefs({rosterId});
  }, []);
  const setSemester = useCallback((semester) => {
    setState((s) => ({...s, semester}));
    writePrefs({semester, semesterChosenIn: currentSemesterKey()});
  }, []);

  return {...state, setRosterId, setSemester};
}

const selectStyle = {padding: '0.3rem 0.5rem'};

/** Year dropdown + 上半 / 下半 toggle. */
export function SemesterPicker({value, onChange, years}) {
  const {year, half} = parseSemesterKey(value);
  const cur = parseSemesterKey(currentSemesterKey()).year;
  const yearList = [...new Set([cur - 1, cur, year, ...(years || [])])].sort((a, b) => b - a);
  const btn = (h) => ({
    padding: '0.25rem 0.6rem',
    border: '1px solid var(--ifm-color-emphasis-300)',
    background: half === h ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
    color: half === h ? '#fff' : 'var(--ifm-font-color-base)',
    fontWeight: half === h ? 700 : 500,
    cursor: 'pointer',
    borderRadius: h === 1 ? '8px 0 0 8px' : '0 8px 8px 0',
    marginLeft: h === 2 ? -1 : 0,
  });
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      <select value={year} onChange={(e) => onChange(`${e.target.value}-${half}`)} aria-label="年份" style={selectStyle}>
        {yearList.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <span style={{display: 'inline-flex'}} role="group" aria-label="学期">
        <button type="button" style={btn(1)} onClick={() => onChange(`${year}-1`)} aria-pressed={half === 1}>
          上半
        </button>
        <button type="button" style={btn(2)} onClick={() => onChange(`${year}-2`)} aria-pressed={half === 2}>
          下半
        </button>
      </span>
    </span>
  );
}
