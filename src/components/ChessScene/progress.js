import {
  countsTowardProgress,
  isPracticeDraft,
  listDrafts,
} from '@site/src/components/codeWorkspace/drafts';

// Mirrors the pending/passed semantics used by the code-history dock
// (src/components/ScratchNotes/index.jsx): pending = started but not
// completed, passed = completed.
async function practiceRows() {
  const rows = await listDrafts().catch(() => []);
  return (rows || []).filter((row) => isPracticeDraft(row) && countsTowardProgress(row));
}

// Same definition of "level" as the code-history dock: the count of
// completed practice/exam exercises across the whole site.
export async function getCodeLevel() {
  const rows = await practiceRows();
  return rows.filter((row) => row.completed).length;
}

function toLink(row) {
  return row.hash ? `${row.pathname || ''}#${row.hash}` : row.pathname || '/';
}

// Picks a random exercise from the student's own history, preferring an
// unfinished ("pending") one over an already-completed one. Returns null
// if there's no history yet, so the caller can fall back to lesson links.
export async function getRandomExercise() {
  const rows = await practiceRows();
  const pending = rows.filter((row) => row.modified && !row.completed);
  const passed = rows.filter((row) => row.completed);
  const pool = pending.length ? pending : passed;
  if (!pool.length) return null;

  const row = pool[Math.floor(Math.random() * pool.length)];
  return {
    status: row.completed ? 'passed' : 'pending',
    subject: (row.completed ? 'passed' : 'pending').toUpperCase(),
    title: row.title || row.chapter || 'Exercise',
    to: toLink(row),
  };
}
