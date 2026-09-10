import React, {useEffect, useState} from 'react';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {fetchNotes, fetchRosters} from '@site/src/api/classroomClient';

const panelStyle = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  padding: '1rem 1.1rem',
  marginTop: '1rem',
  background: 'var(--ifm-background-surface-color)',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: '0.85rem',
  fontWeight: 600,
};

const selectStyle = {
  minWidth: 160,
  padding: '0.35rem 0.5rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
};

/**
 * Admin-only: student / roster notes from the classroom API.
 */
export default function AdminNotesPanel() {
  const {isAdmin} = useSiteAuth();
  const [rosters, setRosters] = useState([]);
  const [rosterSlug, setRosterSlug] = useState('chuer');
  const [since, setSince] = useState('week');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    let cancelled = false;
    fetchRosters()
      .then((data) => {
        if (!cancelled) {
          setRosters(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRosters([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchNotes({
      rosterSlug: rosterSlug || undefined,
      since: since || undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRows([]);
          setError(err?.message || 'Failed to load notes');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, rosterSlug, since]);

  if (!isAdmin) {
    return (
      <div style={panelStyle}>
        <p style={{margin: 0}}>
          Admin login required. Open the settings gear and sign in as{' '}
          <code>admin</code> to read class notes.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem 1rem',
          alignItems: 'flex-end',
          marginBottom: '0.85rem',
        }}
      >
        <label style={labelStyle}>
          Roster
          <select
            style={selectStyle}
            value={rosterSlug}
            onChange={(e) => setRosterSlug(e.target.value)}
          >
            <option value="">All rosters</option>
            {rosters.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label} ({r.slug})
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          When
          <select
            style={selectStyle}
            value={since}
            onChange={(e) => setSince(e.target.value)}
          >
            <option value="week">This week</option>
            <option value="">All time</option>
          </select>
        </label>
        <div style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)'}}>
          {loading ? 'Loading…' : `${rows.length} note(s)`}
        </div>
      </div>

      {error ? (
        <p style={{color: 'var(--ifm-color-danger)', marginTop: 0}}>{error}</p>
      ) : null}

      <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
        {rows.length === 0 && !loading ? (
          <li style={{color: 'var(--ifm-color-emphasis-600)'}}>
            No notes for this filter.
          </li>
        ) : null}
        {rows.map((row) => (
          <li
            key={row.id}
            style={{
              padding: '0.65rem 0',
              borderBottom: '1px solid var(--ifm-color-emphasis-200)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                color: 'var(--ifm-color-emphasis-700)',
                marginBottom: 4,
              }}
            >
              <span>{row.rosterLabel || row.rosterSlug}</span>
              <span>·</span>
              <span>{row.studentName || 'Whole roster'}</span>
              <span>·</span>
              <span>{row.authorRole}</span>
              <span>·</span>
              <span>
                {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
              </span>
            </div>
            <div style={{whiteSpace: 'pre-wrap'}}>{row.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
