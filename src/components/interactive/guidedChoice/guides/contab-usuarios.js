/** Guiado: qué busca cada usuario de los estados financieros. */

export default {
  title: '¿Qué busca cada usuario?',
  lead: 'Relaciona al usuario con su principal necesidad de información.',
  steps: [
    {
      ask: 'Un banco analiza si presta $500,000 a la empresa.',
      choices: [
        {label: 'Si podrá pagar capital e intereses: estructura financiera y generación de fondos', ok: true},
        {label: 'Cuántos empleos genera en la comunidad', ok: false},
        {label: 'Su cobertura de mercado para estadísticas', ok: false},
      ],
      caption: 'Usuario externo: institución de crédito.',
    },
    {
      ask: 'Un inversionista piensa comprar acciones.',
      choices: [
        {label: 'El riesgo y el rendimiento de su inversión', ok: true},
        {label: 'Solo el número de empleados', ok: false},
        {label: 'La fecha de pago a proveedores', ok: false},
      ],
      caption: 'Decide si comprar, conservar o vender.',
    },
    {
      ask: 'El sindicato negocia el contrato colectivo.',
      choices: [
        {label: 'Las utilidades, su participación en ellas y la estabilidad de la empresa', ok: true},
        {label: 'La política fiscal del gobierno', ok: false},
        {label: 'Si será un buen cliente', ok: false},
      ],
      caption: 'Usuario interno: empleados.',
    },
    {
      ask: 'El director general prepara el presupuesto del próximo año.',
      choices: [
        {label: 'Información detallada para controlar, planear y decidir', ok: true},
        {label: 'Solo el resumen anual publicado', ok: false},
        {label: 'Nada; no es usuario', ok: false},
      ],
      caption: 'Los administradores son usuarios internos y responsables de preparar la información.',
    },
  ],
};
