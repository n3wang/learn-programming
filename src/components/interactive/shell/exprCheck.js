/**
 * Tiny safe expression parser / checker for typed algebra answers
 * (整式、分式、二次根式). No eval: tokens → AST → numeric evaluation.
 *
 * Accepts what students type: x^2+5x+6, x²-4, (x+2)(x-3), 2a^3b^2, 3√2, √(12),
 * sqrt(3), 1/(x+1), a·b, 3×2, −x. Variables are single letters; juxtaposition
 * means multiplication.
 *
 * exprEqual(student, expected, { vars, positive, form }) compares by evaluating
 * both at several sample points. `form`:
 *   'factored'  — top level must be a product, with at least as many non-constant
 *                 factors as the expected answer (so a(x+2)(x-2) ≠ a(x²-4));
 *   'expanded'  — no product or power of a sum (so (x+1)² is not accepted);
 *   'radical'   — every √n with a numeric n is simplest (no square factor) and no √ in a denominator.
 */

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

function normalize(raw) {
  return String(raw || '')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[−–—﹣－]/g, '-')
    .replace(/[＋]/g, '+')
    .replace(/[×·∙⋅*＊]/g, '*')
    .replace(/[÷／]/g, '/')
    .replace(/[．。]/g, '.')
    .replace(/\*\*/g, '^')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (s) => `^${[...s].map((c) => SUP[c]).join('')}`)
    .replace(/sqrt/gi, '√')
    .replace(/\s+/g, '');
}

function tokenize(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const n = Number(s.slice(i, j));
      if (Number.isNaN(n)) throw new Error('bad number');
      out.push({ t: 'num', v: n });
      i = j;
    } else if (/[a-zA-Z]/.test(c)) {
      out.push({ t: 'var', v: c });
      i++;
    } else if ('+-*/^()√'.includes(c)) {
      out.push({ t: c });
      i++;
    } else throw new Error(`bad char ${c}`);
  }
  return out;
}

/* Grammar (implicit multiplication binds like *):
 *   sum   := term (('+'|'-') term)*
 *   term  := unary (('*'|'/'|<implicit>) unary)*
 *   unary := '-' unary | '+' unary | power
 *   power := atom ('^' unary)?
 *   atom  := num | var | '(' sum ')' | '√' atom
 */
function parseTokens(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = (t) => {
    if (!tokens[p] || tokens[p].t !== t) throw new Error(`expected ${t}`);
    p++;
  };
  const startsAtom = (tk) => tk && (tk.t === 'num' || tk.t === 'var' || tk.t === '(' || tk.t === '√');

  function sum() {
    let node = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = peek().t;
      p++;
      const rhs = term();
      node = { k: 'add', a: node, b: op === '-' ? { k: 'neg', a: rhs } : rhs };
    }
    return node;
  }
  function term() {
    let node = unary();
    for (;;) {
      const tk = peek();
      if (tk && (tk.t === '*' || tk.t === '/')) {
        p++;
        const rhs = unary();
        node = tk.t === '*' ? { k: 'mul', a: node, b: rhs } : { k: 'div', a: node, b: rhs };
      } else if (startsAtom(tk)) {
        node = { k: 'mul', a: node, b: power() };
      } else return node;
    }
  }
  function unary() {
    const tk = peek();
    if (tk && tk.t === '-') {
      p++;
      return { k: 'neg', a: unary() };
    }
    if (tk && tk.t === '+') {
      p++;
      return unary();
    }
    return power();
  }
  function power() {
    const base = atom();
    if (peek() && peek().t === '^') {
      p++;
      return { k: 'pow', a: base, b: unary() };
    }
    return base;
  }
  function atom() {
    const tk = peek();
    if (!tk) throw new Error('unexpected end');
    if (tk.t === 'num') {
      p++;
      return { k: 'num', v: tk.v };
    }
    if (tk.t === 'var') {
      p++;
      return { k: 'var', v: tk.v };
    }
    if (tk.t === '(') {
      p++;
      const e = sum();
      eat(')');
      return e;
    }
    if (tk.t === '√') {
      p++;
      return { k: 'sqrt', a: power() };
    }
    throw new Error(`unexpected ${tk.t}`);
  }
  const ast = sum();
  if (p !== tokens.length) throw new Error('trailing input');
  return ast;
}

export function parseExpr(raw) {
  const s = normalize(raw);
  if (!s) return null;
  return parseTokens(tokenize(s));
}

export function evalAst(n, env) {
  switch (n.k) {
    case 'num':
      return n.v;
    case 'var':
      return n.v in env ? env[n.v] : NaN;
    case 'neg':
      return -evalAst(n.a, env);
    case 'add':
      return evalAst(n.a, env) + evalAst(n.b, env);
    case 'mul':
      return evalAst(n.a, env) * evalAst(n.b, env);
    case 'div':
      return evalAst(n.a, env) / evalAst(n.b, env);
    case 'pow':
      return evalAst(n.a, env) ** evalAst(n.b, env);
    case 'sqrt': {
      const v = evalAst(n.a, env);
      return v < 0 ? NaN : Math.sqrt(v);
    }
    default:
      return NaN;
  }
}

function varsOf(n, set = new Set()) {
  if (!n) return set;
  if (n.k === 'var') set.add(n.v);
  if (n.a) varsOf(n.a, set);
  if (n.b) varsOf(n.b, set);
  return set;
}

const isConst = (n) => varsOf(n).size === 0;

/** Flatten a top-level product (through unary minus) into its factors. */
function factorsOf(n) {
  if (n.k === 'neg') return factorsOf(n.a);
  if (n.k === 'mul') return [...factorsOf(n.a), ...factorsOf(n.b)];
  return [n];
}

const hasAdd = (n) => n.k === 'add' || (n.k === 'neg' && hasAdd(n.a));

/**
 * Number of non-constant factors, counted with multiplicity ((x+1)^2 counts 2, a^3 counts 3),
 * so 4(4y²+4y+1) (1 factor) is not accepted for 4(2y+1)² (2 factors). A bare sum counts as 1.
 */
export function factorCount(n) {
  if (hasAdd(n)) return 1;
  return factorsOf(n)
    .filter((f) => !isConst(f))
    .reduce((s, f) => s + (f.k === 'pow' && f.b.k === 'num' && Number.isInteger(f.b.v) && f.b.v > 0 ? f.b.v : 1), 0);
}

function isExpanded(n) {
  if (n.k === 'mul') {
    if (hasAdd(n.a) || hasAdd(n.b)) return false;
  }
  if (n.k === 'pow' && hasAdd(n.a)) return false;
  return (!n.a || isExpanded(n.a)) && (!n.b || isExpanded(n.b));
}

const termsOf = (n) => (n.k === 'add' ? [...termsOf(n.a), ...termsOf(n.b)] : [n]);

/** Signature of a fully simplified monomial ("a2b1"), or null if it is not one. */
function monoSig(term) {
  let t = term;
  while (t.k === 'neg') t = t.a;
  if (t.k === 'div' && isConst(t.b)) t = t.a;
  const exps = {};
  let consts = 0;
  for (const f of factorsOf(t)) {
    if (isConst(f) && (f.k === 'num' || f.k === 'div' || f.k === 'neg')) {
      consts++;
    } else if (f.k === 'var' || (f.k === 'pow' && f.a.k === 'var' && f.b.k === 'num')) {
      const v = f.k === 'var' ? f.v : f.a.v;
      if (exps[v]) return null; // a·a not combined
      exps[v] = f.k === 'var' ? 1 : f.b.v;
    } else return null;
  }
  if (consts > 1) return null;
  return Object.keys(exps)
    .sort()
    .map((v) => `${v}${exps[v]}`)
    .join('');
}

function isPolySimplified(n) {
  const sigs = termsOf(n).map(monoSig);
  if (sigs.some((s) => s === null)) return false;
  return new Set(sigs).size === sigs.length;
}

function squareFree(k) {
  if (!Number.isInteger(k) || k < 0) return true;
  for (let d = 2; d * d <= k; d++) if (k % (d * d) === 0) return false;
  return true;
}

function radicalSimplest(n, inDen = false) {
  if (n.k === 'sqrt') {
    if (inDen) return false;
    if (isConst(n.a)) {
      const v = evalAst(n.a, {});
      if (Number.isInteger(v) && !squareFree(v)) return false;
      if (!Number.isInteger(v)) return false; // √(1/2), √0.5 are not simplest
    }
  }
  if (n.k === 'div') return radicalSimplest(n.a, inDen) && radicalSimplest(n.b, true);
  return (!n.a || radicalSimplest(n.a, inDen)) && (!n.b || radicalSimplest(n.b, inDen));
}

const SAMPLES = [1.37, 2.61, -1.83, 0.71, 3.29, -2.47, 1.91];
const POS_SAMPLES = [1.37, 2.61, 0.53, 3.29, 1.91, 4.17, 0.83];

/**
 * → 'ok' | 'bad' | 'form' (right value, wrong form) | 'invalid' | 'empty'
 */
export function checkExpr(raw, expected, { vars, positive = false, form, finiteAt } = {}) {
  let st;
  try {
    st = parseExpr(raw);
  } catch {
    return 'invalid';
  }
  if (!st) return 'empty';
  const ex = parseExpr(expected);
  const names = vars || [...varsOf(ex)];
  const extra = [...varsOf(st)].filter((v) => !names.includes(v));
  if (extra.length) return 'bad';
  const samples = positive ? POS_SAMPLES : SAMPLES;
  let compared = 0;
  for (let s = 0; s < samples.length; s++) {
    const env = {};
    names.forEach((v, i) => {
      env[v] = samples[(s + 2 * i) % samples.length] + 0.13 * i;
    });
    const want = evalAst(ex, env);
    if (!Number.isFinite(want)) continue;
    const got = evalAst(st, env);
    if (!Number.isFinite(got)) return 'bad';
    if (Math.abs(got - want) > 1e-7 * Math.max(1, Math.abs(want))) return 'bad';
    compared++;
  }
  if (compared === 0) return 'bad';
  if (form === 'factored') {
    if (hasAdd(st) || factorCount(st) < factorCount(ex)) return 'form';
  } else if (form === 'expanded') {
    if (!isExpanded(st)) return 'form';
  } else if (form === 'poly') {
    if (!isExpanded(st) || !isPolySimplified(st)) return 'form';
  } else if (form === 'monomial') {
    if (termsOf(st).length !== 1 || monoSig(st) === null) return 'form';
  } else if (form === 'radical') {
    if (!radicalSimplest(st)) return 'form';
  }
  // 约分 must cancel the common factor: the answer has to be defined where it vanished.
  if (finiteAt && finiteAt.some((env) => !Number.isFinite(evalAst(st, env)))) return 'form';
  return 'ok';
}
