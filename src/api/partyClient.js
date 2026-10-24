/**
 * WebSocket client for the Bets & Wagers party relay (springbackend `/ws/party`).
 *
 * Local first: a page served from this machine or the local network tries the
 * Spring Boot on that machine (port 8080), then the configured base, then the
 * deployed backend — so local testing needs no `?api=`. The socket
 * reconnects on its own; `onOpen` fires after every (re)connect so the page can
 * re-send `join` / `resume_host` and get its seat back.
 */

import {apiBaseCandidates, getApiBaseUrl, normalizeApiBase, rememberApiBaseUrl} from '@site/src/api/apiBase';

const PING_MS = 25000; // the server drops sockets idle for 120 s
const RETRY_MS = [1000, 2000, 4000, 8000];

export function partySocketUrl(base) {
  return `${base.replace(/^http/i, 'ws').replace(/\/$/, '')}/ws/party`;
}

/**
 * `?api=http://localhost:8080` pins one backend, like the fight game's
 * override — handy when the dev server baked the deployed base. The host
 * passes it on in the join link so phones reach the same relay.
 */
export function apiOverride() {
  if (typeof window === 'undefined') return '';
  return normalizeApiBase(new URLSearchParams(window.location.search).get('api') || '');
}

/** This machine or the school/home network: where a dev site would be served from. */
const LOCAL_HOST = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[\w-]+\.local)$/i;
const LOCAL_BACKEND_PORT = 8080;

/**
 * When the page itself is served locally (`npm start` on a laptop, or a phone
 * opening the laptop's network address), try the Spring Boot on that same
 * machine first. Phones can't use "localhost" (that is the phone), so the
 * page's own hostname is used. The deployed backend stays as the fallback.
 */
export function localBackendBase() {
  if (typeof window === 'undefined') return '';
  const {hostname} = window.location;
  if (!LOCAL_HOST.test(hostname)) return '';
  const host = hostname.includes(':') && !hostname.startsWith('[') ? `[${hostname}]` : hostname;
  return `http://${host}:${LOCAL_BACKEND_PORT}`;
}

function socketCandidates() {
  const override = apiOverride();
  if (override) return [override];
  const configured = apiBaseCandidates(getApiBaseUrl());
  const local = localBackendBase();
  return local ? [local, ...configured.filter((base) => base !== local)] : configured;
}

/**
 * @param {{onMessage: (msg: object) => void, onOpen?: () => void, onStatus?: (status: 'connecting'|'open'|'offline', base?: string) => void}} handlers
 * @returns {{send: (msg: object) => boolean, close: () => void}}
 */
export function createPartySocket({onMessage, onOpen, onStatus}) {
  let socket = null;
  let closed = false;
  let failures = 0;
  let pingTimer = null;
  let retryTimer = null;

  const setStatus = (status, base) => onStatus && onStatus(status, base);

  function stopPing() {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = null;
  }

  function scheduleRetry() {
    if (closed) return;
    const delay = RETRY_MS[Math.min(failures, RETRY_MS.length - 1)];
    failures += 1;
    retryTimer = setTimeout(connect, delay);
  }

  function tryCandidate(candidates, index) {
    if (closed) return;
    if (index >= candidates.length) {
      setStatus('offline');
      scheduleRetry();
      return;
    }
    let opened = false;
    let ws;
    try {
      ws = new WebSocket(partySocketUrl(candidates[index]));
    } catch {
      tryCandidate(candidates, index + 1);
      return;
    }
    socket = ws;

    ws.onopen = () => {
      opened = true;
      failures = 0;
      // Same rule as classroomClient: a fallback that answered becomes the
      // remembered base — but not when local-first routing is in play.
      if (index > 0 && !apiOverride() && !localBackendBase()) rememberApiBaseUrl(candidates[index]);
      setStatus('open', candidates[index]);
      stopPing();
      pingTimer = setInterval(() => send({type: 'ping', t: Date.now()}), PING_MS);
      if (onOpen) onOpen();
    };
    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (msg && msg.type !== 'pong') onMessage(msg);
    };
    ws.onclose = () => {
      if (socket === ws) socket = null;
      stopPing();
      if (closed) return;
      if (opened) {
        // Lost a working connection: start again from the preferred base.
        setStatus('connecting');
        scheduleRetry();
      } else {
        tryCandidate(candidates, index + 1);
      }
    };
  }

  function connect() {
    if (closed) return;
    setStatus('connecting');
    tryCandidate(socketCandidates(), 0);
  }

  function send(msg) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(msg));
    return true;
  }

  /**
   * Phones kill sockets when the screen locks. When the page comes back (or
   * the network does), skip the backoff and reconnect at once; if the socket
   * still looks open, a ping flushes out a dead one.
   */
  function wake() {
    if (closed || document.visibilityState === 'hidden') return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      send({type: 'ping', t: Date.now()});
      return;
    }
    if (socket && socket.readyState === WebSocket.CONNECTING) return;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
    failures = 0;
    connect();
  }

  function close() {
    closed = true;
    stopPing();
    if (retryTimer) clearTimeout(retryTimer);
    document.removeEventListener('visibilitychange', wake);
    window.removeEventListener('online', wake);
    window.removeEventListener('pageshow', wake);
    if (socket) socket.close();
    socket = null;
  }

  document.addEventListener('visibilitychange', wake);
  window.addEventListener('online', wake);
  window.addEventListener('pageshow', wake);
  connect();
  return {send, close};
}
