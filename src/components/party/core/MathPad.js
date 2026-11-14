import React, {useEffect, useState} from 'react';
import {L} from './strings';
import {HINTS, POOLS, POOL_LABEL, normalizePools} from './mathQuestions';
import styles from './party.module.css';

/**
 * On-screen number pad for a question from mathQuestions.js. The typed
 * answer replaces the "?" in the question; fraction questions get a "/" key
 * and order-of-operations questions (answers may be negative) a "−" key.
 * The inequalities pool also gets < > ≤ ≥ x and ∅.
 * onAnswer(typed) fires on OK; the pad then clears for the next question.
 * Physical keyboard digits / Backspace / Enter work the same as the pad.
 */
export default function MathPad({question, lang, onAnswer, flash = null, okLabel}) {
  const [typed, setTyped] = useState('');
  const ineq = question && question.pool === 'inequalities';
  const fraction = question && (question.pool === 'fractions' || ineq);
  const negative = question && (question.pool === 'chain' || ineq);
  const maxLen = ineq ? 12 : 5;
  const press = (k) => {
    if (k === 'del') setTyped((x) => x.slice(0, -1));
    else if (k === 'ok') {
      setTyped((x) => {
        if (!x || x === '-' || x === '−' || x.endsWith('/')) return x;
        if (ineq && /^[<>≤≥]+$/.test(x)) return x;
        onAnswer(x);
        return '';
      });
    } else if (k === '∅') setTyped('∅');
    else if (k === '/') setTyped((x) => (x && x !== '∅' && !x.includes('/') ? `${x}/` : x));
    else if (k === '-') setTyped((x) => (x === '∅' ? '-' : x.startsWith('-') ? x.slice(1) : `-${x}`));
    else if (k === '<' || k === '>' || k === '≤' || k === '≥' || k === 'x') {
      setTyped((x) => (x === '∅' ? k : x.length < maxLen ? x + k : x));
    } else setTyped((x) => (x === '∅' ? k : x.length < maxLen ? x + k : x));
  };

  useEffect(() => {
    if (!question) return undefined;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      const tag = el && el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
      const k = e.key;
      if (k >= '0' && k <= '9') {
        e.preventDefault();
        press(k);
        return;
      }
      if (k === 'Backspace' || k === 'Delete') {
        e.preventDefault();
        press('del');
        return;
      }
      if (k === 'Enter') {
        e.preventDefault();
        press('ok');
        return;
      }
      if (fraction && k === '/') {
        e.preventDefault();
        press('/');
        return;
      }
      if (negative && (k === '-' || k === '−')) {
        e.preventDefault();
        press('-');
        return;
      }
      if (ineq && (k === '<' || k === '>')) {
        e.preventDefault();
        press(k);
        return;
      }
      if (ineq && (k === 'x' || k === 'X')) {
        e.preventDefault();
        press('x');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [question, fraction, negative, ineq, onAnswer]);

  if (!question) return null;
  // Inequalities: keep a 3-column digit pad, then relation / x / ∅ keys.
  const keys = ineq
    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok', '<', '>', '≤', '≥', '-', '/', 'x', '∅']
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok', ...(fraction ? ['/'] : []), ...(negative ? ['-'] : [])];
  const kindOf = (k) => {
    if (k === '/') return 'frac';
    if (k === '-') return 'neg';
    if (k === '∅') return 'empty';
    if (k === '<' || k === '>' || k === '≤' || k === '≥' || k === 'x') return 'ineq';
    return k;
  };
  const labelOf = (k) => {
    if (k === 'del') return '⌫';
    if (k === 'ok') return okLabel || 'OK';
    if (k === '/') return lang === 'zh' ? '分数 /' : 'fraction /';
    if (k === '-') return lang === 'zh' ? '负号 −' : 'negative −';
    if (k === '∅') return lang === 'zh' ? '无解 ∅' : 'none ∅';
    return k;
  };
  return (
    <div className={styles.mathPad}>
      <div className={styles.mathQ} data-flash={flash} data-ineq={ineq ? '1' : undefined}>
        {question.lines.map((line, i) => {
          const [before, after] = line.split('?');
          return (
            <span key={i}>
              {before}
              {after !== undefined && (
                <>
                  <b>{typed ? typed.replace(/-/g, '−') : '?'}</b>
                  {after}
                </>
              )}
            </span>
          );
        })}
      </div>
      {question.hint && <p className={styles.mathHint}>{L(HINTS[question.hint], lang)}</p>}
      <div className={styles.numpad} data-ineq={ineq ? '1' : undefined}>
        {keys.map((k) => (
          <button key={k} type="button" className={styles.numKey} data-kind={kindOf(k)} onClick={() => press(k)}>
            {labelOf(k)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Settings row: toggle question pools on and off (at least one stays on). */
export function PoolPicker({value, onChange, lang}) {
  const on = normalizePools(value);
  const toggle = (k) => {
    const next = on.includes(k) ? on.filter((x) => x !== k) : [...on, k];
    if (next.length) onChange(normalizePools(next));
  };
  return (
    <span className={styles.buttonRow}>
      {POOLS.map((k) => (
        <button key={k} type="button" role="checkbox" aria-checked={on.includes(k)} className="button button--sm button--secondary" onClick={() => toggle(k)}>
          {L(POOL_LABEL[k], lang)}
        </button>
      ))}
    </span>
  );
}
