import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LangSwitch, useLang} from '@site/src/components/BetsAndWagers/strings';
import {MENU} from '../registry';
import {L, st} from '../core/strings';
import styles from '../core/party.module.css';

function Cover({game}) {
  const src = useBaseUrl(`/img/party/${game.id}/cover.webp`);
  const [missing, setMissing] = useState(false);
  return (
    <div className={styles.menuCover} style={{background: game.coverTint}}>
      {missing ? <span aria-hidden="true">{game.emoji}</span> : <img src={src} alt="" onError={() => setMissing(true)} />}
    </div>
  );
}

/** /party: pick a game for the big screen. */
export default function GameMenu() {
  const [lang, setLang] = useLang();
  return (
    <div className={`${styles.shell} ${styles.menu}`} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
      <header className={styles.hostHeader}>
        <h1 style={{margin: 0}}>🎉 {st(lang, 'menuTitle')}</h1>
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
              {game.emoji} {L(game.title, lang)}
            </h2>
            <div className={styles.menuMeta}>
              <span className={styles.chip}>👥 {st(lang, 'playersRange', {min: game.players.min, max: Math.min(game.players.max, 64)})}</span>
              <span className={styles.chip}>⏱ {st(lang, 'minutes', {n: game.minutes})}</span>
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
