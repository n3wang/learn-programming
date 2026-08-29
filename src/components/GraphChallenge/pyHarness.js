/** Parse "a=(0, 1); b=(-1, 0)" into [{label, x, y}, ...]. */
export function parseHintPoints(hint) {
  if (!hint) return [];
  const labeled = [];
  const labelRe = /([a-z])\s*=\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/gi;
  let m;
  while ((m = labelRe.exec(hint)) !== null) {
    labeled.push({label: m[1].toLowerCase(), x: Number(m[2]), y: Number(m[3])});
  }
  if (labeled.length) return labeled;

  const bare = [];
  const bareRe = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;
  while ((m = bareRe.exec(hint)) !== null) {
    bare.push({x: Number(m[1]), y: Number(m[2])});
  }
  return bare.map((pt, i) => ({label: String.fromCharCode(97 + i), ...pt}));
}

function yLimitsPy(yMin, yMax, hintPoints = []) {
  const hintYs = hintPoints.map((p) => p.y);
  const hintYList = hintYs.length ? hintYs.join(', ') : '';
  return `
_ylo, _yhi = ${yMin}, ${yMax}
_hint_ys = [${hintYList}]
if _hint_ys:
    _ylo = min(_ylo, min(_hint_ys))
    _yhi = max(_yhi, max(_hint_ys))
_ypad = max(1, (_yhi - _ylo) * 0.18)
plt.ylim(_ylo - _ypad, _yhi + _ypad)
`;
}

function hintScatterPy(points) {
  if (!points.length) return '';
  const labels = points.map((p) => `"${p.label}"`).join(', ');
  const tuples = points.map((p) => `(${p.x}, ${p.y})`).join(', ');
  const xs = points.map((p) => p.x).join(', ');
  const ys = points.map((p) => p.y).join(', ');
  return `
hint_labels = [${labels}]
hint_points = [${tuples}]
hint_xs = [${xs}]
hint_ys = [${ys}]
plt.scatter(hint_xs, hint_ys, color="crimson", s=36, zorder=5, marker="s", clip_on=False)
for label, (hx, hy) in zip(hint_labels, hint_points):
    plt.annotate(label, (hx, hy), textcoords="offset points", xytext=(5, 5), fontsize=9, fontweight="bold", color="crimson", zorder=6, clip_on=False)
`;
}

/**
 * A standalone (no student code needed) plot of just the target curve — shown
 * once on load, before the student has run anything, so they know what shape
 * they're aiming for without being told what's wrong with their code.
 */
export function buildTargetOnlyHarness({targetBody, xMin, xMax, yMin, yMax, hintPoints = []}) {
  return `
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import base64
from io import BytesIO

def target(x):
${targetBody}

xs = list(range(${xMin}, ${xMax} + 1))
target_ys = [target(x) for x in xs]

plt.figure(figsize=(4.5, 3))
plt.plot(xs, target_ys, "--", color="gray", label="target")
plt.axhline(0, color="lightgray")
plt.axvline(0, color="lightgray")
${yLimitsPy(yMin, yMax, hintPoints)}${hintScatterPy(hintPoints)}plt.legend()
plt.tight_layout()

buf = BytesIO()
plt.savefig(buf, format="png", dpi=100)
print("PISTON_PNG:" + base64.b64encode(buf.getvalue()).decode())
`;
}

/**
 * The plotting/scoring code shown to students (read-only) below their editable
 * function, and appended to it before sending to Piston. Written to be genuinely
 * readable — this is real matplotlib code students can learn from, not just glue.
 */
export function buildHarness({functionName, targetBody, xMin, xMax, yMin, yMax, hintPoints = []}) {
  const yRange = Math.max(1, yMax - yMin);
  return `
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import base64, json
from io import BytesIO

def target(x):
${targetBody}

def safe(fn, x):
    try:
        return fn(x)
    except Exception:
        return None

xs = list(range(${xMin}, ${xMax} + 1))
target_ys = [safe(target, x) for x in xs]
your_ys = [safe(${functionName}, x) for x in xs]

plt.figure(figsize=(4.5, 3))
plt.plot(xs, [v if v is not None else float("nan") for v in target_ys], "--", color="gray", label="target")
plt.plot(xs, [v if v is not None else float("nan") for v in your_ys], "o-", color="royalblue", label="yours")
plt.axhline(0, color="lightgray")
plt.axvline(0, color="lightgray")
${yLimitsPy(yMin, yMax, hintPoints)}${hintScatterPy(hintPoints)}plt.legend()
plt.tight_layout()

buf = BytesIO()
plt.savefig(buf, format="png", dpi=100)
print("PISTON_PNG:" + base64.b64encode(buf.getvalue()).decode())

pairs = [(t, y) for t, y in zip(target_ys, your_ys) if t is not None]
exact = sum(1 for t, y in pairs if y is not None and round(t) == round(y))
closeness = sum(max(0, 1 - abs(t - y) / ${yRange}) for t, y in pairs if y is not None)
n = len(pairs)
print("SCORE:" + json.dumps({
    "exact": exact,
    "total": n,
    "shape": round(100 * exact / n) if n else 0,
    "overall": round(100 * closeness / n) if n else 0,
}))
`;
}
