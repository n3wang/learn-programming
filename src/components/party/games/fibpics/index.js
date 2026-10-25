import React, {useState} from 'react';
import {cue, duration, isBotId, pick, shuffle} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {DECKS, DECOYS} from './prompts';
import {Drawing, DrawPad, botDoodle, cleanStrokes} from './drawing';
import shell from '../../core/party.module.css';
import styles from './fibpics.module.css';

/**
 * Fib Pics (Drawful-like). Everyone draws a secret prompt; for each drawing
 * the others write fake titles, then everyone votes for the real one.
 * 9+ seats play in duos: partners relay-draw one picture and share one fake.
 */

const DRAW_S = 75;
const DUO_TURN_S = 35;
const FAKE_S = 45;
const VOTE_S = 25;
const REVEAL_S = 10;
const SCORES_S = 9;
const MAX_FAKES = 8;
const FAKE_MAX_CHARS = 40;

const tg = makeT({
  en: {
    drawTitle: 'Draw your secret prompt!',
    duoTurn: 'Relay drawing: partner {n} of {total}',
    drawn: '{done} / {total} drawings in',
    fakeTitle: 'What is this? Write a title that fools everyone.',
    voteTitle: 'Which title is real?',
    real: 'REAL',
    fooled: 'fooled {n}',
    by: 'by',
    scores: 'Scores',
    round: 'Round {n} of {total}',
    final: 'Final scores',
    detective: 'Best detective',
    liar: 'Master liar',
    painter: 'Clearest artist',
    yourPrompt: 'Draw this (keep it secret!):',
    partnerFirst: 'Your partner draws first. Get ready to add to it!',
    partnerNext: 'Your partner finishes the picture now.',
    sentDrawing: 'Drawing sent! Look at the big screen.',
    yourDrawing: 'That one is yours! Watch the others squirm.',
    writeFake: 'Write a fake title for the drawing on screen',
    fakePlaceholder: 'A believable title…',
    tooTrue: 'That is the real title! Write a different one.',
    fakeSent: 'Sent: “{text}”',
    teamFake: 'Your partner sent: “{text}”',
    pickReal: 'Tap the title you think is real',
    voted: 'Vote locked in.',
    noVote: 'Your drawing: no vote this time.',
    youGot: '+{n} points this drawing',
    total: 'Score: {n}',
    send: 'Send',
    thin: 'Thin',
    thick: 'Thick',
    undo: 'Undo',
    eraser: 'Eraser',
    inkFull: 'Ink full!',
    sendDrawing: 'Send drawing',
    rounds: 'Rounds',
    deck: 'Prompts',
    deckClass: 'Class lessons',
    deckSilly: 'Silly',
    deckMix: 'Both',
    duo: 'Duo mode (9+ players)',
    duoAuto: 'Auto',
    duoOff: 'Off',
    skip: 'Skip ▶',
  },
  zh: {
    drawTitle: '画出你的秘密题目！',
    duoTurn: '接力画：第 {n} / {total} 位搭档',
    drawn: '已交 {done} / {total} 幅画',
    fakeTitle: '这画的是什么？编一个能骗过所有人的标题。',
    voteTitle: '哪个标题是真的？',
    real: '真的',
    fooled: '骗到 {n} 人',
    by: '作者',
    scores: '得分',
    round: '第 {n} / {total} 轮',
    final: '最终得分',
    detective: '最佳侦探',
    liar: '最强骗子',
    painter: '灵魂画手',
    yourPrompt: '画这个（保密！）：',
    partnerFirst: '你的搭档先画，准备接着画！',
    partnerNext: '现在轮到你的搭档完成这幅画。',
    sentDrawing: '画已提交！看大屏幕。',
    yourDrawing: '这是你的画！看别人怎么猜。',
    writeFake: '给屏幕上的画编一个假标题',
    fakePlaceholder: '一个像真的标题……',
    tooTrue: '这就是真标题！换一个。',
    fakeSent: '已提交：“{text}”',
    teamFake: '你的搭档提交了：“{text}”',
    pickReal: '点你认为是真的标题',
    voted: '已投票。',
    noVote: '这是你的画，这次不用投票。',
    youGot: '这幅画 +{n} 分',
    total: '总分：{n}',
    send: '发送',
    thin: '细笔',
    thick: '粗笔',
    undo: '撤销',
    eraser: '橡皮',
    inkFull: '墨水用完了！',
    sendDrawing: '提交画作',
    rounds: '轮数',
    deck: '题库',
    deckClass: '课堂内容',
    deckSilly: '搞笑',
    deckMix: '混合',
    duo: '双人模式（9 人以上）',
    duoAuto: '自动',
    duoOff: '关闭',
    skip: '跳过 ▶',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to Fib Pics. Draw well, lie better.', zh: '欢迎来到画中有诈。画得要像，骗得要真。'},
  draw_start: {en: 'Pick up your pens! Draw your secret prompt, and don’t let your neighbour peek.', zh: '拿起画笔！把你的秘密题目画出来，别让邻座看见。'},
  duo_swap: {en: 'Switch! Partners, finish the picture.', zh: '换手！搭档接着画。'},
  fake_start: {en: 'What is this masterpiece? Invent a title that fools everyone.', zh: '这画的是什么？编一个能骗过所有人的名字。'},
  vote_start: {en: 'Only one title is real. Vote.', zh: '真的只有一个。投票吧。'},
  reveal_truth: {en: 'Here is the truth!', zh: '真相大白！'},
  nobody_right: {en: 'Nobody got it… maybe some drawing lessons?', zh: '没有一个人猜中……画家，该练练画画了。'},
  everyone_right: {en: 'Everyone got it! What a clear drawing.', zh: '全都猜中了！画得太清楚了。'},
  round_end: {en: 'Let’s look at the scores.', zh: '看看现在的得分。'},
  winner: {en: 'And the winner is… {seat}!', zh: '最后的赢家是……{seat}！'},
};

// ------------------------------------------------------------------ rules

const norm = (text) => String(text || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');

function makeGroups(seats, duo) {
  if (!duo) return seats.map((id) => [id]);
  const groups = [];
  for (let i = 0; i < seats.length; i += 2) groups.push(seats.slice(i, i + 2));
  // An odd seat joins the last pair as a trio.
  if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(groups.pop()[0]);
  return groups;
}

function deckFor(settings) {
  if (settings.deck === 'silly') return DECKS.silly;
  if (settings.deck === 'class') return DECKS.class;
  return [...DECKS.class, ...DECKS.silly];
}

function startRound(s, ctx) {
  const fresh = shuffle(
    s.deck.filter((p) => !s.used.includes(p.en)),
    ctx.rng,
  );
  const pool = fresh.length >= s.groups.length ? fresh : shuffle(s.deck, ctx.rng);
  s.prompts = s.groups.map((_, i) => pool[i % pool.length]);
  s.used.push(...s.prompts.map((p) => p.en));
  s.drawings = s.groups.map(() => []);
  s.drawTurn = 0;
  beginDrawTurn(s, ctx);
  cue(s, 'draw_start');
}

function beginDrawTurn(s, ctx) {
  s.phase = 'draw';
  s.submitted = {};
  s.deadline = ctx.now + duration(ctx, s.turns > 1 ? DUO_TURN_S : DRAW_S);
}

/** Seats drawing this turn: in a duo, one partner at a time. */
function activeDrawers(s) {
  const out = [];
  s.groups.forEach((group) => {
    if (group[s.drawTurn]) out.push(group[s.drawTurn]);
  });
  return out;
}

function endDrawTurn(s, ctx) {
  if (s.drawTurn + 1 < s.turns) {
    s.drawTurn += 1;
    beginDrawTurn(s, ctx);
    cue(s, 'duo_swap');
    return;
  }
  s.order = shuffle(
    s.groups.map((_, i) => i),
    ctx.rng,
  );
  s.idx = 0;
  beginFake(s, ctx);
}

function beginFake(s, ctx) {
  s.phase = 'fake';
  s.fakes = {};
  s.rejected = {};
  s.votes = {};
  s.options = [];
  s.reveal = null;
  s.deadline = ctx.now + duration(ctx, FAKE_S);
  cue(s, 'fake_start');
}

const artistGroup = (s) => s.order[s.idx];
const writerGroups = (s) => s.groups.map((_, i) => i).filter((gi) => gi !== artistGroup(s));
const voters = (s) => s.seats.filter((id) => s.groupOf[id] !== artistGroup(s));

function beginVote(s, ctx) {
  const prompt = s.prompts[artistGroup(s)];
  const options = [{key: 'real', real: true, text: prompt, owners: []}];
  const seen = new Map();
  for (const gi of shuffle(Object.keys(s.fakes).map(Number), ctx.rng)) {
    const f = s.fakes[gi];
    const n = norm(f.text);
    if (seen.has(n)) {
      seen.get(n).owners.push(gi);
      continue;
    }
    if (options.length > MAX_FAKES) continue;
    const opt = {key: `g${gi}`, real: false, text: f.text, owners: [gi]};
    seen.set(n, opt);
    options.push(opt);
  }
  s.options = shuffle(options, ctx.rng);
  s.phase = 'vote';
  s.votes = {};
  s.deadline = ctx.now + duration(ctx, VOTE_S);
  cue(s, 'vote_start');
}

function settle(s, ctx) {
  const artists = s.groups[artistGroup(s)];
  const delta = {};
  const add = (id, n) => {
    delta[id] = (delta[id] || 0) + n;
    s.scores[id] = (s.scores[id] || 0) + n;
  };
  const byKey = Object.fromEntries(s.options.map((o) => [o.key, {...o, voters: []}]));
  let right = 0;
  for (const [id, key] of Object.entries(s.votes)) {
    const opt = byKey[key];
    if (!opt) continue;
    opt.voters.push(id);
    if (opt.real) {
      right += 1;
      add(id, 2);
      s.stats[id].right += 1;
    } else {
      for (const gi of opt.owners) {
        for (const owner of s.groups[gi]) {
          add(owner, 1);
          s.stats[owner].fooled += 1;
        }
      }
    }
  }
  for (const id of artists) {
    add(id, right);
    s.stats[id].painted += right;
  }
  const voterCount = Object.keys(s.votes).length;
  s.reveal = {options: s.options.map((o) => byKey[o.key]), delta, right};
  s.phase = 'reveal';
  s.deadline = ctx.now + duration(ctx, REVEAL_S);
  cue(s, 'reveal_truth');
  if (voterCount > 0 && right === 0) cue(s, 'nobody_right');
  else if (voterCount > 1 && right === voterCount) cue(s, 'everyone_right');
}

function afterReveal(s, ctx) {
  if (s.idx + 1 < s.order.length) {
    s.idx += 1;
    beginFake(s, ctx);
    return;
  }
  s.phase = 'scores';
  s.deadline = ctx.now + duration(ctx, SCORES_S);
  cue(s, 'round_end');
}

function afterScores(s, ctx) {
  if (s.round < s.rounds) {
    s.round += 1;
    startRound(s, ctx);
    return;
  }
  s.phase = 'over';
  s.over = true;
  s.deadline = 0;
  const top = [...s.seats].sort((a, b) => (s.scores[b] || 0) - (s.scores[a] || 0))[0];
  s.winnerSeat = top;
}

/** Move on when everyone who has a job this phase has done it. */
function maybeAdvance(s, ctx) {
  if (s.phase === 'draw' && activeDrawers(s).every((id) => s.submitted[id])) endDrawTurn(s, ctx);
  else if (s.phase === 'fake' && writerGroups(s).every((gi) => s.fakes[gi])) beginVote(s, ctx);
  else if (s.phase === 'vote' && voters(s).every((id) => s.votes[id])) settle(s, ctx);
}

const fibpics = {
  id: 'fibpics',
  emoji: '🎨',
  title: {en: 'Fib Pics', zh: '画中有诈'},
  blurb: {
    en: 'Draw a secret prompt, invent fake titles for the others’ drawings, and spot the real one.',
    zh: '画出秘密题目，给别人的画编假标题，再找出真标题。',
  },
  inspiredBy: 'Drawful',
  players: {min: 3, max: 16},
  minutes: 20,
  coverTint: '#ffe566',
  defaultSettings: {rounds: 1, deck: 'mix', duo: 'auto'},
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    const duo = g.settings.duo !== 'off' && seats.length > 8;
    const groups = makeGroups(seats, duo);
    const groupOf = {};
    groups.forEach((group, gi) => group.forEach((id) => (groupOf[id] = gi)));
    const s = {
      seats,
      duo,
      groups,
      groupOf,
      turns: Math.max(...groups.map((x) => x.length)),
      deck: deckFor(g.settings),
      used: [],
      round: 1,
      rounds: Math.max(1, Math.min(3, Number(g.settings.rounds) || 1)),
      scores: Object.fromEntries(seats.map((id) => [id, 0])),
      stats: Object.fromEntries(seats.map((id) => [id, {right: 0, fooled: 0, painted: 0}])),
      cues: [],
    };
    cue(s, 'welcome');
    startRound(s, ctx);
    return s;
  },

  input(s, g, id, msg, ctx) {
    const gi = s.groupOf[id];
    if (msg.action === 'draw' && s.phase === 'draw') {
      if (!activeDrawers(s).includes(id) || s.submitted[id]) return false;
      s.drawings[gi] = cleanStrokes([...s.drawings[gi], ...cleanStrokes(msg.strokes)]);
      s.submitted[id] = true;
      maybeAdvance(s, ctx);
      return true;
    }
    if (msg.action === 'fake' && s.phase === 'fake') {
      if (gi === artistGroup(s) || s.fakes[gi]) return false;
      const text = Array.from(String(msg.text || '').trim()).slice(0, FAKE_MAX_CHARS).join('');
      if (!text) return false;
      const prompt = s.prompts[artistGroup(s)];
      if (norm(text) === norm(prompt.en) || norm(text) === norm(prompt.zh)) {
        s.rejected[id] = true;
        return true;
      }
      s.fakes[gi] = {text, by: id};
      delete s.rejected[id];
      maybeAdvance(s, ctx);
      return true;
    }
    if (msg.action === 'vote' && s.phase === 'vote') {
      if (gi === artistGroup(s) || s.votes[id]) return false;
      const opt = s.options.find((o) => o.key === msg.key);
      if (!opt || opt.owners.includes(gi)) return false;
      s.votes[id] = opt.key;
      maybeAdvance(s, ctx);
      return true;
    }
    return false;
  },

  hostInput(s, g, msg, ctx) {
    if (msg.action !== 'skip') return false;
    return this.tick(s, g, ctx);
  },

  tick(s, g, ctx) {
    if (s.phase === 'draw') endDrawTurn(s, ctx);
    else if (s.phase === 'fake') {
      if (Object.keys(s.fakes).length) beginVote(s, ctx);
      else afterReveal(s, ctx);
    } else if (s.phase === 'vote') settle(s, ctx);
    else if (s.phase === 'reveal') afterReveal(s, ctx);
    else if (s.phase === 'scores') afterScores(s, ctx);
    else return false;
    if (s.over && s.winnerSeat && g.players[s.winnerSeat]) cue(s, 'winner', {seat: g.players[s.winnerSeat].seat});
    return true;
  },

  view(s, g, id) {
    const gi = s.groupOf[id];
    const base = {phase: s.phase, round: s.round, rounds: s.rounds, score: s.scores[id] || 0, duo: s.duo};
    if (s.phase === 'draw') {
      const group = s.groups[gi];
      const myTurn = group[s.drawTurn] === id;
      const pos = group.indexOf(id);
      if (myTurn && !s.submitted[id]) {
        return {...base, task: `draw-${s.round}-${s.drawTurn}`, prompt: s.prompts[gi], base: s.drawings[gi]};
      }
      return {...base, task: 'wait', note: s.submitted[id] ? 'sentDrawing' : pos > s.drawTurn ? 'partnerFirst' : 'partnerNext', prompt: s.prompts[gi]};
    }
    if (s.phase === 'fake') {
      if (gi === artistGroup(s)) return {...base, task: 'wait', note: 'yourDrawing'};
      const mine = s.fakes[gi];
      if (mine) return {...base, task: 'wait', note: mine.by === id ? 'fakeSent' : 'teamFake', text: mine.text};
      return {...base, task: `fake-${s.round}-${s.idx}`, rejected: Boolean(s.rejected[id])};
    }
    if (s.phase === 'vote') {
      if (gi === artistGroup(s)) return {...base, task: 'wait', note: 'noVote'};
      if (s.votes[id]) return {...base, task: 'wait', note: 'voted'};
      return {
        ...base,
        task: `vote-${s.round}-${s.idx}`,
        options: s.options.filter((o) => !o.owners.includes(gi)).map((o) => ({key: o.key, text: o.text})),
      };
    }
    if (s.phase === 'reveal') return {...base, task: 'reveal', delta: (s.reveal && s.reveal.delta[id]) || 0};
    return {...base, task: s.phase};
  },

  bot(s, g, id, ctx) {
    const gi = s.groupOf[id];
    if (s.phase === 'draw' && activeDrawers(s).includes(id) && !s.submitted[id]) return {action: 'draw', strokes: botDoodle(ctx.rng)};
    if (s.phase === 'fake' && gi !== artistGroup(s) && !s.fakes[gi]) return {action: 'fake', text: L(pick(DECOYS, ctx.rng), ctx.lang)};
    if (s.phase === 'vote' && gi !== artistGroup(s) && !s.votes[id]) {
      const allowed = s.options.filter((o) => !o.owners.includes(gi));
      const real = allowed.find((o) => o.real);
      const choice = real && ctx.rng() < 0.4 ? real : pick(allowed, ctx.rng);
      return choice ? {action: 'vote', key: choice.key} : null;
    }
    return null;
  },

  SettingsView({settings, set, lang, playerCount}) {
    return (
      <div className={shell.buttonRow} style={{flexDirection: 'column', alignItems: 'flex-start'}}>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'rounds')}</span>
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" className="button button--sm button--secondary" aria-checked={settings.rounds === n} role="radio" onClick={() => set({rounds: n})}>
              {n}
            </button>
          ))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'deck')}</span>
          {['class', 'silly', 'mix'].map((d) => (
            <button key={d} type="button" className="button button--sm button--secondary" aria-checked={settings.deck === d} role="radio" onClick={() => set({deck: d})}>
              {tg(lang, d === 'class' ? 'deckClass' : d === 'silly' ? 'deckSilly' : 'deckMix')}
            </button>
          ))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'duo')}</span>
          {['auto', 'off'].map((d) => (
            <button key={d} type="button" className="button button--sm button--secondary" aria-checked={settings.duo === d} role="radio" onClick={() => set({duo: d})}>
              {tg(lang, d === 'auto' ? 'duoAuto' : 'duoOff')}
            </button>
          ))}
          {playerCount > 8 && settings.duo !== 'off' && <span className={shell.chip}>👥 ×{Math.floor(playerCount / 2)}</span>}
        </div>
      </div>
    );
  },

  HostView({g, state: s, lang, hostAct}) {
    const ranked = [...s.seats].sort((a, b) => (s.scores[b] || 0) - (s.scores[a] || 0));
    const who = (id) => g.players[id];
    const artists = s.order && s.phase !== 'draw' && s.phase !== 'scores' && s.phase !== 'over' ? s.groups[artistGroup(s)] : [];

    if (s.phase === 'draw') {
      const active = activeDrawers(s);
      return (
        <SeatRing
          g={g}
          ids={s.seats}
          dim={(id) => !active.includes(id) && !s.submitted[id]}
          highlight={(id) => active.includes(id) && !s.submitted[id]}
          badge={(id) => (s.submitted[id] ? '✅' : active.includes(id) ? '✏️' : '')}>
          <p className={shell.kicker}>{tg(lang, 'round', {n: s.round, total: s.rounds})}</p>
          <div className={shell.bigText}>{tg(lang, 'drawTitle')}</div>
          {s.turns > 1 && <p className={shell.chip}>{tg(lang, 'duoTurn', {n: s.drawTurn + 1, total: s.turns})}</p>}
          <p>{tg(lang, 'drawn', {done: Object.keys(s.submitted).length, total: active.length})}</p>
          <button type="button" className="button button--sm button--secondary" onClick={() => hostAct({action: 'skip'})}>
            {tg(lang, 'skip')}
          </button>
        </SeatRing>
      );
    }

    if (s.phase === 'fake' || s.phase === 'vote' || s.phase === 'reveal') {
      const gi = artistGroup(s);
      const opts = s.phase === 'reveal' ? s.reveal.options : s.options;
      const jobs = s.phase === 'fake' ? writerGroups(s).map((x) => s.groups[x][0]) : voters(s);
      const doneIds = s.phase === 'fake' ? writerGroups(s).filter((x) => s.fakes[x]).map((x) => s.groups[x][0]) : Object.keys(s.votes);
      return (
        <div className={styles.present}>
          <div className={styles.frame}>
            <Drawing strokes={s.drawings[gi]} replay={s.phase === 'fake'} />
            {s.phase === 'reveal' && (
              <p className={styles.artists}>
                {artists.map((id) => (
                  <span key={id} className={shell.chip}>
                    <Avatar avatar={who(id)?.avatar} color={who(id)?.color} size="xs" /> {who(id)?.name}
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className={styles.side}>
            <div className={shell.bigText}>{tg(lang, s.phase === 'fake' ? 'fakeTitle' : 'voteTitle')}</div>
            {s.phase === 'fake' && (
              <div className={shell.chipRow} style={{justifyContent: 'flex-start'}}>
                {jobs.map((id) => (
                  <span key={id} className={shell.chip} style={{opacity: doneIds.includes(id) ? 1 : 0.35}}>
                    <Avatar avatar={who(id)?.avatar} color={who(id)?.color} size="xs" /> {doneIds.includes(id) ? '✓' : '…'}
                  </span>
                ))}
              </div>
            )}
            {s.phase !== 'fake' && (
              <ol className={styles.options} data-many={opts.length > 5}>
                {opts.map((o) => (
                  <li key={o.key} className={styles.option} data-real={s.phase === 'reveal' && o.real}>
                    <span className={styles.optionText}>{L(o.text, lang)}</span>
                    {s.phase === 'reveal' && (
                      <span className={styles.optionMeta}>
                        {o.real ? (
                          <b className={styles.realTag}>{tg(lang, 'real')}</b>
                        ) : (
                          <span className={shell.chip}>
                            {o.owners.flatMap((x) => s.groups[x]).map((id) => (
                              <Avatar key={id} avatar={who(id)?.avatar} color={who(id)?.color} size="xs" />
                            ))}
                            {o.voters.length > 0 && ` ${tg(lang, 'fooled', {n: o.voters.length})}`}
                          </span>
                        )}
                        <span className={styles.voters}>
                          {o.voters.map((id) => (
                            <Avatar key={id} avatar={who(id)?.avatar} color={who(id)?.color} size="xs" />
                          ))}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {s.phase === 'vote' && (
              <p className={shell.muted}>
                {doneIds.length} / {jobs.length}
              </p>
            )}
            <button type="button" className="button button--sm button--secondary" onClick={() => hostAct({action: 'skip'})}>
              {tg(lang, 'skip')}
            </button>
          </div>
        </div>
      );
    }

    const top = (key) => [...s.seats].sort((a, b) => s.stats[b][key] - s.stats[a][key])[0];
    return (
      <div className={styles.scores}>
        <div className={shell.bigText}>{tg(lang, s.phase === 'over' ? 'final' : 'scores')}</div>
        {s.phase === 'over' && (
          <div className={styles.awards}>
            {[
              ['detective', 'right', '🕵️'],
              ['liar', 'fooled', '🤥'],
              ['painter', 'painted', '🎨'],
            ].map(([label, key, emoji]) => {
              const id = top(key);
              return (
                <div key={label} className={shell.card}>
                  <div style={{fontSize: '2rem'}}>{emoji}</div>
                  <b>{tg(lang, label)}</b>
                  <div>
                    <Avatar avatar={who(id)?.avatar} color={who(id)?.color} size="sm" /> {who(id)?.name} · {s.stats[id][key]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <table className={shell.scoreTable}>
          <tbody>
            {ranked.map((id, i) => (
              <tr key={id}>
                <td>{i + 1}</td>
                <td>
                  <Avatar avatar={who(id)?.avatar} color={who(id)?.color} size="xs" /> {who(id)?.name}
                </td>
                <td>
                  <b>{s.scores[id] || 0}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  PhoneView({view, lang, send}) {
    return <FibPhone key={view.task} view={view} lang={lang} send={send} />;
  },
};

function FibPhone({view, lang, send}) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const labels = {
    thin: tg(lang, 'thin'),
    thick: tg(lang, 'thick'),
    undo: tg(lang, 'undo'),
    eraser: tg(lang, 'eraser'),
    inkFull: tg(lang, 'inkFull'),
    send: tg(lang, 'sendDrawing'),
  };
  const head = (
    <p className={shell.kicker}>
      {tg(lang, 'round', {n: view.round, total: view.rounds})} · {tg(lang, 'total', {n: view.score})}
    </p>
  );

  if (view.task.startsWith('draw')) {
    return (
      <>
        {head}
        <div className={shell.card}>
          {tg(lang, 'yourPrompt')} <b className={styles.prompt}>{L(view.prompt, lang)}</b>
        </div>
        <DrawPad
          base={view.base}
          labels={labels}
          disabled={sent}
          onSend={(strokes) => {
            setSent(true);
            send({action: 'draw', strokes});
          }}
        />
      </>
    );
  }
  if (view.task.startsWith('fake')) {
    return (
      <>
        {head}
        <form
          className={shell.card}
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            send({action: 'fake', text});
          }}>
          <p>
            <b>{tg(lang, 'writeFake')}</b>
          </p>
          {view.rejected && <p className={shell.error}>{tg(lang, 'tooTrue')}</p>}
          <input className={styles.fakeInput} value={text} maxLength={FAKE_MAX_CHARS} placeholder={tg(lang, 'fakePlaceholder')} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="button button--block" style={{marginTop: '0.6rem'}} disabled={!text.trim()}>
            {tg(lang, 'send')}
          </button>
        </form>
      </>
    );
  }
  if (view.task.startsWith('vote')) {
    return (
      <>
        {head}
        <p>
          <b>{tg(lang, 'pickReal')}</b>
        </p>
        <div className={styles.voteList}>
          {view.options.map((o) => (
            <button key={o.key} type="button" className="button button--block" onClick={() => send({action: 'vote', key: o.key})}>
              {L(o.text, lang)}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (view.task === 'reveal') {
    return (
      <>
        {head}
        <div className={`${shell.card} ${shell.bigText}`} style={{textAlign: 'center'}}>
          {tg(lang, 'youGot', {n: view.delta})}
        </div>
      </>
    );
  }
  if (view.task === 'wait') {
    return (
      <>
        {head}
        {view.prompt && view.note !== 'sentDrawing' && (
          <div className={shell.card}>
            {tg(lang, 'yourPrompt')} <b className={styles.prompt}>{L(view.prompt, lang)}</b>
          </div>
        )}
        <p className={shell.waiting}>{tg(lang, view.note, {text: view.text})}</p>
      </>
    );
  }
  return (
    <>
      {head}
      <p className={shell.waiting}>👀</p>
    </>
  );
}

export default fibpics;
