import React, {useEffect} from 'react';

const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/** Keep arrow keys from scrolling the page while this game page is open. */
export default function BlockArrowScroll() {
  useEffect(() => {
    const block = (event) => {
      if (!ARROWS.has(event.key)) return;
      event.preventDefault();
    };
    window.addEventListener('keydown', block, {capture: true});
    return () => window.removeEventListener('keydown', block, {capture: true});
  }, []);
  return null;
}
