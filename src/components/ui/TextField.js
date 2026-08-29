import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function TextField({value, onChange, placeholder, label, size, sx, className, style, ...rest}) {
  return (
    <label style={{display: 'block'}}>
      {label ? <span style={{display: 'block', fontSize: '0.8125rem', marginBottom: 4}}>{label}</span> : null}
      <input
        className={[styles.textField, className].filter(Boolean).join(' ') || undefined}
        style={mergeStyle(sx, style)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />
    </label>
  );
}
