import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {
  deleteNoteRecord,
  listNotes,
  loadPrefs,
  newNoteId,
  saveNoteRecord,
  savePrefs,
} from './db';
import {
  CODE_PROGRESS_EVENT,
  isPracticeDraft,
  listDrafts,
  toggleDraftBookmark,
} from '@site/src/components/codeWorkspace/drafts';
import styles from './styles.module.css';

const SAVE_MS = 400;

function formatDate(ts) {
  if (!ts) {
    return '';
  }
  try {
    const d = new Date(ts);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '';
  }
}

function practiceStatus(row) {
  if (row.completed) {
    return {label: formatDate(row.completedAt || row.updatedAt), done: true};
  }
  return {label: 'pending', done: false};
}

export default function ScratchNotes() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [noteSearch, setNoteSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [codeFilter, setCodeFilter] = useState('all');
  const [practices, setPractices] = useState([]);
  const saveTimer = useRef(null);
  const textareaRef = useRef(null);
  const dockRef = useRef(null);

  const refreshNotes = useCallback(async () => {
    const rows = await listNotes().catch(() => []);
    setNotes(rows);
    return rows;
  }, []);

  const refreshPractices = useCallback(async () => {
    const rows = await listDrafts().catch(() => []);
    setPractices(rows.filter(isPracticeDraft));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadPrefs().catch(() => null), listNotes().catch(() => []), listDrafts().catch(() => [])])
      .then(([prefs, noteRows, draftRows]) => {
        if (cancelled) {
          return;
        }
        if (prefs) {
          setOpen(Boolean(prefs.open));
          if (prefs.tab === 'code' || prefs.tab === 'notes') {
            setTab(prefs.tab);
          }
        }
        setNotes(noteRows);
        setPractices((draftRows || []).filter(isPracticeDraft));
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
    const onProgress = () => {
      refreshPractices();
    };
    window.addEventListener(CODE_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(CODE_PROGRESS_EVENT, onProgress);
  }, [refreshPractices]);

  const persistPrefs = useCallback((nextOpen, nextTab) => {
    savePrefs({open: nextOpen, tab: nextTab}).catch(() => {});
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setActiveId(null);
    persistPrefs(false, tab);
  }, [persistPrefs, tab]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        if (activeId) {
          setActiveId(null);
          return;
        }
        close();
      }
    };
    const onPointer = (event) => {
      if (dockRef.current && !dockRef.current.contains(event.target)) {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open, activeId, close]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) {
      setActiveId(null);
    } else {
      refreshNotes();
      refreshPractices();
    }
    persistPrefs(next, tab);
  }

  function selectTab(next) {
    setTab(next);
    setActiveId(null);
    persistPrefs(open, next);
    if (next === 'code') {
      refreshPractices();
    }
  }

  const activeNote = notes.find((n) => n.id === activeId) || null;

  const filteredNotes = useMemo(() => {
    const q = noteSearch.trim().toLowerCase();
    if (!q) {
      return notes;
    }
    return notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q)
    );
  }, [notes, noteSearch]);

  const completedCount = practices.filter((e) => e.completed).length;
  const langs = useMemo(() => {
    const set = new Set();
    practices.forEach((e) => {
      if (e.lang) {
        set.add(String(e.lang).toLowerCase());
      }
    });
    return [...set].sort();
  }, [practices]);

  const filteredPractices = useMemo(() => {
    const q = codeSearch.trim().toLowerCase();
    return practices.filter((e) => {
      if (codeFilter === 'bookmarked' && !e.bookmarked) {
        return false;
      }
      if (codeFilter !== 'all' && codeFilter !== 'bookmarked' && String(e.lang).toLowerCase() !== codeFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        (e.title || '').toLowerCase().includes(q) ||
        (e.chapter || '').toLowerCase().includes(q) ||
        (e.pathname || '').toLowerCase().includes(q)
      );
    });
  }, [practices, codeSearch, codeFilter]);

  const groupedPractices = useMemo(() => {
    const groups = new Map();
    filteredPractices.forEach((e) => {
      const key = e.chapter || e.pathname || 'Other';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(e);
    });
    return [...groups.entries()].map(([chapter, items]) => {
      const allInChapter = practices.filter((e) => (e.chapter || e.pathname || 'Other') === chapter);
      const done = allInChapter.filter((e) => e.completed).length;
      return {chapter, items, done, total: allInChapter.length};
    });
  }, [filteredPractices, practices]);

  async function addNote() {
    const index = notes.length + 1;
    const created = await saveNoteRecord({
      id: newNoteId(),
      title: `Note ${index}`,
      body: '',
      kind: 'note',
    });
    await refreshNotes();
    setActiveId(created.id);
  }

  function persistNote(next, immediate) {
    window.clearTimeout(saveTimer.current);
    const write = () => saveNoteRecord(next).then(() => refreshNotes());
    if (immediate) {
      write();
      return;
    }
    saveTimer.current = window.setTimeout(write, SAVE_MS);
  }

  function onTitleChange(event) {
    if (!activeNote) {
      return;
    }
    const next = {...activeNote, title: event.target.value};
    setNotes((rows) => rows.map((r) => (r.id === next.id ? next : r)));
    persistNote(next);
  }

  function onBodyChange(event) {
    if (!activeNote) {
      return;
    }
    const next = {...activeNote, body: event.target.value};
    setNotes((rows) => rows.map((r) => (r.id === next.id ? next : r)));
    persistNote(next);
  }

  async function removeNote() {
    if (!activeNote) {
      return;
    }
    await deleteNoteRecord(activeNote.id);
    setActiveId(null);
    await refreshNotes();
  }

  if (!ready) {
    return null;
  }

  return (
    <div ref={dockRef} className={styles.dock} data-open={open ? 'true' : 'false'}>
      {open ? (
        <section className={styles.panel} aria-label="Scratch notes">
          <header className={styles.header}>
            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'notes'}
                className={tab === 'notes' ? styles.tabActive : styles.tab}
                onClick={() => selectTab('notes')}>
                notes
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'code'}
                className={tab === 'code' ? styles.tabActive : styles.tab}
                onClick={() => selectTab('code')}>
                {completedCount > 0 ? `code lv${completedCount}` : 'code'}
              </button>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={toggle}
              aria-label="Close notes">
              ×
            </button>
          </header>

          {tab === 'notes' && !activeNote && (
            <div className={styles.body}>
              <div className={styles.searchRow}>
                <input
                  className={styles.search}
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="search"
                  aria-label="Search notes"
                />
                <button type="button" className={styles.addBtn} onClick={addNote} aria-label="Add note">
                  +
                </button>
              </div>
              {filteredNotes.length === 0 ? (
                <p className={styles.empty}>No notes yet.</p>
              ) : (
                <ul className={styles.list}>
                  {filteredNotes.map((n) => (
                    <li key={n.id}>
                      <button type="button" className={styles.row} onClick={() => setActiveId(n.id)}>
                        <span className={styles.rowTitle}>{n.title || 'Untitled'}</span>
                        <span className={styles.rowDate}>{formatDate(n.updatedAt)}</span>
                        <span className={styles.tag}>[note]</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'notes' && activeNote && (
            <div className={styles.bodyEditor}>
              <div className={styles.noteBar}>
                <button type="button" className={styles.back} onClick={() => setActiveId(null)} aria-label="Back">
                  ‹
                </button>
                <input
                  className={styles.noteTitle}
                  value={activeNote.title || ''}
                  onChange={onTitleChange}
                  aria-label="Note title"
                />
                <span className={styles.rowDate}>{formatDate(activeNote.updatedAt)}</span>
                <span className={styles.tag}>[note]</span>
                <button type="button" className={styles.textBtn} onClick={removeNote}>
                  delete
                </button>
              </div>
              <textarea
                ref={textareaRef}
                className={styles.area}
                value={activeNote.body || ''}
                onChange={onBodyChange}
                placeholder="Write here. Saved on this device."
                spellCheck
              />
            </div>
          )}

          {tab === 'code' && (
            <div className={styles.body}>
              <div className={styles.searchRow}>
                <input
                  className={styles.search}
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  placeholder="search"
                  aria-label="Search code progress"
                />
              </div>
              <div className={styles.filters}>
                <button
                  type="button"
                  className={codeFilter === 'bookmarked' ? styles.filterOn : styles.filter}
                  onClick={() => setCodeFilter(codeFilter === 'bookmarked' ? 'all' : 'bookmarked')}>
                  bookmarked
                </button>
                {langs.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={codeFilter === lang ? styles.filterOn : styles.filter}
                    onClick={() => setCodeFilter(codeFilter === lang ? 'all' : lang)}>
                    {lang}
                  </button>
                ))}
              </div>
              {groupedPractices.length === 0 ? (
                <p className={styles.empty}>Open a lesson with practice exercises to start tracking progress.</p>
              ) : (
                groupedPractices.map((group) => (
                  <div key={group.chapter} className={styles.chapter}>
                    <div className={styles.chapterHead}>
                      {group.chapter}. {group.done}/{group.total}
                    </div>
                    <ul className={styles.list}>
                      {group.items.map((e) => {
                        const status = practiceStatus(e);
                        return (
                          <li key={e.id} className={styles.codeRowWrap}>
                            <button
                              type="button"
                              className={styles.star}
                              aria-label={e.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                              onClick={() => toggleDraftBookmark(e.id).then(refreshPractices)}>
                              {e.bookmarked ? '★' : '☆'}
                            </button>
                            <Link
                              className={styles.codeRow}
                              to={e.hash ? `${e.pathname || ''}#${e.hash}` : e.pathname || '/'}
                              onClick={close}>
                              <span className={status.done ? styles.done : styles.pending}>
                                [{status.label}]
                              </span>
                              <span className={styles.rowTitle}>{e.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
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
