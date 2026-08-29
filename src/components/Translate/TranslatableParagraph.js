import React, { useCallback, useEffect, useRef, useState } from 'react';
import { targetLocaleFor, translateParagraph } from './translateClient';

/**
 * Drop-in replacement for the MDX `p` element. Hover a paragraph and press
 * Ctrl (or Cmd on Mac) to translate it in place — Chinese paragraphs get an
 * English translation and vice versa. Press again (or hit the ×) to hide it.
 *
 * Only wired up for plain markdown paragraphs (via MDXComponents' `p:`
 * mapping) — interactive components render their own text with MUI
 * Typography, which never goes through this override, so quiz/simulator
 * text is untouched.
 */
export default function TranslatableParagraph(props) {
  const paragraphRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | shown | error
  const [translated, setTranslated] = useState('');

  const toggle = useCallback(async () => {
    if (status === 'shown' || status === 'error') {
      setStatus('idle');
      return;
    }
    const text = paragraphRef.current ? paragraphRef.current.innerText.trim() : '';
    if (!text) return;

    setStatus('loading');
    try {
      const result = await translateParagraph(text, targetLocaleFor(text));
      setTranslated(result);
      setStatus('shown');
    } catch (e) {
      setStatus('error');
    }
  }, [status]);

  useEffect(() => {
    if (!hovered) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Control' || e.key === 'Meta') {
        toggle();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hovered, toggle]);

  return (
    <>
      <p
        {...props}
        ref={paragraphRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={hovered && status === 'idle' ? 'Hold Ctrl / Cmd to translate' : undefined}
        style={{
          outline: hovered ? '2px dashed var(--ifm-color-primary-light)' : '2px dashed transparent',
          outlineOffset: '3px',
          borderRadius: 4,
          transition: 'outline-color 0.15s ease',
        }}
      />
      {status !== 'idle' && (
        <div
          role="note"
          style={{
            position: 'relative',
            margin: '-0.5rem 0 1rem',
            padding: '0.6rem 2rem 0.6rem 0.85rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderLeft: '3px solid var(--ifm-color-primary)',
            borderRadius: 6,
            background: 'var(--ifm-background-surface-color)',
            fontSize: '0.92em',
            color: 'var(--ifm-color-emphasis-800)',
          }}
        >
          <button
            type="button"
            onClick={() => setStatus('idle')}
            aria-label="Close translation"
            style={{
              position: 'absolute',
              top: 2,
              right: 6,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              color: 'var(--ifm-color-emphasis-600)',
            }}
          >
            ×
          </button>
          {status === 'loading' && 'Translating… / 翻译中…'}
          {status === 'shown' && translated}
          {status === 'error' && 'Translation failed — try again. / 翻译失败，请重试。'}
        </div>
      )}
    </>
  );
}
