import React, {Suspense, useCallback} from 'react';
import Link from '@docusaurus/Link';
import MathText from '@site/src/components/ProblemSet/MathText';
import {wikiPracticeKind} from '@site/src/data/wiki/catalog';
import WikiOrder from './WikiOrder';
import WikiKatexRecall from './WikiKatexRecall';
import {markWikiLearned, markWikiStudied} from './wikiStore';
import styles from './styles.module.css';

const FormulaExplorer = React.lazy(() => import('@site/src/components/interactive/FormulaExplorer.js'));
const GuidedChoiceExplanation = React.lazy(() =>
  import('@site/src/components/interactive/GuidedChoiceExplanation.js'),
);

export default function WikiDetail({entry, practice, onBack, onProgress}) {
  const finish = useCallback(() => {
    const write = practice ? markWikiLearned : markWikiStudied;
    write(entry.id).then(() => onProgress?.());
  }, [entry.id, practice, onProgress]);

  const mode = wikiPracticeKind(entry);
  const hasKatex = Boolean(entry.tex || entry.formula || entry.statement);
  const showCopy = !practice;
  const showOrder = Boolean(entry.order) && (!practice || mode === 'order');
  const showExplorer = Boolean(entry.explorer) && (!practice || mode === 'formula');
  const showGuided = Boolean(entry.sample) && (!practice || mode === 'guided');
  const showKatex = practice && mode === 'formula' && hasKatex;
  const showReadPass = practice && mode === 'read';

  return (
    <div className={styles.bodyEditor}>
      <div className={styles.noteBar}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h3 className={styles.wikiTitle}>{practice ? `practice · ${entry.title}` : entry.title}</h3>
      </div>
      <div className={styles.wikiDetail}>
        {showCopy && entry.statement ? (
          <p className={styles.wikiStatement}>
            <MathText text={entry.statement} />
          </p>
        ) : null}
        {showCopy && entry.formula ? (
          <p className={styles.wikiStatement}>
            <MathText text={entry.formula} />
          </p>
        ) : null}
        {showCopy && entry.description ? (
          <p className={styles.wikiBlurb}>
            <MathText text={entry.description} />
          </p>
        ) : null}

        {showExplorer ? (
          <div className={styles.wikiEmbed}>
            <Suspense fallback={<p className={styles.empty}>…</p>}>
              <FormulaExplorer
                preset={entry.explorer}
                compact
                hideFormula={practice}
                onInteract={practice ? (showKatex ? undefined : finish) : finish}
              />
            </Suspense>
          </div>
        ) : null}

        {showKatex ? <WikiKatexRecall key={entry.id} entry={entry} onPass={finish} /> : null}

        {showOrder ? <WikiOrder key={`${entry.id}-${practice ? 'p' : 's'}`} spec={entry.order} onPass={finish} /> : null}

        {showGuided ? (
          <div className={styles.wikiEmbed}>
            <Suspense fallback={<p className={styles.empty}>…</p>}>
              <GuidedChoiceExplanation
                preset={entry.sample}
                compact
                startMode={practice ? 'guided' : 'complete'}
                hideReveal={practice}
                onComplete={finish}
              />
            </Suspense>
          </div>
        ) : null}

        {showReadPass ? (
          <button type="button" className={styles.textBtn} onClick={finish}>
            Got it
          </button>
        ) : null}

        {!practice && entry.href ? (
          <Link className={styles.wikiLesson} to={entry.href}>
            Open lesson
          </Link>
        ) : null}
      </div>
    </div>
  );
}
