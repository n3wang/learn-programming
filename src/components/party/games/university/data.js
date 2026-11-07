/**
 * Clocktower University: roles, campus and skills.
 * Balance draft: `0-local_docs/university-skills.md` + rarity proposal.
 */

export const ROLES = {
  student: {side: 'good', emoji: '🎓', art: 'clocktower/role-librarian.webp', en: 'Student', zh: '学生', ab: {en: 'No night action: you do homework all night and spend Knowledge on skills.', zh: '夜晚没有行动：整晚做作业，用知识学习技能。'}, tip: {en: 'Draw information and protection skills, then share what you learn.', zh: '抽取信息和保护技能，然后分享你知道的。'}},
  exchange: {side: 'good', emoji: '🌏', art: 'clocktower/role-recluse.webp', en: 'Exchange Student', zh: '交换生', ab: {en: 'Good, but Professors and skills see you as evil. You earn double Knowledge.', zh: '善良阵营，但教授和技能会把你看成邪恶。你获得双倍知识。'}, tip: {en: 'Spend your extra Knowledge drawing skills that prove you are good.', zh: '用多出的知识抽取能证明你善良的技能。'}},
  professor: {side: 'good', emoji: '🧑‍🏫', art: 'clocktower/role-investigator.webp', en: 'Professor', zh: '教授', ab: {en: 'Once per night, investigate one other player in your room: you learn instantly if they are good or evil.', zh: '每晚一次，调查你房间里的另一名玩家：立刻得知对方是善良还是邪恶。'}, tip: {en: 'Sleep near suspects. Demons hunt Professors — share carefully.', zh: '睡在可疑的人附近。魔会追杀教授——分享结果要小心。'}},
  demon: {side: 'evil', emoji: '🕯️', art: 'clocktower/role-poisoner.webp', en: 'Demon', zh: '魔', ab: {en: 'On small tables (at or below the host kill threshold): vote who should die (the Demon King sees your votes; with no King, your vote kills). On large tables (above the threshold): slay a roommate. Demon King night-slays cannot kill you. You know who the Demon King is (the King does not know you).', zh: '小桌（存活人数不超过房主设定的击杀阈值）：投票今晚谁该死（魔王可见；若无魔王，你的票直接击倒）。大桌（超过阈值）：击倒一名同房。魔王的夜晚击倒杀不了你。你知道谁是魔王（魔王不知道你是谁）。'}, tip: {en: 'Coordinate the kill vote early, then do homework. In big games, thin your own dorm.', zh: '先投出击杀票，再做作业。大桌时削减自己宿舍的人。'}},
  demonking: {side: 'evil', emoji: '😈', art: 'clocktower/role-imp.webp', en: 'Demon King', zh: '魔王', ab: {en: 'Each night after the first, night-slay any living player except Demons (your cultists are protected from your slay). Room locks do not stop you. On small tables, Demons vote a target for you to see. You do not know who the Demons are.', zh: '首夜之后每晚可夜晚击倒任意存活玩家，但不能击倒魔（邪教徒免疫你的击倒）。房间上锁挡不住你。小桌时魔会投票给你看目标。你不知道谁是魔。'}, tip: {en: 'Pick your kill before homework. Hide among the Students.', zh: '先选击杀目标再做作业。藏在学生之中。'}},
};

export const ACTORS = ['professor', 'demon', 'demonking'];

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

/** Default Knowledge cost to draw 2 skills and keep one (host can set 3 / 6 / 8). */
export const SPELL_COST = 6;
/** How many unknown skills the draw shows (pick 1). */
export const SPELL_DRAW = 2;

/** Pull weights by rarity tier (higher = more common). */
export const RARITY_WEIGHT = {B: 4, A: 2, S: 1};

/**
 * Skills. type: night | day | passive.
 * range: self | player | roomPlayer | randomRoommate | room | move.
 * rarity: B | A | S. uses: charges (0 = unlimited / always-on passive).
 * archetypes: null = any role; else list of role ids that may draw it.
 */
export const SPELLS = {
  // —— existing (all actives 1 use) ——
  lantern: {art: 'clocktower/role-empath.webp', emoji: '🏮', type: 'night', range: 'room', uses: 1, rarity: 'B', en: 'Lantern Count', zh: '灯笼计数', ab: {en: 'Learn how many evil players sleep in your room.', zh: '得知你房间里有几名邪恶玩家。'}},
  step: {art: 'clocktower/role-acrobat.webp', emoji: '👣', type: 'night', range: 'move', uses: 1, rarity: 'B', en: 'Shadow Step', zh: '暗影步', ab: {en: 'Move to another room tonight, after the locks are set (not into a locked room).', zh: '今晚在上锁之后换到另一个房间（不能进入上锁的房间）。'}},
  gift: {art: 'clocktower/role-sage.webp', emoji: '🎁', type: 'day', range: 'player', uses: 1, rarity: 'B', en: 'Gift of Knowledge', zh: '知识馈赠', ab: {en: 'Give a player 5 of your Knowledge.', zh: '送给一名玩家 5 点知识。'}},
  flower: {art: 'clocktower/role-flowergirl.webp', emoji: '🌸', type: 'passive', range: 'self', uses: 0, rarity: 'B', en: 'Flower Watch', zh: '花之守望', ab: {en: 'Every morning, learn whether a Demon King voted yes yesterday.', zh: '每天早上得知昨天是否有魔王投了赞成票。'}},
  protection: {art: 'clocktower/role-monk.webp', emoji: '🛡️', type: 'night', range: 'player', uses: 1, rarity: 'A', en: 'Protection', zh: '守护', ab: {en: 'You or another living player can’t be night-slain tonight (does not stop day expulsion).', zh: '你或另一名存活玩家今晚不会被夜晚击倒（不挡白天开除）。'}},
  ignition: {art: 'clocktower/role-slayer.webp', emoji: '🔥', type: 'night', range: 'roomPlayer', uses: 1, rarity: 'A', en: 'Sudden Ignition', zh: '骤燃', ab: {en: 'A player in your room is night-slain tonight (night protection still stops it).', zh: '你房间里的一名玩家今晚被夜晚击倒（夜晚守护仍可阻止）。'}},
  disguise: {art: 'clocktower/role-spy.webp', emoji: '🎭', type: 'night', range: 'self', uses: 1, rarity: 'A', en: 'Disguise', zh: '伪装', ab: {en: 'Tonight you look good to every skill and ability.', zh: '今晚所有技能和能力都会把你看成善良。'}},
  loud: {art: 'clocktower/role-towncrier.webp', emoji: '📣', type: 'day', range: 'self', uses: 1, rarity: 'A', en: 'Loud Voice', zh: '大嗓门', ab: {en: 'Your final expulsion vote counts twice.', zh: '你最终开除票算两票。'}},
  hush: {art: 'clocktower/role-butler.webp', emoji: '🤫', type: 'day', range: 'player', uses: 1, rarity: 'A', en: 'Hush', zh: '噤声', ab: {en: 'They can’t vote on the final expulsion ballot.', zh: '他不能投最终开除票。'}},
  secondwind: {art: 'clocktower/role-fool.webp', emoji: '💨', type: 'passive', range: 'self', uses: 1, rarity: 'A', en: 'Second Wind', zh: '回气', ab: {en: 'The first night-slay on you fails (does not stop day expulsion).', zh: '第一次夜晚击倒对你失败（不挡白天开除）。'}},
  sanctuary: {art: 'clocktower/role-tealady.webp', emoji: '⛪', type: 'night', range: 'room', uses: 1, rarity: 'S', en: 'Sanctuary', zh: '圣所', ab: {en: 'Up to 4 players in your room can’t be night-slain tonight (not expulsion).', zh: '你房间里最多 4 名玩家今晚不会被夜晚击倒（不挡开除）。'}},
  reveal: {art: 'clocktower/role-seamstress.webp', emoji: '🔦', type: 'night', range: 'room', uses: 1, rarity: 'S', en: 'Reveal Light', zh: '显形之光', ab: {en: 'Learn whether each other player in your room is good or evil.', zh: '得知你房间里每一名其他玩家是善良还是邪恶。'}},

  // —— open pool ——
  chamber: {art: 'clocktower/role-chambermaid.webp', emoji: '🚪', type: 'night', range: 'randomRoommate', uses: 1, rarity: 'B', en: 'Same Dorm', zh: '同寝', ab: {en: 'Learn the side of a random other player in your room.', zh: '得知你房间里一名随机其他玩家的阵营。'}},
  knight: {art: 'clocktower/role-knight.webp', emoji: '🗡️', type: 'night', range: 'roomPlayer', uses: 1, rarity: 'B', en: 'Tainted Wing', zh: '污翼', ab: {en: 'Pick someone in your room: if they are a Demon, they are slain; otherwise you are slain.', zh: '选择同房一人：若是魔则击倒对方，否则击倒你自己。'}},
  raven: {art: 'clocktower/role-ravenkeeper.webp', emoji: '🐦‍⬛', type: 'passive', range: 'self', uses: 1, rarity: 'A', en: 'Last Glimpse', zh: '临终一瞥', ab: {en: 'When slain: learn the names of others in the killer’s room.', zh: '被击倒时：得知凶手房间里其他人的名字。'}},
  soldier: {art: 'clocktower/role-soldier.webp', emoji: '🪖', type: 'passive', range: 'self', uses: 1, rarity: 'A', en: 'Iron Student', zh: '铁生', ab: {en: 'The first Demon King night-slay on you fails (not day expulsion).', zh: '魔王第一次夜晚击倒对你失败（不挡白天开除）。'}},
  // Self-protection vs night-slay only (day vote / expulsion is separate — see Devil’s Pardon)
  nightwatch: {art: 'clocktower/role-nightwatchman.webp', emoji: '🕯️', type: 'night', range: 'self', uses: 1, rarity: 'B', en: 'Night Watch', zh: '守夜', ab: {en: 'You can’t be night-slain tonight (does not stop day expulsion).', zh: '今晚你不会被夜晚击倒（不挡白天开除）。'}},
  dormplate: {art: 'clocktower/role-innkeeper.webp', emoji: '🛏️', type: 'passive', range: 'self', uses: 1, rarity: 'B', en: 'Dorm Armor', zh: '寝甲', ab: {en: 'The first non–Demon King night-slay on you fails (Demon roommate kills, Ignition, etc.). Not expulsion.', zh: '第一次非魔王夜晚击倒对你失败（魔同房击杀、骤燃等）。不挡开除。'}},
  allnighter: {art: 'clocktower/role-sailor.webp', emoji: '☕', type: 'night', range: 'self', uses: 1, rarity: 'A', en: 'All-Nighter', zh: '通宵', ab: {en: 'You can’t be night-slain tonight (not day expulsion).', zh: '今晚你不会被夜晚击倒（不挡白天开除）。'}},
  golemhide: {art: 'clocktower/role-golem.webp', emoji: '🪨', type: 'passive', range: 'self', uses: 1, rarity: 'A', en: 'Stone Skin', zh: '石肤', ab: {en: 'The first night-slay on you while alone in your room fails (not expulsion).', zh: '你独自在房时第一次夜晚击倒失败（不挡开除）。'}},
  banshee: {art: 'clocktower/role-banshee.webp', emoji: '👻', type: 'passive', range: 'self', uses: 1, rarity: 'A', en: 'Ghost Ballot', zh: '鬼票', ab: {en: 'Once after you die, cast one extra final-ballot vote as a ghost.', zh: '你死后可额外投一次最终开除票（幽灵票）。'}},
  advocate: {art: 'clocktower/role-devilsadvocate.webp', emoji: '⚖️', type: 'day', range: 'randomRoommate', uses: 1, rarity: 'B', en: 'Devil’s Pardon', zh: '赦免', ab: {en: 'Day only: a random roommate cannot be expelled by vote today (does not stop night-slays).', zh: '仅白天：随机同房一人今天不能被投票开除（不挡夜晚击倒）。'}},
  fortune: {art: 'clocktower/role-fortuneteller.webp', emoji: '🔮', type: 'night', range: 'self', uses: 1, rarity: 'B', en: 'Twin Probe', zh: '双探', ab: {en: 'Need ≥2 other roommates: is either a Demon?', zh: '需要至少 2 名其他同房：其中是否有魔？'}},

  // —— student ——
  philosopher: {art: 'clocktower/role-philosopher.webp', emoji: '🪑', type: 'night', range: 'randomRoommate', uses: 1, rarity: 'A', archetypes: ['student'], en: 'Guest Chair', zh: '客座', ab: {en: 'Once act as Professor: learn good/evil of a random roommate.', zh: '一次性扮演教授：得知随机同房的善恶。'}},

  // —— exchange ——
  drunk: {art: 'clocktower/role-drunk.webp', emoji: '🍺', type: 'night', range: 'randomRoommate', uses: 1, rarity: 'B', archetypes: ['exchange'], en: 'Tipsy Alibi', zh: '醉辩', ab: {en: 'Learn the true side of a random roommate (ignores disguise).', zh: '得知随机同房的真实阵营（无视伪装）。'}},
  recluseveil: {art: 'clocktower/role-magician.webp', emoji: '🪄', type: 'night', range: 'self', uses: 1, rarity: 'S', archetypes: ['exchange'], en: 'Deep Cover', zh: '深潜', ab: {en: 'Tonight role actions treat you as a normal good Student.', zh: '今晚角色行动会把你当成普通善良学生。'}},

  // —— professor ——
  washer: {art: 'clocktower/role-washerwoman.webp', emoji: '🧼', type: 'night', range: 'self', uses: 1, rarity: 'B', archetypes: ['professor'], en: 'Office Hours', zh: '答疑', ab: {en: 'Two names from your room; one is a Demon — or “no Demon here”.', zh: '给出同房两个名字，其中一个是魔——或“这里没有魔”。'}},
  exorcist: {art: 'clocktower/role-exorcist.webp', emoji: '✝️', type: 'night', range: 'randomRoommate', uses: 1, rarity: 'S', archetypes: ['professor'], en: 'Banishing Strike', zh: '驱魔一击', ab: {en: 'If a random roommate is a Demon, they are slain immediately.', zh: '若随机同房是魔，立即击倒对方。'}},

  // —— demon ——
  poisonroom: {art: 'clocktower/role-widow.webp', emoji: '☠️', type: 'night', range: 'randomRoommate', uses: 1, rarity: 'B', archetypes: ['demon'], en: 'Tainted Dorm', zh: '污寝', ab: {en: 'A random roommate: alignment / Professor reads flip wrong tonight.', zh: '随机同房：今晚阵营/教授读取结果颠倒。'}},
  godfather: {art: 'clocktower/role-godfather.webp', emoji: '🕶️', type: 'passive', range: 'self', uses: 1, rarity: 'S', archetypes: ['demon'], en: 'Fall Guy', zh: '替罪', ab: {en: 'The first time a Demon King would be expelled, you die instead.', zh: '魔王第一次将被开除时，改为你死。'}},
  scarlet: {art: 'clocktower/role-scarletwoman.webp', emoji: '👑', type: 'passive', range: 'self', uses: 1, rarity: 'A', archetypes: ['demon'], en: 'Heir', zh: '继位', ab: {en: 'If a Demon King dies and ≥5 live, you become Demon King (still blind to Demons).', zh: '若魔王死亡且场上≥5人存活，你成为魔王（仍不知其他魔）。'}},

  // —— demon king ——
  fear: {art: 'clocktower/role-fearmonger.webp', emoji: '😱', type: 'day', range: 'randomRoommate', uses: 1, rarity: 'B', archetypes: ['demonking'], en: 'Fear Mark', zh: '恐惧标记', ab: {en: 'Mark a random roommate; if they are not expelled today, learn whether they are good or evil.', zh: '标记随机同房；若今天未被开除，得知其善恶。'}},
  ojo: {art: 'clocktower/role-ojo.webp', emoji: '👁️', type: 'night', range: 'randomRoommate', uses: 1, rarity: 'A', archetypes: ['demonking'], en: 'Named Prey', zh: '点名猎物', ab: {en: 'Tonight’s slay ignores locks only if the target is that roommate (you see the name when casting).', zh: '今晚击倒仅在目标为该同房时无视上锁（施放时可见其名）。'}},

  // —— evil either ——
  noDashii: {art: 'clocktower/role-nodashii.webp', emoji: '🐍', type: 'night', range: 'self', uses: 1, rarity: 'B', archetypes: ['demon', 'demonking'], en: 'Hall Poison', zh: '廊毒', ab: {en: 'Everyone else in your room gets false alignment if read tonight.', zh: '今晚读取你房间里其他人的阵营结果全部颠倒。'}},
};

export const GIFT_AMOUNT = 5;
/** Max skills held at once (actives + passive). */
export const MAX_SPELLS = 3;
/** Max night skills queued per night. */
export const MAX_NIGHT_CASTS = 2;
