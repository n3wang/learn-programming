import React, {useState} from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {
  FAS_TRACK,
  LIB_TRACK,
  alive,
  answerVeto,
  discardCard,
  eligible,
  enactCard,
  knownTo,
  markReady,
  nominate,
  party,
  powerTargets,
  proposeVeto,
  setupSecretHitler,
  timeout,
  useJournalist,
  usePower,
  vote,
} from './rules';
import shell from '../../core/party.module.css';
import styles from './secrethitler.module.css';

const ROLE_ART = {
  liberal: {emoji: '🕊️', tint: '#7fb3e6', en: 'Liberal', zh: '自由党'},
  fascist: {emoji: '🐍', tint: '#e8735a', en: 'Fascist', zh: '法西斯党'},
  hitler: {emoji: '💀', tint: '#b3261e', en: 'Hitler', zh: '希特勒'},
  journalist: {emoji: '📰', tint: '#9ec5ea', en: 'Journalist (Liberal)', zh: '记者（自由党）'},
  bodyguard: {emoji: '🛡️', tint: '#9ec5ea', en: 'Bodyguard (Liberal)', zh: '保镖（自由党）'},
  infiltrator: {emoji: '🎭', tint: '#f0a08c', en: 'Infiltrator (Fascist)', zh: '潜伏者（法西斯党）'},
};

const POWER_ICON = {investigate: '🔍', special: '🗳️', peek: '👁️', execute: '🔫', audit: '📋'};

const tg = makeT({
  en: {
    holdRole: 'Hold to see your secret role',
    ready: 'I’ve seen it',
    yourTeam: 'Your fellow fascists',
    hitlerIs: 'Hitler is',
    noInfo: 'You don’t know anyone else’s role.',
    lookRole: 'Everyone: look at your secret role on your phone.',
    president: 'President',
    chancellor: 'Chancellor',
    clerk: 'Clerk',
    nominateQ: 'You are President. Nominate a Chancellor.',
    nominateClerk: 'Now nominate a Clerk.',
    voteQ: 'Vote on this government',
    ja: 'Ja!',
    nein: 'Nein',
    voted: 'Vote cast.',
    discardQ: 'Discard one policy (secretly).',
    enactQ: 'Enact one policy.',
    veto: 'Propose veto',
    vetoQ: 'The Chancellor proposes a veto. Agree?',
    agree: 'Agree',
    refuse: 'Refuse',
    investigateQ: 'Investigate a player’s party.',
    specialQ: 'Choose the next President.',
    executeQ: 'Execute a player.',
    peekQ: 'The next three policies:',
    auditQ: 'Audit: a discarded policy is shown to everyone.',
    ok: 'OK',
    isParty: '{name} is a {party}.',
    waiting: 'Waiting…',
    dead: 'You have been executed. Stay silent!',
    tracker: 'Election tracker',
    deck: 'Deck {n} · Discard {d}',
    phase_roles: 'Look at your roles',
    phase_nominate: '{name} is nominating',
    phase_vote: 'Vote now!',
    phase_president: 'The President is choosing…',
    phase_clerk: 'The Clerk is choosing…',
    phase_chancellor: 'The Chancellor is choosing…',
    phase_veto: 'Veto proposed…',
    phase_power: 'Presidential power: {power}',
    passed: 'Elected!',
    failed: 'Rejected',
    liberalWin: 'The Liberals win!',
    fascistWin: 'The Fascists win!',
    why_policies: 'Their policy track is full.',
    why_hitlerElected: 'Hitler was elected Chancellor.',
    why_hitlerShot: 'Hitler was executed.',
    pw_investigate: 'Investigate',
    pw_special: 'Special election',
    pw_peek: 'Policy peek',
    pw_execute: 'Execution',
    pw_audit: 'Public audit',
    policyL: 'Liberal',
    policyF: 'Fascist',
    journalistUse: '📰 Use press pass (once)',
    journalistSaw: 'The last Chancellor was handed:',
    roleWas: 'Roles',
    dangerZone: '3+ fascist policies: electing Hitler as Chancellor wins for the Fascists.',
  },
  zh: {
    holdRole: '按住查看你的秘密身份',
    ready: '我看好了',
    yourTeam: '你的法西斯同伴',
    hitlerIs: '希特勒是',
    noInfo: '你不知道其他人的身份。',
    lookRole: '所有人：在手机上查看你的秘密身份。',
    president: '总统',
    chancellor: '总理',
    clerk: '书记',
    nominateQ: '你是总统。提名一位总理。',
    nominateClerk: '再提名一位书记。',
    voteQ: '为这届政府投票',
    ja: 'Ja!（同意）',
    nein: 'Nein（反对）',
    voted: '已投票。',
    discardQ: '秘密弃掉一张法案。',
    enactQ: '颁布一张法案。',
    veto: '提议否决',
    vetoQ: '总理提议否决。同意吗？',
    agree: '同意',
    refuse: '拒绝',
    investigateQ: '调查一名玩家的党派。',
    specialQ: '指定下一任总统。',
    executeQ: '处决一名玩家。',
    peekQ: '接下来的三张法案：',
    auditQ: '公开审计：一张被弃掉的法案公开给所有人。',
    ok: '好的',
    isParty: '{name} 是 {party}。',
    waiting: '等待中……',
    dead: '你已被处决。请保持沉默！',
    tracker: '选举失败计数',
    deck: '牌堆 {n} · 弃牌 {d}',
    phase_roles: '查看身份',
    phase_nominate: '{name} 正在提名',
    phase_vote: '现在投票！',
    phase_president: '总统正在选择……',
    phase_clerk: '书记正在选择……',
    phase_chancellor: '总理正在选择……',
    phase_veto: '有人提议否决……',
    phase_power: '总统权力：{power}',
    passed: '当选！',
    failed: '被否决',
    liberalWin: '自由党获胜！',
    fascistWin: '法西斯党获胜！',
    why_policies: '他们的法案轨道已满。',
    why_hitlerElected: '希特勒当选了总理。',
    why_hitlerShot: '希特勒被处决了。',
    pw_investigate: '调查',
    pw_special: '特别选举',
    pw_peek: '查看法案',
    pw_execute: '处决',
    pw_audit: '公开审计',
    policyL: '自由党法案',
    policyF: '法西斯法案',
    journalistUse: '📰 使用记者证（一次）',
    journalistSaw: '上一任总理拿到的是：',
    roleWas: '身份',
    dangerZone: '已有 3 张法西斯法案：若希特勒当选总理，法西斯党获胜。',
  },
});

const VOICE = {
  welcome: {en: 'Parliament is in session.', zh: '议会开会！'},
  role_reveal: {en: 'Pick up your phone and hold to see your role. Let no one see.', zh: '请拿起手机，按住查看身份。别让邻座看到。'},
  nominate: {en: 'President {seat}: nominate your Chancellor.', zh: '{seat}总统，请提名总理。'},
  vote_open: {en: 'All members, vote!', zh: '全体表决！'},
  vote_pass: {en: 'The government is elected.', zh: '表决通过。'},
  vote_fail: {en: 'The government is rejected.', zh: '表决否决。'},
  deadlock: {en: 'Parliament is deadlocked again…', zh: '议会再次陷入僵局……'},
  chaos: {en: 'Chaos! The people force a policy through!', zh: '混乱！民众强行通过了一项法案！'},
  law_liberal: {en: 'A Liberal policy is enacted.', zh: '一项自由党法案生效。'},
  law_fascist: {en: 'A Fascist policy… has been enacted.', zh: '一项法西斯法案……生效了。'},
  power_investigate: {en: 'The President may investigate one player’s loyalty.', zh: '总统可以调查一名玩家的党派。'},
  power_peek: {en: 'The President may look at the next three policies.', zh: '总统可以查看接下来的三张法案。'},
  power_special: {en: 'The President will choose the next President.', zh: '总统将亲自指定下一任总统。'},
  power_execute: {en: 'The President must execute a player.', zh: '总统必须处决一名玩家。'},
  executed: {en: '{seat} has been executed.', zh: '{seat}被处决了。'},
  guarded: {en: 'The Bodyguard steps in! Nobody dies.', zh: '保镖挡下了子弹！没有人死去。'},
  audit: {en: 'Public audit: one discarded policy is revealed.', zh: '公开审计：一张被弃掉的法案公开了。'},
  danger_zone: {en: 'Warning: from now on, if Hitler is elected Chancellor, the Fascists win.', zh: '警告：从现在起，若希特勒当选总理，法西斯党获胜。'},
  veto: {en: 'The Chancellor proposes a veto.', zh: '总理提议否决本次法案。'},
  win_liberal: {en: 'The Liberals have saved the republic!', zh: '自由党拯救了共和国！'},
  win_fascist: {en: 'The Fascists have seized power.', zh: '法西斯党夺取了政权。'},
};

function RoleCard({role, lang, size = 80}) {
  const r = ROLE_ART[role];
  return <Sprite path={`secrethitler/role-${role}.webp`} emoji={r.emoji} label={L(r, lang)} tint={r.tint} size={`${size}px`} />;
}

function Policy({card, lang, size = 52}) {
  return card === 'L' ? (
    <Sprite path="secrethitler/policy-liberal.webp" emoji="🕊️" label={tg(lang, 'policyL')} tint="#7fb3e6" size={`${size}px`} />
  ) : (
    <Sprite path="secrethitler/policy-fascist.webp" emoji="🦅" label={tg(lang, 'policyF')} tint="#e8735a" size={`${size}px`} />
  );
}

// ------------------------------------------------------------------ bots

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  if (s.dead[id]) return null;
  const fas = party(s.role[id]) === 'fascist';
  if (s.phase === 'roles' && !s.ready[id]) return {action: 'ready'};
  if (s.phase === 'nominate' && s.gov.president === id) {
    const ok = eligible(s);
    const friends = ok.filter((o) => party(s.role[o]) === 'fascist');
    const c = fas && friends.length && rng() < 0.7 ? pick(friends, rng) : pick(ok, rng);
    const k = pick(ok.filter((o) => o !== c), rng);
    return {action: 'nominate', chancellor: c, clerk: k};
  }
  if (s.phase === 'vote' && s.votes[id] == null) {
    const govFas = [s.gov.president, s.gov.chancellor, s.gov.clerk].filter(Boolean).some((o) => party(s.role[o]) === 'fascist');
    const ja = fas ? govFas || rng() < 0.5 : rng() < 0.6;
    return {action: 'vote', ja};
  }
  if ((s.phase === 'president' && s.gov.president === id) || (s.phase === 'clerk' && s.gov.clerk === id)) {
    const throwAway = fas && rng() > 0.25 ? 'L' : 'F';
    const i = s.hand.indexOf(throwAway);
    return {action: 'discard', index: i >= 0 ? i : 0};
  }
  if (s.phase === 'chancellor' && s.gov.chancellor === id) {
    const want = fas && (s.fas >= 2 || rng() > 0.25) ? 'F' : 'L';
    const i = s.hand.indexOf(want);
    return {action: 'enact', index: i >= 0 ? i : 0};
  }
  if (s.phase === 'veto' && s.gov.president === id) return {action: 'veto', agree: rng() < 0.5};
  if (s.phase === 'power' && s.power && s.power.president === id) {
    if (s.power.result || s.power.kind === 'peek' || s.power.kind === 'audit') return {action: 'power'};
    const targets = powerTargets(s);
    return {action: 'power', target: targets.length ? pick(targets, rng) : null};
  }
  return null;
}

// ------------------------------------------------------------------ module

const secrethitler = {
  id: 'secrethitler',
  emoji: '🗳️',
  title: {en: 'Secret Hitler', zh: '秘密希特勒'},
  blurb: {
    en: 'Liberals vs hidden Fascists in 1930s parliament. Elect governments, pass policies, find Hitler.',
    zh: '1930 年代议会：自由党对抗隐藏的法西斯党。选举政府、通过法案、找出希特勒。',
  },
  inspiredBy: 'Secret Hitler (CC BY-NC-SA 4.0)',
  players: {min: 5, max: 16},
  minutes: 30,
  coverTint: '#f08a24',
  themeClass: shell.themeReich,
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupSecretHitler(seats, ctx);
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'ready':
        return markReady(s, ctx, id);
      case 'nominate':
        return nominate(s, ctx, id, msg.chancellor, msg.clerk);
      case 'vote':
        return vote(s, ctx, id, Boolean(msg.ja));
      case 'discard':
        return discardCard(s, ctx, id, Number(msg.index));
      case 'enact':
        return enactCard(s, ctx, id, Number(msg.index));
      case 'proposeVeto':
        return proposeVeto(s, ctx, id);
      case 'veto':
        return answerVeto(s, ctx, id, Boolean(msg.agree));
      case 'power':
        return usePower(s, ctx, id, msg.target);
      case 'journalist':
        return useJournalist(s, id);
      default:
        return false;
    }
  },

  tick(s, g, ctx) {
    return Boolean(timeout(s, ctx));
  },

  view(s, g, id) {
    const player = (p) => ({id: p, name: g.players[p] ? g.players[p].name : '?', avatar: g.players[p] && g.players[p].avatar, color: g.players[p] && g.players[p].color, dead: Boolean(s.dead[p])});
    const role = s.role[id];
    const gov = s.gov || {};
    let task = 'wait';
    if (s.over) task = 'over';
    else if (s.dead[id]) task = 'dead';
    else if (s.phase === 'roles' && !s.ready[id]) task = 'roles';
    else if (s.phase === 'nominate' && gov.president === id) task = 'nominate';
    else if (s.phase === 'vote' && s.votes[id] == null) task = 'vote';
    else if ((s.phase === 'president' && gov.president === id) || (s.phase === 'clerk' && gov.clerk === id)) task = 'discard';
    else if (s.phase === 'chancellor' && gov.chancellor === id) task = 'enact';
    else if (s.phase === 'veto' && gov.president === id) task = 'veto';
    else if (s.phase === 'power' && s.power && s.power.president === id) task = 'power';
    const v = {
      task: `${task}-${s.phase}-${s.lib}-${s.fas}-${s.tracker}-${gov.president || ''}`,
      kind: task,
      role,
      team: knownTo(s, id).map((p) => ({...player(p), hitler: s.role[p] === 'hitler'})),
      gov: {president: gov.president && player(gov.president), chancellor: gov.chancellor && player(gov.chancellor), clerk: gov.clerk && player(gov.clerk)},
      clerkSeat: s.clerkSeat,
      fas: s.fas,
      winner: s.winner,
      winWhy: s.winWhy,
      note: s.privateNote[id] || null,
      canJournal: role === 'journalist' && !s.used.journalist && Boolean(s.lastHand) && !s.dead[id],
    };
    if (task === 'nominate') v.eligible = eligible(s).map(player);
    if (task === 'discard' || task === 'enact') {
      v.hand = s.hand;
      v.canVeto = task === 'enact' && s.fas >= 5 && !s.vetoRefused;
    }
    if (task === 'power') {
      v.power = {kind: s.power.kind, result: s.power.result && (s.power.result.target ? {...s.power.result, name: player(s.power.result.target).name} : s.power.result)};
      v.targets = powerTargets(s).map(player);
    }
    if (s.over) v.roles = s.seats.map((p) => ({...player(p), role: s.role[p]}));
    return v;
  },

  bot: botMove,

  HostView({g, state: s, lang}) {
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const gov = s.gov || {};
    const plaque = (id) => {
      if (id === gov.president) return <span className={styles.plaque}>🎩 {tg(lang, 'president')}</span>;
      if (id === gov.chancellor) return <span className={styles.plaque}>📜 {tg(lang, 'chancellor')}</span>;
      if (id === gov.clerk) return <span className={styles.plaque}>🖋️ {tg(lang, 'clerk')}</span>;
      return null;
    };
    let prompt = '';
    if (s.phase === 'roles') prompt = tg(lang, 'lookRole');
    else if (s.phase === 'nominate') prompt = tg(lang, 'phase_nominate', {name: name(gov.president)});
    else if (s.phase === 'voteShow') prompt = s.voteResult ? tg(lang, 'passed') : tg(lang, 'failed');
    else if (s.phase === 'power' && s.power) prompt = tg(lang, 'phase_power', {power: tg(lang, `pw_${s.power.kind}`)});
    else if (s.phase !== 'enacted' && s.phase !== 'over') prompt = tg(lang, `phase_${s.phase}`);
    return (
      <SeatRing
        g={g}
        ids={s.seats}
        dim={(id) => s.dead[id]}
        highlight={(id) => !s.over && (id === gov.president || id === gov.chancellor || id === gov.clerk)}
        badge={(id) => (
          <>
            {s.dead[id] && <span>☠️</span>}
            {plaque(id)}
            {(s.phase === 'voteShow' || (s.phase === 'vote' && s.votes[id] != null)) && (
              <span className={styles.vote} data-vote={s.phase === 'voteShow' ? s.votes[id] || 'none' : 'hidden'}>
                {s.phase === 'voteShow' ? (s.votes[id] === 'ja' ? 'JA' : s.votes[id] === 'nein' ? 'NEIN' : '—') : '✓'}
              </span>
            )}
            {s.over && <span className={styles.roleTag} data-party={party(s.role[id])}>{L(ROLE_ART[s.role[id]], lang)}</span>}
          </>
        )}>
        {s.over ? (
          <div className={shell.bigText}>
            🏆 {tg(lang, s.winner === 'liberal' ? 'liberalWin' : 'fascistWin')}
            <p className={shell.muted}>{tg(lang, `why_${s.winWhy}`)}</p>
          </div>
        ) : (
          <>
            <div className={styles.track} data-kind="liberal">
              {Array.from({length: LIB_TRACK}, (_, i) => (
                <span key={i} className={styles.slot}>
                  {i < s.lib ? <Policy card="L" lang={lang} size={40} /> : i === LIB_TRACK - 1 ? '🏆' : ''}
                </span>
              ))}
            </div>
            <div className={styles.track} data-kind="fascist">
              {Array.from({length: FAS_TRACK}, (_, i) => (
                <span key={i} className={styles.slot}>
                  {i < s.fas ? <Policy card="F" lang={lang} size={40} /> : i === FAS_TRACK - 1 ? '💀' : POWER_ICON[s.powers[i]] || ''}
                </span>
              ))}
            </div>
            <div className={styles.trackerRow}>
              {tg(lang, 'tracker')}
              {[0, 1, 2].map((i) => (
                <span key={i} className={styles.trackerDot} data-on={i < s.tracker} />
              ))}
              <span className={shell.muted}>{tg(lang, 'deck', {n: s.deck.length, d: s.discard.length})}</span>
            </div>
            {prompt && <p className={styles.prompt}>{prompt}</p>}
            {s.phase === 'enacted' && <Policy card={s.lastPolicy} lang={lang} size={90} />}
            {s.phase === 'power' && s.power && s.power.kind === 'audit' && s.power.result && <Policy card={s.power.result} lang={lang} size={70} />}
            {s.fas >= 3 && <p className={styles.danger}>⚠️ {tg(lang, 'dangerZone')}</p>}
          </>
        )}
      </SeatRing>
    );
  },

  PhoneView({view, lang, send}) {
    return <SHPhone key={view.task} view={view} lang={lang} send={send} />;
  },
};

function PlayerButtons({list, onPick, selected}) {
  return (
    <div className={shell.choiceGrid}>
      {list.map((p) => (
        <button key={p.id} type="button" className="button button--sm" aria-pressed={selected === p.id} onClick={() => onPick(p.id)}>
          <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name}
        </button>
      ))}
    </div>
  );
}

function SHPhone({view, lang, send}) {
  const [showRole, setShowRole] = useState(false);
  const [chancellor, setChancellor] = useState(null);

  const roleBox = (
    <div
      className={`${shell.card} ${styles.roleBox}`}
      onPointerDown={() => setShowRole(true)}
      onPointerUp={() => setShowRole(false)}
      onPointerLeave={() => setShowRole(false)}
      onContextMenu={(e) => e.preventDefault()}>
      {showRole ? (
        <>
          <RoleCard role={view.role} lang={lang} size={110} />
          {view.team.length > 0 ? (
            <div>
              <b>{tg(lang, 'yourTeam')}</b>
              <div className={shell.chipRow}>
                {view.team.map((p) => (
                  <span key={p.id} className={shell.chip}>
                    {p.name}
                    {p.hitler && ' 💀'}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className={shell.muted}>{tg(lang, 'noInfo')}</p>
          )}
        </>
      ) : (
        <p className={styles.holdHint}>👆 {tg(lang, 'holdRole')}</p>
      )}
    </div>
  );

  const journal = (
    <>
      {view.canJournal && (
        <button type="button" className="button button--sm button--secondary" onClick={() => send({action: 'journalist'})}>
          {tg(lang, 'journalistUse')}
        </button>
      )}
      {view.note && view.note.kind === 'journalist' && (
        <div className={shell.card}>
          {tg(lang, 'journalistSaw')}
          <div className={shell.chipRow}>
            {view.note.cards.map((c, i) => (
              <Policy key={i} card={c} lang={lang} size={40} />
            ))}
          </div>
        </div>
      )}
    </>
  );

  switch (view.kind) {
    case 'over':
      return (
        <>
          <p className={shell.bigText}>🏆 {tg(lang, view.winner === 'liberal' ? 'liberalWin' : 'fascistWin')}</p>
          <div className={shell.card}>
            <b>{tg(lang, 'roleWas')}</b>
            <ul className={shell.logList}>
              {view.roles.map((p) => (
                <li key={p.id}>
                  {p.name}: {L(ROLE_ART[p.role], lang)}
                </li>
              ))}
            </ul>
          </div>
        </>
      );
    case 'dead':
      return <p className={shell.notice}>☠️ {tg(lang, 'dead')}</p>;
    case 'roles':
      return (
        <>
          {roleBox}
          <button type="button" className="button button--block" onClick={() => send({action: 'ready'})}>
            {tg(lang, 'ready')}
          </button>
        </>
      );
    case 'nominate':
      return (
        <>
          <p className={shell.bigText}>{chancellor && view.clerkSeat ? tg(lang, 'nominateClerk') : tg(lang, 'nominateQ')}</p>
          <PlayerButtons
            list={chancellor ? view.eligible.filter((p) => p.id !== chancellor) : view.eligible}
            onPick={(id) => {
              if (!view.clerkSeat) send({action: 'nominate', chancellor: id});
              else if (!chancellor) setChancellor(id);
              else send({action: 'nominate', chancellor, clerk: id});
            }}
          />
          {chancellor && (
            <button type="button" className="button button--sm button--secondary" onClick={() => setChancellor(null)}>
              ↶
            </button>
          )}
          {roleBox}
        </>
      );
    case 'vote':
      return (
        <>
          <p className={shell.bigText}>{tg(lang, 'voteQ')}</p>
          <div className={shell.card}>
            🎩 {tg(lang, 'president')}: <b>{view.gov.president && view.gov.president.name}</b>
            <br />
            📜 {tg(lang, 'chancellor')}: <b>{view.gov.chancellor && view.gov.chancellor.name}</b>
            {view.gov.clerk && (
              <>
                <br />
                🖋️ {tg(lang, 'clerk')}: <b>{view.gov.clerk.name}</b>
              </>
            )}
          </div>
          <div className={styles.voteRow}>
            <button type="button" className={`button button--lg ${styles.ja}`} onClick={() => send({action: 'vote', ja: true})}>
              <Sprite path="secrethitler/vote-ja.webp" emoji="👍" label={tg(lang, 'ja')} tint="#ffffff" size="70px" />
            </button>
            <button type="button" className={`button button--lg ${styles.nein}`} onClick={() => send({action: 'vote', ja: false})}>
              <Sprite path="secrethitler/vote-nein.webp" emoji="👎" label={tg(lang, 'nein')} tint="#333333" size="70px" />
            </button>
          </div>
          {roleBox}
        </>
      );
    case 'discard':
    case 'enact':
      return (
        <>
          <p className={shell.bigText}>{tg(lang, view.kind === 'discard' ? 'discardQ' : 'enactQ')}</p>
          <div className={styles.handRow}>
            {view.hand.map((c, i) => (
              <button key={i} type="button" className={styles.pickCard} onClick={() => send({action: view.kind, index: i})}>
                <Policy card={c} lang={lang} size={84} />
              </button>
            ))}
          </div>
          {view.canVeto && (
            <button type="button" className="button button--secondary" onClick={() => send({action: 'proposeVeto'})}>
              ✋ {tg(lang, 'veto')}
            </button>
          )}
        </>
      );
    case 'veto':
      return (
        <>
          <p className={shell.bigText}>{tg(lang, 'vetoQ')}</p>
          <div className={shell.choiceGrid}>
            <button type="button" className="button" onClick={() => send({action: 'veto', agree: true})}>
              {tg(lang, 'agree')}
            </button>
            <button type="button" className="button button--secondary" onClick={() => send({action: 'veto', agree: false})}>
              {tg(lang, 'refuse')}
            </button>
          </div>
        </>
      );
    case 'power': {
      const {kind, result} = view.power;
      if (kind === 'peek' || kind === 'audit') {
        return (
          <>
            <p className={shell.bigText}>{tg(lang, kind === 'peek' ? 'peekQ' : 'auditQ')}</p>
            <div className={styles.handRow}>
              {(Array.isArray(result) ? result : result ? [result] : []).map((c, i) => (
                <Policy key={i} card={c} lang={lang} size={70} />
              ))}
            </div>
            <button type="button" className="button button--block" onClick={() => send({action: 'power'})}>
              {tg(lang, 'ok')}
            </button>
          </>
        );
      }
      if (kind === 'investigate' && result) {
        return (
          <>
            <p className={shell.bigText}>{tg(lang, 'isParty', {name: result.name, party: tg(lang, result.party === 'liberal' ? 'policyL' : 'policyF')})}</p>
            <Sprite path={`secrethitler/party-${result.party}.webp`} emoji={result.party === 'liberal' ? '🕊️' : '🐍'} label="" tint={result.party === 'liberal' ? '#7fb3e6' : '#e8735a'} size="110px" />
            <button type="button" className="button button--block" onClick={() => send({action: 'power'})}>
              {tg(lang, 'ok')}
            </button>
          </>
        );
      }
      return (
        <>
          <p className={shell.bigText}>{tg(lang, `${kind}Q`)}</p>
          <PlayerButtons list={view.targets} onPick={(id) => send({action: 'power', target: id})} />
        </>
      );
    }
    default:
      return (
        <>
          <p className={shell.waiting}>{tg(lang, 'waiting')}</p>
          {roleBox}
          {journal}
        </>
      );
  }
}

export default secrethitler;
