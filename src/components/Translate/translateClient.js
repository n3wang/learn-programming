const CJK_REGEX = /[一-鿿㐀-䶿]/;

/** Rough script detection: any CJK ideograph means "treat this as Chinese". */
export function detectSourceLocale(text) {
  return CJK_REGEX.test(text) ? 'zh' : 'en';
}

/** The locale a paragraph should be translated *into*, given its own script. */
export function targetLocaleFor(text) {
  return detectSourceLocale(text) === 'zh' ? 'en' : 'zh-CN';
}

function cacheKey(text, target) {
  return `translate-cache:${target}:${text}`;
}

function readCache(text, target) {
  try {
    return window.localStorage.getItem(cacheKey(text, target));
  } catch (e) {
    return null; // private browsing / storage disabled — just skip the cache
  }
}

function writeCache(text, target, value) {
  try {
    window.localStorage.setItem(cacheKey(text, target), value);
  } catch (e) {
    // best-effort only; quota errors etc. shouldn't break translation
  }
}

/**
 * Translates `text` into `target` ('en' or 'zh-CN').
 *
 * This site has no server and no configured translation API key, and
 * Docusaurus's own i18n system only translates whole doc pages and UI
 * chrome strings (see i18n/*\/docusaurus-plugin-content-docs-*), not
 * individual paragraphs — so there's no existing per-paragraph translation
 * to look up. The only "local" reuse available is this browser's own
 * localStorage cache of paragraphs it has already translated before;
 * anything not cached falls through to the free, unofficial Google
 * Translate endpoint (no API key, but undocumented and can rate-limit).
 */
export async function translateParagraph(text, target) {
  const cached = readCache(text, target);
  if (cached) return cached;

  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Translate request failed: ${res.status}`);
  }
  const data = await res.json();
  const translated = (data?.[0] || []).map((seg) => seg?.[0] || '').join('');
  if (!translated) {
    throw new Error('Empty translation response');
  }

  writeCache(text, target, translated);
  return translated;
}
