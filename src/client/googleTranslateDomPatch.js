/**
 * Google Translate wraps text nodes in <font>, which breaks React's
 * removeChild / insertBefore when the parent pointer no longer matches.
 * Soften those DOM ops so SPA updates don't crash under Translate.
 */
(function patchGoogleTranslateDom() {
  if (typeof Node === 'undefined' || typeof window === 'undefined') {
    return;
  }
  if (window.__learnGtDomPatched) {
    return;
  }
  window.__learnGtDomPatched = true;

  const {removeChild, insertBefore} = Node.prototype;

  Node.prototype.removeChild = function patchedRemoveChild(child) {
    if (child && child.parentNode !== this) {
      if (child.parentNode) {
        return removeChild.call(child.parentNode, child);
      }
      return child;
    }
    try {
      return removeChild.call(this, child);
    } catch (err) {
      return child;
    }
  };

  Node.prototype.insertBefore = function patchedInsertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        try {
          return insertBefore.call(referenceNode.parentNode, newNode, referenceNode);
        } catch {
          // fall through
        }
      }
      try {
        return this.appendChild(newNode);
      } catch {
        return newNode;
      }
    }
    try {
      return insertBefore.call(this, newNode, referenceNode);
    } catch (err) {
      try {
        return this.appendChild(newNode);
      } catch {
        return newNode;
      }
    }
  };
})();
