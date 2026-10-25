/**
 * Bets & Wagers interface text in English and Simplified Chinese.
 *
 * The host screen and every phone pick their own language, so a mixed class
 * can play together: questions travel in both languages and each screen shows
 * its own. `{name}` placeholders are filled by `t()`; `tx()` does the same but
 * accepts React nodes (e.g. a bold room code) as values.
 */

import React, {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export const LANGS = ['en', 'zh'];
const LANG_KEY = 'bw-lang-v1';

const STRINGS = {
  en: {
    brand: 'Bets & Wagers',
    switchTo: '中文',
    switchLabel: 'Switch to Chinese',
    connected: 'Connected',
    connecting: 'Connecting',
    offline: 'Offline, retrying',
    local: 'local',
    room: 'Room',
    fullScreen: 'Full screen',
    // host: lobby
    joinOnPhone: 'Join on your phone',
    qrFor: 'QR code for {url}',
    openingRoom: 'Opening a room…',
    copyLink: 'Copy link',
    copied: 'Copied',
    players: 'Players',
    nobodyYet: 'Nobody yet. Scan the code to join.',
    topics: 'Topics',
    rounds: 'Rounds',
    names: 'Names',
    lockedNames: 'Generated names only',
    freeNames: 'Students type their own',
    startGame: 'Start game',
    needPlayers: 'Needs at least {n} players. Add bots to fill seats.',
    addBot: 'Add a bot',
    addBots: 'Add {n} bots',
    bot: 'Bot',
    removeName: 'Remove {name}',
    removePlayer: 'Remove player',
    removeConfirm: 'Remove {name} from the party?',
    // host: rounds
    questionOf: '{topic} · Question {n} of {total}',
    typeGuess: 'Type your guess on your phone',
    placeBets: 'Place your coins.',
    placeCoins: 'Put one coin on the answer you think is right.',
    why: 'Why: {hint}',
    curiousNote: 'Did you know',
    dragHint: 'Drag a coin onto a card, or tap the card.',
    numpadDelete: 'Delete',
    numpadPoint: 'Decimal point',
    answer: 'Answer: ',
    coins: '{n} coins',
    coin: '{n} coin',
    chips: '{n} coins',
    chip: '{n} coin',
    addTime: '+15 s',
    endTimer: 'End timer now',
    nextQuestion: 'Next question',
    finalScores: 'Final coins',
    scores: 'Coins',
    reconnecting: '(reconnecting)',
    topThree: 'Top three',
    pts: '{n} coins',
    playAgain: 'Play again',
    newRoom: 'New room',
    menu: 'Menu',
    menuConfirm: 'Go back to the menu? This game will stop.',
    replacedTitle: 'This room is open in another window',
    replacedBody: 'Only one screen can run the game. Keep playing there, or take the room back here.',
    useThisWindow: 'Use this window',
    imageCredit: 'Image: {credit}',
    smallerThanAll: 'Smaller than all',
    seconds: '{n}s',
    // phone
    roomCode: 'Room code',
    nickname: 'Nickname',
    yourName: 'Your name',
    nameHint: "{n}/{max} · must be different from everyone else's",
    joinParty: 'Join party',
    joining: 'Joining…',
    connectingButton: 'Connecting…',
    joiningRoom: 'Joining room {code}…',
    reconnectingSaved: 'Reconnecting… your seat and coins are saved.',
    queuedAnswer: 'Your answer will be sent as soon as you are back.',
    hostAway: 'The big screen disconnected. Hang on, it will pick up where it left off.',
    youreIn: "You're in!",
    waitingStart: 'Look for your name on the big screen. Waiting for the host to start ({n} so far).',
    roundOf: '{topic} · {n} of {total}',
    progress: '{done} of {total} locked in',
    leaveParty: 'Leave party',
    headerExit: 'Exit',
    leaveConfirm: 'Leave the party? Your coins stay on the big screen only until the host removes you.',
    firstAnswers: 'Board shows the first {n} distinct guesses (earliest lock wins a slot).',
    errRoomNotFound: 'No party with that code. Check the code on the big screen.',
    errRoomFull: 'That party is full ({n} players).',
    errNameTaken: 'Someone already has that name. Add an initial or pick another.',
    errKicked: 'The host removed you from this party. Ask your teacher before joining again.',
    errClosed: 'The host closed the party. Thanks for playing!',
    errSeatTaken: 'You are playing on another tab or device now.',
    errCode: 'The room code is the 4 letters on the big screen.',
    errName: 'Pick a nickname your teacher will recognise.',
    errStillConnecting: 'Still connecting to the game server. Try again in a moment.',
    playHere: 'Play as {name} on this device',
    newName: 'New name',
    namesLockedNote: 'Your teacher picks names from a safe list. Tap 🎲 for another.',
    takenAvatar: 'Avatar {n} (someone has it)',
    reactions: 'Send a reaction',
    react_laugh: 'Laughing',
    react_sad: 'Sad',
    react_confused: 'Confused',
    react_wow: 'Surprised',
    react_thumbs: 'Thumbs up',
    react_party: 'Celebrate',
    reactedBy: '{name} reacted {emoji}',
    chooseAvatar: 'Choose your avatar',
    changeAvatar: 'Change avatar',
    avatarN: 'Avatar {n}',
    done: 'Done',
    joinAsOther: 'Join with a different name',
    answerIn: 'Answer in {unit}',
    digits: '{n}/{max} digits',
    lockGuess: 'Lock guess',
    changeGuess: 'Change guess',
    locked: 'Locked: {value}',
    chipsLeft: '{n} coins left',
    chipLeft: '{n} coin left',
    chipsNote: 'A1 is reusable and never lost. Bank coins can be lost.',
    a1Label: 'A1',
    oneCoinOnly: 'Multiple choice: one coin only.',
    yours: 'yours',
    addChip: 'Add a coin',
    removeChip: 'Remove one coin',
    clearBets: 'Remove all coins here',
    lockBets: 'Lock bets ({n})',
    updateBets: 'Update bets',
    betsLocked: 'Bets locked',
    answerWas: 'The answer was',
    winningSlot: 'Winning slot: {label} ({odds} to 1)',
    points: '{n} coins',
    gameOver: 'Game over',
  },
  zh: {
    brand: '竞猜下注',
    switchTo: 'English',
    switchLabel: '切换到英文',
    connected: '已连接',
    connecting: '连接中',
    offline: '离线，正在重试',
    local: '本地',
    room: '房间',
    fullScreen: '全屏',
    joinOnPhone: '用手机加入',
    qrFor: '{url} 的二维码',
    openingRoom: '正在创建房间…',
    copyLink: '复制链接',
    copied: '已复制',
    players: '玩家',
    nobodyYet: '还没有人加入。扫描二维码即可加入。',
    topics: '题目类别',
    rounds: '回合数',
    names: '名字',
    lockedNames: '只用随机名字',
    freeNames: '学生自己输入',
    startGame: '开始游戏',
    needPlayers: '至少需要 {n} 名玩家。可以加机器人凑人数。',
    addBot: '加一个机器人',
    addBots: '加 {n} 个机器人',
    bot: '机器人',
    removeName: '移除 {name}',
    removePlayer: '移除玩家',
    removeConfirm: '要把 {name} 移出游戏吗？',
    questionOf: '{topic} · 第 {n} 题，共 {total} 题',
    typeGuess: '请在手机上输入你的猜测',
    placeBets: '请下注。',
    placeCoins: '把一枚硬币押在你认为对的答案上。',
    why: '理由：{hint}',
    curiousNote: '冷知识',
    dragHint: '把硬币拖到卡片上，或点卡片。',
    numpadDelete: '删除',
    numpadPoint: '小数点',
    answer: '答案：',
    coins: '{n} 枚硬币',
    coin: '{n} 枚硬币',
    chips: '{n} 枚硬币',
    chip: '{n} 枚硬币',
    addTime: '+15 秒',
    endTimer: '立即结束计时',
    nextQuestion: '下一题',
    finalScores: '最终硬币',
    scores: '硬币',
    reconnecting: '（重新连接中）',
    topThree: '前三名',
    pts: '{n} 枚硬币',
    playAgain: '再玩一局',
    newRoom: '新房间',
    menu: '菜单',
    menuConfirm: '返回菜单？本局将结束。',
    replacedTitle: '这个房间已在另一个窗口中打开',
    replacedBody: '只能有一个屏幕主持游戏。你可以在那边继续，或在这里接管房间。',
    useThisWindow: '使用此窗口',
    imageCredit: '图片：{credit}',
    smallerThanAll: '比所有猜测都小',
    seconds: '{n}秒',
    roomCode: '房间码',
    nickname: '昵称',
    yourName: '你的名字',
    nameHint: '{n}/{max} · 不能与别人重名',
    joinParty: '加入游戏',
    joining: '加入中…',
    connectingButton: '连接中…',
    joiningRoom: '正在加入房间 {code}…',
    reconnectingSaved: '正在重新连接……你的座位和硬币都已保存。',
    queuedAnswer: '恢复连接后会立即发送你的答案。',
    hostAway: '大屏幕断开了连接。请稍候，它会从断点继续。',
    youreIn: '你已加入！',
    waitingStart: '在大屏幕上找到你的名字。正在等待主持人开始（目前 {n} 人）。',
    roundOf: '{topic} · 第 {n}/{total} 题',
    progress: '已有 {done}/{total} 人确认',
    leaveParty: '退出游戏',
    headerExit: '退出',
    leaveConfirm: '确定要退出游戏吗？主持人移除你之前，你的硬币仍会显示在大屏幕上。',
    firstAnswers: '板上只显示最先锁定的 {n} 个不同猜测。',
    errRoomNotFound: '没有找到这个房间码，请核对大屏幕上的房间码。',
    errRoomFull: '这个房间已满（{n} 名玩家）。',
    errNameTaken: '这个名字已经有人用了。加个字母或换一个名字吧。',
    errKicked: '主持人已把你移出游戏。重新加入前请先问问老师。',
    errClosed: '主持人已关闭游戏，谢谢参与！',
    errSeatTaken: '你现在正在另一个标签页或设备上游戏。',
    errCode: '房间码是大屏幕上的4个字母。',
    errName: '请起一个老师认得出的昵称。',
    errStillConnecting: '仍在连接游戏服务器，请稍后再试。',
    playHere: '在此设备上以 {name} 继续',
    newName: '换个名字',
    namesLockedNote: '老师开启了安全名字，点🎲可以换一个。',
    takenAvatar: '头像 {n}（已有人用）',
    reactions: '发送表情',
    react_laugh: '大笑',
    react_sad: '难过',
    react_confused: '困惑',
    react_wow: '惊讶',
    react_thumbs: '点赞',
    react_party: '庆祝',
    reactedBy: '{name} 发送了 {emoji}',
    chooseAvatar: '选择头像',
    changeAvatar: '更换头像',
    avatarN: '头像 {n}',
    done: '完成',
    joinAsOther: '用其他名字加入',
    answerIn: '单位：{unit}',
    digits: '{n}/{max} 位',
    lockGuess: '确认猜测',
    changeGuess: '修改猜测',
    locked: '已确认：{value}',
    chipsLeft: '剩余 {n} 枚硬币',
    chipLeft: '剩余 {n} 枚硬币',
    chipsNote: 'A1 可重复使用，不会丢失。银行硬币押错会输掉。',
    a1Label: 'A1',
    oneCoinOnly: '选择题只能押一枚硬币。',
    yours: '你的',
    addChip: '加一枚硬币',
    removeChip: '减一枚硬币',
    clearBets: '清空这里的硬币',
    lockBets: '确认下注（{n}）',
    updateBets: '更新下注',
    betsLocked: '已下注',
    answerWas: '答案是',
    winningSlot: '获胜格：{label}（{odds}:1）',
    points: '{n} 枚硬币',
    gameOver: '游戏结束',
  },
};

/** "Hello {name}" + {name: 'Ana'} → "Hello Ana". */
export function t(lang, key, vars = {}) {
  const text = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] != null ? String(vars[name]) : `{${name}}`));
}

/** Like t(), but values may be React nodes. */
export function tx(lang, key, vars = {}) {
  const text = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
  return text.split(/(\{\w+\})/).map((part, i) => {
    const match = /^\{(\w+)\}$/.exec(part);
    return match && vars[match[1]] != null ? <React.Fragment key={i}>{vars[match[1]]}</React.Fragment> : part;
  });
}

/**
 * This screen's language: the last choice made here, else the site's locale
 * (the zh-Hans pages start in Chinese), else the browser's language.
 */
export function useLang() {
  const {i18n} = useDocusaurusContext();
  const [lang, setLangState] = useState('en');
  useEffect(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(LANG_KEY);
    } catch {
      // blocked storage: fall through to the locale
    }
    if (LANGS.includes(saved)) setLangState(saved);
    else if (i18n?.currentLocale?.startsWith('zh')) setLangState('zh');
    else if (typeof navigator !== 'undefined' && /^zh\b/i.test(navigator.language || '')) setLangState('zh');
  }, [i18n?.currentLocale]);
  const setLang = (next) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // blocked storage: the choice lasts for this page only
    }
  };
  return [lang, setLang];
}

/** The 中文 / English switch shown in each header. */
export function LangSwitch({lang, setLang, className}) {
  const other = lang === 'zh' ? 'en' : 'zh';
  return (
    <button
      type="button"
      className={`button button--sm button--secondary ${className || ''}`}
      onClick={() => setLang(other)}
      aria-label={t(lang, 'switchLabel')}
      lang={other === 'zh' ? 'zh-Hans' : 'en'}>
      {t(lang, 'switchTo')}
    </button>
  );
}
