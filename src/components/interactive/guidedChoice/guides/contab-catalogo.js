/** Guiado: ubicar una cuenta en el catálogo. */

export default {
  title: 'Ubica la cuenta en el catálogo',
  lead: 'Usa el código de 4 dígitos: grupo · subgrupo · cuenta.',
  steps: [
    {
      ask: 'La empresa compra un camión de reparto. ¿En qué grupo y subgrupo va?',
      choices: [
        {label: '0 Activo · 2 No circulante (equipo de reparto, 0221)', ok: true},
        {label: '0 Activo · 1 Circulante', ok: false},
        {label: '6 Gastos', ok: false},
      ],
      caption: 'Bien tangible de uso prolongado.',
    },
    {
      ask: 'La empresa firma un pagaré a 6 meses con un proveedor. ¿Dónde va?',
      choices: [
        {label: '1 Pasivo · 1 Circulante (documentos por pagar, 1102)', ok: true},
        {label: '1 Pasivo · 2 No circulante', ok: false},
        {label: '2 Créditos diferidos', ok: false},
      ],
      caption: 'Vence en menos de un año.',
    },
    {
      ask: 'Un inquilino paga por adelantado la renta de todo el año. ¿Dónde va al cobrar?',
      choices: [
        {label: '2 Créditos diferidos (rentas cobradas por anticipado, 2002)', ok: true},
        {label: '4 Ingresos (ventas)', ok: false},
        {label: '3 Capital', ok: false},
      ],
      caption: 'Se convierte en ingreso con el transcurso del tiempo.',
    },
    {
      ask: 'La empresa gana una multa a su favor en un juicio, ajeno a su giro. ¿Dónde va?',
      choices: [
        {label: '7 Otros ingresos y otros gastos (7201)', ok: true},
        {label: '4 Ingresos normales', ok: false},
        {label: '3 Capital', ok: false},
      ],
      caption: 'Ingreso esporádico, no relacionado con el objeto social.',
    },
  ],
};
