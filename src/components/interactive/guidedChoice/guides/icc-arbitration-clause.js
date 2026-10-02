/** Guided: drafting an ICC arbitration clause. */

export default {
  title: 'Draft the ICC clause',
  lead: 'A small exporter wants ICC arbitration in its standard contract.',
  steps: [
    {
      ask: 'What is the best starting point for the clause wording?',
      choices: [
        {label: 'ICC’s current standard clause, copied exactly', ok: true},
        {label: 'A clause rewritten from memory', ok: false},
        {label: '“Disputes go to ICC somewhere in Europe”', ok: false},
      ],
      caption: 'Home-made wording breeds jurisdiction fights.',
    },
    {
      ask: 'Disputes will likely be under USD 500,000. To keep costs down, specify…',
      choices: [
        {label: 'A sole arbitrator', ok: true},
        {label: 'Three arbitrators', ok: false},
        {label: 'Five arbitrators from different continents', ok: false},
      ],
      caption: 'One arbitrator means one set of fees and simpler scheduling.',
    },
    {
      ask: 'Seller and buyer each want their own law. A common compromise is…',
      choices: [
        {label: 'The law of a neutral country, stated in the clause', ok: true},
        {label: 'Leave the law blank to avoid conflict now', ok: false},
        {label: 'Both laws at once', ok: false},
      ],
      caption: 'Deciding now saves an expensive argument later.',
    },
  ],
};
