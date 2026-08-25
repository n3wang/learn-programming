import React, {useCallback, useEffect, useRef, useState} from 'react';
import chrome from './chrome.module.css';

const MIN = 18;
const MAX = 82;

export default function SplitPanes({split, minHeight, children}) {
  const [leftPct, setLeftPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef(null);
  const [editor, side] = React.Children.toArray(children);

  const onPointerDown = useCallback((event) => {
    event.preventDefault();
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }
    const onMove = (event) => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box || box.width < 1) {
        return;
      }
      const next = ((event.clientX - box.left) / box.width) * 100;
      setLeftPct(Math.min(MAX, Math.max(MIN, next)));
    };
    const stop = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  if (!split) {
    return (
      <div className={chrome.panes} ref={wrapRef} style={{minHeight}}>
        {editor}
      </div>
    );
  }

  return (
    <div
      className={`${chrome.panes} ${chrome.panesSplit}`}
      ref={wrapRef}
      style={{
        minHeight,
        gridTemplateColumns: `minmax(7rem, ${leftPct}%) 9px minmax(7rem, 1fr)`,
      }}
    >
      {editor}
      <button
        type="button"
        className={`${chrome.gutter} ${dragging ? chrome.gutterActive : ''}`}
        aria-label="Resize output pane"
        title="Drag to resize"
        onPointerDown={onPointerDown}
      />
      {side}
    </div>
  );
}
