import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import ColorModeToggle from '@theme/ColorModeToggle';
import SiteLanguageToggle from '@site/src/components/i18n/SiteLanguageToggle';
import NameRandomizer from '@site/src/components/navbar/NameRandomizer';
import SiteLoginPanel from '@site/src/components/navbar/SiteLoginPanel';
import {useHomeworkDraftMode} from '@site/src/components/homework/useHomeworkDraftMode';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';

const OFFICIAL_SITE_ORIGIN = 'https://learn.l.l0l.in';

function getCanonicalPath(pathname) {
  return pathname.startsWith('/zh-Hans')
    ? pathname.slice('/zh-Hans'.length) || '/'
    : pathname;
}

function getOfficialPageUrl(pathname, search = '', hash = '') {
  const path = getCanonicalPath(pathname);
  return `${OFFICIAL_SITE_ORIGIN}${path}${search}${hash}`;
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.86 14.5a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
      />
    </svg>
  );
}

function sectionLabelStyle() {
  return {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--ifm-color-emphasis-600)',
    marginBottom: '0.4rem',
  };
}

function SettingsPanel({pageUrl, showQr, setShowQr, qrDataUrl, qrError}) {
  const {colorModeChoice, setColorMode} = useColorMode();
  const {respectPrefersColorScheme} = useThemeConfig().colorMode;
  const {isAdmin} = useSiteAuth();
  const {
    active: hwActive,
    busy: hwBusy,
    session: hwSession,
    setActive: setHwActive,
  } = useHomeworkDraftMode();

  return (
    <div style={{display: 'grid', gap: '1rem', minWidth: 320}}>
      <div>
        <div style={sectionLabelStyle()}>Account</div>
        <SiteLoginPanel />
      </div>

      {isAdmin ? (
        <>
          <div>
            <div style={sectionLabelStyle()}>Homework draft</div>
            <button
              type="button"
              className={`button button--sm ${hwActive ? 'button--primary' : 'button--secondary'}`}
              disabled={hwBusy}
              onClick={() => setHwActive(!hwActive)}
              style={{width: '100%'}}
            >
              {hwBusy
                ? '…'
                : hwActive
                  ? 'Draft mode ON — turn off'
                  : 'Start draft homework mode'}
            </button>
            <div
              style={{
                marginTop: '0.45rem',
                fontSize: '0.75rem',
                color: 'var(--ifm-color-emphasis-600)',
                lineHeight: 1.35,
              }}
            >
              {hwActive
                ? `${hwSession?.title || 'HW'} · ${hwSession?.problemCount || 0} problems · stays on across pages`
                : 'Adds 加入作业 beside 显示解答. Each ON starts a new assignment (new prompt + answer notes).'}
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle()}>Pick student</div>
            <NameRandomizer />
          </div>
        </>
      ) : null}

      <div>
        <div style={sectionLabelStyle()}>Settings</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexWrap: 'wrap',
          }}
        >
          <ColorModeToggle
            value={colorModeChoice}
            onChange={setColorMode}
            respectPrefersColorScheme={respectPrefersColorScheme}
          />
          <SiteLanguageToggle />
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={() => setShowQr((open) => !open)}
            aria-expanded={showQr}
            aria-label={showQr ? 'Hide page QR' : 'Show page QR'}
            title={showQr ? 'Hide page QR' : 'Show page QR'}
          >
            {showQr ? 'Hide QR' : 'Show QR'}
          </button>
        </div>
      </div>

      {showQr ? (
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            justifyItems: 'center',
          }}
        >
          {qrError ? (
            <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--ifm-color-danger)'}}>
              {qrError}
            </p>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for ${pageUrl}`}
              width={180}
              height={180}
              style={{
                display: 'block',
                borderRadius: 8,
                background: '#fff',
                padding: 8,
              }}
            />
          ) : (
            <p style={{margin: 0, fontSize: '0.85rem'}}>Generating…</p>
          )}
          <a
            href={pageUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.75rem',
              wordBreak: 'break-all',
              textAlign: 'center',
              lineHeight: 1.35,
            }}
          >
            {pageUrl}
          </a>
        </div>
      ) : null}
    </div>
  );
}

function useOfficialPageQr(enabled) {
  const location = useLocation();
  const pageUrl = getOfficialPageUrl(
    location.pathname,
    location.search,
    location.hash,
  );
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    setQrError('');
    setQrDataUrl('');

    import('qrcode')
      .then((mod) => {
        const QRCode = mod.default || mod;
        return QRCode.toDataURL(pageUrl, {
          width: 180,
          margin: 1,
          errorCorrectionLevel: 'M',
        });
      })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError('Could not generate QR code.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, pageUrl]);

  return {pageUrl, qrDataUrl, qrError};
}

export default function SiteSettingsNavbarItem({mobile = false}) {
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const {pageUrl, qrDataUrl, qrError} = useOfficialPageQr(showQr);

  const close = useCallback(() => {
    setOpen(false);
    setShowQr(false);
  }, []);

  useEffect(() => {
    if (!open || mobile) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        close();
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, mobile, close]);

  if (mobile) {
    return (
      <li className="menu__list-item">
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--ifm-color-emphasis-200)',
          }}
        >
          <div
            style={{
              ...sectionLabelStyle(),
              marginBottom: '0.75rem',
            }}
          >
            Settings
          </div>
          <SettingsPanel
            pageUrl={pageUrl}
            showQr={showQr}
            setShowQr={setShowQr}
            qrDataUrl={qrDataUrl}
            qrError={qrError}
          />
        </div>
      </li>
    );
  }

  return (
    <div
      ref={rootRef}
      className="navbar__item"
      style={{position: 'relative', display: 'flex', alignItems: 'center'}}
    >
      <button
        type="button"
        className="clean-btn navbar__link"
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() =>
          setOpen((wasOpen) => {
            if (wasOpen) {
              setShowQr(false);
            }
            return !wasOpen;
          })
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          padding: 0,
          borderRadius: '50%',
          color: 'var(--ifm-navbar-link-color)',
        }}
      >
        <GearIcon />
      </button>

      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-label="Site settings"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            right: 0,
            zIndex: 200,
            minWidth: 360,
            padding: '0.9rem 1rem',
            borderRadius: 12,
            border: '1px solid var(--ifm-color-emphasis-200)',
            background: 'var(--ifm-background-surface-color)',
            boxShadow: 'var(--ifm-global-shadow-md)',
          }}
        >
          <SettingsPanel
            pageUrl={pageUrl}
            showQr={showQr}
            setShowQr={setShowQr}
            qrDataUrl={qrDataUrl}
            qrError={qrError}
          />
        </div>
      )}
    </div>
  );
}
