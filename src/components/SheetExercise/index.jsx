import React, {useEffect, useMemo, useRef, useState} from 'react';
import styles from './styles.module.css';
import {colLetter, evaluateFormula, parseTypedNumber} from './formula';
import {buildKardex, KARDEX_METHODS} from './kardex';
import {getSheetLabels} from './labels';

/**
 * <SheetExercise> — a small Excel-like grid for accounting / data-table practice.
 *
 * Generic use:
 *   <SheetExercise id="…" lang="es"
 *     columns={[{key: 'cuenta', label: 'Cuenta', type: 'text'}, {key: 'debe', label: 'Debe', decimals: 2}]}
 *     rows={[
 *       {cuenta: 'Caja', debe: 10000},            // given (read-only)
 *       {cuenta: 'Bancos', debe: {a: 40000}},     // editable, checked against the answer
 *       {cuenta: 'Total', debe: {f: '=B1+B2'}},   // computed formula (read-only)
 *       {cuenta: {a: ['Almacén', 'Inventario']}}, // editable text, any listed answer accepted
 *       {cuenta: 'Notas', debe: {input: true}},   // editable, not checked
 *     ]} />
 *
 * Kardex generator (UEPS / PEPS / PROMEDIO):
 *   <SheetExercise id="…" lang="es" kind="kardex" method="UEPS" methods={['UEPS', 'PEPS', 'PROMEDIO']}
 *     ops={[{fecha: '2/1', tipo: 'compra', unidades: 500, costo: 300}, {fecha: '6/1', tipo: 'venta', unidades: 150}]} />
 *
 * Cells accept numbers or formulas (=C2*F2, =SUM(H1:H3)); refs use the letters/numbers shown in the grid.
 * Row option `_style: 'total' | 'section'` styles a row.
 */

function isAnswerCell(spec) {
  return spec && typeof spec === 'object' && !Array.isArray(spec) && ('a' in spec || spec.input);
}

function isFormulaCell(spec) {
  return spec && typeof spec === 'object' && !Array.isArray(spec) && typeof spec.f === 'string';
}

function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[“”"'.,;:¡!¿?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function roundTo(n, d) {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
}

function storageKey(id, variant) {
  return `sheet-exercise:${id}${variant ? `:${variant}` : ''}`;
}

export default function SheetExercise({
  id,
  lang = 'en',
  title,
  instructions,
  columns: columnsProp,
  rows: rowsProp,
  kind,
  method: methodProp,
  methods,
  ops,
  given,
  summary = true,
  showRefs = true,
  allowFormulas = true,
}) {
  const t = getSheetLabels(lang);
  const methodList = Array.isArray(methods) && methods.length ? methods : null;
  const [method, setMethod] = useState(String(methodProp || (methodList ? methodList[0] : 'PEPS')).toUpperCase());

  const {columns, rows} = useMemo(() => {
    if (kind === 'kardex') {
      const built = buildKardex({method, ops: ops || [], given: given || [], lang, summary});
      return {columns: columnsProp || built.columns, rows: built.rows};
    }
    return {columns: columnsProp || [], rows: rowsProp || []};
  }, [kind, method, ops, given, lang, summary, columnsProp, rowsProp]);

  const variant = kind === 'kardex' ? method : '';
  const [values, setValues] = useState({});
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(null);
  const inputs = useRef({});

  // Editable cells in reading order.
  const editable = useMemo(() => {
    const list = [];
    rows.forEach((row, r) =>
      columns.forEach((col, c) => {
        if (isAnswerCell(row[col.key])) list.push({r, c, key: `${r}:${c}`, spec: row[col.key], col});
      }),
    );
    return list;
  }, [rows, columns]);
  const checkable = editable.filter((e) => 'a' in e.spec);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey(id, variant)) || 'null');
      setValues(saved && saved.values ? saved.values : {});
      setRevealed(Boolean(saved && saved.revealed));
    } catch {
      setValues({});
      setRevealed(false);
    }
    setMarks({});
    setMessage(null);
  }, [id, variant]);

  function persist(nextValues, nextRevealed = revealed) {
    try {
      window.localStorage.setItem(storageKey(id, variant), JSON.stringify({values: nextValues, revealed: nextRevealed}));
    } catch {
      /* ignore */
    }
  }

  // ---- evaluation -------------------------------------------------------
  const evaluated = useMemo(() => {
    const cache = new Map();
    const visiting = new Set();

    function cellValue(r, c) {
      const key = `${r}:${c}`;
      if (cache.has(key)) return cache.get(key);
      const row = rows[r];
      const col = columns[c];
      if (!row || !col) return {value: null};
      const spec = row[col.key];
      let result;
      if (visiting.has(key)) return {value: null, error: true};
      visiting.add(key);
      try {
        if (isFormulaCell(spec)) {
          result = {value: evaluateFormula(spec.f, numberAt)};
        } else if (isAnswerCell(spec)) {
          const raw = values[key];
          if (raw == null || String(raw).trim() === '') result = {value: null};
          else if (allowFormulas && String(raw).trim().startsWith('=')) {
            try {
              result = {value: evaluateFormula(raw, numberAt), formula: true};
            } catch {
              result = {value: null, error: true, formula: true};
            }
          } else {
            const n = parseTypedNumber(raw);
            result = {value: Number.isNaN(n) ? String(raw) : n};
          }
        } else {
          result = {value: spec ?? null};
        }
      } catch {
        result = {value: null, error: true};
      }
      visiting.delete(key);
      cache.set(key, result);
      return result;
    }

    function numberAt(r, c) {
      const cell = cellValue(r, c);
      if (cell.error) throw new Error('ref');
      return typeof cell.value === 'number' ? cell.value : 0;
    }

    const out = {};
    rows.forEach((_, r) => columns.forEach((__, c) => (out[`${r}:${c}`] = cellValue(r, c))));
    return out;
  }, [rows, columns, values, allowFormulas]);

  function isRight(entry) {
    const got = evaluated[entry.key]?.value;
    if (got == null || got === '') return null;
    const answers = Array.isArray(entry.spec.a) ? entry.spec.a : [entry.spec.a];
    return answers.some((ans) => {
      if (typeof ans === 'number') {
        const n = typeof got === 'number' ? got : parseTypedNumber(got);
        const d = entry.col.decimals ?? 2;
        return Number.isFinite(n) && Math.abs(roundTo(n, d) - roundTo(ans, d)) < 1e-9;
      }
      return normalizeText(got) === normalizeText(ans);
    });
  }

  // ---- actions ----------------------------------------------------------
  function update(key, raw) {
    const next = {...values, [key]: raw};
    setValues(next);
    if (marks[key] !== undefined) {
      const m = {...marks};
      delete m[key];
      setMarks(m);
    }
    setMessage(null);
    persist(next);
  }

  function check() {
    const m = {};
    let bad = 0;
    let empty = 0;
    checkable.forEach((e) => {
      const ok = isRight(e);
      if (ok === null) empty += 1;
      else if (!ok) bad += 1;
      m[e.key] = ok === null ? 'empty' : ok ? 'ok' : 'bad';
    });
    setMarks(m);
    setMessage(bad === 0 && empty === 0 ? {ok: true, text: t.allRight} : {ok: false, text: t.someWrong(bad, empty)});
  }

  function answerText(entry) {
    const a = Array.isArray(entry.spec.a) ? entry.spec.a[0] : entry.spec.a;
    return typeof a === 'number' ? String(roundTo(a, entry.col.decimals ?? 2)) : String(a);
  }

  function hint() {
    const target = checkable.find((e) => isRight(e) !== true);
    if (!target) {
      setMessage({ok: true, text: t.noHint});
      return;
    }
    const next = {...values, [target.key]: answerText(target)};
    setValues(next);
    persist(next);
    setMarks({...marks, [target.key]: 'hint'});
    setMessage({ok: true, text: t.hintGiven(`${colLetter(target.c)}${target.r + 1}`)});
    inputs.current[target.key]?.focus();
  }

  function reveal() {
    const next = {...values};
    const m = {};
    checkable.forEach((e) => {
      if (isRight(e) !== true) {
        next[e.key] = answerText(e);
        m[e.key] = 'hint';
      } else {
        m[e.key] = 'ok';
      }
    });
    setValues(next);
    setMarks(m);
    setRevealed(true);
    persist(next, true);
    setMessage({ok: true, text: t.revealed});
  }

  function reset() {
    setValues({});
    setMarks({});
    setRevealed(false);
    setMessage(null);
    persist({}, false);
  }

  function moveFocus(fromKey, dir) {
    const idx = editable.findIndex((e) => e.key === fromKey);
    if (idx < 0) return;
    const cur = editable[idx];
    let target;
    if (dir === 'down' || dir === 'up') {
      const sameCol = editable.filter((e) => e.c === cur.c);
      const pos = sameCol.findIndex((e) => e.key === fromKey);
      target = sameCol[pos + (dir === 'down' ? 1 : -1)];
    }
    if (!target && dir === 'down') target = editable[idx + 1];
    if (target) inputs.current[target.key]?.focus();
  }

  function exportCsv() {
    const esc = (v) => {
      const s = v == null ? '' : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.map((c) => (c.group ? `${c.group} ${c.label}` : c.label));
    const lines = [header.map(esc).join(',')];
    rows.forEach((_, r) => {
      lines.push(columns.map((__, c) => esc(evaluated[`${r}:${c}`]?.value)).join(','));
    });
    const blob = new Blob([`﻿${lines.join('\n')}`], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}${variant ? `-${variant}` : ''}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---- rendering --------------------------------------------------------
  const fmtCache = useRef({});
  function fmt(value, col) {
    if (typeof value !== 'number') return value ?? '';
    const d = col.decimals ?? 2;
    const k = `${lang}:${d}`;
    if (!fmtCache.current[k]) {
      fmtCache.current[k] = new Intl.NumberFormat(String(lang).startsWith('es') ? 'es-MX' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: d,
      });
    }
    return fmtCache.current[k].format(value);
  }

  const hasGroups = columns.some((c) => c.group);
  const groupHeader = [];
  if (hasGroups) {
    columns.forEach((col) => {
      const last = groupHeader[groupHeader.length - 1];
      if (col.group && last && last.group === col.group) last.span += 1;
      else groupHeader.push({group: col.group || null, span: 1, col});
    });
  }

  const okCount = checkable.filter((e) => isRight(e) === true).length;

  return (
    <div className={styles.wrap}>
      {title || methodList ? (
        <div className={styles.top}>
          {title ? <strong className={styles.title}>{title}</strong> : <span />}
          {methodList ? (
            <div className={styles.methods} role="tablist" aria-label={t.method}>
              <span className={styles.methodLabel}>{t.method}:</span>
              {methodList.map((m) => {
                const mm = String(m).toUpperCase();
                return (
                  <button
                    key={mm}
                    type="button"
                    role="tab"
                    aria-selected={mm === method}
                    className={mm === method ? styles.methodActive : styles.method}
                    onClick={() => setMethod(mm)}
                  >
                    {mm}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
      {instructions ? <p className={styles.instructions}>{instructions}</p> : null}
      {allowFormulas ? <p className={styles.help}>{t.formulaHelp}</p> : null}

      <div className={styles.scroller}>
        <table className={styles.grid}>
          <thead>
            {showRefs ? (
              <tr className={styles.refRow}>
                <th className={styles.corner} />
                {columns.map((col, c) => (
                  <th key={col.key} className={styles.refHead}>
                    {colLetter(c)}
                  </th>
                ))}
              </tr>
            ) : null}
            {hasGroups ? (
              <tr>
                {showRefs ? <th className={styles.corner} /> : null}
                {groupHeader.map((g, i) =>
                  g.group ? (
                    <th key={i} colSpan={g.span} className={styles.groupHead}>
                      {g.group}
                    </th>
                  ) : (
                    <th key={i} rowSpan={2} className={styles.head} style={g.col.width ? {minWidth: g.col.width} : undefined}>
                      {g.col.label}
                    </th>
                  ),
                )}
              </tr>
            ) : null}
            <tr>
              {showRefs && !hasGroups ? <th className={styles.corner} /> : null}
              {showRefs && hasGroups ? <th className={styles.corner} /> : null}
              {columns.map((col) =>
                hasGroups && !col.group ? null : (
                  <th key={col.key} className={styles.head} style={col.width ? {minWidth: col.width} : undefined}>
                    {col.label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={row._style === 'total' ? styles.totalRow : row._style === 'section' ? styles.sectionRow : undefined}>
                {showRefs ? <th className={styles.rowHead}>{r + 1}</th> : null}
                {columns.map((col, c) => {
                  const key = `${r}:${c}`;
                  const spec = row[col.key];
                  const ev = evaluated[key] || {};
                  const numeric = col.type !== 'text';
                  if (isAnswerCell(spec)) {
                    const mark = marks[key];
                    const raw = values[key] ?? '';
                    const showRaw = focused === key || !ev.formula;
                    const display = showRaw ? raw : ev.error ? '#ERR' : fmt(ev.value, col);
                    return (
                      <td
                        key={col.key}
                        className={[
                          styles.cell,
                          styles.inputCell,
                          mark === 'ok' ? styles.ok : '',
                          mark === 'bad' ? styles.bad : '',
                          mark === 'empty' ? styles.empty : '',
                          mark === 'hint' ? styles.hinted : '',
                        ].join(' ')}
                        title={ev.formula ? String(raw) : undefined}
                      >
                        <input
                          ref={(el) => (inputs.current[key] = el)}
                          className={[styles.input, numeric ? styles.num : ''].join(' ')}
                          value={display}
                          inputMode={numeric && !allowFormulas ? 'decimal' : 'text'}
                          aria-label={t.cellAria(`${colLetter(c)}${r + 1}`)}
                          aria-invalid={mark === 'bad' || ev.error ? true : undefined}
                          autoComplete="off"
                          spellCheck={false}
                          onFocus={() => setFocused(key)}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => update(key, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                              e.preventDefault();
                              moveFocus(key, 'down');
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              moveFocus(key, 'up');
                            }
                          }}
                        />
                        {ev.error && focused !== key ? <span className={styles.err}>{t.formulaError}</span> : null}
                      </td>
                    );
                  }
                  return (
                    <td
                      key={col.key}
                      className={[styles.cell, styles.given, numeric ? styles.num : '', isFormulaCell(spec) ? styles.computed : ''].join(' ')}
                      title={isFormulaCell(spec) ? spec.f : undefined}
                    >
                      {ev.error ? '#ERR' : fmt(ev.value, col)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.bar}>
        <button type="button" className={styles.primary} onClick={check}>
          {t.check}
        </button>
        <button type="button" className={styles.secondary} onClick={hint} disabled={revealed}>
          {t.hint}
        </button>
        <button type="button" className={styles.secondary} onClick={reveal}>
          {t.reveal}
        </button>
        <button type="button" className={styles.secondary} onClick={reset}>
          {t.reset}
        </button>
        <button type="button" className={styles.secondary} onClick={exportCsv}>
          {t.exportCsv}
        </button>
        <span className={styles.progress}>{t.progress(okCount, checkable.length)}</span>
      </div>
      {message ? <p className={message.ok ? styles.msgOk : styles.msgBad}>{message.text}</p> : null}
    </div>
  );
}

export {buildKardex, KARDEX_METHODS};
