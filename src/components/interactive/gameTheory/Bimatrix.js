import React from 'react';
import {P1_COLOR, P2_COLOR, NE_COLOR, fmt, bestRows, bestCols} from './gtCore';

/**
 * Bimatrix table. Player 1 picks rows (blue), Player 2 picks columns (red).
 * - showBR: underline best-response payoffs (among live strategies) and star cells where both are best.
 * - removedRows / removedCols: Sets of eliminated indices (greyed out).
 * - marked: Set of "r,c" keys the learner has clicked (guess mode).
 * - highlight: "r,c" key of the profile currently being played.
 */
export default function Bimatrix({
  rows,
  cols,
  payoffs,
  showBR = false,
  removedRows = new Set(),
  removedCols = new Set(),
  marked = null,
  highlight = null,
  onCellClick = null,
  p1 = 'Player 1',
  p2 = 'Player 2',
}) {
  const liveRows = rows.map((_, i) => i).filter((i) => !removedRows.has(i));
  const liveCols = cols.map((_, i) => i).filter((i) => !removedCols.has(i));
  const brR = cols.map((_, c) => bestRows(payoffs, liveRows, c));
  const brC = rows.map((_, r) => bestCols(payoffs, liveCols, r));

  const cellBase = {
    border: '1px solid var(--ifm-color-emphasis-400)',
    padding: '6px 10px',
    textAlign: 'center',
    minWidth: 64,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{overflowX: 'auto', margin: '8px 0'}}>
      <table style={{borderCollapse: 'collapse', margin: 0, display: 'table'}}>
        <thead>
          <tr>
            <th style={{...cellBase, border: 'none', fontSize: 12, color: 'var(--ifm-color-emphasis-700)'}}>
              <span style={{color: P1_COLOR}}>{p1}</span> \ <span style={{color: P2_COLOR}}>{p2}</span>
            </th>
            {cols.map((c, j) => (
              <th
                key={c}
                style={{
                  ...cellBase,
                  color: P2_COLOR,
                  opacity: removedCols.has(j) ? 0.3 : 1,
                  textDecoration: removedCols.has(j) ? 'line-through' : 'none',
                  background: 'transparent',
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r}>
              <th
                style={{
                  ...cellBase,
                  color: P1_COLOR,
                  opacity: removedRows.has(i) ? 0.3 : 1,
                  textDecoration: removedRows.has(i) ? 'line-through' : 'none',
                  background: 'transparent',
                }}
              >
                {r}
              </th>
              {cols.map((c, j) => {
                const key = `${i},${j}`;
                const dead = removedRows.has(i) || removedCols.has(j);
                const b1 = showBR && !dead && brR[j].has(i);
                const b2 = showBR && !dead && brC[i].has(j);
                const isNE = b1 && b2;
                const isMarked = marked?.has(key);
                const isHi = highlight === key;
                return (
                  <td
                    key={c}
                    onClick={onCellClick && !dead ? () => onCellClick(i, j) : undefined}
                    style={{
                      ...cellBase,
                      cursor: onCellClick && !dead ? 'pointer' : 'default',
                      opacity: dead ? 0.25 : 1,
                      background: isHi
                        ? 'rgba(250, 204, 21, 0.35)'
                        : isMarked
                          ? 'rgba(37, 99, 235, 0.15)'
                          : isNE
                            ? 'rgba(22, 163, 74, 0.15)'
                            : 'transparent',
                      outline: isMarked ? `2px solid ${P1_COLOR}` : 'none',
                      outlineOffset: -2,
                    }}
                  >
                    <span style={{color: P1_COLOR, fontWeight: b1 ? 800 : 500, textDecoration: b1 ? 'underline' : 'none'}}>
                      {fmt(payoffs[i][j][0])}
                    </span>
                    <span style={{color: 'var(--ifm-color-emphasis-600)'}}>, </span>
                    <span style={{color: P2_COLOR, fontWeight: b2 ? 800 : 500, textDecoration: b2 ? 'underline' : 'none'}}>
                      {fmt(payoffs[i][j][1])}
                    </span>
                    {isNE && <span style={{color: NE_COLOR, marginLeft: 4}}>★</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
