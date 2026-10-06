/** Guided: pricing a commodity repo. */

export default {
  title: 'Price a crude oil repo',
  lead: '50,000 bbl, 2-week forward 50.00, rate 2.75% (act/360), 10% haircut.',
  steps: [
    {
      ask: 'No spot price is quoted. How does the lender value the barrels today?',
      choices: [
        {label: 'Discount the 2-week forward: 50 ÷ (1 + 0.0275 × 14/360) ≈ 49.95', ok: true},
        {label: 'Use 50.00 as is', ok: false},
        {label: 'Use last month’s price', ok: false},
      ],
      caption: 'The forward is often more liquid than spot.',
    },
    {
      ask: 'Apply the 10% prepayment (method: divide by 1.10).',
      choices: [
        {label: '49.95 ÷ 1.10 ≈ 45.41 per barrel → 2,270,500 lent', ok: true},
        {label: '49.95 × 1.10 = 54.95', ok: false},
        {label: '50 − 10 = 40', ok: false},
      ],
      caption: 'The haircut protects the lender if prices fall.',
    },
    {
      ask: 'What does the refinery pay at the reset?',
      choices: [
        {label: '50,000 × 50.00 − 227,000 prepayment = 2,273,000', ok: true},
        {label: '2,500,000', ok: false},
        {label: '2,270,500', ok: false},
      ],
      caption: 'Forward value less the prepayment.',
    },
    {
      ask: 'The refinery defaults mid-term. What does the lender do?',
      choices: [
        {label: 'Keep the barrels it owns and sell them to recover the loan', ok: true},
        {label: 'Sue for the oil', ok: false},
        {label: 'Return the oil', ok: false},
      ],
      caption: 'Title already sits with the lender — the repurchase leg just doesn’t happen.',
    },
  ],
};
