import React, {useState} from 'react';
import {L, st} from './strings';
import styles from './party.module.css';

/**
 * How to play a game: the module's numbered `howTo` steps, then its optional
 * `rulebook(lang)` sections ({title, items}, each a collapsible block for new
 * players), then its optional `reference(lang)` list (roles, actions,
 * powers). On phones (`compact`), reference rows are a tappable thumbnail
 * grid; tap opens detail (game `CardDetail` when `row.detail` is set, else a
 * shared peek). Host keeps the full text list.
 */
function scaleArt(node, size) {
  if (!React.isValidElement(node) || node.props.size == null) return node;
  // Sprite uses CSS lengths ("26px"); card wrappers take a number and add "px".
  const next = typeof node.props.size === 'string' ? `${size}px` : size;
  return React.cloneElement(node, {size: next});
}

function RefDetail({row, lang, onClose, CardDetail}) {
  if (CardDetail && row.detail) {
    return <CardDetail item={row.detail} lang={lang} onClose={onClose} />;
  }
  const title = row.title || '';
  return (
    <div className={styles.refDetailScrim} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={styles.refDetailPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.refDetailArt} style={{background: row.tint || '#ffe566'}}>
          {scaleArt(row.emoji, 120)}
        </div>
        <div className={styles.refDetailText}>
          <h3 className={styles.refDetailTitle}>{title}</h3>
          {row.tag && <p className={styles.tag}>{row.tag}</p>}
          <p className={styles.refDetailBody}>{L(row.text, lang)}</p>
          {row.more && <p className={styles.rulesMore}>{L(row.more, lang)}</p>}
          <button type="button" className="button button--secondary" onClick={onClose}>
            {st(lang, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function RefGrid({group, list, lang, onOpen}) {
  return (
    <React.Fragment key={group || 'all'}>
      {group && <h4 className={styles.rulesGroup}>{group}</h4>}
      <ul className={styles.rulesRefGrid}>
        {list.map((row, i) => (
          <li key={row.key || `${row.title}-${i}`}>
            <button
              type="button"
              className={styles.rulesRefTile}
              onClick={() => onOpen(row)}
              aria-label={row.title}>
              {scaleArt(row.emoji, 72)}
            </button>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

function RefList({group, list, lang}) {
  return (
    <React.Fragment key={group || 'all'}>
      {group && <h4 className={styles.rulesGroup}>{group}</h4>}
      <ul className={styles.rulesRef}>
        {list.map((row, i) => (
          <li key={row.key || `${row.title}-${i}`}>
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
  );
}

export default function RulesSheet({mod, lang, compact = false, settings = null}) {
  // `howTo` may be a function of the room's settings, so a game explains only the mode being played.
  const steps = typeof mod.howTo === 'function' ? mod.howTo(lang, settings || {}) : (mod.howTo && (mod.howTo[lang] || mod.howTo.en)) || [];
  const sections = mod.rulebook ? mod.rulebook(lang) : [];
  const rows = mod.reference ? mod.reference(lang, settings || {}) : [];
  const groups = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.group === (row.group || '')) last.rows.push(row);
    else groups.push({group: row.group || '', rows: [row]});
  }
  const [peek, setPeek] = useState(null);

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
      {groups.map(({group, rows: list}) =>
        compact ? (
          <RefGrid key={group || 'all'} group={group} list={list} lang={lang} onOpen={setPeek} />
        ) : (
          <RefList key={group || 'all'} group={group} list={list} lang={lang} />
        ),
      )}
      {peek && <RefDetail row={peek} lang={lang} onClose={() => setPeek(null)} CardDetail={mod.CardDetail} />}
    </div>
  );
}
