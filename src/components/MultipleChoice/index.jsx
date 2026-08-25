import React, {useEffect, useState} from 'react';
import {Highlight, themes} from 'prism-react-renderer';
import useHtmlColorMode from '@site/src/components/codeWorkspace/useHtmlColorMode';
import styles from './styles.module.css';

function storageKey(id) {
  return `multiple-choice:${id}`;
}

function letters(index) {
  return String.fromCharCode(65 + index);
}

function looksLikeCode(line) {
  const t = (line || '').trim();
  return /^(def |class |for |if |while |elif |else:|print\(|import |from |#include|using |int |void |std::|public |private |return )/.test(
    t
  );
}

function guessLang(code) {
  if (/#include|std::|int main\s*\(/.test(code)) {
    return 'cpp';
  }
  if (/^\s*(def |class |import |print\()/.test(code) || /:\n/.test(code)) {
    return 'python';
  }
  if (/function |const |let |=>/.test(code)) {
    return 'javascript';
  }
  return 'text';
}

function parsePrompt(q) {
  const raw = q?.prompt || '';
  if (q?.code) {
    return {
      lead: raw,
      code: String(q.code).replace(/^\n/, '').replace(/\n$/, ''),
      lang: q.codeLang || q.lang || guessLang(q.code),
    };
  }
  const fence = raw.match(/^([\s\S]*?)```(\w*)\n([\s\S]*?)\n```\s*$/);
  if (fence) {
    return {
      lead: fence[1].trim(),
      code: fence[3],
      lang: fence[2] || guessLang(fence[3]),
    };
  }
  const blankSplit = raw.split(/\n\n/);
  if (blankSplit.length >= 2 && looksLikeCode(blankSplit[1].split('\n')[0])) {
    const code = blankSplit.slice(1).join('\n\n');
    return {
      lead: blankSplit[0].trim(),
      code,
      lang: q.codeLang || q.lang || guessLang(code),
    };
  }
  const lines = raw.split('\n');
  const idx = lines.findIndex((line, i) => i > 0 && looksLikeCode(line));
  if (idx > 0) {
    const code = lines.slice(idx).join('\n');
    return {
      lead: lines.slice(0, idx).join('\n').trim(),
      code,
      lang: q.codeLang || q.lang || guessLang(code),
    };
  }
  return {lead: raw, code: null, lang: 'text'};
}

function Prompt({q}) {
  const {lead, code, lang} = parsePrompt(q);
  const colorMode = useHtmlColorMode();
  const prismLang = lang === 'c++' || lang === 'cpp' ? 'cpp' : lang || 'text';
  return (
    <div className={styles.promptBlock}>
      {lead ? <p className={styles.prompt}>{lead}</p> : null}
      {code ? (
        <div className={styles.snippet}>
          <Highlight
            theme={colorMode === 'dark' ? themes.vsDark : themes.github}
            code={code}
            language={prismLang}
          >
            {({className, style, tokens, getLineProps, getTokenProps}) => (
              <pre className={[className, styles.code].filter(Boolean).join(' ')} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({line})}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({token})} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      ) : null}
    </div>
  );
}

const emptyState = {
  step: 0,
  pick: null,
  status: 'idle',
  missed: {},
  firstTryCorrect: 0,
  done: false,
};

export default function MultipleChoice({
  id,
  title = 'Check your understanding',
  questions = [],
}) {
  const [state, setState] = useState(emptyState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(id));
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.step === 'number') {
        setState({...emptyState, ...parsed});
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  function persist(next) {
    setState(next);
    try {
      window.localStorage.setItem(storageKey(id), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const total = questions.length;
  const q = questions[state.step] || questions[0];
  const qMissed = state.missed[state.step] || [];

  function answer(choiceIndex) {
    if (!q || state.status !== 'idle' || state.done) {
      return;
    }
    const correct = choiceIndex === q.answer;
    const missed = correct
      ? state.missed
      : {
          ...state.missed,
          [state.step]: [...qMissed, choiceIndex],
        };
    persist({
      ...state,
      pick: choiceIndex,
      status: correct ? 'right' : 'wrong',
      missed,
      firstTryCorrect:
        correct && qMissed.length === 0
          ? state.firstTryCorrect + 1
          : state.firstTryCorrect,
    });
  }

  function retry() {
    persist({
      ...state,
      pick: null,
      status: 'idle',
    });
  }

  function next() {
    const last = state.step >= total - 1;
    persist({
      ...state,
      step: last ? state.step : state.step + 1,
      pick: null,
      status: 'idle',
      done: last,
    });
  }

  function restart() {
    persist({...emptyState});
  }

  if (!q) {
    return null;
  }

  if (state.done) {
    return (
      <section className={styles.quiz} aria-label={title}>
        <header className={styles.header}>
          <span className={styles.badge}>Quiz</span>
          <h3 className={styles.title}>{title}</h3>
        </header>
        <div className={styles.finish}>
          <p className={styles.scorePass}>
            {state.firstTryCorrect} / {total} correct on the first try
          </p>
          <p className={styles.finishNote}>
            You can work through the questions again whenever you like.
          </p>
          <button type="button" className={styles.primary} onClick={restart}>
            Start over
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.quiz} aria-label={title}>
      <header className={styles.header}>
        <span className={styles.badge}>Quiz</span>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.progress}>
          {state.step + 1} / {total}
        </span>
      </header>
      <div className={styles.body}>
        <Prompt q={q} />
        <div className={styles.choices} role="radiogroup" aria-label={parsePrompt(q).lead || title}>
          {(q.choices || []).map((choice, cIndex) => {
            const chosen = state.pick === cIndex;
            const alreadyWrong = qMissed.includes(cIndex);
            let stateClass = '';
            if (state.status === 'right' && cIndex === q.answer) {
              stateClass = styles.right;
            } else if (chosen && state.status === 'wrong') {
              stateClass = styles.wrong;
            } else if (alreadyWrong) {
              stateClass = styles.used;
            }
            return (
              <button
                key={cIndex}
                type="button"
                className={`${styles.choice} ${chosen ? styles.selected : ''} ${stateClass}`}
                disabled={state.status !== 'idle' || alreadyWrong}
                onClick={() => answer(cIndex)}>
                <span className={styles.letter}>{letters(cIndex)}</span>
                {String(choice).includes('\n') ? (
                  <pre className={styles.choiceCode}>{choice}</pre>
                ) : (
                  <span>{choice}</span>
                )}
              </button>
            );
          })}
        </div>
        {state.status === 'right' ? (
          <p className={styles.whyOk}>
            Correct.{q.why ? ` ${q.why}` : ''}
          </p>
        ) : null}
        {state.status === 'wrong' ? (
          <p className={styles.why}>Not quite. Try a different option.</p>
        ) : null}
      </div>
      <div className={styles.actions}>
        {state.status === 'idle' ? (
          <p className={styles.hint}>Pick an answer to see if you are right.</p>
        ) : null}
        {state.status === 'wrong' ? (
          <button type="button" className={styles.secondary} onClick={retry}>
            Try again
          </button>
        ) : null}
        {state.status === 'right' ? (
          <button type="button" className={styles.primary} onClick={next}>
            {state.step >= total - 1 ? 'Finish' : 'Next question'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
