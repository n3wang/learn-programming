import React, { useEffect } from 'react';
import { usePracticeMode } from './PracticeModeContext';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texSystem, texX, texY, X_COLOR, Y_COLOR } from './texMath';
import styles from './TwoVarSolution.module.css';

function Step({ badge, badgeClass, children }) {
  return (
    <div className={styles.step}>
      <span className={`${styles.badge} ${badgeClass || ''}`}>{badge}</span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

function formatSol(v) {
  if (typeof v !== 'number' || Number.isInteger(v)) return v;
  const s = Number(v.toFixed(6)).toString();
  return s;
}

/**
 * Shared, KaTeX-first solution layout for 二元一次方程组 word problems.
 * Walks 设 → 列 → 解 → 答 → 验, with color-coded x / y.
 *
 * @param {React.ReactNode} setText   — “设 …” prose (may include MathText)
 * @param {string} eq1, eq2          — raw LaTeX equation lines (x/y auto-colored)
 * @param {React.ReactNode} solveText — how to solve (代入 / 消元 …)
 * @param {string} legendX, legendY  — short labels for the color legend
 * @param {number|string} x, y       — solution values (string allowed for 无解 / fractions)
 * @param {React.ReactNode} answer   — final “答：…” line
 * @param {React.ReactNode} [check]  — optional 验算 line
 * @param {Array} [practiceFields]    — override the answer inputs a mixed-practice runner asks for
 *                                     (default: x and y, labelled by legendX / legendY)
 */
export default function TwoVarSolution({
  setText,
  eq1,
  eq2,
  solveText,
  legendX,
  legendY,
  x,
  y,
  answer,
  check,
  practiceFields,
}) {
  const practice = usePracticeMode();
  const reportFields = practice && practice.reportFields;
  const fieldsSig = JSON.stringify(practiceFields || [legendX, legendY, x, y]);
  useEffect(() => {
    if (!reportFields) return;
    reportFields(
      practiceFields || [
        { name: 'x', label: legendX, value: x },
        { name: 'y', label: legendY, value: y },
      ],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFields, fieldsSig]);
  return (
    <div className={styles.solution}>
      <div className={styles.legend}>
        <span>
          <span className={styles.swatch} style={{ background: X_COLOR }} />
          <MathText text={texX()} /> {legendX}
        </span>
        <span>
          <span className={styles.swatch} style={{ background: Y_COLOR }} />
          <MathText text={texY()} /> {legendY}
        </span>
      </div>

      <Step badge="设" badgeClass={styles.badgeSet}>
        {setText}
      </Step>

      <Step badge="列" badgeClass={styles.badgeList}>
        根据题意列方程组：
        <div className={styles.eqBox}>
          <MathText text={texSystem(eq1, eq2)} />
        </div>
      </Step>

      <Step badge="解" badgeClass={styles.badgeSolve}>
        {solveText}
        <div style={{ marginTop: '0.35rem' }}>
          解得 <MathText text={texX(` = ${formatSol(x)}`)} />，
          <MathText text={texY(` = ${formatSol(y)}`)} />。
        </div>
      </Step>

      <Step badge="答" badgeClass={styles.badgeAnswer}>
        <div className={styles.answer}>{answer}</div>
      </Step>

      {check ? (
        <Step badge="验" badgeClass={styles.badgeCheck}>
          <div className={styles.check}>{check}</div>
        </Step>
      ) : null}
    </div>
  );
}
