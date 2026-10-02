/**
 * Card decks (schema `l0l-cards/1`). See ./README.md for the format.
 *
 * Decks are plain JSON in ./decks so the same files can be published for
 * Mastery CLI. Add a deck: drop the JSON in ./decks and list it in DECK_FILES.
 * Progress is not stored here.
 */

import exportImport from './decks/export-import.json';
import inventoryOptimization from './decks/inventory-optimization.json';
import computerEngineering from './decks/computer-engineering.json';
import gameEngine from './decks/game-engine.json';
import scalableSystems from './decks/scalable-systems.json';

export const CARD_SCHEMA = 'l0l-cards/1';

const DECK_FILES = [exportImport, inventoryOptimization, computerEngineering, gameEngine, scalableSystems];

const REQUIRED = ['id', 'term', 'definition', 'category'];

function validCard(card, deckId) {
  const missing = REQUIRED.filter((key) => !card || !card[key]);
  if (missing.length && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[cards] ${deckId}: card ${card?.id || '?'} missing ${missing.join(', ')}`);
  }
  return missing.length === 0;
}

export const DECKS = DECK_FILES.filter((file) => file?.schema === CARD_SCHEMA).map((file) => ({
  ...file.deck,
  cards: file.cards.filter((card) => validCard(card, file.deck.id)).map((card) => ({...card, deck: file.deck.id})),
}));

export const CARDS = DECKS.flatMap((deck) => deck.cards);

export function getCard(id) {
  return CARDS.find((card) => card.id === id) || null;
}

/** Cards whose category equals `prefix` or sits under it; empty prefix = all. */
export function getCards(prefix = '') {
  if (!prefix) {
    return CARDS;
  }
  return CARDS.filter((card) => card.category === prefix || card.category.startsWith(`${prefix}/`));
}

/** Category labels from every deck, keyed by full category path. */
export const CATEGORIES = Object.assign({}, ...DECKS.map((deck) => deck.categories || {}));

/** Card text in `locale`, falling back to the base (English) fields. */
export function localizeCard(card, locale) {
  const t = card?.translations?.[locale];
  if (!t) {
    return card;
  }
  return {...card, term: t.term || card.term, definition: t.definition || card.definition};
}
