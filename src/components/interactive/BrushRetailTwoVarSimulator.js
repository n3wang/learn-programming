import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 阶梯价：A 超过 threshA 部分减 discountA；B 同理。
 * 书题：20 人；方案一 1A+2B → 325；方案二 2A+1B → 309；零售价 A=5，B=6。
 */
function bookProblem() {
  return {
    people: 20,
    threshA: 20,
    threshB: 15,
    discountA: 0.4,
    discountB: 0.6,
    perA1: 1,
    perB1: 2,
    cost1: 325,
    perA2: 2,
    perB2: 1,
    cost2: 309,
    x: 5,
    y: 6,
  };
}

function costOf(qty, retail, thresh, discount) {
  if (qty <= thresh) return qty * retail;
  return thresh * retail + (qty - thresh) * (retail - discount);
}

function generate() {
  for (let i = 0; i < 50; i++) {
    const people = randInt(16, 24);
    const threshA = people;
    const threshB = randInt(10, people - 2);
    const discountA = [0.2, 0.4, 0.5][randInt(0, 2)];
    const discountB = [0.3, 0.5, 0.6][randInt(0, 2)];
    const x = randInt(3, 9);
    const y = randInt(4, 10);
    const perA1 = 1;
    const perB1 = 2;
    const perA2 = 2;
    const perB2 = 1;
    const qtyA1 = people * perA1;
    const qtyB1 = people * perB1;
    const qtyA2 = people * perA2;
    const qtyB2 = people * perB2;
    const cost1 = costOf(qtyA1, x, threshA, discountA) + costOf(qtyB1, y, threshB, discountB);
    const cost2 = costOf(qtyA2, x, threshA, discountA) + costOf(qtyB2, y, threshB, discountB);
    if (!Number.isInteger(cost1 * 10) || !Number.isInteger(cost2 * 10)) continue;
    // ensure at least one scheme crosses a threshold (interesting)
    if (qtyA1 <= threshA && qtyB1 <= threshB && qtyA2 <= threshA && qtyB2 <= threshB) continue;
    return {
      people,
      threshA,
      threshB,
      discountA,
      discountB,
      perA1,
      perB1,
      cost1,
      perA2,
      perB2,
      cost2,
      x,
      y,
    };
  }
  return bookProblem();
}

export default function BrushRetailTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="毛笔：零售价与超量优惠"
      subtitle="分段计价 → 先写出两方案实付金额，再反解零售价"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          书法兴趣小组 <b>{p.people}</b> 名同学买 A、B 两种毛笔。销售规则：
          <br />
          （1）A 型一次购买不超过 <b>{p.threshA}</b> 支按零售价；超过部分每支比零售价低{' '}
          <b>{p.discountA}</b> 元。
          <br />
          （2）B 型一次购买不超过 <b>{p.threshB}</b> 支按零售价；超过部分每支比零售价低{' '}
          <b>{p.discountB}</b> 元。
          <br />
          若每人买 <b>{p.perA1}</b> 支 A 型和 <b>{p.perB1}</b> 支 B 型，共付 <b>{p.cost1}</b>{' '}
          元；若每人买 <b>{p.perA2}</b> 支 A 型和 <b>{p.perB2}</b> 支 B 型，共付 <b>{p.cost2}</b>{' '}
          元。A、B 型毛笔的零售价各是多少？
        </Typography>
      )}
      renderSolution={(p, s) => {
        const qtyA1 = p.people * p.perA1;
        const qtyB1 = p.people * p.perB1;
        const qtyA2 = p.people * p.perA2;
        const qtyB2 = p.people * p.perB2;

        function expandCost(qty, thresh, discount, varName) {
          if (qty <= thresh) {
            return { coeff: qty, const: 0, describe: `${qty}${varName}` };
          }
          const over = qty - thresh;
          // thresh * r + over * (r - d) = qty * r - over * d
          return {
            coeff: qty,
            const: -(over * discount),
            describe: `${thresh}${varName}+${over}(${varName}-${discount})`,
          };
        }

        const a1 = expandCost(qtyA1, p.threshA, p.discountA, 'x');
        const b1 = expandCost(qtyB1, p.threshB, p.discountB, 'y');
        const a2 = expandCost(qtyA2, p.threshA, p.discountA, 'x');
        const b2 = expandCost(qtyB2, p.threshB, p.discountB, 'y');
        const rhs1 = p.cost1 - (a1.const + b1.const);
        const rhs2 = p.cost2 - (a2.const + b2.const);

        return (
          <TwoVarSolution
            legendX="A 型零售价（元）"
            legendY="B 型零售价（元）"
            setText={
              <>
                设 A 型零售价 <MathText text={texX()} /> 元，B 型零售价 <MathText text={texY()} /> 元。
              </>
            }
            eq1={`${a1.coeff}x + ${b1.coeff}y = ${rhs1}`}
            eq2={`${a2.coeff}x + ${b2.coeff}y = ${rhs2}`}
            solveText={
              <>
                方案一实付：A {a1.describe}，B {b1.describe}，合计 {p.cost1} 元（移项后左边即为上式）。
                <br />
                方案二实付：A {a2.describe}，B {b2.describe}，合计 {p.cost2} 元。
                <br />
                用加减消元法解出零售价。
              </>
            }
            x={s.x}
            y={s.y}
            answer={
              <>
                A 型零售价 <AnimatedNumber value={s.x} decimals={Number.isInteger(s.x) ? 0 : 1} /> 元，B
                型零售价 <AnimatedNumber value={s.y} decimals={Number.isInteger(s.y) ? 0 : 1} /> 元。
              </>
            }
            check={
              <MathText
                text={`验算：把零售价代回分段计价，两方案实付分别为 ${p.cost1} 元与 ${p.cost2} 元 ✓`}
              />
            }
          />
        );
      }}
    />
  );
}
