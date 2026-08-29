import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function ToggleButton({value, selected, size, sx, className, style, onClick, children, ...rest}) {
  return (
    <button
      type="button"
      className={[
        styles.toggleBtn,
        size === 'small' && styles.toggleBtnSmall,
        selected && styles.toggleBtnSelected,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={mergeStyle(sx, style)}
      onClick={onClick}
      aria-pressed={selected || undefined}
      data-value={value}
      {...rest}
    >
      {children}
    </button>
  );
}
