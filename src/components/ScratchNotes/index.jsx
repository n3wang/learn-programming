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
  countsTowardProgress,
  isPracticeDraft,
  listDrafts,
  toggleDraftBookmark,
} from '@site/src/components/codeWorkspace/drafts';
import {WIKI, wikiPracticeKind} from '@site/src/data/wiki/catalog';
import {
  WIKI_PROGRESS_EVENT,
  listWikiProgress,
  markWikiViewed,
  toggleWikiBookmark,
} from './wikiStore';
import WikiDetail from './WikiDetail';
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

function isWikiLearned(row) {
  return Boolean(row?.learnedAt || row?.passedAt);
}

function isWikiStudy(row) {
  return Boolean(row?.studiedAt) && !isWikiLearned(row);
}

function wikiStatus(row) {
  if (isWikiLearned(row)) {
    return {label: formatDate(row.learnedAt || row.passedAt), done: true};
  }
  if (isWikiStudy(row)) {
    return {label: formatDate(row.studiedAt) || 'study', done: false};
  }
  return {label: '', done: false};
}

const WIKI_PAGE = 25;

function shuffleSample(items, n) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function wikiMatches(entry, q) {
  if (!q) {
    return true;
  }
  const hay = [entry.title, entry.description, entry.kind, entry.statement, entry.formula, entry.tex]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  return hay.includes(q);
}

function wikiPool(filter, progress) {
  return WIKI.filter((e) => {
    const row = progress[e.id];
    if (filter === 'bookmarked' && !row?.bookmarked) {
      return false;
    }
    if (filter === 'study' && !isWikiStudy(row)) {
      return false;
    }
    if (filter === 'learned' && !isWikiLearned(row)) {
      return false;
    }
    return true;
  });
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
  const [wikiSearch, setWikiSearch] = useState('');
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiFilter, setWikiFilter] = useState('all');
  const [wikiProgress, setWikiProgress] = useState({});
  const [wikiId, setWikiId] = useState(null);
  const [wikiPractice, setWikiPractice] = useState(false);
  const [wikiBatch, setWikiBatch] = useState([]);
  const saveTimer = useRef(null);
  const textareaRef = useRef(null);
  const dockRef = useRef(null);

  const refreshNotes = useCallback(async () => {
    const rows = await listNotes().catch(() => []);
    setNotes(rows);
    return rows;
  }, []);

  const refreshWiki = useCallback(async () => {
    const map = await listWikiProgress().catch(() => ({}));
    setWikiProgress(map || {});
  }, []);

  const refreshPractices = useCallback(async () => {
    const rows = await listDrafts().catch(() => []);
    setPractices((rows || []).filter((row) => isPracticeDraft(row) && countsTowardProgress(row)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadPrefs().catch(() => null),
      listNotes().catch(() => []),
      listDrafts().catch(() => []),
      listWikiProgress().catch(() => ({})),
    ])
      .then(([prefs, noteRows, draftRows, wikiMap]) => {
        if (cancelled) {
          return;
        }
        if (prefs) {
          setOpen(Boolean(prefs.open));
          if (prefs.tab === 'code' || prefs.tab === 'notes' || prefs.tab === 'wiki') {
            setTab(prefs.tab);
          }
        }
        setNotes(noteRows);
        setPractices((draftRows || []).filter((row) => isPracticeDraft(row) && countsTowardProgress(row)));
        setWikiProgress(wikiMap || {});
        if (prefs?.tab === 'wiki') {
          setWikiBatch(shuffleSample(wikiPool('all', wikiMap || {}), WIKI_PAGE));
        }
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
    const onWiki = () => {
      refreshWiki();
    };
    const onHomeworkNotes = () => {
      refreshNotes();
    };
    window.addEventListener(CODE_PROGRESS_EVENT, onProgress);
    window.addEventListener(WIKI_PROGRESS_EVENT, onWiki);
    window.addEventListener('homework-draft-note', onHomeworkNotes);
    return () => {
      window.removeEventListener(CODE_PROGRESS_EVENT, onProgress);
      window.removeEventListener(WIKI_PROGRESS_EVENT, onWiki);
      window.removeEventListener('homework-draft-note', onHomeworkNotes);
    };
  }, [refreshPractices, refreshNotes, refreshWiki]);

  const persistPrefs = useCallback((nextOpen, nextTab) => {
    savePrefs({open: nextOpen, tab: nextTab}).catch(() => {});
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setActiveId(null);
    setWikiId(null);
    setWikiPractice(false);
    persistPrefs(false, tab);
  }, [persistPrefs, tab]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        if (activeId || wikiId) {
          setActiveId(null);
          setWikiId(null);
          setWikiPractice(false);
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
  }, [open, activeId, wikiId, close]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) {
      setActiveId(null);
      setWikiId(null);
      setWikiPractice(false);
    } else {
      refreshNotes();
      refreshPractices();
      refreshWiki();
      if (tab === 'wiki') {
        setWikiSearch('');
        setWikiQuery('');
        setWikiBatch(shuffleSample(wikiPool(wikiFilter, wikiProgress), WIKI_PAGE));
      }
    }
    persistPrefs(next, tab);
  }

  function selectTab(next) {
    setTab(next);
    setActiveId(null);
    setWikiId(null);
    setWikiPractice(false);
    persistPrefs(open, next);
    if (next === 'code') {
      refreshPractices();
    }
    if (next === 'wiki') {
      setWikiSearch('');
      setWikiQuery('');
      setWikiBatch(shuffleSample(wikiPool(wikiFilter, wikiProgress), WIKI_PAGE));
      refreshWiki();
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
      if (codeFilter === 'pending' && (e.completed || !e.modified)) {
        return false;
      }
      if (codeFilter === 'passed' && !e.completed) {
        return false;
      }
      const isStatus =
        codeFilter === 'all' ||
        codeFilter === 'bookmarked' ||
        codeFilter === 'pending' ||
        codeFilter === 'passed';
      if (!isStatus && String(e.lang).toLowerCase() !== codeFilter) {
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

  useEffect(() => {
    const q = wikiSearch.trim();
    if (!q) {
      setWikiQuery('');
      return undefined;
    }
    const timer = window.setTimeout(() => setWikiQuery(q), 1000);
    return () => window.clearTimeout(timer);
  }, [wikiSearch]);

  const wikiPassedCount = useMemo(
    () => WIKI.filter((e) => isWikiLearned(wikiProgress[e.id])).length,
    [wikiProgress],
  );

  const wikiList = useMemo(() => {
    const q = wikiQuery.trim().toLowerCase();
    if (!q) {
      return wikiBatch;
    }
    const hits = WIKI.filter((e) => wikiMatches(e, q));
    return hits.slice(0, WIKI_PAGE);
  }, [wikiQuery, wikiBatch]);

  const practicePool = useMemo(() => {
    if (wikiList.length) {
      return wikiList;
    }
    return wikiPool(wikiFilter, wikiProgress);
  }, [wikiList, wikiFilter, wikiProgress]);

  const wikiEntry = WIKI.find((e) => e.id === wikiId) || null;

  async function openWiki(id, asPractice) {
    setWikiPractice(Boolean(asPractice));
    setWikiId(id);
    await markWikiViewed(id);
    refreshWiki();
  }

  function startPractice() {
    const graded = practicePool.filter((e) => wikiPracticeKind(e) !== 'read');
    const pool = graded.length ? graded : practicePool;
    if (!pool.length) {
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openWiki(pick.id, true);
  }

  function applyWikiFilter(next) {
    const value = next === wikiFilter && next !== 'all' ? 'all' : next;
    setWikiFilter(value);
    setWikiSearch('');
    setWikiQuery('');
    setWikiBatch(shuffleSample(wikiPool(value, wikiProgress), WIKI_PAGE));
  }

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
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'wiki'}
                className={tab === 'wiki' ? styles.tabActive : styles.tab}
                onClick={() => selectTab('wiki')}>
                {wikiPassedCount > 0 ? `wiki lv${wikiPassedCount}` : 'wiki'}
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
                        <span className={styles.tag}>
                          {n.homeworkRole === 'prompts'
                            ? '[hw prompts]'
                            : n.homeworkRole === 'answers'
                              ? '[hw answers]'
                              : '[note]'}
                        </span>
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
                <span className={styles.tag}>
                  {activeNote.homeworkRole === 'prompts'
                    ? '[hw prompts]'
                    : activeNote.homeworkRole === 'answers'
                      ? '[hw answers]'
                      : '[note]'}
                </span>
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
                <button
                  type="button"
                  className={codeFilter === 'pending' ? styles.filterOn : styles.filter}
                  onClick={() => setCodeFilter(codeFilter === 'pending' ? 'all' : 'pending')}>
                  pending
                </button>
                <button
                  type="button"
                  className={codeFilter === 'passed' ? styles.filterOn : styles.filter}
                  onClick={() => setCodeFilter(codeFilter === 'passed' ? 'all' : 'passed')}>
                  passed
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

          {tab === 'wiki' && wikiEntry && (
            <WikiDetail
              entry={wikiEntry}
              practice={wikiPractice}
              onBack={() => {
                setWikiId(null);
                setWikiPractice(false);
              }}
              onProgress={refreshWiki}
            />
          )}

          {tab === 'wiki' && !wikiEntry && (
            <div className={styles.body}>
              <div className={styles.searchRow}>
                <input
                  className={styles.search}
                  value={wikiSearch}
                  onChange={(e) => setWikiSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setWikiQuery(wikiSearch.trim());
                    }
                  }}
                  placeholder="search"
                  aria-label="Search wiki"
                />
              </div>
              <div className={styles.filters}>
                <button
                  type="button"
                  className={wikiFilter === 'bookmarked' ? styles.filterOn : styles.filter}
                  onClick={() => applyWikiFilter('bookmarked')}>
                  bookmarked
                </button>
                <button
                  type="button"
                  className={wikiFilter === 'all' ? styles.filterOn : styles.filter}
                  onClick={() => applyWikiFilter('all')}>
                  all
                </button>
                <button
                  type="button"
                  className={wikiFilter === 'study' ? styles.filterOn : styles.filter}
                  onClick={() => applyWikiFilter('study')}>
                  study
                </button>
                <button
                  type="button"
                  className={wikiFilter === 'learned' ? styles.filterOn : styles.filter}
                  onClick={() => applyWikiFilter('learned')}>
                  learned
                </button>
                <button
                  type="button"
                  className={styles.wikiPracticeBtn}
                  onClick={startPractice}
                  disabled={practicePool.length === 0}>
                  practice
                </button>
              </div>
              {wikiList.length === 0 ? (
                <p className={styles.empty}>No matching wiki entries.</p>
              ) : (
                <ul className={styles.list}>
                  {wikiList.map((e) => {
                    const row = wikiProgress[e.id];
                    const status = wikiStatus(row);
                    return (
                      <li key={e.id} className={styles.codeRowWrap}>
                        <button
                          type="button"
                          className={styles.star}
                          aria-label={row?.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                          onClick={() => toggleWikiBookmark(e.id).then(refreshWiki)}>
                          {row?.bookmarked ? '★' : '☆'}
                        </button>
                        <button type="button" className={styles.codeRow} onClick={() => openWiki(e.id)}>
                          {status.label ? (
                            <span className={status.done ? styles.done : styles.pending}>
                              [{status.label}]
                            </span>
                          ) : (
                            <span className={styles.pending}>[—]</span>
                          )}
                          <span className={styles.rowTitle}>{e.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
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
