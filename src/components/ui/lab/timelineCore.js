import React from 'react';
import styles from '../ui.module.css';

export default function Timeline({children, ...rest}) {
  return (
    <ul className={styles.timeline} {...rest}>
      {children}
    </ul>
  );
}

export function TimelineItem({children, ...rest}) {
  return (
    <li className={styles.timelineItem} {...rest}>
      {children}
    </li>
  );
}

export function TimelineSeparator({children, ...rest}) {
  return (
    <div className={styles.timelineSeparator} {...rest}>
      {children}
    </div>
  );
}

export function TimelineDot({...rest}) {
  return <div className={styles.timelineDot} {...rest} />;
}

export function TimelineConnector({...rest}) {
  return <div className={styles.timelineConnector} {...rest} />;
}

export function TimelineContent({children, ...rest}) {
  return (
    <div className={styles.timelineContent} {...rest}>
      {children}
    </div>
  );
}
