import React from 'react';
import {mergeStyle} from './sx';
import styles from './ui.module.css';

export default function ToggleButtonGroup({
  value,
  exclusive,
  onChange,
  size,
  sx,
  className,
  style,
  children,
  ...rest
}) {
  const handleSelect = (btnValue) => {
    if (exclusive) {
      onChange?.(null, btnValue);
    }
  };

  return (
    <div
      className={[styles.toggleGroup, className].filter(Boolean).join(' ') || undefined}
      style={mergeStyle(sx, style)}
      role="group"
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const btnValue = child.props.value;
        return React.cloneElement(child, {
          selected: value === btnValue,
          size: child.props.size ?? size,
          onClick: () => handleSelect(btnValue),
        });
      })}
    </div>
  );
}
