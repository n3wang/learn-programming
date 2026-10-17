/**
 * Essay scoring rules. Pure functions, no storage or DOM, so a server can run the
 * same rules in a future competitive mode. Bump RULES_VERSION whenever the rules
 * change; essays store the version they were scored with.
 *
 * Citation syntax in essays: [@citation-id] or [@id-one; @id-two].
 */

export const RULES_VERSION = 1;

export const RULES = {
  minWords: 120,
  minSentenceWords: 6, // keywords in shorter "sentences" (lists, fragments) don't count
  keywordPoints: 10, // once per target keyword
  keywordCitedBonus: 5, // keyword sentence also cites a source that teaches it
  citationPoints: 15, // per distinct unlocked citation
  maxScoredCitations: 5,
  firstTryBonus: 3, // per cited citation whose quiz was passed on the first try
  synthesisPoints: 10, // sentence citing two or more distinct sources
  maxSynthesisSentences: 3,
  coverageThreshold: 0.75,
  coverageMultiplier: 1.2,
};

const CITE_RE = /\[@([a-z0-9-]+(?:\s*;\s*@[a-z0-9-]+)*)\]/gi;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termRegex(term) {
  // Whole-term match that also works for terms containing spaces or hyphens.
  return new RegExp(`(^|[^A-Za-z0-9])${escapeRegExp(term)}(?=$|[^A-Za-z0-9])`, 'i');
}

export function extractCitationIds(text) {
  const ids = [];
  for (const m of String(text).matchAll(CITE_RE)) {
    for (const part of m[1].split(';')) {
      ids.push(part.trim().replace(/^@/, '').toLowerCase());
    }
  }
  return ids;
}

function stripCitations(text) {
  return String(text).replace(CITE_RE, ' ');
}

function countWords(text) {
  const words = stripCitations(text).match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g);
  return words ? words.length : 0;
}

export function splitSentences(text) {
  return String(text)
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9"“(\[])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({text: s, words: countWords(s), cites: [...new Set(extractCitationIds(s))]}));
}

/**
 * @param {string} body essay text
 * @param {{keywords: Array}} deck target deck
 * @param {(id: string) => object|null} lookupCitation
 * @param {{[citationId]: {unlockedAt, firstTryCorrect}}} progress
 */
export function scoreEssay(body, deck, lookupCitation, progress = {}) {
  const sentences = splitSentences(body);
  const wordCount = countWords(body);
  const eligible = wordCount >= RULES.minWords;

  // Citations
  const citedIds = [...new Set(extractCitationIds(body))];
  const valid = citedIds.filter((id) => lookupCitation(id));
  const unknown = citedIds.filter((id) => !lookupCitation(id));
  const unlocked = valid.filter((id) => progress[id]?.unlockedAt);
  const locked = valid.filter((id) => !progress[id]?.unlockedAt);
  const scoredCitations = unlocked.slice(0, RULES.maxScoredCitations);

  // Keywords
  const keywordHits = {};
  for (const kw of deck?.keywords || []) {
    const patterns = [kw.term, ...(kw.aliases || [])].map(termRegex);
    const matching = sentences.filter((s) => patterns.some((re) => re.test(stripCitations(s.text))));
    const counted = matching.filter((s) => s.words >= RULES.minSentenceWords);
    const cited = counted.some((s) => s.cites.some((id) => (kw.citations || []).includes(id) && progress[id]?.unlockedAt));
    keywordHits[kw.id] = {
      used: counted.length > 0,
      fragmentOnly: matching.length > 0 && counted.length === 0,
      citedBonus: counted.length > 0 && cited,
    };
  }
  const usedKeywords = Object.values(keywordHits).filter((h) => h.used).length;
  const bonusKeywords = Object.values(keywordHits).filter((h) => h.citedBonus).length;
  const totalKeywords = (deck?.keywords || []).length;
  const coverage = totalKeywords ? usedKeywords / totalKeywords : 0;

  // Synthesis: sentences that cite two or more distinct, unlocked sources
  const synthesisSentences = sentences.filter((s) => s.cites.filter((id) => unlocked.includes(id)).length >= 2);
  const synthesisCount = Math.min(synthesisSentences.length, RULES.maxSynthesisSentences);

  const firstTry = scoredCitations.filter((id) => progress[id]?.firstTryCorrect).length;

  const items = [
    {key: 'keywords', label: `Keywords used (${usedKeywords}/${totalKeywords})`, points: usedKeywords * RULES.keywordPoints},
    {key: 'keywordCited', label: `Keywords backed by their source (${bonusKeywords})`, points: bonusKeywords * RULES.keywordCitedBonus},
    {key: 'citations', label: `Unlocked citations (${scoredCitations.length}${unlocked.length > scoredCitations.length ? `, capped at ${RULES.maxScoredCitations}` : ''})`, points: scoredCitations.length * RULES.citationPoints},
    {key: 'firstTry', label: `First-try quiz bonus (${firstTry})`, points: firstTry * RULES.firstTryBonus},
    {key: 'synthesis', label: `Synthesis sentences citing 2+ sources (${synthesisCount})`, points: synthesisCount * RULES.synthesisPoints},
  ];
  const subtotal = items.reduce((sum, i) => sum + i.points, 0);
  const multiplier = coverage >= RULES.coverageThreshold ? RULES.coverageMultiplier : 1;
  const total = eligible ? Math.round(subtotal * multiplier) : 0;

  return {
    rulesVersion: RULES_VERSION,
    eligible,
    wordCount,
    subtotal,
    multiplier,
    coverage,
    total,
    items,
    keywordHits,
    citations: {valid, unlocked, locked, unknown},
  };
}
