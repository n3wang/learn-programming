import React, {useEffect, useRef, useState} from 'react';
import Head from '@docusaurus/Head';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import {apiOverride, createPartySocket} from '@site/src/api/partyClient';
import {reactionEmoji} from '@site/src/components/BetsAndWagers/logic';
import {Avatar, ConnectionBadge, Countdown, readJson, writeJson} from '@site/src/components/BetsAndWagers/ui';
import {LangSwitch, useLang} from '@site/src/components/BetsAndWagers/strings';
import {
  MAX_SEATS,
  addBot,
  admittedName,
  isBotId,
  isTestMode,
  makeRng,
  newShellGame,
  numberSeats,
  seatPlayer,
  seatedIds,
} from './partyCore';
import {useVoice} from './voice';
import RulesSheet from './RulesSheet';
import {L, st} from './strings';
import styles from './party.module.css';

/**
 * The big screen for every /party game except Bets & Wagers. It is the
 * referee: the game module's rules run here, and each phone only ever gets
 * the view `mod.view` builds for its seat (the anti-cheat line).
 *
 * Module contract (see ../registry.js): setup, input, tick, view, bot,
 * optional hostInput, voiceLines, HostView, PhoneView, SettingsView.
 */

const HOST_PREFS_KEY = 'party-host-prefs-v1';
const REACTION_SHOW_MS = 3600;
const BOT_STEP_MS = 650;

function hostKey(gameId) {
  return `party-host-${gameId}-v1`;
}

/** Every seat that is in the running game (bots included). */
function inGame(g, id) {
  return Boolean(g.state && g.state.seats && g.state.seats.includes(id));
}

export default function HostShell({mod}) {
  const gameId = mod.id;
  const test = isTestMode();
  const saved = useRef(null);
  if (saved.current === null) saved.current = readJson(hostKey(gameId)) || {};
  const gameRef = useRef(saved.current.game && saved.current.game.gameId === gameId ? saved.current.game : newShellGame(gameId, mod, readJson(HOST_PREFS_KEY) || {}));
  const roomRef = useRef({code: saved.current.code || null, hostToken: saved.current.hostToken || null});
  const socketRef = useRef(null);
  const replacedRef = useRef(false);
  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = makeRng(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('seed') : null);
  const [, setTick] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [base, setBase] = useState('');
  const [qr, setQr] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useLang();
  const [voiceOn, setVoiceOn] = useState(!test);
  const [inspect, setInspect] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [reactions, setReactions] = useState([]);
  const langRef = useRef(lang);
  langRef.current = lang;

  const rerender = () => setTick((n) => n + 1);
  /** What rules get besides the state: dice, clock, language, and seat numbers for voice lines. */
  const ctx = (now = Date.now(), g = gameRef.current) => ({
    rng: rngRef.current,
    speed: test ? 0.2 : 1,
    now,
    lang: langRef.current,
    test,
    seatOf: (id) => (g.players[id] ? g.players[id].seat : 0),
  });

  function persist() {
    writeJson(hostKey(gameId), {...roomRef.current, game: gameRef.current});
  }

  function sendSettings() {
    if (!socketRef.current || replacedRef.current) return;
    socketRef.current.send({type: 'settings', settings: {game: gameId, lockedNames: gameRef.current.lockedNames}});
  }

  function envelope(g, playerId, now) {
    const p = g.players[playerId];
    const seated = inGame(g, playerId);
    const state = g.state;
    return {
      type: 'state',
      to: playerId,
      game: gameId,
      phase: g.phase,
      playerCount: Object.keys(g.players).length,
      lockedNames: g.lockedNames,
      endsIn: state && state.deadline ? Math.max(0, state.deadline - now) : 0,
      you: p && {name: p.name, avatar: p.avatar, color: p.color, seat: p.seat},
      audience: g.phase !== 'lobby' && !seated,
      data: g.phase !== 'lobby' && seated ? mod.view(state, g, playerId, ctx(now, g)) : null,
    };
  }

  function broadcast() {
    const socket = socketRef.current;
    if (!socket || replacedRef.current) return;
    const g = gameRef.current;
    const now = Date.now();
    for (const id of Object.keys(g.players)) {
      if (isBotId(id) || !g.players[id].connected) continue;
      socket.send(envelope(g, id, now));
    }
  }

  /** Every change: mutate a copy, settle the end, save, push views, redraw. */
  function commit(mutate) {
    const draft = structuredClone(gameRef.current);
    const now = Date.now();
    if (mutate(draft, now) === false) return false;
    if (draft.phase === 'play' && draft.state && draft.state.over) draft.phase = 'end';
    gameRef.current = draft;
    persist();
    broadcast();
    rerender();
    return true;
  }

  function applyInput(playerId, msg) {
    return commit((g, now) => {
      if (g.phase === 'lobby' || !g.state || !inGame(g, playerId) || g.state.over) return false;
      return mod.input(g.state, g, playerId, msg, ctx(now, g)) ? undefined : false;
    });
  }

  function hostAct(msg) {
    if (!mod.hostInput) return;
    commit((g, now) => (g.state && mod.hostInput(g.state, g, msg, ctx(now, g)) ? undefined : false));
  }

  function startGame() {
    commit((g, now) => {
      numberSeats(g);
      const seats = seatedIds(g).slice(0, mod.players.max);
      g.state = mod.setup(g, seats, ctx(now, g));
      g.state.seats = seats;
      g.phase = 'play';
    });
    setInspect(null);
    window.scrollTo(0, 0);
  }

  function toLobby() {
    commit((g) => {
      g.phase = 'lobby';
      g.state = null;
      // Players who left mid-game give their seat back now.
      for (const [id, p] of Object.entries(g.players)) if (p.gone) delete g.players[id];
    });
  }

  function handleMessage(msg) {
    const id = msg.playerId;
    switch (msg.type) {
      case 'room':
        roomRef.current = {code: msg.code, hostToken: msg.hostToken};
        replacedRef.current = false;
        commit((g) => {
          for (const p of msg.players || []) {
            if (g.players[p.playerId]) g.players[p.playerId].connected = p.connected;
          }
        });
        sendSettings();
        break;
      case 'player_joined':
        commit((g, now) => {
          const existing = g.players[id];
          if (existing) {
            existing.connected = true;
            existing.gone = false;
            if (msg.avatar) existing.avatar = msg.avatar;
            if (msg.name && msg.name !== existing.name) existing.name = admittedName({...g, players: Object.fromEntries(Object.entries(g.players).filter(([k]) => k !== id))}, msg.name, langRef.current);
            return undefined;
          }
          seatPlayer(g, id, {name: admittedName(g, msg.name, langRef.current), avatar: msg.avatar}, now);
          return undefined;
        });
        break;
      case 'player_left':
        commit((g) => {
          const p = g.players[id];
          if (!p) return false;
          if (msg.reason === 'left' || msg.reason === 'kicked') {
            if (g.phase === 'lobby') delete g.players[id];
            else {
              p.connected = false;
              p.gone = true;
            }
          } else {
            p.connected = false;
          }
          return undefined;
        });
        break;
      case 'input':
        applyInput(id, msg);
        break;
      case 'bet':
        // Older relays only forward guess/bet/react: phones then wrap their input in a bet.
        if (msg.input && typeof msg.input === 'object') applyInput(id, msg.input);
        break;
      case 'react': {
        const emoji = reactionEmoji(msg.emoji);
        const g = gameRef.current;
        if (!emoji || !g.players[id]) break;
        const uid = `${id}-${Date.now()}`;
        setReactions((list) => [...list.filter((r) => r.playerId !== id).slice(-11), {uid, playerId: id, emoji}]);
        setTimeout(() => setReactions((list) => list.filter((r) => r.uid !== uid)), REACTION_SHOW_MS);
        break;
      }
      case 'host_replaced':
        replacedRef.current = true;
        rerender();
        break;
      case 'error':
        if (msg.message === 'room-not-found' || msg.message === 'bad-host-token') {
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

  // Clock: run out deadlines, redraw countdowns.
  useEffect(() => {
    const timer = setInterval(() => {
      const g = gameRef.current;
      if (replacedRef.current || g.phase !== 'play' || !g.state) return;
      if (g.state.deadline && Date.now() >= g.state.deadline) {
        commit((draft, now) => (mod.tick(draft.state, draft, ctx(now, draft)) ? undefined : false));
      } else {
        rerender();
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // Bots: every step, each bot may make the move its seat is waiting on.
  useEffect(() => {
    const timer = setInterval(() => {
      const g = gameRef.current;
      if (replacedRef.current || g.phase !== 'play' || !g.state || g.state.over) return;
      const bots = g.state.seats.filter((id) => isBotId(id));
      for (const id of bots) {
        if (rngRef.current() > (test ? 0.7 : 0.35)) continue;
        const current = gameRef.current;
        if (!current.state || current.state.over) return;
        const move = mod.bot(current.state, current, id, ctx());
        if (move) applyInput(id, move);
      }
    }, test ? BOT_STEP_MS / 3 : BOT_STEP_MS);
    return () => clearInterval(timer);
  }, []);

  const code = roomRef.current.code;
  const api = apiOverride();
  const playPath = typeof window !== 'undefined' ? window.location.pathname.replace(/party\/host\/?$/, 'party/play') : '';
  const joinUrl = code && playPath ? `${window.location.origin}${playPath}?room=${code}&game=${gameId}${api ? `&api=${encodeURIComponent(api)}` : ''}` : '';

  useEffect(() => {
    if (!joinUrl) return;
    import('qrcode')
      .then((m) => (m.default || m).toDataURL(joinUrl, {margin: 1, width: 360}))
      .then(setQr)
      .catch(() => setQr(null));
  }, [joinUrl]);

  useEffect(() => {
    sendSettings();
  }, [code]);

  const g = gameRef.current;
  const subtitle = useVoice({gameId, lines: mod.voiceLines, state: g.state, lang, enabled: voiceOn});
  const ids = seatedIds(g);
  const humans = ids.filter((id) => !isBotId(id));
  const max = Math.min(mod.players.max, MAX_SEATS);
  const canStart = ids.length >= mod.players.min;
  const now = Date.now();
  const msLeft = g.state && g.state.deadline ? g.state.deadline - now : 0;

  const setLocked = (locked) =>
    commit((draft) => {
      draft.lockedNames = locked;
      writeJson(HOST_PREFS_KEY, {lockedNames: locked});
    }) && sendSettings();

  const addBots = (n) =>
    commit((draft) => {
      for (let i = 0; i < n && Object.keys(draft.players).length < max; i++) addBot(draft, langRef.current);
    });

  const removeBots = () =>
    commit((draft) => {
      for (const id of Object.keys(draft.players)) if (isBotId(id)) delete draft.players[id];
    });

  const kick = (playerId) => {
    if (isBotId(playerId)) {
      commit((draft) => {
        delete draft.players[playerId];
      });
      return;
    }
    socketRef.current.send({type: 'kick', playerId});
  };

  const fullScreen = () => {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const {HostView, SettingsView, PhoneView} = mod;

  return (
    // The host is a big-screen app: this class hides the site navbar and footer here only.
    <HtmlClassNameProvider className="party-host-page">
    <div className={`${styles.shell} ${styles.host} ${mod.themeClass || ''}`} lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
      <Head>
        <title>{`${L(mod.title, lang)} — ${lang === 'zh' ? '主持' : 'Host'}`}</title>
      </Head>
      <header className={styles.hostHeader}>
        <Link to="/party" className={styles.backLink}>
          {st(lang, 'backToMenu')}
        </Link>
        <strong className={styles.brand}>
          {mod.emoji} {L(mod.title, lang)}
        </strong>
        {code && (
          <span className={styles.roomCode}>
            {st(lang, 'room')} <b>{code}</b>
          </span>
        )}
        {test && <span className={styles.testBadge}>{st(lang, 'testMode')}</span>}
        <span className={styles.headerRight}>
          <ConnectionBadge status={status} base={base} lang={lang} />
          <button type="button" className="button button--sm button--secondary" onClick={() => setVoiceOn(!voiceOn)}>
            {st(lang, voiceOn ? 'voiceOn' : 'voiceOff')}
          </button>
          {mod.howTo && (
            <button type="button" className="button button--sm button--secondary" aria-pressed={showRules} onClick={() => setShowRules(!showRules)}>
              ❓ {st(lang, 'howToPlay')}
            </button>
          )}
          <LangSwitch lang={lang} setLang={setLang} />
          <button type="button" className="button button--sm button--secondary" onClick={fullScreen}>
            {st(lang, 'fullScreen')}
          </button>
        </span>
      </header>

      {replacedRef.current && <p className={styles.notice}>{st(lang, 'replacedBody')}</p>}

      {g.phase === 'lobby' && (
        <div className={styles.lobby}>
          <section className={styles.panel}>
            <p className={styles.kicker}>{st(lang, 'joinOnPhone')}</p>
            <div className={styles.bigCode}>{code || '····'}</div>
            {qr ? <img className={styles.qr} src={qr} alt={joinUrl} /> : <div className={styles.qrPlaceholder} />}
            {joinUrl && (
              <p className={styles.joinUrl}>
                <code>{joinUrl.replace(/^https?:\/\//, '')}</code>
                <button
                  type="button"
                  className="button button--sm button--secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(joinUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}>
                  {st(lang, copied ? 'copied' : 'copyLink')}
                </button>
              </p>
            )}
            {mod.howTo && (
              <>
                <h3 className={styles.subTitle}>{st(lang, 'howToPlay')}</h3>
                <RulesSheet mod={{howTo: mod.howTo}} lang={lang} compact />
              </>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {st(lang, 'players')} <span className={styles.muted}>{ids.length} / {max}</span>
            </h2>
            <ul className={styles.playerList}>
              {ids.map((id) => {
                const p = g.players[id];
                return (
                  <li key={id} data-offline={!p.connected}>
                    <Avatar avatar={p.avatar} color={p.color} size="sm" />
                    <span>{p.name}</span>
                    {p.bot && <span className={styles.tag}>{st(lang, 'bot')}</span>}
                    {!p.connected && <span className={styles.tag}>{st(lang, 'offline')}</span>}
                    <button type="button" className={styles.kick} onClick={() => kick(id)} aria-label="remove">
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className={styles.buttonRow}>
              <button type="button" className="button button--sm button--secondary" onClick={() => addBots(1)} disabled={ids.length >= max}>
                {st(lang, 'addBot')}
              </button>
              <button type="button" className="button button--sm button--secondary" onClick={() => addBots(3)} disabled={ids.length >= max}>
                {st(lang, 'addBots')}
              </button>
              <button type="button" className="button button--sm button--secondary" onClick={() => addBots(max)} disabled={ids.length >= max}>
                {st(lang, 'fillBots', {n: max})}
              </button>
              {ids.length > humans.length && (
                <button type="button" className="button button--sm button--secondary" onClick={removeBots}>
                  {st(lang, 'removeBots')}
                </button>
              )}
            </div>

            <h3 className={styles.subTitle}>{st(lang, 'names')}</h3>
            <div className={styles.buttonRow} role="radiogroup">
              <button type="button" role="radio" aria-checked={g.lockedNames} className="button button--sm button--secondary" onClick={() => setLocked(true)}>
                {st(lang, 'lockedNames')}
              </button>
              <button type="button" role="radio" aria-checked={!g.lockedNames} className="button button--sm button--secondary" onClick={() => setLocked(false)}>
                {st(lang, 'freeNames')}
              </button>
            </div>

            {SettingsView && (
              <>
                <h3 className={styles.subTitle}>{st(lang, 'settings')}</h3>
                <SettingsView
                  settings={g.settings}
                  playerCount={ids.length}
                  lang={lang}
                  set={(patch) =>
                    commit((draft) => {
                      draft.settings = {...draft.settings, ...patch};
                    })
                  }
                />
              </>
            )}

            <button type="button" className={`button button--lg button--block ${styles.startButton}`} disabled={!canStart} onClick={startGame}>
              {st(lang, 'startGame')}
            </button>
            {!canStart && <p className={styles.muted}>{st(lang, 'needPlayers', {n: mod.players.min})}</p>}
            {ids.length >= max && <p className={styles.muted}>{st(lang, 'tooMany', {n: max})}</p>}
          </section>
        </div>
      )}

      {g.phase !== 'lobby' && g.state && (
        <div className={styles.stage}>
          <div className={styles.stageMain}>
            {msLeft > 0 && (
              <div className={styles.stageTimer}>
                <Countdown msLeft={msLeft} lang={lang} />
              </div>
            )}
            <HostView g={g} state={g.state} lang={lang} ctx={ctx()} hostAct={hostAct} />
            <div className={styles.buttonRow}>
              {g.phase === 'end' && (
                <button type="button" className="button button--secondary" onClick={startGame}>
                  {st(lang, 'playAgain')}
                </button>
              )}
              <button
                type="button"
                className="button button--sm button--secondary"
                onClick={() => (g.phase === 'end' || window.confirm(st(lang, 'endConfirm'))) && toLobby()}>
                {st(lang, g.phase === 'end' ? 'toLobby' : 'endGame')}
              </button>
              {test && (
                <select className={styles.inspectSelect} value={inspect || ''} onChange={(e) => setInspect(e.target.value || null)}>
                  <option value="">{st(lang, 'inspect')}…</option>
                  {g.state.seats.map((id) => (
                    <option key={id} value={id}>
                      {g.players[id] ? `${g.players[id].seat}. ${g.players[id].name}` : id}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {test && inspect && g.players[inspect] && (
            <aside className={styles.inspector}>
              <p className={styles.kicker}>
                {st(lang, 'inspect')} · {g.players[inspect].seat}. {g.players[inspect].name}
              </p>
              <p className={styles.muted}>{st(lang, 'inspectHint')}</p>
              <div className={styles.phoneFrame}>
                <PhoneView
                  view={envelope(g, inspect, now).data}
                  envelope={envelope(g, inspect, now)}
                  lang={lang}
                  send={(msg) => applyInput(inspect, msg)}
                />
              </div>
            </aside>
          )}
        </div>
      )}

      {showRules && (
        <div className={styles.overlay} onClick={() => setShowRules(false)} role="presentation">
          <div className={styles.overlayCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={st(lang, 'howToPlay')}>
            <div className={styles.overlayHead}>
              <h2>
                {mod.emoji} {L(mod.title, lang)} · {st(lang, 'howToPlay')}
              </h2>
              <button type="button" className="button button--sm button--secondary" onClick={() => setShowRules(false)}>
                ✕ {st(lang, 'close')}
              </button>
            </div>
            <RulesSheet mod={mod} lang={lang} />
          </div>
        </div>
      )}

      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

      <div className={styles.reactionLayer} aria-hidden="true">
        {reactions.map((r) => {
          const p = g.players[r.playerId];
          const i = ids.indexOf(r.playerId);
          return (
            <span key={r.uid} className={styles.reactionBubble} style={{left: `${6 + ((i + 0.5) / Math.max(1, ids.length)) * 88}%`}}>
              <span>{r.emoji}</span>
              {p && <Avatar avatar={p.avatar} color={p.color} size="xs" />}
            </span>
          );
        })}
      </div>
    </div>
    </HtmlClassNameProvider>
  );
}
