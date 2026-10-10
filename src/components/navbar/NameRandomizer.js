import React, {useCallback, useEffect, useState} from 'react';
import {pinyin} from 'pinyin-pro';
import {
  CLASS_ROSTERS,
  NAME_PINYIN_OVERRIDES,
} from '@site/src/data/classRosters';
import {useActiveClassRoster} from '@site/src/components/navbar/useActiveClassRoster';
import {
  CLASS_BEHAVIOR_CHANGE_EVENT,
  getDailyBehavior,
  localDateKey,
  pickWeightedStudent,
} from '@site/src/data/classBehaviorDb';
import {readPickSession, rememberPick} from '@site/src/components/navbar/pickSession';

export function nameToPinyin(name) {
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

  const onPick = async () => {
    setBusy(true);
    setPoolNote('');
    try {
      const record = (await loadBehavior()) || behavior;
      const avoid = readPickSession().byRoster?.[rosterId]?.name || null;
      const next = pickWeightedStudent(roster?.names || [], record, avoid);
      if (!next) {
        setPoolNote('No students left in today’s pool (all marked absent).');
        return;
      }
      rememberPick({rosterId, name: next});
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
  );
}
