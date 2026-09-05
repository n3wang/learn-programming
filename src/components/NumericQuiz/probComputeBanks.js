import {binomialPmf, comb, fmt, perm, poissonPmf} from '../interactive/formulaExplorer/probMath.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function niceP() {
  return pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]);
}

/** @returns {{prompt: string, answer: number, why: string, decimals?: number}} */
function bayesDisease() {
  const prior = pick([0.005, 0.01, 0.02, 0.05]);
  const sens = pick([0.9, 0.95, 0.99]);
  const fpr = pick([0.02, 0.05, 0.1]);
  const pB = sens * prior + fpr * (1 - prior);
  const post = (sens * prior) / pB;
  return {
    prompt:
      `A medical clinic screens for a rare condition that affects about ${(prior * 100).toFixed(1)}% of people in this population. ` +
      `Their lab test correctly flags ${Math.round(sens * 100)}% of true cases, but also falsely flags ${Math.round(fpr * 100)}% of healthy people. ` +
      `Someone just tested positive. What is the probability they actually have the condition? Round to 2 decimals.`,
    answer: round2(post),
    why:
      `Prior=${fmt(prior)}, sensitivity=${fmt(sens)}, FPR=${fmt(fpr)}. ` +
      `P(positive)=${fmt(pB)}, posterior=${fmt(post)} → ${fmt(round2(post))}.`,
  };
}

function bayesSpam() {
  const prior = pick([0.2, 0.3, 0.4]);
  const sens = pick([0.85, 0.9, 0.95]);
  const fpr = pick([0.05, 0.1, 0.15]);
  const pB = sens * prior + fpr * (1 - prior);
  const post = (sens * prior) / pB;
  return {
    prompt:
      `About ${Math.round(prior * 100)}% of inbox mail is spam. A filter catches ${Math.round(sens * 100)}% of spam emails, ` +
      `but also marks ${Math.round(fpr * 100)}% of legitimate mail as spam. ` +
      `An email was flagged. Probability it really is spam? Round to 2 decimals.`,
    answer: round2(post),
    why: `Same Bayes setup: posterior = ${fmt(post)} → ${fmt(round2(post))}.`,
  };
}

function bayesFraud() {
  const prior = pick([0.01, 0.02, 0.03]);
  const sens = pick([0.92, 0.95, 0.98]);
  const fpr = pick([0.03, 0.05, 0.08]);
  const pB = sens * prior + fpr * (1 - prior);
  const post = (sens * prior) / pB;
  return {
    prompt:
      `Fraud is rare: only ${(prior * 100).toFixed(0)}% of transactions are fraudulent. ` +
      `A detector catches ${Math.round(sens * 100)}% of frauds and false-alarms on ${Math.round(fpr * 100)}% of good transactions. ` +
      `Given an alert, what’s P(fraud)? Round to 2 decimals.`,
    answer: round2(post),
    why: `Posterior ≈ ${fmt(round2(post))}.`,
  };
}

function totalUsers() {
  const pNew = pick([0.3, 0.4, 0.5, 0.6]);
  const rateNew = pick([0.2, 0.25, 0.3, 0.35]);
  const rateRet = pick([0.05, 0.1, 0.12, 0.15]);
  const pA = pNew * rateNew + (1 - pNew) * rateRet;
  return {
    prompt:
      `${Math.round(pNew * 100)}% of shoppers today are first-time visitors; each of them buys with probability ${rateNew}. ` +
      `Returning shoppers buy with probability ${rateRet}. ` +
      `What’s the overall purchase probability for a random shopper? Round to 2 decimals.`,
    answer: round2(pA),
    why: `P(buy)=${fmt(pNew)}·${fmt(rateNew)}+${fmt(1 - pNew)}·${fmt(rateRet)}=${fmt(pA)} → ${fmt(round2(pA))}.`,
  };
}

function totalDevices() {
  const pMobile = pick([0.55, 0.6, 0.7]);
  const cMobile = pick([0.02, 0.03, 0.04]);
  const cDesktop = pick([0.05, 0.06, 0.08]);
  const pA = pMobile * cMobile + (1 - pMobile) * cDesktop;
  return {
    prompt:
      `${Math.round(pMobile * 100)}% of sessions are on mobile (click rate ${cMobile}); the rest are desktop (click rate ${cDesktop}). ` +
      `Overall click probability? Round to 2 decimals.`,
    answer: round2(pA),
    why: `Mixture = ${fmt(round2(pA))}.`,
  };
}

function countInterviewPerm() {
  const n = randInt(4, 8);
  const k = randInt(2, Math.min(3, n));
  const ans = perm(n, k);
  return {
    prompt:
      `A hiring team has ${n} candidates and ${k} interview slots in a fixed order (morning, afternoon, …). ` +
      `Order matters: who interviews when is different. How many ways can they fill the slots? (Integer)`,
    answer: ans,
    decimals: 0,
    why: `n=${n} candidates, k=${k} ordered slots → P(${n},${k})=${ans}.`,
  };
}

function countShortlistComb() {
  const n = randInt(5, 10);
  const k = randInt(2, Math.min(4, n));
  const ans = comb(n, k);
  return {
    prompt:
      `You have ${n} applicants and need an unordered shortlist of ${k} (no ranking). ` +
      `How many different shortlists are possible? (Integer)`,
    answer: ans,
    decimals: 0,
    why: `n=${n}, k=${k} unordered → C(${n},${k})=${ans}.`,
  };
}

function countPasswordPerm() {
  const n = randInt(5, 8);
  const k = randInt(2, 4);
  const ans = perm(n, k);
  return {
    prompt:
      `A PIN uses ${k} distinct digits chosen from a set of ${n} allowed symbols, and order matters. ` +
      `How many PINs are possible? (Integer)`,
    answer: ans,
    decimals: 0,
    why: `Ordered selection → P(${n},${k})=${ans}.`,
  };
}

function countRestaurants() {
  const n = randInt(6, 12);
  const k = randInt(2, 3);
  const ans = comb(n, k);
  return {
    prompt:
      `A map shows ${n} nearby restaurants. You want to pick ${k} of them for a weekend crawl (order of the set doesn’t matter). ` +
      `How many choices? (Integer)`,
    answer: ans,
    decimals: 0,
    why: `C(${n},${k})=${ans}.`,
  };
}

function rvBinomPmf() {
  const n = randInt(5, 8);
  const p = 0.5;
  const k = randInt(2, n - 1);
  const ans = binomialPmf(n, p, k);
  return {
    prompt:
      `A fair coin is flipped ${n} times. What’s the probability of getting exactly ${k} heads? Round to 2 decimals.`,
    answer: round2(ans),
    why: `Binomial n=${n}, p=0.5, k=${k} → ${fmt(ans)} → ${fmt(round2(ans))}.`,
  };
}

function rvBinomCdf() {
  const n = 5;
  const p = 0.5;
  const x = randInt(0, 2);
  let Fx = 0;
  for (let k = 0; k <= x; k++) Fx += binomialPmf(n, p, k);
  return {
    prompt:
      `A quiz has ${n} true/false questions; a student guesses each with probability ${p} of being right. ` +
      `What’s P(at most ${x} correct)? Round to 2 decimals.`,
    answer: round2(Fx),
    why: `F(${x})=P(X≤${x})=${fmt(Fx)} → ${fmt(round2(Fx))}.`,
  };
}

function jointClickBuy() {
  const p00 = pick([0.35, 0.4, 0.45]);
  const p01 = pick([0.05, 0.1]);
  const p10 = pick([0.15, 0.2, 0.25]);
  const p11 = round2(1 - p00 - p01 - p10);
  if (p11 < 0.05) return jointClickBuy();
  const askX = Math.random() < 0.5;
  if (askX) {
    const ans = round2(p10 + p11);
    return {
      prompt:
        `In an A/B log, each session is (clicked?, purchased?): ` +
        `P(no click, no buy)=${p00}, P(no click, buy)=${p01}, P(click, no buy)=${p10}, P(click, buy)=${p11}. ` +
        `What fraction of sessions had a click? Round to 2 decimals.`,
      answer: ans,
      why: `P(click)=${p10}+${p11}=${ans}.`,
    };
  }
  const ans = round2(p00 + p10);
  return {
    prompt:
      `Sessions tagged (clicked?, purchased?): ` +
      `P(0,0)=${p00}, P(0,1)=${p01}, P(1,0)=${p10}, P(1,1)=${p11}. ` +
      `What is P(no purchase)? Round to 2 decimals.`,
    answer: ans,
    why: `P(Y=0)=${p00}+${p10}=${ans}.`,
  };
}

function binomUsers() {
  const n = randInt(8, 14);
  const p = niceP();
  let k = randInt(2, Math.min(5, n - 1));
  const ans = binomialPmf(n, p, k);
  // Prefer answers that aren't tiny
  if (ans < 0.02) {
    k = Math.max(1, Math.round(n * p));
  }
  const final = binomialPmf(n, p, k);
  return {
    prompt:
      `${n} users each independently convert with probability ${p}. ` +
      `What’s the probability that exactly ${k} of them convert? Round to 2 decimals.`,
    answer: round2(final),
    why: `Recognize Binomial: n=${n}, p=${p}, k=${k} → ${fmt(final)} → ${fmt(round2(final))}.`,
  };
}

function binomSensors() {
  const n = randInt(6, 12);
  const p = pick([0.2, 0.25, 0.3]);
  const k = randInt(1, 3);
  const ans = binomialPmf(n, p, k);
  return {
    prompt:
      `A factory runs ${n} independent quality checks; each fails with probability ${p}. ` +
      `Probability of exactly ${k} failures? Round to 2 decimals.`,
    answer: round2(ans),
    why: `Binomial n=${n}, p=${p}, k=${k} → ${fmt(round2(ans))}.`,
  };
}

function binomExpect() {
  const n = randInt(10, 20);
  const p = pick([0.2, 0.25, 0.3, 0.4]);
  const ans = n * p;
  return {
    prompt:
      `You email ${n} customers; each opens with probability ${p}, independently. ` +
      `What’s the expected number of opens? Round to 2 decimals.`,
    answer: round2(ans),
    why: `E[X]=np=${n}·${p}=${ans}.`,
  };
}

function poisVisits() {
  const lambda = pick([2, 3, 4, 5]);
  const k = randInt(1, Math.min(4, lambda + 1));
  const ans = poissonPmf(lambda, k);
  return {
    prompt:
      `A help desk gets about ${lambda} tickets per hour on average (Poisson). ` +
      `What’s P(exactly ${k} tickets in the next hour)? Round to 2 decimals.`,
    answer: round2(ans),
    why: `Poisson λ=${lambda}, k=${k} → ${fmt(ans)} → ${fmt(round2(ans))}.`,
  };
}

function poisBugs() {
  const lambda = pick([1, 2, 3]);
  const k = randInt(0, 2);
  const ans = poissonPmf(lambda, k);
  return {
    prompt:
      `Defects appear at rate λ=${lambda} per roll of fabric. ` +
      `Probability a roll has exactly ${k} defects? Round to 2 decimals.`,
    answer: round2(ans),
    why: `Poisson → ${fmt(round2(ans))}.`,
  };
}

function unifBus() {
  const b = pick([10, 12, 15, 20]);
  const wait = randInt(2, Math.floor(b / 2));
  const ans = wait / b;
  return {
    prompt:
      `A shuttle arrives uniformly at random in the next ${b} minutes. ` +
      `You show up now. Probability you wait at most ${wait} minutes? Round to 2 decimals.`,
    answer: round2(ans),
    why: `Uniform(0,${b}): F(${wait})=${wait}/${b}=${fmt(round2(ans))}.`,
  };
}

function expSupport() {
  const lambda = pick([0.5, 1, 2]);
  const t = pick([1, 2, 3]);
  const ans = Math.exp(-lambda * t);
  return {
    prompt:
      `Support tickets are answered with Exponential waiting times at rate λ=${lambda} per hour. ` +
      `What’s P(you wait more than ${t} hour${t === 1 ? '' : 's'})? Round to 2 decimals.`,
    answer: round2(ans),
    why: `P(T>${t})=e^{-${lambda}·${t}}=${fmt(ans)} → ${fmt(round2(ans))}.`,
  };
}

function expMean() {
  const lambda = pick([0.5, 1, 2, 4]);
  const ans = 1 / lambda;
  return {
    prompt:
      `Customer arrivals follow a Poisson process with rate λ=${lambda} per minute, so gaps are Exponential(λ). ` +
      `What’s the average gap (minutes) between arrivals? Round to 2 decimals.`,
    answer: round2(ans),
    why: `E[T]=1/λ=${fmt(round2(ans))}.`,
  };
}

function normalVar() {
  const sigma = pick([1.5, 2, 2.5, 3, 4]);
  const mu = randInt(50, 120);
  return {
    prompt:
      `Exam scores look roughly Normal with mean ${mu} and standard deviation ${sigma}. ` +
      `What is the variance of a score? Round to 2 decimals.`,
    answer: round2(sigma * sigma),
    why: `Var=σ²=${sigma}²=${fmt(round2(sigma * sigma))}.`,
  };
}

function markovChurn() {
  const p01 = pick([0.2, 0.25, 0.3, 0.4]);
  const p10 = pick([0.1, 0.15, 0.2, 0.25]);
  const pi1 = p01 / (p01 + p10);
  const askActive = Math.random() < 0.5;
  if (askActive) {
    return {
      prompt:
        `Users are inactive (0) or active (1). Each week, ${Math.round(p01 * 100)}% of inactive users become active, ` +
        `and ${Math.round(p10 * 100)}% of active users go inactive. ` +
        `In the long run, what fraction are active? Round to 2 decimals.`,
      answer: round2(pi1),
      why: `π₁=p01/(p01+p10)=${fmt(round2(pi1))}.`,
    };
  }
  return {
    prompt:
      `A product has states {churned=0, retained=1}. Weekly P(0→1)=${p01} and P(1→0)=${p10}. ` +
      `Long-run share churned (π₀)? Round to 2 decimals.`,
    answer: round2(1 - pi1),
    why: `π₀=p10/(p01+p10)=${fmt(round2(1 - pi1))}.`,
  };
}

function markovServer() {
  const p01 = pick([0.1, 0.15, 0.2]);
  const p10 = pick([0.3, 0.4, 0.5]);
  const pi0 = p10 / (p01 + p10);
  return {
    prompt:
      `A machine is Up (1) or Down (0). Each day P(Down→Up)=${p01} and P(Up→Down)=${p10}. ` +
      `Long-run fraction of days Down? Round to 2 decimals.`,
    answer: round2(pi0),
    why: `π₀=${fmt(round2(pi0))}.`,
  };
}

/** Named banks for <NumericQuiz bank="…" /> */
export const COMPUTE_BANKS = {
  dsBayes: [bayesDisease, bayesSpam, bayesFraud],
  dsTotal: [totalUsers, totalDevices],
  dsCounting: [countInterviewPerm, countShortlistComb, countPasswordPerm, countRestaurants],
  dsRv: [rvBinomPmf, rvBinomCdf],
  dsJoint: [jointClickBuy],
  dsDiscrete: [binomUsers, binomSensors, binomExpect, poisVisits, poisBugs],
  dsContinuous: [unifBus, expSupport, expMean, normalVar],
  dsMarkov: [markovChurn, markovServer],
};

export function drawFromBank(bankId) {
  const gens = COMPUTE_BANKS[bankId];
  if (!gens || !gens.length) return null;
  return pick(gens)();
}
