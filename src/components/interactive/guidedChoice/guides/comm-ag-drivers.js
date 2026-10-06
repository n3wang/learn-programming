/** Guided: agricultural price drivers. */

export default {
  title: 'What moves farm prices?',
  lead: 'Pick the likely price effect.',
  steps: [
    {
      ask: 'Oil prices jump; US ethanol blending is profitable.',
      choices: [
        {label: 'Corn up; soybeans also up as acreage shifts to corn', ok: true},
        {label: 'Corn down', ok: false},
        {label: 'Only oil moves', ok: false},
      ],
      caption: 'Food, feed, and fuel compete for the same land.',
    },
    {
      ask: 'La Niña brings drought to Argentina and the southern US.',
      choices: [
        {label: 'Soybean and corn prices rise on crop risk', ok: true},
        {label: 'Prices fall', ok: false},
        {label: 'Only palm oil is affected', ok: false},
      ],
      caption: 'ENSO forecasts move markets months ahead.',
    },
    {
      ask: 'A major exporter bans wheat exports to protect domestic supply.',
      choices: [
        {label: 'World prices rise; importers seek other origins', ok: true},
        {label: 'World prices fall', ok: false},
        {label: 'No effect', ok: false},
      ],
      caption: 'As with Russia in 2010.',
    },
    {
      ask: 'The US dollar strengthens sharply.',
      choices: [
        {label: 'Dollar prices tend to soften as foreign buyers face higher local costs', ok: true},
        {label: 'Dollar prices rise', ok: false},
        {label: 'No effect', ok: false},
      ],
      caption: 'Most ags are priced in USD.',
    },
  ],
};
