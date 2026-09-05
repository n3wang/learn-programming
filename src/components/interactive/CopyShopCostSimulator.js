import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

const A = '#1565c0';
const B = '#c62828';

function tex(expr) {
  return `$${expr}$`;
}

/** 书练习 1：甲店门槛 20 页，0.12 / 0.09；乙店一律 0.1；交点 n = 240。 */
function bookProblem() {
  return { threshold: 20, aHigh: 0.12, aLow: 0.09, bFlat: 0.1 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const threshold = pickOne([10, 20, 25, 30]);
    const aHigh = pickOne([0.12, 0.15, 0.2]);
    const bFlat = pickOne([0.1, 0.11, 0.12]);
    if (bFlat >= aHigh) continue;
    const aLow = pickOne([0.05, 0.06, 0.08, 0.09]);
    if (aLow >= bFlat) continue;
    // For n > threshold: costA = aHigh*threshold + aLow*(n-threshold) = (aHigh-aLow)*threshold + aLow*n
    // Equal bFlat*n when n = (aHigh-aLow)*threshold / (bFlat - aLow)
    const num = Math.round((aHigh - aLow) * 100) * threshold;
    const den = Math.round((bFlat - aLow) * 100);
    if (den === 0 || num % den !== 0) continue;
    const n = num / den;
    if (n <= threshold) continue;
    return { threshold, aHigh, aLow, bFlat };
  }
  return bookProblem();
}

function derive(p) {
  // Work in 分 to avoid 0.1+0.2 style float noise.
  const aHigh = Math.round(p.aHigh * 100);
  const aLow = Math.round(p.aLow * 100);
  const bFlat = Math.round(p.bFlat * 100);
  const base = (aHigh - aLow) * p.threshold; // 分
  const nStar = base / (bFlat - aLow);
  return { base: base / 100, nStar };
}

export default function CopyShopCostSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <div className={stepStyles.legend}>
        <span>
          <span className={stepStyles.swatch} style={{ background: A }} />
          甲店
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: B }} />
          乙店
        </span>
      </div>

      <SolutionStep badge="列" badgeClass={stepStyles.badgeSet}>
        设复印 <MathText text={tex('n')} /> 页（
        <MathText text={tex(`n > ${p.threshold}`)} />，否则甲店更贵且两店费用不会相等）：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\textcolor{${A}}{C_{\\text{甲}}} = ${p.aHigh}\\times ${p.threshold} + ${p.aLow}(n - ${p.threshold}) = ${d.base} + ${p.aLow}n`,
            )}
          />
          <br />
          <MathText text={tex(`\\textcolor{${B}}{C_{\\text{乙}}} = ${p.bFlat}n`)} />
        </div>
      </SolutionStep>

      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        令两店收费相同：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${d.base} + ${p.aLow}n = ${p.bFlat}n`)} />
          <br />
          <MathText text={tex(`\\Rightarrow\\; n = \\mathbf{${d.nStar}}`)} />
        </div>
      </SolutionStep>

      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          复印 <AnimatedNumber value={d.nStar} /> 页时，两店收费相同。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习：甲乙复印店何时收费相同？"
      subtitle="分段计价 vs 统一单价——超过门槛后列一元一次方程"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography>
        在甲复印店用 A4 纸复印：不超过 <b>{p.threshold}</b> 页时每页 <b>{p.aHigh}</b> 元；超过部分每页{' '}
        <b>{p.aLow}</b> 元。在乙店不论多少页，每页都是 <b>{p.bFlat}</b> 元。复印页数为多少时，两店收费相同？
      </Typography>
    </ProblemShell>
  );
}
