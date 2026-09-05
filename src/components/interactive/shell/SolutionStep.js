import React from 'react';
import styles from './TwoVarSolution.module.css';

/** Numbered/badged step row reused across word-problem solutions. */
export function SolutionStep({ badge, badgeClass, children }) {
  return (
    <div className={styles.step}>
      <span className={`${styles.badge} ${badgeClass || ''}`}>{badge}</span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export const stepStyles = styles;
