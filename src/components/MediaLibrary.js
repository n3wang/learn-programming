import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {ADMIN_PASSWORD} from '@site/src/data/siteAuthSession';
import {
  addMediaLibraryUrl,
  deleteMediaLibraryItem,
  fetchMediaLibrary,
  uploadMediaLibraryFile,
} from '@site/src/api/classroomClient';

const panelStyle = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  padding: '1rem 1.1rem',
  margin: '1rem 0',
  background: 'var(--ifm-background-surface-color)',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.85rem',
  marginTop: '0.85rem',
};

const cardStyle = {
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: 8,
  overflow: 'hidden',
  background: 'var(--ifm-background-color)',
  display: 'flex',
  flexDirection: 'column',
};

const imgWrapStyle = {
  aspectRatio: '4 / 3',
  background: 'var(--ifm-color-emphasis-100)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
};

const metaStyle = {
  padding: '0.55rem 0.65rem',
  fontSize: '0.85rem',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
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

const dangerButtonStyle = {
  ...secondaryButtonStyle,
  color: 'var(--ifm-color-danger)',
  borderColor: 'var(--ifm-color-danger)',
  fontSize: '0.75rem',
  padding: '0.25rem 0.5rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.4rem 0.55rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
};

function resolveSeedUrl(url, siteBase) {
  if (!url) return '';
  if (typeof url === 'object' && url.default) {
    return String(url.default);
  }
  const s = String(url);
  if (/^https?:\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) {
    return s;
  }
  if (s.startsWith('/')) {
    const base = String(siteBase || '/').replace(/\/$/, '');
    return `${base}${s}`;
  }
  return s;
}

/**
 * Dynamic image gallery keyed by `collection`.
 *
 * Drop-in for lessons: `<MediaLibrary collection="my-unique-key" />`.
 * Images are loaded/saved via Spring (local or https://springbackend.l.l0l.in)
 * and file uploads go to c.l.l0l.in / Koofr under `media-{collection}`.
 * Admins manage the gallery from the live site — no redeploy needed.
 *
 * Optional `seed` is only for one-off static placeholders during authoring.
 *
 * @param {string} collection Unique collection key (e.g. "edmodels")
 * @param {Array<{title?: string, url: string, href?: string}>} [seed]
 * @param {string} [title] Optional heading
 */
export default function MediaLibrary({collection, seed = [], title}) {
  const {isAdmin, auth} = useSiteAuth();
  const siteBase = useBaseUrl('/');
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [mode, setMode] = useState('url'); // url | file
  const [itemTitle, setItemTitle] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const collectionKey = String(collection || '').trim().toLowerCase();

  const seedItems = useMemo(() => {
    return (Array.isArray(seed) ? seed : [])
      .filter((s) => s && s.url)
      .map((s, i) => ({
        id: `seed-${i}`,
        seed: true,
        title: s.title || s.alt || `Image ${i + 1}`,
        publicUrl: resolveSeedUrl(s.url, siteBase),
        href: s.href || null,
        sourceType: 'seed',
      }));
  }, [seed, siteBase]);

  const reload = useCallback(async () => {
    if (!collectionKey) {
      setRemote([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchMediaLibrary(collectionKey);
      setRemote(Array.isArray(data) ? data : []);
    } catch (err) {
      setRemote([]);
      setError(err?.message || 'Could not load media library');
    } finally {
      setLoading(false);
    }
  }, [collectionKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const items = useMemo(() => {
    const remoteMapped = remote.map((r) => ({
      id: r.id,
      seed: false,
      title: r.title,
      publicUrl: r.publicUrl,
      href: null,
      sourceType: r.sourceType,
    }));
    return [...seedItems, ...remoteMapped];
  }, [seedItems, remote]);

  const resetForm = () => {
    setItemTitle('');
    setItemUrl('');
    setFile(null);
    setMode('url');
    setShowAdd(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin || !collectionKey) return;
    setSaving(true);
    setStatus('');
    setError('');
    try {
      const createdBy = auth?.name || 'admin';
      if (mode === 'file') {
        if (!file) {
          throw new Error('Choose an image file');
        }
        await uploadMediaLibraryFile({
          collection: collectionKey,
          title: itemTitle || file.name,
          adminPassword: ADMIN_PASSWORD,
          createdBy,
          file,
        });
      } else {
        const url = itemUrl.trim();
        if (!url) {
          throw new Error('Enter an image URL or site path');
        }
        await addMediaLibraryUrl({
          collection: collectionKey,
          title: itemTitle || 'Untitled',
          url,
          adminPassword: ADMIN_PASSWORD,
          createdBy,
        });
      }
      setStatus('Added to library');
      resetForm();
      await reload();
    } catch (err) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!isAdmin || !id || String(id).startsWith('seed-')) return;
    if (!window.confirm('Remove this image from the library?')) return;
    setError('');
    try {
      await deleteMediaLibraryItem(id, {adminPassword: ADMIN_PASSWORD});
      setStatus('Removed');
      await reload();
    } catch (err) {
      setError(err?.message || 'Delete failed');
    }
  };

  if (!collectionKey) {
    return (
      <div style={panelStyle}>
        <p style={{margin: 0, color: 'var(--ifm-color-danger)'}}>
          MediaLibrary requires a <code>collection</code> prop.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <strong>{title || 'Image library'}</strong>
          <div style={{fontSize: '0.8rem', opacity: 0.75}}>
            Collection <code>{collectionKey}</code>
            {loading ? ' · loading…' : ` · ${items.length} item${items.length === 1 ? '' : 's'}`}
          </div>
        </div>
        {isAdmin && (
          <button
            type="button"
            style={buttonStyle}
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? 'Cancel' : 'Add image'}
          </button>
        )}
      </div>

      {showAdd && isAdmin && (
        <form
          onSubmit={onSubmit}
          style={{
            marginTop: '0.85rem',
            padding: '0.85rem',
            border: '1px dashed var(--ifm-color-emphasis-300)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
            <button
              type="button"
              style={mode === 'url' ? buttonStyle : secondaryButtonStyle}
              onClick={() => setMode('url')}
            >
              Link / path
            </button>
            <button
              type="button"
              style={mode === 'file' ? buttonStyle : secondaryButtonStyle}
              onClick={() => setMode('file')}
            >
              Upload file
            </button>
          </div>
          <label style={{fontSize: '0.85rem', fontWeight: 600}}>
            Title
            <input
              style={{...inputStyle, marginTop: 4}}
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="Optional title"
            />
          </label>
          {mode === 'url' ? (
            <label style={{fontSize: '0.85rem', fontWeight: 600}}>
              Image URL or site path
              <input
                style={{...inputStyle, marginTop: 4}}
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                placeholder="https://… or /img/…"
                required
              />
            </label>
          ) : (
            <label style={{fontSize: '0.85rem', fontWeight: 600}}>
              Image file
              <input
                style={{marginTop: 4}}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>
          )}
          <div style={{fontSize: '0.75rem', opacity: 0.75}}>
            Saved to the backend under collection <code>{collectionKey}</code>
            (uploads → Koofr key <code>media-{collectionKey}</code>). Visible on
            local and deployed site without another static deploy.
          </div>
          <button type="submit" style={buttonStyle} disabled={saving}>
            {saving ? 'Saving…' : 'Save to library'}
          </button>
        </form>
      )}

      {error && (
        <p style={{margin: '0.65rem 0 0', color: 'var(--ifm-color-danger)', fontSize: '0.85rem'}}>
          {error}
        </p>
      )}
      {status && !error && (
        <p style={{margin: '0.65rem 0 0', color: 'var(--ifm-color-success)', fontSize: '0.85rem'}}>
          {status}
        </p>
      )}

      {items.length === 0 && !loading ? (
        <p style={{margin: '0.85rem 0 0', opacity: 0.75}}>
          {isAdmin
            ? 'Empty collection — use Add image to paste a URL or upload a file. Changes apply immediately on the live site.'
            : 'No images in this collection yet.'}
        </p>
      ) : (
        <div style={gridStyle}>
          {items.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={imgWrapStyle}>
                <img
                  src={item.publicUrl}
                  alt={item.title}
                  style={{...imgStyle, cursor: 'zoom-in'}}
                  loading="lazy"
                  onClick={() => setLightbox(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setLightbox(item);
                  }}
                  role="button"
                  tabIndex={0}
                />
              </div>
              <div style={metaStyle}>
                <span style={{fontWeight: 600}}>{item.title}</span>
                <span style={{fontSize: '0.72rem', opacity: 0.65}}>
                  {item.sourceType}
                </span>
                {item.href && (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.8rem'}}>
                    Open link
                  </a>
                )}
                {isAdmin && !item.seed && (
                  <button type="button" style={dangerButtonStyle} onClick={() => onDelete(item.id)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox.publicUrl}
            alt={lightbox.title}
            style={{maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 4}}
          />
        </div>
      )}
    </div>
  );
}
