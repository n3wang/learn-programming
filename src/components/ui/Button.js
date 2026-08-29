import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Button({
  variant = 'text',
  size,
  sx,
  className,
  style,
  children,
  ...rest
}) {
  const classes = [
    styles.btn,
    size === 'small' && styles.btnSmall,
    variant === 'contained' && styles.btnContained,
    variant === 'outlined' && styles.btnOutlined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} style={mergeStyle(sx, style)} {...rest}>
      {children}
    </button>
  );
}
