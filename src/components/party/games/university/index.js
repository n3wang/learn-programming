import React, {useEffect, useRef, useState} from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import Sprite from '../../core/Sprite';
import MathPad, {PoolPicker} from '../../core/MathPad';
import {checkAnswer, makeQuestion} from '../../core/mathQuestions';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {MAX_NIGHT_CASTS, MAX_SPELLS, ROLES, ROOMS, SPELLS} from './data';
import {
  activeRooms,
  alive,
  buy,
  canLearn,
  canVoteYes,
  cast,
  castVote,
  counts,
  cultOf,
  freeUses,
  homework,
  hostEndDay,
  isEvil,
  markReady,
  moveTo,
  nominate,
  roleAct,
  roleTargets,
  setLock,
  setupUniversity,
  spellTargets,
  timeout,
} from './rules';
import shell from '../../core/party.module.css';
import styles from './university.module.css';

const SIDE_TINT = {good: '#4aa8ff', evil: '#8e0e1f'};

const tu = makeT({
  en: {
    holdRole: 'Hold to see your role',
    ready: 'I’ve seen it',
    yourCult: 'Your Cult',
    night: 'Night {n}',
    day: 'Day {n}',
    homework: 'Homework',
    knowledge: 'Knowledge',
    cost: '{n} Knowledge',
    lockedTag: 'Locked',
    correct: '{n} correct tonight',
    hwHelp: 'Every correct answer earns 1 Knowledge.',
    ok: 'OK',
    panel: 'Spells & actions',
    closePanel: 'Back to homework',
    roleAction: 'Your role tonight',
    noRole: 'Your role has no night action. Keep studying!',
    chosen: 'Chosen: {name}',
    tonight: 'Set for tonight (locked)',
    castTonight: 'Cast tonight',
    maxCasts: 'You can cast at most {n} spells a night.',
    noSpells: 'No spells yet. Buy them in the morning shop.',
    pickTarget: 'Choose a target:',
    cancel: 'Cancel',
    campus: 'Campus',
    youAreIn: 'You are in: {room}',
    moveHere: 'Move',
    lockKey: 'Lock my room tonight (one key per game)',
    keyUsed: 'Your key is used.',
    lockOn: 'Locked tonight',
    shop: 'Spell shop',
    buy: 'Buy',
    owned: 'Owned',
    mySpells: 'My spells',
    usesLeft: '{n} left',
    usesAll: 'unlimited',
    passiveOn: 'always on',
    castNow: 'Cast',
    setTonight: 'Set for tonight',
    spellsHeld: '{n}/{max} spells learned',
    learnedToday: 'You learned a spell this round. Come back tomorrow.',
    learnedAll: 'You have learned all {max} spells you may this game.',
    news: 'What you learned',
    nominate: 'Nominate a player',
    nominated: 'You already nominated today.',
    voteQ: 'Expel {name}?',
    yes: 'Yes',
    no: 'No',
    voted: 'Vote cast.',
    hushed: 'You are hushed: you can’t vote on this one.',
    ghostHas: 'You have one ghost vote left.',
    ghostSpent: 'You used your ghost vote.',
    defense: '{name} is nominated by {by}. Speak in your defense!',
    onBlock: 'Facing expulsion: {name} ({n} votes)',
    tieBlock: 'Tied: nobody faces expulsion.',
    needVotes: 'Needs {n} votes to expel',
    expelled: '{name} is expelled.',
    noExpel: 'Nobody is expelled today.',
    endDay: 'End the day ▶',
    dawn: 'Dawn',
    slainTonight: 'Slain tonight:',
    peaceful: 'Nobody was slain.',
    dead: 'You were removed from the game. You may still talk, and vote once more.',
    goodWin: 'The university is saved!',
    evilWin: 'The Cult takes the university!',
    why_leadersOut: 'Every Cult Leader is gone.',
    why_cultOut: 'Every Cultist is gone.',
    why_parity: 'The Cult is now at least half of the campus.',
    roles: 'Roles',
    now_roles: 'Now: hold the card to read your role, then tap “I’ve seen it”.',
    now_night: 'Now: do your homework. Open “Spells & actions” to act or cast.',
    now_day: 'Now: talk, move rooms, buy spells, nominate and vote.',
    now_vote: 'Now: vote. Yes = expel this player.',
    now_defense: 'Now: listen to the defense. Voting opens next.',
    info_prof: '{name} is {align}.',
    info_cult: '{name} {isProf}.',
    isProf: 'IS a Professor',
    notProf: 'is not a Professor',
    info_reveal: 'Reveal Light: {name} is {align}.',
    info_gone: 'Reveal Light: {name} was not in your room.',
    info_lantern: 'Lantern Count: {n} evil in {room}.',
    info_flower: 'Flower Watch: a Cult Leader {answer} vote yes yesterday.',
    did: 'DID',
    didNot: 'did not',
    info_secondwind: 'Second Wind saved you from being slain!',
    info_gifted: '{name} gave you {n} Knowledge.',
    good: 'good',
    evil: 'evil',
    nightSeconds: 'Night length',
    dayMinutes: 'Day length',
    tables: 'Homework questions',
    sec: '{n} s',
    min: '{n} min',
    setupLine: '{n} players: {leader} Cult Leaders, {cultist} Cultists, {professor} Professors, {exchange} Exchange Students, {student} Students',
    hostNight: 'Night: everyone does homework. Spells and actions happen in secret.',
    lock: 'locked',
  },
  zh: {
    holdRole: '按住查看你的角色',
    ready: '我看好了',
    yourCult: '你的邪教同伴',
    night: '第 {n} 夜',
    day: '第 {n} 天',
    homework: '作业',
    knowledge: '知识',
    cost: '{n} 知识',
    lockedTag: '已上锁',
    correct: '今晚答对 {n} 题',
    hwHelp: '每答对一题获得 1 点知识。',
    ok: '确定',
    panel: '咒语与行动',
    closePanel: '回到作业',
    roleAction: '你今晚的角色行动',
    noRole: '你的角色夜晚没有行动。继续学习吧！',
    chosen: '已选择：{name}',
    tonight: '今晚已设定（已锁定）',
    castTonight: '今晚施放',
    maxCasts: '每晚最多施放 {n} 个咒语。',
    noSpells: '还没有咒语。早上到商店购买。',
    pickTarget: '选择目标：',
    cancel: '取消',
    campus: '校园',
    youAreIn: '你在：{room}',
    moveHere: '移动',
    lockKey: '今晚锁上我的房间（每局一把钥匙）',
    keyUsed: '你的钥匙已经用掉了。',
    lockOn: '今晚上锁',
    shop: '咒语商店',
    buy: '购买',
    owned: '已拥有',
    mySpells: '我的咒语',
    usesLeft: '剩 {n} 次',
    usesAll: '无限次',
    passiveOn: '一直生效',
    castNow: '施放',
    setTonight: '设定为今晚',
    spellsHeld: '已学 {n}/{max} 个咒语',
    learnedToday: '这一轮你已经学过一个咒语了，明天再来。',
    learnedAll: '本局你已经学满 {max} 个咒语。',
    news: '你得知的信息',
    nominate: '提名一名玩家',
    nominated: '你今天已经提名过了。',
    voteQ: '开除 {name} 吗？',
    yes: '赞成',
    no: '反对',
    voted: '已投票。',
    hushed: '你被噤声了：这次不能投票。',
    ghostHas: '你还有一张幽灵票。',
    ghostSpent: '你的幽灵票已经用掉了。',
    defense: '{by} 提名了 {name}。请为自己辩护！',
    onBlock: '即将被开除：{name}（{n} 票）',
    tieBlock: '平票：没有人会被开除。',
    needVotes: '需要 {n} 票才能开除',
    expelled: '{name} 被开除了。',
    noExpel: '今天没有人被开除。',
    endDay: '结束白天 ▶',
    dawn: '天亮了',
    slainTonight: '昨夜被击倒：',
    peaceful: '昨夜无人被击倒。',
    dead: '你已出局。你仍然可以发言，还能再投一票。',
    goodWin: '大学得救了！',
    evilWin: '邪教占领了大学！',
    why_leadersOut: '所有邪教首领都出局了。',
    why_cultOut: '所有邪教徒都出局了。',
    why_parity: '邪教已占校园人数的一半或更多。',
    roles: '角色',
    now_roles: '现在：按住卡片查看角色，然后点“我看好了”。',
    now_night: '现在：做作业。打开“咒语与行动”来行动或施法。',
    now_day: '现在：讨论、换房间、买咒语、提名和投票。',
    now_vote: '现在：投票。赞成 = 开除这名玩家。',
    now_defense: '现在：听被提名者辩护，接下来投票。',
    info_prof: '{name} 是{align}的。',
    info_cult: '{name}{isProf}。',
    isProf: '是教授',
    notProf: '不是教授',
    info_reveal: '显形之光：{name} 是{align}的。',
    info_gone: '显形之光：{name} 不在你的房间。',
    info_lantern: '灯笼计数：{room} 里有 {n} 名邪恶玩家。',
    info_flower: '花之守望：昨天邪教首领{answer}投赞成票。',
    did: '有',
    didNot: '没有',
    info_secondwind: '回气救了你，你没有被击倒！',
    info_gifted: '{name} 送给你 {n} 点知识。',
    good: '善良',
    evil: '邪恶',
    nightSeconds: '夜晚时长',
    dayMinutes: '白天时长',
    tables: '作业题型',
    sec: '{n} 秒',
    min: '{n} 分钟',
    setupLine: '{n} 名玩家：{leader} 邪教首领、{cultist} 邪教徒、{professor} 教授、{exchange} 交换生、{student} 学生',
    hostNight: '夜晚：所有人做作业。咒语和行动都在秘密进行。',
    lock: '已上锁',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to Clocktower University. Study hard… and trust no one.', zh: '欢迎来到钟楼大学。好好学习……谁也别信。'},
  dusk: {en: 'Night falls. Everyone, open your homework.', zh: '夜幕降临。所有人，打开你的作业。'},
  slain: {en: '{seat} was slain in the night.', zh: '{seat}在夜里被击倒了。'},
  peaceful: {en: 'Morning comes. Nobody was slain.', zh: '天亮了。昨夜无人被击倒。'},
  day: {en: 'The shop is open. Talk, move, and vote.', zh: '商店开门了。讨论、移动、投票吧。'},
  nominate: {en: '{seat} is nominated. Speak in your defense.', zh: '{seat}被提名了。请为自己辩护。'},
  vote: {en: 'Raise your hands… now.', zh: '举起你的手……现在。'},
  expelled: {en: '{seat} is expelled from the university.', zh: '{seat}被开除出大学。'},
  no_expel: {en: 'Today, no one is expelled.', zh: '今天没有人被开除。'},
  win_good: {en: 'The Cult is gone. Classes can continue.', zh: '邪教消失了，课程可以继续了。'},
  win_evil: {en: 'The Cult rules the campus now.', zh: '邪教现在统治了校园。'},
};

const roomName = (r, lang) => (ROOMS[r] ? L(ROOMS[r], lang) : '?');

/** A room's floor plan. */
function RoomPlan({r, size = 40}) {
  return <Sprite path={ROOMS[r].art} emoji="" label="" tint="#fbf3df" shape="icon" size={`${size}px`} />;
}

function RoleToken({role, lang, size = 72}) {
  const r = ROLES[role];
  return r.art ? <Sprite path={r.art} emoji={r.emoji} label={L(r, lang)} tint={SIDE_TINT[r.side]} size={`${size}px`} shape="token" /> : <span className={styles.bigEmoji} style={{fontSize: size * 0.7}} aria-hidden="true">{r.emoji}</span>;
}

/** A spell's Clocktower icon (falls back to its emoji until the image loads). */
function SpellIcon({k, lang, size = 34}) {
  const sp = SPELLS[k];
  return <Sprite path={sp.art} emoji={sp.emoji} label={L(sp, lang)} tint="#ffe566" size={`${size}px`} shape="token" />;
}

// ------------------------------------------------------------------ bots

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  if (s.phase === 'roles' && !s.ready[id]) return {action: 'ready'};
  if (s.dead[id] && s.phase !== 'vote') return null;
  if (s.phase === 'night') {
    const t = roleTargets(s, id).filter((p) => (s.role[id] === 'leader' ? !isEvil(s, p) : true));
    if (t.length && !s.roleTarget[id]) return {action: 'act', target: pick(t, rng)};
    if (rng() < 0.5) return {action: 'hw', total: (s.hw[id] || 0) + 1};
    return null;
  }
  if (s.phase === 'day' || s.phase === 'dawn') {
    if (rng() < 0.04) {
      const k = pick(Object.keys(SPELLS), rng);
      if (canLearn(s, id) && s.knowledge[id] >= SPELLS[k].cost && !s.spells[id].some((h) => h.k === k)) return {action: 'buy', spell: k};
    }
    if (rng() < 0.03 && s.spells[id].length) {
      const h = pick(s.spells[id], rng);
      if (SPELLS[h.k].type === 'night') {
        const tg = spellTargets(s, id, h.k);
        return {action: 'cast', spell: h.k, target: tg.length ? pick(tg, rng) : undefined};
      }
    }
    if (s.phase === 'day' && rng() < 0.02) return {action: 'move', room: pick(activeRooms(s), rng)};
    if (s.phase === 'day' && !s.nominators[id] && Object.keys(s.nominated).length < Math.max(3, s.seats.length / 6) && rng() < 0.01) {
      const options = alive(s).filter((p) => p !== id && !s.nominated[p]);
      if (options.length) return {action: 'nominate', target: pick(options, rng)};
    }
  }
  if (s.phase === 'vote' && s.vote.votes[id] == null) {
    const yes = isEvil(s, id) ? !isEvil(s, s.vote.nominee) && rng() < 0.6 : rng() < 0.4;
    return {action: 'vote', yes: yes && (!s.dead[id] || rng() < 0.3)};
  }
  return null;
}

// ------------------------------------------------------------------ rulebook

const RULEBOOK = {
  en: [
    {title: 'The goal', items: ['Good (Students, Exchange Students, Professors) wins when every Cult Leader is expelled or slain. With no Cult Leader in the game, every Cultist must go.', 'The Cult wins when it is at least half of the players still in the game.']},
    {title: 'A night', items: ['Everyone does homework: every correct answer earns 1 Knowledge.', 'Open “Spells & actions” to use your role or cast spells you prepared. Everyone has that button, so nobody can tell who acts.', 'Professors learn if a player is good or evil. Cultists learn if a player is a Professor. Cult Leaders slay one player (not on night 1).']},
    {title: 'A day', items: ['Talk, move to another room, buy spells in the shop, cast day spells.', 'Anyone may nominate once a day. The player with the most votes (at least half of the living) is expelled at the end of the day. A tie expels nobody.']},
    {title: 'Rooms and locks', items: ['Where you sleep matters: “in your room” spells only reach people in the same room.', 'Each player has one key per game. A locked room keeps out a Cult Leader who sleeps somewhere else.']},
    {title: 'Spells', items: ['Anyone can buy any spell, in secret: at most 1 per round and 3 in the whole game. Cast at most 2 a night.', 'Night spells can be set up by day or cast at night; once set, they can’t change.', 'Exchange Students earn double Knowledge but look evil to Professors and spells.']},
  ],
  zh: [
    {title: '目标', items: ['善良阵营（学生、交换生、教授）在所有邪教首领被开除或击倒时获胜。如果本局没有邪教首领，则需要所有邪教徒出局。', '邪教人数达到场上剩余玩家的一半或更多时，邪教获胜。']},
    {title: '夜晚', items: ['所有人做作业：每答对一题获得 1 点知识。', '打开“咒语与行动”来使用角色能力或施放准备好的咒语。每个人都有这个按钮，所以没人知道谁在行动。', '教授得知一名玩家是善良还是邪恶。邪教徒得知一名玩家是否是教授。邪教首领击倒一名玩家（首夜除外）。']},
    {title: '白天', items: ['讨论、换到别的房间、在商店购买咒语、施放白天咒语。', '每人每天可提名一次。票数最多（至少达到存活人数一半）的玩家在白天结束时被开除，平票则无人被开除。']},
    {title: '房间与锁', items: ['你睡在哪里很重要：“你房间里”的咒语只能影响同一房间的人。', '每名玩家每局有一把钥匙。上锁的房间能挡住睡在别处的邪教首领。']},
    {title: '咒语', items: ['任何人都可以秘密购买任何咒语：每轮最多 1 个，整局最多 3 个。每晚最多施放 2 个。', '夜晚咒语可以在白天设定，也可以在夜里施放；设定后不能更改。', '交换生获得双倍知识，但在教授和咒语眼中是邪恶的。']},
  ],
};

// ------------------------------------------------------------------ module

const university = {
  id: 'university',
  logo: 'university.webp',
  title: {en: 'Clocktower University', zh: '钟楼大学'},
  blurb: {
    en: 'A Cult hides on campus. Do homework at night to earn Knowledge, buy secret spells, move between rooms, and expel the Cult. 5–64 players.',
    zh: '邪教藏在校园里。夜里做作业赚知识，购买秘密咒语，在房间之间移动，把邪教开除出去。5–64 人。',
  },
  howTo: {
    en: [
      'Hold your phone to see your role. Good must expel the Cult Leaders; the Cult knows each other.',
      'Night: everyone does math homework to earn Knowledge. Use “Spells & actions” to act in secret.',
      'Day: move between campus rooms, buy spells, talk, nominate and vote.',
      'The most-voted player (at least half the living) is expelled at the end of the day.',
    ],
    zh: [
      '按住手机查看你的角色。善良阵营要开除邪教首领；邪教成员互相认识。',
      '夜晚：所有人做数学作业赚取知识。用“咒语与行动”秘密行动。',
      '白天：在校园房间之间移动、购买咒语、讨论、提名和投票。',
      '票数最多（至少达到存活人数一半）的玩家在白天结束时被开除。',
    ],
  },
  rulebook(lang) {
    return RULEBOOK[lang] || RULEBOOK.en;
  },
  reference(lang) {
    const roles = Object.entries(ROLES).map(([k, r]) => ({group: L({en: 'Roles', zh: '角色'}, lang), emoji: <RoleToken role={k} lang={lang} size={26} />, tint: SIDE_TINT[r.side], title: L(r, lang), tag: L({en: r.side === 'good' ? 'Good' : 'Evil', zh: r.side === 'good' ? '善良' : '邪恶'}, lang), text: r.ab, more: r.tip, key: k}));
    const spells = Object.entries(SPELLS).map(([k, sp]) => ({group: L({en: 'Starter spells', zh: '初始咒语'}, lang), emoji: <SpellIcon k={k} lang={lang} size={30} />, tint: '#ffe566', title: `${L(sp, lang)} · ${tu(lang, 'cost', {n: sp.cost})}`, tag: sp.type, text: sp.ab}));
    return [...roles, ...spells];
  },
  inspiredBy: 'Blood on the Clocktower (The Pandemonium Institute)',
  players: {min: 5, max: 64},
  minutes: 40,
  coverTint: '#2e5a3a',
  themeClass: shell.themeUni,
  night: (x) => x.phase === 'night',
  defaultSettings: {dayMinutes: 4, nightSeconds: 60, pools: ['basic']},
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupUniversity(seats, g.settings, ctx);
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'ready':
        return markReady(s, ctx, id);
      case 'hw':
        return homework(s, ctx, id, msg.total);
      case 'act':
        return roleAct(s, ctx, id, msg.target);
      case 'buy':
        return buy(s, ctx, id, msg.spell);
      case 'cast':
        return cast(s, ctx, id, msg.spell, msg.target);
      case 'move':
        return moveTo(s, ctx, id, msg.room);
      case 'lock':
        return setLock(s, ctx, id, msg.on);
      case 'nominate':
        return nominate(s, ctx, id, msg.target);
      case 'vote':
        return castVote(s, ctx, id, Boolean(msg.yes));
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
    const player = (p) => ({id: p, name: g.players[p] ? g.players[p].name : '?', seat: g.players[p] ? g.players[p].seat : 0, avatar: g.players[p] && g.players[p].avatar, color: g.players[p] && g.players[p].color, dead: Boolean(s.dead[p])});
    let kind = s.phase;
    if (s.phase === 'roles' && s.ready[id]) kind = 'wait';
    if (s.phase === 'vote' && s.vote.votes[id] != null) kind = 'voted';
    const dayish = ['day', 'defense', 'vote', 'dawn'].includes(s.phase);
    const cult = cultOf(s, id);
    const v = {
      task: `${kind}-${s.night}-${s.day}`,
      kind,
      phase: s.phase,
      urgent: ['roles', 'vote'].includes(kind) || (s.phase === 'night' && roleTargets(s, id).length > 0 && !s.roleTarget[id]),
      role: s.role[id],
      night: s.night,
      day: s.day,
      dead: Boolean(s.dead[id]),
      ghost: s.dead[id] ? !s.ghost[id] : null,
      me: id,
      players: s.seats.map(player),
      cult: cult && cult.map((p) => ({...player(p), role: s.role[p]})),
      knowledge: s.knowledge[id],
      learned: (s.learned || {})[id] || 0,
      canLearn: canLearn(s, id),
      hw: s.hw[id] || 0,
      pools: s.pools,
      spells: s.spells[id].map((h) => ({k: h.k, left: h.left, free: Math.min(99, freeUses(s, id, h.k)), targets: SPELLS[h.k].type !== 'passive' ? spellTargets(s, id, h.k) : []})),
      queued: s.queued[id],
      castsLeft: Math.max(0, MAX_NIGHT_CASTS - s.queued[id].length),
      roleTargets: s.phase === 'night' ? roleTargets(s, id) : [],
      roleTarget: s.roleTarget[id] || null,
      room: s.room[id],
      rooms: activeRooms(s).map((r) => ({id: r, count: alive(s).filter((p) => s.room[p] === r).length})),
      key: s.key[id],
      lockTonight: Boolean(s.lockTonight[id]),
      canShop: dayish && !s.dead[id],
      info: (s.info[id] || []).slice(-12),
      winner: s.winner,
      winWhy: s.winWhy,
    };
    if (s.phase === 'day') {
      v.canNominate = !s.dead[id] && !s.nominators[id];
      v.nominees = alive(s)
        .filter((p) => p !== id && !s.nominated[p])
        .map(player);
    }
    if (s.vote) {
      v.nominee = player(s.vote.nominee);
      v.canYes = canVoteYes(s, id);
      v.hushed = Boolean(s.hush[id]);
      v.loudUsed = Boolean(s.vote.loud[id]);
    }
    if (s.over) v.roles = s.seats.map((p) => ({...player(p), role: s.role[p]}));
    return v;
  },

  bot: botMove,

  SettingsView({settings, set, lang, playerCount: n = 0}) {
    const radio = (key, value, label) => (
      <button key={String(value)} type="button" role="radio" aria-checked={settings[key] === value} className="button button--sm button--secondary" onClick={() => set({[key]: value})}>
        {label}
      </button>
    );
    const c = n >= 5 ? counts(n) : null;
    return (
      <>
        <div className={shell.buttonRow}>
          <span>{tu(lang, 'dayMinutes')}</span>
          {[2, 4, 6].map((m) => radio('dayMinutes', m, tu(lang, 'min', {n: m})))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tu(lang, 'nightSeconds')}</span>
          {[45, 60, 90].map((m) => radio('nightSeconds', m, tu(lang, 'sec', {n: m})))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tu(lang, 'tables')}</span>
          <PoolPicker value={settings.pools} onChange={(pools) => set({pools})} lang={lang} />
        </div>
        {c && <p className={shell.muted}>{tu(lang, 'setupLine', {n, ...c})}</p>}
      </>
    );
  },

  HostView({g, state: s, lang, hostAct}) {
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const need = Math.ceil(alive(s).length / 2);
    return (
      <div className={styles.host}>
        <div className={styles.banner}>
          {s.phase === 'roles' && <b>{tu(lang, 'holdRole')}</b>}
          {s.phase === 'night' && (
            <>
              <Sprite path="university-night.webp" emoji="" label="" tint="#1d2350" shape="icon" size="44px" /> <b>{tu(lang, 'night', {n: s.night})}</b> {tu(lang, 'hostNight')}
            </>
          )}
          {s.phase === 'dawn' && (
            <>
              <Sprite path="university-light.webp" emoji="" label="" tint="#fbf3df" shape="icon" size="44px" /> <b>{tu(lang, 'dawn')}</b> {s.deaths && s.deaths.length ? `${tu(lang, 'slainTonight')} ${s.deaths.map(name).join(', ')}` : tu(lang, 'peaceful')}
            </>
          )}
          {(s.phase === 'day' || s.phase === 'defense' || s.phase === 'vote') && (
            <>
              <b>{tu(lang, 'day', {n: s.day})}</b>
              {s.vote && <span className={styles.voteLine}>{s.phase === 'defense' ? tu(lang, 'defense', {name: name(s.vote.nominee), by: name(s.vote.nominator)}) : tu(lang, 'voteQ', {name: name(s.vote.nominee)})}</span>}
              <span>{tu(lang, 'needVotes', {n: need})}</span>
              {s.block && <span className={styles.block}>{s.block.id ? tu(lang, 'onBlock', {name: name(s.block.id), n: s.block.yes}) : tu(lang, 'tieBlock')}</span>}
              {s.phase === 'day' && (
                <button type="button" className="button button--sm button--secondary" onClick={() => hostAct({action: 'endDay'})}>
                  {tu(lang, 'endDay')}
                </button>
              )}
            </>
          )}
          {s.phase === 'execution' && <b>{s.expelled ? tu(lang, 'expelled', {name: name(s.expelled)}) : tu(lang, 'noExpel')}</b>}
          {s.over && (
            <b>
              {tu(lang, s.winner === 'good' ? 'goodWin' : 'evilWin')} <span className={shell.muted}>{tu(lang, `why_${s.winWhy}`)}</span>
            </b>
          )}
        </div>
        <div className={styles.map}>
          {activeRooms(s).filter((r) => ROOMS[r]).map((r) => {
            const here = s.seats.filter((p) => s.room[p] === r);
            const locked = Boolean(s.locks[r]) && s.phase === 'night';
            return (
              <div key={r} className={styles.room} data-locked={locked}>
                <span className={styles.roomHead}>
                  <RoomPlan r={r} size={64} />
                  <b>{L(ROOMS[r], lang)}</b>
                  {locked && <span className={styles.lockTag}>{tu(lang, 'lockedTag')}</span>}
                </span>
                <span className={styles.people}>
                  {here.map((p) => (
                    <span key={p} className={styles.person} data-dead={Boolean(s.dead[p])} title={name(p)}>
                      <Avatar avatar={g.players[p] && g.players[p].avatar} color={g.players[p] && g.players[p].color} size="xs" />
                      <small>{g.players[p] ? g.players[p].seat : ''}</small>
                      {s.over && <em className={styles.roleTag} data-evil={isEvil(s, p)}>{L(ROLES[s.role[p]], lang)}</em>}
                      {s.phase === 'vote' && s.vote.votes[p] != null && '✓'}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },

  PhoneView({view, lang, send}) {
    // Fresh state each night and each day, but not on every nomination or vote.
    return <UniPhone key={`${view.kind === 'night' ? 'night' : 'day'}-${view.night}`} view={view} lang={lang} send={send} />;
  },
};

// ------------------------------------------------------------------ phone

function InfoLine({x, view, lang}) {
  const nm = (id) => {
    const p = view.players.find((q) => q.id === id);
    return p ? `${p.name} (#${p.seat})` : '?';
  };
  return (
    <>
      {tu(lang, `info_${x.key}`, {
        name: nm(x.player),
        align: tu(lang, x.evil ? 'evil' : 'good'),
        isProf: tu(lang, x.yes ? 'isProf' : 'notProf'),
        answer: tu(lang, x.yes ? 'did' : 'didNot'),
        n: x.n,
        room: x.room ? roomName(x.room, lang) : '',
      })}
    </>
  );
}

/** Math homework (the pools picked in settings), checked on the phone; the running total goes to the big screen every few answers. */
function Homework({view, lang, send}) {
  const next = () => makeQuestion(view.pools, Math.random);
  const [q, setQ] = useState(next);
  const [total, setTotal] = useState(view.hw || 0);
  const [flash, setFlash] = useState(null);
  const sent = useRef(view.hw || 0);
  const latest = useRef(total);
  latest.current = total;
  useEffect(() => () => {
    if (latest.current > sent.current) send({action: 'hw', total: latest.current});
  }, []);
  const submit = (typed) => {
    const right = checkAnswer(q, typed);
    setFlash(right ? 'right' : 'wrong');
    setQ(next());
    if (right) {
      const t = total + 1;
      setTotal(t);
      if (t - sent.current >= 3) {
        sent.current = t;
        send({action: 'hw', total: t});
      }
    }
  };
  return (
    <div className={styles.homework}>
      <p className={styles.hwHead}>
        {tu(lang, 'homework')} · {tu(lang, 'correct', {n: total})} · {tu(lang, 'knowledge')} {view.knowledge + Math.max(0, total - (view.hw || 0)) * (view.role === 'exchange' ? 2 : 1)}
      </p>
      <MathPad question={q} lang={lang} onAnswer={submit} flash={flash} okLabel={tu(lang, 'ok')} />
      <p className={shell.muted}>{tu(lang, 'hwHelp')}</p>
    </div>
  );
}

function PlayerPick({ids, view, onPick, lang}) {
  return (
    <div className={shell.choiceGrid}>
      {ids.map((pid) => {
        const p = view.players.find((x) => x.id === pid);
        return (
          <button key={pid} type="button" className="button button--sm" onClick={() => onPick(pid)}>
            <Avatar avatar={p && p.avatar} color={p && p.color} size="xs" /> {p ? `${p.seat}. ${p.name}` : '?'}
          </button>
        );
      })}
    </div>
  );
}

/** My spells: cast day spells now, or set night spells for tonight. */
function SpellList({view, lang, send, night}) {
  const [aim, setAim] = useState(null);
  const nm = (id) => {
    const p = view.players.find((x) => x.id === id);
    return p ? p.name : ROOMS[id] ? roomName(id, lang) : '?';
  };
  if (!view.spells.length) return <p className={shell.muted}>{tu(lang, 'noSpells')}</p>;
  const usable = (h) => {
    const sp = SPELLS[h.k];
    if (sp.type === 'passive' || view.dead || h.free < 1) return false;
    if (sp.type === 'night') return view.castsLeft > 0 && (night || view.canShop);
    return !night && view.canShop && (h.k !== 'loud' || (view.kind === 'vote' && !view.loudUsed));
  };
  const go = (h, target) => {
    send({action: 'cast', spell: h.k, target});
    setAim(null);
  };
  return (
    <>
      <ul className={styles.spellList}>
        {view.spells.map((h) => {
          const sp = SPELLS[h.k];
          return (
            <li key={h.k}>
              <span>
                <SpellIcon k={h.k} lang={lang} /> <b>{L(sp, lang)}</b> <small>· {sp.type === 'passive' ? tu(lang, 'passiveOn') : h.left === 0 ? tu(lang, 'usesAll') : tu(lang, 'usesLeft', {n: h.free})}</small>
                <br />
                <small>{L(sp.ab, lang)}</small>
              </span>
              {usable(h) && (
                <button
                  type="button"
                  className="button button--sm"
                  onClick={() => (['player', 'roomPlayer', 'move'].includes(sp.range) ? setAim(h) : go(h))}>
                  {sp.type === 'night' ? (night ? tu(lang, 'castTonight') : tu(lang, 'setTonight')) : tu(lang, 'castNow')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {aim && (
        <div className={shell.card}>
          <p>
            <SpellIcon k={aim.k} lang={lang} /> {L(SPELLS[aim.k], lang)} · {tu(lang, 'pickTarget')}
          </p>
          {SPELLS[aim.k].range === 'move' ? (
            <div className={shell.choiceGrid}>
              {aim.targets.map((r) => (
                <button key={r} type="button" className="button button--sm" onClick={() => go(aim, r)}>
                  {roomName(r, lang)}
                </button>
              ))}
            </div>
          ) : (
            <PlayerPick ids={aim.targets} view={view} lang={lang} onPick={(t) => go(aim, t)} />
          )}
          <button type="button" className="button button--sm button--secondary" onClick={() => setAim(null)}>
            {tu(lang, 'cancel')}
          </button>
        </div>
      )}
      {view.queued.length > 0 && (
        <p className={styles.queued}>
          {tu(lang, 'tonight')}: {view.queued.map((q) => `${L(SPELLS[q.k], lang)}${q.target ? ` → ${nm(q.target)}` : ''}`).join(' · ')}
        </p>
      )}
      {view.castsLeft === 0 && <p className={shell.muted}>{tu(lang, 'maxCasts', {n: MAX_NIGHT_CASTS})}</p>}
    </>
  );
}

function UniPhone({view, lang, send}) {
  const [show, setShow] = useState(false);
  const [panel, setPanel] = useState(false);
  // Which day sections are open survives phase changes (a nomination shouldn't close your shop).
  const [open, setOpen] = useState({});
  const fold = (k) => ({open: Boolean(open[k]), onToggle: (e) => {
    const o = e.currentTarget.open;
    setOpen((x) => (x[k] === o ? x : {...x, [k]: o}));
  }});
  useEffect(() => {
    if (view.kind === 'vote') setOpen((x) => ({...x, spells: true}));
  }, [view.kind]);
  const r = ROLES[view.role];
  const nm = (id) => {
    const p = view.players.find((x) => x.id === id);
    return p ? p.name : '?';
  };

  const roleBox = (
    <div className={`${shell.card} ${styles.roleBox}`} onPointerDown={() => setShow(true)} onPointerUp={() => setShow(false)} onPointerLeave={() => setShow(false)} onContextMenu={(e) => e.preventDefault()}>
      {show ? (
        <>
          <RoleToken role={view.role} lang={lang} size={84} />
          <b className={styles.roleName} style={{'--side': SIDE_TINT[r.side]}}>
            {L(r, lang)} · {r.side === 'good' ? tu(lang, 'good') : tu(lang, 'evil')}
          </b>
          <p>{L(r.ab, lang)}</p>
          <p className={shell.muted}>{L(r.tip, lang)}</p>
          {view.cult && view.cult.length > 0 && (
            <p>
              {tu(lang, 'yourCult')}: <b>{view.cult.map((p) => `${p.name} (${L(ROLES[p.role], lang)})`).join(', ')}</b>
            </p>
          )}
        </>
      ) : (
        <p className={styles.holdHint}>{tu(lang, 'holdRole')}</p>
      )}
    </div>
  );

  const news = view.info.length > 0 && (
    <div className={shell.card}>
      <b>{tu(lang, 'news')}</b>
      <ul className={shell.logList}>
        {[...view.info].reverse().map((x, i) => (
          <li key={i}>
            {x.night ? `${tu(lang, 'night', {n: x.night})}: ` : ''}<InfoLine x={x} view={view} lang={lang} />
          </li>
        ))}
      </ul>
    </div>
  );

  if (view.kind === 'over') {
    return (
      <>
        <p className={shell.bigText}>{tu(lang, view.winner === 'good' ? 'goodWin' : 'evilWin')}</p>
        <div className={shell.card}>
          <b>{tu(lang, 'roles')}</b>
          <ul className={shell.logList}>
            {view.roles.map((p) => (
              <li key={p.id}>
                {p.seat}. {p.name}: {L(ROLES[p.role], lang)}
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  if (view.kind === 'roles' || view.kind === 'wait') {
    return (
      <>
        <p className={styles.nowHint}>{tu(lang, 'now_roles')}</p>
        {roleBox}
        {view.kind === 'roles' && (
          <button type="button" className="button button--block" onClick={() => send({action: 'ready'})}>
            {tu(lang, 'ready')}
          </button>
        )}
      </>
    );
  }

  // Night: the same homework screen on every phone; actions open as a panel over it.
  if (view.kind === 'night') {
    return (
      <div className={styles.nightPhone}>
        <p className={shell.kicker}>{tu(lang, 'night', {n: view.night})}</p>
        {!view.dead && <Homework view={view} lang={lang} send={send} />}
        {view.dead && <p>{tu(lang, 'dead')}</p>}
        <button type="button" className="button button--block" onClick={() => setPanel(!panel)}>
          {panel ? tu(lang, 'closePanel') : tu(lang, 'panel')}
        </button>
        {panel && (
          <div className={styles.panel}>
            <b>{tu(lang, 'roleAction')}</b>
            {view.roleTarget ? (
              <p>{tu(lang, 'chosen', {name: nm(view.roleTarget)})}</p>
            ) : view.roleTargets.length ? (
              <PlayerPick ids={view.roleTargets} view={view} lang={lang} onPick={(t) => send({action: 'act', target: t})} />
            ) : (
              <p className={shell.muted}>{tu(lang, 'noRole')}</p>
            )}
            <b>{tu(lang, 'mySpells')}</b>
            <SpellList view={view} lang={lang} send={send} night />
          </div>
        )}
      </div>
    );
  }

  const nowKey = view.kind === 'vote' ? 'now_vote' : view.kind === 'defense' ? 'now_defense' : 'now_day';
  return (
    <>
      <p className={styles.nowHint}>
        {tu(lang, nowKey)} · {tu(lang, 'knowledge')}: <b>{view.knowledge}</b>
      </p>
      {view.dead && <p className={shell.notice}>{tu(lang, 'dead')}</p>}
      {view.kind === 'vote' && (
        <div className={shell.card}>
          <p className={shell.bigText}>{tu(lang, 'voteQ', {name: view.nominee.name})}</p>
          {view.hushed && <p className={shell.notice}>{tu(lang, 'hushed')}</p>}
          {view.dead && <p className={shell.notice}>{view.canYes ? tu(lang, 'ghostHas') : tu(lang, 'ghostSpent')}</p>}
          <div className={shell.choiceGrid}>
            <button type="button" className="button button--lg" disabled={!view.canYes} onClick={() => send({action: 'vote', yes: true})}>
              {tu(lang, 'yes')}
            </button>
            <button type="button" className="button button--lg button--secondary" onClick={() => send({action: 'vote', yes: false})}>
              {tu(lang, 'no')}
            </button>
          </div>
        </div>
      )}
      {(view.kind === 'defense' || view.kind === 'voted') && view.nominee && <p className={shell.bigText}>{tu(lang, 'voteQ', {name: view.nominee.name})}</p>}
      {view.kind === 'voted' && <p>{tu(lang, 'voted')}</p>}
      {news}
      {view.kind === 'day' && view.canNominate && (
        <details className={shell.card} {...fold('nominate')}>
          <summary>
            <b>{tu(lang, 'nominate')}</b>
          </summary>
          <PlayerPick ids={view.nominees.map((p) => p.id)} view={view} lang={lang} onPick={(t) => send({action: 'nominate', target: t})} />
        </details>
      )}
      {view.kind === 'day' && !view.canNominate && !view.dead && <p className={shell.muted}>{tu(lang, 'nominated')}</p>}
      {!view.dead && (
        <details className={shell.card} {...fold('campus')}>
          <summary>
            <b>{tu(lang, 'campus')}</b> · {tu(lang, 'youAreIn', {room: roomName(view.room, lang)})}
          </summary>
          <div className={styles.roomGrid}>
            {view.rooms.filter((rm) => ROOMS[rm.id]).map((rm) => (
              <button key={rm.id} type="button" className="button button--sm" aria-pressed={view.room === rm.id} onClick={() => send({action: 'move', room: rm.id})}>
                <RoomPlan r={rm.id} size={28} /> {roomName(rm.id, lang)} <small>({rm.count})</small>
              </button>
            ))}
          </div>
          {view.key ? (
            <label className={styles.lockRow}>
              <input type="checkbox" checked={view.lockTonight} onChange={(e) => send({action: 'lock', on: e.target.checked})} /> {tu(lang, 'lockKey')}
            </label>
          ) : (
            <p className={shell.muted}>{tu(lang, 'keyUsed')}</p>
          )}
        </details>
      )}
      {view.canShop && (
        <details className={shell.card} {...fold('shop')}>
          <summary>
            <b>{tu(lang, 'shop')}</b> · {tu(lang, 'knowledge')} {view.knowledge} · {tu(lang, 'spellsHeld', {n: view.learned, max: MAX_SPELLS})}
          </summary>
          {!view.canLearn && <p className={shell.muted}>{view.learned >= MAX_SPELLS ? tu(lang, 'learnedAll', {max: MAX_SPELLS}) : tu(lang, 'learnedToday')}</p>}
          <ul className={styles.spellList}>
            {Object.entries(SPELLS).map(([k, sp]) => {
              const owned = view.spells.some((h) => h.k === k);
              return (
                <li key={k}>
                  <span>
                    <SpellIcon k={k} lang={lang} /> <b>{L(sp, lang)}</b> <small>· {tu(lang, 'cost', {n: sp.cost})}</small>
                    <br />
                    <small>{L(sp.ab, lang)}</small>
                  </span>
                  <button type="button" className="button button--sm" disabled={owned || !view.canLearn || view.knowledge < sp.cost} onClick={() => send({action: 'buy', spell: k})}>
                    {owned ? tu(lang, 'owned') : tu(lang, 'buy')}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
      {!view.dead && (
        <details className={shell.card} {...fold('spells')}>
          <summary>
            <b>{tu(lang, 'mySpells')}</b>
          </summary>
          <SpellList view={view} lang={lang} send={send} night={false} />
        </details>
      )}
      {roleBox}
    </>
  );
}

export default university;
