import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function labelOf(n) {
  return String(n).replace('-', '−');
}

function bookFigures() {
  return [
    { id: '1', kind: 'ray', dir: 'right', closed: true, at: -2 },
    { id: '2', kind: 'ray', dir: 'left', closed: false, at: 3 },
    { id: '3', kind: 'seg', left: -1, leftClosed: false, right: 4, rightClosed: true },
  ];
}

function randomFigures() {
  const a = randInt(-6, 2);
  const b = randInt(2, 7);
  const left = randInt(-5, 0);
  const right = left + randInt(2, 6);
  return [
    { id: '1', kind: 'ray', dir: 'right', closed: randInt(0, 1) === 1, at: a },
    { id: '2', kind: 'ray', dir: 'left', closed: randInt(0, 1) === 1, at: b },
    {
      id: '3',
      kind: 'seg',
      left,
      leftClosed: randInt(0, 1) === 1,
      right,
      rightClosed: randInt(0, 1) === 1,
    },
  ];
}

function rayAnswer(fig) {
  const at = labelOf(fig.at);
  if (fig.dir === 'right') return fig.closed ? `x ≥ ${at}` : `x > ${at}`;
  return fig.closed ? `x ≤ ${at}` : `x < ${at}`;
}

function segAnswer(fig) {
  const L = labelOf(fig.left);
  const R = labelOf(fig.right);
  const leftSign = fig.leftClosed ? '≤' : '<';
  const rightSign = fig.rightClosed ? '≤' : '<';
  return `${L} ${leftSign} x ${rightSign} ${R}`;
}

function answerOf(fig) {
  return fig.kind === 'ray' ? rayAnswer(fig) : segAnswer(fig);
}

function rayChoices(fig) {
  const at = labelOf(fig.at);
  return [`x ≥ ${at}`, `x > ${at}`, `x ≤ ${at}`, `x < ${at}`];
}

function segChoices(fig) {
  const L = labelOf(fig.left);
  const R = labelOf(fig.right);
  return [
    `${L} < x ≤ ${R}`,
    `${L} ≤ x < ${R}`,
    `${L} ≤ x ≤ ${R}`,
    `${L} < x < ${R}`,
  ];
}

function End({ cx, cy, closed }) {
  return closed ? (
    <circle cx={cx} cy={cy} r="5" fill="#e91e63" />
  ) : (
    <circle cx={cx} cy={cy} r="5" fill="#fff" stroke="#e91e63" strokeWidth="1.8" />
  );
}

function FigureView({ fig }) {
  const axisY = 36;
  const rayY = 22;
  if (fig.kind === 'ray') {
    const cx = fig.dir === 'right' ? 92 : 168;
    return (
      <svg viewBox="0 0 260 68" width="100%" height="74">
        <line x1="12" y1={axisY} x2="238" y2={axisY} stroke="#455a64" strokeWidth="1.4" />
        <polygon points="238,36 228,31 228,41" fill="#455a64" />
        {fig.dir === 'right' ? (
          <>
            <path d={`M ${cx} ${axisY} L ${cx} ${rayY} L 214 ${rayY}`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
            <polygon points="214,22 204,17 204,27" fill="#e91e63" />
          </>
        ) : (
          <>
            <path d={`M 36 ${rayY} L ${cx} ${rayY} L ${cx} ${axisY}`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
            <polygon points="36,22 46,17 46,27" fill="#e91e63" />
          </>
        )}
        <End cx={cx} cy={axisY} closed={fig.closed} />
        <text x={cx} y="58" textAnchor="middle" fontSize="13">{labelOf(fig.at)}</text>
      </svg>
    );
  }
  const x1 = 78;
  const x2 = 176;
  return (
    <svg viewBox="0 0 260 68" width="100%" height="74">
      <line x1="12" y1={axisY} x2="238" y2={axisY} stroke="#455a64" strokeWidth="1.4" />
      <polygon points="238,36 228,31 228,41" fill="#455a64" />
      <path d={`M ${x1} ${axisY} L ${x1} ${rayY} L ${x2} ${rayY} L ${x2} ${axisY}`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
      <End cx={x1} cy={axisY} closed={fig.leftClosed} />
      <End cx={x2} cy={axisY} closed={fig.rightClosed} />
      <text x={x1} y="58" textAnchor="middle" fontSize="13">{labelOf(fig.left)}</text>
      <text x={x2} y="58" textAnchor="middle" fontSize="13">{labelOf(fig.right)}</text>
    </svg>
  );
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalitySolutionReadSimulator() {
  const [key, setKey] = useState(0);
  const [figs, setFigs] = useState(bookFigures);
  const [picks, setPicks] = useState({});

  const solution = (
    <div className={stepStyles.solution}>
      {figs.map((fig) => (
        <SolutionStep key={fig.id} badge={fig.id} badgeClass={stepStyles.badgeSet}>
          {fig.kind === 'ray'
            ? `${fig.closed ? '实心' : '空心'}圆圈在 ${labelOf(fig.at)}，射线向${fig.dir === 'right' ? '右' : '左'}。${fig.closed ? '实心表示包含这个点。' : '空心表示不包含这个点。'}`
            : `左端 ${fig.leftClosed ? '实心' : '空心'}，右端 ${fig.rightClosed ? '实心' : '空心'}，只取两端之间的数。`}
        </SolutionStep>
      ))}
      <SolutionStep badge="集" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {figs.map((fig) => `（${fig.id}）${answerOf(fig)}`).join('；')}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1 看数轴写解集"
      subtitle="空心不包含，实心包含；线段只取两端之间"
      problemKey={key}
      onRandomize={() => {
        setFigs(randomFigures());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setFigs(bookFigures());
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>点选每幅图对应的解集。</p>
      {figs.map((fig) => {
        const choices = fig.kind === 'ray' ? rayChoices(fig) : segChoices(fig);
        const answer = answerOf(fig);
        const picked = picks[fig.id];
        return (
          <div key={fig.id} style={{ marginBottom: 10 }}>
            <div>（{fig.id}）</div>
            <FigureView fig={fig} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {choices.map((choice) => (
                <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [fig.id]: choice }))}>
                  {choice}
                </button>
              ))}
            </div>
            {picked ? <div>{picked === answer ? '对。' : '再看圆圈是空心还是实心，射线朝哪一边。'}</div> : null}
          </div>
        );
      })}
    </ProblemShell>
  );
}
