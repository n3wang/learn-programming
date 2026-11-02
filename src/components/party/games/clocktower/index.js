import React, {useState} from 'react';
import {pick} from '../../core/partyCore';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {
  ROLES,
  TEAMS,
  WHEN,
  alive,
  canNominate,
  canVoteYes,
  castVote,
  characterOptions,
  dayPowers,
  DIFFICULTY,
  EDITIONS,
  choicesFor,
  counts,
  editionOf,
  packsFor,
  scriptKeys,
  evilInfo,
  hostEndDay,
  isEvilRole,
  markReady,
  mustVoteYes,
  nightChoice,
  nominate,
  pendingTasks,
  setupClocktower,
  shownRole,
  slay,
  targetsFor,
  secretVotes,
  timeout,
  usePower,
} from './rules';
import shell from '../../core/party.module.css';
import styles from './clocktower.module.css';

const TEAM_TINT = {townsfolk: '#4aa8ff', outsider: '#7fd1ff', minion: '#e74c3c', demon: '#8e0e1f'};
const TEAM_ORDER = ['townsfolk', 'outsider', 'minion', 'demon'];

const tg = makeT({
  en: {
    holdRole: 'Hold to see your character',
    whatYouDo: 'What you do',
    whenWorks: 'When',
    howToPlay: 'How to play it',
    now_roles: 'Now: hold the card to read your character, then tap “I’ve seen it”.',
    now_sleep: 'Now: nothing to do. Keep your eyes on your phone; it wakes you if you have a turn.',
    now_choose: 'Now: your character wakes. Pick, then confirm. Everyone picks at the same time.',
    now_info: 'Now: read your information, remember it, tap OK.',
    now_day: 'Now: talk face to face. You may nominate once today, and vote on every nomination.',
    now_dead: 'Now: you are dead but still in the game. Talk, and keep your one ghost vote for when it matters.',
    now_vote: 'Now: vote. Yes = you want this player executed.',
    now_voted: 'Now: wait for the others to vote.',
    ready: 'I’ve seen it',
    yourDemon: 'Your Demon(s)',
    yourMinions: 'Your Minions',
    poppyHidden: 'A Poppy Grower is alive: you don’t know your team yet.',
    bluffs: 'Safe characters to claim (not in play)',
    night: 'Night {n}',
    eyesClosed: 'Eyes closed…',
    tapMoon: 'Tap the moon while you wait',
    nightAll: 'Night falls. Every phone that wakes acts now, all at the same time.',
    nightInfo: 'Morning news: read your phone.',
    waitingPhones: 'Waiting for {n} phone(s)…',
    youWake: 'You wake!',
    choose: 'Choose {n} player(s)',
    nameCharacter: 'Name a character',
    lastWish: 'You died. Your last wish:',
    lastwordHost: 'A dying player makes a choice…',
    skip: 'Not tonight',
    confirm: 'Confirm',
    ok: 'OK, back to sleep',
    dawn: 'Dawn',
    diedTonight: 'Died tonight:',
    peaceful: 'Nobody died.',
    day: 'Day {n} · talk!',
    nominate: 'Nominate a player',
    nominated: 'You already nominated today.',
    slay: 'Slayer: shoot a player (once)',
    onBlock: 'On the block: {name} ({n} votes)',
    tieBlock: 'Tied: nobody is on the block.',
    needVotes: 'Needs {n} votes to execute',
    defense: '{name} is nominated by {by}. Speak in your defense!',
    voteQ: 'Execute {name}?',
    yes: 'Yes',
    no: 'No',
    zealot: 'Zealot: you must vote yes.',
    ghostSpent: 'You used your ghost vote.',
    ghostHas: 'You have one ghost vote left.',
    voted: 'Vote cast.',
    executed: '{name} is executed.',
    noExecution: 'Nobody is executed today.',
    endDay: 'End the day ▶',
    goodWin: 'Good wins!',
    evilWin: 'Evil wins!',
    why_demonDead: 'Every Demon is dead.',
    why_twoLeft: 'Only two players are left alive.',
    why_parity: 'Evil is now at least half of the living players.',
    why_saint: 'The Saint was executed.',
    why_mayor: 'The Mayor survived the last day.',
    why_klutz: 'The Klutz picked an evil player.',
    why_mastermind: 'The Mastermind’s extra day decided it.',
    heretic: 'The Heretic was in play: the result is flipped!',
    roles: 'Characters',
    dead: 'You are dead. You may still talk, and vote once more.',
    yourInfo: 'What you learned',
    yesWord: 'YES',
    noWord: 'no',
    good: 'good',
    evil: 'evil',
    cw: 'clockwise (towards higher seat numbers)',
    ccw: 'anticlockwise (towards lower seat numbers)',
    nobody: 'none',
    info_pair: 'One of {a} and {b} is the {role}.',
    info_none: 'There are no Outsiders in play.',
    info_chef: 'Pairs of evil players sitting together: {n}',
    info_empath: 'Evil players among your living neighbours: {n}',
    info_ft: '{a} / {b}: is a Demon there? {answer}',
    info_role: '{name} is the {role}.',
    info_undertaker: 'Today’s executed player, {name}, was the {role}.',
    info_grandchild: 'Your grandchild is {name}, the {role}.',
    info_clock: 'Steps from a Demon to its nearest Minion: {n}',
    info_dreamer: '{name} is the {role} or the {role2}.',
    info_flower: 'Did a Demon vote today? {answer}',
    info_crier: 'Did a Minion nominate today? {answer}',
    info_oracle: 'Evil players among the dead: {n}',
    info_seam: 'Are {a} and {b} on the same team? {answer}',
    info_noble: 'Exactly one of {a}, {b} and {c} is evil.',
    info_balloon: 'A player of a different type from last night: {name}',
    info_shugenja: 'The nearest evil player is {dir}.',
    info_steward: '{name} is good.',
    info_knight: '{a} and {b} are not Demons.',
    info_idiot: '{name} is {align}.',
    info_maid: 'Of {a} and {b}, {n} woke tonight.',
    info_grimoire: 'The Grimoire (every character):',
    info_outsiders: 'Outsiders in play: {roles}',
    info_king: 'The King is {name}.',
    info_exorcised: 'The Exorcist ({name}) found you. You don’t act tonight.',
    info_preached: 'A Preacher found you: your ability is gone.',
    info_widow: 'A Widow is in play.',
    info_watch: '{name} is the Nightwatchman.',
    info_sage: 'One of {a} and {b} is the Demon who killed you.',
    info_choirboy: '{name} killed the King: they are the {role}.',
    info_becameDemon: 'You are now the {role}! You are evil: hide.',
    info_charmed: 'The Snake Charmer swapped with you: you are now the {role}, and good (and poisoned).',
    info_farmer: 'A Farmer died: you are now a Farmer.',
    info_poppy: 'The Poppy Grower died: your card now shows your evil team.',
    info_boffin: 'Boffin: {name} (a Demon) also has the {role} ability.',
    info_twin: 'Your twin is {name}, the {role}.',
    info_word: 'Your secret word: “{word}”',
    info_mad: 'Cerenovus: tomorrow, you must act as the {role} (“mad”).',
    info_harpy: 'Harpy: tomorrow, insist that {name} is evil (“mad”).',
    info_becameRole: 'You are now the {role}.',
    info_turnedEvil: 'You said the secret word: you are now evil!',
    info_wraith: 'Evil players who woke tonight: {list}',
    info_summoned: 'You summoned {name} as the {role}.',
    power_psychopath: 'Psychopath: kill a player now (before nominations)',
    power_goblin: 'I am the Goblin! (say it out loud)',
    power_mezepheles: 'Who said your secret word?',
    power_vizier: 'Vizier: execute {name} now',
    secretVote: 'Votes are secret today.',
    onBlockSecret: 'On the block: {name}',
    vizierIs: 'The Vizier: {name}',
    boomHost: 'BOOM! The last 3 point at one player…',
    boomPick: 'Boomdandy! Point at the player who should die:',
    grinderYes: 'Drunk tonight',
    why_twin: 'The good twin was executed.',
    why_fearmonger: 'The Fearmonger’s chosen player was executed.',
    why_goblin: 'The Goblin was executed after claiming.',
    why_leviathan: 'The Leviathan won: two good players were executed, or day 5 ended.',
    why_vortox: 'Nobody was executed while the Vortox lived.',
    why_legion: 'Legion overran the town.',
    info_phrase: 'Your secret phrase: “{word}”. Tap the button each time you say it out loud.',
    info_babysit: 'You are babysitting Lil’ Monsta: you are the Demon now (your own ability rests).',
    info_madeMinion: 'The Kazali made you a Minion: you are now the {role}, and evil.',
    power_yaggababble: 'I said my phrase ({n}/3 today)',
    dilemmaQ: 'The Al-Hadikhia chose you. Live or die? If all three choose to live, all three die.',
    dilemmaLive: 'I choose to live',
    dilemmaDie: 'I choose to die',
    dilemmaHost: 'The Al-Hadikhia chose: {names}. Each chooses to live or die…',
    riotPick: 'Riot! You died. Nominate the next player now:',
    riotHost: 'Riot! Every nominee dies and nominates the next…',
    difficulty: 'Difficulty',
    diff_auto: 'Auto',
    diff_beginner: 'Beginner',
    diff_intermediate: 'Intermediate',
    diff_advanced: 'Advanced',
    diff_expert: 'Expert',
    diff_custom: 'Custom',
    diffHelp: 'Auto: Beginner up to 15 players, Advanced up to 30, then Expert. Tap a pack to make your own mix.',
    packs: 'Role packs',
    packCount: '{n} characters in play this game',
    variants: 'Character choice',
    var_auto: 'Auto',
    var_off: 'Off',
    var_2: 'Pick 1 of 2',
    var_3: 'Pick 1 of 3',
    varHelp: 'At the reveal, players pick one of a few characters of the same type. Auto: 3 up to 12 players, 2 up to 30, none above.',
    nightSeconds: 'Night timer',
    sec: '{n} s',
    pickOne: 'Pick your character (tap a card), then confirm:',
    keepThis: 'Keep this one ✓',
    setupLine: '{n} players: {tf} Townsfolk, {out} Outsiders, {min} Minions, {dem} Demon(s)',
    dayMinutes: 'Day length',
    min: '{n} min',
    waiting: 'Waiting…',
    ghostTag: 'ghost vote',
  },
  zh: {
    holdRole: '按住查看你的角色',
    whatYouDo: '你的能力',
    whenWorks: '何时生效',
    howToPlay: '怎么玩',
    now_roles: '现在：按住卡片查看角色，然后点“我看过了”。',
    now_sleep: '现在：无需操作。看着手机，轮到你时会唤醒你。',
    now_choose: '现在：你的角色被唤醒。做出选择并确认。所有人同时选择。',
    now_info: '现在：查看并记住你的信息，然后点确定。',
    now_day: '现在：当面讨论。今天你可以提名一次，并对每次提名投票。',
    now_dead: '现在：你已死亡但仍在游戏中。可以发言，把唯一的幽灵票留到关键时刻。',
    now_vote: '现在：投票。赞成 = 你希望处决这名玩家。',
    now_voted: '现在：等待其他人投票。',
    ready: '我看好了',
    yourDemon: '你的恶魔',
    yourMinions: '你的爪牙',
    poppyHidden: '罂粟种植者还活着：你暂时不知道你的队友。',
    bluffs: '可以伪装的角色（不在场）',
    night: '第 {n} 夜',
    eyesClosed: '请闭眼……',
    tapMoon: '等待时请点点月亮',
    nightAll: '夜幕降临。被唤醒的手机现在同时行动。',
    nightInfo: '清晨消息：请看手机。',
    waitingPhones: '等待 {n} 部手机……',
    youWake: '你醒了！',
    choose: '选择 {n} 名玩家',
    nameCharacter: '说出一个角色',
    lastWish: '你死了。你的遗愿：',
    lastwordHost: '一名死者正在做出选择……',
    skip: '今晚不用',
    confirm: '确认',
    ok: '好的，继续睡',
    dawn: '天亮了',
    diedTonight: '昨夜死亡：',
    peaceful: '昨夜平安无事。',
    day: '第 {n} 天 · 讨论吧！',
    nominate: '提名一名玩家',
    nominated: '你今天已经提名过了。',
    slay: '猎手：射击一名玩家（每局一次）',
    onBlock: '即将处决：{name}（{n} 票）',
    tieBlock: '平票：没有人会被处决。',
    needVotes: '需要 {n} 票才能处决',
    defense: '{by} 提名了 {name}。请为自己辩护！',
    voteQ: '处决 {name} 吗？',
    yes: '赞成',
    no: '反对',
    zealot: '狂热者：你必须投赞成。',
    ghostSpent: '你的幽灵票已经用掉了。',
    ghostHas: '你还有一张幽灵票。',
    voted: '已投票。',
    executed: '{name} 被处决了。',
    noExecution: '今天没有人被处决。',
    endDay: '结束白天 ▶',
    goodWin: '善良阵营获胜！',
    evilWin: '邪恶阵营获胜！',
    why_demonDead: '所有恶魔都死了。',
    why_twoLeft: '只剩下两名存活玩家。',
    why_parity: '邪恶玩家已占存活玩家的一半或更多。',
    why_saint: '圣徒被处决了。',
    why_mayor: '镇长撑过了最后一天。',
    why_klutz: '呆瓜选中了一名邪恶玩家。',
    why_mastermind: '主谋的额外一天决定了胜负。',
    heretic: '异端分子在场：胜负颠倒！',
    roles: '角色',
    dead: '你已经死亡。你仍然可以发言，还能再投一票。',
    yourInfo: '你得知的信息',
    yesWord: '是',
    noWord: '否',
    good: '善良',
    evil: '邪恶',
    cw: '顺时针方向（座位号增大的方向）',
    ccw: '逆时针方向（座位号减小的方向）',
    nobody: '无',
    info_pair: '{a} 和 {b} 之中有一个是 {role}。',
    info_none: '场上没有外来者。',
    info_chef: '相邻而坐的邪恶玩家对数：{n}',
    info_empath: '你存活的邻座中邪恶玩家的数量：{n}',
    info_ft: '{a} / {b}：其中有恶魔吗？{answer}',
    info_role: '{name} 是 {role}。',
    info_undertaker: '今天被处决的 {name} 是 {role}。',
    info_grandchild: '你的孙辈是 {name}，角色是 {role}。',
    info_clock: '恶魔到最近爪牙的步数：{n}',
    info_dreamer: '{name} 是 {role} 或 {role2}。',
    info_flower: '今天有恶魔投票吗？{answer}',
    info_crier: '今天有爪牙提名吗？{answer}',
    info_oracle: '死亡玩家中的邪恶玩家数量：{n}',
    info_seam: '{a} 和 {b} 是同一阵营吗？{answer}',
    info_noble: '{a}、{b}、{c} 之中恰好有一人是邪恶的。',
    info_balloon: '一名与昨晚类型不同的玩家：{name}',
    info_shugenja: '离你最近的邪恶玩家在{dir}。',
    info_steward: '{name} 是善良的。',
    info_knight: '{a} 和 {b} 都不是恶魔。',
    info_idiot: '{name} 是{align}的。',
    info_maid: '{a} 和 {b} 中今晚有 {n} 人被唤醒。',
    info_grimoire: '魔典（所有角色）：',
    info_outsiders: '在场的外来者：{roles}',
    info_king: '国王是 {name}。',
    info_exorcised: '驱魔人（{name}）找到了你。你今晚无法行动。',
    info_preached: '传教士找到了你：你失去了能力。',
    info_widow: '寡妇在场。',
    info_watch: '{name} 是守夜人。',
    info_sage: '{a} 和 {b} 之中有一个是杀死你的恶魔。',
    info_choirboy: '{name} 杀死了国王：他是 {role}。',
    info_becameDemon: '你现在是 {role}！你是邪恶的：藏好。',
    info_charmed: '舞蛇人和你交换了：你现在是 {role}，属于善良阵营（并且中毒）。',
    info_farmer: '一名农夫死了：你现在是农夫。',
    info_poppy: '罂粟种植者死了：你的角色卡现在会显示你的邪恶队友。',
    info_boffin: '科学怪人：{name}（恶魔）还拥有 {role} 的能力。',
    info_twin: '你的双子是 {name}，角色是 {role}。',
    info_word: '你的秘密词语：“{word}”',
    info_mad: '洗脑师：明天你必须假装是 {role}（“疯狂”）。',
    info_harpy: '鹰身女妖：明天你必须坚称 {name} 是邪恶的（“疯狂”）。',
    info_becameRole: '你现在是 {role}。',
    info_turnedEvil: '你说出了秘密词语：你现在是邪恶的！',
    info_wraith: '今晚醒来的邪恶玩家：{list}',
    info_summoned: '你把 {name} 召唤成了 {role}。',
    power_psychopath: '精神病患者：现在杀死一名玩家（提名之前）',
    power_goblin: '我是哥布林！（大声说出来）',
    power_mezepheles: '谁说出了你的秘密词语？',
    power_vizier: '维齐尔：立即处决 {name}',
    secretVote: '今天的投票是保密的。',
    onBlockSecret: '即将处决：{name}',
    vizierIs: '维齐尔：{name}',
    boomHost: '轰！最后三人指向一名玩家……',
    boomPick: '炸弹人！指出应该死亡的玩家：',
    grinderYes: '今晚醉酒',
    why_twin: '善良的双子被处决了。',
    why_fearmonger: '恐惧之灵选中的玩家被处决了。',
    why_goblin: '哥布林在声称身份后被处决了。',
    why_leviathan: '利维坦获胜：两名善良玩家被处决，或第五天结束了。',
    why_vortox: '涡流存活期间有一天无人被处决。',
    why_legion: '军团占领了小镇。',
    info_phrase: '你的秘密短语：“{word}”。每公开说一次，就点一次按钮。',
    info_babysit: '你正在照看小怪宝：你现在就是恶魔（你自己的能力暂停）。',
    info_madeMinion: '卡扎力把你变成了爪牙：你现在是 {role}，属于邪恶阵营。',
    power_yaggababble: '我说了短语（今天 {n}/3）',
    dilemmaQ: '阿尔-哈迪哈选中了你。选择生还是死？如果三人都选择生，三人都会死。',
    dilemmaLive: '我选择生',
    dilemmaDie: '我选择死',
    dilemmaHost: '阿尔-哈迪哈选中了：{names}。每人选择生或死……',
    riotPick: '暴乱！你死了。现在提名下一名玩家：',
    riotHost: '暴乱！每个被提名者都会死，并提名下一个……',
    difficulty: '难度',
    diff_auto: '自动',
    diff_beginner: '入门',
    diff_intermediate: '进阶',
    diff_advanced: '高级',
    diff_expert: '专家',
    diff_custom: '自定义',
    diffHelp: '自动：15 人以内入门，30 人以内高级，更多人用专家。点角色包可以自己搭配。',
    packs: '角色包',
    packCount: '本局可用角色：{n} 个',
    variants: '角色选择',
    var_auto: '自动',
    var_off: '关闭',
    var_2: '二选一',
    var_3: '三选一',
    varHelp: '揭晓角色时，玩家从几个同类型角色中选一个。自动：12 人以内三选一，30 人以内二选一，更多人不选。',
    nightSeconds: '夜晚计时',
    sec: '{n} 秒',
    pickOne: '选择你的角色（点卡片），然后确认：',
    keepThis: '就选这个 ✓',
    setupLine: '{n} 名玩家：{tf} 镇民、{out} 外来者、{min} 爪牙、{dem} 恶魔',
    dayMinutes: '白天时长',
    min: '{n} 分钟',
    waiting: '等待中……',
    ghostTag: '幽灵票',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to Ravenswood Bluff. After dark… beware the Demon.', zh: '欢迎来到鸦木布拉夫小镇。天黑以后……小心恶魔。'},
  dusk: {en: 'Night falls. Everyone, look at your phone. If it wakes you, act now.', zh: '夜幕降临。所有人看手机。如果手机唤醒你，现在行动。'},
  died: {en: '{seat} died.', zh: '{seat}死了。'},
  peaceful: {en: 'Last night… all was quiet.', zh: '昨夜……平安无事。'},
  day: {en: 'Dawn. Talk now. When the bell rings again, the day ends.', zh: '天亮了。讨论吧，钟声再响时，白天结束。'},
  nominate: {en: '{seat} is nominated. Speak in your defense.', zh: '{seat}被提名了。请为自己辩护。'},
  vote: {en: 'Raise your hands… now.', zh: '举起你的手……现在。'},
  executed: {en: '{seat} is executed.', zh: '{seat}被处决了。'},
  survived: {en: '{seat} is executed… but does not die.', zh: '{seat}被处决了……但没有死。'},
  no_execution: {en: 'Today, no one is executed.', zh: '今天，没有人被处决。'},
  slayer_miss: {en: 'Nothing happens.', zh: '什么也没有发生。'},
  demon_dies: {en: 'A scream… then silence.', zh: '一声尖叫……然后是寂静。'},
  banshee: {en: 'A wail echoes through the town. {seat} was the Banshee.', zh: '一声哀嚎响彻小镇。{seat}是报丧女妖。'},
  mastermind: {en: 'The Demon is dead… but the Mastermind gives evil one more day.', zh: '恶魔死了……但主谋让邪恶多活一天。'},
  win_good: {en: 'The Demons are destroyed, and the bell rings again.', zh: '恶魔被消灭了，钟声重新响起。'},
  win_evil: {en: 'The clock tower… never strikes again.', zh: '钟楼……再也不报时了。'},
  vizier: {en: 'Know this: {seat} is the Vizier.', zh: '大家注意：{seat}是维齐尔。'},
  vizier_execute: {en: 'The Vizier commands it: execute!', zh: '维齐尔下令：处决！'},
  fear: {en: 'The Fearmonger has chosen someone new.', zh: '恐惧之灵选择了新的目标。'},
  goblin: {en: '{seat} claims to be the Goblin!', zh: '{seat}声称自己是哥布林！'},
  boom: {en: 'BOOM! Only three remain. Point… now.', zh: '轰！只剩三人。指认……现在。'},
  psychopath: {en: 'The Psychopath strikes: {seat} dies.', zh: '精神病患者出手：{seat}死了。'},
  roshambo_win: {en: 'Rock, paper, scissors… {seat} wins and lives!', zh: '石头、剪刀、布……{seat}赢了，活了下来！'},
  roshambo_lose: {en: 'Rock, paper, scissors… {seat} loses.', zh: '石头、剪刀、布……{seat}输了。'},
  wish: {en: 'Somewhere, a wish came true…', zh: '某处，一个愿望成真了……'},
  leviathan: {en: 'Beware: the Leviathan is in play. Execute carefully.', zh: '注意：利维坦在场。处决要谨慎。'},
  riot: {en: 'Day three. Riot! Every nominee dies… and nominates the next.', zh: '第三天。暴乱！每个被提名者都会死……并提名下一个。'},
};

function Token({role, lang, size = 64}) {
  const r = ROLES[role];
  return <Sprite path={`clocktower/role-${role}.webp`} emoji={r.emoji} label={L(r, lang)} tint={TEAM_TINT[r.team]} size={`${size}px`} shape="token" />;
}

// ------------------------------------------------------------------ bots

/** Night picks evil bots aim at good players. */
const EVIL_AIMS = ['imp', 'pukka', 'nodashii', 'shabaloth', 'assassin', 'godfather', 'poisoner', 'widow', 'witch'];

function botMove(s, g, id, ctx) {
  const rng = ctx.rng;
  if (s.phase === 'roles' && !s.ready[id]) return {action: 'ready'};
  const task = s.tasks && s.tasks[id];
  if (['night', 'lastword', 'boom', 'riot'].includes(s.phase) && task && !task.done) {
    if (task.read) return {action: 'night'};
    if (task.dilemma) return rng() < 0.6 ? {action: 'night', targets: []} : {action: 'night', skip: true};
    if (task.optional && rng() < 0.5) return {action: 'night', skip: true};
    let legal = targetsFor(s, id, task);
    if (s.evil[id] && EVIL_AIMS.includes(task.role)) {
      const good = legal.filter((p) => !s.evil[p]);
      if (good.length >= task.n) legal = good;
    }
    if (s.evil[id] && task.role === 'devilsadvocate') {
      const team = legal.filter((p) => s.evil[p]);
      if (team.length) legal = team;
    }
    const options = characterOptions(s, task);
    return {action: 'night', targets: [...legal].sort(() => rng() - 0.5).slice(0, task.n), character: task.character ? pick(options, rng) : undefined};
  }
  for (const p of dayPowers(s, id)) {
    if (p.power === 'goblin' && rng() < 0.5) return {action: 'power', power: 'goblin'};
    if (p.power === 'psychopath' && rng() < 0.02) return {action: 'power', power: 'psychopath', target: pick(p.targets.filter((t) => !s.evil[t]).concat(p.targets).slice(0, 5), rng)};
  }
  if (s.phase === 'day' && !s.dead[id]) {
    if (shownRole(s, id) === 'slayer' && !s.used[`slayer:${id}`] && rng() < 0.02) {
      return {action: 'slay', target: pick(alive(s).filter((p) => p !== id), rng)};
    }
    // Bots leave room for humans: a few nominations a day between them.
    const cap = Math.max(3, Math.round(s.seats.length / 6));
    if (canNominate(s, id) && Object.keys(s.nominated).length < cap && rng() < 0.01) {
      const options = alive(s).filter((p) => p !== id && !s.nominated[p]);
      if (options.length) return {action: 'nominate', target: pick(options, rng)};
    }
  }
  if (s.phase === 'vote' && s.vote.votes[id] == null) {
    const yes = s.evil[id] ? !s.evil[s.vote.nominee] && rng() < 0.6 : rng() < 0.4;
    return {action: 'vote', yes: yes && (!s.dead[id] || rng() < 0.3)};
  }
  return null;
}

/** The phone rulebook: one collapsible section per topic, for new players. */
const RULEBOOK = {
  en: [
    {title: 'The goal', items: [
      'Good wins when every Demon is dead (usually by execution).',
      'Evil wins when only 2 players are left alive. In big games with more than one Demon, evil also wins once evil players are at least half of the living.',
      'Nobody knows who is who: listen, ask questions, and compare stories.',
    ]},
    {title: 'The teams', items: [
      'Townsfolk (good): helpful abilities. Most players are Townsfolk.',
      'Outsiders (good): their abilities can backfire on their own team.',
      'Minions (evil): know the Demons and help them, mostly by lying.',
      'Demons (evil): kill at night. One Demon per game up to 22 players, then one more per 15 players (up to 4).',
      'Evil players know each other; good players only know themselves.',
    ]},
    {title: 'A night', items: [
      'Everyone looks at their phone at the same time. If your character acts tonight, your phone wakes you: pick a player (or a character) and confirm. Everyone picks at once, so nobody waits for anybody.',
      'When all picks are in, the screen resolves them in a fixed order: drunk and poison first, then protection, then kills. Who tapped first never matters.',
      'If you die tonight and your character has a last wish (Ravenkeeper, Moonchild, Klutz), your phone asks for it.',
      'Then everyone with information reads it on their phone. Deaths are announced at dawn.',
    ]},
    {title: 'A day', items: [
      'Talk face to face. Claim your character, or bluff, it is your choice.',
      'Anyone alive may nominate one player per day; a player can be nominated once per day.',
      'Everyone votes on their phone. The player with the most votes (at least half of the living players) is executed at the end of the day. A tie executes nobody.',
    ]},
    {title: 'Dying', items: [
      'Dead players keep talking and keep their character secret if they like.',
      'Each dead player has one ghost vote for the rest of the game. Save it for an important execution.',
      'Dead players can’t nominate or use abilities (except last wishes and the Banshee).',
    ]},
    {title: 'Drunk and poisoned', items: [
      'A drunk or poisoned player’s ability doesn’t work, but they are not told.',
      'Their information may be wrong. If two stories clash, one of them may be drunk or poisoned.',
    ]},
    {title: 'Bluffing', items: [
      'Evil players pretend to be good characters. Each Demon is shown 3 characters that are not in play: safe bluffs.',
      'Good players may also hide their character to stay safe, but the town needs information to win.',
    ]},
    {title: 'Big games (16–64 players)', items: [
      'Every player gets a character. With “All characters”, they are all different until the list runs out.',
      'About a quarter of the players are evil. Several Demons each kill at night, so share information quickly.',
      'Days last a little longer in big games; nominate the players you most suspect first.',
    ]},
    {title: 'Words you will hear', items: [
      'Nominate: put a player up for execution today.',
      'Execute: the town kills the nominated player with the most votes.',
      'Claim: say which character you are (true or not).',
      'Register as: how a character looks to other abilities (the Recluse may look evil, the Spy may look good).',
    ]},
    {title: 'First game tips', items: [
      'Read your character card twice and ask the teacher if anything is unclear.',
      'Write down what you learn each night.',
      'Don’t vote yes on everyone: executing a good player helps evil.',
    ]},
  ],
  zh: [
    {title: '目标', items: ['所有恶魔死亡（通常是被处决）时，善良获胜。', '只剩 2 名存活玩家时，邪恶获胜。在有多个恶魔的大型游戏中，邪恶玩家达到存活人数一半时，邪恶也获胜。', '没有人知道谁是谁：认真听、多提问、对比大家的说法。']},
    {title: '阵营', items: ['镇民（善良）：有帮助的能力，大多数玩家是镇民。', '外来者（善良）：他们的能力可能拖累自己的阵营。', '爪牙（邪恶）：认识恶魔并帮助他们，主要靠说谎。', '恶魔（邪恶）：夜里杀人。22 人以内一个恶魔，之后每多 15 人多一个（最多 4 个）。', '邪恶玩家互相认识；善良玩家只知道自己。']},
    {title: '夜晚', items: ['所有人同时看手机。如果你的角色今晚行动，手机会唤醒你：选择一名玩家（或一个角色）并确认。大家同时选择，不用等别人。', '所有选择完成后，大屏幕按固定顺序结算：先醉酒和中毒，再保护，最后击杀。谁先点都没关系。', '如果你今晚死亡且你的角色有遗愿（守鸦人、月之子、呆瓜），手机会让你选择。', '然后所有得到信息的人在手机上查看。死亡会在天亮时公布。']},
    {title: '白天', items: ['当面讨论。公开你的角色还是伪装，由你决定。', '每名存活玩家每天可以提名一次；每名玩家每天只能被提名一次。', '所有人在手机上投票。票数最多（至少达到存活人数一半）的玩家在白天结束时被处决，平票则无人被处决。']},
    {title: '死亡', items: ['死亡玩家仍可发言，也可以继续隐藏自己的角色。', '每名死亡玩家在之后的游戏中有一张幽灵票，留到重要的处决时再用。', '死亡玩家不能提名，也不能使用能力（遗愿和报丧女妖除外）。']},
    {title: '醉酒与中毒', items: ['醉酒或中毒的玩家能力失效，但他们不会被告知。', '他们的信息可能是错的。如果两人说法冲突，其中一人可能醉了或中毒了。']},
    {title: '伪装', items: ['邪恶玩家会假装成善良角色。每个恶魔会看到 3 个不在场的角色，可以安全冒充。', '善良玩家也可以隐藏身份保护自己，但大家需要信息才能获胜。']},
    {title: '大型游戏（16–64 人）', items: ['每名玩家都有角色。选择“全部”时，角色在用完之前都不重复。', '大约四分之一的玩家是邪恶的。多个恶魔每晚各自杀人，所以要尽快分享信息。', '大型游戏的白天稍长；先提名你最怀疑的人。']},
    {title: '常用词', items: ['提名：提议今天处决某名玩家。', '处决：大家处死票数最多的被提名者。', '声称：说出你是哪个角色（不一定是真的）。', '被当作：一个角色在别人能力里的样子（陌客可能显示为邪恶，间谍可能显示为善良）。']},
    {title: '第一次玩的建议', items: ['把你的角色卡读两遍，不清楚就问老师。', '记下你每晚得到的信息。', '不要对每个人都投赞成：处决善良玩家会帮到邪恶。']},
  ],
};

// ------------------------------------------------------------------ module

const clocktower = {
  id: 'clocktower',
  logo: 'clocktower/logo-tb.webp',
  title: {en: 'Blood on the Clocktower', zh: '血染钟楼'},
  blurb: {
    en: 'Demons hide among the townsfolk. The screen is the Storyteller; nights on your phone (everyone at once), days arguing in person. 5–64 players, 106 characters.',
    zh: '恶魔藏在镇民之中。大屏幕当说书人；夜晚大家同时看手机，白天当面辩论。5–64 人，106 个角色。',
  },
  howTo: {
    en: [
      'Hold your phone to see your character. Good (Townsfolk, Outsiders) must find and execute every Demon; evil (Minions, Demons) know each other.',
      'Night: everyone looks at their phone. Phones that wake pick at the same time; then everyone reads their information.',
      'Day: talk face to face. Anyone may nominate once a day; everyone votes on their phone.',
      'The player with the most votes (at least half the living players) is executed at the end of the day. A tie executes nobody.',
      'The dead keep talking and have one last vote. Good wins when every Demon is dead; evil wins when only 2 are left (or, with several Demons, when evil reaches half of the living).',
      'Information can be wrong if you are poisoned or drunk: compare stories carefully!',
    ],
    zh: [
      '按住手机查看你的角色。善良阵营（镇民、外来者）要找出并处决所有恶魔；邪恶阵营（爪牙、恶魔）互相认识。',
      '夜晚：所有人看着手机。被唤醒的手机同时选择；然后所有人查看自己的信息。',
      '白天：当面讨论。每人每天可以提名一次，所有人在手机上投票。',
      '票数最多（至少达到存活人数一半）的玩家在白天结束时被处决，平票则无人被处决。',
      '死亡玩家仍可发言，还有最后一票。所有恶魔死亡则善良获胜；只剩 2 人（或多恶魔时邪恶达到存活人数一半）时邪恶获胜。',
      '中毒或醉酒时你的信息可能是错的：仔细对比大家的说法！',
    ],
  },
  rulebook(lang) {
    return RULEBOOK[lang] || RULEBOOK.en;
  },
  /** Every character, grouped by team: ability, when it works, and a tip. */
  reference(lang) {
    return TEAM_ORDER.flatMap((team) =>
      Object.keys(ROLES)
        .filter((k) => ROLES[k].team === team)
        .map((k) => ({
          group: `${L(TEAMS[team], lang)} · ${L(TEAMS[team].goal, lang)}`,
          emoji: <Sprite path={`clocktower/role-${k}.webp`} emoji="" label="" tint={TEAM_TINT[team]} shape="icon" size="26px" />,
          tint: TEAM_TINT[team],
          title: L(ROLES[k], lang),
          tag: `${L(WHEN[ROLES[k].when], lang)} · ${L(EDITIONS[editionOf(k)], lang)}`,
          text: ROLES[k].ab,
          more: ROLES[k].tip,
        })),
    );
  },
  inspiredBy: 'Blood on the Clocktower (The Pandemonium Institute); character art by Aidan Roberts',
  players: {min: 5, max: 64},
  minutes: 45,
  coverTint: '#8e0e1f',
  themeClass: shell.themeClock,
  /** Host state or phone view: dark screens at night only. */
  night: (x) => x.phase === 'night',
  defaultSettings: {dayMinutes: 4, difficulty: 'auto', variants: 'auto', nightSeconds: 45},
  voiceLines: VOICE,

  setup(g, seats, ctx) {
    return setupClocktower(seats, g.settings, ctx);
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'ready':
        return markReady(s, ctx, id, msg.pick);
      case 'night':
        return nightChoice(s, ctx, id, msg);
      case 'nominate':
        return nominate(s, ctx, id, msg.target);
      case 'vote':
        return castVote(s, ctx, id, Boolean(msg.yes));
      case 'power':
        return usePower(s, ctx, id, msg.power, msg.target);
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

  /** The phone view plus `urgent` (this phone must act now), which drives the banner and buzz. */
  view(s, g, id, ctx) {
    const v = this.baseView(s, g, id, ctx);
    return {...v, urgent: ['roles', 'choose', 'info', 'vote'].includes(v.kind)};
  },

  baseView(s, g, id) {
    const player = (p) => ({id: p, name: g.players[p] ? g.players[p].name : '?', seat: g.players[p] ? g.players[p].seat : 0, avatar: g.players[p] && g.players[p].avatar, color: g.players[p] && g.players[p].color, dead: Boolean(s.dead[p])});
    const role = shownRole(s, id);
    const evil = evilInfo(s, id);
    const task = s.tasks && s.tasks[id];
    let kind = s.phase;
    if (s.phase === 'roles' && s.ready[id]) kind = 'wait';
    if (['night', 'lastword', 'boom', 'riot'].includes(s.phase)) kind = task && !task.done ? (task.read ? 'info' : 'choose') : s.phase === 'night' ? 'sleep' : 'execution';
    if (s.phase === 'vote' && s.vote.votes[id] != null) kind = 'voted';
    const v = {
      task: `${kind}-${s.night}-${s.day}-${s.stage || ''}-${task ? task.role : ''}`,
      kind,
      phase: s.phase,
      options: s.phase === 'roles' && !s.ready[id] && s.choices[id] ? s.choices[id] : null,
      role,
      night: s.night,
      day: s.day,
      dead: Boolean(s.dead[id]),
      ghost: s.dead[id] ? !s.ghostVote[id] : null,
      evil: evil && {demons: evil.demons.map(player), minions: evil.minions.map(player), bluffs: evil.bluffs, hidden: Boolean(evil.hidden)},
      info: s.info[id] || [],
      players: s.seats.map(player),
      me: id,
      winner: s.winner,
      winWhy: s.winWhy,
      heretic: Boolean(s.heretic),
    };
    if (kind === 'choose') {
      v.choose = {
        role: task.role,
        n: task.n,
        targets: targetsFor(s, id, task).map(player),
        characters: task.character ? characterOptions(s, task) : null,
        optional: task.optional,
        lastWish: s.phase === 'lastword' || s.stage === 'follow',
        byDay: ['lastword', 'boom', 'riot'].includes(s.phase),
        boom: s.phase === 'boom',
        riot: s.phase === 'riot',
        dilemma: Boolean(task.dilemma),
      };
    }
    if (kind === 'info') v.callInfo = task.items;
    if (s.phase === 'day') {
      v.canNominate = canNominate(s, id);
      // Dead players can be nominated too (as in the real game).
      v.nominees = s.seats.filter((p) => !s.nominated[p]).map(player);
    }
    if (s.phase === 'day' || s.phase === 'defense') v.canSlay = (role === 'slayer' || s.boffin[id] === 'slayer') && !s.used[`slayer:${id}`] && !s.dead[id];
    v.powers = dayPowers(s, id).map((p) => ({power: p.power, count: p.count, targets: p.targets && p.targets.map(player)}));
    if (s.vote) {
      v.nominee = player(s.vote.nominee);
      v.nominator = player(s.vote.nominator);
      v.canYes = canVoteYes(s, id);
      v.mustYes = mustVoteYes(s, id);
    }
    if (s.over) v.roles = s.seats.map((p) => ({...player(p), role: s.role[p]}));
    return v;
  },

  bot: botMove,

  SettingsView({settings, set, lang, playerCount: n = 0}) {
    const seats = Math.max(5, n);
    const c = n >= 5 ? counts(n) : null;
    const diff = settings.difficulty || 'auto';
    const packs = packsFor(settings, seats);
    const radio = (key, value, current, label) => (
      <button key={String(value)} type="button" role="radio" aria-checked={current === value} className="button button--sm button--secondary" onClick={() => set({[key]: value})}>
        {label}
      </button>
    );
    const togglePack = (k) => {
      const next = packs.includes(k) ? packs.filter((p) => p !== k) : [...packs, k];
      set({difficulty: 'custom', packs: next.length ? next : ['tb']});
    };
    return (
      <>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'difficulty')}</span>
          {['auto', ...Object.keys(DIFFICULTY), 'custom'].map((d) => radio('difficulty', d, diff, tg(lang, `diff_${d}`)))}
        </div>
        <div className={styles.packRow} role="group" aria-label={tg(lang, 'packs')}>
          {Object.entries(EDITIONS).map(([k, e]) => (
            <button key={k} type="button" className={styles.pack} aria-pressed={packs.includes(k)} onClick={() => togglePack(k)}>
              <Sprite path={e.logo} emoji={e.emoji} label={L(e, lang)} tint="#fff" size="56px" />
              <b>{L(e, lang)}</b>
              <small>{L(e.note, lang)}</small>
            </button>
          ))}
        </div>
        <p className={shell.muted}>
          {tg(lang, 'diffHelp')} {tg(lang, 'packCount', {n: scriptKeys(packs).length})}
        </p>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'variants')}</span>
          {['auto', 'off', 2, 3].map((v) => radio('variants', v, settings.variants || 'auto', tg(lang, `var_${v}`)))}
        </div>
        <p className={shell.muted}>
          {tg(lang, 'varHelp')}
          {n >= 5 && ` (${tg(lang, choicesFor(settings, n) > 1 ? `var_${choicesFor(settings, n)}` : 'var_off')})`}
        </p>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'dayMinutes')}</span>
          {[2, 4, 6, 8].map((m) => radio('dayMinutes', m, settings.dayMinutes, tg(lang, 'min', {n: m})))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 'nightSeconds')}</span>
          {[30, 45, 60, 90].map((m) => radio('nightSeconds', m, settings.nightSeconds || 45, tg(lang, 'sec', {n: m})))}
        </div>
        {c && <p className={shell.muted}>{tg(lang, 'setupLine', {n, tf: c.townsfolk, out: c.outsider, min: c.minion, dem: c.demon})}</p>}
      </>
    );
  },


  HostView({g, state: s, lang, hostAct}) {
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const need = Math.ceil(alive(s).length / 2);
    const waiting = pendingTasks(s);
    const secret = secretVotes(s);
    return (
      <div className={styles.town} data-night={s.phase === 'night'}>
        <SeatRing
          g={g}
          ids={s.seats}
          dim={(id) => s.dead[id]}
          highlight={(id) => (s.vote && id === s.vote.nominee) || (s.block && s.block.id === id)}
          badge={(id) => (
            <>
              {s.dead[id] && !s.ghostVote[id] && <span>{tg(lang, 'ghostTag')}</span>}
              {s.phase === 'vote' && s.vote.votes[id] != null && !secret && <span>✓</span>}
              {s.phase === 'day' && s.lastVote && s.lastVote.votes[id] === 'yes' && !secret && <span>{tg(lang, 'yes')}</span>}
              {s.vizier === id && <Sprite path="clocktower/role-vizier.webp" emoji="" label="" tint="#e9d8ff" shape="icon" size="22px" />}
              {s.over && <span className={styles.roleTag} data-evil={isEvilRole(s.role[id])}>{L(ROLES[s.role[id]], lang)}</span>}
            </>
          )}>
          <div className={styles.clock} aria-hidden="true">
            <Sprite path="clocktower/logo-tb.webp" emoji="" label="" tint="#e9d8ff" shape="icon" size="110px" />
          </div>
          {s.over && (
            <div className={shell.bigText}>
              {tg(lang, s.winner === 'good' ? 'goodWin' : 'evilWin')}
              <p className={shell.muted}>{tg(lang, `why_${s.winWhy}`)}</p>
              {s.heretic && <p className={shell.muted}>{tg(lang, 'heretic')}</p>}
            </div>
          )}
          {s.phase === 'roles' && <div className={shell.bigText}>{tg(lang, 'holdRole')}</div>}
          {s.phase === 'night' && (
            <>
              <p className={shell.kicker}>{tg(lang, 'night', {n: s.night})}</p>
              <div className={shell.bigText}>{tg(lang, s.stage === 'info' ? 'nightInfo' : 'nightAll')}</div>
              {s.stage === 'follow' && s.dilemma && s.dilemma.length > 0 && <p>{tg(lang, 'dilemmaHost', {names: s.dilemma.map(name).join(', ')})}</p>}
              {waiting > 0 && <p className={shell.muted}>{tg(lang, 'waitingPhones', {n: waiting})}</p>}
            </>
          )}
          {s.phase === 'lastword' && <div className={shell.bigText}>{tg(lang, 'lastwordHost')}</div>}
          {s.phase === 'boom' && <div className={shell.bigText}><Sprite path="clocktower/role-boomdandy.webp" emoji="" label="" tint="#e9d8ff" shape="icon" size="48px" /> {tg(lang, 'boomHost')}</div>}
          {s.phase === 'riot' && <div className={shell.bigText}><Sprite path="clocktower/role-riot.webp" emoji="" label="" tint="#e9d8ff" shape="icon" size="48px" /> {tg(lang, 'riotHost')}</div>}
          {s.phase === 'dawn' && (
            <>
              <div className={shell.bigText}>{tg(lang, 'dawn')}</div>
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
              {s.vizier && !s.dead[s.vizier] && <p className={shell.muted}>{tg(lang, 'vizierIs', {name: name(s.vizier)})}</p>}
              {secret && <p className={shell.muted}><Sprite path="clocktower/role-organgrinder.webp" emoji="" label="" tint="#e9d8ff" shape="icon" size="24px" /> {tg(lang, 'secretVote')}</p>}
              {s.block && (
                <p className={styles.block}>
                  {s.block.id ? (secret ? tg(lang, 'onBlockSecret', {name: name(s.block.id)}) : tg(lang, 'onBlock', {name: name(s.block.id), n: s.block.yes})) : tg(lang, 'tieBlock')}
                </p>
              )}
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

/** One piece of night information, in words. */
function InfoLine({x, lang, players}) {
  const nm = (id) => {
    const p = players.find((q) => q.id === id);
    return p ? `${p.name} (#${p.seat})` : '?';
  };
  const role = (k) => (k && ROLES[k] ? L(ROLES[k], lang) : '?');
  const [a, b, c] = (x.players || []).map(nm);
  const vars = {
    a,
    b,
    c,
    name: nm(x.player),
    role: role(x.role || (x.roles && x.roles[0])),
    role2: role(x.roles && x.roles[1]),
    n: x.n,
    answer: tg(lang, x.yes ? 'yesWord' : 'noWord'),
    align: tg(lang, x.yes ? 'evil' : 'good'),
    dir: x.dir ? tg(lang, x.dir) : '',
    roles: x.roles && x.roles.length ? x.roles.map(role).join(', ') : tg(lang, 'nobody'),
    list: x.players && x.players.length ? x.players.map(nm).join(', ') : tg(lang, 'nobody'),
    word: x.word ? L(x.word, lang) : '',
  };
  if (x.key === 'grimoire') {
    return (
      <>
        {tg(lang, 'info_grimoire')}
        <ul className={shell.logList}>
          {x.grim.map(([id, k]) => (
            <li key={id}>
              {nm(id)}: {role(k)}
            </li>
          ))}
        </ul>
      </>
    );
  }
  return <>{tg(lang, `info_${x.key}`, vars)}</>;
}

function PlayerButton({p, on, onClick}) {
  return (
    <button type="button" className="button button--sm" aria-pressed={on} onClick={onClick}>
      <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.seat}. {p.name}
    </button>
  );
}

function ClockPhone({view, lang, send}) {
  const [show, setShow] = useState(false);
  const [picks, setPicks] = useState([]);
  const [character, setCharacter] = useState('');
  const [moon, setMoon] = useState(0);
  const [showPicks, setShowPicks] = useState(false);
  const [pickRole, setPickRole] = useState(null);
  const r = ROLES[view.role];

  const roleBox = (
    <div className={`${shell.card} ${styles.roleBox}`} onPointerDown={() => setShow(true)} onPointerUp={() => setShow(false)} onPointerLeave={() => setShow(false)} onContextMenu={(e) => e.preventDefault()}>
      {show ? (
        <>
          <Token role={view.role} lang={lang} size={96} />
          <p className={styles.teamLine} style={{'--team': TEAM_TINT[r.team]}}>
            <b>{L(r, lang)}</b> · {L(TEAMS[r.team], lang)} · {L(TEAMS[r.team].goal, lang)}
          </p>
          <dl className={styles.roleFacts}>
            <dt>{tg(lang, 'whatYouDo')}</dt>
            <dd className={styles.ability}>{L(r.ab, lang)}</dd>
            <dt>{tg(lang, 'whenWorks')}</dt>
            <dd>{L(WHEN[r.when], lang)}</dd>
            <dt>{tg(lang, 'howToPlay')}</dt>
            <dd>{L(r.tip, lang)}</dd>
          </dl>
          {view.evil && (
            <div>
              {view.evil.hidden && <p>{tg(lang, 'poppyHidden')}</p>}
              {view.evil.demons.length > 0 && (
                <p>
                  {tg(lang, 'yourDemon')}: <b>{view.evil.demons.map((m) => m.name).join(', ')}</b>
                </p>
              )}
              {view.evil.minions.length > 0 && (
                <p>
                  {tg(lang, 'yourMinions')}: <b>{view.evil.minions.map((m) => m.name).join(', ')}</b>
                </p>
              )}
              {view.evil.bluffs && view.evil.bluffs.length > 0 && (
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
                    {tg(lang, 'night', {n: x.night})}: <InfoLine x={x} lang={lang} players={view.players} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className={styles.holdHint}>{tg(lang, 'holdRole')}</p>
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

  const nowKey = {roles: 'now_roles', sleep: 'now_sleep', choose: 'now_choose', info: 'now_info', vote: 'now_vote', voted: 'now_voted', defense: 'now_voted'}[view.kind]
    || (view.kind === 'day' ? (view.dead ? 'now_dead' : 'now_day') : null);
  const nowLine = nowKey && <p className={styles.nowHint}>{tg(lang, nowKey)}</p>;

  function chooseScreen() {
    const c = view.choose;
    if (c.dilemma) {
      return (
        <>
          <p className={shell.bigText}>{tg(lang, 'dilemmaQ')}</p>
          <button type="button" className="button button--block" onClick={() => send({action: 'night', targets: []})}>
            {tg(lang, 'dilemmaLive')}
          </button>
          <button type="button" className="button button--block button--secondary" onClick={() => send({action: 'night', skip: true})}>
            {tg(lang, 'dilemmaDie')}
          </button>
        </>
      );
    }
    const cr = ROLES[c.role];
    const ready = picks.length === c.n && (!c.characters || character);
    const byTeam = c.characters && TEAM_ORDER.map((t) => [t, c.characters.filter((k) => ROLES[k].team === t)]);
    return (
      <>
        <p>
          <b>{c.boom ? tg(lang, 'boomPick') : c.riot ? tg(lang, 'riotPick') : c.lastWish ? tg(lang, 'lastWish') : tg(lang, 'youWake')}</b> {!c.boom && !c.riot && L(cr, lang)}
        </p>
        <p className={styles.ability}>{L(cr.ab, lang)}</p>
        {c.n > 0 && (
          <>
            <p>{tg(lang, 'choose', {n: c.n})}</p>
            <div className={shell.choiceGrid}>
              {c.targets.map((p) => (
                <PlayerButton
                  key={p.id}
                  p={p}
                  on={picks.includes(p.id)}
                  onClick={() => setPicks((list) => (list.includes(p.id) ? list.filter((x) => x !== p.id) : [...list, p.id].slice(-c.n)))}
                />
              ))}
            </div>
          </>
        )}
        {byTeam && (
          <label className={styles.characterPick}>
            {tg(lang, 'nameCharacter')}
            <select value={character} onChange={(e) => setCharacter(e.target.value)}>
              <option value="">—</option>
              {byTeam.map(([t, keys]) => (
                <optgroup key={t} label={L(TEAMS[t], lang)}>
                  {keys.map((k) => (
                    <option key={k} value={k}>
                      <Sprite path={`clocktower/role-${k}.webp`} emoji="" label="" tint="#e9d8ff" shape="icon" size="22px" /> {L(ROLES[k], lang)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
        <button type="button" className="button button--block" disabled={!ready} onClick={() => send({action: 'night', targets: picks, character: character || undefined})}>
          {tg(lang, c.role === 'organgrinder' ? 'grinderYes' : 'confirm')}
        </button>
        {c.optional && (
          <button type="button" className="button button--block button--secondary" onClick={() => send({action: 'night', skip: true})}>
            {tg(lang, 'skip')}
          </button>
        )}
      </>
    );
  }

  function screen() {
    switch (view.kind) {
      case 'roles':
        if (view.options) {
          // Roguelike pick: tap to reveal, choose one card, confirm.
          const chosen = pickRole || view.role;
          return (
            <>
              {!showPicks ? (
                <button type="button" className="button button--block" onClick={() => setShowPicks(true)}>
                  {tg(lang, 'holdRole')}
                </button>
              ) : (
                <>
                  <p>{tg(lang, 'pickOne')}</p>
                  <div className={styles.pickGrid}>
                    {view.options.map((k) => (
                      <button key={k} type="button" className={styles.pickCard} aria-pressed={chosen === k} onClick={() => setPickRole(k)}>
                        <Token role={k} lang={lang} size={64} />
                        <b>{L(ROLES[k], lang)}</b>
                        <small>{L(ROLES[k].ab, lang)}</small>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button type="button" className="button button--block" disabled={!showPicks} onClick={() => send({action: 'ready', pick: chosen})}>
                {tg(lang, 'keepThis')}
              </button>
            </>
          );
        }
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
              <Sprite path="clocktower/role-moonchild.webp" emoji="" label="" tint="#e9d8ff" shape="icon" size="90px" />
            </button>
            <p className={shell.muted}>{tg(lang, 'tapMoon')}</p>
          </>,
        );
      case 'choose':
        return view.choose.byDay ? chooseScreen() : nightShell(chooseScreen());
      case 'info':
        return nightShell(
          <>
            <p>
              <b>{tg(lang, 'youWake')}</b> {L(r, lang)}
            </p>
            {view.callInfo.map((x, i) => (
              <div key={i} className={shell.card}>
                <InfoLine x={x} lang={lang} players={view.players} />
              </div>
            ))}
            <button type="button" className="button button--block" onClick={() => send({action: 'night'})}>
              {tg(lang, 'ok')}
            </button>
          </>,
        );
      case 'over':
        return (
          <>
            <p className={shell.bigText}>{tg(lang, view.winner === 'good' ? 'goodWin' : 'evilWin')}</p>
            <p className={shell.muted}>
              {tg(lang, `why_${view.winWhy}`)} {view.heretic && tg(lang, 'heretic')}
            </p>
            <div className={shell.card}>
              <b>{tg(lang, 'roles')}</b>
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
      case 'vote':
        return (
          <>
            <p className={shell.bigText}>{tg(lang, 'voteQ', {name: view.nominee.name})}</p>
            {view.dead && <p className={shell.notice}>{view.canYes ? tg(lang, 'ghostHas') : tg(lang, 'ghostSpent')}</p>}
            {view.mustYes && <p className={shell.notice}>{tg(lang, 'zealot')}</p>}
            <div className={shell.choiceGrid}>
              <button type="button" className="button button--lg" disabled={!view.canYes} onClick={() => send({action: 'vote', yes: true})}>
                {tg(lang, 'yes')}
              </button>
              <button type="button" className="button button--lg button--secondary" disabled={view.mustYes} onClick={() => send({action: 'vote', yes: false})}>
                {tg(lang, 'no')}
              </button>
            </div>
            {roleBox}
          </>
        );
      default:
        return (
          <>
            {view.dead && <p className={shell.notice}>{tg(lang, 'dead')}</p>}
            {view.kind === 'day' && view.canNominate && (
              <details className={shell.card} open={view.nominees.length <= 16}>
                <summary>
                  <b>{tg(lang, 'nominate')}</b>
                </summary>
                <div className={shell.choiceGrid}>
                  {view.nominees
                    .filter((p) => p.id !== view.me)
                    .map((p) => (
                      <PlayerButton key={p.id} p={p} on={false} onClick={() => send({action: 'nominate', target: p.id})} />
                    ))}
                </div>
              </details>
            )}
            {view.kind === 'day' && !view.canNominate && !view.dead && <p className={shell.muted}>{tg(lang, 'nominated')}</p>}
            {view.powers.map((p) =>
              p.targets ? (
                <details key={p.power} className={shell.card} open={p.power === 'vizier'}>
                  <summary>{tg(lang, `power_${p.power}`, {name: p.targets[0] ? p.targets[0].name : ''})}</summary>
                  <div className={shell.choiceGrid}>
                    {p.targets.map((t) => (
                      <PlayerButton key={t.id} p={t} on={false} onClick={() => send({action: 'power', power: p.power, target: t.id})} />
                    ))}
                  </div>
                </details>
              ) : (
                <button key={p.power} type="button" className="button button--block" onClick={() => send({action: 'power', power: p.power})}>
                  {tg(lang, `power_${p.power}`, {n: p.count || 0})}
                </button>
              ),
            )}
            {view.canSlay && (
              <details className={shell.card}>
                <summary>{tg(lang, 'slay')}</summary>
                <div className={shell.choiceGrid}>
                  {view.players
                    .filter((p) => !p.dead && p.id !== view.me)
                    .map((p) => (
                      <button key={p.id} type="button" className="button button--sm" onClick={() => send({action: 'slay', target: p.id})}>
                        {p.seat}. {p.name}
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

  return (
    <>
      {nowLine}
      {screen()}
    </>
  );
}

export default clocktower;
