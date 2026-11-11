import React from 'react';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from './SolutionStep';

/**
 * Small building blocks for worked solutions in the house style
 * (see CostPriceProfitSimulator): badged steps, boxed display equations,
 * colour-coded key numbers with a legend, and a bold 答 line.
 *
 *   <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
 *     <Step b="知" kind="set">已知 <M t={c(BLUE, 30) + '^\\circ'} />。记住：<EqBox lines={['…']} /></Step>
 *     <Step b="解" kind="solve"><EqBox lines={['90^\\circ - 30^\\circ = ' + c(GREEN, '60^\\circ')]} /></Step>
 *     <Step b="答" kind="answer"><Answer>余角是 60°。</Answer></Step>
 *   </Solution>
 */

export const BLUE = '#1565c0'; // given / known quantities
export const GREEN = '#2e7d32'; // results being asked for
export const RED = '#c62828'; // the other unknown / losses / “not this one”
export const ORANGE = '#e65100'; // a key intermediate value

/** Wrap a TeX snippet in a colour. */
export const c = (color, s) => `\\textcolor{${color}}{${s}}`;

/** d°m′ (and s″) as TeX from a total in minutes or seconds. */
export function texDms(total, unit = 'min') {
  const secs = unit === 'sec' ? Math.round(total) : Math.round(total * 60);
  const d = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  let out = `${d}^\\circ`;
  if (m || s) out += `${m}'`;
  if (s) out += `${s}''`;
  return out;
}

/**
 * Plain-text maths as simulators store it ('x − 7 + 7 > 26 + 7', '(1/7)x ≤ 6/7',
 * '(2x + 5)/3 − 1 < 2 − x', '移项得 x ≥ 8') → TeX for <M> / <EqBox>.
 */
export function plainToTex(str) {
  return String(str)
    .replace(/([　-〿一-鿿＀-￯]+)/g, '\\text{$1}')
    .replace(/[−–]/g, '-')
    .replace(/≥/g, '\\ge ')
    .replace(/≤/g, '\\le ')
    .replace(/≠/g, '\\ne ')
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ')
    .replace(/\(([^()]+)\)\/(\d+(?:\.\d+)?)/g, '\\dfrac{$1}{$2}')
    .replace(/([0-9a-z]+)\/(\d+(?:\.\d+)?)/g, '\\tfrac{$1}{$2}');
}

const KIND = {
  set: 'badgeSet',
  list: 'badgeList',
  solve: 'badgeSolve',
  answer: 'badgeAnswer',
  check: 'badgeCheck',
};

/** One badged row. `kind`: set | list | solve | answer | check (colour of the badge). */
export function Step({ b, kind = 'set', children }) {
  return (
    <SolutionStep badge={b} badgeClass={stepStyles[KIND[kind] || KIND.set]}>
      {children}
    </SolutionStep>
  );
}

/** Inline maths. */
export function M({ t }) {
  return <MathText text={`$${t}$`} />;
}

/** Boxed block of display equations, one per line. */
export function EqBox({ lines }) {
  return (
    <div className={stepStyles.eqBox}>
      {lines.filter(Boolean).map((line, i) => (
        <React.Fragment key={i}>
          {i ? <br /> : null}
          <MathText text={`$\\displaystyle ${line}$`} />
        </React.Fragment>
      ))}
    </div>
  );
}

export function Answer({ children }) {
  return <div className={stepStyles.answer}>{children}</div>;
}

/** 知 step: the three properties of inequalities (used by the 解不等式 solutions). */
export function InequalityRules({ extra }) {
  return (
    <Step b="知" kind="set">
      解不等式：用不等式的性质，一步步化成 <M t="x > a" />、<M t="x < a" /> 这样的形式。
      <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem' }}>
        <li>性质 1：两边加（或减）同一个数或式子，不等号方向<b>不变</b>；</li>
        <li>性质 2：两边乘（或除以）同一个<b>正数</b>，方向<b>不变</b>；</li>
        <li>
          性质 3：两边乘（或除以）同一个<b>负数</b>，方向<b style={{ color: RED }}>改变</b>。
        </li>
      </ul>
      {extra}
    </Step>
  );
}

/**
 * One badged step per item, rendering the simulator's own plain-text steps as TeX
 * with the final line (the solution set) in green.
 *   lead(item)        — text before the working (e.g. which property is used)
 *   after(item)       — node after the working (e.g. a number line)
 */
export function ItemSteps({ items, lead, after, badge }) {
  return items.map((item, i) => {
    const steps = item.steps && item.steps.length ? item.steps : [item.result];
    return (
      <Step key={item.id} b={badge ? badge(item, i) : `(${item.id})`} kind={i % 2 ? 'solve' : 'list'}>
        {lead ? lead(item) : null}
        <EqBox
          lines={steps.map((s, k) => (k === steps.length - 1 ? c(GREEN, plainToTex(s)) : plainToTex(s)))}
        />
        {after ? after(item) : null}
      </Step>
    );
  });
}

/** Which 口诀 decides the common part of two half-lines a, b ({ at, dir: 'left' | 'right' }). */
export function systemRule(a, b) {
  if (a.dir === b.dir) return a.dir === 'right' ? '同大取大：两个都是「大于」，取更大的那个' : '同小取小：两个都是「小于」，取更小的那个';
  const lo = a.dir === 'right' ? a : b;
  const hi = a.dir === 'right' ? b : a;
  if (lo.at < hi.at) return '大小小大中间找：一个「大于」一个「小于」，且有重叠，取中间一段';
  if (lo.at === hi.at && lo.closed && hi.closed) return '两端相等且都取到：只剩这一个数';
  return '大大小小找不到：要比大的还大、又比小的还小，没有公共部分';
}

/** Solution wrapper with an optional colour legend: legend = [[color, label], …]. */
export function Solution({ legend, children }) {
  return (
    <div className={stepStyles.solution}>
      {legend && legend.length ? (
        <div className={stepStyles.legend}>
          {legend.map(([color, label]) => (
            <span key={label}>
              <span className={stepStyles.swatch} style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
