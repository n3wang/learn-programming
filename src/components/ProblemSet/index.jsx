import React, {useEffect, useMemo, useState} from 'react';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import styles from './styles.module.css';
import MathText from './MathText';

function storageKey(id) {
  return `numeric-problem-set:${id}`;
}

function draftKey(setId, index) {
  return `numeric-problem-draft:${setId}:p${index}`;
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

function wordCount(text) {
  const t = String(text || '').trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

function missingKeywords(text, keywords) {
  const hay = String(text || '').toLowerCase();
  return (keywords || []).filter((kw) => !hay.includes(String(kw).toLowerCase()));
}

function formatKeywordLead(keywords) {
  const list = (keywords || []).map((k) => String(k).trim()).filter(Boolean);
  if (!list.length) return null;
  if (list.length === 1) return `Using “${list[0]}”`;
  if (list.length === 2) return `Using “${list[0]}” and “${list[1]}”`;
  return `Using “${list.slice(0, -1).join('”, “')}”, and “${list[list.length - 1]}”`;
}

/** Next unsolved index after `from`, wrapping; null if everything is solved. */
function nextUnsolvedIndex(from, doneMap, total) {
  if (total < 1) return null;
  for (let step = 1; step <= total; step += 1) {
    const i = (from + step) % total;
    if (!doneMap[i]) return i;
  }
  return null;
}

export function Problem({
  title,
  company,
  type = 'numeric',
  prompt,
  answer,
  why,
  decimals = 2,
  minWords,
  keywords,
  children,
}) {
  // Marker child for ProblemSet — rendered by the set.
  return null;
}

function ConceptPane({
  setId,
  index,
  title,
  company,
  prompt,
  answer,
  minWords,
  keywords = [],
  done,
  onSolved,
  onCheckLater,
  hasNextUnsolved,
}) {
  const [draft, setDraft] = useState('');
  const [revealed, setRevealed] = useState(done);
  const [checked, setChecked] = useState(done);
  const [feedback, setFeedback] = useState('');

  const kwList = useMemo(
    () => (Array.isArray(keywords) ? keywords.map(String).filter(Boolean) : []),
    [keywords],
  );
  const needWords = Number(minWords) > 0 ? Number(minWords) : 0;
  const lead = formatKeywordLead(kwList);
  const hasRequirements = needWords > 0 || kwList.length > 0;

  useEffect(() => {
    setRevealed(done);
    setChecked(done || !hasRequirements);
    setFeedback('');
    try {
      const raw = window.localStorage.getItem(draftKey(setId, index));
      setDraft(raw && typeof raw === 'string' ? raw : '');
    } catch {
      setDraft('');
    }
  }, [index, done, setId, hasRequirements]);

  function saveDraft(next) {
    setDraft(next);
    try {
      window.localStorage.setItem(draftKey(setId, index), next);
    } catch {
      /* ignore */
    }
  }

  function validate() {
    const words = wordCount(draft);
    const missing = missingKeywords(draft, kwList);
    const issues = [];
    if (needWords > 0 && words < needWords) {
      issues.push(`Write at least ${needWords} words (you have ${words}).`);
    }
    if (missing.length) {
      issues.push(
        missing.length === 1
          ? `Include the required term “${missing[0]}”.`
          : `Include the required terms: ${missing.map((m) => `“${m}”`).join(', ')}.`,
      );
    }
    if (issues.length) {
      setFeedback(issues.join(' '));
      setChecked(false);
      return false;
    }
    setFeedback('');
    setChecked(true);
    return true;
  }

  const words = wordCount(draft);

  return (
    <div className={styles.pane}>
      <div className={styles.meta}>
        <span className={styles.badge}>{title || `Problem ${index + 1}`}</span>
        {company ? <span className={styles.company}>{company}</span> : null}
      </div>
      {lead ? (
        <TranslatableParagraph className={styles.keywordLead}>
          {`${lead}, explain:`}
        </TranslatableParagraph>
      ) : null}
      <TranslatableParagraph className={styles.prompt} translateKey={prompt}>
        <MathText text={prompt} />
      </TranslatableParagraph>
      {(needWords > 0 || kwList.length > 0) && !done ? (
        <p className={styles.hint}>
          {needWords > 0 ? `Minimum ${needWords} words. ` : ''}
          {kwList.length
            ? `Your answer must include: ${kwList.map((k) => `“${k}”`).join(', ')}.`
            : 'Type your explanation, then check before viewing the model answer.'}
        </p>
      ) : (
        <p className={styles.hint}>
          Type your own explanation, then compare with the model answer and mark as reviewed.
        </p>
      )}
      <textarea
        className={styles.textarea}
        value={draft}
        disabled={done}
        rows={6}
        placeholder="Write your answer here…"
        aria-label="Your written answer"
        onChange={(e) => {
          saveDraft(e.target.value);
          if (feedback) setFeedback('');
          if (hasRequirements && checked && !done) setChecked(false);
        }}
      />
      <div className={styles.draftMeta}>
        <span>
          {words} word{words === 1 ? '' : 's'}
        </span>
        {needWords > 0 ? (
          <span className={words >= needWords ? styles.metaOk : styles.metaWarn}>
            / {needWords} min
          </span>
        ) : null}
      </div>
      {feedback ? (
        <TranslatableParagraph className={styles.why}>{feedback}</TranslatableParagraph>
      ) : null}
      {!done ? (
        <div className={styles.row}>
          {hasRequirements && !checked ? (
            <button type="button" className={styles.primary} onClick={validate}>
              Check requirements
            </button>
          ) : null}
          {checked && !revealed ? (
            <button type="button" className={styles.primary} onClick={() => setRevealed(true)}>
              Show model answer
            </button>
          ) : null}
          {checked && revealed ? (
            <button type="button" className={styles.primary} onClick={() => onSolved(index)}>
              Mark as reviewed
            </button>
          ) : null}
          {hasNextUnsolved ? (
            <button type="button" className={styles.secondary} onClick={onCheckLater}>
              Check later
            </button>
          ) : null}
        </div>
      ) : (
        <div className={styles.row}>
          <p className={styles.hint} style={{margin: 0, flex: 1}}>
            Marked as reviewed.
          </p>
          {hasNextUnsolved ? (
            <button type="button" className={styles.secondary} onClick={onCheckLater}>
              Next unsolved
            </button>
          ) : null}
        </div>
      )}
      {hasRequirements && !done && !checked && !feedback ? (
        <p className={styles.hint}>
          Meet the writing requirements, then you can open the model answer.
        </p>
      ) : null}
      {revealed ? (
        <p className={styles.whyOk}>
          <MathText text={answer} />
        </p>
      ) : null}
    </div>
  );
}

function ProblemPane({
  setId,
  index,
  type = 'numeric',
  title,
  company,
  prompt,
  answer,
  why,
  decimals = 2,
  minWords,
  keywords,
  done,
  onSolved,
  onCheckLater,
  hasNextUnsolved,
}) {
  const MAX_ATTEMPTS = 2;
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('idle');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setDraft('');
    setAttempts(0);
    setStatus(done ? 'right' : 'idle');
  }, [index, done]);

  if (type === 'concept') {
    return (
      <ConceptPane
        setId={setId}
        index={index}
        title={title}
        company={company}
        prompt={prompt}
        answer={answer}
        minWords={minWords}
        keywords={keywords}
        done={done}
        onSolved={onSolved}
        onCheckLater={onCheckLater}
        hasNextUnsolved={hasNextUnsolved}
      />
    );
  }

  function check() {
    const got = parseNumber(draft);
    if (!Number.isFinite(got)) {
      setStatus('invalid');
      return;
    }
    const ok = roundAtMost(got, decimals) === roundAtMost(Number(answer), decimals);
    if (ok) {
      setStatus('right');
      onSolved(index);
      return;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setStatus(nextAttempts >= MAX_ATTEMPTS ? 'revealed' : 'wrong');
  }

  return (
    <div className={styles.pane}>
      <div className={styles.meta}>
        <span className={styles.badge}>{title || `Problem ${index + 1}`}</span>
        {company ? <span className={styles.company}>{company}</span> : null}
      </div>
      <TranslatableParagraph className={styles.prompt} translateKey={prompt}>
        <MathText text={prompt} />
      </TranslatableParagraph>
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
          disabled={status === 'right' || status === 'revealed'}
          placeholder={decimals === 0 ? 'e.g. 1680' : 'e.g. 0.31'}
          aria-label="Numeric answer"
          onChange={(e) => {
            setDraft(e.target.value);
            if (status !== 'revealed') setStatus('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && status !== 'right' && status !== 'revealed') check();
          }}
        />
        {status !== 'right' && status !== 'revealed' ? (
          <button type="button" className={styles.primary} onClick={check}>
            Check
          </button>
        ) : null}
        {!done && hasNextUnsolved ? (
          <button type="button" className={styles.secondary} onClick={onCheckLater}>
            Check later
          </button>
        ) : null}
      </div>
      {status === 'invalid' ? (
        <TranslatableParagraph className={styles.why}>Enter a valid number.</TranslatableParagraph>
      ) : null}
      {status === 'wrong' ? (
        <TranslatableParagraph className={styles.why}>
          {`Not quite — try again (${MAX_ATTEMPTS - attempts} attempt${
            MAX_ATTEMPTS - attempts === 1 ? '' : 's'
          } left before the answer is revealed).`}
        </TranslatableParagraph>
      ) : null}
      {status === 'revealed' ? (
        <TranslatableParagraph className={styles.why}>
          Official answer: <strong>{roundAtMost(Number(answer), decimals)}</strong>.
          {why ? (
            <>
              {' '}
              <MathText text={why} />
            </>
          ) : null}
        </TranslatableParagraph>
      ) : null}
      {status === 'right' ? (
        <TranslatableParagraph className={styles.whyOk}>
          Correct ({roundAtMost(Number(answer), decimals)}).
          {why ? (
            <>
              {' '}
              <MathText text={why} />
            </>
          ) : null}
        </TranslatableParagraph>
      ) : null}
    </div>
  );
}

/**
 * Interview problem bank with numbered tiles.
 *
 * type="numeric" (default) — check a number; reveal after two misses.
 * type="concept" — written answer; optional minWords / keywords
 * (“Using X and Y, explain: …”); then model answer + mark reviewed.
 *
 * Distinct from ExerciseSet (layout shell for CodeExercise / SqlExercise).
 *
 * <ProblemSet id="…">
 *   <Problem type="concept" keywords={['CLT']} minWords={40} … />
 * </ProblemSet>
 */
export default function ProblemSet({id, children}) {
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
    const nextDone = {...done, [index]: true};
    const next = nextUnsolvedIndex(index, nextDone, items.length);
    persist(nextDone, next == null ? index : next);
  }

  function onCheckLater() {
    const next = nextUnsolvedIndex(active, done, items.length);
    if (next == null) return;
    persist(done, next);
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
            type={item.type ?? 'numeric'}
            title={item.title}
            company={item.company}
            prompt={item.prompt}
            answer={item.answer}
            why={item.why}
            decimals={item.decimals ?? 2}
            minWords={item.minWords}
            keywords={item.keywords}
            done={Boolean(done[i])}
            onSolved={onSolved}
            onCheckLater={onCheckLater}
            hasNextUnsolved={nextUnsolvedIndex(i, done, items.length) != null}
          />
        </div>
      ))}
    </div>
  );
}

/** @deprecated Prefer ProblemSet / Problem — kept for existing MDX. */
export const NumericProblem = Problem;
export const NumericProblemSet = ProblemSet;

