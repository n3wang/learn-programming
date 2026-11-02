/**
 * City of the Sultan, variant edition: the 20 characters, the districts and
 * the event cards. Rules are in the "City of the Sultan: Variant Rules Plan"
 * doc; card art comes from static/img/party/sultan/ (see assets/party/art.csv).
 *
 * Character: n = call number (null = never called: the Weaver), frame colour
 * (brown | green | blue | gold; gold = Noble), combat and charisma stats.
 */

export const FRAMES = {
  brown: {tint: '#a47a52', en: 'Brown', zh: '棕', price: 1},
  green: {tint: '#5fa055', en: 'Green', zh: '绿', price: 2},
  blue: {tint: '#5a86b8', en: 'Blue', zh: '蓝', price: 3},
  gold: {tint: '#d9a520', en: 'Gold', zh: '金', price: 4},
};

const C = (n, frame, combat, charisma, art, en, zh, ab) => ({n, frame, combat, charisma, art: `sultan/char-${art}.webp`, en, zh, ab});

export const CHARS = {
  citizenA: C(0, 'brown', 2, 0, '00-citizen-a', 'Citizen', '民', {en: 'Gain 1 coin.', zh: '获得 1 金币。'}),
  citizenB: C(0, 'brown', 0, 1, '00-citizen-b', 'Citizen', '民', {en: 'Gain 1 coin.', zh: '获得 1 金币。'}),
  citizenC: C(0, 'brown', 0, 1, '00-citizen-c', 'Citizen', '民', {en: 'Gain 1 coin.', zh: '获得 1 金币。'}),
  citizenD: C(0, 'brown', 0, 1, '00-citizen-d', 'Citizen', '民', {en: 'Gain 1 coin.', zh: '获得 1 金币。'}),
  banditA: C(1, 'brown', 3, 1, '01-bandit-a', 'Bandit', '匪', {en: 'Name a number: those characters skip their turn.', zh: '叫出一个号码：这些角色跳过回合。'}),
  banditB: C(1, 'brown', 4, 0, '01-bandit-b', 'Bandit', '匪', {en: 'Name a number to silence. With both Bandits, take 1 coin from each character that skips.', zh: '叫出一个号码静音。同时控制两个匪时，每个跳过回合的角色给你 1 金币。'}),
  fighter: C(2, 'blue', 5, 1, '02-fighter', 'Fighter', '斗', {en: 'Name a character a player still hides; if right, take 1 of their districts.', zh: '指定仍有隐藏角色的玩家并宣言角色；猜中则夺取其一个区域。'}),
  thief: C(3, 'brown', 2, 3, '03-thief', 'Thief', '盗', {en: 'Name a number: on its turn, take all the coins its owner has.', zh: '叫出一个号码：轮到它时拿走其所有金币。'}),
  king: C(4, 'gold', 4, 5, '04-king', 'King', '王', {en: 'Take the crown. +1 coin per Noble district.', zh: '夺取王冠。每个贵族区 +1 金币。'}),
  mage: C(5, 'green', 2, 4, '05-mage', 'Mage', '法', {en: 'Swap hands with a player, or discard cards and draw that many +1.', zh: '与玩家交换手牌，或弃任意张牌并抽相同数量 +1。'}),
  princess: C(6, 'gold', 1, 6, '06-duchess', 'Princess', '公', {en: '+1 coin per character you control. Reserve an unpicked character for next round, free.', zh: '每控制 1 个角色 +1 金币。指定 1 个未选角色，下轮免费加入手牌。'}),
  official: C(7, 'gold', 2, 5, '07-official', 'Official', '官', {en: 'You and neighbours with a Noble character gain 1 coin. Buy a district for its value +1.', zh: '你与拥有贵族角色的相邻玩家各 +1 金币。可付价值 +1 购买他人区域。'}),
  merchant: C(8, 'green', 0, 5, '08-merchant', 'Merchant', '商', {en: '+1 coin, +1 per Noble character you or neighbours have, +1 per Trade district.', zh: '+1 金币；你与相邻玩家每个贵族角色 +1；每个贸易区 +1。'}),
  priest: C(9, 'blue', 2, 4, '09-priest', 'Priest', '教', {en: 'Once per game, cancel an effect that targets you. +1 coin per Religious district.', zh: '每局一次，取消针对你的效果。每个宗教区 +1 金币。'}),
  general: C(10, 'blue', 4, 2, '10-general', 'General', '将', {en: 'Destroy a district for its value −1. +1 coin per Military district.', zh: '付价值 −1 摧毁一个区域。每个军事区 +1 金币。'}),
  scholar: C(11, 'green', 2, 1, '11-scholar', 'Scholar', '研', {en: 'Invest up to 2 coins in a district (+value). Earn your total investment each turn.', zh: '向一个区域投入最多 2 金币（增加价值）。每回合获得投资总额的金币。'}),
  builder: C(12, 'green', 2, 3, '12-builder', 'Builder', '建', {en: 'Draw 2 extra cards. Build up to 2 districts.', zh: '额外抽 2 张牌。最多建造 2 个区域。'}),
  twins: C(12, 'blue', 3, 3, '12-twins', 'Twins', '双', {en: 'Takes two turns in a row.', zh: '连续进行两次回合。'}),
  lucky: C(13, 'green', 2, 3, '13-lucky', 'Lucky', '幸', {en: 'Pay 1 coin: roll a die, gain the result −1. With the Twins, roll twice.', zh: '付 1 金币掷骰，获得点数 −1。同时控制双则掷两次。'}),
  weaver: C(null, 'green', 1, 4, 'weaver', 'Weaver', '织', {en: 'Revealed with your other character: your abilities work twice this round.', zh: '与你的其他角色一同揭示：本轮你的能力生效两次。'}),
};

/** Extra Citizens for very big tables reuse the four Citizen cards' art and stats. */
export function charOf(key) {
  if (CHARS[key]) return CHARS[key];
  const m = /^citizen(\d+)$/.exec(key);
  return m ? CHARS[['citizenA', 'citizenB', 'citizenC', 'citizenD'][Number(m[1]) % 4]] : null;
}

export const NOBLE_CHARS = ['king', 'official', 'princess'];

/** Character pool by table size (plan: "Characters by player count"). */
const CLASSIC = ['banditA', 'thief', 'mage', 'king', 'priest', 'merchant', 'builder', 'general'];
const STEPS = [
  [6, ['fighter', 'official']],
  [8, ['princess', 'scholar']],
  [10, ['twins', 'lucky']],
  [13, ['banditB', 'citizenA', 'citizenB', 'citizenC', 'citizenD']],
];

export function basePool(n, mode, picks) {
  let list;
  if (mode === 'classic') list = [...CLASSIC];
  else if (mode === 'all') list = Object.keys(CHARS).filter((k) => k !== 'weaver');
  else list = [...CLASSIC, ...STEPS.filter(([min]) => n >= min).flatMap(([, keys]) => keys)];
  // The Weaver only does something next to a second character.
  if (picks >= 2) list.push('weaver');
  return list;
}

export const TYPES = {
  noble: {tint: '#f4c542', en: 'Noble', zh: '贵族'},
  religious: {tint: '#5dade2', en: 'Religious', zh: '宗教'},
  trade: {tint: '#58d68d', en: 'Trade', zh: '贸易'},
  military: {tint: '#ec7063', en: 'Military', zh: '军事'},
  unique: {tint: '#af7ac5', en: 'Unique', zh: '独特'},
};

/** [key, type, cost, copies, en, zh, note?] — art: sultan/district-<key>.webp */
const DISTRICT_LIST = [
  ['temple', 'religious', 1, 3, 'Temple', '神殿'],
  ['church', 'religious', 2, 3, 'Church', '教堂'],
  ['monastery', 'religious', 3, 3, 'Monastery', '修道院'],
  ['cathedral', 'religious', 5, 2, 'Cathedral', '大教堂'],
  ['watchtower', 'military', 1, 3, 'Watchtower', '瞭望塔'],
  ['prison', 'military', 2, 3, 'Prison', '监狱'],
  ['barracks', 'military', 3, 3, 'Barracks', '兵营'],
  ['fortress', 'military', 5, 2, 'Fortress', '要塞'],
  ['manor', 'noble', 3, 5, 'Manor', '庄园'],
  ['castle', 'noble', 4, 4, 'Castle', '城堡'],
  ['palace', 'noble', 5, 3, 'Palace', '宫殿'],
  ['tavern', 'trade', 1, 5, 'Tavern', '酒馆'],
  ['market', 'trade', 2, 4, 'Market', '市场'],
  ['trading-post', 'trade', 2, 3, 'Trading Post', '贸易站'],
  ['docks', 'trade', 3, 3, 'Docks', '码头'],
  ['harbor', 'trade', 4, 3, 'Harbor', '港口'],
  ['town-hall', 'trade', 5, 2, 'Town Hall', '市政厅'],
  ['smithy', 'unique', 5, 1, 'Smithy', '铁匠铺', {en: 'Once per turn: pay 2 coins to draw 3 cards.', zh: '每回合一次：付 2 金币抽 3 张牌。'}],
  ['laboratory', 'unique', 5, 1, 'Laboratory', '实验室', {en: 'Once per turn: discard 1 card to gain 2 coins.', zh: '每回合一次：弃 1 张牌获得 2 金币。'}],
  ['school-of-magic', 'unique', 6, 1, 'School of Magic', '魔法学院', {en: 'Counts as every type when characters earn coins.', zh: '角色按类型获得金币时，视为任意类型。'}],
  ['keep', 'unique', 3, 1, 'Keep', '堡垒', {en: 'Cannot be destroyed.', zh: '不能被摧毁。'}],
  ['dragon-gate', 'unique', 6, 1, 'Dragon Gate', '龙门', {en: '+2 points at the end of the game.', zh: '游戏结束时额外 +2 分。'}],
  ['haunted-quarter', 'unique', 2, 1, 'Haunted Quarter', '鬼街', {en: 'Counts as any one type for the all-types bonus.', zh: '计算五种类型奖励时可视为任意一种类型。'}],
  ['library', 'unique', 6, 1, 'Library', '图书馆', {en: 'When you draw cards to gather, keep them all.', zh: '抽牌收集资源时，全部保留。'}],
  ['map-room', 'unique', 5, 1, 'Map Room', '地图室', {en: '+1 point per card in your hand at the end.', zh: '游戏结束时手中每张牌 +1 分。'}],
  ['imperial-treasury', 'unique', 5, 1, 'Imperial Treasury', '皇家宝库', {en: '+1 point per coin you have at the end.', zh: '游戏结束时每枚金币 +1 分。'}],
  ['statue', 'unique', 3, 1, 'Statue', '雕像', {en: '+5 points if you hold the crown at the end.', zh: '游戏结束时若持有王冠 +5 分。'}],
];

export const DISTRICTS = DISTRICT_LIST;
export const DISTRICT = Object.fromEntries(DISTRICT_LIST.map(([key, type, cost, , en, zh, note]) => [key, {key, type, cost, en, zh, note: note || null, art: `sultan/district-${key}.webp`}]));

export const EVENTS = {
  marriage: {en: 'Marriage', zh: '婚姻', stat: 'charisma', ab: {en: 'Your turn: two revealed characters (one yours) roll die + Charisma. If yours is higher, they marry and are always picked together.', zh: '你的回合：两个已揭示角色（至少一个是你的）各掷骰 + 魅力。你更高则结为伴侣，之后必须一起被选。'}},
  conquest: {en: 'Conquest', zh: '征服', stat: 'combat', ab: {en: 'Your turn: attack a district (resolved at round end). Die + your Combat (+ an ally’s) vs their Combat + the district’s value.', zh: '你的回合：进攻一个区域（回合结束时结算）。骰子 + 你的战斗力（+ 盟友）对比对方战斗力 + 区域价值。'}},
  pyrrhic: {en: 'Pyrrhic', zh: '惨烈', stat: 'combat', ab: {en: 'Before the turns: challenge a player. Bet 1–5 coins, pick champions, roll die + Combat. The loser’s character leaves the game.', zh: '回合开始前：挑战一名玩家。下注 1–5 金币，各选冠军，掷骰 + 战斗力。输方角色永久移出游戏。'}},
  extravagance: {en: 'Extravagance', zh: '丰裕', stat: 'charisma', ab: {en: 'Your turn: take coins equal to your characters’ Charisma from the bank and hand them to other players.', zh: '你的回合：从银行拿等同于你角色魅力总和的金币，分给其他玩家。'}},
};

export const EVENT_ART = {marriage: 'event-marriage', conquest: 'event-conquest', pyrrhic: 'event-tragedy', extravagance: 'event-plenty'};
