import React from 'react';
import styles from './ui.module.css';

export default function Tab({label, value, selected, onSelect, ...rest}) {
  return (
    <button
      type="button"
      className={[styles.tab, selected && styles.tabActive].filter(Boolean).join(' ')}
      onClick={() => onSelect?.(value)}
      {...rest}
    >
      {label}
    </button>
  );
}
