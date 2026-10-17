/**
 * Wiki discovery: catalog entries only appear in the wiki tab after interaction
 * (formula sliders, guided choice, citation quiz unlock).
 */

import {WIKI} from '@site/src/data/wiki/catalog';
import {CITATIONS, formatCitation} from '@site/src/data/citations/reliableAi';
import {getEssayStore} from '@site/src/components/EssayLab/storage';
import {listWikiProgress, markWikiStudied} from '@site/src/components/ScratchNotes/wikiStore';

export function citationWikiId(citationId) {
  return `ref-${citationId}`;
}

export function citationToWikiEntry(citation) {
  if (!citation?.id) {
    return null;
  }
  return {
    id: citationWikiId(citation.id),
    kind: 'reference',
    title: citation.title || citation.id,
    description: formatCitation(citation),
    href: citation.url || undefined,
    external: Boolean(citation.url),
    citationId: citation.id,
  };
}

/** Full catalog for the wiki tab: static WIKI + citation references. */
export function getWikiCatalog() {
  const refs = (CITATIONS || []).map(citationToWikiEntry).filter(Boolean);
  return [...WIKI, ...refs];
}

export function getWikiEntryById(id) {
  if (!id) {
    return null;
  }
  return getWikiCatalog().find((row) => row.id === id) || null;
}

export function wikiEntriesForExplorer(presetId) {
  if (!presetId) {
    return [];
  }
  return WIKI.filter((row) => row.explorer === presetId);
}

export function wikiEntriesForGuided(sampleId) {
  if (!sampleId) {
    return [];
  }
  return WIKI.filter((row) => row.sample === sampleId);
}

/**
 * Only entries that have an interaction to discover them are hidden until then:
 * citation references (quiz), guided problems (walkthrough), and formulas with an
 * explorer (slider). Procedures, theorems, and plain formulas stay always visible,
 * since nothing on the site could ever discover them.
 */
export function needsDiscovery(entry) {
  return Boolean(entry && (entry.kind === 'reference' || entry.sample || entry.explorer));
}

export function isWikiDiscovered(progressRow) {
  return Boolean(
    progressRow?.viewedAt ||
      progressRow?.studiedAt ||
      progressRow?.learnedAt ||
      progressRow?.passedAt ||
      progressRow?.discoveredAt,
  );
}

/** Mark one or more wiki ids as discovered (studied). Safe no-op for empty lists. */
export async function discoverWikiIds(ids) {
  const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
  if (!list.length) {
    return;
  }
  const progress = await listWikiProgress().catch(() => ({}));
  const missing = list.filter((id) => !isWikiDiscovered(progress[id]));
  if (!missing.length) {
    return;
  }
  await Promise.all(missing.map((id) => markWikiStudied(id).catch(() => null)));
}

export async function discoverWikiForExplorer(presetId) {
  const entries = wikiEntriesForExplorer(presetId);
  await discoverWikiIds(entries.map((e) => e.id));
}

export async function discoverWikiForGuided(sampleId) {
  const entries = wikiEntriesForGuided(sampleId);
  await discoverWikiIds(entries.map((e) => e.id));
}

export async function discoverWikiForCitation(citationId) {
  if (!citationId) {
    return;
  }
  await discoverWikiIds([citationWikiId(citationId)]);
}

/**
 * Essay Lab unlocks live in a separate store. Mirror any already-unlocked
 * citations into wiki discovery so the wiki tab stays in sync.
 */
export async function syncUnlockedCitationsToWiki() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const progress = await getEssayStore().listProgress();
    const ids = Object.entries(progress || {})
      .filter(([, row]) => row?.unlockedAt)
      .map(([citationId]) => citationWikiId(citationId));
    await discoverWikiIds(ids);
  } catch {
    // Essay store unavailable (SSR / private mode) — ignore.
  }
}
