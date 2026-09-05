import React, {useMemo, useState} from 'react';
import {pinyin} from 'pinyin-pro';
import {
  CLASS_ROSTERS,
  NAME_PINYIN_OVERRIDES,
} from '@site/src/data/classRosters';

function nameToPinyin(name) {
  if (NAME_PINYIN_OVERRIDES[name]) {
    return NAME_PINYIN_OVERRIDES[name];
  }
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
}

function pickRandom(names, avoid) {
  if (names.length === 0) {
    return null;
  }
  if (names.length === 1) {
    return names[0];
  }
  let next = names[Math.floor(Math.random() * names.length)];
  // Avoid immediately repeating the same student when possible.
  for (let i = 0; i < 8 && next === avoid; i += 1) {
    next = names[Math.floor(Math.random() * names.length)];
  }
  return next;
}

export default function NameRandomizer() {
  const rosterIds = Object.keys(CLASS_ROSTERS);
  const [rosterId, setRosterId] = useState(rosterIds[0]);
  const [picked, setPicked] = useState(null);

  const roster = CLASS_ROSTERS[rosterId];
  const pronunciation = useMemo(
    () => (picked ? nameToPinyin(picked) : ''),
    [picked],
  );

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
              {CLASS_ROSTERS[id].label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="button button--sm button--primary"
        onClick={() => setPicked(pickRandom(roster.names, picked))}
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
          </>
        ) : (
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--ifm-color-emphasis-600)',
              paddingTop: '0.85rem',
            }}
          >
            {roster.label} · {roster.names.length} students
          </div>
        )}
      </div>
    </div>
  );
}
