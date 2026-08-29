import React from 'react';
import styles from './ui.module.css';

export default function Collapse({in: open, children, timeout}) {
  return (
    <div className={[styles.collapse, open ? styles.collapseOpen : styles.collapseHidden].join(' ')}>
      {children}
    </div>
  );
}
