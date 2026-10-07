/** Guiado: identificar el postulado básico (NIF A-2). */

export default {
  title: '¿Qué postulado aplica?',
  lead: 'Identifica el postulado básico de la NIF A-2 en cada situación.',
  steps: [
    {
      ask: 'Se vende a crédito el 30 de diciembre y se cobra en febrero. La venta se registra en diciembre.',
      choices: [
        {label: 'Devengación contable', ok: true},
        {label: 'Negocio en marcha', ok: false},
        {label: 'Dualidad económica', ok: false},
      ],
      caption: 'Se reconoce cuando ocurre, no cuando se cobra.',
    },
    {
      ask: 'Un contrato se llama “arrendamiento”, pero la empresa se quedará con el equipo y paga casi todo su valor: se registra como compra financiada.',
      choices: [
        {label: 'Sustancia económica', ok: true},
        {label: 'Consistencia', ok: false},
        {label: 'Valuación', ok: false},
      ],
      caption: 'Prevalece la esencia económica sobre la forma legal.',
    },
    {
      ask: 'El costo de la mercancía comprada en marzo se lleva a resultados en mayo, cuando se vende.',
      choices: [
        {label: 'Asociación de costos y gastos con ingresos', ok: true},
        {label: 'Entidad económica', ok: false},
        {label: 'Supletoriedad', ok: false},
      ],
      caption: 'El costo se identifica con el ingreso que genera.',
    },
    {
      ask: 'La empresa usa el mismo método de depreciación cada año, y si lo cambia, lo revela.',
      choices: [
        {label: 'Consistencia', ok: true},
        {label: 'Devengación contable', ok: false},
        {label: 'Sustancia económica', ok: false},
      ],
      caption: 'Permite comparar los periodos.',
    },
  ],
};
