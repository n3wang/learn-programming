import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import MathPad, {MathRich, PoolPicker} from '../../core/MathPad';
import {CHARS, DISTRICT, EVENTS, EVENT_ART, FRAMES, TYPES, basePool, charOf, isoDistrict} from './data';
import {ArenaFloor, CityPlot, IsoGrid} from './IsoCity';
import Dice3D from './Dice3D';
import {
  acting,
  answer,
  answerQuiz,
  bidCap,
  canBid,
  canSoftCommand,
  canSoftReserve,
  hasBid,
  joinLate,
  isOut,
  launchDice,
  commandFor,
  redrawCommand,
  placeBids,
  quizCount,
  quizLeft,
  canBuild,
  canPick,
  canUseEvent,
  challenge,
  draftPick,
  diceHasPlayer,
  generalTargets,
  hiddenPlayers,
  nameableNumbers,
  officialTargets,
  ownerOf,
  picksLeft,
  setupSultan,
  settingsOf,
  softReady,
  commandSnap,
  letterOf,
  timeout,
  turnAction,
  valueOf,
} from './rules';

export {districtLetter} from './rules';
import {botMove} from './bot';
import shell from '../../core/party.module.css';
import styles from './sultan.module.css';

/** Rules text with coloured keywords: "[coin|2 coins]" → a span coloured by kind (coin, char, district, command, crown, good, bad). */
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
    softLater: 'Still open until calling ends',
    softReserve: 'Reserve a character (still open)',
    softCommand: 'Command still open',
    endWhileWait: 'End turn — finish the command while you wait',
    endFirst: 'End first turn (the Twins go again)',
    hand: 'Your hand',
    city: 'Your city',
    yourChars: 'Your characters',
    tapPreview: 'Tap a card to preview',
    closePreview: 'Close',
    pickThis: 'Pick this character',
    keepThis: 'Keep this card',
    buildThis: 'Build this district',
    tapBuild: 'Tap a building card in your hand, then choose Build',
    type: 'Type',
    cost: 'Cost',
    number: 'Number',
    frame: 'Tier',
    gold: '{n} coins',
    ability: 'Ability',
    abilityLeft: 'Ability ({n} left)',
    nameNumber: 'Name a number',
    guessWho: 'Which player?',
    guessWhat: 'Which character do they hide?',
    stealPick: 'Right! Take one of their districts:',
    swapWith: 'Swap non-agent cards with…',
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
    s_says: "Sultan's Madness (co-op)",
    saysNote: "Co-op: the Sultan deals commands; each must succeed within 4 rounds or everyone loses. Broken commands never return to the pool — empty it to win. Deck size scales with the table (Stone → Bronze → Silver → Gold). Stat events are always on.",
    saysTitle: "Sultan's Madness…",
    saysLeft: '{done} of {total} commands broken · {left} still in the deck',
    dueNow: 'due this round!',
    dueNext: 'due next round',
    saysWin: 'The city stands! Every command is broken.',
    saysLose: 'The Sultan is displeased: {x} was not done in time. Everyone loses.',
    mvp: 'MVP: {name}',
    log_command: 'completed {x} (+{n} coins)',
    inspNeeds: 'Who can start it',
    inspNeedsValue: '{frame} tier or higher',
    inspReward: 'Reward on success',
    inspDeadline: 'Deadline',
    inspDone: 'Done ✓',
    commandDeadlineWarn: '{n} days to accomplish, or you will be executed',
    inspOwner: 'District',
    commandOwner: 'Owner',
    yourDistrict: 'Your district: {x}',
    yourCommand: "Your Sultan's command",
    roundsLeft: '{n} round(s) left',
    redraw: 'Redraw (once)',
    outBadge: 'Executed',
    youAreOut: 'Your command ran out of time: you have been executed.',
    log_out: 'missed their command and was executed.',
    marry: 'Marriage: date with…',
    conquer: 'Conquest',
    conquerPick: 'Tap a building in their city',
    foldOpen: 'Tap to open',
    foldClose: 'Tap to close',
    ally: 'Ask an ally (optional)',
    noAlly: 'No ally',
    offer: 'Offer the ally {n} coins',
    extravagance: 'Extravagance: give away {n} coins',
    splitEven: 'Split evenly',
    give: 'Give',
    toGive: '{n} left to give',
    rollDice: 'Tap to roll (+1)',
    rollAuto: 'Auto in {n}s',
    rollWait: 'Waiting for dice…',
    rollSettling: 'Dice are in…',
    scoreParts: 'Score breakdown',
    scoreEffects: 'Special effects',
    scoreTotal: 'Total',
    scoreSkip: 'Skip',
    waiting: 'Waiting…',
    nobodyCalled: 'Waiting for your character to be called.',
    turnDone: 'Your turns are done. Watch the others.',
    waitWhenCalled: 'When #{n} · {name} is called, you can:',
    waitIncome: 'Take 2 coins, or draw 2 and keep 1',
    waitSkill: 'Use their skill',
    waitBuild: 'Build up to {n} district{s}',
    waitTurnsLeft: 'Still waiting for your number…',
    revealBids: 'Bids on this character',
    revealWon: 'Won!',
    revealLost: 'Outbid',
    revealLostLong: 'You were outbid',
    revealJoins: 'Joins your hand',
    revealJoinsAfter: 'These join your hand instead',
    revealSkip: 'Continue',
    revealTitle: 'Auction results',
    final: 'Final scores',
    points: '{n} pts',
    value: 'value {n}',
    combat: 'Combat',
    charisma: 'Charisma',
    married: 'married to {name}',
    waitFor: 'Waiting for {name}…',
    p_shield: '{name} targets you ({what}). Use the Priest’s shield? (once per round)',
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
    eff_swap: 'swap non-agent cards',
    eff_destroy: 'destroy a district',
    eff_buy: 'buy a district',
    eff_conquest: 'conquer a district',
    eff_pyrrhic: 'a Pyrrhic duel',
    bet: 'Bet {n}',
    lockBet: 'Lock bet',
    raiseHint: 'Tap + to raise. Coins stack on the wager.',
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
    sec: '{n} sec',
    s_select: 'Choosing characters',
    s_pickTurns: 'Pick in turn',
    s_auction: 'Math + auction',
    s_mathPools: 'Math problems',
    s_math: 'Math round',
    quizTitle: 'Solve for coins',
    quizRule: 'Each right answer earns 1 coin for this round’s bid purse. One try per problem. Finish fast: the time left is for bidding.',
    quizYours: 'you',
    quizAnswer: 'answer',
    quizDone: 'Moving to bids…',
    auctionHost: 'Math + secret auction',
    auctionHostLine: 'Solve, then bid. Highest wins; unspent bid coins → treasure.',
    bidTitle: 'Bid for characters',
    bidRule: 'Highest bid wins; crown breaks ties. Only winners pay; unspent coins → treasure. No win → Citizen.',
    bidRuleNoMath: 'Bid up to {cap}. Highest wins; crown breaks ties. Only winners pay.',
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
    softLater: '回合调用结束前仍可完成',
    softReserve: '仍可预留角色',
    softCommand: '敕令仍可完成',
    endWhileWait: '结束回合 — 等待时可再完成敕令',
    endFirst: '结束第一回合（双再来一次）',
    hand: '你的手牌',
    city: '你的城市',
    yourChars: '你的角色',
    tapPreview: '点卡片可预览',
    closePreview: '关闭',
    pickThis: '选择这个角色',
    keepThis: '留下这张牌',
    buildThis: '建造这个区域',
    tapBuild: '点选手牌里的建筑牌，再选择建造',
    type: '类型',
    cost: '费用',
    number: '号码',
    frame: '品阶',
    gold: '{n} 金币',
    ability: '能力',
    abilityLeft: '能力（还可用 {n} 次）',
    nameNumber: '叫出一个号码',
    guessWho: '指定哪位玩家？',
    guessWhat: '他藏着哪个角色？',
    stealPick: '猜中了！拿走他的一个区域：',
    swapWith: '和谁交换非角色牌……',
    redraw: '弃牌重抽（+1）',
    reserve: '预留到下一轮',
    buy: '购买区域（价值 +1）',
    destroy: '摧毁区域（价值 −1）',
    invest: '投资一个区域',
    gamble: '付 1 金币掷骰',
    smithy: '铁匠铺：付 2 抽 3',
    lab: '实验室：弃 1 张得 2 金币',
    events: '事件牌',
    eventNeeds: '需要{frame}阶或更高 · 奖励 {reward}',
    s_mode: '游戏模式',
    s_classicMode: '经典',
    s_says: '苏丹狂令（合作）',
    saysNote: '合作模式：苏丹发布敕令，每个敕令必须在 4 轮内成功，否则全员失败。已打破的敕令永不回池——清空牌池即胜。牌池随人数扩展（石 → 铜 → 银 → 金）。属性事件始终开启。',
    saysTitle: '苏丹狂令…',
    saysLeft: '已打破 {done} / {total} 个敕令 · 牌堆还剩 {left} 张',
    dueNow: '本轮截止！',
    dueNext: '下轮截止',
    saysWin: '城市屹立不倒！所有敕令都已打破。',
    saysLose: '苏丹不悦：{x}没有按时完成。全员失败。',
    mvp: '最佳玩家：{name}',
    log_command: '完成了{x}（+{n} 金币）',
    inspNeeds: '谁能发起',
    inspNeedsValue: '{frame}阶或更高的角色',
    inspReward: '成功奖励',
    inspDeadline: '截止',
    inspDone: '已完成 ✓',
    commandDeadlineWarn: '还剩 {n} 天完成，否则你将被处决',
    inspOwner: '区域',
    commandOwner: '持有者',
    yourDistrict: '你的区域：{x}',
    yourCommand: '你的苏丹敕令',
    roundsLeft: '还剩 {n} 轮',
    redraw: '换一张（限一次）',
    outBadge: '已处决',
    youAreOut: '敕令超时：你已被处决。',
    log_out: '没有完成敕令，被处决。',
    marry: '婚姻：和谁约会……',
    conquer: '征服',
    conquerPick: '点对方城里的一座建筑',
    foldOpen: '点开',
    foldClose: '收起',
    ally: '请求盟友（可选）',
    noAlly: '不要盟友',
    offer: '给盟友 {n} 金币',
    extravagance: '丰裕：送出 {n} 金币',
    splitEven: '平均分配',
    give: '送',
    toGive: '还剩 {n} 金币要送',
    rollDice: '点骰掷出（+1）',
    rollAuto: '{n} 秒后自动',
    rollWait: '等待掷骰……',
    rollSettling: '骰子已出……',
    scoreParts: '得分明细',
    scoreEffects: '特殊效果',
    scoreTotal: '合计',
    scoreSkip: '跳过',
    waiting: '等待中……',
    nobodyCalled: '等待你的角色被传召。',
    turnDone: '你的回合结束了，看看其他人。',
    waitWhenCalled: '当传召 #{n} · {name} 时，你可以：',
    waitIncome: '拿 2 金币，或抽 2 留 1',
    waitSkill: '使用角色能力',
    waitBuild: '最多建造 {n} 个区域',
    waitTurnsLeft: '还在等你的号码……',
    revealBids: '此角色的出价',
    revealWon: '拍得！',
    revealLost: '被超过',
    revealLostLong: '你被超过了',
    revealJoins: '加入你的手牌',
    revealJoinsAfter: '这些改为加入你的手牌',
    revealSkip: '继续',
    revealTitle: '拍卖结果',
    final: '最终得分',
    points: '{n} 分',
    value: '价值 {n}',
    combat: '战斗力',
    charisma: '魅力',
    married: '与{name}结为伴侣',
    waitFor: '等待{name}……',
    p_shield: '{name}针对你（{what}）。使用教的护盾吗？（每轮一次）',
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
    eff_swap: '交换非角色牌',
    eff_destroy: '摧毁区域',
    eff_buy: '购买区域',
    eff_conquest: '征服区域',
    eff_pyrrhic: '惨烈决斗',
    bet: '下注 {n}',
    lockBet: '锁定赌注',
    raiseHint: '点 + 加注。金币会叠到赌注上。',
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
    sec: '{n} 秒',
    s_select: '选角方式',
    s_pickTurns: '轮流挑选',
    s_auction: '算题 + 拍卖',
    s_mathPools: '数学题',
    s_math: '数学回合',
    quizTitle: '答题赚金币',
    quizRule: '每答对一题得 1 枚本轮出价金币（先入出价袋）。每题只能答一次。答得快，出价时间就多。',
    quizYours: '你的',
    quizAnswer: '正解',
    quizDone: '即将开始出价…',
    auctionHost: '算题 + 秘密拍卖',
    auctionHostLine: '先答题再出价。最高得；没用完的出价金币进宝库。',
    bidTitle: '竞拍角色',
    bidRule: '出价最高者得；平局王冠优先。只有赢家付钱；没用完的进宝库。没拍到 → 平民。',
    bidRuleNoMath: '最多用 {cap} 枚。最高者得；平局王冠优先。只有赢家付钱。',
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
  winner: {en: 'The legend of the Sultan’s city belongs to {letter}.', zh: '苏丹之城的传奇，属于{letter}。'},
  says_win: {en: "Sultan's Madness ends: every command is broken, and the city stands!", zh: '苏丹狂令结束：所有敕令都已打破，城市屹立不倒！'},
  says_lose: {en: "Sultan's Madness: a command was left undone, and the city falls.", zh: '苏丹狂令：有敕令没有完成，城市陷落了。'},
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

/** Sort key so agents always show as 1, 2, 3… (null / weaver last). */
const charNum = (k) => {
  const c = charOf(k);
  return c && c.n != null ? c.n : 99;
};
const byCharNum = (a, b) => charNum(a) - charNum(b) || String(a).localeCompare(String(b));

/** "ATK 4 · CHA 5" (Combat, Charisma). */
const statLine = (c, lang) => (lang === 'zh' ? `战 ${c.combat} · 魅 ${c.charisma}` : `ATK ${c.combat} · CHA ${c.charisma}`);

function CharCard({k, lang, size = 64, stats = false, married = null}) {
  const c = charOf(k);
  if (!c) return null;
  const spouse = married ? charOf(married) : null;
  return (
    <span className={styles.charWrap}>
      <Sprite path={c.art} emoji={c.zh} label={charName(k, lang)} tint={FRAMES[c.frame].tint} shape="tall" size={`${size}px`} />
      {stats && (
        <span className={styles.statBadge}>
          {statLine(c, lang)}
          {spouse && spouse.n != null && (
            <span className={styles.marriedPip} title={charName(married, lang)}>
              {' '}
              · 💍{spouse.n}
            </span>
          )}
        </span>
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

function EventCard({ev, lang, size = 56, dueBadge = null}) {
  return (
    <span className={styles.charWrap}>
      <Sprite path={`sultan/${EVENT_ART[ev.kind]}-${ev.frame}.webp`} emoji="📜" label={L(EVENTS[ev.kind], lang)} tint={FRAMES[ev.frame].tint} shape="tall" size={`${size}px`} />
      {dueBadge != null && (
        <span className={styles.commandDueBadge} data-urgent={dueBadge <= 1 || undefined} data-failed={ev.failed || undefined}>
          {ev.failed ? 0 : dueBadge}
        </span>
      )}
    </span>
  );
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
    art = <CharCard k={item.key} lang={lang} size={168} stats married={item.married || null} />;
    title = charName(item.key, lang);
    rows = [
      [tg(lang, 'number'), c.n == null ? '–' : String(c.n)],
      [tg(lang, 'frame'), L(FRAMES[c.frame], lang)],
      [tg(lang, 'combat'), String(c.combat)],
      [tg(lang, 'charisma'), String(c.charisma)],
    ];
    ability = L(c.ab, lang);
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
    const dueBadge = item.roundsLeft != null ? item.roundsLeft : item.due != null && item.round != null ? Math.max(0, item.due - item.round + 1) : null;
    art = <EventCard ev={{kind: item.key, frame: item.frame, failed: item.failed}} lang={lang} size={150} dueBadge={dueBadge} />;
    title = L(ev, lang);
    rows = [
      [tg(lang, 'inspNeeds'), tg(lang, 'inspNeedsValue', {frame: L(FRAMES[item.frame], lang)})],
      [tg(lang, 'ability'), tg(lang, ev.stat === 'combat' ? 'combat' : 'charisma')],
    ];
    if (item.letter) rows.push([tg(lang, 'commandOwner'), item.letter]);
    if (item.reward != null) rows.push([tg(lang, 'inspReward'), `+${item.reward}`]);
    if (item.done || item.failed) rows.push([tg(lang, 'inspDone'), '']);
    ability = L(ev.ab, lang);
  }
  const commandWarn =
    item.kind === 'event' && !item.failed && !item.done && item.roundsLeft != null
      ? tg(lang, 'commandDeadlineWarn', {n: item.roundsLeft})
      : item.kind === 'event' && !item.failed && !item.done && item.due != null && item.round != null
        ? tg(lang, 'commandDeadlineWarn', {n: Math.max(0, item.due - item.round + 1)})
        : null;
  return (
    <div className={styles.inspectScrim} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={styles.inspectPanel} onClick={(e) => e.stopPropagation()}>
        {item.gold != null && (
          <div className={styles.inspectGold} aria-label={tg(lang, 'gold', {n: item.gold})}>
            <CoinStack n={item.gold} size="sm" />
            <span className={styles.inspectGoldCount}>{item.gold}</span>
          </div>
        )}
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
          {commandWarn && <p className={styles.inspectCommandWarn}>{commandWarn}</p>}
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
    const madness = st.mode === 'madness' || st.mode === 'says';
    const commands = madness || st.events === 'on';
    const goal = [6, 7, 8, 9].includes(st.goal) ? String(st.goal) : zh ? '7（2–3 人时 8）' : '7 (8 at 2–3 players)';
    const steps = [];
    if (madness) steps.push(zh ? '合作「[command|苏丹狂令]」：一起打破所有[command|敕令]。任何一张超时 → [bad|全员失败]。' : "Co-op [command|Sultan's Madness]: break every [command|command] together. Miss one → [bad|everyone loses].");
    else steps.push(zh ? `目标：最好的[district|城市]。有人建满 [district|${goal} 个区域]，该轮结束后游戏结束。` : `Goal: the best [district|city]. When one reaches [district|${goal} districts], that round ends the game.`);
    if (st.select === 'auction' && st.math !== 'off') {
      steps.push(zh ? '每轮答题赚 [coin|出价金币]，再暗拍[char|角色]。最高得，平局 [crown|王冠]优先。只有赢家付钱；没用完的进宝库。没拍到 → 剩余角色或[char|平民]。' : 'Each round: math earns [coin|bid coins], then secret bids on [char|characters]. Highest wins; [crown|crown] breaks ties. Only winners pay; unspent coins go to your treasure. No win → leftover or [char|Citizen].');
    } else if (st.select === 'auction') {
      steps.push(zh ? '每轮用最多 [coin|3 金币]（2 角时 6）暗拍[char|角色]。最高得，平局 [crown|王冠]优先。没拍到 → 剩余角色或[char|平民]。' : 'Each round: bid up to [coin|3 coins] (6 with 2 picks) on [char|characters]. Highest wins; [crown|crown] breaks ties. No win → leftover or [char|Citizen].');
    } else {
      steps.push(zh ? '每轮秘密挑选 [char|1 个角色]（2–3 人时 2 个）。[crown|王冠]先选。' : 'Each round, secretly pick [char|1 character] (2 at 2–3 players). [crown|Crown] picks first.');
    }
    steps.push(zh ? '按号码 [char|0 → 13] 传召角色。你的回合：拿 [coin|2 金币]或抽 2 留 1 → 用能力 → [district|建造]。' : '[char|Characters] are called [char|0 → 13]. Your turn: take [coin|2 coins] or draw 2 keep 1 → use the ability → [district|build].');
    steps.push(zh ? '同一城市不能有两个相同的[district|区域]。' : 'No two identical [district|districts] in one city.');
    if (commands) {
      steps.push(zh ? '你有一张秘密[command|苏丹敕令]：用同阶或更高的[char|角色]发起（石 < 铜 < 银 < 金）。成功 → [coin|4 / 8 / 12 / 16 金币]。已打破的敕令永不回池。' : 'Your secret [command|Sultan’s command]: start it with a [char|character] of its tier or higher (Stone < Bronze < Silver < Gold). Success → [coin|4 / 8 / 12 / 16 coins]. Broken commands never return to the pool.');
      steps.push(
        zh
          ? '被拉进别人的[command|决斗]或[command|约会]时：若场上任一[char|角色]达到你的色阶，你的同种敕令也算完成。'
          : 'Pulled into someone else’s [command|duel] or [command|date]: if any [char|character] in play meets your colour tier, your matching command succeeds too.',
      );
      steps.push(
        madness
          ? zh
            ? '每张[command|4 轮]内完成；每局可[command|换牌]一次。敕令池清空 → [good|胜利]。'
            : '[command|4 rounds] for each card; one [command|redraw] per game. Empty the pool → [good|you win].'
          : zh
            ? '[command|4 轮]内完成；每局可[command|换牌]一次。超时 → [bad|你被处决]。'
            : '[command|4 rounds] to finish it; one [command|redraw] per game. Miss it → [bad|you are executed].',
      );
    }
    if (madness) steps.push(zh ? '得分最高者为 [crown|最佳玩家]。' : 'Top scorer is [crown|MVP].');
    else steps.push(zh ? '得分：[district|区域价值]，五种类型齐全 +3，最先完成 +4（其他完成者 +2），加独特区域奖励。' : 'Score: [district|district values], +3 for all 5 types, +4 first to finish (+2 others), plus Unique bonuses.');
    return steps.map(richText);
  },

  /** Phone help grid reuses in-game card inspect when a reference row has `detail`. */
  CardDetail: CardInspect,
  reference(lang, st = {}) {
    const group = (en, zh) => (lang === 'zh' ? zh : en);
    const chars = Object.keys(CHARS)
      .slice()
      .sort(byCharNum)
      .map((k) => ({
        key: k,
        group: group('Characters', '角色'),
        emoji: <CharCard k={k} lang={lang} size={18} />,
        tint: FRAMES[CHARS[k].frame].tint,
        title: charName(k, lang),
        tag: statLine(CHARS[k], lang),
        text: CHARS[k].ab,
        detail: {kind: 'char', key: k},
      }));
    const events = Object.keys(EVENTS).map((k) => ({
      key: `event-${k}`,
      group: group('Stat events', '属性事件'),
      emoji: <EventCard ev={{kind: k, frame: 'gold'}} lang={lang} size={18} />,
      tint: '#e9cfa3',
      title: L(EVENTS[k], lang),
      text: EVENTS[k].ab,
      detail: {kind: 'event', key: k, frame: 'gold'},
    }));
    const uniques = Object.values(DISTRICT)
      .filter((d) => d.note)
      .map((d) => ({
        key: `district-${d.key}`,
        group: group('Unique districts', '独特区域'),
        emoji: <DistrictCard k={d.key} lang={lang} size={22} />,
        tint: TYPES.unique.tint,
        title: `${L(d, lang)} · ${d.cost}`,
        text: d.note,
        detail: {kind: 'district', key: d.key},
      }));
    const commandsOn = !st || st.mode === 'madness' || st.mode === 'says' || st.events === 'on' || st.events === undefined;
    return [...chars, ...(commandsOn ? events : []), ...uniques];
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
          {radio('mode', 'madness', tg(lang, 's_says'))}
        </div>
        {(current('mode') === 'madness' || current('mode') === 'says') && <p className={shell.muted}>{tg(lang, 'saysNote')}</p>}
        {current('mode') !== 'madness' && current('mode') !== 'says' && (
          <div className={shell.buttonRow}>
            <span>{tg(lang, 's_events')}</span>
            {radio('events', 'off', tg(lang, 's_off'))}
            {radio('events', 'on', tg(lang, 's_on'))}
          </div>
        )}
        {(settings.events === 'on' || current('mode') === 'madness' || current('mode') === 'says') && <div className={shell.buttonRow}>{Object.keys(EVENTS).map(toggle)}</div>}
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_goal')}</span>
          {radio('goal', 'auto', tg(lang, 's_auto'))}
          {[6, 7, 8, 9].map((v) => radio('goal', v, String(v)))}
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
        return redrawCommand(s, ctx, id);
      case 'challenge':
        return challenge(s, ctx, id, msg.target);
      case 'answer':
        return answer(s, ctx, id, msg);
      case 'launchDice':
        return launchDice(s, ctx, id);
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
    return {...v, urgent: ['draft', 'quiz', 'turn', 'prompt', 'pyrrhic', 'dice'].includes(v.kind) || (v.kind === 'bid' && !v.bid.placed)};
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
    else if (diceHasPlayer(s.dice, id)) kind = 'dice';
    else if (s.prompt && s.prompt.to === id) kind = 'prompt';
    else if (s.phase === 'draft' && picksLeft(s, id) > 0) kind = 'draft';
    else if (s.phase === 'auction' && quizLeft(s, id) > 0) kind = 'quiz';
    else if (canBid(s, id)) kind = 'bid';
    else if (s.phase === 'pyrrhic' && !s.prompt && !s.dice && canUseEvent(s, id, commandFor(s, id, 'pyrrhic'))) kind = 'pyrrhic';
    else if (myTurnCard && !s.dice) kind = 'turn';
    const v = {
      task: `${kind}-${s.round}-${s.phase}-${s.calling}-${myTurnCard || ''}-${myTurnCard ? t.step[myTurnCard] : ''}-${s.prompt ? s.prompt.kind : ''}-${s.dice ? `${s.dice.kind}-${s.dice.revealed}` : ''}-${softReady(s, id) ? 'soft' : ''}`,
      kind,
      phase: s.phase,
      round: s.round,
      goal: s.st.goal,
      statsOn,
      gold: s.gold[id],
      crown: s.crown === id,
      lastRound: s.lastRound,
      calling: s.phase === 'call' && t ? t.num : null,
      mine: [...s.hold[id]].sort(byCharNum).map((k) => ({key: k, married: s.married[k] || null})),
      // Hand strip hides districts you already built (same name) so city vs hand is clear.
      // handAll keeps every card for Laboratory / Mage discard.
      ...(() => {
        const cityKeys = new Set(s.city[id].map((u) => s.cards[u]));
        const handAll = s.hand[id].map((u) => ({
          uid: u,
          key: s.cards[u],
          ok: Boolean(myTurnCard) && canBuild(s, id, myTurnCard, u),
          inCity: cityKeys.has(s.cards[u]),
        }));
        return {hand: handAll.filter((c) => !c.inCity), handAll};
      })(),
      city: s.city[id].map((u) => ({uid: u, key: s.cards[u], invest: s.invest[u] || 0})),
      // Commands are secret: a phone only ever sees its own card (including a failed one after timeout).
      events: (() => {
        const raw = s.commands && s.commands[id];
        if (!raw || (raw.done && !raw.failed)) return [];
        const live = commandFor(s, id);
        const onCommand = Boolean(live) && canUseEvent(s, id, live);
        // Pulse "can" on your turn, or after your turns while soft window is open.
        const can = onCommand && (Boolean(myTurnCard) || softReady(s, id)) && !s.prompt;
        return [{...raw, can, roundsLeft: Math.max(0, raw.due - s.round + 1)}];
      })(),
      canRedraw: Boolean(commandFor(s, id)) && !(s.redraws && s.redraws[id]) && !isOut(s, id),
      out: isOut(s, id),
      players,
      me: id,
      letter: letterOf(s, id),
      turnDone: s.phase === 'call' && s.hold[id].length > 0 && s.hold[id].every((k) => charOf(k).n == null || charOf(k).n < (s.calling || 0) || (t && t.done[k])),
      score: s.scores ? s.scores[id] : null,
      scoreCard: s.scoreCards ? s.scoreCards[id] : null,
      winner: s.winner || null,
      says: s.says && s.says.result ? s.says.result : null,
      waitFor: s.prompt ? name(s.prompt.to) : null,
    };
    // Soft panel: princess reserve + commands after your characters finish.
    if (softReady(s, id)) {
      const foes = s.seats
        .filter((p) => p !== id)
        .map((p) => ({
          id: p,
          name: name(p),
          letter: letterOf(s, p),
          color: (g.players[p] && g.players[p].color) || '#2a1630',
          city: s.city[p].map((u) => ({
            uid: u,
            key: s.cards[u],
            value: valueOf(s, u),
            ok: !s.city[id].some((m) => s.cards[m] === s.cards[u]),
          })),
        }));
      v.soft = {
        reserve: canSoftReserve(s, id) ? (s.unpicked || []).filter((k) => !Object.values(s.reserved).includes(k)) : [],
        marry: canSoftCommand(s, id, 'marriage'),
        conquer: canSoftCommand(s, id, 'conquest'),
        extravagance: canSoftCommand(s, id, 'extravagance'),
        suitors: s.hold[id].filter((k) => s.revealed[k] && !s.married[k]),
        dates: Object.keys(s.owner)
          .filter((k) => s.revealed[k] && !s.married[k])
          .map((k) => ({key: k, owner: name(ownerOf(s, k)), mine: s.hold[id].includes(k)})),
        foes,
        targets: foes.flatMap((p) => p.city.filter((c) => c.ok).map((c) => ({...c, ownerId: p.id, owner: `${p.letter} · ${p.name}`}))),
        charisma: s.hold[id].reduce((n, k) => n + charOf(k).charisma, 0),
      };
    }
    if (s.dice) {
      const meta = s.dice.meta || {};
      const cardFor = (key) => {
        if (s.dice.after === 'duel' && s.duel) return key === 'a' ? s.duel.champA : key === 'b' ? s.duel.champB : null;
        if (s.dice.after === 'marriage') return key === 'a' ? meta.mine : key === 'b' ? meta.other : null;
        return null;
      };
      const cardsFor = (key) => {
        if (s.dice.after !== 'conquest') return null;
        const c = s.conquests && s.conquests[meta.index];
        if (!c) return null;
        if (key === 'a') return [...armyOf(s, c.attacker), ...armyOf(s, c.ally)];
        if (key === 'b') return armyOf(s, c.defender);
        return null;
      };
      const conquest = s.dice.after === 'conquest' && s.conquests ? s.conquests[meta.index] : null;
      v.dice = {
        kind: s.dice.kind,
        revealed: s.dice.revealed,
        deadline: s.dice.deadline,
        districtValue: conquest ? valueOf(s, conquest.uid) : 0,
        sides: Object.fromEntries(
          Object.entries(s.dice.sides).map(([key, side]) => [
            key,
            {
              ...side,
              key,
              name: name(side.who),
              letter: letterOf(s, side.who),
              card: cardFor(key),
              cards: cardsFor(key),
              mine: side.who === id,
            },
          ]),
        ),
      };
    }
    // Auction selection: my problems (never the answers), my bid options, and what I won.
    if (s.auction && s.phase === 'auction') {
      v.earned = s.auction.earned[id] || 0;
      if (s.auction.quiz[id]) {
        v.quiz = s.auction.quiz[id].map((q) => ({
          pool: q.pool,
          lines: q.lines,
          hint: q.hint,
          state: q.state,
          given: q.given,
          a: q.a,
        }));
      }
    }
    if (kind === 'bid') {
      v.bid = {
        cap: bidCap(s, id),
        math: s.st.math !== 'off',
        placed: s.auction.bids[id] || null,
        lots: [...s.auction.lots].sort(byCharNum).map((k) => ({key: k, married: s.married[k] || null})),
      };
    }
    if (s.auction && s.auction.won && s.phase !== 'auction') {
      v.won = s.auction.won[id] || [];
      const myBids = s.auction.bids[id] || {};
      const who = (pid) => {
        const p = g.players[pid] || {};
        return {id: pid, name: name(pid), avatar: p.avatar, color: p.color};
      };
      const lots = (s.auction.reveal && s.auction.reveal.lots) || [];
      v.auctionReveal = {
        round: (s.auction.reveal && s.auction.reveal.round) || s.round,
        lots: lots
          .filter((lot) => myBids[lot.key] || (s.auction.won[id] || []).some((w) => w.key === lot.key || (lot.take || []).includes(w.key)))
          .map((lot) => ({
            key: lot.key,
            myBid: myBids[lot.key] || 0,
            bids: (lot.bids || []).map((b) => ({...who(b.id), n: b.n})),
            winner: lot.winner ? who(lot.winner) : null,
            paid: lot.paid || 0,
            take: lot.take || [lot.key],
          })),
        got: (s.auction.won[id] || []).map((w) => ({...w})),
      };
    }
    if (kind === 'draft') {
      v.picksLeft = picksLeft(s, id);
      v.available = [...s.draft.available]
        .sort(byCharNum)
        .map((k) => ({key: k, ok: canPick(s, id, k), married: s.married[k] || null}));
    }
    if (kind === 'pyrrhic') v.targets = s.seats.filter((p) => p !== id && s.hold[p].length).map((p) => ({id: p, name: name(p)}));
    if (kind === 'prompt') {
      const p = s.prompt;
      v.prompt = {
        kind: p.kind,
        from: name(p.from || (p.eff && p.eff.actor) || (s.duel && s.duel.a)),
        max: p.max,
        min: p.kind === 'raise' && s.duel ? Math.max(1, s.duel.bet || 1) : 1,
        mine: p.mine,
        other: p.other,
        what: p.eff ? p.eff.kind : null,
      };
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
        targets: s.seats.filter((p) => p !== id).flatMap((p) => s.city[p].filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u])).map((u) => ({uid: u, key: s.cards[u], ownerId: p, owner: `${letterOf(s, p)} · ${name(p)}`, value: valueOf(s, u)}))),
        foes: s.seats
          .filter((p) => p !== id)
          .map((p) => ({
            id: p,
            name: name(p),
            letter: letterOf(s, p),
            color: (g.players[p] && g.players[p].color) || '#2a1630',
            city: s.city[p].map((u) => ({
              uid: u,
              key: s.cards[u],
              value: valueOf(s, u),
              ok: !s.city[id].some((m) => s.cards[m] === s.cards[u]),
            })),
          })),
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
        mark={(id) => letterOf(s, id)}
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
                .sort(byCharNum)
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
                <p className={shell.kicker}>{tg(lang, 'mvp', {name: `${letterOf(s, s.winner)} · ${name(s.winner)}`})}</p>
              </>
            ) : (
              <div className={shell.bigText}>
                {letterOf(s, s.winner)} · {name(s.winner)}
              </div>
            )}
            {(() => {
              const ranked = [...s.seats].sort((a, b) => s.scores[b] - s.scores[a]);
              const winCard = (s.scoreCards && s.scoreCards[s.winner]) || {total: s.scores[s.winner], lines: [], effects: [], buildings: []};
              return (
                <>
                  <ScoreReveal card={winCard} lang={lang} />
                  <table className={shell.scoreTable}>
                    <tbody>
                      {ranked.slice(0, 10).map((id) => (
                        <tr key={id}>
                          <td>
                            <b>{letterOf(s, id)}</b>
                          </td>
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
                </>
              );
            })()}
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
                  {[...s.auction.lots].sort(byCharNum).map((k) => (
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
 * Stat events as a modal: character cards stand on each side (no sliding),
 * the issuing command sits bottom-left, light FX for the result only.
 */
const EVENT_SHOW_MS = 6500;

const armyOf = (s, id) => (id && s.hold[id] ? s.hold[id].filter((k) => s.revealed[k]) : []);

function currentEvent(s) {
  const roll = s.rolls && s.rolls[0];
  const conquest = s.phase === 'conquest' && s.conquests && s.conquests[s.conquestAt];
  if (s.dice) {
    if (s.dice.after === 'duel' && s.duel) {
      return {
        kind: 'pyrrhic',
        pending: true,
        dice: s.dice,
        command: commandSnap(s, s.duel.a, 'pyrrhic'),
        a: {who: s.duel.a, card: s.duel.champA},
        b: {who: s.duel.b, card: s.duel.champB},
      };
    }
    if (s.dice.after === 'conquest' && conquest) {
      return {
        kind: 'conquest',
        pending: true,
        dice: s.dice,
        command: commandSnap(s, conquest.attacker, 'conquest'),
        a: {who: conquest.attacker, ally: conquest.ally, cards: armyOf(s, conquest.attacker), allyCards: armyOf(s, conquest.ally)},
        b: {who: conquest.defender, cards: armyOf(s, conquest.defender)},
        card: s.cards[conquest.uid],
      };
    }
    if (s.dice.after === 'marriage') {
      const {suitor, mine, other} = s.dice.meta || {};
      return {
        kind: 'marriage',
        pending: true,
        dice: s.dice,
        command: commandSnap(s, suitor, 'marriage'),
        a: {who: suitor, card: mine},
        b: {who: ownerOf(s, other), card: other},
      };
    }
  }
  if (s.duel) {
    return {
      kind: 'pyrrhic',
      pending: true,
      command: commandSnap(s, s.duel.a, 'pyrrhic'),
      a: {who: s.duel.a, card: s.duel.champA},
      b: {who: s.duel.b, card: s.duel.champB},
    };
  }
  if (conquest && (!roll || roll.kind !== 'conquest' || roll.a.who !== conquest.attacker || Date.now() - (roll.at || 0) > EVENT_SHOW_MS)) {
    return {
      kind: 'conquest',
      pending: true,
      command: commandSnap(s, conquest.attacker, 'conquest'),
      a: {who: conquest.attacker, ally: conquest.ally, cards: armyOf(s, conquest.attacker), allyCards: armyOf(s, conquest.ally)},
      b: {who: conquest.defender, cards: armyOf(s, conquest.defender)},
      card: s.cards[conquest.uid],
    };
  }
  if (roll && ['pyrrhic', 'marriage', 'conquest', 'extravagance'].includes(roll.kind) && roll.at && Date.now() - roll.at < EVENT_SHOW_MS) {
    return {...roll, pending: false};
  }
  return null;
}

function EventModal({s, g, lang, name}) {
  const ev = currentEvent(s);
  const [, setTick] = useState(0);
  const [dismissed, setDismissed] = useState(null);
  // Close the modal on time even if no new state arrives.
  const at = ev && !ev.pending ? ev.at : null;
  const evKey = ev ? `${ev.kind}-${ev.at || 'pending'}-${ev.a?.who || ''}-${ev.b?.who || ''}-${ev.card || ''}` : null;
  React.useEffect(() => {
    if (!at) return undefined;
    const id = setTimeout(() => setTick((n) => n + 1), Math.max(0, at + EVENT_SHOW_MS - Date.now()) + 50);
    return () => clearTimeout(id);
  }, [at]);
  if (!ev || dismissed === evKey) return null;
  const {kind, pending} = ev;
  const aWins = !pending && ev.b && ev.a.total > ev.b.total;
  const cardStack = (keys, size = 48) =>
    (keys || []).length > 0 ? (
      <span className={styles.modalCards}>
        {keys.map((k) => (
          <CharCard key={k} k={k} lang={lang} size={size} stats={s.st.events.length > 0} />
        ))}
      </span>
    ) : null;
  const side = (x, which) => {
    if (!x) return null;
    const lost = kind === 'pyrrhic' && !pending && x.card && ev.lost === x.card;
    const cards = x.card ? [x.card] : [...(x.cards || []), ...(x.allyCards || [])];
    return (
      <span className={styles.modalSide} data-side={which} data-lost={lost} data-win={!pending && (which === 'a' ? aWins : !aWins)}>
        {cardStack(cards, x.card ? 84 : 52)}
        <span className={styles.modalSideMeta}>
          <SeatBadge s={s} g={g} id={x.who} />
          <b>{name(x.who)}</b>
          {x.ally && (
            <small>
              + <SeatBadge s={s} g={g} id={x.ally} />
            </small>
          )}
        </span>
        {!pending && x.total != null && kind !== 'extravagance' && <span className={styles.modalTotal}>{x.total}</span>}
      </span>
    );
  };
  let result = null;
  if (!pending) {
    if (kind === 'conquest') result = ev.won ? `🏴 ${tg(lang, 'm_won', {x: L(DISTRICT[ev.card], lang), who: `${letterOf(s, ev.a.who)} · ${name(ev.a.who)}`})}` : `🛡️ ${tg(lang, 'm_held', {x: L(DISTRICT[ev.card], lang)})}`;
    if (kind === 'marriage') result = ev.ok ? `💍 ${tg(lang, 'm_married')}` : `💔 ${tg(lang, 'm_jilted')}`;
    if (kind === 'pyrrhic' && ev.lost) result = `☠️ ${tg(lang, 'm_lost', {x: charName(ev.lost, lang)})}`;
  }
  const gifts = kind === 'extravagance' && ev.gifts ? Object.entries(ev.gifts) : [];
  const command = ev.command;
  const commandLeft = command && command.due != null ? Math.max(0, command.due - s.round + 1) : null;
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-label={tg(lang, `arena_${kind}`)} onClick={() => setDismissed(evKey)}>
      <div
        className={styles.modal}
        data-kind={kind}
        data-pending={pending}
        data-result={kind === 'conquest' && !pending ? (ev.won ? 'won' : 'held') : kind === 'marriage' && !pending ? (ev.ok ? 'yes' : 'no') : ''}
        onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalTitle}>{tg(lang, `arena_${kind}`)}</p>
        {ev.dice && (
          <div className={styles.diceDuelRow} data-host="1">
            {Object.entries(ev.dice.sides).map(([key, sideDie]) => {
              const card = kind === 'pyrrhic' || kind === 'marriage' ? (key === 'a' ? ev.a?.card : ev.b?.card) : null;
              const army = (keys) => (keys || []).reduce((n, k) => n + ((charOf(k) && charOf(k).combat) || 0), 0);
              let base = null;
              if ((kind === 'marriage' || kind === 'pyrrhic') && card && charOf(card)) {
                base = kind === 'marriage' ? charOf(card).charisma : charOf(card).combat;
              } else if (kind === 'conquest') {
                const c = s.conquests && s.conquests[s.conquestAt];
                const wall = c ? valueOf(s, c.uid) : ev.card && DISTRICT[ev.card] ? DISTRICT[ev.card].cost : 0;
                base = key === 'a' ? army(ev.a?.cards) + army(ev.a?.allyCards) : army(ev.b?.cards) + wall;
              }
              return (
                <div key={key} className={styles.diceDuelCol}>
                  {card && <CharCard k={card} lang={lang} size={40} />}
                  <Dice3D face={sideDie.face} launched={sideDie.launched} bonus={sideDie.bonus} base={base} label={letterOf(s, sideDie.who)} />
                </div>
              );
            })}
          </div>
        )}
        {pending && ev.dice && !ev.dice.revealed && <p className={shell.muted}>{tg(lang, 'rollWait')}</p>}
        <div className={styles.modalStage}>
          {side(ev.a, 'a')}
          <span className={styles.modalCenter}>
            <ArenaFloor kind={kind} centerArt={kind === 'conquest' && ev.card ? isoDistrict(ev.card) : undefined} scale={1.5} />
            <span className={styles.modalFx} aria-hidden="true">
              {kind === 'conquest' && !pending && !ev.won && <span className={styles.fxShield}>🛡️</span>}
              {kind === 'marriage' && !pending && <span className={styles.fxSeal}>{ev.ok ? '💍' : '💔'}</span>}
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
            <span className={styles.modalSide} data-side="b">
              {gifts.map(([p, n]) => (
                <span key={p} className={styles.giftRow}>
                  <SeatBadge s={s} g={g} id={p} />
                  <b>{name(p)}</b> +{n}
                </span>
              ))}
            </span>
          ) : (
            side(ev.b, 'b')
          )}
        </div>
        {command && (
          <span className={styles.modalCommand} title={L(EVENTS[command.kind], lang)}>
            <EventCard ev={command} lang={lang} size={52} dueBadge={command.failed ? 0 : commandLeft} />
            {(command.who || ev.a?.who) && (
              <span className={styles.modalCommandOwner}>
                <SeatBadge s={s} g={g} id={command.who || ev.a.who} />
                <b>{name(command.who || ev.a.who)}</b>
              </span>
            )}
          </span>
        )}
        {kind === 'extravagance' && <p className={styles.modalResult}>{tg(lang, 'arenaGave', {n: ev.a.total})}</p>}
        {result && <p className={styles.modalResult}>{result}</p>}
        {pending && s.prompt && (
          <p className={shell.muted}>
            ⏳ <SeatBadge s={s} g={g} id={s.prompt.to} /> {name(s.prompt.to)}
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
 * their seat letter and border colour.
 *
 * The bar keeps every character taken this round (call order), including ones
 * already finished — who was selected at the start stays visible. Empty
 * numbers are skipped (nobody holds them). Unpicked leftovers sit dimmed in
 * order. Current call is outlined; finished ones fade. Auction shows lots.
 */
function SultanBoard({s, g, lang}) {
  const [inspect, setInspect] = useState(null);
  const stripRef = useRef(null);
  const openChar = (k) => setInspect({kind: 'char', key: k, married: s.married[k] || null});
  const t = s.turn;
  const callOrder = (k) => {
    const c = charOf(k);
    return c && c.n != null ? c.n : 99;
  };
  let strip = [];
  if (s.phase === 'auction' && s.auction) {
    strip = [...s.auction.lots].sort(byCharNum);
  } else if (s.phase === 'draft' && s.draft) {
    strip = [...(s.draft.available || [])].filter((k) => callOrder(k) < 99).sort(byCharNum);
  } else if (s.phase === 'pyrrhic' || s.phase === 'call' || s.phase === 'conquest') {
    // Full taken set for the round + unpicked leftovers (who was dealt matters).
    const owned = Object.keys(s.owner || {}).filter((k) => callOrder(k) < 99);
    const leftover = (s.unpicked || []).filter((k) => callOrder(k) < 99 && !s.owner[k]);
    strip = [...new Set([...owned, ...leftover])].sort(byCharNum);
  }
  const current = s.phase === 'call' && t ? t.num : null;
  useEffect(() => {
    if (current == null || !stripRef.current) return undefined;
    const el = stripRef.current.querySelector('[data-current="true"]');
    if (el && el.scrollIntoView) el.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
    return undefined;
  }, [current, s.round]);
  // Host can drag / wheel-scroll the strip when cards overflow the top bar.
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return undefined;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!dx) return;
      el.scrollLeft += dx;
      e.preventDefault();
    };
    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
    };
    const onClickCapture = (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };
    el.addEventListener('wheel', onWheel, {passive: false});
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [s.round, s.phase, strip.length]);
  const active = (id) => {
    if (s.prompt) return s.prompt.to === id;
    if (s.phase === 'call' && t) return t.cards.some((k) => ownerOf(s, k) === id && !t.done[k]);
    if (s.phase === 'draft') return picksLeft(s, id) > 0;
    if (s.phase === 'auction') return !hasBid(s, id);
    return false;
  };
  const conquest = s.phase === 'conquest' && s.conquests && s.conquests[s.conquestAt];
  const stripDone = (k) => {
    if (current == null) return false;
    const n = callOrder(k);
    if (n < current) return true;
    if (n === current && t && t.done[k]) return true;
    return false;
  };
  return (
    <div className={styles.board} data-seats={s.seats.length > 12 ? 'many' : s.seats.length > 8 ? 'some' : 'few'}>
      <div className={styles.topBar}>
        <div className={styles.callStrip} ref={stripRef} key={`${s.round}-${s.phase}`}>
          {strip.map((k) => {
            const unpicked = Boolean(s.unpicked && s.unpicked.includes(k) && !s.owner[k]);
            const isCurrent = current != null && callOrder(k) === current && !unpicked && !(t && t.done[k]);
            return (
              <button
                key={k}
                type="button"
                className={styles.stripCard}
                data-current={isCurrent || undefined}
                data-done={stripDone(k) || undefined}
                data-unpicked={unpicked || undefined}
                data-silenced={isCurrent && s.silenced.includes(current) ? true : undefined}
                aria-label={charName(k, lang)}
                onClick={() => openChar(k)}>
                <CharCard k={k} lang={lang} size={72} />
              </button>
            );
          })}
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

/** A player on the big screen is their district letter in their colour. */
function SeatBadge({s, g, id}) {
  const p = g.players[id] || {};
  return (
    <span className={styles.seatBadge} style={{'--owner': p.color || '#2a1630'}}>
      {letterOf(s, id)}
    </span>
  );
}

/**
 * Coins as stacks of the game's coin token: up to 5 in a column, then a new
 * column to the right. With `animateJoin`, gains fall in and losses fly out,
 * with a floating +N / −N on the purse.
 */
function CoinStack({n, animateJoin = false, size = 'md'}) {
  const src = useBaseUrl('/img/party/sultan/token-coin.webp');
  const prev = useRef(n);
  const [burst, setBurst] = useState(null); // {dir, count, delta, key}
  const [bounce, setBounce] = useState(''); // 'in' | 'out' | ''
  useEffect(() => {
    const d = n - prev.current;
    prev.current = n;
    if (!animateJoin || d === 0) return undefined;
    const dir = d > 0 ? 'in' : 'out';
    setBurst({dir, count: Math.min(Math.abs(d), 8), delta: d, key: `${Date.now()}-${d}`});
    setBounce(dir);
    const clearBurst = window.setTimeout(() => setBurst(null), 1100);
    const clearBounce = window.setTimeout(() => setBounce(''), 450);
    return () => {
      window.clearTimeout(clearBurst);
      window.clearTimeout(clearBounce);
    };
  }, [n, animateJoin]);
  const shown = Math.min(Math.max(0, n), 30);
  const cols = shown ? Array.from({length: Math.ceil(shown / 5)}, (_, c) => Math.min(5, shown - c * 5)) : [];
  const bounceClass = bounce === 'in' ? styles.coinStackBounce : bounce === 'out' ? styles.coinStackSettle : '';
  return (
    <span className={`${styles.coinStack} ${bounceClass}`} data-size={size} aria-label={`${n}`}>
      {cols.map((h, c) => (
        <span key={c} className={styles.coinCol}>
          {Array.from({length: h}, (_, i) => (
            <img key={i} src={src} alt="" draggable={false} />
          ))}
        </span>
      ))}
      {burst && (
        <span key={burst.key} className={styles.coinJoin} data-dir={burst.dir} aria-hidden="true">
          {Array.from({length: burst.count}, (_, i) => (
            <span key={i} className={styles.coinJoinPiece} style={{animationDelay: `${i * 40}ms`}}>
              <img src={src} alt="" draggable={false} />
            </span>
          ))}
        </span>
      )}
      {burst && (
        <em className={`${styles.coinDelta} ${burst.delta > 0 ? styles.coinDeltaGain : styles.coinDeltaLoss}`}>
          {burst.delta > 0 ? `+${burst.delta}` : `−${-burst.delta}`}
        </em>
      )}
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
  const shown = s.hold[id].filter((k) => s.revealed[k]).sort(byCharNum);
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
        <CoinStack n={s.gold[id]} animateJoin size="sm" />
      </span>
      <span className={styles.pCornerRight}>
        <span className={styles.pHand}>🃏{s.hand[id].length}</span>
        {(() => {
          const m = s.commands && s.commands[id];
          if (!m || (m.done && !m.failed)) return null;
          const left = Math.max(0, (m.due || s.round) - s.round + 1);
          return (
            <button
              type="button"
              className={`${styles.cardButton} ${styles.pCommand}`}
              title={tg(lang, 'roundsLeft', {n: left})}
              onClick={() =>
                onInspect({
                  kind: 'event',
                  key: m.kind,
                  frame: m.frame,
                  reward: m.reward,
                  due: m.due,
                  round: s.round,
                  roundsLeft: left,
                  failed: m.failed,
                  letter: letterOf(s, id),
                })
              }>
              <EventCard ev={m} lang={lang} size={48} dueBadge={m.failed ? 0 : left} />
            </button>
          );
        })()}
      </span>
      {isOut(s, id) && <span className={styles.pOut}>{tg(lang, 'outBadge')}</span>}
    </div>
  );
}

// ------------------------------------------------------------------ phone

/** While waiting: what you can do when each of your characters is called. */
function WaitTurnPreview({mine, lang}) {
  const upcoming = mine
    .map((c) => ({...c, ch: charOf(c.key)}))
    .filter((c) => c.ch && c.ch.n != null)
    .sort((a, b) => a.ch.n - b.ch.n);
  if (!upcoming.length) return null;
  return (
    <div className={styles.waitPreview}>
      {upcoming.map((c) => {
        const builds = c.key === 'builder' ? 2 : 1;
        const plural = builds === 1 ? '' : 's';
        return (
          <div key={c.key} className={styles.waitChar}>
            <CharCard k={c.key} lang={lang} size={52} />
            <div>
              <p className={styles.waitTitle}>{tg(lang, 'waitWhenCalled', {n: c.ch.n, name: lang === 'zh' ? c.ch.zh : c.ch.en})}</p>
              <ul className={styles.waitList}>
                <li>{tg(lang, 'waitIncome')}</li>
                <li>
                  {tg(lang, 'waitSkill')}: {L(c.ch.ab, lang)}
                </li>
                <li>{tg(lang, 'waitBuild', {n: builds, s: plural})}</li>
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * After the auction closes: show lots you bid on; if you were outbid and still
 * receive leftover / citizen cards, both appear in the same modal (joins animate in).
 */
function AuctionReveal({reveal, me, lang, onDone}) {
  const steps = React.useMemo(() => {
    const lots = reveal.lots || [];
    const got = reveal.got || [];
    const paidKeys = new Set(lots.filter((l) => l.winner && l.winner.id === me && l.paid > 0).flatMap((l) => l.take || [l.key]));
    const joins = got.filter((w) => (w.leftover || w.citizen || w.paid === 0) && !paidKeys.has(w.key));
    const lost = lots.filter((l) => l.myBid > 0 && !(l.winner && l.winner.id === me));
    const won = lots.filter((l) => l.winner && l.winner.id === me);
    const list = [];
    // Outbid + consolation joins: one screen.
    if (lost.length && joins.length) {
      list.push({type: 'outbidJoin', lost, joins});
    } else {
      for (const lot of [...won, ...lost]) list.push({type: 'lot', lot});
      if (joins.length) list.push({type: 'join', joins});
    }
    // Won nothing interesting to list, but still got characters.
    if (!list.length && got.length) list.push({type: 'join', joins: got});
    return list;
  }, [reveal, me]);
  const [i, setI] = useState(0);
  const step = steps[i];
  useEffect(() => {
    if (!steps.length) {
      onDone();
      return undefined;
    }
    const ms = step && (step.type === 'outbidJoin' || step.type === 'lot') ? 3200 : 2000;
    const t = window.setTimeout(() => {
      if (i + 1 >= steps.length) onDone();
      else setI((n) => n + 1);
    }, ms);
    return () => window.clearTimeout(t);
  }, [i, steps, step, onDone]);
  if (!step) return null;
  const bidRow = (lot) => (
    <div className={styles.revealBids}>
      {(lot.bids || []).map((b, bi) => (
        <span key={b.id} className={styles.revealBid} style={{animationDelay: `${bi * 120}ms`}} data-me={b.id === me} data-win={lot.winner && lot.winner.id === b.id}>
          <Avatar avatar={b.avatar} color={b.color} size="sm" />
          <span className={styles.revealBidAmt}>
            {coin}
            {b.n}
          </span>
        </span>
      ))}
    </div>
  );
  const joinCards = (joins) => (
    <div className={styles.revealJoins}>
      {joins.map((w, ji) => (
        <span key={w.key} className={styles.revealJoinCard} style={{animationDelay: `${280 + ji * 180}ms`}}>
          <CharCard k={w.key} lang={lang} size={88} />
        </span>
      ))}
    </div>
  );
  return (
    <div className={styles.revealScrim} role="dialog" aria-label={tg(lang, 'revealTitle')} onClick={onDone}>
      <div className={styles.revealCard} onClick={(e) => e.stopPropagation()}>
        <p className={styles.revealHead}>{tg(lang, 'revealTitle')}</p>
        {step.type === 'lot' && (
          <div key={step.lot.key} className={styles.revealLot} data-anim="lot">
            <CharCard k={step.lot.key} lang={lang} size={88} />
            <p className={shell.muted}>{tg(lang, 'revealBids')}</p>
            {bidRow(step.lot)}
            <p className={styles.revealResult} data-win={Boolean(step.lot.winner && step.lot.winner.id === me)}>
              {step.lot.winner && step.lot.winner.id === me ? tg(lang, 'revealWon') : tg(lang, 'revealLostLong')}
            </p>
          </div>
        )}
        {step.type === 'outbidJoin' && (
          <div key={`out-${step.lost.map((l) => l.key).join('-')}`} className={styles.revealLot} data-anim="outbidJoin">
            <p className={styles.revealResult} data-win="false">
              {tg(lang, 'revealLostLong')}
            </p>
            <div className={styles.revealLostRow}>
              {step.lost.map((lot) => (
                <div key={lot.key} className={styles.revealLostLot}>
                  <CharCard k={lot.key} lang={lang} size={64} />
                  {bidRow(lot)}
                </div>
              ))}
            </div>
            <p className={styles.revealJoinLabel}>{tg(lang, 'revealJoinsAfter')}</p>
            {joinCards(step.joins)}
          </div>
        )}
        {step.type === 'join' && (
          <div key={step.joins.map((w) => w.key).join('-')} className={styles.revealLot} data-anim="join">
            <p className={styles.revealResult} data-win="true">
              {tg(lang, 'revealJoins')}
            </p>
            {joinCards(step.joins)}
          </div>
        )}
        <button type="button" className="button button--sm button--secondary" onClick={onDone}>
          {tg(lang, 'revealSkip')}
        </button>
      </div>
    </div>
  );
}

/** Phone city: fill the card width and scale the iso grid to match. */
function PhoneCity({city, goal, color, letter, lang, onTap}) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      const w = el.clientWidth;
      if (w < 40) return;
      // Height budget follows width so width usually drives the fit scale.
      setBox({width: w - 16, height: Math.max(140, w * 0.7)});
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={styles.phoneCity} ref={ref}>
      <CityPlot city={city} goal={goal} color={color} label={letter || null} lang={lang} fit={box || undefined} scale={1.6} onTap={onTap} />
    </div>
  );
}

const QUIZ_TO_BID_PAUSE_MS = 2000;

function SultanPhone({view, lang, send}) {
  const [inspect, setInspect] = useState(null);
  const revealKey = view.auctionReveal ? `${view.auctionReveal.round}` : '';
  const [revealDoneFor, setRevealDoneFor] = useState('');
  const showReveal = Boolean(view.auctionReveal && revealKey && revealDoneFor !== revealKey);
  const finishReveal = useCallback(() => setRevealDoneFor(revealKey), [revealKey]);
  // After the last math answer, linger on the review so the result is readable before bids.
  const wasQuiz = useRef(false);
  const [quizHold, setQuizHold] = useState(false);
  useLayoutEffect(() => {
    if (view.kind === 'quiz') {
      wasQuiz.current = true;
      setQuizHold(false);
      return;
    }
    if (view.kind === 'bid' && wasQuiz.current && view.quiz && view.quiz.length) {
      wasQuiz.current = false;
      setQuizHold(true);
      return;
    }
    wasQuiz.current = false;
  }, [view.kind, view.round]);
  useEffect(() => {
    if (!quizHold) return undefined;
    const t = window.setTimeout(() => setQuizHold(false), QUIZ_TO_BID_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [quizHold, view.round]);
  const closeInspect = () => setInspect(null);
  const openChar = (key, extra = {}) => setInspect({kind: 'char', key, ...extra});
  const openDistrict = (key, extra = {}) => setInspect({kind: 'district', key, ...extra});
  const openEvent = (ev) =>
    setInspect({
      kind: 'event',
      key: ev.kind,
      frame: ev.frame,
      reward: ev.reward,
      due: ev.due,
      round: view.round,
      roundsLeft: ev.roundsLeft,
      failed: ev.failed,
      letter: view.letter || null,
      action:
        view.canRedraw && !ev.failed
          ? {
              label: tg(lang, 'redraw'),
              onClick: () => send({action: 'redraw'}),
            }
          : undefined,
    });

  const modal = <CardInspect item={inspect} lang={lang} onClose={closeInspect} />;
  const revealModal = showReveal && view.auctionReveal ? <AuctionReveal reveal={view.auctionReveal} me={view.me} lang={lang} onDone={finishReveal} /> : null;

  const status = (
    <div className={shell.card}>
      <div className={styles.roundRow}>
        <p className={shell.kicker}>
          {tg(lang, 'round', {n: view.round})} · {tg(lang, 'gold', {n: view.gold})} {view.crown && crown}
        </p>
        <div className={styles.myTreasure}>
          <CoinStack n={view.gold} animateJoin size="sm" />
        </div>
      </div>
      {view.out && <p className={styles.last}>{tg(lang, 'youAreOut')}</p>}
      {(view.mine.length > 0 || view.hand.length > 0 || view.events.length > 0) && (
        <div className={styles.heldRow}>
          {view.mine.map((c) => (
            <button key={c.key} type="button" className={styles.cardButton} onClick={() => openChar(c.key, {married: c.married || null})}>
              <CharCard k={c.key} lang={lang} size={52} stats={view.statsOn} married={c.married || null} />
            </button>
          ))}
          {view.events.map((e) => (
            <button
              key={e.kind}
              type="button"
              className={`${styles.cardButton} ${e.failed ? styles.commandFailed : ''} ${e.can ? styles.commandReady : ''} ${e.can && e.roundsLeft <= 1 ? styles.commandUrgent : ''}`}
              onClick={() => openEvent(e)}>
              <EventCard ev={e} lang={lang} size={52} dueBadge={e.roundsLeft} />
            </button>
          ))}
          {view.hand.map((c) => (
            <button
              key={c.uid}
              type="button"
              className={`${styles.cardButton} ${c.ok ? styles.buildable : ''}`}
              aria-pressed={c.ok || undefined}
              onClick={() =>
                openDistrict(c.key, {
                  gold: view.gold,
                  action: c.ok
                    ? {
                        label: tg(lang, 'buildThis'),
                        onClick: () => send({action: 'build', uid: c.uid, card: view.turn.card}),
                      }
                    : undefined,
                })
              }>
              {/* Card shape is shorter than tall agent art; ~1.9/1.4 keeps heights matched. */}
              <DistrictCard k={c.key} lang={lang} size={70} />
            </button>
          ))}
        </div>
      )}
      <PhoneCity
        city={view.city}
        goal={view.goal}
        color={(view.players.find((p) => p.id === view.me) || {}).color}
        letter={view.letter}
        lang={lang}
        onTap={(c) => openDistrict(c.key, {invest: c.invest})}
      />
    </div>
  );

  if (view.kind === 'over') {
    const card = view.scoreCard || {total: view.score || 0, lines: [], effects: [], buildings: []};
    return (
      <>
        {view.says && <div className={`${shell.card} ${styles.saysResult}`} data-result={view.says}>{view.says === 'win' ? `🏰 ${tg(lang, 'saysWin')}` : `💀 ${tg(lang, 'saysLose', {x: ''})}`}</div>}
        <div className={shell.card}>
          <p className={shell.kicker}>{tg(lang, 'scoreParts')}</p>
          <ScoreReveal card={card} lang={lang} compact />
        </div>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'dice') {
    return (
      <>
        <DiceDuelView view={view} lang={lang} send={send} />
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'prompt') {
    return (
      <>
        <PromptCard view={view} lang={lang} send={send} openChar={openChar} />
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'draft') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'pickChar', {n: view.picksLeft})}</p>
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
              <CharCard k={c.key} lang={lang} size={70} stats={view.statsOn} married={c.married || null} />
              <span className={styles.abilityText}>{L(charOf(c.key).ab, lang)}</span>
            </button>
          ))}
        </div>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'quiz' || quizHold) {
    return (
      <>
        <QuizView view={view} lang={lang} send={send} pausing={quizHold} />
        {status}
      </>
    );
  }
  if (view.kind === 'bid') {
    return (
      <>
        <BidView view={view} lang={lang} send={send} openChar={openChar} openEvent={openEvent} />
        {status}
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
        {revealModal}
        {modal}
      </>
    );
  }
  if (view.kind === 'turn') {
    return (
      <>
        <TurnView view={view} lang={lang} send={send} status={status} openChar={openChar} openDistrict={openDistrict} openEvent={openEvent} />
        {revealModal}
        {modal}
      </>
    );
  }
  const softOpen =
    view.soft &&
    (view.soft.reserve.length > 0 || view.soft.marry || view.soft.conquer || view.soft.extravagance);
  return (
    <>
      {view.legacy ? (
        <p className={shell.waiting}>{tg(lang, 'legacy')}</p>
      ) : view.waitFor ? (
        <p className={shell.waiting}>{tg(lang, 'waitFor', {name: view.waitFor})}</p>
      ) : view.phase === 'draft' && !view.mine.length ? (
        <p className={shell.waiting}>{tg(lang, 'waitDraft')}</p>
      ) : view.mine.length > 0 && !view.turnDone ? (
        <WaitTurnPreview mine={view.mine} lang={lang} />
      ) : view.mine.length === 0 && view.phase !== 'call' ? (
        <p className={shell.waiting}>{tg(lang, 'nextRound')}</p>
      ) : view.turnDone && !softOpen ? (
        <p className={shell.muted}>{tg(lang, 'turnDone')}</p>
      ) : null}
      {softOpen && <SoftPanel view={view} lang={lang} send={send} openChar={openChar} />}
      {status}
      {revealModal}
      {modal}
    </>
  );
}

/**
 * End-game tally: district cards slide in one by one, each adding its points,
 * then bonus lines, while the running total ticks up.
 */
function ScoreReveal({card, lang, compact = false}) {
  const buildings = card.buildings || [];
  const bonuses = (card.lines || []).filter((row) => row.id !== 'districts');
  const steps = [
    ...buildings.map((b) => ({type: 'building', ...b})),
    ...bonuses.map((row) => ({type: 'bonus', ...row})),
  ];
  const [step, setStep] = useState(0);
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    setStep(0);
    setSkip(false);
  }, [card]);
  useEffect(() => {
    if (skip || step >= steps.length) return undefined;
    const ms = steps[step]?.type === 'building' ? 700 : 550;
    const t = window.setTimeout(() => setStep((n) => n + 1), ms);
    return () => window.clearTimeout(t);
  }, [step, skip, steps.length]);
  const shown = skip ? steps.length : step;
  const visible = steps.slice(0, shown);
  const total = visible.reduce((n, row) => n + (row.pts || 0), 0);
  const done = shown >= steps.length;
  const latest = visible[visible.length - 1];
  return (
    <div className={`${styles.scoreReveal} ${compact ? styles.scoreRevealCompact : ''}`}>
      <div className={styles.scoreRevealStage}>
        <div className={styles.scoreRevealCards} aria-live="polite">
          {visible
            .filter((row) => row.type === 'building')
            .map((b) => (
              <span key={b.uid || b.key} className={styles.scoreRevealCard} data-fresh={latest && latest.uid === b.uid ? '1' : undefined}>
                <DistrictCard k={b.key} lang={lang} size={compact ? 56 : 72} />
                <span className={styles.scoreRevealAdd}>+{b.pts}</span>
              </span>
            ))}
        </div>
        <div className={styles.scoreRevealSide}>
          <p className={styles.scoreRevealTotal} data-bump={latest ? `${shown}-${latest.pts}` : undefined}>
            <span>{tg(lang, 'scoreTotal')}</span>
            <b key={total}>{total}</b>
          </p>
          <ul className={styles.scoreRevealLog}>
            {visible.map((row, i) => (
              <li key={`${row.type}-${row.id || row.uid || i}`} data-fresh={i === visible.length - 1 ? '1' : undefined}>
                <span>{row.type === 'building' ? (lang === 'zh' ? row.zh : row.en) : lang === 'zh' ? row.zh : row.en}</span>
                <b>+{row.pts}</b>
              </li>
            ))}
          </ul>
          {!done && (
            <button type="button" className="button button--sm button--secondary" onClick={() => setSkip(true)}>
              {tg(lang, 'scoreSkip')}
            </button>
          )}
        </div>
      </div>
      {done && card.effects.length > 0 && (
        <div className={styles.scoreRevealEffects}>
          <b>{tg(lang, 'scoreEffects')}</b>
          <ul className={styles.scoreEffects}>
            {card.effects.map((fx, n) => (
              <li key={n}>{lang === 'zh' ? fx.zh : fx.en}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Shared contested roll: each side sees a 3D die; tap before auto for +1. */
function DiceDuelView({view, lang, send}) {
  const d = view.dice;
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!d || d.revealed) return undefined;
    const id = window.setInterval(() => setTick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, [d, d && d.revealed, d && d.deadline]);
  if (!d) return null;
  const left = Math.max(0, Math.ceil(((d.deadline || 0) - Date.now()) / 1000));
  const sides = Object.values(d.sides);
  const army = (keys) => (keys || []).reduce((n, k) => n + ((charOf(k) && charOf(k).combat) || 0), 0);
  const baseOf = (side) => {
    if (d.kind === 'marriage' && side.card && charOf(side.card)) return charOf(side.card).charisma;
    if (d.kind === 'pyrrhic' && side.card && charOf(side.card)) return charOf(side.card).combat;
    if (d.kind === 'conquest' && side.cards) {
      const combat = army(side.cards);
      return side.key === 'b' ? combat + (d.districtValue || 0) : combat;
    }
    return null;
  };
  return (
    <div className={`${shell.card} ${styles.diceDuelPhone}`}>
      <p className={shell.bigText}>{tg(lang, d.revealed ? 'rollSettling' : 'rollDice')}</p>
      {!d.revealed && <p className={shell.muted}>{tg(lang, 'rollAuto', {n: left})}</p>}
      <div className={styles.diceDuelRow}>
        {sides.map((side) => (
          <div key={side.key || `${side.letter}-${side.card || ''}`} className={styles.diceDuelCol}>
            <Dice3D
              face={side.face}
              launched={side.launched}
              bonus={side.bonus}
              base={baseOf(side)}
              mine={side.mine}
              label={side.letter || side.name}
              hint={side.mine && !side.launched ? tg(lang, 'rollDice') : undefined}
              onLaunch={side.mine && !side.launched && !d.revealed ? () => send({action: 'launchDice'}) : undefined}
            />
            {side.card ? (
              <CharCard k={side.card} lang={lang} size={48} stats={view.statsOn} />
            ) : (
              side.cards &&
              side.cards.length > 0 && (
                <span className={styles.modalCards}>
                  {side.cards.slice(0, 3).map((k) => (
                    <CharCard key={k} k={k} lang={lang} size={36} />
                  ))}
                </span>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Fill "?" slots in question lines with a typed/correct answer for the review list. */
function fillQuizLines(lines, ans) {
  const nodes = [];
  (lines || []).forEach((line, i) => {
    if (i) nodes.push('  ');
    const qi = line.indexOf('?');
    if (qi < 0) {
      nodes.push(<MathRich key={`l${i}`} text={line} />);
      return;
    }
    nodes.push(
      <React.Fragment key={`l${i}`}>
        <MathRich text={line.slice(0, qi)} />
        <MathRich text={ans == null || ans === '' ? '?' : ans} />
        <MathRich text={line.slice(qi + 1)} />
      </React.Fragment>,
    );
  });
  return nodes;
}

/** Math round: the problems one at a time on the pad; done ones show your answer and the correct one. */
function QuizView({view, lang, send, pausing = false}) {
  const quiz = view.quiz || [];
  const i = quiz.findIndex((q) => !q.state);
  const q = !pausing && i >= 0 ? quiz[i] : null;
  return (
    <div className={shell.card}>
      <p className={shell.bigText}>{tg(lang, 'quizTitle')}</p>
      <div className={styles.quizPurse}>
        <CoinStack n={view.earned || 0} animateJoin size="sm" />
      </div>
      <ol className={styles.quizList}>
        {quiz.map((x, n) => {
          const mark = x.state === 'ok' ? '✓' : x.state === 'wrong' ? '✗' : n === i ? '▶' : '·';
          if (!x.state) {
            return (
              <li key={n} className={styles.quizItem} data-state={n === i ? 'now' : 'todo'}>
                {mark}
              </li>
            );
          }
          const promptLines = (x.lines || []).filter((line) => !/^\s*\?\s*$/.test(line));
          if (x.state === 'ok') {
            return (
              <li key={n} className={styles.quizItem} data-state="ok">
                <span className={styles.quizMark}>{mark}</span>
                <span className={styles.quizReview}>
                  <span className={styles.quizPrompt}>{fillQuizLines(x.lines, x.a)}</span>
                </span>
              </li>
            );
          }
          return (
            <li key={n} className={styles.quizItem} data-state="wrong">
              <span className={styles.quizMark}>{mark}</span>
              <span className={styles.quizReview}>
                {promptLines.length > 0 && (
                  <span className={styles.quizPrompt}>{fillQuizLines(promptLines, null)}</span>
                )}
                <span className={styles.quizYours}>
                  {tg(lang, 'quizYours')}: <s>{x.given ? <MathRich text={x.given} /> : '—'}</s>
                </span>
                <span className={styles.quizActual}>
                  {tg(lang, 'quizAnswer')}: <b>{x.a ? <MathRich text={x.a} /> : '—'}</b>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {pausing && <p className={shell.muted}>{tg(lang, 'quizDone')}</p>}
      {q && <MathPad key={i} question={q} lang={lang} onAnswer={(value) => send({action: 'quiz', index: i, value})} okLabel="OK" />}
    </div>
  );
}

/** Fly a coin from `fromEl` into `toEl` (fixed-position animation overlay). */
function useCoinFlights() {
  const [flights, setFlights] = useState([]);
  const fly = (fromEl, toEl) => {
    const from = fromEl && fromEl.getBoundingClientRect();
    const to = toEl && toEl.getBoundingClientRect();
    if (!from || !to) return;
    const id = `${Date.now()}-${Math.random()}`;
    const f = {id, x: from.left + from.width / 2, y: from.top + from.height / 2, dx: to.left + to.width / 2 - (from.left + from.width / 2), dy: to.top + to.height / 2 - (from.top + from.height / 2)};
    setFlights((list) => [...list, f]);
    setTimeout(() => setFlights((list) => list.filter((x) => x.id !== id)), 650);
  };
  const layer = flights.map((f) => (
    <span key={f.id} className={styles.flyingCoin} style={{left: f.x, top: f.y, '--dx': `${f.dx}px`, '--dy': `${f.dy}px`}}>
      {coin}
    </span>
  ));
  return {fly, layer};
}

/**
 * Secret auction: purse of bid coins, + under each card (no −). Every + flies a
 * coin from the purse onto that card. Confirm when ready; change until close.
 */
function BidView({view, lang, send, openChar, openEvent}) {
  const {cap, lots, placed} = view.bid;
  const [bids, setBids] = useState(() => ({...(placed || {})}));
  const {fly, layer} = useCoinFlights();
  const purseRef = useRef(null);
  const [joining, setJoining] = useState(true);
  const spent = Object.values(bids).reduce((a, b) => a + b, 0);
  const left = cap - spent;
  const command = view.events && view.events[0];
  useEffect(() => {
    setJoining(true);
    const t = window.setTimeout(() => setJoining(false), Math.max(500, cap * 45 + 700));
    return () => window.clearTimeout(t);
  }, [cap]);
  const add = (key, e) => {
    if (left < 1) return;
    const tile = e.currentTarget.closest(`.${styles.bidTile}`);
    fly(purseRef.current, tile && tile.querySelector(`.${styles.bidCard}`));
    setBids((b) => ({...b, [key]: (b[key] || 0) + 1}));
  };
  const same = JSON.stringify(Object.entries(bids).sort()) === JSON.stringify(Object.entries(placed || {}).sort());
  return (
    <>
      <div className={shell.card}>
        <div className={styles.bidHead}>
          <div className={styles.bidHeadMain}>
            <p className={shell.bigText}>{tg(lang, 'bidTitle')}</p>
            <div className={styles.purse} ref={purseRef} aria-live="polite" aria-label={`${left}`}>
              {Array.from({length: cap}, (_, i) => (
                <span
                  key={i}
                  className={styles.purseCoin}
                  data-spent={i >= left}
                  data-join={joining ? 'in' : undefined}
                  style={{'--join-delay': `${i * 45}ms`}}>
                  {coin}
                </span>
              ))}
            </div>
          </div>
          {command && (
            <button type="button" className={`${styles.cardButton} ${styles.bidCommand}`} onClick={() => openEvent(command)}>
              <EventCard ev={command} lang={lang} size={64} dueBadge={command.roundsLeft} />
            </button>
          )}
        </div>
      </div>
      <div className={styles.bidGrid}>
        {lots.map((c) => {
          const n = bids[c.key] || 0;
          const label = charName(c.key, lang);
          return (
            <div key={c.key} className={styles.bidTile} data-bid={n > 0}>
              <button type="button" className={`${styles.cardButton} ${styles.bidCard}`} onClick={() => openChar(c.key, {married: c.married || null})}>
                <CharCard k={c.key} lang={lang} size={120} />
                {n > 0 && (
                  <span key={n} className={styles.bidBadge}>
                    {coin}
                    {n}
                  </span>
                )}
              </button>
              <span className={styles.bidButtons}>
                <button type="button" className={`button button--sm button--primary ${styles.wagePlus}`} disabled={left < 1} aria-label={tg(lang, 'addBid', {x: label})} onClick={(e) => add(c.key, e)}>
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
      {layer}
    </>
  );
}

/** Duel raise: + stacks coins onto the wager with a fly-in; lock when ready. */
function RaiseWage({min, max, lang, send}) {
  const start = Math.max(1, Math.min(min || 1, max || 1));
  const [bet, setBet] = useState(start);
  const {fly, layer} = useCoinFlights();
  const stackRef = useRef(null);
  const plusRef = useRef(null);
  const bump = () => {
    if (bet >= max) return;
    fly(plusRef.current, stackRef.current);
    setBet((n) => Math.min(max, n + 1));
  };
  return (
    <div className={styles.wageBox}>
      <p className={shell.muted}>{tg(lang, 'raiseHint')}</p>
      <div className={styles.wageRow}>
        <div className={styles.wageStack} ref={stackRef} aria-live="polite" aria-label={tg(lang, 'bet', {n: bet})}>
          {Array.from({length: bet}, (_, i) => (
            <span key={i} className={styles.wageCoin}>
              {coin}
            </span>
          ))}
          <b>{tg(lang, 'bet', {n: bet})}</b>
        </div>
        <button ref={plusRef} type="button" className={`button button--lg button--primary ${styles.wagePlus}`} disabled={bet >= max} aria-label="+" onClick={bump}>
          +
        </button>
      </div>
      <button type="button" className="button button--primary button--block" onClick={() => send({action: 'answer', bet})}>
        {tg(lang, 'lockBet')}
      </button>
      {layer}
    </div>
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
          <RaiseWage min={p.min || 1} max={Math.max(1, p.max || 1)} lang={lang} send={send} />
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

/** Collapsed command/ability card; tap to expand the menu underneath. */
function FoldCard({open, onToggle, card, title, openLabel, closeLabel, children}) {
  return (
    <div className={styles.foldCard} data-open={open || undefined}>
      <button type="button" className={styles.foldToggle} aria-expanded={Boolean(open)} onClick={onToggle}>
        <span className={styles.foldArt}>{card}</span>
        <span className={styles.foldTitle}>{title}</span>
        <span className={styles.foldHint}>{open ? closeLabel : openLabel}</span>
      </button>
      {open && <div className={styles.foldBody}>{children}</div>}
    </div>
  );
}

/** Compact 2–3-up foe cities for conquest target pick. */
function ConquerCityPick({foes, goal, lang, onPick}) {
  return (
    <div className={styles.conquerCities}>
      {(foes || []).map((foe) => (
        <div key={foe.id} className={styles.conquerCity} style={{'--owner': foe.color || '#2a1630'}}>
          <p className={styles.conquerCityHead}>
            {foe.letter} · {foe.name}
          </p>
          <div className={styles.conquerCityPlot}>
            <CityPlot
              city={foe.city}
              goal={goal}
              color={foe.color}
              lang={lang}
              fit={{width: 132, height: 96}}
              hot={foe.city.filter((c) => c.ok).map((c) => c.uid)}
              onTap={(c) => {
                if (!c.ok) return;
                onPick(c.uid);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ally + confirm steps after a conquest building is chosen. */
function ConquerAllyStep({pick, targets, players, me, lang, onChange, onBack, onConfirm}) {
  const district = (targets.find((x) => x.uid === pick.uid) || {}).key;
  return (
    <>
      <p>
        {L(DISTRICT[district], lang)} · {tg(lang, 'ally')}
      </p>
      <div className={shell.choiceGrid}>
        <button type="button" className="button button--sm" aria-pressed={!pick.ally} onClick={() => onChange({...pick, ally: null})}>
          {tg(lang, 'noAlly')}
        </button>
        {players
          .filter((p) => p.id !== me)
          .map((p) => (
            <button key={p.id} type="button" className="button button--sm" aria-pressed={pick.ally === p.id} onClick={() => onChange({...pick, ally: p.id})}>
              {p.name}
            </button>
          ))}
      </div>
      {pick.ally && (
        <div className={shell.choiceGrid}>
          {[0, 1, 2, 3].map((n) => (
            <button key={n} type="button" className="button button--sm" aria-pressed={pick.offer === n} onClick={() => onChange({...pick, offer: n})}>
              {tg(lang, 'offer', {n})}
            </button>
          ))}
        </div>
      )}
      <div className={shell.choiceGrid}>
        <button type="button" className="button button--secondary" onClick={onBack}>
          {tg(lang, 'closePreview')}
        </button>
        <button type="button" className="button" onClick={onConfirm}>
          {tg(lang, 'conquer')}
        </button>
      </div>
    </>
  );
}

function ExtravaganceMenu({charisma, players, me, gifts, setGifts, lang, onSend}) {
  const total = Object.values(gifts).reduce((a, b) => a + b, 0);
  const others = players.filter((p) => p.id !== me);
  return (
    <>
      <p className={shell.muted}>{tg(lang, 'extravagance', {n: charisma})}</p>
      <button
        type="button"
        className="button button--secondary button--block"
        onClick={() => {
          if (!others.length) return;
          const base = Math.floor(charisma / others.length);
          const rem = charisma - base * others.length;
          const next = {};
          others.forEach((p, i) => {
            next[p.id] = base + (i < rem ? 1 : 0);
          });
          setGifts(next);
        }}>
        {tg(lang, 'splitEven')}
      </button>
      <div className={shell.choiceGrid}>
        {others.map((p) => (
          <button key={p.id} type="button" className="button button--sm" disabled={total >= charisma} onClick={() => setGifts((g) => ({...g, [p.id]: (g[p.id] || 0) + 1}))}>
            {tg(lang, 'give')} → {p.name} ({gifts[p.id] || 0})
          </button>
        ))}
      </div>
      <button type="button" className="button" disabled={total !== charisma} onClick={() => onSend(gifts)}>
        {charisma - total > 0 ? tg(lang, 'toGive', {n: charisma - total}) : tg(lang, 'extravagance', {n: charisma})}
      </button>
    </>
  );
}

/** Command / princess reserve after your characters finish (until calling ends). */
function SoftPanel({view, lang, send, openChar}) {
  const soft = view.soft;
  if (!soft) return null;
  const [conquest, setConquest] = useState(null);
  const [gifts, setGifts] = useState({});
  const [suitor, setSuitor] = useState(soft.suitors[0] || null);
  const [fold, setFold] = useState({});
  const toggle = (k) => setFold((f) => ({...f, [k]: !f[k]}));
  const cmd = (kind) => (view.events || []).find((e) => e.kind === kind);
  const has = soft.reserve.length > 0 || soft.marry || soft.conquer || soft.extravagance;
  if (!has) return null;
  const openL = tg(lang, 'foldOpen');
  const closeL = tg(lang, 'foldClose');
  return (
    <div className={shell.card}>
      <p className={shell.kicker}>{tg(lang, 'softLater')}</p>
      <div className={styles.foldRow}>
        {soft.reserve.length > 0 && (
          <FoldCard
            open={Boolean(fold.reserve)}
            onToggle={() => toggle('reserve')}
            card={<CharCard k={soft.reserve[0]} lang={lang} size={52} />}
            title={tg(lang, 'softReserve')}
            openLabel={openL}
            closeLabel={closeL}>
            <div className={styles.cards}>
              {soft.reserve.map((u) => (
                <button
                  key={u}
                  type="button"
                  className={styles.cardButton}
                  onClick={() =>
                    openChar(u, {
                      action: {
                        label: tg(lang, 'reserve'),
                        onClick: () => send({action: 'reserve', pick: u}),
                      },
                    })
                  }>
                  <CharCard k={u} lang={lang} size={40} />
                </button>
              ))}
            </div>
          </FoldCard>
        )}
        {soft.marry && soft.suitors.length > 0 && soft.dates.length > 0 && (
          <FoldCard
            open={Boolean(fold.marry)}
            onToggle={() => toggle('marry')}
            card={<EventCard ev={cmd('marriage') || {kind: 'marriage', frame: 'gold'}} lang={lang} size={52} />}
            title={tg(lang, 'marry')}
            openLabel={openL}
            closeLabel={closeL}>
            {soft.suitors.length > 1 && (
              <div className={styles.cards}>
                {soft.suitors.map((k) => (
                  <button key={k} type="button" className={styles.cardButton} aria-pressed={suitor === k} onClick={() => setSuitor(k)}>
                    <CharCard k={k} lang={lang} size={36} stats />
                  </button>
                ))}
              </div>
            )}
            <div className={styles.cards}>
              {soft.dates
                .filter((d) => d.key !== suitor)
                .map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={styles.cardButton}
                    disabled={!suitor}
                    onClick={() =>
                      openChar(d.key, {
                        action: {
                          label: tg(lang, 'marry'),
                          onClick: () => send({action: 'marry', mine: suitor, other: d.key}),
                        },
                      })
                    }>
                    <CharCard k={d.key} lang={lang} size={40} stats />
                    <small>{d.owner}</small>
                  </button>
                ))}
            </div>
          </FoldCard>
        )}
        {soft.conquer && soft.targets.length > 0 && (
          <FoldCard
            open={Boolean(fold.conquer) || Boolean(conquest)}
            onToggle={() => {
              if (conquest) {
                setConquest(null);
                setFold((f) => ({...f, conquer: false}));
                return;
              }
              toggle('conquer');
            }}
            card={<EventCard ev={cmd('conquest') || {kind: 'conquest', frame: 'gold'}} lang={lang} size={52} dueBadge={(cmd('conquest') || {}).roundsLeft} />}
            title={tg(lang, 'conquer')}
            openLabel={openL}
            closeLabel={closeL}>
            <p className={shell.muted}>{tg(lang, 'conquerPick')}</p>
            {!conquest ? (
              <ConquerCityPick
                foes={soft.foes}
                goal={view.goal}
                lang={lang}
                onPick={(uid) => {
                  setFold((f) => ({...f, conquer: true}));
                  setConquest({uid, ally: null, offer: 1});
                }}
              />
            ) : (
              <ConquerAllyStep
                pick={conquest}
                targets={soft.targets}
                players={view.players}
                me={view.me}
                lang={lang}
                onChange={setConquest}
                onBack={() => setConquest(null)}
                onConfirm={() => send({action: 'conquer', ...conquest})}
              />
            )}
          </FoldCard>
        )}
        {soft.extravagance && (
          <FoldCard
            open={Boolean(fold.extravagance)}
            onToggle={() => toggle('extravagance')}
            card={<EventCard ev={cmd('extravagance') || {kind: 'extravagance', frame: 'gold'}} lang={lang} size={52} />}
            title={tg(lang, 'extravagance', {n: soft.charisma})}
            openLabel={openL}
            closeLabel={closeL}>
            <ExtravaganceMenu
              charisma={soft.charisma}
              players={view.players}
              me={view.me}
              gifts={gifts}
              setGifts={setGifts}
              lang={lang}
              onSend={(g) => send({action: 'extravagance', gifts: g})}
            />
          </FoldCard>
        )}
      </div>
    </div>
  );
}

function TurnView({view, lang, send, status, openChar, openDistrict, openEvent}) {
  const tv = view.turn;
  const c = charOf(tv.card);
  const act = (msg) => send({...msg, card: tv.card});
  const [guessTarget, setGuessTarget] = useState(null);
  const [redraw, setRedraw] = useState([]);
  const [conquest, setConquest] = useState(null);
  const [gifts, setGifts] = useState({});
  const [fold, setFold] = useState({});
  const [abilityOpen, setAbilityOpen] = useState(false);
  const toggle = (k) => setFold((f) => ({...f, [k]: !f[k]}));
  const openL = tg(lang, 'foldOpen');
  const closeL = tg(lang, 'foldClose');
  const header = (
    <div className={styles.turnHead}>
      <button type="button" className={styles.cardButton} onClick={() => openChar(tv.card, {married: (view.mine.find((c) => c.key === tv.card) || {}).married || null})}>
        <CharCard k={tv.card} lang={lang} size={56} stats={view.statsOn} married={(view.mine.find((c) => c.key === tv.card) || {}).married || null} />
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
        <div className={styles.incomePick}>
          <button type="button" className={`button button--lg ${styles.incomePickBtn}`} onClick={() => act({action: 'gold'})}>
            <span className={styles.incomePickIcon}>{coin}</span>
            <span className={styles.incomePickText}>{tg(lang, 'takeGold')}</span>
          </button>
          <button type="button" className={`button button--lg ${styles.incomePickBtn}`} onClick={() => act({action: 'cards'})}>
            <span className={styles.incomePickIcon}>🃏</span>
            <span className={styles.incomePickText}>{tg(lang, 'takeCards')}</span>
          </button>
        </div>
        {status}
      </>
    );
  }
  if (tv.step === 'keep') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'keepOne')}</p>
        <div className={styles.keepPick}>
          {tv.drawn.map((d) => (
            <button
              key={d.uid}
              type="button"
              className={`${styles.cardButton} ${styles.keepPickCard}`}
              onClick={() =>
                openDistrict(d.key, {
                  action: {
                    label: tg(lang, 'keepThis'),
                    onClick: () => act({action: 'keep', uid: d.uid}),
                  },
                })
              }>
              <DistrictCard k={d.key} lang={lang} size={180} />
            </button>
          ))}
        </div>
        {status}
      </>
    );
  }
  const can = tv.usesLeft > 0 && !tv.waiting;
  const panel = (title, children) => (
    <FoldCard
      open={abilityOpen}
      onToggle={() => setAbilityOpen((o) => !o)}
      card={<CharCard k={tv.card} lang={lang} size={52} stats={view.statsOn} />}
      title={title}
      openLabel={openL}
      closeLabel={closeL}>
      {children}
    </FoldCard>
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
            {(view.handAll || view.hand).map((h) => (
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
      {tv.buildLeft > 0 && view.hand.some((h) => h.ok) && <p className={shell.muted}>{tg(lang, 'tapBuild')}</p>}
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
            (view.handAll || view.hand).map((h) => (
              <button key={h.uid} type="button" className="button button--sm" onClick={() => act({action: 'lab', uid: h.uid})}>
                {tg(lang, 'lab')}: {L(DISTRICT[h.key], lang)}
              </button>
            ))}
        </div>
      )}
      {(ev('marriage') || ev('conquest') || ev('extravagance')) && (
        <div className={styles.foldRow}>
          {ev('marriage') && tv.dates.length > 0 && !tv.waiting && (
            <FoldCard
              open={Boolean(fold.marry)}
              onToggle={() => toggle('marry')}
              card={<EventCard ev={ev('marriage')} lang={lang} size={52} dueBadge={ev('marriage').roundsLeft} />}
              title={tg(lang, 'marry')}
              openLabel={openL}
              closeLabel={closeL}>
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
            </FoldCard>
          )}
          {ev('conquest') && tv.targets.length > 0 && (
            <FoldCard
              open={Boolean(fold.conquer) || Boolean(conquest)}
              onToggle={() => {
                if (conquest) {
                  setConquest(null);
                  setFold((f) => ({...f, conquer: false}));
                  return;
                }
                toggle('conquer');
              }}
              card={<EventCard ev={ev('conquest')} lang={lang} size={52} dueBadge={ev('conquest').roundsLeft} />}
              title={tg(lang, 'conquer')}
              openLabel={openL}
              closeLabel={closeL}>
              <p className={shell.muted}>{tg(lang, 'conquerPick')}</p>
              {!conquest ? (
                <ConquerCityPick
                  foes={tv.foes || []}
                  goal={view.goal}
                  lang={lang}
                  onPick={(uid) => {
                    setFold((f) => ({...f, conquer: true}));
                    setConquest({uid, ally: null, offer: 1});
                  }}
                />
              ) : (
                <ConquerAllyStep
                  pick={conquest}
                  targets={tv.targets}
                  players={view.players}
                  me={view.me}
                  lang={lang}
                  onChange={setConquest}
                  onBack={() => setConquest(null)}
                  onConfirm={() => act({action: 'conquer', ...conquest})}
                />
              )}
            </FoldCard>
          )}
          {ev('extravagance') && (
            <FoldCard
              open={Boolean(fold.extravagance)}
              onToggle={() => toggle('extravagance')}
              card={<EventCard ev={ev('extravagance')} lang={lang} size={52} dueBadge={ev('extravagance').roundsLeft} />}
              title={tg(lang, 'extravagance', {n: tv.charisma})}
              openLabel={openL}
              closeLabel={closeL}>
              <ExtravaganceMenu
                charisma={tv.charisma}
                players={view.players}
                me={view.me}
                gifts={gifts}
                setGifts={setGifts}
                lang={lang}
                onSend={(g) => act({action: 'extravagance', gifts: g})}
              />
            </FoldCard>
          )}
        </div>
      )}
      {tv.waiting && <p className={shell.muted}>{tg(lang, 'endWhileWait')}</p>}
      <button type="button" className="button button--lg button--block" onClick={() => act({action: 'end'})}>
        {tv.twinsFirst ? tg(lang, 'endFirst') : tg(lang, 'endTurn')}
      </button>
      {status}
    </>
  );
}

export default sultan;
