import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {t} from './strings';
import {AVATAR_COUNT, avatarPath, isValidAvatar} from './logic';
import styles from './styles.module.css';

/**
 * How tightly to pack the board: up to 12 players means up to 13 slots
 * (12 guesses + "Smaller than all"), and the board must stay one ordered row.
 */
export function boardDensity(slotCount) {
  if (slotCount <= 6) return 'roomy';
  if (slotCount <= 9) return 'compact';
  return 'tight';
}

export function Countdown({msLeft, lang = 'en'}) {
  const seconds = Math.max(0, Math.ceil(msLeft / 1000));
  return (
    <span className={`${styles.countdown} ${seconds <= 5 ? styles.countdownLow : ''}`} aria-live="polite">
      {t(lang, 'seconds', {n: seconds})}
    </span>
  );
}

/**
 * A question's picture with its credit (all are Wikimedia Commons files under
 * public-domain, CC0 or CC BY/BY-SA licences, so the credit must be shown).
 */
export function QuestionImage({image, alt, lang = 'en', compact = false}) {
  const src = useBaseUrl(image ? image.src : '/');
  if (!image) return null;
  return (
    <figure className={`${styles.questionImage} ${compact ? styles.questionImageCompact : ''}`}>
      <img src={src} alt={alt} loading="eager" decoding="async" />
      <figcaption>
        <a href={image.source} target="_blank" rel="noopener noreferrer">
          {t(lang, 'imageCredit', {credit: image.credit})}
        </a>
      </figcaption>
    </figure>
  );
}

/** `base` is the backend the socket reached; a local one is named so testing shows its routing. */
export function ConnectionBadge({status, base, lang = 'en', compact = false}) {
  const label = t(lang, status === 'open' ? 'connected' : status === 'offline' ? 'offline' : 'connecting');
  let where = '';
  // Phones are narrow: the backend address goes in the tooltip only.
  if (status === 'open' && base && !compact) {
    try {
      const url = new URL(base);
      where = /^\d|localhost|\[|\.local$/.test(url.hostname) ? ` · ${t(lang, 'local')} ${url.host}` : '';
    } catch {
      where = '';
    }
  }
  return (
    <span className={styles.connection} data-status={status} title={base || undefined}>
      <span className={styles.connectionDot} />
      <span className={styles.connectionLabel}>{label}</span>
      {where}
    </span>
  );
}

export function PlayerDot({color}) {
  return <span className={styles.playerDot} style={{background: color}} />;
}

/**
 * A player's picture in a ring of their seat colour, so two students who pick
 * the same avatar are still told apart. No avatar → the plain colour dot.
 * size: xs (board) · sm (chips, lists) · md (phone bar) · lg (podium).
 */
export function Avatar({avatar, color, size = 'sm'}) {
  const src = useBaseUrl(avatarPath(isValidAvatar(avatar) ? avatar : 1));
  if (!isValidAvatar(avatar)) return <PlayerDot color={color} />;
  return (
    <span className={styles.avatar} data-size={size} style={{'--ring': color}}>
      <img src={src} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

/** Grid of every avatar; the chosen one is outlined. */
export function AvatarPicker({value, onChange, lang = 'en', taken = []}) {
  const base = useBaseUrl('/');
  const gridRef = React.useRef(null);
  // Open with the current pick in view (it may be far down the grid).
  React.useEffect(() => {
    const picked = gridRef.current?.querySelector('[aria-checked="true"]');
    if (picked) gridRef.current.scrollTop = picked.offsetTop - gridRef.current.offsetTop - 8;
  }, []);
  return (
    <div ref={gridRef} className={styles.avatarPicker} role="radiogroup" aria-label={t(lang, 'chooseAvatar')}>
      {Array.from({length: AVATAR_COUNT}, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={t(lang, taken.includes(n) ? 'takenAvatar' : 'avatarN', {n})}
          data-taken={taken.includes(n) && value !== n}
          className={styles.avatarOption}
          onClick={() => onChange(n)}>
          <img src={`${base.replace(/\/$/, '')}${avatarPath(n)}`} alt="" decoding="async" />
        </button>
      ))}
    </div>
  );
}

export function readJson(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

export function writeJson(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / blocked storage — the game still runs, it just can't resume
  }
}
