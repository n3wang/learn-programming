import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  CLASS_ROSTERS,
  NAME_PINYIN_OVERRIDES,
} from '@site/src/data/classRosters';
import {pinyin} from 'pinyin-pro';
import {
  CLASS_BEHAVIOR_CHANGE_EVENT,
  getDailyBehavior,
  listBehaviorDates,
  localDateKey,
  mergeRosterWithBehavior,
} from '@site/src/data/classBehaviorDb';

function safePinyin(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  if (NAME_PINYIN_OVERRIDES[name]) {
    return NAME_PINYIN_OVERRIDES[name];
  }
  try {
    return pinyin(name, {
      toneType: 'symbol',
      type: 'array',
      mode: 'surname',
    }).join(' ');
  } catch {
    return '';
  }
}

function RosterTable({rows}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <p style={{margin: '0.5rem 0 0', color: 'var(--ifm-color-emphasis-600)'}}>
        No rows for this roster/date.
      </p>
    );
  }

  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem'}}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Pinyin</th>
            <th style={thStyle}>Points</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const name = row?.name || '—';
            const points = Number.isFinite(Number(row?.points))
              ? Number(row.points)
              : 0;
            return (
              <tr
                key={`${name}-${index}`}
                style={{
                  opacity: row?.former ? 0.65 : 1,
                  background: row?.absent
                    ? 'rgba(220, 38, 38, 0.08)'
                    : 'transparent',
                }}
              >
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>
                  {name}
                  {row?.former ? (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.75rem',
                        color: 'var(--ifm-color-emphasis-600)',
                      }}
                    >
                      (former)
                    </span>
                  ) : null}
                </td>
                <td style={tdStyle}>{safePinyin(name)}</td>
                <td style={{...tdStyle, fontVariantNumeric: 'tabular-nums'}}>
                  {points}
                </td>
                <td style={tdStyle}>{row?.absent ? 'Absent' : 'Active'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '0.45rem 0.55rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-300)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '0.4rem 0.55rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  verticalAlign: 'top',
};

export default function StudentReportsPanel() {
  const rosterIds = Object.keys(CLASS_ROSTERS || {});
  const [rosterId, setRosterId] = useState(rosterIds[0] || '');
  const [dateKey, setDateKey] = useState(localDateKey());
  const [dates, setDates] = useState([localDateKey()]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const roster = CLASS_ROSTERS[rosterId] || null;

  const refreshDates = useCallback(async () => {
    const listed = await listBehaviorDates(rosterId || null);
    const today = localDateKey();
    const merged = [...new Set([today, ...(listed || [])])].filter(Boolean);
    merged.sort().reverse();
    setDates(merged);
    setDateKey((prev) => (merged.includes(prev) ? prev : merged[0] || today));
  }, [rosterId]);

  const refreshTable = useCallback(async () => {
    setLoading(true);
    try {
      const record = await getDailyBehavior(dateKey, rosterId);
      const merged = mergeRosterWithBehavior(roster?.names || [], record);
      setRows(Array.isArray(merged) ? merged : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateKey, rosterId, roster]);

  useEffect(() => {
    refreshDates();
  }, [refreshDates]);

  useEffect(() => {
    refreshTable();
  }, [refreshTable]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const onChange = () => {
      refreshDates();
      refreshTable();
    };
    window.addEventListener(CLASS_BEHAVIOR_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CLASS_BEHAVIOR_CHANGE_EVENT, onChange);
  }, [refreshDates, refreshTable]);

  const summary = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const active = list.filter((r) => !r?.former && !r?.absent);
    const absent = list.filter((r) => !r?.former && r?.absent);
    const former = list.filter((r) => r?.former);
    const points = list
      .filter((r) => !r?.former)
      .reduce((sum, r) => sum + (Number(r?.points) || 0), 0);
    return {active: active.length, absent: absent.length, former: former.length, points};
  }, [rows]);

  if (!rosterIds.length) {
    return <p>No class rosters configured.</p>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: 12,
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'end'}}>
        <label style={{display: 'grid', gap: 4, fontSize: '0.85rem'}}>
          Roster
          <select
            value={rosterId}
            onChange={(e) => setRosterId(e.target.value)}
            style={{minWidth: 140, padding: '0.35rem 0.5rem'}}
          >
            {rosterIds.map((id) => (
              <option key={id} value={id}>
                {CLASS_ROSTERS[id]?.label || id}
              </option>
            ))}
          </select>
        </label>

        <label style={{display: 'grid', gap: 4, fontSize: '0.85rem'}}>
          Date
          <select
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            style={{minWidth: 150, padding: '0.35rem 0.5rem'}}
          >
            {(dates || []).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="button button--sm button--secondary"
          onClick={() => {
            refreshDates();
            refreshTable();
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)'}}>
        {roster?.label || 'Roster'} · active {summary.active} · absent {summary.absent}
        {summary.former ? ` · former ${summary.former}` : ''} · total points{' '}
        {summary.points}
        {loading ? ' · loading…' : ''}
      </div>

      <RosterTable rows={rows} />
    </div>
  );
}
