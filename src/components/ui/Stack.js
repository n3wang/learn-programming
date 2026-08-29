import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function Stack({
  direction = 'column',
  spacing = 0,
  alignItems,
  justifyContent,
  flexWrap,
  useFlexGap,
  sx,
  className,
  style,
  children,
  ...rest
}) {
  const gap = spacing ? (typeof spacing === 'number' ? spacing * 8 : spacing) : undefined;
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, {
        flexDirection: direction === 'row' ? 'row' : 'column',
        alignItems,
        justifyContent,
        flexWrap,
        gap: useFlexGap && gap != null ? `${gap}px` : undefined,
        ...style,
      })}
      {...rest}
    >
      {children}
    </div>
  );
}
