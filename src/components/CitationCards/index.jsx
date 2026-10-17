import React from 'react';
import Link from '@docusaurus/Link';
import {citationsForChapter} from '@site/src/data/citations/reliableAi';
import {CitationCard, useEssayLabData} from '@site/src/components/EssayLab/shared';
import styles from '@site/src/components/EssayLab/styles.module.css';

/**
 * Lesson references with practice quizzes. Passing a citation's quiz unlocks it in the Essay Lab.
 * Usage in MDX: <CitationCards chapter={3} />
 */
export default function CitationCards({chapter}) {
  const citations = citationsForChapter(Number(chapter));
  const {progress} = useEssayLabData();
  const unlocked = citations.filter((c) => progress[c.id]?.unlockedAt).length;

  return (
    <div className={styles.citationCards}>
      <div className={styles.citationCardsHead}>
        <span>
          {unlocked}/{citations.length} unlocked
        </span>
        <Link to="/essay-lab">Write with these in the Essay Lab →</Link>
      </div>
      {citations.map((c) => (
        <CitationCard key={c.id} citation={c} progress={progress[c.id]} />
      ))}
    </div>
  );
}
