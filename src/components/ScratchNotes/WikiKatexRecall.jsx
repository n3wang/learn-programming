import React, {useMemo, useState} from 'react';
import katex from 'katex';
import LineDiffPreview from '@site/src/components/interactive/typingCopy/LineDiffPreview';
import {matchesAnyTex, unwrapTex} from '@site/src/components/interactive/typingCopy/katexFormulas';
import styles from './styles.module.css';

function renderTex(tex) {
  try {
    return katex.renderToString(unwrapTex(tex), {throwOnError: false, displayMode: true});
  } catch {
    return '';
  }
}

export function expectedTexList(entry) {
  const list = [];
  if (entry.tex) {
    list.push(entry.tex);
  }
  if (Array.isArray(entry.texAlts)) {
    list.push(...entry.texAlts);
  }
  if (entry.formula) {
    list.push(unwrapTex(entry.formula));
  }
  if (entry.statement) {
    list.push(unwrapTex(entry.statement));
  }
  return [...new Set(list.filter(Boolean))];
}

export default function WikiKatexRecall({entry, onPass}) {
  const expected = useMemo(() => expectedTexList(entry), [entry]);
  const primary = expected[0] || '';
  const [buffer, setBuffer] = useState('');
  const [wrong, setWrong] = useState(false);
  const [ok, setOk] = useState(false);
  const typedRender = buffer.trim() ? renderTex(buffer) : '';

  function check() {
    if (ok) {
      return;
    }
    if (matchesAnyTex(buffer, expected)) {
      setWrong(false);
      setOk(true);
      onPass?.();
      return;
    }
    setWrong(true);
  }

  return (
    <div className={styles.wikiRecall}>
      <p className={styles.wikiBlurb}>Write the formula in KaTeX. Equivalents (\frac vs \dfrac, extra spaces) count.</p>
      <input
        className={styles.wikiKatexInput}
        value={buffer}
        onChange={(e) => {
          setBuffer(e.target.value);
          setWrong(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            check();
          }
        }}
        placeholder="Type the KaTeX…"
        aria-label="KaTeX input"
        autoComplete="off"
        spellCheck={false}
        disabled={ok}
      />
      {typedRender ? (
        <div className={styles.wikiKatexPreview} dangerouslySetInnerHTML={{__html: typedRender}} />
      ) : null}
      {wrong ? <LineDiffPreview expected={primary} typed={buffer} byChar /> : null}
      {ok ? <p className={styles.wikiOk}>Match.</p> : null}
      {!ok ? (
        <button type="button" className={styles.textBtn} onClick={check}>
          Check
        </button>
      ) : null}
    </div>
  );
}
