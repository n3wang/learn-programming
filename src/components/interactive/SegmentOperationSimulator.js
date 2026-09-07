import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const MODES = {
  sum: {
    title: '线段的和',
    book: { a: 4, b: 2 },
    prompt: (a, b) => `在直线上作线段 AB = a，再在 AB 的延长线上作线段 BC = b。线段 AC 是 a 与 b 的和。`,
    result: (a, b) => a + b,
    formula: (a, b) => `AC = a + b = ${a} + ${b} = ${a + b}`,
  },
  diff: {
    title: '线段的差',
    book: { a: 5, b: 2 },
    prompt: (a, b) => `已知 a > b。在线段 AB = a 上作线段 BD = b，那么线段 AD 就是 a 与 b 的差。`,
    result: (a, b) => a - b,
    formula: (a, b) => `AD = a − b = ${a} − ${b} = ${a - b}`,
  },
  twoAminusB: {
    title: '例：作 2a − b',
    book: { a: 3, b: 2 },
    prompt: (a, b) => `已知线段 a、b，作一条线段等于 2a − b。`,
    result: (a, b) => 2 * a - b,
    formula: (a, b) => `先作 AC = 2a，再在 AC 上截取 CD = b，则 AD = 2a − b = ${2 * a - b}`,
  },
  aPlus2b: {
    title: '练习 2：作 a + 2b',
    book: { a: 4, b: 2 },
    prompt: (a, b) => `已知线段 a、b，作一条线段，使它等于 a + 2b。`,
    result: (a, b) => a + 2 * b,
    formula: (a, b) => `作 AB = a，再在延长线上依次作 BC = b、CD = b，则 AD = a + 2b = ${a + 2 * b}`,
  },
  aPlus2bMinusC: {
    title: '习题 8：作 a + 2b − c',
    book: { a: 4, b: 2, c: 2 },
    prompt: (a, b, c) => `已知线段 a、b、c，作一条线段等于 a + 2b − c。`,
    result: (a, b, c) => a + 2 * b - c,
    formula: (a, b, c) => `先作 AD = a + 2b，再在 AD 上截取一段 c，剩下的就是 a + 2b − c = ${a + 2 * b - c}`,
  },
};

function generate(mode) {
  if (mode === 'diff' || mode === 'twoAminusB') {
    const b = randInt(2, 4);
    const a = b + randInt(2, 4);
    return { a, b };
  }
  if (mode === 'aPlus2bMinusC') {
    const b = randInt(2, 3);
    const a = randInt(3, 5);
    const c = randInt(1, a + b - 1);
    return { a, b, c };
  }
  return { a: randInt(3, 6), b: randInt(2, 4) };
}

function Marks({ mode, a, b, c = 0, scale }) {
  const x0 = 28;
  if (mode === 'sum') {
    const xB = x0 + a * scale;
    const xC = xB + b * scale;
    return (
      <>
        <line x1={x0} y1="48" x2={xC} y2="48" stroke="#1565c0" strokeWidth="2" />
        <circle cx={x0} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xB} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xC} cy="48" r="3.2" fill="#c62828" />
        <text x={x0 - 4} y="68" fontSize="13">A</text>
        <text x={xB - 4} y="68" fontSize="13">B</text>
        <text x={xC - 4} y="68" fontSize="13">C</text>
        <text x={(x0 + xB) / 2} y="40" fontSize="12">a</text>
        <text x={(xB + xC) / 2} y="40" fontSize="12">b</text>
      </>
    );
  }
  if (mode === 'diff') {
    const xB = x0 + a * scale;
    const xD = xB - b * scale;
    return (
      <>
        <line x1={x0} y1="48" x2={xB} y2="48" stroke="#1565c0" strokeWidth="2" />
        <circle cx={x0} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xD} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xB} cy="48" r="3.2" fill="#c62828" />
        <text x={x0 - 4} y="68" fontSize="13">A</text>
        <text x={xD - 4} y="68" fontSize="13">D</text>
        <text x={xB - 4} y="68" fontSize="13">B</text>
        <text x={(x0 + xB) / 2} y="40" fontSize="12">a</text>
        <text x={(xD + xB) / 2} y="62" fontSize="12">b</text>
      </>
    );
  }
  if (mode === 'twoAminusB') {
    const xB = x0 + a * scale;
    const xC = x0 + 2 * a * scale;
    const xD = xC - b * scale;
    return (
      <>
        <line x1={x0} y1="48" x2={xC} y2="48" stroke="#1565c0" strokeWidth="2" />
        <circle cx={x0} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xB} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xD} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xC} cy="48" r="3.2" fill="#c62828" />
        <text x={x0 - 4} y="68" fontSize="13">A</text>
        <text x={xB - 4} y="68" fontSize="13">B</text>
        <text x={xD - 4} y="68" fontSize="13">D</text>
        <text x={xC - 4} y="68" fontSize="13">C</text>
        <text x={(x0 + xB) / 2} y="40" fontSize="12">a</text>
        <text x={(xB + xC) / 2} y="40" fontSize="12">a</text>
        <text x={(xD + xC) / 2} y="40" fontSize="12">b</text>
      </>
    );
  }
  if (mode === 'aPlus2bMinusC') {
    const xB = x0 + a * scale;
    const xC = xB + b * scale;
    const xD = xC + b * scale;
    const xE = xD - c * scale;
    return (
      <>
        <line x1={x0} y1="48" x2={xD} y2="48" stroke="#1565c0" strokeWidth="2" />
        <circle cx={x0} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xE} cy="48" r="3.2" fill="#c62828" />
        <circle cx={xD} cy="48" r="3.2" fill="#c62828" />
        <text x={x0 - 4} y="68" fontSize="13">A</text>
        <text x={xE - 4} y="68" fontSize="13">E</text>
        <text x={xD - 4} y="68" fontSize="13">D</text>
        <text x={(x0 + xB) / 2} y="40" fontSize="12">a</text>
        <text x={(xB + xC) / 2} y="40" fontSize="12">b</text>
        <text x={(xC + xD) / 2} y="40" fontSize="12">b</text>
        <text x={(xE + xD) / 2} y="62" fontSize="12">c</text>
      </>
    );
  }
  const xB = x0 + a * scale;
  const xC = xB + b * scale;
  const xD = xC + b * scale;
  return (
    <>
      <line x1={x0} y1="48" x2={xD} y2="48" stroke="#1565c0" strokeWidth="2" />
      <circle cx={x0} cy="48" r="3.2" fill="#c62828" />
      <circle cx={xB} cy="48" r="3.2" fill="#c62828" />
      <circle cx={xC} cy="48" r="3.2" fill="#c62828" />
      <circle cx={xD} cy="48" r="3.2" fill="#c62828" />
      <text x={x0 - 4} y="68" fontSize="13">A</text>
      <text x={xB - 4} y="68" fontSize="13">B</text>
      <text x={xC - 4} y="68" fontSize="13">C</text>
      <text x={xD - 4} y="68" fontSize="13">D</text>
      <text x={(x0 + xB) / 2} y="40" fontSize="12">a</text>
      <text x={(xB + xC) / 2} y="40" fontSize="12">b</text>
      <text x={(xC + xD) / 2} y="40" fontSize="12">b</text>
    </>
  );
}

export default function SegmentOperationSimulator({ initialMode = 'sum' }) {
  const [key, setKey] = useState(0);
  const [mode, setMode] = useState(initialMode);
  const [p, setP] = useState(() => MODES[initialMode].book);
  const spec = MODES[mode];
  const scale = useMemo(() => (mode === 'twoAminusB' || mode === 'aPlus2b' || mode === 'aPlus2bMinusC' ? 14 : 22), [mode]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="作" badgeClass={stepStyles.badgeSet}>
        {spec.formula(p.a, p.b, p.c)}
      </SolutionStep>
      <SolutionStep badge="得" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>所作线段的长度是 {spec.result(p.a, p.b, p.c)}。</div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title={spec.title}
      subtitle="在直线上截取，用和与差表示线段"
      problemKey={`${key}-${mode}`}
      onRandomize={() => {
        setP(generate(mode));
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(spec.book);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {Object.entries(MODES).map(([id, item]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setP(MODES[id].book);
            }}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: mode === id ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {item.title}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 0 }}>
        设 a = {p.a}，b = {p.b}{p.c ? `，c = ${p.c}` : ''}。{spec.prompt(p.a, p.b, p.c)}
      </p>
      <svg viewBox="0 0 320 88" width="100%" height="88">
        <Marks mode={mode} a={p.a} b={p.b} c={p.c} scale={scale} />
      </svg>
    </ProblemShell>
  );
}
