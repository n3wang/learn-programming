/** Guided: ICC arbitration procedure, costs, and urgent relief. */

export default {
  title: 'Inside an ICC case',
  lead: 'Follow a claim from filing to award.',
  steps: [
    {
      ask: 'The respondent receives the Request. How long does it usually have to answer?',
      choices: [
        {label: 'About 30 days, with defence and any counterclaims', ok: true},
        {label: 'One year', ok: false},
        {label: 'No answer is ever required', ok: false},
      ],
      caption: 'The claimant then has about 30 days to reply to counterclaims.',
    },
    {
      ask: 'What is the main purpose of the Terms of Reference?',
      choices: [
        {label: 'Summarise the case and define the issues to decide', ok: true},
        {label: 'Decide the merits early', ok: false},
        {label: 'Replace the arbitration clause', ok: false},
      ],
      caption: 'Narrowing the issues speeds hearings and often prompts settlement.',
    },
    {
      ask: 'The respondent refuses to pay its half of the advance on costs. The claimant can…',
      choices: [
        {label: 'Pay that half too, or post a bank guarantee, so the case proceeds', ok: true},
        {label: 'Nothing — the case is dismissed', ok: false},
        {label: 'Ask the Court to waive all costs', ok: false},
      ],
      caption: 'Non-payment shifts the cash burden; the award can reallocate costs later.',
    },
  ],
};
