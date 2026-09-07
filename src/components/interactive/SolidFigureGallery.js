import React, { useState } from 'react';
import SolidFigureView from '@site/src/components/interactive/solidView/SolidFigureView';
import styles from '@site/src/components/interactive/solidView/solidView.module.css';

const ITEMS = [
  { id: 'cuboid', name: '长方体', hint: '6 个平面，12 条直棱，8 个顶点' },
  { id: 'cylinder', name: '圆柱', hint: '上下底是平面（圆），侧面是曲面' },
  { id: 'cone', name: '圆锥', hint: '底面是圆，侧面是曲面，侧面与底面相交成曲的线' },
  { id: 'pyramid', name: '四棱锥', hint: '底面四边形，侧面三角形，交于一个顶点' },
  { id: 'prism', name: '三棱柱', hint: '两个三角形底面，三个长方形侧面' },
  { id: 'sphere', name: '球', hint: '整个表面是曲面，没有平的面' },
];

export default function SolidFigureGallery() {
  const [id, setId] = useState('cuboid');
  const [highlight, setHighlight] = useState('faces');
  const item = ITEMS.find((it) => it.id === id) || ITEMS[0];

  return (
    <div>
      <div className={styles.chips}>
        {ITEMS.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`${styles.chip} ${id === it.id ? styles.chipActive : ''}`}
            onClick={() => setId(it.id)}
          >
            {it.name}
          </button>
        ))}
      </div>
      <div className={styles.chips}>
        {[
          ['faces', '看面'],
          ['edges', '看棱'],
          ['vertices', '看顶点'],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            className={`${styles.chip} ${highlight === mode ? styles.chipActive : ''}`}
            onClick={() => setHighlight(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      <SolidFigureView solidId={id} highlight={highlight} height={240} caption="拖动可转动" />
      <p style={{ margin: '8px 0 0', fontSize: '0.95rem' }}>{item.hint}</p>
    </div>
  );
}
