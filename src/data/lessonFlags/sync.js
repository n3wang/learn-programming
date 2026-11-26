/**
 * Student Store sync for lesson flags (`lesson_flags` collection).
 *
 * Append-only: captures are only ever added, never removed or overwritten. Flags captured
 * while logged out live in localStorage and are appended to the student's Store docs on
 * login; Store captures from other devices are merged into local.
 */
import {
  createDocument,
  listDocuments,
  postStudentActivity,
  replaceDocument,
} from '@site/src/api/storeClient';
import {
  LESSON_FLAGS_COLLECTION,
  captureDoc,
  markCaptured,
  readFlagState,
  storeDocId,
} from './store';

/** Upsert one capture: PUT by id, falling back to POST with `_id` if the doc does not exist yet. */
async function upsert(id, body) {
  try {
    return await replaceDocument(LESSON_FLAGS_COLLECTION, id, body);
  } catch (err) {
    if (err?.status === 404) {
      return createDocument(LESSON_FLAGS_COLLECTION, {_id: id, ...body});
    }
    throw err;
  }
}

function localDoc({student, roster}, flagId) {
  const row = readFlagState().captured[flagId];
  if (!row) {
    return null;
  }
  return captureDoc({student, roster, flagId, at: row.at, snapshot: row});
}

/** Push a fresh capture + activity `kind: 'flag'`. Fire-and-forget safe. */
export async function pushCapture({student, roster}, flagId) {
  const body = student ? localDoc({student, roster}, flagId) : null;
  if (!body) {
    return;
  }
  await upsert(storeDocId(student, flagId), body);
  if (roster) {
    await postStudentActivity({roster, student, kind: 'flag', meta: {flagId}}).catch(() => {});
  }
}

/**
 * Two-way append after login: pull this student's Store captures into local (any flag id,
 * even ones no longer in the catalog), then append local captures the Store lacks
 * (e.g. captured before logging in).
 */
export async function syncCaptures({student, roster}) {
  if (!student) {
    return;
  }
  const docs = await listDocuments(LESSON_FLAGS_COLLECTION);
  const remote = new Set();
  docs
    .filter((d) => d && d.student === student && d.flagId)
    .forEach((d) => {
      remote.add(d.flagId);
      markCaptured(d.flagId, {
        at: Date.parse(d.completedAt) || Date.now(),
        flag: d.flag,
        segments: d.segments,
      });
    });
  const missing = Object.keys(readFlagState().captured).filter((flagId) => !remote.has(flagId));
  await Promise.all(
    missing.map((flagId) => {
      const body = localDoc({student, roster}, flagId);
      return body ? upsert(storeDocId(student, flagId), body).catch(() => null) : null;
    }),
  );
}
