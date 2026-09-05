import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {pinyin} from 'pinyin-pro';
import {
  CLASS_ROSTERS,
  NAME_APPROX_OVERRIDES,
  NAME_PINYIN_OVERRIDES,
} from '@site/src/data/classRosters';
import {useActiveClassRoster} from '@site/src/components/navbar/useActiveClassRoster';
import {
  applyStudentBehavior,
  CLASS_BEHAVIOR_CHANGE_EVENT,
  getDailyBehavior,
  localDateKey,
  pickWeightedStudent,
} from '@site/src/data/classBehaviorDb';

function nameToPinyin(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  if (NAME_PINYIN_OVERRIDES[name]) {
    return NAME_PINYIN_OVERRIDES[name];
  }
  try {
    return pinyin(name, {
      toneType: 'symbol',
      type: 'array',
      mode: 'surname',
    })
      .map((syllable, index) => {
        if (!syllable) {
          return '';
        }
        if (index === 0) {
          return syllable.charAt(0).toUpperCase() + syllable.slice(1);
        }
        return syllable;
      })
      .join(' ');
  } catch {
    return '';
  }
}

export default function NameRandomizer() {
  const rosterIds = Object.keys(CLASS_ROSTERS);
  const {rosterId, setRosterId, roster} = useActiveClassRoster();
  const [picked, setPicked] = useState(null);
  const [awaitingAction, setAwaitingAction] = useState(false);
  const [behavior, setBehavior] = useState(null);
  const [busy, setBusy] = useState(false);
  const [poolNote, setPoolNote] = useState('');
  const dateKey = localDateKey();

  const loadBehavior = useCallback(async () => {
    const record = await getDailyBehavior(dateKey, rosterId);
    setBehavior(record);
    return record;
  }, [dateKey, rosterId]);

  useEffect(() => {
    let cancelled = false;
    setPicked(null);
    setAwaitingAction(false);
    setPoolNote('');
    loadBehavior().then((record) => {
      if (cancelled) {
        return;
      }
      setBehavior(record);
    });
    return () => {
      cancelled = true;
    };
  }, [loadBehavior]);

  useEffect(() => {
    if (typeof window === 'undefined') {
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
  }, [dateKey, rosterId, loadBehavior]);

  const pronunciation = useMemo(
    () => (picked ? nameToPinyin(picked) : ''),
    [picked],
  );
  const approx = picked ? NAME_APPROX_OVERRIDES[picked] : '';

  const activeCount = useMemo(() => {
    const names = Array.isArray(roster?.names) ? roster.names : [];
    const students = behavior?.students || {};
    return names.filter((name) => !students?.[name]?.absent).length;
  }, [roster, behavior]);

  const onPick = async () => {
    setBusy(true);
    setPoolNote('');
    try {
      const record = (await loadBehavior()) || behavior;
      const next = pickWeightedStudent(roster?.names || [], record, picked);
      if (!next) {
        setPicked(null);
        setAwaitingAction(false);
        setPoolNote('No students left in today’s pool (all marked absent).');
        return;
      }
      setPicked(next);
      setAwaitingAction(true);
    } finally {
      setBusy(false);
    }
  };

  const onAction = async (action) => {
    if (!picked || !awaitingAction || busy) {
      return;
    }
    setBusy(true);
    try {
      await applyStudentBehavior({
        dateKey,
        rosterId,
        name: picked,
        action,
      });
      setAwaitingAction(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          marginBottom: '0.55rem',
          flexWrap: 'wrap',
        }}
        role="group"
        aria-label="Class list"
      >
        {rosterIds.map((id) => {
          const active = id === rosterId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setRosterId(id);
                setPicked(null);
                setAwaitingAction(false);
                setPoolNote('');
              }}
              aria-pressed={active}
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                background: active
                  ? 'var(--ifm-color-primary)'
                  : 'var(--ifm-background-surface-color)',
                color: active
                  ? 'var(--ifm-color-white)'
                  : 'var(--ifm-font-color-base)',
                fontWeight: active ? 700 : 500,
                borderRadius: 8,
                fontSize: '0.85rem',
                padding: '0.3rem 0.55rem',
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              {CLASS_ROSTERS[id]?.label || id}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="button button--sm button--primary"
        onClick={onPick}
        disabled={busy}
        style={{width: '100%'}}
      >
        Pick student
      </button>

      <div
        aria-live="polite"
        style={{
          marginTop: '0.75rem',
          minHeight: '4.25rem',
          padding: '0.65rem 0.7rem',
          borderRadius: 10,
          border: '1px solid var(--ifm-color-emphasis-200)',
          background: 'var(--ifm-color-emphasis-100)',
          textAlign: 'center',
        }}
      >
        {picked ? (
          <>
            <div
              style={{
                fontSize: '1.55rem',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '0.02em',
              }}
            >
              {picked}
            </div>
            <div
              style={{
                marginTop: '0.35rem',
                fontSize: '0.95rem',
                color: 'var(--ifm-color-emphasis-700)',
              }}
            >
              {pronunciation}
            </div>
            {approx ? (
              <div
                style={{
                  marginTop: '0.2rem',
                  fontSize: '0.8rem',
                  color: 'var(--ifm-color-emphasis-600)',
                  fontStyle: 'italic',
                }}
              >
                {approx}
              </div>
            ) : null}

            {awaitingAction ? (
              <div
                style={{
                  display: 'flex',
                  gap: '0.4rem',
                  justifyContent: 'center',
                  marginTop: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="button button--sm button--success"
                  disabled={busy}
                  onClick={() => onAction('plus')}
                  title="+1 point"
                >
                  +
                </button>
                <button
                  type="button"
                  className="button button--sm button--warning"
                  disabled={busy}
                  onClick={() => onAction('minus')}
                  title="−1 point"
                >
                  −
                </button>
                <button
                  type="button"
                  className="button button--sm button--secondary"
                  disabled={busy}
                  onClick={() => onAction('absent')}
                  title="Exclude from today’s pool"
                >
                  Absent
                </button>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '0.55rem',
                  fontSize: '0.75rem',
                  color: 'var(--ifm-color-emphasis-600)',
                }}
              >
                Saved for {dateKey}. Pick again when ready.
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--ifm-color-emphasis-600)',
              paddingTop: '0.55rem',
            }}
          >
            {roster?.label || 'Class'} · {activeCount}/
            {Array.isArray(roster?.names) ? roster.names.length : 0} in pool
            <div style={{marginTop: '0.25rem', fontSize: '0.75rem'}}>
              {dateKey} · lower points = higher pick chance
            </div>
            {poolNote ? (
              <div
                style={{
                  marginTop: '0.45rem',
                  color: 'var(--ifm-color-danger)',
                  fontSize: '0.8rem',
                }}
              >
                {poolNote}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
