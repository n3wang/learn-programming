import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

const VARIANT_CLASS = {
  h5: styles.variantH5,
  subtitle1: styles.variantSubtitle1,
  body2: styles.variantBody2,
  caption: styles.variantCaption,
};

const VARIANT_TAG = {
  h5: 'h2',
  subtitle1: 'h3',
  body2: 'p',
  caption: 'span',
};

export default function Typography({
  variant,
  color,
  gutterBottom,
  sx,
  component,
  className,
  style,
  display,
  children,
  ...rest
}) {
  const Tag = component || VARIANT_TAG[variant] || 'p';
  const classes = [
    styles.typography,
    variant && VARIANT_CLASS[variant],
    color === 'text.secondary' && styles.textSecondary,
    gutterBottom && styles.gutterBottom,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      className={classes}
      style={mergeStyle(sx, {...style, ...(display ? {display} : {})})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
