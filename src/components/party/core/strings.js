/**
 * Strings for the shared party shell. Join-form words (room code, nickname,
 * avatar, connection) come from Bets & Wagers' table so every game reads the same.
 */

import {t as wagersT} from '@site/src/components/BetsAndWagers/strings';

const STRINGS = {
  en: {
    menuTitle: 'Party games',
    menuLead: 'Pick a game for the big screen. Everyone joins on their phone with the room code.',
    host: 'Host this game',
    openExternal: 'Open the game',
    scanToPlay: 'Scan to play',
    externalHostHint: 'Put this page on the projector. Everyone scans the code to open the game on their phone.',
    prototype: 'Prototype',
    playersRange: '{min}–{max} players',
    minutes: '~{n} min',
    backToMenu: '← All games',
    startGame: 'Start game',
    needPlayers: 'Needs at least {n} players. Add bots to fill seats.',
    tooMany: 'At most {n} seats; extra people watch.',
    addBot: 'Add a bot',
    addBots: 'Add 3 bots',
    fillBots: 'Fill to {n}',
    removeBots: 'Remove bots',
    clearOffline: 'Clear offline',
    clearRoom: 'Clear room',
    players: 'Players',
    names: 'Names',
    lockedNames: 'Generated names only',
    freeNames: 'Students type their own',
    classNamesHint: 'Phones pick a name from {class}. Same name twice becomes Name 2.',
    pickClassName: 'Pick your name',
    classNamesNote: 'Choose from the class list. If it’s taken, you join as Name 2.',
    settings: 'Settings',
    joinOnPhone: 'Join on your phone',
    copyLink: 'Copy link',
    copied: 'Copied',
    playAgain: 'Play again',
    toLobby: 'Back to lobby',
    endGame: 'End game',
    endConfirm: 'End this game and go back to the lobby?',
    voiceOn: 'Voice: on',
    voiceOff: 'Voice: off',
    skipTimer: 'Click or press F to end this timer early',
    fullScreen: 'Full screen',
    testMode: 'TEST MODE · timers ×0.2',
    inspect: 'Seat inspector',
    inspectHint: 'Play as any seat from here.',
    youreIn: "You're in!",
    waitingStart: 'Waiting for the host to start… {n} players so far.',
    seat: 'Seat {n}',
    you: 'you',
    bot: 'bot',
    offline: 'offline',
    gameOver: 'Game over',
    wrongGame: 'This room is playing another game, opening it…',
    send: 'Send',
    sent: 'Sent ✓',
    waiting: 'Waiting for others…',
    done: 'Done',
    howToPlay: 'How to play',
    close: 'Close',
    yourMove: 'Your move!',
    sending: 'Sending…',
    saveName: 'Save name',
  },
  zh: {
    menuTitle: '派对游戏',
    menuLead: '选一个游戏投到大屏幕上。大家用手机输入房间码加入。',
    host: '主持这个游戏',
    openExternal: '打开游戏',
    scanToPlay: '扫码进入',
    externalHostHint: '把这一页投到大屏幕上，大家扫二维码用手机打开游戏。',
    prototype: '原型',
    playersRange: '{min}–{max} 人',
    minutes: '约 {n} 分钟',
    backToMenu: '← 全部游戏',
    startGame: '开始游戏',
    needPlayers: '至少需要 {n} 名玩家。可以加机器人凑人数。',
    tooMany: '最多 {n} 个座位，其他人观战。',
    addBot: '加一个机器人',
    addBots: '加 3 个机器人',
    fillBots: '补满到 {n} 人',
    removeBots: '移除机器人',
    clearOffline: '清除离线',
    clearRoom: '清空房间',
    players: '玩家',
    names: '名字',
    lockedNames: '只用随机名字',
    freeNames: '学生自己输入',
    classNamesHint: '手机端从{class}名单选名字；重名会变成「名字 2」。',
    pickClassName: '选择你的名字',
    classNamesNote: '从班级名单选名字。若已被占用，会变成「名字 2」。',
    settings: '设置',
    joinOnPhone: '用手机加入',
    copyLink: '复制链接',
    copied: '已复制',
    playAgain: '再来一局',
    toLobby: '回到大厅',
    endGame: '结束游戏',
    endConfirm: '结束这局并回到大厅？',
    voiceOn: '语音：开',
    voiceOff: '语音：关',
    skipTimer: '点击或按 F 提前结束计时',
    fullScreen: '全屏',
    testMode: '测试模式 · 计时 ×0.2',
    inspect: '座位检查器',
    inspectHint: '可以在这里替任何座位操作。',
    youreIn: '你已加入！',
    waitingStart: '等待主持人开始……目前 {n} 名玩家。',
    seat: '{n}号',
    you: '你',
    bot: '机器人',
    offline: '离线',
    gameOver: '游戏结束',
    wrongGame: '这个房间在玩别的游戏，正在打开……',
    send: '发送',
    sent: '已发送 ✓',
    waiting: '等待其他人……',
    done: '完成',
    howToPlay: '怎么玩',
    close: '关闭',
    yourMove: '轮到你了！',
    sending: '发送中……',
    saveName: '保存名字',
  },
};

/** Shell string, falling back to Wagers' table (join form, connection words). */
export function st(lang, key, vars = {}) {
  const text = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key];
  if (text == null) return wagersT(lang, key, vars);
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] != null ? String(vars[name]) : `{${name}}`));
}

/** Pick the screen language from a {en, zh} pair (a plain string passes through). */
export function L(pair, lang) {
  if (pair == null) return '';
  if (typeof pair === 'string') return pair;
  return (lang === 'zh' ? pair.zh : pair.en) ?? pair.en ?? '';
}

/** A per-game string table: returns tg(lang, key, vars). */
export function makeT(table) {
  return (lang, key, vars = {}) => {
    const text = (table[lang] && table[lang][key]) ?? table.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] != null ? String(vars[name]) : `{${name}}`));
  };
}
