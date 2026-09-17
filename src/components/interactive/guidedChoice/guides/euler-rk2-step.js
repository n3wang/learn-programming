/** Euler / RK2 / RK4: pick the correct update equations. */

export default {
  title: 'ODE step formulas',
  lead: 'At each step pick the correct update among lookalike steppers.',
  steps: [
    {
      ask: 'One Euler step with RHS $\\mathbf f$ is…',
      choices: [
        {
          label: '$\\mathbf y_{n+1}=\\mathbf y_n + h\\,\\mathbf f(t_n,\\mathbf y_n)$',
          ok: true,
        },
        {
          label: '$\\mathbf y_{n+1}=\\mathbf y_n + h\\,\\mathbf f(t_n+h,\\mathbf y_n)$',
          ok: false,
        },
        {
          label: '$\\mathbf y_{n+1}=\\mathbf y_n - h\\,\\mathbf f(t_n,\\mathbf y_n)$',
          ok: false,
        },
      ],
      caption: 'Local truncation $O(h^{2})$: follow the left-endpoint tangent.',
    },
    {
      ask: 'Midpoint RK2 uses…',
      choices: [
        {
          label:
            '$k_1=h f(t,y),\\; k_2=h f(t+h/2,\\,y+k_1/2),\\; y\\leftarrow y+k_2$',
          ok: true,
        },
        {
          label:
            '$k_1=h f(t,y),\\; y\\leftarrow y+k_1$ (Euler again)',
          ok: false,
        },
        {
          label:
            '$k_2=h f(t+h,\\,y+k_1),\\; y\\leftarrow y+\\tfrac12(k_1+k_2)$ only',
          ok: false,
        },
      ],
      caption: 'Half-step slope at the midpoint; full step uses that slope.',
    },
    {
      ask: 'Classic RK4 ends with the weighted update…',
      choices: [
        {
          label: '$y\\leftarrow y+\\tfrac16(k_1+2k_2+2k_3+k_4)$',
          ok: true,
        },
        {
          label: '$y\\leftarrow y+\\tfrac14(k_1+k_2+k_3+k_4)$',
          ok: false,
        },
        {
          label: '$y\\leftarrow y+k_4$ only',
          ok: false,
        },
      ],
      caption:
        'Slopes: $k_1$ at left, $k_2,k_3$ at midpoint, $k_4$ at right. Weights $1/6,1/3,1/3,1/6$.',
    },
  ],
};
