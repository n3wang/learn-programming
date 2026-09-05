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

function statExpectPayoff() {
  const a = randInt(1, 3);
  const b = a + randInt(2, 4);
  const pA = pick([0.2, 0.3, 0.4]);
  const pB = round2(1 - pA);
  const ex = round2(a * pA + b * pB);
  return {
    prompt:
      `A promo pays $${a} with probability ${pA} and $${b} otherwise. What is the expected payout E[X]? Round to 2 decimals.`,
    answer: ex,
    why: `E[X]=${a}·${pA}+${b}·${pB}=${ex}.`,
  };
}

function statVarTwoPoint() {
  // X=0 w.p. 1-p, X=1 w.p. p → Var=p(1-p)
  const p = pick([0.2, 0.25, 0.3, 0.4]);
  const ans = round2(p * (1 - p));
  return {
    prompt:
      `A user converts (X=1) with probability ${p}, else X=0. What is Var(X)? Round to 2 decimals.`,
    answer: ans,
    why: `Bernoulli variance p(1−p)=${p}·${round2(1 - p)}=${ans}.`,
  };
}

function statUniformMean() {
  const a = randInt(0, 4);
  const b = a + randInt(4, 10);
  const ans = round2((a + b) / 2);
  return {
    prompt:
      `Delivery time (hours) is modeled as Uniform(${a}, ${b}). What is E[time]? Round to 2 decimals.`,
    answer: ans,
    why: `E[X]=(a+b)/2=${ans}.`,
  };
}

function statUniformVar() {
  const a = randInt(0, 2);
  const b = a + pick([6, 9, 12]);
  const ans = round2(((b - a) ** 2) / 12);
  return {
    prompt:
      `X ~ Uniform(${a}, ${b}). What is Var(X)? Round to 2 decimals.`,
    answer: ans,
    why: `Var=(b−a)²/12=${ans}.`,
  };
}

function statCLTSE() {
  const sigma = pick([2, 3, 4, 5]);
  const n = pick([25, 36, 49, 64, 100]);
  const ans = round2(sigma / Math.sqrt(n));
  return {
    prompt:
      `Scores have σ=${sigma}. You average n=${n} independent scores. What is the standard error of the sample mean (σ/√n)? Round to 2 decimals.`,
    answer: ans,
    why: `SE=σ/√n=${sigma}/√${n}=${ans}.`,
  };
}

function statZStat() {
  const xbar = pick([10.2, 10.5, 11, 12]);
  const mu0 = 10;
  const sigma = pick([2, 3, 4]);
  const n = pick([36, 49, 64, 100]);
  const z = (xbar - mu0) / (sigma / Math.sqrt(n));
  return {
    prompt:
      `H₀: μ=${mu0}. You observe x̄=${xbar} from n=${n} with known σ=${sigma}. What is the z test statistic (x̄−μ₀)/(σ/√n)? Round to 2 decimals.`,
    answer: round2(z),
    why: `z=${fmt(round2(z))}.`,
  };
}

function statChiSq() {
  const o = [randInt(20, 40), randInt(20, 40), randInt(20, 40)];
  const n = o[0] + o[1] + o[2];
  const e = n / 3;
  const chi = o.reduce((s, oi) => s + (oi - e) ** 2 / e, 0);
  return {
    prompt:
      `Under H₀ three categories are equally likely. Observed counts are ${o[0]}, ${o[1]}, ${o[2]}. What is χ² = Σ(O−E)²/E? Round to 2 decimals.`,
    answer: round2(chi),
    why: `E=${fmt(e, 2)}, χ²=${fmt(round2(chi))}.`,
  };
}

function statABZ() {
  const nA = pick([500, 800, 1000]);
  const nB = nA;
  const pA = pick([0.1, 0.12, 0.15]);
  const lift = pick([0.02, 0.03, 0.04]);
  const pB = round2(pA + lift);
  const cA = Math.round(pA * nA);
  const cB = Math.round(pB * nB);
  const pPool = (cA + cB) / (nA + nB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));
  const z = (cB / nB - cA / nA) / se;
  return {
    prompt:
      `A/B test: control ${cA}/${nA} conversions, treatment ${cB}/${nB}. Using the pooled two-proportion z-statistic, what is z? Round to 2 decimals.`,
    answer: round2(z),
    why: `Pooled p̂=${fmt(pPool)}, SE=${fmt(se, 4)}, z=${fmt(round2(z))}.`,
  };
}

function statCI() {
  const xbar = pick([8, 10, 12]);
  const sigma = pick([2, 3, 4]);
  const n = pick([36, 49, 64, 100]);
  const z = 1.96;
  const half = z * (sigma / Math.sqrt(n));
  const lo = round2(xbar - half);
  return {
    prompt:
      `x̄=${xbar}, σ=${sigma}, n=${n}. What is the lower endpoint of a 95% CI for μ (use z=1.96)? Round to 2 decimals.`,
    answer: lo,
    why: `Half-width=1.96·σ/√n=${fmt(half, 2)}; lower=${lo}.`,
  };
}

function statBonferroni() {
  const m = pick([10, 20, 50, 100]);
  const alpha = 0.05;
  const ans = round2(alpha / m) === 0 ? Number((alpha / m).toFixed(4)) : round2(alpha / m);
  // For m=100, 0.0005 — need more decimals. Use answer with 4 decimals via decimals field.
  return {
    prompt:
      `You run ${m} independent tests and want family-wise α=0.05 via Bonferroni. What per-test α′=α/m should you use? Round to 4 decimals.`,
    answer: Number((alpha / m).toFixed(4)),
    decimals: 4,
    why: `α/m=0.05/${m}=${(alpha / m).toFixed(4)}.`,
  };
}

function statMLE() {
  const n = randInt(10, 30);
  const k = randInt(2, n - 1);
  const ans = round2(k / n);
  return {
    prompt:
      `You observe ${k} successes in ${n} i.i.d. Bernoulli trials. What is the MLE of p? Round to 2 decimals.`,
    answer: ans,
    why: `p̂_MLE=k/n=${k}/${n}=${ans}.`,
  };
}

function statCorr() {
  // Cov=2, sdX=2, sdY=2 → rho=0.5
  const cov = pick([1, 2, 3]);
  const sx = pick([2, 4]);
  const sy = pick([2, 4]);
  const rho = cov / (sx * sy);
  return {
    prompt:
      `Cov(X,Y)=${cov}, SD(X)=${sx}, SD(Y)=${sy}. What is the correlation ρ? Round to 2 decimals.`,
    answer: round2(rho),
    why: `ρ=Cov/(σ_X σ_Y)=${cov}/(${sx}·${sy})=${fmt(round2(rho))}.`,
  };
}

function statPower() {
  const beta = pick([0.1, 0.2, 0.3]);
  return {
    prompt:
      `A test has Type II error rate β=${beta}. What is its power (1−β)? Round to 2 decimals.`,
    answer: round2(1 - beta),
    why: `Power=1−β=${round2(1 - beta)}.`,
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
  dsStatMoments: [statExpectPayoff, statVarTwoPoint],
  dsStatCorr: [statCorr],
  dsStatUniform: [statUniformMean, statUniformVar],
  dsStatCLT: [statCLTSE, statZStat],
  dsStatChi: [statChiSq],
  dsStatAB: [statABZ],
  dsStatCI: [statCI],
  dsStatErrors: [statBonferroni, statPower],
  dsStatMLE: [statMLE],
};

export function drawFromBank(bankId) {
  const gens = COMPUTE_BANKS[bankId];
  if (!gens || !gens.length) return null;
  return pick(gens)();
}
