import React from 'react';
import styles from './ui.module.css';
import Tab from './Tab';

export default function Tabs({value, onChange, children, ...rest}) {
  return (
    <div className={styles.tabs} role="tablist" {...rest}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          selected: child.props.value === value,
          onSelect: (v) => onChange?.(null, v),
        });
      })}
    </div>
  );
}

export {Tab};
