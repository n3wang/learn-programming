/** Guided: reading power price drivers. */

export default {
  title: 'What moves power prices?',
  lead: 'Decide the price effect of each event.',
  steps: [
    {
      ask: 'A cold, still winter evening: high demand, little wind.',
      choices: [
        {label: 'Prices spike — expensive peaking plants set the price', ok: true},
        {label: 'Prices fall', ok: false},
        {label: 'No effect — power is storable', ok: false},
      ],
      caption: 'Non-storability means demand must be met in real time.',
    },
    {
      ask: 'Gas prices jump while gas plants are usually marginal.',
      choices: [
        {label: 'Power prices rise roughly by gas cost × heat rate', ok: true},
        {label: 'Power prices fall', ok: false},
        {label: 'Only coal plants are affected', ok: false},
      ],
      caption: 'The marginal fuel passes through to power.',
    },
    {
      ask: 'Carbon prices rise sharply.',
      choices: [
        {label: 'Coal is hit harder than gas — clean dark spreads shrink more than clean spark spreads', ok: true},
        {label: 'Gas is hit harder than coal', ok: false},
        {label: 'Renewables get more expensive', ok: false},
      ],
      caption: 'Coal emits roughly twice the CO₂ per MWh of gas.',
    },
    {
      ask: 'A sunny, windy Sunday with low demand.',
      choices: [
        {label: 'Prices can fall very low, even negative', ok: true},
        {label: 'Prices hit their annual peak', ok: false},
        {label: 'The market closes', ok: false},
      ],
      caption: 'Zero-marginal-cost supply floods the stack.',
    },
  ],
};
