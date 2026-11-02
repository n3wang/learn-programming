import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {GAMES, MENU, WAGERS} from '../registry';
import {L} from './strings';
import Sprite from './Sprite';
import styles from './party.module.css';

/** A game's own picture (its `logo` sprite), small, for titles and lists. */
export function GameLogo({game, size = 30}) {
  return <Sprite path={game.logo} emoji="" label="" tint={game.coverTint || '#ffe566'} shape="icon" size={`${size}px`} />;
}

const hostPath = (game) => (game.id === 'wagers' ? '/party/host' : `/party/host?game=${game.id}`);

function GameLink({game, lang, current}) {
  const href = useBaseUrl(hostPath(game));
  return (
    <a href={href} className={styles.pickerItem} aria-current={current ? 'true' : undefined}>
      <GameLogo game={game} size={34} />
      <span>{L(game.title, lang)}</span>
    </a>
  );
}

/**
 * The game's title in the host header. Clicking it opens the list of games
 * on the /party menu; picking one opens that game's big screen.
 */
export default function GamePicker({gameId, lang}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  // Hidden games (off the menu) still show their own title here.
  const game = [WAGERS, ...GAMES].find((x) => x.id === gameId) || MENU[0];
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <span className={styles.picker} ref={ref}>
      <button type="button" className={styles.pickerButton} aria-expanded={open} onClick={() => setOpen(!open)}>
        <GameLogo game={game} size={30} />
        <strong>{L(game.title, lang)}</strong>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <span className={styles.pickerMenu} role="menu">
          {MENU.map((x) => (
            <GameLink key={x.id} game={x} lang={lang} current={x.id === game.id} />
          ))}
        </span>
      )}
    </span>
  );
}
