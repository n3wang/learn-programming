/**
 * Shared KaTeX options. Lessons often use `\\` between display equations;
 * LaTeX ignores that outside aligned/gather, and KaTeX's default strict:warn
 * floods the console — ignore that code, keep other strict checks.
 */
export function katexStrict(errorCode) {
  if (errorCode === 'newLineInDisplayMode') {
    return 'ignore';
  }
  return 'warn';
}

export function katexRenderOptions(overrides = {}) {
  return {
    throwOnError: false,
    strict: katexStrict,
    ...overrides,
  };
}
