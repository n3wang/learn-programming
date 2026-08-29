import React from 'react';
import styles from './ui.module.css';

export default function Tooltip({title, children, disableHoverListener, arrow}) {
  if (!title || disableHoverListener) {
    return children;
  }
  return (
    <span className={styles.tooltipWrap} title={title}>
      {children}
    </span>
  );
}
