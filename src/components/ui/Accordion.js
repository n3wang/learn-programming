import React, {useState} from 'react';
import styles from './ui.module.css';

export default function Accordion({children, defaultExpanded}) {
  const [open, setOpen] = useState(Boolean(defaultExpanded));

  return (
    <div className={styles.accordion}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        if (child.props.expandIcon != null || child.props['aria-controls']) {
          return React.cloneElement(child, {open, onToggle: () => setOpen((o) => !o)});
        }
        return open ? child : null;
      })}
    </div>
  );
}

export function AccordionSummary({children, expandIcon, open, onToggle, ...rest}) {
  return (
    <button type="button" className={styles.accordionSummary} onClick={onToggle} {...rest}>
      <span>{children}</span>
      {expandIcon}
    </button>
  );
}

export function AccordionDetails({children, ...rest}) {
  return (
    <div className={styles.accordionDetails} {...rest}>
      {children}
    </div>
  );
}
