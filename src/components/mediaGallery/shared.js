/** Shared helpers for MediaLibrary / StudentWorkGallery. */

export function extensionForMime(mime) {
  const type = String(mime || '').toLowerCase();
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
  if (type.includes('webp')) return 'webp';
  if (type.includes('gif')) return 'gif';
  return 'png';
}

/** Pull the first image File from a paste/drop event, if any. */
export function imageFileFromDataTransfer(dataTransfer) {
  if (!dataTransfer) return null;
  const items = dataTransfer.items;
  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (!blob) continue;
        const ext = extensionForMime(item.type || blob.type);
        return new File([blob], `paste-${Date.now()}.${ext}`, {
          type: item.type || blob.type || 'image/png',
        });
      }
    }
  }
  const files = dataTransfer.files;
  if (files && files.length) {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f && f.type && f.type.startsWith('image/')) {
        return f;
      }
    }
  }
  return null;
}

export function looksLikeImageUrl(text) {
  const t = String(text || '').trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t) && /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(t)) return true;
  if (/^https?:\/\//i.test(t) && /\/(proxy-image|files|img|images)\//i.test(t)) return true;
  if (t.startsWith('/') && /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(t)) return true;
  return /^https?:\/\//i.test(t);
}

export const galleryPanelStyle = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  padding: '1rem 1.1rem',
  margin: '1rem 0',
  background: 'var(--ifm-background-surface-color)',
};

export const galleryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.85rem',
  marginTop: '0.85rem',
};

export const galleryCardStyle = {
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: 8,
  overflow: 'hidden',
  background: 'var(--ifm-background-color)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

export const galleryImgWrapStyle = {
  aspectRatio: '4 / 3',
  background: 'var(--ifm-color-emphasis-100)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
};

export const galleryImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
};

export const galleryButtonStyle = {
  padding: '0.4rem 0.85rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-color-primary)',
  color: 'var(--ifm-color-primary-contrast-background, #fff)',
  cursor: 'pointer',
  fontWeight: 600,
};

export const gallerySecondaryButtonStyle = {
  ...galleryButtonStyle,
  background: 'transparent',
  color: 'var(--ifm-font-color-base)',
};

export const galleryDangerButtonStyle = {
  ...gallerySecondaryButtonStyle,
  color: '#fff',
  background: 'var(--ifm-color-danger)',
  borderColor: 'var(--ifm-color-danger)',
  fontSize: '0.75rem',
  padding: '0.3rem 0.55rem',
};

export const galleryInputStyle = {
  width: '100%',
  padding: '0.4rem 0.55rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
};
