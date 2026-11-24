import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {fetchStudentActivity} from '@site/src/api/storeClient';
import {
  HeatCell,
  STUDENT_ACTIVITY_POSTED_EVENT,
  countByDay,
  filterActivity,
  lastNDays,
} from '@site/src/components/activity/activityHeatmap';

const WINDOW_DAYS = 12;

/** Compact 12-day heatmap for the logged-in student (gear → ACCOUNT). */
export default function AccountActivityStrip({roster, student}) {
  const [docs, setDocs] = useState(null);
  const [offline, setOffline] = useState(false);
  const days = useMemo(() => lastNDays(WINDOW_DAYS), []);

  const load = useCallback(() => {
    fetchStudentActivity()
      .then((all) => {
        setDocs(filterActivity(all, {roster, student, days}));
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, [roster, student, days]);

  useEffect(() => {
    load();
    if (typeof window === 'undefined') return undefined;
    window.addEventListener(STUDENT_ACTIVITY_POSTED_EVENT, load);
    return () => window.removeEventListener(STUDENT_ACTIVITY_POSTED_EVENT, load);
  }, [load]);

  const counts = useMemo(() => countByDay(docs || []), [docs]);
  const total = docs ? docs.length : 0;

  let caption = `${total} activities (${WINDOW_DAYS} days) · ${total} 次活动（近${WINDOW_DAYS}天）`;
  if (docs === null) caption = offline ? 'Activity unavailable (backend offline)' : 'Loading activity…';

  return (
    <div style={{marginTop: '0.6rem'}}>
      <div style={{display: 'flex', gap: 3}} aria-label={`Activity, last ${WINDOW_DAYS} days`}>
        {days.map((day) => (
          <HeatCell key={day} count={counts[day] || 0} size={18} title={`${day}: ${counts[day] || 0}`} />
        ))}
      </div>
      <div style={{marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)'}}>
        {caption}
      </div>
    </div>
  );
}
