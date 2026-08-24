import React, {useCallback, useEffect, useRef, useState} from 'react';
import {loadNote, saveNote} from './db';
import styles from './styles.module.css';

const SAVE_MS = 400;

function formatSaved(ts) {
  if (!ts) {
    return 'Saved in this browser';
  }
  try {
    return `Saved ${new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
  } catch {
    return 'Saved in this browser';
  }
}

export default function ScratchNotes() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [updatedAt, setUpdatedAt] = useState(0);
  const [status, setStatus] = useState('idle');
  const saveTimer = useRef(null);
  const textareaRef = useRef(null);
  const shouldFocus = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadNote()
      .then((note) => {
        if (cancelled || !note) {
          return;
        }
        setBody(note.body || '');
        setOpen(Boolean(note.open));
        setUpdatedAt(note.updatedAt || 0);
      })
      .catch(() => {
        /* private mode / blocked storage */
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        saveNote({body, open: false}).catch(() => {});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, body]);

  useEffect(() => {
    if (open && shouldFocus.current && textareaRef.current) {
      textareaRef.current.focus();
      shouldFocus.current = false;
    }
  }, [open]);

  const persist = useCallback((patch, immediate) => {
    const write = () => {
      setStatus('saving');
      saveNote(patch)
        .then((saved) => {
          setUpdatedAt(saved.updatedAt);
          setStatus('saved');
        })
        .catch(() => setStatus('error'));
    };
    window.clearTimeout(saveTimer.current);
    if (immediate) {
      write();
      return;
    }
    saveTimer.current = window.setTimeout(write, SAVE_MS);
  }, []);

  function toggle() {
    const next = !open;
    if (next) {
      shouldFocus.current = true;
    }
    setOpen(next);
    persist({body, open: next}, true);
  }

  function onChange(event) {
    const next = event.target.value;
    setBody(next);
    persist({body: next, open: true});
  }

  if (!ready) {
    return null;
  }

  return (
    <div className={styles.dock} data-open={open ? 'true' : 'false'}>
      {open ? (
        <section className={styles.panel} aria-label="Scratch notes">
          <header className={styles.header}>
            <div className={styles.titleBlock}>
              <span className={styles.title}>Notes</span>
              <span className={styles.meta}>
                {status === 'saving'
                  ? 'Saving…'
                  : status === 'error'
                    ? 'Could not save'
                    : formatSaved(updatedAt)}
              </span>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={toggle}
              aria-label="Close notes">
              ×
            </button>
          </header>
          <textarea
            ref={textareaRef}
            className={styles.area}
            value={body}
            onChange={onChange}
            placeholder="Scratch notes stay on this device…"
            spellCheck
          />
        </section>
      ) : null}
      <button
        type="button"
        className={styles.fab}
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Hide notes' : 'Open notes'}>
        <svg
          className={styles.fabIcon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M8 4h7l5 5v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
          <path d="M15 4v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      </button>
    </div>
  );
}
