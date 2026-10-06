/** Guided: commodity participants and their price risks. */

export default {
  title: 'Who fears what?',
  lead: 'Match each participant to its main price risk.',
  steps: [
    {
      ask: 'A copper mining company.',
      choices: [
        {label: 'Falling copper prices', ok: true},
        {label: 'Rising copper prices', ok: false},
        {label: 'Only freight rates', ok: false},
      ],
      caption: 'Producers lose revenue when prices fall.',
    },
    {
      ask: 'An airline buying jet fuel every month.',
      choices: [
        {label: 'Rising fuel prices', ok: true},
        {label: 'Falling fuel prices', ok: false},
        {label: 'No price risk', ok: false},
      ],
      caption: 'Consumers pay more when prices rise.',
    },
    {
      ask: 'An oil refinery.',
      choices: [
        {label: 'Its margin: product prices minus crude cost', ok: true},
        {label: 'Only crude prices', ok: false},
        {label: 'Only gasoline prices', ok: false},
      ],
      caption: 'Processors hedge spreads, not single prices.',
    },
  ],
};
