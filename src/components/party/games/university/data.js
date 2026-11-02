/**
 * Clocktower University: roles, campus and the starter spells. The design is
 * the "Clocktower University: Design Plan" doc; wording follows its rules
 * (slay / expel, nothing romantic or sexual).
 */

export const ROLES = {
  student: {side: 'good', emoji: '🎓', art: 'clocktower/role-librarian.webp', en: 'Student', zh: '学生', ab: {en: 'No night action: you do homework all night and spend Knowledge on spells.', zh: '夜晚没有行动：整晚做作业，用知识购买咒语。'}, tip: {en: 'Buy information and protection, then share what you learn.', zh: '购买信息和保护咒语，然后分享你知道的。'}},
  exchange: {side: 'good', emoji: '🌏', art: 'clocktower/role-recluse.webp', en: 'Exchange Student', zh: '交换生', ab: {en: 'Good, but Professors and spells see you as evil. You earn double Knowledge.', zh: '善良阵营，但教授和咒语会把你看成邪恶。你获得双倍知识。'}, tip: {en: 'Spend your extra Knowledge on spells that prove you are good.', zh: '用多出的知识购买能证明你善良的咒语。'}},
  professor: {side: 'good', emoji: '🧑‍🏫', art: 'clocktower/role-investigator.webp', en: 'Professor', zh: '教授', ab: {en: 'Each night, investigate one player: learn if they are good or evil.', zh: '每晚调查一名玩家：得知他是善良还是邪恶。'}, tip: {en: 'The Cult hunts Professors. Share results, but carefully.', zh: '邪教会追杀教授。分享结果，但要小心。'}},
  cultist: {side: 'evil', emoji: '🕯️', art: 'clocktower/role-poisoner.webp', en: 'Cultist', zh: '邪教徒', ab: {en: 'Each night, investigate one player: learn if they are a Professor. You know the Cult.', zh: '每晚调查一名玩家：得知他是否是教授。你认识整个邪教。'}, tip: {en: 'Find the Professors and point your Cult Leader at them.', zh: '找出教授，告诉你的邪教首领。'}},
  leader: {side: 'evil', emoji: '😈', art: 'clocktower/role-imp.webp', en: 'Cult Leader', zh: '邪教首领', ab: {en: 'Each night after the first, slay one player. A locked room stops you unless you sleep there too.', zh: '首夜之后每晚击倒一名玩家。上锁的房间能挡住你，除非你也睡在那里。'}, tip: {en: 'Hide among the Students. If every Cult Leader is expelled, the Cult loses.', zh: '藏在学生之中。如果所有邪教首领都被开除，邪教失败。'}},
};

export const ACTORS = ['professor', 'cultist', 'leader'];

/**
 * Campus rooms, after the rooms of an old-style university. At most 6; smaller
 * classes use the first few (4 up to 8 players, 5 up to 20, then all 6).
 */
/** Rooms: art = the floor plan drawn for it (room-1…room-6; room-7 is spare). */
export const ROOMS = {
  hall: {art: 'room-1.webp', emoji: '🏛️', en: 'Great Hall', zh: '大礼堂'},
  library: {art: 'room-2.webp', emoji: '📚', en: 'Library', zh: '图书馆'},
  common: {art: 'room-3.webp', emoji: '☕', en: 'Common Room', zh: '公共休息室'},
  dorm: {art: 'room-4.webp', emoji: '🛏️', en: 'Dormitory', zh: '宿舍'},
  lecture: {art: 'room-5.webp', emoji: '📝', en: 'Lecture Theatre', zh: '阶梯教室'},
  chapel: {art: 'room-6.webp', emoji: '🔔', en: 'Chapel', zh: '礼拜堂'},
};

export function roomsFor(n) {
  const k = n <= 8 ? 4 : n <= 20 ? 5 : 6;
  return Object.keys(ROOMS).slice(0, k);
}

/**
 * The 12 starter spells. type: night | day | passive. range: self | player
 * (anyone) | roomPlayer (someone in your room) | room (your room) | move (a
 * room to move to). uses: casts before it is spent (0 = unlimited). art: the
 * Clocktower character icon shown for the spell.
 */
export const SPELLS = {
  protection: {art: 'clocktower/role-monk.webp', emoji: '🛡️', type: 'night', range: 'player', uses: 2, cost: 6, en: 'Protection', zh: '守护', ab: {en: 'They can’t be slain tonight.', zh: '今晚他不会被击倒。'}},
  sanctuary: {art: 'clocktower/role-tealady.webp', emoji: '⛪', type: 'night', range: 'room', uses: 1, cost: 12, en: 'Sanctuary', zh: '圣所', ab: {en: 'Up to 4 players in your room can’t be slain tonight.', zh: '你房间里最多 4 名玩家今晚不会被击倒。'}},
  ignition: {art: 'clocktower/role-slayer.webp', emoji: '🔥', type: 'night', range: 'roomPlayer', uses: 1, cost: 22, en: 'Sudden Ignition', zh: '骤燃', ab: {en: 'A player in your room is slain tonight (protection still stops it).', zh: '你房间里的一名玩家今晚被击倒（守护仍可阻止）。'}},
  secondwind: {art: 'clocktower/role-fool.webp', emoji: '💨', type: 'passive', range: 'self', uses: 1, cost: 14, en: 'Second Wind', zh: '回气', ab: {en: 'The first time you would be slain, you survive.', zh: '你第一次将被击倒时，你会幸存。'}},
  reveal: {art: 'clocktower/role-seamstress.webp', emoji: '🔦', type: 'night', range: 'roomPlayer', uses: 2, cost: 5, en: 'Reveal Light', zh: '显形之光', ab: {en: 'Learn if a player in your room is good or evil.', zh: '得知你房间里一名玩家是善良还是邪恶。'}},
  lantern: {art: 'clocktower/role-empath.webp', emoji: '🏮', type: 'night', range: 'room', uses: 1, cost: 6, en: 'Lantern Count', zh: '灯笼计数', ab: {en: 'Learn how many evil players sleep in your room.', zh: '得知你房间里有几名邪恶玩家。'}},
  flower: {art: 'clocktower/role-flowergirl.webp', emoji: '🌸', type: 'passive', range: 'self', uses: 0, cost: 14, en: 'Flower Watch', zh: '花之守望', ab: {en: 'Every morning, learn whether a Cult Leader voted yes yesterday.', zh: '每天早上得知昨天是否有邪教首领投了赞成票。'}},
  loud: {art: 'clocktower/role-towncrier.webp', emoji: '📣', type: 'day', range: 'self', uses: 2, cost: 4, en: 'Loud Voice', zh: '大嗓门', ab: {en: 'Your vote counts twice on the current nomination.', zh: '你在当前提名上的票算两票。'}},
  hush: {art: 'clocktower/role-butler.webp', emoji: '🤫', type: 'day', range: 'player', uses: 1, cost: 5, en: 'Hush', zh: '噤声', ab: {en: 'They can’t vote on the next nomination.', zh: '他不能对下一次提名投票。'}},
  step: {art: 'clocktower/role-acrobat.webp', emoji: '👣', type: 'night', range: 'move', uses: 2, cost: 4, en: 'Shadow Step', zh: '暗影步', ab: {en: 'Move to another room tonight, after the locks are set (not into a locked room).', zh: '今晚在上锁之后换到另一个房间（不能进入上锁的房间）。'}},
  disguise: {art: 'clocktower/role-spy.webp', emoji: '🎭', type: 'night', range: 'self', uses: 1, cost: 9, en: 'Disguise', zh: '伪装', ab: {en: 'Tonight you look good to every spell and ability.', zh: '今晚所有咒语和能力都会把你看成善良。'}},
  gift: {art: 'clocktower/role-sage.webp', emoji: '🎁', type: 'day', range: 'player', uses: 0, cost: 1, en: 'Gift of Knowledge', zh: '知识馈赠', ab: {en: 'Give a player 5 of your Knowledge.', zh: '送给一名玩家 5 点知识。'}},
};

export const GIFT_AMOUNT = 5;
/** Spells a player may learn in the whole game, and per round (a night and the day after it). */
export const MAX_SPELLS = 3;
export const SPELLS_PER_ROUND = 1;
export const MAX_NIGHT_CASTS = 2;
