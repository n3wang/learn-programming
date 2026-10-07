/** Guiado: el mecanismo del IVA. */

export default {
  title: 'Sigue el IVA',
  lead: 'Tasa general 16%. La empresa compra y luego vende mercancía.',
  steps: [
    {
      ask: 'Compra mercancía por 10,000 + IVA. ¿Cuánto IVA paga y dónde se registra?',
      choices: [
        {label: '1,600, como cargo a la cuenta IVA (menor pasivo, no gasto)', ok: true},
        {label: '1,600 como gasto de administración', ok: false},
        {label: '1,600 como mayor costo de la mercancía', ok: false},
      ],
      caption: 'Es IVA acreditable.',
    },
    {
      ask: 'Vende esa mercancía en 15,000 + IVA. ¿Qué pasa con la cuenta IVA?',
      choices: [
        {label: 'Abono de 2,400 (IVA trasladado al cliente)', ok: true},
        {label: 'Cargo de 2,400', ok: false},
        {label: 'Abono de 15,000', ok: false},
      ],
      caption: 'El cliente paga el impuesto.',
    },
    {
      ask: '¿Cuánto entrega la empresa al SAT?',
      choices: [
        {label: '800 = 2,400 − 1,600 (saldo acreedor)', ok: true},
        {label: '2,400', ok: false},
        {label: '4,000', ok: false},
      ],
      caption: 'Trasladado menos acreditable.',
    },
    {
      ask: 'Un cliente devuelve mercancía y se le emite nota de crédito con IVA de 160.',
      choices: [
        {label: 'Cargo de 160 a IVA: disminuye el impuesto por pagar', ok: true},
        {label: 'Abono de 160 a IVA', ok: false},
        {label: 'No afecta el IVA', ok: false},
      ],
      caption: 'Se revierte parte del IVA trasladado.',
    },
  ],
};
