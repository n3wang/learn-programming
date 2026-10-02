/** On/off for Shift + hover term cards. Off unless the reader turns it on in site settings. */

const KEY = 'term-peek-enabled';
export const TERM_PEEK_CHANGE_EVENT = 'term-peek-change';

export function readTermPeekEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function writeTermPeekEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(TERM_PEEK_CHANGE_EVENT, {detail: {enabled}}));
  } catch {
    // ignore
  }
}
