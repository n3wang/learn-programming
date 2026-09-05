const CJK_REGEX = /[一-鿿㐀-䶿]/;
const UI_LANG_KEY = 'site-ui-lang';
export const UI_LANG_CHANGE_EVENT = 'site-ui-lang-change';

/** Rough script detection: any CJK ideograph means "treat this as Chinese". */
export function detectSourceLocale(text) {
  return CJK_REGEX.test(text) ? 'zh' : 'en';
}

/** Preferred UI / hover-translate target: 'en' | 'zh-CN' | 'es'. */
export function readUiLang() {
  if (typeof window === 'undefined') return 'en';
  try {
    const v = window.localStorage.getItem(UI_LANG_KEY);
    if (v === 'zh-CN' || v === 'es' || v === 'en') return v;
  } catch {
    // ignore
  }
  return 'en';
}

export function writeUiLang(lang) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UI_LANG_KEY, lang);
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(UI_LANG_CHANGE_EVENT, {detail: {lang}}));
  } catch {
    // ignore
  }
}

/**
 * Locale a paragraph should be translated *into*.
 * - Prefer Spanish when UI lang is ES
 * - Otherwise Chinese ↔ English (classic bilingual hover)
 */
export function targetLocaleFor(text) {
  const preferred = readUiLang();
  const source = detectSourceLocale(text);

  if (preferred === 'es') {
    return 'es';
  }
  if (preferred === 'zh-CN') {
    return source === 'zh' ? 'en' : 'zh-CN';
  }
  // EN (default): Chinese → English, English → Chinese
  return source === 'zh' ? 'en' : 'zh-CN';
}

function cacheKey(text, target) {
  return `translate-cache:${target}:${text}`;
}

function readCache(text, target) {
  try {
    return window.localStorage.getItem(cacheKey(text, target));
  } catch (e) {
    return null;
  }
}

function writeCache(text, target, value) {
  try {
    window.localStorage.setItem(cacheKey(text, target), value);
  } catch (e) {
    // best-effort only
  }
}

/**
 * Translates `text` into `target` ('en', 'zh-CN', or 'es').
 * Uses localStorage cache + free Google Translate endpoint (no API key).
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
