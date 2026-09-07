import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function jiaCost(x) {
  return x <= 100 ? x : 100 + 0.9 * (x - 100);
}

function yiCost(x) {
  return x <= 50 ? x : 50 + 0.95 * (x - 50);
}

function verdict(x) {
  const a = jiaCost(x);
  const b = yiCost(x);
  if (Math.abs(a - b) < 1e-9) return '相同';
  return a < b ? '甲较少' : '乙较少';
}

const SAMPLES = [40, 80, 150, 180];

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function SupermarketDealSimulator() {
  const [key, setKey] = useState(0);
  const [picked, setPicked] = useState(40);
  const [extra, setExtra] = useState(null);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="段" badgeClass={stepStyles.badgeSet}>
        x ≤ 50 时两家都不优惠，花费相同。50 &lt; x ≤ 100 时只有乙优惠，乙较少。
      </SolutionStep>
      <SolutionStep badge="比" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          x &gt; 100 时比较 100 + 0.9(x − 100) 与 50 + 0.95(x − 50)。差为 0 时 x = 150。所以 100 &lt; x &lt; 150 时乙较少，x = 150 时相同，x &gt; 150 时甲较少。不超过 50 元或等于 150 元时相同。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="例 4 到哪家超市花费较少？"
      subtitle="甲超 100 元后九折，乙超 50 元后九五折"
      problemKey={key}
      onRandomize={() => {
        setExtra(randInt(16, 28) * 10);
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setExtra(null);
        setPicked(40);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        甲、乙以同样价格出售同样商品。甲：累计超过 100 元后，超出部分按九折收费。乙：累计超过 50 元后，超出部分按九五折收费。点一个累计购物金额。
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(extra == null ? SAMPLES : [40, 80, 150, extra]).map((n) => (
          <button key={n} type="button" style={chip} onClick={() => setPicked(n)}>
            {n} 元
          </button>
        ))}
      </div>
      {picked != null ? (
        <p>
          累计 {picked} 元时，甲花费 {jiaCost(picked)} 元，乙花费 {yiCost(picked)} 元，{verdict(picked)}。
        </p>
      ) : null}
    </ProblemShell>
  );
}
