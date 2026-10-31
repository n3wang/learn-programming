import React from 'react';
import {L} from './strings';
import styles from './party.module.css';

/**
 * How to play a game: the module's numbered `howTo` steps, then its
 * optional `reference(lang)` list (roles, actions, powers), one row each.
 * Shown in the host lobby, as a host overlay mid-game, and on phones.
 */
export default function RulesSheet({mod, lang, compact = false}) {
  const steps = (mod.howTo && (mod.howTo[lang] || mod.howTo.en)) || [];
  const rows = mod.reference ? mod.reference(lang) : [];
  return (
    <div className={styles.rules} data-compact={compact}>
      <ol className={styles.rulesSteps}>
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {rows.length > 0 && (
        <ul className={styles.rulesRef}>
          {rows.map((row) => (
            <li key={row.title}>
              <span className={styles.rulesIcon} style={{background: row.tint || '#ffe566'}} aria-hidden="true">
                {row.emoji}
              </span>
              <span>
                <b>{row.title}</b>
                {row.tag && <span className={styles.tag}> {row.tag}</span>}
                <br />
                <span className={styles.rulesText}>{L(row.text, lang)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
