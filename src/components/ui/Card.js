import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Card({sx, className, style, children, ...rest}) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      {...rest}
    >
      {children}
    </div>
  );
}
