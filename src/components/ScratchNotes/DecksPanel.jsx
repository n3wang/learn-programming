import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {CARDS, CATEGORIES, DECKS, localizeCard} from '@site/src/data/cards';
import {bestMatch, charDiff} from './cardMatch';
import styles from './styles.module.css';

const TERM_LIMIT = 60;
const LANGUAGES = [
  {id: 'en', label: 'English'},
  {id: 'zh-Hans', label: '中文'},
];
const ALT_LOCALE = {en: 'zh-Hans', 'zh-Hans': 'en'};

/** Practice modes shown as buttons; add new ones here as they are built. */
const PRACTICE_MODES = [
  {id: 'definition', label: 'Definition'},
  {id: 'translate', label: 'Translate'},
];

function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cardMatches(card, q) {
  if (!q) {
    return true;
  }
  const zh = card.translations?.['zh-Hans'] || {};
  const hay = [card.term, card.definition, card.example, card.prompt, card.answer, zh.term, zh.definition]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  return hay.includes(q);
}

function categoryLabel(path, locale) {
  const row = CATEGORIES[path];
  if (!row) {
    return path.split('/').pop();
  }
  return row.translations?.[locale]?.label || row.label;
}

function deckTitle(deck, locale) {
  return deck.translations?.[locale]?.title || deck.title;
}

/** The other-language term shown beside the main one, if any. */
function altTerm(card, locale) {
  const alt = ALT_LOCALE[locale];
  if (alt === 'en') {
    return card.translations?.[locale] ? card.term : '';
  }
  return card.translations?.[alt]?.term || '';
}

/** Card image from the deck JSON; hides itself if the URL fails. */
function CardImage({card, size = 'small'}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [card.image]);
  if (!card.image || failed) {
    return null;
  }
  return (
    <img
      className={size === 'large' ? styles.cardImageLarge : styles.cardImage}
      src={card.image}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function CardDetail({card, locale, onNavigate, showImage = true}) {
  const shown = localizeCard(card, locale);
  const alt = ALT_LOCALE[locale];
  const altText = alt === 'en' ? card : card.translations?.[alt];
  return (
    <div className={styles.termDetail}>
      {showImage ? <CardImage card={card} /> : null}
      <p className={styles.termDefinition}>{shown.definition}</p>
      {card.example ? <p className={styles.termExample}>{card.example}</p> : null}
      {altText && altText.definition !== shown.definition ? (
        <p className={styles.termAlt}>
          {altText.term} — {altText.definition}
        </p>
      ) : null}
      {card.link ? (
        <Link className={styles.wikiLesson} to={card.link} onClick={onNavigate}>
          Open lesson
        </Link>
      ) : null}
    </div>
  );
}

function hasTranslation(card, langs) {
  return langs.every((id) => id === 'en' || Boolean(card.translations?.[id]?.term));
}

/** Character diff of the typed answer against the matched spelling. */
function DiffLine({parts}) {
  return (
    <span className={styles.diffLine}>
      {parts.map((part, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={
            part.type === 'same' ? styles.diffSame : part.type === 'extra' ? styles.diffExtra : styles.diffMissing
          }>
          {part.text}
        </span>
      ))}
    </span>
  );
}

/** write → choice → choice→write (staged: learn by recognition first, then recall). */
const ANSWER_MODES = ['write', 'choice', 'staged'];
const ANSWER_MODE_LABEL = {write: 'write', choice: 'choice', staged: 'choice → write'};

const SETTINGS_KEY = 'cards-practice-settings';
const DEFAULT_SETTINGS = {
  queueSize: 10,
  choices: 4,
  passPercent: 90,
  playAndStudy: false,
};
const SETTING_OPTIONS = {
  queueSize: [3, 5, 10, 20, 0],
  choices: [3, 4, 5, 6],
  passPercent: [70, 80, 90, 100],
  playAndStudy: [false, true],
};

/** Study block ends after either 5 learned terms or 5 minutes, then a 5-minute break. */
const PLAY_STUDY_TERMS = 5;
const PLAY_STUDY_MS = 5 * 60 * 1000;
const PLAY_BREAK_MS = 5 * 60 * 1000;

function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Soft alert beep; caller stops via returned handle. Loops until stop(). */
function startContinueAlarm() {
  let ctx = null;
  let timer = null;
  let stopped = false;

  const beep = () => {
    if (stopped) {
      return;
    }
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) {
          return;
        }
        ctx = new AC();
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // autoplay / audio restrictions: UI still works
    }
  };

  beep();
  timer = window.setInterval(beep, 1600);

  return {
    stop() {
      stopped = true;
      if (timer != null) {
        window.clearInterval(timer);
        timer = null;
      }
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
    },
  };
}

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? {...DEFAULT_SETTINGS, ...JSON.parse(raw)} : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(next) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // private mode / blocked storage: keep settings for this session only
  }
}

function startStage(answerMode, translate) {
  if (translate) {
    return 'write';
  }
  return answerMode === 'staged' ? 'choice' : answerMode;
}

/** Split a pool into the active learning queue (≤ size) and the waiting backlog. */
function buildQueue(pool, size, stage) {
  const cards = shuffle(pool);
  const n = size > 0 ? size : cards.length;
  return {
    queue: cards.slice(0, n).map((card) => ({card, stage})),
    backlog: cards.slice(n),
  };
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function SettingRow({label, hint, value, options, format, onChange}) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingLabel}>
        {label}
        {hint ? <span className={styles.settingHint}>{hint}</span> : null}
      </div>
      <div className={styles.filters}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={value === opt ? styles.filterOn : styles.filter}
            onClick={() => onChange(opt)}>
            {format ? format(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * One card at a time from a small learning queue; new cards join as others are learned.
 * Answer modes (definition): write · choice · choice→write. Translate is always write.
 * Keys: Enter reveal/check · 1–n pick (choice) · after reveal 0 retry · 1 again · 2 got it ·
 * Enter = automatic verdict (spelling check or chosen option).
 */
function Practice({mode, pool: fullPool, initialLang, title, onBack, onNavigate}) {
  const translate = mode === 'translate';
  const languages = useMemo(
    () => LANGUAGES.filter((l) => l.id === 'en' || fullPool.some((c) => c.translations?.[l.id])),
    [fullPool],
  );
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const [toLang, setToLang] = useState(() => {
    const other = languages.find((l) => l.id !== initialLang);
    return other ? other.id : initialLang;
  });
  const [answerMode, setAnswerMode] = useState('write');
  const pool = useMemo(
    () => (translate ? fullPool.filter((c) => hasTranslation(c, [lang, toLang])) : fullPool),
    [translate, fullPool, lang, toLang],
  );
  const [session, setSession] = useState(() =>
    buildQueue(pool, settings.queueSize, startStage('write', translate)),
  );
  const [revealed, setRevealed] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [picked, setPicked] = useState(null);
  const [attempt, setAttempt] = useState('');
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState(0);
  const [turn, setTurn] = useState(0);
  const [studyPhase, setStudyPhase] = useState('study'); // study | break | alarm
  const [studyTerms, setStudyTerms] = useState(0);
  const [studyStartedAt, setStudyStartedAt] = useState(() => Date.now());
  const [breakEndsAt, setBreakEndsAt] = useState(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const inputRef = useRef(null);
  const alarmRef = useRef(null);
  const total = pool.length;
  const entry = session.queue[0] || null;
  const card = entry?.card || null;
  const stage = entry?.stage || 'write';
  const choice = !translate && stage === 'choice';
  const playAndStudy = Boolean(settings.playAndStudy);

  function resetCard() {
    setRevealed(false);
    setAttempt('');
    setPicked(null);
    setTurn((n) => n + 1);
  }

  function reveal() {
    setRevealed(true);
    inputRef.current?.blur();
  }

  function stopAlarm() {
    alarmRef.current?.stop?.();
    alarmRef.current = null;
  }

  function beginStudyBlock() {
    stopAlarm();
    setStudyPhase('study');
    setStudyTerms(0);
    setStudyStartedAt(Date.now());
    setBreakEndsAt(null);
  }

  function beginBreak() {
    stopAlarm();
    setStudyPhase('break');
    setBreakEndsAt(Date.now() + PLAY_BREAK_MS);
  }

  function beginAlarm() {
    setStudyPhase('alarm');
    setBreakEndsAt(null);
    if (!alarmRef.current) {
      alarmRef.current = startContinueAlarm();
    }
  }

  function continueAfterBreak() {
    beginStudyBlock();
  }

  function grade(gotIt) {
    if (!entry || studyPhase !== 'study') {
      return;
    }
    setSession(({queue, backlog}) => {
      const [head, ...rest] = queue;
      if (!gotIt) {
        return {queue: [...rest, head], backlog};
      }
      if (answerMode === 'staged' && head.stage === 'choice') {
        // Recognised it: queue the same card again, this time to write.
        return {queue: [...rest, {...head, stage: 'write'}], backlog};
      }
      const [next, ...waiting] = backlog;
      const joined = next ? [{card: next, stage: startStage(answerMode, translate)}] : [];
      return {queue: [...rest, ...joined], backlog: waiting};
    });
    if (!gotIt) {
      setMissed((n) => n + 1);
    } else if (!(answerMode === 'staged' && entry.stage === 'choice')) {
      setKnown((n) => n + 1);
      if (playAndStudy) {
        setStudyTerms((n) => {
          const next = n + 1;
          if (next >= PLAY_STUDY_TERMS) {
            window.setTimeout(() => beginBreak(), 0);
          }
          return next;
        });
      }
    }
    resetCard();
  }

  /** Flip the same card back, clear the text, try again. Not counted as a miss. */
  function retry() {
    resetCard();
  }

  function restart(nextPool = pool, nextSettings = settings, nextMode = answerMode) {
    setSession(buildQueue(nextPool, nextSettings.queueSize, startStage(nextMode, translate)));
    setKnown(0);
    setMissed(0);
    resetCard();
  }

  function chooseDirection(from, to) {
    setLang(from);
    setToLang(to);
    restart(fullPool.filter((c) => hasTranslation(c, [from, to])));
  }

  function cycleAnswerMode() {
    const next = ANSWER_MODES[(ANSWER_MODES.indexOf(answerMode) + 1) % ANSWER_MODES.length];
    setAnswerMode(next);
    // Keep progress; just re-ask the active cards in the new style.
    const stageNow = startStage(next, translate);
    setSession(({queue, backlog}) => ({queue: queue.map((e) => ({...e, stage: stageNow})), backlog}));
    resetCard();
  }

  function updateSetting(key, value) {
    const next = {...settings, [key]: value};
    setSettings(next);
    saveSettings(next);
    if (key === 'queueSize') {
      restart(pool, next);
    }
    if (key === 'playAndStudy') {
      if (value) {
        beginStudyBlock();
      } else {
        stopAlarm();
        setStudyPhase('study');
        setBreakEndsAt(null);
        setStudyTerms(0);
      }
    }
  }

  // Each new card (including a re-queued one) starts with the cursor in the answer box.
  useEffect(() => {
    if (!revealed && !showSettings && studyPhase === 'study') {
      inputRef.current?.focus({preventScroll: true});
    }
  }, [turn, revealed, reverse, lang, showSettings, studyPhase]);

  // Play-and-study clock: end study after 5 minutes; end break after 5 minutes → alarm.
  useEffect(() => {
    if (!playAndStudy) {
      return undefined;
    }
    const id = window.setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      if (studyPhase === 'study' && now - studyStartedAt >= PLAY_STUDY_MS) {
        beginBreak();
      } else if (studyPhase === 'break' && breakEndsAt && now >= breakEndsAt) {
        beginAlarm();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [playAndStudy, studyPhase, studyStartedAt, breakEndsAt]);

  useEffect(() => () => stopAlarm(), []);

  useEffect(() => {
    if (!playAndStudy && studyPhase !== 'study') {
      beginStudyBlock();
    }
  }, [playAndStudy]);

  const shown = card ? localizeCard(card, lang) : null;
  const target = card && translate ? localizeCard(card, toLang) : null;
  const match = useMemo(
    () => (revealed && target ? bestMatch(attempt, target.term, settings.passPercent / 100) : null),
    [revealed, target, attempt, settings.passPercent],
  );

  // Multiple choice: the card plus random others, shown on the side opposite the front.
  const optionText = (c) => {
    const l = localizeCard(c, lang);
    if (card?.prompt) {
      return c.answer || l.term;
    }
    return reverse ? l.term : l.definition;
  };
  const options = useMemo(() => {
    if (!choice || !card) {
      return [];
    }
    const seen = new Set([optionText(card)]);
    const others = [];
    [shuffle(pool), shuffle(CARDS)].forEach((source) => {
      source.forEach((c) => {
        const text = optionText(c);
        if (others.length < settings.choices - 1 && c.id !== card.id && text && !seen.has(text)) {
          seen.add(text);
          others.push(c);
        }
      });
    });
    return shuffle([card, ...others]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choice, card?.id, turn, reverse, lang, settings.choices]);
  const correctIndex = options.findIndex((c) => c.id === card?.id);

  function pick(i) {
    if (revealed || !options[i]) {
      return;
    }
    setPicked(i);
    setRevealed(true);
  }

  /** Automatic verdict Enter accepts after reveal: spelling check or chosen option. */
  let verdict = null;
  if (revealed && translate && match) {
    verdict = match.pass;
  } else if (revealed && choice && picked !== null) {
    verdict = picked === correctIndex;
  }

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (showSettings || tag === 'INPUT' || tag === 'TEXTAREA' || event.isComposing) {
        return;
      }
      if (
        playAndStudy &&
        (studyPhase === 'alarm' || studyPhase === 'break') &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        continueAfterBreak();
        return;
      }
      if (playAndStudy && studyPhase !== 'study') {
        return;
      }
      const digit = /^[1-9]$/.test(event.key) ? Number(event.key) : null;
      if (choice && !revealed && digit && digit <= options.length) {
        event.preventDefault();
        pick(digit - 1);
      } else if (event.key === ' ' && card && !revealed && !choice) {
        event.preventDefault();
        reveal();
      } else if (revealed && ['0', '1', '2'].includes(event.key)) {
        // Swallow the key: the next card focuses the textbox before the keypress would land.
        event.preventDefault();
        if (event.key === '0') {
          retry();
        } else {
          grade(event.key === '2');
        }
      } else if (revealed && verdict !== null && event.key === 'Enter') {
        event.preventDefault();
        grade(verdict);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const modeLabel = PRACTICE_MODES.find((m) => m.id === mode)?.label || mode;
  const alt = card ? altTerm(card, lang) : '';
  const front = shown ? (card.prompt ? card.prompt : reverse ? shown.definition : shown.term) : '';
  const frontIsTerm = card && !card.prompt && !reverse;
  let expected = '';
  if (card && !translate) {
    expected = card.prompt ? card.answer || shown.term : reverse ? shown.term : shown.definition;
  }
  const langLabel = (id) => LANGUAGES.find((l) => l.id === id)?.label || id;
  const directions = translate
    ? languages.flatMap((a) => languages.filter((b) => b.id !== a.id).map((b) => [a.id, b.id]))
    : [];

  let placeholder = frontIsTerm ? 'Write the meaning in your own words (optional)' : 'Write the answer (optional)';
  if (translate) {
    placeholder = `Type the term in ${langLabel(toLang)}`;
  }

  return (
    <div className={styles.bodyEditor}>
      <div className={styles.noteBar}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h3 className={styles.wikiTitle}>
          {modeLabel} · {title}
        </h3>
        <span className={styles.rowDate}>
          {known}/{total}
        </span>
        <button
          type="button"
          className={showSettings ? styles.gearOn : styles.gear}
          aria-pressed={showSettings}
          aria-label="Practice settings"
          title="Practice settings"
          onClick={() => setShowSettings((v) => !v)}>
          <GearIcon />
        </button>
      </div>

      {showSettings ? (
        <div className={styles.wikiDetail}>
          <SettingRow
            label="Learning queue"
            hint="cards in rotation at once; new ones join as you learn"
            value={settings.queueSize}
            options={SETTING_OPTIONS.queueSize}
            format={(v) => (v === 0 ? 'all' : v)}
            onChange={(v) => updateSetting('queueSize', v)}
          />
          <SettingRow
            label="Choices"
            hint="options per multiple-choice question"
            value={settings.choices}
            options={SETTING_OPTIONS.choices}
            onChange={(v) => updateSetting('choices', v)}
          />
          <SettingRow
            label="Translate pass"
            hint="spelling similarity that counts as correct"
            value={settings.passPercent}
            options={SETTING_OPTIONS.passPercent}
            format={(v) => `${v}%`}
            onChange={(v) => updateSetting('passPercent', v)}
          />
          <SettingRow
            label="Play and study"
            hint="study 5 terms or 5 minutes, then a 5-minute break; alarm loops until you continue"
            value={settings.playAndStudy}
            options={SETTING_OPTIONS.playAndStudy}
            format={(v) => (v ? 'On' : 'Off')}
            onChange={(v) => updateSetting('playAndStudy', v)}
          />
          <p className={styles.choiceHint}>Saved on this device. Changing the queue size restarts the session.</p>
        </div>
      ) : playAndStudy && studyPhase !== 'study' ? (
        <div className={styles.wikiDetail}>
          <div className={styles.flashcard}>
            {studyPhase === 'break' ? (
              <>
                <p className={styles.flashText}>Break time</p>
                <p className={styles.queueInfo}>
                  Back in {formatCountdown((breakEndsAt || nowTick) - nowTick)}
                </p>
                <p className={styles.choiceHint}>5-minute rest. An alert will play when it is time to continue.</p>
                <div className={styles.flashActions}>
                  <button
                    type="button"
                    className={styles.wikiPracticeBtn}
                    onClick={continueAfterBreak}>
                    Skip break
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.flashText}>Break over — continue studying</p>
                <p className={styles.choiceHint}>Alert is playing until you continue.</p>
                <div className={styles.flashActions}>
                  <button
                    type="button"
                    className={styles.wikiPracticeBtn}
                    onClick={continueAfterBreak}>
                    Continue studying
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.wikiDetail}>
          {playAndStudy ? (
            <p className={styles.queueInfo}>
              Play &amp; study · {studyTerms}/{PLAY_STUDY_TERMS} terms ·{' '}
              {formatCountdown(PLAY_STUDY_MS - (nowTick - studyStartedAt))} left
            </p>
          ) : null}
          <div className={styles.filters}>
            {translate ? (
              directions.length === 2 ? (
                // Two languages: one button that flips the direction.
                <button
                  type="button"
                  className={styles.filterOn}
                  title="Click to flip direction"
                  onClick={() => chooseDirection(toLang, lang)}>
                  {langLabel(lang)} ⇄ {langLabel(toLang)}
                </button>
              ) : (
                directions.map(([from, to]) => (
                  <button
                    key={`${from}-${to}`}
                    type="button"
                    className={lang === from && toLang === to ? styles.filterOn : styles.filter}
                    onClick={() => chooseDirection(from, to)}>
                    {langLabel(from)} → {langLabel(to)}
                  </button>
                ))
              )
            ) : (
              <>
                <button
                  type="button"
                  className={styles.filterOn}
                  title="Click to flip direction"
                  onClick={() => setReverse((r) => !r)}>
                  {reverse ? 'meaning ⇄ term' : 'term ⇄ meaning'}
                </button>
                <button
                  type="button"
                  className={styles.filterOn}
                  title="Click to cycle: write → choice → choice then write"
                  onClick={cycleAnswerMode}>
                  {ANSWER_MODE_LABEL[answerMode]}
                </button>
                {languages.length > 1 ? (
                  <span className={styles.filterGroup}>
                    {/* One button cycling through the available languages. */}
                    <button
                      type="button"
                      className={styles.filterOn}
                      title="Click to switch language"
                      onClick={() => {
                        const i = languages.findIndex((l) => l.id === lang);
                        setLang(languages[(i + 1) % languages.length].id);
                      }}>
                      {langLabel(lang)}
                    </button>
                  </span>
                ) : null}
              </>
            )}
            {missed > 0 ? <span className={styles.pending}>again ×{missed}</span> : null}
          </div>

          {card ? (
            <>
              <div className={styles.flashcard}>
                {answerMode === 'staged' && !translate ? (
                  <span className={styles.stageTag}>
                    {stage === 'choice' ? 'step 1 · choose' : 'step 2 · write'}
                  </span>
                ) : null}
                {translate || frontIsTerm || card.prompt ? <CardImage card={card} size="large" /> : null}
                {translate ? (
                  <>
                    <p className={styles.flashTerm}>{shown.term}</p>
                    <p className={styles.flashDefinition}>{shown.definition}</p>
                  </>
                ) : (
                  <>
                    <p className={frontIsTerm ? styles.flashTerm : styles.flashText}>{front}</p>
                    {frontIsTerm && alt ? <p className={styles.termAltInline}>{alt}</p> : null}
                  </>
                )}
              </div>

              {choice ? (
                <ol className={styles.choices}>
                  {options.map((c, i) => {
                    let state = '';
                    if (revealed && i === correctIndex) {
                      state = styles.choiceRight;
                    } else if (revealed && i === picked) {
                      state = styles.choiceWrong;
                    }
                    const showsTerm = reverse || card.prompt;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`${styles.choice} ${state}`}
                          disabled={revealed}
                          onClick={() => pick(i)}>
                          <span className={styles.choiceKey}>{i + 1}</span>
                          {showsTerm ? <CardImage card={c} /> : null}
                          <span className={showsTerm ? styles.choiceTerm : styles.choiceText}>{optionText(c)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <textarea
                  ref={inputRef}
                  className={styles.attempt}
                  value={attempt}
                  onChange={(e) => setAttempt(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter while an IME (e.g. pinyin) is composing confirms the candidate; leave it alone.
                    if (e.nativeEvent.isComposing || e.keyCode === 229) {
                      return;
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      reveal();
                    }
                  }}
                  readOnly={revealed}
                  rows={translate ? 1 : 3}
                  placeholder={placeholder}
                  aria-label="Your answer"
                />
              )}

              {revealed ? (
                <>
                  {translate ? (
                    <div className={styles.answerCard}>
                      <div className={styles.compareHead}>{langLabel(toLang)}</div>
                      <p className={styles.flashTerm}>{target.term}</p>
                      <p className={styles.compareText}>{target.definition}</p>
                      {match ? (
                        <div className={styles.matchRow}>
                          {attempt.trim() ? (
                            <DiffLine parts={charDiff(attempt, match.target)} />
                          ) : (
                            <span className={styles.compareHead}>nothing typed</span>
                          )}
                          <span className={match.pass ? styles.matchPass : styles.matchFail}>
                            {Math.round(match.score * 100)}% · {match.pass ? 'pass' : 'not yet'}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : choice ? null : (
                    <div className={styles.answerCard}>
                      <div className={styles.compareHead}>answer</div>
                      <p className={styles.compareText}>
                        {expected}
                        {reverse && !card.prompt && alt ? <span className={styles.termAltInline}> · {alt}</span> : null}
                      </p>
                    </div>
                  )}
                  {!translate && !choice && !frontIsTerm && !card.prompt ? <CardImage card={card} size="large" /> : null}
                  {card.example ? <p className={styles.termExample}>{card.example}</p> : null}
                  {card.link ? (
                    <Link className={styles.wikiLesson} to={card.link} onClick={onNavigate}>
                      Open lesson
                    </Link>
                  ) : null}
                  <div className={styles.flashActions}>
                    <button type="button" className={styles.textBtn} onClick={retry}>
                      retry <span className={styles.rowDate}>0</span>
                    </button>
                    <button
                      type="button"
                      className={verdict === false ? styles.wikiPracticeBtn : styles.textBtn}
                      onClick={() => grade(false)}>
                      again <span className={styles.rowDate}>{verdict === false ? '1 · Enter' : '1'}</span>
                    </button>
                    <button
                      type="button"
                      className={verdict !== false ? styles.wikiPracticeBtn : styles.textBtn}
                      onClick={() => grade(true)}>
                      got it <span className={styles.rowDate}>{verdict === true ? '2 · Enter' : '2'}</span>
                    </button>
                  </div>
                </>
              ) : choice ? (
                <p className={styles.choiceHint}>press 1–{options.length} or click an option</p>
              ) : (
                <div className={styles.flashActions}>
                  <button type="button" className={styles.wikiPracticeBtn} onClick={reveal}>
                    {translate ? 'check' : 'show answer'} <span className={styles.rowDate}>Enter</span>
                  </button>
                </div>
              )}
              <p className={styles.queueInfo}>
                learning {session.queue.length}
                {session.backlog.length ? ` · ${session.backlog.length} waiting` : ''}
              </p>
            </>
          ) : (
            <div className={styles.flashcard}>
              <p className={styles.flashText}>
                {total === 0
                  ? 'No cards with both languages here.'
                  : `Done — ${total} cards, ${missed} repeat${missed === 1 ? '' : 's'}.`}
              </p>
              <div className={styles.flashActions}>
                {total > 0 ? (
                  <button type="button" className={styles.wikiPracticeBtn} onClick={() => restart()}>
                    practice again
                  </button>
                ) : null}
                <button type="button" className={styles.textBtn} onClick={onBack}>
                  back to list
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DecksPanel({onNavigate}) {
  const {i18n} = useDocusaurusContext();
  const locale = i18n?.currentLocale || 'en';
  const [deckId, setDeckId] = useState(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [practice, setPractice] = useState(null);

  const deck = DECKS.find((d) => d.id === deckId) || null;
  const q = search.trim().toLowerCase();

  const subCategories = useMemo(() => {
    if (!deck) {
      return [];
    }
    const counts = new Map();
    deck.cards.forEach((card) => counts.set(card.category, (counts.get(card.category) || 0) + 1));
    return [...counts.entries()].map(([path, count]) => ({path, count}));
  }, [deck]);

  // Inside a deck: that deck only. On the deck list: every term.
  const terms = useMemo(() => {
    const base = deck ? deck.cards : CARDS;
    return base.filter((card) => {
      if (deck && category && card.category !== category) {
        return false;
      }
      return cardMatches(card, q);
    });
  }, [deck, category, q]);

  const translatable = useMemo(() => terms.filter((c) => c.translations && Object.keys(c.translations).length), [terms]);

  function openDeck(id) {
    setDeckId(id);
    setCategory('');
    setSearch('');
    setOpenId(null);
  }

  function backToDecks() {
    setDeckId(null);
    setCategory('');
    setSearch('');
    setOpenId(null);
  }

  if (practice) {
    let title = q ? `“${search.trim()}”` : 'all decks';
    if (deck) {
      title = category ? categoryLabel(category, locale) : deckTitle(deck, locale);
      if (q) {
        title += ` · “${search.trim()}”`;
      }
    }
    return (
      <Practice
        mode={practice.mode}
        pool={practice.pool}
        initialLang={locale}
        title={title}
        onBack={() => setPractice(null)}
        onNavigate={onNavigate}
      />
    );
  }

  const showTerms = Boolean(deck) || Boolean(q);
  const visible = terms.slice(0, TERM_LIMIT);
  const poolFor = (mode) => (mode === 'translate' ? translatable : terms);

  return (
    <div className={deck ? styles.bodyEditor : styles.body}>
      {deck ? (
        <div className={styles.noteBar}>
          <button type="button" className={styles.back} onClick={backToDecks} aria-label="Back to decks">
            ‹
          </button>
          <h3 className={styles.wikiTitle}>{deckTitle(deck, locale)}</h3>
          <span className={styles.rowDate}>{deck.cards.length} cards</span>
        </div>
      ) : null}
      <div className={deck ? styles.deckBody : undefined}>
        <div className={styles.searchRow}>
          <input
            className={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={deck ? 'search this deck' : 'search all terms'}
            aria-label="Search terms"
          />
        </div>

        {showTerms ? (
          <div className={styles.filters}>
            <span className={styles.practiceModes}>
              {PRACTICE_MODES.map((mode) => {
                const n = poolFor(mode.id).length;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={styles.wikiPracticeBtn}
                    onClick={() => setPractice({mode: mode.id, pool: poolFor(mode.id)})}
                    disabled={n === 0}>
                    {mode.label}
                  </button>
                );
              })}
            </span>
          </div>
        ) : null}

        {deck && subCategories.length > 1 ? (
          <div className={styles.filters}>
            {subCategories.map(({path, count}) => (
              <button
                key={path}
                type="button"
                className={category === path ? styles.filterOn : styles.filter}
                onClick={() => setCategory(category === path ? '' : path)}>
                {categoryLabel(path, locale)} {count}
              </button>
            ))}
          </div>
        ) : null}

        {!showTerms ? (
          DECKS.length === 0 ? (
            <p className={styles.empty}>No decks yet.</p>
          ) : (
            <ul className={styles.list}>
              {DECKS.map((d) => (
                <li key={d.id}>
                  <button type="button" className={styles.deckRow} onClick={() => openDeck(d.id)}>
                    <span className={styles.rowTitle}>{deckTitle(d, locale)}</span>
                    <span className={styles.rowDate}>
                      {d.cards.length} cards · {Object.keys(d.categories || {}).length} topics
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : visible.length === 0 ? (
          <p className={styles.empty}>No matching terms.</p>
        ) : (
          <ul className={styles.list}>
            {visible.map((card) => {
              const shown = localizeCard(card, locale);
              const alt = altTerm(card, locale);
              const isOpen = openId === card.id;
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    className={styles.termRow}
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : card.id)}>
                    <span className={styles.rowTitle}>{shown.term}</span>
                    <span className={styles.rowDate}>
                      {alt}
                      {!deck ? ` · ${categoryLabel(card.category, locale)}` : ''}
                    </span>
                  </button>
                  {isOpen ? <CardDetail card={card} locale={locale} onNavigate={onNavigate} /> : null}
                </li>
              );
            })}
          </ul>
        )}
        {showTerms && terms.length > TERM_LIMIT ? (
          <p className={styles.empty}>
            Showing {TERM_LIMIT} of {terms.length}. Search or pick a topic to narrow; practice uses all {terms.length}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
