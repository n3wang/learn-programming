/**
 * Central wiki dictionary. Progress lives in IndexedDB, not here.
 *
 * Add an object to the matching kind file (procedures / theorems / formulas /
 * problems). The wiki tab, search, and practice pick it up — no modal wiring.
 */

import {PROCEDURES} from './procedures';
import {THEOREMS} from './theorems';
import {FORMULAS} from './formulas';
import {PROBLEMS} from './problems';
import {normalizeWikiEntry} from './normalize';

export {WIKI_KINDS, inferWikiKind, wikiPracticeKind, normalizeWikiEntry} from './normalize';

export const WIKI = [...PROCEDURES, ...THEOREMS, ...FORMULAS, ...PROBLEMS]
  .filter((row) => row && row.id && row.title)
  .map(normalizeWikiEntry);

export function getWikiEntry(id) {
  return WIKI.find((row) => row.id === id) || null;
}
