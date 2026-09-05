/** Shared KaTeX helpers for two-variable word-problem solutions. */

export const X_COLOR = '#1565c0';
export const Y_COLOR = '#c62828';

export function tex(expr) {
  return `$${expr}$`;
}

export function texX(suffix = '') {
  return `$\\textcolor{${X_COLOR}}{x}${suffix}$`;
}

export function texY(suffix = '') {
  return `$\\textcolor{${Y_COLOR}}{y}${suffix}$`;
}

/** Color x / y inside a raw LaTeX equation string (not inside command names). */
export function colorVars(eq) {
  return String(eq)
    .replace(/(^|[^a-zA-Z\\])x(?![a-zA-Z])/g, `$1\\textcolor{${X_COLOR}}{x}`)
    .replace(/(^|[^a-zA-Z\\])y(?![a-zA-Z])/g, `$1\\textcolor{${Y_COLOR}}{y}`);
}

export function texSystem(eq1, eq2) {
  return `$$\\begin{cases} ${colorVars(eq1)} \\\\ ${colorVars(eq2)} \\end{cases}$$`;
}

export function texEq(eq) {
  return `$${colorVars(eq)}$`;
}
