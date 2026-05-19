import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';

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

export default function SiteLanguageToggle({ compact = false }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const location = useLocation();

  const switchLocale = (targetLocale) => {
    const path = location.pathname;
    let newPath;
    if (targetLocale === 'zh-Hans') {
      // en → zh-Hans: prepend /zh-Hans unless already there
      newPath = path.startsWith('/zh-Hans') ? path : `/zh-Hans${path}`;
    } else {
      // zh-Hans → en: strip the /zh-Hans prefix
      newPath = path.startsWith('/zh-Hans') ? path.slice('/zh-Hans'.length) || '/' : path;
    }
    window.location.href = newPath;
  };

  return (
    <div
      role="group"
      aria-label="Site language"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        marginBottom: compact ? '0.75rem' : 0,
      }}
    >
      <button
        type="button"
        onClick={() => switchLocale('en')}
        aria-pressed={currentLocale === 'en'}
        style={toggleButtonStyle(currentLocale === 'en')}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale('zh-Hans')}
        aria-pressed={currentLocale === 'zh-Hans'}
        style={toggleButtonStyle(currentLocale === 'zh-Hans')}
      >
        中文
      </button>
    </div>
  );
}
