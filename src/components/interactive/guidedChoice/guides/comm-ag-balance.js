/** Guided: reading an agricultural balance sheet. */

export default {
  title: 'Read the balance sheet',
  lead: 'Corn: beginning stocks 300, production 1,100, use 1,150 (million t).',
  steps: [
    {
      ask: 'What is total supply?',
      choices: [
        {label: '300 + 1,100 = 1,400 (world imports net out)', ok: true},
        {label: '1,100 — production only', ok: false},
        {label: '1,150 — use', ok: false},
      ],
      caption: 'Supply = carry-in + production + imports.',
    },
    {
      ask: 'What are ending stocks (carry-over)?',
      choices: [
        {label: '1,400 − 1,150 = 250', ok: true},
        {label: '1,400', ok: false},
        {label: '−50', ok: false},
      ],
      caption: 'Supply minus use; a deficit year draws stocks down from 300 to 250.',
    },
    {
      ask: 'Stocks-to-use?',
      choices: [
        {label: '250 / 1,150 ≈ 21.7% — at the tight end of normal', ok: true},
        {label: '1,150 / 250 = 460%', ok: false},
        {label: '250 / 1,400 = 17.9%', ok: false},
      ],
      caption: 'Divide by use, not supply.',
    },
    {
      ask: 'A drought cuts next year’s crop 10% with use unchanged. Price direction?',
      choices: [
        {label: 'Up sharply — stocks-to-use would collapse below 20%', ok: true},
        {label: 'Down', ok: false},
        {label: 'Unchanged', ok: false},
      ],
      caption: 'Low stocks magnify supply shocks.',
    },
  ],
};
