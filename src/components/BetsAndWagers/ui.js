import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import MathText from '@site/src/components/ProblemSet/MathText';
import {t} from './strings';
import {AVATAR_COUNT, avatarPath, isValidAvatar} from './logic';
import styles from './styles.module.css';

/**
 * How tightly to pack the board: at most 12 distinct guesses plus
 * "Smaller than all", and the board must stay one ordered row.
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
 * A question's picture. Wikimedia credits stay visible when present.
 */
export function QuestionImage({image, alt, lang = 'en', compact = false}) {
  const src = useBaseUrl(image ? image.src : '/');
  if (!image) return null;
  return (
    <figure className={`${styles.questionImage} ${compact ? styles.questionImageCompact : ''}`}>
      <img src={src} alt={alt} loading="eager" decoding="async" />
      {image.credit ? (
        <figcaption>
          {image.source ? (
            <a href={image.source} target="_blank" rel="noopener noreferrer">
              {t(lang, 'imageCredit', {credit: image.credit})}
            </a>
          ) : (
            t(lang, 'imageCredit', {credit: image.credit})
          )}
        </figcaption>
      ) : null}
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

/** A number-line guess with a large ≥ so the "at or below" rule is obvious. */
export function AtLeastNumber({label, className}) {
  return (
    <span className={className}>
      <span className={styles.geMark} aria-hidden="true">
        ≥
      </span>
      {label}
    </span>
  );
}

/**
 * Score-table bank: when coins are earned, the number ticks up one at a time
 * as a coin slides into the row.
 */
export function AnimatedBank({coins, color, avatar, playKey}) {
  const target = Math.max(0, Math.floor(Number(coins) || 0));
  const [shown, setShown] = useState(target);
  const [incoming, setIncoming] = useState(0);
  const [tick, setTick] = useState(0);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;
    if (target <= from) {
      setShown(target);
      setIncoming(0);
      return undefined;
    }
    setShown(from);
    setIncoming(1);
    const steps = target - from;
    const stepMs = steps > 12 ? Math.max(70, Math.floor(2000 / steps)) : 180;
    let current = from;
    let timer = window.setTimeout(function step() {
      current += 1;
      setShown(current);
      if (current < target) {
        setTick((n) => n + 1);
        timer = window.setTimeout(step, stepMs);
      } else {
        timer = window.setTimeout(() => setIncoming(0), 340);
      }
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [target, playKey]);

  return (
    <span className={styles.tableBank}>
      {incoming > 0 && (
        <span key={tick} className={styles.tableSlide} aria-hidden="true">
          <span className={styles.tableSlideCoin}>
            <Coin kind="bank" color={color} avatar={avatar} size="xs" />
          </span>
        </span>
      )}
      <b className={styles.chipCoins} data-tick={tick > 0 && incoming > 0 ? 'true' : undefined}>
        {shown}
      </b>
    </span>
  );
}

/** Distinct voters shown on a busy pile; extra coins become the count. */
export const PILE_FACE_LIMIT = 4;

/**
 * A placed coin: the player's face in a ring of their seat colour.
 * A1 and bank look the same so a pile never mixes variants.
 */
export function Coin({kind = 'bank', color, avatar, size = 'md', onPointerDown, title}) {
  const face = isValidAvatar(avatar);
  const src = useBaseUrl(avatarPath(face ? avatar : 1));
  return (
    <span
      className={styles.coin}
      data-size={size}
      data-kind={kind}
      data-face={face || undefined}
      style={{'--coin': color || '#e4572e'}}
      onPointerDown={onPointerDown}
      title={title}
      role="presentation">
      {face ? <img src={src} alt="" draggable={false} /> : ''}
    </span>
  );
}

/**
 * Coins on one option. Unique voters, up to four faces; extra coins stay a
 * count so "7" still reads when one person stacked several chips.
 */
export function CoinPile({tokens = [], lang = 'en', size = 'sm', who = false, perch = false}) {
  const unique = [];
  const seen = new Set();
  for (const tok of tokens) {
    const id = tok.playerId || `${tok.name || ''}|${tok.color || ''}|${tok.avatar || ''}`;
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(tok);
  }
  const shown = unique.slice(0, PILE_FACE_LIMIT);
  const overflow = tokens.length > shown.length;
  const names = shown.map((tok) => tok.name).filter(Boolean);
  return (
    <span
      className={styles.slotPile}
      data-overflow={overflow || undefined}
      data-empty={tokens.length === 0 || undefined}
      data-perch={perch || undefined}>
      <span className={styles.slotPileCoins}>
        {tokens.length === 0 && perch && <span className={styles.coinWell} aria-hidden="true" />}
        {shown.map((tok, i) => (
          <Coin
            key={`${tok.playerId || i}-${tok.kind}-${i}`}
            kind={tok.kind}
            color={tok.color}
            avatar={tok.avatar}
            size={size}
            title={tok.name}
          />
        ))}
        {overflow && <b className={styles.slotPileCount}>{tokens.length}</b>}
      </span>
      {who && names.length > 0 && <span className={styles.slotWho}>{names.join(' · ')}</span>}
      {tokens.length === 0 && !perch && (
        <span className={styles.slotTotal}>{t(lang, 'coins', {n: 0})}</span>
      )}
    </span>
  );
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

/** Curious fact / formula walkthrough under a revealed answer. Markdown + KaTeX. */
export function RevealNote({text, title}) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const paras = raw.split(/\n\s*\n/);
  return (
    <aside className={styles.revealNote}>
      {title ? <p className={styles.revealNoteTitle}>{title}</p> : null}
      {paras.map((para, i) => {
        const chunk = para.trim();
        if (/^\$\$[\s\S]*\$\$$/.test(chunk.trim())) {
          return (
            <div key={i} className={styles.revealNoteMath}>
              <MathText text={chunk} />
            </div>
          );
        }
        return (
          <p key={i} className={styles.revealNoteP}>
            <InlineNote text={chunk.replace(/\n/g, ' ')} />
          </p>
        );
      })}
    </aside>
  );
}

function InlineNote({text}) {
  const raw = String(text || '');
  const parts = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) {
      parts.push(<MathText key={`t-${key++}`} text={raw.slice(last, match.index)} />);
    }
    if (match[1] != null) {
      parts.push(
        <strong key={`b-${key++}`}>
          <MathText text={match[1]} />
        </strong>,
      );
    } else {
      parts.push(
        <em key={`i-${key++}`}>
          <MathText text={match[2]} />
        </em>,
      );
    }
    last = re.lastIndex;
  }
  if (last < raw.length) {
    parts.push(<MathText key={`t-${key++}`} text={raw.slice(last)} />);
  }
  return <>{parts}</>;
}
