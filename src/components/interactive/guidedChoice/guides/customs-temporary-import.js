/** Guided: duty relief and temporary imports. */

export default {
  title: 'Avoid or defer duty',
  lead: 'Pick the relief tool for each situation.',
  steps: [
    {
      ask: 'An exhibitor takes demo machines to fairs in three countries, then brings them home.',
      choices: [
        {label: 'ATA Carnet', ok: true},
        {label: 'Bonded warehouse', ok: false},
        {label: 'Pay full duty in each country', ok: false},
      ],
      caption: 'One document, up to one year, chambers guarantee the duties.',
    },
    {
      ask: 'An importer sells stock slowly over a year and re-exports part of it.',
      choices: [
        {label: 'Bonded warehouse — pay duty only on release; none on re-exports', ok: true},
        {label: 'ATA Carnet', ok: false},
        {label: 'Pay all duty on arrival', ok: false},
      ],
      caption: 'Deferral saves interest; re-exports escape duty.',
    },
    {
      ask: 'At the fair, a buyer wants to purchase the demo unit. On the carnet, the unit…',
      choices: [
        {label: 'Must be formally imported with duty paid before handing it over', ok: true},
        {label: 'Can simply be sold — it is already admitted', ok: false},
        {label: 'Is automatically exported', ok: false},
      ],
      caption: 'Carnets do not cover goods that are sold.',
    },
  ],
};
