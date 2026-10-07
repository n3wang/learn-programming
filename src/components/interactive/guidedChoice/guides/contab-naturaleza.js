/** Guiado: ¿cargo o abono? */

export default {
  title: '¿Cargo o abono?',
  lead: 'Decide en qué lado se registra cada movimiento según la naturaleza de la cuenta.',
  steps: [
    {
      ask: 'Entra dinero a Bancos por un depósito.',
      choices: [
        {label: 'Cargo a Bancos (activo, naturaleza deudora, aumenta en el debe)', ok: true},
        {label: 'Abono a Bancos', ok: false},
        {label: 'No se registra', ok: false},
      ],
      caption: 'Los activos aumentan con cargos.',
    },
    {
      ask: 'Se compra mercancía a crédito: ¿qué le pasa a Proveedores?',
      choices: [
        {label: 'Abono a Proveedores (pasivo, naturaleza acreedora, aumenta en el haber)', ok: true},
        {label: 'Cargo a Proveedores', ok: false},
        {label: 'Cargo a Capital', ok: false},
      ],
      caption: 'Los pasivos aumentan con abonos.',
    },
    {
      ask: 'Se vende mercancía: ¿qué le pasa a Ventas?',
      choices: [
        {label: 'Abono a Ventas (ingreso, naturaleza acreedora)', ok: true},
        {label: 'Cargo a Ventas', ok: false},
        {label: 'Cargo a Gastos de venta', ok: false},
      ],
      caption: 'Los ingresos aumentan el capital, que es acreedor.',
    },
    {
      ask: 'Se paga la renta del local: ¿qué le pasa a Gastos de administración?',
      choices: [
        {label: 'Cargo a Gastos de administración (naturaleza deudora)', ok: true},
        {label: 'Abono a Gastos de administración', ok: false},
        {label: 'Abono a Capital', ok: false},
      ],
      caption: 'Los gastos reducen el capital, por eso son deudores.',
    },
  ],
};
