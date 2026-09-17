/** k-means assign/update and perceptron / η(t) — pick the equation. */

export default {
  title: 'ML clustering',
  lead:
    'Unsupervised $k$-means iterates assign → update. Supervised linear / SGD classifiers step weights with a learning rate. Pick the matching equation at each step.',
  steps: [
    {
      ask: 'Lloyd assignment: each point $x$ gets the label of the nearest centroid. Which rule?',
      choices: [
        {
          label:
            '$\\displaystyle \\mathrm{label}(x)=\\arg\\min_{j}\\|x-c_{j}\\|^{2}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle \\mathrm{label}(x)=\\arg\\max_{j}\\|x-c_{j}\\|^{2}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle \\mathrm{label}(x)=\\arg\\min_{j}\\|x+c_{j}\\|$ (sum, not distance)',
          ok: false,
        },
      ],
      caption:
        'Inertia = total within-cluster sum of squares. Next — how centroids move.',
    },
    {
      ask: 'After assignment, the centroid update for cluster $j$ is…',
      choices: [
        {
          label:
            '$\\displaystyle c_{j}\\leftarrow \\mathrm{mean}\\{x:\\mathrm{label}(x)=j\\}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle c_{j}\\leftarrow \\mathrm{median}\\{x:\\mathrm{label}(x)\\neq j\\}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle c_{j}\\leftarrow \\max\\{x\\}$ (global max for every cluster)',
          ok: false,
        },
      ],
      caption:
        'Repeat until centroids barely move. Exact clustering is NP-hard; $k$-means is a practical heuristic.',
    },
    {
      ask: 'A linear / perceptron score on features $x$ is written…',
      choices: [
        {
          label: '$\\displaystyle \\mathcal{L}\\simeq w^{T}x+b$',
          ok: true,
        },
        {
          label: '$\\displaystyle \\mathcal{L}\\simeq w^{T}x-b^{2}$',
          ok: false,
        },
        {
          label: '$\\displaystyle \\mathcal{L}\\simeq \\|x-c_{j}\\|^{2}$ ($k$-means inertia, not a linear score)',
          ok: false,
        },
      ],
      caption:
        'Fire if $\\phi(\\sum w_{j}x_{j})>\\theta$. Scale features before sklearn Perceptron / SGDClassifier.',
    },
    {
      ask: 'One supervised weight step with learning rate $\\eta$ is…',
      choices: [
        {
          label:
            '$\\displaystyle w\\leftarrow w-\\eta\\,\\partial_{w}\\mathcal{L}(w^{T}x_{i}+b,\\,y_{i})$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle w\\leftarrow w+\\eta\\,\\partial_{w}\\mathcal{L}(w^{T}x_{i}+b,\\,y_{i})$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle w\\leftarrow \\eta\\,\\partial_{w}\\mathcal{L}$ (drop the old $w$)',
          ok: false,
        },
      ],
      caption:
        'A decaying schedule $\\eta(t)=1/(\\alpha(t_{0}+t))$ shrinks steps for stabler late training.',
    },
  ],
};
