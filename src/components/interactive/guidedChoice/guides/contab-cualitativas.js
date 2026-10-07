/** Guiado: características cualitativas (NIF A-4). */

export default {
  title: '¿Qué característica falla?',
  lead: 'Identifica la característica cualitativa de la NIF A-4 que se incumple.',
  steps: [
    {
      ask: 'El gerente registra ventas ficticias para alcanzar su bono.',
      choices: [
        {label: 'Confiabilidad (veracidad, objetividad)', ok: true},
        {label: 'Comprensibilidad', ok: false},
        {label: 'Comparabilidad', ok: false},
      ],
      caption: 'La información debe reflejar lo que realmente ocurrió, sin sesgo.',
    },
    {
      ask: 'Una demanda que podría costar la mitad del capital no se menciona en las notas.',
      choices: [
        {label: 'Relevancia (importancia relativa) e información suficiente', ok: true},
        {label: 'Consistencia', ok: false},
        {label: 'Oportunidad', ok: false},
      ],
      caption: 'Lo significativo debe mostrarse y revelarse.',
    },
    {
      ask: 'Cada año cambian los nombres y agrupaciones de las cuentas sin explicación.',
      choices: [
        {label: 'Comparabilidad', ok: true},
        {label: 'Veracidad', ok: false},
        {label: 'Supletoriedad', ok: false},
      ],
      caption: 'Debe poder analizarse en el tiempo y contra otras entidades.',
    },
    {
      ask: 'Los estados de enero se entregan en diciembre.',
      choices: [
        {label: 'La restricción de oportunidad', ok: true},
        {label: 'La dualidad económica', ok: false},
        {label: 'La verificabilidad', ok: false},
      ],
      caption: 'La información tardía pierde utilidad para decidir.',
    },
  ],
};
