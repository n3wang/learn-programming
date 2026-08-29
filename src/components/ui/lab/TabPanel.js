import React from 'react';
import {useTabContext} from './TabContext';
import styles from '../ui.module.css';

export default function TabPanel({value, children, ...rest}) {
  const current = useTabContext();
  if (String(current) !== String(value)) return null;
  return (
    <div className={styles.tabPanel} role="tabpanel" {...rest}>
      {children}
    </div>
  );
}
