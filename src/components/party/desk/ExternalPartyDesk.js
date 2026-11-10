import React, {useEffect, useState} from 'react';
import Head from '@docusaurus/Head';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';
import GamePicker from '../core/GamePicker';
import RulesSheet from '../core/RulesSheet';
import {L, st} from '../core/strings';
import {LangSwitch, useLang} from '@site/src/components/BetsAndWagers/strings';
import styles from '../core/party.module.css';
import desk from './externalDesk.module.css';

/**
 * Big-screen desk for a party mode that lives on another host (e.g. Democracy Inc.).
 * Same chrome as a lobby: QR + copy link + how-to, no relay seats.
 */
export default function ExternalPartyDesk({mod}) {
  const [lang, setLang] = useLang();
  const [qr, setQr] = useState(null);
  const [copied, setCopied] = useState(false);
  const url = mod.externalUrl;

  useEffect(() => {
    if (!url) return undefined;
    let alive = true;
    import('qrcode')
      .then((m) => (m.default || m).toDataURL(url, {margin: 1, width: 360}))
      .then((data) => {
        if (alive) setQr(data);
      })
      .catch(() => {
        if (alive) setQr(null);
      });
    return () => {
      alive = false;
    };
  }, [url]);

  const fullScreen = () => {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  return (
    <HtmlClassNameProvider className="party-host-page">
      <div className={`${styles.shell} ${styles.host} ${desk.theme}`} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
        <Head>
          <title>{`${L(mod.title, lang)} — ${lang === 'zh' ? '主持' : 'Host'}`}</title>
        </Head>
        <header className={styles.hostHeader}>
          <GamePicker gameId={mod.id} lang={lang} />
          <span className={styles.headerRight}>
            <LangSwitch lang={lang} setLang={setLang} />
            <button type="button" className="button button--sm button--secondary" onClick={fullScreen}>
              {st(lang, 'fullScreen')}
            </button>
          </span>
        </header>

        <div className={styles.lobby}>
          <section className={styles.panel}>
            <p className={styles.kicker}>{st(lang, 'scanToPlay')}</p>
            <p className={desk.lead}>{L(mod.blurb, lang)}</p>
            {qr ? <img className={styles.qr} src={qr} alt={url} /> : <div className={styles.qrPlaceholder} />}
            <p className={styles.joinUrl}>
              <code>{url.replace(/^https?:\/\//, '')}</code>
              <button
                type="button"
                className="button button--sm button--secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}>
                {st(lang, copied ? 'copied' : 'copyLink')}
              </button>
            </p>
            <a className="button button--block button--primary" href={url} target="_blank" rel="noopener noreferrer">
              {st(lang, 'openExternal')}
            </a>
            <p className={styles.muted}>{st(lang, 'externalHostHint')}</p>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{st(lang, 'howToPlay')}</h2>
            <div className={desk.meta}>
              <span className={styles.chip}>{st(lang, 'playersRange', {min: mod.players.min, max: Math.min(mod.players.max, 64)})}</span>
              <span className={styles.chip}>{st(lang, 'minutes', {n: mod.minutes})}</span>
              <span className={styles.chip}>{st(lang, 'prototype')}</span>
            </div>
            <RulesSheet mod={mod} lang={lang} compact />
          </section>
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}
