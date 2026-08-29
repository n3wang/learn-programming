import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Paper({variant, sx, className, style, children, ...rest}) {
  return (
    <div
      className={[styles.paper, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      {...rest}
    >
      {children}
    </div>
  );
}
