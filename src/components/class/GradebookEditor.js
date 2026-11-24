import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CLASS_ROSTERS} from '@site/src/data/classRosters';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {fetchStudentActivity} from '@site/src/api/storeClient';
import {getDailyBehavior, localDateKey} from '@site/src/data/classBehaviorDb';
import {
  COLUMN_TYPES,
  createGradebookWeek,
  deleteGradebookWeek,
  listGradebookWeeks,
  hasScore,
  isMark,
  newColumnId,
  weekTitle,
  parseScoreInput,
  saveGradebookWeek,
  scoreFraction,
  studentWeekTotal,
} from '@site/src/api/gradebookClient';
import {addDays, mondayOf, parseDayKey, weekRangeLabel} from '@site/src/components/class/weekUtils';
import {
  SemesterPicker,
  currentSemesterKey,
  semesterKeyOf,
  semesterLabel,
  semesterStart,
  useClassPrefs,
} from '@site/src/components/class/semester';

const SAVE_DELAY_MS = 800;
const RECENT_WEEKS = 5;

const box = {
  display: 'grid',
  gap: '0.8rem',
  padding: '1rem',
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: 12,
  background: 'var(--ifm-background-surface-color)',
};
const th = {
  padding: '0.35rem 0.4rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-300)',
  verticalAlign: 'bottom',
  whiteSpace: 'nowrap',
};
const td = {padding: '0.15rem 0.3rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)'};
const smallInput = {
  padding: '0.2rem 0.3rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
};
const scoreInput = {...smallInput, width: 56, textAlign: 'center', fontVariantNumeric: 'tabular-nums'};
const iconBtn = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '0 3px',
  fontSize: '0.8rem',
  color: 'var(--ifm-color-emphasis-700)',
};

const formatScore = (v) => (v === null || v === undefined ? '' : String(v));

/**
 * One score cell. Keeps its own text while focused (so Chinese IME input works) and
 * commits on blur / Enter. Accepts numbers, marks (优 优- 良 良- 及格 差 不及格 未交 -)
 * or shortcuts (y, y-, l, l-, j, c, b, w).
 */
function ScoreCell({value, col, onCommit, cellId, onKeyDown, onPaste, label}) {
  const [text, setText] = useState(formatScore(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(formatScore(value));
  }, [value, focused]);

  const parsed = parseScoreInput(text);
  const invalid = parsed === undefined;
  const over = typeof parsed === 'number' && parsed > col.max;
  const commit = () => {
    if (parsed === undefined) {
      setText(formatScore(value));
      return;
    }
    if (parsed !== (value ?? null)) onCommit(parsed);
    setText(formatScore(parsed));
  };
  let border = smallInput.border;
  if (invalid) border = '1px solid var(--ifm-color-danger)';
  else if (over) border = '1px solid var(--ifm-color-warning)';

  return (
    <input
      data-gb-cell={cellId}
      type="text"
      style={{...scoreInput, border, ...(isMark(parsed) ? {fontWeight: 600} : null)}}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') commit();
        if (e.key === 'Escape') setText(formatScore(value));
        onKeyDown(e);
      }}
      onPaste={onPaste}
      aria-label={label}
      title="填数字，或 优 优- 良 良- 及格 差 不及格 未交 -（快捷键：y y- l l- j c b w）"
    />
  );
}

function nextColumnName(columns, type) {
  const n = columns.filter((c) => c.type === type).length + 1;
  return `${COLUMN_TYPES[type].zh} ${n}`;
}

function focusCell(row, col) {
  const el = document.querySelector(`[data-gb-cell="${row}:${col}"]`);
  if (el) {
    el.focus();
    el.select?.();
  }
}

/** Last N weeks side by side: week headers on top, every score column editable. */
function RecentGrid({weeks, students, onCommit, onKeyDown, onPaste, onOpenWeek}) {
  const weekEdge = {borderLeft: '2px solid var(--ifm-color-emphasis-300)'};
  // Global column index per (week, column) so Enter / arrows stay in the same column.
  const colIndex = new Map();
  weeks.forEach((w) => w.columns.forEach((col) => colIndex.set(`${w._id}:${col.id}`, colIndex.size)));
  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{borderCollapse: 'collapse', fontSize: '0.85rem', display: 'table'}}>
        <thead>
          <tr>
            <th style={{...th, textAlign: 'left'}} rowSpan={2}>
              姓名
            </th>
            {weeks.map((w) => (
              <th key={w._id} colSpan={w.columns.length + 1} style={{...th, ...weekEdge, textAlign: 'center'}}>
                <button
                  type="button"
                  className="clean-btn"
                  onClick={() => onOpenWeek(w._id)}
                  title={`打开${weekTitle(w)}（${weekRangeLabel(w.weekStart)}）编辑栏目`}
                  style={{fontWeight: 700, color: 'var(--ifm-color-primary)'}}
                >
                  {weekTitle(w)}
                </button>
                <span style={{marginLeft: 6, fontWeight: 400, fontSize: '0.72rem', color: 'var(--ifm-color-emphasis-600)'}}>
                  {weekRangeLabel(w.weekStart)}
                  {w.published ? '' : ' · 未公开'}
                </span>
              </th>
            ))}
            <th style={{...th, ...weekEdge}} rowSpan={2}>
              近{weeks.length}周 %
            </th>
          </tr>
          <tr>
            {weeks.map((w) => (
              <React.Fragment key={w._id}>
                {w.columns.map((col, i) => (
                  <th
                    key={col.id}
                    title={`${COLUMN_TYPES[col.type].zh} · 满分 ${col.max}`}
                    style={{
                      ...th,
                      ...(i === 0 ? weekEdge : null),
                      borderTop: `3px solid ${COLUMN_TYPES[col.type].color}`,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  >
                    {col.name}
                  </th>
                ))}
                <th style={{...th, fontSize: '0.72rem', color: 'var(--ifm-color-emphasis-600)', ...(w.columns.length ? null : weekEdge)}}>
                  %
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((name, r) => {
            let got = 0;
            let max = 0;
            return (
              <tr key={name}>
                <td style={{...td, whiteSpace: 'nowrap', fontWeight: 500}}>{name}</td>
                {weeks.map((w) => {
                  const total = studentWeekTotal(w, name);
                  got += total.got;
                  max += total.max;
                  return (
                    <React.Fragment key={w._id}>
                      {w.columns.map((col, i) => {
                        const c = colIndex.get(`${w._id}:${col.id}`);
                        return (
                          <td key={col.id} style={{...td, textAlign: 'center', ...(i === 0 ? weekEdge : null)}}>
                            <ScoreCell
                              value={w.scores[name]?.[col.id]}
                              col={col}
                              cellId={`${r}:${c}`}
                              onCommit={(v) => onCommit(w._id, col.id, name, v)}
                              onKeyDown={(e) => onKeyDown(e, r, c)}
                              onPaste={(e) => onPaste(e, r, col, w._id)}
                              label={`${name} ${weekTitle(w)} ${col.name}`}
                            />
                          </td>
                        );
                      })}
                      <td
                        style={{
                          ...td,
                          textAlign: 'right',
                          fontSize: '0.78rem',
                          color: 'var(--ifm-color-emphasis-700)',
                          fontVariantNumeric: 'tabular-nums',
                          ...(w.columns.length ? null : weekEdge),
                        }}
                      >
                        {total.pct === null ? '—' : `${total.pct}%`}
                      </td>
                    </React.Fragment>
                  );
                })}
                <td style={{...td, ...weekEdge, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>
                  {max ? `${Math.round((got / max) * 100)}%` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function GradebookEditor() {
  const {isAdmin} = useSiteAuth();
  const rosterIds = useMemo(() => Object.keys(CLASS_ROSTERS || {}), []);
  const {rosterId, setRosterId, semester, setSemester} = useClassPrefs(rosterIds);
  const [weeks, setWeeks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ok | offline
  const [saveState, setSaveState] = useState('saved'); // saved | pending | saving | error
  const [busy, setBusy] = useState('');

  const weeksRef = useRef(weeks);
  weeksRef.current = weeks;
  const dirty = useRef(new Set());
  const timer = useRef(null);

  const roster = CLASS_ROSTERS[rosterId] || null;
  const semWeeks = useMemo(() => weeks.filter((w) => semesterKeyOf(w.weekStart) === semester), [weeks, semester]);
  const week = semWeeks.find((w) => w._id === selectedId) || null;

  // Keep a week of the chosen semester selected (latest by default).
  useEffect(() => {
    if (!semWeeks.some((w) => w._id === selectedId)) setSelectedId(semWeeks[semWeeks.length - 1]?._id || null);
  }, [semWeeks, selectedId]);
  const students = useMemo(() => {
    const names = [...(roster?.names || [])];
    for (const w of semWeeks) for (const name of Object.keys(w.scores || {})) if (!names.includes(name)) names.push(name);
    return names;
  }, [roster, semWeeks]);
  const [view, setView] = useState('recent'); // recent | week
  const recentWeeks = useMemo(() => semWeeks.slice(-RECENT_WEEKS), [semWeeks]);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const ids = [...dirty.current];
    if (!ids.length) return;
    dirty.current.clear();
    setSaveState('saving');
    try {
      for (const id of ids) {
        const doc = weeksRef.current.find((w) => w._id === id);
        if (doc) await saveGradebookWeek(doc);
      }
      setSaveState(dirty.current.size ? 'pending' : 'saved');
    } catch {
      ids.forEach((id) => dirty.current.add(id));
      setSaveState('error');
    }
  }, []);

  const updateWeek = useCallback(
    (fn, weekId) => {
      const target = weekId || selectedId;
      if (!target) return;
      setWeeks((ws) => ws.map((w) => (w._id === target ? fn(w) : w)));
      dirty.current.add(target);
      setSaveState('pending');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, SAVE_DELAY_MS);
    },
    [selectedId, flush],
  );

  const load = useCallback(async () => {
    await flush();
    setLoadState('loading');
    try {
      const list = await listGradebookWeeks(rosterId);
      setWeeks(list);
      setLoadState('ok');
    } catch {
      setLoadState('offline');
    }
  }, [rosterId, flush]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  // Save before leaving the page.
  useEffect(() => {
    const onLeave = () => {
      if (dirty.current.size) flush();
    };
    window.addEventListener('beforeunload', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      onLeave();
    };
  }, [flush]);

  if (!isAdmin) {
    return <div className="alert alert--warning">请先以管理员身份登录（右上角齿轮 → 账户）再编辑成绩册。</div>;
  }

  // ---- week actions ------------------------------------------------------

  const addWeek = async () => {
    await flush();
    const last = semWeeks[semWeeks.length - 1];
    let start;
    if (last) start = addDays(parseDayKey(last.weekStart), 7);
    else if (semester === currentSemesterKey()) start = mondayOf(new Date());
    else start = mondayOf(addDays(semesterStart(semester), 6)); // first Monday of the semester
    const template = last || weeks[weeks.length - 1];
    setBusy('正在新建…');
    try {
      const created = await createGradebookWeek({
        roster: rosterId,
        weekStart: localDateKey(start),
        title: `第${semWeeks.length + 1}周`,
        published: false,
        // Same column layout as last week, empty scores.
        columns: (template?.columns || []).map((c) => ({...c, id: newColumnId()})),
        scores: {},
        comments: {},
      });
      setWeeks((ws) => [...ws, created].sort((a, b) => a.weekStart.localeCompare(b.weekStart)));
      setSelectedId(created._id);
    } catch {
      setSaveState('error');
    }
    setBusy('');
  };

  const removeWeek = async () => {
    if (!week || !window.confirm(`删除${weekTitle(week)}（${weekRangeLabel(week.weekStart)}）及其全部成绩？`)) return;
    dirty.current.delete(week._id);
    setBusy('正在删除…');
    try {
      await deleteGradebookWeek(week);
      const rest = weeks.filter((w) => w._id !== week._id);
      setWeeks(rest);
      setSelectedId(rest[rest.length - 1]?._id || null);
    } catch {
      setSaveState('error');
    }
    setBusy('');
  };

  // ---- column actions ----------------------------------------------------

  const addColumn = (type) =>
    updateWeek((w) => ({
      ...w,
      columns: [...w.columns, {id: newColumnId(), type, name: nextColumnName(w.columns, type), max: COLUMN_TYPES[type].max}],
    }));

  const patchColumn = (id, patch) =>
    updateWeek((w) => ({...w, columns: w.columns.map((c) => (c.id === id ? {...c, ...patch} : c))}));

  const removeColumn = (col) => {
    const hasScores = Object.values(week.scores).some((row) => hasScore(row?.[col.id]));
    if (hasScores && !window.confirm(`删除栏目“${col.name}”及其成绩？`)) return;
    updateWeek((w) => {
      const scores = {};
      for (const [name, row] of Object.entries(w.scores)) {
        const {[col.id]: _drop, ...rest} = row || {};
        scores[name] = rest;
      }
      return {...w, columns: w.columns.filter((c) => c.id !== col.id), scores};
    });
  };

  const moveColumn = (index, dir) =>
    updateWeek((w) => {
      const cols = [...w.columns];
      const j = index + dir;
      if (j < 0 || j >= cols.length) return w;
      [cols[index], cols[j]] = [cols[j], cols[index]];
      return {...w, columns: cols};
    });

  const setColumnScores = (colId, valuesByName, weekId) =>
    updateWeek((w) => {
      const scores = {...w.scores};
      for (const [name, v] of Object.entries(valuesByName)) {
        const row = {...(scores[name] || {})};
        if (v === null) delete row[colId];
        else row[colId] = v;
        scores[name] = row;
      }
      return {...w, scores};
    }, weekId);

  const fillBlanksWithMax = (col) => {
    const values = {};
    for (const name of students) {
      if (!hasScore(week.scores[name]?.[col.id])) values[name] = col.max;
    }
    setColumnScores(col.id, values);
  };

  /** Behavior: half the max + Pick-student points that week. Activity: 1 pt per site activity. */
  const autoFill = async (col) => {
    setBusy(`正在填充 ${col.name}…`);
    try {
      const start = parseDayKey(week.weekStart);
      const keys = Array.from({length: 7}, (_, i) => localDateKey(addDays(start, i)));
      const values = {};
      const clamp = (v) => Math.max(0, Math.min(col.max, v));
      if (col.type === 'behavior') {
        const records = await Promise.all(keys.map((k) => getDailyBehavior(k, rosterId).catch(() => null)));
        const pts = {};
        for (const r of records) {
          for (const [name, e] of Object.entries(r?.students || {})) pts[name] = (pts[name] || 0) + (Number(e?.points) || 0);
        }
        const base = Math.round(col.max / 2);
        for (const name of students) values[name] = clamp(base + (pts[name] || 0));
      } else {
        const keySet = new Set(keys);
        const docs = await fetchStudentActivity();
        const counts = {};
        for (const d of docs) {
          if (d?.roster === rosterId && keySet.has(d.day)) counts[d.student] = (counts[d.student] || 0) + 1;
        }
        for (const name of students) values[name] = clamp(counts[name] || 0);
      }
      setColumnScores(col.id, values);
    } catch {
      window.alert('无法加载自动填充的数据（服务器离线？）。');
    }
    setBusy('');
  };

  // ---- cell editing ------------------------------------------------------


  const onCellKeyDown = (event, r, c) => {
    if (event.key === 'Enter' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusCell(r + 1, c);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusCell(r - 1, c);
    }
  };

  /** Paste a column copied from Sheets / Excel: fills downward from this cell. */
  const onCellPaste = (event, r, col, weekId) => {
    const text = event.clipboardData?.getData('text') || '';
    if (!/[\n\t]/.test(text.trim())) return;
    event.preventDefault();
    const lines = text.replace(/\r/g, '').split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    const values = {};
    lines.forEach((line, i) => {
      const name = students[r + i];
      const v = parseScoreInput(line.split('\t')[0]);
      if (name && v !== undefined) values[name] = v;
    });
    setColumnScores(col.id, values, weekId);
  };

  // ---- render ------------------------------------------------------------

  const saveLabel = {saved: '✓ 已保存', pending: '未保存…', saving: '保存中…', error: '⚠ 保存失败，点击重试'}[saveState];

  return (
    <div style={box}>
      {/* roster + week tabs */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center'}}>
        <select
          value={rosterId}
          onChange={async (e) => {
            await flush();
            setRosterId(e.target.value);
            setSelectedId(null);
          }}
          aria-label="班级"
          style={{padding: '0.3rem 0.5rem'}}
        >
          {rosterIds.map((id) => (
            <option key={id} value={id}>
              {CLASS_ROSTERS[id]?.label || id}
            </option>
          ))}
        </select>
        <SemesterPicker
          value={semester}
          years={weeks.map((w) => Number(semesterKeyOf(w.weekStart).split('-')[0]))}
          onChange={async (next) => {
            await flush();
            setSemester(next);
          }}
        />
        <span style={{display: 'inline-flex'}} role="group" aria-label="视图">
          {[
            ['recent', `最近${RECENT_WEEKS}周`],
            ['week', '单周'],
          ].map(([key, label], i) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              style={{
                padding: '0.25rem 0.6rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                marginLeft: i ? -1 : 0,
                borderRadius: i ? '0 8px 8px 0' : '8px 0 0 8px',
                background: view === key ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                color: view === key ? '#fff' : 'var(--ifm-font-color-base)',
                fontWeight: view === key ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </span>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
          {semWeeks.map((w) => (
            <button
              key={w._id}
              type="button"
              className={`button button--sm ${view === 'week' && w._id === selectedId ? 'button--primary' : 'button--secondary'}`}
              onClick={async () => {
                await flush();
                setSelectedId(w._id);
                setView('week');
              }}
              title={weekRangeLabel(w.weekStart)}
              style={{padding: '0.2rem 0.55rem'}}
            >
              {weekTitle(w)}
              {w.published ? '' : ' ·'}
            </button>
          ))}
          <button type="button" className="button button--sm button--outline button--primary" onClick={addWeek} disabled={!!busy || loadState !== 'ok'}>
            + 新的一周
          </button>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.8rem',
            color: saveState === 'error' ? 'var(--ifm-color-danger)' : 'var(--ifm-color-emphasis-600)',
            cursor: saveState === 'error' ? 'pointer' : 'default',
          }}
          onClick={saveState === 'error' ? flush : undefined}
        >
          {busy || saveLabel}
        </span>
      </div>

      {loadState === 'offline' ? (
        <div className="alert alert--danger">
          服务器离线，无法加载成绩册。{' '}
          <button type="button" className="button button--sm button--secondary" onClick={load}>
            重试
          </button>
        </div>
      ) : null}
      {loadState === 'ok' && !week ? <p style={{margin: 0}}>{semesterLabel(semester)} 这个班还没有成绩周，点击 <strong>+ 新的一周</strong>。</p> : null}

      {view === 'recent' && recentWeeks.length ? (
        <RecentGrid
          weeks={recentWeeks}
          students={students}
          onCommit={(weekId, colId, name, v) => setColumnScores(colId, {[name]: v}, weekId)}
          onKeyDown={onCellKeyDown}
          onPaste={onCellPaste}
          onOpenWeek={async (id) => {
            await flush();
            setSelectedId(id);
            setView('week');
          }}
        />
      ) : null}

      {view === 'week' && week ? (
        <>
          {/* week header */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center'}}>
            <input
              style={{...smallInput, fontWeight: 700, width: 140}}
              value={week.title}
              onChange={(e) => updateWeek((w) => ({...w, title: e.target.value}))}
              aria-label="周标题"
            />
            <label style={{fontSize: '0.85rem', display: 'inline-flex', gap: 4, alignItems: 'center'}}>
              周一日期
              <input
                type="date"
                style={smallInput}
                value={week.weekStart}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const monday = localDateKey(mondayOf(parseDayKey(e.target.value)));
                  updateWeek((w) => ({...w, weekStart: monday}));
                }}
              />
              <span style={{color: 'var(--ifm-color-emphasis-600)'}}>{weekRangeLabel(week.weekStart)}</span>
            </label>
            <label style={{fontSize: '0.85rem', display: 'inline-flex', gap: 4, alignItems: 'center'}}>
              <input type="checkbox" checked={week.published} onChange={(e) => updateWeek((w) => ({...w, published: e.target.checked}))} />
              对家长可见
            </label>
            <button type="button" className="button button--sm button--link" style={{color: 'var(--ifm-color-danger)', marginLeft: 'auto'}} onClick={removeWeek}>
              删除本周
            </button>
          </div>

          {/* quick-add columns */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', fontSize: '0.85rem'}}>
            <span style={{color: 'var(--ifm-color-emphasis-600)'}}>添加成绩：</span>
            {Object.entries(COLUMN_TYPES).map(([type, meta]) => (
              <button
                key={type}
                type="button"
                className="button button--sm button--secondary"
                style={{padding: '0.15rem 0.5rem', borderLeft: `4px solid ${meta.color}`}}
                onClick={() => addColumn(type)}
              >
                + {meta.zh}
              </button>
            ))}
          </div>

          {/* grid */}
          <div style={{overflowX: 'auto'}}>
            <table style={{borderCollapse: 'collapse', fontSize: '0.88rem', display: 'table'}}>
              <thead>
                <tr>
                  <th style={{...th, textAlign: 'left'}}>姓名</th>
                  {week.columns.map((col, ci) => {
                    const meta = COLUMN_TYPES[col.type];
                    return (
                      <th key={col.id} style={{...th, borderTop: `3px solid ${meta.color}`}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
                          <span style={{fontSize: '0.68rem', color: meta.color, fontWeight: 700}}>{meta.zh}</span>
                          <span>
                            <button type="button" style={iconBtn} title="左移" onClick={() => moveColumn(ci, -1)}>‹</button>
                            <button type="button" style={iconBtn} title="右移" onClick={() => moveColumn(ci, 1)}>›</button>
                            <button type="button" style={{...iconBtn, color: 'var(--ifm-color-danger)'}} title="删除栏目" onClick={() => removeColumn(col)}>×</button>
                          </span>
                        </div>
                        <input
                          style={{...smallInput, width: 96, fontWeight: 600}}
                          value={col.name}
                          onChange={(e) => patchColumn(col.id, {name: e.target.value})}
                          aria-label="栏目名称"
                        />
                        <div style={{display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, fontWeight: 400, fontSize: '0.75rem'}}>
                          /
                          <input
                            type="number"
                            min="1"
                            style={{...smallInput, width: 50, fontSize: '0.75rem'}}
                            value={col.max}
                            onChange={(e) => patchColumn(col.id, {max: Number(e.target.value) || 1})}
                            aria-label="满分"
                          />
                          <button type="button" style={iconBtn} title="空格填满分" onClick={() => fillBlanksWithMax(col)}>
                            =满分
                          </button>
                          {col.type === 'behavior' || col.type === 'activity' ? (
                            <button
                              type="button"
                              style={iconBtn}
                              title={
                                col.type === 'behavior'
                                  ? '自动填充：满分的一半 + 本周点名加减分（会覆盖）'
                                  : '自动填充：本周网站活动每次 1 分，不超过满分（会覆盖）'
                              }
                              onClick={() => autoFill(col)}
                            >
                              ↻自动
                            </button>
                          ) : null}
                        </div>
                      </th>
                    );
                  })}
                  <th style={{...th, textAlign: 'right'}}>合计</th>
                  <th style={{...th, textAlign: 'left'}}>评语</th>
                </tr>
              </thead>
              <tbody>
                {students.map((name, r) => {
                  const total = studentWeekTotal(week, name);
                  return (
                    <tr key={name}>
                      <td style={{...td, whiteSpace: 'nowrap', fontWeight: 500}}>{name}</td>
                      {week.columns.map((col, c) => {
                        return (
                          <td key={col.id} style={{...td, textAlign: 'center'}}>
                            <ScoreCell
                              value={week.scores[name]?.[col.id]}
                              col={col}
                              cellId={`${r}:${c}`}
                              onCommit={(v) => setColumnScores(col.id, {[name]: v})}
                              onKeyDown={(e) => onCellKeyDown(e, r, c)}
                              onPaste={(e) => onCellPaste(e, r, col)}
                              label={`${name} ${col.name}`}
                            />
                          </td>
                        );
                      })}
                      <td style={{...td, textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                        {total.max ? (
                          <>
                            <strong>{total.got}</strong>/{total.max}
                            <span style={{marginLeft: 4, color: 'var(--ifm-color-emphasis-600)', fontSize: '0.8rem'}}>{total.pct}%</span>
                          </>
                        ) : (
                          <span style={{color: 'var(--ifm-color-emphasis-500)'}}>—</span>
                        )}
                      </td>
                      <td style={td}>
                        <input
                          style={{...smallInput, width: 180}}
                          value={week.comments[name] || ''}
                          placeholder="给家长的评语"
                          onChange={(e) => updateWeek((w) => ({...w, comments: {...w.comments, [name]: e.target.value}}))}
                          aria-label={`${name} 评语`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {week.columns.length ? (
                <tfoot>
                  <tr>
                    <td style={{...td, fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)'}}>班级平均</td>
                    {week.columns.map((col) => {
                      const fracs = students
                        .map((n) => scoreFraction(week.scores[n]?.[col.id], col))
                        .filter((f) => f !== null);
                      const avg = fracs.length ? (fracs.reduce((a, b) => a + b, 0) / fracs.length) * col.max : null;
                      return (
                        <td key={col.id} style={{...td, textAlign: 'center', fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-700)'}}>
                          {avg === null ? '—' : `${Math.round(avg * 10) / 10} (${fracs.length})`}
                        </td>
                      );
                    })}
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>

        </>
      ) : null}
    </div>
  );
}
