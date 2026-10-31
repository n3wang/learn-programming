import React, {useEffect, useRef, useState} from 'react';
import Head from '@docusaurus/Head';
import {createPartySocket} from '@site/src/api/partyClient';
import {REACTIONS, isValidAvatar, randomAvatar} from '@site/src/components/BetsAndWagers/logic';
import {Avatar, AvatarPicker, ConnectionBadge, Countdown, readJson, writeJson} from '@site/src/components/BetsAndWagers/ui';
import {LangSwitch, useLang} from '@site/src/components/BetsAndWagers/strings';
import {generateName, isGeneratedName} from '@site/src/components/BetsAndWagers/names';
import {L, st} from './strings';
import RulesSheet from './RulesSheet';
import styles from './party.module.css';

/**
 * A phone in a /party game. Same join flow as Bets & Wagers (room code,
 * generated name with the dice, avatar grid) so every game feels the same;
 * once seated it shows the game's PhoneView with whatever the host sent.
 */

const SEAT_KEY = 'party-seat-v1';
const NAME_KEY = 'bw-name-v1';
const AVATAR_KEY = 'bw-avatar-v1';
const NAME_MAX = 16;
const SEAT_ERRORS = {
  'room-not-found': 'errRoomNotFound',
  'room-full': 'errRoomFull',
  'name-taken': 'errNameTaken',
};

function query(key) {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(key) || '';
}

function readSeat() {
  try {
    const own = JSON.parse(window.sessionStorage.getItem(SEAT_KEY) || 'null');
    if (own) return own;
  } catch {
    // blocked storage
  }
  return readJson(SEAT_KEY);
}

function writeSeat(seat) {
  try {
    if (seat) window.sessionStorage.setItem(SEAT_KEY, JSON.stringify(seat));
    else window.sessionStorage.removeItem(SEAT_KEY);
  } catch {
    // blocked storage
  }
  writeJson(SEAT_KEY, seat);
}

/** Open the phone page for the game a room is really playing. */
function goToGame(code, game) {
  const params = new URLSearchParams(window.location.search);
  params.set('room', code);
  if (game && game !== 'wagers') params.set('game', game);
  else params.delete('game');
  window.location.replace(`${window.location.pathname}?${params.toString()}`);
}

export default function PlayerShell({mod}) {
  const gameId = mod.id;
  const queryRoom = query('room').trim().toUpperCase().slice(0, 4);
  const saved = useRef(undefined);
  if (saved.current === undefined) saved.current = readSeat();
  const initialSeat =
    saved.current && saved.current.game === gameId && (!queryRoom || queryRoom === saved.current.code) ? saved.current : null;

  const seatRef = useRef(initialSeat);
  const socketRef = useRef(null);
  const pendingRef = useRef(null);
  const wrapRef = useRef(false);
  const [seat, setSeat] = useState(initialSeat);
  const [lang, setLang] = useLang();
  const [status, setStatus] = useState('connecting');
  const [base, setBase] = useState('');
  const [env, setEnv] = useState(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [joining, setJoining] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [showRules, setShowRules] = useState(false);
  /** A tap went out and the host hasn't answered yet: block double taps. */
  const [sending, setSending] = useState(false);
  const sendingTimerRef = useRef(null);
  const [, setTick] = useState(0);
  const [form, setForm] = useState({
    code: queryRoom || saved.current?.code || '',
    name: saved.current?.name || readJson(NAME_KEY) || generateName('en'),
    avatar: [saved.current?.avatar, readJson(AVATAR_KEY)].find(isValidAvatar) || randomAvatar(),
  });

  function rememberSeat(next) {
    seatRef.current = next;
    setSeat(next);
    writeSeat(next);
  }

  function dropSeat(message) {
    rememberSeat(null);
    pendingRef.current = null;
    setEnv(null);
    setJoining(false);
    setError(message);
  }

  function rawSend(msg) {
    return Boolean(socketRef.current && socketRef.current.send(msg));
  }

  /** A game action. Older relays don't know `input`: then it rides inside a `bet`. */
  function sendInput(msg) {
    pendingRef.current = msg;
    setSending(true);
    window.clearTimeout(sendingTimerRef.current);
    // A move the host ignores gets no reply; let the phone go again soon anyway.
    sendingTimerRef.current = window.setTimeout(() => setSending(false), 2500);
    if (wrapRef.current) rawSend({type: 'bet', input: msg});
    else rawSend({type: 'input', ...msg});
    setTick((n) => n + 1);
  }

  function handleMessage(msg) {
    switch (msg.type) {
      case 'joined':
        rememberSeat({code: msg.code, playerId: msg.playerId, name: msg.name, avatar: isValidAvatar(msg.avatar) ? msg.avatar : seatRef.current?.avatar, game: gameId});
        writeJson(NAME_KEY, msg.name);
        setError(null);
        setJoining(false);
        setNotice(msg.hostConnected ? null : 'hostAway');
        if (pendingRef.current) sendInput(pendingRef.current);
        break;
      case 'room_info':
        setRoomInfo(msg);
        if (msg.found && (msg.settings?.game || 'wagers') !== gameId && msg.code === form.code.trim().toUpperCase()) {
          setNotice('wrongGame');
          goToGame(msg.code, msg.settings?.game);
        }
        break;
      case 'state': {
        if (msg.game && msg.game !== gameId) {
          goToGame(seatRef.current?.code, msg.game);
          return;
        }
        const current = seatRef.current;
        if (current && msg.you && msg.you.name !== current.name) rememberSeat({...current, name: msg.you.name});
        pendingRef.current = null;
        setSending(false);
        setEnv(msg);
        setReceivedAt(Date.now());
        break;
      }
      case 'host_left':
        setNotice('hostAway');
        break;
      case 'host_back':
        setNotice(null);
        break;
      case 'room_closed':
        dropSeat('errClosed');
        break;
      case 'seat_taken':
        dropSeat('errSeatTaken');
        break;
      case 'kicked':
        dropSeat('errKicked');
        break;
      case 'error':
        if (msg.message === 'unknown-type' && !wrapRef.current && pendingRef.current) {
          wrapRef.current = true;
          sendInput(pendingRef.current);
        } else if (SEAT_ERRORS[msg.message]) dropSeat(SEAT_ERRORS[msg.message]);
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
        if (current) socket.send({type: 'join', code: current.code, name: current.name, playerId: current.playerId, avatar: current.avatar});
      },
      onStatus: (next, reached) => {
        setStatus(next);
        if (reached) setBase(reached);
      },
    });
    socketRef.current = socket;
    return () => socket.close();
  }, []);

  const formCode = form.code.trim().toUpperCase();
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

  useEffect(() => {
    if (seat || !locked || isGeneratedName(form.name)) return;
    setForm((f) => ({...f, name: generateName(lang, takenNames)}));
  }, [seat, locked, lang]);

  useEffect(() => {
    if (!env || !env.endsIn) return undefined;
    const timer = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(timer);
  }, [env]);

  // A short buzz when the phone's task changes, so heads come up from desks.
  const taskKey = env?.data?.task || env?.phase || '';
  const urgent = Boolean(env?.data?.urgent);
  useEffect(() => {
    if (!taskKey || typeof navigator === 'undefined' || !navigator.vibrate) return;
    // A double buzz when the phone needs you, a short one for anything else.
    navigator.vibrate(urgent ? [90, 60, 90] : 40);
  }, [taskKey]);

  function join(event) {
    event.preventDefault();
    const name = Array.from(form.name.trim()).slice(0, NAME_MAX).join('');
    if (formCode.length !== 4) return setError('errCode');
    if (!name) return setError('errName');
    setError(null);
    seatRef.current = {code: formCode, name, playerId: null, avatar: form.avatar, game: gameId};
    writeJson(AVATAR_KEY, form.avatar);
    if (rawSend({type: 'join', code: formCode, name, avatar: form.avatar})) setJoining(true);
    else setError('errStillConnecting');
    return undefined;
  }

  function rejoinWith(patch) {
    const current = seatRef.current;
    if (!current) return;
    const next = {...current, ...patch};
    seatRef.current = next;
    if (patch.avatar) writeJson(AVATAR_KEY, patch.avatar);
    rawSend({type: 'join', code: next.code, name: next.name, playerId: next.playerId, avatar: next.avatar});
  }

  function leave() {
    if (!window.confirm(st(lang, 'leaveConfirm'))) return;
    rawSend({type: 'leave'});
    dropSeat(null);
  }

  const msLeft = env ? env.endsIn - (Date.now() - receivedAt) : 0;
  const offline = Boolean(seat) && status !== 'open';
  const {PhoneView} = mod;

  return (
    <div className={`${styles.shell} ${styles.phone} ${mod.themeClass || ''}`} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
      <Head>
        <title>{L(mod.title, lang)}</title>
      </Head>
      <header className={styles.phoneHeader}>
        <strong className={styles.brand}>
          {mod.emoji} {L(mod.title, lang)}
        </strong>
        {seat && <span className={styles.muted}>{seat.code}</span>}
        <span className={styles.headerRight}>
          <ConnectionBadge status={status} base={base} lang={lang} compact />
          {seat && (
            <button type="button" className={styles.headerExit} onClick={leave}>
              {st(lang, 'headerExit')}
            </button>
          )}
          {mod.howTo && (
            <button type="button" className={styles.helpButton} aria-pressed={showRules} onClick={() => setShowRules(!showRules)} aria-label={st(lang, 'howToPlay')}>
              ❓
            </button>
          )}
          <LangSwitch lang={lang} setLang={setLang} />
        </span>
      </header>

      {showRules && (
        <div className={styles.phoneRules}>
          <div className={styles.overlayHead}>
            <b>{st(lang, 'howToPlay')}</b>
            <button type="button" className="button button--sm button--secondary" onClick={() => setShowRules(false)}>
              ✕ {st(lang, 'close')}
            </button>
          </div>
          <RulesSheet mod={mod} lang={lang} compact />
        </div>
      )}

      {error && <p className={styles.error}>{st(lang, error, {n: 64})}</p>}
      {offline && <p className={styles.notice}>{st(lang, 'reconnectingSaved')}</p>}
      {notice && !offline && <p className={styles.notice}>{st(lang, notice)}</p>}

      {!seat && (
        <form className={styles.joinForm} onSubmit={join}>
          <label>
            {st(lang, 'roomCode')}
            <input
              className={styles.codeInput}
              value={form.code}
              maxLength={4}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder="ABCD"
              onChange={(e) => setForm({...form, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')})}
            />
          </label>
          <label>
            {st(lang, 'nickname')}
            <span className={styles.nameRow}>
              <input
                value={form.name}
                readOnly={locked}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setForm({...form, name: Array.from(e.target.value).slice(0, NAME_MAX).join('')})}
              />
              <button type="button" className={styles.diceButton} onClick={() => setForm({...form, name: generateName(lang, takenNames)})} aria-label={st(lang, 'newName')}>
                🎲
              </button>
            </span>
            {locked && <span className={styles.hint}>{st(lang, 'namesLockedNote')}</span>}
          </label>
          <div className={styles.avatarField}>
            <span>{st(lang, 'chooseAvatar')}</span>
            <AvatarPicker value={form.avatar} taken={takenAvatars} onChange={(avatar) => setForm({...form, avatar})} lang={lang} />
          </div>
          <button type="submit" className="button button--lg button--block" disabled={status !== 'open' || joining}>
            {st(lang, status !== 'open' ? 'connectingButton' : joining ? 'joining' : 'joinParty')}
          </button>
        </form>
      )}

      {seat && !env && <p className={styles.waiting}>{st(lang, 'joiningRoom', {code: seat.code})}</p>}

      {seat && env && (
        <>
          <div className={styles.youBar} style={{borderLeftColor: env.you?.color}}>
            <Avatar avatar={env.you?.avatar} color={env.you?.color} size="md" />
            <span>{env.you?.name}</span>
            {env.you?.seat > 0 && env.phase !== 'lobby' && <span className={styles.seatBadge}>{st(lang, 'seat', {n: env.you.seat})}</span>}
            {msLeft > 0 && (
              <span className={styles.youTimer}>
                <Countdown msLeft={msLeft} lang={lang} />
              </span>
            )}
          </div>

          {urgent && env.phase !== 'lobby' && <div className={styles.yourMove}>👉 {st(lang, 'yourMove')}</div>}
          <div className={styles.phoneBody} data-urgent={urgent && env.phase !== 'lobby'} data-sending={sending}>
            {sending && <div className={styles.sendingVeil}>{st(lang, 'sending')}</div>}
            {env.phase === 'lobby' && (
              <div className={styles.waiting}>
                <p className={styles.lobbyGame}>
                  {mod.emoji} <b>{L(mod.title, lang)}</b>
                </p>
                <p>{st(lang, 'youreIn')}</p>
                <p className={styles.muted}>{st(lang, 'waitingStart', {n: env.playerCount})}</p>
                <button type="button" className="button button--secondary" onClick={() => rejoinWith({name: generateName(lang, [seatRef.current?.name])})}>
                  🎲 {st(lang, 'newName')}
                </button>
                {pickingAvatar ? (
                  <div className={styles.avatarField}>
                    <AvatarPicker
                      value={env.you?.avatar}
                      onChange={(avatar) => rejoinWith({avatar})}
                      lang={lang}
                    />
                    <button type="button" className="button button--secondary button--block" onClick={() => setPickingAvatar(false)}>
                      {st(lang, 'done')}
                    </button>
                  </div>
                ) : (
                  <button type="button" className="button button--secondary" onClick={() => setPickingAvatar(true)}>
                    {st(lang, 'changeAvatar')}
                  </button>
                )}
                {mod.howTo && (
                  <div className={styles.card} style={{textAlign: 'left', width: '100%'}}>
                    <b>{st(lang, 'howToPlay')}</b>
                    <RulesSheet mod={{howTo: mod.howTo}} lang={lang} compact />
                  </div>
                )}
              </div>
            )}
            {env.phase !== 'lobby' && env.audience && <p className={styles.waiting}>{L(mod.audienceText || {en: 'This game is full. Watch the big screen!', zh: '这局已满员，看大屏幕吧！'}, lang)}</p>}
            {env.phase !== 'lobby' && env.data && <PhoneView view={env.data} envelope={env} lang={lang} send={sendInput} />}
          </div>

          <div className={styles.phoneDock}>
            {REACTIONS.map((r) => (
              <button key={r.key} type="button" className={styles.reactButton} onClick={() => rawSend({type: 'react', emoji: r.key})}>
                {r.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
