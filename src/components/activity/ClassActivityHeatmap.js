import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CLASS_ROSTERS} from '@site/src/data/classRosters';
import {fetchStudentActivity} from '@site/src/api/storeClient';
import {
  HeatCell,
  HeatLegend,
  countByStudentDay,
  filterActivity,
  lastNDays,
} from '@site/src/components/activity/activityHeatmap';

const RANGE_OPTIONS = [7, 14, 28];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayHeader(day) {
  const [y, m, d] = day.split('-').map(Number);
  return {weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()], date: `${m}/${d}`};
}

function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? String(iso)
    : date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

const selectStyle = {
  padding: '0.3rem 0.5rem',
  borderRadius: 8,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
};

/** Professor view: roster students × days, intensity = event count. */
export default function ClassActivityHeatmap() {
  const rosters = useMemo(() => Object.values(CLASS_ROSTERS || {}), []);
  const [rosterId, setRosterId] = useState(rosters[0]?.id || '');
  const [rangeDays, setRangeDays] = useState(14);
  const [sortBy, setSortBy] = useState('name');
  const [allDocs, setAllDocs] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selected, setSelected] = useState(null); // {student, day}

  const load = useCallback(() => {
    setStatus('loading');
    fetchStudentActivity()
      .then((docs) => {
        setAllDocs(docs);
        setStatus('ok');
      })
      .catch(() => setStatus('offline'));
  }, []);

  useEffect(load, [load]);

  const roster = rosters.find((r) => r.id === rosterId);
  const days = useMemo(() => lastNDays(rangeDays), [rangeDays]);
  const docs = useMemo(
    () => filterActivity(allDocs, {roster: rosterId, days}),
    [allDocs, rosterId, days],
  );
  const grid = useMemo(() => countByStudentDay(docs), [docs]);

  const rows = useMemo(() => {
    // Roster names first, plus anyone who posted under this roster but isn't listed.
    const names = [...(roster?.names || [])];
    for (const name of Object.keys(grid)) if (!names.includes(name)) names.push(name);
    const list = names.map((name) => {
      const counts = grid[name] || {};
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      return {name, counts, total};
    });
    if (sortBy === 'total') list.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'zh'));
    else list.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    return list;
  }, [roster, grid, sortBy]);

  const selectedEvents = useMemo(() => {
    if (!selected) return [];
    return docs
      .filter((doc) => doc.student === selected.student && doc.day === selected.day)
      .sort((a, b) => String(a._createdAt || '').localeCompare(String(b._createdAt || '')));
  }, [docs, selected]);

  const activeCount = rows.filter((r) => r.total > 0).length;

  return (
    <div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem'}}>
        <select style={selectStyle} value={rosterId} onChange={(e) => { setRosterId(e.target.value); setSelected(null); }} aria-label="Roster">
          {rosters.map((r) => (
            <option key={r.id} value={r.id}>{r.label || r.id}</option>
          ))}
        </select>
        <select style={selectStyle} value={rangeDays} onChange={(e) => setRangeDays(Number(e.target.value))} aria-label="Date range">
          {RANGE_OPTIONS.map((n) => (
            <option key={n} value={n}>Last {n} days</option>
          ))}
        </select>
        <select style={selectStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="name">Sort by name</option>
          <option value="total">Sort by activity</option>
        </select>
        <button type="button" className="button button--sm button--secondary" onClick={load} disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Refresh'}
        </button>
        <span style={{marginLeft: 'auto'}}><HeatLegend /></span>
      </div>

      {status === 'offline' ? (
        <div className="alert alert--warning" style={{marginBottom: '1rem'}}>
          Backend offline — could not load <code>/api/store/student_activity</code>.
        </div>
      ) : null}

      <p style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)'}}>
        {activeCount} of {rows.length} students active · {docs.length} events in the last {rangeDays} days
      </p>

      <div style={{overflowX: 'auto'}}>
        <table style={{borderCollapse: 'collapse', fontSize: '0.8rem', display: 'table'}}>
          <thead>
            <tr>
              <th style={{textAlign: 'left', padding: '0.25rem 0.5rem'}}>Student</th>
              {days.map((day) => {
                const h = dayHeader(day);
                return (
                  <th key={day} style={{padding: '0.2rem', fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap'}}>
                    <div>{h.weekday}</div>
                    <div style={{color: 'var(--ifm-color-emphasis-600)'}}>{h.date}</div>
                  </th>
                );
              })}
              <th style={{padding: '0.25rem 0.5rem'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td style={{padding: '0.2rem 0.5rem', whiteSpace: 'nowrap'}}>{row.name}</td>
                {days.map((day) => {
                  const count = row.counts[day] || 0;
                  const isSel = selected?.student === row.name && selected?.day === day;
                  return (
                    <td key={day} style={{padding: '0.15rem', textAlign: 'center'}}>
                      <HeatCell
                        count={count}
                        size={20}
                        title={`${row.name} · ${day}: ${count}`}
                        selected={isSel}
                        onClick={() => setSelected(isSel ? null : {student: row.name, day})}
                      />
                    </td>
                  );
                })}
                <td style={{padding: '0.2rem 0.5rem', textAlign: 'right'}}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div style={{marginTop: '1rem'}}>
          <h3 style={{marginBottom: '0.4rem'}}>
            {selected.student} · {selected.day} ({selectedEvents.length})
          </h3>
          {selectedEvents.length === 0 ? (
            <p>No activity.</p>
          ) : (
            <table style={{fontSize: '0.8rem', display: 'table'}}>
              <thead>
                <tr><th>Time</th><th>Kind</th><th>Action</th><th>Path</th></tr>
              </thead>
              <tbody>
                {selectedEvents.map((doc, i) => (
                  <tr key={doc._id || i}>
                    <td>{formatTime(doc._createdAt)}</td>
                    <td>{doc.kind}</td>
                    <td>
                      {doc.meta?.action || ''}
                      {doc.meta?.actions > 1 ? ` (+${doc.meta.actions - 1})` : ''}
                    </td>
                    <td><code>{doc.path}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}
