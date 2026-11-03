import React, {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './party.module.css';

/**
 * A sprite with a placeholder. Until the art file exists at
 * `static/img/party/<path>`, it draws a tinted card with an emoji and a label,
 * so every game is playable before any art is made. Drop the file in and it
 * shows up, no code change.
 *
 * `missing` must reset when `path` changes — Power Grab peeks swap card-back →
 * role art on the same Sprite instance; a stuck error from the missing back
 * would otherwise keep showing the emoji forever.
 */
export default function Sprite({path, emoji = '', label = '', tint = '#ffe566', shape = 'card', className = '', size}) {
  const src = useBaseUrl(path ? `/img/party/${path}` : '/');
  const [missing, setMissing] = useState(!path);
  useEffect(() => {
    setMissing(!path);
  }, [path, src]);
  const style = {'--tint': tint, ...(size ? {'--sprite': size} : {})};
  if (!missing) {
    return (
      <span className={`${styles.sprite} ${className}`} data-shape={shape} style={style}>
        <img key={src} src={src} alt={label} onError={() => setMissing(true)} decoding="async" />
      </span>
    );
  }
  return (
    <span className={`${styles.sprite} ${styles.spritePlaceholder} ${className}`} data-shape={shape} style={style} title={path ? `placeholder: ${path}` : label}>
      <span className={styles.spriteEmoji} aria-hidden="true">
        {emoji}
      </span>
      {label && <span className={styles.spriteLabel}>{label}</span>}
    </span>
  );
}
