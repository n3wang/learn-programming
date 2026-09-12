import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {ADMIN_PASSWORD} from '@site/src/data/siteAuthSession';
import {
  deleteMediaLibraryItem,
  fetchMediaLibrary,
  uploadStudentWorkFile,
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
  imageFileFromDataTransfer,
} from '@site/src/components/mediaGallery/shared';

/**
 * Student work gallery — share photos of builds / homework.
 *
 * Drop-in for any lesson: `<StudentWorkGallery collection="unique-key" />`
 * New keys start empty (no backend setup). Students upload/paste and can
 * remove their own images; admins can remove any.
 */
export default function StudentWorkGallery({collection, title}) {
  const {isAdmin, isStudent, isLoggedIn, auth} = useSiteAuth();
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [file, setFile] = useState(null);
  const [pastePreview, setPastePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [pasteArmed, setPasteArmed] = useState(false);

  const collectionKey = String(collection || '').trim().toLowerCase();
  const canSubmit = isStudent && auth?.name && auth?.rosterId;

  const clearFileSelection = useCallback(() => {
    setFile(null);
    setPastePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  }, []);

  const acceptImageFile = useCallback((nextFile, {openForm = true} = {}) => {
    if (!nextFile) return;
    if (openForm) setShowAdd(true);
    setFile(nextFile);
    setPastePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(nextFile);
    });
    setItemTitle((prev) => prev || nextFile.name.replace(/\.[^.]+$/, '') || 'My work');
    setStatus('Image ready — submit to share');
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
      const data = await fetchMediaLibrary(collectionKey, 'work');
      setRemote(Array.isArray(data) ? data : []);
    } catch (err) {
      setRemote([]);
      setError(err?.message || 'Could not load student work gallery');
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
    if (!canSubmit || typeof window === 'undefined') return undefined;

    const onPaste = (event) => {
      const imageFile = imageFileFromDataTransfer(event.clipboardData);
      if (!imageFile) return;
      event.preventDefault();
      acceptImageFile(imageFile);
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [canSubmit, acceptImageFile]);

  const items = useMemo(
    () =>
      remote.map((r) => ({
        id: r.id,
        title: r.title,
        publicUrl: r.publicUrl,
        createdBy: r.createdBy,
        rosterSlug: r.rosterSlug,
        mine:
          isStudent &&
          auth?.name &&
          auth?.rosterId &&
          String(r.createdBy || '').toLowerCase() === String(auth.name).toLowerCase() &&
          String(r.rosterSlug || '').toLowerCase() === String(auth.rosterId).toLowerCase(),
      })),
    [remote, isStudent, auth],
  );

  const resetForm = () => {
    setItemTitle('');
    clearFileSelection();
    setShowAdd(false);
    setPasteArmed(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || !collectionKey) return;
    if (!file) {
      setError('Choose or paste an image of your work');
      return;
    }
    setSaving(true);
    setStatus('');
    setError('');
    try {
      await uploadStudentWorkFile({
        collection: collectionKey,
        title: itemTitle || auth.name,
        rosterSlug: auth.rosterId,
        studentName: auth.name,
        file,
      });
      setStatus('Shared — thanks!');
      resetForm();
      await reload();
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const canRemove = (item) => isAdmin || item.mine;

  const onDelete = async (item) => {
    if (!item?.id || !canRemove(item)) return;
    const label = item.mine ? 'Remove your image?' : 'Remove this image?';
    if (!window.confirm(label)) return;
    setDeletingId(item.id);
    setError('');
    try {
      if (isAdmin) {
        await deleteMediaLibraryItem(item.id, {adminPassword: ADMIN_PASSWORD});
      } else {
        await deleteMediaLibraryItem(item.id, {
          rosterSlug: auth.rosterId,
          studentName: auth.name,
        });
      }
      setStatus('Removed');
      if (lightbox?.id === item.id) setLightbox(null);
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
          StudentWorkGallery requires a <code>collection</code> prop.
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
          <strong>{title || 'Student work'}</strong>
          <div style={{fontSize: '0.8rem', opacity: 0.75}}>
            Collection <code>{collectionKey}</code>
            {loading ? ' · loading…' : ` · ${items.length} share${items.length === 1 ? '' : 's'}`}
          </div>
        </div>
        {canSubmit && (
          <button type="button" style={galleryButtonStyle} onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? 'Cancel' : 'Share my work'}
          </button>
        )}
      </div>

      {!isLoggedIn && (
        <p style={{margin: '0.65rem 0 0', fontSize: '0.85rem', opacity: 0.8}}>
          Log in as a student to upload a photo of your work. Everyone can view the gallery.
        </p>
      )}
      {isAdmin && !canSubmit && (
        <p style={{margin: '0.65rem 0 0', fontSize: '0.85rem', opacity: 0.8}}>
          Admin: you can remove any image. Switch to a student login to upload sample work.
        </p>
      )}

      {showAdd && canSubmit && (
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
          <label style={{fontSize: '0.85rem', fontWeight: 600}}>
            Caption (optional)
            <input
              style={{...galleryInputStyle, marginTop: 4}}
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder={auth?.name || 'My work'}
            />
          </label>
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
              Paste a photo (⌘V / Ctrl+V), drop, or choose a file
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
                alt="Preview"
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
          <button type="submit" style={galleryButtonStyle} disabled={saving || !file}>
            {saving ? 'Uploading…' : 'Submit photo'}
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
          No student work yet{canSubmit ? ' — be the first to share.' : '.'}
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
                {canRemove(item) && (
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
                      onDelete(item);
                    }}
                  >
                    {deletingId === item.id ? '…' : 'Remove'}
                  </button>
                )}
              </div>
              <div style={{padding: '0.55rem 0.65rem', fontSize: '0.85rem'}}>
                <div style={{fontWeight: 600}}>{item.title}</div>
                <div style={{fontSize: '0.72rem', opacity: 0.65}}>
                  {item.createdBy || 'Student'}
                  {item.mine ? ' · you' : ''}
                </div>
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
          {canRemove(lightbox) && (
            <button
              type="button"
              style={galleryDangerButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lightbox);
              }}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
