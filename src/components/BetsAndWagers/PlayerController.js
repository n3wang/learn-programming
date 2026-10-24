import React, {useEffect, useRef, useState} from 'react';
import {createPartySocket} from '@site/src/api/partyClient';
import {
  AVATAR_COUNT,
  MAX_GUESS_DIGITS,
  MAX_PLAYERS,
  REACTIONS,
  describeGuess,
  digitCount,
  isValidAvatar,
  localized,
  parseGuess,
  randomAvatar,
  unitSuffix,
} from './logic';
import {Avatar, AvatarPicker, Coin, CoinPile, ConnectionBadge, Countdown, boardDensity, readJson, writeJson} from './ui';
import {LangSwitch, t, useLang} from './strings';
import {generateName, isGeneratedName} from './names';
import styles from './styles.module.css';

/**
 * A phone in a party. It holds no game state of its own: it shows whatever
 * view the host screen last sent and sends back guesses and bets.
 *
 * Staying in the game on a flaky classroom network:
 * - the seat (room code + playerId) is saved, so a locked, reloaded or
 *   re-scanned phone rejoins with its score intact;
 * - the socket reconnects the moment the screen wakes (see partyClient);
 * - a guess or bet sent while offline is re-sent after the rejoin;
 * - a screen wake lock keeps the phone from sleeping mid-round.
 */

const PLAYER_KEY = 'bw-player-v1';
/** The last nickname that got in, kept after the seat is gone (next game, next lesson). */
const NAME_KEY = 'bw-name-v1';
/** The last avatar picked on this device, offered again next game. */
const AVATAR_KEY = 'bw-avatar-v1';
/** Same limit as the relay; fits generated names like "friendly-penguin". */
const NAME_MAX = 16;

/** Relay errors that end the seat → the message key shown to the student. */
const SEAT_ERRORS = {
  'room-not-found': 'errRoomNotFound',
  'room-full': 'errRoomFull',
  'name-taken': 'errNameTaken',
};

function roomFromQuery() {
  if (typeof window === 'undefined') return '';
  const room = new URLSearchParams(window.location.search).get('room');
  return room ? room.trim().toUpperCase().slice(0, 4) : '';
}

/**
 * This tab's seat first (sessionStorage survives reloads and keeps two tabs
 * on one laptop apart), then the browser's last seat (localStorage survives
 * closing the tab and scanning the QR code again).
 */
function readSeat() {
  try {
    const own = JSON.parse(window.sessionStorage.getItem(PLAYER_KEY) || 'null');
    if (own) return own;
  } catch {
    // blocked storage
  }
  return readJson(PLAYER_KEY);
}

function writeSeat(seat) {
  try {
    if (seat) window.sessionStorage.setItem(PLAYER_KEY, JSON.stringify(seat));
    else window.sessionStorage.removeItem(PLAYER_KEY);
  } catch {
    // blocked storage
  }
  writeJson(PLAYER_KEY, seat);
}

/** Cut to NAME_MAX characters counting emoji as one (maxLength counts UTF-16 units). */
function clampName(text) {
  return Array.from(text).slice(0, NAME_MAX).join('');
}

/** True when a generated name is in the other language ("happy-apple" on a Chinese screen). */
function nameInOtherLanguage(name, lang) {
  const english = /^[a-z]+-[a-z]+/.test(name);
  return lang === 'zh' ? english : !english;
}

/** A random avatar nobody in the room has, if any are left. */
function freeAvatar(taken) {
  const free = Array.from({length: AVATAR_COUNT}, (_, i) => i + 1).filter((n) => !taken.includes(n));
  return free.length ? free[Math.floor(Math.random() * free.length)] : randomAvatar();
}

/** Keep the screen awake while a game is on; browsers drop the lock when hidden. */
function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return undefined;
    let lock = null;
    let cancelled = false;
    const acquire = () => {
      if (document.visibilityState !== 'visible') return;
      navigator.wakeLock
        .request('screen')
        .then((next) => {
          if (cancelled) next.release();
          else lock = next;
        })
        .catch(() => {});
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      if (lock) lock.release().catch(() => {});
    };
  }, [active]);
}

export default function PlayerController() {
  const savedSeat = useRef(undefined);
  if (savedSeat.current === undefined) savedSeat.current = readSeat();
  const queryRoom = roomFromQuery();
  // A QR code for a different room wins over a remembered seat.
  const initialSeat =
    savedSeat.current && (!queryRoom || queryRoom === savedSeat.current.code) ? savedSeat.current : null;

  const seatRef = useRef(initialSeat);
  const socketRef = useRef(null);
  /** The last guess/bet, kept until the host's view shows it arrived. */
  const pendingRef = useRef(null);
  const viewRef = useRef(null);
  const [seat, setSeat] = useState(initialSeat);
  const [lang, setLang] = useLang();
  const [status, setStatus] = useState('connecting');
  const [base, setBase] = useState('');
  const [view, setView] = useState(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [error, setError] = useState(null);
  const [hostAway, setHostAway] = useState(false);
  const [joining, setJoining] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  /** The seat another tab took over, so this one can offer to take it back. */
  const [movedSeat, setMovedSeat] = useState(null);
  /** What the relay says about the room before joining: lock, taken names/avatars. */
  const [roomInfo, setRoomInfo] = useState(null);
  /** Once the student picks an avatar themselves, stop re-picking it for them. */
  const avatarTouchedRef = useRef(false);
  const [form, setForm] = useState({
    code: queryRoom || savedSeat.current?.code || '',
    // Everyone starts with a safe generated name; a remembered one is reused.
    name: savedSeat.current?.name || readJson(NAME_KEY) || generateName('en'),
    avatar: [savedSeat.current?.avatar, readJson(AVATAR_KEY)].find(isValidAvatar) || randomAvatar(),
  });
  const [, setTick] = useState(0);

  function rememberSeat(next) {
    seatRef.current = next;
    setSeat(next);
    writeSeat(next);
  }

  function dropSeat(message) {
    rememberSeat(null);
    pendingRef.current = null;
    viewRef.current = null;
    setView(null);
    setJoining(false);
    setError(message);
  }

  function handleMessage(msg) {
    switch (msg.type) {
      case 'joined':
        setMovedSeat(null);
        rememberSeat({
          code: msg.code,
          playerId: msg.playerId,
          name: msg.name,
          avatar: isValidAvatar(msg.avatar) ? msg.avatar : seatRef.current?.avatar,
        });
        writeJson(NAME_KEY, msg.name);
        setForm((f) => ({...f, name: msg.name}));
        setError(null);
        setJoining(false);
        setHostAway(!msg.hostConnected);
        // Anything sent while the socket was down goes out again now.
        if (pendingRef.current) socketRef.current.send(pendingRef.current.msg);
        break;
      case 'room_info':
        setRoomInfo(msg);
        break;
      case 'state': {
        // The host may have swapped a typed name for a safe one: rejoin with that.
        const current = seatRef.current;
        if (current && msg.you && msg.you.name !== current.name) {
          rememberSeat({...current, name: msg.you.name});
          writeJson(NAME_KEY, msg.you.name);
        }
        const pending = pendingRef.current;
        if (pending) {
          const arrived = pending.msg.type === 'guess' ? msg.you.guess : msg.you.bet;
          if (arrived || pending.phase !== msg.phase || pending.round !== msg.round) pendingRef.current = null;
        }
        viewRef.current = msg;
        setView(msg);
        setReceivedAt(Date.now());
        break;
      }
      case 'host_left':
        setHostAway(true);
        break;
      case 'host_back':
        setHostAway(false);
        break;
      case 'room_closed':
        dropSeat('errClosed');
        break;
      case 'seat_taken':
        // Another tab or device opened this seat. Forget it here only; the
        // shared localStorage copy now belongs to the other tab.
        setMovedSeat(seatRef.current);
        seatRef.current = null;
        setSeat(null);
        try {
          window.sessionStorage.removeItem(PLAYER_KEY);
        } catch {
          // blocked storage
        }
        pendingRef.current = null;
        viewRef.current = null;
        setView(null);
        setError('errSeatTaken');
        break;
      case 'kicked':
        dropSeat('errKicked');
        break;
      case 'error':
        if (SEAT_ERRORS[msg.message]) dropSeat(SEAT_ERRORS[msg.message]);
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
        const current = seatRef.current;
        if (current) {
          socket.send({type: 'join', code: current.code, name: current.name, playerId: current.playerId, avatar: current.avatar});
        }
      },
      onStatus: (next, reached) => {
        setStatus(next);
        if (reached) setBase(reached);
      },
    });
    socketRef.current = socket;
    return () => socket.close();
  }, []);

  // Ask the relay about the room as soon as a full code is typed (or arrived by QR).
  const formCode = form.code.trim().toUpperCase();
  // While the form is open, ask again every few seconds so a setting the host
  // changes meanwhile (names locked or not) and newly taken avatars show up.
  useEffect(() => {
    if (seat || status !== 'open' || formCode.length !== 4) return undefined;
    const peek = () => socketRef.current.send({type: 'peek', code: formCode});
    peek();
    const timer = setInterval(peek, 5000);
    return () => clearInterval(timer);
  }, [seat, status, formCode]);

  const locked = Boolean(roomInfo && roomInfo.found && roomInfo.code === formCode && roomInfo.settings?.lockedNames);
  const takenNames = roomInfo && roomInfo.code === formCode ? roomInfo.takenNames || [] : [];
  const takenAvatars = roomInfo && roomInfo.code === formCode ? roomInfo.takenAvatars || [] : [];

  // Keep the pre-filled name safe, unused and in this screen's language,
  // and the pre-picked avatar free, until the student chooses their own.
  useEffect(() => {
    if (seat) return;
    setForm((f) => {
      let {name, avatar} = f;
      const usedName = takenNames.some((n) => n.toLowerCase() === name.trim().toLowerCase());
      if ((locked && !isGeneratedName(name)) || (isGeneratedName(name) && (usedName || nameInOtherLanguage(name, lang)))) {
        name = generateName(lang, takenNames);
      }
      if (!avatarTouchedRef.current && takenAvatars.includes(avatar)) avatar = freeAvatar(takenAvatars);
      return name === f.name && avatar === f.avatar ? f : {...f, name, avatar};
    });
  }, [seat, locked, lang, roomInfo]);

  // Redraw the countdown.
  useEffect(() => {
    if (!view || !view.endsIn) return undefined;
    const timer = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(timer);
  }, [view]);

  // A short buzz when a new phase starts, so heads come up from desks.
  const phaseKey = view ? `${view.phase}-${view.round}` : '';
  useEffect(() => {
    if (phaseKey && navigator.vibrate) navigator.vibrate(60);
  }, [phaseKey]);

  useWakeLock(Boolean(seat && view && view.phase !== 'end'));

  const send = (msg) => Boolean(socketRef.current && socketRef.current.send(msg));

  /** Guesses and bets survive a dropped connection: kept until acknowledged. */
  function sendAction(msg) {
    const current = viewRef.current;
    pendingRef.current = {msg, phase: current?.phase, round: current?.round};
    send(msg);
    setTick((t) => t + 1);
  }

  function join(event) {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const name = clampName(form.name).trim();
    if (code.length !== 4) {
      setError('errCode');
      return;
    }
    if (!name) {
      setError('errName');
      return;
    }
    setError(null);
    seatRef.current = {code, name, playerId: null, avatar: form.avatar};
    writeJson(AVATAR_KEY, form.avatar);
    if (send({type: 'join', code, name, avatar: form.avatar})) setJoining(true);
    else setError('errStillConnecting');
  }

  function takeSeatBack() {
    seatRef.current = movedSeat;
    setMovedSeat(null);
    setError(null);
    const {code, name, playerId, avatar} = movedSeat;
    if (send({type: 'join', code, name, playerId, avatar})) setJoining(true);
  }

  /** A new pick in the lobby goes out as a rejoin of the same seat. */
  function changeAvatar(avatar) {
    const current = seatRef.current;
    setForm((f) => ({...f, avatar}));
    writeJson(AVATAR_KEY, avatar);
    if (!current) return;
    seatRef.current = {...current, avatar};
    send({type: 'join', code: current.code, name: current.name, playerId: current.playerId, avatar});
  }

  /** A fresh safe name from the lobby goes out as a rejoin of the same seat. */
  function rerollName() {
    const current = seatRef.current;
    if (!current) return;
    const name = generateName(lang, [current.name]);
    seatRef.current = {...current, name};
    send({type: 'join', code: current.code, name, playerId: current.playerId, avatar: current.avatar});
  }

  function leave() {
    if (!window.confirm(t(lang, 'leaveConfirm'))) return;
    send({type: 'leave'});
    dropSeat(null);
  }

  const msLeft = view ? view.endsIn - (Date.now() - receivedAt) : 0;
  const offline = Boolean(seat) && status !== 'open';
  const queued = offline && pendingRef.current;
  const shown = view && localized(view.question, lang);

  return (
    <div className={`${styles.phone} ${seat && view ? styles.phoneApp : ''}`} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
      <header className={styles.phoneHeader}>
        <strong className={styles.brand}>{t(lang, 'brand')}</strong>
        {seat && (
          <span className={styles.muted}>
            {t(lang, 'room')} {seat.code}
          </span>
        )}
        <ConnectionBadge status={status} base={base} lang={lang} compact />
        <LangSwitch lang={lang} setLang={setLang} />
      </header>

      {error && <p className={styles.error}>{t(lang, error, {n: MAX_PLAYERS})}</p>}
      {offline && (
        <p className={styles.notice}>
          {t(lang, 'reconnectingSaved')}
          {queued && ` ${t(lang, 'queuedAnswer')}`}
        </p>
      )}
      {seat && !offline && hostAway && <p className={styles.notice}>{t(lang, 'hostAway')}</p>}

      {!seat && movedSeat && (
        <>
          <button type="button" className="button button--primary button--lg button--block" onClick={takeSeatBack}>
            {t(lang, 'playHere', {name: movedSeat.name})}
          </button>
          <button
            type="button"
            className={`button button--link ${styles.leave}`}
            onClick={() => {
              setMovedSeat(null);
              setError(null);
              setForm((f) => ({...f, name: ''}));
            }}>
            {t(lang, 'joinAsOther')}
          </button>
        </>
      )}

      {!seat && !movedSeat && (
        <form className={styles.joinForm} onSubmit={join}>
          <label>
            {t(lang, 'roomCode')}
            <input
              className={styles.codeInput}
              value={form.code}
              maxLength={4}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="ABCD"
              onChange={(e) => setForm({...form, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')})}
            />
          </label>
          <label>
            {t(lang, 'nickname')}
            <span className={styles.nameRow}>
              <input
                value={form.name}
                readOnly={locked}
                aria-readonly={locked}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={t(lang, 'yourName')}
                onChange={(e) => setForm({...form, name: clampName(e.target.value)})}
              />
              <button
                type="button"
                className={styles.diceButton}
                onClick={() => setForm({...form, name: generateName(lang, takenNames)})}
                aria-label={t(lang, 'newName')}
                title={t(lang, 'newName')}>
                🎲
              </button>
            </span>
            <span className={styles.hint}>
              {locked
                ? t(lang, 'namesLockedNote')
                : t(lang, 'nameHint', {n: Array.from(form.name.trim()).length, max: NAME_MAX})}
            </span>
          </label>
          <div className={styles.avatarField}>
            <span>{t(lang, 'chooseAvatar')}</span>
            <AvatarPicker
              value={form.avatar}
              taken={takenAvatars}
              onChange={(avatar) => {
                avatarTouchedRef.current = true;
                setForm({...form, avatar});
              }}
              lang={lang}
            />
          </div>
          <button
            type="submit"
            className="button button--primary button--lg button--block"
            disabled={status !== 'open' || joining}>
            {t(lang, status !== 'open' ? 'connectingButton' : joining ? 'joining' : 'joinParty')}
          </button>
        </form>
      )}

      {seat && !view && <p className={styles.waiting}>{t(lang, 'joiningRoom', {code: seat.code})}</p>}

      {seat && view && (
        <>
          <div className={styles.youBar} style={{'--seat': view.you.color, borderLeftColor: view.you.color}}>
            <span>{view.you.name}</span>
            <CoinLot
              color={view.you.color}
              avatar={view.you.avatar}
              coins={view.you.coins ?? view.you.score ?? 0}
              delta={view.phase === 'reveal' ? view.you.delta || 0 : 0}
              playKey={`${view.round}-${view.phase}`}
            />
          </div>

          {/* Only this middle part scrolls (if it must); header and emoji dock stay put. */}
          <div className={styles.phoneBody}>
            {view.phase === 'lobby' && (
              <div className={styles.waiting}>
                <p>{t(lang, 'youreIn')}</p>
                <p className={styles.muted}>{t(lang, 'waitingStart', {n: view.playerCount})}</p>
                <button type="button" className={`button button--secondary ${styles.lobbyButton}`} onClick={rerollName}>
                  🎲{' '}{t(lang, 'newName')}
                </button>
                {pickingAvatar ? (
                  <div className={styles.avatarField}>
                    <AvatarPicker value={view.you.avatar} onChange={changeAvatar} lang={lang} />
                    <button type="button" className="button button--secondary button--block" onClick={() => setPickingAvatar(false)}>
                      {t(lang, 'done')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`button button--secondary ${styles.lobbyButton}`}
                    onClick={() => setPickingAvatar(true)}>
                    {t(lang, 'changeAvatar')}
                  </button>
                )}
              </div>
            )}

            {view.question && (
              <div className={styles.phoneQuestion}>
                <p className={styles.kicker}>
                  {t(lang, 'roundOf', {topic: shown.topic, n: view.round, total: view.rounds})}
                  {view.endsIn > 0 && <Countdown msLeft={msLeft} lang={lang} />}
                </p>
              </div>
            )}

            {view.phase === 'guess' && (
              <GuessPad key={`guess-${view.round}`} view={view} lang={lang} onSend={(guess) => sendAction({type: 'guess', ...guess})} />
            )}
            {view.phase === 'bet' && (
              <BetPad key={`bet-${view.round}`} view={view} lang={lang} onSend={(chips) => sendAction({type: 'bet', chips})} />
            )}
            {(view.phase === 'guess' || view.phase === 'bet') && view.progress && (
              <p className={styles.progress}>
                {t(lang, 'progress', {done: view.progress.done, total: view.progress.total})}
              </p>
            )}
            {view.phase === 'reveal' && <Reveal view={view} lang={lang} />}
            {view.phase === 'end' && <FinalRank view={view} lang={lang} />}

            <button type="button" className={`button button--link ${styles.leave}`} onClick={leave}>
              {t(lang, 'leaveParty')}
            </button>
          </div>

          {/* Always in thumb reach, in every phase, including while waiting. */}
          <div className={styles.phoneDock}>
            <ReactionBar lang={lang} onReact={(key) => send({type: 'react', emoji: key})} />
          </div>
        </>
      )}
    </div>
  );
}

/** A pause after each tap so one student can't flood the big screen. */
const REACTION_COOLDOWN_MS = 1200;

/** Six emoji the student can tap any time; the big screen shows them over their avatar. */
function ReactionBar({lang, onReact}) {
  const [coolingDown, setCoolingDown] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function react(key) {
    if (coolingDown) return;
    onReact(key);
    if (navigator.vibrate) navigator.vibrate(20);
    setCoolingDown(true);
    timerRef.current = setTimeout(() => setCoolingDown(false), REACTION_COOLDOWN_MS);
  }

  return (
    <div className={styles.reactionBar} role="group" aria-label={t(lang, 'reactions')} data-cooling={coolingDown}>
      {REACTIONS.map((r) => (
        <button
          key={r.key}
          type="button"
          className={styles.reactionButton}
          onClick={() => react(r.key)}
          disabled={coolingDown}
          aria-label={t(lang, `react_${r.key}`)}
          title={t(lang, `react_${r.key}`)}>
          {r.emoji}
        </button>
      ))}
    </div>
  );
}

/** Calculator layout: digits on the left, ⌫ and . on the right, a tall Lock key under them. */
const NUMPAD_KEYS = ['1', '2', '3', 'del', '4', '5', '6', '.', '7', '8', '9', '0'];

/** Apply one numpad key to the typed text, keeping it a number of ≤ 5 digits. */
function pressKey(text, key) {
  if (key === 'del') return text.slice(0, -1);
  if (key === '.') {
    if (text.includes('.') || digitCount(text) >= MAX_GUESS_DIGITS) return text;
    return text === '' ? '0.' : `${text}.`;
  }
  if (digitCount(text) >= MAX_GUESS_DIGITS) return text;
  return text === '0' ? key : text + key;
}

/**
 * Big on-screen number pad (phones first): digits, a decimal point and delete,
 * with keys large enough for thumbs. A hardware keyboard works too.
 */
function GuessPad({view, lang, onSend}) {
  const [digits, setDigits] = useState('');
  const value = parseGuess(digits);
  const valueRef = useRef(value);
  valueRef.current = value;

  function submit(event) {
    if (event) event.preventDefault();
    if (valueRef.current == null) return;
    onSend({value: valueRef.current});
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[0-9.]$/.test(event.key)) setDigits((d) => pressKey(d, event.key));
      else if (event.key === 'Backspace') setDigits((d) => pressKey(d, 'del'));
      else if (event.key === 'Enter') submit();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // submit reads the latest value through valueRef
  }, []);

  return (
    <form className={styles.pad} onSubmit={submit}>
      {/* Number and its read-back in one box, to keep the pad on one screen. */}
      <div className={styles.numpadDisplay} data-empty={!digits}>
        <output aria-live="polite">{digits || '0'}</output>
        <span id="guess-help" className={styles.preview}>
          {value != null
            ? `= ${describeGuess(value, view.question, lang)}`
            : unitSuffix(view.question, lang).trim() && view.question.unit !== 'year'
              ? t(lang, 'answerIn', {unit: unitSuffix(view.question, lang).trim()})
              : ''}
          <span className={styles.digitCount}>
            {t(lang, 'digits', {n: digitCount(digits), max: MAX_GUESS_DIGITS})}
          </span>
        </span>
      </div>
      <div className={styles.numpad} role="group" aria-describedby="guess-help">
        {NUMPAD_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={styles.numpadKey}
            data-key={key}
            onClick={() => setDigits((d) => pressKey(d, key))}
            aria-label={key === 'del' ? t(lang, 'numpadDelete') : key === '.' ? t(lang, 'numpadPoint') : key}>
            {key === 'del' ? '⌫' : key}
          </button>
        ))}
        <button type="submit" className={`${styles.numpadKey} ${styles.numpadLock}`} disabled={value == null}>
          ✓<span>{t(lang, view.you.guess ? 'changeGuess' : 'lockGuess')}</span>
        </button>
      </div>
      {view.you.guess && <p className={styles.locked}>{t(lang, 'locked', {value: view.you.guess})}</p>}
    </form>
  );
}

/**
 * Coins you can drag onto an answer row (pointer events, so fingers work —
 * the browser's built-in drag-and-drop does not on most phones). Tapping +
 * on a row does the same. `kind` is `a1` (reusable) or `bank` (can be lost).
 */
function CoinTray({a1Left, bankLeft, color, avatar, lang, onDrop}) {
  const [drag, setDrag] = useState(null); // {x, y, over, kind}

  function slotAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const row = el && el.closest('[data-slot]');
    return row ? row.getAttribute('data-slot') : null;
  }

  function start(kind) {
    return (event) => {
      if ((kind === 'a1' && !a1Left) || (kind === 'bank' && bankLeft <= 0)) return;
      event.preventDefault();
      const move = (e) => setDrag({x: e.clientX, y: e.clientY, over: slotAt(e.clientX, e.clientY), kind});
      const end = (e) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        const slot = e.type === 'pointerup' ? slotAt(e.clientX, e.clientY) : null;
        setDrag(null);
        if (slot) onDrop(slot, kind);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
      move(event);
    };
  }

  useEffect(() => {
    document.querySelectorAll('[data-slot][data-over]').forEach((row) => row.removeAttribute('data-over'));
    if (drag && drag.over) document.querySelector(`[data-slot="${CSS.escape(drag.over)}"]`)?.setAttribute('data-over', 'true');
  }, [drag]);

  const shownBank = Math.min(bankLeft, 6);
  return (
    <div className={styles.coinTray}>
      <span className={styles.coins}>
        {a1Left ? (
          <Coin kind="a1" color={color} avatar={avatar} onPointerDown={start('a1')} title={t(lang, 'a1Label')} />
        ) : null}
        {Array.from({length: shownBank}, (_, i) => (
          <Coin key={i} kind="bank" color={color} avatar={avatar} onPointerDown={start('bank')} />
        ))}
        {bankLeft > shownBank && <b>+{bankLeft - shownBank}</b>}
      </span>
      <span className={styles.muted}>{t(lang, 'dragHint')}</span>
      {drag && (
        <span className={styles.coinGhostWrap} style={{left: drag.x, top: drag.y}} aria-hidden="true">
          <Coin kind={drag.kind} color={color} avatar={avatar} />
        </span>
      )}
    </div>
  );
}

function fromBet(bet) {
  let a1 = null;
  const bank = {};
  for (const chip of bet || []) {
    if (chip.a1) a1 = chip.slot;
    if (chip.amount) bank[chip.slot] = (bank[chip.slot] || 0) + chip.amount;
  }
  return {a1, bank};
}

function toList(a1, bank) {
  const slots = new Set([...Object.keys(bank), ...(a1 ? [a1] : [])]);
  return [...slots]
    .filter((slot) => a1 === slot || (bank[slot] || 0) > 0)
    .map((slot) => ({slot, amount: bank[slot] || 0, a1: a1 === slot ? 1 : 0}));
}

function placedCount(a1, bank) {
  return (a1 ? 1 : 0) + Object.values(bank).reduce((sum, n) => sum + n, 0);
}

function BetPad({view, lang, onSend}) {
  const start = fromBet(view.you.bet);
  const [a1, setA1] = useState(start.a1);
  const [bank, setBank] = useState(start.bank);
  const skipTapRef = useRef(0);
  const place = view.question.type === 'place';
  const bankCoins = view.you.coins ?? 0;
  const placed = placedCount(a1, bank);
  const a1Left = !a1;
  const bankLeft = Math.max(0, bankCoins - Object.values(bank).reduce((sum, n) => sum + n, 0));
  const left = (a1Left ? 1 : 0) + bankLeft;
  const locked = toList(a1, bank);
  const dirty = JSON.stringify(locked) !== JSON.stringify(view.you.bet || []);
  const canAdd = place ? placed < 1 : left > 0;
  const youTok = {color: view.you.color, avatar: view.you.avatar, name: view.you.name};

  function put(slot, kind) {
    skipTapRef.current = Date.now();
    if (place) {
      setA1(slot);
      setBank({});
      return;
    }
    if (kind === 'a1') {
      setA1(slot);
      return;
    }
    setBank((current) => {
      const used = Object.values(current).reduce((sum, n) => sum + n, 0);
      if (used >= bankCoins) return current;
      return {...current, [slot]: (current[slot] || 0) + 1};
    });
  }

  function add(slot) {
    if (Date.now() - skipTapRef.current < 500) return;
    if (place) {
      if (a1 === slot) return;
      setA1(slot);
      setBank({});
      return;
    }
    if (!canAdd) return;
    if (!a1) setA1(slot);
    else put(slot, 'bank');
  }

  function remove(slot) {
    if (place) {
      if (a1 === slot) setA1(null);
      return;
    }
    if ((bank[slot] || 0) > 0) {
      setBank((current) => ({...current, [slot]: current[slot] - 1}));
      return;
    }
    if (a1 === slot) setA1(null);
  }

  function clear(slot) {
    if (a1 === slot) setA1(null);
    setBank((current) => ({...current, [slot]: 0}));
  }

  function pileFor(slot) {
    const others = (slot.tokens || []).filter((tok) => !tok.mine);
    const mine = [];
    if (a1 === slot.key) mine.push({...youTok, kind: 'a1'});
    for (let i = 0; i < (bank[slot.key] || 0); i++) mine.push({...youTok, kind: 'bank'});
    return [...others, ...mine];
  }

  return (
    <div className={styles.pad}>
      <p className={styles.chipsLeft}>
        {t(lang, left === 1 ? 'chipLeft' : 'chipsLeft', {n: left})}{' '}
        <span className={styles.muted}>{t(lang, place ? 'oneCoinOnly' : 'chipsNote')}</span>
      </p>
      <CoinTray
        a1Left={a1Left && (place ? placed < 1 : true)}
        bankLeft={place ? 0 : bankLeft}
        color={view.you.color}
        avatar={view.you.avatar}
        lang={lang}
        onDrop={put}
      />
      <ul className={styles.betList} data-density={boardDensity(view.board.length)} data-place={place || undefined}>
        {view.board.map((slot) => {
          const mine = (a1 === slot.key ? 1 : 0) + (bank[slot.key] || 0);
          return (
            <li
              key={slot.key}
              data-slot={slot.key}
              data-active={mine > 0}
              className={styles.betCard}
              onClick={() => add(slot.key)}>
              <div className={styles.cardCoins}>
                <CoinPile tokens={pileFor(slot)} lang={lang} perch />
              </div>
              <div className={styles.cardFace}>
                <span className={styles.betOdds}>{slot.odds}:1</span>
                <span className={styles.betLabel}>
                  {slot.key === 'smaller' ? t(lang, 'smallerThanAll') : slot.label}
                  {slot.detail && <span className={styles.betDetail}>{slot.detail}</span>}
                  {slot.mine && <em className={styles.mine}> {t(lang, 'yours')}</em>}
                </span>
              </div>
              <div className={styles.betCardTools} onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className={styles.betClear}
                  disabled={mine <= 0}
                  onClick={() => clear(slot.key)}
                  aria-label={t(lang, 'clearBets')}>
                  ×
                </button>
                <button
                  type="button"
                  className={styles.betMinus}
                  disabled={mine <= 0}
                  onClick={() => remove(slot.key)}
                  aria-label={t(lang, 'removeChip')}>
                  −
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className={styles.betActions}>
        <button
          type="button"
          className="button button--primary button--lg button--block"
          disabled={placed === 0 || !dirty}
          onClick={() => onSend(locked)}>
          {view.you.bet ? t(lang, dirty ? 'updateBets' : 'betsLocked') : t(lang, 'lockBets', {n: placed})}
        </button>
      </div>
    </div>
  );
}

const LOT_COLS = 5;
const LOT_ROWS = 3;
const LOT_MAX = LOT_COLS * LOT_ROWS;

/** The player's coin pile: A1 plus bank coins, with a fly-in / fly-out burst on reveal. */
function CoinLot({color, avatar, coins, delta, playKey}) {
  const [phase, setPhase] = useState('idle');
  const abs = Math.abs(delta || 0);
  const gain = (delta || 0) > 0;
  const shown = Math.min(Math.max(0, coins), LOT_MAX);
  const extra = Math.max(0, coins - LOT_MAX);
  const flyN = Math.min(abs, LOT_MAX);
  const flyExtra = Math.max(0, abs - LOT_MAX);

  useEffect(() => {
    if (!abs) {
      setPhase('idle');
      return undefined;
    }
    setPhase('fly');
    const landAt = window.setTimeout(() => setPhase('land'), gain ? 480 : 60);
    const doneAt = window.setTimeout(() => setPhase('idle'), 1300);
    return () => {
      window.clearTimeout(landAt);
      window.clearTimeout(doneAt);
    };
  }, [playKey, abs, gain]);

  return (
    <span className={styles.youLot}>
      <span className={`${styles.lotGrid} ${phase === 'land' && gain ? styles.lotBounce : ''}`}>
        <Coin kind="a1" color={color} avatar={avatar} size="sm" />
        {Array.from({length: shown}, (_, i) => (
          <Coin key={i} kind="bank" color={color} avatar={avatar} size="xs" />
        ))}
        {extra > 0 && <b className={styles.lotMore}>+{extra}</b>}
      </span>
      {abs > 0 && phase !== 'idle' && (
        <span className={styles.lotFly} data-dir={gain ? 'in' : 'out'} aria-hidden="true">
          {Array.from({length: flyN}, (_, i) => (
            <span key={i} className={styles.lotFlyCoin} style={{animationDelay: `${(i % LOT_MAX) * 32}ms`}}>
              <Coin kind="bank" color={color} avatar={avatar} size="xs" />
            </span>
          ))}
          {flyExtra > 0 && (
            <b className={styles.lotMore} style={{animationDelay: `${flyN * 32}ms`}}>
              +{flyExtra}
            </b>
          )}
        </span>
      )}
      {abs > 0 && (
        <em className={`${styles.lotDelta} ${gain ? styles.gain : styles.loss}`}>{gain ? `+${delta}` : delta}</em>
      )}
    </span>
  );
}

function Reveal({view, lang}) {
  const winner = view.board.find((slot) => slot.key === view.result.winner);
  return (
    <div className={styles.reveal}>
      <p className={styles.revealAnswer}>
        {view.result.answerLabel}
        {unitSuffix(view.question, lang)}
      </p>
      <p className={styles.muted}>
        {t(lang, 'winningSlot', {
          label: !winner ? '?' : winner.key === 'smaller' ? t(lang, 'smallerThanAll') : winner.label,
          odds: winner?.odds,
        })}
      </p>
      {view.result.hint && <p className={styles.revealHint}>{t(lang, 'why', {hint: view.result.hint})}</p>}
    </div>
  );
}

function FinalRank({view, lang}) {
  const mine = view.ranking.find((row) => row.playerId === view.to);
  return (
    <div className={styles.reveal}>
      <p className={styles.muted}>{t(lang, 'gameOver')}</p>
      <p className={styles.revealAnswer}>{mine ? `#${mine.rank}` : ''}</p>
      <ol className={styles.ranking}>
        {view.ranking.map((row) => (
          <li key={row.playerId}>
            <span className={styles.rank}>{row.rank}</span>
            <Avatar avatar={row.avatar} color={row.color} />
            <span className={styles.scoreName}>{row.name}</span>
            <span className={styles.scoreValue}>{row.coins ?? row.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
