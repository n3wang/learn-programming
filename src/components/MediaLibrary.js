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
import {
  galleryButtonStyle,
  galleryCardStyle,
  galleryDangerButtonStyle,
  galleryGridStyle,
  galleryImgStyle,
  galleryImgWrapStyle,
  galleryInputStyle,
  galleryPanelStyle,
  gallerySecondaryButtonStyle,
  imageFileFromDataTransfer,
  looksLikeImageUrl,
} from '@site/src/components/mediaGallery/shared';

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
 * Admin-curated image gallery. Drop-in: `<MediaLibrary collection="unique-key" />`.
 * Empty collections are fine (no setup). Admins add/remove from the live site.
 */
export default function MediaLibrary({collection, seed = [], title}) {
  const {isAdmin, auth} = useSiteAuth();
  const siteBase = useBaseUrl('/');
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [mode, setMode] = useState('file');
  const [itemTitle, setItemTitle] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [file, setFile] = useState(null);
  const [pastePreview, setPastePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [pasteArmed, setPasteArmed] = useState(false);

  const collectionKey = String(collection || '').trim().toLowerCase();

  const clearFileSelection = useCallback(() => {
    setFile(null);
    setPastePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  }, []);

  const acceptImageFile = useCallback((nextFile, {openForm = true} = {}) => {
    if (!nextFile) return;
    setMode('file');
    if (openForm) setShowAdd(true);
    setFile(nextFile);
    setPastePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(nextFile);
    });
    setItemTitle((prev) => prev || nextFile.name.replace(/\.[^.]+$/, '') || 'Pasted image');
    setStatus('Image ready — save to upload');
    setError('');
  }, []);

  const reload = useCallback(async () => {
    if (!collectionKey) {
      setRemote([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchMediaLibrary(collectionKey, 'library');
      setRemote(Array.isArray(data) ? data : []);
    } catch (err) {
      // Resilient: new / offline galleries show empty instead of hard-failing the page.
      setRemote([]);
      setError(err?.message || 'Could not load media library');
    } finally {
      setLoading(false);
    }
  }, [collectionKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    return () => {
      if (pastePreview) URL.revokeObjectURL(pastePreview);
    };
  }, [pastePreview]);

  useEffect(() => {
    if (!isAdmin || typeof window === 'undefined') return undefined;

    const onPaste = (event) => {
      const target = event.target;
      const tag = target && target.tagName ? target.tagName.toLowerCase() : '';
      const editingText =
        tag === 'textarea' ||
        (tag === 'input' && target.type !== 'file' && target.type !== 'checkbox');

      const imageFile = imageFileFromDataTransfer(event.clipboardData);
      if (imageFile) {
        event.preventDefault();
        acceptImageFile(imageFile);
        return;
      }

      if (editingText) return;

      const text = event.clipboardData?.getData?.('text/plain')?.trim();
      if (text && looksLikeImageUrl(text)) {
        event.preventDefault();
        setShowAdd(true);
        setMode('url');
        setItemUrl(text);
        setStatus('URL pasted — save to add');
        setError('');
      }
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [isAdmin, acceptImageFile]);

  const items = useMemo(() => {
    const remoteMapped = remote.map((r) => ({
      id: r.id,
      seed: false,
      title: r.title,
      publicUrl: r.publicUrl,
      href: null,
      sourceType: r.sourceType,
      createdBy: r.createdBy,
    }));
    const seedItems = (Array.isArray(seed) ? seed : [])
      .filter((s) => s && s.url)
      .map((s, i) => ({
        id: `seed-${i}`,
        seed: true,
        title: s.title || s.alt || `Image ${i + 1}`,
        publicUrl: resolveSeedUrl(s.url, siteBase),
        href: s.href || null,
        sourceType: 'seed',
        createdBy: null,
      }));
    return [...seedItems, ...remoteMapped];
  }, [seed, siteBase, remote]);

  const resetForm = () => {
    setItemTitle('');
    setItemUrl('');
    clearFileSelection();
    setMode('file');
    setShowAdd(false);
    setPasteArmed(false);
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
        if (!file) throw new Error('Choose or paste an image');
        await uploadMediaLibraryFile({
          collection: collectionKey,
          title: itemTitle || file.name,
          adminPassword: ADMIN_PASSWORD,
          createdBy,
          file,
        });
      } else {
        const url = itemUrl.trim();
        if (!url) throw new Error('Enter an image URL or site path');
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
    setDeletingId(id);
    setError('');
    try {
      await deleteMediaLibraryItem(id, {adminPassword: ADMIN_PASSWORD});
      setStatus('Removed');
      if (lightbox?.id === id) setLightbox(null);
      await reload();
    } catch (err) {
      setError(err?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (!collectionKey) {
    return (
      <div style={galleryPanelStyle}>
        <p style={{margin: 0, color: 'var(--ifm-color-danger)'}}>
          MediaLibrary requires a <code>collection</code> prop.
        </p>
      </div>
    );
  }

  return (
    <div style={galleryPanelStyle}>
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
          <button type="button" style={galleryButtonStyle} onClick={() => setShowAdd((v) => !v)}>
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
              style={mode === 'file' ? galleryButtonStyle : gallerySecondaryButtonStyle}
              onClick={() => setMode('file')}
            >
              Upload / paste
            </button>
            <button
              type="button"
              style={mode === 'url' ? galleryButtonStyle : gallerySecondaryButtonStyle}
              onClick={() => setMode('url')}
            >
              Link / path
            </button>
          </div>
          <label style={{fontSize: '0.85rem', fontWeight: 600}}>
            Title
            <input
              style={{...galleryInputStyle, marginTop: 4}}
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="Optional title"
            />
          </label>
          {mode === 'url' ? (
            <label style={{fontSize: '0.85rem', fontWeight: 600}}>
              Image URL or site path
              <input
                style={{...galleryInputStyle, marginTop: 4}}
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                placeholder="https://… or /img/…"
                required
              />
            </label>
          ) : (
            <div
              tabIndex={0}
              onFocus={() => setPasteArmed(true)}
              onBlur={() => setPasteArmed(false)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = imageFileFromDataTransfer(e.dataTransfer);
                if (dropped) acceptImageFile(dropped, {openForm: false});
              }}
              style={{
                border: `1px dashed ${pasteArmed ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)'}`,
                borderRadius: 8,
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                background: 'var(--ifm-background-color)',
                outline: 'none',
              }}
            >
              <div style={{fontSize: '0.85rem', fontWeight: 600}}>
                Paste (⌘V / Ctrl+V), drop, or choose a file
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                  const next = e.target.files?.[0] || null;
                  if (next) acceptImageFile(next, {openForm: false});
                  else clearFileSelection();
                }}
              />
              {file && (
                <div style={{fontSize: '0.8rem', opacity: 0.8}}>
                  Ready: <code>{file.name}</code> ({Math.round(file.size / 1024)} KB)
                </div>
              )}
              {pastePreview && (
                <img
                  src={pastePreview}
                  alt="Paste preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 180,
                    objectFit: 'contain',
                    borderRadius: 6,
                    border: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                />
              )}
            </div>
          )}
          <button type="submit" style={galleryButtonStyle} disabled={saving}>
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
            ? 'Empty gallery — add or paste images. No redeploy needed.'
            : 'No images yet.'}
        </p>
      ) : (
        <div style={galleryGridStyle}>
          {items.map((item) => (
            <div key={item.id} style={galleryCardStyle}>
              <div style={galleryImgWrapStyle}>
                <img
                  src={item.publicUrl}
                  alt={item.title}
                  style={{...galleryImgStyle, cursor: 'zoom-in'}}
                  loading="lazy"
                  onClick={() => setLightbox(item)}
                />
                {isAdmin && !item.seed && (
                  <button
                    type="button"
                    style={{
                      ...galleryDangerButtonStyle,
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    }}
                    disabled={deletingId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    {deletingId === item.id ? '…' : 'Remove'}
                  </button>
                )}
              </div>
              <div style={{padding: '0.55rem 0.65rem', fontSize: '0.85rem'}}>
                <div style={{fontWeight: 600}}>{item.title}</div>
                {item.href && (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.8rem'}}>
                    Open link
                  </a>
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            gap: '0.75rem',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox.publicUrl}
            alt={lightbox.title}
            style={{maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4}}
          />
          {isAdmin && !lightbox.seed && (
            <button
              type="button"
              style={galleryDangerButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lightbox.id);
              }}
            >
              Remove from library
            </button>
          )}
        </div>
      )}
    </div>
  );
}
