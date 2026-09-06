import React, {useEffect, useMemo, useState} from 'react';
import {useLocation} from '@docusaurus/router';
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

const PAGE_OPTIONS = [
  {id: 'en', label: 'EN', title: 'Show original English page'},
  {id: 'zh-CN', label: '中文', title: 'Translate this whole page to 中文'},
  {id: 'es', label: 'ES', title: 'Translate this whole page to Spanish'},
];

const HOVER_OPTIONS = [
  {
    id: 'en',
    label: 'EN',
    title: 'Hover + Ctrl/Cmd: Chinese ↔ English',
  },
  {
    id: 'zh-CN',
    label: '中文',
    title: 'Hover + Ctrl/Cmd: translate into 中文',
  },
  {
    id: 'es',
    label: 'ES',
    title: 'Hover + Ctrl/Cmd: translate into Spanish',
  },
];

function getCanonicalPath(pathname) {
  return pathname.startsWith('/zh-Hans')
    ? pathname.slice('/zh-Hans'.length) || '/'
    : pathname;
}

/** learn-l-l0l-in.translate.goog → learn.l.l0l.in */
function decodeTranslateGoogHost(hostname) {
  const slug = hostname.replace(/\.translate\.goog$/i, '');
  return slug.replace(/--/g, '\0').replace(/-/g, '.').replace(/\0/g, '-');
}

/** Absolute URL of the original (non-translated) page. */
function getOriginalPageUrl(location) {
  const path = `${getCanonicalPath(location.pathname)}${location.search}${location.hash}`;
  const host = window.location.hostname;

  if (host.endsWith('.translate.goog')) {
    const originalHost = decodeTranslateGoogHost(host);
    return `${window.location.protocol}//${originalHost}${path}`;
  }

  if (host.includes('translate.google.')) {
    try {
      const u = new URLSearchParams(window.location.search).get('u');
      if (u) {
        const parsed = new URL(u);
        return `${parsed.origin}${getCanonicalPath(parsed.pathname)}${parsed.search}${parsed.hash || location.hash}`;
      }
    } catch {
      // fall through
    }
  }

  return `${window.location.origin}${path}`;
}

function getGoogleTranslateUrl(pageUrl, tl) {
  return (
    'https://translate.google.com/translate' +
    `?sl=auto&tl=${encodeURIComponent(tl)}&u=${encodeURIComponent(pageUrl)}`
  );
}

/** Detect which whole-page language is active from the current URL. */
export function detectPageTranslateLang() {
  if (typeof window === 'undefined') return 'en';
  const host = window.location.hostname;

  if (host.endsWith('.translate.goog') || host.includes('translate.google.')) {
    try {
      const params = new URLSearchParams(window.location.search);
      const tl = params.get('_x_tr_tl') || params.get('tl');
      if (tl === 'es') return 'es';
      if (tl === 'zh-CN' || tl === 'zh-Hans' || tl === 'zh') return 'zh-CN';
    } catch {
      // ignore
    }
    // Default when on a translate host without a clear tl param
    return 'zh-CN';
  }

  return 'en';
}

function LangButtonRow({label, ariaLabel, options, activeId, onSelect}) {
  return (
    <div style={{display: 'grid', gap: '0.35rem'}}>
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--ifm-color-emphasis-600)',
        }}
      >
        {label}
      </div>
      <div
        role="group"
        aria-label={ariaLabel}
        className="notranslate"
        translate="no"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap',
        }}
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            aria-pressed={activeId === opt.id}
            title={opt.title}
            style={toggleButtonStyle(activeId === opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Whole-page Google Translate: EN = original, 中文 / ES = translate.google.com */
export function PageTranslateToggle() {
  const location = useLocation();
  const [pageLang, setPageLang] = useState(() => detectPageTranslateLang());

  useEffect(() => {
    setPageLang(detectPageTranslateLang());
  }, [location.pathname, location.search]);

  const applyPageLang = (lang) => {
    const originalUrl = getOriginalPageUrl(location);
    setPageLang(lang);

    if (lang === 'en') {
      if (window.location.href !== originalUrl) {
        window.location.href = originalUrl;
      }
      return;
    }

    const tl = lang === 'es' ? 'es' : 'zh-CN';
    window.location.href = getGoogleTranslateUrl(originalUrl, tl);
  };

  return (
    <LangButtonRow
      label="Page translate"
      ariaLabel="Whole page language"
      options={PAGE_OPTIONS}
      activeId={pageLang}
      onSelect={applyPageLang}
    />
  );
}

/** Hover + Ctrl/Cmd paragraph translation target only (no page redirect). */
export function HoverTranslateToggle({compact = false}) {
  const [uiLang, setUiLang] = useState(() => readUiLang());

  useEffect(() => {
    const sync = (event) => {
      setUiLang(event?.detail?.lang || readUiLang());
    };
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);

  return (
    <div style={{marginBottom: compact ? '0.75rem' : 0}}>
      <LangButtonRow
        label="Hover translate"
        ariaLabel="Hover translate language"
        options={HOVER_OPTIONS}
        activeId={uiLang}
        onSelect={(lang) => {
          writeUiLang(lang);
          setUiLang(lang);
        }}
      />
    </div>
  );
}

/**
 * Settings panel block: page translate + hover translate as two rows.
 */
export default function SiteLanguageToggle({compact = false}) {
  const gap = useMemo(() => (compact ? '0.85rem' : '0.75rem'), [compact]);

  return (
    <div
      className="notranslate"
      translate="no"
      style={{display: 'grid', gap, width: '100%'}}
    >
      <PageTranslateToggle />
      <HoverTranslateToggle />
    </div>
  );
}
