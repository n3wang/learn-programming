import React, {useEffect, useState} from 'react';
import {
  UI_LANG_CHANGE_EVENT,
  readUiLang,
  writeUiLang,
} from '@site/src/components/Translate/translateClient';

function toggleButtonStyle(active) {
  return {
    border: '1px solid var(--ifm-color-emphasis-300)',
    background: active ? 'var(--ifm-color-primary)' : 'var(--ifm-background-surface-color)',
    color: active ? 'var(--ifm-color-white)' : 'var(--ifm-font-color-base)',
    fontWeight: active ? 700 : 500,
    borderRadius: '8px',
    fontSize: '0.85rem',
    padding: '0.3rem 0.55rem',
    lineHeight: 1,
    cursor: 'pointer',
  };
}

const OPTIONS = [
  {
    id: 'en',
    label: 'EN',
    title: 'Hover + Ctrl/Cmd: Chinese ↔ English',
  },
  {
    id: 'zh-CN',
    label: '中文',
    title: 'Hover + Ctrl/Cmd: translate into 中文 (English ↔ 中文)',
  },
  {
    id: 'es',
    label: 'ES',
    title: 'Hover + Ctrl/Cmd: translate into Spanish',
  },
];

/**
 * Sets the target language for in-page hover + Ctrl/Cmd translation only.
 * Does not open Google Translate (that breaks React’s DOM).
 */
export default function SiteLanguageToggle({compact = false}) {
  const [uiLang, setUiLang] = useState(() => readUiLang());

  useEffect(() => {
    const sync = (event) => {
      setUiLang(event?.detail?.lang || readUiLang());
    };
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);

  return (
    <div
      role="group"
      aria-label="Hover translate language"
      className="notranslate"
      translate="no"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        marginBottom: compact ? '0.75rem' : 0,
      }}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => {
            writeUiLang(opt.id);
            setUiLang(opt.id);
          }}
          aria-pressed={uiLang === opt.id}
          title={opt.title}
          style={toggleButtonStyle(uiLang === opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
