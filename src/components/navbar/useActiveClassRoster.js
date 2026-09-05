import {useCallback, useEffect, useState} from 'react';
import {
  ACTIVE_ROSTER_CHANGE_EVENT,
  CLASS_ROSTERS,
  readStoredRosterId,
  writeStoredRosterId,
} from '@site/src/data/classRosters';

export function useActiveClassRoster() {
  const [rosterId, setRosterIdState] = useState(readStoredRosterId);

  const setRosterId = useCallback((nextRosterId) => {
    setRosterIdState(writeStoredRosterId(nextRosterId));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncFromEvent = (event) => {
      const next = event?.detail?.rosterId;
      if (CLASS_ROSTERS[next]) {
        setRosterIdState(next);
      }
    };

    window.addEventListener(ACTIVE_ROSTER_CHANGE_EVENT, syncFromEvent);
    return () =>
      window.removeEventListener(ACTIVE_ROSTER_CHANGE_EVENT, syncFromEvent);
  }, []);

  return {
    rosterId,
    setRosterId,
    roster: CLASS_ROSTERS[rosterId],
  };
}
