/** Guiado: armar un asiento de diario. */

export default {
  title: 'Arma el asiento de diario',
  lead: 'Elige el asiento correcto (cargo / abono) para cada operación.',
  steps: [
    {
      ask: 'Se obtiene un préstamo bancario de 7,000 que se deposita en la cuenta de cheques.',
      choices: [
        {label: 'Cargo a Bancos 7,000 / abono a Préstamos bancarios 7,000', ok: true},
        {label: 'Cargo a Préstamos bancarios / abono a Bancos', ok: false},
        {label: 'Cargo a Bancos / abono a Capital social', ok: false},
      ],
      caption: 'Aumenta un activo (cargo) y un pasivo (abono).',
    },
    {
      ask: 'Se vende mercancía de contado por 5,000.',
      choices: [
        {label: 'Cargo a Caja 5,000 / abono a Ventas 5,000', ok: true},
        {label: 'Cargo a Ventas / abono a Caja', ok: false},
        {label: 'Cargo a Caja / abono a Capital social', ok: false},
      ],
      caption: 'Los ingresos aumentan con abonos.',
    },
    {
      ask: 'La mercancía vendida costó 3,000.',
      choices: [
        {label: 'Cargo a Costo de ventas 3,000 / abono a Almacén 3,000', ok: true},
        {label: 'Cargo a Almacén / abono a Costo de ventas', ok: false},
        {label: 'Cargo a Gastos de venta / abono a Caja', ok: false},
      ],
      caption: 'Sale inventario y nace un costo.',
    },
    {
      ask: 'Se debe una comisión de venta de 1,000 que aún no se paga.',
      choices: [
        {label: 'Cargo a Gastos de venta 1,000 / abono a Comisiones por pagar 1,000', ok: true},
        {label: 'Cargo a Gastos de venta / abono a Caja', ok: false},
        {label: 'Cargo a Comisiones por pagar / abono a Gastos de venta', ok: false},
      ],
      caption: 'Gasto devengado aunque no pagado: aumenta un pasivo.',
    },
  ],
};
