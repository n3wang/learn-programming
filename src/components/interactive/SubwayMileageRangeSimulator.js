import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { rangeField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const TIERS = [
  { fare: 3, text: '0 < x ≤ 6' },
  { fare: 4, text: '6 < x ≤ 12' },
  { fare: 5, text: '12 < x ≤ 22' },
  { fare: 6, text: '22 < x ≤ 32' },
];

function rangeFor(fare) {
  if (fare <= 6) return TIERS.find((row) => row.fare === fare);
  const extra = fare - 6;
  const low = 32 + (extra - 1) * 20;
  const high = 32 + extra * 20;
  return { fare, text: `${low} < x ≤ ${high}` };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function SubwayMileageRangeSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [fare, setFare] = useState(() => (practice ? randInt(4, 9) : 8));
  const [picked, setPicked] = useState(null);
  const answer = rangeFor(fare).text;
  usePracticeAnswer([rangeField('m', '里程 x（km）满足', answer)]);
  const options = [4, 5, 6, 7, 8, 9].map((n) => rangeFor(n).text);

  const extraYuan = fare - 6;
  const rangeLo = fare <= 6 ? null : 32 + (extraYuan - 1) * 20;
  const rangeHi = fare <= 6 ? null : 32 + extraYuan * 20;
  const solution = (
    <Solution legend={[[BLUE, '票价'], [GREEN, '里程范围']]}>
      <Step b="知" kind="set">
        每一档都是「超过下端、到上端为止（含）」，所以下端用 <M t="<" />，上端用 <M t="\le" />：
        <EqBox
          lines={[
            '3\\text{ 元}: 0 < x \\le 6, \\qquad 4\\text{ 元}: 6 < x \\le 12',
            '5\\text{ 元}: 12 < x \\le 22, \\qquad 6\\text{ 元}: 22 < x \\le 32',
            '\\text{超过 32 km 后：每多 1 元，多坐 20 km}',
          ]}
        />
      </Step>
      {fare <= 6 ? (
        <Step b="对" kind="solve">
          票价 <M t={c(BLUE, `${fare}\\text{ 元}`)} /> 正好是表里的一档：<M t={c(GREEN, plainToTex(answer))} />。
        </Step>
      ) : (
        <Step b="算" kind="solve">
          票价 <M t={c(BLUE, `${fare}\\text{ 元}`)} /> 比 6 元多 <M t={`${fare} - 6 = ${extraYuan}`} /> 元：
          <EqBox
            lines={[
              `\\text{上端} = 32 + ${extraYuan} \\times 20 = ${rangeHi}`,
              `\\text{下端} = 32 + ${extraYuan - 1} \\times 20 = ${rangeLo}\\quad(\\text{少 1 元时的上端})`,
              c(GREEN, `${rangeLo} < x \\le ${rangeHi}`),
            ]}
          />
        </Step>
      )}
      <Step b="答" kind="answer">
        <Answer>票价 {fare} 元时，里程 x（km）满足 {answer}。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title={`地铁票价 ${fare} 元时，里程满足什么不等式？`}
      subtitle="先对上分段，超过 32 km 后每 1 元增加 20 km"
      problemKey={key}
      onRandomize={() => {
        setFare(randInt(4, 9));
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setFare(8);
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        收费标准：不超过 6 km 为 3 元；超过 6 km 到 12 km（含）为 4 元；超过 12 km 到 22 km（含）为 5 元；超过 22 km 到 32 km（含）为 6 元；超过 32 km 的部分，每增加 1 元可再乘坐 20 km。
      </p>
      <p>单次购票花费 {fare} 元。选出里程 x km 的范围。</p>
      {!practice ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {options.map((choice) => (
            <button key={choice} type="button" style={chip} onClick={() => setPicked(choice)}>
              {choice}
            </button>
          ))}
        </div>
      ) : null}
      {picked ? <p>{picked === answer ? '对。上端含，下端不含。' : '再数一数从 6 元、32 km 起，多付了几元。'}</p> : null}
    </ProblemShell>
  );
}
