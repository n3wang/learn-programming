/** First-order dynamic form for second-order mechanics ODEs — equation picks. */

export default {
  title: 'ODE dynamic form',
  lead:
    'Newton’s law is second order in $x(t)$. Rewrite it as a first-order system — pick each equation.',
  steps: [
    {
      ask: 'Introduce state components for position and velocity. Which definitions?',
      choices: [
        {
          label: '$\\displaystyle y^{(0)}=x,\\qquad y^{(1)}=v=\\dot x$',
          ok: true,
        },
        {
          label: '$\\displaystyle y^{(0)}=\\ddot x,\\qquad y^{(1)}=x$',
          ok: false,
        },
        {
          label: '$\\displaystyle y^{(0)}=F,\\qquad y^{(1)}=m$',
          ok: false,
        },
      ],
      caption:
        'Steppers march a first-order vector ODE $\\dot{\\mathbf y}=\\mathbf f(t,\\mathbf y)$.',
    },
    {
      ask: 'The dynamic-form equations for those components are…',
      choices: [
        {
          label:
            '$\\displaystyle\\dfrac{dy^{(0)}}{dt}=y^{(1)},\\qquad\\dfrac{dy^{(1)}}{dt}=\\dfrac{F(x,v,t)}{m}$',
          ok: true,
        },
        {
          label:
            '$\\displaystyle\\dfrac{dy^{(0)}}{dt}=F/m,\\qquad\\dfrac{dy^{(1)}}{dt}=y^{(0)}$',
          ok: false,
        },
        {
          label:
            '$\\displaystyle\\dfrac{dy^{(0)}}{dt}=0,\\qquad\\dfrac{dy^{(1)}}{dt}=0$',
          ok: false,
        },
      ],
      caption:
        'In vector notation $\\mathbf f=(v,\\,F/m)^{\\mathsf T}$.',
    },
    {
      ask: 'For $m=1$, $F=-x$, at $(x,v)=(0.5,0.2)$ the RHS $(f_0,f_1)$ is…',
      choices: [
        {
          label: '$(0.2,\\,-0.5)$',
          ok: true,
        },
        {
          label: '$(0.5,\\,0.2)$',
          ok: false,
        },
        {
          label: '$(-0.5,\\,0.2)$',
          ok: false,
        },
      ],
      caption:
        'Mechanics IVPs specify $x(t_0),v(t_0)$. Euler uses $\\mathbf f$ at the left endpoint; RK2 samples the midpoint.',
    },
  ],
};
