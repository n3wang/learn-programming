import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CardNode from './CardNode';
import GatePalette, {DEFAULT_GATE_PALETTE} from './GatePalette';
import SolutionModal from './SolutionModal';
import {evaluateGraph, checkTruthTable} from './gates';
import {checkConnections, checkRows} from './checkGraph';
import {sanitizeEdges} from './handles';
import styles from './styles.module.css';

export {GATES} from './gates';

const nodeTypes = {card: CardNode};
const DRAG_MIME = 'application/x-nodelab-item';

function storageKey(id) {
  return `node-lab:${id}`;
}

function loadSaved(id) {
  try {
    const raw = window.localStorage.getItem(storageKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildInitialNodes(propNodes, saved) {
  const positions = saved?.positions || {};
  const values = saved?.values || {};
  const customRows = saved?.customRows || {};
  return propNodes.map((n) => ({
    ...n,
    type: n.type || 'card',
    position: positions[n.id] || n.position,
    data: {
      ...n.data,
      rows: n.data?.editableRows && customRows[n.id] ? customRows[n.id] : n.data?.rows,
      value: n.data?.variant === 'input' ? Boolean(values[n.id] ?? n.data.value) : n.data?.value,
    },
  }));
}

function makeNodeFromPaletteItem(item, position, seq) {
  const id = `${item.kind}-${seq}`;
  if (item.kind === 'input') {
    return {id, type: 'card', position, data: {variant: 'input', title: item.label, value: false}};
  }
  if (item.kind === 'output') {
    return {id, type: 'card', position, data: {variant: 'output', title: item.label}};
  }
  return {id, type: 'card', position, data: {variant: 'gate', gate: item.gate, title: item.label}};
}

function persistableEdge(e) {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    label: e.label,
  };
}

function NodeLabInner({
  id,
  height = 420,
  nodes: initialNodesProp,
  edges: initialEdgesProp,
  mode = 'sandbox',
  solution,
  truthTable,
  palette,
}) {
  const paletteItems = palette === true ? DEFAULT_GATE_PALETTE : Array.isArray(palette) ? palette : null;
  const {screenToFlowPosition} = useReactFlow();
  const dropSeq = useRef(0);
  const saved = useMemo(() => loadSaved(id), [id]);
  const initialNodes = useMemo(
    () => buildInitialNodes(initialNodesProp, saved),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(() =>
    sanitizeEdges(saved?.edges || initialEdgesProp, initialNodes),
  );
  const [done, setDone] = useState(() => Boolean(saved?.done));
  const [checkResult, setCheckResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [trashActive, setTrashActive] = useState(false);
  const trashRef = useRef(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDragOver = useCallback((event) => {
    if (!event.dataTransfer.types.includes(DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      const raw = event.dataTransfer.getData(DRAG_MIME);
      if (!raw) return;
      event.preventDefault();
      const item = JSON.parse(raw);
      const position = screenToFlowPosition({x: event.clientX, y: event.clientY});
      dropSeq.current += 1;
      const node = makeNodeFromPaletteItem(item, position, dropSeq.current);
      setNodes((nds) => [...nds, node]);
    },
    [screenToFlowPosition],
  );

  const isOverTrash = useCallback((event) => {
    const el = trashRef.current;
    if (!el || event.clientX == null) return false;
    const r = el.getBoundingClientRect();
    return (
      event.clientX >= r.left &&
      event.clientX <= r.right &&
      event.clientY >= r.top &&
      event.clientY <= r.bottom
    );
  }, []);

  const onNodeDrag = useCallback(
    (event) => setTrashActive(isOverTrash(event)),
    [isOverTrash],
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      if (isOverTrash(event)) {
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
      }
      setTrashActive(false);
    },
    [isOverTrash],
  );

  const toggleInput = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? {...n, data: {...n.data, value: !n.data.value}} : n,
      ),
    );
  }, []);

  const addRow = useCallback((nodeId, text, badge) => {
    const trimmed = String(text).trim();
    if (!trimmed) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                rows: [
                  ...(n.data.rows || []),
                  {text: trimmed, badge: String(badge || '').trim().toUpperCase() || undefined},
                ],
              },
            }
          : n,
      ),
    );
  }, []);

  const displayNodes = useMemo(() => {
    const values = mode === 'logic' ? evaluateGraph(nodes, edges) : null;
    return nodes.map((n) => {
      const extra = {};
      if (n.data?.variant === 'input') extra.onToggle = () => toggleInput(n.id);
      if (n.data?.editableRows) extra.onAddRow = (text, badge) => addRow(n.id, text, badge);
      if (values && (n.data?.variant === 'gate' || n.data?.variant === 'output')) {
        extra.value = values.get(n.id) ?? null;
      }
      return Object.keys(extra).length ? {...n, data: {...n.data, ...extra}} : n;
    });
  }, [nodes, edges, mode, toggleInput, addRow]);

  useEffect(() => {
    try {
      const positions = {};
      const values = {};
      const customRows = {};
      for (const n of nodes) {
        positions[n.id] = n.position;
        if (n.data?.variant === 'input') values[n.id] = Boolean(n.data.value);
        if (n.data?.editableRows) customRows[n.id] = n.data.rows || [];
      }
      window.localStorage.setItem(
        storageKey(id),
        JSON.stringify({positions, values, customRows, edges: edges.map(persistableEdge), done}),
      );
    } catch {
      /* ignore */
    }
  }, [nodes, edges, done, id]);

  function reset() {
    setNodes(buildInitialNodes(initialNodesProp, null));
    setEdges(initialEdgesProp);
    setDone(false);
    setCheckResult(null);
    setShowSolution(false);
    try {
      window.localStorage.removeItem(storageKey(id));
    } catch {
      /* ignore */
    }
  }

  function runCheck() {
    if (mode === 'wiring' && (solution?.requiredEdges || solution?.requiredRows)) {
      const edgeResult = solution.requiredEdges
        ? checkConnections(edges, solution.requiredEdges)
        : {pass: true, results: []};
      const rowResult = solution.requiredRows
        ? checkRows(nodes, solution.requiredRows)
        : {pass: true, results: []};
      const tests = [
        ...edgeResult.results.map((r) => ({
          label: r.label || `${r.source} → ${r.target}`,
          pass: r.ok,
        })),
        ...rowResult.results.map((r) => ({
          label: `${r.nodeId}.${r.text}${r.badge ? ` (${r.badge})` : ''}`,
          pass: r.ok,
          detail: r.ok ? null : 'field not found — did you add it?',
        })),
      ];
      const pass = tests.every((t) => t.pass);
      if (pass) setDone(true);
      setCheckResult({pass, tests});
      return;
    }
    if (mode === 'logic' && truthTable) {
      const result = checkTruthTable(nodes, edges, truthTable);
      const multi = truthTable.inputIds.length > 1;
      const tests = result.cases.map((c) => ({
        label: `Input${multi ? 's' : ''} ${c.combo.map((v) => (v ? 1 : 0)).join(', ')} → ${truthTable.outputId}`,
        pass: c.ok,
        detail: c.ok
          ? null
          : `expected ${c.expected ? 1 : 0}, got ${c.actual === null ? '?' : c.actual ? 1 : 0}`,
      }));
      if (result.pass) setDone(true);
      setCheckResult({pass: result.pass, tests});
    }
  }

  const checkable =
    (mode === 'wiring' && (solution?.requiredEdges || solution?.requiredRows)) ||
    (mode === 'logic' && truthTable);
  const hasSolution = checkable;

  return (
    <div className={styles.wrap}>
      <div className={styles.canvasRow} style={{height}}>
        {paletteItems ? <GatePalette items={paletteItems} dragMime={DRAG_MIME} /> : null}
        <div className={styles.canvas}>
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={16} />
            <Controls showInteractive={false} />
            <div
              ref={trashRef}
              className={`${styles.trash} ${trashActive ? styles.trashActive : ''}`}
              title="Drag a card here to delete it"
            >
              🗑
            </div>
            <Panel position="top-right" className={styles.panel}>
              {done ? <span className={styles.doneBadge}>✓ Solved</span> : null}
              {checkable ? (
                <button type="button" className={styles.primary} onClick={runCheck} disabled={done}>
                  Check
                </button>
              ) : null}
              {hasSolution ? (
                <button type="button" className={styles.secondary} onClick={() => setShowSolution(true)}>
                  Solution
                </button>
              ) : null}
              <button type="button" className={styles.secondary} onClick={reset}>
                Reset
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
      {checkResult ? (
        <div className={checkResult.pass ? styles.feedbackOk : styles.feedback}>
          <div className={styles.resultHeader}>
            {checkResult.pass
              ? '✓ Accepted — all tests passed.'
              : `✗ ${checkResult.tests.filter((t) => !t.pass).length} of ${checkResult.tests.length} tests failed.`}
          </div>
          <ul className={styles.testList}>
            {checkResult.tests.map((t, i) => (
              <li key={i} className={t.pass ? styles.testPass : styles.testFail}>
                <span className={styles.testMark}>{t.pass ? '✓' : '✗'}</span> Test {i + 1}: {t.label}
                {!t.pass && t.detail ? <span className={styles.testDetail}> — {t.detail}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {showSolution ? (
        <SolutionModal
          mode={mode}
          solution={solution}
          truthTable={truthTable}
          onClose={() => setShowSolution(false)}
        />
      ) : null}
    </div>
  );
}

export default function NodeLab(props) {
  return (
    <ReactFlowProvider>
      <NodeLabInner {...props} />
    </ReactFlowProvider>
  );
}
