import React, {useEffect, useMemo, useState} from 'react';
import styles from './styles.module.css';

function storageKey(id) {
  return `numeric-problem-set:${id}`;
}

export function roundAtMost(n, decimals = 2) {
  if (!Number.isFinite(n)) return NaN;
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function parseNumber(raw) {
  const t = String(raw).trim().replace(/,/g, '');
  if (!t) return NaN;
  return Number(t);
}

export function NumericProblem({
  title,
  company,
  prompt,
  answer,
  why,
  decimals = 2,
  children,
}) {
  // Marker child for NumericProblemSet — rendered by the set.
  return null;
}

function ProblemPane({
  setId,
  index,
  title,
  company,
  prompt,
  answer,
  why,
  decimals = 2,
  done,
  onSolved,
}) {
  const key = `${setId}:p${index}`;
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setDraft('');
    setStatus(done ? 'right' : 'idle');
  }, [index, done]);

  function check() {
    const got = parseNumber(draft);
    if (!Number.isFinite(got)) {
      setStatus('invalid');
      return;
    }
    const ok = roundAtMost(got, decimals) === roundAtMost(Number(answer), decimals);
    setStatus(ok ? 'right' : 'wrong');
    if (ok) onSolved(index);
  }

  return (
    <div className={styles.pane}>
      <div className={styles.meta}>
        <span className={styles.badge}>{title || `Problem ${index + 1}`}</span>
        {company ? <span className={styles.company}>{company}</span> : null}
      </div>
      <p className={styles.prompt}>{prompt}</p>
      <p className={styles.hint}>
        Enter a number (at most {decimals} decimal place{decimals === 1 ? '' : 's'}
        {decimals === 0 ? ' — integer' : ''}).
      </p>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          inputMode="decimal"
          value={draft}
          disabled={status === 'right'}
          placeholder={decimals === 0 ? 'e.g. 1680' : 'e.g. 0.31'}
          aria-label="Numeric answer"
          onChange={(e) => {
            setDraft(e.target.value);
            setStatus('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && status !== 'right') check();
          }}
        />
        {status !== 'right' ? (
          <button type="button" className={styles.primary} onClick={check}>
            Check
          </button>
        ) : null}
      </div>
      {status === 'invalid' ? <p className={styles.why}>Enter a valid number.</p> : null}
      {status === 'wrong' ? <p className={styles.why}>Not quite — try again.</p> : null}
      {status === 'right' ? (
        <p className={styles.whyOk}>
          Correct ({roundAtMost(Number(answer), decimals)}).
          {why ? ` ${why}` : ''}
        </p>
      ) : null}
    </div>
  );
}

/**
 * ExerciseSet-style numbered tiles; each activity is a numeric interview problem.
 *
 * <NumericProblemSet id="…">
 *   <NumericProblem title="5.1" company="Google" prompt="…" answer={0.31} why="…" />
 * </NumericProblemSet>
 */
export default function NumericProblemSet({id, children}) {
  const items = useMemo(
    () =>
      React.Children.toArray(children)
        .filter(Boolean)
        .map((child) => child.props || {}),
    [children],
  );

  const [active, setActive] = useState(0);
  const [done, setDone] = useState({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(id));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setDone(parsed.done || {});
        if (typeof parsed.active === 'number') setActive(parsed.active);
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  function persist(nextDone, nextActive = active) {
    setDone(nextDone);
    setActive(nextActive);
    try {
      window.localStorage.setItem(
        storageKey(id),
        JSON.stringify({done: nextDone, active: nextActive}),
      );
    } catch {
      /* ignore */
    }
  }

  function onSolved(index) {
    persist({...done, [index]: true}, index);
  }

  const solvedCount = items.reduce((n, _, i) => n + (done[i] ? 1 : 0), 0);

  return (
    <div className={styles.set}>
      <div className={styles.bar}>
        <span className={styles.progress}>
          {solvedCount}/{items.length} solved
        </span>
        <div className={styles.tiles} role="tablist" aria-label="Problems">
          {items.map((item, i) => {
            const label = item.title || String(i + 1);
            return (
              <button
                key={label + i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={label}
                title={item.company ? `${label} · ${item.company}` : label}
                className={[
                  styles.tile,
                  i === active ? styles.tileActive : '',
                  done[i] ? styles.tileDone : '',
                ].join(' ')}
                onClick={() => persist(done, i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={i === active ? styles.slide : styles.slideHidden}
          hidden={i !== active}
        >
          <ProblemPane
            setId={id}
            index={i}
            title={item.title}
            company={item.company}
            prompt={item.prompt}
            answer={item.answer}
            why={item.why}
            decimals={item.decimals ?? 2}
            done={Boolean(done[i])}
            onSolved={onSolved}
          />
        </div>
      ))}
    </div>
  );
}
