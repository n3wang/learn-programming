import React, {useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import Confetti from 'react-confetti';
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
import {UI_LANG_CHANGE_EVENT, readUiLang} from '@site/src/components/Translate/translateClient';

const COPY = {
  en: {
    ariaDock: 'Last picked students',
    hideDock: 'Hide picked students',
    pickRandom: 'Pick a random student',
    pickRandomTitle: (course) => `Pick a random student from ${course}`,
    noStudent: 'Tap to pick',
    plusTitle: '+1 point',
    minusTitle: '−1 point',
    absent: 'Absent',
    absentTitle: "Exclude from today’s pool",
    absentMark: 'absent',
    lastPicked: 'Last picked',
    pickHint: (course) => `Tap the name or dice to draw from ${course}.`,
    noneLeft: 'No students left in this course (all marked absent).',
  },
  'zh-CN': {
    ariaDock: '已抽学生',
    hideDock: '隐藏已抽学生',
    pickRandom: '随机抽取学生',
    pickRandomTitle: (course) => `从${course}随机抽取`,
    noStudent: '点击抽取',
    plusTitle: '+1 分',
    minusTitle: '−1 分',
    absent: '缺席',
    absentTitle: '今日不参与抽取',
    absentMark: '缺席',
    lastPicked: '上次抽到',
    pickHint: (course) => `点击姓名或骰子，从${course}抽取。`,
    noneLeft: '本班没有可抽学生（均已标为缺席）。',
  },
};

function RandomDiceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="8.2" cy="8.2" r="1.35" fill="currentColor" />
      <circle cx="15.8" cy="8.2" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      <circle cx="8.2" cy="15.8" r="1.35" fill="currentColor" />
      <circle cx="15.8" cy="15.8" r="1.35" fill="currentColor" />
    </svg>
  );
}

function dockCopy(lang) {
  return COPY[lang] || COPY.en;
}

function actionMeta(lang) {
  const t = dockCopy(lang);
  return {
    plus: {mark: '+', color: '#2e7d32'},
    minus: {mark: '−', color: '#c62828'},
    absent: {mark: t.absentMark, color: '#c62828'},
  };
}

const FEEDBACK_FACES = {
  plus: [
    '/img/feedback_faces/happy/ok_1.png',
    '/img/feedback_faces/happy/ok_2.gif',
    '/img/feedback_faces/happy/ok_3.gif',
    '/img/feedback_faces/happy/ok_4.png',
    '/img/feedback_faces/happy/ok_5.gif',
    '/img/feedback_faces/happy/ok_6.gif',
    '/img/feedback_faces/happy/ok_7.gif',
    '/img/feedback_faces/happy/ok_8.gif',
  ],
  minus: [
    '/img/feedback_faces/dis/dis_1.png',
    '/img/feedback_faces/dis/dis_2.gif',
    '/img/feedback_faces/dis/dis_3.png',
    '/img/feedback_faces/dis/dis_4.gif',
    '/img/feedback_faces/dis/dis_5.png',
    '/img/feedback_faces/dis/dis_6.png',
    '/img/feedback_faces/dis/dis_7.png',
    '/img/feedback_faces/dis/dis_8.png',
    '/img/feedback_faces/dis/dis_9.png',
    '/img/feedback_faces/dis/dis_10.gif',
    '/img/feedback_faces/dis/dis_11.gif',
    '/img/feedback_faces/dis/dis_12.png',
  ],
};

const FEEDBACK_FACE_MS = 1200;
const FEEDBACK_CONFETTI_MS = 1200;
const FEEDBACK_Z = 1000;

const FEEDBACK_FACE_ALPHA = 0.65;

const FEEDBACK_OVERLAY_STYLE = `
@keyframes studentPickFaceBackdrop {
  0% { opacity: 0; }
  12% { opacity: 1; }
  78% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes studentPickFacePop {
  0% { opacity: 0; }
  14% { opacity: ${FEEDBACK_FACE_ALPHA}; }
  78% { opacity: ${FEEDBACK_FACE_ALPHA}; }
  100% { opacity: 0; }
}
`;

function pickFeedbackFace(action) {
  const faces = FEEDBACK_FACES[action];
  if (!faces?.length) {
    return null;
  }
  return faces[Math.floor(Math.random() * faces.length)];
}

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
  const [faceFeedback, setFaceFeedback] = useState(null);
  const [confettiBurst, setConfettiBurst] = useState(null);
  const [viewport, setViewport] = useState({width: 0, height: 0});
  const [uiLang, setUiLang] = useState(() => readUiLang());
  const dateKey = localDateKey();
  const t = dockCopy(uiLang);
  const ACTION_META = actionMeta(uiLang);

  useEffect(() => {
    const onSession = (event) => {
      setSession(event?.detail || readPickSession());
    };
    window.addEventListener(PICK_SESSION_EVENT, onSession);
    return () => window.removeEventListener(PICK_SESSION_EVENT, onSession);
  }, []);

  useEffect(() => {
    const sync = (event) => setUiLang(event?.detail?.lang || readUiLang());
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      setViewport({width: window.innerWidth, height: window.innerHeight});
    };
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
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

  useEffect(() => {
    if (!faceFeedback) {
      return undefined;
    }
    const timer = window.setTimeout(() => setFaceFeedback(null), FEEDBACK_FACE_MS);
    return () => window.clearTimeout(timer);
  }, [faceFeedback]);

  useEffect(() => {
    if (!confettiBurst) {
      return undefined;
    }
    const timer = window.setTimeout(() => setConfettiBurst(null), FEEDBACK_CONFETTI_MS);
    return () => window.clearTimeout(timer);
  }, [confettiBurst]);

  const showFaceOverlay = (action) => {
    const faceSrc = pickFeedbackFace(action);
    const passing = action === 'plus';
    const key = Date.now();
    if (faceSrc) {
      setFaceFeedback({
        src: faceSrc,
        passing,
        key,
      });
    }
    // Always reset confetti: keep a prior + burst from flashing on −.
    setConfettiBurst(passing ? {key} : null);
  };

  const showBackdrop = Boolean(faceFeedback && !faceFeedback.passing);

  const feedbackPortal =
    typeof document !== 'undefined' && (faceFeedback || confettiBurst)
      ? createPortal(
          <div
            key={faceFeedback?.key || confettiBurst?.key}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: FEEDBACK_Z,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              background: showBackdrop ? 'rgba(140, 0, 0, 0.72)' : 'transparent',
              animation: showBackdrop
                ? `studentPickFaceBackdrop ${FEEDBACK_FACE_MS}ms ease both`
                : 'none',
              pointerEvents: 'none',
            }}
          >
            <style>{FEEDBACK_OVERLAY_STYLE}</style>
            {confettiBurst && (!faceFeedback || faceFeedback.passing) && viewport.width > 0 ? (
              <Confetti
                width={viewport.width}
                height={viewport.height}
                numberOfPieces={420}
                recycle={false}
                gravity={0.45}
                friction={0.96}
                tweenDuration={180}
                initialVelocityX={{min: -28, max: 28}}
                initialVelocityY={{min: -42, max: 8}}
                confettiSource={{
                  x: viewport.width / 2 - 8,
                  y: viewport.height / 2 - 8,
                  w: 16,
                  h: 16,
                }}
                style={{position: 'fixed', inset: 0, pointerEvents: 'none'}}
              />
            ) : null}
            {faceFeedback ? (
              <img
                src={faceFeedback.src}
                alt=""
                style={{
                  width: 'min(22rem, 72vw)',
                  height: 'min(22rem, 72vw)',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  border: 'none',
                  background: 'transparent',
                  animation: `studentPickFacePop ${FEEDBACK_FACE_MS}ms ease both`,
                }}
              />
            ) : null}
          </div>,
          document.body,
        )
      : null;

  const slot = session.byRoster?.[rosterId] || null;
  const current = slot?.name || '';
  if (!isAdmin || !session.open) {
    return feedbackPortal;
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
    if (action === 'plus' || action === 'minus') {
      showFaceOverlay(action);
    }
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
        setNote(t.noneLeft);
        return;
      }
      setSession(rememberPick({rosterId, name: next}));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    {feedbackPortal}
    <aside
      aria-label={t.ariaDock}
      lang={uiLang === 'zh-CN' ? 'zh-CN' : undefined}
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
          aria-label={t.pickRandom}
          title={t.pickRandomTitle(courseLabel)}
          disabled={busy}
          onClick={onPickAgain}
          style={{
            width: '1.4rem',
            height: '1.4rem',
            borderRadius: 6,
            color: 'var(--ifm-color-emphasis-700)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: busy ? 0.5 : 1,
          }}
        >
          <RandomDiceIcon />
        </button>
        <button
          type="button"
          className="clean-btn"
          aria-label={t.hideDock}
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
        <button
          type="button"
          className="clean-btn"
          onClick={onPickAgain}
          disabled={busy}
          title={t.pickRandomTitle(courseLabel)}
          aria-label={t.pickRandom}
          style={{
            width: '100%',
            fontSize: '1.35rem',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'inherit',
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.65 : 1,
            borderRadius: 8,
            padding: '0.15rem 0.25rem',
          }}
        >
          {current || t.noStudent}
        </button>
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
          title={t.plusTitle}
        >
          +
        </button>
        <button
          type="button"
          className="button button--sm button--danger"
          disabled={busy || !current}
          onClick={() => onAction('minus')}
          title={t.minusTitle}
        >
          −
        </button>
        <button
          type="button"
          className="button button--sm button--secondary"
          disabled={busy || !current}
          onClick={() => onAction('absent')}
          title={t.absentTitle}
        >
          {t.absent}
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
            letterSpacing: uiLang === 'zh-CN' ? '0.02em' : '0.04em',
            textTransform: uiLang === 'zh-CN' ? 'none' : 'uppercase',
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          {t.lastPicked}
        </div>
        {rows.length === 0 ? (
          <div style={{fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)'}}>
            {t.pickHint(courseLabel)}
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
                    minWidth: action === 'absent' ? (uiLang === 'zh-CN' ? 28 : 42) : 12,
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
    </>
  );
}
