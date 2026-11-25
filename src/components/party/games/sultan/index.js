import React, {useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import MathPad, {PoolPicker} from '../../core/MathPad';
import {CHARS, DISTRICT, EVENTS, EVENT_ART, FRAMES, TYPES, basePool, charOf, isoDistrict} from './data';
import {ArenaFloor, CityPlot, IsoGrid} from './IsoCity';
import {
  acting,
  answer,
  answerQuiz,
  bidCap,
  canBid,
  hasBid,
  joinLate,
  isOut,
  missionFor,
  redrawMission,
  placeBids,
  quizCount,
  quizLeft,
  canBuild,
  canPick,
  canUseEvent,
  challenge,
  draftPick,
  generalTargets,
  hiddenPlayers,
  nameableNumbers,
  officialTargets,
  ownerOf,
  picksLeft,
  setupSultan,
  settingsOf,
  timeout,
  turnAction,
  valueOf,
} from './rules';
import {botMove} from './bot';
import shell from '../../core/party.module.css';
import styles from './sultan.module.css';

/**
 * Each player's district is named by a letter in seat order: A–Z, then AA,
 * AB… for very big tables. Letters, not numbers, so they never mix up with
 * character numbers or district values during conquests.
 */
export function districtLetter(i) {
  let n = i + 1;
  let out = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}
/** Rules text with coloured keywords: "[coin|2 coins]" → a span coloured by kind (coin, char, district, mission, crown, good, bad). */
function richText(text) {
  const parts = String(text).split(/\[(\w+)\|([^\]]+)\]/);
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    if (parts[i + 1]) {
      out.push(
        <span key={i} className={styles.kw} data-kw={parts[i + 1]}>
          {parts[i + 2]}
        </span>,
      );
    }
  }
  return <>{out}</>;
}

const letterOf = (s, id) => (s.seats.includes(id) ? districtLetter(s.seats.indexOf(id)) : '?');

const tg = makeT({
  en: {
    round: 'Round {n}',
    goal: 'Goal: {n} districts',
    lastRound: 'A city is complete. This is the final round!',
    drafting: 'Choosing characters in secret…',
    pickChar: 'Pick a character ({n} left)',
    waitDraft: 'Waiting for your turn to choose…',
    calling: 'Calling number {n}',
    silencedAll: 'Silenced: no turn this round.',
    conquests: 'Conquests…',
    pyrrhicOpen: 'Pyrrhic: anyone with a matching character may challenge now.',
    challengeWho: 'Challenge a player to a duel',
    skip: 'Not this round',
    yourTurn: 'Your turn: {name}',
    income: 'Gather',
    takeGold: 'Take 2 coins',
    takeCards: 'Draw 2, keep 1',
    keepOne: 'Keep one card',
    build: 'Build ({n} left)',
    endTurn: 'End turn',
    endFirst: 'End first turn (the Twins go again)',
    hand: 'Your hand',
    city: 'Your city',
    yourChars: 'Your characters',
    tapPreview: 'Tap a card to preview',
    closePreview: 'Close',
    pickThis: 'Pick this character',
    keepThis: 'Keep this card',
    buildThis: 'Build this district',
    type: 'Type',
    cost: 'Cost',
    number: 'Number',
    frame: 'Colour',
    gold: '{n} coins',
    ability: 'Ability',
    abilityLeft: 'Ability ({n} left)',
    nameNumber: 'Name a number',
    guessWho: 'Which player?',
    guessWhat: 'Which character do they hide?',
    stealPick: 'Right! Take one of their districts:',
    swapWith: 'Swap hands with…',
    redraw: 'Discard and redraw (+1)',
    reserve: 'Reserve for next round',
    buy: 'Buy a district (value +1)',
    destroy: 'Destroy a district (value −1)',
    invest: 'Invest in a district',
    gamble: 'Pay 1 and roll',
    smithy: 'Smithy: pay 2, draw 3',
    lab: 'Laboratory: discard 1 for 2 coins',
    events: 'Event cards',
    eventNeeds: 'Needs {frame}+ · reward {reward}',
    s_mode: 'Game mode',
    s_classicMode: 'Classic',
    s_says: 'Sultan Says (co-op)',
    saysNote: 'Co-op: the Sultan deals missions; each must succeed within 2 rounds or everyone loses. Break the whole deck to win. Stat events are always on.',
    saysTitle: 'The Sultan says…',
    saysLeft: '{done} of {total} missions done · {left} still in the deck',
    dueNow: 'due this round!',
    dueNext: 'due next round',
    saysWin: 'The city stands! Every mission is done.',
    saysLose: 'The Sultan is displeased: {x} was not done in time. Everyone loses.',
    mvp: 'MVP: {name}',
    log_mission: 'completed {x} (+{n} coins)',
    inspNeeds: 'Who can start it',
    inspNeedsValue: '{frame} character or higher',
    inspReward: 'Reward on success',
    inspDeadline: 'Deadline',
    inspDone: 'Done ✓',
    inspOwner: 'District',
    yourDistrict: 'Your district: {x}',
    yourMission: 'Your secret mission',
    roundsLeft: '{n} round(s) left',
    redraw: 'Redraw (once)',
    outBadge: 'Out',
    youAreOut: 'Your mission ran out of time: you are out of this game.',
    log_out: 'missed their mission and is out.',
    marry: 'Marriage: date with…',
    conquer: 'Conquest: attack a district',
    ally: 'Ask an ally (optional)',
    noAlly: 'No ally',
    offer: 'Offer the ally {n} coins',
    extravagance: 'Extravagance: give away {n} coins',
    give: 'Give',
    toGive: '{n} left to give',
    waiting: 'Waiting…',
    nobodyCalled: 'Waiting for your character to be called.',
    turnDone: 'Your turns are done. Watch the others.',
    final: 'Final scores',
    points: '{n} pts',
    value: 'value {n}',
    combat: 'Combat',
    charisma: 'Charisma',
    married: 'married to {name}',
    waitFor: 'Waiting for {name}…',
    p_shield: '{name} targets you ({what}). Use the Priest’s shield? (once per game)',
    p_raise: '{name} challenges you to a duel! Raise the bet (up to {max})',
    p_champion: 'Choose your champion',
    p_date: '{name}’s {mine} asks your {other} on a date. Agree (free), or refuse (they pay you 1 coin)?',
    p_ally: '{name} asks you to lend your characters for a Conquest, for {n} coins.',
    yes: 'Yes',
    no: 'No',
    agree: 'Agree',
    refuse: 'Refuse',
    accept: 'Lend them',
    useShield: 'Use the shield',
    noShield: 'Let it happen',
    eff_steal: 'take a district',
    eff_swap: 'swap hands',
    eff_destroy: 'destroy a district',
    eff_buy: 'buy a district',
    eff_conquest: 'conquer a district',
    eff_pyrrhic: 'a Pyrrhic duel',
    bet: 'Bet {n}',
    poolLine: '{n} players: {chars} characters, {picks} pick(s) each',
    s_pool: 'Character pool',
    s_auto: 'Auto',
    s_classic: 'Classic 8',
    s_all: 'All 20',
    s_picks: 'Picks per round',
    s_events: 'Stat events (Combat & Charisma)',
    s_off: 'Off',
    s_on: 'On',
    s_goal: 'City size',
    s_timer: 'Turn timer',
    s_select: 'Choosing characters',
    s_pickTurns: 'Pick in turn',
    s_auction: 'Math + auction',
    s_mathPools: 'Math problems',
    s_math: 'Math round',
    quizTitle: 'Solve for coins',
    quizRule: 'Each right answer earns 1 coin you can bid. One try per problem. Finish fast: the time left is for bidding.',
    auctionHost: 'Math + secret auction',
    auctionHostLine: 'Solve, then bid. Highest bid wins each character.',
    bidTitle: 'Bid for characters',
    bidRule: 'Tap + to put a coin on a character. Highest bid wins; ties go to the crown holder first. Only winners pay. Win nothing and you are a Citizen.',
    bidRuleNoMath: 'Bid up to {cap} of your coins. Tap + to put a coin on a character. Highest bid wins; ties go to the crown holder first. Only winners pay.',
    purse: '{n} of {cap} coins left to bid',
    noCoins: 'No coins earned this round: you will get a Citizen unless you won a coin.',
    placeBids: 'Place bids',
    updateBids: 'Update bids',
    passBid: 'Bid nothing',
    bidsPlaced: 'Bids placed. You can change them until the auction closes.',
    addBid: 'Bid +1 on {x}',
    removeBid: 'Take 1 back from {x}',
    log_joined: 'joined the game.',
    nextRound: 'You are in! You play from the next round.',
    m_won: '{x} falls to {who}!',
    m_held: '{x} holds!',
    m_married: 'Married!',
    m_jilted: 'Turned down…',
    m_lost: '{x} leaves the city forever',
    wonChar: 'Won {x} for {n}',
    gotCitizen: 'No win: you are a {x}',
    gotLeftover: 'No win: you drew {x}',
    log_auction: 'The auction closed ({n} bids).',
    arena_pyrrhic: 'Duel in the ring',
    arena_marriage: 'Marriage in the garden',
    arena_conquest: 'Battle at the walls',
    arena_extravagance: 'Gifts in the plaza',
    arenaGave: 'gave {n} coins',
    log_built: 'built {x}',
    log_destroyed: 'destroyed {who}’s {x}',
    log_robbed: 'robbed {who}: +{n}',
    log_silenced: 'was silenced',
    log_swap: 'swapped hands with {who}',
    log_named: 'named {n}',
    log_guess: 'guessed {who}: {x} ({ok})',
    log_stole: 'took {who}’s {x}',
    log_bought: 'bought {who}’s {x}',
    log_shield: 'raised the Priest’s shield',
    log_married: '{x} married {y}',
    log_date_failed: '{x}’s date with {y} failed',
    log_conquer: 'marched on {who}’s {x}',
    log_conquered: 'conquered {who}’s {x}',
    log_held: 'held {x}',
    log_challenge: 'challenged {who}',
    log_duel: 'won the duel: {x} is gone',
    log_extravagance: 'gave away {n} coins',
    log_reserved: 'reserved a character',
    log_gamble: 'gambled: +{n}',
    right: 'right',
    wrong: 'wrong',
    legacy: 'This game was saved by the old edition. End it and start a new one.',
  },
  zh: {
    round: '第 {n} 轮',
    goal: '目标：{n} 个区域',
    lastRound: '有一座城已经建成，这是最后一轮！',
    drafting: '秘密挑选角色中……',
    pickChar: '挑选角色（还剩 {n} 个）',
    waitDraft: '等待轮到你挑选……',
    calling: '传召 {n} 号',
    silencedAll: '被静音：本轮没有回合。',
    conquests: '征服结算……',
    pyrrhicOpen: '惨烈：拥有对应颜色角色的玩家现在可以发起挑战。',
    challengeWho: '向一名玩家发起决斗',
    skip: '本轮不用',
    yourTurn: '轮到你：{name}',
    income: '收集资源',
    takeGold: '拿 2 金币',
    takeCards: '抽 2 张留 1 张',
    keepOne: '留下一张',
    build: '建造（还能建 {n} 个）',
    endTurn: '结束回合',
    endFirst: '结束第一回合（双再来一次）',
    hand: '你的手牌',
    city: '你的城市',
    yourChars: '你的角色',
    tapPreview: '点卡片可预览',
    closePreview: '关闭',
    pickThis: '选择这个角色',
    keepThis: '留下这张牌',
    buildThis: '建造这个区域',
    type: '类型',
    cost: '费用',
    number: '号码',
    frame: '颜色',
    gold: '{n} 金币',
    ability: '能力',
    abilityLeft: '能力（还可用 {n} 次）',
    nameNumber: '叫出一个号码',
    guessWho: '指定哪位玩家？',
    guessWhat: '他藏着哪个角色？',
    stealPick: '猜中了！拿走他的一个区域：',
    swapWith: '和谁交换手牌……',
    redraw: '弃牌重抽（+1）',
    reserve: '预留到下一轮',
    buy: '购买区域（价值 +1）',
    destroy: '摧毁区域（价值 −1）',
    invest: '投资一个区域',
    gamble: '付 1 金币掷骰',
    smithy: '铁匠铺：付 2 抽 3',
    lab: '实验室：弃 1 张得 2 金币',
    events: '事件牌',
    eventNeeds: '需要{frame}色或更高 · 奖励 {reward}',
    s_mode: '游戏模式',
    s_classicMode: '经典',
    s_says: '苏丹有令（合作）',
    saysNote: '合作模式：苏丹发布任务，每个任务必须在 2 轮内成功，否则全员失败。完成整副任务牌即获胜。属性事件始终开启。',
    saysTitle: '苏丹有令…',
    saysLeft: '已完成 {done} / {total} 个任务 · 牌堆还剩 {left} 张',
    dueNow: '本轮截止！',
    dueNext: '下轮截止',
    saysWin: '城市屹立不倒！所有任务都已完成。',
    saysLose: '苏丹不悦：{x}没有按时完成。全员失败。',
    mvp: '最佳玩家：{name}',
    log_mission: '完成了{x}（+{n} 金币）',
    inspNeeds: '谁能发起',
    inspNeedsValue: '{frame}色或更高的角色',
    inspReward: '成功奖励',
    inspDeadline: '截止',
    inspDone: '已完成 ✓',
    inspOwner: '区域',
    yourDistrict: '你的区域：{x}',
    yourMission: '你的秘密任务',
    roundsLeft: '还剩 {n} 轮',
    redraw: '换一张（限一次）',
    outBadge: '出局',
    youAreOut: '任务超时：你已出局。',
    log_out: '没有完成任务，出局。',
    marry: '婚姻：和谁约会……',
    conquer: '征服：进攻一个区域',
    ally: '请求盟友（可选）',
    noAlly: '不要盟友',
    offer: '给盟友 {n} 金币',
    extravagance: '丰裕：送出 {n} 金币',
    give: '送',
    toGive: '还剩 {n} 金币要送',
    waiting: '等待中……',
    nobodyCalled: '等待你的角色被传召。',
    turnDone: '你的回合结束了，看看其他人。',
    final: '最终得分',
    points: '{n} 分',
    value: '价值 {n}',
    combat: '战斗力',
    charisma: '魅力',
    married: '与{name}结为伴侣',
    waitFor: '等待{name}……',
    p_shield: '{name}针对你（{what}）。使用教的护盾吗？（每局一次）',
    p_raise: '{name}向你发起决斗！加注（最多 {max}）',
    p_champion: '选择你的冠军',
    p_date: '{name}的{mine}邀请你的{other}约会。同意（免费），还是拒绝（对方付你 1 金币）？',
    p_ally: '{name}请你借出角色参与征服，报酬 {n} 金币。',
    yes: '是',
    no: '否',
    agree: '同意',
    refuse: '拒绝',
    accept: '借给他',
    useShield: '使用护盾',
    noShield: '不用',
    eff_steal: '夺取区域',
    eff_swap: '交换手牌',
    eff_destroy: '摧毁区域',
    eff_buy: '购买区域',
    eff_conquest: '征服区域',
    eff_pyrrhic: '惨烈决斗',
    bet: '下注 {n}',
    poolLine: '{n} 人：{chars} 个角色，每人选 {picks} 个',
    s_pool: '角色池',
    s_auto: '自动',
    s_classic: '经典 8 个',
    s_all: '全部 20 个',
    s_picks: '每轮选几个',
    s_events: '属性事件（战斗力与魅力）',
    s_off: '关闭',
    s_on: '开启',
    s_goal: '城市规模',
    s_timer: '回合时间',
    s_select: '选角方式',
    s_pickTurns: '轮流挑选',
    s_auction: '算题 + 拍卖',
    s_mathPools: '数学题',
    s_math: '数学回合',
    quizTitle: '答题赚金币',
    quizRule: '每答对一题得 1 枚可用于出价的金币。每题只能答一次。答得快，出价时间就多。',
    auctionHost: '算题 + 秘密拍卖',
    auctionHostLine: '先答题，再出价。每个角色出价最高者得。',
    bidTitle: '竞拍角色',
    bidRule: '点 + 把 1 枚金币押在角色上。出价最高者得；平局时王冠持有者优先。只有赢家付钱。什么都没拍到就成为平民。',
    bidRuleNoMath: '最多用 {cap} 枚自己的金币出价。点 + 把 1 枚金币押在角色上。出价最高者得；平局时王冠持有者优先。只有赢家付钱。',
    purse: '还可出价 {n} / {cap} 金币',
    noCoins: '本轮没有赚到金币：你将成为平民。',
    placeBids: '提交出价',
    updateBids: '更新出价',
    passBid: '不出价',
    bidsPlaced: '已出价。拍卖结束前可以修改。',
    addBid: '给{x}加价 1',
    removeBid: '从{x}收回 1',
    log_joined: '加入了游戏。',
    nextRound: '你已加入！从下一轮开始参与。',
    m_won: '{x}落入{who}之手！',
    m_held: '{x}守住了！',
    m_married: '喜结连理！',
    m_jilted: '被拒绝了…',
    m_lost: '{x}永远离开了这座城',
    wonChar: '以 {n} 金币拍得{x}',
    gotCitizen: '没有拍到：你成为{x}',
    gotLeftover: '没有拍到：你抽到{x}',
    log_auction: '拍卖结束（{n} 个出价）。',
    arena_pyrrhic: '擂台决斗',
    arena_marriage: '花园婚礼',
    arena_conquest: '城下之战',
    arena_extravagance: '广场赠礼',
    arenaGave: '送出 {n} 金币',
    log_built: '建造了{x}',
    log_destroyed: '摧毁了{who}的{x}',
    log_robbed: '洗劫了{who}：+{n}',
    log_silenced: '被静音了',
    log_swap: '和{who}交换了手牌',
    log_named: '叫出了 {n} 号',
    log_guess: '猜{who}藏着{x}（{ok}）',
    log_stole: '夺走了{who}的{x}',
    log_bought: '买下了{who}的{x}',
    log_shield: '举起了教的护盾',
    log_married: '{x}与{y}结为伴侣',
    log_date_failed: '{x}与{y}的约会失败了',
    log_conquer: '进军{who}的{x}',
    log_conquered: '征服了{who}的{x}',
    log_held: '守住了{x}',
    log_challenge: '向{who}发起决斗',
    log_duel: '赢得决斗：{x}离开了游戏',
    log_extravagance: '送出了 {n} 金币',
    log_reserved: '预留了一个角色',
    log_gamble: '赌了一把：+{n}',
    right: '猜中',
    wrong: '没猜中',
    legacy: '这局游戏来自旧版本。请结束并开始新游戏。',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to the City of the Sultan, land of gold and dunes.', zh: '欢迎来到苏丹之城，黄金与沙丘之地。'},
  round_start: {en: 'The palace drums sound. A new round begins.', zh: '宫殿的鼓声响起，新的一轮开始了。'},
  draft: {en: 'Choose your characters, in secret.', zh: '请秘密挑选你的角色。'},
  call_0: {en: 'The citizens wake.', zh: '平民醒来。'},
  call_1: {en: 'Number one… the bandits!', zh: '一号……匪！'},
  call_2: {en: 'Number two… the fighter!', zh: '二号……斗士！'},
  call_3: {en: 'Number three… the thief!', zh: '三号……盗贼！'},
  call_4: {en: 'Number four… the king!', zh: '四号……国王！'},
  call_5: {en: 'Number five… the mage!', zh: '五号……法师！'},
  call_6: {en: 'Number six… the princess!', zh: '六号……公主！'},
  call_7: {en: 'Number seven… the official!', zh: '七号……官员！'},
  call_8: {en: 'Number eight… the merchant!', zh: '八号……商人！'},
  call_9: {en: 'Number nine… the priest!', zh: '九号……教士！'},
  call_10: {en: 'Number ten… the general!', zh: '十号……将军！'},
  call_11: {en: 'Number eleven… the scholar!', zh: '十一号……学者！'},
  call_12: {en: 'Number twelve… the builder, and the twins!', zh: '十二号……建筑师，还有双子！'},
  call_13: {en: 'Number thirteen… the lucky one!', zh: '十三号……幸运儿！'},
  silenced: {en: '…Silence. No one may answer.', zh: '……寂静。无人能应召。'},
  robbed: {en: 'The purse is empty! The thief strikes.', zh: '钱袋空了！盗贼得手了。'},
  build_noble: {en: 'A noble house rises.', zh: '一座贵族宅邸落成。'},
  build_religious: {en: 'A house of worship rises.', zh: '一座圣殿落成。'},
  build_trade: {en: 'A market rises.', zh: '一座集市落成。'},
  build_military: {en: 'A fortress rises.', zh: '一座堡垒落成。'},
  build_unique: {en: 'A wonder rises!', zh: '一座奇观落成！'},
  destroyed: {en: 'The general’s army tears a district down.', zh: '将军的军队推倒了一个区域。'},
  crown_moves: {en: 'The crown changes hands.', zh: '王冠易主。'},
  last_round: {en: 'The first city is complete! This is the final round.', zh: '第一座城已经建成！这是最后一轮。'},
  winner: {en: 'The legend of the Sultan’s city belongs to {seat}.', zh: '苏丹之城的传奇，属于{seat}。'},
  says_win: {en: 'The Sultan is pleased. Every task is done, and the city stands!', zh: '苏丹很满意。所有任务都已完成，城市屹立不倒！'},
  says_lose: {en: 'The Sultan is displeased. A task was left undone, and the city falls.', zh: '苏丹不悦。有任务没有完成，城市陷落了。'},
  pyrrhic_open: {en: 'Is there a challenger? Speak now.', zh: '有人要发起挑战吗？现在说。'},
  pyrrhic: {en: 'A duel! Place your bets.', zh: '决斗！下注吧。'},
  duel_end: {en: 'The duel is over. One leaves the city forever.', zh: '决斗结束。有人永远离开了这座城。'},
  shield: {en: 'The priest raises a shield!', zh: '教士举起了护盾！'},
  married: {en: 'Wedding bells! Two hearts are joined.', zh: '婚礼的钟声响起！两颗心结合了。'},
  conquered: {en: 'The gates fall. A district changes hands.', zh: '城门失守，一个区域易主。'},
  extravagance: {en: 'Coins rain on the city!', zh: '金币如雨洒满全城！'},
  twins_again: {en: 'The twins go again!', zh: '双子再来一次！'},
};

// ------------------------------------------------------------------ art

const charName = (k, lang) => {
  const c = charOf(k);
  return c ? `${c.n == null ? '–' : c.n} · ${lang === 'zh' ? c.zh : c.en}` : '?';
};

/** "ATK 4 · CHA 5" (Combat, Charisma). */
const statLine = (c, lang) => (lang === 'zh' ? `战 ${c.combat} · 魅 ${c.charisma}` : `ATK ${c.combat} · CHA ${c.charisma}`);

function CharCard({k, lang, size = 64, stats = false}) {
  const c = charOf(k);
  if (!c) return null;
  return (
    <span className={styles.charWrap}>
      <Sprite path={c.art} emoji={c.zh} label={charName(k, lang)} tint={FRAMES[c.frame].tint} shape="tall" size={`${size}px`} />
      {stats && (
        <span className={styles.statBadge}>{statLine(c, lang)}</span>
      )}
    </span>
  );
}

function DistrictCard({k, lang, size = 60, invest = 0}) {
  const d = DISTRICT[k];
  return (
    <span className={styles.charWrap} title={d.note ? L(d.note, lang) : ''}>
      <Sprite path={d.art} emoji="🏛️" label={`${L(d, lang)} · ${d.cost}`} tint={TYPES[d.type].tint} size={`${size}px`} />
      {invest > 0 && <span className={styles.statBadge}>+{invest}</span>}
    </span>
  );
}

function EventCard({ev, lang, size = 56}) {
  return <Sprite path={`sultan/${EVENT_ART[ev.kind]}-${ev.frame}.webp`} emoji="📜" label={L(EVENTS[ev.kind], lang)} tint={FRAMES[ev.frame].tint} shape="tall" size={`${size}px`} />;
}

/** Full-card peek: large art + side text. Optional `action` runs a pick/build/keep. */
function CardInspect({item, lang, onClose}) {
  if (!item) return null;
  let art = null;
  let title = '';
  let rows = [];
  let ability = '';
  if (item.kind === 'char') {
    const c = charOf(item.key);
    if (!c) return null;
    art = <CharCard k={item.key} lang={lang} size={168} stats />;
    title = charName(item.key, lang);
    rows = [
      [tg(lang, 'number'), c.n == null ? '–' : String(c.n)],
      [tg(lang, 'frame'), L(FRAMES[c.frame], lang)],
      [tg(lang, 'combat'), String(c.combat)],
      [tg(lang, 'charisma'), String(c.charisma)],
    ];
    ability = L(c.ab, lang);
    if (item.married) ability = `${ability}\n${tg(lang, 'married', {name: charName(item.married, lang)})}`;
  } else if (item.kind === 'district') {
    const d = DISTRICT[item.key];
    if (!d) return null;
    art = <DistrictCard k={item.key} lang={lang} size={150} invest={item.invest || 0} />;
    title = L(d, lang);
    rows = [
      [tg(lang, 'type'), L(TYPES[d.type], lang)],
      [tg(lang, 'cost'), String(d.cost)],
    ];
    if (item.invest > 0) rows.push([tg(lang, 'value', {n: d.cost + item.invest}), '']);
    if (item.letter) rows.push([tg(lang, 'inspOwner'), item.letter]);
    ability = d.note ? L(d.note, lang) : '';
  } else if (item.kind === 'event') {
    const ev = EVENTS[item.key];
    if (!ev) return null;
    art = <EventCard ev={{kind: item.key, frame: item.frame}} lang={lang} size={150} />;
    title = L(ev, lang);
    rows = [
      [tg(lang, 'inspNeeds'), tg(lang, 'inspNeedsValue', {frame: L(FRAMES[item.frame], lang)})],
      [tg(lang, 'ability'), tg(lang, ev.stat === 'combat' ? 'combat' : 'charisma')],
    ];
    if (item.reward != null) rows.push([tg(lang, 'inspReward'), `+${item.reward}`]);
    if (item.done) rows.push([tg(lang, 'inspDone'), '']);
    else if (item.due != null) rows.push([tg(lang, 'inspDeadline'), tg(lang, item.due <= item.round ? 'dueNow' : 'dueNext')]);
    ability = L(ev.ab, lang);
  }
  return (
    <div className={styles.inspectScrim} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={styles.inspectPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inspectArt}>{art}</div>
        <div className={styles.inspectText}>
          <h3 className={styles.inspectTitle}>{title}</h3>
          <dl className={styles.inspectMeta}>
            {rows.map(([label, value], i) =>
              !label ? null : (
                <div key={i} className={styles.inspectRow}>
                  <dt>{label}</dt>
                  {value !== '' && <dd>{value}</dd>}
                </div>
              ),
            )}
          </dl>
          {ability && <p className={styles.inspectAbility}>{ability}</p>}
          <div className={styles.inspectActions}>
            {item.action && (
              <button
                type="button"
                className="button button--primary"
                disabled={item.action.disabled}
                onClick={() => {
                  item.action.onClick();
                  onClose();
                }}>
                {item.action.label}
              </button>
            )}
            <button type="button" className="button button--secondary" onClick={onClose}>
              {tg(lang, 'closePreview')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const coin = <Sprite path="sultan/token-coin.webp" emoji="🪙" label="" tint="#d9a520" shape="token" size="18px" />;
const crown = <Sprite path="sultan/token-crown.webp" emoji="👑" label="" tint="#d9a520" shape="icon" size="22px" />;

/** Games saved by the old 8-role edition can't continue: ask for a new game. */
const LEGACY_VIEW = {kind: 'wait', task: 'legacy', mine: [], hand: [], city: [], events: [], players: [], round: 0, goal: 7, gold: 0, legacy: true};

// ------------------------------------------------------------------ module

const sultan = {
  id: 'sultan',
  logo: 'sultan/char-04-king.webp',
  title: {en: 'City of the Sultan', zh: '苏丹之城'},
  blurb: {
    en: 'Bloodshed, marriage, and conquest, they are just tools of the trade.',
    zh: '血腥、婚姻与征服，它们只是交易的工具。',
  },
  /** Short, colour-coded steps for the mode being played (from the room's settings). */
  howTo(lang, st = {}) {
    const zh = lang === 'zh';
    const says = st.mode === 'says';
    const missions = says || st.events === 'on';
    const goal = [6, 7, 8].includes(st.goal) ? String(st.goal) : zh ? '7（2–3 人时 8）' : '7 (8 at 2–3 players)';
    const steps = [];
    if (says) steps.push(zh ? '合作：一起完成所有[mission|任务牌]。任何一张超时 → [bad|全员失败]。' : 'Co-op: finish every [mission|mission card] together. Miss one → [bad|everyone loses].');
    else steps.push(zh ? `目标：最好的[district|城市]。有人建满 [district|${goal} 个区域]，该轮结束后游戏结束。` : `Goal: the best [district|city]. When one reaches [district|${goal} districts], that round ends the game.`);
    if (st.select === 'auction' && st.math !== 'off') {
      steps.push(zh ? '每轮：答对 [good|3 道题] = [coin|3 金币]（选 2 个角色时为 6），再用它们竞拍[char|角色]。出价最高者得，平局 [crown|王冠]优先。没拍到 → 随机一个剩余角色，没有了就是[char|平民]。' : 'Each round: [good|3 right answers] = [coin|3 coins] (6 with 2 characters each). Bid them on [char|characters]: top bid wins, ties → [crown|crown] first. No win → a random leftover, else a [char|Citizen].');
    } else if (st.select === 'auction') {
      steps.push(zh ? '每轮：最多用 [coin|3 金币]（选 2 个角色时为 6）竞拍[char|角色]。出价最高者得，平局 [crown|王冠]优先。没拍到 → 随机一个剩余角色，没有了就是[char|平民]。' : 'Each round: bid up to [coin|3 coins] (6 with 2 characters each) on [char|characters]: top bid wins, ties → [crown|crown] first. No win → a random leftover, else a [char|Citizen].');
    } else {
      steps.push(zh ? '每轮秘密挑选 [char|1 个角色]（2–3 人时 2 个）。[crown|王冠]先选。' : 'Each round, secretly pick [char|1 character] (2 at 2–3 players). [crown|Crown] picks first.');
    }
    steps.push(zh ? '按号码 [char|0 → 13] 传召角色。你的回合：拿 [coin|2 金币]或抽 2 留 1 → 用能力 → [district|建造]。' : '[char|Characters] are called [char|0 → 13]. Your turn: take [coin|2 coins] or draw 2 keep 1 → use the ability → [district|build].');
    steps.push(zh ? '同一城市不能有两个相同的[district|区域]。' : 'No two identical [district|districts] in one city.');
    if (missions) {
      steps.push(zh ? '你有一张秘密[mission|任务]：用同色或更高的[char|角色]发起（棕 < 绿 < 蓝 < 金）。成功 → [coin|4 / 8 / 12 / 16 金币]。' : 'Your secret [mission|mission]: start it with a [char|character] of its colour or higher (brown < green < blue < gold). Success → [coin|4 / 8 / 12 / 16 coins].');
      steps.push(
        says
          ? zh
            ? '每张[mission|4 轮]内完成；每局可[mission|换牌]一次。任务牌用完 → [good|胜利]。'
            : '[mission|4 rounds] for each card; one [mission|redraw] per game. Empty the deck → [good|you win].'
          : zh
            ? '[mission|4 轮]内完成；每局可[mission|换牌]一次。超时 → [bad|你出局]。'
            : '[mission|4 rounds] to finish it; one [mission|redraw] per game. Miss it → [bad|you are out].',
      );
    }
    if (says) steps.push(zh ? '得分最高者为 [crown|最佳玩家]。' : 'Top scorer is [crown|MVP].');
    else steps.push(zh ? '得分：[district|区域价值]，五种类型齐全 +3，最先完成 +4（其他完成者 +2），加独特区域奖励。' : 'Score: [district|district values], +3 for all 5 types, +4 first to finish (+2 others), plus Unique bonuses.');
    return steps.map(richText);
  },

  reference(lang, st = {}) {
    const group = (en, zh) => (lang === 'zh' ? zh : en);
    const chars = Object.keys(CHARS).map((k) => ({
      group: group('Characters', '角色'),
      emoji: <CharCard k={k} lang={lang} size={18} />,
      tint: FRAMES[CHARS[k].frame].tint,
      title: charName(k, lang),
      tag: statLine(CHARS[k], lang),
      text: CHARS[k].ab,
    }));
    const events = Object.keys(EVENTS).map((k) => ({group: group('Stat events', '属性事件'), emoji: <EventCard ev={{kind: k, frame: 'gold'}} lang={lang} size={18} />, tint: '#e9cfa3', title: L(EVENTS[k], lang), text: EVENTS[k].ab}));
    const uniques = Object.values(DISTRICT)
      .filter((d) => d.note)
      .map((d) => ({group: group('Unique districts', '独特区域'), emoji: <DistrictCard k={d.key} lang={lang} size={22} />, tint: TYPES.unique.tint, title: `${L(d, lang)} · ${d.cost}`, text: d.note}));
    const missionsOn = !st || st.mode === 'says' || st.events === 'on' || st.events === undefined;
    return [...chars, ...(missionsOn ? events : []), ...uniques];
  },
  inspiredBy: 'Citadels',
  players: {min: 2, max: 24},
  minutes: 40,
  coverTint: '#f4a62a',
  themeClass: shell.themeSultan,
  voiceLines: VOICE,
  defaultSettings: {pool: 'auto', picks: 'auto', events: 'off', marriage: true, conquest: true, pyrrhic: true, extravagance: true, goal: 'auto', turnSeconds: 45, select: 'pick', math: 'on', mathPools: ['basic'], mode: 'classic'},

  setup(g, seats, ctx) {
    return setupSultan(seats, ctx, g.settings || {});
  },

  SettingsView({settings, set, lang, playerCount: n = 0}) {
    // Rooms saved before a setting existed have no value for it: show its default as chosen.
    const current = (key) => (settings[key] !== undefined ? settings[key] : sultan.defaultSettings[key]);
    const radio = (key, value, label) => (
      <button key={String(value)} type="button" role="radio" aria-checked={current(key) === value} className="button button--sm button--secondary" onClick={() => set({[key]: value})}>
        {label}
      </button>
    );
    const toggle = (key) => (
      <button key={key} type="button" role="checkbox" aria-checked={settings[key] !== false} className="button button--sm button--secondary" onClick={() => set({[key]: settings[key] === false})}>
        {L(EVENTS[key], lang)}
      </button>
    );
    const st = n >= 2 ? settingsOf(n, settings) : null;
    return (
      <>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_pool')}</span>
          {radio('pool', 'auto', tg(lang, 's_auto'))}
          {radio('pool', 'classic', tg(lang, 's_classic'))}
          {radio('pool', 'all', tg(lang, 's_all'))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_select')}</span>
          {radio('select', 'pick', tg(lang, 's_pickTurns'))}
          {radio('select', 'auction', tg(lang, 's_auction'))}
        </div>
        {settings.select === 'auction' && (
          <div className={shell.buttonRow}>
            <span>{tg(lang, 's_math')}</span>
            {radio('math', 'on', tg(lang, 's_on'))}
            {radio('math', 'off', tg(lang, 's_off'))}
          </div>
        )}
        {settings.select === 'auction' && settings.math !== 'off' && (
          <div className={shell.buttonRow}>
            <span>{tg(lang, 's_mathPools')}</span>
            <PoolPicker value={settings.mathPools} onChange={(mathPools) => set({mathPools})} lang={lang} />
          </div>
        )}
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_picks')}</span>
          {radio('picks', 'auto', tg(lang, 's_auto'))}
          {radio('picks', 1, '1')}
          {radio('picks', 2, '2')}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_mode')}</span>
          {radio('mode', 'classic', tg(lang, 's_classicMode'))}
          {radio('mode', 'says', tg(lang, 's_says'))}
        </div>
        {current('mode') === 'says' && <p className={shell.muted}>{tg(lang, 'saysNote')}</p>}
        {current('mode') !== 'says' && (
          <div className={shell.buttonRow}>
            <span>{tg(lang, 's_events')}</span>
            {radio('events', 'off', tg(lang, 's_off'))}
            {radio('events', 'on', tg(lang, 's_on'))}
          </div>
        )}
        {(settings.events === 'on' || current('mode') === 'says') && <div className={shell.buttonRow}>{Object.keys(EVENTS).map(toggle)}</div>}
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_goal')}</span>
          {radio('goal', 'auto', tg(lang, 's_auto'))}
          {[6, 7, 8].map((v) => radio('goal', v, String(v)))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_timer')}</span>
          {[30, 45, 60].map((v) => radio('turnSeconds', v, tg(lang, 'sec', {n: v})))}
        </div>
        {st && <p className={shell.muted}>{tg(lang, 'poolLine', {n, chars: Math.max(basePool(n, st.pool, st.picks).length, n * st.picks + 2), picks: st.picks})}</p>}
      </>
    );
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'draft':
        return draftPick(s, ctx, id, msg.card);
      case 'quiz':
        return answerQuiz(s, ctx, id, Number(msg.index), msg.value);
      case 'bid':
        return placeBids(s, ctx, id, msg.bids);
      case 'redraw':
        return redrawMission(s, ctx, id);
      case 'challenge':
        return challenge(s, ctx, id, msg.target);
      case 'answer':
        return answer(s, ctx, id, msg);
      default:
        return turnAction(s, ctx, id, msg);
    }
  },

  tick(s, g, ctx) {
    return Boolean(timeout(s, ctx));
  },

  bot(s, g, id, ctx) {
    return botMove(s, id, ctx.rng);
  },

  /** Bots move fast: no one waits on them. */
  botStepMs: 450,

  /** Host sounds: only a few dry ones (a tap on each call, a thud when something lands). */
  cueSfx(id) {
    if (/^call_/.test(id)) return 'tap';
    if (/^build_|conquered|married|duel_end|says_win|says_lose|player_out/.test(id)) return 'place';
    return null;
  },

  /** Phone sounds: ring when it's your move, a dry tap when someone asks you something. Nothing else. */
  phoneSfx(view, prev) {
    const mine = (v) => ['turn', 'draft', 'quiz', 'pyrrhic'].includes(v.kind);
    if (mine(view) && (!mine(prev) || (view.turn && prev.turn && view.turn.card !== prev.turn.card))) return 'hint';
    if (view.kind === 'prompt' && prev.kind !== 'prompt') return 'tap';
    return null;
  },

  /** A phone that joins mid-game gets a seat (see joinLate in rules.js). */
  lateJoin(s, g, id, ctx) {
    return joinLate(s, ctx, id);
  },

  /** The phone view plus `urgent` (this phone must act now), which drives the banner and buzz. */
  view(s, g, id, ctx) {
    const v = this.baseView(s, g, id, ctx);
    return {...v, urgent: ['draft', 'quiz', 'turn', 'prompt'].includes(v.kind) || (v.kind === 'bid' && !v.bid.placed)};
  },

  baseView(s, g, id) {
    if (!s.st) return LEGACY_VIEW;
    const name = (p) => (g.players[p] ? g.players[p].name : '?');
    const players = s.seats.map((p) => ({
      id: p,
      name: name(p),
      avatar: g.players[p] && g.players[p].avatar,
      color: g.players[p] && g.players[p].color,
      gold: s.gold[p],
      hand: s.hand[p].length,
      city: s.city[p].map((u) => ({uid: u, key: s.cards[u], value: valueOf(s, u)})),
      shown: s.hold[p].filter((k) => s.revealed[k]),
    }));
    const statsOn = s.st.events.length > 0;
    const t = s.turn;
    const myTurnCard = s.phase === 'call' && t ? t.cards.find((k) => acting(s, id, k)) : null;
    let kind = 'wait';
    if (s.over) kind = 'over';
    else if (s.prompt && s.prompt.to === id) kind = 'prompt';
    else if (s.phase === 'draft' && picksLeft(s, id) > 0) kind = 'draft';
    else if (s.phase === 'auction' && quizLeft(s, id) > 0) kind = 'quiz';
    else if (canBid(s, id)) kind = 'bid';
    else if (s.phase === 'pyrrhic' && !s.prompt && canUseEvent(s, id, missionFor(s, id, 'pyrrhic'))) kind = 'pyrrhic';
    else if (myTurnCard) kind = 'turn';
    const v = {
      task: `${kind}-${s.round}-${s.phase}-${s.calling}-${myTurnCard || ''}-${myTurnCard ? t.step[myTurnCard] : ''}-${s.prompt ? s.prompt.kind : ''}`,
      kind,
      phase: s.phase,
      round: s.round,
      goal: s.st.goal,
      statsOn,
      gold: s.gold[id],
      crown: s.crown === id,
      lastRound: s.lastRound,
      calling: s.phase === 'call' && t ? t.num : null,
      mine: s.hold[id].map((k) => ({key: k, married: s.married[k] || null})),
      hand: s.hand[id].map((u) => ({uid: u, key: s.cards[u], ok: Boolean(myTurnCard) && canBuild(s, id, myTurnCard, u)})),
      city: s.city[id].map((u) => ({uid: u, key: s.cards[u], invest: s.invest[u] || 0})),
      // Missions are secret: a phone only ever sees its own card.
      events: missionFor(s, id) ? [{...missionFor(s, id), can: canUseEvent(s, id, missionFor(s, id)), roundsLeft: missionFor(s, id).due - s.round + 1}] : [],
      canRedraw: Boolean(missionFor(s, id)) && !(s.redraws && s.redraws[id]) && !isOut(s, id),
      out: isOut(s, id),
      players,
      me: id,
      letter: letterOf(s, id),
      turnDone: s.phase === 'call' && s.hold[id].length > 0 && s.hold[id].every((k) => charOf(k).n == null || charOf(k).n < (s.calling || 0) || (t && t.done[k])),
      score: s.scores ? s.scores[id] : null,
      winner: s.winner || null,
      says: s.says && s.says.result ? s.says.result : null,
      waitFor: s.prompt ? name(s.prompt.to) : null,
    };
    // Auction selection: my problems (never the answers), my bid options, and what I won.
    if (s.auction && s.phase === 'auction' && s.auction.quiz[id]) {
      v.quiz = s.auction.quiz[id].map((q) => ({pool: q.pool, lines: q.lines, hint: q.hint, state: q.state}));
    }
    if (kind === 'bid') {
      v.bid = {
        cap: bidCap(s, id),
        math: s.st.math !== 'off',
        placed: s.auction.bids[id] || null,
        lots: s.auction.lots.map((k) => ({key: k, married: s.married[k] || null})),
      };
    }
    if (s.auction && s.auction.won && s.auction.won[id] && s.phase !== 'auction') v.won = s.auction.won[id];
    if (kind === 'draft') {
      v.picksLeft = picksLeft(s, id);
      v.available = s.draft.available.map((k) => ({key: k, ok: canPick(s, id, k), married: s.married[k] || null}));
    }
    if (kind === 'pyrrhic') v.targets = s.seats.filter((p) => p !== id && s.hold[p].length).map((p) => ({id: p, name: name(p)}));
    if (kind === 'prompt') {
      const p = s.prompt;
      v.prompt = {kind: p.kind, from: name(p.from || (p.eff && p.eff.actor) || (s.duel && s.duel.a)), max: p.max, mine: p.mine, other: p.other, what: p.eff ? p.eff.kind : null};
      if (p.kind === 'champion') v.prompt.cards = s.hold[id];
      if (p.kind === 'ally') v.prompt.offer = s.conquests[p.index].offer;
    }
    if (kind === 'turn') {
      const key = myTurnCard;
      const twice = s.hold[id].includes('weaver') ? 2 : 1;
      v.turn = {
        card: key,
        step: t.step[key],
        drawn: t.step[key] === 'keep' ? t.drawn[key].map((u) => ({uid: u, key: s.cards[u]})) : null,
        buildLeft: (key === 'builder' ? 2 : 1) - (t.built[key] || 0),
        usesLeft: twice - (t.uses[key] || 0),
        twinsFirst: key === 'twins' && !t.again[key],
        waiting: Boolean(s.prompt),
        numbers: nameableNumbers(s, key),
        hiddenPlayers: hiddenPlayers(s, id).map((p) => ({id: p, name: name(p)})),
        guesses: (s.poolKeys || []).filter((k) => !s.hold[id].includes(k) && !s.revealed[k]),
        stealFrom: t.stealFrom[key] ? s.city[t.stealFrom[key]].filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u])).map((u) => ({uid: u, key: s.cards[u]})) : null,
        unpicked: key === 'princess' ? (s.unpicked || []).filter((k) => !Object.values(s.reserved).includes(k)) : [],
        buys: key === 'official' ? officialTargets(s, id).map((x) => ({...x, key: s.cards[x.uid], owner: `${letterOf(s, x.owner)} · ${name(x.owner)}`})) : [],
        destroys: key === 'general' ? generalTargets(s, id).map((x) => ({...x, key: s.cards[x.uid], owner: `${letterOf(s, x.owner)} · ${name(x.owner)}`})) : [],
        smithy: s.city[id].some((u) => s.cards[u] === 'smithy') && !t.smithy[key] && s.gold[id] >= 2,
        lab: s.city[id].some((u) => s.cards[u] === 'laboratory') && !t.lab[key],
        dates: !t.dated[key] && !s.married[key] ? Object.keys(s.owner).filter((k) => k !== key && s.revealed[k] && !s.married[k]).map((k) => ({key: k, owner: name(ownerOf(s, k))})) : [],
        targets: s.seats.filter((p) => p !== id).flatMap((p) => s.city[p].filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u])).map((u) => ({uid: u, key: s.cards[u], owner: `${letterOf(s, p)} · ${name(p)}`, value: valueOf(s, u)}))),
        charisma: s.hold[id].reduce((n, k) => n + charOf(k).charisma, 0),
      };
    }
    return v;
  },

  HostView({g, state: s, lang}) {
    if (!s.st) return <div className={shell.bigText}>{tg(lang, 'legacy')}</div>;
    // While playing: the slim bar + the players' cities. The SeatRing below is the final screen.
    if (!s.over) return <SultanBoard s={s} g={g} lang={lang} />;
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const t = s.turn;
    const statsOn = s.st.events.length > 0;
    const recent = (s.log || []).slice(-6).reverse();
    const roll = s.rolls && s.rolls[0];
    // Whose city is in play right now: the owners of the called characters.
    const active = (id) => (s.phase === 'call' && t ? t.cards.some((k) => ownerOf(s, k) === id && !t.done[k]) : false);
    const conquest = s.phase === 'conquest' && s.conquests && s.conquests[s.conquestAt];
    const n = s.seats.length;
    const cityScale = n > 24 ? 0.4 : n > 12 ? 0.62 : n > 6 ? 0.9 : 1.05;
    return (
      <>
      <SeatRing
        g={g}
        ids={s.seats}
        focus="seats"
        highlight={(id) => (s.phase === 'draft' ? picksLeft(s, id) > 0 : s.phase === 'call' && t ? active(id) : s.prompt && s.prompt.to === id)}
        feature={(id) => (
          <CityPlot
            city={s.city[id].map((u) => ({uid: u, key: s.cards[u], value: valueOf(s, u)}))}
            goal={s.st.goal}
            color={g.players[id]?.color}
            scale={cityScale}
            lang={lang}
            hot={conquest && conquest.defender === id ? [conquest.uid] : []}
          />
        )}
        badge={(id) => (
          <>
            {s.crown === id && crown}
            <span className={styles.stat}>
              {coin}
              {s.gold[id]}
            </span>
            <span className={styles.stat}>🃏{s.hand[id].length}</span>
            <span className={styles.shownRow}>
              {s.hold[id]
                .filter((k) => s.revealed[k])
                .map((k) => (
                  <CharCard key={k} k={k} lang={lang} size={20} />
                ))}
            </span>
            {s.over && <b className={styles.stat}>{tg(lang, 'points', {n: s.scores[id]})}</b>}
          </>
        )}>
        {s.over ? (
          <div className={styles.final}>
            {s.says ? (
              <>
                <div className={styles.saysResult} data-result={s.says.result}>
                  {s.says.result === 'win' ? `🏰 ${tg(lang, 'saysWin')}` : `💀 ${tg(lang, 'saysLose', {x: s.says.missed ? L(EVENTS[s.says.missed.kind], lang) : ''})}`}
                </div>
                <p className={shell.kicker}>{tg(lang, 'mvp', {name: name(s.winner)})}</p>
              </>
            ) : (
              <div className={shell.bigText}>{name(s.winner)}</div>
            )}
            <table className={shell.scoreTable}>
              <tbody>
                {[...s.seats]
                  .sort((a, b) => s.scores[b] - s.scores[a])
                  .slice(0, 10)
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
              {tg(lang, 'round', {n: s.round})}
              {!s.says && ` · ${tg(lang, 'goal', {n: s.st.goal})}`}
            </p>
            {s.lastRound && !s.says && <p className={styles.last}>{tg(lang, 'lastRound')}</p>}
            {s.says && (
              <>
                <p className={styles.saysTitle}>{tg(lang, 'saysTitle')}</p>
                <p className={shell.muted}>{tg(lang, 'saysLeft', {done: s.says.broken.length, total: s.says.total, left: s.says.deck.length})}</p>
              </>
            )}
            {s.phase === 'draft' && (
              <>
                <div className={shell.bigText}>{tg(lang, 'drafting')}</div>
                <div className={shell.chipRow}>
                  {s.draft.wave.map((id) => (
                    <span key={id} className={shell.chip}>
                      {name(id)} {picksLeft(s, id) > 0 ? '…' : '✓'}
                    </span>
                  ))}
                </div>
              </>
            )}
            {s.phase === 'auction' && (
              <>
                <div className={shell.bigText}>{tg(lang, 'auctionHost')}</div>
                <p className={shell.muted}>{tg(lang, 'auctionHostLine')}</p>
                <div className={styles.cards}>
                  {s.auction.lots.map((k) => (
                    <CharCard key={k} k={k} lang={lang} size={44} />
                  ))}
                </div>
                <div className={shell.chipRow}>
                  {s.seats.map((id) => (
                    <span key={id} className={shell.chip}>
                      {name(id)} {quizLeft(s, id) > 0 ? `${quizCount(s) - quizLeft(s, id)}/${quizCount(s)}` : hasBid(s, id) ? '✓' : '🪙…'}
                    </span>
                  ))}
                </div>
              </>
            )}
            {s.phase === 'pyrrhic' && <div className={shell.bigText}>{tg(lang, 'pyrrhicOpen')}</div>}
            {s.phase === 'call' && t && (
              <div className={styles.calling}>
                <div className={shell.bigText}>{tg(lang, 'calling', {n: t.num})}</div>
                <div className={styles.cards}>
                  {t.cards.map((k) => (
                    <span key={k} className={styles.callCard} data-done={Boolean(t.done[k])} data-silenced={s.silenced.includes(t.num)}>
                      <CharCard k={k} lang={lang} size={70} stats={statsOn} />
                      <small>{name(ownerOf(s, k))}</small>
                    </span>
                  ))}
                </div>
                {t.pause && <p>{tg(lang, 'silencedAll')}</p>}
              </div>
            )}
            {s.phase === 'conquest' && <div className={shell.bigText}>{tg(lang, 'conquests')}</div>}
            {s.prompt && <p className={shell.muted}>{tg(lang, 'waitFor', {name: name(s.prompt.to)})}</p>}
            {roll && roll.a.dice && (
              <div className={styles.dice}>
                {name(roll.a.who)}: <b>{roll.a.total}</b>
                <small> ({roll.a.dice.join(' + ')} − 1)</small>
              </div>
            )}
            <ul className={`${shell.logList} ${styles.log}`}>
              {recent.map((e, i) => (
                <li key={i}>
                  <LogLine e={e} lang={lang} name={name} />
                </li>
              ))}
            </ul>
          </>
        )}
      </SeatRing>
      <EventModal s={s} g={g} lang={lang} name={name} />
      </>
    );
  },

  PhoneView({view, lang, send}) {
    return <SultanPhone view={view} lang={lang} send={send} />;
  },
};

function LogLine({e, lang, name}) {
  const x = e.card ? (DISTRICT[e.card] ? L(DISTRICT[e.card], lang) : EVENTS[e.card] ? L(EVENTS[e.card], lang) : charName(e.card, lang)) : '';
  const y = e.other ? charName(e.other, lang) : '';
  const key = `log_${e.kind}`;
  return (
    <>
      {e.actor && <b>{name(e.actor)}</b>} {tg(lang, key, {x, y, who: name(e.target), n: e.n != null ? e.n : e.number, ok: tg(lang, e.right ? 'right' : 'wrong')})}
    </>
  );
}

/**
 * Stat events as a modal over the players' cities, each on its own arena
 * floor and with its own little show:
 * - Conquest: soldiers march on the targeted building; if it falls it is
 *   carried off to the attacker's side, if not a shield bounces them back.
 * - Pyrrhic: the two champions clash; the loser fades out of the city.
 * - Marriage: the two characters walk together under floating hearts; a
 *   ring, or a broken heart.
 * - Extravagance: a fountain of coins, then who received how many.
 * Shown while a duel or conquest is being settled, then for a few seconds
 * with the result. Only public facts: revealed (or removed) characters,
 * totals and districts.
 */
const EVENT_SHOW_MS = 6500;

function currentEvent(s) {
  const roll = s.rolls && s.rolls[0];
  const conquest = s.phase === 'conquest' && s.conquests && s.conquests[s.conquestAt];
  if (s.duel) return {kind: 'pyrrhic', pending: true, a: {who: s.duel.a, card: s.duel.champA}, b: {who: s.duel.b, card: s.duel.champB}};
  if (conquest && (!roll || roll.kind !== 'conquest' || roll.a.who !== conquest.attacker || Date.now() - (roll.at || 0) > EVENT_SHOW_MS)) {
    return {kind: 'conquest', pending: true, a: {who: conquest.attacker}, b: {who: conquest.defender}, card: s.cards[conquest.uid]};
  }
  if (roll && ['pyrrhic', 'marriage', 'conquest', 'extravagance'].includes(roll.kind) && roll.at && Date.now() - roll.at < EVENT_SHOW_MS) {
    return {...roll, pending: false};
  }
  return null;
}

function EventModal({s, g, lang, name}) {
  const ev = currentEvent(s);
  const [, setTick] = useState(0);
  // Close the modal on time even if no new state arrives.
  const at = ev && !ev.pending ? ev.at : null;
  React.useEffect(() => {
    if (!at) return undefined;
    const id = setTimeout(() => setTick((n) => n + 1), Math.max(0, at + EVENT_SHOW_MS - Date.now()) + 50);
    return () => clearTimeout(id);
  }, [at]);
  if (!ev) return null;
  const {kind, pending} = ev;
  const shown = (k) => k && (s.revealed[k] || s.removed.includes(k));
  const aWins = !pending && ev.b && ev.a.total > ev.b.total;
  const side = (x, which) => {
    if (!x) return null;
    const p = g.players[x.who];
    const lost = kind === 'pyrrhic' && !pending && x.card && ev.lost === x.card;
    return (
      <span className={styles.modalSide} data-side={which} data-lost={lost} data-win={!pending && (which === 'a' ? aWins : !aWins)}>
        {shown(x.card) && <CharCard k={x.card} lang={lang} size={72} />}
        <PlayerTag s={s} g={g} id={x.who} name={name} />
        {!pending && x.total != null && kind !== 'extravagance' && <span className={styles.modalTotal}>{x.total}</span>}
      </span>
    );
  };
  let result = null;
  if (!pending) {
    if (kind === 'conquest') result = ev.won ? `🏴 ${tg(lang, 'm_won', {x: L(DISTRICT[ev.card], lang), who: `${name(ev.a.who)} (${letterOf(s, ev.a.who)})`})}` : `🛡️ ${tg(lang, 'm_held', {x: L(DISTRICT[ev.card], lang)})}`;
    if (kind === 'marriage') result = ev.ok ? `💍 ${tg(lang, 'm_married')}` : `💔 ${tg(lang, 'm_jilted')}`;
    if (kind === 'pyrrhic' && ev.lost) result = `☠️ ${tg(lang, 'm_lost', {x: charName(ev.lost, lang)})}`;
  }
  const gifts = kind === 'extravagance' && ev.gifts ? Object.entries(ev.gifts) : [];
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-label={tg(lang, `arena_${kind}`)}>
      <div className={styles.modal} data-kind={kind} data-pending={pending} data-result={kind === 'conquest' && !pending ? (ev.won ? 'won' : 'held') : kind === 'marriage' && !pending ? (ev.ok ? 'yes' : 'no') : ''}>
        <p className={styles.modalTitle}>{tg(lang, `arena_${kind}`)}</p>
        <div className={styles.modalStage}>
          {side(ev.a, 'a')}
          <span className={styles.modalCenter}>
            <ArenaFloor kind={kind} centerArt={kind === 'conquest' && ev.card ? isoDistrict(ev.card) : undefined} scale={1.5} />
            <span className={styles.modalFx} aria-hidden="true">
              {kind === 'conquest' && (
                <>
                  <span className={styles.fxMarch}>🗡️🛡️🗡️</span>
                  {!pending && !ev.won && <span className={styles.fxShield}>🛡️</span>}
                </>
              )}
              {kind === 'pyrrhic' && <span className={styles.fxClash}>⚔️</span>}
              {kind === 'marriage' && (
                <>
                  <span className={styles.fxHearts}>
                    <i>💕</i>
                    <i>💗</i>
                    <i>💞</i>
                  </span>
                  {!pending && <span className={styles.fxSeal}>{ev.ok ? '💍' : '💔'}</span>}
                </>
              )}
              {kind === 'extravagance' && (
                <span className={styles.fxFountain}>
                  {Array.from({length: Math.min(10, ev.a.total || 4)}, (_, i) => (
                    <i key={i} style={{'--i': i}}>
                      {coin}
                    </i>
                  ))}
                </span>
              )}
            </span>
          </span>
          {kind === 'extravagance' ? (
            <span className={styles.modalSide}>
              {gifts.map(([p, n]) => (
                <span key={p} className={styles.giftRow}>
                  <PlayerTag s={s} g={g} id={p} name={name} small /> +{n}
                </span>
              ))}
            </span>
          ) : (
            side(ev.b, 'b')
          )}
        </div>
        {kind === 'extravagance' && <p className={styles.modalResult}>{tg(lang, 'arenaGave', {n: ev.a.total})}</p>}
        {result && <p className={styles.modalResult}>{result}</p>}
        {pending && s.prompt && (
          <p className={shell.muted}>
            ⏳ <PlayerTag s={s} g={g} id={s.prompt.to} name={name} small />
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ host board

/**
 * The host's big screen while a game runs: a slim bar on top and every
 * player's city as a large card. No names, avatars or messages; a player is
 * their seat number and border colour.
 *
 * The bar holds the characters still to be called this round, in call order:
 * the one being called sits first, outlined in red; once its turn ends the
 * rest slide left. (Numbers nobody holds are skipped by the rules, so there
 * is no wait on them.) During the auction it shows the characters up for
 * bid. The open missions sit at its right end.
 */
function SultanBoard({s, g, lang}) {
  const [inspect, setInspect] = useState(null);
  const openChar = (k) => setInspect({kind: 'char', key: k, married: s.married[k] || null});
  const t = s.turn;
  const callOrder = (k) => (charOf(k).n == null ? 99 : charOf(k).n);
  let strip = [];
  if (s.phase === 'call' && t) {
    strip = Object.keys(s.owner)
      .filter((k) => charOf(k).n != null && (callOrder(k) > t.num || (callOrder(k) === t.num && !t.done[k])))
      .sort((a, b) => callOrder(a) - callOrder(b));
  } else if (s.phase === 'pyrrhic' || s.phase === 'call') {
    strip = Object.keys(s.owner)
      .filter((k) => charOf(k).n != null)
      .sort((a, b) => callOrder(a) - callOrder(b));
  } else if (s.phase === 'auction' && s.auction) {
    strip = s.auction.lots;
  }
  const current = s.phase === 'call' && t ? t.num : null;
  const active = (id) => {
    if (s.prompt) return s.prompt.to === id;
    if (s.phase === 'call' && t) return t.cards.some((k) => ownerOf(s, k) === id && !t.done[k]);
    if (s.phase === 'draft') return picksLeft(s, id) > 0;
    if (s.phase === 'auction') return !hasBid(s, id);
    return false;
  };
  const conquest = s.phase === 'conquest' && s.conquests && s.conquests[s.conquestAt];
  return (
    <div className={styles.board} data-seats={s.seats.length > 12 ? 'many' : s.seats.length > 8 ? 'some' : 'few'}>
      <div className={styles.topBar}>
        <div className={styles.callStrip} key={`${s.round}-${s.phase}-${current}`}>
          {strip.map((k) => (
            <button
              key={k}
              type="button"
              className={styles.stripCard}
              data-current={current != null && callOrder(k) === current}
              data-silenced={current != null && callOrder(k) === current && s.silenced.includes(current)}
              aria-label={charName(k, lang)}
              onClick={() => openChar(k)}>
              <CharCard k={k} lang={lang} size={72} />
            </button>
          ))}
        </div>
      </div>
      <div className={styles.cityGrid}>
        {crownFirst(s).map((id) => (
          <PlayerCard key={id} s={s} g={g} id={id} lang={lang} active={active(id)} hot={conquest && conquest.defender === id ? [conquest.uid] : []} onInspect={setInspect} />
        ))}
      </div>
      <EventModal s={s} g={g} lang={lang} name={(id) => (g.players[id] ? g.players[id].name : '?')} />
      <CardInspect item={inspect} lang={lang} onClose={() => setInspect(null)} />
    </div>
  );
}

/** Seats rotated so the crown holder comes first, the rest in seat order after them (letters stay with their seats). */
function crownFirst(s) {
  const i = Math.max(0, s.seats.indexOf(s.crown));
  return [...s.seats.slice(i), ...s.seats.slice(0, i)];
}

/** In event modals a player is shown in full: avatar, name and district letter. */
function PlayerTag({s, g, id, name, small = false}) {
  const p = g.players[id] || {};
  return (
    <span className={styles.playerTag} data-small={small}>
      <Avatar avatar={p.avatar} color={p.color} size={small ? 'xs' : 'md'} />
      <b>{name(id)}</b>
      <SeatBadge s={s} g={g} id={id} />
    </span>
  );
}

/** A player on the big screen is their district letter in their colour. */
function SeatBadge({s, g, id}) {
  const p = g.players[id] || {};
  return (
    <span className={styles.seatBadge} style={{'--owner': p.color || '#2a1630'}}>
      {letterOf(s, id)}
    </span>
  );
}

/** Coins as stacks of the game's coin token: up to 5 in a column, then a new column to the right. No number. */
function CoinStack({n}) {
  const src = useBaseUrl('/img/party/sultan/token-coin.webp');
  const shown = Math.min(n, 30);
  const cols = Array.from({length: Math.ceil(shown / 5)}, (_, c) => Math.min(5, shown - c * 5));
  return (
    <span className={styles.coinStack} aria-label={`${n}`}>
      {cols.map((h, c) => (
        <span key={c} className={styles.coinCol}>
          {Array.from({length: h}, (_, i) => (
            <img key={i} src={src} alt="" draggable={false} />
          ))}
        </span>
      ))}
    </span>
  );
}

/** One player on the big screen: the city fills the card; seat number, revealed characters, coins and hand size sit in its corners. */
function PlayerCard({s, g, id, lang, active, hot, onInspect}) {
  const ref = React.useRef(null);
  const [box, setBox] = useState(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setBox({width: e.contentRect.width, height: e.contentRect.height}));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const p = g.players[id] || {};
  const shown = s.hold[id].filter((k) => s.revealed[k]);
  return (
    <div className={styles.pcard} style={{'--owner': p.color || '#2a1630'}} data-hot={active} data-offline={!p.connected && !p.bot} data-out={isOut(s, id)}>
      <span className={styles.pSeat}>{letterOf(s, id)}</span>
      {s.crown === id && <span className={styles.pCrown}>{crown}</span>}
      {shown.length > 0 && (
        <span className={styles.pChars} data-many={shown.length > 1}>
          {shown.map((k) => (
            <button key={k} type="button" className={styles.cardButton} aria-label={charName(k, lang)} onClick={() => onInspect({kind: 'char', key: k, married: s.married[k] || null})}>
              <CharCard k={k} lang={lang} size={shown.length > 1 ? 34 : 40} />
            </button>
          ))}
        </span>
      )}
      <div className={styles.pCity} ref={ref}>
        {box && <CityPlot bare city={s.city[id].map((u) => ({uid: u, key: s.cards[u], value: valueOf(s, u)}))} goal={s.st.goal} fit={{width: box.width, height: box.height}} lang={lang} hot={hot} onTap={(c) => onInspect({kind: 'district', key: c.key, invest: s.invest[c.uid] || 0, letter: letterOf(s, id)})} />}
      </div>
      <span className={styles.pCoins}>
        <CoinStack n={s.gold[id]} />
      </span>
      <span className={styles.pHand}>🃏{s.hand[id].length}</span>
      {missionFor(s, id) && (
        <span className={styles.pMission} data-due={missionFor(s, id).due <= s.round} title={tg(lang, 'roundsLeft', {n: missionFor(s, id).due - s.round + 1})}>
          {missionFor(s, id).due - s.round + 1}
        </span>
      )}
      {isOut(s, id) && <span className={styles.pOut}>{tg(lang, 'outBadge')}</span>}
    </div>
  );
}

// ------------------------------------------------------------------ phone

function SultanPhone({view, lang, send}) {
  const [inspect, setInspect] = useState(null);
  const closeInspect = () => setInspect(null);
  const openChar = (key, extra = {}) => setInspect({kind: 'char', key, ...extra});
  const openDistrict = (key, extra = {}) => setInspect({kind: 'district', key, ...extra});
  const openEvent = (ev) => setInspect({kind: 'event', key: ev.kind, frame: ev.frame, reward: ev.reward, due: ev.due, round: view.round});

  const modal = <CardInspect item={inspect} lang={lang} onClose={closeInspect} />;

  const status = (
    <div className={shell.card}>
      <p className={shell.kicker}>
        {view.letter && <span className={styles.myLetter}>{tg(lang, 'yourDistrict', {x: view.letter})}</span>} {tg(lang, 'round', {n: view.round})} · {coin} {tg(lang, 'gold', {n: view.gold})} {view.crown && crown}
      </p>
      {view.won && view.won.length > 0 && (
        <div className={shell.chipRow}>
          {view.won.map((w) => (
            <span key={w.key} className={shell.chip}>
              {w.citizen ? tg(lang, 'gotCitizen', {x: charName(w.key, lang)}) : w.leftover ? tg(lang, 'gotLeftover', {x: charName(w.key, lang)}) : tg(lang, 'wonChar', {x: charName(w.key, lang), n: w.paid})}
            </span>
          ))}
        </div>
      )}
      {view.out && <p className={styles.last}>{tg(lang, 'youAreOut')}</p>}
      {view.events.length > 0 && (
        <div className={styles.myMission}>
          {view.events.map((e) => (
            <button key={e.kind} type="button" className={styles.cardButton} onClick={() => openEvent(e)}>
              <EventCard ev={e} lang={lang} size={44} />
            </button>
          ))}
          <span>
            <b>{tg(lang, 'yourMission')}</b>
            <br />
            {tg(lang, 'eventNeeds', {frame: L(FRAMES[view.events[0].frame], lang), reward: view.events[0].reward})}
            <br />
            <span className={styles.due}>{tg(lang, 'roundsLeft', {n: view.events[0].roundsLeft})}</span>
          </span>
          {view.canRedraw && (
            <button type="button" className="button button--sm button--secondary" onClick={() => send({action: 'redraw'})}>
              {tg(lang, 'redraw')}
            </button>
          )}
        </div>
      )}
      {view.mine.length > 0 && (
        <>
          <p className={shell.kicker}>{tg(lang, 'yourChars')}</p>
          <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
          <div className={styles.cards}>
            {view.mine.map((c) => (
              <button key={c.key} type="button" className={styles.cardButton} onClick={() => openChar(c.key, {married: c.married || null})}>
                <span className={styles.charWrap}>
                  <CharCard k={c.key} lang={lang} size={46} stats={view.statsOn} />
                  {c.married && <small>{tg(lang, 'married', {name: charName(c.married, lang)})}</small>}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <p className={shell.kicker}>
        {tg(lang, 'city')} ({view.city.length}/{view.goal})
      </p>
      <div className={styles.phoneCity}>
        <CityPlot city={view.city} goal={view.goal} color={(view.players.find((p) => p.id === view.me) || {}).color} scale={1.3} lang={lang} onTap={(c) => openDistrict(c.key, {invest: c.invest})} />
      </div>
    </div>
  );
  const handView = (
    <div className={shell.card}>
      <p className={shell.kicker}>{tg(lang, 'hand')}</p>
      <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
      <div className={styles.cards}>
        {view.hand.map((c) => (
          <button key={c.uid} type="button" className={styles.cardButton} onClick={() => openDistrict(c.key)}>
            <DistrictCard k={c.key} lang={lang} size={48} />
          </button>
        ))}
      </div>
    </div>
  );

  if (view.kind === 'over') {
    return (
      <>
        {view.says && <div className={`${shell.card} ${styles.saysResult}`} data-result={view.says}>{view.says === 'win' ? `🏰 ${tg(lang, 'saysWin')}` : `💀 ${tg(lang, 'saysLose', {x: ''})}`}</div>}
        <div className={`${shell.card} ${shell.bigText}`}>{tg(lang, 'points', {n: view.score})}</div>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'prompt') {
    return (
      <>
        <PromptCard view={view} lang={lang} send={send} openChar={openChar} />
        {modal}
      </>
    );
  }
  if (view.kind === 'draft') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'pickChar', {n: view.picksLeft})}</p>
        <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
        <div className={styles.cards}>
          {view.available.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.cardButton} ${styles.draftOption}`}
              onClick={() =>
                openChar(c.key, {
                  married: c.married || null,
                  action: c.ok
                    ? {
                        label: tg(lang, 'pickThis'),
                        onClick: () => send({action: 'draft', card: c.key}),
                      }
                    : {label: tg(lang, 'pickThis'), disabled: true},
                })
              }>
              <CharCard k={c.key} lang={lang} size={70} stats={view.statsOn} />
              <span className={styles.abilityText}>{L(charOf(c.key).ab, lang)}</span>
              {c.married && <small>{tg(lang, 'married', {name: charName(c.married, lang)})}</small>}
            </button>
          ))}
        </div>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'quiz') {
    return (
      <>
        <QuizView view={view} lang={lang} send={send} />
        {status}
      </>
    );
  }
  if (view.kind === 'bid') {
    return (
      <>
        <BidView view={view} lang={lang} send={send} openChar={openChar} />
        {modal}
      </>
    );
  }
  if (view.kind === 'pyrrhic') {
    const ev = view.events.find((e) => e.kind === 'pyrrhic');
    return (
      <>
        <button type="button" className={styles.cardButton} onClick={() => openEvent(ev)}>
          <EventCard ev={ev} lang={lang} size={70} />
        </button>
        <p className={shell.bigText}>{tg(lang, 'challengeWho')}</p>
        <div className={shell.choiceGrid}>
          {view.targets.map((p) => (
            <button key={p.id} type="button" className="button button--sm" onClick={() => send({action: 'challenge', target: p.id})}>
              {p.name}
            </button>
          ))}
        </div>
        <p className={shell.muted}>{tg(lang, 'skip')}: {tg(lang, 'waiting')}</p>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'turn') {
    return (
      <>
        <TurnView view={view} lang={lang} send={send} status={status} handView={handView} openChar={openChar} openDistrict={openDistrict} openEvent={openEvent} />
        {modal}
      </>
    );
  }
  return (
    <>
      <p className={shell.waiting}>
        {view.legacy
          ? tg(lang, 'legacy')
          : view.waitFor
                ? tg(lang, 'waitFor', {name: view.waitFor})
                : view.turnDone
                  ? tg(lang, 'turnDone')
                  : view.mine.length
                    ? tg(lang, 'nobodyCalled')
                    : view.phase === 'draft'
                      ? tg(lang, 'waitDraft')
                      : tg(lang, 'nextRound')}
      </p>
      {view.calling != null && <div className={shell.card}>{tg(lang, 'calling', {n: view.calling})}</div>}
      {status}
      {handView}
      {modal}
    </>
  );
}

/** Math round: the problems one at a time on the pad; the ones done are listed with ✓ or ✗. */
function QuizView({view, lang, send}) {
  const i = view.quiz.findIndex((q) => !q.state);
  const q = view.quiz[i];
  return (
    <div className={shell.card}>
      <p className={shell.bigText}>{tg(lang, 'quizTitle')}</p>
      <p className={shell.muted}>{tg(lang, 'quizRule')}</p>
      <ol className={styles.quizList}>
        {view.quiz.map((x, n) => (
          <li key={n} className={styles.quizItem} data-state={x.state || (n === i ? 'now' : 'todo')}>
            {x.state === 'ok' ? '✓' : x.state === 'wrong' ? '✗' : n === i ? '▶' : '·'} {x.state ? x.lines.join('  ') : ''}
          </li>
        ))}
      </ol>
      {q && <MathPad key={i} question={q} lang={lang} onAnswer={(value) => send({action: 'quiz', index: i, value})} okLabel="OK" />}
    </div>
  );
}

/**
 * Secret auction: the characters in a grid (three to a row on a phone), a
 * purse of the coins you may bid, and + / − under each card. Every + sends a
 * coin flying from the purse to that card. Bids can be changed until the
 * auction closes; any split, equal amounts allowed.
 */
function BidView({view, lang, send, openChar}) {
  const {cap, lots, placed, math} = view.bid;
  const [bids, setBids] = useState(() => ({...(placed || {})}));
  const [flights, setFlights] = useState([]);
  const purseRef = React.useRef(null);
  const spent = Object.values(bids).reduce((a, b) => a + b, 0);
  const left = cap - spent;
  const fly = (el) => {
    const from = purseRef.current && purseRef.current.getBoundingClientRect();
    const to = el && el.getBoundingClientRect();
    if (!from || !to) return;
    const id = `${Date.now()}-${Math.random()}`;
    const f = {id, x: from.left + from.width / 2, y: from.top + from.height / 2, dx: to.left + to.width / 2 - (from.left + from.width / 2), dy: to.top + to.height / 2 - (from.top + from.height / 2)};
    setFlights((list) => [...list, f]);
    setTimeout(() => setFlights((list) => list.filter((x) => x.id !== id)), 650);
  };
  const add = (key, e) => {
    if (left < 1) return;
    fly(e.currentTarget.closest(`.${styles.bidTile}`)?.querySelector(`.${styles.bidCard}`));
    setBids((b) => ({...b, [key]: (b[key] || 0) + 1}));
  };
  const remove = (key) =>
    setBids((b) => {
      const next = {...b};
      if (next[key] > 1) next[key] -= 1;
      else delete next[key];
      return next;
    });
  const same = JSON.stringify(Object.entries(bids).sort()) === JSON.stringify(Object.entries(placed || {}).sort());
  return (
    <>
      <div className={shell.card}>
        <p className={shell.bigText}>{tg(lang, 'bidTitle')}</p>
        <p className={shell.muted}>{math ? tg(lang, 'bidRule') : tg(lang, 'bidRuleNoMath', {cap})}</p>
        <div className={styles.purse} ref={purseRef} aria-live="polite">
          {Array.from({length: cap}, (_, i) => (
            <span key={i} className={styles.purseCoin} data-spent={i >= left}>
              {coin}
            </span>
          ))}
          <span>{cap > 0 ? tg(lang, 'purse', {n: left, cap}) : tg(lang, 'noCoins')}</span>
        </div>
      </div>
      <div className={styles.bidGrid}>
        {lots.map((c) => {
          const n = bids[c.key] || 0;
          const label = charName(c.key, lang);
          return (
            <div key={c.key} className={styles.bidTile} data-bid={n > 0}>
              <button type="button" className={`${styles.cardButton} ${styles.bidCard}`} onClick={() => openChar(c.key, {married: c.married || null})}>
                <CharCard k={c.key} lang={lang} size={64} />
                {n > 0 && (
                  <span key={n} className={styles.bidBadge}>
                    {coin}
                    {n}
                  </span>
                )}
              </button>
              <span className={styles.bidName}>{label}</span>
              <span className={styles.bidButtons}>
                <button type="button" className="button button--sm button--secondary" disabled={n < 1} aria-label={tg(lang, 'removeBid', {x: label})} onClick={() => remove(c.key)}>
                  −
                </button>
                <button type="button" className="button button--sm button--primary" disabled={left < 1} aria-label={tg(lang, 'addBid', {x: label})} onClick={(e) => add(c.key, e)}>
                  +
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.bidSummary}>
        <span className={shell.muted}>{placed ? tg(lang, 'bidsPlaced') : ''}</span>
        <button type="button" className="button button--primary" disabled={Boolean(placed) && same} onClick={() => send({action: 'bid', bids})}>
          {placed ? tg(lang, 'updateBids') : spent > 0 ? tg(lang, 'placeBids') : tg(lang, 'passBid')}
        </button>
      </div>
      {flights.map((f) => (
        <span key={f.id} className={styles.flyingCoin} style={{left: f.x, top: f.y, '--dx': `${f.dx}px`, '--dy': `${f.dy}px`}}>
          {coin}
        </span>
      ))}
    </>
  );
}

function PromptCard({view, lang, send, openChar}) {
  const p = view.prompt;
  const yesNo = (yesLabel, noLabel) => (
    <div className={shell.choiceGrid}>
      <button type="button" className="button button--lg" onClick={() => send({action: 'answer', yes: true})}>
        {yesLabel}
      </button>
      <button type="button" className="button button--lg button--secondary" onClick={() => send({action: 'answer', yes: false})}>
        {noLabel}
      </button>
    </div>
  );
  return (
    <div className={shell.card}>
      {p.kind === 'shield' && (
        <>
          <button type="button" className={styles.cardButton} onClick={() => openChar && openChar('priest')}>
            <CharCard k="priest" lang={lang} size={70} />
          </button>
          <p className={shell.bigText}>{tg(lang, 'p_shield', {name: p.from, what: tg(lang, `eff_${p.what}`)})}</p>
          {yesNo(tg(lang, 'useShield'), tg(lang, 'noShield'))}
        </>
      )}
      {p.kind === 'raise' && (
        <>
          <p className={shell.bigText}>{tg(lang, 'p_raise', {name: p.from, max: p.max})}</p>
          <div className={shell.choiceGrid}>
            {Array.from({length: Math.max(1, p.max)}, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className="button" onClick={() => send({action: 'answer', bet: n})}>
                {tg(lang, 'bet', {n})}
              </button>
            ))}
          </div>
        </>
      )}
      {p.kind === 'champion' && (
        <>
          <p className={shell.bigText}>{tg(lang, 'p_champion')}</p>
          <div className={styles.cards}>
            {p.cards.map((k) => (
              <button
                key={k}
                type="button"
                className={styles.cardButton}
                onClick={() =>
                  openChar
                    ? openChar(k, {
                        action: {
                          label: tg(lang, 'pickThis'),
                          onClick: () => send({action: 'answer', card: k}),
                        },
                      })
                    : send({action: 'answer', card: k})
                }>
                <CharCard k={k} lang={lang} size={70} stats />
              </button>
            ))}
          </div>
        </>
      )}
      {p.kind === 'date' && (
        <>
          <div className={styles.cards}>
            <button type="button" className={styles.cardButton} onClick={() => openChar && openChar(p.mine)}>
              <CharCard k={p.mine} lang={lang} size={60} stats />
            </button>
            <span className={shell.bigText}>+</span>
            <button type="button" className={styles.cardButton} onClick={() => openChar && openChar(p.other)}>
              <CharCard k={p.other} lang={lang} size={60} stats />
            </button>
          </div>
          <p>{tg(lang, 'p_date', {name: p.from, mine: charName(p.mine, lang), other: charName(p.other, lang)})}</p>
          {yesNo(tg(lang, 'agree'), tg(lang, 'refuse'))}
        </>
      )}
      {p.kind === 'ally' && (
        <>
          <p className={shell.bigText}>{tg(lang, 'p_ally', {name: p.from, n: p.offer})}</p>
          {yesNo(tg(lang, 'accept'), tg(lang, 'refuse'))}
        </>
      )}
    </div>
  );
}

function TurnView({view, lang, send, status, handView, openChar, openDistrict, openEvent}) {
  const tv = view.turn;
  const c = charOf(tv.card);
  const act = (msg) => send({...msg, card: tv.card});
  const [guessTarget, setGuessTarget] = useState(null);
  const [redraw, setRedraw] = useState([]);
  const [conquest, setConquest] = useState(null);
  const [gifts, setGifts] = useState({});
  const header = (
    <div className={styles.turnHead}>
      <button type="button" className={styles.cardButton} onClick={() => openChar(tv.card)}>
        <CharCard k={tv.card} lang={lang} size={56} stats={view.statsOn} />
      </button>
      <div>
        <p className={shell.bigText}>{tg(lang, 'yourTurn', {name: lang === 'zh' ? c.zh : c.en})}</p>
        <p className={shell.muted}>{L(c.ab, lang)}</p>
      </div>
    </div>
  );
  if (tv.step === 'income') {
    return (
      <>
        {header}
        <div className={shell.choiceGrid}>
          <button type="button" className="button button--lg" onClick={() => act({action: 'gold'})}>
            {coin} {tg(lang, 'takeGold')}
          </button>
          <button type="button" className="button button--lg" onClick={() => act({action: 'cards'})}>
            🃏 {tg(lang, 'takeCards')}
          </button>
        </div>
        {status}
        {handView}
      </>
    );
  }
  if (tv.step === 'keep') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'keepOne')}</p>
        <div className={styles.cards}>
          {tv.drawn.map((d) => (
            <button
              key={d.uid}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                openDistrict(d.key, {
                  action: {
                    label: tg(lang, 'keepThis'),
                    onClick: () => act({action: 'keep', uid: d.uid}),
                  },
                })
              }>
              <DistrictCard k={d.key} lang={lang} size={84} />
            </button>
          ))}
        </div>
      </>
    );
  }
  const can = tv.usesLeft > 0 && !tv.waiting;
  const panel = (title, children) => (
    <div className={shell.card}>
      <b>{title}</b>
      {children}
    </div>
  );
  const ability = () => {
    const k = tv.card;
    if (!can) return null;
    if (['banditA', 'banditB', 'thief'].includes(k) && tv.numbers.length)
      return panel(
        tg(lang, 'nameNumber'),
        <div className={shell.choiceGrid}>
          {tv.numbers.map((n) => (
            <button key={n} type="button" className="button button--sm" onClick={() => act({action: k === 'thief' ? 'rob' : 'silence', number: n})}>
              {n}
            </button>
          ))}
        </div>,
      );
    if (k === 'fighter' && tv.hiddenPlayers.length)
      return panel(
        guessTarget ? tg(lang, 'guessWhat') : tg(lang, 'guessWho'),
        guessTarget ? (
          <div className={styles.cards}>
            {tv.guesses.map((g) => (
              <button
                key={g}
                type="button"
                className={styles.cardButton}
                onClick={() =>
                  openChar(g, {
                    action: {
                      label: tg(lang, 'pickThis'),
                      onClick: () => act({action: 'guess', target: guessTarget, guess: g}),
                    },
                  })
                }>
                <CharCard k={g} lang={lang} size={40} />
              </button>
            ))}
          </div>
        ) : (
          <div className={shell.choiceGrid}>
            {tv.hiddenPlayers.map((p) => (
              <button key={p.id} type="button" className="button button--sm" onClick={() => setGuessTarget(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        ),
      );
    if (k === 'mage')
      return panel(
        tg(lang, 'swapWith'),
        <>
          <div className={shell.choiceGrid}>
            {view.players
              .filter((p) => p.id !== view.me)
              .map((p) => (
                <button key={p.id} type="button" className="button button--sm" onClick={() => act({action: 'swapHand', target: p.id})}>
                  <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name} · 🃏{p.hand}
                </button>
              ))}
          </div>
          <div className={styles.cards}>
            {view.hand.map((h) => (
              <button key={h.uid} type="button" className={styles.cardButton} aria-pressed={redraw.includes(h.uid)} onClick={() => setRedraw((r) => (r.includes(h.uid) ? r.filter((x) => x !== h.uid) : [...r, h.uid]))}>
                <DistrictCard k={h.key} lang={lang} size={36} />
              </button>
            ))}
          </div>
          <button type="button" className="button button--sm button--secondary" disabled={!redraw.length} onClick={() => act({action: 'redraw', uids: redraw})}>
            {tg(lang, 'redraw')} ({redraw.length})
          </button>
        </>,
      );
    if (k === 'princess' && tv.unpicked.length)
      return panel(
        tg(lang, 'reserve'),
        <div className={styles.cards}>
          {tv.unpicked.map((u) => (
            <button
              key={u}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                openChar(u, {
                  action: {
                    label: tg(lang, 'reserve'),
                    onClick: () => act({action: 'reserve', pick: u}),
                  },
                })
              }>
              <CharCard k={u} lang={lang} size={40} />
            </button>
          ))}
        </div>,
      );
    const targetList = (list, action) => (
      <div className={shell.choiceGrid}>
        {list.map((x) => (
          <button key={x.uid} type="button" className="button button--sm" onClick={() => act({action, uid: x.uid})}>
            {x.owner}: {L(DISTRICT[x.key], lang)} · {x.price}
          </button>
        ))}
      </div>
    );
    if (k === 'official' && tv.buys.length) return panel(tg(lang, 'buy'), targetList(tv.buys, 'buy'));
    if (k === 'general' && tv.destroys.length) return panel(tg(lang, 'destroy'), targetList(tv.destroys, 'destroy'));
    if (k === 'scholar' && view.city.length && view.gold >= 1)
      return panel(
        tg(lang, 'invest'),
        <div className={shell.choiceGrid}>
          {view.city.map((d) =>
            [1, 2]
              .filter((n) => n <= view.gold)
              .map((n) => (
                <button key={`${d.uid}-${n}`} type="button" className="button button--sm" onClick={() => act({action: 'invest', uid: d.uid, n})}>
                  {L(DISTRICT[d.key], lang)} +{n}
                </button>
              )),
          )}
        </div>,
      );
    if (k === 'lucky' && view.gold >= 1)
      return panel(
        tg(lang, 'ability'),
        <button type="button" className="button" onClick={() => act({action: 'gamble'})}>
          {tg(lang, 'gamble')}
        </button>,
      );
    return null;
  };
  const ev = (kind) => view.events.find((e) => e.kind === kind && e.can);
  const total = Object.values(gifts).reduce((a, b) => a + b, 0);
  return (
    <>
      {header}
      {tv.stealFrom &&
        panel(
          tg(lang, 'stealPick'),
          <div className={styles.cards}>
            {tv.stealFrom.map((d) => (
              <button
                key={d.uid}
                type="button"
                className={styles.cardButton}
                onClick={() =>
                  openDistrict(d.key, {
                    action: {
                      label: tg(lang, 'stealPick'),
                      onClick: () => act({action: 'steal', uid: d.uid}),
                    },
                  })
                }>
                <DistrictCard k={d.key} lang={lang} size={48} />
              </button>
            ))}
          </div>,
        )}
      {tv.usesLeft > 1 && <p className={shell.kicker}>{tg(lang, 'abilityLeft', {n: tv.usesLeft})}</p>}
      {ability()}
      {(tv.smithy || tv.lab) && (
        <div className={shell.choiceGrid}>
          {tv.smithy && (
            <button type="button" className="button button--sm" onClick={() => act({action: 'smithy'})}>
              {tg(lang, 'smithy')}
            </button>
          )}
          {tv.lab &&
            view.hand.map((h) => (
              <button key={h.uid} type="button" className="button button--sm" onClick={() => act({action: 'lab', uid: h.uid})}>
                {tg(lang, 'lab')}: {L(DISTRICT[h.key], lang)}
              </button>
            ))}
        </div>
      )}
      {view.events.length > 0 && (
        <div className={shell.card}>
          <b>{tg(lang, 'yourMission')}</b>
          <div className={styles.cards}>
            {view.events.map((e) => (
              <button key={e.kind} type="button" className={`${styles.cardButton} ${styles.eventSlot}`} data-used={!e.can} onClick={() => openEvent(e)}>
                <EventCard ev={e} lang={lang} size={40} />
                <small>{tg(lang, 'eventNeeds', {frame: L(FRAMES[e.frame], lang), reward: e.reward})}</small>
                <small className={styles.due}>{tg(lang, 'roundsLeft', {n: e.roundsLeft})}</small>
              </button>
            ))}
          </div>
          {ev('marriage') && tv.dates.length > 0 && !tv.waiting && (
            <>
              <p className={shell.kicker}>{tg(lang, 'marry')}</p>
              <div className={styles.cards}>
                {tv.dates.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={styles.cardButton}
                    onClick={() =>
                      openChar(d.key, {
                        action: {
                          label: tg(lang, 'marry'),
                          onClick: () => act({action: 'marry', mine: tv.card, other: d.key}),
                        },
                      })
                    }>
                    <CharCard k={d.key} lang={lang} size={40} stats />
                    <small>{d.owner}</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {ev('conquest') && tv.targets.length > 0 && (
            <>
              <p className={shell.kicker}>{tg(lang, 'conquer')}</p>
              {!conquest ? (
                <div className={shell.choiceGrid}>
                  {tv.targets.map((x) => (
                    <button key={x.uid} type="button" className="button button--sm" onClick={() => setConquest({uid: x.uid, ally: null, offer: 1})}>
                      {x.owner}: {L(DISTRICT[x.key], lang)} ({tg(lang, 'value', {n: x.value})})
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <p>{tg(lang, 'ally')}</p>
                  <div className={shell.choiceGrid}>
                    <button type="button" className="button button--sm" aria-pressed={!conquest.ally} onClick={() => setConquest({...conquest, ally: null})}>
                      {tg(lang, 'noAlly')}
                    </button>
                    {view.players
                      .filter((p) => p.id !== view.me)
                      .map((p) => (
                        <button key={p.id} type="button" className="button button--sm" aria-pressed={conquest.ally === p.id} onClick={() => setConquest({...conquest, ally: p.id})}>
                          {p.name}
                        </button>
                      ))}
                  </div>
                  {conquest.ally && (
                    <div className={shell.choiceGrid}>
                      {[0, 1, 2, 3].map((n) => (
                        <button key={n} type="button" className="button button--sm" aria-pressed={conquest.offer === n} onClick={() => setConquest({...conquest, offer: n})}>
                          {tg(lang, 'offer', {n})}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" className="button" onClick={() => act({action: 'conquer', ...conquest})}>
                    {tg(lang, 'conquer')}
                  </button>
                </>
              )}
            </>
          )}
          {ev('extravagance') && (
            <>
              <p className={shell.kicker}>{tg(lang, 'extravagance', {n: tv.charisma})}</p>
              <div className={shell.choiceGrid}>
                {view.players
                  .filter((p) => p.id !== view.me)
                  .map((p) => (
                    <button key={p.id} type="button" className="button button--sm" disabled={total >= tv.charisma} onClick={() => setGifts((g) => ({...g, [p.id]: (g[p.id] || 0) + 1}))}>
                      {tg(lang, 'give')} → {p.name} ({gifts[p.id] || 0})
                    </button>
                  ))}
              </div>
              <button type="button" className="button" disabled={total !== tv.charisma} onClick={() => act({action: 'extravagance', gifts})}>
                {tv.charisma - total > 0 ? tg(lang, 'toGive', {n: tv.charisma - total}) : tg(lang, 'extravagance', {n: tv.charisma})}
              </button>
            </>
          )}
        </div>
      )}
      <p className={shell.kicker}>{tg(lang, 'build', {n: tv.buildLeft})}</p>
      <div className={shell.card}>
        <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
        <div className={styles.cards}>
          {view.hand.map((h) => (
            <button
              key={h.uid}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                openDistrict(h.key, {
                  action: {
                    label: tg(lang, 'buildThis'),
                    disabled: !h.ok,
                    onClick: () => act({action: 'build', uid: h.uid}),
                  },
                })
              }>
              <DistrictCard k={h.key} lang={lang} size={60} />
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="button button--lg button--block" disabled={tv.waiting} onClick={() => act({action: 'end'})}>
        {tv.twinsFirst ? tg(lang, 'endFirst') : tg(lang, 'endTurn')}
      </button>
      {status}
    </>
  );
}

export default sultan;
