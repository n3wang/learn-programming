import { useCallback, useRef } from 'react';

/**
 * Pointer → SVG user coordinates for drag interactions.
 * const { ref, toSvg, bind } = useSvgPointer(onMove)
 *   <svg ref={ref} viewBox=… {...bind}> — onMove({ x, y }) fires while the pointer is down.
 */
export function useSvgPointer(onMove) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const toSvg = useCallback((e) => {
    const svg = ref.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  }, []);
  const bind = {
    onPointerDown: (e) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      onMove(toSvg(e), 'down');
    },
    onPointerMove: (e) => {
      if (dragging.current) onMove(toSvg(e), 'move');
    },
    onPointerUp: () => {
      dragging.current = false;
    },
    onPointerLeave: () => {
      dragging.current = false;
    },
    style: { touchAction: 'none', cursor: 'pointer' },
  };
  return { ref, toSvg, bind };
}

export const fmt = (n, d = 1) => String(Number(n.toFixed(d)));
