/** Guiado: identificar la combinación de la partida doble. */

export default {
  title: '¿Qué combinación es?',
  lead: 'Clasifica cada operación entre las nueve combinaciones de la partida doble.',
  steps: [
    {
      ask: 'Se compra un escritorio de 5,000 pagando con efectivo de la caja.',
      choices: [
        {label: 'Aumento de activo con disminución del activo mismo', ok: true},
        {label: 'Aumento de activo con aumento de pasivo', ok: false},
        {label: 'Disminución de capital con disminución de activo', ok: false},
      ],
      caption: 'El total del activo no cambia; solo su composición.',
    },
    {
      ask: 'Se firma un pagaré a favor de un proveedor por su factura pendiente.',
      choices: [
        {label: 'Disminución de pasivo con aumento del pasivo mismo', ok: true},
        {label: 'Disminución de pasivo con disminución de activo', ok: false},
        {label: 'Aumento de activo con aumento de pasivo', ok: false},
      ],
      caption: 'Proveedores baja y Documentos por pagar sube por lo mismo.',
    },
    {
      ask: 'Se capitaliza la reserva de reinversión de utilidades.',
      choices: [
        {label: 'Disminución de capital con aumento del capital mismo', ok: true},
        {label: 'Disminución de capital con aumento de pasivo', ok: false},
        {label: 'Aumento de activo con aumento de capital', ok: false},
      ],
      caption: 'Se reclasifica dentro del capital.',
    },
    {
      ask: 'Se paga en efectivo un dividendo decretado en ese momento.',
      choices: [
        {label: 'Disminución de capital con disminución de activo', ok: true},
        {label: 'Disminución de pasivo con disminución de activo', ok: false},
        {label: 'Aumento de activo con aumento de capital', ok: false},
      ],
      caption: 'Sale efectivo y baja el capital de los dueños.',
    },
  ],
};
