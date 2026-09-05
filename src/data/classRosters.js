/** Classroom rosters for the student name randomizer. */

export const ACTIVE_ROSTER_STORAGE_KEY = 'active-class-roster';
export const ACTIVE_ROSTER_CHANGE_EVENT = 'active-class-roster-change';

export const CLASS_ROSTERS = {
  chuyi: {
    id: 'chuyi',
    label: '初一',
    names: [
      '曹迪娜',
      '陈昌煜',
      '陈恩若',
      '陈锦柯',
      '陈丽欣',
      '陈凌薇',
      '陈沛珊',
      '陈诣泽',
      '陈俊昊',
      '何嘉雪',
      '李以初',
      '林艾米',
      '林隽浠',
      '林可忻',
      '林诗涵',
      '林潼潼',
      '林为靖',
      '林妤姗',
      '林子晴',
      '刘俊铄',
      '邱艳丽',
      '王晨馨',
      '伍乐宇',
      '谢丽莎',
      '谢伊凡',
      '熊祖儿',
      '薛嘉烨',
      '严景涵',
      '严孟德',
      '严子杉',
      '杨卓雄',
      '余乐贤',
      '俞泓坤',
      '张曼婷',
      '郑彦兮',
      '周诺凌',
      '周梓鹏',
      '施璟辰',
      '薛昊呈',
    ],
  },
  chuer: {
    id: 'chuer',
    label: '初二',
    names: [
      '严丽莎',
      '何昊喆',
      '何豆豆',
      '俞子言',
      '俞泓彬',
      '张睿洋',
      '林义翔',
      '林子辰',
      '林思',
      '翁志远',
      '董铭松',
      '谢婉晴',
      '郭语诺',
      '陈宇泽',
      '黄国竣',
      '李佳豪',
      '王绎宸',
      '王梓琪',
      '吴启',
      '何晨希',
    ],
  },
  biancheng: {
    id: 'biancheng',
    label: '编程',
    names: [
      '林林星浩',
      '严景涵',
      '任永宇',
      '陈宥泽',
      '陈书圣',
      '李威廉',
      '陈凯文',
      '陈锦轩',
      '郑彦会',
      '陈钰柯',
    ],
  },
};

/** Manual pinyin for characters that are often misread in names. */
export const NAME_PINYIN_OVERRIDES = {
  曹迪娜: 'Cáo Dí nà',
  陈诣泽: 'Chén Yì zé',
  林隽浠: 'Lín Juàn xī',
  林妤姗: 'Lín Yú shān',
  伍乐宇: 'Wǔ Lè yǔ',
  余乐贤: 'Yú Lè xián',
  俞泓坤: 'Yú Hóng kūn',
  俞泓彬: 'Yú Hóng bīn',
  王绎宸: 'Wáng Yì chén',
  林林星浩: 'Lín Lín Xīnghào',
  严景涵: 'Yán Jǐnghán',
  任永宇: 'Rén Yǒngyǔ',
  陈宥泽: 'Chén Yòuzé',
  陈书圣: 'Chén Shūshèng',
  李威廉: 'Lǐ Wēilián',
  陈凯文: 'Chén Kǎiwén',
  陈锦轩: 'Chén Jǐnxuān',
  郑彦会: 'Zhèng Yànhuì',
  陈钰柯: 'Chén Yùkē',
};

/** Rough English approximations for calling names aloud. */
export const NAME_APPROX_OVERRIDES = {
  林林星浩: 'leen leen shing-how',
  严景涵: 'yen jing-hahn',
  任永宇: 'ren yong-yü',
  陈宥泽: 'chən yo-dzuh',
  陈书圣: 'chən shoo-shung',
  李威廉: 'lee way-lyen',
  陈凯文: 'chən kye-wun',
  陈锦轩: 'chən jin-shwen',
  郑彦会: 'jung yen-hway',
  陈钰柯: 'chən yoo-kuh',
};

export function getDefaultRosterId() {
  return Object.keys(CLASS_ROSTERS)[0];
}

export function normalizeRosterId(rosterId) {
  return CLASS_ROSTERS[rosterId] ? rosterId : getDefaultRosterId();
}

export function readStoredRosterId() {
  if (typeof window === 'undefined') {
    return getDefaultRosterId();
  }
  return normalizeRosterId(
    window.localStorage.getItem(ACTIVE_ROSTER_STORAGE_KEY),
  );
}

export function writeStoredRosterId(rosterId) {
  const normalized = normalizeRosterId(rosterId);
  if (typeof window === 'undefined') {
    return normalized;
  }
  window.localStorage.setItem(ACTIVE_ROSTER_STORAGE_KEY, normalized);
  window.dispatchEvent(
    new CustomEvent(ACTIVE_ROSTER_CHANGE_EVENT, {
      detail: {rosterId: normalized},
    }),
  );
  return normalized;
}
