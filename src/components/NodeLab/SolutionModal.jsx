import React from 'react';
import styles from './styles.module.css';

function edgeLabel(r) {
  return r.label || `${r.source} → ${r.target}`;
}

function rowLabel(r) {
  return `${r.nodeId}.${r.text}${r.badge ? ` (${r.badge})` : ''}`;
}

export default function SolutionModal({mode, solution, truthTable, onClose}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <strong>Solution</strong>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {mode === 'wiring' ? (
          <div>
            {solution?.requiredEdges?.length ? (
              <>
                <p className={styles.modalSubhead}>Required connections</p>
                <ul className={styles.feedbackList}>
                  {solution.requiredEdges.map((r, i) => (
                    <li key={i}>{edgeLabel(r)}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {solution?.requiredRows?.length ? (
              <>
                <p className={styles.modalSubhead}>Required fields</p>
                <ul className={styles.feedbackList}>
                  {solution.requiredRows.map((r, i) => (
                    <li key={i}>{rowLabel(r)}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : (
          <div>
            <p className={styles.modalSubhead}>
              Required truth table — any circuit computing this is a valid solution
            </p>
            <table className={styles.truthTable}>
              <thead>
                <tr>
                  {truthTable.inputIds.map((id) => (
                    <th key={id}>{id}</th>
                  ))}
                  <th>{truthTable.outputId}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({length: 2 ** truthTable.inputIds.length}, (_, mask) => {
                  const combo = truthTable.inputIds.map((_, i) => Boolean((mask >> i) & 1));
                  const expected = Boolean(truthTable.expected(...combo));
                  return (
                    <tr key={mask}>
                      {combo.map((v, i) => (
                        <td key={i}>{v ? 1 : 0}</td>
                      ))}
                      <td>
                        <strong>{expected ? 1 : 0}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
