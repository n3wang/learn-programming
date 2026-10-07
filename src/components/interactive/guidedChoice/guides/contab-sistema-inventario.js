/** Guiado: elegir el sistema de registro de inventarios. */

export default {
  title: '¿Qué sistema de inventarios conviene?',
  lead: 'Elige entre comparación de inventarios e inventarios perpetuos.',
  steps: [
    {
      ask: 'Una concesionaria vende pocos autos al mes, cada uno con número de serie y costo conocido.',
      choices: [
        {label: 'Inventarios perpetuos: el costo de cada unidad es identificable', ok: true},
        {label: 'Comparación de inventarios', ok: false},
        {label: 'No registrar el costo', ok: false},
      ],
      caption: 'Pocas unidades de alto valor: costeable llevarlas una a una.',
    },
    {
      ask: 'Una tienda de abarrotes sin sistema electrónico vende miles de artículos baratos al día.',
      choices: [
        {label: 'Comparación de inventarios (costo con inventario físico)', ok: true},
        {label: 'Inventarios perpetuos manuales, artículo por artículo', ok: false},
        {label: 'Registrar el costo de cada chicle', ok: false},
      ],
      caption: 'Llevar el costo por producto a mano sería incosteable.',
    },
    {
      ask: 'Un supermercado instala lectores de códigos de barras en todas las cajas.',
      choices: [
        {label: 'Puede llevar inventarios perpetuos, con puntos de reorden automáticos', ok: true},
        {label: 'Debe seguir con comparación de inventarios', ok: false},
        {label: 'Debe dejar de contar inventario', ok: false},
      ],
      caption: 'La tecnología vuelve práctico el perpetuo (aunque se sigue contando para verificar).',
    },
    {
      ask: 'El dueño sospecha robos hormiga en la bodega.',
      choices: [
        {label: 'Los perpetuos permiten comparar existencia teórica contra conteo físico', ok: true},
        {label: 'La comparación de inventarios los detecta automáticamente', ok: false},
        {label: 'Ningún sistema ayuda', ok: false},
      ],
      caption: 'Sin existencias teóricas no hay contra qué comparar.',
    },
  ],
};
