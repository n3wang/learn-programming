/** Guiado: el doble asiento de inventarios perpetuos. */

export default {
  title: 'El doble asiento del inventario perpetuo',
  lead: 'Se venden de contado 40 unidades del artículo A a 1,600 c/u; su costo es 1,000 c/u.',
  steps: [
    {
      ask: '¿Cuál es el primer asiento (la venta)?',
      choices: [
        {label: 'Cargo a Bancos 64,000 / abono a Ventas 64,000', ok: true},
        {label: 'Cargo a Costo de ventas 64,000 / abono a Almacén 64,000', ok: false},
        {label: 'Cargo a Almacén 40,000 / abono a Ventas 40,000', ok: false},
      ],
      caption: 'A precio de venta.',
    },
    {
      ask: '¿Cuál es el segundo asiento (el costo)?',
      choices: [
        {label: 'Cargo a Costo de ventas 40,000 / abono a Almacén 40,000', ok: true},
        {label: 'Cargo a Almacén 40,000 / abono a Costo de ventas 40,000', ok: false},
        {label: 'No hace falta', ok: false},
      ],
      caption: 'A precio de costo: 40 × 1,000.',
    },
    {
      ask: '¿Cuál es la utilidad bruta de esta venta?',
      choices: [
        {label: '24,000 = 64,000 − 40,000', ok: true},
        {label: '64,000', ok: false},
        {label: '1,600', ok: false},
      ],
      caption: 'Se conoce al instante y por producto.',
    },
    {
      ask: 'El cliente devuelve 10 unidades. ¿Qué pasa con el Almacén?',
      choices: [
        {label: 'Cargo a Almacén 10,000 y abono a Costo de ventas 10,000 (además de revertir la venta)', ok: true},
        {label: 'Abono a Almacén 16,000', ok: false},
        {label: 'Nada, solo se ajusta Ventas', ok: false},
      ],
      caption: 'La mercancía regresa a costo.',
    },
  ],
};
