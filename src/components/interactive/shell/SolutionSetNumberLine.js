import React from 'react';

function relationParts(relation, dir, closed) {
  if (relation) {
    const right = relation === '>' || relation === '>=' || relation === '≥';
    const filled = relation === '>=' || relation === '<=' || relation === '≥' || relation === '≤';
    return { right, filled };
  }
  return { right: dir !== 'left', filled: Boolean(closed) };
}

/**
 * Number-line picture of a solution set: open or filled endpoint, ray left or right.
 * Layout is a sketch, not a true scale — the bound is placed so the ray has room.
 */
export default function SolutionSetNumberLine({
  bound,
  label,
  dir = 'right',
  relation,
  closed = false,
  variable = 'x',
  width = '100%',
}) {
  const { right, filled } = relationParts(relation, dir, closed);
  const tick = right ? 112 : 168;
  const rayFrom = right ? tick + 7 : 48;
  const rayTo = right ? 226 : tick - 7;
  const display = label != null && label !== '' ? String(label) : bound != null ? String(bound) : '';
  const word = right ? '大于' : '小于';
  const endWord = filled ? '实心圆圈，包含端点' : '空心圆圈，不包含端点';

  return (
    <svg
      viewBox="0 0 280 72"
      width={width}
      height="78"
      role="img"
      aria-label={`${variable} ${right ? (filled ? '≥' : '>') : filled ? '≤' : '<'} ${display}，${endWord}，射线向${right ? '右' : '左'}`}
    >
      <line x1="18" y1="34" x2="258" y2="34" stroke="#455a64" strokeWidth="1.4" />
      <polygon points="258,34 248,29 248,39" fill="#455a64" />
      <line
        x1={rayFrom}
        y1="34"
        x2={rayTo}
        y2="34"
        stroke="#e91e63"
        strokeWidth="2.6"
      />
      {right ? (
        <polygon points="226,34 216,29 216,39" fill="#e91e63" />
      ) : (
        <polygon points="48,34 58,29 58,39" fill="#e91e63" />
      )}
      <circle
        cx={tick}
        cy="34"
        r="5.5"
        fill={filled ? '#e91e63' : 'var(--ifm-background-color, #fff)'}
        stroke="#e91e63"
        strokeWidth="1.8"
      />
      {display ? (
        <text x={tick} y="56" textAnchor="middle" fontSize="13" fill="currentColor">
          {display}
        </text>
      ) : null}
      <text x="246" y="22" fontSize="12" fill="currentColor">
        {variable}
      </text>
      <title>
        {word} {display}，{endWord}
      </title>
    </svg>
  );
}
