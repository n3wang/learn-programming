/**
 * Lexical answer matching for card practice: normalised edit-distance similarity
 * and a character diff for display. No semantics — "close spelling" only.
 */

export const PASS_SIMILARITY = 0.9;

export function normalizeAnswer(text) {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[®™“”"'’‘`]/g, '')
    .replace(/[\s　]+/g, ' ')
    .replace(/\s*([，。；：、（）()／/,.;:-])\s*/g, '$1')
    .trim();
}

/**
 * Acceptable spellings of a term: the full term, the part before any bracket,
 * the bracketed abbreviation, and each side of a “/” or “／” split.
 */
export function answerVariants(term) {
  const raw = String(term || '').trim();
  const out = new Set([raw]);
  const noParen = raw.replace(/\s*[(（][^)）]*[)）]\s*/g, ' ').trim();
  if (noParen) {
    out.add(noParen);
  }
  const inParen = raw.match(/[(（]([^)）]+)[)）]/);
  if (inParen) {
    out.add(inParen[1]);
  }
  // “DAT / DPU” and “运输终端交货／卸货地交货” are two names; “With / without recourse” is one.
  [raw, noParen].forEach((s) => {
    const parts = s.split(/\s+\/\s+|\s*／\s*/).map((p) => p.trim());
    if (parts.length > 1 && parts.every((p) => p && !/^[a-z0-9]/.test(p))) {
      parts.forEach((part) => out.add(part));
    }
  });
  return [...out].filter(Boolean);
}

function levenshtein(a, b) {
  const x = [...a];
  const y = [...b];
  let prev = Array.from({length: y.length + 1}, (_, j) => j);
  for (let i = 1; i <= x.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= y.length; j += 1) {
      const cost = x[i - 1] === y[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[y.length];
}

/** 1 = identical after normalising, 0 = nothing in common. */
export function similarity(attempt, target) {
  const a = normalizeAnswer(attempt);
  const b = normalizeAnswer(target);
  if (!a || !b) {
    return 0;
  }
  const longest = Math.max([...a].length, [...b].length);
  return 1 - levenshtein(a, b) / longest;
}

/** Best match of `attempt` against every acceptable spelling of `term`. */
export function bestMatch(attempt, term, threshold = PASS_SIMILARITY) {
  let best = {target: String(term || ''), score: 0};
  answerVariants(term).forEach((target) => {
    const score = similarity(attempt, target);
    if (score > best.score) {
      best = {target, score};
    }
  });
  return {...best, pass: best.score >= threshold};
}

/**
 * Character diff (LCS) from `attempt` to `target`, on the original characters.
 * Returns [{type: 'same' | 'extra' | 'missing', text}] — extra = typed but not
 * in the answer, missing = in the answer but not typed.
 */
export function charDiff(attempt, target) {
  const a = [...String(attempt || '').trim()];
  const b = [...String(target || '')];
  const eq = (p, q) => p.toLowerCase() === q.toLowerCase();
  const dp = Array.from({length: a.length + 1}, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      dp[i][j] = eq(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const parts = [];
  const push = (type, ch) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) {
      last.text += ch;
    } else {
      parts.push({type, text: ch});
    }
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (eq(a[i], b[j])) {
      push('same', b[j]);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push('extra', a[i]);
      i += 1;
    } else {
      push('missing', b[j]);
      j += 1;
    }
  }
  while (i < a.length) {
    push('extra', a[i]);
    i += 1;
  }
  while (j < b.length) {
    push('missing', b[j]);
    j += 1;
  }
  return parts;
}
