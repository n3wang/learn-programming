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
    promptNoteId: null,
    answerNoteId: null,
    problemCount: 0,
    title: null,
  };
}

function sanitizeSession(raw) {
  if (!raw || typeof raw !== 'object') {
    return emptySession();
  }
  return {
    active: Boolean(raw.active),
    sessionId: raw.sessionId ? String(raw.sessionId) : null,
    dateKey: raw.dateKey ? String(raw.dateKey) : null,
    promptNoteId: raw.promptNoteId ? String(raw.promptNoteId) : null,
    answerNoteId: raw.answerNoteId ? String(raw.answerNoteId) : null,
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

function noteTitles(dateKey, sessionId) {
  const short = sessionId ? String(sessionId).slice(-5) : 'new';
  return {
    prompts: `HW ${dateKey} · ${short} · prompts`,
    answers: `HW ${dateKey} · ${short} · answers`,
  };
}

async function ensurePairNotes(session) {
  const dateKey = session.dateKey || localDateKey();
  const titles = noteTitles(dateKey, session.sessionId);
  const sessionId = session.sessionId || '';

  let promptNoteId = session.promptNoteId;
  let answerNoteId = session.answerNoteId;

  const notes = await listNotes().catch(() => []);
  const byId = new Map((notes || []).map((n) => [n?.id, n]));

  const makeHeader = (kindLabel) =>
    [
      `# Homework ${kindLabel}`,
      ``,
      `Session: \`${sessionId}\``,
      `Date: ${dateKey}`,
      ``,
      `---`,
      ``,
    ].join('\n');

  if (!promptNoteId || !byId.get(promptNoteId)) {
    const created = await saveNoteRecord({
      id: newNoteId(),
      title: titles.prompts,
      body: makeHeader('prompts'),
      kind: 'note',
      homeworkSessionId: sessionId,
      homeworkRole: 'prompts',
      homeworkDateKey: dateKey,
    });
    promptNoteId = created.id;
  }

  if (!answerNoteId || !byId.get(answerNoteId)) {
    const created = await saveNoteRecord({
      id: newNoteId(),
      title: titles.answers,
      body: makeHeader('answers'),
      kind: 'note',
      homeworkSessionId: sessionId,
      homeworkRole: 'answers',
      homeworkDateKey: dateKey,
    });
    answerNoteId = created.id;
  }

  return {promptNoteId, answerNoteId, dateKey};
}

/** Turn draft mode on — always starts a fresh assignment session + note pair. */
export async function activateHomeworkDraftMode() {
  const dateKey = localDateKey();
  const sessionId = newSessionId();
  const session = {
    active: true,
    sessionId,
    dateKey,
    promptNoteId: null,
    answerNoteId: null,
    problemCount: 0,
    title: `HW ${dateKey}`,
  };

  const pair = await ensurePairNotes(session);
  const next = writeHomeworkDraftSession({
    ...session,
    ...pair,
    active: true,
    title: `HW ${pair.dateKey}`,
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
    promptNoteId: null,
    answerNoteId: null,
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
 * Append one problem into the session's prompt + answer notes.
 * @param {{ title?: string, prompt: string, answer?: string, sourcePath?: string }} payload
 */
export async function appendProblemToHomeworkDraft(payload) {
  const session = readHomeworkDraftSession();
  if (!session.active || !session.sessionId) {
    throw new Error('Homework draft mode is off');
  }

  const pair = await ensurePairNotes(session);
  const index = (session.problemCount || 0) + 1;
  const title = cleanDraftText(payload?.title) || `Problem ${index}`;
  const prompt = cleanDraftText(payload?.prompt);
  const answer = cleanDraftText(payload?.answer);
  const sourcePath = payload?.sourcePath ? String(payload.sourcePath) : '';

  const meta = [
    `### ${index}. ${title}`,
    sourcePath ? `Source: ${sourcePath}` : null,
    ``,
  ]
    .filter((line) => line != null)
    .join('\n');

  const notes = await listNotes().catch(() => []);
  const promptNote = (notes || []).find((n) => n?.id === pair.promptNoteId);
  const answerNote = (notes || []).find((n) => n?.id === pair.answerNoteId);

  const promptBody = `${promptNote?.body || ''}${meta}${prompt || '(empty prompt)'}\n\n`;
  const answerBody = `${answerNote?.body || ''}${meta}${
    answer || '(no answer captured)'
  }\n\n`;

  await saveNoteRecord({
    ...(promptNote || {}),
    id: pair.promptNoteId,
    title: promptNote?.title || noteTitles(pair.dateKey, session.sessionId).prompts,
    body: promptBody,
    kind: 'note',
    homeworkSessionId: session.sessionId,
    homeworkRole: 'prompts',
    homeworkDateKey: pair.dateKey,
  });

  await saveNoteRecord({
    ...(answerNote || {}),
    id: pair.answerNoteId,
    title: answerNote?.title || noteTitles(pair.dateKey, session.sessionId).answers,
    body: answerBody,
    kind: 'note',
    homeworkSessionId: session.sessionId,
    homeworkRole: 'answers',
    homeworkDateKey: pair.dateKey,
  });

  const next = writeHomeworkDraftSession({
    ...session,
    ...pair,
    active: true,
    problemCount: index,
  });
  notifyNoteChange({
    session: next,
    action: 'append',
    index,
    promptNoteId: pair.promptNoteId,
    answerNoteId: pair.answerNoteId,
  });
  return next;
}
