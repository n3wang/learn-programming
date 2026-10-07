/**
 * Tiny, safe spreadsheet formula evaluator (no eval).
 *
 * Grammar:  =expr
 *   expr   := term (('+'|'-') term)*
 *   term   := factor (('*'|'/') factor)*
 *   factor := ('+'|'-') factor | number | ref | FUNC '(' args ')' | '(' expr ')'
 *   args   := arg (','|';' arg)*      arg := range | expr      range := ref ':' ref
 * Refs use A1 notation: column letter(s) = column index, number = 1-based data row.
 * Functions: SUM, SUMA, MIN, MAX, AVERAGE, PROMEDIO, ROUND, REDONDEAR, ABS.
 */

export function colLetter(index) {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function colIndex(letters) {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i += 1;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.,]/.test(src[j])) {
        // allow thousands commas only when followed by 3 digits (e.g. 150,000)
        if (src[j] === ',' && !/^[0-9]{3}(?![0-9])/.test(src.slice(j + 1))) break;
        j += 1;
      }
      tokens.push({t: 'num', v: Number(src.slice(i, j).replace(/,/g, ''))});
      i = j;
    } else if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z]/.test(src[j])) j += 1;
      const letters = src.slice(i, j);
      let k = j;
      while (k < src.length && /[0-9]/.test(src[k])) k += 1;
      if (k > j) {
        tokens.push({t: 'ref', col: colIndex(letters), row: Number(src.slice(j, k)) - 1, raw: src.slice(i, k)});
        i = k;
      } else {
        tokens.push({t: 'fn', v: letters.toUpperCase()});
        i = j;
      }
    } else if ('+-*/(),;:'.includes(ch)) {
      tokens.push({t: 'op', v: ch === ';' ? ',' : ch});
      i += 1;
    } else if (ch === '$') {
      i += 1; // ignore currency / absolute-ref markers
    } else {
      throw new Error(`Carácter no válido: ${ch}`);
    }
  }
  return tokens;
}

const FUNCS = {
  SUM: (xs) => xs.reduce((a, b) => a + b, 0),
  MIN: (xs) => Math.min(...xs),
  MAX: (xs) => Math.max(...xs),
  AVERAGE: (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0),
  ROUND: (xs) => {
    const f = 10 ** (xs[1] || 0);
    return Math.round(xs[0] * f) / f;
  },
  ABS: (xs) => Math.abs(xs[0]),
};
FUNCS.SUMA = FUNCS.SUM;
FUNCS.PROMEDIO = FUNCS.AVERAGE;
FUNCS.REDONDEAR = FUNCS.ROUND;

/**
 * Evaluate a formula string (with or without leading "=").
 * `getCell(row, col)` must return a number (text cells → 0).
 */
export function evaluateFormula(formula, getCell) {
  const src = String(formula).trim().replace(/^=/, '');
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (v) => {
    const tok = next();
    if (!tok || tok.v !== v) throw new Error(`Se esperaba “${v}”`);
  };

  function rangeValues(a, b) {
    const out = [];
    for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r += 1) {
      for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c += 1) out.push(getCell(r, c));
    }
    return out;
  }

  function arg() {
    const tok = peek();
    if (tok && tok.t === 'ref' && tokens[pos + 1] && tokens[pos + 1].v === ':') {
      next();
      next();
      const end = next();
      if (!end || end.t !== 'ref') throw new Error('Rango no válido');
      return rangeValues(tok, end);
    }
    return [expr()];
  }

  function factor() {
    const tok = next();
    if (!tok) throw new Error('Fórmula incompleta');
    if (tok.t === 'op' && (tok.v === '-' || tok.v === '+')) {
      const v = factor();
      return tok.v === '-' ? -v : v;
    }
    if (tok.t === 'num') return tok.v;
    if (tok.t === 'ref') return getCell(tok.row, tok.col);
    if (tok.t === 'fn') {
      const fn = FUNCS[tok.v];
      if (!fn) throw new Error(`Función desconocida: ${tok.v}`);
      expect('(');
      let values = [];
      if (!(peek() && peek().v === ')')) {
        values = values.concat(arg());
        while (peek() && peek().v === ',') {
          next();
          values = values.concat(arg());
        }
      }
      expect(')');
      return fn(values);
    }
    if (tok.t === 'op' && tok.v === '(') {
      const v = expr();
      expect(')');
      return v;
    }
    throw new Error(`Símbolo inesperado: ${tok.v ?? tok.raw}`);
  }

  function term() {
    let v = factor();
    while (peek() && (peek().v === '*' || peek().v === '/')) {
      const op = next().v;
      const rhs = factor();
      v = op === '*' ? v * rhs : v / rhs;
    }
    return v;
  }

  function expr() {
    let v = term();
    while (peek() && (peek().v === '+' || peek().v === '-')) {
      const op = next().v;
      const rhs = term();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  const result = expr();
  if (pos < tokens.length) throw new Error('Sobran símbolos en la fórmula');
  if (!Number.isFinite(result)) throw new Error('Resultado no numérico');
  return result;
}

/** Parse a typed number: "150,000", "$1 600.50", "(45,000)" → number; NaN if not numeric. */
export function parseTypedNumber(raw) {
  let s = String(raw ?? '').trim();
  if (!s) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[$\s]/g, '').replace(/,(?=\d{3}(\D|$))/g, '');
  if (!/^[-+]?\d*\.?\d+$/.test(s)) return NaN;
  const n = Number(s);
  return neg ? -n : n;
}
