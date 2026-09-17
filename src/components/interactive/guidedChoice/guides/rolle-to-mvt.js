/** Guided beats: Rolle → generalized Rolle → MVT geometry. */

export default {
  title: 'From Rolle to the Mean Value Theorem',
  lead: 'Equal heights ⇒ horizontal tangent; unequal heights ⇒ tangent parallel to the chord.',
  steps: [
    {
      ask: 'Rolle’s hypotheses include continuity on $[a,b]$, differentiability on $(a,b)$, and…',
      choices: [
        {
          label: '$f(a)=f(b)=0$ (or, more generally, equal endpoint values)',
          ok: true,
        },
        {
          label: '$f\'>0$ everywhere',
          ok: false,
        },
        {
          label: '$f$ must be a polynomial of degree 2',
          ok: false,
        },
      ],
      caption: 'Classic Rolle uses zeros; the corollary only needs $f(a)=f(b)$.',
    },
    {
      ask: 'Generalized Rolle follows from classic Rolle by studying…',
      choices: [
        {
          label: '$h(x)=g(x)-g(a)$, which has $h(a)=h(b)=0$',
          ok: true,
        },
        {
          label: '$h(x)=g\'(x)$ only',
          ok: false,
        },
        {
          label: '$h(x)=x-a$ with no reference to $g$',
          ok: false,
        },
      ],
      caption: 'Subtracting the constant $g(a)$ does not change derivatives.',
    },
    {
      ask: 'The Mean Value Theorem says there is $x_0\\in(a,b)$ with…',
      choices: [
        {
          label: "$f'(x_0)=\\dfrac{f(b)-f(a)}{b-a}$ (tangent parallel to the chord)",
          ok: true,
        },
        {
          label: '$f(x_0)=0$ always',
          ok: false,
        },
        {
          label: "$f'(x_0)=f(b)+f(a)$",
          ok: false,
        },
      ],
      caption: 'Law of the Mean = MVT for derivatives — average rate equals an instantaneous rate.',
    },
  ],
};
