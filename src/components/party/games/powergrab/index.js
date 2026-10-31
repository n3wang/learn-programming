import React, {useState} from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {
  ACTIONS,
  MUST_OVERTHROW,
  ROLES,
  aliveIds,
  blockRoles,
  canTarget,
  declare,
  finishExchange,
  finishInspect,
  finishLose,
  hidden,
  holds,
  isAlive,
  legalActions,
  respond,
  responders,
  setupPowerGrab,
  timeout,
} from './rules';
import shell from '../../core/party.module.css';
import styles from './powergrab.module.css';

const tg = makeT({
  en: {
    a_income: 'Income +1',
    a_aid: 'Station aid +2',
    a_overthrow: 'Overthrow (7)',
    a_tax: 'Levy +3 (Quartermaster)',
    a_strike: 'Strike (3, Phantom)',
    a_skim: 'Skim 2 (Smuggler)',
    a_reshuffle: 'Reshuffle (Envoy)',
    a_inspect: 'Inspect (Inspector)',
    a_convert: 'Change faction',
    turnOf: '{name}’s move',
    yourTurn: 'Your move! Pick an action.',
    pickTarget: 'Pick a target',
    cancel: 'Cancel',
    challengeQ: '{name} claims {role}. Challenge?',
    blockQ: 'Block {name}’s {action}?',
    blockChallengeQ: '{name} blocks as {role}. Challenge?',
    challenge: 'Challenge!',
    pass: 'Let it pass',
    blockAs: 'Block as {role}',
    loseQ: 'You lose influence. Pick a card to give up.',
    exchangeQ: 'Keep {n} card(s).',
    keep: 'Keep these',
    inspectQ: '{name} has a {role}. Force a swap?',
    swap: 'Make them swap',
    leave: 'Leave it',
    waiting: 'Waiting…',
    yourCards: 'Your cards (tap to peek)',
    credits: '{n} credits',
    out: 'You are out. Be a ghost broker: who loses a card next?',
    ghostPoints: 'Ghost points: {n}',
    winner: '{name} commands ORBIT-9!',
    must: 'At 10+ credits you must overthrow.',
    faction: 'Faction',
    blue: 'Blue deck',
    orange: 'Orange deck',
    self: 'Yourself (1)',
    l_declare: '{actor}: {action}{target}',
    l_challenge: '{actor} challenges {target} ({role})',
    l_block: '{actor} blocks as {role}',
    l_blocked: 'Blocked!',
    l_lost: '{actor} loses a {role}',
    l_out: '{actor} is out',
    l_convert: '{target} switches faction',
    l_inspectSwap: '{actor} forces {target} to swap',
    l_inspectKeep: '{actor} inspects {target}',
    factions: 'Factions (9+ players)',
    auto: 'Auto',
    off: 'Off',
    phase_challenge: 'Anyone may challenge…',
    phase_block: 'Waiting for a block…',
    phase_blockChallenge: 'Anyone may challenge the block…',
    phase_lose: '{name} must give up a card',
    phase_exchange: '{name} is reshuffling',
    phase_inspect: '{name} is inspecting',
    deck: '{n} copies of each role',
  },
  zh: {
    a_income: '收入 +1',
    a_aid: '站务援助 +2',
    a_overthrow: '政变（7）',
    a_tax: '征税 +3（军需官）',
    a_strike: '刺杀（3，影刃）',
    a_skim: '顺走 2（走私者）',
    a_reshuffle: '换牌（特使）',
    a_inspect: '审查（审讯官）',
    a_convert: '更换阵营',
    turnOf: '轮到 {name}',
    yourTurn: '轮到你了！选一个行动。',
    pickTarget: '选择目标',
    cancel: '取消',
    challengeQ: '{name} 声称是 {role}。质疑吗？',
    blockQ: '要拦截 {name} 的「{action}」吗？',
    blockChallengeQ: '{name} 以 {role} 身份拦截。质疑吗？',
    challenge: '质疑！',
    pass: '放行',
    blockAs: '以 {role} 拦截',
    loseQ: '你失去一点影响力，选一张牌翻开。',
    exchangeQ: '保留 {n} 张牌。',
    keep: '就留这些',
    inspectQ: '{name} 有一张 {role}。要逼他换牌吗？',
    swap: '逼他换牌',
    leave: '不用了',
    waiting: '等待中……',
    yourCards: '你的牌（点一下偷看）',
    credits: '{n} 信用点',
    out: '你出局了。当幽灵经纪人：猜谁下一个丢牌？',
    ghostPoints: '幽灵分：{n}',
    winner: '{name} 掌控了 ORBIT-9！',
    must: '信用点到 10 以上必须发动政变。',
    faction: '阵营',
    blue: '蓝区',
    orange: '橙区',
    self: '自己（1）',
    l_declare: '{actor}：{action}{target}',
    l_challenge: '{actor} 质疑 {target}（{role}）',
    l_block: '{actor} 以 {role} 拦截',
    l_blocked: '被拦截了！',
    l_lost: '{actor} 失去一张 {role}',
    l_out: '{actor} 出局',
    l_convert: '{target} 换了阵营',
    l_inspectSwap: '{actor} 逼 {target} 换牌',
    l_inspectKeep: '{actor} 审查了 {target}',
    factions: '阵营模式（9 人以上）',
    auto: '自动',
    off: '关闭',
    phase_challenge: '任何人都可以质疑……',
    phase_block: '等待拦截……',
    phase_blockChallenge: '任何人都可以质疑这次拦截……',
    phase_lose: '{name} 必须翻开一张牌',
    phase_exchange: '{name} 正在换牌',
    phase_inspect: '{name} 正在审查',
    deck: '每种角色 {n} 张',
  },
});

const roleName = (role, lang) => L(ROLES[role], lang);

const VOICE = {
  welcome: {en: 'ORBIT-9 command is vacant. Candidates, take your seats.', zh: 'ORBIT-9 指挥权空缺。候选人请就位。'},
  turn: {en: '{seat}, your move.', zh: '{seat}，请行动。'},
  challenge: {en: 'Challenge raised!', zh: '有人提出质疑！'},
  claim_true: {en: 'Verified. The claim was true.', zh: '核实无误，说的是真话。'},
  claim_false: {en: 'Deception detected.', zh: '谎言被识破。'},
  blocked: {en: 'Action intercepted.', zh: '行动已被拦截。'},
  overthrow: {en: 'Alert! Overthrow!', zh: '警报！政变！'},
  card_lost: {en: 'Influence lost.', zh: '影响力下降。'},
  player_out: {en: '{seat} has lost all influence and becomes a ghost broker.', zh: '{seat}已失去全部影响力，转为幽灵经纪人。'},
  faction_switch: {en: 'Faction change logged.', zh: '阵营变更已记录。'},
  ten_credits: {en: 'Credit limit exceeded. An overthrow is mandatory.', zh: '资金超标，必须发动政变。'},
  winner: {en: 'New commander: {seat}. HALO is at your service.', zh: '新指挥官诞生：{seat}。HALO 向您效忠。'},
  claim_quartermaster: {en: 'Levy collected. Three credits.', zh: '税款到账，三个信用点。'},
  claim_phantom: {en: 'Target… locked.', zh: '目标……已锁定。'},
  claim_smuggler: {en: 'Borrowing two. I’ll pay you back… maybe.', zh: '借两个，回头还——也许吧。'},
  claim_envoy: {en: 'Let me… reconsider my position.', zh: '让我……重新考虑一下立场。'},
  claim_inspector: {en: 'Papers, please.', zh: '把证件拿出来。'},
  caught_quartermaster: {en: 'You don’t run my stores!', zh: '你根本不管仓库！'},
  caught_phantom: {en: 'An imitation.', zh: '冒牌货。'},
  caught_smuggler: {en: 'Hey, that’s my trademark!', zh: '嘿，那是我的招牌！'},
  caught_envoy: {en: 'Diplomatic immunity? Not you.', zh: '外交豁免？你没有。'},
  caught_warden: {en: 'You’re not on my roster.', zh: '安保名单上没有你。'},
  caught_inspector: {en: 'Forged papers. Interesting.', zh: '伪造证件，很有意思。'},
  block_quartermaster: {en: 'Aid? Through me first.', zh: '援助？先过我这关。'},
  block_smuggler: {en: 'Hands off my cargo.', zh: '别碰我的货。'},
  block_envoy: {en: 'Let’s talk, not grab.', zh: '我们谈谈，不必动手。'},
  block_warden: {en: 'Not on my watch.', zh: '此路不通。'},
  block_inspector: {en: 'This transfer… needs review.', zh: '这次交易……需要审查。'},
};

function RoleCard({role, lang, size = 64, up = true}) {
  if (!up) return <Sprite path="powergrab/card-back.webp" emoji="🛰️" label="" tint="#1e3799" size={`${size}px`} />;
  const r = ROLES[role];
  return <Sprite path={`powergrab/role-${role}.webp`} emoji={r.emoji} label={roleName(role, lang)} tint={r.tint} size={`${size}px`} />;
}

function describe(entry, g, lang) {
  const name = (id) => (g.players[id] ? g.players[id].name : '?');
  const vars = {
    actor: name(entry.actor),
    target: entry.target ? name(entry.target) : '',
    role: entry.role ? roleName(entry.role, lang) : '',
    action: entry.type ? tg(lang, `a_${entry.type}`) : '',
  };
  if (entry.kind === 'declare') vars.target = entry.target ? ` → ${name(entry.target)}` : '';
  return tg(lang, `l_${entry.kind}`, vars);
}

// ------------------------------------------------------------------ bots

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  if (!isAlive(s, id)) {
    if (s.phase !== 'over' && !s.ghostPick[id]) {
      const alive = aliveIds(s);
      return alive.length ? {action: 'ghost', target: pick(alive, rng)} : null;
    }
    return null;
  }
  if (s.phase === 'turn' && s.actor === id) {
    const c = s.credits[id];
    const targets = aliveIds(s).filter((t) => canTarget(s, id, t));
    const richest = [...targets].sort((a, b) => s.credits[b] - s.credits[a])[0];
    if (c >= 7 && richest) return {action: 'declare', type: 'overthrow', target: richest};
    if (c >= 3 && richest && (holds(s, id, 'phantom') ? rng() < 0.7 : rng() < 0.12)) return {action: 'declare', type: 'strike', target: pick(targets, rng)};
    if (holds(s, id, 'quartermaster') || rng() < 0.25) return {action: 'declare', type: 'tax'};
    const rich = targets.filter((t) => s.credits[t] >= 2);
    if (rich.length && (holds(s, id, 'smuggler') || rng() < 0.1)) return {action: 'declare', type: 'skim', target: pick(rich, rng)};
    if (holds(s, id, 'envoy') && rng() < 0.3) return {action: 'declare', type: 'reshuffle'};
    return {action: 'declare', type: rng() < 0.5 ? 'aid' : 'income'};
  }
  if (['challenge', 'block', 'blockChallenge'].includes(s.phase) && responders(s).includes(id) && !s.responses[id]) {
    const claim = s.phase === 'blockChallenge' ? s.block.claim : s.action && s.action.claim;
    if (s.phase === 'block') {
      const roles = blockRoles(s);
      const real = roles.find((r) => holds(s, id, r));
      if (real) return {action: 'respond', answer: 'block', role: real};
      if (roles.length && rng() < 0.15) return {action: 'respond', answer: 'block', role: roles[0]};
      return {action: 'respond', answer: 'pass'};
    }
    // Challenge when more of that role is showing (face up + own hand) than could exist.
    const seen = s.seats.reduce((n, p) => n + s.hands[p].filter((c) => c.up && c.role === claim).length, 0) + hidden(s, id).filter((c) => c.role === claim).length;
    if (seen >= s.copies || rng() < 0.1) return {action: 'respond', answer: 'challenge'};
    return {action: 'respond', answer: 'pass'};
  }
  if (s.phase === 'lose' && s.lose && s.lose.id === id) {
    return {action: 'lose', card: s.hands[id].findIndex((c) => !c.up)};
  }
  if (s.phase === 'exchange' && s.pick && s.pick.id === id) return {action: 'exchange', keep: [0, 1].slice(0, s.pick.keep)};
  if (s.phase === 'inspect' && s.pick && s.pick.id === id) return {action: 'inspect', swap: rng() < 0.5};
  return null;
}

// ------------------------------------------------------------------ module

const powergrab = {
  id: 'powergrab',
  emoji: '🛰️',
  title: {en: 'Power Grab', zh: '夺权'},
  blurb: {
    en: 'Station ORBIT-9 needs a commander. Bluff about your secret roles, challenge liars, and be the last one standing.',
    zh: '空间站 ORBIT-9 需要新指挥官。隐藏身份、虚张声势、揭穿谎言，活到最后。',
  },
  howTo: {
    en: [
      'You hold 2 secret role cards and start with 2 credits. Lose both cards and you are out.',
      'On your turn take one action. Anyone may claim any role, even one they don’t have: bluffing is the game.',
      'Anyone can challenge a claim. A liar loses a card; if the claim was true, the challenger loses one.',
      'Some actions can be blocked by claiming the right role, and blocks can be challenged too.',
      'With 7 credits you can overthrow (no defence). At 10 credits you must.',
      '9+ players: two factions; you may only attack the other one. Players who are out bet on who loses the next card.',
    ],
    zh: [
      '你有 2 张秘密角色牌和 2 个信用点。两张牌都翻开就出局。',
      '轮到你时做一个行动。任何人都可以声称自己是任何角色——虚张声势就是这个游戏的核心。',
      '任何人都可以质疑声称。撒谎的人失去一张牌；如果说的是真的，质疑的人失去一张牌。',
      '有些行动可以用对应角色拦截，拦截也可以被质疑。',
      '有 7 个信用点可以发动政变（无法防御），到 10 个必须发动。',
      '9 人以上分成两个阵营，只能攻击对方阵营。出局的人可以押谁下一个丢牌。',
    ],
  },
  reference(lang) {
    const zh = lang === 'zh';
    const text = {
      quartermaster: {en: 'Levy: take 3 credits. Blocks station aid.', zh: '征税：拿 3 个信用点。可以拦截站务援助。'},
      phantom: {en: 'Strike: pay 3, a player loses a card. Blocked by the Warden.', zh: '刺杀：付 3 点，目标失去一张牌。会被安保官拦截。'},
      smuggler: {en: 'Skim: take 2 credits from a player. Blocks skims.', zh: '顺走：从一名玩家拿走 2 点。可以拦截顺走。'},
      envoy: {en: 'Reshuffle: draw 2 cards, keep the ones you want. Blocks skims.', zh: '换牌：抽 2 张，留下想要的。可以拦截顺走。'},
      warden: {en: 'Blocks a strike against you.', zh: '拦截针对你的刺杀。'},
      inspector: {en: '9+ players. Look at a player’s card and may force a swap. Blocks skims.', zh: '9 人以上。查看一名玩家的一张牌，可以逼他换牌。可以拦截顺走。'},
    };
    return [
      {emoji: '🪙', title: zh ? '收入 / 站务援助' : 'Income / Station aid', text: {en: 'Anyone: +1 (can’t be stopped) or +2 (the Quartermaster can block it).', zh: '任何人：+1（无法阻止）或 +2（军需官可以拦截）。'}},
      {emoji: '💥', title: zh ? '政变' : 'Overthrow', text: {en: 'Pay 7: a player loses a card. Can’t be blocked.', zh: '付 7 点：目标失去一张牌。无法拦截。'}},
      ...Object.keys(text).map((k) => ({emoji: ROLES[k].emoji, tint: ROLES[k].tint, title: L(ROLES[k], lang), text: text[k]})),
    ];
  },
  inspiredBy: 'Coup',
  players: {min: 2, max: 16},
  minutes: 15,
  coverTint: '#3df2ff',
  themeClass: shell.themeStation,
  defaultSettings: {factions: 'auto'},
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupPowerGrab(seats, g.settings, ctx);
  },

  input(s, g, id, msg, ctx) {
    if (msg.action === 'ghost') {
      if (isAlive(s, id) || !s.seats.includes(msg.target) || !isAlive(s, msg.target)) return false;
      s.ghostPick[id] = msg.target;
      return true;
    }
    if (msg.action === 'declare') return declare(s, ctx, id, msg.type, msg.target);
    if (msg.action === 'respond') return respond(s, ctx, id, msg.answer, msg.role);
    if (msg.action === 'lose' && s.phase === 'lose' && s.lose && s.lose.id === id) {
      const card = s.hands[id][msg.card];
      if (!card || card.up) return false;
      finishLose(s, ctx, msg.card);
      return true;
    }
    if (msg.action === 'exchange' && s.phase === 'exchange' && s.pick.id === id) {
      finishExchange(s, ctx, Array.isArray(msg.keep) ? msg.keep.map(Number) : []);
      return true;
    }
    if (msg.action === 'inspect' && s.phase === 'inspect' && s.pick.id === id) {
      finishInspect(s, ctx, Boolean(msg.swap));
      return true;
    }
    return false;
  },

  tick(s, g, ctx) {
    return Boolean(timeout(s, ctx));
  },

  /** The phone view plus `urgent` (this phone must act now), which drives the banner and buzz. */
  view(s, g, id, ctx) {
    const v = this.baseView(s, g, id, ctx);
    return {...v, urgent: ['turn', 'challenge', 'block', 'blockChallenge', 'lose', 'exchange', 'inspect'].includes(v.kind)};
  },

  baseView(s, g, id) {
    const players = s.seats.map((p) => ({
      id: p,
      name: g.players[p] ? g.players[p].name : '?',
      avatar: g.players[p] && g.players[p].avatar,
      color: g.players[p] && g.players[p].color,
      credits: s.credits[p],
      alive: isAlive(s, p),
      faction: s.faction[p],
      lost: s.hands[p].filter((c) => c.up).map((c) => c.role),
      targetable: canTarget(s, id, p),
    }));
    const base = {
      phase: s.phase,
      me: id,
      hand: s.hands[id],
      credits: s.credits[id],
      alive: isAlive(s, id),
      faction: s.factions ? s.faction[id] : null,
      players,
      roles: s.roles,
      actor: s.actor,
      action: s.action,
      block: s.block,
      ghostScore: s.ghostScore[id] || 0,
      ghostPick: s.ghostPick[id] || null,
      winner: s.winner || null,
    };
    let task = 'wait';
    if (s.over) task = 'over';
    else if (!isAlive(s, id)) task = 'ghost';
    else if (s.phase === 'turn' && s.actor === id) task = 'turn';
    else if (['challenge', 'block', 'blockChallenge'].includes(s.phase) && responders(s).includes(id) && !s.responses[id]) task = s.phase;
    else if (s.phase === 'lose' && s.lose && s.lose.id === id) task = 'lose';
    else if ((s.phase === 'exchange' || s.phase === 'inspect') && s.pick && s.pick.id === id) task = s.phase;
    return {
      ...base,
      task: `${task}-${s.turnIdx}-${s.phase}`,
      kind: task,
      legal: task === 'turn' ? legalActions(s, id) : [],
      blockRoles: task === 'block' ? blockRoles(s) : [],
      pick: (task === 'exchange' || task === 'inspect') && s.pick ? s.pick : null,
    };
  },

  bot: botMove,

  SettingsView({settings, set, lang}) {
    return (
      <div className={shell.buttonRow}>
        <span>{tg(lang, 'factions')}</span>
        {['auto', 'off'].map((v) => (
          <button key={v} type="button" role="radio" aria-checked={settings.factions === v} className="button button--sm button--secondary" onClick={() => set({factions: v})}>
            {tg(lang, v)}
          </button>
        ))}
      </div>
    );
  },

  HostView({g, state: s, lang}) {
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const recent = (s.log || []).slice(-6).reverse();
    let prompt = '';
    if (s.phase === 'turn') prompt = tg(lang, 'turnOf', {name: name(s.actor)});
    else if (s.phase === 'lose' && s.lose) prompt = tg(lang, 'phase_lose', {name: name(s.lose.id)});
    else if (s.phase === 'exchange' || s.phase === 'inspect') prompt = tg(lang, `phase_${s.phase}`, {name: name(s.actor)});
    else if (s.phase !== 'over') prompt = tg(lang, `phase_${s.phase}`);
    return (
      <SeatRing
        g={g}
        ids={s.seats}
        dim={(id) => !isAlive(s, id)}
        highlight={(id) => !s.over && (id === s.actor || (s.lose && s.lose.id === id))}
        badge={(id) => (
          <>
            <span className={styles.credits}>💠 {s.credits[id]}</span>
            {s.factions && <span className={styles.faction} data-faction={s.faction[id]} />}
            <span className={styles.cards}>
              {s.hands[id].map((c, i) => (
                <RoleCard key={i} role={c.role} up={c.up} lang={lang} size={26} />
              ))}
            </span>
          </>
        )}>
        {s.over ? (
          <div className={shell.bigText}>🏆 {tg(lang, 'winner', {name: name(s.winner)})}</div>
        ) : (
          <>
            <p className={shell.kicker}>{prompt}</p>
            {s.action && (
              <div className={`${shell.card} ${styles.claim}`}>
                <span>
                  <b>{name(s.action.actor)}</b> · {ACTIONS[s.action.type].emoji} {tg(lang, `a_${s.action.type}`)}
                  {s.action.target && ` → ${name(s.action.target)}`}
                </span>
                {s.action.claim && <RoleCard role={s.action.claim} lang={lang} size={70} />}
                {s.block && (
                  <span>
                    🛡️ {tg(lang, 'l_block', {actor: name(s.block.by), role: roleName(s.block.claim, lang)})}
                    <RoleCard role={s.block.claim} lang={lang} size={50} />
                  </span>
                )}
              </div>
            )}
            {['challenge', 'block', 'blockChallenge'].includes(s.phase) && (
              <div className={shell.chipRow}>
                {responders(s).map((id) => (
                  <span key={id} className={shell.chip} style={{opacity: s.responses[id] ? 1 : 0.4}}>
                    {name(id)} {s.responses[id] === 'pass' ? '✓' : s.responses[id] ? '⚔️' : '…'}
                  </span>
                ))}
              </div>
            )}
            <ul className={`${shell.logList} ${styles.log}`}>
              {recent.map((entry, i) => (
                <li key={i}>{describe(entry, g, lang)}</li>
              ))}
            </ul>
            <p className={shell.muted}>{tg(lang, 'deck', {n: s.copies})}</p>
          </>
        )}
      </SeatRing>
    );
  },

  PhoneView({view, lang, send}) {
    return <PowerPhone key={view.task} view={view} lang={lang} send={send} />;
  },
};

function TargetPicker({view, lang, onPick, onCancel, includeSelf}) {
  return (
    <div className={shell.card}>
      <p>
        <b>{tg(lang, 'pickTarget')}</b>
      </p>
      <div className={shell.choiceGrid}>
        {includeSelf && (
          <button type="button" className="button button--sm" onClick={() => onPick(view.me)}>
            {tg(lang, 'self')}
          </button>
        )}
        {view.players
          .filter((p) => p.id !== view.me && (includeSelf ? p.alive : p.targetable))
          .map((p) => (
            <button key={p.id} type="button" className="button button--sm" onClick={() => onPick(p.id)}>
              <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name} · 💠{p.credits}
            </button>
          ))}
      </div>
      <button type="button" className="button button--sm button--secondary" style={{marginTop: '0.6rem'}} onClick={onCancel}>
        {tg(lang, 'cancel')}
      </button>
    </div>
  );
}

function PowerPhone({view, lang, send}) {
  const [peek, setPeek] = useState(false);
  const [choosing, setChoosing] = useState(null);
  const [keep, setKeep] = useState([]);
  const nameOf = (id) => (view.players.find((p) => p.id === id) || {}).name || '?';

  const hand = (
    <div className={shell.card}>
      <p className={shell.kicker}>
        {tg(lang, 'yourCards')} · 💠 {tg(lang, 'credits', {n: view.credits})}
        {view.faction && ` · ${tg(lang, view.faction)}`}
      </p>
      <button type="button" className={styles.handRow} onClick={() => setPeek(!peek)}>
        {view.hand.map((c, i) => (
          <span key={i} className={styles.handCard} data-up={c.up}>
            <RoleCard role={c.role} up={peek || c.up} lang={lang} size={84} />
          </span>
        ))}
      </button>
    </div>
  );

  if (view.kind === 'over') {
    return <div className={`${shell.card} ${shell.bigText}`}>🏆 {tg(lang, 'winner', {name: nameOf(view.winner)})}</div>;
  }

  if (view.kind === 'ghost') {
    return (
      <>
        <p className={shell.notice}>👻 {tg(lang, 'out')}</p>
        <p>{tg(lang, 'ghostPoints', {n: view.ghostScore})}</p>
        <div className={shell.choiceGrid}>
          {view.players
            .filter((p) => p.alive)
            .map((p) => (
              <button key={p.id} type="button" className="button button--sm" aria-pressed={view.ghostPick === p.id} onClick={() => send({action: 'ghost', target: p.id})}>
                <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name}
              </button>
            ))}
        </div>
      </>
    );
  }

  if (view.kind === 'turn') {
    if (choosing) {
      return (
        <>
          {hand}
          <TargetPicker
            view={view}
            lang={lang}
            includeSelf={choosing === 'convert'}
            onCancel={() => setChoosing(null)}
            onPick={(target) => send({action: 'declare', type: choosing, target})}
          />
        </>
      );
    }
    return (
      <>
        {hand}
        <p className={shell.bigText}>{tg(lang, 'yourTurn')}</p>
        {view.credits >= MUST_OVERTHROW && <p className={shell.notice}>{tg(lang, 'must')}</p>}
        <div className={shell.choiceGrid}>
          {view.legal.map((type) => (
            <button
              key={type}
              type="button"
              className="button"
              onClick={() => (ACTIONS[type].target || type === 'convert' ? setChoosing(type) : send({action: 'declare', type}))}>
              {ACTIONS[type].emoji} {tg(lang, `a_${type}`)}
            </button>
          ))}
        </div>
      </>
    );
  }

  if (view.kind === 'challenge' || view.kind === 'blockChallenge') {
    const q =
      view.kind === 'challenge'
        ? tg(lang, 'challengeQ', {name: nameOf(view.action.actor), role: roleName(view.action.claim, lang)})
        : tg(lang, 'blockChallengeQ', {name: nameOf(view.block.by), role: roleName(view.block.claim, lang)});
    return (
      <>
        <p className={shell.bigText}>{q}</p>
        <div className={shell.choiceGrid}>
          <button type="button" className="button button--lg" onClick={() => send({action: 'respond', answer: 'challenge'})}>
            ⚔️ {tg(lang, 'challenge')}
          </button>
          <button type="button" className="button button--lg button--secondary" onClick={() => send({action: 'respond', answer: 'pass'})}>
            {tg(lang, 'pass')}
          </button>
        </div>
        {hand}
      </>
    );
  }

  if (view.kind === 'block') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'blockQ', {name: nameOf(view.action.actor), action: tg(lang, `a_${view.action.type}`)})}</p>
        <div className={shell.choiceGrid}>
          {view.blockRoles.map((role) => (
            <button key={role} type="button" className="button" onClick={() => send({action: 'respond', answer: 'block', role})}>
              🛡️ {tg(lang, 'blockAs', {role: roleName(role, lang)})}
            </button>
          ))}
          <button type="button" className="button button--secondary" onClick={() => send({action: 'respond', answer: 'pass'})}>
            {tg(lang, 'pass')}
          </button>
        </div>
        {hand}
      </>
    );
  }

  if (view.kind === 'lose') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'loseQ')}</p>
        <div className={styles.handRow}>
          {view.hand.map((c, i) =>
            c.up ? null : (
              <button key={i} type="button" className={styles.pickCard} onClick={() => send({action: 'lose', card: i})}>
                <RoleCard role={c.role} lang={lang} size={96} />
              </button>
            ),
          )}
        </div>
      </>
    );
  }

  if (view.kind === 'exchange') {
    const need = view.pick.keep;
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'exchangeQ', {n: need})}</p>
        <div className={styles.handRow}>
          {view.pick.options.map((role, i) => (
            <button
              key={i}
              type="button"
              className={styles.pickCard}
              aria-pressed={keep.includes(i)}
              onClick={() => setKeep((k) => (k.includes(i) ? k.filter((x) => x !== i) : k.length < need ? [...k, i] : k))}>
              <RoleCard role={role} lang={lang} size={84} />
            </button>
          ))}
        </div>
        <button type="button" className="button button--block" disabled={keep.length !== need} onClick={() => send({action: 'exchange', keep})}>
          {tg(lang, 'keep')}
        </button>
      </>
    );
  }

  if (view.kind === 'inspect') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'inspectQ', {name: nameOf(view.pick.target), role: roleName(view.pick.role, lang)})}</p>
        <RoleCard role={view.pick.role} lang={lang} size={96} />
        <div className={shell.choiceGrid}>
          <button type="button" className="button" onClick={() => send({action: 'inspect', swap: true})}>
            {tg(lang, 'swap')}
          </button>
          <button type="button" className="button button--secondary" onClick={() => send({action: 'inspect', swap: false})}>
            {tg(lang, 'leave')}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {hand}
      <p className={shell.waiting}>
        {view.phase === 'turn' ? tg(lang, 'turnOf', {name: nameOf(view.actor)}) : tg(lang, 'waiting')}
      </p>
    </>
  );
}

export default powergrab;
