import React, {useEffect, useMemo, useState} from 'react';
import styles from './styles.module.css';
import MathText from './MathText';

const BLANK_RE = /\[\[(.+?)\]\]/g;

/** Lowercase, strip accents and surrounding punctuation, collapse spaces. */
export function normalizeCloze(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[“”"'.,;:¡!¿?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split a cloze prompt into text and blank segments.
 * `[[técnica]]` is a blank; `[[balance general|estado de situación financiera]]` accepts either.
 */
export function parseCloze(prompt) {
  const segments = [];
  let last = 0;
  let match;
  BLANK_RE.lastIndex = 0;
  while ((match = BLANK_RE.exec(String(prompt || ''))) !== null) {
    if (match.index > last) segments.push({text: prompt.slice(last, match.index)});
    const options = match[1].split('|').map((s) => s.trim()).filter(Boolean);
    segments.push({blank: segments.filter((s) => s.blank !== undefined).length, options});
    last = BLANK_RE.lastIndex;
  }
  if (last < String(prompt || '').length) segments.push({text: prompt.slice(last)});
  return segments;
}

function clozeKey(setId, index) {
  return `cloze-problem-draft:${setId}:p${index}`;
}

/**
 * Fill-in-the-blank pane for <Problem type="cloze" prompt="La contabilidad es una [[técnica]]…" />.
 * Checks each blank (accent/case-insensitive), offers first-letter hints, and can reveal the answer.
 */
export default function ClozePane({
  setId,
  index,
  title,
  company,
  prompt,
  why,
  done,
  onSolved,
  onCheckLater,
  hasNextUnsolved,
  t,
}) {
  const segments = useMemo(() => parseCloze(prompt), [prompt]);
  const blanks = useMemo(() => segments.filter((s) => s.blank !== undefined), [segments]);
  const [values, setValues] = useState(() => blanks.map(() => ''));
  const [marks, setMarks] = useState({});
  const [status, setStatus] = useState(done ? 'right' : 'idle');
  const [hinted, setHinted] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(clozeKey(setId, index)) || 'null');
    } catch {
      saved = null;
    }
    const restored = blanks.map((_, i) => (Array.isArray(saved) && typeof saved[i] === 'string' ? saved[i] : ''));
    setValues(done ? blanks.map((b, i) => restored[i] || b.options[0]) : restored);
    setMarks({});
    setHinted(false);
    setStatus(done ? 'right' : 'idle');
  }, [setId, index, done, blanks]);

  function isRight(i, value) {
    const got = normalizeCloze(value);
    return Boolean(got) && blanks[i].options.some((opt) => normalizeCloze(opt) === got);
  }

  function update(i, value) {
    const next = values.slice();
    next[i] = value;
    setValues(next);
    if (marks[i] !== undefined) {
      const m = {...marks};
      delete m[i];
      setMarks(m);
    }
    if (status === 'wrong' || status === 'empty') setStatus('idle');
    try {
      window.localStorage.setItem(clozeKey(setId, index), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function check() {
    if (values.every((v) => !String(v).trim())) {
      setStatus('empty');
      return;
    }
    const nextMarks = {};
    let bad = 0;
    blanks.forEach((_, i) => {
      const ok = isRight(i, values[i]);
      nextMarks[i] = ok;
      if (!ok) bad += 1;
    });
    setMarks(nextMarks);
    if (bad === 0) {
      setStatus('right');
      onSolved(index);
    } else {
      setStatus('wrong');
    }
  }

  const locked = status === 'right' || status === 'revealed' || done;
  const badCount = Object.values(marks).filter((m) => m === false).length;

  return (
    <div className={styles.pane}>
      <div className={styles.meta}>
        <span className={styles.badge}>{title || t.problem(index + 1)}</span>
        {company ? <span className={styles.company}>{company}</span> : null}
      </div>
      <p className={styles.hint}>{t.clozeHint}</p>
      <p className={styles.clozeText}>
        {segments.map((seg, k) => {
          if (seg.blank === undefined) return <React.Fragment key={k}>{seg.text}</React.Fragment>;
          const i = seg.blank;
          const answer = seg.options[0];
          const mark = marks[i];
          const cls = [
            styles.clozeInput,
            mark === true || (locked && status !== 'revealed') ? styles.clozeOk : '',
            mark === false ? styles.clozeBad : '',
          ].join(' ');
          return (
            <span key={k} className={styles.clozeSlot}>
              <input
                className={cls}
                type="text"
                value={values[i] ?? ''}
                disabled={locked}
                size={Math.max(6, Math.min(28, answer.length + 2))}
                aria-label={t.clozeBlankAria(i + 1)}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => update(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !locked) check();
                }}
              />
              {status === 'revealed' && !isRight(i, values[i]) ? (
                <span className={styles.clozeAnswer}>{answer}</span>
              ) : null}
              {hinted && !locked && !isRight(i, values[i]) ? (
                <span className={styles.clozeHintLetter}>{answer.charAt(0)}…</span>
              ) : null}
            </span>
          );
        })}
      </p>
      {!locked ? (
        <div className={styles.row}>
          <button type="button" className={styles.primary} onClick={check}>
            {t.check}
          </button>
          {!hinted ? (
            <button type="button" className={styles.secondary} onClick={() => setHinted(true)}>
              {t.hint}
            </button>
          ) : null}
          <button type="button" className={styles.secondary} onClick={() => setStatus('revealed')}>
            {t.showAnswer}
          </button>
          {hasNextUnsolved ? (
            <button type="button" className={styles.secondary} onClick={onCheckLater}>
              {t.checkLater}
            </button>
          ) : null}
        </div>
      ) : null}
      {status === 'revealed' && !done ? (
        <div className={styles.row}>
          <button type="button" className={styles.primary} onClick={() => onSolved(index)}>
            {t.markReviewed}
          </button>
          {hasNextUnsolved ? (
            <button type="button" className={styles.secondary} onClick={onCheckLater}>
              {t.checkLater}
            </button>
          ) : null}
        </div>
      ) : null}
      {done && hasNextUnsolved ? (
        <div className={styles.row}>
          <button type="button" className={styles.secondary} onClick={onCheckLater}>
            {t.nextUnsolved}
          </button>
        </div>
      ) : null}
      {hinted && !locked ? <p className={styles.hint}>{t.hintText}</p> : null}
      {status === 'empty' ? <p className={styles.why}>{t.clozeEmpty}</p> : null}
      {status === 'wrong' ? <p className={styles.why}>{t.clozeSomeWrong(badCount, blanks.length)}</p> : null}
      {status === 'revealed' ? (
        <p className={styles.whyOk}>
          {t.answerShown}{' '}
          <strong>{t.officialSolution}</strong> {blanks.map((b) => b.options[0]).join(' · ')}
          {why ? (
            <>
              {' '}
              <MathText text={why} />
            </>
          ) : null}
        </p>
      ) : null}
      {status === 'right' || (done && status !== 'revealed') ? (
        <p className={styles.whyOk}>
          {t.clozeAllRight}
          {why ? (
            <>
              {' '}
              <MathText text={why} />
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
