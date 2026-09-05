import React from 'react';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texSystem3, texX, texY, texZ, X_COLOR, Y_COLOR, Z_COLOR } from './texMath';
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
  return Number(v.toFixed(6)).toString();
}

/**
 * Shared KaTeX-first solution layout for 三元一次方程组 word problems.
 */
export default function ThreeVarSolution({
  setText,
  eq1,
  eq2,
  eq3,
  solveText,
  legendX,
  legendY,
  legendZ,
  x,
  y,
  z,
  answer,
  check,
}) {
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
        <span>
          <span className={styles.swatch} style={{ background: Z_COLOR }} />
          <MathText text={texZ()} /> {legendZ}
        </span>
      </div>

      <Step badge="设" badgeClass={styles.badgeSet}>
        {setText}
      </Step>

      <Step badge="列" badgeClass={styles.badgeList}>
        根据题意列方程组：
        <div className={styles.eqBox}>
          <MathText text={texSystem3(eq1, eq2, eq3)} />
        </div>
      </Step>

      <Step badge="解" badgeClass={styles.badgeSolve}>
        {solveText}
        <div style={{ marginTop: '0.35rem' }}>
          解得 <MathText text={texX(` = ${formatSol(x)}`)} />，
          <MathText text={texY(` = ${formatSol(y)}`)} />，
          <MathText text={texZ(` = ${formatSol(z)}`)} />。
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
