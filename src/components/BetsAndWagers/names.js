/**
 * Pre-made player names like "happy-apple" / "开心熊猫", so a class can play
 * without anyone typing a rude nickname. Every word here is chosen to be
 * harmless in any combination. When the host locks names, the host screen
 * only accepts names built from these lists (see isGeneratedName).
 *
 * English names are "adjective-noun" in lower case, at most 16 characters
 * (8 + 1 + 7), which is also the relay's name limit.
 */

export const NAME_WORDS = {
  en: {
    adjectives: [
      'happy', 'sunny', 'brave', 'calm', 'clever', 'cozy', 'curious', 'gentle', 'jolly', 'kind',
      'lucky', 'merry', 'mighty', 'quick', 'quiet', 'shiny', 'silly', 'smart', 'swift', 'tidy',
      'witty', 'zesty', 'bright', 'bubbly', 'cheery', 'eager', 'fluffy', 'friendly', 'golden', 'proud',
      'speedy', 'cosmic', 'polite', 'snappy', 'sporty', 'rosy', 'breezy', 'dreamy', 'jazzy', 'bouncy',
    ],
    nouns: [
      'apple', 'mango', 'panda', 'otter', 'koala', 'comet', 'rocket', 'pixel', 'maple', 'cloud',
      'river', 'tiger', 'falcon', 'dolphin', 'penguin', 'cactus', 'pebble', 'muffin', 'waffle', 'pretzel',
      'robot', 'planet', 'acorn', 'badger', 'beaver', 'bunny', 'cookie', 'kiwi', 'lemon', 'melon',
      'noodle', 'orbit', 'parrot', 'peach', 'puffin', 'quokka', 'sparrow', 'sprout', 'turtle', 'walrus',
      'zebra', 'bagel', 'carrot', 'daisy', 'fern', 'gecko', 'lotus', 'moose', 'nova', 'tulip',
    ],
  },
  zh: {
    adjectives: [
      '开心', '勇敢', '聪明', '快乐', '安静', '温柔', '活泼', '可爱', '机灵', '阳光',
      '闪亮', '幸运', '淡定', '认真', '热情', '友好', '好奇', '神气', '酷酷', '甜甜',
    ],
    nouns: [
      '苹果', '熊猫', '海豚', '企鹅', '兔子', '松鼠', '星星', '月亮', '火箭', '云朵',
      '小鱼', '橘子', '西瓜', '葡萄', '草莓', '竹子', '蜜蜂', '考拉', '狐狸', '小鹿',
    ],
  },
};

function compose(lang, adjective, noun) {
  return lang === 'zh' ? `${adjective}${noun}` : `${adjective}-${noun}`;
}

/**
 * A random name in the screen's language that nobody in `taken` has yet
 * (compared without case). Falls back to a numbered one if a room somehow
 * uses up every combination.
 */
export function generateName(lang = 'en', taken = [], rng = Math.random) {
  const words = NAME_WORDS[lang] || NAME_WORDS.en;
  const used = new Set(taken.map((name) => String(name).toLowerCase()));
  const pick = (list) => list[Math.floor(rng() * list.length)];
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = compose(lang, pick(words.adjectives), pick(words.nouns));
    if (!used.has(name.toLowerCase())) return name;
  }
  return `${compose(lang, pick(words.adjectives), pick(words.nouns))} ${2 + Math.floor(rng() * 98)}`;
}

/**
 * True for a name built from the lists above in either language, optionally
 * followed by the " 2" the host adds to tell duplicates apart.
 */
export function isGeneratedName(name) {
  const base = String(name || '').replace(/ \d{1,2}$/, '');
  const en = /^([a-z]+)-([a-z]+)$/.exec(base);
  if (en) return NAME_WORDS.en.adjectives.includes(en[1]) && NAME_WORDS.en.nouns.includes(en[2]);
  return NAME_WORDS.zh.adjectives.some(
    (adjective) => base.startsWith(adjective) && NAME_WORDS.zh.nouns.includes(base.slice(adjective.length)),
  );
}

/** Case-fold + trim for kick-block comparisons. */
export function normalizeNameKey(name) {
  return String(name || '').trim().toLowerCase();
}

/** Levenshtein on Unicode code points (so one Chinese character counts as one edit). */
export function editDistance(a, b) {
  const s = Array.from(String(a));
  const t = Array.from(String(b));
  if (Math.abs(s.length - t.length) > 1) return Math.abs(s.length - t.length);
  const rows = s.length + 1;
  const cols = t.length + 1;
  const prev = new Array(cols);
  const cur = new Array(cols);
  for (let j = 0; j < cols; j++) prev[j] = j;
  for (let i = 1; i < rows; i++) {
    cur[0] = i;
    for (let j = 1; j < cols; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < cols; j++) prev[j] = cur[j];
  }
  return prev[t.length];
}

/** True if `wanted` matches a blocked name exactly or with one character of difference. */
export function isBlockedName(wanted, blocked) {
  const w = normalizeNameKey(wanted);
  if (!w || !blocked || !blocked.length) return false;
  return blocked.some((entry) => {
    const k = normalizeNameKey(entry);
    return k && editDistance(w, k) <= 1;
  });
}

/** Append a kicked name to the room's block list (idempotent). */
export function rememberBlockedName(blocked, name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return blocked || [];
  const list = Array.isArray(blocked) ? [...blocked] : [];
  const key = normalizeNameKey(trimmed);
  if (list.some((entry) => normalizeNameKey(entry) === key)) return list;
  list.push(trimmed);
  return list;
}

/** Like generateName, but skip anything near a blocked kick name. */
export function generateUnblockedName(lang = 'en', taken = [], blocked = [], rng = Math.random) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const name = generateName(lang, taken, rng);
    if (!isBlockedName(name, blocked)) return name;
  }
  return generateName(lang, taken, rng);
}
