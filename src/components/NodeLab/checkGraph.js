function handleMatches(actual, expected) {
  if (expected == null) return true;
  if (Array.isArray(expected)) return expected.includes(actual);
  return actual === expected;
}

function edgeMatchesRequirement(edge, req) {
  if (edge.source !== req.source || edge.target !== req.target) return false;
  if (!handleMatches(edge.sourceHandle, req.sourceHandle)) return false;
  if (!handleMatches(edge.targetHandle, req.targetHandle)) return false;
  return true;
}

/**
 * Compare the current edges against a required set of connections.
 * {source, target} alone is handle-agnostic (any connection between the two
 * cards counts); adding sourceHandle/targetHandle (a row id like
 * "row-1-left", or an array of acceptable ids) checks the specific
 * field-to-field wire, e.g. posts.user_id -> users.user_id.
 */
export function checkConnections(edges, requiredEdges) {
  const results = requiredEdges.map((req) => ({
    ...req,
    ok: edges.some((e) => edgeMatchesRequirement(e, req)),
  }));
  const missing = results.filter((r) => !r.ok);
  const extra = edges
    .filter((e) => !requiredEdges.some((req) => edgeMatchesRequirement(e, req)))
    .map((e) => ({source: e.source, target: e.target}));

  return {
    pass: missing.length === 0,
    results,
    missing,
    extra,
  };
}

function normalize(text) {
  return String(text).trim().toLowerCase();
}

/**
 * Check that specific nodes have had specific rows/fields added (or already
 * present), for exercises that ask a learner to spot & add a missing column
 * — e.g. {nodeId: 'comments', text: 'user_id', badge: 'FK'}. `badge` is
 * optional; when omitted, only the field name is checked.
 */
export function checkRows(nodes, requiredRows) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const results = requiredRows.map((req) => {
    const rows = byId.get(req.nodeId)?.data?.rows || [];
    const ok = rows.some(
      (r) => normalize(r.text) === normalize(req.text) && (!req.badge || r.badge === req.badge),
    );
    return {...req, ok};
  });
  const missing = results.filter((r) => !r.ok);
  return {pass: missing.length === 0, results, missing};
}
