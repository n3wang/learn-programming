import {useEffect} from 'react';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {syncCaptures} from '@site/src/data/lessonFlags/sync';

/** When a student logs in, merge their Store captures with this device's (both ways). */
export default function LessonFlagsSync() {
  const {auth, isStudent} = useSiteAuth();
  const student = isStudent ? auth?.name : null;
  const roster = isStudent ? auth?.rosterId : null;

  useEffect(() => {
    if (!student) {
      return;
    }
    // A down backend must never disturb the site.
    syncCaptures({student, roster}).catch(() => {});
  }, [student, roster]);

  return null;
}
