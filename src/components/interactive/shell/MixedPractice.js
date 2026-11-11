import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import LinearProgress from '@site/src/components/ui/LinearProgress';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';
import MathText from '@site/src/components/ProblemSet/MathText';
import CEBlock from './CEBlock';
import PracticeModeContext from './PracticeModeContext';
import styles from './EquationWorksheet.module.css';
import { Solution, Step, Answer } from './SolutionKit';


/**
 * Generic 综合练习 runner: draws a weighted, balanced, interleaved set of
 * problems from several lessons and has the student type each answer.
 *
 * categories: [{ id, name, href, weight, pool: [eq(label, gen) | sim(label, Component)] }]
 *  - eq items: generator returning { prompt, steps, answer, fields? }. Without
 *    `fields`, unknowns are parsed from `answer` (`x = 3`, `y = -\\dfrac{2}{3}`).
 *  - sim items: an existing simulator rendered inside PracticeModeContext. It
 *    starts on a random problem and reports its answer fields through
 *    usePracticeAnswer / reportFields; the runner owns the reveal.
 *
 * Field shapes: { name, label?, value }                    — number
 *               { name, label?, type: 'choice', options, value }
 *               { name, label?, type: 'ineq', value: { op, bound } }       — x op bound
 *               { name, label?, type: 'range', value: { lo, loIncl, hi, hiIncl } | 'none' }
 *               { name, label?, type: 'dms', value: totalSeconds, seconds? }  — 度分秒 boxes
 * Helpers that build these from a simulator's own values live in shell/practiceFields.js.
 */

export const eq = (label, gen) => ({ kind: 'eq', label, gen });
export const sim = (label, Component) => ({ kind: 'sim', label, Component });

const COUNT_OPTIONS = [5, 10, 15];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split `count` across categories by weight (largest remainder, random tie-break). */
function allocate(categories, count) {
  const total = categories.reduce((s, c) => s + c.weight, 0);
  const raw = categories.map((c) => (count * c.weight) / total);
  const alloc = raw.map(Math.floor);
  let left = count - alloc.reduce((s, n) => s + n, 0);
  const order = shuffle(categories.map((_, i) => i)).sort(
    (i, j) => raw[j] - alloc[j] - (raw[i] - alloc[i]),
  );
  for (let k = 0; left > 0; k++, left--) alloc[order[k % order.length]] += 1;
  return alloc;
}

/** Order so the same category never appears twice in a row when avoidable. */
function interleave(items) {
  let best = shuffle(items);
  const adj = (list) => list.filter((it, i) => i > 0 && list[i - 1].catId === it.catId).length;
  for (let t = 0; t < 40 && adj(best) > 0; t++) {
    const next = shuffle(items);
    if (adj(next) < adj(best)) best = next;
  }
  return best;
}

let seq = 0;
function buildRun(categories, count) {
  const alloc = allocate(categories, count);
  const items = [];
  categories.forEach((cat, ci) => {
    const picks = [];
    while (picks.length < alloc[ci]) picks.push(...shuffle(cat.pool));
    picks.slice(0, alloc[ci]).forEach((entry) => {
      seq += 1;
      items.push({
        key: `p${seq}`,
        catId: cat.id,
        catName: cat.name,
        ...entry,
        // Generators that support it get an integer ("nice") answer most of the time.
        problem: entry.kind === 'eq' ? entry.gen({ requireNiceAnswer: Math.random() < 0.6 }) : null,
      });
    });
  });
  return interleave(items);
}

function CountPicker({ value, onChange }) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, v) => v != null && onChange(v)}
    >
      {COUNT_OPTIONS.map((n) => (
        <ToggleButton key={n} value={n}>
          {n} 题
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/* ---------- answer parsing / checking ---------- */

/** Pull `x = 3`, `y = -\dfrac{2}{3}` … out of a generator's TeX answer string. */
function parseTexAnswer(tex) {
  const re = /([a-z])\s*=\s*(-?)\s*(?:\\d?frac\{(-?\d+)\}\{(\d+)\}|(\d+(?:\.\d+)?))/g;
  const fields = [];
  let mt;
  while ((mt = re.exec(tex || ''))) {
    const sign = mt[2] ? -1 : 1;
    const value = mt[5] != null ? Number(mt[5]) : Number(mt[3]) / Number(mt[4]);
    if (!fields.some((f) => f.name === mt[1])) fields.push({ name: mt[1], value: sign * value });
  }
  return fields;
}

/** Student input → number. Accepts 3, -2, 2.5, 5/2, -3/4, "x=3"; null if empty, NaN if unreadable. */
function parseInput(raw) {
  let t = String(raw || '')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, '')
    .replace(/[−–—﹣－]/g, '-')
    .replace(/[／]/g, '/')
    .replace(/[．。]/g, '.');
  if (!t) return null;
  t = t.replace(/^[a-zA-Z]=/, '');
  let mt = /^([+-]?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t);
  if (mt) {
    const den = Number(mt[3]);
    if (den === 0) return NaN;
    return (mt[1] === '-' ? -1 : 1) * (Number(mt[2]) / den);
  }
  mt = /^[+-]?(\d+\.?\d*|\.\d+)$/.exec(t);
  return mt ? Number(t) : NaN;
}

function sameNumber(a, b) {
  return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
}

const OPS = ['<', '≤', '>', '≥'];
const normOp = (op) => ({ '<=': '≤', '>=': '≥', '⩽': '≤', '⩾': '≥' })[op] || op;

/**
 * Number box → 'ok' | 'bad' | 'empty' | 'invalid'. Blank allowed (= no bound) when allowBlank.
 * Accepts: the exact value (fractions welcome); a decimal with ≥ 2 places that equals
 * the value rounded to that many places (11.11 for 100/9); anything within `tol`
 * (for answers the simulator itself only knows rounded).
 */
function gradeNumber(raw, expected, allowBlank = false, tol = 0) {
  const n = parseInput(raw);
  if (n === null) return allowBlank && expected == null ? 'ok' : allowBlank ? 'bad' : 'empty';
  if (Number.isNaN(n)) return 'invalid';
  if (expected == null) return 'bad';
  const v = Number(expected);
  if (sameNumber(n, v) || Math.abs(n - v) <= tol) return 'ok';
  const places = (/\.(\d+)/.exec(String(raw)) || [, ''])[1].length;
  if (places >= 2 && Math.abs(n - v) <= 0.5 * 10 ** -places + tol + 1e-9) return 'ok';
  return 'bad';
}

/**
 * Grade one field against what the student entered.
 *  number: raw string · choice: option string · ineq: { op, bound } ·
 *  range: { none, lo, loOp, hi, hiOp } (blank lo / hi = unbounded on that side)
 */
function gradeField(f, raw) {
  if (f.type === 'choice') return raw == null ? 'empty' : raw === f.value ? 'ok' : 'bad';
  if (f.type === 'ineq') {
    const v = raw || {};
    if (!v.op) return 'empty';
    const b = gradeNumber(v.bound, f.value.bound);
    if (b !== 'ok') return b;
    return normOp(v.op) === normOp(f.value.op) ? 'ok' : 'bad';
  }
  if (f.type === 'range') {
    const v = raw || {};
    if (f.value === 'none') return v.none ? 'ok' : parseInput(v.lo) === null && parseInput(v.hi) === null ? 'empty' : 'bad';
    if (v.none) return 'bad';
    if (parseInput(v.lo) === null && parseInput(v.hi) === null) return 'empty';
    const lo = gradeNumber(v.lo, f.value.lo, true);
    const hi = gradeNumber(v.hi, f.value.hi, true);
    if (lo === 'invalid' || hi === 'invalid') return 'invalid';
    if (lo !== 'ok' || hi !== 'ok') return 'bad';
    const loOk = f.value.lo == null || (v.loOp || '<') === (f.value.loIncl ? '≤' : '<');
    const hiOk = f.value.hi == null || (v.hiOp || '<') === (f.value.hiIncl ? '≤' : '<');
    return loOk && hiOk ? 'ok' : 'bad';
  }
  if (f.type === 'dms') {
    // value: total seconds. Student fills ° ′ (″); blanks count as 0, but at least one box.
    const v = raw || {};
    const parts = ['d', 'm', 's'].map((k) => parseInput(v[k]));
    if (parts.every((n) => n === null)) return 'empty';
    if (parts.some((n) => Number.isNaN(n))) return 'invalid';
    const [d, m, s] = parts.map((n) => n || 0);
    if (m < 0 || s < 0 || m >= 60 || s >= 60) return 'bad'; // must be written in proper form
    const total = d * 3600 + m * 60 + s;
    return sameNumber(total, f.value) || Math.abs(total - f.value) <= (f.tol || 0) ? 'ok' : 'bad';
  }
  return gradeNumber(raw, f.value, false, f.tol || 0);
}

/* ---------- problem bodies ---------- */

function EquationItem({ item, showAnswer }) {
  const { problem } = item;
  return (
    <CEBlock title={item.label} subtitle="在纸上写出过程，把结果填在下面">
      <Box sx={{ fontSize: '1.05em' }}>
        <MathText text={problem.prompt} />
      </Box>
      {showAnswer ? (
        <Box
          className={styles.solution}
          sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}
        >
          <Solution>
            <Step b="解" kind="solve">
              {problem.steps.map((step, i) => (
                <Box key={i} sx={{ mb: 0.5 }}>
                  <MathText text={step} />
                </Box>
              ))}
            </Step>
            <Step b="答" kind="answer">
              <Answer>
                <MathText text={problem.answer} />
              </Answer>
            </Step>
          </Solution>
        </Box>
      ) : null}
    </CEBlock>
  );
}

function SimItem({ item, showAnswer, reportFields }) {
  const ctx = useMemo(() => ({ showAnswer, reportFields }), [showAnswer, reportFields]);
  const { Component } = item;
  return (
    <PracticeModeContext.Provider value={ctx}>
      <Component />
    </PracticeModeContext.Provider>
  );
}

const GOOD = 'var(--ifm-color-success, #2e7d32)';
const BAD = 'var(--ifm-color-danger, #d32f2f)';

const inputStyle = (state) => ({
  width: 120,
  padding: '6px 10px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  borderRadius: 6,
  border: `1.5px solid ${
    state === 'ok' ? GOOD : state === 'bad' ? BAD : 'var(--ifm-color-emphasis-400)'
  }`,
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  outline: 'none',
});

function MarkIcon({ mark }) {
  return (
    <Box component="span" sx={{ color: mark === 'ok' ? GOOD : BAD, fontWeight: 700, minWidth: 14 }}>
      {mark === 'ok' ? '✓' : mark === 'bad' ? '✗' : ''}
    </Box>
  );
}

function NumberBox({ id, value, mark, locked, inputRef, onChange, onEnter, width, placeholder = '如 3、-2、5/2' }) {
  return (
    <input
      id={id}
      ref={inputRef}
      type="text"
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      value={value ?? ''}
      disabled={locked}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onEnter();
        }
      }}
      style={{ ...inputStyle(mark), ...(width ? { width } : null) }}
    />
  );
}

function OpPicker({ ops, value, locked, onChange }) {
  return (
    <ToggleButtonGroup exclusive size="small" value={value ?? null} onChange={(_, v) => !locked && v != null && onChange(v)}>
      {ops.map((o) => (
        <ToggleButton key={o} value={o} disabled={locked} sx={{ minWidth: 34, fontSize: '1.05em' }}>
          {o}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function FieldLabel({ field, htmlFor }) {
  if (!field.label) return null;
  return (
    <Box component="label" htmlFor={htmlFor} sx={{ color: 'text.secondary', fontSize: '0.92em', mr: 0.25 }}>
      <MathText text={field.label} />
    </Box>
  );
}

/** One answer field: number box, choice buttons, `x [op] [bound]`, or `[lo] [op] x [op] [hi]` / 无解. */
function FieldInput({ field: f, value, mark, locked, inputRef, onChange, onEnter }) {
  const id = `ans-${f.name}`;
  const varTex = `$${f.display || 'x'}$`;
  const common = { locked, onEnter };

  if (f.type === 'choice') {
    return (
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <FieldLabel field={f} />
        <OpPicker ops={f.options} value={value} locked={locked} onChange={onChange} />
        <MarkIcon mark={mark} />
      </Stack>
    );
  }

  if (f.type === 'ineq') {
    const v = value || {};
    return (
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <FieldLabel field={f} htmlFor={id} />
        <MathText text={varTex} />
        <OpPicker ops={OPS} value={v.op} locked={locked} onChange={(op) => onChange({ ...v, op })} />
        <NumberBox
          id={id}
          {...common}
          inputRef={inputRef}
          width={96}
          mark={mark}
          value={v.bound}
          onChange={(bound) => onChange({ ...v, bound })}
        />
        <MarkIcon mark={mark} />
      </Stack>
    );
  }

  if (f.type === 'dms') {
    const v = value || {};
    const units = f.seconds ? ['d', 'm', 's'] : ['d', 'm'];
    const sym = { d: '°', m: '′', s: '″' };
    return (
      <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <FieldLabel field={f} htmlFor={`${id}-d`} />
        {units.map((u, k) => (
          <React.Fragment key={u}>
            <NumberBox
              id={`${id}-${u}`}
              {...common}
              inputRef={k === 0 ? inputRef : undefined}
              width={u === 'd' ? 64 : 52}
              mark={mark}
              placeholder=""
              value={v[u]}
              onChange={(x) => onChange({ ...v, [u]: x })}
            />
            <Box component="span" sx={{ fontSize: '1.15em', mr: 0.5 }}>
              {sym[u]}
            </Box>
          </React.Fragment>
        ))}
        <MarkIcon mark={mark} />
      </Stack>
    );
  }

  if (f.type === 'range') {
    const v = value || {};
    const set = (patch) => onChange({ ...v, ...patch });
    return (
      <Box>
        <FieldLabel field={f} htmlFor={id} />
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: f.label ? 0.5 : 0 }}>
          <NumberBox
            id={id}
            {...common}
            inputRef={inputRef}
            width={80}
            mark={v.none ? undefined : mark}
            placeholder="下界"
            value={v.lo}
            onChange={(lo) => set({ lo, none: false })}
          />
          <OpPicker ops={['<', '≤']} value={v.loOp || '<'} locked={locked} onChange={(loOp) => set({ loOp })} />
          <MathText text={varTex} />
          <OpPicker ops={['<', '≤']} value={v.hiOp || '<'} locked={locked} onChange={(hiOp) => set({ hiOp })} />
          <NumberBox
            {...common}
            width={80}
            mark={v.none ? undefined : mark}
            placeholder="上界"
            value={v.hi}
            onChange={(hi) => set({ hi, none: false })}
          />
          <Typography component="span" variant="body2" color="text.secondary">
            或
          </Typography>
          <ToggleButton
            value="none"
            size="small"
            selected={Boolean(v.none)}
            disabled={locked}
            onClick={() => set({ none: !v.none })}
          >
            无解
          </ToggleButton>
          <MarkIcon mark={mark} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          只有一边有界时，另一边留空（如 x ≥ 2：下界填 2、选 ≤，上界空着）。
        </Typography>
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap>
      <Box component="label" htmlFor={id} sx={{ whiteSpace: 'nowrap' }}>
        {f.label ? (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            <MathText text={f.label} />
          </Typography>
        ) : null}
        <MathText text={`$${f.display || f.name}$`} /> =
      </Box>
      <NumberBox id={id} {...common} inputRef={inputRef} mark={mark} value={value} onChange={onChange} />
      <MarkIcon mark={mark} />
    </Stack>
  );
}

/**
 * Typed answer inputs for one problem — one control per field (see FieldInput).
 * 「检查」 marks each field; wrong answers can be retried or given up on with 「看解答」.
 */
function AnswerPanel({ fields, isLast, onReveal, onFinish, onError }) {
  const [values, setValues] = useState({});
  const [marks, setMarks] = useState({}); // name -> 'ok' | 'bad' | 'empty' | 'invalid'
  const [status, setStatus] = useState('answering'); // answering | correct | gaveup
  const [attempts, setAttempts] = useState(0);
  const firstInput = useRef(null);
  const nextBtn = useRef(null);

  useEffect(() => {
    if (firstInput.current) firstInput.current.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (status !== 'answering' && nextBtn.current) nextBtn.current.focus({ preventScroll: true });
  }, [status]);

  const locked = status !== 'answering';
  const setValue = (name, v) => {
    setValues((old) => ({ ...old, [name]: v }));
    setMarks((old) => ({ ...old, [name]: undefined }));
  };

  const check = () => {
    const next = {};
    fields.forEach((f) => {
      next[f.name] = gradeField(f, values[f.name]);
    });
    setMarks(next);
    const states = Object.values(next);
    if (states.some((st) => st === 'empty' || st === 'invalid')) return; // not a real attempt yet
    const tries = attempts + 1;
    setAttempts(tries);
    if (states.every((st) => st === 'ok')) {
      setStatus('correct');
      onReveal();
    } else {
      onError(); // a wrong 检查 restarts the error-free timer
    }
  };

  const giveUp = () => {
    setStatus('gaveup');
    onError();
    onReveal();
  };

  const finish = () => onFinish({ ok: status === 'correct', attempts });

  const anyBad = Object.values(marks).includes('bad');
  const anyEmpty = Object.values(marks).includes('empty');
  const anyInvalid = Object.values(marks).includes('invalid');

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'action.hover',
      }}
    >
      <Stack
        direction={fields.length > 3 || fields.some((f) => f.type === 'range') ? 'column' : 'row'}
        spacing={fields.length > 3 ? 1.25 : 2}
        alignItems={fields.length > 3 ? 'flex-start' : 'center'}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1.25 }}
      >
        {fields.map((f, i) => (
          <FieldInput
            key={f.name}
            field={f}
            value={values[f.name]}
            mark={marks[f.name]}
            locked={locked}
            inputRef={i === 0 ? firstInput : undefined}
            onChange={(v) => setValue(f.name, v)}
            onEnter={() => !locked && check()}
          />
        ))}
      </Stack>

      {status === 'answering' ? (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button variant="contained" onClick={check}>
            检查
          </Button>
          <Typography variant="body2" sx={{ color: anyBad ? BAD : 'text.secondary', flex: '1 1 200px' }}>
            {anyInvalid
              ? '看不懂这个数——请填整数、小数或分数（如 5/2）。'
              : anyEmpty
                ? '每一空都要填。'
                : anyBad
                  ? `有 ${Object.values(marks).filter((m) => m === 'bad').length} 个不对，改一改再检查（第 ${attempts} 次）。`
                  : '分数可以写成 5/2，按回车也能检查。'}
          </Typography>
          {/* Always available, but looking costs the question and the streak. */}
          <Button
            variant="outlined"
            onClick={giveUp}
            title="看完整讲解。本题算错，连对次数清零。"
            sx={{ ml: 'auto', color: BAD, borderColor: BAD }}
          >
            💡 看讲解
            <Box component="span" sx={{ fontSize: '0.8em', ml: 0.5, opacity: 0.85 }}>
              （算错·连对清零）
            </Box>
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {status === 'correct' || attempts > 0 ? (
            <Typography sx={{ fontWeight: 700, color: status === 'correct' ? GOOD : BAD }}>
              {status === 'correct'
                ? attempts === 1
                  ? '✓ 全对！'
                  : `✓ 做对了（第 ${attempts} 次）`
                : '✗ 本题算错，连对清零——对照下面的解答找出错在哪一步。'}
            </Typography>
          ) : null}
          <button
            ref={nextBtn}
            type="button"
            onClick={finish}
            className="button button--primary button--sm"
          >
            {isLast ? '看本组结果' : '下一题 →'}
          </button>
        </Stack>
      )}
    </Box>
  );
}

/** 65000 ms → "1:05"; an hour or more → "1:02:03". */
function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Time since the set started or the last error (wrong 检查 / 看讲解). Ticks every
 * second; frozen at `stopAt` once the set is finished. Flashes red right after a reset.
 */
function ErrorFreeTimer({ since, stopAt, flashAt }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (stopAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since, stopAt]);
  const end = stopAt || now;
  const flashing = flashAt && end - flashAt < 1500 && !stopAt;
  return (
    <Box
      role="timer"
      title="从开始（或上一次出错）到现在的时间。答错或看讲解会从 0 重新计时。"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 999,
        fontSize: '0.85em',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: flashing ? BAD : 'text.primary',
        border: '1px solid',
        borderColor: flashing ? BAD : 'divider',
        transition: 'color 0.3s, border-color 0.3s',
        minWidth: 92,
        textAlign: 'center',
      }}
    >
      ⏱ 无错 {formatDuration(end - since)}
    </Box>
  );
}

/** Consecutive correct answers ending at the latest result (a wrong one / 看讲解 resets it). */
function currentStreak(results) {
  let n = 0;
  for (let i = results.length - 1; i >= 0 && results[i].ok; i--) n++;
  return n;
}

function bestStreak(results) {
  let best = 0;
  let run = 0;
  results.forEach((r) => {
    run = r.ok ? run + 1 : 0;
    best = Math.max(best, run);
  });
  return best;
}

function Summary({ categories, items, results, count, onCount, onRestart, bestClean = 0 }) {
  const correct = results.filter((r) => r.ok).length;
  const firstTry = results.filter((r) => r.ok && r.attempts === 1).length;
  const explained = results.filter((r) => !r.ok && r.attempts === 0).length;
  const best = bestStreak(results);
  const byCat = categories.map((cat) => {
    const idx = items.map((it, i) => (it.catId === cat.id ? i : -1)).filter((i) => i >= 0);
    return { cat, total: idx.length, right: idx.filter((i) => results[i] && results[i].ok).length };
  }).filter((r) => r.total > 0);
  const weak = byCat.filter((r) => r.right < r.total);

  return (
    <CEBlock title="本组完成" subtitle="按课分类的结果">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {correct} / {items.length} 题做对
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        其中 {firstTry} 题一次就对，最长连对 {best} 题，最长无错 {formatDuration(bestClean)}{explained ? `，看了 ${explained} 次讲解` : ''}。
      </Typography>

      <Box sx={{ display: 'grid', gap: 0.75, mb: 2 }}>
        {byCat.map(({ cat, total, right }) => (
          <Stack key={cat.id} direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 110, flexShrink: 0, fontSize: '0.9em' }}>{cat.name}</Box>
            <LinearProgress variant="determinate" value={(right / total) * 100} sx={{ flex: 1 }} />
            <Box sx={{ width: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.9em' }}>
              {right}/{total}
            </Box>
          </Stack>
        ))}
      </Box>

      <Box component="ol" sx={{ pl: 3, mb: 2, fontSize: '0.9em' }}>
        {items.map((it, i) => {
          const r = results[i];
          return (
            <li key={it.key}>
              <Box component="span" sx={{ color: r.ok ? GOOD : BAD, fontWeight: 700, mr: 0.75 }}>
                {r.ok ? '✓' : '✗'}
              </Box>
              {it.catName} · {it.label}
              {r.ok && r.attempts > 1 ? (
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.75 }}>
                  （第 {r.attempts} 次对）
                </Box>
              ) : null}
              {!r.ok && r.attempts === 0 ? (
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.75 }}>
                  （看了讲解）
                </Box>
              ) : null}
            </li>
          );
        })}
      </Box>

      {weak.length > 0 ? (
        <Typography variant="body2" sx={{ mb: 2 }}>
          建议回看：
          {weak.map(({ cat }, i) => (
            <React.Fragment key={cat.id}>
              {i > 0 ? '、' : ''}
              <Link to={cat.href}>{cat.name}</Link>
            </React.Fragment>
          ))}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ mb: 2 }}>
          全部做对。可以换一组，或者把题量调到 15 题。
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <CountPicker value={count} onChange={onCount} />
        <Button variant="contained" onClick={onRestart}>
          再来一组
        </Button>
      </Stack>
    </CEBlock>
  );
}

/**
 * `children` (optional): the page's how-to / intro text. It is hidden behind a
 * round「?」button in the header so the practice itself stays front and centre.
 */
export default function MixedPractice({ categories, defaultCount = 10, anchorId = 'mixed-practice-top', children }) {
  const [showHelp, setShowHelp] = useState(false);
  const [count, setCount] = useState(defaultCount);
  const [items, setItems] = useState(() => buildRun(categories, defaultCount));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  // Answer fields reported by an embedded simulator, tagged with the item they belong to.
  const [simFields, setSimFields] = useState({ key: null, fields: null });
  // Error-free timer: `since` = set start or last error; `best` = longest error-free stretch so far.
  const [clock, setClock] = useState(() => ({ since: Date.now(), best: 0, flashAt: 0, stopAt: 0 }));
  const markError = useCallback(() => {
    setClock((c) => {
      if (c.stopAt) return c;
      const now = Date.now();
      return { ...c, since: now, best: Math.max(c.best, now - c.since), flashAt: now };
    });
  }, []);

  const done = index >= items.length;
  const item = items[index];

  const itemKey = item ? item.key : null;
  const reportFields = useCallback(
    (fields) => setSimFields({ key: itemKey, fields }),
    [itemKey],
  );

  const fields = useMemo(() => {
    if (!item) return null;
    if (item.kind === 'eq') return item.problem.fields || parseTexAnswer(item.problem.answer);
    return simFields.key === item.key ? simFields.fields : null;
  }, [item, simFields]);

  const restart = (n = count) => {
    setItems(buildRun(categories, n));
    setIndex(0);
    setResults([]);
    setShowAnswer(false);
    setClock({ since: Date.now(), best: 0, flashAt: 0, stopAt: 0 });
  };

  const changeCount = (n) => {
    if (n === count) return;
    const midRun = results.length > 0 && results.length < items.length;
    if (midRun && typeof window !== 'undefined' && !window.confirm(`换成 ${n} 题会重新开始，当前进度不保留。继续吗？`)) {
      return;
    }
    setCount(n);
    restart(n);
  };

  const finish = (result) => {
    if (index + 1 >= items.length) {
      // Set finished: freeze the timer and count the final stretch toward the best.
      setClock((c) => {
        const now = Date.now();
        return { ...c, stopAt: now, best: Math.max(c.best, now - c.since) };
      });
    }
    setResults((r) => [...r, result]);
    setShowAnswer(false);
    setIndex((i) => i + 1);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const correct = results.filter((r) => r.ok).length;
  const streak = currentStreak(results);

  return (
    <Box id={anchorId} sx={{ my: 2, scrollMarginTop: 80 }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1 }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {done ? `已完成 ${items.length} 题` : `第 ${index + 1} / ${items.length} 题`}
          {!done && item ? (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {item.catName}
            </Typography>
          ) : null}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" color="text.secondary">
            已对 {correct} / {results.length}
          </Typography>
          <Box
            title="连续答对的题数。答错或看讲解会清零。"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 999,
              fontSize: '0.85em',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: streak > 0 ? GOOD : 'text.secondary',
              border: '1px solid',
              borderColor: streak > 0 ? GOOD : 'divider',
            }}
          >
            连对 {streak}{streak >= 3 ? ' 🔥' : ''}
          </Box>
          <ErrorFreeTimer since={clock.since} stopAt={clock.stopAt} flashAt={clock.flashAt} />
          <CountPicker value={count} onChange={changeCount} />
          {children ? (
            <Box
              component="button"
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-expanded={showHelp}
              aria-controls={`${anchorId}-help`}
              aria-label="说明：题目来源和作答方法"
              title="说明：题目来源和作答方法"
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1.5px solid',
                borderColor: showHelp ? 'primary.main' : 'divider',
                backgroundColor: showHelp ? 'primary.main' : 'transparent',
                color: showHelp ? '#fff' : 'text.secondary',
                fontWeight: 700,
                fontSize: '0.95rem',
                lineHeight: 1,
                cursor: 'pointer',
                p: 0,
              }}
            >
              ?
            </Box>
          ) : null}
        </Stack>
      </Stack>

      {children && showHelp ? (
        <Box
          id={`${anchorId}-help`}
          sx={{
            position: 'relative',
            mb: 1.5,
            px: 2,
            pt: 1.5,
            pb: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'action.hover',
            fontSize: '0.95em',
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => setShowHelp(false)}
            aria-label="关闭说明"
            sx={{
              position: 'absolute',
              top: 6,
              right: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'text.secondary',
              fontSize: '1.1rem',
            }}
          >
            ×
          </Box>
          {children}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', gap: '3px', mb: 1 }} aria-hidden>
        {items.map((it, i) => (
          <Box
            key={it.key}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor:
                i < results.length
                  ? results[i].ok
                    ? GOOD
                    : BAD
                  : i === index
                    ? 'var(--ifm-color-primary)'
                    : 'var(--ifm-color-emphasis-300)',
            }}
          />
        ))}
      </Box>

      {done ? (
        <Summary
          categories={categories}
          bestClean={clock.best}
          items={items}
          results={results}
          count={count}
          onCount={changeCount}
          onRestart={() => restart(count)}
        />
      ) : (
        <>
          {item.kind === 'eq' ? (
            <EquationItem key={`${item.key}-body`} item={item} showAnswer={showAnswer} />
          ) : (
            <SimItem key={`${item.key}-body`} item={item} showAnswer={showAnswer} reportFields={reportFields} />
          )}

          {fields && fields.length > 0 ? (
            <AnswerPanel
              key={`${item.key}-answer`}
              fields={fields}
              isLast={index === items.length - 1}
              onReveal={() => setShowAnswer(true)}
              onFinish={finish}
              onError={markError}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              正在载入答题框…
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
