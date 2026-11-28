import React from 'react';
import {pinyin} from 'pinyin-pro';
import styles from './styles.module.css';

const CJK = /[㐀-鿿]/;

/** Chinese text with a pinyin reading over each character. Other text is unchanged. */
export default function PinyinTerm({text, block = false}) {
  const source = text == null ? '' : String(text);
  if (!CJK.test(source)) {
    return source;
  }
  let cells;
  try {
    const rows = pinyin(source, {toneType: 'symbol', type: 'all'});
    cells = Array.isArray(rows)
      ? rows.map((row) => ({ch: row.origin, py: row.isZh ? row.pinyin : ''}))
      : null;
  } catch {
    cells = null;
  }
  if (!cells) {
    return source;
  }
  return (
    <span className={block ? styles.block : styles.term}>
      {cells.map((cell, i) =>
        !cell.py && /\s/.test(cell.ch) ? (
          <span key={i} className={styles.gap}>
            {cell.ch}
          </span>
        ) : (
          <span key={i} className={styles.cell}>
            <span className={cell.py ? styles.py : styles.pyEmpty}>{cell.py || '\u00a0'}</span>
            <span className={styles.ch}>{cell.ch}</span>
          </span>
        ),
      )}
    </span>
  );
}
