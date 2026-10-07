/** Guiado: ubicar hechos en la historia de la contabilidad mexicana. */

export default {
  title: '¿En qué época de la contabilidad estamos?',
  lead: 'Ubica cada hecho en su momento histórico.',
  steps: [
    {
      ask: 'Un comerciante de Veracruz en 1780 registra sus operaciones. ¿Qué norma sigue?',
      choices: [
        {label: 'Las Ordenanzas de Bilbao (1ª época)', ok: true},
        {label: 'Las NIF del CINIF', ok: false},
        {label: 'El Tercer Código de Comercio', ok: false},
      ],
      caption: 'Aprobadas por Felipe V en 1737; rigieron hasta finales del siglo XIX.',
    },
    {
      ask: 'En 1895 se sustituyen las Ordenanzas de Bilbao. ¿Por qué norma?',
      choices: [
        {label: 'El Tercer Código de Comercio, en el gobierno de Porfirio Díaz (2ª época)', ok: true},
        {label: 'Los Boletines del IMCP', ok: false},
        {label: 'Las IFRS', ok: false},
      ],
      caption: 'Inicia el desarrollo de la contabilidad mexicana (1890–1959).',
    },
    {
      ask: '¿Qué hecho marca el inicio de la 3ª época (1959)?',
      choices: [
        {label: 'La creación de la Junta de Principios de Contabilidad (APB) en EUA', ok: true},
        {label: 'La fundación del CINIF', ok: false},
        {label: 'El tratado de Pacioli', ok: false},
      ],
      caption: 'Comienza la normatividad internacional.',
    },
    {
      ask: 'Hoy una empresa mexicana no listada prepara sus estados financieros. ¿Qué normas aplica?',
      choices: [
        {label: 'Las NIF emitidas por el CINIF (desde 2004)', ok: true},
        {label: 'Los Boletines de 1969', ok: false},
        {label: 'Las Ordenanzas de Bilbao', ok: false},
      ],
      caption: 'Las NIF se homologan con las normas internacionales (IFRS).',
    },
  ],
};
