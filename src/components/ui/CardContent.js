import React from 'react';
import styles from './ui.module.css';

export default function CardContent({children, ...rest}) {
  return (
    <div className={styles.cardContent} {...rest}>
      {children}
    </div>
  );
}
