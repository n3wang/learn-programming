/** Guiado: identificar el postulado del Código de Ética. */

export default {
  title: '¿Qué postulado aplica?',
  lead: 'Identifica el postulado del Código de Ética Profesional en cada situación.',
  steps: [
    {
      ask: 'Una contadora se niega a contar a un competidor los márgenes de su cliente.',
      choices: [
        {label: 'VI Secreto profesional', ok: true},
        {label: 'IX Retribución económica', ok: false},
        {label: 'XII Difusión de conocimientos', ok: false},
      ],
      caption: 'Responsabilidad hacia quien patrocina los servicios.',
    },
    {
      ask: 'Un auditor rechaza un encargo porque su hermano es el director financiero del cliente.',
      choices: [
        {label: 'II Independencia de criterio', ok: true},
        {label: 'X Respeto a los colegas', ok: false},
        {label: 'I Aplicación universal', ok: false},
      ],
      caption: 'Criterio imparcial y libre de conflicto de intereses.',
    },
    {
      ask: 'Un contador toma cursos de actualización fiscal cada año.',
      choices: [
        {label: 'IV Preparación y calidad profesional', ok: true},
        {label: 'VIII Lealtad hacia el patrocinador', ok: false},
        {label: 'VI Secreto profesional', ok: false},
      ],
      caption: 'Responsabilidad hacia la sociedad.',
    },
    {
      ask: 'Le piden alterar facturas para reducir impuestos y se niega.',
      choices: [
        {label: 'VII Obligación de rechazar tareas que no cumplan con la moral', ok: true},
        {label: 'IX Retribución económica', ok: false},
        {label: 'XI Dignificación de la imagen profesional', ok: false},
      ],
      caption: 'Intervenir faltaría al honor y la dignidad profesional.',
    },
  ],
};
