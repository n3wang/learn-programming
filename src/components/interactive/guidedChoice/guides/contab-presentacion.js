/** Guiado: dónde se presenta cada saldo. */

export default {
  title: '¿Dónde se presenta este saldo?',
  lead: 'Decide el grupo correcto del estado de situación financiera.',
  steps: [
    {
      ask: 'Bancos termina el mes con saldo acreedor de 8,000 (se giró más de lo depositado).',
      choices: [
        {label: 'Pasivo circulante: sobregiro bancario', ok: true},
        {label: 'Activo circulante con signo negativo', ok: false},
        {label: 'Capital', ok: false},
      ],
      caption: 'Es una deuda a corto plazo con el banco.',
    },
    {
      ask: 'Deudores diversos tiene 150,000 prestados a empleados.',
      choices: [
        {label: 'Activo circulante, como “funcionarios y empleados” u “otras cuentas por cobrar”', ok: true},
        {label: 'Activo circulante, con el nombre “deudores diversos”', ok: false},
        {label: 'Pasivo', ok: false},
      ],
      caption: '“Deudores diversos” es un nombre indefinido que confunde al lector.',
    },
    {
      ask: 'Se pagaron por anticipado 12 meses de seguro.',
      choices: [
        {label: 'Activo circulante, después del almacén', ok: true},
        {label: 'Gasto del mes en que se pagó', ok: false},
        {label: 'Activo no circulante', ok: false},
      ],
      caption: 'Se recupera a través del ciclo financiero a corto plazo.',
    },
    {
      ask: 'Préstamo hipotecario de 600,000; 120,000 vencen en los próximos 12 meses.',
      choices: [
        {label: '120,000 en pasivo circulante y 480,000 en pasivo no circulante', ok: true},
        {label: 'Todo en pasivo no circulante', ok: false},
        {label: 'Todo en pasivo circulante', ok: false},
      ],
      caption: '“Deuda a largo plazo con vencimiento a un año”.',
    },
  ],
};
