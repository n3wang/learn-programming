import React, {useEffect, useId, useState} from 'react';
import styles from './styles.module.css';

/**
 * Compact lesson figure: small preview, click (or Enter/Space) opens a zoom modal.
 *
 * <LessonFigure src="/img/calculus/fig-13-1.jpg" alt="…" caption="Fig. 13-1" />
 */
export default function LessonFigure({
  src,
  alt = '',
  caption,
  maxWidth = 280,
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const label = caption || alt || 'Figure';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <figure className={styles.figure} style={{maxWidth}}>
      <button
        type="button"
        className={styles.thumbBtn}
        onClick={() => setOpen(true)}
        aria-label={`Enlarge figure: ${label}`}
      >
        <img src={src} alt={alt} className={styles.thumb} loading="lazy" />
      </button>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}

      {open ? (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalBar}>
              <span id={titleId} className={styles.modalTitle}>
                {label}
              </span>
            </div>
            <img src={src} alt={alt} className={styles.full} />
          </div>
        </div>
      ) : null}
    </figure>
  );
}
