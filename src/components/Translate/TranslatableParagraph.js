import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  UI_LANG_CHANGE_EVENT,
  readUiLang,
  targetLocaleFor,
  translateParagraph,
} from './translateClient';

/**
 * Hover text and press Ctrl (or Cmd on Mac) to translate in place.
 * Target language comes from Settings → EN / 中文 / ES.
 *
 * @param {object} props
 * @param {'p'|'div'|'span'} [props.as='p'] Element type for the source text.
 */
export default function TranslatableParagraph({
  as: Tag = 'p',
  style,
  translateKey,
  ...props
}) {
  const paragraphRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | shown | error
  const [translated, setTranslated] = useState('');
  const [uiLang, setUiLang] = useState(() => readUiLang());

  useEffect(() => {
    const sync = (event) => {
      setUiLang(event?.detail?.lang || readUiLang());
      setStatus('idle');
      setTranslated('');
    };
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);

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
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hovered, toggle]);

  const sourceKey =
    translateKey != null
      ? String(translateKey)
      : typeof props.children === 'string' || typeof props.children === 'number'
        ? String(props.children)
        : null;
  useEffect(() => {
    setStatus('idle');
    setTranslated('');
  }, [sourceKey]);

  const hoverHint =
    uiLang === 'es'
      ? 'Hold Ctrl / Cmd to translate → ES'
      : uiLang === 'zh-CN'
        ? 'Hold Ctrl / Cmd to translate → 中文'
        : 'Hold Ctrl / Cmd to translate (中 ↔ EN)';

  return (
    <>
      <Tag
        {...props}
        ref={paragraphRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={hovered && status === 'idle' ? hoverHint : undefined}
        style={{
          ...style,
          outline: hovered ? '2px dashed var(--ifm-color-primary-light)' : '2px dashed transparent',
          outlineOffset: '3px',
          borderRadius: 4,
          transition: 'outline-color 0.15s ease',
          userSelect: 'text',
        }}
      />
      {status !== 'idle' && (
        <div
          role="note"
          className="notranslate"
          translate="no"
          lang={detectLangHint(translated)}
          style={{
            position: 'relative',
            margin: Tag === 'p' ? '-0.5rem 0 1rem' : '0.35rem 0 0.75rem',
            padding: '0.6rem 2rem 0.6rem 0.85rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderLeft: '3px solid var(--ifm-color-primary)',
            borderRadius: 6,
            background: 'var(--ifm-background-surface-color)',
            fontSize: '0.92em',
            color: 'var(--ifm-color-emphasis-800)',
            userSelect: 'text',
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
          {status === 'loading' && 'Translating… / 翻译中… / Traduciendo…'}
          {status === 'shown' && translated}
          {status === 'error' &&
            'Translation failed — try again. / 翻译失败，请重试。 / Error al traducir.'}
        </div>
      )}
    </>
  );
}

function detectLangHint(text) {
  if (!text) return undefined;
  if (/[一-鿿]/.test(text)) return 'zh-CN';
  if (/[áéíóúñü¿¡]/i.test(text)) return 'es';
  return 'en';
}
