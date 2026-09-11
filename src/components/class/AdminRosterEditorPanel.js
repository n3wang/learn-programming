import React, {useCallback, useEffect, useState} from 'react';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {
  fetchRosters,
  fetchRosterTsv,
  saveRosterTsv,
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

const buttonStyle = {
  padding: '0.4rem 0.85rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-color-primary)',
  color: 'var(--ifm-color-primary-contrast-background, #fff)',
  cursor: 'pointer',
  fontWeight: 600,
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: 'transparent',
  color: 'var(--ifm-font-color-base)',
};

/**
 * Admin-only bulk roster editor (TSV / tab-separated paste).
 */
export default function AdminRosterEditorPanel() {
  const {isAdmin} = useSiteAuth();
  const [rosters, setRosters] = useState([]);
  const [rosterSlug, setRosterSlug] = useState('chuer');
  const [mode, setMode] = useState('replace');
  const [tsv, setTsv] = useState('');
  const [dirty, setDirty] = useState(false);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const loadRoster = useCallback(async (slug) => {
    if (!slug) {
      return;
    }
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const data = await fetchRosterTsv(slug);
      setTsv(typeof data?.tsv === 'string' ? data.tsv : '');
      setMeta(data);
      setDirty(false);
      setStatus(
        `Loaded ${data?.studentCount ?? 0} student(s) from ${data?.rosterLabel || slug}`,
      );
    } catch (err) {
      setError(err?.message || 'Failed to load roster TSV');
      setTsv('');
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || !rosterSlug) {
      return undefined;
    }
    loadRoster(rosterSlug);
    return undefined;
  }, [isAdmin, rosterSlug, loadRoster]);

  const onSave = async () => {
    if (!rosterSlug || saving) {
      return;
    }
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const data = await saveRosterTsv(rosterSlug, {tsv, mode});
      setTsv(typeof data?.tsv === 'string' ? data.tsv : tsv);
      setMeta(data);
      setDirty(false);
      const parts = [
        `Saved ${data?.studentCount ?? 0} active`,
        `+${data?.created ?? 0} created`,
        `${data?.updated ?? 0} updated`,
        `${data?.revived ?? 0} revived`,
        `${data?.archived ?? 0} archived`,
      ];
      setStatus(parts.join(' · '));
      if (Array.isArray(data?.warnings) && data.warnings.length > 0) {
        setStatus((prev) => `${prev}\nWarnings: ${data.warnings.join('; ')}`);
      }
    } catch (err) {
      setError(err?.message || 'Failed to save roster');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={panelStyle}>
        <p style={{margin: 0}}>
          Admin login required. Open the settings gear and sign in as{' '}
          <code>admin</code> to edit rosters.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <p style={{marginTop: 0, color: 'var(--ifm-color-emphasis-700)'}}>
        Paste or edit a <strong>tab-separated</strong> roster (Excel / Sheets copy
        works). Columns:{' '}
        <code>display_name</code>, <code>pinyin</code>,{' '}
        <code>approx_pronunciation</code>, <code>email</code>. Only{' '}
        <code>display_name</code> is required. Comma-separated paste is also
        accepted.
      </p>

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
            onChange={(e) => {
              if (dirty && !window.confirm('Discard unsaved TSV changes?')) {
                return;
              }
              setRosterSlug(e.target.value);
            }}
          >
            {rosters.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label} ({r.slug})
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Save mode
          <select
            style={selectStyle}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="replace">
              Replace — archive names missing from the text
            </option>
            <option value="merge">Merge — only add/update rows</option>
          </select>
        </label>
        <button
          type="button"
          style={secondaryButtonStyle}
          disabled={loading || saving}
          onClick={() => {
            if (dirty && !window.confirm('Reload and discard edits?')) {
              return;
            }
            loadRoster(rosterSlug);
          }}
        >
          Reload
        </button>
        <button
          type="button"
          style={buttonStyle}
          disabled={loading || saving || !dirty}
          onClick={onSave}
        >
          {saving ? 'Saving…' : 'Save roster'}
        </button>
      </div>

      {error ? (
        <p style={{color: 'var(--ifm-color-danger)', marginTop: 0}}>{error}</p>
      ) : null}
      {status ? (
        <pre
          style={{
            marginTop: 0,
            whiteSpace: 'pre-wrap',
            fontSize: '0.85rem',
            color: 'var(--ifm-color-emphasis-700)',
          }}
        >
          {status}
          {dirty ? ' · unsaved edits' : ''}
        </pre>
      ) : null}

      <textarea
        value={tsv}
        onChange={(e) => {
          setTsv(e.target.value);
          setDirty(true);
        }}
        spellCheck={false}
        disabled={loading}
        rows={18}
        style={{
          width: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.85rem',
          lineHeight: 1.45,
          padding: '0.65rem 0.75rem',
          borderRadius: 6,
          border: '1px solid var(--ifm-color-emphasis-300)',
          background: 'var(--ifm-background-color)',
          color: 'var(--ifm-font-color-base)',
          resize: 'vertical',
          tabSize: 4,
        }}
        placeholder={
          'display_name\tpinyin\tapprox_pronunciation\temail\n何昊喆\tHé Hàozhé\the how-juh\t'
        }
      />

      {meta?.rosterLabel ? (
        <p
          style={{
            marginBottom: 0,
            marginTop: '0.65rem',
            fontSize: '0.85rem',
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          Active DB roster: {meta.rosterLabel} ({meta.rosterSlug}) —{' '}
          {meta.studentCount} students
        </p>
      ) : null}
    </div>
  );
}
