/** Classic RK4 stage equations and weights — equation picks. */

export default {
  title: 'RK4 stages and weights',
  lead:
    'Four slopes, classic weights. Pick the stage definition or the final update among lookalikes.',
  steps: [
    {
      ask: 'The four RK4 stages (scalar notation) begin with…',
      choices: [
        {
          label:
            '$\\displaystyle k_1=h f(t,y),\\; k_2=h f(t+h/2,\\,y+k_1/2),\\; k_3=h f(t+h/2,\\,y+k_2/2),\\; k_4=h f(t+h,\\,y+k_3)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle k_1=h f(t,y),\\; k_2=h f(t+h/2,\\,y+k_1),\\; k_3=h f(t+h/2,\\,y+k_2),\\; k_4=h f(t+h,\\,y+k_3)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle k_1=h f(t,y),\\; k_2=h f(t+h,\\,y+k_1/2),\\; k_3=h f(t+h,\\,y+k_2/2),\\; k_4=h f(t+2h,\\,y+k_3)$',
          ok: false,
        },
      ],
      caption:
        'Left endpoint, two midpoint samples (half-steps of the previous $k$), then right endpoint.',
    },
    {
      ask: 'The classic weighted update that closes the step is…',
      choices: [
        {
          label:
            '$\\displaystyle y\\leftarrow y+\\tfrac16(k_1+2k_2+2k_3+k_4)$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle y\\leftarrow y+\\tfrac16(k_1+k_2+k_3+k_4)$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle y\\leftarrow y+\\tfrac13(k_1+2k_2+2k_3+k_4)$',
          ok: false,
        },
      ],
      caption:
        'Weights $1/6,\\,1/3,\\,1/3,\\,1/6$. Local error $O(h^{5})$ for smooth $f$ — the workhorse fixed-step rule in the labs.',
    },
  ],
};
