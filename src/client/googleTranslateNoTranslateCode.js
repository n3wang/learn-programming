/**
 * Mark code / program-output nodes so Google Translate leaves them alone.
 * Uses class="notranslate" and translate="no" (HTML translate attribute).
 */
(function markCodeNoTranslate() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }
  if (window.__learnGtNoTranslateMarked) {
    return;
  }
  window.__learnGtNoTranslateMarked = true;

  const SELECTOR = [
    'pre',
    'code',
    '.theme-code-block',
    '.cm-editor',
    '.cm-content',
    '.cm-line',
  ].join(',');

  function markEl(el) {
    if (!(el instanceof Element)) return;
    if (!el.classList.contains('notranslate')) {
      el.classList.add('notranslate');
    }
    if (el.getAttribute('translate') !== 'no') {
      el.setAttribute('translate', 'no');
    }
  }

  function scan(root) {
    if (!(root instanceof Element) && root !== document) return;
    const scope = root instanceof Element ? root : document;
    if (scope.matches?.(SELECTOR)) {
      markEl(scope);
    }
    scope.querySelectorAll?.(SELECTOR).forEach(markEl);
  }

  const run = () => scan(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, {once: true});
  } else {
    run();
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) scan(node);
        });
      }
    }
  });

  observer.observe(document.documentElement, {childList: true, subtree: true});
})();
