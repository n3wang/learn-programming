import React, {useEffect, useMemo, useState} from 'react';
import Sprite from '../../core/Sprite';
import {CHARS, DISTRICT} from './data';
import {CityPlot} from './IsoCity';
import styles from './sultan.module.css';

const TYPE_ORDER = ['noble', 'religious', 'trade', 'military', 'unique'];

function pickCity(goal) {
  const byType = Object.fromEntries(TYPE_ORDER.map((t) => [t, []]));
  Object.values(DISTRICT).forEach((d) => {
    if (d.key !== 'dragon-gate') byType[d.type].push(d.key);
  });
  const chosen = ['dragon-gate'];
  ['noble', 'religious', 'trade', 'military'].forEach((t) => {
    const pool = byType[t];
    if (pool.length) chosen.push(pool[Math.floor(Math.random() * pool.length)]);
  });
  const rest = Object.keys(DISTRICT).filter((k) => !chosen.includes(k));
  while (chosen.length < goal && rest.length) {
    chosen.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  }
  for (let i = chosen.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  return chosen.slice(0, goal);
}

function planFor(goal, kind, madness) {
  const steps = [];
  if (!madness) {
    for (let n = 0; n <= goal; n += 1) steps.push({scene: 'city', n});
    steps.push({scene: 'city', n: goal});
  }
  if (kind === 'math') {
    for (let n = 0; n < 3; n += 1) steps.push({scene: 'math', n});
    for (let n = 0; n < 3; n += 1) steps.push({scene: 'secret', n});
    for (let n = 0; n < 2; n += 1) steps.push({scene: 'pay', n});
    for (let n = 0; n < 2; n += 1) steps.push({scene: 'citizen', n});
  } else if (kind === 'gold') {
    for (let n = 0; n < 3; n += 1) steps.push({scene: 'gold', n});
    for (let n = 0; n < 2; n += 1) steps.push({scene: 'citizen', n});
  } else {
    for (let n = 0; n < 3; n += 1) steps.push({scene: 'pick', n});
  }
  for (let n = 0; n < 3; n += 1) steps.push({scene: 'turn', n});
  for (let n = 0; n < 3; n += 1) steps.push({scene: 'dup', n});
  if (!madness) {
    for (let n = 0; n < 4; n += 1) steps.push({scene: 'score', n});
  }
  return steps;
}

const PICKS = ['thief', 'king', 'merchant', 'builder'];

function caption(scene, lang, goal) {
  const zh = lang === 'zh';
  if (scene === 'city') return zh ? `随机区域一座座盖上，满 ${goal} 个这轮收场。` : `Random districts fill the city. At ${goal}, that round ends it.`;
  if (scene === 'pick') return zh ? '暗中选角。王冠先选。' : 'Secret pick. The crown chooses first.';
  if (scene === 'math') return zh ? '先答题。每答对一题，出价金币 +1。还不是宝库里的钱。' : 'Answer the problems. Each one right adds a bid coin — not treasure yet.';
  if (scene === 'secret') return zh ? '用这些金币暗拍。最高得。平局归王冠。' : 'Bid those coins in secret. Highest wins. A tie goes to the crown.';
  if (scene === 'pay') return zh ? '只有赢家付钱。没用完的金币进宝库。' : 'Only the winner pays. Coins you do not spend join your treasure.';
  if (scene === 'citizen') return zh ? '没拍到就拿剩余角色，或者一个平民。' : 'Win nothing and you take a leftover character, or a Citizen.';
  if (scene === 'gold') return zh ? '用自己最多 3 枚金币暗拍。最高得，平局王冠优先。' : 'Bid up to 3 of your own coins. Highest wins; the crown breaks a tie.';
  if (scene === 'turn') return zh ? '拿 2 金币，或抽 2 留 1。然后能力，然后建造。' : 'Take 2 coins, or draw 2 and keep 1. Then the ability, then build.';
  if (scene === 'dup') return zh ? '同一座城市不能有两张相同的区域。' : 'One city cannot hold two of the same district.';
  return zh ? '区域价值，五种 +3，最先完成 +4，再加上独特奖励。' : 'District values, +3 for five types, +4 for finishing first, plus Unique bonuses.';
}

/** Looping how-to, drawn with the game's own buildings, characters and tokens. */
export default function HowToFilm({lang = 'en', settings = {}}) {
  const madness = settings.mode === 'madness' || settings.mode === 'says';
  const auction = settings.select === 'auction';
  const kind = auction ? (settings.math === 'off' ? 'gold' : 'math') : 'pick';
  const goal = [6, 7, 8, 9].includes(settings.goal) ? settings.goal : 7;
  const plan = useMemo(() => planFor(goal, kind, madness), [goal, kind, madness]);
  const [tick, setTick] = useState(0);
  const [built, setBuilt] = useState(() => pickCity(goal));
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) {
      setStill(true);
      return undefined;
    }
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % plan.length);
    }, 780);
    return () => window.clearInterval(id);
  }, [plan]);

  useEffect(() => {
    if (tick % plan.length === 0) setBuilt(pickCity(goal));
  }, [tick, plan, goal]);

  const step = still
    ? kind === 'math'
      ? {scene: 'math', n: 2}
      : {scene: 'city', n: goal}
    : plan[tick % plan.length];
  const city = built.slice(0, step.scene === 'city' ? step.n : built.length).map((key, i) => ({uid: `${key}-${i}`, key}));
  const sum = built.reduce((n, key) => n + DISTRICT[key].cost, 0);
  const types = new Set(built.map((key) => DISTRICT[key].type));
  const five = TYPE_ORDER.every((t) => types.has(t));
  const dragon = built.includes('dragon-gate') ? 2 : 0;
  const showCity = step.scene === 'city' || step.scene === 'score';

  return (
    <div className={styles.film} aria-hidden="true">
      <div className={styles.filmStage}>
        {showCity ? (
          <CityPlot city={step.scene === 'score' ? built.map((key, i) => ({uid: `${key}-${i}`, key})) : city} goal={goal} scale={0.72} lang={lang} bare />
        ) : null}
        {step.scene === 'pick' ? (
          <div className={styles.filmRow}>
            <Sprite path="sultan/token-crown.webp" emoji="👑" shape="icon" size="28px" className={step.n >= 1 ? styles.filmOn : styles.filmOff} />
            {PICKS.map((key, i) => (
              <span key={key} className={step.n >= 2 && i === 0 ? styles.filmOn : styles.filmOff}>
                <Sprite path={CHARS[key].art} emoji={CHARS[key].zh} shape="tall" size="40px" label={step.n >= 2 && i === 0 ? CHARS[key].en : ''} />
              </span>
            ))}
          </div>
        ) : null}
        {step.scene === 'math' ? (
          <div className={styles.filmRow}>
            <span className={styles.filmSum}>{step.n >= 1 ? '4 × 3 = 12' : '4 × 3'}</span>
            <span className={styles.filmPurse}>
              {Array.from({length: step.n === 0 ? 0 : step.n === 1 ? 1 : 3}, (_, i) => (
                <Sprite key={i} path="sultan/token-coin.webp" emoji="🪙" shape="token" size="22px" />
              ))}
            </span>
          </div>
        ) : null}
        {step.scene === 'secret' ? (
          <div className={styles.filmRow}>
            {[
              ['thief', 1, false],
              ['merchant', 2, true],
              ['builder', 2, false],
            ].map(([key, coins, crowned]) => (
              <span key={key} className={step.n >= 2 && crowned ? styles.filmOn : step.n >= 1 && !crowned && coins < 2 ? styles.filmDim : undefined}>
                <Sprite
                  path={CHARS[key].art}
                  emoji={CHARS[key].zh}
                  shape="tall"
                  size="40px"
                  className={step.n === 0 ? styles.filmOff : undefined}
                />
                <span className={styles.filmBid}>
                  {step.n === 0 ? '?' : coins}
                  {step.n >= 1 ? <Sprite path="sultan/token-coin.webp" emoji="🪙" shape="token" size="16px" /> : null}
                  {crowned && step.n >= 2 ? <Sprite path="sultan/token-crown.webp" emoji="👑" shape="icon" size="16px" /> : null}
                </span>
              </span>
            ))}
          </div>
        ) : null}
        {step.scene === 'pay' ? (
          <div className={styles.filmRow}>
            <Sprite path={CHARS.merchant.art} emoji={CHARS.merchant.zh} shape="tall" size="40px" className={step.n >= 1 ? styles.filmDim : undefined} />
            <span className={styles.filmPurse}>
              {Array.from({length: step.n === 0 ? 3 : 0}, (_, i) => (
                <Sprite key={i} path="sultan/token-coin.webp" emoji="🪙" shape="token" size="22px" />
              ))}
            </span>
            {step.n >= 1 ? (
              <>
                <span className={styles.filmArrow}>→</span>
                <span className={styles.filmPile}>
                  <Sprite path={DISTRICT['imperial-treasury'].art} emoji="🏛️" size="48px" />
                  <Sprite path="sultan/token-coin.webp" emoji="🪙" shape="token" size="22px" />
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        {step.scene === 'citizen' ? (
          <div className={styles.filmRow}>
            <span className={step.n >= 1 ? styles.filmDim : undefined}>
              <Sprite path={CHARS.builder.art} emoji={CHARS.builder.zh} shape="tall" size="40px" className={styles.filmOff} />
            </span>
            {step.n >= 1 ? (
              <>
                <span className={styles.filmArrow}>→</span>
                <Sprite path={CHARS.citizenA.art} emoji={CHARS.citizenA.zh} shape="tall" size="40px" label={lang === 'zh' ? CHARS.citizenA.zh : CHARS.citizenA.en} />
              </>
            ) : null}
          </div>
        ) : null}
        {step.scene === 'gold' ? (
          <div className={styles.filmRow}>
            <span className={styles.filmPurse}>
              {Array.from({length: 3}, (_, i) => (
                <Sprite key={i} path="sultan/token-coin.webp" emoji="🪙" shape="token" size="22px" />
              ))}
            </span>
            {step.n >= 1
              ? [
                  ['thief', 2, true],
                  ['merchant', 2, false],
                  ['builder', 1, false],
                ].map(([key, coins, crowned]) => (
                  <span key={key} className={step.n >= 2 && crowned ? styles.filmOn : step.n >= 2 ? styles.filmDim : undefined}>
                    <Sprite path={CHARS[key].art} emoji={CHARS[key].zh} shape="tall" size="36px" />
                    <span className={styles.filmBid}>
                      {coins}
                      <Sprite path="sultan/token-coin.webp" emoji="🪙" shape="token" size="14px" />
                      {crowned && step.n >= 2 ? <Sprite path="sultan/token-crown.webp" emoji="👑" shape="icon" size="16px" /> : null}
                    </span>
                  </span>
                ))
              : null}
          </div>
        ) : null}
        {step.scene === 'turn' ? (
          <div className={styles.filmRow}>
            <span className={step.n === 0 ? styles.filmOn : styles.filmDim}>
              <Sprite path="sultan/token-coin.webp" emoji="🪙" shape="token" size="36px" label="2" />
            </span>
            <span className={styles.filmArrow}>→</span>
            <span className={step.n === 1 ? styles.filmOn : styles.filmDim}>
              <Sprite path={CHARS.builder.art} emoji={CHARS.builder.zh} shape="tall" size="40px" />
            </span>
            <span className={styles.filmArrow}>→</span>
            <span className={step.n === 2 ? styles.filmOn : styles.filmDim}>
              <Sprite path={DISTRICT.tavern.art} emoji="🏛️" size="40px" label={String(DISTRICT.tavern.cost)} />
            </span>
          </div>
        ) : null}
        {step.scene === 'dup' ? (
          <div className={styles.filmRow}>
            <Sprite path={DISTRICT.tavern.art} emoji="🏛️" size="52px" label={String(DISTRICT.tavern.cost)} />
            {step.n >= 1 ? (
              <span className={step.n >= 2 ? styles.filmReject : undefined}>
                <Sprite path={DISTRICT.tavern.art} emoji="🏛️" size="52px" label={String(DISTRICT.tavern.cost)} />
              </span>
            ) : (
              <span className={styles.filmSlot} />
            )}
          </div>
        ) : null}
        {step.scene === 'score' ? (
          <ul className={styles.filmScore}>
            <li>{sum}</li>
            {step.n >= 1 && five ? <li>+3</li> : null}
            {step.n >= 2 ? <li>+4</li> : null}
            {step.n >= 3 && dragon ? <li>+{dragon}</li> : null}
          </ul>
        ) : null}
      </div>
      <p className={styles.filmCaption}>{caption(step.scene, lang, goal)}</p>
    </div>
  );
}
