/**
 * Build a kardex (inventory card) sheet from a list of operations.
 *
 *   buildKardex({
 *     method: 'UEPS' | 'PEPS' | 'PROMEDIO',
 *     ops: [{fecha: '2/1', tipo: 'compra', unidades: 500, costo: 300},
 *           {fecha: '6/1', tipo: 'venta', unidades: 150}],
 *     given: ['uSaldo'],      // optional: extra column keys shown as given (guided mode)
 *     lang: 'es',
 *     summary: true,          // append "Costo de ventas" and "Inventario final" rows
 *   })
 *
 * Returns {columns, rows, summary: {costoVentas, inventarioFinal, unidadesFinales, capas}}.
 * Each sale under UEPS/PEPS gets one row per inventory layer it consumes.
 */

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const TXT = {
  es: {
    fecha: 'Fecha', concepto: 'Concepto', unidades: 'Unidades', importe: 'Importe',
    debe: 'Debe', haber: 'Haber', saldo: 'Saldo', precio: 'Precio unitario',
    compra: 'Compra', venta: 'Venta', costoVentas: 'Costo de ventas del periodo', invFinal: 'Inventario final',
  },
  en: {
    fecha: 'Date', concepto: 'Description', unidades: 'Units', importe: 'Amount',
    debe: 'In', haber: 'Out', saldo: 'Balance', precio: 'Unit cost',
    compra: 'Purchase', venta: 'Sale', costoVentas: 'Cost of goods sold', invFinal: 'Ending inventory',
  },
};

export const KARDEX_METHODS = ['UEPS', 'PEPS', 'PROMEDIO'];

export function kardexColumns(lang = 'es') {
  const t = TXT[lang] || TXT.es;
  return [
    {key: 'fecha', label: t.fecha, type: 'text', width: 64},
    {key: 'concepto', label: t.concepto, type: 'text', width: 150},
    {key: 'uDebe', label: t.debe, group: t.unidades, decimals: 0},
    {key: 'uHaber', label: t.haber, group: t.unidades, decimals: 0},
    {key: 'uSaldo', label: t.saldo, group: t.unidades, decimals: 0},
    {key: 'precio', label: t.precio, decimals: 2},
    {key: 'iDebe', label: t.debe, group: t.importe, decimals: 2},
    {key: 'iHaber', label: t.haber, group: t.importe, decimals: 2},
    {key: 'iSaldo', label: t.saldo, group: t.importe, decimals: 2},
  ];
}

export function buildKardex({method = 'PEPS', ops = [], given = [], lang = 'es', summary = true} = {}) {
  const t = TXT[lang] || TXT.es;
  const m = String(method).toUpperCase();
  const givenSet = new Set(given);
  const ask = (key, value) => (givenSet.has(key) ? value : {a: value});
  const rows = [];
  let layers = []; // [{costo, unidades}]
  let units = 0;
  let amount = 0;
  let cogs = 0;

  for (const op of ops) {
    const tipo = String(op.tipo || '').toLowerCase();
    if (tipo === 'compra') {
      const imp = round2(op.unidades * op.costo);
      units += op.unidades;
      amount = round2(amount + imp);
      if (m === 'PROMEDIO') layers = [{costo: units ? amount / units : 0, unidades: units}];
      else layers.push({costo: op.costo, unidades: op.unidades});
      rows.push({
        fecha: op.fecha, concepto: op.concepto || t.compra,
        uDebe: op.unidades, uHaber: null, uSaldo: ask('uSaldo', units),
        precio: op.costo, iDebe: ask('iDebe', imp), iHaber: null, iSaldo: ask('iSaldo', amount),
      });
    } else if (tipo === 'venta') {
      if (op.unidades > units) throw new Error(`Venta de ${op.unidades} con solo ${units} en existencia (${op.fecha})`);
      const portions = [];
      if (m === 'PROMEDIO') {
        const avg = round2(units ? amount / units : 0);
        portions.push({unidades: op.unidades, costo: avg});
      } else {
        let left = op.unidades;
        while (left > 0) {
          const idx = m === 'UEPS' ? layers.length - 1 : 0;
          const layer = layers[idx];
          const take = Math.min(left, layer.unidades);
          portions.push({unidades: take, costo: layer.costo});
          layer.unidades -= take;
          if (layer.unidades === 0) layers.splice(idx, 1);
          left -= take;
        }
      }
      portions.forEach((p, k) => {
        const imp = round2(p.unidades * p.costo);
        units -= p.unidades;
        amount = round2(amount - imp);
        cogs = round2(cogs + imp);
        if (m === 'PROMEDIO') layers = [{costo: units ? amount / units : 0, unidades: units}];
        rows.push({
          fecha: k === 0 ? op.fecha : '', concepto: op.concepto || t.venta,
          uDebe: null,
          uHaber: portions.length === 1 ? p.unidades : ask('uHaber', p.unidades),
          uSaldo: ask('uSaldo', units),
          precio: ask('precio', p.costo),
          iDebe: null, iHaber: ask('iHaber', imp), iSaldo: ask('iSaldo', amount),
        });
      });
    }
  }

  if (summary) {
    rows.push({_style: 'total', fecha: '', concepto: t.costoVentas, iHaber: {a: cogs}});
    rows.push({_style: 'total', fecha: '', concepto: t.invFinal, uSaldo: {a: units}, iSaldo: {a: amount}});
  }

  return {
    columns: kardexColumns(lang),
    rows,
    summary: {
      costoVentas: cogs,
      inventarioFinal: amount,
      unidadesFinales: units,
      capas: m === 'PROMEDIO' ? layers.map((l) => ({...l, costo: round2(l.costo)})) : layers.map((l) => ({...l})),
    },
  };
}
