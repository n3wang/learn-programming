/** Persistent homework-draft mode: stays on across pages for multi-page HW. */

import {localDateKey} from '@site/src/data/classBehaviorDb';
import {
  listNotes,
  newNoteId,
  saveNoteRecord,
} from '@site/src/components/ScratchNotes/db';

export const HOMEWORK_DRAFT_STORAGE_KEY = 'homework-draft-session';
export const HOMEWORK_DRAFT_CHANGE_EVENT = 'homework-draft-change';
export const HOMEWORK_DRAFT_NOTE_EVENT = 'homework-draft-note';

function emptySession() {
  return {
    active: false,
    sessionId: null,
    dateKey: null,
    noteId: null,
    problemCount: 0,
    title: null,
  };
}

function sanitizeSession(raw) {
  if (!raw || typeof raw !== 'object') {
    return emptySession();
  }
  // Prefer new single-note id; fall back to legacy prompt note id.
  const noteId = raw.noteId
    ? String(raw.noteId)
    : raw.promptNoteId
      ? String(raw.promptNoteId)
      : null;
  return {
    active: Boolean(raw.active),
    sessionId: raw.sessionId ? String(raw.sessionId) : null,
    dateKey: raw.dateKey ? String(raw.dateKey) : null,
    noteId,
    problemCount: Number.isFinite(Number(raw.problemCount))
      ? Math.max(0, Number(raw.problemCount))
      : 0,
    title: raw.title ? String(raw.title) : null,
  };
}

export function readHomeworkDraftSession() {
  if (typeof window === 'undefined') {
    return emptySession();
  }
  try {
    const raw = window.localStorage.getItem(HOMEWORK_DRAFT_STORAGE_KEY);
    if (!raw) {
      return emptySession();
    }
    return sanitizeSession(JSON.parse(raw));
  } catch {
    return emptySession();
  }
}

function writeHomeworkDraftSession(session) {
  const next = sanitizeSession(session);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        HOMEWORK_DRAFT_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore quota / private mode
    }
    window.dispatchEvent(
      new CustomEvent(HOMEWORK_DRAFT_CHANGE_EVENT, {detail: {session: next}}),
    );
  }
  return next;
}

function notifyNoteChange(detail) {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(HOMEWORK_DRAFT_NOTE_EVENT, {detail: detail || {}}),
  );
}

function newSessionId() {
  return `hw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function noteTitle(dateKey, sessionId) {
  const short = sessionId ? String(sessionId).slice(-5) : 'new';
  return `HW ${dateKey} · ${short}`;
}

function makeHeader(sessionId, dateKey) {
  return [
    `# Homework draft`,
    ``,
    `Session: \`${sessionId || ''}\``,
    `Date: ${dateKey}`,
    ``,
    `---`,
    ``,
  ].join('\n');
}

async function ensureDraftNote(session) {
  const dateKey = session.dateKey || localDateKey();
  const sessionId = session.sessionId || '';
  let noteId = session.noteId;

  const notes = await listNotes().catch(() => []);
  const byId = new Map((notes || []).map((n) => [n?.id, n]));

  if (!noteId || !byId.get(noteId)) {
    const created = await saveNoteRecord({
      id: newNoteId(),
      title: noteTitle(dateKey, sessionId),
      body: makeHeader(sessionId, dateKey),
      kind: 'note',
      homeworkSessionId: sessionId,
      homeworkRole: 'homework',
      homeworkDateKey: dateKey,
    });
    noteId = created.id;
  }

  return {noteId, dateKey};
}

/** Turn draft mode on — always starts a fresh assignment session + note. */
export async function activateHomeworkDraftMode() {
  const dateKey = localDateKey();
  const sessionId = newSessionId();
  const session = {
    active: true,
    sessionId,
    dateKey,
    noteId: null,
    problemCount: 0,
    title: `HW ${dateKey}`,
  };

  const ensured = await ensureDraftNote(session);
  const next = writeHomeworkDraftSession({
    ...session,
    ...ensured,
    active: true,
    title: `HW ${ensured.dateKey}`,
  });
  notifyNoteChange({session: next, action: 'activate'});
  return next;
}

/** Turn draft mode off and clear the live session so the next ON is a new assignment. */
export async function deactivateHomeworkDraftMode() {
  const current = readHomeworkDraftSession();
  const next = writeHomeworkDraftSession({
    active: false,
    sessionId: null,
    dateKey: current.dateKey || null,
    noteId: null,
    problemCount: 0,
    title: null,
  });
  notifyNoteChange({session: next, action: 'deactivate'});
  return next;
}

export async function toggleHomeworkDraftMode() {
  const current = readHomeworkDraftSession();
  if (current.active) {
    return deactivateHomeworkDraftMode();
  }
  return activateHomeworkDraftMode();
}

function cleanDraftText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Append one problem (prompt + answer) into the session's single draft note.
 * @param {{ title?: string, prompt: string, answer?: string, sourcePath?: string }} payload
 */
export async function appendProblemToHomeworkDraft(payload) {
  const session = readHomeworkDraftSession();
  if (!session.active || !session.sessionId) {
    throw new Error('Homework draft mode is off');
  }

  const ensured = await ensureDraftNote(session);
  const index = (session.problemCount || 0) + 1;
  const title = cleanDraftText(payload?.title) || `Problem ${index}`;
  const prompt = cleanDraftText(payload?.prompt);
  const answer = cleanDraftText(payload?.answer);
  const sourcePath = payload?.sourcePath ? String(payload.sourcePath) : '';

  const block = [
    `### ${index}. ${title}`,
    sourcePath ? `Source: ${sourcePath}` : null,
    ``,
    `**Prompt**`,
    ``,
    prompt || '(empty prompt)',
    ``,
    `**Answer**`,
    ``,
    answer || '(no answer captured)',
    ``,
    `---`,
    ``,
  ]
    .filter((line) => line != null)
    .join('\n');

  const notes = await listNotes().catch(() => []);
  const note = (notes || []).find((n) => n?.id === ensured.noteId);

  await saveNoteRecord({
    ...(note || {}),
    id: ensured.noteId,
    title: note?.title || noteTitle(ensured.dateKey, session.sessionId),
    body: `${note?.body || ''}${block}`,
    kind: 'note',
    homeworkSessionId: session.sessionId,
    homeworkRole: 'homework',
    homeworkDateKey: ensured.dateKey,
  });

  const next = writeHomeworkDraftSession({
    ...session,
    ...ensured,
    active: true,
    problemCount: index,
  });
  notifyNoteChange({
    session: next,
    action: 'append',
    index,
    noteId: ensured.noteId,
  });
  return next;
}
