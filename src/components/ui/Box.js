import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Box({component, sx, className, style, children, ...rest}) {
  const Tag = component || 'div';
  return (
    <Tag
      className={[styles.box, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
