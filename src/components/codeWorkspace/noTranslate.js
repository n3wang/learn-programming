/**
 * Props that tell Google Translate (and similar tools) to leave text alone.
 * Merge `className` with your own classes when needed.
 */
export const NO_TRANSLATE = {
  className: 'notranslate',
  translate: 'no',
};

export function noTranslateClass(...classes) {
  return ['notranslate', ...classes].filter(Boolean).join(' ');
}
