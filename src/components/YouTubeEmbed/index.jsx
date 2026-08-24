import React from 'react';
import styles from './styles.module.css';

function embedSrc(id, src) {
  if (src) {
    return src;
  }
  const videoId = String(id || '').replace(/^https?:\/\/(www\.)?youtu(\.be|be\.com)\/(watch\?v=|embed\/|shorts\/)?/, '');
  return `https://www.youtube.com/embed/${videoId}`;
}

export default function YouTubeEmbed({
  id,
  src,
  title = 'YouTube video player',
}) {
  return (
    <div className={styles.wrap}>
      <iframe
        className={styles.frame}
        src={embedSrc(id, src)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
