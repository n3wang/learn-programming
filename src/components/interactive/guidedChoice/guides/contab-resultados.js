/** Guiado: construir el estado de resultados. */

export default {
  title: 'Arma el estado de resultados',
  lead: 'Ventas netas 500,000 · costo 300,000 · gastos de venta 60,000 · administración 50,000 · financieros netos 10,000 · otros productos 5,000.',
  steps: [
    {
      ask: '¿Cuál es la utilidad bruta?',
      choices: [
        {label: '200,000 = 500,000 − 300,000', ok: true},
        {label: '500,000', ok: false},
        {label: '90,000', ok: false},
      ],
      caption: 'Resultado del objetivo fundamental del negocio.',
    },
    {
      ask: '¿Cuál es la utilidad de operación?',
      choices: [
        {label: '90,000 = 200,000 − 60,000 − 50,000', ok: true},
        {label: '140,000', ok: false},
        {label: '200,000', ok: false},
      ],
      caption: 'Se restan los gastos de operación.',
    },
    {
      ask: '¿Cuál es la utilidad antes de PTU e ISR?',
      choices: [
        {label: '85,000 = 90,000 − 10,000 + 5,000', ok: true},
        {label: '75,000', ok: false},
        {label: '105,000', ok: false},
      ],
      caption: 'Otros ingresos y gastos se suman o restan.',
    },
    {
      ask: 'PTU 8,500 e ISR 25,500. ¿Utilidad neta y a dónde va al cierre?',
      choices: [
        {label: '51,000, saldo acreedor de Pérdidas y ganancias (aumenta el capital)', ok: true},
        {label: '85,000, saldo deudor', ok: false},
        {label: '51,000 como pasivo', ok: false},
      ],
      caption: 'Debe coincidir con la utilidad del año en el capital.',
    },
  ],
};
