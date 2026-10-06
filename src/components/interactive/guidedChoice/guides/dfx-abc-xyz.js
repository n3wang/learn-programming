/** Guided: set up ABC XYZ for forecast review. */

export default {
  title: 'Set up the matrix',
  lead: 'Build ABC XYZ that points planners to the right items.',
  steps: [
    {
      ask: 'ABC (importance) axis based on…',
      choices: [
        {label: 'Next months’ forecast × unit value', ok: true},
        {label: 'Last quarter’s unit sales', ok: false},
        {label: 'Number of order lines', ok: false},
      ],
      caption: 'Forward-looking and value-weighted.',
    },
    {
      ask: 'XYZ (forecastability) axis based on…',
      choices: [
        {label: 'Historical MAE% + |Bias%|', ok: true},
        {label: 'Demand COV', ok: false},
        {label: 'Unit price', ok: false},
      ],
      caption: 'Where the engine struggled on its own.',
    },
    {
      ask: 'An item is in class CX. What do you do?',
      choices: [
        {label: 'Leave it to the engine', ok: true},
        {label: 'Review it first', ok: false},
        {label: 'Inflate its forecast', ok: false},
      ],
      caption: 'Low value, well forecast.',
    },
  ],
};
