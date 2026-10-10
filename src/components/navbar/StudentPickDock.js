import React, {useCallback, useEffect, useState} from 'react';
import {CLASS_ROSTERS, NAME_APPROX_OVERRIDES} from '@site/src/data/classRosters';
import {
  applyStudentBehavior,
  CLASS_BEHAVIOR_CHANGE_EVENT,
  getDailyBehavior,
  localDateKey,
  pickWeightedStudent,
  recentPickHistory,
} from '@site/src/data/classBehaviorDb';
import {useActiveClassRoster} from '@site/src/components/navbar/useActiveClassRoster';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {nameToPinyin} from '@site/src/components/navbar/NameRandomizer';
import {
  PICK_SESSION_EVENT,
  clearPickSession,
  readPickSession,
  rememberPick,
} from '@site/src/components/navbar/pickSession';

const ACTION_META = {
  plus: {mark: '+', color: '#2e7d32'},
  minus: {mark: '−', color: '#f9a825'},
  absent: {mark: 'absent', color: '#c62828'},
};

function todayPoints(students, name) {
  const points = Number(students?.[name]?.points);
  return Number.isFinite(points) ? points : 0;
}

function latestAction(history, name) {
  const row = (history || []).find((item) => item?.name === name);
  return row?.action || null;
}

export default function StudentPickDock() {
  const {isAdmin} = useSiteAuth();
  const {rosterId, roster} = useActiveClassRoster();
  const [session, setSession] = useState(readPickSession);
  const [behavior, setBehavior] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const dateKey = localDateKey();

  useEffect(() => {
    const onSession = (event) => {
      setSession(event?.detail || readPickSession());
    };
    window.addEventListener(PICK_SESSION_EVENT, onSession);
    return () => window.removeEventListener(PICK_SESSION_EVENT, onSession);
  }, []);

  const loadBehavior = useCallback(async () => {
    const record = await getDailyBehavior(dateKey, rosterId);
    setBehavior(record);
    return record;
  }, [dateKey, rosterId]);

  useEffect(() => {
    if (!isAdmin || !session.open) {
      return undefined;
    }
    let cancelled = false;
    loadBehavior().then((record) => {
      if (!cancelled) {
        setBehavior(record);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, session.open, loadBehavior]);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    const onChange = (event) => {
      const detail = event?.detail || {};
      if (detail.date && detail.date !== dateKey) {
        return;
      }
      if (detail.rosterId && detail.rosterId !== rosterId) {
        return;
      }
      if (detail.record) {
        setBehavior(detail.record);
      } else {
        loadBehavior();
      }
    };
    window.addEventListener(CLASS_BEHAVIOR_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CLASS_BEHAVIOR_CHANGE_EVENT, onChange);
  }, [isAdmin, dateKey, rosterId, loadBehavior]);

  const slot = session.byRoster?.[rosterId] || null;
  const current = slot?.name || '';
  if (!isAdmin || !session.open) {
    return null;
  }

  const history = recentPickHistory(behavior, 8);
  const rows = slot?.recent?.length ? slot.recent : current ? [current] : [];
  const courseLabel = roster?.label || CLASS_ROSTERS[rosterId]?.label || rosterId;
  const pronunciation = current ? nameToPinyin(current) : '';
  const approx = current ? NAME_APPROX_OVERRIDES[current] : '';

  const onAction = async (action) => {
    if (!current || busy) {
      return;
    }
    setBusy(true);
    setNote('');
    try {
      const nextRecord = await applyStudentBehavior({
        dateKey,
        rosterId,
        name: current,
        action,
      });
      setBehavior(nextRecord);
    } finally {
      setBusy(false);
    }
  };

  const onPickAgain = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setNote('');
    try {
      const record = (await loadBehavior()) || behavior;
      const next = pickWeightedStudent(roster?.names || [], record, current || null);
      if (!next) {
        setNote('No students left in this course (all marked absent).');
        return;
      }
      setSession(rememberPick({rosterId, name: next}));
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside
      aria-label="Last picked students"
      style={{
        position: 'fixed',
        left: '1rem',
        bottom: '1rem',
        zIndex: 180,
        width: 'min(18rem, calc(100vw - 2rem))',
        padding: '0.7rem 0.75rem 0.75rem',
        borderRadius: 12,
        border: '1px solid var(--ifm-color-emphasis-200)',
        background: 'var(--ifm-background-surface-color)',
        color: 'var(--ifm-font-color-base)',
        boxShadow: 'var(--ifm-global-shadow-md)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          {courseLabel}
        </div>
        <button
          type="button"
          className="clean-btn"
          aria-label="Hide picked students"
          onClick={() => setSession(clearPickSession())}
          style={{
            width: '1.4rem',
            height: '1.4rem',
            borderRadius: 6,
            color: 'var(--ifm-color-emphasis-700)',
            fontSize: '1rem',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div style={{marginTop: '0.35rem', textAlign: 'center'}}>
        <div style={{fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.2}}>
          {current || 'No student yet'}
        </div>
        {pronunciation ? (
          <div style={{marginTop: '0.2rem', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)'}}>
            {pronunciation}
          </div>
        ) : null}
        {approx ? (
          <div
            style={{
              marginTop: '0.1rem',
              fontSize: '0.75rem',
              color: 'var(--ifm-color-emphasis-600)',
              fontStyle: 'italic',
            }}
          >
            {approx}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          justifyContent: 'center',
          marginTop: '0.65rem',
        }}
      >
        <button
          type="button"
          className="button button--sm button--success"
          disabled={busy || !current}
          onClick={() => onAction('plus')}
          title="+1 point"
        >
          +
        </button>
        <button
          type="button"
          className="button button--sm button--warning"
          disabled={busy || !current}
          onClick={() => onAction('minus')}
          title="−1 point"
        >
          −
        </button>
        <button
          type="button"
          className="button button--sm button--secondary"
          disabled={busy || !current}
          onClick={() => onAction('absent')}
          title="Exclude from today’s pool"
        >
          Absent
        </button>
        <button
          type="button"
          className="button button--sm button--primary"
          disabled={busy}
          onClick={onPickAgain}
          title={`Pick again from ${courseLabel}`}
        >
          Pick again
        </button>
      </div>

      {note ? (
        <div style={{marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--ifm-color-danger)'}}>
          {note}
        </div>
      ) : null}

      <div style={{marginTop: '0.7rem', display: 'grid', gap: '0.28rem'}}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          Last picked
        </div>
        {rows.length === 0 ? (
          <div style={{fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)'}}>
            Pick again to draw from {courseLabel}.
          </div>
        ) : (
          rows.map((name, index) => {
            const action = latestAction(history, name);
            const meta = action ? ACTION_META[action] : null;
            const score = todayPoints(behavior?.students, name);
            return (
              <div
                key={`${name}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: name === current ? 700 : 500,
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    color: meta?.color || 'var(--ifm-color-emphasis-500)',
                    fontWeight: 700,
                    minWidth: action === 'absent' ? 42 : 12,
                    textAlign: 'center',
                  }}
                >
                  {meta?.mark || '·'}
                </span>
                <span
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 18,
                    textAlign: 'right',
                  }}
                >
                  {score > 0 ? `+${score}` : score}
                </span>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
