import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function LinearProgress({value = 0, variant, sx, className, style, ...rest}) {
  const pct = variant === 'determinate' ? Math.max(0, Math.min(100, value)) : 50;
  return (
    <div
      className={[styles.progress, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      role="progressbar"
      aria-valuenow={pct}
      {...rest}
    >
      <div className={styles.progressBar} style={{width: `${pct}%`}} />
    </div>
  );
}
