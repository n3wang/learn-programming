import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { choiceField, ineqField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';
import SolutionSetNumberLine from '@site/src/components/interactive/shell/SolutionSetNumberLine';

function parseFlag(value) {
  return value === true || value === 'true' || value === '';
}

function bookProblem() {
  return { coef: 2, bound: 210 };
}

function generate() {
  const coef = randInt(2, 5);
  const cut = randInt(8, 18) * 5;
  return { coef, bound: coef * cut };
}

function trials(cut) {
  return [cut - 15, cut - 5, cut, cut + 5, cut + 15];
}

/**
 * Inquiry: which numbers satisfy 2x > 210, then the number line.
 * Demo: `<InequalitySolutionSetSimulator demo dir="right" label="33" />`
 * also `dir="left"`, `closed`, or `relation=">="`.
 */
export default function InequalitySolutionSetSimulator({
  demo = false,
  bound,
  label,
  dir = 'right',
  relation,
  closed = false,
  variable = 'x',
  caption,
}) {
  if (parseFlag(demo)) {
    const filled = parseFlag(closed);
    return (
      <figure style={{ margin: '0.75rem 0 1.25rem', maxWidth: 420 }}>
        {caption ? <figcaption style={{ marginBottom: 4 }}>{caption}</figcaption> : null}
        <SolutionSetNumberLine
          bound={bound}
          label={label}
          dir={dir}
          relation={relation}
          closed={filled}
          variable={variable}
        />
      </figure>
    );
  }

  return <SolutionSetInquiry />;
}

function SolutionSetInquiry() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  const [picked, setPicked] = useState(110);
  const cut = useMemo(() => p.bound / p.coef, [p]);
  usePracticeAnswer([
    ...[cut - 5, cut, cut + 5].map((n, i) =>
      choiceField(`t${i}`, `x = ${n} 是解吗？`, ['是', '不是'], p.coef * n > p.bound ? '是' : '不是'),
    ),
    ineqField('set', '解集', `x > ${cut}`),
  ]);
  const values = useMemo(() => trials(cut), [cut]);
  const product = p.coef * picked;
  const holds = product > p.bound;

  const solution = (
    <Solution legend={[[BLUE, '代入的数'], [GREEN, '是解'], [RED, '不是解']]}>
      <Step b="知" kind="set">
        能使不等式成立的未知数的值叫做不等式的<b>解</b>；所有的解合在一起叫做<b>解集</b>。判断一个数是不是解：代入，看不等式是否成立。
      </Step>
      <Step b="试" kind="list">
        <EqBox
          lines={[cut - 5, cut, cut + 5].map((n) => {
            const v = p.coef * n;
            const ok = v > p.bound;
            return `x = ${c(BLUE, n)}:\\quad ${p.coef}\\times ${n} = ${v} ${ok ? '>' : '\\le'} ${p.bound} \\;\\Rightarrow\\; ${ok ? c(GREEN, '\\text{是解}') : c(RED, '\\text{不是解}')}`;
          })}
        />
        注意 <M t={`x = ${cut}`} /> 时两边相等，「&gt;」不成立，所以 {cut} <b>不是</b>解。
      </Step>
      <Step b="集" kind="solve">
        两边除以正数 {p.coef}，方向不变：
        <EqBox lines={[`${p.coef}x > ${p.bound} \\;\\Rightarrow\\; ${c(GREEN, `x > ${cut}`)}`]} />
        任何大于 {cut} 的数都是解，这样的解有无数个。数轴上在 {cut} 处画空心圆圈（不包含 {cut}），向右画。
        <SolutionSetNumberLine label={String(cut)} dir="right" />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {[cut - 5, cut, cut + 5].map((n) => `x = ${n} ${p.coef * n > p.bound ? '是' : '不是'}解`).join('；')}；解集是 x &gt; {cut}。
        </Answer>
      </Step>
    </Solution>
  );

  if (practice) {
    return (
      <ProblemShell title="探究：哪些数是不等式的解？" subtitle="代入几个数试一试，再写出解集" problemKey={key} solution={solution}>
        <p style={{ marginTop: 0 }}>
          不等式 {p.coef}x &gt; {p.bound}。判断下面几个数是不是它的解，并写出解集。
        </p>
      </ProblemShell>
    );
  }

  return (
    <ProblemShell
      title="探究：哪些数是不等式的解？"
      subtitle="代入几个数，再看解集在数轴上怎么画"
      problemKey={key}
      onRandomize={() => {
        const next = generate();
        setP(next);
        setPicked(next.bound / next.coef + 5);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setPicked(110);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        不等式 {p.coef}x &gt; {p.bound}。点一个数试一试：它是不是这个不等式的解？
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPicked(n)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: picked === n ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            x = {n}
          </button>
        ))}
      </div>
      <p>
        {p.coef} × {picked} = {product}。{holds ? `${product} > ${p.bound}，所以 ${picked} 是解。` : `${product} 不大于 ${p.bound}，所以 ${picked} 不是解。`}
      </p>
      <SolutionSetNumberLine label={String(cut)} dir="right" />
      <p>空心圆圈表示解集不包含 {cut}。</p>
    </ProblemShell>
  );
}
