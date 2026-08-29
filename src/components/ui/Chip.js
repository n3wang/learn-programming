import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Chip({
  label,
  size,
  variant = 'filled',
  color,
  sx,
  className,
  style,
  onClick,
  children,
  ...rest
}) {
  const classes = [
    styles.chip,
    size === 'small' && styles.chipSmall,
    variant === 'outlined' ? styles.chipOutlined : styles.chipFilled,
    color === 'primary' && styles.chipPrimary,
    onClick && styles.chipClickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = label ?? children;

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        style={mergeStyle(sx, style)}
        onClick={onClick}
        {...rest}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={classes} style={mergeStyle(sx, style)} {...rest}>
      {content}
    </span>
  );
}
