/** Guiado: dictamen, colegiación y certificación. */

export default {
  title: 'El camino del contador público',
  lead: 'Elige lo que necesita cada contador.',
  steps: [
    {
      ask: 'Una empresa necesita una opinión independiente sobre sus estados financieros.',
      choices: [
        {label: 'Un contador público independiente que emita un dictamen', ok: true},
        {label: 'Su propio contador general', ok: false},
        {label: 'El director comercial', ok: false},
      ],
      caption: 'Es el único profesionista que puede dictaminar.',
    },
    {
      ask: '¿Qué afirma el dictamen?',
      choices: [
        {label: 'Que los estados financieros presentan razonablemente, en todos los aspectos importantes, la situación y los resultados conforme a las NIF', ok: true},
        {label: 'Que no existe ningún error', ok: false},
        {label: 'Que la empresa tendrá utilidades', ok: false},
      ],
      caption: 'Seguridad razonable, no absoluta.',
    },
    {
      ask: 'El contador quiere dictaminar para efectos fiscales. ¿Qué le falta además del título?',
      choices: [
        {label: 'Aprobar el Examen Uniforme de Certificación (y estar colegiado)', ok: true},
        {label: 'Trabajar en el SAT', ok: false},
        {label: 'Nada más', ok: false},
      ],
      caption: 'Lo prepara el IMCP y lo aplica el Ceneval.',
    },
    {
      ask: '¿Qué áreas evalúa ese examen?',
      choices: [
        {label: 'Ética, contabilidad, costos, fiscal, derecho, finanzas y auditoría', ok: true},
        {label: 'Solo impuestos', ok: false},
        {label: 'Programación y estadística', ok: false},
      ],
      caption: 'Siete áreas de conocimiento.',
    },
  ],
};
