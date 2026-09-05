/**
 * Boolean gate library + combinational propagation for NodeLab "logic" mode.
 * Kept as plain functions so lesson authors can also pass their own
 * `data.gate` function directly instead of a name from GATES.
 */
export const GATES = {
  BUFFER: (a) => Boolean(a),
  NOT: (a) => !a,
  AND: (a, b) => Boolean(a) && Boolean(b),
  OR: (a, b) => Boolean(a) || Boolean(b),
  NAND: (a, b) => !(Boolean(a) && Boolean(b)),
  NOR: (a, b) => !(Boolean(a) || Boolean(b)),
  XOR: (a, b) => Boolean(a) !== Boolean(b),
  XNOR: (a, b) => Boolean(a) === Boolean(b),
};

export const GATE_INPUT_IDS = {
  BUFFER: ['a'],
  NOT: ['a'],
  AND: ['a', 'b'],
  OR: ['a', 'b'],
  NAND: ['a', 'b'],
  NOR: ['a', 'b'],
  XOR: ['a', 'b'],
  XNOR: ['a', 'b'],
};

function resolveGateFn(node) {
  if (typeof node.data?.gate === 'function') return node.data.gate;
  if (typeof node.data?.gate === 'string') return GATES[node.data.gate];
  return null;
}

function resolveInputIds(node) {
  if (Array.isArray(node.data?.inputs)) return node.data.inputs;
  if (typeof node.data?.gate === 'string' && GATE_INPUT_IDS[node.data.gate]) {
    return GATE_INPUT_IDS[node.data.gate];
  }
  return ['a', 'b'];
}

/**
 * Evaluate a combinational graph of input/gate/output nodes given the
 * current edges. Returns a Map<nodeId, boolean|null> (null = unresolved,
 * e.g. missing wire or a cycle). Iterative fixed-point, capped so a wiring
 * mistake (a cycle) can't hang the browser — unresolved nodes just stay null.
 */
export function evaluateGraph(nodes, edges) {
  const values = new Map();
  const byId = new Map(nodes.map((n) => [n.id, n]));

  for (const node of nodes) {
    if (node.data?.variant === 'input') {
      values.set(node.id, Boolean(node.data.value));
    }
  }

  const incoming = new Map();
  for (const edge of edges) {
    const targetId = edge.target;
    const handle = edge.targetHandle || 'a';
    if (!incoming.has(targetId)) incoming.set(targetId, new Map());
    incoming.get(targetId).set(handle, edge);
  }

  const maxPasses = nodes.length + 3;
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;
    for (const node of nodes) {
      if (values.has(node.id)) continue;
      const variant = node.data?.variant;
      if (variant === 'output' || variant === 'gate') {
        const gateFn = variant === 'gate' ? resolveGateFn(node) : (a) => a;
        const inputIds = variant === 'gate' ? resolveInputIds(node) : ['a'];
        const wires = incoming.get(node.id);
        if (!wires) continue;
        const args = [];
        let ready = true;
        for (const inputId of inputIds) {
          const edge = wires.get(inputId);
          if (!edge) {
            ready = false;
            break;
          }
          const sourceVal = values.get(edge.source);
          if (sourceVal === undefined) {
            ready = false;
            break;
          }
          args.push(sourceVal);
        }
        if (!ready || !gateFn) continue;
        values.set(node.id, Boolean(gateFn(...args)));
        changed = true;
      }
    }
    if (!changed) break;
  }

  return values;
}

/**
 * Exhaustively test a logic circuit against an expected boolean function.
 * `inputIds` are the node ids acting as toggleable inputs (tested in that
 * order against `expected`'s arguments); `outputId` is the node whose
 * computed value must match. Returns {pass, cases} where each case records
 * the input combo, expected value, and actual value.
 */
export function checkTruthTable(nodes, edges, {inputIds, outputId, expected}) {
  const n = inputIds.length;
  const cases = [];
  let pass = true;

  for (let mask = 0; mask < 2 ** n; mask++) {
    const combo = inputIds.map((_, i) => Boolean((mask >> i) & 1));
    const testNodes = nodes.map((node) => {
      const idx = inputIds.indexOf(node.id);
      if (idx === -1) return node;
      return {...node, data: {...node.data, value: combo[idx]}};
    });
    const values = evaluateGraph(testNodes, edges);
    const actual = values.get(outputId);
    const expectedVal = Boolean(expected(...combo));
    const ok = actual === expectedVal;
    if (!ok) pass = false;
    cases.push({combo, expected: expectedVal, actual: actual ?? null, ok});
  }

  return {pass, cases};
}
