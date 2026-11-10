import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LangSwitch, useLang} from '@site/src/components/BetsAndWagers/strings';
import {MENU} from '../registry';
import {L, st} from '../core/strings';
import {GameLogo} from '../core/GamePicker';
import styles from '../core/party.module.css';

/**
 * Democracy Inc. gets a full-bleed cover.webp. Every other game keeps the
 * tinted frame with a centered logo (old menu look).
 */
function Cover({game}) {
  const isBleed = game.id === 'lifesim';
  const coverSrc = useBaseUrl(`/img/party/${game.id}/cover.webp`);
  const [bg, setBg] = useState(isBleed ? coverSrc : '');
  const [failed, setFailed] = useState(!isBleed);

  useEffect(() => {
    if (!isBleed) {
      setBg('');
      setFailed(true);
      return undefined;
    }
    let cancelled = false;
    setFailed(false);
    setBg(coverSrc);
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) setBg(coverSrc);
    };
    probe.onerror = () => {
      if (!cancelled) {
        setBg('');
        setFailed(true);
      }
    };
    probe.src = coverSrc;
    return () => {
      cancelled = true;
    };
  }, [isBleed, coverSrc]);

  return (
    <div
      className={styles.menuCover}
      style={{
        backgroundColor: game.coverTint,
        backgroundImage: bg ? `url(${bg})` : undefined,
      }}
      role="img"
      aria-label={typeof game.title === 'string' ? game.title : game.title?.en || game.id}>
      {failed ? <GameLogo game={game} size={150} /> : null}
    </div>
  );
}

/** /party: pick a game for the big screen. */
export default function GameMenu() {
  const [lang, setLang] = useLang();
  return (
    <div className={`${styles.shell} ${styles.menu}`} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
      <header className={styles.hostHeader}>
        <h1 style={{margin: 0}}>{st(lang, 'menuTitle')}</h1>
        <span className={styles.headerRight}>
          <LangSwitch lang={lang} setLang={setLang} />
        </span>
      </header>
      <p>{st(lang, 'menuLead')}</p>
      <div className={styles.menuGrid}>
        {MENU.map((game) => (
          <article key={game.id} className={styles.menuCard}>
            <Cover game={game} />
            <h2>
              {L(game.title, lang)}
            </h2>
            <div className={styles.menuMeta}>
              <span className={styles.chip}>{st(lang, 'playersRange', {min: game.players.min, max: Math.min(game.players.max, 64)})}</span>
              <span className={styles.chip}>{st(lang, 'minutes', {n: game.minutes})}</span>
            </div>
            <p>{L(game.blurb, lang)}</p>
            <Link className="button button--block" to={game.id === 'wagers' ? '/party/host' : `/party/host?game=${game.id}`}>
              {st(lang, 'host')}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
