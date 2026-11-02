import React from 'react';
import {L} from './strings';
import styles from './party.module.css';

/**
 * How to play a game: the module's numbered `howTo` steps, then its optional
 * `rulebook(lang)` sections ({title, items}, each a collapsible block for new
 * players), then its optional `reference(lang)` list (roles, actions,
 * powers), one row each. Reference rows with a `group` are listed under that
 * heading. Shown in the host lobby, as a host overlay mid-game, and on phones.
 */
export default function RulesSheet({mod, lang, compact = false}) {
  const steps = (mod.howTo && (mod.howTo[lang] || mod.howTo.en)) || [];
  const sections = mod.rulebook ? mod.rulebook(lang) : [];
  const rows = mod.reference ? mod.reference(lang) : [];
  const groups = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.group === (row.group || '')) last.rows.push(row);
    else groups.push({group: row.group || '', rows: [row]});
  }
  return (
    <div className={styles.rules} data-compact={compact}>
      <ol className={styles.rulesSteps}>
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {sections.map((section) => (
        <details key={section.title} className={styles.rulesSection}>
          <summary>{section.title}</summary>
          <ul>
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
      {groups.map(({group, rows: list}) => (
        <React.Fragment key={group || 'all'}>
          {group && <h4 className={styles.rulesGroup}>{group}</h4>}
          <ul className={styles.rulesRef}>
            {list.map((row) => (
              <li key={row.title}>
                <span className={styles.rulesIcon} style={{background: row.tint || '#ffe566'}} aria-hidden="true">
                  {row.emoji}
                </span>
                <span>
                  <b>{row.title}</b>
                  {row.tag && <span className={styles.tag}> {row.tag}</span>}
                  <br />
                  <span className={styles.rulesText}>{L(row.text, lang)}</span>
                  {row.more && (
                    <>
                      <br />
                      <span className={styles.rulesMore}>{L(row.more, lang)}</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </div>
  );
}
