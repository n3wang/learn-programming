import {useCallback, useEffect, useState} from 'react';
import {
  HOMEWORK_DRAFT_CHANGE_EVENT,
  activateHomeworkDraftMode,
  deactivateHomeworkDraftMode,
  readHomeworkDraftSession,
} from '@site/src/data/homeworkDraftSession';

export function useHomeworkDraftMode() {
  const [session, setSession] = useState(() => readHomeworkDraftSession());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const sync = (event) => {
      if (event?.detail?.session) {
        setSession(event.detail.session);
      } else {
        setSession(readHomeworkDraftSession());
      }
    };
    window.addEventListener(HOMEWORK_DRAFT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(HOMEWORK_DRAFT_CHANGE_EVENT, sync);
  }, []);

  const setActive = useCallback(async (nextActive) => {
    setBusy(true);
    try {
      const next = nextActive
        ? await activateHomeworkDraftMode()
        : await deactivateHomeworkDraftMode();
      setSession(next);
      return next;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    session,
    active: Boolean(session?.active),
    busy,
    setActive,
  };
}
