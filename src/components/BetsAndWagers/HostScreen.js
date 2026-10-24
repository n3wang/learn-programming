import React, {useEffect, useRef, useState} from 'react';
import {apiOverride, createPartySocket} from '@site/src/api/partyClient';
import {
  BET_SECONDS,
  GUESS_SECONDS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PACKS,
  PLAYER_COLORS,
  ROUND_CHOICES,
  buildBoard,
  chipAllowance,
  findQuestion,
  formatNumber,
  PLACE_SECONDS,
  SMALLER_KEY,
  reactionEmoji,
  isValidAvatar,
  isValidGuess,
  placeBoard,
  settlePlace,
  localized,
  unitSuffix,
  pickQuestionIds,
  questionsForPacks,
  rankPlayers,
  sanitizeBet,
  settleRound,
  uniqueName,
} from './logic';
import {Avatar, ConnectionBadge, Countdown, QuestionImage, boardDensity, readJson, writeJson} from './ui';
import {LangSwitch, t, tx, useLang} from './strings';
import {generateName, isGeneratedName} from './names';
import styles from './styles.module.css';

/**
 * The shared screen. It is the referee: questions, timers, board and scores
 * all live here, and every phone only ever sees the view this screen sends it.
 * State is saved to localStorage so a reloaded tab reclaims the same room.
 */

const HOST_KEY = 'bw-host-v1';
const REACTION_GAP_MS = 900;
const REACTION_SHOW_MS = 3600;
const MAX_REACTIONS_ON_SCREEN = 12;
/** The host's own defaults for new rooms (today: whether names are locked). */
const HOST_PREFS_KEY = 'bw-host-prefs-v1';

/** Locked unless this host chose otherwise: a fresh class gets safe names. */
function defaultLockedNames() {
  const prefs = readJson(HOST_PREFS_KEY);
  return prefs && typeof prefs.lockedNames === 'boolean' ? prefs.lockedNames : true;
}

/** Locked rooms keep only generated names; anything typed is swapped for one. */
function renameUnsafePlayers(g, lang) {
  if (!g.lockedNames) return;
  for (const p of Object.values(g.players)) {
    if (isGeneratedName(p.name)) continue;
    p.name = generateName(lang, Object.values(g.players).map((other) => other.name));
  }
}

function newGame(settings = {}) {
  return {
    phase: 'lobby',
    packs: settings.packs || PACKS.map((pack) => pack.id),
    rounds: settings.rounds || 7,
    lockedNames: typeof settings.lockedNames === 'boolean' ? settings.lockedNames : defaultLockedNames(),
    players: {},
    questionIds: [],
    round: 0,
    deadline: 0,
    guesses: {},
    board: null,
    bets: {},
    result: null,
  };
}

// ------------------------------------------------- phase transitions (drafts)

function startGuess(g, now) {
  g.guesses = {};
  g.bets = {};
  g.result = null;
  const question = findQuestion(g.questionIds[g.round]);
  if (question && question.type === 'place') {
    // Coin questions have fixed options: straight to betting.
    g.board = placeBoard(question);
    g.phase = 'bet';
    g.deadline = now + PLACE_SECONDS * 1000;
    return;
  }
  g.phase = 'guess';
  g.deadline = now + GUESS_SECONDS * 1000;
  g.board = null;
}

function endGuess(g, now) {
  g.board = buildBoard(g.guesses, findQuestion(g.questionIds[g.round]).unit);
  g.phase = 'bet';
  g.deadline = now + BET_SECONDS * 1000;
}

function endBet(g) {
  const question = findQuestion(g.questionIds[g.round]);
  const place = question.type === 'place';
  const playerIds = Object.keys(g.players);
  const {winner, deltas} = place
    ? settlePlace({question, bets: g.bets, playerIds})
    : settleRound({board: g.board, answer: question.answer, bets: g.bets, playerIds});
  for (const [playerId, delta] of Object.entries(deltas)) {
    g.players[playerId].score += delta;
  }
  const answerLabel = place
    ? question.options.find((option) => option.key === question.answer).label
    : formatNumber(question.answer, question.unit);
  g.result = {winner, deltas, answerLabel, hint: place ? question.hint : ''};
  g.phase = 'reveal';
  g.deadline = 0;
}

function nextRound(g, now) {
  g.round += 1;
  if (g.round >= g.questionIds.length) {
    g.phase = 'end';
    g.deadline = 0;
  } else {
    startGuess(g, now);
  }
}

const activeIds = (g) => Object.keys(g.players).filter((id) => g.players[id].connected);
const everyoneDid = (g, map) => {
  const active = activeIds(g);
  return active.length > 0 && active.every((id) => map[id] != null);
};

function viewFor(g, playerId, now) {
  const p = g.players[playerId];
  const inRound = g.phase === 'guess' || g.phase === 'bet' || g.phase === 'reveal';
  const q = inRound ? findQuestion(g.questionIds[g.round]) : null;
  return {
    type: 'state',
    to: playerId,
    phase: g.phase,
    round: g.round + 1,
    rounds: g.questionIds.length,
    endsIn: g.deadline ? Math.max(0, g.deadline - now) : 0,
    playerCount: Object.keys(g.players).length,
    lockedNames: g.lockedNames,
    progress:
      g.phase === 'guess' || g.phase === 'bet'
        ? {
            done: activeIds(g).filter((id) => (g.phase === 'guess' ? g.guesses : g.bets)[id] != null).length,
            total: activeIds(g).length,
          }
        : null,
    // The question itself (text, picture) is only on the big screen, so it
    // can't be copied from a phone into a search. Phones get what they need:
    // the kind of round, the topic, and the unit for the read-back.
    question: q && {
      type: q.type || 'number',
      unit: q.unit,
      unitZh: q.unitZh,
      topic: q.topic,
      topicZh: q.topicZh,
    },
    board:
      g.board && (g.phase === 'bet' || g.phase === 'reveal')
        ? g.board.map((s) => ({
            key: s.key,
            label: s.label,
            detail: s.detail || '',
            odds: s.odds,
            mine: s.authors.includes(playerId),
          }))
        : null,
    you: {
      name: p.name,
      color: p.color,
      avatar: p.avatar,
      score: p.score,
      allowance: chipAllowance(p.score),
      guess: g.guesses[playerId] != null ? formatNumber(g.guesses[playerId], q && q.unit) : null,
      bet: g.bets[playerId] || null,
      delta: g.result ? g.result.deltas[playerId] ?? 0 : null,
    },
    result:
      g.phase === 'reveal' && g.result
        ? {winner: g.result.winner, answerLabel: g.result.answerLabel, hint: g.result.hint || ''}
        : null,
    ranking: g.phase === 'end' ? rankPlayers(g.players) : null,
  };
}

// ------------------------------------------------------------------ component

export default function HostScreen() {
  const saved = useRef(null);
  if (saved.current === null) saved.current = readJson(HOST_KEY) || {};
  const gameRef = useRef(saved.current.game || newGame());
  const roomRef = useRef({code: saved.current.code || null, hostToken: saved.current.hostToken || null});
  const socketRef = useRef(null);
  const hostRef = useRef(null);
  const [, setTick] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [base, setBase] = useState('');
  const [qr, setQr] = useState(null);
  const [lang, setLang] = useLang();
  /** Emoji pop-ups on screen now: [{uid, playerId, emoji, x}]. Not part of the saved game. */
  const [reactions, setReactions] = useState([]);
  const lastReactionRef = useRef({});

  const rerender = () => setTick((t) => t + 1);
  /** Another window reclaimed this room; this one goes quiet until taken back. */
  const replacedRef = useRef(false);

  function persist() {
    writeJson(HOST_KEY, {...roomRef.current, game: gameRef.current});
  }

  /** Phones read these (via the relay's peek) before they join. */
  function sendSettings() {
    if (!socketRef.current || replacedRef.current) return;
    socketRef.current.send({type: 'settings', settings: {lockedNames: gameRef.current.lockedNames}});
  }

  function broadcast() {
    const socket = socketRef.current;
    if (!socket || replacedRef.current) return;
    const g = gameRef.current;
    const now = Date.now();
    for (const playerId of activeIds(g)) socket.send(viewFor(g, playerId, now));
  }

  /** Every change goes through here: mutate a copy, save, push views, redraw. */
  function commit(mutate) {
    const draft = structuredClone(gameRef.current);
    if (mutate(draft, Date.now()) === false) return;
    gameRef.current = draft;
    persist();
    broadcast();
    rerender();
  }

  function handleMessage(msg) {
    const id = msg.playerId;
    switch (msg.type) {
      case 'room': {
        const sameRoom = roomRef.current.code === msg.code;
        roomRef.current = {code: msg.code, hostToken: msg.hostToken};
        commit((g) => {
          if (!sameRoom) {
            Object.assign(g, newGame({packs: g.packs, rounds: g.rounds, lockedNames: g.lockedNames}));
            return;
          }
          for (const [playerId, p] of Object.entries(g.players)) {
            const row = msg.players.find((r) => r.playerId === playerId);
            p.connected = Boolean(row && row.connected);
            if (row && isValidAvatar(row.avatar)) p.avatar = row.avatar;
          }
        });
        sendSettings();
        break;
      }
      case 'player_joined':
        commit((g) => {
          const existing = g.players[id];
          if (existing) {
            existing.connected = true;
            // A rejoin from the lobby may carry a newly picked avatar or name.
            if (isValidAvatar(msg.avatar)) existing.avatar = msg.avatar;
            const others = Object.entries(g.players).filter(([pid]) => pid !== id).map(([, p]) => p.name);
            if (msg.name && msg.name !== existing.name && (!g.lockedNames || isGeneratedName(msg.name))) {
              existing.name = uniqueName(msg.name, others);
            }
            return;
          }
          if (Object.keys(g.players).length >= MAX_PLAYERS) return false;
          const others = Object.values(g.players);
          const usedColors = others.map((p) => p.color);
          g.players[id] = {
            // Locked rooms never show a typed name, even from a tampered phone.
            name:
              g.lockedNames && !isGeneratedName(msg.name)
                ? generateName(lang, others.map((p) => p.name))
                : uniqueName(msg.name, others.map((p) => p.name)),
            color: PLAYER_COLORS.find((c) => !usedColors.includes(c)) || PLAYER_COLORS[0],
            avatar: isValidAvatar(msg.avatar) ? msg.avatar : null,
            score: 0,
            connected: true,
          };
        });
        break;
      case 'player_left':
        commit((g, now) => {
          if (!g.players[id]) return false;
          if (msg.reason === 'left' || msg.reason === 'kicked') {
            delete g.players[id];
            // A removed player's guess leaves the board only while it is still being built.
            if (g.phase === 'guess') delete g.guesses[id];
            delete g.bets[id];
          } else {
            g.players[id].connected = false;
          }
          if (g.phase === 'guess' && everyoneDid(g, g.guesses)) endGuess(g, now);
          else if (g.phase === 'bet' && everyoneDid(g, g.bets)) endBet(g);
        });
        break;
      case 'guess':
        commit((g, now) => {
          if (g.phase !== 'guess' || !g.players[id]) return false;
          const value = Number(msg.value);
          if (!isValidGuess(value)) return false;
          g.guesses[id] = value;
          if (everyoneDid(g, g.guesses)) endGuess(g, now);
        });
        break;
      case 'bet':
        commit((g) => {
          if (g.phase !== 'bet' || !g.players[id]) return false;
          const chips = sanitizeBet(msg.chips, g.board, g.players[id].score);
          if (!chips) return false;
          g.bets[id] = chips;
          if (everyoneDid(g, g.bets)) endBet(g);
        });
        break;
      case 'react': {
        const emoji = reactionEmoji(msg.emoji);
        const g = gameRef.current;
        const now = Date.now();
        // Known emoji from a seated player, at most one a second each.
        if (!emoji || !g.players[id] || now - (lastReactionRef.current[id] || 0) < REACTION_GAP_MS) break;
        lastReactionRef.current[id] = now;
        const ids = Object.keys(g.players);
        // Spread players across the screen by seat, so everyone has their own spot.
        const x = 6 + ((ids.indexOf(id) + 0.5) / ids.length) * 88;
        const uid = `${id}-${now}`;
        // One bubble per player: a new reaction replaces theirs (the new key restarts the animation).
        setReactions((list) => [
          ...list.filter((r) => r.playerId !== id).slice(-(MAX_REACTIONS_ON_SCREEN - 1)),
          {uid, playerId: id, emoji, x},
        ]);
        setTimeout(() => setReactions((list) => list.filter((r) => r.uid !== uid)), REACTION_SHOW_MS);
        break;
      }
      case 'host_replaced':
        replacedRef.current = true;
        rerender();
        break;
      case 'error':
        if (msg.message === 'room-not-found' || msg.message === 'bad-host-token') {
          // The server restarted or the room expired: open a fresh one.
          roomRef.current = {code: null, hostToken: null};
          socketRef.current.send({type: 'create_room'});
        }
        break;
      default:
        break;
    }
  }

  const handlerRef = useRef(handleMessage);
  handlerRef.current = handleMessage;

  useEffect(() => {
    const socket = createPartySocket({
      onMessage: (msg) => handlerRef.current(msg),
      onOpen: () => {
        const {code, hostToken} = roomRef.current;
        socket.send(code && hostToken ? {type: 'resume_host', code, hostToken} : {type: 'create_room'});
      },
      onStatus: (next, reached) => {
        setStatus(next);
        if (reached) setBase(reached);
      },
    });
    socketRef.current = socket;
    return () => socket.close();
  }, []);

  // Timers: advance when the clock runs out, redraw the countdown meanwhile.
  useEffect(() => {
    const timer = setInterval(() => {
      const g = gameRef.current;
      if (!g.deadline || replacedRef.current) return;
      if (Date.now() >= g.deadline) {
        if (g.phase === 'guess') commit(endGuess);
        else if (g.phase === 'bet') commit(endBet);
      } else {
        rerender();
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const code = roomRef.current.code;
  // Built from this page's own path so the link matches whatever locale prefix
  // (or none) the host page is being served under.
  const api = apiOverride();
  const playPath =
    typeof window !== 'undefined' ? window.location.pathname.replace(/party\/host\/?$/, 'party/play') : '';
  const joinUrl =
    code && playPath
      ? `${window.location.origin}${playPath}?room=${code}${api ? `&api=${encodeURIComponent(api)}` : ''}`
      : '';

  useEffect(() => {
    if (!joinUrl) return;
    let cancelled = false;
    import('qrcode')
      .then((mod) => (mod.default || mod).toDataURL(joinUrl, {margin: 1, width: 280}))
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [joinUrl]);

  // ---------------------------------------------------------------- actions

  const start = () =>
    commit((g, now) => {
      g.questionIds = pickQuestionIds(g.packs, g.rounds);
      g.round = 0;
      for (const p of Object.values(g.players)) p.score = 0;
      startGuess(g, now);
    });
  const skip = () =>
    commit((g, now) => {
      if (g.phase === 'guess') endGuess(g, now);
      else if (g.phase === 'bet') endBet(g);
      else return false;
    });
  const next = () => commit(nextRound);
  const playAgain = () =>
    commit((g) => {
      const players = g.players;
      Object.assign(g, newGame({packs: g.packs, rounds: g.rounds, lockedNames: g.lockedNames}));
      g.players = players;
      for (const p of Object.values(players)) p.score = 0;
    });
  const newRoom = () => {
    socketRef.current.send({type: 'leave'});
    roomRef.current = {code: null, hostToken: null};
    const {packs, rounds, lockedNames} = gameRef.current;
    gameRef.current = newGame({packs, rounds, lockedNames});
    persist();
    setQr(null);
    socketRef.current.send({type: 'create_room'});
    rerender();
  };
  const togglePack = (packId) =>
    commit((g) => {
      const on = g.packs.includes(packId);
      if (on && g.packs.length === 1) return false;
      g.packs = on ? g.packs.filter((p) => p !== packId) : [...g.packs, packId];
    });
  const setRounds = (rounds) => commit((g) => void (g.rounds = rounds));
  const setLockedNames = (locked) => {
    commit((g) => {
      if (g.lockedNames === locked) return false;
      g.lockedNames = locked;
      renameUnsafePlayers(g, lang);
    });
    // This choice becomes the default for the next room on this device.
    writeJson(HOST_PREFS_KEY, {...(readJson(HOST_PREFS_KEY) || {}), lockedNames: locked});
    sendSettings();
  };
  const addTime = () =>
    commit((g) => {
      if (!g.deadline) return false;
      g.deadline += 15000;
    });
  const kick = (playerId) => {
    const p = gameRef.current.players[playerId];
    if (!p || !window.confirm(t(lang, 'removeConfirm', {name: p.name}))) return;
    // The relay confirms with player_left (reason "kicked"), which drops the seat here.
    socketRef.current.send({type: 'kick', playerId});
  };
  const toggleFullscreen = () => {
    // Only the game goes full screen, not the site navbar around it.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else hostRef.current?.requestFullscreen?.().catch(() => {});
  };
  const takeBack = () => {
    // This window's saved state may be older than the other window's.
    const latest = readJson(HOST_KEY);
    if (latest && latest.code === roomRef.current.code && latest.game) gameRef.current = latest.game;
    replacedRef.current = false;
    const {code: roomCode, hostToken} = roomRef.current;
    socketRef.current.send({type: 'resume_host', code: roomCode, hostToken});
    rerender();
  };
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard
      ?.writeText(joinUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  // ----------------------------------------------------------------- render

  const g = gameRef.current;
  const now = Date.now();
  const playerIds = Object.keys(g.players);
  const question = g.phase === 'guess' || g.phase === 'bet' || g.phase === 'reveal'
    ? findQuestion(g.questionIds[g.round])
    : null;
  const available = questionsForPacks(g.packs).length;
  const shown = localized(question, lang);

  return (
    <div className={styles.host} ref={hostRef} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
      {replacedRef.current && (
        <div className={styles.replaced} role="alertdialog" aria-labelledby="bw-replaced-title">
          <h2 id="bw-replaced-title">{t(lang, 'replacedTitle')}</h2>
          <p>{t(lang, 'replacedBody')}</p>
          <button type="button" className="button button--primary button--lg" onClick={takeBack}>
            {t(lang, 'useThisWindow')}
          </button>
        </div>
      )}
      <header className={styles.hostHeader}>
        <strong className={styles.brand}>{t(lang, 'brand')}</strong>
        {code && (
          <span className={styles.headerCode}>
            {t(lang, 'room')} <b>{code}</b>
          </span>
        )}
        <ConnectionBadge status={status} base={base} lang={lang} />
        <LangSwitch lang={lang} setLang={setLang} />
        <button type="button" className="button button--sm button--secondary" onClick={toggleFullscreen}>
          {t(lang, 'fullScreen')}
        </button>
      </header>

      {g.phase === 'lobby' && (
        <div className={styles.lobby}>
          <section className={styles.joinPanel}>
            <p className={styles.kicker}>{t(lang, 'joinOnPhone')}</p>
            <div className={styles.bigCode}>{code || '····'}</div>
            {qr ? <img className={styles.qr} src={qr} alt={t(lang, 'qrFor', {url: joinUrl})} /> : <div className={styles.qrPlaceholder} />}
            <p className={styles.joinUrl}>{joinUrl || t(lang, 'openingRoom')}</p>
            {joinUrl && (
              <button type="button" className="button button--sm button--secondary" onClick={copyLink}>
                {t(lang, copied ? 'copied' : 'copyLink')}
              </button>
            )}
            <p className={styles.muted}>{t(lang, 'noCamera')}</p>
            {typeof window !== 'undefined' && /^(localhost|127\.|\[::1\])/.test(window.location.hostname) && (
              <p className={styles.notice}>{t(lang, 'localhostHint')}</p>
            )}
          </section>

          <section className={styles.panel}>
            <h2>
              {t(lang, 'players')} <span className={styles.muted}>{playerIds.length} / {MAX_PLAYERS}</span>
            </h2>
            {playerIds.length === 0 ? (
              <p className={styles.muted}>{t(lang, 'nobodyYet')}</p>
            ) : (
              <ul className={styles.playerList}>
                {playerIds.map((pid) => (
                  <li key={pid} className={g.players[pid].connected ? '' : styles.offline}>
                    <Avatar avatar={g.players[pid].avatar} color={g.players[pid].color} />
                    {g.players[pid].name}
                    <button
                      type="button"
                      className={styles.kick}
                      onClick={() => kick(pid)}
                      aria-label={t(lang, 'removeName', {name: g.players[pid].name})}
                      title={t(lang, 'removePlayer')}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h2>{t(lang, 'topics')}</h2>
            <div className={styles.packRow}>
              {PACKS.map((pack) => (
                <label key={pack.id} className={styles.packToggle}>
                  <input type="checkbox" checked={g.packs.includes(pack.id)} onChange={() => togglePack(pack.id)} />
                  {lang === 'zh' ? pack.titleZh : pack.title}{' '}
                  <span className={styles.muted}>({pack.questions.length})</span>
                </label>
              ))}
            </div>

            <h2>{t(lang, 'names')}</h2>
            <div className={styles.packRow} role="radiogroup" aria-label={t(lang, 'names')}>
              {[true, false].map((locked) => (
                <button
                  key={String(locked)}
                  type="button"
                  role="radio"
                  aria-checked={g.lockedNames === locked}
                  className={`button button--sm ${g.lockedNames === locked ? 'button--primary' : 'button--secondary'}`}
                  onClick={() => setLockedNames(locked)}>
                  {t(lang, locked ? 'lockedNames' : 'freeNames')}
                </button>
              ))}
            </div>
            <p className={styles.muted}>{t(lang, g.lockedNames ? 'lockedNamesHint' : 'freeNamesHint')}</p>

            <h2>{t(lang, 'rounds')}</h2>
            <div className={styles.packRow}>
              {ROUND_CHOICES.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`button button--sm ${g.rounds === n ? 'button--primary' : 'button--secondary'}`}
                  disabled={n > available}
                  onClick={() => setRounds(n)}>
                  {n}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`button button--primary button--lg ${styles.startButton}`}
              disabled={playerIds.length < MIN_PLAYERS || status !== 'open'}
              onClick={start}>
              {t(lang, 'startGame')}
            </button>
            {playerIds.length < MIN_PLAYERS && (
              <p className={styles.muted}>{t(lang, 'needPlayers', {n: MIN_PLAYERS})}</p>
            )}
          </section>
        </div>
      )}

      {question && (
        // More than 8 players: the board takes the full width, scores sit under it.
        <div className={styles.stage} data-wide={playerIds.length > 8}>
          <div className={styles.stageMain}>
            <p className={styles.kicker}>
              {t(lang, 'questionOf', {topic: shown.topic, n: g.round + 1, total: g.questionIds.length})}
            </p>
            <div className={styles.questionRow}>
              <h1 className={styles.question}>{shown.text}</h1>
              <QuestionImage image={question.image} alt={shown.alt} lang={lang} />
            </div>

            {g.phase === 'guess' && (
              <>
                <div className={styles.phaseRow}>
                  <span>{t(lang, 'typeGuess')}</span>
                  <Countdown msLeft={g.deadline - now} lang={lang} />
                </div>
                <ul className={styles.statusChips}>
                  {playerIds.map((pid) => (
                    <li key={pid} data-done={g.guesses[pid] != null} className={g.players[pid].connected ? '' : styles.offline}>
                      <Avatar avatar={g.players[pid].avatar} color={g.players[pid].color} />
                      {g.players[pid].name}
                      {g.guesses[pid] != null && ' ✓'}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {(g.phase === 'bet' || g.phase === 'reveal') && (
              <>
                <div className={styles.phaseRow}>
                  {g.phase === 'bet' ? (
                    <>
                      <span>{t(lang, question.type === 'place' ? 'placeCoins' : 'placeChips')}</span>
                      <Countdown msLeft={g.deadline - now} lang={lang} />
                    </>
                  ) : (
                    <span className={styles.answer}>
                      {t(lang, 'answer')}
                      {g.result.answerLabel}
                      {unitSuffix(question, lang)}
                    </span>
                  )}
                </div>
                {g.phase === 'reveal' && g.result.hint && (
                  <p className={styles.revealHint}>{t(lang, 'why', {hint: g.result.hint})}</p>
                )}
                <ol
                  className={`${styles.board} ${question.type === 'place' ? styles.placeBoard : ''}`}
                  data-density={boardDensity(g.board.length)}
                  style={{'--slots': g.board.length}}>
                  {g.board.map((slot) => {
                    const chips = Object.values(g.bets).flat().filter((c) => c.slot === slot.key);
                    const won = g.phase === 'reveal' && g.result.winner === slot.key;
                    return (
                      <li
                        key={slot.key}
                        className={`${styles.slot} ${won ? styles.slotWon : ''}`}
                        data-kind={slot.value == null ? 'smaller' : 'guess'}>
                        <span className={styles.slotOdds}>{slot.odds}:1</span>
                        <span className={styles.slotLabel}>
                          {slot.key === SMALLER_KEY ? t(lang, 'smallerThanAll') : slot.label}
                        </span>
                        {slot.detail && <span className={styles.slotDetail}>{slot.detail}</span>}
                        <span className={styles.slotAuthors}>
                          {slot.authors.map((pid) =>
                            g.players[pid] ? (
                              <Avatar key={pid} avatar={g.players[pid].avatar} color={g.players[pid].color} size="xs" />
                            ) : null,
                          )}
                        </span>
                        {g.phase === 'reveal' && (
                          <span className={styles.slotChips}>
                            {t(lang, chips.reduce((s, c) => s + c.amount, 0) === 1 ? 'chip' : 'chips', {
                              n: chips.reduce((s, c) => s + c.amount, 0),
                            })}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {g.phase === 'bet' && (
                  <ul className={styles.statusChips}>
                    {playerIds.map((pid) => (
                      <li key={pid} data-done={g.bets[pid] != null} className={g.players[pid].connected ? '' : styles.offline}>
                        <Avatar avatar={g.players[pid].avatar} color={g.players[pid].color} />
                        {g.players[pid].name}
                        {g.bets[pid] != null && ' ✓'}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <div className={styles.controls}>
              {(g.phase === 'guess' || g.phase === 'bet') && (
                <>
                  <button type="button" className="button button--secondary" onClick={addTime}>
                    {t(lang, 'addTime')}
                  </button>
                  <button type="button" className="button button--secondary" onClick={skip}>
                    {t(lang, 'endTimer')}
                  </button>
                </>
              )}
              {g.phase === 'reveal' && (
                <button type="button" className="button button--primary button--lg" onClick={next}>
                  {t(lang, g.round + 1 >= g.questionIds.length ? 'finalScores' : 'nextQuestion')}
                </button>
              )}
            </div>
          </div>

          <aside className={styles.scoreboard}>
            <h2>{t(lang, 'scores')}</h2>
            <ol>
              {rankPlayers(g.players).map((row) => (
                <li key={row.playerId} className={g.players[row.playerId].connected ? '' : styles.offline}>
                  <Avatar avatar={row.avatar} color={row.color} />
                  <span className={styles.scoreName}>
                    {row.name}
                    {!g.players[row.playerId].connected && <span className={styles.muted}> {t(lang, 'reconnecting')}</span>}
                  </span>
                  <span className={styles.scoreValue}>
                    {row.score}
                    {g.phase === 'reveal' && g.result.deltas[row.playerId] ? (
                      <em className={g.result.deltas[row.playerId] > 0 ? styles.gain : styles.loss}>
                        {g.result.deltas[row.playerId] > 0 ? ' +' : ' '}
                        {g.result.deltas[row.playerId]}
                      </em>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    className={styles.kick}
                    onClick={() => kick(row.playerId)}
                    aria-label={t(lang, 'removeName', {name: row.name})}
                    title={t(lang, 'removePlayer')}>
                    ×
                  </button>
                </li>
              ))}
            </ol>
            <p className={styles.muted}>
              {tx(lang, 'lateJoin', {code: <b>{code}</b>})}
            </p>
          </aside>
        </div>
      )}

      {g.phase === 'end' && (
        <div className={styles.final}>
          <h1>{t(lang, 'finalScores')}</h1>
          {(() => {
            const ranking = rankPlayers(g.players);
            const podium = ranking.slice(0, 3);
            if (podium.length < 3) return null;
            // Classic podium order: 2nd, 1st, 3rd.
            return (
              <ol className={styles.podium} aria-label={t(lang, 'topThree')}>
                {[podium[1], podium[0], podium[2]].map((row, i) => (
                  <li key={row.playerId} data-place={[2, 1, 3][i]}>
                    <span className={styles.podiumName}>
                      <Avatar avatar={row.avatar} color={row.color} size="lg" /> {row.name}
                    </span>
                    <span className={styles.podiumScore}>{t(lang, 'pts', {n: row.score})}</span>
                    <span className={styles.podiumStep} style={{borderTopColor: row.color}}>
                      {row.rank}
                    </span>
                  </li>
                ))}
              </ol>
            );
          })()}
          <ol className={styles.ranking}>
            {rankPlayers(g.players).slice(Object.keys(g.players).length >= 3 ? 3 : 0).map((row) => (
              <li key={row.playerId} data-rank={row.rank}>
                <span className={styles.rank}>{row.rank}</span>
                <Avatar avatar={row.avatar} color={row.color} />
                <span className={styles.scoreName}>{row.name}</span>
                <span className={styles.scoreValue}>{row.score}</span>
              </li>
            ))}
          </ol>
          <div className={styles.controls}>
            <button type="button" className="button button--primary button--lg" onClick={playAgain}>
              {t(lang, 'playAgain')}
            </button>
            <button type="button" className="button button--secondary button--lg" onClick={newRoom}>
              {t(lang, 'newRoom')}
            </button>
          </div>
        </div>
      )}
      <div className={styles.reactionLayer} aria-live="polite">
        {reactions.map((r) => {
          const p = gameRef.current.players[r.playerId];
          if (!p) return null;
          return (
            <div key={r.uid} className={styles.reaction} style={{left: `${r.x}%`}}>
              <span className={styles.bubble} role="img" aria-label={t(lang, 'reactedBy', {name: p.name, emoji: r.emoji})}>
                {r.emoji}
              </span>
              <Avatar avatar={p.avatar} color={p.color} size="lg" />
              <span className={styles.reactionName}>{p.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
