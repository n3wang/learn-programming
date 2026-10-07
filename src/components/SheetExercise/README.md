# SheetExercise

An Excel-like grid for data-table practice (accounting, inventory cards, trial balances, any table with right answers). Registered globally in MDX, loaded browser-only.

## Generic table

```mdx
<SheetExercise
  id="unique-id"            // localStorage key — must be unique per exercise
  lang="es"                 // "es" or "en" (UI text, number format)
  title="Balanza"
  instructions="Optional text above the grid."
  columns={[
    {key: 'cuenta', label: 'Cuenta', type: 'text', width: 180},
    {key: 'debe', label: 'Debe', group: 'Movimientos', decimals: 2},
    {key: 'haber', label: 'Haber', group: 'Movimientos', decimals: 2},
  ]}
  rows={[
    {cuenta: 'Caja', debe: 10000, haber: null},            // given (read-only)
    {cuenta: 'Bancos', debe: {a: 40000}},                  // editable, checked
    {cuenta: {a: ['Almacén', 'Inventario']}, debe: 500},   // editable text, any listed answer
    {cuenta: 'Notas', debe: {input: true}},                // editable, not checked
    {cuenta: 'Total', debe: {f: '=SUM(B1:B4)'}, _style: 'total'}, // computed, read-only
  ]}
/>
```

| Cell value | Meaning |
|---|---|
| number / string / `null` | Given, read-only |
| `{a: 123}` / `{a: 'texto'}` / `{a: ['x', 'y']}` | Editable; checked against the answer(s) |
| `{f: '=B1+B2'}` | Computed formula, read-only |
| `{input: true}` | Editable scratch cell, not checked |

- **Numbers** are compared after rounding to the column's `decimals` (default 2). **Text** ignores accents, case and punctuation.
- Columns with the same `group` get a merged header (e.g. *Unidades: Debe / Haber / Saldo*).
- Row option `_style: 'total' | 'section'`.
- Props: `showRefs` (default `true`, shows A/B/C and 1/2/3), `allowFormulas` (default `true`).

## Formulas

Students (and `{f: …}` cells) can type `=` formulas with A1 references (letters = columns, numbers = rows as shown in the grid): `+ - * /`, parentheses, ranges `B1:B6`, and `SUM`/`SUMA`, `MIN`, `MAX`, `AVERAGE`/`PROMEDIO`, `ROUND`/`REDONDEAR`, `ABS`. Arguments may be separated by `,` or `;`. Circular or invalid formulas show `#ERR`. No `eval` is used.

## Kardex generator

```mdx
<SheetExercise
  id="kardex-a" lang="es" title="Kárdex — artículo A"
  kind="kardex"
  method="UEPS"                          // initial method
  methods={['UEPS', 'PEPS', 'PROMEDIO']} // optional method tabs (each saves separately)
  given={['uSaldo']}                     // optional: show these columns as given (guided mode)
  summary={true}                         // append cost-of-sales and ending-inventory rows
  ops={[
    {fecha: '2/1', tipo: 'compra', unidades: 500, costo: 300},
    {fecha: '6/1', tipo: 'venta', unidades: 150},
  ]}
/>
```

Column keys: `fecha, concepto, uDebe, uHaber, uSaldo, precio, iDebe, iHaber, iSaldo`. Under UEPS/PEPS a sale that consumes several layers gets one row per layer. PROMEDIO uses the weighted average rounded to cents. `buildKardex()` is also exported for reuse (e.g. to compute expected totals in tests).

## Buttons

**Comprobar / Check** colors each cell (green, red, yellow = empty) · **Pista / Hint** fills the first pending cell · **Ver respuestas / Show answers** · **Reiniciar / Reset** · **Descargar CSV** (opens in Excel). Entries persist in `localStorage`.
