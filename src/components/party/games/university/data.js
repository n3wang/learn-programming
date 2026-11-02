/**
 * Clocktower University: roles, campus and the starter skills. The design is
 * the "Clocktower University: Design Plan" doc; wording follows its rules
 * (slay / expel, nothing romantic or sexual).
 */

export const ROLES = {
  student: {side: 'good', emoji: '🎓', art: 'clocktower/role-librarian.webp', en: 'Student', zh: '学生', ab: {en: 'No night action: you do homework all night and spend Knowledge on skills.', zh: '夜晚没有行动：整晚做作业，用知识学习技能。'}, tip: {en: 'Draw information and protection skills, then share what you learn.', zh: '抽取信息和保护技能，然后分享你知道的。'}},
  exchange: {side: 'good', emoji: '🌏', art: 'clocktower/role-recluse.webp', en: 'Exchange Student', zh: '交换生', ab: {en: 'Good, but Professors and skills see you as evil. You earn double Knowledge.', zh: '善良阵营，但教授和技能会把你看成邪恶。你获得双倍知识。'}, tip: {en: 'Spend your extra Knowledge drawing skills that prove you are good.', zh: '用多出的知识抽取能证明你善良的技能。'}},
  professor: {side: 'good', emoji: '🧑‍🏫', art: 'clocktower/role-investigator.webp', en: 'Professor', zh: '教授', ab: {en: 'Each night, investigate one player: learn if they are good or evil.', zh: '每晚调查一名玩家：得知他是善良还是邪恶。'}, tip: {en: 'Demons hunt Professors. Share results, but carefully.', zh: '魔会追杀教授。分享结果，但要小心。'}},
  demon: {side: 'evil', emoji: '🕯️', art: 'clocktower/role-poisoner.webp', en: 'Demon', zh: '魔', ab: {en: 'Each night, investigate one other player in your room: learn if they are a Professor. You know who the Demon King is (the King does not know you).', zh: '每晚调查你房间里的另一名玩家：得知他是否是教授。你知道谁是魔王（魔王不知道你是谁）。'}, tip: {en: 'Find Professors and tip your Demon King without outing yourself.', zh: '找出教授，暗中提示魔王，别暴露自己。'}},
  demonking: {side: 'evil', emoji: '😈', art: 'clocktower/role-imp.webp', en: 'Demon King', zh: '魔王', ab: {en: 'Each night after the first, slay any living player. A locked room stops you unless you sleep there too. You do not know who the Demons are.', zh: '首夜之后每晚可击倒任意存活玩家。上锁的房间能挡住你，除非你也睡在那里。你不知道谁是魔。'}, tip: {en: 'Hide among the Students. If every Demon King is expelled, evil loses.', zh: '藏在学生之中。如果所有魔王都被开除，邪恶失败。'}},
};

export const ACTORS = ['professor', 'demon', 'demonking'];

/**
 * Campus rooms. How many open scales with table size: about 1 per 3 players
 * (2 rooms at 6, 3 at 9), capped at 5. Occupancy is secret by day; at night
 * each phone only shows your own room and who sleeps with you.
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

/** Active room ids for a table of `n` players (min 2, max 5). */
export function roomsFor(n) {
  const k = Math.min(5, Math.max(2, Math.floor(n / 3)));
  return Object.keys(ROOMS).slice(0, k);
}

/**
 * The 12 starter skills. type: night | day | passive. range: self | player
 * (anyone) | roomPlayer (someone in your room) | room (your room) | move (a
 * room to move to). uses: uses before it is spent (0 = unlimited). art: the
 * Clocktower character icon shown for the skill.
 *
 * Balance / wording draft: `0-local_docs/university-skills.md`
 */
/** Flat Knowledge cost to draw 2 skills and keep one. */
export const SPELL_COST = 6;
/** How many unknown skills the draw shows (pick 1). */
export const SPELL_DRAW = 2;

export const SPELLS = {
  protection: {art: 'clocktower/role-monk.webp', emoji: '🛡️', type: 'night', range: 'player', uses: 2, en: 'Protection', zh: '守护', ab: {en: 'They can’t be slain tonight.', zh: '今晚他不会被击倒。'}},
  sanctuary: {art: 'clocktower/role-tealady.webp', emoji: '⛪', type: 'night', range: 'room', uses: 1, en: 'Sanctuary', zh: '圣所', ab: {en: 'Up to 4 players in your room can’t be slain tonight.', zh: '你房间里最多 4 名玩家今晚不会被击倒。'}},
  ignition: {art: 'clocktower/role-slayer.webp', emoji: '🔥', type: 'night', range: 'roomPlayer', uses: 1, en: 'Sudden Ignition', zh: '骤燃', ab: {en: 'A player in your room is slain tonight (protection still stops it).', zh: '你房间里的一名玩家今晚被击倒（守护仍可阻止）。'}},
  secondwind: {art: 'clocktower/role-fool.webp', emoji: '💨', type: 'passive', range: 'self', uses: 1, en: 'Second Wind', zh: '回气', ab: {en: 'The first time you would be slain, you survive.', zh: '你第一次将被击倒时，你会幸存。'}},
  reveal: {art: 'clocktower/role-seamstress.webp', emoji: '🔦', type: 'night', range: 'room', uses: 2, en: 'Reveal Light', zh: '显形之光', ab: {en: 'Learn whether each other player in your room is good or evil.', zh: '得知你房间里每一名其他玩家是善良还是邪恶。'}},
  lantern: {art: 'clocktower/role-empath.webp', emoji: '🏮', type: 'night', range: 'room', uses: 1, en: 'Lantern Count', zh: '灯笼计数', ab: {en: 'Learn how many evil players sleep in your room.', zh: '得知你房间里有几名邪恶玩家。'}},
  flower: {art: 'clocktower/role-flowergirl.webp', emoji: '🌸', type: 'passive', range: 'self', uses: 0, en: 'Flower Watch', zh: '花之守望', ab: {en: 'Every morning, learn whether a Demon King voted yes yesterday.', zh: '每天早上得知昨天是否有魔王投了赞成票。'}},
  loud: {art: 'clocktower/role-towncrier.webp', emoji: '📣', type: 'day', range: 'self', uses: 2, en: 'Loud Voice', zh: '大嗓门', ab: {en: 'Your final expulsion vote counts twice.', zh: '你最终开除票算两票。'}},
  hush: {art: 'clocktower/role-butler.webp', emoji: '🤫', type: 'day', range: 'player', uses: 1, en: 'Hush', zh: '噤声', ab: {en: 'They can’t vote on the final expulsion ballot.', zh: '他不能投最终开除票。'}},
  step: {art: 'clocktower/role-acrobat.webp', emoji: '👣', type: 'night', range: 'move', uses: 2, en: 'Shadow Step', zh: '暗影步', ab: {en: 'Move to another room tonight, after the locks are set (not into a locked room).', zh: '今晚在上锁之后换到另一个房间（不能进入上锁的房间）。'}},
  disguise: {art: 'clocktower/role-spy.webp', emoji: '🎭', type: 'night', range: 'self', uses: 1, en: 'Disguise', zh: '伪装', ab: {en: 'Tonight you look good to every skill and ability.', zh: '今晚所有技能和能力都会把你看成善良。'}},
  gift: {art: 'clocktower/role-sage.webp', emoji: '🎁', type: 'day', range: 'player', uses: 0, en: 'Gift of Knowledge', zh: '知识馈赠', ab: {en: 'Give a player 5 of your Knowledge.', zh: '送给一名玩家 5 点知识。'}},
};

export const GIFT_AMOUNT = 5;
/** Max skills held at once (actives + passive). */
export const MAX_SPELLS = 3;
/** Max night skills queued per night. */
export const MAX_NIGHT_CASTS = 2;
