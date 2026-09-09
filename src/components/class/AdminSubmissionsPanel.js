import React, {useEffect, useMemo, useState} from 'react';
import useSiteAuth from '@site/src/components/navbar/useSiteAuth';
import {
  fetchAssignments,
  fetchNotes,
  fetchRosters,
  fetchSubmissions,
} from '@site/src/api/classroomClient';

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

const thStyle = {
  textAlign: 'left',
  padding: '0.4rem 0.5rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-300)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '0.45rem 0.5rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  verticalAlign: 'top',
};

function formatWhen(value) {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function statusColor(status) {
  switch (status) {
    case 'submitted':
      return 'var(--ifm-color-primary)';
    case 'reviewed':
      return 'var(--ifm-color-success)';
    case 'draft':
      return 'var(--ifm-color-emphasis-600)';
    default:
      return 'inherit';
  }
}

/**
 * Admin-only: list submissions (default: this week) with roster / status filters.
 */
export default function AdminSubmissionsPanel() {
  const {isAdmin} = useSiteAuth();
  const [rosters, setRosters] = useState([]);
  const [rosterSlug, setRosterSlug] = useState('chuer');
  const [status, setStatus] = useState('');
  const [since, setSince] = useState('week');
  const [rows, setRows] = useState([]);
  const [assignments, setAssignments] = useState([]);
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
    const params = {
      rosterSlug: rosterSlug || undefined,
      status: status || undefined,
      since: since || undefined,
    };
    Promise.all([
      fetchSubmissions(params),
      fetchAssignments(rosterSlug || undefined),
    ])
      .then(([subs, asg]) => {
        if (cancelled) {
          return;
        }
        setRows(Array.isArray(subs) ? subs : []);
        setAssignments(Array.isArray(asg) ? asg : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setRows([]);
          setAssignments([]);
          setError(err?.message || 'Failed to load submissions');
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
  }, [isAdmin, rosterSlug, status, since]);

  const counts = useMemo(() => {
    const byStatus = {submitted: 0, reviewed: 0, draft: 0};
    for (const row of rows) {
      const key = row?.status;
      if (key && byStatus[key] != null) {
        byStatus[key] += 1;
      }
    }
    return byStatus;
  }, [rows]);

  if (!isAdmin) {
    return (
      <div style={panelStyle}>
        <p style={{margin: 0}}>
          Admin login required. Open the settings gear and sign in as{' '}
          <code>admin</code> to review submissions.
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
        <label style={labelStyle}>
          Status
          <select
            style={selectStyle}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Any</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <div style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)'}}>
          {loading
            ? 'Loading…'
            : `${rows.length} submission(s) · ${counts.submitted} new · ${counts.reviewed} reviewed · ${counts.draft} draft`}
        </div>
      </div>

      {error ? (
        <p style={{color: 'var(--ifm-color-danger)', marginTop: 0}}>{error}</p>
      ) : null}

      {assignments.length > 0 ? (
        <details style={{marginBottom: '0.85rem'}}>
          <summary style={{cursor: 'pointer', fontWeight: 600}}>
            Assignments in view ({assignments.length})
          </summary>
          <ul style={{margin: '0.5rem 0 0', paddingLeft: '1.2rem'}}>
            {assignments.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong>
                {a.day ? ` · ${a.day}` : ''}
                {a.promptMd ? (
                  <div
                    style={{
                      color: 'var(--ifm-color-emphasis-700)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {a.promptMd}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem'}}>
          <thead>
            <tr>
              <th style={thStyle}>When</th>
              <th style={thStyle}>Roster</th>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>Assignment</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Content</th>
              <th style={thStyle}>Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td style={tdStyle} colSpan={7}>
                  No submissions for this filter.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{...tdStyle, whiteSpace: 'nowrap'}}>
                  {formatWhen(row.submittedAt || row.updatedAt)}
                </td>
                <td style={tdStyle}>{row.rosterLabel || row.rosterSlug || '—'}</td>
                <td style={tdStyle}>{row.studentName || '—'}</td>
                <td style={tdStyle}>
                  {row.assignmentTitle || '—'}
                  {row.assignmentDay ? (
                    <div style={{fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)'}}>
                      {row.assignmentDay}
                    </div>
                  ) : null}
                </td>
                <td style={{...tdStyle, color: statusColor(row.status), fontWeight: 600}}>
                  {row.status}
                </td>
                <td style={tdStyle}>
                  {row.note ? <div>{row.note}</div> : null}
                  {row.linkUrl ? (
                    <div>
                      <a href={row.linkUrl} target="_blank" rel="noreferrer">
                        link
                      </a>
                    </div>
                  ) : null}
                  {row.code ? (
                    <pre
                      style={{
                        margin: '0.25rem 0 0',
                        padding: '0.4rem 0.5rem',
                        maxWidth: 360,
                        overflow: 'auto',
                        fontSize: '0.8rem',
                        background: 'var(--ifm-code-background)',
                        borderRadius: 4,
                      }}
                    >
                      {row.code}
                    </pre>
                  ) : null}
                  {Array.isArray(row.assets) && row.assets.length > 0 ? (
                    <div style={{fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-700)'}}>
                      {row.assets.map((a) => a.kind).join(', ')} asset(s)
                    </div>
                  ) : null}
                  {row.teacherFeedback ? (
                    <div style={{marginTop: 4, fontSize: '0.85rem'}}>
                      Feedback: {row.teacherFeedback}
                    </div>
                  ) : null}
                </td>
                <td style={tdStyle}>
                  {row.score != null ? row.score : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
