import React, {useState} from 'react';
import styles from './styles.module.css';

export const DEFAULT_GATE_PALETTE = [
  {kind: 'input', label: 'Input'},
  {kind: 'output', label: 'Output'},
  {kind: 'gate', gate: 'BUFFER', label: 'BUFFER'},
  {kind: 'gate', gate: 'NOT', label: 'NOT'},
  {kind: 'gate', gate: 'AND', label: 'AND'},
  {kind: 'gate', gate: 'OR', label: 'OR'},
  {kind: 'gate', gate: 'NAND', label: 'NAND'},
  {kind: 'gate', gate: 'NOR', label: 'NOR'},
  {kind: 'gate', gate: 'XOR', label: 'XOR'},
  {kind: 'gate', gate: 'XNOR', label: 'XNOR'},
];

/**
 * A searchable "deck" of draggable gate/input/output chips. Drag one onto
 * the canvas to drop a fresh node there — see NodeLab's onDrop handler.
 */
export default function GatePalette({items, dragMime}) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className={styles.palette}>
      <input
        className={styles.paletteSearch}
        type="text"
        placeholder="Filter gates…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Filter gate deck"
      />
      <div className={styles.paletteList}>
        {filtered.map((item) => (
          <div
            key={item.label}
            className={styles.paletteChip}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(dragMime, JSON.stringify(item));
              e.dataTransfer.effectAllowed = 'move';
            }}
            title={`Drag onto the canvas to add a ${item.label}`}
          >
            {item.label}
          </div>
        ))}
        {filtered.length === 0 ? <p className={styles.paletteEmpty}>No matches.</p> : null}
      </div>
    </div>
  );
}
