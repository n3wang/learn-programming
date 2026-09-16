export const WIKI_KINDS = ['procedure', 'theorem', 'formula', 'problem'];

function unwrapDollars(s) {
  return String(s || '')
    .replace(/^\$+|\$+$/g, '')
    .trim();
}

export function inferWikiKind(entry) {
  if (entry?.kind && WIKI_KINDS.includes(entry.kind)) {
    return entry.kind;
  }
  if (entry?.sample) {
    return 'problem';
  }
  if (entry?.explorer || entry?.tex || entry?.formula) {
    return 'formula';
  }
  if (entry?.statement) {
    return 'theorem';
  }
  return 'procedure';
}

/** How practice grades this entry. Kind wins; otherwise fields. */
export function wikiPracticeKind(entry) {
  if (!entry) {
    return 'read';
  }
  const kind = inferWikiKind(entry);
  if (kind === 'formula') {
    return 'formula';
  }
  if (kind === 'problem') {
    return 'guided';
  }
  if (entry.order) {
    return 'order';
  }
  if (entry.sample) {
    return 'guided';
  }
  if (entry.explorer || entry.tex || entry.formula) {
    return 'formula';
  }
  return 'read';
}

export function normalizeWikiEntry(raw) {
  const kind = inferWikiKind(raw);
  const tex = raw.tex || (raw.formula ? unwrapDollars(raw.formula) : undefined);
  return {...raw, kind, ...(tex ? {tex} : {})};
}
