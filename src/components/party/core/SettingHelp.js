import React, {useState} from 'react';
import styles from './party.module.css';

/** Compact “?” that reveals a setting hint on click (click again to hide). */
export default function SettingHelp({text, label = '?'}) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <span className={styles.settingHelp}>
      <button
        type="button"
        className={styles.settingHelpBtn}
        aria-expanded={open}
        aria-label={label === '?' ? 'Help' : label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}>
        {label}
      </button>
      {open ? <span className={styles.settingHelpBody}>{text}</span> : null}
    </span>
  );
}
