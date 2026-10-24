/**
 * "Place it" coin questions, built from the site's drag-and-drop problem sets
 * (the PlaceBoard simulators). Each blank in those sets becomes one question:
 * the chip bank becomes the options, and players drag coins onto the option
 * they back. A coin on the right option pays 2; coins elsewhere are lost.
 *
 * The source sets are written in Chinese, so the question text is the same in
 * both languages; only the surrounding interface follows the screen language.
 */

import {PAGES as angleKind} from '@site/src/components/interactive/AngleKindNameSimulator';
import {PAGES as degreeUnits} from '@site/src/components/interactive/DegreeUnitFillSimulator';
import {PAGES as compareSign} from '@site/src/components/interactive/InequalityCompareSignSimulator';
import {PAGES as propertyPlace} from '@site/src/components/interactive/InequalityPropertyPlaceSimulator';
import {PAGES as propertyResult} from '@site/src/components/interactive/InequalityPropertyResultSimulator';

/** A coin on the right option comes back doubled. */
export const PLACE_ODDS = 2;
const BLANK = '＿＿';
/** Keeps the option list readable on a phone and within the 12-slot board. */
const MAX_OPTIONS = 12;

const SOURCES = [
  {id: 'angle-kind', pages: angleKind},
  {id: 'degree-units', pages: degreeUnits},
  {id: 'compare-sign', pages: compareSign},
  {id: 'property-place', pages: propertyPlace},
  {id: 'property-result', pages: propertyResult},
];

const chipKey = (chip) => chip.group || chip.id;

/** One option per distinct answer: repeated "<" chips collapse into one. */
function optionsFor(page) {
  const seen = new Map();
  for (const chip of page.chips) {
    const key = chipKey(chip);
    if (!seen.has(key)) seen.set(key, {key, label: chip.label, detail: chip.detail || ''});
  }
  return [...seen.values()];
}

function labelOf(page, key) {
  const chip = page.chips.find((c) => chipKey(c) === key);
  return chip ? chip.label : '';
}

/** The row as one line with the blank to fill: "a + 9 ＿＿ b + 9". */
function statement(row, page, blankIn) {
  const main = blankIn === 'main' ? BLANK : (row.given && row.given.label) || labelOf(page, row.answer);
  const body = row.sentence
    ? `${row.sentence} ${main}`
    : [row.marker, row.left, main, row.right].filter(Boolean).join(' ');
  if (blankIn === 'paren') return `${body}（${BLANK}）`;
  return row.follow ? `${body} ${row.follow}` : body;
}

function buildQuestions() {
  const questions = [];
  for (const source of SOURCES) {
    source.pages.forEach((page, pageIndex) => {
      const options = optionsFor(page);
      if (options.length < 2 || options.length > MAX_OPTIONS) return;
      for (const row of page.rows) {
        const blanks = [];
        if (!row.given && row.answer) blanks.push({where: 'main', answer: row.answer, hint: row.hint});
        if (row.paren && !row.paren.given && row.paren.answer) {
          blanks.push({where: 'paren', answer: row.paren.answer, hint: row.paren.hint});
        }
        for (const blank of blanks) {
          if (!options.some((o) => o.key === blank.answer)) continue;
          const text = `${page.lead}\n${statement(row, page, blank.where)}`;
          questions.push({
            id: `place-${source.id}-${pageIndex}-${row.id}-${blank.where}`,
            type: 'place',
            text,
            textZh: text,
            options,
            answer: blank.answer,
            hint: blank.hint || '',
            unit: '',
            unitZh: '',
          });
        }
      }
    });
  }
  return questions;
}

export const placePack = {
  id: 'place',
  title: 'Place it (Chinese)',
  titleZh: '放置题',
  questions: buildQuestions(),
};
