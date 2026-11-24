import {useEffect, useRef} from 'react';
import {useLocation} from '@docusaurus/router';
import {localDay, postStudentActivity} from '@site/src/api/storeClient';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {STUDENT_ACTIVITY_POSTED_EVENT} from '@site/src/components/activity/activityHeatmap';

const HEARTBEAT_MS = 5 * 60 * 1000;
/** A lesson view only counts once the student stays on the page this long. */
const LESSON_DWELL_MS = 15 * 1000;
/** At most one `interact` event per this window — the count ≈ active minutes. */
const INTERACT_WINDOW_MS = 60 * 1000;
const LOGIN_MARK_PREFIX = 'student-activity-login:';

/** Controls inside page content that count as "doing" (check, next, show answer, options…). */
const ACTION_SELECTOR =
  'button, [role="button"], [role="tab"], [role="radio"], [role="checkbox"], [role="option"], ' +
  'input[type="radio"], input[type="checkbox"], input[type="button"], input[type="submit"], summary, select';
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"], .cm-content, .monaco-editor';

function announce(doc) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDENT_ACTIVITY_POSTED_EVENT, {detail: {doc}}));
}

/** Fire-and-forget: a down backend must never disturb the student site. */
function report(identity, kind, extra = {}) {
  postStudentActivity({...identity, kind, ...extra})
    .then(announce)
    .catch(() => {});
}

function claimLoginForToday(identity) {
  const key = `${LOGIN_MARK_PREFIX}${identity.roster}:${identity.student}`;
  const today = localDay();
  try {
    if (window.localStorage.getItem(key) === today) return false;
    window.localStorage.setItem(key, today);
  } catch {
    // blocked storage: still post, at worst once per page load
  }
  return true;
}

/** Only page content counts — not the navbar, sidebar, gear menu or floating docks. */
function inPageContent(el) {
  return Boolean(el?.closest?.('main') && !el.closest('nav, .navbar, .theme-doc-sidebar-container'));
}

function actionLabel(el) {
  const text = (el.getAttribute?.('aria-label') || el.textContent || el.value || '').trim();
  return text.replace(/\s+/g, ' ').slice(0, 40);
}

/**
 * Posts activity to `/api/store/student_activity` while a roster student is logged in:
 * - `login`     once per day
 * - `lesson`    after a short dwell on a page
 * - `interact`  clicking / answering inside page content (≤ 1 per minute, meta.actions = count)
 * - `heartbeat` every 5 min, only if the student actually did something since the last one
 */
export function useStudentActivityReporter() {
  const {auth, isStudent} = useSiteAuth();
  const {pathname} = useLocation();
  const roster = isStudent ? auth?.rosterId : null;
  const student = isStudent ? auth?.name : null;
  const lastLessonPath = useRef(null);

  // login + interactions + heartbeat
  useEffect(() => {
    if (!roster || !student || typeof window === 'undefined') return undefined;
    const identity = {roster, student};
    if (claimLoginForToday(identity)) report(identity, 'login');

    let lastInteractAt = 0;
    let actionsSincePost = 0;
    let busySinceHeartbeat = false;

    const recordAction = (action) => {
      busySinceHeartbeat = true;
      actionsSincePost += 1;
      const now = Date.now();
      if (now - lastInteractAt < INTERACT_WINDOW_MS) return;
      lastInteractAt = now;
      const actions = actionsSincePost;
      actionsSincePost = 0;
      report(identity, 'interact', {meta: {action, actions}});
    };

    const onClick = (event) => {
      const el = event.target?.closest?.(ACTION_SELECTOR);
      if (!el || !inPageContent(el) || el.disabled) return;
      recordAction(actionLabel(el) || el.tagName.toLowerCase());
    };
    const onInput = (event) => {
      const el = event.target?.closest?.(TEXT_SELECTOR);
      if (!el || !inPageContent(el)) return;
      recordAction('typing');
    };
    const onPresence = () => {
      busySinceHeartbeat = true;
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('input', onInput, true);
    window.addEventListener('scroll', onPresence, {passive: true});
    document.addEventListener('keydown', onPresence, true);

    const timer = window.setInterval(() => {
      if (busySinceHeartbeat && document.visibilityState === 'visible') {
        report(identity, 'heartbeat');
      }
      busySinceHeartbeat = false;
    }, HEARTBEAT_MS);

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('input', onInput, true);
      window.removeEventListener('scroll', onPresence);
      document.removeEventListener('keydown', onPresence, true);
      window.clearInterval(timer);
    };
  }, [roster, student]);

  // lesson view after a short dwell, skipping repeats of the same path
  useEffect(() => {
    if (!roster || !student || typeof window === 'undefined') return undefined;
    if (lastLessonPath.current === pathname) return undefined;
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      lastLessonPath.current = pathname;
      report({roster, student}, 'lesson', {path: pathname});
    }, LESSON_DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [roster, student, pathname]);
}

export default function StudentActivityReporter() {
  useStudentActivityReporter();
  return null;
}
