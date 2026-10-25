import React, {useState} from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {
  FIRST_NIGHT,
  OTHER_NIGHTS,
  ROLES,
  alive,
  callTargets,
  canVoteYes,
  castVote,
  evilInfo,
  hostEndDay,
  isEvilRole,
  markReady,
  nightChoice,
  nominate,
  setupClocktower,
  shownRole,
  slay,
  timeout,
} from './rules';
import shell from '../../core/party.module.css';
import styles from './clocktower.module.css';

const TEAM_TINT = {townsfolk: '#4aa8ff', outsider: '#7fd1ff', minion: '#e74c3c', demon: '#8e0e1f'};

const tg = makeT({
  en: {
    holdRole: 'Hold to see your role',
    ready: 'I’ve seen it',
    yourDemon: 'Your Demon',
    yourMinions: 'Your Minions',
    bluffs: 'Safe roles to claim (not in play)',
    night: 'Night {n}',
    eyesClosed: 'Eyes closed… 🌙',
    tapMoon: 'Tap the moon while you wait',
    wake: '{role}, wake…',
    youWake: 'You wake up!',
    choose: 'Choose {n} player(s)',
    confirm: 'Confirm',
    ok: 'OK, back to sleep',
    dawn: 'Dawn',
    diedTonight: 'Died tonight:',
    peaceful: 'Nobody died.',
    day: 'Day {n} · talk!',
    nominate: 'Nominate a player',
    nominated: 'You already nominated today.',
    slay: '🏹 Slayer: shoot a player (once)',
    onBlock: 'On the block: {name} ({n} votes)',
    tieBlock: 'Tied: nobody is on the block.',
    needVotes: 'Needs {n} votes to execute',
    defense: '{name} is nominated by {by}. Speak in your defense!',
    voteQ: 'Execute {name}?',
    yes: '✋ Yes',
    no: 'No',
    ghostSpent: 'You used your ghost vote.',
    ghostHas: '👻 You have one ghost vote left.',
    voted: 'Vote cast.',
    executed: '{name} is executed.',
    noExecution: 'Nobody is executed today.',
    endDay: 'End the day ▶',
    goodWin: 'Good wins!',
    evilWin: 'Evil wins!',
    why_demonDead: 'The Demon is dead.',
    why_twoLeft: 'Only two players are left alive.',
    why_saint: 'The Saint was executed.',
    why_mayor: 'The Mayor survived the last day.',
    roles: 'Roles',
    dead: 'You are dead. You may still talk, and vote once more.',
    yourInfo: 'What you learned',
    pairInfo: 'One of {a} and {b} is the {role}.',
    noneInfo: 'There are no Outsiders in play.',
    numberInfo: '{n}',
    yesnoInfo: '{a} / {b}: {answer}',
    yesWord: 'YES, a Demon is there',
    noWord: 'no',
    roleInfo: '{name} is the {role}.',
    grimoire: 'The Grimoire (Spy)',
    dayMinutes: 'Day length',
    min: '{n} min',
    waiting: 'Waiting…',
  },
  zh: {
    holdRole: '按住查看你的角色',
    ready: '我看好了',
    yourDemon: '你的恶魔',
    yourMinions: '你的爪牙',
    bluffs: '可以伪装的角色（不在场）',
    night: '第 {n} 夜',
    eyesClosed: '请闭眼……🌙',
    tapMoon: '等待时请点点月亮',
    wake: '{role}，醒来……',
    youWake: '你醒了！',
    choose: '选择 {n} 名玩家',
    confirm: '确认',
    ok: '好的，继续睡',
    dawn: '天亮了',
    diedTonight: '昨夜死亡：',
    peaceful: '昨夜平安无事。',
    day: '第 {n} 天 · 讨论吧！',
    nominate: '提名一名玩家',
    nominated: '你今天已经提名过了。',
    slay: '🏹 猎手：射击一名玩家（每局一次）',
    onBlock: '即将处决：{name}（{n} 票）',
    tieBlock: '平票：没有人会被处决。',
    needVotes: '需要 {n} 票才能处决',
    defense: '{by} 提名了 {name}。请为自己辩护！',
    voteQ: '处决 {name} 吗？',
    yes: '✋ 赞成',
    no: '反对',
    ghostSpent: '你的幽灵票已经用掉了。',
    ghostHas: '👻 你还有一张幽灵票。',
    voted: '已投票。',
    executed: '{name} 被处决了。',
    noExecution: '今天没有人被处决。',
    endDay: '结束白天 ▶',
    goodWin: '善良阵营获胜！',
    evilWin: '邪恶阵营获胜！',
    why_demonDead: '恶魔死了。',
    why_twoLeft: '只剩下两名存活玩家。',
    why_saint: '圣徒被处决了。',
    why_mayor: '镇长撑过了最后一天。',
    roles: '角色',
    dead: '你已经死亡。你仍然可以发言，还能再投一票。',
    yourInfo: '你得知的信息',
    pairInfo: '{a} 和 {b} 之中有一个是 {role}。',
    noneInfo: '场上没有外来者。',
    numberInfo: '{n}',
    yesnoInfo: '{a} / {b}：{answer}',
    yesWord: '是，其中有恶魔',
    noWord: '否',
    roleInfo: '{name} 是 {role}。',
    grimoire: '魔典（间谍）',
    dayMinutes: '白天时长',
    min: '{n} 分钟',
    waiting: '等待中……',
  },
});

const NIGHT_ROLES = [...new Set([...FIRST_NIGHT, ...OTHER_NIGHTS])];
const VOICE = {
  welcome: {en: 'Welcome to Ravenswood Bluff. After dark… beware the Demon.', zh: '欢迎来到鸦木布拉夫小镇。天黑以后……小心恶魔。'},
  dusk: {en: 'Night falls. Everyone, close your eyes…', zh: '夜幕降临，所有人闭上眼睛……'},
  died: {en: 'Last night… {seat} died.', zh: '昨夜……{seat}死了。'},
  peaceful: {en: 'Last night… all was quiet.', zh: '昨夜……平安无事。'},
  day: {en: 'Dawn. Talk now. When the bell rings again, the day ends.', zh: '天亮了。讨论吧，钟声再响时，白天结束。'},
  nominate: {en: '{seat} is nominated. Speak in your defense.', zh: '{seat}被提名了。请为自己辩护。'},
  vote: {en: 'Raise your hands… now.', zh: '举起你的手……现在。'},
  executed: {en: '{seat} is executed.', zh: '{seat}被处决了。'},
  no_execution: {en: 'Today, no one is executed.', zh: '今天，没有人被处决。'},
  slayer_miss: {en: 'Nothing happens.', zh: '什么也没有发生。'},
  demon_dies: {en: 'A scream… then silence.', zh: '一声尖叫……然后是寂静。'},
  win_good: {en: 'The Demon is destroyed, and the bell rings again.', zh: '恶魔被消灭了，钟声重新响起。'},
  win_evil: {en: 'The clock tower… never strikes again.', zh: '钟楼……再也不报时了。'},
  ...Object.fromEntries(NIGHT_ROLES.map((k) => [`wake_${k}`, {en: `${ROLES[k].en}, wake.`, zh: `${ROLES[k].zh}，醒来。`}])),
};

function Token({role, lang, size = 64}) {
  const r = ROLES[role];
  return <Sprite path={`clocktower/role-${role}.webp`} emoji={r.emoji} label={L(r, lang)} tint={TEAM_TINT[r.team]} size={`${size}px`} shape="token" />;
}

// ------------------------------------------------------------------ bots

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  if (s.phase === 'roles' && !s.ready[id]) return {action: 'ready'};
  if (s.phase === 'night' && s.call && s.call.actor === id && !s.call.done) {
    if (!s.call.choose) return {action: 'night'};
    let legal = callTargets(s);
    if (s.call.role === 'imp') {
      const good = legal.filter((p) => !isEvilRole(s.role[p]));
      if (good.length) legal = good;
    }
    return {action: 'night', targets: [...legal].sort(() => rng() - 0.5).slice(0, s.call.choose)};
  }
  if (s.phase === 'day' && !s.dead[id]) {
    if (shownRole(s, id) === 'slayer' && !s.used[`slayer:${id}`] && rng() < 0.02) {
      return {action: 'slay', target: pick(alive(s).filter((p) => p !== id), rng)};
    }
    // Bots leave room for humans: at most 3 nominations a day between them.
    if (!s.nominators[id] && Object.keys(s.nominated).length < 3 && rng() < 0.01) {
      const options = alive(s).filter((p) => p !== id && !s.nominated[p]);
      if (options.length) return {action: 'nominate', target: pick(options, rng)};
    }
  }
  if (s.phase === 'vote' && s.vote.votes[id] == null) {
    const evil = isEvilRole(s.role[id]);
    const nomineeEvil = isEvilRole(s.role[s.vote.nominee]);
    const yes = evil ? !nomineeEvil && rng() < 0.6 : rng() < 0.4;
    return {action: 'vote', yes: yes && (!s.dead[id] || rng() < 0.3)};
  }
  return null;
}

// ------------------------------------------------------------------ module

const clocktower = {
  id: 'clocktower',
  emoji: '🕰️',
  title: {en: 'Blood on the Clocktower', zh: '血染钟楼'},
  blurb: {
    en: 'Trouble Brewing: a Demon hides among the townsfolk. The screen is the Storyteller; nights on your phone, days arguing in person.',
    zh: '暗流涌动：恶魔藏在镇民之中。大屏幕当说书人，夜晚看手机，白天当面辩论。',
  },
  inspiredBy: 'Blood on the Clocktower (Trouble Brewing)',
  players: {min: 5, max: 16},
  minutes: 45,
  coverTint: '#8e0e1f',
  themeClass: shell.themeClock,
  defaultSettings: {dayMinutes: 4},
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupClocktower(seats, g.settings, ctx);
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'ready':
        return markReady(s, ctx, id);
      case 'night':
        return nightChoice(s, ctx, id, msg.targets);
      case 'nominate':
        return nominate(s, ctx, id, msg.target);
      case 'vote':
        return castVote(s, ctx, id, Boolean(msg.yes));
      case 'slay':
        return slay(s, ctx, id, msg.target);
      default:
        return false;
    }
  },

  hostInput(s, g, msg, ctx) {
    if (msg.action === 'endDay') return hostEndDay(s, ctx);
    return false;
  },

  tick(s, g, ctx) {
    return Boolean(timeout(s, ctx));
  },

  view(s, g, id) {
    const player = (p) => ({id: p, name: g.players[p] ? g.players[p].name : '?', avatar: g.players[p] && g.players[p].avatar, color: g.players[p] && g.players[p].color, dead: Boolean(s.dead[p])});
    const role = shownRole(s, id);
    const evil = evilInfo(s, id);
    const c = s.call;
    let task = s.phase;
    if (s.phase === 'roles' && s.ready[id]) task = 'wait';
    if (s.phase === 'night') task = c && c.actor === id && !c.done ? (c.choose ? 'choose' : 'info') : 'sleep';
    if (s.phase === 'vote' && s.vote.votes[id] != null) task = 'voted';
    const v = {
      task: `${task}-${s.night}-${s.day}-${c ? c.role : ''}`,
      kind: task,
      role,
      night: s.night,
      day: s.day,
      dead: Boolean(s.dead[id]),
      ghost: s.dead[id] ? !s.ghostVote[id] : null,
      evil: evil && {demon: evil.demon && player(evil.demon), minions: evil.minions.map(player), bluffs: evil.bluffs || null},
      info: (s.info[id] || []).map((x) => ({...x, players: x.players && x.players.map(player), player: x.player && player(x.player)})),
      players: s.seats.map(player),
      me: id,
      winner: s.winner,
      winWhy: s.winWhy,
    };
    if (task === 'choose') {
      v.choose = c.choose;
      v.targets = callTargets(s).map(player);
    }
    if (task === 'info') v.callInfo = c.info;
    if (s.role[id] === 'spy' && !s.dead[id]) v.grimoire = s.seats.map((p) => ({...player(p), role: s.role[p]}));
    if (s.phase === 'day') {
      v.canNominate = !s.dead[id] && !s.nominators[id];
      v.nominees = alive(s)
        .filter((p) => !s.nominated[p])
        .map(player);
    }
    if (s.phase === 'day' || s.phase === 'defense') v.canSlay = role === 'slayer' && !s.used[`slayer:${id}`] && !s.dead[id];
    if (s.vote) {
      v.nominee = player(s.vote.nominee);
      v.nominator = player(s.vote.nominator);
      v.canYes = canVoteYes(s, id);
    }
    if (s.over) v.roles = s.seats.map((p) => ({...player(p), role: s.role[p]}));
    return v;
  },

  bot: botMove,

  SettingsView({settings, set, lang}) {
    return (
      <div className={shell.buttonRow}>
        <span>{tg(lang, 'dayMinutes')}</span>
        {[2, 4, 6].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={settings.dayMinutes === n} className="button button--sm button--secondary" onClick={() => set({dayMinutes: n})}>
            {tg(lang, 'min', {n})}
          </button>
        ))}
      </div>
    );
  },

  HostView({g, state: s, lang, hostAct}) {
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const need = Math.ceil(alive(s).length / 2);
    return (
      <div className={styles.town} data-night={s.phase === 'night' || s.phase === 'roles'}>
        <SeatRing
          g={g}
          ids={s.seats}
          dim={(id) => s.dead[id]}
          highlight={(id) => (s.vote && (id === s.vote.nominee)) || (s.block && s.block.id === id)}
          badge={(id) => (
            <>
              {s.dead[id] && <span title="dead">☠️{!s.ghostVote[id] && '👻'}</span>}
              {s.phase === 'vote' && s.vote.votes[id] != null && <span>✓</span>}
              {s.phase === 'day' && s.lastVote && s.lastVote.votes[id] === 'yes' && <span>✋</span>}
              {s.over && <span className={styles.roleTag} data-evil={isEvilRole(s.role[id])}>{L(ROLES[s.role[id]], lang)}</span>}
            </>
          )}>
          <div className={styles.clock} aria-hidden="true">
            🕰️
          </div>
          {s.over && (
            <div className={shell.bigText}>
              🏆 {tg(lang, s.winner === 'good' ? 'goodWin' : 'evilWin')}
              <p className={shell.muted}>{tg(lang, `why_${s.winWhy}`)}</p>
            </div>
          )}
          {s.phase === 'roles' && <div className={shell.bigText}>{tg(lang, 'holdRole')}</div>}
          {s.phase === 'night' && s.call && (
            <>
              <p className={shell.kicker}>{tg(lang, 'night', {n: s.night})}</p>
              <Token role={s.call.role} lang={lang} size={90} />
              <div className={shell.bigText}>{tg(lang, 'wake', {role: L(ROLES[s.call.role], lang)})}</div>
            </>
          )}
          {s.phase === 'dawn' && (
            <>
              <div className={shell.bigText}>☀️ {tg(lang, 'dawn')}</div>
              <p>{s.deaths.length ? `${tg(lang, 'diedTonight')} ${s.deaths.map(name).join(', ')}` : tg(lang, 'peaceful')}</p>
            </>
          )}
          {(s.phase === 'day' || s.phase === 'defense' || s.phase === 'vote') && (
            <>
              <p className={shell.kicker}>{tg(lang, 'day', {n: s.day})}</p>
              {s.vote && (
                <div className={shell.bigText}>
                  {s.phase === 'defense' ? tg(lang, 'defense', {name: name(s.vote.nominee), by: name(s.vote.nominator)}) : tg(lang, 'voteQ', {name: name(s.vote.nominee)})}
                </div>
              )}
              <p>{tg(lang, 'needVotes', {n: need})}</p>
              {s.block && <p className={styles.block}>{s.block.id ? tg(lang, 'onBlock', {name: name(s.block.id), n: s.block.yes}) : tg(lang, 'tieBlock')}</p>}
              {s.phase === 'day' && (
                <button type="button" className="button button--sm button--secondary" onClick={() => hostAct({action: 'endDay'})}>
                  {tg(lang, 'endDay')}
                </button>
              )}
            </>
          )}
          {s.phase === 'execution' && (
            <div className={shell.bigText}>{s.executedToday ? tg(lang, 'executed', {name: name(s.executedToday)}) : tg(lang, 'noExecution')}</div>
          )}
        </SeatRing>
      </div>
    );
  },

  PhoneView({view, lang, send}) {
    return <ClockPhone key={view.task} view={view} lang={lang} send={send} />;
  },
};

function InfoLine({x, lang}) {
  const nm = (p) => (p ? p.name : '?');
  if (x.kind === 'pair') return <>{tg(lang, 'pairInfo', {a: nm(x.players[0]), b: nm(x.players[1]), role: L(ROLES[x.role], lang)})}</>;
  if (x.kind === 'none') return <>{tg(lang, 'noneInfo')}</>;
  if (x.kind === 'number') return <b className={styles.number}>{x.n}</b>;
  if (x.kind === 'yesno') return <>{tg(lang, 'yesnoInfo', {a: nm(x.players[0]), b: nm(x.players[1]), answer: tg(lang, x.yes ? 'yesWord' : 'noWord')})}</>;
  if (x.kind === 'role') return <>{tg(lang, 'roleInfo', {name: nm(x.player), role: L(ROLES[x.role], lang)})}</>;
  return null;
}

function ClockPhone({view, lang, send}) {
  const [show, setShow] = useState(false);
  const [picks, setPicks] = useState([]);
  const [moon, setMoon] = useState(0);
  const r = ROLES[view.role];

  const roleBox = (
    <div className={`${shell.card} ${styles.roleBox}`} onPointerDown={() => setShow(true)} onPointerUp={() => setShow(false)} onPointerLeave={() => setShow(false)} onContextMenu={(e) => e.preventDefault()}>
      {show ? (
        <>
          <Token role={view.role} lang={lang} size={96} />
          <p className={styles.ability}>{L(r.ab, lang)}</p>
          {view.evil && (
            <div>
              {view.evil.demon && (
                <p>
                  {tg(lang, 'yourDemon')}: <b>{view.evil.demon.name}</b>
                </p>
              )}
              {view.evil.minions.length > 0 && (
                <p>
                  {tg(lang, 'yourMinions')}: <b>{view.evil.minions.map((m) => m.name).join(', ')}</b>
                </p>
              )}
              {view.evil.bluffs && (
                <p>
                  {tg(lang, 'bluffs')}: <b>{view.evil.bluffs.map((b) => L(ROLES[b], lang)).join(' · ')}</b>
                </p>
              )}
            </div>
          )}
          {view.info.length > 0 && (
            <div>
              <b>{tg(lang, 'yourInfo')}</b>
              <ul className={shell.logList}>
                {view.info.map((x, i) => (
                  <li key={i}>
                    🌙{x.night}: <InfoLine x={x} lang={lang} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {view.grimoire && (
            <div>
              <b>{tg(lang, 'grimoire')}</b>
              <ul className={shell.logList}>
                {view.grimoire.map((p) => (
                  <li key={p.id}>
                    {p.name}: {L(ROLES[p.role], lang)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className={styles.holdHint}>👆 {tg(lang, 'holdRole')}</p>
      )}
    </div>
  );

  // Every phone looks the same at night: a dark card with the moon.
  const nightShell = (inner) => (
    <div className={styles.nightPhone}>
      <p className={shell.kicker}>{tg(lang, 'night', {n: view.night})}</p>
      {inner}
    </div>
  );

  switch (view.kind) {
    case 'roles':
      return (
        <>
          {roleBox}
          <button type="button" className="button button--block" onClick={() => send({action: 'ready'})}>
            {tg(lang, 'ready')}
          </button>
        </>
      );
    case 'sleep':
      return nightShell(
        <>
          <p>{tg(lang, 'eyesClosed')}</p>
          <button type="button" className={styles.moon} onClick={() => setMoon(moon + 1)} aria-label={tg(lang, 'tapMoon')}>
            🌙
          </button>
          <p className={shell.muted}>{tg(lang, 'tapMoon')}</p>
        </>,
      );
    case 'choose':
      return nightShell(
        <>
          <p>
            <b>{tg(lang, 'youWake')}</b> {L(r, lang)} · {tg(lang, 'choose', {n: view.choose})}
          </p>
          <div className={shell.choiceGrid}>
            {view.targets.map((p) => (
              <button
                key={p.id}
                type="button"
                className="button button--sm"
                aria-pressed={picks.includes(p.id)}
                onClick={() => setPicks((list) => (list.includes(p.id) ? list.filter((x) => x !== p.id) : [...list, p.id].slice(-view.choose)))}>
                <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name}
              </button>
            ))}
          </div>
          <button type="button" className="button button--block" disabled={picks.length !== view.choose} onClick={() => send({action: 'night', targets: picks})}>
            {tg(lang, 'confirm')}
          </button>
        </>,
      );
    case 'info':
      return nightShell(
        <>
          <p>
            <b>{tg(lang, 'youWake')}</b> {L(r, lang)}
          </p>
          <div className={shell.card}>{view.callInfo ? <InfoLine x={{...view.callInfo, players: view.callInfo.players && view.callInfo.players.map((pid) => view.players.find((p) => p.id === pid)), player: view.callInfo.player && view.players.find((p) => p.id === view.callInfo.player)}} lang={lang} /> : '—'}</div>
          {view.grimoire && roleBox}
          <button type="button" className="button button--block" onClick={() => send({action: 'night'})}>
            {tg(lang, 'ok')}
          </button>
        </>,
      );
    case 'over':
      return (
        <>
          <p className={shell.bigText}>🏆 {tg(lang, view.winner === 'good' ? 'goodWin' : 'evilWin')}</p>
          <div className={shell.card}>
            <b>{tg(lang, 'roles')}</b>
            <ul className={shell.logList}>
              {view.roles.map((p) => (
                <li key={p.id}>
                  {p.name}: {L(ROLES[p.role], lang)}
                </li>
              ))}
            </ul>
          </div>
        </>
      );
    case 'vote':
      return (
        <>
          <p className={shell.bigText}>{tg(lang, 'voteQ', {name: view.nominee.name})}</p>
          {view.dead && <p className={shell.notice}>{view.canYes ? tg(lang, 'ghostHas') : tg(lang, 'ghostSpent')}</p>}
          <div className={shell.choiceGrid}>
            <button type="button" className="button button--lg" disabled={!view.canYes} onClick={() => send({action: 'vote', yes: true})}>
              {tg(lang, 'yes')}
            </button>
            <button type="button" className="button button--lg button--secondary" onClick={() => send({action: 'vote', yes: false})}>
              {tg(lang, 'no')}
            </button>
          </div>
          {roleBox}
        </>
      );
    default:
      return (
        <>
          {view.dead && <p className={shell.notice}>☠️ {tg(lang, 'dead')}</p>}
          {view.kind === 'day' && view.canNominate && (
            <div className={shell.card}>
              <b>{tg(lang, 'nominate')}</b>
              <div className={shell.choiceGrid}>
                {view.nominees
                  .filter((p) => p.id !== view.me)
                  .map((p) => (
                    <button key={p.id} type="button" className="button button--sm" onClick={() => send({action: 'nominate', target: p.id})}>
                      <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
          {view.kind === 'day' && !view.canNominate && !view.dead && <p className={shell.muted}>{tg(lang, 'nominated')}</p>}
          {view.canSlay && (
            <details className={shell.card}>
              <summary>{tg(lang, 'slay')}</summary>
              <div className={shell.choiceGrid}>
                {view.players
                  .filter((p) => !p.dead && p.id !== view.me)
                  .map((p) => (
                    <button key={p.id} type="button" className="button button--sm" onClick={() => send({action: 'slay', target: p.id})}>
                      🏹 {p.name}
                    </button>
                  ))}
              </div>
            </details>
          )}
          {(view.kind === 'defense' || view.kind === 'voted') && view.nominee && <p className={shell.bigText}>{tg(lang, 'voteQ', {name: view.nominee.name})}</p>}
          {view.kind === 'voted' && <p>{tg(lang, 'voted')}</p>}
          {roleBox}
        </>
      );
  }
}

export default clocktower;
