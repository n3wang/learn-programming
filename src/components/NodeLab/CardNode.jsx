import React, {useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import styles from './styles.module.css';

const VARIANT_CLASS = {
  table: styles.headerTable,
  class: styles.headerClass,
  service: styles.headerService,
  datastore: styles.headerDatastore,
  actor: styles.headerActor,
  generic: styles.headerGeneric,
};

function SideHandle({position, id}) {
  return (
    <React.Fragment>
      <Handle type="target" position={position} id={id} className={styles.handleTarget} />
      <Handle type="source" position={position} id={id} className={styles.handleSource} />
    </React.Fragment>
  );
}

function RowHandles({index}) {
  // Each row is its own positioning context (see .row { position: relative }
  // in styles.module.css), so these sit on the row's own edges rather than
  // the whole card's — that's what lets you wire e.g. posts.user_id straight
  // to users.user_id instead of just table-to-table.
  return (
    <React.Fragment>
      <Handle type="target" position={Position.Left} id={`row-${index}-left`} className={styles.handleTarget} />
      <Handle type="source" position={Position.Left} id={`row-${index}-left`} className={styles.handleSource} />
      <Handle type="target" position={Position.Right} id={`row-${index}-right`} className={styles.handleTarget} />
      <Handle type="source" position={Position.Right} id={`row-${index}-right`} className={styles.handleSource} />
    </React.Fragment>
  );
}

function AddRowForm({onAdd}) {
  const [text, setText] = useState('');
  const [badge, setBadge] = useState('');

  function submit() {
    if (!text.trim()) return;
    onAdd(text, badge);
    setText('');
    setBadge('');
  }

  return (
    <li className={`${styles.row} ${styles.addRow}`}>
      <input
        className={`${styles.addRowInput} nodrag`}
        placeholder="+ field name"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <input
        className={`${styles.addRowBadge} nodrag`}
        placeholder="badge"
        maxLength={4}
        value={badge}
        onChange={(e) => setBadge(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button type="button" className={`${styles.addRowBtn} nodrag`} onClick={submit}>
        +
      </button>
    </li>
  );
}

function CardBody({data}) {
  if (data.svg) {
    return <div className={styles.drawing} dangerouslySetInnerHTML={{__html: data.svg}} />;
  }
  const perRow = data.variant === 'table';
  if (!data.rows?.length && !(perRow && data.editableRows)) return null;
  return (
    <ul className={styles.rows}>
      {(data.rows || []).map((row, i) => (
        <li key={i} className={styles.row}>
          <span>{row.text}</span>
          {row.badge ? <span className={styles.rowBadge}>{row.badge}</span> : null}
          {perRow ? <RowHandles index={i} /> : null}
        </li>
      ))}
      {perRow && data.editableRows ? <AddRowForm onAdd={data.onAddRow} /> : null}
    </ul>
  );
}

function ValueDot({value}) {
  const cls =
    value === true ? styles.valueOn : value === false ? styles.valueOff : styles.valueUnknown;
  return <span className={`${styles.valueDot} ${cls}`} />;
}

function InputNode({data}) {
  return (
    <div className={styles.gateBox}>
      <div className={styles.gateTitle}>{data.title || 'input'}</div>
      <button
        type="button"
        className={`${styles.toggle} ${data.value ? styles.toggleOn : ''}`}
        onClick={data.onToggle}
        aria-pressed={Boolean(data.value)}
      >
        {data.value ? '1' : '0'}
      </button>
      <Handle type="source" position={Position.Right} id="out" className={styles.handleSource} />
    </div>
  );
}

function OutputNode({data}) {
  return (
    <div className={styles.gateBox}>
      <Handle type="target" position={Position.Left} id="a" className={styles.handleTargetBig} />
      <div className={styles.gateTitle}>{data.title || 'output'}</div>
      <div className={styles.probeValue}>
        <ValueDot value={data.value ?? null} />
        {data.value === true ? '1' : data.value === false ? '0' : '?'}
      </div>
    </div>
  );
}

function GateNode({data}) {
  const inputIds = data.inputs?.length ? data.inputs : ['a', 'b'];
  return (
    <div className={styles.gateBox}>
      {inputIds.map((id, i) => (
        <Handle
          key={id}
          type="target"
          position={Position.Left}
          id={id}
          className={styles.handleTargetBig}
          style={{top: `${((i + 1) / (inputIds.length + 1)) * 100}%`}}
        />
      ))}
      <div className={styles.gateTitle}>{typeof data.gate === 'string' ? data.gate : data.title}</div>
      <div className={styles.probeValue}>
        <ValueDot value={data.value ?? null} />
      </div>
      <Handle type="source" position={Position.Right} id="out" className={styles.handleSource} />
    </div>
  );
}

export default function CardNode({data}) {
  if (data.variant === 'input') return <InputNode data={data} />;
  if (data.variant === 'output') return <OutputNode data={data} />;
  if (data.variant === 'gate') return <GateNode data={data} />;

  return (
    <div className={styles.card}>
      <div className={`${styles.header} ${VARIANT_CLASS[data.variant] || styles.headerGeneric}`}>
        {data.stereotype ? <span className={styles.stereotype}>«{data.stereotype}»</span> : null}
        {data.title}
      </div>
      <CardBody data={data} />
      {data.variant !== 'table' ? (
        <React.Fragment>
          <SideHandle position={Position.Top} id="top" />
          <SideHandle position={Position.Right} id="right" />
          <SideHandle position={Position.Bottom} id="bottom" />
          <SideHandle position={Position.Left} id="left" />
        </React.Fragment>
      ) : null}
    </div>
  );
}
