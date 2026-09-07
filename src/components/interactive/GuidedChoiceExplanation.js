import React, { useLayoutEffect, useRef, useState } from 'react';
import Button from '@site/src/components/ui/Button';
import MathText from '@site/src/components/ProblemSet/MathText';
import { getGuidedChoice } from './guidedChoice/guides';
import styles from './guidedChoiceExplanation.module.css';

/**
 * Worked-example strip.
 * Starts on the full solution. "Start guided" reveals one beat at a time:
 * three choices for the next move, and the next panel appears only after the right one.
 *
 * Guide content lives in guidedChoice/guides/ — register a new file there,
 * then use <GuidedChoiceExplanation preset="id" />.
 */
function revealThrough(steps, count) {
  let n = count;
  while (n < steps.length && !steps[n].ask) {
    n += 1;
  }
  return n;
}

function Panel({ text }) {
  return (
    <span className={styles.panel}>
      <MathText text={text} />
    </span>
  );
}

export default function GuidedChoiceExplanation({ preset }) {
  const data = getGuidedChoice(preset);
  const stageRef = useRef(null);
  const [mode, setMode] = useState('complete');
  const [shown, setShown] = useState(1);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [reserved, setReserved] = useState(0);

  const steps = data?.steps || [];
  const visible = mode === 'complete' ? steps.length : shown;
  const next = steps[shown];
  const waiting = mode === 'guided' && shown < steps.length && next?.ask;

  useLayoutEffect(() => {
    if (mode !== 'complete' || !stageRef.current) {
      return;
    }
    setReserved(stageRef.current.scrollHeight);
  }, [mode, preset, data]);

  if (!data) {
    return null;
  }

  function startGuided() {
    setMode('guided');
    setShown(revealThrough(steps, 1));
    setPicked(null);
    setWrong(false);
  }

  function showComplete() {
    setMode('complete');
    setPicked(null);
    setWrong(false);
  }

  function choose(index) {
    if (!waiting || picked != null) {
      return;
    }
    const choice = next.choices[index];
    if (choice?.ok) {
      setPicked(index);
      setWrong(false);
      window.setTimeout(() => {
        setShown((n) => revealThrough(steps, n + 1));
        setPicked(null);
      }, 280);
      return;
    }
    setWrong(true);
    setPicked(index);
    window.setTimeout(() => {
      setPicked(null);
    }, 450);
  }

  return (
    <section className={styles.root} aria-label={data.title}>
      
      <p className={styles.lead}>
      <b>{data.title} </b>
        {mode === 'complete' ? (
          <Button size="small" variant="text" onClick={startGuided}>
            开始引导
          </Button>
        ) : (
          <Button size="small" variant="text" onClick={showComplete}>
            看完整解答
          </Button>
        )}
        
        {mode === 'guided' ? (
          <Button size="small" variant="text" onClick={startGuided}>
            重来
          </Button>
        ) : null}
      <div >
      <MathText text={data.lead} />
      
      </div>
      </p>
      {data.note ? (
        <p className={styles.note}>
          <MathText text={data.note} />
        </p>
      ) : null}

      <div
        ref={stageRef}
        className={styles.stage}
        style={mode === 'guided' && reserved ? { minHeight: reserved } : undefined}
      >
        {steps.slice(0, visible).map((step, index) => (
          <div className={styles.beat} key={`${preset}-${index}`}>
            <p className={styles.caption}>
              <MathText text={step.caption} />
            </p>
            {step.panel ? (
              <div className={styles.panelRow}>
                <Panel text={step.panel} />
              </div>
            ) : null}
          </div>
        ))}

        {waiting ? (
          <div className={styles.askBlock}>
            <p className={styles.ask}>
              <MathText text={next.ask} />
            </p>
            <div className={styles.choices}>
              {next.choices.map((choice, index) => {
                const isPick = picked === index;
                const mark = isPick && choice.ok ? styles.choiceOk : isPick && wrong ? styles.choiceWrong : '';
                return (
                  <button
                    key={choice.label}
                    type="button"
                    className={`${styles.choice} ${mark}`}
                    onClick={() => choose(index)}
                  >
                    <MathText text={choice.label} />
                  </button>
                );
              })}
            </div>
            {wrong ? <p className={styles.hint}>再想一想，选对了下一面才会出现。</p> : null}
          </div>
        ) : null}

      </div>
    </section>
  );
}
