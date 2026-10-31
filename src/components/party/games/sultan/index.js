import React from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {COLORS, DISTRICT, ROLES, canBuild, draftPick, nameableRoles, pashaTargets, setupSultan, timeout, turnAction} from './rules';
import shell from '../../core/party.module.css';
import styles from './sultan.module.css';

const tg = makeT({
  en: {
    round: 'Day {n}',
    drafting: 'Choose your role in secret…',
    draftWave: 'Choosing now:',
    calling: 'Summoning…',
    noAnswer: 'No one answers.',
    slain: 'Slain tonight: skips the turn.',
    lastRound: 'A city is complete. This is the final day!',
    goal: 'Goal: {n} buildings',
    pickRole: 'Pick your role for today',
    waitDraft: 'Waiting for your turn to choose…',
    yourRole: 'Your role: {role}',
    yourTurn: 'Your turn!',
    income: 'Take income',
    takeGold: '💰 Take 2 gold',
    takeCards: '🃏 Draw 2, keep 1',
    keepOne: 'Keep one card',
    build: 'Build ({n} left)',
    endTurn: 'End turn',
    hand: 'Your hand',
    city: 'Your city',
    gold: '{n} gold',
    nameRole: 'Name a role',
    bladeHint: 'That role skips its turn this round.',
    thiefHint: 'You take all their gold when they are called.',
    astro: 'Astrologer',
    swapWith: 'Swap hands with…',
    redraw: 'Redraw my whole hand',
    destroy: 'Knock down a building',
    used: 'Ability used.',
    waiting: 'Waiting…',
    nobodyCalled: 'Waiting for your role to be called.',
    turnDone: 'Your turn is done. Watch the other roles.',
    final: 'Final scores',
    points: '{n} pts',
    cost: 'cost {n}',
  },
  zh: {
    round: '第 {n} 天',
    drafting: '秘密挑选你的角色……',
    draftWave: '正在挑选：',
    calling: '传召——',
    noAnswer: '无人应召。',
    slain: '今夜遇刺，跳过回合。',
    lastRound: '有一座城已经建成，这是最后一天！',
    goal: '目标：{n} 座建筑',
    pickRole: '挑选你今天的角色',
    waitDraft: '等待轮到你挑选……',
    yourRole: '你的角色：{role}',
    yourTurn: '轮到你了！',
    income: '先拿收入',
    takeGold: '💰 拿 2 金币',
    takeCards: '🃏 抽 2 张留 1 张',
    keepOne: '留下一张',
    build: '建造（还能建 {n} 座）',
    endTurn: '结束回合',
    hand: '你的手牌',
    city: '你的城市',
    gold: '{n} 金币',
    nameRole: '点名一个角色',
    bladeHint: '被点名的角色这一轮跳过回合。',
    thiefHint: '被点名的角色被传召时，你拿走他的全部金币。',
    astro: '星象师',
    swapWith: '和谁交换手牌……',
    redraw: '重抽整手牌',
    destroy: '拆掉一座建筑',
    used: '技能已使用。',
    waiting: '等待中……',
    nobodyCalled: '等待你的角色被传召。',
    turnDone: '你的回合结束了，看看其他角色。',
    final: '最终得分',
    points: '{n} 分',
    cost: '{n} 金',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to the City of the Sultan, land of gold and dunes.', zh: '欢迎来到苏丹之城，黄金与沙丘之地。'},
  round_start: {en: 'The palace drums sound. A new day begins.', zh: '宫殿的鼓声响起，新的一天开始了。'},
  draft: {en: 'Choose your role for today, in secret.', zh: '请秘密挑选你今天的身份。'},
  call_blade: {en: 'Summoning… the Shadow Blade! Tonight, someone will not wake.', zh: '传召——影刺！今夜，有人不会醒来。'},
  call_thief: {en: 'Summoning… the Bazaar Thief! This purse… is mine now.', zh: '传召——集市盗贼！这袋金子……现在归我了。'},
  call_astrologer: {en: 'Summoning… the Astrologer! The stars say your cards should change.', zh: '传召——星象师！星辰说，你的牌该换一换了。'},
  call_sultan: {en: 'Summoning… the Sultan! The crown is mine. The city obeys!', zh: '传召——苏丹！王冠归我。全城听令！'},
  call_sage: {en: 'Summoning… the Grand Sage! No sword enters the house of wisdom.', zh: '传召——大智者！智慧之所，刀剑不入。'},
  call_merchant: {en: 'Summoning… the Caravan Master! When the camel bells ring, the gold pours in!', zh: '传召——商队首领！驼铃一响，黄金万两！'},
  call_architect: {en: 'Summoning… the Master Architect! Plans are drawn. Two more buildings!', zh: '传召——建筑大师！图纸画好了，再建两座！'},
  call_pasha: {en: 'Summoning… the Pasha! A wall? Tear it down!', zh: '传召——帕夏！城墙？拆了它！'},
  no_answer: {en: '…No one answers.', zh: '……无人应召。'},
  slain: {en: 'Tonight, this one did not wake.', zh: '今夜，他没能醒来。'},
  robbed: {en: 'The purse is empty! The thief strikes.', zh: '钱袋空了！盗贼得手了。'},
  build_royal: {en: 'A palace rises.', zh: '一座宫殿落成。'},
  build_scholarly: {en: 'A house of learning rises.', zh: '一座学府落成。'},
  build_trade: {en: 'A market rises.', zh: '一座集市落成。'},
  build_military: {en: 'A fortress rises.', zh: '一座堡垒落成。'},
  build_wonder: {en: 'A wonder rises!', zh: '一座奇观落成！'},
  destroyed: {en: 'The Pasha’s army tears a building down.', zh: '帕夏的军队推倒了一座建筑。'},
  crown_moves: {en: 'The crown changes hands.', zh: '王冠易主。'},
  last_round: {en: 'The first city is complete! This is the final day.', zh: '第一座城已经建成！这是最后一天。'},
  winner: {en: 'The legend of the Sultan’s city belongs to {seat}.', zh: '苏丹之城的传奇，属于{seat}。'},
};

const roleName = (r, lang) => `${r} · ${L(ROLES[r], lang)}`;

/** What each role does, shown when drafting and in the rules sheet. */
const ABILITY = {
  1: {en: 'Name a role: it skips its turn today.', zh: '点名一个角色：它今天跳过回合。'},
  2: {en: 'Name a role: take all its gold when it is called.', zh: '点名一个角色：它被传召时你拿走它的全部金币。'},
  3: {en: 'Swap your hand with a player, or redraw your whole hand.', zh: '和一名玩家交换手牌，或重抽整手牌。'},
  4: {en: 'Take the crown (pick first tomorrow). +1 gold per royal building.', zh: '拿到王冠（明天先选）。每座王室建筑 +1 金币。'},
  5: {en: 'The Pasha can’t touch your city. +1 gold per scholarly building.', zh: '帕夏不能拆你的城。每座学术建筑 +1 金币。'},
  6: {en: '+1 gold, and +1 gold per trade building.', zh: '+1 金币，每座商贸建筑再 +1 金币。'},
  7: {en: 'Draw 2 extra cards and build up to 3 buildings.', zh: '额外抽 2 张牌，最多建 3 座建筑。'},
  8: {en: 'Pay to knock down a building. +1 gold per military building.', zh: '付钱拆掉一座建筑。每座军事建筑 +1 金币。'},
};

function RoleCard({r, lang, size = 64}) {
  const role = ROLES[r];
  return <Sprite path={`sultan/role-${role.key}.webp`} emoji={role.emoji} label={roleName(r, lang)} tint={role.tint} size={`${size}px`} />;
}

function DistrictCard({k, lang, size = 60}) {
  const d = DISTRICT[k];
  return <Sprite path={`sultan/district-${d.key}.webp`} emoji={d.emoji} label={`${L(d, lang)} · ${d.cost}`} tint={COLORS[d.color].tint} size={`${size}px`} />;
}

// ------------------------------------------------------------------ bots

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  if (s.phase === 'draft') {
    const offer = s.draft.offers[id];
    if (!offer || s.roleOf[id]) return null;
    const handBig = s.hand[id].length >= 3;
    const pref = handBig && offer.includes(7) ? 7 : offer.find((r) => ROLES[r].color && s.city[id].some((u) => DISTRICT[s.cards[u]].color === ROLES[r].color));
    return {action: 'draft', role: pref || pick(offer, rng)};
  }
  if (s.phase !== 'call' || !s.turn || !s.turn.actors.includes(id) || s.turn.done[id]) return null;
  const step = s.turn.step[id];
  if (step === 'income') {
    const affordable = s.hand[id].some((u) => DISTRICT[s.cards[u]].cost <= s.gold[id] + 2);
    return {action: affordable || !s.deck.length ? 'gold' : 'cards'};
  }
  if (step === 'keep') {
    const drawn = s.turn.drawn[id];
    const best = [...drawn].sort((a, b) => DISTRICT[s.cards[b]].cost - DISTRICT[s.cards[a]].cost)[0];
    return {action: 'keep', uid: best};
  }
  const r = s.roleOf[id];
  if (!s.turn.used[id]) {
    if (r === 1 || r === 2) return {action: 'name', role: pick(nameableRoles(s, id), rng)};
    if (r === 3) {
      const richest = s.seats.filter((o) => o !== id).sort((a, b) => s.hand[b].length - s.hand[a].length)[0];
      if (richest && s.hand[richest].length > s.hand[id].length + 1) return {action: 'swapHand', target: richest};
    }
    if (r === 8 && rng() < 0.3) {
      const targets = pashaTargets(s, id);
      if (targets.length) return {action: 'destroy', uid: targets.sort((a, b) => a.price - b.price)[0].uid};
    }
  }
  const buildable = s.hand[id].filter((u) => canBuild(s, id, u)).sort((a, b) => DISTRICT[s.cards[b]].cost - DISTRICT[s.cards[a]].cost);
  if (buildable.length) return {action: 'build', uid: buildable[0]};
  return {action: 'end'};
}

// ------------------------------------------------------------------ module

const sultan = {
  id: 'sultan',
  emoji: '🕌',
  title: {en: 'City of the Sultan', zh: '苏丹之城'},
  blurb: {
    en: 'Draft a secret role each day, collect gold and build the finest quarter of the Sultan’s city.',
    zh: '每天秘密挑选角色，收集金币，为苏丹建造最华美的城区。',
  },
  howTo: {
    en: [
      'Every day each player secretly picks a role. The crown holder picks first.',
      'The herald then calls the roles 1 → 8. When yours is called, take your turn on your phone.',
      'Your turn: take 2 gold or draw 2 cards and keep 1, use your role’s ability, then build a district you can afford.',
      'No two identical buildings in one city. Royal, scholarly, trade and military roles earn gold for buildings of their colour.',
      'When a city reaches the goal, the day finishes and the game ends. Score = building costs + bonuses (all 5 colours, first to finish).',
    ],
    zh: [
      '每天每人秘密挑选一个角色，持有王冠的人先选。',
      '传令官按 1 → 8 传召角色，轮到你的角色时在手机上进行回合。',
      '你的回合：拿 2 金币或抽 2 留 1，使用角色技能，再建造一座付得起的建筑。',
      '同一座城里不能有两座相同的建筑。王室、学术、商贸、军事角色会为同色建筑拿金币。',
      '有一座城达到目标后，这一天结束游戏就结束。得分 = 建筑费用 + 奖励（五色齐全、最先完成）。',
    ],
  },
  reference(lang) {
    return Object.keys(ROLES).map((r) => ({emoji: ROLES[r].emoji, tint: ROLES[r].tint, title: roleName(r, lang), text: ABILITY[r]}));
  },
  inspiredBy: 'Citadels',
  players: {min: 2, max: 16},
  minutes: 35,
  coverTint: '#f4a62a',
  themeClass: shell.themeSultan,
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupSultan(seats, ctx);
  },

  input(s, g, id, msg, ctx) {
    if (msg.action === 'draft') return draftPick(s, ctx, id, Number(msg.role));
    return turnAction(s, ctx, id, msg);
  },

  tick(s, g, ctx) {
    return Boolean(timeout(s, ctx));
  },

  /** The phone view plus `urgent` (this phone must act now), which drives the banner and buzz. */
  view(s, g, id, ctx) {
    const v = this.baseView(s, g, id, ctx);
    return {...v, urgent: v.kind === 'draft' || v.kind === 'turn'};
  },

  baseView(s, g, id) {
    const players = s.seats.map((p) => ({
      id: p,
      name: g.players[p] ? g.players[p].name : '?',
      avatar: g.players[p] && g.players[p].avatar,
      color: g.players[p] && g.players[p].color,
      hand: s.hand[p].length,
      city: s.city[p].map((u) => s.cards[u]),
    }));
    const t = s.turn;
    const acting = s.phase === 'call' && t && t.actors.includes(id) && !t.done[id];
    let task = 'wait';
    if (s.over) task = 'over';
    else if (s.phase === 'draft' && s.draft.offers[id] && !s.roleOf[id]) task = 'draft';
    else if (acting) task = 'turn';
    return {
      task: `${task}-${s.round}-${s.phase}-${s.calling || 0}-${acting ? t.step[id] : ''}`,
      kind: task,
      round: s.round,
      goal: s.scale.goal,
      role: s.roleOf[id] || null,
      calling: s.phase === 'call' && t ? t.role : null,
      callingWho: s.phase === 'call' && t ? t.actors.map((a) => (g.players[a] ? g.players[a].name : '?')) : [],
      turnDone: s.phase === 'call' && Boolean(s.roleOf[id]) && (s.calling > s.roleOf[id] || Boolean(t && t.done[id])),
      crown: s.crown === id,
      gold: s.gold[id],
      hand: s.hand[id].map((u) => ({uid: u, key: s.cards[u], ok: acting && t.step[id] === 'main' && canBuild(s, id, u)})),
      city: s.city[id].map((u) => s.cards[u]),
      offers: task === 'draft' ? s.draft.offers[id] : null,
      step: acting ? t.step[id] : null,
      drawn: acting && t.step[id] === 'keep' ? t.drawn[id].map((u) => ({uid: u, key: s.cards[u]})) : null,
      buildLeft: acting ? (s.roleOf[id] === 7 ? 3 : 1) - (t.built[id] || 0) : 0,
      used: acting ? Boolean(t.used[id]) : false,
      nameable: acting ? nameableRoles(s, id) : [],
      pasha: acting && s.roleOf[id] === 8 ? pashaTargets(s, id).map((x) => ({...x, key: s.cards[x.uid], ownerName: players.find((p) => p.id === x.owner).name})) : [],
      players,
      me: id,
      score: s.scores ? s.scores[id] : null,
      winner: s.winner || null,
    };
  },

  bot: botMove,

  HostView({g, state: s, lang}) {
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const t = s.turn;
    const acting = (id) => s.phase === 'call' && t && t.actors.includes(id) && !t.done[id];
    const recent = (s.log || []).slice(-5).reverse();
    return (
      <SeatRing
        g={g}
        ids={s.seats}
        highlight={(id) => (s.phase === 'draft' ? s.draft.wave.includes(id) && !s.roleOf[id] : acting(id))}
        badge={(id) => (
          <>
            {s.crown === id && <span>👑</span>}
            <span className={styles.stat}>💰{s.gold[id]}</span>
            <span className={styles.stat}>🃏{s.hand[id].length}</span>
            <span className={styles.cityRow}>
              {s.city[id].map((u) => (
                <span key={u} className={styles.block} style={{background: COLORS[DISTRICT[s.cards[u]].color].tint}} title={L(DISTRICT[s.cards[u]], lang)} />
              ))}
            </span>
            {s.over && <b className={styles.stat}>{tg(lang, 'points', {n: s.scores[id]})}</b>}
          </>
        )}>
        {s.over ? (
          <div className={styles.final}>
            <div className={shell.bigText}>🏆 {name(s.winner)}</div>
            <table className={shell.scoreTable}>
              <tbody>
                {[...s.seats]
                  .sort((a, b) => s.scores[b] - s.scores[a])
                  .slice(0, 8)
                  .map((id, i) => (
                    <tr key={id}>
                      <td>{i + 1}</td>
                      <td>
                        <Avatar avatar={g.players[id]?.avatar} color={g.players[id]?.color} size="xs" /> {name(id)}
                      </td>
                      <td>
                        <b>{s.scores[id]}</b>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <p className={shell.kicker}>
              {tg(lang, 'round', {n: s.round})} · {tg(lang, 'goal', {n: s.scale.goal})}
            </p>
            {s.lastRound && <p className={styles.last}>⏳ {tg(lang, 'lastRound')}</p>}
            {s.phase === 'draft' && (
              <>
                <div className={shell.bigText}>{tg(lang, 'drafting')}</div>
                <div className={shell.chipRow}>
                  {s.draft.wave.map((id) => (
                    <span key={id} className={shell.chip}>
                      {name(id)} {s.roleOf[id] ? '✓' : '…'}
                    </span>
                  ))}
                </div>
              </>
            )}
            {s.phase === 'call' && t && (
              <div className={styles.calling}>
                <RoleCard r={t.role} lang={lang} size={110} />
                <div>
                  <div className={shell.bigText}>
                    {tg(lang, 'calling')}
                    {L(ROLES[t.role], lang)}
                  </div>
                  {t.empty && <p>{tg(lang, 'noAnswer')}</p>}
                  {t.slain && <p>🗡️ {tg(lang, 'slain')}</p>}
                  <div className={shell.chipRow} style={{justifyContent: 'flex-start'}}>
                    {t.actors.map((id) => (
                      <span key={id} className={shell.chip}>
                        {name(id)} {t.done[id] ? '✓' : '…'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <ul className={`${shell.logList} ${styles.log}`}>
              {recent.map((e, i) => (
                <li key={i}>
                  {name(e.actor)}
                  {e.kind === 'built' && ` 🏗️ ${L(DISTRICT[e.card], lang)}`}
                  {e.kind === 'destroyed' && ` ⚔️ ${name(e.target)} · ${L(DISTRICT[e.card], lang)}`}
                  {e.kind === 'robbed' && ` 🦊 +${e.n}`}
                  {e.kind === 'swap' && ` 🔭 ⇄ ${name(e.target)}`}
                  {e.kind === 'named' && ` → ${L(ROLES[e.role], lang)}`}
                  {e.kind === 'slain' && ` 🗡️ ${L(ROLES[e.role], lang)}`}
                </li>
              ))}
            </ul>
          </>
        )}
      </SeatRing>
    );
  },

  PhoneView({view, lang, send}) {
    return <SultanPhone view={view} lang={lang} send={send} />;
  },
};

function SultanPhone({view, lang, send}) {
  const status = (
    <div className={shell.card}>
      <p className={shell.kicker}>
        {tg(lang, 'round', {n: view.round})} · 💰 {tg(lang, 'gold', {n: view.gold})} {view.crown && '· 👑'}
      </p>
      {view.role && <p>{tg(lang, 'yourRole', {role: L(ROLES[view.role], lang)})}</p>}
      <p className={shell.kicker}>{tg(lang, 'city')} ({view.city.length}/{view.goal})</p>
      <div className={styles.cards}>
        {view.city.map((k, i) => (
          <DistrictCard key={i} k={k} lang={lang} size={44} />
        ))}
      </div>
    </div>
  );
  const hand = (buildable) => (
    <div className={shell.card}>
      <p className={shell.kicker}>{tg(lang, 'hand')}</p>
      <div className={styles.cards}>
        {view.hand.map((c) =>
          buildable ? (
            <button key={c.uid} type="button" className={styles.cardButton} disabled={!c.ok} onClick={() => send({action: 'build', uid: c.uid})}>
              <DistrictCard k={c.key} lang={lang} size={64} />
            </button>
          ) : (
            <DistrictCard key={c.uid} k={c.key} lang={lang} size={52} />
          ),
        )}
      </div>
    </div>
  );

  if (view.kind === 'over') {
    return (
      <>
        <div className={`${shell.card} ${shell.bigText}`}>{tg(lang, 'points', {n: view.score})}</div>
        {status}
      </>
    );
  }
  if (view.kind === 'draft') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'pickRole')}</p>
        <div className={styles.cards}>
          {view.offers.map((r) => (
            <button key={r} type="button" className={`${styles.cardButton} ${styles.draftOption}`} onClick={() => send({action: 'draft', role: r})}>
              <RoleCard r={r} lang={lang} size={72} />
              <span className={styles.abilityText}>{L(ABILITY[r], lang)}</span>
            </button>
          ))}
        </div>
        {hand(false)}
      </>
    );
  }
  if (view.kind === 'turn') {
    if (view.step === 'income') {
      return (
        <>
          <p className={shell.bigText}>
            {tg(lang, 'yourTurn')} {tg(lang, 'income')}
          </p>
          <div className={shell.choiceGrid}>
            <button type="button" className="button button--lg" onClick={() => send({action: 'gold'})}>
              {tg(lang, 'takeGold')}
            </button>
            <button type="button" className="button button--lg" onClick={() => send({action: 'cards'})}>
              {tg(lang, 'takeCards')}
            </button>
          </div>
          {status}
          {hand(false)}
        </>
      );
    }
    if (view.step === 'keep') {
      return (
        <>
          <p className={shell.bigText}>{tg(lang, 'keepOne')}</p>
          <div className={styles.cards}>
            {view.drawn.map((c) => (
              <button key={c.uid} type="button" className={styles.cardButton} onClick={() => send({action: 'keep', uid: c.uid})}>
                <DistrictCard k={c.key} lang={lang} size={84} />
              </button>
            ))}
          </div>
        </>
      );
    }
    const r = view.role;
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'yourTurn')}</p>
        <p className={shell.notice}>
          {ROLES[r].emoji} {L(ROLES[r], lang)}: {L(ABILITY[r], lang)}
        </p>
        {!view.used && (r === 1 || r === 2) && (
          <div className={shell.card}>
            <b>{tg(lang, 'nameRole')}</b>
            <p className={shell.muted}>{tg(lang, r === 1 ? 'bladeHint' : 'thiefHint')}</p>
            <div className={shell.choiceGrid}>
              {view.nameable.map((x) => (
                <button key={x} type="button" className="button button--sm" onClick={() => send({action: 'name', role: x})}>
                  {ROLES[x].emoji} {roleName(x, lang)}
                </button>
              ))}
            </div>
          </div>
        )}
        {!view.used && r === 3 && (
          <div className={shell.card}>
            <b>{tg(lang, 'swapWith')}</b>
            <div className={shell.choiceGrid}>
              {view.players
                .filter((p) => p.id !== view.me)
                .map((p) => (
                  <button key={p.id} type="button" className="button button--sm" onClick={() => send({action: 'swapHand', target: p.id})}>
                    <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name} · 🃏{p.hand}
                  </button>
                ))}
            </div>
            <button type="button" className="button button--sm button--secondary" style={{marginTop: '0.5rem'}} onClick={() => send({action: 'redraw'})}>
              {tg(lang, 'redraw')}
            </button>
          </div>
        )}
        {!view.used && r === 8 && view.pasha.length > 0 && (
          <div className={shell.card}>
            <b>{tg(lang, 'destroy')}</b>
            <div className={shell.choiceGrid}>
              {view.pasha.map((x) => (
                <button key={x.uid} type="button" className="button button--sm" onClick={() => send({action: 'destroy', uid: x.uid})}>
                  {x.ownerName}: {L(DISTRICT[x.key], lang)} (💰{x.price})
                </button>
              ))}
            </div>
          </div>
        )}
        <p className={shell.kicker}>{tg(lang, 'build', {n: view.buildLeft})}</p>
        {hand(true)}
        <button type="button" className="button button--lg button--block" onClick={() => send({action: 'end'})}>
          {tg(lang, 'endTurn')}
        </button>
        {status}
      </>
    );
  }
  return (
    <>
      <p className={shell.waiting}>{view.turnDone ? tg(lang, 'turnDone') : view.role ? tg(lang, 'nobodyCalled') : tg(lang, 'waitDraft')}</p>
      {view.calling && (
        <div className={shell.card}>
          {tg(lang, 'calling')}
          <b>
            {ROLES[view.calling].emoji} {L(ROLES[view.calling], lang)}
          </b>
          {view.callingWho.length > 0 ? ` · ${view.callingWho.join(', ')}` : ` · ${tg(lang, 'noAnswer')}`}
        </div>
      )}
      {status}
      {hand(false)}
    </>
  );
}

export default sultan;
