import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Table({sx, className, style, children, ...rest}) {
  return (
    <table
      className={[styles.table, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      {...rest}
    >
      {children}
    </table>
  );
}
