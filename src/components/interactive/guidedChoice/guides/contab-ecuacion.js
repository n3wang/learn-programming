/** Guiado: la ecuación contable en acción. */

export default {
  title: 'Cuadra la ecuación contable',
  lead: 'La Espiga empieza con activo 100,000, pasivo 40,000 y capital 60,000.',
  steps: [
    {
      ask: 'Compra harina a crédito por 5,000. ¿Qué pasa?',
      choices: [
        {label: 'Activo +5,000 (inventario) y pasivo +5,000 (proveedores): 105,000 = 45,000 + 60,000', ok: true},
        {label: 'Activo +5,000 y capital +5,000', ok: false},
        {label: 'Nada cambia', ok: false},
      ],
      caption: 'La ecuación siempre se mantiene en equilibrio.',
    },
    {
      ask: 'Paga 3,000 al banco con efectivo. ¿Qué pasa?',
      choices: [
        {label: 'Activo −3,000 (caja) y pasivo −3,000 (préstamo): 102,000 = 42,000 + 60,000', ok: true},
        {label: 'Capital −3,000', ok: false},
        {label: 'Activo +3,000', ok: false},
      ],
      caption: 'Pagar una deuda no es un gasto.',
    },
    {
      ask: 'En el mes gana 8,000 de utilidad. ¿Dónde se refleja en el balance?',
      choices: [
        {label: 'Aumenta el capital en 8,000', ok: true},
        {label: 'Aumenta el pasivo', ok: false},
        {label: 'No se refleja', ok: false},
      ],
      caption: 'El estado de resultados conecta con el capital.',
    },
    {
      ask: 'Si el activo es 110,000 y el pasivo 42,000, ¿cuál es el capital?',
      choices: [
        {label: '68,000 = 110,000 − 42,000', ok: true},
        {label: '152,000', ok: false},
        {label: '42,000', ok: false},
      ],
      caption: 'Capital = Activo − Pasivo.',
    },
  ],
};
