import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * Wrap a dynamic import in BrowserOnly + Suspense so heavy MDX widgets
 * (CodeMirror, Piston runners, etc.) stay out of the SSR/webpack server graph.
 */
export function lazyMdxComponent(importer) {
  const Lazy = React.lazy(importer);
  return function LazyMdxComponent(props) {
    return (
      <BrowserOnly fallback={null}>
        {() => (
          <React.Suspense fallback={null}>
            <Lazy {...props} />
          </React.Suspense>
        )}
      </BrowserOnly>
    );
  };
}

export function lazyMdxNamed(importer, exportName) {
  const Lazy = React.lazy(() =>
    importer().then((mod) => ({default: mod[exportName]}))
  );
  return function LazyMdxNamedComponent(props) {
    return (
      <BrowserOnly fallback={null}>
        {() => (
          <React.Suspense fallback={null}>
            <Lazy {...props} />
          </React.Suspense>
        )}
      </BrowserOnly>
    );
  };
}
