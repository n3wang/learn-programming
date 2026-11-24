import React, {useEffect, useState} from 'react';

/**
 * Page heading with an optional "?" button that reveals how-to text.
 * Use with `hide_title: true` in the doc's frontmatter:
 *
 *   <PageTitle title="Gradebook">
 *   - help as markdown…
 *   </PageTitle>
 */
export default function PageTitle({title, subtitle, children}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header style={{marginBottom: '1rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
        <h1 style={{margin: 0}}>{title}</h1>
        {children ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Hide help' : 'How to use this page'}
            title={open ? 'Hide help' : 'How to use this page'}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '1px solid var(--ifm-color-emphasis-400)',
              background: open ? 'var(--ifm-color-primary)' : 'transparent',
              color: open ? '#fff' : 'var(--ifm-color-emphasis-700)',
              fontWeight: 700,
              fontSize: '0.9rem',
              lineHeight: 1,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ?
          </button>
        ) : null}
      </div>
      {subtitle ? (
        <p style={{margin: '0.3rem 0 0', color: 'var(--ifm-color-emphasis-700)'}}>{subtitle}</p>
      ) : null}
      {children && open ? (
        <div
          role="region"
          aria-label="Help"
          style={{
            marginTop: '0.6rem',
            padding: '0.6rem 0.9rem 0.1rem',
            borderLeft: '3px solid var(--ifm-color-primary)',
            borderRadius: 8,
            background: 'var(--ifm-color-emphasis-100)',
            fontSize: '0.9rem',
          }}
        >
          {children}
        </div>
      ) : null}
    </header>
  );
}
