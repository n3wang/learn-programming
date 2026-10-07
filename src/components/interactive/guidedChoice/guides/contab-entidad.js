/** Guiado: aplicar el postulado de entidad. */

export default {
  title: '¿Es de la entidad o del dueño?',
  lead: 'Panadería La Espiga, S.A. de C.V. es una persona moral distinta de su socia, Ana.',
  steps: [
    {
      ask: 'La Espiga compra harina con su cuenta bancaria.',
      choices: [
        {label: 'Se registra en la contabilidad de La Espiga', ok: true},
        {label: 'Se registra como gasto personal de Ana', ok: false},
        {label: 'No se registra', ok: false},
      ],
      caption: 'Es una operación de la entidad.',
    },
    {
      ask: 'Ana paga la renta de su casa con su tarjeta personal.',
      choices: [
        {label: 'No va en la contabilidad de La Espiga', ok: true},
        {label: 'Es un gasto de La Espiga', ok: false},
        {label: 'Es un ingreso de La Espiga', ok: false},
      ],
      caption: 'La entidad tiene patrimonio propio, diferente del de sus dueños.',
    },
    {
      ask: 'Un banco administra un patrimonio para pagar las pensiones de los empleados de La Espiga.',
      choices: [
        {label: 'Es un fideicomiso: entidad sin personalidad jurídica propia; el fiduciario tiene la titularidad', ok: true},
        {label: 'Es una persona física', ok: false},
        {label: 'Es parte del capital de Ana', ok: false},
      ],
      caption: 'Patrimonio autónomo con un fin determinado.',
    },
    {
      ask: 'La Espiga compra otras dos panaderías y presenta un solo juego de estados financieros del grupo.',
      choices: [
        {label: 'Entidad consolidada: varias entidades con personalidad propia presentadas como un todo', ok: true},
        {label: 'Una nueva persona física', ok: false},
        {label: 'Un fideicomiso', ok: false},
      ],
      caption: 'Cada una sigue respondiendo individualmente por sus obligaciones.',
    },
  ],
};
