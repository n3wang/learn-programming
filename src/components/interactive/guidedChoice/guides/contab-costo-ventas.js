/** Guiado: determinar el costo de ventas por comparación de inventarios. */

export default {
  title: 'Determina el costo de ventas',
  lead: 'Inventario inicial 100,000 · compras 500,000 · fletes 60,000 · devoluciones 30,000 · descuentos 18,000 · inventario final 180,000.',
  steps: [
    {
      ask: '¿Cuánto suman las compras netas?',
      choices: [
        {label: '512,000 = 500,000 + 60,000 − 30,000 − 18,000', ok: true},
        {label: '608,000', ok: false},
        {label: '452,000', ok: false},
      ],
      caption: 'Los gastos sobre compras forman parte del costo.',
    },
    {
      ask: '¿Cuánto es la mercancía disponible para la venta?',
      choices: [
        {label: '612,000 = 100,000 + 512,000', ok: true},
        {label: '512,000', ok: false},
        {label: '692,000', ok: false},
      ],
      caption: 'Inventario inicial más compras netas.',
    },
    {
      ask: '¿Cuál es el costo de ventas?',
      choices: [
        {label: '432,000 = 612,000 − 180,000', ok: true},
        {label: '612,000', ok: false},
        {label: '792,000', ok: false},
      ],
      caption: 'Lo que no está en el inventario final se vendió (o se perdió).',
    },
    {
      ask: 'En el método analítico, ¿qué asiento registra ese inventario final?',
      choices: [
        {label: 'Cargo a 0121 Inventario de mercancías, abono a 5065 Costo de ventas', ok: true},
        {label: 'Cargo a 5065, abono a 0121', ok: false},
        {label: 'Cargo a 5060, abono a 0121', ok: false},
      ],
      caption: 'Reduce el costo y queda como activo para el siguiente ejercicio.',
    },
  ],
};
