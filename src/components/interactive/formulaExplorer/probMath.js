/** Client-side probability helpers — no external math packages. */

export function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x));
}

export function factorial(n) {
  const k = Math.max(0, Math.floor(n));
  let r = 1;
  for (let i = 2; i <= k; i++) r *= i;
  return r;
}

export function perm(n, k) {
  const nn = Math.floor(n);
  const kk = Math.floor(k);
  if (kk < 0 || kk > nn) return 0;
  let r = 1;
  for (let i = 0; i < kk; i++) r *= nn - i;
  return r;
}

export function comb(n, k) {
  const nn = Math.floor(n);
  const kk = Math.floor(k);
  if (kk < 0 || kk > nn) return 0;
  const m = Math.min(kk, nn - kk);
  let r = 1;
  for (let i = 1; i <= m; i++) {
    r = (r * (nn - m + i)) / i;
  }
  return Math.round(r);
}

export function binomialPmf(n, p, k) {
  const nn = Math.floor(n);
  const kk = Math.floor(k);
  if (kk < 0 || kk > nn) return 0;
  return comb(nn, kk) * p ** kk * (1 - p) ** (nn - kk);
}

export function poissonPmf(lambda, k) {
  const kk = Math.floor(k);
  if (kk < 0 || lambda <= 0) return kk === 0 && lambda === 0 ? 1 : 0;
  return Math.exp(-lambda) * lambda ** kk / factorial(kk);
}

export function uniformPdf(a, b, x) {
  if (b <= a) return 0;
  return x >= a && x <= b ? 1 / (b - a) : 0;
}

export function uniformCdf(a, b, x) {
  if (b <= a) return x < a ? 0 : 1;
  if (x < a) return 0;
  if (x > b) return 1;
  return (x - a) / (b - a);
}

export function exponentialPdf(lambda, x) {
  if (lambda <= 0 || x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

export function exponentialCdf(lambda, x) {
  if (lambda <= 0) return 0;
  if (x < 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

export function normalPdf(mu, sigma, x) {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** Rough Normal CDF via Abramowitz & Stegun approximation. */
export function normalCdf(mu, sigma, x) {
  if (sigma <= 0) return x >= mu ? 1 : 0;
  const z = (x - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-0.5 * z * z);
  const p =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function fmt(n, digits = 4) {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1e6) return n.toExponential(2);
  const s = Number(n.toFixed(digits));
  return String(s);
}
