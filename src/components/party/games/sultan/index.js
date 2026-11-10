import React, {useState} from 'react';
import {L, makeT} from '../../core/strings';
import SeatRing from '../../core/SeatRing';
import Sprite from '../../core/Sprite';
import {Avatar} from '@site/src/components/BetsAndWagers/ui';
import {CHARS, DISTRICT, EVENTS, EVENT_ART, FRAMES, TYPES, basePool, charOf} from './data';
import {
  acting,
  answer,
  canBuild,
  canPick,
  canUseEvent,
  challenge,
  draftPick,
  generalTargets,
  hiddenPlayers,
  nameableNumbers,
  officialTargets,
  ownerOf,
  picksLeft,
  setupSultan,
  settingsOf,
  timeout,
  turnAction,
  valueOf,
} from './rules';
import {botMove} from './bot';
import shell from '../../core/party.module.css';
import styles from './sultan.module.css';

const tg = makeT({
  en: {
    round: 'Round {n}',
    goal: 'Goal: {n} districts',
    lastRound: 'A city is complete. This is the final round!',
    drafting: 'Choosing characters in secret…',
    pickChar: 'Pick a character ({n} left)',
    waitDraft: 'Waiting for your turn to choose…',
    calling: 'Calling number {n}',
    silencedAll: 'Silenced: no turn this round.',
    conquests: 'Conquests…',
    pyrrhicOpen: 'Pyrrhic: anyone with a matching character may challenge now.',
    challengeWho: 'Challenge a player to a duel',
    skip: 'Not this round',
    yourTurn: 'Your turn: {name}',
    income: 'Gather',
    takeGold: 'Take 2 coins',
    takeCards: 'Draw 2, keep 1',
    keepOne: 'Keep one card',
    build: 'Build ({n} left)',
    endTurn: 'End turn',
    endFirst: 'End first turn (the Twins go again)',
    hand: 'Your hand',
    city: 'Your city',
    yourChars: 'Your characters',
    tapPreview: 'Tap a card to preview',
    closePreview: 'Close',
    pickThis: 'Pick this character',
    keepThis: 'Keep this card',
    buildThis: 'Build this district',
    type: 'Type',
    cost: 'Cost',
    number: 'Number',
    frame: 'Colour',
    gold: '{n} coins',
    ability: 'Ability',
    abilityLeft: 'Ability ({n} left)',
    nameNumber: 'Name a number',
    guessWho: 'Which player?',
    guessWhat: 'Which character do they hide?',
    stealPick: 'Right! Take one of their districts:',
    swapWith: 'Swap hands with…',
    redraw: 'Discard and redraw (+1)',
    reserve: 'Reserve for next round',
    buy: 'Buy a district (value +1)',
    destroy: 'Destroy a district (value −1)',
    invest: 'Invest in a district',
    gamble: 'Pay 1 and roll',
    smithy: 'Smithy: pay 2, draw 3',
    lab: 'Laboratory: discard 1 for 2 coins',
    events: 'Event cards',
    eventNeeds: 'Needs a {frame} character · {price} coins',
    marry: 'Marriage: date with…',
    conquer: 'Conquest: attack a district',
    ally: 'Ask an ally (optional)',
    noAlly: 'No ally',
    offer: 'Offer the ally {n} coins',
    extravagance: 'Extravagance: give away {n} coins',
    give: 'Give',
    toGive: '{n} left to give',
    waiting: 'Waiting…',
    nobodyCalled: 'Waiting for your character to be called.',
    turnDone: 'Your turns are done. Watch the others.',
    final: 'Final scores',
    points: '{n} pts',
    value: 'value {n}',
    combat: 'Combat',
    charisma: 'Charisma',
    married: 'married to {name}',
    waitFor: 'Waiting for {name}…',
    p_shield: '{name} targets you ({what}). Use the Priest’s shield? (once per game)',
    p_raise: '{name} challenges you to a duel! Raise the bet (up to {max})',
    p_champion: 'Choose your champion',
    p_date: '{name}’s {mine} asks your {other} on a date. Agree (free), or refuse (they pay you 1 coin)?',
    p_ally: '{name} asks you to lend your characters for a Conquest, for {n} coins.',
    yes: 'Yes',
    no: 'No',
    agree: 'Agree',
    refuse: 'Refuse',
    accept: 'Lend them',
    useShield: 'Use the shield',
    noShield: 'Let it happen',
    eff_steal: 'take a district',
    eff_swap: 'swap hands',
    eff_destroy: 'destroy a district',
    eff_buy: 'buy a district',
    eff_conquest: 'conquer a district',
    eff_pyrrhic: 'a Pyrrhic duel',
    bet: 'Bet {n}',
    poolLine: '{n} players: {chars} characters, {picks} pick(s) each',
    s_pool: 'Character pool',
    s_auto: 'Auto',
    s_classic: 'Classic 8',
    s_all: 'All 20',
    s_picks: 'Picks per round',
    s_events: 'Stat events (Combat & Charisma)',
    s_off: 'Off',
    s_on: 'On',
    s_goal: 'City size',
    s_timer: 'Turn timer',
    sec: '{n} s',
    log_built: 'built {x}',
    log_destroyed: 'destroyed {who}’s {x}',
    log_robbed: 'robbed {who}: +{n}',
    log_silenced: 'was silenced',
    log_swap: 'swapped hands with {who}',
    log_named: 'named {n}',
    log_guess: 'guessed {who}: {x} ({ok})',
    log_stole: 'took {who}’s {x}',
    log_bought: 'bought {who}’s {x}',
    log_shield: 'raised the Priest’s shield',
    log_married: '{x} married {y}',
    log_date_failed: '{x}’s date with {y} failed',
    log_conquer: 'marched on {who}’s {x}',
    log_conquered: 'conquered {who}’s {x}',
    log_held: 'held {x}',
    log_challenge: 'challenged {who}',
    log_duel: 'won the duel: {x} is gone',
    log_extravagance: 'gave away {n} coins',
    log_reserved: 'reserved a character',
    log_gamble: 'gambled: +{n}',
    right: 'right',
    wrong: 'wrong',
    legacy: 'This game was saved by the old edition. End it and start a new one.',
  },
  zh: {
    round: '第 {n} 轮',
    goal: '目标：{n} 个区域',
    lastRound: '有一座城已经建成，这是最后一轮！',
    drafting: '秘密挑选角色中……',
    pickChar: '挑选角色（还剩 {n} 个）',
    waitDraft: '等待轮到你挑选……',
    calling: '传召 {n} 号',
    silencedAll: '被静音：本轮没有回合。',
    conquests: '征服结算……',
    pyrrhicOpen: '惨烈：拥有对应颜色角色的玩家现在可以发起挑战。',
    challengeWho: '向一名玩家发起决斗',
    skip: '本轮不用',
    yourTurn: '轮到你：{name}',
    income: '收集资源',
    takeGold: '拿 2 金币',
    takeCards: '抽 2 张留 1 张',
    keepOne: '留下一张',
    build: '建造（还能建 {n} 个）',
    endTurn: '结束回合',
    endFirst: '结束第一回合（双再来一次）',
    hand: '你的手牌',
    city: '你的城市',
    yourChars: '你的角色',
    tapPreview: '点卡片可预览',
    closePreview: '关闭',
    pickThis: '选择这个角色',
    keepThis: '留下这张牌',
    buildThis: '建造这个区域',
    type: '类型',
    cost: '费用',
    number: '号码',
    frame: '颜色',
    gold: '{n} 金币',
    ability: '能力',
    abilityLeft: '能力（还可用 {n} 次）',
    nameNumber: '叫出一个号码',
    guessWho: '指定哪位玩家？',
    guessWhat: '他藏着哪个角色？',
    stealPick: '猜中了！拿走他的一个区域：',
    swapWith: '和谁交换手牌……',
    redraw: '弃牌重抽（+1）',
    reserve: '预留到下一轮',
    buy: '购买区域（价值 +1）',
    destroy: '摧毁区域（价值 −1）',
    invest: '投资一个区域',
    gamble: '付 1 金币掷骰',
    smithy: '铁匠铺：付 2 抽 3',
    lab: '实验室：弃 1 张得 2 金币',
    events: '事件牌',
    eventNeeds: '需要{frame}色角色 · {price} 金币',
    marry: '婚姻：和谁约会……',
    conquer: '征服：进攻一个区域',
    ally: '请求盟友（可选）',
    noAlly: '不要盟友',
    offer: '给盟友 {n} 金币',
    extravagance: '丰裕：送出 {n} 金币',
    give: '送',
    toGive: '还剩 {n} 金币要送',
    waiting: '等待中……',
    nobodyCalled: '等待你的角色被传召。',
    turnDone: '你的回合结束了，看看其他人。',
    final: '最终得分',
    points: '{n} 分',
    value: '价值 {n}',
    combat: '战斗力',
    charisma: '魅力',
    married: '与{name}结为伴侣',
    waitFor: '等待{name}……',
    p_shield: '{name}针对你（{what}）。使用教的护盾吗？（每局一次）',
    p_raise: '{name}向你发起决斗！加注（最多 {max}）',
    p_champion: '选择你的冠军',
    p_date: '{name}的{mine}邀请你的{other}约会。同意（免费），还是拒绝（对方付你 1 金币）？',
    p_ally: '{name}请你借出角色参与征服，报酬 {n} 金币。',
    yes: '是',
    no: '否',
    agree: '同意',
    refuse: '拒绝',
    accept: '借给他',
    useShield: '使用护盾',
    noShield: '不用',
    eff_steal: '夺取区域',
    eff_swap: '交换手牌',
    eff_destroy: '摧毁区域',
    eff_buy: '购买区域',
    eff_conquest: '征服区域',
    eff_pyrrhic: '惨烈决斗',
    bet: '下注 {n}',
    poolLine: '{n} 人：{chars} 个角色，每人选 {picks} 个',
    s_pool: '角色池',
    s_auto: '自动',
    s_classic: '经典 8 个',
    s_all: '全部 20 个',
    s_picks: '每轮选几个',
    s_events: '属性事件（战斗力与魅力）',
    s_off: '关闭',
    s_on: '开启',
    s_goal: '城市规模',
    s_timer: '回合时间',
    sec: '{n} 秒',
    log_built: '建造了{x}',
    log_destroyed: '摧毁了{who}的{x}',
    log_robbed: '洗劫了{who}：+{n}',
    log_silenced: '被静音了',
    log_swap: '和{who}交换了手牌',
    log_named: '叫出了 {n} 号',
    log_guess: '猜{who}藏着{x}（{ok}）',
    log_stole: '夺走了{who}的{x}',
    log_bought: '买下了{who}的{x}',
    log_shield: '举起了教的护盾',
    log_married: '{x}与{y}结为伴侣',
    log_date_failed: '{x}与{y}的约会失败了',
    log_conquer: '进军{who}的{x}',
    log_conquered: '征服了{who}的{x}',
    log_held: '守住了{x}',
    log_challenge: '向{who}发起决斗',
    log_duel: '赢得决斗：{x}离开了游戏',
    log_extravagance: '送出了 {n} 金币',
    log_reserved: '预留了一个角色',
    log_gamble: '赌了一把：+{n}',
    right: '猜中',
    wrong: '没猜中',
    legacy: '这局游戏来自旧版本。请结束并开始新游戏。',
  },
});

const VOICE = {
  welcome: {en: 'Welcome to the City of the Sultan, land of gold and dunes.', zh: '欢迎来到苏丹之城，黄金与沙丘之地。'},
  round_start: {en: 'The palace drums sound. A new round begins.', zh: '宫殿的鼓声响起，新的一轮开始了。'},
  draft: {en: 'Choose your characters, in secret.', zh: '请秘密挑选你的角色。'},
  call_0: {en: 'The citizens wake.', zh: '平民醒来。'},
  call_1: {en: 'Number one… the bandits!', zh: '一号……匪！'},
  call_2: {en: 'Number two… the fighter!', zh: '二号……斗士！'},
  call_3: {en: 'Number three… the thief!', zh: '三号……盗贼！'},
  call_4: {en: 'Number four… the king!', zh: '四号……国王！'},
  call_5: {en: 'Number five… the mage!', zh: '五号……法师！'},
  call_6: {en: 'Number six… the princess!', zh: '六号……公主！'},
  call_7: {en: 'Number seven… the official!', zh: '七号……官员！'},
  call_8: {en: 'Number eight… the merchant!', zh: '八号……商人！'},
  call_9: {en: 'Number nine… the priest!', zh: '九号……教士！'},
  call_10: {en: 'Number ten… the general!', zh: '十号……将军！'},
  call_11: {en: 'Number eleven… the scholar!', zh: '十一号……学者！'},
  call_12: {en: 'Number twelve… the builder, and the twins!', zh: '十二号……建筑师，还有双子！'},
  call_13: {en: 'Number thirteen… the lucky one!', zh: '十三号……幸运儿！'},
  silenced: {en: '…Silence. No one may answer.', zh: '……寂静。无人能应召。'},
  robbed: {en: 'The purse is empty! The thief strikes.', zh: '钱袋空了！盗贼得手了。'},
  build_noble: {en: 'A noble house rises.', zh: '一座贵族宅邸落成。'},
  build_religious: {en: 'A house of worship rises.', zh: '一座圣殿落成。'},
  build_trade: {en: 'A market rises.', zh: '一座集市落成。'},
  build_military: {en: 'A fortress rises.', zh: '一座堡垒落成。'},
  build_unique: {en: 'A wonder rises!', zh: '一座奇观落成！'},
  destroyed: {en: 'The general’s army tears a district down.', zh: '将军的军队推倒了一个区域。'},
  crown_moves: {en: 'The crown changes hands.', zh: '王冠易主。'},
  last_round: {en: 'The first city is complete! This is the final round.', zh: '第一座城已经建成！这是最后一轮。'},
  winner: {en: 'The legend of the Sultan’s city belongs to {seat}.', zh: '苏丹之城的传奇，属于{seat}。'},
  pyrrhic_open: {en: 'Is there a challenger? Speak now.', zh: '有人要发起挑战吗？现在说。'},
  pyrrhic: {en: 'A duel! Place your bets.', zh: '决斗！下注吧。'},
  duel_end: {en: 'The duel is over. One leaves the city forever.', zh: '决斗结束。有人永远离开了这座城。'},
  shield: {en: 'The priest raises a shield!', zh: '教士举起了护盾！'},
  married: {en: 'Wedding bells! Two hearts are joined.', zh: '婚礼的钟声响起！两颗心结合了。'},
  conquered: {en: 'The gates fall. A district changes hands.', zh: '城门失守，一个区域易主。'},
  extravagance: {en: 'Coins rain on the city!', zh: '金币如雨洒满全城！'},
  twins_again: {en: 'The twins go again!', zh: '双子再来一次！'},
};

// ------------------------------------------------------------------ art

const charName = (k, lang) => {
  const c = charOf(k);
  return c ? `${c.n == null ? '–' : c.n} · ${lang === 'zh' ? c.zh : c.en}` : '?';
};

/** "ATK 4 · CHA 5" (Combat, Charisma). */
const statLine = (c, lang) => (lang === 'zh' ? `战 ${c.combat} · 魅 ${c.charisma}` : `ATK ${c.combat} · CHA ${c.charisma}`);

function CharCard({k, lang, size = 64, stats = false}) {
  const c = charOf(k);
  if (!c) return null;
  return (
    <span className={styles.charWrap}>
      <Sprite path={c.art} emoji={c.zh} label={charName(k, lang)} tint={FRAMES[c.frame].tint} shape="tall" size={`${size}px`} />
      {stats && (
        <span className={styles.statBadge}>{statLine(c, lang)}</span>
      )}
    </span>
  );
}

function DistrictCard({k, lang, size = 60, invest = 0}) {
  const d = DISTRICT[k];
  return (
    <span className={styles.charWrap} title={d.note ? L(d.note, lang) : ''}>
      <Sprite path={d.art} emoji="🏛️" label={`${L(d, lang)} · ${d.cost}`} tint={TYPES[d.type].tint} size={`${size}px`} />
      {invest > 0 && <span className={styles.statBadge}>+{invest}</span>}
    </span>
  );
}

function EventCard({ev, lang, size = 56}) {
  return <Sprite path={`sultan/${EVENT_ART[ev.kind]}-${ev.frame}.webp`} emoji="📜" label={L(EVENTS[ev.kind], lang)} tint={FRAMES[ev.frame].tint} shape="tall" size={`${size}px`} />;
}

/** Full-card peek: large art + side text. Optional `action` runs a pick/build/keep. */
function CardInspect({item, lang, onClose}) {
  if (!item) return null;
  let art = null;
  let title = '';
  let rows = [];
  let ability = '';
  if (item.kind === 'char') {
    const c = charOf(item.key);
    if (!c) return null;
    art = <CharCard k={item.key} lang={lang} size={168} stats />;
    title = charName(item.key, lang);
    rows = [
      [tg(lang, 'number'), c.n == null ? '–' : String(c.n)],
      [tg(lang, 'frame'), L(FRAMES[c.frame], lang)],
      [tg(lang, 'combat'), String(c.combat)],
      [tg(lang, 'charisma'), String(c.charisma)],
    ];
    ability = L(c.ab, lang);
    if (item.married) ability = `${ability}\n${tg(lang, 'married', {name: charName(item.married, lang)})}`;
  } else if (item.kind === 'district') {
    const d = DISTRICT[item.key];
    if (!d) return null;
    art = <DistrictCard k={item.key} lang={lang} size={150} invest={item.invest || 0} />;
    title = L(d, lang);
    rows = [
      [tg(lang, 'type'), L(TYPES[d.type], lang)],
      [tg(lang, 'cost'), String(d.cost)],
    ];
    if (item.invest > 0) rows.push([tg(lang, 'value', {n: d.cost + item.invest}), '']);
    ability = d.note ? L(d.note, lang) : '';
  } else if (item.kind === 'event') {
    const ev = EVENTS[item.key];
    if (!ev) return null;
    art = <EventCard ev={{kind: item.key, frame: item.frame}} lang={lang} size={150} />;
    title = L(ev, lang);
    rows = [
      [tg(lang, 'frame'), L(FRAMES[item.frame], lang)],
      [tg(lang, 'ability'), tg(lang, ev.stat === 'combat' ? 'combat' : 'charisma')],
    ];
    ability = L(ev.ab, lang);
  }
  return (
    <div className={styles.inspectScrim} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={styles.inspectPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inspectArt}>{art}</div>
        <div className={styles.inspectText}>
          <h3 className={styles.inspectTitle}>{title}</h3>
          <dl className={styles.inspectMeta}>
            {rows.map(([label, value], i) =>
              value === '' && !label ? null : (
                <div key={i} className={styles.inspectRow}>
                  <dt>{label}</dt>
                  {value !== '' && <dd>{value}</dd>}
                </div>
              ),
            )}
          </dl>
          {ability && <p className={styles.inspectAbility}>{ability}</p>}
          <div className={styles.inspectActions}>
            {item.action && (
              <button
                type="button"
                className="button button--primary"
                disabled={item.action.disabled}
                onClick={() => {
                  item.action.onClick();
                  onClose();
                }}>
                {item.action.label}
              </button>
            )}
            <button type="button" className="button button--secondary" onClick={onClose}>
              {tg(lang, 'closePreview')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const coin = <Sprite path="sultan/token-coin.webp" emoji="🪙" label="" tint="#d9a520" shape="token" size="18px" />;
const crown = <Sprite path="sultan/token-crown.webp" emoji="👑" label="" tint="#d9a520" shape="icon" size="22px" />;

/** Games saved by the old 8-role edition can't continue: ask for a new game. */
const LEGACY_VIEW = {kind: 'wait', task: 'legacy', mine: [], hand: [], city: [], events: [], players: [], round: 0, goal: 7, gold: 0, legacy: true};

// ------------------------------------------------------------------ module

const sultan = {
  id: 'sultan',
  logo: 'sultan/char-04-king.webp',
  title: {en: 'City of the Sultan', zh: '苏丹之城'},
  blurb: {
    en: 'Bloodshed, marriage, and conquest, they are just tools of the trade.',
    zh: '血腥、婚姻与征服，它们只是交易的工具。',
  },
  howTo: {
    en: [
      'Each round, players secretly pick characters, crown holder first. Small tables pick 2 each.',
      'Characters are called by number, 0 to 13. When yours is called, take its turn on your phone: take 2 coins or draw 2 and keep 1, use its ability, then build.',
      'No two identical districts in one city. Some characters earn coins for districts of their type.',
      'Stat events (optional): Marriage, Conquest, Pyrrhic and Extravagance use the Combat and Charisma on each card. You need a character of the event card’s colour and its price.',
      'When a city reaches the goal, that round ends the game. Score: district values, +3 for all five types, +4 first to finish (+2 others), plus Unique bonuses.',
    ],
    zh: [
      '每轮玩家秘密挑选角色，持有王冠的人先选。人少时每人选 2 个。',
      '按号码 0 到 13 传召角色。轮到你的角色时在手机上进行回合：拿 2 金币或抽 2 留 1，使用能力，再建造。',
      '同一座城不能有两个相同的区域。部分角色按对应类型的区域获得金币。',
      '属性事件（可选）：婚姻、征服、惨烈、丰裕会用到卡上的战斗力与魅力。需要拥有与事件牌同色的角色并支付价格。',
      '有一座城达到目标后，这一轮结束游戏。得分：区域价值，五种类型齐全 +3，最先完成 +4（其他完成者 +2），以及独特区域奖励。',
    ],
  },
  reference(lang) {
    const group = (en, zh) => (lang === 'zh' ? zh : en);
    const chars = Object.keys(CHARS).map((k) => ({
      group: group('Characters', '角色'),
      emoji: <CharCard k={k} lang={lang} size={18} />,
      tint: FRAMES[CHARS[k].frame].tint,
      title: charName(k, lang),
      tag: statLine(CHARS[k], lang),
      text: CHARS[k].ab,
    }));
    const events = Object.keys(EVENTS).map((k) => ({group: group('Stat events', '属性事件'), emoji: <EventCard ev={{kind: k, frame: 'gold'}} lang={lang} size={18} />, tint: '#e9cfa3', title: L(EVENTS[k], lang), text: EVENTS[k].ab}));
    const uniques = Object.values(DISTRICT)
      .filter((d) => d.note)
      .map((d) => ({group: group('Unique districts', '独特区域'), emoji: <DistrictCard k={d.key} lang={lang} size={22} />, tint: TYPES.unique.tint, title: `${L(d, lang)} · ${d.cost}`, text: d.note}));
    return [...chars, ...events, ...uniques];
  },
  inspiredBy: 'Citadels',
  players: {min: 2, max: 24},
  minutes: 40,
  coverTint: '#f4a62a',
  themeClass: shell.themeSultan,
  voiceLines: VOICE,
  defaultSettings: {pool: 'auto', picks: 'auto', events: 'off', marriage: true, conquest: true, pyrrhic: true, extravagance: true, goal: 'auto', turnSeconds: 45},

  setup(g, seats, ctx) {
    return setupSultan(seats, ctx, g.settings || {});
  },

  SettingsView({settings, set, lang, playerCount: n = 0}) {
    const radio = (key, value, label) => (
      <button key={String(value)} type="button" role="radio" aria-checked={settings[key] === value} className="button button--sm button--secondary" onClick={() => set({[key]: value})}>
        {label}
      </button>
    );
    const toggle = (key) => (
      <button key={key} type="button" role="checkbox" aria-checked={settings[key] !== false} className="button button--sm button--secondary" onClick={() => set({[key]: settings[key] === false})}>
        {L(EVENTS[key], lang)}
      </button>
    );
    const st = n >= 2 ? settingsOf(n, settings) : null;
    return (
      <>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_pool')}</span>
          {radio('pool', 'auto', tg(lang, 's_auto'))}
          {radio('pool', 'classic', tg(lang, 's_classic'))}
          {radio('pool', 'all', tg(lang, 's_all'))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_picks')}</span>
          {radio('picks', 'auto', tg(lang, 's_auto'))}
          {radio('picks', 1, '1')}
          {radio('picks', 2, '2')}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_events')}</span>
          {radio('events', 'off', tg(lang, 's_off'))}
          {radio('events', 'on', tg(lang, 's_on'))}
        </div>
        {settings.events === 'on' && <div className={shell.buttonRow}>{Object.keys(EVENTS).map(toggle)}</div>}
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_goal')}</span>
          {radio('goal', 'auto', tg(lang, 's_auto'))}
          {[6, 7, 8].map((v) => radio('goal', v, String(v)))}
        </div>
        <div className={shell.buttonRow}>
          <span>{tg(lang, 's_timer')}</span>
          {[30, 45, 60].map((v) => radio('turnSeconds', v, tg(lang, 'sec', {n: v})))}
        </div>
        {st && <p className={shell.muted}>{tg(lang, 'poolLine', {n, chars: Math.max(basePool(n, st.pool, st.picks).length, n * st.picks + 2), picks: st.picks})}</p>}
      </>
    );
  },

  input(s, g, id, msg, ctx) {
    switch (msg.action) {
      case 'draft':
        return draftPick(s, ctx, id, msg.card);
      case 'challenge':
        return challenge(s, ctx, id, msg.target);
      case 'answer':
        return answer(s, ctx, id, msg);
      default:
        return turnAction(s, ctx, id, msg);
    }
  },

  tick(s, g, ctx) {
    return Boolean(timeout(s, ctx));
  },

  bot(s, g, id, ctx) {
    return botMove(s, id, ctx.rng);
  },

  /** The phone view plus `urgent` (this phone must act now), which drives the banner and buzz. */
  view(s, g, id, ctx) {
    const v = this.baseView(s, g, id, ctx);
    return {...v, urgent: ['draft', 'turn', 'prompt'].includes(v.kind)};
  },

  baseView(s, g, id) {
    if (!s.st) return LEGACY_VIEW;
    const name = (p) => (g.players[p] ? g.players[p].name : '?');
    const players = s.seats.map((p) => ({
      id: p,
      name: name(p),
      avatar: g.players[p] && g.players[p].avatar,
      color: g.players[p] && g.players[p].color,
      gold: s.gold[p],
      hand: s.hand[p].length,
      city: s.city[p].map((u) => ({uid: u, key: s.cards[u], value: valueOf(s, u)})),
      shown: s.hold[p].filter((k) => s.revealed[k]),
    }));
    const statsOn = s.st.events.length > 0;
    const t = s.turn;
    const myTurnCard = s.phase === 'call' && t ? t.cards.find((k) => acting(s, id, k)) : null;
    let kind = 'wait';
    if (s.over) kind = 'over';
    else if (s.prompt && s.prompt.to === id) kind = 'prompt';
    else if (s.phase === 'draft' && picksLeft(s, id) > 0) kind = 'draft';
    else if (s.phase === 'pyrrhic' && !s.prompt && canUseEvent(s, id, s.events.find((e) => e.kind === 'pyrrhic'))) kind = 'pyrrhic';
    else if (myTurnCard) kind = 'turn';
    const v = {
      task: `${kind}-${s.round}-${s.phase}-${s.calling}-${myTurnCard || ''}-${myTurnCard ? t.step[myTurnCard] : ''}-${s.prompt ? s.prompt.kind : ''}`,
      kind,
      phase: s.phase,
      round: s.round,
      goal: s.st.goal,
      statsOn,
      gold: s.gold[id],
      crown: s.crown === id,
      lastRound: s.lastRound,
      calling: s.phase === 'call' && t ? t.num : null,
      mine: s.hold[id].map((k) => ({key: k, married: s.married[k] || null})),
      hand: s.hand[id].map((u) => ({uid: u, key: s.cards[u], ok: Boolean(myTurnCard) && canBuild(s, id, myTurnCard, u)})),
      city: s.city[id].map((u) => ({uid: u, key: s.cards[u], invest: s.invest[u] || 0})),
      events: s.events.map((e) => ({...e, can: canUseEvent(s, id, e)})),
      players,
      me: id,
      turnDone: s.phase === 'call' && s.hold[id].length > 0 && s.hold[id].every((k) => charOf(k).n == null || charOf(k).n < (s.calling || 0) || (t && t.done[k])),
      score: s.scores ? s.scores[id] : null,
      winner: s.winner || null,
      waitFor: s.prompt ? name(s.prompt.to) : null,
    };
    if (kind === 'draft') {
      v.picksLeft = picksLeft(s, id);
      v.available = s.draft.available.map((k) => ({key: k, ok: canPick(s, id, k), married: s.married[k] || null}));
    }
    if (kind === 'pyrrhic') v.targets = s.seats.filter((p) => p !== id && s.hold[p].length).map((p) => ({id: p, name: name(p)}));
    if (kind === 'prompt') {
      const p = s.prompt;
      v.prompt = {kind: p.kind, from: name(p.from || (p.eff && p.eff.actor) || (s.duel && s.duel.a)), max: p.max, mine: p.mine, other: p.other, what: p.eff ? p.eff.kind : null};
      if (p.kind === 'champion') v.prompt.cards = s.hold[id];
      if (p.kind === 'ally') v.prompt.offer = s.conquests[p.index].offer;
    }
    if (kind === 'turn') {
      const key = myTurnCard;
      const twice = s.hold[id].includes('weaver') ? 2 : 1;
      v.turn = {
        card: key,
        step: t.step[key],
        drawn: t.step[key] === 'keep' ? t.drawn[key].map((u) => ({uid: u, key: s.cards[u]})) : null,
        buildLeft: (key === 'builder' ? 2 : 1) - (t.built[key] || 0),
        usesLeft: twice - (t.uses[key] || 0),
        twinsFirst: key === 'twins' && !t.again[key],
        waiting: Boolean(s.prompt),
        numbers: nameableNumbers(s, key),
        hiddenPlayers: hiddenPlayers(s, id).map((p) => ({id: p, name: name(p)})),
        guesses: (s.poolKeys || []).filter((k) => !s.hold[id].includes(k) && !s.revealed[k]),
        stealFrom: t.stealFrom[key] ? s.city[t.stealFrom[key]].filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u])).map((u) => ({uid: u, key: s.cards[u]})) : null,
        unpicked: key === 'princess' ? (s.unpicked || []).filter((k) => !Object.values(s.reserved).includes(k)) : [],
        buys: key === 'official' ? officialTargets(s, id).map((x) => ({...x, key: s.cards[x.uid], owner: name(x.owner)})) : [],
        destroys: key === 'general' ? generalTargets(s, id).map((x) => ({...x, key: s.cards[x.uid], owner: name(x.owner)})) : [],
        smithy: s.city[id].some((u) => s.cards[u] === 'smithy') && !t.smithy[key] && s.gold[id] >= 2,
        lab: s.city[id].some((u) => s.cards[u] === 'laboratory') && !t.lab[key],
        dates: !t.dated[key] && !s.married[key] ? Object.keys(s.owner).filter((k) => k !== key && s.revealed[k] && !s.married[k]).map((k) => ({key: k, owner: name(ownerOf(s, k))})) : [],
        targets: s.seats.filter((p) => p !== id).flatMap((p) => s.city[p].filter((u) => !s.city[id].some((m) => s.cards[m] === s.cards[u])).map((u) => ({uid: u, key: s.cards[u], owner: name(p), value: valueOf(s, u)}))),
        charisma: s.hold[id].reduce((n, k) => n + charOf(k).charisma, 0),
      };
    }
    return v;
  },

  HostView({g, state: s, lang}) {
    if (!s.st) return <div className={shell.bigText}>{tg(lang, 'legacy')}</div>;
    const name = (id) => (g.players[id] ? g.players[id].name : '?');
    const t = s.turn;
    const statsOn = s.st.events.length > 0;
    const recent = (s.log || []).slice(-6).reverse();
    const roll = s.rolls && s.rolls[0];
    return (
      <SeatRing
        g={g}
        ids={s.seats}
        highlight={(id) => (s.phase === 'draft' ? picksLeft(s, id) > 0 : s.phase === 'call' && t ? t.cards.some((k) => ownerOf(s, k) === id && !t.done[k]) : s.prompt && s.prompt.to === id)}
        badge={(id) => (
          <>
            {s.crown === id && crown}
            <span className={styles.stat}>
              {coin}
              {s.gold[id]}
            </span>
            <span className={styles.stat}>🃏{s.hand[id].length}</span>
            <span className={styles.shownRow}>
              {s.hold[id]
                .filter((k) => s.revealed[k])
                .map((k) => (
                  <CharCard key={k} k={k} lang={lang} size={20} />
                ))}
            </span>
            <span className={styles.cityRow}>
              {s.city[id].map((u) => (
                <span key={u} className={styles.block} style={{background: TYPES[DISTRICT[s.cards[u]].type].tint}} title={L(DISTRICT[s.cards[u]], lang)} />
              ))}
            </span>
            {s.over && <b className={styles.stat}>{tg(lang, 'points', {n: s.scores[id]})}</b>}
          </>
        )}>
        {s.over ? (
          <div className={styles.final}>
            <div className={shell.bigText}>{name(s.winner)}</div>
            <table className={shell.scoreTable}>
              <tbody>
                {[...s.seats]
                  .sort((a, b) => s.scores[b] - s.scores[a])
                  .slice(0, 10)
                  .map((id, i) => (
                    <tr key={id}>
                      <td>{i + 1}</td>
                      <td>
                        <Avatar avatar={g.players[id]?.avatar} color={g.players[id]?.color} size="xs" /> {name(id)}
                      </td>
                      <td>
                        <b>{s.scores[id]}</b>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <p className={shell.kicker}>
              {tg(lang, 'round', {n: s.round})} · {tg(lang, 'goal', {n: s.st.goal})}
            </p>
            {s.lastRound && <p className={styles.last}>{tg(lang, 'lastRound')}</p>}
            {s.events.length > 0 && (
              <div className={styles.eventRow}>
                {s.events.map((e) => (
                  <span key={e.kind} className={styles.eventSlot} data-used={Boolean(e.usedBy)}>
                    <EventCard ev={e} lang={lang} size={44} />
                    <small>
                      {coin}
                      {e.price}
                    </small>
                  </span>
                ))}
              </div>
            )}
            {s.phase === 'draft' && (
              <>
                <div className={shell.bigText}>{tg(lang, 'drafting')}</div>
                <div className={shell.chipRow}>
                  {s.draft.wave.map((id) => (
                    <span key={id} className={shell.chip}>
                      {name(id)} {picksLeft(s, id) > 0 ? '…' : '✓'}
                    </span>
                  ))}
                </div>
              </>
            )}
            {s.phase === 'pyrrhic' && <div className={shell.bigText}>{tg(lang, 'pyrrhicOpen')}</div>}
            {s.phase === 'call' && t && (
              <div className={styles.calling}>
                <div className={shell.bigText}>{tg(lang, 'calling', {n: t.num})}</div>
                <div className={styles.cards}>
                  {t.cards.map((k) => (
                    <span key={k} className={styles.callCard} data-done={Boolean(t.done[k])} data-silenced={s.silenced.includes(t.num)}>
                      <CharCard k={k} lang={lang} size={70} stats={statsOn} />
                      <small>{name(ownerOf(s, k))}</small>
                    </span>
                  ))}
                </div>
                {t.pause && <p>{tg(lang, 'silencedAll')}</p>}
              </div>
            )}
            {s.phase === 'conquest' && <div className={shell.bigText}>{tg(lang, 'conquests')}</div>}
            {s.prompt && <p className={shell.muted}>{tg(lang, 'waitFor', {name: name(s.prompt.to)})}</p>}
            {roll && (
              <div className={styles.dice}>
                {name(roll.a.who)}: <b>{roll.a.total}</b>
                {roll.b && (
                  <>
                    {' '}
                    vs {name(roll.b.who)}: <b>{roll.b.total}</b>
                  </>
                )}
                {roll.a.dice && <small> ({roll.a.dice.join(' + ')} − 1)</small>}
              </div>
            )}
            <ul className={`${shell.logList} ${styles.log}`}>
              {recent.map((e, i) => (
                <li key={i}>
                  <LogLine e={e} lang={lang} name={name} />
                </li>
              ))}
            </ul>
          </>
        )}
      </SeatRing>
    );
  },

  PhoneView({view, lang, send}) {
    return <SultanPhone view={view} lang={lang} send={send} />;
  },
};

function LogLine({e, lang, name}) {
  const x = e.card ? (DISTRICT[e.card] ? L(DISTRICT[e.card], lang) : charName(e.card, lang)) : '';
  const y = e.other ? charName(e.other, lang) : '';
  const key = `log_${e.kind}`;
  return (
    <>
      <b>{name(e.actor)}</b> {tg(lang, key, {x, y, who: name(e.target), n: e.n != null ? e.n : e.number, ok: tg(lang, e.right ? 'right' : 'wrong')})}
    </>
  );
}

// ------------------------------------------------------------------ phone

function SultanPhone({view, lang, send}) {
  const [inspect, setInspect] = useState(null);
  const closeInspect = () => setInspect(null);
  const openChar = (key, extra = {}) => setInspect({kind: 'char', key, ...extra});
  const openDistrict = (key, extra = {}) => setInspect({kind: 'district', key, ...extra});
  const openEvent = (ev) => setInspect({kind: 'event', key: ev.kind, frame: ev.frame});

  const modal = <CardInspect item={inspect} lang={lang} onClose={closeInspect} />;

  const status = (
    <div className={shell.card}>
      <p className={shell.kicker}>
        {tg(lang, 'round', {n: view.round})} · {coin} {tg(lang, 'gold', {n: view.gold})} {view.crown && crown}
      </p>
      {view.mine.length > 0 && (
        <>
          <p className={shell.kicker}>{tg(lang, 'yourChars')}</p>
          <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
          <div className={styles.cards}>
            {view.mine.map((c) => (
              <button key={c.key} type="button" className={styles.cardButton} onClick={() => openChar(c.key, {married: c.married || null})}>
                <span className={styles.charWrap}>
                  <CharCard k={c.key} lang={lang} size={46} stats={view.statsOn} />
                  {c.married && <small>{tg(lang, 'married', {name: charName(c.married, lang)})}</small>}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <p className={shell.kicker}>
        {tg(lang, 'city')} ({view.city.length}/{view.goal})
      </p>
      <div className={styles.cards}>
        {view.city.map((c) => (
          <button key={c.uid} type="button" className={styles.cardButton} onClick={() => openDistrict(c.key, {invest: c.invest})}>
            <DistrictCard k={c.key} lang={lang} size={40} invest={c.invest} />
          </button>
        ))}
      </div>
    </div>
  );
  const handView = (
    <div className={shell.card}>
      <p className={shell.kicker}>{tg(lang, 'hand')}</p>
      <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
      <div className={styles.cards}>
        {view.hand.map((c) => (
          <button key={c.uid} type="button" className={styles.cardButton} onClick={() => openDistrict(c.key)}>
            <DistrictCard k={c.key} lang={lang} size={48} />
          </button>
        ))}
      </div>
    </div>
  );

  if (view.kind === 'over') {
    return (
      <>
        <div className={`${shell.card} ${shell.bigText}`}>{tg(lang, 'points', {n: view.score})}</div>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'prompt') {
    return (
      <>
        <PromptCard view={view} lang={lang} send={send} openChar={openChar} />
        {modal}
      </>
    );
  }
  if (view.kind === 'draft') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'pickChar', {n: view.picksLeft})}</p>
        <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
        <div className={styles.cards}>
          {view.available.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.cardButton} ${styles.draftOption}`}
              onClick={() =>
                openChar(c.key, {
                  married: c.married || null,
                  action: c.ok
                    ? {
                        label: tg(lang, 'pickThis'),
                        onClick: () => send({action: 'draft', card: c.key}),
                      }
                    : {label: tg(lang, 'pickThis'), disabled: true},
                })
              }>
              <CharCard k={c.key} lang={lang} size={70} stats={view.statsOn} />
              <span className={styles.abilityText}>{L(charOf(c.key).ab, lang)}</span>
              {c.married && <small>{tg(lang, 'married', {name: charName(c.married, lang)})}</small>}
            </button>
          ))}
        </div>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'pyrrhic') {
    const ev = view.events.find((e) => e.kind === 'pyrrhic');
    return (
      <>
        <button type="button" className={styles.cardButton} onClick={() => openEvent(ev)}>
          <EventCard ev={ev} lang={lang} size={70} />
        </button>
        <p className={shell.bigText}>{tg(lang, 'challengeWho')}</p>
        <div className={shell.choiceGrid}>
          {view.targets.map((p) => (
            <button key={p.id} type="button" className="button button--sm" onClick={() => send({action: 'challenge', target: p.id})}>
              {p.name}
            </button>
          ))}
        </div>
        <p className={shell.muted}>{tg(lang, 'skip')}: {tg(lang, 'waiting')}</p>
        {status}
        {modal}
      </>
    );
  }
  if (view.kind === 'turn') {
    return (
      <>
        <TurnView view={view} lang={lang} send={send} status={status} handView={handView} openChar={openChar} openDistrict={openDistrict} openEvent={openEvent} />
        {modal}
      </>
    );
  }
  return (
    <>
      <p className={shell.waiting}>{view.legacy ? tg(lang, 'legacy') : view.waitFor ? tg(lang, 'waitFor', {name: view.waitFor}) : view.turnDone ? tg(lang, 'turnDone') : view.mine.length ? tg(lang, 'nobodyCalled') : tg(lang, 'waitDraft')}</p>
      {view.calling != null && <div className={shell.card}>{tg(lang, 'calling', {n: view.calling})}</div>}
      {status}
      {handView}
      {modal}
    </>
  );
}

function PromptCard({view, lang, send, openChar}) {
  const p = view.prompt;
  const yesNo = (yesLabel, noLabel) => (
    <div className={shell.choiceGrid}>
      <button type="button" className="button button--lg" onClick={() => send({action: 'answer', yes: true})}>
        {yesLabel}
      </button>
      <button type="button" className="button button--lg button--secondary" onClick={() => send({action: 'answer', yes: false})}>
        {noLabel}
      </button>
    </div>
  );
  return (
    <div className={shell.card}>
      {p.kind === 'shield' && (
        <>
          <button type="button" className={styles.cardButton} onClick={() => openChar && openChar('priest')}>
            <CharCard k="priest" lang={lang} size={70} />
          </button>
          <p className={shell.bigText}>{tg(lang, 'p_shield', {name: p.from, what: tg(lang, `eff_${p.what}`)})}</p>
          {yesNo(tg(lang, 'useShield'), tg(lang, 'noShield'))}
        </>
      )}
      {p.kind === 'raise' && (
        <>
          <p className={shell.bigText}>{tg(lang, 'p_raise', {name: p.from, max: p.max})}</p>
          <div className={shell.choiceGrid}>
            {Array.from({length: Math.max(1, p.max)}, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className="button" onClick={() => send({action: 'answer', bet: n})}>
                {tg(lang, 'bet', {n})}
              </button>
            ))}
          </div>
        </>
      )}
      {p.kind === 'champion' && (
        <>
          <p className={shell.bigText}>{tg(lang, 'p_champion')}</p>
          <div className={styles.cards}>
            {p.cards.map((k) => (
              <button
                key={k}
                type="button"
                className={styles.cardButton}
                onClick={() =>
                  openChar
                    ? openChar(k, {
                        action: {
                          label: tg(lang, 'pickThis'),
                          onClick: () => send({action: 'answer', card: k}),
                        },
                      })
                    : send({action: 'answer', card: k})
                }>
                <CharCard k={k} lang={lang} size={70} stats />
              </button>
            ))}
          </div>
        </>
      )}
      {p.kind === 'date' && (
        <>
          <div className={styles.cards}>
            <button type="button" className={styles.cardButton} onClick={() => openChar && openChar(p.mine)}>
              <CharCard k={p.mine} lang={lang} size={60} stats />
            </button>
            <span className={shell.bigText}>+</span>
            <button type="button" className={styles.cardButton} onClick={() => openChar && openChar(p.other)}>
              <CharCard k={p.other} lang={lang} size={60} stats />
            </button>
          </div>
          <p>{tg(lang, 'p_date', {name: p.from, mine: charName(p.mine, lang), other: charName(p.other, lang)})}</p>
          {yesNo(tg(lang, 'agree'), tg(lang, 'refuse'))}
        </>
      )}
      {p.kind === 'ally' && (
        <>
          <p className={shell.bigText}>{tg(lang, 'p_ally', {name: p.from, n: p.offer})}</p>
          {yesNo(tg(lang, 'accept'), tg(lang, 'refuse'))}
        </>
      )}
    </div>
  );
}

function TurnView({view, lang, send, status, handView, openChar, openDistrict, openEvent}) {
  const tv = view.turn;
  const c = charOf(tv.card);
  const act = (msg) => send({...msg, card: tv.card});
  const [guessTarget, setGuessTarget] = useState(null);
  const [redraw, setRedraw] = useState([]);
  const [conquest, setConquest] = useState(null);
  const [gifts, setGifts] = useState({});
  const header = (
    <div className={styles.turnHead}>
      <button type="button" className={styles.cardButton} onClick={() => openChar(tv.card)}>
        <CharCard k={tv.card} lang={lang} size={56} stats={view.statsOn} />
      </button>
      <div>
        <p className={shell.bigText}>{tg(lang, 'yourTurn', {name: lang === 'zh' ? c.zh : c.en})}</p>
        <p className={shell.muted}>{L(c.ab, lang)}</p>
      </div>
    </div>
  );
  if (tv.step === 'income') {
    return (
      <>
        {header}
        <div className={shell.choiceGrid}>
          <button type="button" className="button button--lg" onClick={() => act({action: 'gold'})}>
            {coin} {tg(lang, 'takeGold')}
          </button>
          <button type="button" className="button button--lg" onClick={() => act({action: 'cards'})}>
            🃏 {tg(lang, 'takeCards')}
          </button>
        </div>
        {status}
        {handView}
      </>
    );
  }
  if (tv.step === 'keep') {
    return (
      <>
        <p className={shell.bigText}>{tg(lang, 'keepOne')}</p>
        <div className={styles.cards}>
          {tv.drawn.map((d) => (
            <button
              key={d.uid}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                openDistrict(d.key, {
                  action: {
                    label: tg(lang, 'keepThis'),
                    onClick: () => act({action: 'keep', uid: d.uid}),
                  },
                })
              }>
              <DistrictCard k={d.key} lang={lang} size={84} />
            </button>
          ))}
        </div>
      </>
    );
  }
  const can = tv.usesLeft > 0 && !tv.waiting;
  const panel = (title, children) => (
    <div className={shell.card}>
      <b>{title}</b>
      {children}
    </div>
  );
  const ability = () => {
    const k = tv.card;
    if (!can) return null;
    if (['banditA', 'banditB', 'thief'].includes(k) && tv.numbers.length)
      return panel(
        tg(lang, 'nameNumber'),
        <div className={shell.choiceGrid}>
          {tv.numbers.map((n) => (
            <button key={n} type="button" className="button button--sm" onClick={() => act({action: k === 'thief' ? 'rob' : 'silence', number: n})}>
              {n}
            </button>
          ))}
        </div>,
      );
    if (k === 'fighter' && tv.hiddenPlayers.length)
      return panel(
        guessTarget ? tg(lang, 'guessWhat') : tg(lang, 'guessWho'),
        guessTarget ? (
          <div className={styles.cards}>
            {tv.guesses.map((g) => (
              <button
                key={g}
                type="button"
                className={styles.cardButton}
                onClick={() =>
                  openChar(g, {
                    action: {
                      label: tg(lang, 'pickThis'),
                      onClick: () => act({action: 'guess', target: guessTarget, guess: g}),
                    },
                  })
                }>
                <CharCard k={g} lang={lang} size={40} />
              </button>
            ))}
          </div>
        ) : (
          <div className={shell.choiceGrid}>
            {tv.hiddenPlayers.map((p) => (
              <button key={p.id} type="button" className="button button--sm" onClick={() => setGuessTarget(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        ),
      );
    if (k === 'mage')
      return panel(
        tg(lang, 'swapWith'),
        <>
          <div className={shell.choiceGrid}>
            {view.players
              .filter((p) => p.id !== view.me)
              .map((p) => (
                <button key={p.id} type="button" className="button button--sm" onClick={() => act({action: 'swapHand', target: p.id})}>
                  <Avatar avatar={p.avatar} color={p.color} size="xs" /> {p.name} · 🃏{p.hand}
                </button>
              ))}
          </div>
          <div className={styles.cards}>
            {view.hand.map((h) => (
              <button key={h.uid} type="button" className={styles.cardButton} aria-pressed={redraw.includes(h.uid)} onClick={() => setRedraw((r) => (r.includes(h.uid) ? r.filter((x) => x !== h.uid) : [...r, h.uid]))}>
                <DistrictCard k={h.key} lang={lang} size={36} />
              </button>
            ))}
          </div>
          <button type="button" className="button button--sm button--secondary" disabled={!redraw.length} onClick={() => act({action: 'redraw', uids: redraw})}>
            {tg(lang, 'redraw')} ({redraw.length})
          </button>
        </>,
      );
    if (k === 'princess' && tv.unpicked.length)
      return panel(
        tg(lang, 'reserve'),
        <div className={styles.cards}>
          {tv.unpicked.map((u) => (
            <button
              key={u}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                openChar(u, {
                  action: {
                    label: tg(lang, 'reserve'),
                    onClick: () => act({action: 'reserve', pick: u}),
                  },
                })
              }>
              <CharCard k={u} lang={lang} size={40} />
            </button>
          ))}
        </div>,
      );
    const targetList = (list, action) => (
      <div className={shell.choiceGrid}>
        {list.map((x) => (
          <button key={x.uid} type="button" className="button button--sm" onClick={() => act({action, uid: x.uid})}>
            {x.owner}: {L(DISTRICT[x.key], lang)} · {x.price}
          </button>
        ))}
      </div>
    );
    if (k === 'official' && tv.buys.length) return panel(tg(lang, 'buy'), targetList(tv.buys, 'buy'));
    if (k === 'general' && tv.destroys.length) return panel(tg(lang, 'destroy'), targetList(tv.destroys, 'destroy'));
    if (k === 'scholar' && view.city.length && view.gold >= 1)
      return panel(
        tg(lang, 'invest'),
        <div className={shell.choiceGrid}>
          {view.city.map((d) =>
            [1, 2]
              .filter((n) => n <= view.gold)
              .map((n) => (
                <button key={`${d.uid}-${n}`} type="button" className="button button--sm" onClick={() => act({action: 'invest', uid: d.uid, n})}>
                  {L(DISTRICT[d.key], lang)} +{n}
                </button>
              )),
          )}
        </div>,
      );
    if (k === 'lucky' && view.gold >= 1)
      return panel(
        tg(lang, 'ability'),
        <button type="button" className="button" onClick={() => act({action: 'gamble'})}>
          {tg(lang, 'gamble')}
        </button>,
      );
    return null;
  };
  const ev = (kind) => view.events.find((e) => e.kind === kind && e.can);
  const total = Object.values(gifts).reduce((a, b) => a + b, 0);
  return (
    <>
      {header}
      {tv.stealFrom &&
        panel(
          tg(lang, 'stealPick'),
          <div className={styles.cards}>
            {tv.stealFrom.map((d) => (
              <button
                key={d.uid}
                type="button"
                className={styles.cardButton}
                onClick={() =>
                  openDistrict(d.key, {
                    action: {
                      label: tg(lang, 'stealPick'),
                      onClick: () => act({action: 'steal', uid: d.uid}),
                    },
                  })
                }>
                <DistrictCard k={d.key} lang={lang} size={48} />
              </button>
            ))}
          </div>,
        )}
      {tv.usesLeft > 1 && <p className={shell.kicker}>{tg(lang, 'abilityLeft', {n: tv.usesLeft})}</p>}
      {ability()}
      {(tv.smithy || tv.lab) && (
        <div className={shell.choiceGrid}>
          {tv.smithy && (
            <button type="button" className="button button--sm" onClick={() => act({action: 'smithy'})}>
              {tg(lang, 'smithy')}
            </button>
          )}
          {tv.lab &&
            view.hand.map((h) => (
              <button key={h.uid} type="button" className="button button--sm" onClick={() => act({action: 'lab', uid: h.uid})}>
                {tg(lang, 'lab')}: {L(DISTRICT[h.key], lang)}
              </button>
            ))}
        </div>
      )}
      {view.events.length > 0 && (
        <div className={shell.card}>
          <b>{tg(lang, 'events')}</b>
          <div className={styles.cards}>
            {view.events.map((e) => (
              <button key={e.kind} type="button" className={`${styles.cardButton} ${styles.eventSlot}`} data-used={Boolean(e.usedBy) || !e.can} onClick={() => openEvent(e)}>
                <EventCard ev={e} lang={lang} size={40} />
                <small>{tg(lang, 'eventNeeds', {frame: L(FRAMES[e.frame], lang), price: e.price})}</small>
              </button>
            ))}
          </div>
          {ev('marriage') && tv.dates.length > 0 && !tv.waiting && (
            <>
              <p className={shell.kicker}>{tg(lang, 'marry')}</p>
              <div className={styles.cards}>
                {tv.dates.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={styles.cardButton}
                    onClick={() =>
                      openChar(d.key, {
                        action: {
                          label: tg(lang, 'marry'),
                          onClick: () => act({action: 'marry', mine: tv.card, other: d.key}),
                        },
                      })
                    }>
                    <CharCard k={d.key} lang={lang} size={40} stats />
                    <small>{d.owner}</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {ev('conquest') && tv.targets.length > 0 && (
            <>
              <p className={shell.kicker}>{tg(lang, 'conquer')}</p>
              {!conquest ? (
                <div className={shell.choiceGrid}>
                  {tv.targets.map((x) => (
                    <button key={x.uid} type="button" className="button button--sm" onClick={() => setConquest({uid: x.uid, ally: null, offer: 1})}>
                      {x.owner}: {L(DISTRICT[x.key], lang)} ({tg(lang, 'value', {n: x.value})})
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <p>{tg(lang, 'ally')}</p>
                  <div className={shell.choiceGrid}>
                    <button type="button" className="button button--sm" aria-pressed={!conquest.ally} onClick={() => setConquest({...conquest, ally: null})}>
                      {tg(lang, 'noAlly')}
                    </button>
                    {view.players
                      .filter((p) => p.id !== view.me)
                      .map((p) => (
                        <button key={p.id} type="button" className="button button--sm" aria-pressed={conquest.ally === p.id} onClick={() => setConquest({...conquest, ally: p.id})}>
                          {p.name}
                        </button>
                      ))}
                  </div>
                  {conquest.ally && (
                    <div className={shell.choiceGrid}>
                      {[0, 1, 2, 3].map((n) => (
                        <button key={n} type="button" className="button button--sm" aria-pressed={conquest.offer === n} onClick={() => setConquest({...conquest, offer: n})}>
                          {tg(lang, 'offer', {n})}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" className="button" onClick={() => act({action: 'conquer', ...conquest})}>
                    {tg(lang, 'conquer')}
                  </button>
                </>
              )}
            </>
          )}
          {ev('extravagance') && (
            <>
              <p className={shell.kicker}>{tg(lang, 'extravagance', {n: tv.charisma})}</p>
              <div className={shell.choiceGrid}>
                {view.players
                  .filter((p) => p.id !== view.me)
                  .map((p) => (
                    <button key={p.id} type="button" className="button button--sm" disabled={total >= tv.charisma} onClick={() => setGifts((g) => ({...g, [p.id]: (g[p.id] || 0) + 1}))}>
                      {tg(lang, 'give')} → {p.name} ({gifts[p.id] || 0})
                    </button>
                  ))}
              </div>
              <button type="button" className="button" disabled={total !== tv.charisma} onClick={() => act({action: 'extravagance', gifts})}>
                {tv.charisma - total > 0 ? tg(lang, 'toGive', {n: tv.charisma - total}) : tg(lang, 'extravagance', {n: tv.charisma})}
              </button>
            </>
          )}
        </div>
      )}
      <p className={shell.kicker}>{tg(lang, 'build', {n: tv.buildLeft})}</p>
      <div className={shell.card}>
        <p className={shell.muted}>{tg(lang, 'tapPreview')}</p>
        <div className={styles.cards}>
          {view.hand.map((h) => (
            <button
              key={h.uid}
              type="button"
              className={styles.cardButton}
              onClick={() =>
                openDistrict(h.key, {
                  action: {
                    label: tg(lang, 'buildThis'),
                    disabled: !h.ok,
                    onClick: () => act({action: 'build', uid: h.uid}),
                  },
                })
              }>
              <DistrictCard k={h.key} lang={lang} size={60} />
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="button button--lg button--block" disabled={tv.waiting} onClick={() => act({action: 'end'})}>
        {tv.twinsFirst ? tg(lang, 'endFirst') : tg(lang, 'endTurn')}
      </button>
      {status}
    </>
  );
}

export default sultan;
