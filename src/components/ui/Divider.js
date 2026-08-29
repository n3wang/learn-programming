import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Divider({sx, className, style, ...rest}) {
  return (
    <hr
      className={[styles.divider, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      {...rest}
    />
  );
}
