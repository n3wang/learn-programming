import {useEffect, useRef, useState} from 'react';
import {fillVars} from './partyCore';
import {L} from './strings';

/**
 * Big-screen voice. A cue plays `static/audio/party/<game>/<id>.<lang>.mp3`
 * when that file exists; until then the browser's speech engine reads the
 * line (a placeholder voice), and the subtitle always shows. Phones never
 * play voice, so no phone gives away a secret.
 */
const LANG_TAG = {zh: 'zh-CN', en: 'en-US'};

function speak(text, lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const u = new window.SpeechSynthesisUtterance(text);
  u.lang = LANG_TAG[lang] || 'en-US';
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

export function useVoice({gameId, lines, state, lang, enabled}) {
  const [subtitle, setSubtitle] = useState(null);
  const playedRef = useRef(null);
  const queueRef = useRef([]);
  const busyRef = useRef(false);
  const timerRef = useRef(null);

  function playNext() {
    const item = queueRef.current.shift();
    if (!item) {
      busyRef.current = false;
      return;
    }
    busyRef.current = true;
    setSubtitle(item.text);
    window.clearTimeout(timerRef.current);
    // Long enough to read; the next line waits for this one.
    const readMs = 1400 + item.text.length * (lang === 'zh' ? 180 : 60);
    timerRef.current = window.setTimeout(() => {
      setSubtitle(null);
      playNext();
    }, readMs);
    if (!enabled) return;
    const audio = new Audio(`/audio/party/${gameId}/${item.id}.${lang}.mp3`);
    audio.onerror = () => speak(item.text, lang);
    audio.play().catch(() => speak(item.text, lang));
  }

  const cues = (state && state.cues) || [];
  const lastSeq = cues.length ? cues[cues.length - 1].seq : 0;
  useEffect(() => {
    // The first render after a reload marks old cues as played.
    if (playedRef.current === null) {
      playedRef.current = lastSeq;
      return;
    }
    for (const c of cues) {
      if (c.seq <= playedRef.current) continue;
      playedRef.current = c.seq;
      const line = lines && lines[c.id];
      if (!line) continue;
      queueRef.current.push({id: c.id, text: fillVars(L(line, lang), c.vars || {}, lang)});
    }
    // A fast game (or test mode) must not fall behind: keep only the newest lines.
    if (queueRef.current.length > 2) queueRef.current = queueRef.current.slice(-2);
    if (!busyRef.current) playNext();
  }, [lastSeq]);

  // A fresh game starts its cue count again.
  useEffect(() => {
    if (lastSeq === 0) playedRef.current = 0;
  }, [lastSeq]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  return subtitle;
}
