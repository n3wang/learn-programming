/** Shared KaTeX helpers for two-/three-variable word-problem solutions. */

export const X_COLOR = '#1565c0';
export const Y_COLOR = '#c62828';
export const Z_COLOR = '#2e7d32';

export function tex(expr) {
  return `$${expr}$`;
}

export function texX(suffix = '') {
  return `$\\textcolor{${X_COLOR}}{x}${suffix}$`;
}

export function texY(suffix = '') {
  return `$\\textcolor{${Y_COLOR}}{y}${suffix}$`;
}

export function texZ(suffix = '') {
  return `$\\textcolor{${Z_COLOR}}{z}${suffix}$`;
}

/** Color x / y / z inside a raw LaTeX equation string (not inside command names). */
export function colorVars(eq) {
  return String(eq)
    .replace(/(^|[^a-zA-Z\\])x(?![a-zA-Z])/g, `$1\\textcolor{${X_COLOR}}{x}`)
    .replace(/(^|[^a-zA-Z\\])y(?![a-zA-Z])/g, `$1\\textcolor{${Y_COLOR}}{y}`)
    .replace(/(^|[^a-zA-Z\\])z(?![a-zA-Z])/g, `$1\\textcolor{${Z_COLOR}}{z}`);
}

export function texSystem(eq1, eq2) {
  return `$$\\begin{cases} ${colorVars(eq1)} \\\\ ${colorVars(eq2)} \\end{cases}$$`;
}

export function texSystem3(eq1, eq2, eq3) {
  return `$$\\begin{cases} ${colorVars(eq1)} \\\\ ${colorVars(eq2)} \\\\ ${colorVars(eq3)} \\end{cases}$$`;
}

export function texEq(eq) {
  return `$${colorVars(eq)}$`;
}
