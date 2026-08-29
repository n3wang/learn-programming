// Lines start at column 0 — callers indent them as needed for where they're
// spliced in (module level vs. inside an `if:` block).
function drawPy(kind, valuesVar, {ylabel, unit}) {
  const unitSuffix = unit ? String(unit) : '';
  if (kind === 'pie') {
    return [
      `ax.pie(${valuesVar}, labels=categories, autopct="%1.0f%%", startangle=90)`,
      `ax.axis("equal")`,
    ];
  }
  return [
    `bars = ax.bar(categories, ${valuesVar}, color=color)`,
    `ax.bar_label(bars, padding=3, fmt=lambda v: f"{v:.0f}${unitSuffix}")`,
    `ax.set_ylabel(${ylabel ? JSON.stringify(ylabel) : '""'})`,
    `_top = max(${valuesVar}) if ${valuesVar} else 1`,
    `ax.set_ylim(0, _top * 1.25 if _top > 0 else 1)`,
  ];
}

function indent(lines, spaces) {
  const pad = ' '.repeat(spaces);
  return lines.map((line) => pad + line).join('\n');
}

/**
 * A standalone plot of just the target bar/pie chart — shown once on load,
 * before the student has run anything, mirroring GraphChallenge's
 * buildTargetOnlyHarness.
 */
export function buildTargetOnlyHarness({kind, categories, targetValues, ylabel, unit}) {
  return `
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import base64
from io import BytesIO

categories = ${JSON.stringify(categories)}
target_values = ${JSON.stringify(targetValues)}
color = "#9ca3af"

fig, ax = plt.subplots(figsize=(4, 3.2))
${indent(drawPy(kind, 'target_values', {ylabel, unit}), 0)}
ax.set_title("target")
plt.tight_layout()

buf = BytesIO()
plt.savefig(buf, format="png", dpi=100)
print("PISTON_PNG:" + base64.b64encode(buf.getvalue()).decode())
`;
}

/**
 * The plotting/scoring code appended to the student's code before sending to
 * Piston: calls their function, plots what it returns, and scores it against
 * targetValues the same way GraphChallenge scores curves (round(t) == round(y)).
 */
export function buildHarness({kind, functionName, categories, targetValues, ylabel, unit}) {
  return `
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import base64, json
from io import BytesIO

categories = ${JSON.stringify(categories)}
target_values = ${JSON.stringify(targetValues)}
color = "royalblue"

def safe():
    try:
        values = list(${functionName}())
        return [float(v) for v in values]
    except Exception:
        return None

your_values = safe()

fig, ax = plt.subplots(figsize=(4, 3.2))
if your_values is not None and len(your_values) == len(categories):
${indent(drawPy(kind, 'your_values', {ylabel, unit}), 4)}
    ax.set_title("yours")
else:
    ax.text(0.5, 0.5, "no output", ha="center", va="center", transform=ax.transAxes)
    ax.axis("off")
plt.tight_layout()

buf = BytesIO()
plt.savefig(buf, format="png", dpi=100)
print("PISTON_PNG:" + base64.b64encode(buf.getvalue()).decode())

n = len(target_values)
pairs = list(zip(target_values, your_values or []))
exact = sum(1 for t, y in pairs if round(t, 1) == round(y, 1))
closeness = sum(max(0, 1 - abs(t - y) / max(1, abs(t))) for t, y in pairs)
print("SCORE:" + json.dumps({
    "exact": exact,
    "total": n,
    "shape": round(100 * exact / n) if n else 0,
    "overall": round(100 * closeness / n) if n and pairs else 0,
}))
`;
}
