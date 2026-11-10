import React, {useEffect, useRef, useState} from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT, st} from '../../core/strings';
import Sprite from '../../core/Sprite';
import MathPad, {PoolPicker} from '../../core/MathPad';
import SettingHelp from '../../core/SettingHelp';
import {checkAnswer, makeQuestion} from '../../core/mathQuestions';
import {Avatar, Countdown} from '@site/src/components/BetsAndWagers/ui';
import {MAX_NIGHT_CASTS, MAX_SPELLS, ROLES, ROOMS, SPELL_COST, SPELLS} from './data';
import {
  activeRooms,
  accuseTargets,
  alive,
  canAccuse,
  canLearn,
  canVoteYes,
  cast,
  castVote,
  counts,
  cultOf,
  defenseSlots,
  demonCanKill,
  drawSpell,
  freeUses,
  homework,
  hostEndDay,
  isEvil,
  markReady,
  MAX_REVIVES,
  moveTo,
  mustPickRoleFirst,
  pickSpell,
  revive,
  reviveLimitOf,
  revivesLeft,
  roleAct,
  roleTargets,
  setLock,
  setupUniversity,
  spellTargets,
  suspectVote,
  timeout,
} from './rules';
import shell from '../../core/party.module.css';
import styles from './university.module.css';

const SIDE_TINT = {good: '#4aa8ff', evil: '#8e0e1f'};

const tu = makeT({
  en: {
    holdRole: 'Tap your name to see your role',
    ready: 'I’ve seen it',
    yourCult: 'Your Demon King',
    cultAlone: 'No Demon King in play.',
    kingBlind: 'You do not know who the Demons are.',
    cultMate: '{seat}. {name} · {role}',
    night: 'Night {n}',
    day: 'Day {n}',
    homework: 'Homework',
    knowledge: 'Knowledge',
    grade: 'Grade',
    grades: 'Grades',
    gradeChart: 'Grades over time',
    chartStart: 'Start',
    chartEnd: 'End',
    chartNight: 'N{n}',
    chartDay: 'D{n}',
    chartGood: 'Good',
    chartEvil: 'Evil',
    chartTotal: 'Total grade',
    chartLiving: 'Living',
    chartDrag: 'Drag to a point for the good / evil split',
    student: 'Student',
    cost: '{n} Knowledge',
    lockedTag: 'Locked',
    correct: '{n} correct',
    wrongReveal: 'Incorrect — you entered {got}; correct is {answer}',
    practiceHelp: 'Correct raises Grade and Knowledge; wrong loses 1 of each. Reach the Knowledge cost to graduate as Jr.',
    ok: 'OK',
    panel: 'Skills & actions',
    closePanel: 'Back to homework',
    roleAction: 'Your role tonight',
    noRole: 'Your role has no night action. Keep studying!',
    chosen: 'Chosen: {name}',
    tonight: 'Set for tonight (locked)',
    castTonight: 'Tap to use tonight',
    maxCasts: 'You can use at most {n} skills a night.',
    noSpells: 'No skills yet. Tap + to learn one.',
    pickTarget: 'Choose a target:',
    cancel: 'Cancel',
    handFull: 'Skill hand full ({max}).',
    tapCast: 'Tap to use',
    tapSet: 'Tap to set tonight',
    queuedOn: 'Set for tonight',
    campus: 'Campus',
    youAreIn: 'You are in: {room}',
    moveHere: 'Move',
    roomsSecret: 'Who sleeps where stays secret.',
    roomCount: '{n} sleeping here',
    roomCountOne: '1 sleeping here',
    roomCountEmpty: 'Empty',
    sleepTonight: 'Tonight you sleep in {room}',
    sleepWith: 'With: {names}',
    sleepAlone: 'You are alone in this room.',
    cultReach: 'Investigate someone in your room',
    cultKillReach: 'Slay someone in your room (large class)',
    cultVoteReach: 'Vote who should die tonight (King sees this)',
    cultVotesTitle: 'Demon kill votes',
    cultVoteLine: '{seat}. {name} → {target}',
    cultVoteNone: 'No Demon votes yet.',
    mustPickFirst: 'Pick your night target before homework.',
    profReach: 'Investigate one roommate (once tonight — result is instant)',
    profReachEmpty: 'No one else is in your room to investigate.',
    profResultNow: 'Result (instant):',
    cultReachEmpty: 'No one else is in your room tonight.',
    lockKey: 'Lock my room tonight (one key per game)',
    keyUsed: 'Your key is used.',
    lockOn: 'Locked tonight',
    shop: 'Skill shop',
    learnAdd: 'Learn a skill',
    drawSpell: 'Learn a skill',
    drawCost: 'Costs {n} Knowledge · keep 1 of 2',
    pickOne: 'Pick one to keep:',
    owned: 'Owned',
    mySpells: 'Skills',
    usesLeft: '{n} left',
    usesAll: 'unlimited',
    passiveOn: 'always on',
    tagPassive: 'Passive',
    tagSet: 'Set',
    castNow: 'Use',
    setTonight: 'Set for tonight',
    needKnowledge: 'Need {n} Knowledge to learn.',
    learnedAllPool: 'You already know every skill.',
    learnedHandFull: 'You already hold {max} skills.',
    news: 'What you learned',
    holdNews: 'Hold to see last night’s result',
    noNews: 'Nothing new last night.',
    suspectTitle: 'Who do you suspect?',
    suspectNoGrade: 'Players with Grade 0 can’t be accused (do some homework first).',
    suspectNoneLeft: 'Nobody with Grade > 0 to accuse — skipping.',
    suspectSkippedGrade: 'Skipped — Grade 0 players don’t vote (do homework to join ballots).',
    suspectPicked: 'You voted for {name}',
    suspectCol: 'Suspects',
    votesCol: 'Votes',
    suspectNone: '—',
    iVoted: 'I voted',
    waitingVote: 'Waiting…',
    revealing: 'Votes revealing…',
    voteQ: 'Who should be expelled?',
    voteRunoffQ: 'Tie! Vote again among these only.',
    voteNone: 'Nobody',
    voted: 'I voted. Waiting for everyone…',
    votedLocked: 'Vote locked.',
    hushed: 'You are hushed: you can’t vote on this ballot.',
    ghostHas: 'You have one ghost vote left.',
    ghostSpent: 'You used your ghost vote.',
    defense: 'Accused, speak in your defense!',
    accusedList: 'On the stand: {names}',
    onBlock: 'Facing expulsion: {name} ({n} votes)',
    tieBlock: 'Tied — runoff next.',
    tieReveal: 'Even votes — runoff among the tied.',
    suspectOpen: 'Suspicion vote open — mark who you distrust.',
    defenseSlots: 'Top {n} accused defend',
    expelled: '{name} is expelled.',
    noExpel: 'Nobody is expelled today.',
    endDay: 'Open suspicion vote ▶',
    closeSuspect: 'Close suspicion vote ▶',
    dawn: 'Dawn',
    slainTonight: 'Slain tonight:',
    peaceful: 'Nobody was slain.',
    dead: 'You are out. Keep doing math to raise Knowledge (and Grade). Graduate as Jr when you can afford it. You may still talk, and vote once more.',
    revive: 'Graduate as Jr ({n} Knowledge · {left}/{max} left)',
    reviveInf: 'Graduate as Jr ({n} Knowledge)',
    reviveNeed: 'Need {n} Knowledge to graduate (you have {have}). {left}/{max} revives left.',
    reviveNeedInf: 'Need {n} Knowledge to graduate (you have {have}).',
    reviveMaxed: 'No more lives — you already graduated {max} times.',
    reviveOff: 'Revive is off this game.',
    reviveMax: 'Revives per player',
    reviveMaxInf: '∞',
    reviveMaxHint: 'How many times one player can graduate as Jr (1, 2, or unlimited).',
    goodWin: 'The university is saved!',
    evilWin: 'The Demons take the university!',
    why_leadersOut: 'Every Demon King is gone.',
    why_cultOut: 'Every Demon is gone.',
    why_parity: 'Evil is now at least half of the campus.',
    roles: 'Roles',
    now_roles: 'Now: tap your name tile to read your role (Demons see the Demon King), then tap “I’ve seen it”.',
    now_night: 'Now: do your homework. Open “Skills & actions” to act or use a skill.',
    now_day: 'Now: talk, move rooms, learn skills, and mark who you suspect.',
    now_dawn: 'Now: hold for last night’s result if you have one. Don’t show your phone.',
    now_suspect: 'Now: cast one locked suspicion vote. Talk while others vote.',
    now_suspectReveal: 'Now: watch the votes reveal.',
    now_vote: 'Now: pick one accused to expel, or nobody. Locked once cast.',
    now_voteReveal: 'Now: watch the expulsion votes reveal.',
    now_defense: 'Now: the accused speak. Final vote next.',
    info_prof: '{name} is {align}.',
    info_cult: '{name} {isProf}.',
    isProf: 'IS a Professor',
    notProf: 'is not a Professor',
    info_reveal: 'Reveal Light: {name} is {align}.',
    info_revealRoom: 'Reveal Light: {list}',
    info_revealEmpty: 'Reveal Light: nobody else is in your room.',
    info_gone: 'Reveal Light: {name} was not in your room.',
    info_lantern: 'Lantern Count: {n} evil in {room}.',
    info_flower: 'Flower Watch: a Demon King {answer} vote yes yesterday.',
    did: 'DID',
    didNot: 'did not',
    info_secondwind: 'Second Wind: a night-slay failed on you (votes can still expel you).',
    info_soldier: 'Iron Student: the Demon King’s night-slay failed on you.',
    info_dormplate: 'Dorm Armor: a non–Demon King night-slay failed on you.',
    info_golemhide: 'Stone Skin: you were alone — the night-slay failed.',
    info_cultGuard: 'Your Demon bond blocked the Demon King’s night-slay.',
    info_cultGuardKing: 'Your night-slay failed: {name} is a Demon (protected).',
    info_gifted: '{name} gave you {n} Knowledge.',
    info_chamber: 'Same Dorm: {name} is {align}.',
    info_drunk: 'Tipsy Alibi: {name} is truly {align}.',
    info_alone: 'Nobody else is in your room.',
    info_fortune: 'Twin Probe: {nameA} / {nameB} — {demonPair}.',
    demonPairYes: 'a Demon is among them',
    demonPairNo: 'neither is a Demon',
    info_fortuneNeed: 'Twin Probe: need at least 2 other roommates.',
    info_washer: 'Office Hours: {nameA} or {nameB} is a Demon.',
    info_washerNone: 'Office Hours: no Demon in your room.',
    info_ojo: 'Named Prey: tonight’s lock-ignore target is {name}.',
    info_advocate: 'Devil’s Pardon: {name} cannot be expelled today.',
    info_fearMark: 'Fear Mark: marked {name}.',
    info_fear: 'Fear Mark: {name} is {align}.',
    info_pardoned: 'Devil’s Pardon saved you from expulsion.',
    info_godfather: 'Fall Guy: you died in the Demon King’s place.',
    info_godfatherSave: 'Fall Guy: a Demon died instead of you.',
    info_scarlet: 'Heir: you are now the Demon King.',
    info_cultAway: 'You went quiet — your Demon (cultist) role passed to {name}.',
    info_cultHeir: 'YOU ARE NOW THE CULTIST (Demon). Open your role tile — you see the Demon King and vote kills for evil.',
    becameCultist: 'YOU ARE NOW THE CULTIST',
    becameCultistHint: 'Tap your name to open your new Demon role. You are evil now.',
    info_raven: 'Last Glimpse: {list}',
    rarityB: 'B',
    rarityA: 'A',
    rarityS: 'S',
    good: 'good',
    evil: 'evil',
    nightSeconds: 'Night length',
    dayMinutes: 'Day length',
    reviveAt: 'New life at Knowledge',
    reviveNone: 'Off',
    demonKillAt: 'Demon roommate-kill when alive above',
    demonKillAtHint: 'At or below this many living players, Demons vote a kill; above it, they slay a roommate.',
    showRooms: 'Show who is in each room (day, big screen)',
    showRoomsOn: 'Show names',
    showRoomsOff: 'Hide names (icons still show)',
    showRoomsHint: 'Day only on the host screen. Night stays secret either way. Avatars always appear on room cards.',
    showHwPop: 'Homework +1/−1 floats on rooms',
    showHwPopOn: 'On',
    showHwPopOff: 'Off',
    showHwPopHint: 'When someone scores homework, a +1 or −1 floats up from their room with their icon.',
    spellCost: 'Knowledge to learn a skill',
    spellCostHint: 'Cost to draw 2 skills and keep 1.',
    idleKickNights: 'Kick if no homework',
    idleKickOff: 'Off',
    idleKickHint: 'Living players who skip homework this many nights in a row are removed (any correct or wrong answer counts).',
    idleKickedTonight: 'Removed (no homework):',
    info_idleKick: 'Removed: no homework for {n} nights in a row.',
    tables: 'Homework questions',
    sec: '{n} s',
    min: '{n} min',
    setupLine: '{n} players: {demonking} Demon Kings, {demon} Demons, {professor} Professors, {exchange} Exchange Students, {student} Students',
    hostNight: 'Night: everyone does homework. Skills and actions happen in secret.',
    lock: 'locked',
  },
  zh: {
    holdRole: '点名字查看角色',
    ready: '我看好了',
    yourCult: '你的魔王',
    cultAlone: '本局没有魔王。',
    kingBlind: '你不知道谁是魔。',
    cultMate: '{seat}. {name} · {role}',
    night: '第 {n} 夜',
    day: '第 {n} 天',
    homework: '作业',
    knowledge: '知识',
    grade: '成绩',
    grades: '成绩榜',
    gradeChart: '成绩走势',
    chartStart: '开局',
    chartEnd: '终局',
    chartNight: '夜{n}',
    chartDay: '昼{n}',
    chartGood: '善良',
    chartEvil: '邪恶',
    chartTotal: '总成绩',
    chartLiving: '存活',
    chartDrag: '拖到某点查看善恶比例',
    student: '学生',
    cost: '{n} 知识',
    lockedTag: '已上锁',
    correct: '答对 {n} 题',
    wrongReveal: '答错 — 你的输入：{got}；正确答案：{answer}',
    practiceHelp: '答对加成绩和知识，答错各扣 1 点。攒够知识可毕业变成 Jr。',
    ok: '确定',
    panel: '技能与行动',
    closePanel: '回到作业',
    roleAction: '你今晚的角色行动',
    noRole: '你的角色夜晚没有行动。继续学习吧！',
    chosen: '已选择：{name}',
    tonight: '今晚已设定（已锁定）',
    castTonight: '点按今晚使用',
    maxCasts: '每晚最多使用 {n} 个技能。',
    noSpells: '还没有技能。点 + 学习一个。',
    pickTarget: '选择目标：',
    cancel: '取消',
    handFull: '技能栏已满（{max}）。',
    tapCast: '点按使用',
    tapSet: '点按设为今晚',
    queuedOn: '已设为今晚',
    campus: '校园',
    youAreIn: '你在：{room}',
    moveHere: '移动',
    roomsSecret: '谁睡在哪个房间保密。',
    roomCount: '{n} 人在此休息',
    roomCountOne: '1 人在此休息',
    roomCountEmpty: '空房',
    sleepTonight: '今晚你睡在{room}',
    sleepWith: '同房：{names}',
    sleepAlone: '这间房里只有你。',
    cultReach: '调查你房间里的某人',
    cultKillReach: '击倒你房间里的某人（大桌）',
    cultVoteReach: '投票今晚谁该死（魔王可见）',
    cultVotesTitle: '魔的击杀投票',
    cultVoteLine: '{seat}. {name} → {target}',
    cultVoteNone: '还没有魔投票。',
    mustPickFirst: '先选今晚目标，再做作业。',
    profReach: '调查一名同房（今晚一次——结果立刻显示）',
    profReachEmpty: '你房间里没有其他人可调查。',
    profResultNow: '调查结果（即时）：',
    cultReachEmpty: '今晚你房间里没有其他人。',
    lockKey: '今晚锁上我的房间（每局一把钥匙）',
    keyUsed: '你的钥匙已经用掉了。',
    lockOn: '今晚上锁',
    shop: '技能商店',
    learnAdd: '学习技能',
    drawSpell: '学习技能',
    drawCost: '花费 {n} 知识 · 二选一',
    pickOne: '选一个留下：',
    owned: '已拥有',
    mySpells: '技能',
    usesLeft: '剩 {n} 次',
    usesAll: '无限次',
    passiveOn: '一直生效',
    tagPassive: '被动',
    tagSet: '已设',
    castNow: '使用',
    setTonight: '设定为今晚',
    needKnowledge: '需要 {n} 知识才能学习。',
    learnedAllPool: '你已经学会全部技能。',
    learnedHandFull: '你已持有 {max} 个技能。',
    news: '你得知的信息',
    holdNews: '按住查看昨夜结果',
    noNews: '昨夜没有新消息。',
    suspectTitle: '你怀疑谁？',
    suspectNoGrade: '成绩为 0 的玩家不能被指控（先做作业）。',
    suspectNoneLeft: '没有成绩 > 0 的可指控对象——自动跳过。',
    suspectSkippedGrade: '已跳过——成绩为 0 不参与投票（先做作业才能投票）。',
    suspectPicked: '你投了 {name}',
    suspectCol: '怀疑',
    votesCol: '票数',
    suspectNone: '—',
    iVoted: '已投票',
    waitingVote: '等待中…',
    revealing: '正在开票…',
    voteQ: '开除谁？',
    voteRunoffQ: '平票！只在这些人里再投一次。',
    voteNone: '谁也不开除',
    voted: '已投票。等待其他人…',
    votedLocked: '投票已锁定。',
    hushed: '你被噤声了：这次不能投票。',
    ghostHas: '你还有一张幽灵票。',
    ghostSpent: '你的幽灵票已经用掉了。',
    defense: '被指控者，请为自己辩护！',
    accusedList: '被告席：{names}',
    onBlock: '即将被开除：{name}（{n} 票）',
    tieBlock: '平票——即将加赛。',
    tieReveal: '票数相同——平票者进入加赛。',
    suspectOpen: '怀疑投票开始——标出你不信任的人。',
    defenseSlots: '得票最高的 {n} 人辩护',
    expelled: '{name} 被开除了。',
    noExpel: '今天没有人被开除。',
    endDay: '开始怀疑投票 ▶',
    closeSuspect: '结束怀疑投票 ▶',
    dawn: '天亮了',
    slainTonight: '昨夜被击倒：',
    peaceful: '昨夜无人被击倒。',
    dead: '你已出局。继续做数学攒知识（成绩也会涨）。够知识就能毕业变成 Jr。你仍然可以发言，还能再投一票。',
    revive: '毕业变成 Jr（{n} 知识 · 剩 {left}/{max}）',
    reviveInf: '毕业变成 Jr（{n} 知识）',
    reviveNeed: '毕业需要 {n} 知识（你有 {have}）。还可复活 {left}/{max} 次。',
    reviveNeedInf: '毕业需要 {n} 知识（你有 {have}）。',
    reviveMaxed: '不能再复活——本局已毕业 {max} 次。',
    reviveOff: '本局未开启复活。',
    reviveMax: '每人可复活次数',
    reviveMaxInf: '∞',
    reviveMaxHint: '一名玩家本局最多毕业变成 Jr 几次（1、2 或无限）。',
    goodWin: '大学得救了！',
    evilWin: '魔占领了大学！',
    why_leadersOut: '所有魔王都出局了。',
    why_cultOut: '所有魔都出局了。',
    why_parity: '邪恶已占校园人数的一半或更多。',
    roles: '角色',
    now_roles: '现在：点名字条查看角色（魔会看到魔王），然后点“我看好了”。',
    now_night: '现在：做作业。打开“技能与行动”来行动或使用技能。',
    now_day: '现在：讨论、换房间、学习技能，并标出你怀疑的人。',
    now_dawn: '现在：如有昨夜结果，按住查看。不要给别人看手机。',
    now_suspect: '现在：投一票锁定怀疑。其他人投票时仍可讨论。',
    now_suspectReveal: '现在：观看开票。',
    now_vote: '现在：从被告中选一人开除，或谁也不开除。投出后锁定。',
    now_voteReveal: '现在：观看开除开票。',
    now_defense: '现在：被告辩护。接下来是最终投票。',
    info_prof: '{name} 是{align}的。',
    info_cult: '{name}{isProf}。',
    isProf: '是教授',
    notProf: '不是教授',
    info_reveal: '显形之光：{name} 是{align}的。',
    info_revealRoom: '显形之光：{list}',
    info_revealEmpty: '显形之光：你房间里没有其他人。',
    info_gone: '显形之光：{name} 不在你的房间。',
    info_lantern: '灯笼计数：{room} 里有 {n} 名邪恶玩家。',
    info_flower: '花之守望：昨天魔王{answer}投赞成票。',
    did: '有',
    didNot: '没有',
    info_secondwind: '回气：一次夜晚击倒对你失败了（投票仍可开除你）。',
    info_soldier: '铁生：魔王的夜晚击倒对你失败了。',
    info_dormplate: '寝甲：一次非魔王夜晚击倒对你失败了。',
    info_golemhide: '石肤：你独自在房——夜晚击倒失败了。',
    info_cultGuard: '魔的羁绊挡住了魔王的夜晚击倒。',
    info_cultGuardKing: '你的夜晚击倒失败了：{name} 是魔（受保护）。',
    info_gifted: '{name} 送给你 {n} 点知识。',
    info_chamber: '同寝：{name} 是{align}的。',
    info_drunk: '醉辩：{name} 真实阵营是{align}。',
    info_alone: '你房间里没有其他人。',
    info_fortune: '双探：{nameA} / {nameB} — {demonPair}。',
    demonPairYes: '其中有魔',
    demonPairNo: '都不是魔',
    info_fortuneNeed: '双探：同房其他玩家不足 2 人。',
    info_washer: '答疑：{nameA} 或 {nameB} 是魔。',
    info_washerNone: '答疑：你房间里没有魔。',
    info_ojo: '点名猎物：今晚无视上锁的目标是 {name}。',
    info_advocate: '赦免：{name} 今天不能被开除。',
    info_fearMark: '恐惧标记：已标记 {name}。',
    info_fear: '恐惧标记：{name} 是{align}的。',
    info_pardoned: '赦免救了你，你没有被开除。',
    info_godfather: '替罪：你替魔王死了。',
    info_godfatherSave: '替罪：一名魔替你死了。',
    info_scarlet: '继位：你现在是魔王。',
    info_cultAway: '你太久没行动——你的魔（邪教徒）身份传给了{name}。',
    info_cultHeir: '你现在是邪教徒（魔）！点开角色牌——你能看见魔王，并为邪恶阵营投票击杀。',
    becameCultist: '你现在是邪教徒',
    becameCultistHint: '点按你的名字查看新的魔身份。你现在属于邪恶阵营。',
    info_raven: '临终一瞥：{list}',
    rarityB: 'B',
    rarityA: 'A',
    rarityS: 'S',
    good: '善良',
    evil: '邪恶',
    nightSeconds: '夜晚时长',
    dayMinutes: '白天时长',
    reviveAt: '知识换命门槛',
    reviveNone: '关闭',
    demonKillAt: '存活超过此人数时魔可击倒同房',
    demonKillAtHint: '存活人数不超过该值时魔投票击杀；超过后改为击倒同房。',
    showRooms: '白天大屏显示各房间里有谁',
    showRoomsOn: '显示名字',
    showRoomsOff: '隐藏名字（仍显示头像）',
    showRoomsHint: '仅白天大屏。夜晚无论怎样都保密。房间卡上始终显示头像。',
    showHwPop: '作业 ±1 从房间飘出',
    showHwPopOn: '开',
    showHwPopOff: '关',
    showHwPopHint: '有人答对/答错作业时，对应房间飘出带头像的 +1 或 −1。',
    spellCost: '学习技能所需知识',
    spellCostHint: '花这些知识抽出 2 个技能并留下 1 个。',
    idleKickNights: '不做功课则踢出',
    idleKickOff: '关',
    idleKickHint: '连续这么多个夜晚完全不做功课（对或错都算）的存活玩家会被移出本局。',
    idleKickedTonight: '因不做功课移出：',
    info_idleKick: '你被移出：连续 {n} 个夜晚没有做作业。',
    tables: '作业题型',
    sec: '{n} 秒',
    min: '{n} 分钟',
    setupLine: '{n} 名玩家：{demonking} 魔王、{demon} 魔、{professor} 教授、{exchange} 交换生、{student} 学生',
    hostNight: '夜晚：所有人做作业。技能和行动都在秘密进行。',
    lock: '已上锁',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to Clocktower University. Study hard… and trust no one.', zh: '欢迎来到钟楼大学。好好学习……谁也别信。'},
  dusk: {en: 'Night falls. Everyone, open your homework.', zh: '夜幕降临。所有人，打开你的作业。'},
  slain: {en: '{seat} was slain in the night.', zh: '{seat}在夜里被击倒了。'},
  peaceful: {en: 'Morning comes. Nobody was slain.', zh: '天亮了。昨夜无人被击倒。'},
  cultTransfer: {en: 'A quiet Demon passed their role to another student.', zh: '一名不活跃的魔把身份传给了另一名学生。'},
  idleKick: {en: '{seat} is removed for skipping homework.', zh: '{seat}因不做功课被移出。'},
  day: {en: 'Skills are open. Talk, move, then mark your suspects.', zh: '可以学习技能了。讨论、移动，然后标出你怀疑的人。'},
  suspect: {en: 'Suspicion vote. Mark who you distrust.', zh: '怀疑投票。标出你不信任的人。'},
  defense: {en: 'The accused may speak.', zh: '被指控者可以发言。'},
  vote: {en: 'Final vote. Who should leave?', zh: '最终投票。谁该离开？'},
  expelled: {en: '{seat} is expelled from the university.', zh: '{seat}被开除出大学。'},
  no_expel: {en: 'Today, no one is expelled.', zh: '今天没有人被开除。'},
  win_good: {en: 'The Demons are gone. Classes can continue.', zh: '魔消失了，课程可以继续了。'},
  win_evil: {en: 'The Demons rule the campus now.', zh: '魔现在统治了校园。'},
};

const roomName = (r, lang) => (ROOMS[r] ? L(ROOMS[r], lang) : '?');

/** A room's floor plan. */
function RoomPlan({r, size = 40}) {
  return <Sprite path={ROOMS[r].art} emoji="" label="" tint="#fbf3df" shape="icon" size={`${size}px`} />;
}

/**
 * Campus room card: floor plan | name + people (host / night).
 * `compact`: phone move picker — image on top, name below.
 * `people` entries: {id, seat, name, avatar, color, dead?, role?, pickable?}
 */
function RoomCard({
  roomId,
  lang,
  people = null,
  count = null,
  locked = false,
  selected = false,
  secret = false,
  compact = false,
  onRoomClick,
  onPersonClick,
  me = null,
  pops = null,
  onPopDone = null,
}) {
  const [named, setNamed] = useState(null);
  if (!ROOMS[roomId]) return null;
  const countLabel =
    count == null
      ? null
      : count <= 0
        ? tu(lang, 'roomCountEmpty')
        : count === 1
          ? tu(lang, 'roomCountOne')
          : tu(lang, 'roomCount', {n: count});
  if (compact) {
    return (
      <button
        type="button"
        className={styles.roomPick}
        data-selected={selected || undefined}
        aria-pressed={selected}
        aria-label={L(ROOMS[roomId], lang)}
        onClick={() => onRoomClick && onRoomClick(roomId)}>
        <span className={styles.roomPickArt} aria-hidden="true">
          <RoomPlan r={roomId} size={96} />
        </span>
        <b className={styles.roomPickName}>{L(ROOMS[roomId], lang)}</b>
      </button>
    );
  }
  const body = (
    <>
      <div className={styles.roomArt} aria-hidden="true">
        <RoomPlan r={roomId} size={120} />
        {pops && pops.length > 0 && (
          <span className={styles.hwPopLayer} aria-hidden="true">
            {pops.map((pop, i) => (
              <span
                key={pop.key}
                className={styles.hwFloat}
                data-neg={pop.n < 0 || undefined}
                style={{animationDelay: `${Math.min(i, 6) * 70}ms`}}
                onAnimationEnd={() => onPopDone && onPopDone(pop.key)}
              >
                {pop.avatar != null || pop.color != null ? (
                  <Avatar avatar={pop.avatar} color={pop.color} size="xs" />
                ) : null}
                <b>{pop.n > 0 ? '+1' : '−1'}</b>
              </span>
            ))}
          </span>
        )}
      </div>
      <div className={styles.roomInfo}>
        <span className={styles.roomHead}>
          <b>{L(ROOMS[roomId], lang)}</b>
          {locked && <span className={styles.lockTag}>{tu(lang, 'lockedTag')}</span>}
        </span>
        {secret && !(people && people.length) && countLabel && (
          <span className={styles.roomCount}>{countLabel}</span>
        )}
        {secret && !(people && people.length) && !countLabel && (
          <span className={shell.muted}>{tu(lang, 'roomsSecret')}</span>
        )}
        {!secret && people && people.length === 0 && <span className={shell.muted}>{tu(lang, 'sleepAlone')}</span>}
        {people && people.length > 0 && (
          <span className={styles.people}>
            {people.map((p) => {
              const role = !secret && p.role && ROLES[p.role];
              const showName = !secret && named === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={styles.personBtn}
                  data-me={p.id === me || undefined}
                  data-dead={p.dead || undefined}
                  data-named={showName || undefined}
                  data-secret={secret || undefined}
                  aria-pressed={showName}
                  aria-label={secret ? `${p.seat}` : showName ? p.name : `${p.seat}`}
                  title={secret ? undefined : p.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (secret) {
                      if (p.pickable && onPersonClick) onPersonClick(p.id);
                      return;
                    }
                    setNamed((cur) => (cur === p.id ? null : p.id));
                    if (p.pickable && onPersonClick) onPersonClick(p.id);
                  }}>
                  <Avatar avatar={p.avatar} color={p.color} size="sm" />
                  {!secret && <small>{p.seat}</small>}
                  {showName && <span className={styles.personName}>{p.name}</span>}
                  {role && (
                    <em className={styles.roleTag} data-evil={role.side === 'evil' || undefined}>
                      {L(role, lang)}
                    </em>
                  )}
                </button>
              );
            })}
          </span>
        )}
      </div>
    </>
  );
  if (onRoomClick) {
    return (
      <button
        type="button"
        className={styles.room}
        data-locked={locked || undefined}
        data-selected={selected || undefined}
        aria-pressed={selected}
        onClick={() => onRoomClick(roomId)}>
        {body}
      </button>
    );
  }
  return (
    <div className={styles.room} data-locked={locked || undefined}>
      {body}
    </div>
  );
}

function RoleToken({role, lang, size = 72}) {
  const r = ROLES[role];
  return r.art ? <Sprite path={r.art} emoji={r.emoji} label={L(r, lang)} tint={SIDE_TINT[r.side]} size={`${size}px`} shape="token" /> : <span className={styles.bigEmoji} style={{fontSize: size * 0.7}} aria-hidden="true">{r.emoji}</span>;
}

/** A skill's Clocktower icon (falls back to its emoji until the image loads). */
function SpellIcon({k, lang, size = 34}) {
  const sp = SPELLS[k];
  const dim = typeof size === 'number' ? `${size}px` : size;
  return <Sprite path={sp.art} emoji={sp.emoji} label={L(sp, lang)} tint="#ffe566" size={dim} shape="token" />;
}

// ------------------------------------------------------------------ bots

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  // Professors / Demons stay quiet socially: random votes only, no “informed” plays.
  const officer = s.role[id] === 'professor' || s.role[id] === 'demon';
  if (s.phase === 'roles' && !s.ready[id]) return {action: 'ready'};
  if (s.dead[id] && s.phase !== 'vote') return null;
  if (s.phase === 'night') {
    // Demon King does not know Demons — may slay anyone in roleTargets.
    const t = roleTargets(s, id);
    if (t.length && !s.roleTarget[id]) return {action: 'act', target: pick(t, rng)};
    if (rng() < 0.18) return {action: 'hw', total: (s.hw[id] || 0) + 1};
    return null;
  }
  if (s.phase === 'day' || s.phase === 'dawn' || s.phase === 'suspect') {
    if (rng() < 0.02 && canLearn(s, id) && s.knowledge[id] >= (s.spellCost || SPELL_COST)) {
      if (s.offer && s.offer[id] && s.offer[id].length) return {action: 'pick', spell: pick(s.offer[id], rng)};
      return {action: 'draw'};
    }
    if (rng() < 0.015 && s.spells[id].length) {
      const h = pick(s.spells[id], rng);
      if (SPELLS[h.k].type === 'night') {
        const tg = spellTargets(s, id, h.k);
        return {action: 'cast', spell: h.k, target: tg.length ? pick(tg, rng) : undefined};
      }
    }
    if (s.phase === 'suspect' && rng() < 0.02) return {action: 'move', room: pick(activeRooms(s), rng)};
  }
  if (s.phase === 'suspect' && !s.dead[id] && s.suspect[id] == null) {
    const options = accuseTargets(s, id);
    if (!options.length) return {action: 'suspect', target: 'none'};
    if (officer) return {action: 'suspect', target: pick(options, rng)};
    const biased = options.filter((p) => (isEvil(s, id) ? !isEvil(s, p) || rng() < 0.25 : true));
    return {action: 'suspect', target: pick(biased.length ? biased : options, rng)};
  }
  if (s.phase === 'vote' && s.ballot && s.ballot.picks[id] == null) {
    const accused = s.ballot.accused.filter((p) => canAccuse(s, p));
    if (!accused.length) return {action: 'vote', target: 'none'};
    if (officer) return {action: 'vote', target: rng() < 0.55 ? pick(accused, rng) : 'none'};
    if (isEvil(s, id)) {
      const good = accused.filter((p) => !isEvil(s, p));
      return {action: 'vote', target: good.length && rng() < 0.7 ? pick(good, rng) : rng() < 0.4 ? pick(accused, rng) : 'none'};
    }
    return {action: 'vote', target: rng() < 0.75 ? pick(accused, rng) : 'none'};
  }
  return null;
}

// ------------------------------------------------------------------ rulebook

const RULEBOOK = {
  en: [
    {title: 'The goal', items: ['Good (Students, Exchange Students, Professors) wins when every Demon King is expelled or slain. With no Demon King in the game, every Demon must go.', 'Evil wins when Demons and Demon Kings are at least half of the players still in the game.']},
    {title: 'A night', items: ['Everyone does homework: correct answers earn 1 Knowledge and 1 Grade; wrong answers lose 1 of each. The host can auto-remove anyone who skips homework several nights in a row (default 2).', 'Use skills and role actions on your phone. Everyone has those screens, so nobody can tell who acts.', 'Professors learn if a player is good or evil. Demons learn if a roommate is a Professor. Demon Kings may slay any living player (not on night 1; locks can block).']},
    {title: 'A day', items: ['Talk, move to another room, learn a skill (draw 2, keep 1), use day skills.', 'Then everyone marks one suspect (players with Grade 0 can’t be accused). The top accused defend (about 1 per 4 players — 3 for a table of 12; fewer if not enough people were named).', 'After the defense, everyone picks one accused to expel, or nobody. Most votes wins; a tie expels nobody.']},
    {title: 'Rooms and locks', items: ['Campus opens about 1 room per 3 players (2 at 6, 3 at 9, max 5). Who sleeps where is hidden by day.', 'At night your phone shows only your room and who is with you. “In your room” skills use that secret layout.', 'Demons only investigate other players in their own room. Demons know the Demon King; the King does not know the Demons.', 'Each player has one key per game. A locked room keeps out a Demon King who sleeps somewhere else.']},
    {title: 'Skills', items: [`Pay Knowledge (host sets 3, 6, or 8; default ${SPELL_COST}) to draw 2 skills (weighted B/A/S) and keep one — the card shows its rank. Hold at most ${MAX_SPELLS} (one passive). Some skills only appear for your role. Actives are 1 use; at most 2 night skills a night.`, 'Night skills can be set up by day or used at night; once set, they can’t change.', 'Exchange Students earn double Knowledge but look evil to Professors and skills.']},
    {title: 'Death and Jr', items: ['Dead players keep practicing math: correct answers still raise Grade and Knowledge.', 'Spend the host’s Knowledge cost to graduate: you return with a new face, your name gains another “Jr”, Knowledge resets to 0, and Grade stays.', 'Each graduation stacks another Jr (Edward → Edward Jr → Edward Jr Jr). The host can cap how many times this happens.']},
  ],
  zh: [
    {title: '目标', items: ['善良阵营（学生、交换生、教授）在所有魔王被开除或击倒时获胜。如果本局没有魔王，则需要所有魔出局。', '魔与魔王人数达到场上剩余玩家的一半或更多时，邪恶获胜。']},
    {title: '夜晚', items: ['所有人做作业：答对获得 1 点知识和 1 点成绩；答错各扣 1 点。房主可设定连续若干晚不做功课则自动移出（默认 2 晚）。', '在手机上使用技能和角色行动。每个人都有这些界面，所以没人知道谁在行动。', '教授得知一名玩家是善良还是邪恶。魔得知同房一人是否是教授。魔王可击倒任意存活玩家（首夜除外；上锁可挡）。']},
    {title: '白天', items: ['讨论、换到别的房间、学习技能（二选一）、使用白天技能。', '然后每人标出一名怀疑对象（成绩为 0 的不能被指控）。得票最高的若干人辩护（大约每 4 人 1 个席位——12 人时 3 席；若被点名的人不够则更少）。', '辩护结束后，每人从被告中选一人开除，或谁也不开除。得票最多者出局，平票则无人被开除。']},
    {title: '房间与锁', items: ['校园大约每 3 人开 1 间房（6 人 2 间、9 人 3 间，最多 5 间）。白天不公开谁睡在哪。', '夜里手机只显示你自己的房间和同房的人。“你房间里”的技能按这套隐藏布局结算。', '魔只能调查自己房间里的其他人。魔知道魔王是谁；魔王不知道谁是魔。', '每名玩家每局有一把钥匙。上锁的房间能挡住睡在别处的魔王。']},
    {title: '技能', items: [`花知识学习技能（房主可选 3、6 或 8，默认 ${SPELL_COST}）：按 B/A/S 权重抽出 2 个并留下 1 个（卡片显示稀有度）。最多持有 ${MAX_SPELLS} 个（被动最多 1 个）；部分技能仅本角色可抽。主动技均为 1 次；每晚最多排 2 个夜技。`, '夜晚技能可以在白天设定，也可以在夜里使用；设定后不能更改。', '交换生获得双倍知识，但在教授和技能眼中是邪恶的。']},
    {title: '出局与 Jr', items: ['出局后仍可练数学：答对继续加成绩和知识。', '花掉房主设定的知识即可毕业：换新头像、名字多一个 Jr、知识归零、成绩保留。', '每次毕业再叠一个 Jr（Edward → Edward Jr → Edward Jr Jr）。房主可限制每人毕业次数。']},
  ],
};

// ------------------------------------------------------------------ host

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Compact grade-card face reused by the host elimination fly clone. */
function GradeCardFace({p, name, score, lang}) {
  return (
    <>
      <div className={styles.gradeCardTop}>
        <span className={styles.gradeSeat}>{p ? p.seat : '?'}</span>
        <Avatar avatar={p && p.avatar} color={p && p.color} size="sm" />
        <span className={styles.gradeWho}>{name}</span>
      </div>
      <div className={styles.gradeScore} title={tu(lang, 'grade')}>
        <span className={styles.gradeScoreNum}>{score}</span>
        <small>{tu(lang, 'grade')}</small>
      </div>
    </>
  );
}

/**
 * Host spectacle: lift a grade card to center → red → disabled → return to slot.
 * Plays a queue of {id, kind:'expel'|'slain'} one at a time.
 */
function HostElimLayer({queue, g, state: s, lang, onDone}) {
  const [item, setItem] = useState(null);
  const [stage, setStage] = useState(null);
  const [box, setBox] = useState(null);
  const timers = useRef([]);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const measure = (id) => {
    const el = typeof document !== 'undefined' ? document.getElementById(`grade-${id}`) : null;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {left: r.left, top: r.top, width: r.width, height: r.height};
  };

  const finishOne = () => {
    clearTimers();
    setItem(null);
    setStage(null);
    setBox(null);
    const rest = queueRef.current.slice(1);
    onDone(rest);
  };

  useEffect(() => {
    if (!queue.length) {
      setItem(null);
      setStage(null);
      return undefined;
    }
    const next = queue[0];
    const start = measure(next.id) || {
      left: typeof window !== 'undefined' ? window.innerWidth / 2 - 120 : 200,
      top: typeof window !== 'undefined' ? window.innerHeight / 2 - 60 : 200,
      width: 240,
      height: 120,
    };
    setItem(next);
    setBox(start);
    clearTimers();
    if (prefersReducedMotion()) {
      setStage('mark');
      timers.current.push(setTimeout(() => setStage('disable'), 350));
      timers.current.push(setTimeout(finishOne, 900));
      return () => clearTimers();
    }
    setStage('lift');
    timers.current.push(setTimeout(() => setStage('mark'), 450));
    timers.current.push(setTimeout(() => setStage('disable'), 1100));
    timers.current.push(
      setTimeout(() => {
        const back = measure(next.id) || start;
        setBox(back);
        setStage('return');
      }, 1700),
    );
    timers.current.push(setTimeout(finishOne, 2300));
    return () => clearTimers();
  }, [queue]);

  if (!item || !box || !stage) return null;
  const p = g.players[item.id];
  const score = (s.grade && s.grade[item.id]) || 0;
  const centered = stage === 'lift' || stage === 'mark' || stage === 'disable';
  return (
    <div className={styles.elimLayer} aria-hidden="true">
      <div className={styles.elimScrim} data-on={centered || undefined} />
      <div
        className={styles.elimFly}
        data-stage={stage}
        data-kind={item.kind}
        style={{
          '--sx': `${box.left}px`,
          '--sy': `${box.top}px`,
          '--sw': `${box.width}px`,
          '--seat': p && p.color ? p.color : '#2e86de',
        }}>
        <div className={styles.gradeCard} data-fly="">
          <GradeCardFace p={p} name={p ? p.name : '?'} score={score} lang={lang} />
        </div>
      </div>
    </div>
  );
}

function UniversityHostView({g, state: s, lang, hostAct}) {
  const name = (id) => (g.players[id] ? g.players[id].name : '?');
  const slots = defenseSlots(alive(s).length);
  const accused = (s.accused && s.accused.length ? s.accused : null) || (s.suspectRanked || []).slice(0, slots);
  const accusedNames = accused.map((x) => `${name(x.id)} (${x.n})`).join(', ');
  const roster = [...s.seats].sort((a, b) => ((s.grade && s.grade[b]) || 0) - ((s.grade && s.grade[a]) || 0));
  const [elimQueue, setElimQueue] = useState([]);
  const [hwFloats, setHwFloats] = useState([]);
  const playedRef = useRef(new Set());
  const seenHwPops = useRef(new Set());
  const flyingId = elimQueue[0] ? elimQueue[0].id : null;

  useEffect(() => {
    let key = null;
    let next = [];
    if (s.phase === 'execution' && s.expelled) {
      key = `exec-${s.day}-${s.expelled}`;
      next = [{id: s.expelled, kind: 'expel'}];
    } else if (s.phase === 'dawn' && s.deaths && s.deaths.length) {
      key = `dawn-${s.night}-${s.deaths.join(',')}`;
      next = s.deaths.map((id) => ({id, kind: 'slain'}));
    }
    if (!key || playedRef.current.has(key)) return;
    playedRef.current.add(key);
    setElimQueue(next);
  }, [s.phase, s.day, s.night, s.expelled, s.deaths]);

  useEffect(() => {
    if (!s.showHwPop || !s.hwPops || !s.hwPops.length) return;
    const fresh = [];
    for (const pop of s.hwPops) {
      if (seenHwPops.current.has(pop.key)) continue;
      seenHwPops.current.add(pop.key);
      const p = g.players[pop.player];
      fresh.push({
        ...pop,
        avatar: p && p.avatar,
        color: p && p.color,
      });
    }
    if (fresh.length) setHwFloats((cur) => [...cur, ...fresh].slice(-36));
  }, [s.hwPops, s.showHwPop, g.players]);

  const clearHwPop = (key) => {
    setHwFloats((cur) => cur.filter((p) => p.key !== key));
  };

  const defendSlots = (
    <span className={styles.defendLine}>
      <span>{tu(lang, 'defenseSlots', {n: accused.length || slots})}</span>
      {accused.length > 0 && (
        <span className={styles.defendFaces}>
          {accused.map((x) => {
            const p = g.players[x.id];
            return (
              <span key={x.id} className={styles.defendFace} title={`${p ? p.seat : '?'}. ${name(x.id)} (${x.n})`}>
                <Avatar avatar={p && p.avatar} color={p && p.color} size="sm" />
                <small>{p ? p.seat : '?'}</small>
              </span>
            );
          })}
        </span>
      )}
    </span>
  );

  return (
    <div className={styles.host} data-night={s.phase === 'night' || undefined}>
      <HostElimLayer queue={elimQueue} g={g} state={s} lang={lang} onDone={setElimQueue} />
      <div className={styles.banner}>
        {s.phase === 'roles' && <b>{tu(lang, 'holdRole')}</b>}
        {s.phase === 'night' && (
          <>
            <b>{tu(lang, 'night', {n: s.night})}</b> {tu(lang, 'hostNight')}
          </>
        )}
        {s.phase === 'dawn' && (
          <>
            <b>{tu(lang, 'dawn')}</b>{' '}
            {(() => {
              const afk = s.idleKicks || [];
              const slain = (s.deaths || []).filter((id) => !afk.includes(id));
              if (!slain.length && !afk.length) return tu(lang, 'peaceful');
              const bits = [];
              if (slain.length) bits.push(`${tu(lang, 'slainTonight')} ${slain.map(name).join(', ')}`);
              if (afk.length) bits.push(`${tu(lang, 'idleKickedTonight')} ${afk.map(name).join(', ')}`);
              return bits.join(' · ');
            })()}
          </>
        )}
        {s.phase === 'day' && (
          <>
            <b>{tu(lang, 'day', {n: s.day})}</b>
            {defendSlots}
          </>
        )}
        {s.phase === 'suspect' && (
          <>
            <b>{tu(lang, 'day', {n: s.day})}</b>
            <span className={styles.voteLine}>{tu(lang, 'suspectOpen')}</span>
            {defendSlots}
            <button type="button" className="button button--sm button--secondary" onClick={() => hostAct({action: 'endDay'})}>
              {tu(lang, 'closeSuspect')}
            </button>
          </>
        )}
        {s.phase === 'suspectReveal' && (
          <>
            <b>{tu(lang, 'day', {n: s.day})}</b>
            <span className={styles.voteLine}>{tu(lang, 'revealing')}</span>
            {defendSlots}
          </>
        )}
        {s.phase === 'defense' && (
          <>
            <b>{tu(lang, 'day', {n: s.day})}</b>
            <span className={styles.voteLine}>{tu(lang, 'defense')}</span>
            {defendSlots}
            {accusedNames && <span className={shell.muted}>{tu(lang, 'accusedList', {names: accusedNames})}</span>}
          </>
        )}
        {s.phase === 'vote' && (
          <>
            <b>{tu(lang, 'day', {n: s.day})}</b>
            <span className={styles.voteLine}>{tu(lang, s.ballot && s.ballot.runoff ? 'voteRunoffQ' : 'voteQ')}</span>
            {defendSlots}
            {accusedNames && <span className={shell.muted}>{tu(lang, 'accusedList', {names: accusedNames})}</span>}
          </>
        )}
        {s.phase === 'voteReveal' && (
          <>
            <b>{tu(lang, 'day', {n: s.day})}</b>
            <span className={styles.voteLine}>{tu(lang, 'revealing')}</span>
            {defendSlots}
            {s.block && <span>{tu(lang, 'onBlock', {name: name(s.block.id), n: s.block.yes})}</span>}
            {!s.block && s.voteReveal && s.voteReveal.tied && <span>{tu(lang, 'tieReveal')}</span>}
            {!s.block && !(s.voteReveal && s.voteReveal.tied) && <span>{tu(lang, 'noExpel')}</span>}
          </>
        )}
        {s.phase === 'execution' && <b>{s.expelled ? tu(lang, 'expelled', {name: name(s.expelled)}) : tu(lang, 'noExpel')}</b>}
        {s.over && (
          <b>
            {tu(lang, s.winner === 'good' ? 'goodWin' : 'evilWin')} <span className={shell.muted}>{tu(lang, `why_${s.winWhy}`)}</span>
          </b>
        )}
      </div>
      <div className={styles.campus}>
        <div className={styles.campusArt} data-night={s.phase === 'night' || undefined} aria-hidden="true">
          <Sprite
            path={s.phase === 'night' ? 'university-night.webp' : 'university-light.webp'}
            emoji="🏫"
            label=""
            tint={s.phase === 'night' ? '#1d2350' : '#fbf3df'}
            shape="card"
            size="100%"
            className={styles.campusSprite}
          />
        </div>
        <div className={styles.map}>
          {activeRooms(s)
            .filter((r) => ROOMS[r])
            .map((r) => {
              const here = s.seats.filter((p) => s.room[p] === r);
              const living = here.filter((p) => !s.dead[p]).length;
              const dayOpen = !['night', 'roles', 'dawn'].includes(s.phase);
              const revealRooms = s.over || (Boolean(s.showRooms) && dayOpen);
              const occupants = here.map((p) => ({
                id: p,
                seat: g.players[p] ? g.players[p].seat : 0,
                name: name(p),
                avatar: g.players[p] && g.players[p].avatar,
                color: g.players[p] && g.players[p].color,
                dead: Boolean(s.dead[p]),
                role: s.over ? s.role[p] : undefined,
              }));
              return (
                <RoomCard
                  key={r}
                  roomId={r}
                  lang={lang}
                  locked={Boolean(s.locks[r]) && s.phase === 'night'}
                  secret={!revealRooms}
                  count={revealRooms || occupants.length ? null : living}
                  people={occupants}
                  pops={hwFloats.filter((f) => f.room === r)}
                  onPopDone={clearHwPop}
                />
              );
            })}
        </div>
      </div>
      {s.phase !== 'night' && s.phase !== 'roles' && (
        <div className={styles.gradeBoard}>
          <div className={styles.gradeHead}>
            <b>{tu(lang, 'grades')}</b>
            {s.reviveAt > 0 && (
              <span className={styles.gradeMeta}>
                {tu(lang, 'reviveAt')}: {s.reviveAt}
                {' · '}
                {tu(lang, 'reviveMax')}:{' '}
                {reviveLimitOf(s) === 0 ? tu(lang, 'reviveMaxInf') : reviveLimitOf(s)}
              </span>
            )}
            <span className={styles.gradeMeta}>
              {tu(lang, 'demonKillAt')}: {s.demonKillAt ?? 10}
            </span>
            <span className={styles.gradeMeta}>
              {tu(lang, 'spellCost')}: {s.spellCost || SPELL_COST}
            </span>
            {(s.idleKickNights || 0) > 0 && (
              <span className={styles.gradeMeta}>
                {tu(lang, 'idleKickNights')}: {s.idleKickNights}
              </span>
            )}
          </div>
          <div className={styles.gradeGrid}>
            {roster.map((id, rank) => {
              const p = g.players[id];
              const score = (s.grade && s.grade[id]) || 0;
              const voting = s.phase === 'suspect' || s.phase === 'vote';
              const revealing = s.phase === 'suspectReveal' || s.phase === 'voteReveal';
              const gradeZeroSkip = !s.dead[id] && score <= 0;
              const hasVoted =
                gradeZeroSkip ||
                (s.phase === 'suspect' && s.suspect && s.suspect[id] != null) ||
                (s.phase === 'vote' && s.ballot && s.ballot.picks[id] != null);
              const target = s.suspect && s.suspect[id];
              const targetP = target && g.players[target];
              const voters =
                s.phase === 'voteReveal' && s.voteReveal && s.voteReveal.voters
                  ? s.voteReveal.voters[id] || []
                  : s.suspect
                    ? Object.entries(s.suspect)
                        .filter(([, t]) => t === id)
                        .map(([voter]) => voter)
                    : [];
              const voteScore =
                s.phase === 'voteReveal' && s.voteReveal && s.voteReveal.scores ? s.voteReveal.scores[id] || 0 : voters.length;
              const showVotes = revealing || ['defense', 'execution', 'over'].includes(s.phase);
              return (
                <div
                  key={id}
                  id={`grade-${id}`}
                  className={styles.gradeCard}
                  data-dead={Boolean(s.dead[id]) || undefined}
                  data-slain={s.deaths && s.deaths.includes(id) ? '' : undefined}
                  data-reveal={revealing || undefined}
                  data-flying={flyingId === id ? '' : undefined}
                  style={{'--seat': p && p.color ? p.color : '#2e86de', '--i': rank}}>
                  <div className={styles.gradeCardTop}>
                    <span className={styles.gradeSeat}>{p ? p.seat : '?'}</span>
                    <Avatar avatar={p && p.avatar} color={p && p.color} size="sm" />
                    <span className={styles.gradeWho}>{name(id)}</span>
                    {voting && (
                      <span className={styles.iVotedPill} data-on={hasVoted || undefined}>
                        {hasVoted ? tu(lang, 'iVoted') : tu(lang, 'waitingVote')}
                      </span>
                    )}
                  </div>
                  <div className={styles.gradeScore} title={tu(lang, 'grade')}>
                    <span className={styles.gradeScoreNum}>{score}</span>
                    <small>{tu(lang, 'grade')}</small>
                  </div>
                  <div className={styles.gradeFoot}>
                    {voting ? null : showVotes ? (
                      <>
                        {s.phase !== 'voteReveal' && (
                          <span className={styles.gradeChip} data-empty={!targetP || undefined}>
                            {tu(lang, 'suspectCol')}: {targetP ? `${targetP.seat}. ${name(target)}` : tu(lang, 'suspectNone')}
                          </span>
                        )}
                        {voteScore >= 6 ? (
                          <span className={`${styles.gradeVotes} ${styles.votePop}`} data-hot="">
                            {voteScore} {tu(lang, 'votesCol')}
                          </span>
                        ) : voteScore > 0 ? (
                          <span className={styles.gradeFaces} title={`${voteScore} ${tu(lang, 'votesCol')}`}>
                            {voters.map((vid, i) => {
                              const v = g.players[vid];
                              return (
                                <span
                                  key={vid}
                                  className={`${styles.gradeFace} ${styles.votePop}`}
                                  style={{'--i': i}}
                                  title={v ? `${v.seat}. ${name(vid)}` : '?'}>
                                  <Avatar avatar={v && v.avatar} color={v && v.color} size="xs" />
                                </span>
                              );
                            })}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ module

const university = {
  id: 'university',
  logo: 'university.webp',
  title: {en: 'Clocktower University', zh: '钟楼大学'},
  blurb: {
    en: 'Conquer the darkness through math. Complete assignments, unlock secret abilities, and survive the night.',
    zh: '通过数学解开黑暗的谜题。完成作业，解锁秘密能力，度过夜晚。',
  },
  howTo: {
    en: [
      'Tap your name tile to see your role. Demons see the Demon King (the King does not see Demons). Good must expel the Demon Kings.',
      'Night: everyone does math homework. Correct answers earn Knowledge and Grade; wrong answers lose 1 of each. Use skills and role actions in secret.',
      'Day: move, learn skills, talk. Then mark a suspect; the top accused defend and the class picks one to expel.',
      'About 1 defense seat per 4 living players (3 for a table of 12). A tie on the final ballot expels nobody.',
      'Dead players keep earning Knowledge. Spend the set cost to graduate as Jr (new face, Knowledge resets, Grade stays).',
    ],
    zh: [
      '点名字条查看你的角色。魔会看到魔王（魔王看不到魔）。善良阵营要开除魔王。',
      '夜晚：所有人做数学作业。答对获得知识和成绩，答错各扣 1 点。秘密使用技能和角色行动。',
      '白天：移动、学习技能、讨论；然后标出怀疑对象，最高票者辩护，全班再选出一人开除。',
      '大约每 4 名存活玩家 1 个辩护席位（12 人时 3 席）。最终投票平票则无人被开除。',
      '出局后仍可攒知识；花够设定费用就毕业变成 Jr（换头像、知识归零、成绩保留）。',
    ],
  },
  rulebook(lang) {
    return RULEBOOK[lang] || RULEBOOK.en;
  },
  reference(lang) {
    const roles = Object.entries(ROLES).map(([k, r]) => ({group: L({en: 'Roles', zh: '角色'}, lang), emoji: <RoleToken role={k} lang={lang} size={26} />, tint: SIDE_TINT[r.side], title: L(r, lang), tag: L({en: r.side === 'good' ? 'Good' : 'Evil', zh: r.side === 'good' ? '善良' : '邪恶'}, lang), text: r.ab, more: r.tip, key: k}));
    const skills = Object.entries(SPELLS).map(([k, sp]) => ({group: L({en: 'Starter skills', zh: '初始技能'}, lang), emoji: <SpellIcon k={k} lang={lang} size={30} />, tint: '#ffe566', title: `${L(sp, lang)} · ${tu(lang, 'cost', {n: '3/6/8'})}`, tag: sp.type, text: sp.ab}));
    return [...roles, ...skills];
  },
  inspiredBy: 'Blood on the Clocktower (The Pandemonium Institute)',
  players: {min: 5, max: 64},
  minutes: 40,
  coverTint: '#2e5a3a',
  themeClass: shell.themeUni,
  night: (x) => x.phase === 'night',
  defaultSettings: {
    dayMinutes: 4,
    nightSeconds: 60,
    reviveAt: 100,
    reviveMax: 2,
    demonKillAt: 10,
    showRooms: false,
    showHwPop: true,
    spellCost: 6,
    idleKickNights: 2,
    pools: ['basic'],
  },
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupUniversity(seats, g.settings, ctx);
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'ready':
        return markReady(s, ctx, id);
      case 'hw':
        return homework(s, ctx, id, msg.total, msg.wrong);
      case 'act':
        return roleAct(s, ctx, id, msg.target);
      case 'draw':
        return drawSpell(s, ctx, id);
      case 'pick':
      case 'buy':
        return pickSpell(s, ctx, id, msg.spell);
      case 'cast':
        return cast(s, ctx, id, msg.spell, msg.target);
      case 'move':
        return moveTo(s, ctx, id, msg.room);
      case 'lock':
        return setLock(s, ctx, id, msg.on);
      case 'suspect':
        return suspectVote(s, ctx, id, msg.target);
      case 'vote':
        return castVote(s, ctx, id, msg.target != null ? msg.target : msg.yes === false ? 'none' : msg.yes);
      case 'revive':
        return revive(s, ctx, id, g);
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
    if (s.phase === 'vote' && s.ballot && (s.ballot.picks[id] != null || (!s.dead[id] && !canAccuse(s, id)))) kind = 'voted';
    if (s.phase === 'suspect' && ((s.suspect && s.suspect[id] != null) || (!s.dead[id] && !canAccuse(s, id)))) kind = 'suspectDone';
    const dayish = ['day', 'suspect', 'suspectReveal', 'defense', 'vote', 'voteReveal', 'dawn'].includes(s.phase);
    const cult = cultOf(s, id);
    const v = {
      task: `${kind}-${s.night}-${s.day}`,
      kind,
      phase: s.phase,
      urgent:
        ['roles', 'suspect', 'vote'].includes(kind) ||
        (s.phase === 'night' && roleTargets(s, id).length > 0 && !s.roleTarget[id]) ||
        Boolean(s.cultHeirOf && s.cultHeirOf[id] === s.night && s.role[id] === 'demon'),
      role: s.role[id],
      night: s.night,
      day: s.day,
      becameCultist: Boolean(s.cultHeirOf && s.cultHeirOf[id] === s.night && s.role[id] === 'demon'),
      dead: Boolean(s.dead[id]),
      ghost: s.dead[id] ? !s.ghost[id] : null,
      me: id,
      players: s.seats.map(player),
      cult: cult && cult.map((p) => ({...player(p), role: s.role[p]})),
      knowledge: s.knowledge[id],
      grade: (s.grade && s.grade[id]) || 0,
      reviveAt: s.reviveAt || 0,
      revivesLeft: revivesLeft(s, id),
      reviveMax: reviveLimitOf(s),
      reviveUnlimited: reviveLimitOf(s) === 0,
      spellCost: s.spellCost || SPELL_COST,
      canRevive: Boolean(
        s.dead[id] &&
          (s.reviveAt || 0) > 0 &&
          revivesLeft(s, id) > 0 &&
          !(s.afkOut && s.afkOut[id]) &&
          ((s.knowledge && s.knowledge[id]) || 0) >= (s.reviveAt || 0),
      ),
      learned: (s.learned || {})[id] || 0,
      canLearn: canLearn(s, id),
      offer: (s.offer && s.offer[id]) || null,
      hw: s.hw[id] || 0,
      hwWrong: (s.hwWrong && s.hwWrong[id]) || 0,
      practice: (s.practice && s.practice[id]) || 0,
      practiceWrong: (s.practiceWrong && s.practiceWrong[id]) || 0,
      pools: s.pools,
      spells: s.spells[id].map((h) => ({k: h.k, left: h.left, free: Math.min(99, freeUses(s, id, h.k)), targets: SPELLS[h.k].type !== 'passive' ? spellTargets(s, id, h.k) : []})),
      queued: s.queued[id],
      castsLeft: Math.max(0, MAX_NIGHT_CASTS - s.queued[id].length),
      roleTargets: s.phase === 'night' ? roleTargets(s, id) : [],
      roleTarget: s.roleTarget[id] || null,
      room: s.room[id],
      rooms: activeRooms(s).map((r) => ({id: r})),
      key: s.key[id],
      lockTonight: Boolean(s.lockTonight[id]),
      canShop: dayish && !s.dead[id],
      info: (s.info[id] || []).slice(-12),
      winner: s.winner,
      winWhy: s.winWhy,
      defenseSlots: defenseSlots(alive(s).length),
      accused: (s.accused || []).map((x) => ({...player(x.id), votes: x.n})),
    };
    // Night fog: only your room and living roommates (including you).
    if (s.phase === 'night' && !s.dead[id] && s.room[id]) {
      v.sleepRoom = s.room[id];
      v.roommates = alive(s)
        .filter((p) => s.room[p] === s.room[id])
        .map(player);
    }
    // Demon kill (large) / Professor investigate: room card for own bedroom.
    if (s.phase === 'night' && !s.dead[id] && (s.role[id] === 'demon' || s.role[id] === 'professor') && s.room[id]) {
      if (s.role[id] === 'demon') {
        v.demonKill = demonCanKill(s);
        v.demonVote = !v.demonKill;
      }
      if (s.role[id] === 'professor' || v.demonKill) {
        const reach = new Set(roleTargets(s, id));
        const r = s.room[id];
        v.cultRoomCards = [
          {
            id: r,
            people: alive(s)
              .filter((p) => s.room[p] === r)
              .map((p) => ({...player(p), pickable: reach.has(p)})),
          },
        ];
      }
    }
    if (s.role[id] === 'professor' && s.roleTarget[id]) {
      const hit = [...(s.info[id] || [])].reverse().find((x) => x.key === 'prof' && x.player === s.roleTarget[id] && x.night === s.night);
      if (hit) v.profResult = {player: s.roleTarget[id], evil: hit.evil};
    }
    // Demon King sees live Demon kill votes on small tables.
    if (s.phase === 'night' && !s.dead[id] && s.role[id] === 'demonking' && !demonCanKill(s)) {
      v.cultVotes = alive(s)
        .filter((p) => s.role[p] === 'demon' && s.roleTarget[p])
        .map((p) => ({
          ...player(p),
          target: player(s.roleTarget[p]),
        }));
    }
    v.mustPickFirst = mustPickRoleFirst(s, id);
    if (s.phase === 'suspect' || s.phase === 'suspectReveal') {
      v.suspectTargets = accuseTargets(s, id).map(player);
      v.mySuspect = s.suspect[id] && s.suspect[id] !== 'none' ? s.suspect[id] : null;
      v.noSuspectTargets = accuseTargets(s, id).length === 0;
      v.suspectSkippedGrade = !s.dead[id] && !canAccuse(s, id);
    }
    if (s.ballot) {
      v.canYes = canVoteYes(s, id);
      v.hushed = Boolean(s.hush[id]);
      v.loudUsed = Boolean(s.ballot.loud[id]);
      v.myPick = s.ballot.picks[id] || null;
      v.ballotAccused = s.ballot.accused.filter((p) => canAccuse(s, p)).map(player);
      v.voteRunoff = Boolean(s.ballot.runoff);
    }
    if (s.phase === 'voteReveal' && s.voteReveal) {
      v.voteTied = Boolean(s.voteReveal.tied && s.voteReveal.tied.length >= 2);
    }
    if (s.over) {
      v.roles = s.seats.map((p) => ({...player(p), role: s.role[p]}));
      v.gradeLog = s.gradeLog || [];
    }
    return v;
  },

  bot: botMove,

  SettingsView({settings, set, lang, playerCount: n = 0}) {
    const label = (key, hintKey) => (
      <span>
        {tu(lang, key)} {hintKey ? <SettingHelp text={tu(lang, hintKey)} /> : null}
      </span>
    );
    const radio = (key, value, text) => (
      <button key={String(value)} type="button" role="radio" aria-checked={settings[key] === value} className="button button--sm button--secondary" onClick={() => set({[key]: value})}>
        {text}
      </button>
    );
    const c = n >= 5 ? counts(n) : null;
    return (
      <>
        <div className={shell.buttonRow}>
          {label('dayMinutes')}
          {[2, 4, 6].map((m) => radio('dayMinutes', m, tu(lang, 'min', {n: m})))}
        </div>
        <div className={shell.buttonRow}>
          {label('nightSeconds')}
          {[45, 60, 90].map((m) => radio('nightSeconds', m, tu(lang, 'sec', {n: m})))}
        </div>
        <div className={shell.buttonRow}>
          {label('reviveAt')}
          {[0, 20, 25, 30, 50, 100, 150].map((m) => radio('reviveAt', m, m === 0 ? tu(lang, 'reviveNone') : String(m)))}
        </div>
        <div className={shell.buttonRow}>
          {label('reviveMax', 'reviveMaxHint')}
          {[1, 2, 0].map((m) => radio('reviveMax', m, m === 0 ? tu(lang, 'reviveMaxInf') : String(m)))}
        </div>
        <div className={shell.buttonRow}>
          {label('demonKillAt', 'demonKillAtHint')}
          {[8, 10, 12, 15, 20].map((m) => radio('demonKillAt', m, String(m)))}
        </div>
        <div className={shell.buttonRow}>
          {label('showRooms', 'showRoomsHint')}
          {radio('showRooms', true, tu(lang, 'showRoomsOn'))}
          {radio('showRooms', false, tu(lang, 'showRoomsOff'))}
        </div>
        <div className={shell.buttonRow}>
          {label('showHwPop', 'showHwPopHint')}
          {radio('showHwPop', true, tu(lang, 'showHwPopOn'))}
          {radio('showHwPop', false, tu(lang, 'showHwPopOff'))}
        </div>
        <div className={shell.buttonRow}>
          {label('spellCost', 'spellCostHint')}
          {[3, 6, 8].map((m) => radio('spellCost', m, String(m)))}
        </div>
        <div className={shell.buttonRow}>
          {label('idleKickNights', 'idleKickHint')}
          {[0, 1, 2, 3].map((m) => radio('idleKickNights', m, m === 0 ? tu(lang, 'idleKickOff') : String(m)))}
        </div>
        <div className={shell.buttonRow}>
          {label('tables')}
          <PoolPicker value={settings.pools} onChange={(pools) => set({pools})} lang={lang} />
        </div>
        {c && <p className={shell.muted}>{tu(lang, 'setupLine', {n, ...c})}</p>}
      </>
    );
  },

  HostView: UniversityHostView,

  PhoneView({view, lang, send}) {
    // Fresh state each night and each day, but not on every suspect or vote.
    return <UniPhone key={`${view.kind === 'night' ? 'night' : 'day'}-${view.night}`} view={view} lang={lang} send={send} />;
  },

  /** Role peek lives on the shared name tile so the phone doesn’t need a second card. */
  YouBar({env, view, lang, msLeft}) {
    return <UniYouBar env={env} view={view} lang={lang} msLeft={msLeft} />;
  },
};

// ------------------------------------------------------------------ phone

function InfoLine({x, view, lang}) {
  const nm = (id) => {
    const p = view.players.find((q) => q.id === id);
    return p ? `${p.name} (#${p.seat})` : '?';
  };
  const list = (x.lines || [])
    .map((row) => (row.evil == null ? nm(row.player) : `${nm(row.player)} → ${tu(lang, row.evil ? 'evil' : 'good')}`))
    .join('; ');
  return (
    <>
      {tu(lang, `info_${x.key}`, {
        name: nm(x.player),
        nameA: nm(x.a),
        nameB: nm(x.b),
        align: tu(lang, x.evil ? 'evil' : 'good'),
        isProf: tu(lang, x.yes ? 'isProf' : 'notProf'),
        answer: tu(lang, x.yes ? 'did' : 'didNot'),
        demonPair: tu(lang, x.yes ? 'demonPairYes' : 'demonPairNo'),
        n: x.n,
        room: x.room ? roomName(x.room, lang) : '',
        list: list || '—',
      })}
    </>
  );
}

/** Math homework (the pools picked in settings), checked on the phone; the running total goes to the big screen every few answers. */
function Homework({view, lang, send}) {
  const base = view.dead ? (view.practice || 0) : (view.hw || 0);
  const baseWrong = view.dead ? (view.practiceWrong || 0) : (view.hwWrong || 0);
  const next = () => makeQuestion(view.pools, Math.random);
  const [q, setQ] = useState(next);
  const [total, setTotal] = useState(base);
  const [wrong, setWrong] = useState(baseWrong);
  const [flash, setFlash] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const sent = useRef({ok: base, bad: baseWrong});
  const latest = useRef({ok: total, bad: wrong});
  latest.current = {ok: total, bad: wrong};
  const flush = (ok, bad) => {
    sent.current = {ok, bad};
    send({action: 'hw', total: ok, wrong: bad});
  };
  // Keep phone totals in sync when you die mid-session or practice carries across nights.
  useEffect(() => {
    setTotal((t) => Math.max(t, base));
    setWrong((w) => Math.max(w, baseWrong));
    sent.current = {
      ok: Math.max(sent.current.ok, base),
      bad: Math.max(sent.current.bad, baseWrong),
    };
  }, [base, baseWrong, view.dead]);
  useEffect(() => () => {
    const {ok, bad} = latest.current;
    if (ok > sent.current.ok || bad > sent.current.bad) flush(ok, bad);
  }, []);
  const submit = (typed) => {
    const right = checkAnswer(q, typed);
    setFlash(right ? 'right' : 'wrong');
    if (right) {
      setFeedback(null);
      const t = total + 1;
      setTotal(t);
      if (t - sent.current.ok + (wrong - sent.current.bad) >= 3) flush(t, wrong);
    } else {
      setFeedback({got: String(typed).replace(/-/g, '−'), answer: String(q.a || '').replace(/-/g, '−')});
      const w = wrong + 1;
      setWrong(w);
      flush(total, w);
    }
    setQ(next());
  };
  const pendingOk = Math.max(0, total - base);
  const pendingBad = Math.max(0, wrong - baseWrong);
  const knowledgeNow = view.dead
    ? view.knowledge
    : Math.max(0, view.knowledge + pendingOk * (view.role === 'exchange' ? 2 : 1) - pendingBad);
  const gradeNow = Math.max(0, (view.grade || 0) + pendingOk - pendingBad);
  return (
    <div className={styles.homework}>
      <p className={styles.hwHead}>
        {tu(lang, 'homework')} · {tu(lang, 'correct', {n: total})} · {tu(lang, 'grade')} {gradeNow}
        {!view.dead && <> · {tu(lang, 'knowledge')} {knowledgeNow}</>}
      </p>
      <MathPad question={q} lang={lang} onAnswer={submit} flash={flash} okLabel={tu(lang, 'ok')} />
      {feedback && (
        <p className={styles.hwWrong} role="status">
          {tu(lang, 'wrongReveal', {got: feedback.got, answer: feedback.answer})}
        </p>
      )}
      {view.dead && <p className={shell.muted}>{tu(lang, 'practiceHelp')}</p>}
    </div>
  );
}

function PlayerPick({ids, view, onPick, lang, selected = null}) {
  return (
    <div className={shell.choiceGrid}>
      {ids.map((pid) => {
        const p = view.players.find((x) => x.id === pid);
        const on = selected === pid;
        return (
          <button
            key={pid}
            type="button"
            className={`button button--sm ${on ? styles.pickOn : ''}`}
            aria-pressed={on}
            onClick={() => onPick(pid)}>
            <Avatar avatar={p && p.avatar} color={p && p.color} size="xs" /> {p ? `${p.seat}. ${p.name}` : '?'}
          </button>
        );
      })}
    </div>
  );
}

/** Skills board: portrait cards; tap opens desc + Use when available. */
function SpellList({view, lang, send, night, showLearn = false}) {
  const [open, setOpen] = useState(null);
  const [aim, setAim] = useState(null);
  const nm = (id) => {
    const p = view.players.find((x) => x.id === id);
    return p ? p.name : ROOMS[id] ? roomName(id, lang) : '?';
  };
  const handFull = (view.spells || []).length >= MAX_SPELLS;
  const spellCost = view.spellCost || SPELL_COST;
  const learnDisabled = !view.canLearn || view.knowledge < spellCost || Boolean(view.offer);
  const learnTitle = handFull
    ? tu(lang, 'learnedHandFull', {max: MAX_SPELLS})
    : !view.canLearn
      ? tu(lang, 'learnedAllPool')
      : view.knowledge < spellCost
        ? tu(lang, 'needKnowledge', {n: spellCost})
        : tu(lang, 'drawCost', {n: spellCost});
  const queuedFor = (k) => (view.queued || []).find((q) => q.k === k);
  const usable = (h) => {
    const sp = SPELLS[h.k];
    if (sp.type === 'passive' || view.dead || h.free < 1) return false;
    if (queuedFor(h.k)) return false;
    if (sp.type === 'night') return view.castsLeft > 0 && (night || view.canShop);
    return !night && view.canShop && (h.k !== 'loud' || (view.kind === 'vote' && !view.loudUsed));
  };
  const go = (h, target) => {
    send({action: 'cast', spell: h.k, target});
    setAim(null);
    setOpen(null);
  };
  const onUse = (h) => {
    if (!usable(h)) return;
    const sp = SPELLS[h.k];
    if (['player', 'roomPlayer', 'move'].includes(sp.range)) setAim(h);
    else go(h);
  };
  const opened = open ? (view.spells || []).find((h) => h.k === open) : null;
  const openSp = opened ? SPELLS[opened.k] : null;
  const openCan = opened ? usable(opened) : false;
  const openQ = opened ? queuedFor(opened.k) : null;
  const openHint = opened
    ? openQ
      ? `${tu(lang, 'queuedOn')}${openQ.target ? ` → ${nm(openQ.target)}` : ''}`
      : openSp.type === 'passive'
        ? tu(lang, 'passiveOn')
        : opened.left === 0
          ? tu(lang, 'usesAll')
          : tu(lang, 'usesLeft', {n: opened.free})
    : '';
  const useLabel = openSp && openSp.type === 'night' ? tu(lang, 'setTonight') : tu(lang, 'castNow');
  return (
    <>
      <div className={styles.skillGrid}>
        {view.spells.map((h) => {
          const sp = SPELLS[h.k];
          const can = usable(h);
          const q = queuedFor(h.k);
          const selected = open === h.k;
          const tag = sp.type === 'passive' ? tu(lang, 'tagPassive') : q ? tu(lang, 'tagSet') : null;
          const rarity = sp.rarity || 'B';
          return (
            <button
              key={h.k}
              type="button"
              className={styles.skillTile}
              data-active={can || undefined}
              data-queued={q ? 'true' : undefined}
              data-passive={sp.type === 'passive' || undefined}
              data-open={selected || undefined}
              aria-pressed={selected}
              aria-label={tag ? `${L(sp, lang)}. ${tag}` : L(sp, lang)}
              onClick={() => setOpen((cur) => (cur === h.k ? null : h.k))}>
              <span className={styles.rarityTag} data-rarity={rarity}>
                {tu(lang, `rarity${rarity}`)}
              </span>
              {tag && <span className={styles.skillTag}>{tag}</span>}
              <span className={styles.skillArt}>
                <SpellIcon k={h.k} lang={lang} size="100%" />
              </span>
              <b className={styles.skillName}>{L(sp, lang)}</b>
            </button>
          );
        })}
        {showLearn && !handFull && (
          <button
            type="button"
            className={styles.skillAdd}
            disabled={learnDisabled}
            onClick={() => send({action: 'draw'})}
            title={learnTitle}
            aria-label={tu(lang, 'learnAdd')}>
            <span aria-hidden="true">+</span>
            <small>{spellCost}</small>
          </button>
        )}
      </div>
      {opened && openSp && (
        <div className={styles.skillDetail}>
          <p className={styles.skillDesc}>{L(openSp.ab, lang)}</p>
          <div className={styles.skillMeta}>
            <small>{openHint}</small>
          </div>
          {openCan && (
            <button type="button" className={`button button--sm ${styles.skillUse}`} onClick={() => onUse(opened)}>
              {useLabel}
            </button>
          )}
        </div>
      )}
      {handFull && showLearn && <p className={shell.muted}>{tu(lang, 'handFull', {max: MAX_SPELLS})}</p>}
      {!view.spells.length && !showLearn && <p className={shell.muted}>{tu(lang, 'noSpells')}</p>}
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
      {view.castsLeft === 0 && night && <p className={shell.muted}>{tu(lang, 'maxCasts', {n: MAX_NIGHT_CASTS})}</p>}
    </>
  );
}

/** Name tile + tap-to-reveal role; Knowledge / Grade sit under the bar. */
function UniYouBar({env, view, lang, msLeft}) {
  const [show, setShow] = useState(false);
  const r = ROLES[view.role];
  const evil = r.side === 'evil';
  const cult = view.cult;
  return (
    <div className={styles.youBlock}>
      {view.becameCultist && (
        <div className={shell.notice} role="status" style={{borderColor: SIDE_TINT.evil, color: SIDE_TINT.evil, fontWeight: 700}}>
          <div>{tu(lang, 'becameCultist')}</div>
          <small style={{fontWeight: 500}}>{tu(lang, 'becameCultistHint')}</small>
        </div>
      )}
      <button
        type="button"
        className={`${shell.youBar} ${styles.youRole}`}
        style={{borderLeftColor: show ? SIDE_TINT[r.side] : env.you?.color}}
        data-revealed={show || undefined}
        aria-pressed={show}
        aria-label={tu(lang, 'holdRole')}
        onClick={() => setShow((v) => !v)}
        onContextMenu={(e) => e.preventDefault()}>
        {show ? (
          <>
            <RoleToken role={view.role} lang={lang} size={40} />
            <span className={styles.youRoleText}>
              {view.becameCultist && (
                <b style={{'--side': SIDE_TINT.evil, color: SIDE_TINT.evil}}>{tu(lang, 'becameCultist')}</b>
              )}
              <b style={{'--side': SIDE_TINT[r.side]}}>{L(r, lang)} · {r.side === 'good' ? tu(lang, 'good') : tu(lang, 'evil')}</b>
              <small>{L(r.ab, lang)}</small>
              {evil && view.role === 'demonking' && (
                <span className={styles.cultList}>
                  <small>{tu(lang, 'kingBlind')}</small>
                </span>
              )}
              {evil && view.role === 'demon' && (
                <span className={styles.cultList}>
                  <b>{tu(lang, 'yourCult')}</b>
                  {!cult || cult.length === 0 ? (
                    <small>{tu(lang, 'cultAlone')}</small>
                  ) : (
                    cult.map((p) => (
                      <small key={p.id}>
                        {tu(lang, 'cultMate', {seat: p.seat, name: p.name, role: L(ROLES[p.role] || ROLES.demonking, lang)})}
                      </small>
                    ))
                  )}
                </span>
              )}
            </span>
            {msLeft > 0 && (
              <span className={shell.youTimer}>
                <Countdown msLeft={msLeft} lang={lang} />
              </span>
            )}
          </>
        ) : (
          <>
            <Avatar avatar={env.you?.avatar} color={env.you?.color} size="md" />
            <span>{env.you?.name}</span>
            {env.you?.seat > 0 && <span className={shell.seatBadge}>{st(lang, 'seat', {n: env.you.seat})}</span>}
            {msLeft > 0 && (
              <span className={shell.youTimer}>
                <Countdown msLeft={msLeft} lang={lang} />
              </span>
            )}
          </>
        )}
      </button>
      <p className={styles.youStats}>
        {tu(lang, 'knowledge')} <b>{view.knowledge || 0}</b>
        <span aria-hidden="true"> · </span>
        {tu(lang, 'grade')} <b>{view.grade || 0}</b>
      </p>
    </div>
  );
}

function LearnModal({view, lang, send}) {
  if (!view.offer) return null;
  return (
    <div className={styles.modalScrim} role="dialog" aria-modal="true" aria-label={tu(lang, 'pickOne')}>
      <div className={styles.modalCard}>
        <p className={styles.drawHint}>{tu(lang, 'pickOne')}</p>
        <div className={styles.offerGrid}>
          {view.offer.map((k) => {
            const sp = SPELLS[k];
            return (
              <button key={k} type="button" className={styles.offerSpell} onClick={() => send({action: 'pick', spell: k})}>
                <span className={styles.rarityTag} data-rarity={sp.rarity || 'B'}>
                  {tu(lang, `rarity${sp.rarity || 'B'}`)}
                </span>
                <span className={styles.offerArt}>
                  <SpellIcon k={k} lang={lang} size="100%" />
                </span>
                <b>{L(sp, lang)}</b>
                <small>{L(sp.ab, lang)}</small>
                <em className={styles.offerType}>{sp.type}</em>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function dawnNewsKey(view) {
  return `uni-dawn-news:${view.me}:n${view.night}`;
}

function DawnSecrets({view, lang}) {
  const storageKey = dawnNewsKey(view);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });
  const [show, setShow] = useState(false);
  const seen = useRef(false);
  const latest = (view.info || []).filter((x) => !x.night || x.night === view.night);
  if (dismissed || !latest.length) return null;
  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  };
  const release = () => {
    if (seen.current) dismiss();
    else setShow(false);
  };
  const hold = {
    onPointerDown: () => {
      seen.current = true;
      setShow(true);
    },
    onPointerUp: release,
    onPointerLeave: release,
    onPointerCancel: release,
    onContextMenu: (e) => e.preventDefault(),
  };
  return (
    <div className={`${shell.card} ${styles.newsHold}`} {...hold}>
      {show ? (
        <ul className={shell.logList}>
          {[...latest].reverse().map((x, i) => (
            <li key={i}>
              <InfoLine x={x} view={view} lang={lang} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.holdHint}>{tu(lang, 'holdNews')}</p>
      )}
    </div>
  );
}

function snapLabel(snap, lang) {
  if (snap.tag === 'start') return tu(lang, 'chartStart');
  if (snap.tag === 'end') return tu(lang, 'chartEnd');
  if (snap.tag === 'day') return tu(lang, 'chartDay', {n: snap.day});
  return tu(lang, 'chartNight', {n: snap.night});
}

/** End-game: scrub a grade line chart to see living good/evil as a pie. */
function EndGradeCharts({log, lang}) {
  const points = Array.isArray(log) ? log : [];
  const [idx, setIdx] = useState(() => Math.max(0, points.length - 1));
  useEffect(() => {
    setIdx(Math.max(0, points.length - 1));
  }, [points.length]);
  if (points.length < 1) return null;
  const i = Math.min(idx, points.length - 1);
  const cur = points[i];
  const labels = points.map((p) => snapLabel(p, lang));
  const W = 320;
  const H = 168;
  const pad = {l: 32, r: 10, t: 14, b: 36};
  const maxY = Math.max(1, ...points.map((p) => Math.max(p.total || 0, p.goodGrade || 0, p.evilGrade || 0)));
  const xAt = (n) => pad.l + ((W - pad.l - pad.r) * n) / Math.max(1, points.length - 1);
  const yAt = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / maxY);
  const line = (key, color) => {
    const pts = points.map((p, n) => `${xAt(n)},${yAt(p[key] || 0)}`).join(' ');
    return (
      <g>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, n) => (
          <circle key={`${key}-${n}`} cx={xAt(n)} cy={yAt(p[key] || 0)} r={n === i ? 5 : 3.5} fill={color} stroke="#fff" strokeWidth="1" />
        ))}
      </g>
    );
  };
  const pickFromClientX = (svg, clientX) => {
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestD = Infinity;
    for (let n = 0; n < points.length; n += 1) {
      const d = Math.abs(xAt(n) - x);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    setIdx(best);
  };
  const onPointer = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pickFromClientX(e.currentTarget, e.clientX);
  };
  const good = cur.good || 0;
  const evil = cur.evil || 0;
  const pieTotal = good + evil || 1;
  const pieR = 44;
  const pieCx = 52;
  const pieCy = 52;
  const goodAngle = (2 * Math.PI * good) / pieTotal;
  const pieSlice = (start, sweep, color) => {
    if (sweep <= 0) return null;
    if (sweep >= 2 * Math.PI - 1e-6) {
      return <circle cx={pieCx} cy={pieCy} r={pieR} fill={color} />;
    }
    const a0 = start - Math.PI / 2;
    const a1 = a0 + sweep;
    const p0 = [pieCx + pieR * Math.cos(a0), pieCy + pieR * Math.sin(a0)];
    const p1 = [pieCx + pieR * Math.cos(a1), pieCy + pieR * Math.sin(a1)];
    const large = sweep > Math.PI ? 1 : 0;
    return <path d={`M ${pieCx} ${pieCy} L ${p0[0]} ${p0[1]} A ${pieR} ${pieR} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`} fill={color} />;
  };
  return (
    <div className={styles.endCharts}>
      <b>{tu(lang, 'gradeChart')}</b>
      <p className={styles.endChartsHint}>{tu(lang, 'chartDrag')}</p>
      <svg
        className={styles.endLine}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={tu(lang, 'gradeChart')}
        onPointerDown={onPointer}
        onPointerMove={(e) => {
          if (e.buttons) pickFromClientX(e.currentTarget, e.clientX);
        }}>
        {[0, 0.5, 1].map((t) => {
          const y = yAt(maxY * t);
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgba(20,20,20,0.12)" />
              <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#666">
                {Math.round(maxY * t)}
              </text>
            </g>
          );
        })}
        <line x1={xAt(i)} x2={xAt(i)} y1={pad.t} y2={H - pad.b} stroke="#141414" strokeWidth="1.5" strokeDasharray="4 3" />
        {line('goodGrade', '#2e86de')}
        {line('evilGrade', '#c2213b')}
        {labels.map((label, n) => (
          <text
            key={`${label}-${n}`}
            x={xAt(n)}
            y={H - 8}
            textAnchor="middle"
            fontSize="9"
            fontWeight={n === i ? 800 : 600}
            fill={n === i ? '#141414' : '#666'}>
            {label}
          </text>
        ))}
      </svg>
      <div className={styles.endLegend}>
        <span data-good="">
          <i /> {tu(lang, 'chartGood')} · {cur.goodGrade || 0}
        </span>
        <span data-evil="">
          <i /> {tu(lang, 'chartEvil')} · {cur.evilGrade || 0}
        </span>
        <span>
          {tu(lang, 'chartTotal')} · {cur.total || 0}
        </span>
      </div>
      <div className={styles.endPieRow}>
        <svg className={styles.endPie} viewBox="0 0 104 104" aria-hidden="true">
          {pieSlice(0, goodAngle, '#2e86de')}
          {pieSlice(goodAngle, (2 * Math.PI * evil) / pieTotal, '#c2213b')}
          <circle cx={pieCx} cy={pieCy} r={22} fill="#fff" />
          <text x={pieCx} y={pieCy + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#141414">
            {labels[i]}
          </text>
        </svg>
        <div className={styles.endPieStats}>
          <p>
            <b>{tu(lang, 'chartLiving')}</b>
          </p>
          <p data-good="">
            {tu(lang, 'chartGood')}: {good} ({Math.round((100 * good) / pieTotal)}%)
          </p>
          <p data-evil="">
            {tu(lang, 'chartEvil')}: {evil} ({Math.round((100 * evil) / pieTotal)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

function UniPhone({view, lang, send}) {
  const nm = (id) => {
    const p = view.players.find((x) => x.id === id);
    return p ? p.name : '?';
  };

  const reviveBox = view.dead && (
    <div className={shell.card}>
      <p className={shell.notice}>{tu(lang, 'dead')}</p>
      {view.reviveAt > 0 ? (
        !view.reviveUnlimited && !(view.revivesLeft > 0) ? (
          <p className={shell.muted}>{tu(lang, 'reviveMaxed', {max: view.reviveMax || MAX_REVIVES})}</p>
        ) : view.canRevive ? (
          <button type="button" className="button button--block" onClick={() => send({action: 'revive'})}>
            {view.reviveUnlimited
              ? tu(lang, 'reviveInf', {n: view.reviveAt})
              : tu(lang, 'revive', {n: view.reviveAt, left: view.revivesLeft, max: view.reviveMax || MAX_REVIVES})}
          </button>
        ) : (
          <p className={shell.muted}>
            {view.reviveUnlimited
              ? tu(lang, 'reviveNeedInf', {n: view.reviveAt, have: view.knowledge || 0})
              : tu(lang, 'reviveNeed', {
                  n: view.reviveAt,
                  have: view.knowledge || 0,
                  left: view.revivesLeft || 0,
                  max: view.reviveMax || MAX_REVIVES,
                })}
          </p>
        )
      ) : (
        <p className={shell.muted}>{tu(lang, 'reviveOff')}</p>
      )}
    </div>
  );

  if (view.kind === 'over') {
    return (
      <>
        <p className={shell.bigText}>{tu(lang, view.winner === 'good' ? 'goodWin' : 'evilWin')}</p>
        <div className={shell.card}>
          <b>{tu(lang, 'roles')}</b>
          <ul className={shell.logList}>
            {(view.roles || []).map((p) => (
              <li key={p.id}>
                {p.seat}. {p.name}: {L(ROLES[p.role], lang)}
              </li>
            ))}
          </ul>
        </div>
        <EndGradeCharts log={view.gradeLog || []} lang={lang} />
      </>
    );
  }

  if (view.kind === 'roles' || view.kind === 'wait') {
    return (
      <>
        <p className={styles.nowHint}>{tu(lang, 'now_roles')}</p>
        {view.kind === 'roles' && (
          <button type="button" className="button button--block" onClick={() => send({action: 'ready'})}>
            {tu(lang, 'ready')}
          </button>
        )}
      </>
    );
  }

  // Night: room card, role pick first (blocks homework), then skills / homework.
  if (view.kind === 'night') {
    const hasSkills = !view.dead && (view.spells || []).length > 0;
    const hasRoleAct = !view.dead && (view.roleTarget || (view.roleTargets && view.roleTargets.length > 0));
    const demonPrompt = view.demonKill ? 'cultKillReach' : view.demonVote ? 'cultVoteReach' : 'cultReach';
    return (
      <div className={styles.nightPhone}>
        <p className={shell.kicker}>{tu(lang, 'night', {n: view.night})}</p>
        {!view.dead && view.sleepRoom && (
          <RoomCard roomId={view.sleepRoom} lang={lang} me={view.me} people={view.roommates || []} />
        )}
        {hasRoleAct && (
          <div className={shell.card}>
            <b>{tu(lang, 'roleAction')}</b>
            {view.roleTarget ? (
              view.role === 'professor' && view.profResult ? (
                <div>
                  <p className={shell.muted}>{tu(lang, 'profResultNow')}</p>
                  <p>
                    <InfoLine
                      x={{key: 'prof', player: view.profResult.player, evil: view.profResult.evil}}
                      view={view}
                      lang={lang}
                    />
                  </p>
                </div>
              ) : (
                <p>{tu(lang, 'chosen', {name: nm(view.roleTarget)})}</p>
              )
            ) : (view.role === 'demon' && view.demonKill) || view.role === 'professor' ? (
              <>
                <p className={shell.muted}>
                  {tu(lang, view.role === 'professor' ? 'profReach' : demonPrompt)}
                </p>
                {(view.cultRoomCards || []).length ? (
                  <div className={styles.mapStack}>
                    {(view.cultRoomCards || []).map((rm) => (
                      <RoomCard
                        key={rm.id}
                        roomId={rm.id}
                        lang={lang}
                        me={view.me}
                        people={rm.people}
                        onPersonClick={(t) => send({action: 'act', target: t})}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={shell.muted}>
                    {tu(lang, view.role === 'professor' ? 'profReachEmpty' : 'cultReachEmpty')}
                  </p>
                )}
              </>
            ) : (
              <>
                {view.role === 'demon' ? <p className={shell.muted}>{tu(lang, demonPrompt)}</p> : null}
                <PlayerPick ids={view.roleTargets} view={view} lang={lang} onPick={(t) => send({action: 'act', target: t})} />
              </>
            )}
          </div>
        )}
        {view.role === 'demonking' && view.cultVotes && (
          <div className={shell.card}>
            <b>{tu(lang, 'cultVotesTitle')}</b>
            {(view.cultVotes || []).length === 0 ? (
              <p className={shell.muted}>{tu(lang, 'cultVoteNone')}</p>
            ) : (
              <ul className={styles.cultList}>
                {view.cultVotes.map((v) => (
                  <li key={v.id}>
                    {tu(lang, 'cultVoteLine', {
                      seat: v.seat,
                      name: v.name,
                      target: v.target ? `${v.target.seat}. ${v.target.name}` : '?',
                    })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {view.dead ? (
          <Homework view={view} lang={lang} send={send} />
        ) : view.mustPickFirst ? (
          <div className={shell.card}>
            <p className={shell.muted}>{tu(lang, 'mustPickFirst')}</p>
          </div>
        ) : (
          <>
            {hasSkills && (
              <div className={shell.card}>
                <b>{tu(lang, 'mySpells')}</b>
                <SpellList view={view} lang={lang} send={send} night />
              </div>
            )}
            <Homework view={view} lang={lang} send={send} />
          </>
        )}
        {reviveBox}
      </div>
    );
  }

  return (
    <>
      <LearnModal view={view} lang={lang} send={send} />
      {reviveBox}
      <DawnSecrets view={view} lang={lang} />
      {view.dead && <Homework view={view} lang={lang} send={send} />}
      {view.kind === 'suspect' && !view.dead && (
        <div className={shell.card}>
          <p className={styles.phasePrompt}>{tu(lang, 'suspectTitle')}</p>
          <p className={shell.muted}>{tu(lang, 'suspectNoGrade')}</p>
          {view.noSuspectTargets ? (
            <button type="button" className="button button--primary" onClick={() => send({action: 'suspect', target: 'none'})}>
              {tu(lang, 'suspectNoneLeft')}
            </button>
          ) : (
            <PlayerPick
              ids={(view.suspectTargets || []).map((p) => p.id)}
              view={view}
              lang={lang}
              onPick={(t) => send({action: 'suspect', target: t})}
            />
          )}
        </div>
      )}
      {view.kind === 'suspectDone' && (
        <div className={shell.card}>
          <p className={styles.phasePrompt}>{tu(lang, view.suspectSkippedGrade ? 'suspectSkippedGrade' : 'iVoted')}</p>
          {view.mySuspect && <p className={styles.phaseMeta}>{tu(lang, 'suspectPicked', {name: nm(view.mySuspect)})}</p>}
          {!view.suspectSkippedGrade && <p className={styles.phaseMeta}>{tu(lang, 'votedLocked')}</p>}
        </div>
      )}
      {(view.kind === 'suspectReveal' || view.kind === 'voteReveal') && (
        <p className={styles.phasePrompt}>{tu(lang, 'revealing')}</p>
      )}
      {view.kind === 'vote' && (
        <div className={shell.card}>
          <p className={styles.phasePrompt}>{tu(lang, view.voteRunoff ? 'voteRunoffQ' : 'voteQ')}</p>
          {view.hushed && <p className={shell.notice}>{tu(lang, 'hushed')}</p>}
          {view.dead && <p className={shell.notice}>{view.canYes ? tu(lang, 'ghostHas') : tu(lang, 'ghostSpent')}</p>}
          <div className={shell.choiceGrid}>
            {(view.ballotAccused || []).map((p) => (
              <button key={p.id} type="button" className="button button--sm" disabled={!view.canYes} onClick={() => send({action: 'vote', target: p.id})}>
                <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.seat}. {p.name}
              </button>
            ))}
            <button type="button" className="button button--sm button--secondary" onClick={() => send({action: 'vote', target: 'none'})}>
              {tu(lang, 'voteNone')}
            </button>
          </div>
        </div>
      )}
      {view.kind === 'voteReveal' && view.voteTied && (
        <p className={styles.phaseMeta}>{tu(lang, 'tieReveal')}</p>
      )}
      {view.kind === 'defense' && <p className={styles.phasePrompt}>{tu(lang, 'defense')}</p>}
      {view.kind === 'voted' && (
        <div className={shell.card}>
          <p className={styles.phasePrompt}>{tu(lang, view.grade === 0 && !view.dead ? 'suspectSkippedGrade' : 'iVoted')}</p>
          <p className={styles.phaseMeta}>{tu(lang, 'voted')}</p>
        </div>
      )}
      {!view.dead && (
        <div className={styles.roomPickGrid}>
          {view.rooms.filter((rm) => ROOMS[rm.id]).map((rm) => (
            <RoomCard
              key={rm.id}
              roomId={rm.id}
              lang={lang}
              compact
              selected={view.room === rm.id}
              onRoomClick={(r) => send({action: 'move', room: r})}
            />
          ))}
        </div>
      )}
      {!view.dead && (
        <div className={shell.card}>
          <b>{tu(lang, 'mySpells')}</b>
          <SpellList view={view} lang={lang} send={send} night={false} showLearn={view.canShop} />
        </div>
      )}
    </>
  );
}

export default university;
