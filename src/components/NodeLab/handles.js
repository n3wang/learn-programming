import {GATE_INPUT_IDS} from './gates';

/**
 * Enumerate the handle ids a given node currently exposes, based on its
 * variant (and, for tables, however many rows it has right now — which can
 * grow at runtime via editableRows). Used to drop saved edges that point at
 * a handle which no longer exists, e.g. after a lesson's schema changes.
 */
export function validHandleIds(node) {
  const variant = node.data?.variant;

  if (variant === 'table') {
    const count = node.data?.rows?.length || 0;
    const ids = [];
    for (let i = 0; i < count; i++) ids.push(`row-${i}-left`, `row-${i}-right`);
    return ids;
  }
  if (variant === 'input') return ['out'];
  if (variant === 'output') return ['a'];
  if (variant === 'gate') {
    const inputs =
      node.data?.inputs?.length
        ? node.data.inputs
        : (typeof node.data?.gate === 'string' && GATE_INPUT_IDS[node.data.gate]) || ['a', 'b'];
    return [...inputs, 'out'];
  }
  return ['top', 'right', 'bottom', 'left'];
}

/**
 * Drop edges whose endpoints (node or specific handle) no longer exist on
 * the current nodes — stale localStorage from a since-edited diagram
 * shouldn't render as silently-missing, console-warning connections.
 */
export function sanitizeEdges(edges, nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges.filter((e) => {
    const source = byId.get(e.source);
    const target = byId.get(e.target);
    if (!source || !target) return false;
    if (e.sourceHandle && !validHandleIds(source).includes(e.sourceHandle)) return false;
    if (e.targetHandle && !validHandleIds(target).includes(e.targetHandle)) return false;
    return true;
  });
}
