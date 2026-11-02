import React, {useEffect, useState} from 'react';
import {L} from './strings';
import {HINTS, POOLS, POOL_LABEL, normalizePools} from './mathQuestions';
import styles from './party.module.css';

/**
 * On-screen number pad for a question from mathQuestions.js. The typed
 * answer replaces the "?" in the question; fraction questions get a "/" key
 * and order-of-operations questions (answers may be negative) a "−" key.
 * onAnswer(typed) fires on OK; the pad then clears for the next question.
 * Physical keyboard digits / Backspace / Enter work the same as the pad.
 */
export default function MathPad({question, lang, onAnswer, flash = null, okLabel}) {
  const [typed, setTyped] = useState('');
  const fraction = question && question.pool === 'fractions';
  const negative = question && question.pool === 'chain';
  const press = (k) => {
    if (k === 'del') setTyped((x) => x.slice(0, -1));
    else if (k === 'ok') {
      setTyped((x) => {
        if (!x || x === '-' || x.endsWith('/')) return x;
        onAnswer(x);
        return '';
      });
    } else if (k === '/') setTyped((x) => (x && !x.includes('/') ? `${x}/` : x));
    else if (k === '-') setTyped((x) => (x.startsWith('-') ? x.slice(1) : `-${x}`));
    else setTyped((x) => (x.length < 5 ? x + k : x));
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
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [question, fraction, negative, onAnswer]);

  if (!question) return null;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok', ...(fraction ? ['/'] : []), ...(negative ? ['-'] : [])];
  return (
    <div className={styles.mathPad}>
      <div className={styles.mathQ} data-flash={flash}>
        {question.lines.map((line, i) => {
          const [before, after] = line.split('?');
          return (
            <span key={i}>
              {before}
              {after !== undefined && (
                <>
                  <b>{typed ? typed.replace('-', '−') : '?'}</b>
                  {after}
                </>
              )}
            </span>
          );
        })}
      </div>
      {question.hint && <p className={styles.mathHint}>{L(HINTS[question.hint], lang)}</p>}
      <div className={styles.numpad}>
        {keys.map((k) => (
          <button key={k} type="button" className={styles.numKey} data-kind={k === '/' ? 'frac' : k === '-' ? 'neg' : k} onClick={() => press(k)}>
            {k === 'del' ? '⌫' : k === 'ok' ? okLabel || 'OK' : k === '/' ? (lang === 'zh' ? '分数 /' : 'fraction /') : k === '-' ? (lang === 'zh' ? '负号 −' : 'negative −') : k}
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
