import React from 'react';
import styles from '../ui.module.css';
import {useTabContext} from './TabContext';

export default function TabList({value: valueProp, onChange, children, ...rest}) {
  const ctxValue = useTabContext();
  const value = valueProp ?? ctxValue;

  const handleSelect = (v) => {
    if (!onChange) return;
    if (onChange.length <= 1) {
      onChange(v);
    } else {
      onChange(null, v);
    }
  };

  return (
    <div className={styles.tabs} role="tablist" {...rest}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const childValue = child.props.value;
        return React.cloneElement(child, {
          selected: String(childValue) === String(value),
          onSelect: () => handleSelect(childValue),
        });
      })}
    </div>
  );
}
