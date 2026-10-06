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

function mlEigenScale() {
  // A = [[a,0],[0,b]] diagonal → eigenvalues a,b; apply to e1 → λ=a
  const a = pick([2, 3, 4, 5, -2]);
  const b = pick([1, 2, 6, -1]);
  return {
    prompt:
      `Let A = [[${a}, 0], [0, ${b}]] and x = [1, 0]. ` +
      `If Ax = λx, what is the eigenvalue λ for this eigenvector? Round to 2 decimals.`,
    answer: round2(a),
    why: `Ax = [${a}, 0] = ${a}·[1, 0], so λ=${a}.`,
  };
}

function mlEigen2d() {
  // A[[2,0],[0,3]] style already covered; use Ax for x=[1,1] on diag
  const a = pick([2, 3, 4]);
  const b = pick([2, 3, 5]);
  // For non-eigen vector on diagonal matrix, ||Ax|| / ||x|| is not λ;
  // ask for the scaled first component after applying A to [1,0]
  return {
    prompt:
      `Diagonal matrix A = [[${a}, 0], [0, ${b}]] stretches the x-axis by a factor. ` +
      `What is that stretch factor (the eigenvalue for [1, 0])? Round to 2 decimals.`,
    answer: round2(a),
    why: `Eigenpair: A[1,0]^T = ${a}[1,0]^T.`,
  };
}

function mlGradStep() {
  const x = pick([2, 3, 4, 5, 10]);
  const g = pick([1, 2, 4, 5, -2, -4]);
  const alpha = pick([0.1, 0.2, 0.5, 0.25]);
  const next = x - alpha * g;
  return {
    prompt:
      `One gradient-descent update: x ← x − α ∇f(x). ` +
      `Currently x=${x}, α=${alpha}, and ∇f(x)=${g}. What is the next x? Round to 2 decimals.`,
    answer: round2(next),
    why: `x_new = ${x} − ${alpha}·(${g}) = ${round2(next)}.`,
  };
}

function mlGradStep2d() {
  const x = pick([1, 2, 3]);
  const y = pick([4, 5, 6]);
  const gx = pick([2, 4, -2]);
  const gy = pick([1, 3, -1]);
  const alpha = pick([0.1, 0.5]);
  const nx = round2(x - alpha * gx);
  const ny = round2(y - alpha * gy);
  // Ask for the first coordinate only to keep a single numeric answer
  return {
    prompt:
      `Point (x,y)=(${x},${y}), learning rate α=${alpha}, gradient ∇f=(${gx},${gy}). ` +
      `After one GD step, what is the new x-coordinate? Round to 2 decimals.`,
    answer: nx,
    why: `x ← ${x} − ${alpha}·${gx} = ${nx} (y would become ${ny}).`,
  };
}

function mlTrainSplit() {
  const n = pick([100, 200, 500, 1000]);
  const pct = pick([0.7, 0.8, 0.9]);
  const train = Math.round(n * pct);
  return {
    prompt:
      `You have ${n} labeled rows and reserve ${Math.round(pct * 100)}% for training (rest for test). ` +
      `How many rows go into the training set?`,
    answer: train,
    decimals: 0,
    why: `${Math.round(pct * 100)}% of ${n} is ${train}.`,
  };
}

function mlTestSplit() {
  const n = pick([100, 250, 800]);
  const trainPct = pick([0.8, 0.75, 0.9]);
  const test = Math.round(n * (1 - trainPct));
  return {
    prompt:
      `Dataset size n=${n}. You use a ${Math.round(trainPct * 100)}/${Math.round((1 - trainPct) * 100)} train/test split. ` +
      `How many rows are in the test set?`,
    answer: test,
    decimals: 0,
    why: `Test fraction=${round2(1 - trainPct)} → ${test} rows.`,
  };
}

function mlL2Penalty() {
  const w = pick([
    [1, 2],
    [2, 2],
    [1, -1, 2],
    [3, 0, 1],
  ]);
  const lam = pick([0.1, 0.5, 1, 2]);
  const sq = w.reduce((s, v) => s + v * v, 0);
  const pen = round2(lam * sq);
  return {
    prompt:
      `L2 (ridge) penalty is λ∑wᵢ². Weights w=[${w.join(', ')}] and λ=${lam}. ` +
      `What is the penalty value? Round to 2 decimals.`,
    answer: pen,
    why: `∑wᵢ²=${sq}, so λ∑wᵢ²=${lam}·${sq}=${pen}.`,
  };
}

function mlL1Penalty() {
  const w = pick([
    [1, -2],
    [3, -1, 0],
    [2, 2, -1],
    [4, -2],
  ]);
  const lam = pick([0.5, 1, 2]);
  const abs = w.reduce((s, v) => s + Math.abs(v), 0);
  const pen = round2(lam * abs);
  return {
    prompt:
      `L1 (lasso) penalty is λ∑|wᵢ|. Weights w=[${w.join(', ')}] and λ=${lam}. ` +
      `What is the penalty value? Round to 2 decimals.`,
    answer: pen,
    why: `∑|wᵢ|=${abs}, so λ∑|wᵢ|=${lam}·${abs}=${pen}.`,
  };
}

function mlKFold() {
  const n = pick([100, 200, 500]);
  const k = pick([5, 10]);
  const fold = Math.round(n / k);
  return {
    prompt:
      `You run ${k}-fold cross-validation on ${n} examples (equal folds). ` +
      `How many examples are in each validation fold?`,
    answer: fold,
    decimals: 0,
    why: `n/k = ${n}/${k} = ${fold}.`,
  };
}

function mlLearningRateScale() {
  const g = pick([10, 20, 50, 100]);
  const alpha = pick([0.01, 0.05, 0.1]);
  const step = round2(alpha * g);
  return {
    prompt:
      `Gradient magnitude |∇f|=${g} and learning rate α=${alpha}. ` +
      `How large is the update step α|∇f|? Round to 2 decimals.`,
    answer: step,
    why: `Step size = α|∇f| = ${alpha}·${g} = ${step}.`,
  };
}

function mlGridSearch() {
  const a = pick([2, 3, 4]);
  const b = pick([3, 4, 5]);
  const c = pick([2, 3]);
  const total = a * b * c;
  return {
    prompt:
      `Grid search tries every combo of ${a} learning rates × ${b} depths × ${c} leaf sizes. ` +
      `How many models do you train?`,
    answer: total,
    decimals: 0,
    why: `Cartesian product = ${a}·${b}·${c} = ${total}.`,
  };
}

function mlCvAverage() {
  const errs = pick([
    [0.2, 0.3, 0.25, 0.15, 0.2],
    [0.1, 0.12, 0.14, 0.1],
    [0.4, 0.35, 0.45],
  ]);
  const avg = errs.reduce((s, v) => s + v, 0) / errs.length;
  return {
    prompt:
      `k-fold validation errors are [${errs.join(', ')}]. ` +
      `What is the mean validation error? Round to 2 decimals.`,
    answer: round2(avg),
    why: `Mean = (${errs.join('+')})/${errs.length} = ${round2(avg)}.`,
  };
}

function mlLoocvFolds() {
  const n = pick([50, 80, 100, 120]);
  return {
    prompt:
      `Leave-one-out CV on a dataset of size n=${n}. How many training/evaluation rounds run?`,
    answer: n,
    decimals: 0,
    why: `LOOCV sets k = n, so there are ${n} rounds.`,
  };
}

function mlBootstrapUnique() {
  // Expected unique ≈ n * (1 - (1-1/n)^n) ≈ 0.632 n for large n
  const n = pick([100, 200, 500, 1000]);
  const expected = round2(n * (1 - Math.pow(1 - 1 / n, n)));
  return {
    prompt:
      `You draw a bootstrap sample of size ${n} with replacement from ${n} rows. ` +
      `About how many unique rows do you expect? Use n(1−(1−1/n)ⁿ). Round to 2 decimals.`,
    answer: expected,
    why: `E[unique] ≈ ${n}(1−(1−1/${n})^{${n}}) ≈ ${expected} (~63.2% of n).`,
  };
}

function mlThreeWaySplit() {
  const n = pick([1000, 2000, 5000]);
  const trainPct = pick([0.7, 0.6]);
  const valPct = pick([0.15, 0.2]);
  const train = Math.round(n * trainPct);
  const val = Math.round(n * valPct);
  // Ask for validation count to keep one number
  return {
    prompt:
      `n=${n} rows with a ${Math.round(trainPct * 100)}/${Math.round(valPct * 100)}/${Math.round(
        (1 - trainPct - valPct) * 100,
      )} train/val/test split. How many rows are in the validation (dev) set?`,
    answer: val,
    decimals: 0,
    why: `${Math.round(valPct * 100)}% of ${n} = ${val} (train would be ${train}).`,
  };
}

function lrPredict() {
  const b0 = pick([1, 2, -1, 0]);
  const b1 = pick([2, 3, 0.5, -2]);
  const x = pick([2, 4, 5, 10]);
  const yhat = round2(b0 + b1 * x);
  return {
    prompt:
      `Simple linear model ŷ = ${b0} + ${b1}x. What is ŷ at x=${x}? Round to 2 decimals.`,
    answer: yhat,
    why: `ŷ = ${b0} + ${b1}·${x} = ${yhat}.`,
  };
}

function lrMse() {
  const errs = pick([
    [1, -1, 2, 0],
    [2, 2, -2, 0],
    [3, -1, -1, -1],
  ]);
  const mse = errs.reduce((s, e) => s + e * e, 0) / errs.length;
  return {
    prompt:
      `Residuals e = [${errs.join(', ')}]. MSE = (1/n)∑eᵢ². What is MSE? Round to 2 decimals.`,
    answer: round2(mse),
    why: `∑e²=${errs.reduce((s, e) => s + e * e, 0)}, n=${errs.length} → MSE=${round2(mse)}.`,
  };
}

function lrRmse() {
  const mse = pick([4, 9, 16, 0.25, 1]);
  const rmse = Math.sqrt(mse);
  return {
    prompt: `MSE=${mse}. What is RMSE = √MSE? Round to 2 decimals.`,
    answer: round2(rmse),
    why: `√${mse} = ${round2(rmse)}.`,
  };
}

function lrR2() {
  const pair = pick([
    [10, 50],
    [20, 80],
    [25, 100],
    [40, 200],
  ]);
  const ssRes = pair[0];
  const ssTot = pair[1];
  const r2 = 1 - ssRes / ssTot;
  return {
    prompt:
      `SS_res=${ssRes}, SS_tot=${ssTot}. R² = 1 − SS_res/SS_tot. What is R²? Round to 2 decimals.`,
    answer: round2(r2),
    why: `1 − ${ssRes}/${ssTot} = ${round2(r2)}.`,
  };
}

function lrSlopeTwoPoint() {
  // Exact slope through (x1,y1),(x2,y2) for intuition (not full OLS)
  const x1 = pick([0, 1]);
  const y1 = pick([1, 2, 0]);
  const x2 = x1 + pick([2, 4, 5]);
  const y2 = y1 + pick([4, 6, 10, -2]);
  const slope = (y2 - y1) / (x2 - x1);
  return {
    prompt:
      `A line through (${x1}, ${y1}) and (${x2}, ${y2}) has slope (y₂−y₁)/(x₂−x₁). What is the slope? Round to 2 decimals.`,
    answer: round2(slope),
    why: `(${y2}−${y1})/(${x2}−${x1}) = ${round2(slope)}.`,
  };
}

function clfPrecision() {
  const tp = pick([8, 10, 15, 20]);
  const fp = pick([2, 4, 5, 10]);
  const ans = round2(tp / (tp + fp));
  return {
    prompt: `TP=${tp}, FP=${fp}. Precision = TP/(TP+FP). Round to 2 decimals.`,
    answer: ans,
    why: `${tp}/(${tp}+${fp}) = ${ans}.`,
  };
}

function clfRecall() {
  const tp = pick([8, 12, 18]);
  const fn = pick([2, 4, 6]);
  const ans = round2(tp / (tp + fn));
  return {
    prompt: `TP=${tp}, FN=${fn}. Recall = TP/(TP+FN). Round to 2 decimals.`,
    answer: ans,
    why: `${tp}/(${tp}+${fn}) = ${ans}.`,
  };
}

function clfF1() {
  const pair = pick([
    [0.8, 0.8],
    [0.9, 0.5],
    [0.6, 0.9],
    [1.0, 0.5],
  ]);
  const [p, r] = pair;
  const f1 = (2 * p * r) / (p + r);
  return {
    prompt: `Precision=${p}, recall=${r}. F1 = 2PR/(P+R). Round to 2 decimals.`,
    answer: round2(f1),
    why: `2·${p}·${r}/(${p}+${r}) = ${round2(f1)}.`,
  };
}

function clfSpecificity() {
  const tn = pick([80, 90, 95]);
  const fp = pick([5, 10, 20]);
  const ans = round2(tn / (tn + fp));
  return {
    prompt: `TN=${tn}, FP=${fp}. Specificity = TN/(TN+FP). Round to 2 decimals.`,
    answer: ans,
    why: `${tn}/(${tn}+${fp}) = ${ans}.`,
  };
}

function clfAccuracy() {
  const tp = pick([40, 50]);
  const tn = pick([40, 45]);
  const fp = pick([5, 10]);
  const fn = pick([5, 10]);
  const n = tp + tn + fp + fn;
  const ans = round2((tp + tn) / n);
  return {
    prompt: `TP=${tp}, TN=${tn}, FP=${fp}, FN=${fn}. Accuracy = (TP+TN)/n. Round to 2 decimals.`,
    answer: ans,
    why: `(${tp}+${tn})/${n} = ${ans}.`,
  };
}

function clfSigmoid() {
  const z = pick([0, 1, 2, -1, -2]);
  const s = 1 / (1 + Math.exp(-z));
  return {
    prompt: `Sigmoid σ(z)=1/(1+e^(−z)). What is σ(${z})? Round to 2 decimals.`,
    answer: round2(s),
    why: `σ(${z}) = ${round2(s)}.`,
  };
}

function clfBinaryEntropy() {
  const p = pick([0.5, 0.8, 0.2, 1.0, 0.0]);
  let h = 0;
  if (p > 0 && p < 1) {
    h = -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  }
  return {
    prompt:
      `Binary entropy H(p)=−p log₂ p − (1−p) log₂(1−p) (0 at p∈{0,1}). What is H(${p})? Round to 2 decimals.`,
    answer: round2(h),
    why: p === 0 || p === 1 ? 'No uncertainty → H=0.' : `H(${p}) ≈ ${round2(h)}.`,
  };
}

function ensBagVar() {
  const sigma2 = pick([1, 2, 4, 9]);
  const B = pick([4, 5, 10, 25]);
  const ans = round2(sigma2 / B);
  return {
    prompt:
      `Bagging average of B uncorrelated trees each with variance σ². σ²=${sigma2}, B=${B}. ` +
      `What is Var(mean) = σ²/B? Round to 2 decimals.`,
    answer: ans,
    why: `${sigma2}/${B} = ${ans}.`,
  };
}

function ensMtrySqrt() {
  const p = pick([9, 16, 25, 36, 100]);
  const ans = Math.floor(Math.sqrt(p));
  return {
    prompt: `Classic RF classification default mtry ≈ ⌊√p⌋. For p=${p} features, what is ⌊√p⌋?`,
    answer: ans,
    why: `√${p}=${Math.sqrt(p)} → floor ${ans}.`,
  };
}

function ensSoftVote() {
  const probs = pick([
    [0.2, 0.8, 0.6],
    [0.9, 0.7, 0.5],
    [0.1, 0.3, 0.2],
  ]);
  const ans = round2(probs.reduce((s, v) => s + v, 0) / probs.length);
  return {
    prompt:
      `Three trees output P(Y=1)=[${probs.join(', ')}]. Soft-vote forest probability is the mean. Round to 2 decimals.`,
    answer: ans,
    why: `(${probs.join('+')})/${probs.length} = ${ans}.`,
  };
}

function ensBoostShrink() {
  const F = pick([0, 1, 2]);
  const resid = pick([1, 2, 0.5]);
  const nu = pick([0.1, 0.5, 1]);
  const ans = round2(F + nu * resid);
  return {
    prompt:
      `Gradient boosting update: F ← F + ν·h. Current F=${F}, weak learner predicts h=${resid} on the residual, ν=${nu}. ` +
      `What is the new F? Round to 2 decimals.`,
    answer: ans,
    why: `${F}+${nu}·${resid}=${ans}.`,
  };
}

function ensAdaWeightBump() {
  const w = pick([0.25, 0.2, 0.5]);
  const alpha = pick([0.5, 1.0, 0.7]);
  const ans = round2(w * Math.exp(alpha));
  return {
    prompt:
      `AdaBoost: a misclassified point has weight w=${w}. Multiply by e^α with α=${alpha} (before normalize). ` +
      `What is the new unnormalized weight? Round to 2 decimals.`,
    answer: ans,
    why: `${w}·e^${alpha}=${ans}.`,
  };
}

function pcaCumVar() {
  const evals = pick([
    [4, 2, 1, 1],
    [5, 3, 1],
    [6, 2, 1, 1],
    [3, 3, 2, 1, 1],
  ]);
  const k = pick([1, 2, Math.min(3, evals.length)]);
  const total = evals.reduce((s, v) => s + v, 0);
  const kept = evals.slice(0, k).reduce((s, v) => s + v, 0);
  const ans = round2(kept / total);
  return {
    prompt:
      `Eigenvalues λ=[${evals.join(', ')}]. Cumulative variance of the top k=${k} components is ` +
      `(λ₁+⋯+λₖ)/Σλ. Round to 2 decimals.`,
    answer: ans,
    why: `${kept}/${total}=${ans}.`,
  };
}

function pcaPc1Share() {
  const evals = pick([
    [4, 1, 1],
    [3, 1],
    [5, 2, 1, 1],
  ]);
  const total = evals.reduce((s, v) => s + v, 0);
  const ans = round2(evals[0] / total);
  return {
    prompt: `Eigenvalues λ=[${evals.join(', ')}]. What fraction of variance does PC1 explain (λ₁/Σλ)? Round to 2 decimals.`,
    answer: ans,
    why: `${evals[0]}/${total}=${ans}.`,
  };
}

function clustSse1d() {
  const pts = pick([
    [0, 1, 2],
    [1, 2, 3],
    [8, 9, 10],
  ]);
  const mu = pick([1, 2, 0, 9]);
  const sse = pts.reduce((s, x) => s + (x - mu) ** 2, 0);
  return {
    prompt:
      `One cluster with points [${pts.join(', ')}] and centroid μ=${mu}. ` +
      `SSE = Σ(x−μ)². What is SSE? Round to 2 decimals.`,
    answer: round2(sse),
    why: `Σ(x−${mu})² = ${round2(sse)}.`,
  };
}

function clustAssign1d() {
  const x = pick([3, 4, 5, 6, 7]);
  const mu0 = 1;
  const mu1 = 9;
  const d0 = (x - mu0) ** 2;
  const d1 = (x - mu1) ** 2;
  const ans = d0 <= d1 ? 0 : 1;
  return {
    prompt:
      `k-means assign: centroids μ₀=${mu0}, μ₁=${mu1}. Point x=${x}. ` +
      `Which cluster label (0 or 1) by nearest centroid (squared Euclidean)?`,
    answer: ans,
    why: `d²→μ₀=${d0}, d²→μ₁=${d1} → cluster ${ans}.`,
  };
}

function clustCentroidMean() {
  const pts = pick([
    [0, 2, 4],
    [1, 3, 5],
    [8, 10, 12],
  ]);
  const ans = round2(pts.reduce((s, x) => s + x, 0) / pts.length);
  return {
    prompt: `k-means centroid update: points [${pts.join(', ')}]. New μ = mean. Round to 2 decimals.`,
    answer: ans,
    why: `(${pts.join('+')})/${pts.length}=${ans}.`,
  };
}

function nnRelu() {
  const z = pick([-2, -1, 0, 0.5, 1, 2, 3]);
  const ans = round2(Math.max(0, z));
  return {
    prompt: `ReLU(z)=max(0,z). What is ReLU(${z})? Round to 2 decimals.`,
    answer: ans,
    why: `max(0,${z})=${ans}.`,
  };
}

function nnSigmoidNn() {
  const z = pick([0, 1, 2, -1, -2]);
  const ans = round2(1 / (1 + Math.exp(-z)));
  return {
    prompt: `Sigmoid σ(z)=1/(1+e^(−z)). What is σ(${z})? Round to 2 decimals.`,
    answer: ans,
    why: `σ(${z})=${ans}.`,
  };
}

function nnTanh() {
  const z = pick([0, 1, 2, -1]);
  const ans = round2(Math.tanh(z));
  return {
    prompt: `What is tanh(${z})? Round to 2 decimals.`,
    answer: ans,
    why: `tanh(${z})=${ans}.`,
  };
}

function nnSoftplus() {
  const z = pick([0, 1, 2, -2]);
  const ans = round2(Math.log(1 + Math.exp(z)));
  return {
    prompt: `Softplus(z)=ln(1+e^z). What is softplus(${z})? Round to 2 decimals.`,
    answer: ans,
    why: `ln(1+e^${z})=${ans}.`,
  };
}

function nnDropoutKeep() {
  const p = pick([0.5, 0.8, 0.3]);
  const n = pick([10, 32, 64]);
  const ans = round2(p * n);
  return {
    prompt: `Dropout keep probability p=${p}, layer width n=${n}. Expected active units ≈ p·n. Round to 2 decimals.`,
    answer: ans,
    why: `${p}·${n}=${ans}.`,
  };
}

function nnBackpropGrad() {
  const w = pick([0.5, 1, 1.5]);
  const x = pick([2, 3]);
  const y = pick([0, 1]);
  const z = w * x;
  const g = round2((z - y) * x);
  return {
    prompt:
      `L=½(wx−y)² with w=${w}, x=${x}, y=${y}. What is ∂L/∂w=(wx−y)·x? Round to 2 decimals.`,
    answer: g,
    why: `z=${z}, (z−y)·x=${g}.`,
  };
}

function nnSgdStep() {
  const w = pick([0.5, 1]);
  const g = pick([2, 4, 6]);
  const alpha = pick([0.1, 0.05]);
  const ans = round2(w - alpha * g);
  return {
    prompt: `SGD: w ← w − α ∂L/∂w. w=${w}, α=${alpha}, ∂L/∂w=${g}. New w? Round to 2 decimals.`,
    answer: ans,
    why: `${w}−${alpha}·${g}=${ans}.`,
  };
}

function nnMomentumStep() {
  const beta = pick([0.9, 0.8]);
  const v = pick([0, 1]);
  const g = pick([1, 0.5]);
  const ans = round2(beta * v + g);
  return {
    prompt: `Momentum: v ← βv + g. β=${beta}, current v=${v}, g=${g}. New v? Round to 2 decimals.`,
    answer: ans,
    why: `${beta}·${v}+${g}=${ans}.`,
  };
}

function nnVanishProd() {
  const slope = pick([0.5, 0.8, 0.9]);
  const depth = pick([3, 5, 10]);
  const ans = round2(slope ** depth);
  return {
    prompt:
      `Toy vanishing product: each layer multiplies gradient by ${slope}. After ${depth} layers, what is (${slope})^${depth}? Round to 2 decimals.`,
    answer: ans,
    why: `${slope}^${depth}=${ans}.`,
  };
}

function rlDiscountReturn() {
  const rewards = pick([
    [1, 1, 1],
    [1, 0, 1],
    [2, 2, 2],
    [1, -1, 1],
    [5],
    [10, 0, 0],
    [0, 0, 10],
  ]);
  const gamma = pick([0.9, 0.5, 1.0, 0.0]);
  let G = 0;
  for (let i = rewards.length - 1; i >= 0; i--) {
    G = rewards[i] + gamma * G;
  }
  return {
    prompt:
      `Discounted return G=Σ γ^k r_k for rewards [${rewards.join(', ')}] and γ=${gamma}. ` +
      `Compute G (process from the end). Round to 2 decimals.`,
    answer: round2(G),
    why: `Backward: G ← r + γG → ${round2(G)}.`,
  };
}

function rlQUpdate() {
  const Q = pick([0, 1, 2]);
  const alpha = pick([0.1, 0.5, 0.2]);
  const r = pick([1, 0, -1, 2]);
  const gamma = pick([0.9, 0.5, 0.99]);
  const maxQp = pick([0, 1, 2, 4]);
  const ans = round2(Q + alpha * (r + gamma * maxQp - Q));
  return {
    prompt:
      `Q-learning: Q ← Q + α(r + γ maxQ′ − Q). Q=${Q}, α=${alpha}, r=${r}, γ=${gamma}, maxQ′=${maxQp}. ` +
      `New Q? Round to 2 decimals.`,
    answer: ans,
    why: `TD target=${round2(r + gamma * maxQp)}; new Q=${ans}.`,
  };
}

function rlBellman() {
  const r = pick([1, 0, 5, -1]);
  const gamma = pick([0.9, 0.5, 0.99, 0]);
  const vp = pick([10, 4, 5, 0, 1]);
  const ans = round2(r + gamma * vp);
  return {
    prompt: `Bellman backup V ≈ r + γ V′. r=${r}, γ=${gamma}, V′=${vp}. Round to 2 decimals.`,
    answer: ans,
    why: `${r}+${gamma}·${vp}=${ans}.`,
  };
}

function wfZScore() {
  const x = pick([10, 0, 5, 12]);
  const mu = pick([5, 0, 8]);
  const sig = pick([2, 1, 4]);
  const ans = round2((x - mu) / sig);
  return {
    prompt: `Standardize: z=(x−μ)/σ. x=${x}, μ=${mu}, σ=${sig}. Round to 2 decimals.`,
    answer: ans,
    why: `(${x}−${mu})/${sig}=${ans}.`,
  };
}

function wfMinMax() {
  const x = pick([5, 0, 10, 2]);
  const lo = 0;
  const hi = pick([10, 5, 20]);
  const ans = round2((x - lo) / (hi - lo));
  return {
    prompt: `Min-max scale to [0,1]: (x−min)/(max−min). x=${x}, min=${lo}, max=${hi}. Round to 2 decimals.`,
    answer: ans,
    why: `(${x}−${lo})/(${hi}−${lo})=${ans}.`,
  };
}

function wfTrainTestCount() {
  const n = pick([100, 200, 1000, 50]);
  const testFrac = pick([0.2, 0.1, 0.3]);
  const nTest = Math.round(n * testFrac);
  const nTrain = n - nTest;
  return {
    prompt: `n=${n} rows, test fraction=${testFrac}. How many train rows if n_test=round(n·frac)?`,
    answer: nTrain,
    why: `n_test=${nTest}, n_train=${nTrain}.`,
  };
}

function psKFactor() {
  const i = pick([1, 2, 3, 5]);
  const c = pick([0.2, 0.25, 0.3, 0.4]);
  const ans = round2(i * c);
  return {
    prompt: `Viral k-factor = (invites/user)×(conversion). i=${i}, c=${c}. What is k? Round to 2 decimals.`,
    answer: ans,
    why: `${i}·${c}=${ans}. k>1 suggests viral growth.`,
  };
}

function psRetentionRate() {
  const start = pick([1000, 500, 200]);
  const end = pick([400, 250, 100, 50]);
  const ans = round2(end / start);
  return {
    prompt: `Cohort started with ${start} users; ${end} still active. Retention = end/start. Round to 2 decimals.`,
    answer: ans,
    why: `${end}/${start}=${ans}.`,
  };
}

function psChurnRate() {
  const start = pick([1000, 800, 500]);
  const lost = pick([50, 80, 100, 200]);
  const ans = round2(lost / start);
  return {
    prompt: `Of ${start} users at the start of the month, ${lost} churned. Churn rate = lost/start. Round to 2 decimals.`,
    answer: ans,
    why: `${lost}/${start}=${ans}.`,
  };
}

function psLtvCac() {
  const ltv = pick([120, 90, 200, 60]);
  const cac = pick([40, 30, 50, 20]);
  const ans = round2(ltv / cac);
  return {
    prompt: `LTV=$${ltv}, CAC=$${cac}. What is LTV/CAC? Round to 2 decimals.`,
    answer: ans,
    why: `${ltv}/${cac}=${ans}.`,
  };
}

function psStickiness() {
  const dau = pick([20, 50, 100, 200]);
  const mau = pick([100, 200, 400, 500]);
  const ans = round2(dau / mau);
  return {
    prompt: `DAU=${dau}, MAU=${mau}. Stickiness ≈ DAU/MAU. Round to 2 decimals.`,
    answer: ans,
    why: `${dau}/${mau}=${ans}.`,
  };
}

function psPctChange() {
  const oldV = pick([100, 50, 200, 80]);
  const newV = pick([90, 55, 220, 100]);
  const ans = round2((newV - oldV) / oldV);
  return {
    prompt: `Metric moved from ${oldV} to ${newV}. Relative change = (new−old)/old. Round to 2 decimals.`,
    answer: ans,
    why: `(${newV}−${oldV})/${oldV}=${ans}.`,
  };
}

/** Named banks for <NumericQuiz bank="…" /> */

// ---- Commodities & derivatives ----

function commForwardPnl() {
  const oz = pick([50, 100, 200, 500]);
  const fwd = randInt(1300, 1500);
  const spot = fwd + pick([-1, 1]) * randInt(5, 60);
  const buyer = Math.random() < 0.5;
  const ans = (buyer ? spot - fwd : fwd - spot) * oz;
  return {
    prompt: `You ${buyer ? 'bought' : 'sold'} ${oz} oz of gold forward at USD ${fwd}/oz. At delivery spot is USD ${spot}. What is your economic profit (negative for a loss), in USD?`,
    answer: ans,
    why: `${buyer ? `(spot − forward)` : `(forward − spot)`} × oz = ${buyer ? `(${spot} − ${fwd})` : `(${fwd} − ${spot})`} × ${oz} = ${ans}.`,
    decimals: 0,
  };
}

function commFuturesVM() {
  const n = randInt(1, 5);
  const entry = randInt(1300, 1600);
  const settle = entry + pick([-1, 1]) * randInt(2, 30);
  const long = Math.random() < 0.5;
  const ans = (long ? settle - entry : entry - settle) * 100 * n;
  return {
    prompt: `You are ${long ? 'long' : 'short'} ${n} gold futures (100 oz each) entered at USD ${entry}. Today's settlement price is USD ${settle}. Variation margin received (negative if paid), in USD?`,
    answer: ans,
    why: `${long ? '(settle − entry)' : '(entry − settle)'} × 100 × ${n} = ${ans}.`,
    decimals: 0,
  };
}

function commInitialMargin() {
  const n = randInt(1, 4);
  const price = randInt(1300, 1600);
  const pct = pick([4, 5, 6]);
  const ans = round2(price * 100 * n * pct / 100);
  return {
    prompt: `Initial margin is ${pct}% of contract value. What initial margin is needed for ${n} gold futures (100 oz each) at USD ${price}/oz?`,
    answer: ans,
    why: `${price} × 100 × ${n} × ${pct}% = ${ans}.`,
    decimals: 0,
  };
}

function commTicks() {
  const ticks = randInt(3, 40);
  const n = randInt(1, 5);
  const ans = ticks * 10 * n;
  return {
    prompt: `Gold futures tick size is USD 0.10/oz on 100 oz (USD 10 per contract). The price rises ${round2(ticks * 0.1).toFixed(2)} USD/oz. Gain on ${n} long contracts, in USD?`,
    answer: ans,
    why: `${ticks} ticks × USD 10 × ${n} = ${ans}.`,
    decimals: 0,
  };
}

function commSwapSettle() {
  const vol = pick([5000, 10000, 20000, 50000]);
  const fixed = randInt(55, 90);
  const avg = fixed + pick([-1, 1]) * randInt(1, 12);
  const payer = Math.random() < 0.5;
  const ans = (payer ? avg - fixed : fixed - avg) * vol;
  return {
    prompt: `Oil swap on ${vol.toLocaleString('en-US')} bbl: you ${payer ? 'pay fixed' : 'receive fixed'} USD ${fixed}/bbl against the monthly average WTI, which settles at USD ${avg}. Net cash flow to you (negative if you pay), in USD?`,
    answer: ans,
    why: `${payer ? '(average − fixed)' : '(fixed − average)'} × volume = ${ans}.`,
    decimals: 0,
  };
}

function commDifferential() {
  const bench = randInt(80, 140);
  const diff = randInt(3, 20);
  const premium = Math.random() < 0.5;
  const ans = premium ? bench + diff : bench - diff;
  return {
    prompt: `The 62% Fe iron ore benchmark is USD ${bench}/t. A ${premium ? '65%' : '58%'} grade trades at a USD ${diff} ${premium ? 'premium' : 'discount'}. Its price in USD/t?`,
    answer: ans,
    why: `${bench} ${premium ? '+' : '−'} ${diff} = ${ans}.`,
    decimals: 0,
  };
}

function commCallProfit() {
  const k = randInt(130, 160) * 10;
  const prem = randInt(10, 40);
  const s = k + randInt(-60, 90);
  const ans = Math.max(s - k, 0) - prem;
  return {
    prompt: `Gold call: strike USD ${k}, premium USD ${prem}/oz. Spot at expiry is USD ${s}. Profit per oz (negative for a loss)?`,
    answer: ans,
    why: `MAX(${s} − ${k}, 0) − ${prem} = ${ans}.`,
    decimals: 0,
  };
}

function commPutProfit() {
  const k = randInt(130, 160) * 10;
  const prem = randInt(10, 40);
  const s = k + randInt(-90, 60);
  const ans = Math.max(k - s, 0) - prem;
  return {
    prompt: `Gold put: strike USD ${k}, premium USD ${prem}/oz. Spot at expiry is USD ${s}. Profit per oz (negative for a loss)?`,
    answer: ans,
    why: `MAX(${k} − ${s}, 0) − ${prem} = ${ans}.`,
    decimals: 0,
  };
}

function commBreakeven() {
  const k = randInt(40, 90);
  const prem = round2(randInt(150, 600) / 100);
  const call = Math.random() < 0.5;
  const ans = round2(call ? k + prem : k - prem);
  return {
    prompt: `Crude ${call ? 'call' : 'put'} option: strike USD ${k}/bbl, premium USD ${prem.toFixed(2)}/bbl. Breakeven price at expiry?`,
    answer: ans,
    why: `${call ? 'Strike + premium' : 'Strike − premium'} = ${ans}.`,
  };
}

function commSpreadPayoff() {
  const crude = randInt(60, 90);
  const gas = crude + randInt(5, 35);
  const k = randInt(8, 25);
  const call = Math.random() < 0.6;
  const spread = gas - crude;
  const ans = call ? Math.max(spread - k, 0) : Math.max(k - spread, 0);
  return {
    prompt: `Crack-spread ${call ? 'call' : 'put'}, strike USD ${k}/bbl. At expiry gasoline = USD ${gas}, crude = USD ${crude}. Payoff per bbl?`,
    answer: ans,
    why: `Spread = ${gas} − ${crude} = ${spread}; ${call ? `MAX(${spread} − ${k}, 0)` : `MAX(${k} − ${spread}, 0)`} = ${ans}.`,
    decimals: 0,
  };
}

function commAvgCall() {
  const k = randInt(45, 80);
  const p = [0, 1, 2].map(() => k + randInt(-8, 12));
  const avg = round2((p[0] + p[1] + p[2]) / 3);
  const ans = round2(Math.max(avg - k, 0));
  return {
    prompt: `Average rate call, strike USD ${k}. Monthly prices in the averaging period: ${p.join(', ')}. Payoff per unit? Round to 2 decimals.`,
    answer: ans,
    why: `Average = ${avg}; MAX(${avg} − ${k}, 0) = ${ans}.`,
  };
}


function commCarryForward() {
  const spot = randInt(1500, 2500);
  const r = pick([2, 3, 4, 5]);
  const lease = pick([0.1, 0.25, 0.5]);
  const days = pick([90, 180, 270, 360]);
  const ans = round2(spot * (1 + (r - lease) / 100 * days / 360));
  return {
    prompt: `Gold spot USD ${spot}. Deposit rate ${r}%, lease rate ${lease}%, ${days} days (360 basis). Fair forward price? Round to 2 decimals.`,
    answer: ans,
    why: `${spot} × (1 + (${r}% − ${lease}%) × ${days}/360) = ${ans}.`,
  };
}

function commArbProfit() {
  const fair = randInt(1500, 2500) + 0.5;
  const gap = randInt(3, 15);
  const cheap = Math.random() < 0.5;
  const mkt = cheap ? fair - gap : fair + gap;
  return {
    prompt: `Fair (cash-and-carry) forward is USD ${fair}; the market forward is USD ${mkt}. Riskless arbitrage profit per unit?`,
    answer: gap,
    why: `|${fair} − ${mkt}| = ${gap} — ${cheap ? 'buy the cheap forward, sell spot' : 'sell the rich forward, buy spot and carry'}.`,
  };
}

function commConvenience() {
  const spot = randInt(60, 100);
  const fwd = spot - randInt(-3, 10);
  const storage = randInt(1, 6);
  const r = pick([3, 4, 5, 6]);
  const interest = round2(spot * r / 100);
  const ans = round2(spot - fwd + storage + interest);
  return {
    prompt: `Spot ${spot}, 1-year forward ${fwd}, storage ${storage}/yr, interest ${r}% of spot. Implied convenience yield in USD? Round to 2 decimals.`,
    answer: ans,
    why: `(${spot} − ${fwd}) + ${storage} + ${interest} = ${ans}.`,
  };
}

function commCarryTrade() {
  const spot = randInt(1800, 2600);
  const days = pick([30, 60, 90]);
  const fwd = spot + randInt(15, 60);
  const r = pick([2, 3, 4, 5]);
  const wh = pick([0.1, 0.15, 0.2]);
  const fin = round2(spot * r / 100 * days / 360);
  const store = round2(wh * days);
  const ans = round2(fwd - spot - fin - store);
  return {
    prompt: `Buy metal spot at ${spot}, sell ${days}-day forward at ${fwd}. Financing ${r}% p.a. (360 basis), warehousing ${wh}/t/day. Net profit per tonne (negative if it loses)? Round to 2 decimals.`,
    answer: ans,
    why: `Spread ${fwd - spot} − finance ${fin} − storage ${store} = ${ans}.`,
  };
}

function commDiscountFactor() {
  const r = pick([2, 3, 4, 5, 6]);
  const days = pick([30, 90, 180, 270]);
  const ans = Math.round(1 / (1 + r / 100 * days / 360) * 1e5) / 1e5;
  return {
    prompt: `Discount factor for ${days} days at ${r}% (360 basis)? Round to 5 decimals.`,
    answer: ans,
    why: `1 / (1 + ${r}% × ${days}/360) = ${ans}.`,
    decimals: 5,
  };
}

function commSwapFixed() {
  const f = [0, 1, 2].map(() => randInt(55, 85));
  const df = [0.995, 0.99, 0.985];
  const ans = round2((f[0] * df[0] + f[1] * df[1] + f[2] * df[2]) / (df[0] + df[1] + df[2]));
  return {
    prompt: `3-period swap. Futures: ${f.join(', ')}. Discount factors: ${df.join(', ')}. Fair fixed price? Round to 2 decimals.`,
    answer: ans,
    why: `Σ(F × DF) / ΣDF = ${ans}.`,
  };
}

function commParity() {
  const k = randInt(140, 180) * 10;
  const f = k + pick([-1, 1]) * randInt(5, 40);
  const df = pick([0.97, 0.98, 0.99]);
  const p = randInt(30, 70);
  const ans = round2(p + df * (f - k));
  return {
    prompt: `Put-call parity: forward ${f}, strike ${k}, discount factor ${df}. Put premium ${p}. Call premium? Round to 2 decimals.`,
    answer: ans,
    why: `C = P + DF × (F − K) = ${p} + ${df} × ${f - k} = ${ans}.`,
  };
}

function commDeltaEquiv() {
  const n1 = pick([20000, 40000, 50000, 80000]);
  const d1 = pick([0.3, 0.45, 0.55, 0.6, 0.7]);
  const n2 = pick([10000, 20000, 30000]);
  const d2 = pick([0.25, 0.4, 0.5]);
  const short = Math.random() < 0.5;
  const ans = Math.round(n1 * d1 + (short ? -1 : 1) * n2 * d2);
  return {
    prompt: `Long calls on ${n1.toLocaleString('en-US')} oz (delta ${d1}) and ${short ? 'short' : 'long'} calls on ${n2.toLocaleString('en-US')} oz (delta ${d2}). Net delta equivalent in oz?`,
    answer: ans,
    why: `${n1 * d1} ${short ? '−' : '+'} ${n2 * d2} = ${ans}.`,
    decimals: 0,
  };
}

function commBachelier() {
  const vol = randInt(5, 50);
  const t = pick([0.25, 0.5, 1]);
  const ans = round2(vol * Math.sqrt(t) * 0.398942);
  return {
    prompt: `Bachelier ATM option: dollar volatility ${vol}, maturity ${t} years. Premium ≈ σ × √T × 0.3989? Round to 2 decimals.`,
    answer: ans,
    why: `${vol} × √${t} × 0.3989 = ${ans}.`,
  };
}


function commDeltaHedge() {
  const oz = pick([10000, 20000, 25000, 40000, 50000]);
  const d = pick([0.25, 0.32, 0.4, 0.45, 0.55, 0.6]);
  const call = Math.random() < 0.5;
  const ans = Math.round(oz * d);
  return {
    prompt: `You sold ${call ? 'calls' : 'puts'} on ${oz.toLocaleString('en-US')} oz with delta ${call ? '' : '−'}${d}. How many oz must you ${call ? 'BUY' : 'SELL'} to delta-hedge?`,
    answer: ans,
    why: `${oz} × ${d} = ${ans} oz — short ${call ? 'calls lose when price rises, so buy' : 'puts lose when price falls, so sell'}.`,
    decimals: 0,
  };
}

function commRehedgeLoss() {
  const extra = pick([100, 177, 200, 300, 500]);
  const move = randInt(3, 15);
  const ans = -extra * move;
  return {
    prompt: `Short gamma: after a USD ${move} rise you buy ${extra} oz more to re-hedge; then the price falls back USD ${move}. Re-hedging P&L in USD (negative for a loss)?`,
    answer: ans,
    why: `−${extra} × ${move} = ${ans}.`,
    decimals: 0,
  };
}

function commDailyVol() {
  const vol = pick([10, 15, 20, 25, 30, 40]);
  const ans = round2(vol / Math.sqrt(250));
  return {
    prompt: `Annual implied volatility ${vol}%. Approximate daily volatility in % (divide by √250)? Round to 2 decimals.`,
    answer: ans,
    why: `${vol} / 15.81 ≈ ${ans}%.`,
  };
}

function commThetaIncome() {
  const theta = round2(randInt(10, 60) / 100);
  const oz = pick([5000, 10000, 20000, 30000]);
  const days = pick([1, 5, 10]);
  const ans = round2(theta * oz * days);
  return {
    prompt: `Short options on ${oz.toLocaleString('en-US')} oz, theta USD ${theta.toFixed(2)}/oz/day. Time-decay income over ${days} day(s), other things equal?`,
    answer: ans,
    why: `${theta} × ${oz} × ${days} = ${ans}.`,
  };
}

function commSwapClaim() {
  const fixed = randInt(70, 95) * 10;
  const mkt = fixed + pick([-1, 1]) * randInt(5, 20) * 10;
  const vol = pick([20000, 40000, 60000, 80000]);
  const ans = (fixed - mkt) * vol;
  return {
    prompt: `Bank receives fixed USD ${fixed}/t on a jet fuel swap with ${vol.toLocaleString('en-US')} t remaining; market is USD ${mkt}/t. Bank's mark-to-market (positive = airline owes the bank), undiscounted?`,
    answer: ans,
    why: `(${fixed} − ${mkt}) × ${vol} = ${ans}${ans > 0 ? ' — credit exposure if the airline defaults' : ' — the bank owes; no credit exposure'}.`,
    decimals: 0,
  };
}

function commSpreadTrade() {
  const n = pick([500, 1000, 2000, 5000]);
  const start = round2(randInt(50, 250) / 100);
  const end = round2(Math.max(0.1, start + pick([-1, 1]) * randInt(10, 150) / 100));
  const ans = Math.round((end - start) * 10000 * n);
  return {
    prompt: `Long ${n.toLocaleString('en-US')} gas calendar spreads (10,000 MMBtu each). Spread moves from ${start.toFixed(2)} to ${end.toFixed(2)}. P&L in USD?`,
    answer: ans,
    why: `(${end.toFixed(2)} − ${start.toFixed(2)}) × 10,000 × ${n} = ${ans}.`,
    decimals: 0,
  };
}

function commRollCost() {
  const n = pick([10000, 20000, 50000]);
  const front = randInt(15, 90);
  const gap = round2(pick([-1, 1]) * randInt(10, 120) / 100);
  const next = round2(front + gap);
  const ans = Math.round(-(next - front) * n * 1000);
  return {
    prompt: `A long hedge of ${n.toLocaleString('en-US')} crude contracts (1,000 bbl each) rolls: sell expiring at ${front.toFixed(2)}, buy next at ${next.toFixed(2)}. Roll P&L in USD (negative = cost)?`,
    answer: ans,
    why: `−(${next.toFixed(2)} − ${front.toFixed(2)}) × ${n * 1000} = ${ans} — ${gap > 0 ? 'contango costs' : 'backwardation earns'}.`,
    decimals: 0,
  };
}

function commCrack() {
  const gal = round2(randInt(220, 320) / 100);
  const crude = randInt(55, 85);
  const ans = round2(gal * 42 - crude);
  return {
    prompt: `Gasoline USD ${gal.toFixed(2)}/gal (42 gal/bbl), crude USD ${crude}/bbl. Crack spread per bbl? Round to 2 decimals.`,
    answer: ans,
    why: `${gal} × 42 − ${crude} = ${ans}.`,
  };
}


function goldCarat() {
  const c = pick([9, 10, 14, 18, 22]);
  const ans = round2(c / 24 * 1000);
  return {
    prompt: `What fineness (parts per thousand) is ${c}-carat gold? Round to 2 decimals.`,
    answer: ans,
    why: `${c} / 24 × 1,000 = ${ans}.`,
  };
}

function goldForward() {
  const spot = randInt(1500, 2600);
  const cash = pick([2, 3, 4, 5]);
  const lease = pick([0.1, 0.25, 0.4, 0.5]);
  const days = pick([91, 182, 273, 365]);
  const ans = round2(spot * (1 + (cash - lease) / 100 * days / 360));
  return {
    prompt: `Gold spot ${spot}; cash rate ${cash}%; lease rate ${lease}%; ${days} days (360 basis). Fair forward? Round to 2 decimals.`,
    answer: ans,
    why: `${spot} × (1 + ${round2(cash - lease)}% × ${days}/360) = ${ans}.`,
  };
}

function goldSwapRate() {
  const spot = randInt(1500, 2600);
  const days = pick([91, 182, 365]);
  const fwd = round2(spot * (1 + pick([1.5, 2, 2.5, 3, 3.5, 4]) / 100 * days / 360));
  const ans = round2((fwd / spot - 1) * 360 / days * 100);
  return {
    prompt: `Gold spot ${spot}, ${days}-day forward ${fwd.toFixed(2)}. Swap (GOFO) rate in % p.a.? Round to 2 decimals.`,
    answer: ans,
    why: `(${fwd.toFixed(2)} / ${spot} − 1) × 360/${days} ≈ ${ans}%.`,
  };
}

function goldImpliedLease() {
  const cash = round2(randInt(150, 550) / 100);
  const swap = round2(cash - randInt(-40, 90) / 100);
  const ans = round2(cash - swap);
  return {
    prompt: `Cash rate ${cash.toFixed(2)}%, gold swap rate ${swap.toFixed(2)}%. Implied lease rate in %? Round to 2 decimals.`,
    answer: ans,
    why: `Lease = cash − swap = ${ans}%${ans < 0 ? ' (negative: heavy demand to borrow USD against gold)' : ''}.`,
  };
}

function goldGoldInterest() {
  const oz = pick([50000, 100000, 200000, 250000]);
  const r = pick([0.25, 0.5, 0.6, 0.75, 1]);
  const days = pick([90, 180, 360]);
  const ans = round2(oz * r / 100 * days / 360);
  return {
    prompt: `Lend ${oz.toLocaleString('en-US')} oz for ${days} days at ${r}%, interest paid in gold (360 basis). Interest in oz? Round to 2 decimals.`,
    answer: ans,
    why: `${oz} × ${r}% × ${days}/360 = ${ans} oz.`,
  };
}

function goldUnwind() {
  const orig = randInt(5, 14) * 100;
  const cur = orig + randInt(2, 12) * 100;
  const r = pick([3, 4, 5]);
  const ans = round2((orig - cur) / (1 + r / 100));
  return {
    prompt: `A miner sold forward at ${orig}. The current forward for the same date (1 year away) is ${cur}; discount rate ${r}%. Break cost per oz (negative = producer pays)? Round to 2 decimals.`,
    answer: ans,
    why: `(${orig} − ${cur}) / ${1 + r / 100} = ${ans}.`,
  };
}

function goldNdf() {
  const oz = pick([5000, 10000, 20000]);
  const fwd = randInt(1800, 2400);
  const settle = fwd + pick([-1, 1]) * randInt(10, 90);
  const notional = fwd * oz;
  const ans = round2(notional * (1 - fwd / settle));
  return {
    prompt: `NDF: buy ${oz.toLocaleString('en-US')} oz forward at ${fwd} (USD notional ${notional.toLocaleString('en-US')}). Gold settles at ${settle}. Settlement to the gold buyer (negative = buyer pays)? Round to whole dollars.`,
    answer: ans,
    why: `${notional} × (1 − ${fwd}/${settle}) = ${ans}.`,
    decimals: 0,
  };
}

function goldMarginTopUp() {
  const oz = pick([5000, 10000, 20000]);
  const p0 = randInt(18, 24) * 100;
  const p1 = p0 - randInt(3, 15) * 10;
  const init = p0 * oz;
  const margin = init * 0.08;
  const left = p1 * oz - init + margin;
  const req = 0.08 * Math.max(p1 * oz, init);
  const ans = Math.round(Math.max(req - left, 0));
  return {
    prompt: `Deferred margin: ${oz.toLocaleString('en-US')} oz bought at ${p0}, 8% initial margin. Gold falls to ${p1}. Top-up required (USD)?`,
    answer: ans,
    why: `Left side ${Math.round(left)}; required 8% × ${init} = ${Math.round(req)}; top up ${ans}.`,
    decimals: 0,
  };
}

function goldCoveredCall() {
  const spot = randInt(18, 26) * 100;
  const k = spot + randInt(1, 3) * 100;
  const prem = randInt(10, 45);
  const cap = Math.random() < 0.5;
  const ans = cap ? k + prem : spot - prem;
  return {
    prompt: `Covered call: hold gold at ${spot}, sell a call with strike ${k} for premium ${prem}. ${cap ? 'Above what price does simply holding gold beat the covered call' : 'Below what price does the combined position lose money'}?`,
    answer: ans,
    why: cap ? `Strike + premium = ${ans}.` : `Spot − premium = ${ans}.`,
    decimals: 0,
  };
}

function goldLocational() {
  const oz = pick([20000, 30000, 50000]);
  const ny = randInt(1900, 2400);
  const diff = round2(pick([0.5, 1, 1.5, 2]));
  const ans = round2(diff * oz);
  return {
    prompt: `Locational swap: sell ${oz.toLocaleString('en-US')} oz loco New York at ${ny}, buy loco London at ${round2(ny + diff)}. Cash the client pays (USD)?`,
    answer: ans,
    why: `${diff} × ${oz} = ${ans}.`,
  };
}


function baseConcPayable() {
  const cu = pick([22, 25, 28, 30, 32]);
  const pay = pick([96, 96.5, 96.65, 97]);
  const lme = randInt(70, 105) * 100;
  const ans = round2(cu / 100 * pay / 100 * lme);
  return {
    prompt: `Copper concentrate ${cu}% Cu, payable at ${pay}% of LME USD ${lme}. Payable value per DMT? Round to 2 decimals.`,
    answer: ans,
    why: `${cu}% × ${pay}% × ${lme} = ${ans}.`,
  };
}

function baseRc() {
  const cu = pick([20, 25, 28, 30]);
  const rc = pick([0.045, 0.06, 0.08, 0.09]);
  const ans = round2(cu / 100 * rc * 2204.6);
  return {
    prompt: `Refining charge USD ${rc}/lb of contained copper; concentrate ${cu}% Cu. RC per DMT (1 t = 2,204.6 lb)? Round to 2 decimals.`,
    answer: ans,
    why: `${cu}% × ${rc} × 2,204.6 = ${ans}.`,
  };
}

function baseBauxite() {
  const al = randInt(2, 30) * 1000;
  const alumina = Math.random() < 0.5;
  const ans = alumina ? 2 * al : 4 * al;
  return {
    prompt: `How many tonnes of ${alumina ? 'alumina' : 'bauxite'} are needed for ${al.toLocaleString('en-US')} t of aluminium (4:2:1 rule)?`,
    answer: ans,
    why: `${alumina ? '2' : '4'} × ${al} = ${ans}.`,
    decimals: 0,
  };
}

function baseLots() {
  const metals = [['copper', 25], ['aluminium', 25], ['zinc', 25], ['nickel', 6], ['tin', 5]];
  const [m, lot] = pick(metals);
  const lots = randInt(4, 40);
  return {
    prompt: `How many LME ${m} lots hedge ${lots * lot} t?`,
    answer: lots,
    why: `${lots * lot} / ${lot} t per lot = ${lots}.`,
    decimals: 0,
  };
}

function baseFloatingFwd() {
  const fixed = randInt(22, 28) * 100;
  const avg = fixed + pick([-1, 1]) * randInt(2, 15) * 10;
  const t = pick([500, 1000, 2000]);
  const ans = (avg - fixed) * t;
  return {
    prompt: `Consumer hedged ${t.toLocaleString('en-US')} t with a cash-settled floating forward at ${fixed}. Monthly average settles ${avg}. Hedge cash flow to the consumer (negative = pays)?`,
    answer: ans,
    why: `(${avg} − ${fixed}) × ${t} = ${ans}; net cost stays ${fixed}.`,
    decimals: 0,
  };
}

function baseLendRoll() {
  const orig = randInt(22, 26) * 100;
  const near = orig + randInt(5, 15) * 10;
  const far = near + randInt(2, 8) * 10;
  const ans = far - (near - orig);
  return {
    prompt: `Long forward at ${orig}. Delivery delayed: sell the near prompt at ${near}, buy the new far prompt at ${far}. Effective new price (ignore interest)?`,
    answer: ans,
    why: `Profit ${near - orig}; ${far} − ${near - orig} = ${ans}.`,
    decimals: 0,
  };
}

function baseCollar() {
  const put = randInt(235, 245) * 10;
  const call = randInt(255, 265) * 10;
  const px = randInt(200, 300) * 10;
  const ans = Math.min(Math.max(px, put), call);
  return {
    prompt: `Zero-cost collar for a consumer: long call ${call}, short put ${put}. Price at expiry ${px}. Net cost per tonne?`,
    answer: ans,
    why: `Cost is bounded between ${put} and ${call}: ${ans}.`,
    decimals: 0,
  };
}

function baseBasketPayoff() {
  const al0 = randInt(22, 28) * 100;
  const cu0 = randInt(65, 95) * 100;
  const k = 0.5 * al0 + 0.5 * cu0;
  const al = al0 + randInt(-15, 20) * 10;
  const cu = cu0 + randInt(-30, 40) * 10;
  const ans = round2(Math.max(0, 0.5 * al + 0.5 * cu - k));
  return {
    prompt: `50/50 basket call, strike ${k}. At expiry aluminium ${al}, copper ${cu}. Payoff?`,
    answer: ans,
    why: `0.5 × ${al} + 0.5 × ${cu} = ${0.5 * al + 0.5 * cu}; max(0, that − ${k}) = ${ans}.`,
  };
}

function baseBasketVol() {
  const s1 = pick([15, 20, 25]);
  const s2 = pick([20, 25, 30, 35]);
  const r = pick([-0.5, 0, 0.3, 0.5, 0.8]);
  const v = Math.sqrt(0.25 * (s1 / 100) ** 2 + 0.25 * (s2 / 100) ** 2 + 2 * 0.25 * r * (s1 / 100) * (s2 / 100));
  const ans = round2(v * 100);
  return {
    prompt: `50/50 basket: vols ${s1}% and ${s2}%, correlation ${r}. Basket volatility in %? Round to 2 decimals.`,
    answer: ans,
    why: `√(0.25·σ₁² + 0.25·σ₂² + 2·0.25·ρσ₁σ₂) ≈ ${ans}%.`,
  };
}

function crudeProductRevenue() {
  const price = randInt(50, 90) * 10;
  const [name, f] = pick([['gasoline', 8.35], ['jet', 7.88], ['gas oil', 7.46], ['fuel oil', 6.35]]);
  const y = pick([10, 15, 20, 25, 35, 40]);
  const ans = round2(price / f * y / 100);
  return {
    prompt: `${name} at USD ${price}/t (${f} bbl/t), yield ${y}% of each barrel. Revenue per barrel of crude from ${name}? Round to 2 decimals.`,
    answer: ans,
    why: `${price} / ${f} × ${y}% = ${ans}.`,
  };
}

function crude321() {
  const crude = randInt(55, 80);
  const g = round2(randInt(220, 320) / 100);
  const h = round2(randInt(210, 340) / 100);
  const ans = round2((2 / 3) * g * 42 + (1 / 3) * h * 42 - crude);
  return {
    prompt: `3-2-1 crack: crude ${crude}/bbl, gasoline ${g.toFixed(2)}/gal, heating oil ${h.toFixed(2)}/gal (42 gal/bbl). Crack per bbl? Round to 2 decimals.`,
    answer: ans,
    why: `⅔ × ${g} × 42 + ⅓ × ${h} × 42 − ${crude} = ${ans}.`,
  };
}

function crudeCfdImplied() {
  const fwd = round2(randInt(6000, 9000) / 100);
  const cfd = round2(randInt(-200, 150) / 100);
  const ans = round2(fwd + cfd);
  return {
    prompt: `Third-month Brent forward ${fwd.toFixed(2)}; CFD for the target week ${cfd.toFixed(2)}. Implied forward Dated Brent? Round to 2 decimals.`,
    answer: ans,
    why: `${fwd} + (${cfd}) = ${ans}.`,
  };
}

function crudeEfp() {
  const orig = round2(randInt(6000, 8500) / 100);
  const front = round2(orig + randInt(-300, 300) / 100);
  const diff = round2(randInt(-50, 80) / 100);
  const ans = round2(front + diff + (orig - front));
  return {
    prompt: `Refiner long futures at ${orig.toFixed(2)} does an EFP at front month ${front.toFixed(2)} ${diff >= 0 ? '+' : '−'} ${Math.abs(diff).toFixed(2)}. Effective crude cost? Round to 2 decimals.`,
    answer: ans,
    why: `Physical ${round2(front + diff)} + futures P&L (${orig} − ${front}) = ${ans}.`,
  };
}

function crudeRoll() {
  const m1 = round2(randInt(5000, 8500) / 100);
  const m2 = round2(m1 + randInt(-60, 60) / 100);
  const m3 = round2(m2 + randInt(-60, 60) / 100);
  const ans = round2((m1 - m2) * 2 / 3 + (m1 - m3) / 3);
  return {
    prompt: `NYMEX roll for one day: M1 ${m1.toFixed(2)}, M2 ${m2.toFixed(2)}, M3 ${m3.toFixed(2)}. Roll = (M1−M2)×⅔ + (M1−M3)×⅓? Round to 2 decimals.`,
    answer: ans,
    why: `(${round2(m1 - m2)} × ⅔) + (${round2(m1 - m3)} × ⅓) = ${ans}.`,
  };
}

function crudeBasis() {
  const fut = round2(randInt(6000, 9000) / 100);
  const basis = round2(-randInt(20, 250) / 100);
  const ans = round2(fut + basis);
  return {
    prompt: `A producer sold futures at ${fut.toFixed(2)}; basis (cash − futures) at close-out is ${basis.toFixed(2)}. Effective sale price? Round to 2 decimals.`,
    answer: ans,
    why: `${fut} + (${basis}) = ${ans}.`,
  };
}

function crudeJetHedge() {
  const beta = pick([0.6, 0.7, 0.8, 0.9, 1.1]);
  const t = pick([1000, 2000, 3000, 5000]);
  const ans = Math.round(beta * t * 7.45 / 1000);
  return {
    prompt: `Hedge ${t.toLocaleString('en-US')} t of jet fuel (7.45 bbl/t) with 1,000 bbl crude futures; regression β = ${beta}. Contracts (nearest whole)?`,
    answer: ans,
    why: `${beta} × ${t * 7.45} / 1,000 ≈ ${ans}.`,
    decimals: 0,
  };
}

function crudeMarginSwap() {
  const fixed = round2(randInt(500, 1200) / 100);
  const actual = round2(randInt(400, 1300) / 100);
  const bbl = pick([100000, 160000, 200000, 250000]);
  const ans = Math.round((fixed - actual) * bbl);
  return {
    prompt: `Refiner receives fixed ${fixed.toFixed(2)} on a margin swap for ${bbl.toLocaleString('en-US')} bbl; actual margin ${actual.toFixed(2)}. Swap cash flow to the refiner (USD)?`,
    answer: ans,
    why: `(${fixed} − ${actual}) × ${bbl} = ${ans}.`,
    decimals: 0,
  };
}

function crudeTonneToBbl() {
  const [name, f] = pick([['gasoline', 8.35], ['jet', 7.88], ['gas oil', 7.45], ['fuel oil', 6.35]]);
  const price = randInt(40, 90) * 10;
  const toBbl = Math.random() < 0.5;
  const ans = toBbl ? round2(price / f) : round2(price / 10 * f);
  return toBbl
    ? {prompt: `${name} at USD ${price}/t with ${f} bbl/t. Price per barrel? Round to 2 decimals.`, answer: ans, why: `${price} / ${f} = ${ans}.`}
    : {prompt: `${name} at USD ${price / 10}/bbl with ${f} bbl/t. Price per tonne? Round to 2 decimals.`, answer: ans, why: `${price / 10} × ${f} = ${ans}.`};
}

function powerContractVolume() {
  const mw = pick([10, 20, 25, 50, 100]);
  const shape = pick([['peak', 12, 5], ['baseload', 24, 7]]);
  const wk = pick([4, 13, 26]);
  const ans = mw * shape[1] * shape[2] * wk;
  return { prompt: `A ${mw} MW ${shape[0]} contract runs ${shape[1]} h/day, ${shape[2]} days/week for ${wk} weeks. Total volume in MWh?`, answer: ans, why: `${mw} × ${shape[1]} × ${shape[2]} × ${wk} = ${ans} MWh.`, decimals: 0 };
}

function powerContractValue() {
  const mw = pick([20, 30, 50]);
  const days = randInt(20, 31);
  const p = randInt(40, 90);
  const vol = mw * 24 * days;
  const ans = vol * p;
  return { prompt: `${mw} MW baseload for ${days} days at ${p}/MWh. Contract value?`, answer: ans, why: `${mw} × 24 × ${days} = ${vol} MWh; × ${p} = ${ans}.`, decimals: 0 };
}

function powerMeritOrder() {
  const caps = [360, 120, 350, 130, 40];
  const costs = [70, 80, 110, 120, 150];
  const names = ['nuclear', 'renewable', 'gas', 'coal', 'diesel'];
  const demand = randInt(400, 1000);
  let cum = 0;
  let i = 0;
  while (cum + caps[i] < demand) { cum += caps[i]; i += 1; }
  return { prompt: `Merit order: nuclear 360 MW @70, renewable 120 @80, gas 350 @110, coal 130 @120, diesel 40 @150 (USD/MWh). Demand ${demand} MW. Clearing price?`, answer: costs[i], why: `Cumulative capacity reaches ${demand} MW within ${names[i]}, so ${names[i]} is marginal at ${costs[i]}.`, decimals: 0 };
}

function powerCleanSpark() {
  const power = randInt(60, 110);
  const gas = randInt(25, 45);
  const effPct = pick([45, 49, 50, 55]);
  const eff = effPct / 100;
  const co2 = randInt(50, 90);
  const raw = round2(power - gas / eff);
  const ans = round2(power - gas / eff - 0.4 * co2);
  return { prompt: `Power ${power}/MWh, gas ${gas}/MWh(th), efficiency ${effPct}%, CO₂ ${co2}/t, emission factor 0.4 t/MWh. Clean spark spread? (Can be negative.) Round to 2 decimals.`, answer: ans, why: `Raw = ${power} − ${gas}/${eff} ≈ ${raw}; clean = ${raw} − 0.4 × ${co2} = ${ans}.` };
}

function powerCleanDark() {
  const power = randInt(60, 110);
  const coal = randInt(10, 20);
  const effPct = pick([35, 36, 38, 40]);
  const eff = effPct / 100;
  const co2 = randInt(20, 60);
  const raw = round2(power - coal / eff);
  const ans = round2(power - coal / eff - 0.9 * co2);
  return { prompt: `Power ${power}/MWh, coal ${coal}/MWh(th), efficiency ${effPct}%, CO₂ ${co2}/t, emission factor 0.9 t/MWh. Clean dark spread? (Can be negative.) Round to 2 decimals.`, answer: ans, why: `Raw = ${power} − ${coal}/${eff} ≈ ${raw}; clean = ${raw} − 0.9 × ${co2} = ${ans}.` };
}

function powerMarketHeatRate() {
  const gas = randInt(3, 8);
  const power = randInt(30, 80);
  const ans = round2(power / gas);
  return { prompt: `Power ${power} USD/MWh, gas ${gas} USD/MMBtu. Market-implied heat rate (MMBtu/MWh)? Round to 2 decimals.`, answer: ans, why: `${power} / ${gas} = ${ans}.` };
}

function powerSparkHeatRate() {
  const gas = round2(randInt(250, 600) / 100);
  const hr = pick([7, 7.5, 8, 9, 10]);
  const power = randInt(30, 70);
  const ans = round2(power - gas * hr);
  return { prompt: `Power ${power} USD/MWh, gas ${gas} USD/MMBtu, heat rate ${hr} MMBtu/MWh. Spark spread? Round to 2 decimals.`, answer: ans, why: `${power} − ${gas} × ${hr} = ${ans}.` };
}

function powerSwapNet() {
  const mw = pick([10, 20, 30, 50]);
  const fixed = round2(randInt(4000, 6000) / 100);
  const flt = round2(randInt(3500, 6500) / 100);
  const days = pick([28, 30, 31]);
  const hrs = 24 * days;
  const ans = round2((flt - fixed) * mw * hrs);
  return { prompt: `You pay fixed ${fixed} and receive floating on ${mw} MW baseload for a ${days}-day month. Floating averages ${flt}. Net cash flow to you (negative = you pay)? Round to 2 decimals.`, answer: ans, why: `(${flt} − ${fixed}) × ${mw} × ${hrs} = ${ans}.` };
}

function powerCfd() {
  const strike = pick([79.23, 57.5, 92.5, 44.0]);
  const mkt = randInt(30, 120);
  const ans = round2(strike - mkt);
  return { prompt: `CfD strike ${strike}, market reference price ${mkt}. Payment to the generator per MWh (negative = generator pays)? Round to 2 decimals.`, answer: ans, why: `${strike} − ${mkt} = ${ans}; net revenue stays ${strike}.` };
}

function powerCrossBorder() {
  const a = randInt(40, 60);
  const b = a + randInt(4, 12);
  const cap = randInt(1, 3);
  const mw = pick([50, 100, 200]);
  const ans = (b - a - cap) * 24 * 365 * mw;
  return { prompt: `Buy baseload in country A at ${a}, sell in B at ${b}, interconnector capacity costs ${cap}/MWh, ${mw} MW for a 365-day year. Profit?`, answer: ans, why: `(${b} − ${a} − ${cap}) × 24 × 365 × ${mw} = ${ans}.`, decimals: 0 };
}

function powerLmpCongestion() {
  const lmpA = randInt(20, 40);
  const lmpB = lmpA + randInt(5, 30);
  const flow = pick([50, 80, 100, 150]);
  const ans = (lmpB - lmpA) * flow;
  return { prompt: `Node A LMP ${lmpA}, node B LMP ${lmpB}. ${flow} MW flows A → B for one hour. Congestion revenue collected by the ISO?`, answer: ans, why: `(${lmpB} − ${lmpA}) × ${flow} = ${ans}.`, decimals: 0 };
}

function powerHeatRateCall() {
  const hr = pick([7, 8, 9]);
  const gas = randInt(3, 6);
  const charge = randInt(1, 4);
  const power = randInt(20, 80);
  const mwh = pick([100, 500, 1000]);
  const per = Math.max(power - hr * gas - charge, 0);
  const ans = per * mwh;
  return { prompt: `Heat-rate call: heat rate ${hr}, gas ${gas}, variable charge ${charge}, power settles at ${power}, ${mwh} MWh. Payoff?`, answer: ans, why: `max(${power} − ${hr} × ${gas} − ${charge}, 0) = ${per}; × ${mwh} = ${ans}.`, decimals: 0 };
}

function powerReserveMargin() {
  const cap = randInt(50, 90) * 1000;
  const peak = Math.round(cap * randInt(75, 95) / 100);
  const ans = round2((cap - peak) / cap * 100);
  return { prompt: `Installed capacity ${cap} MW, peak demand ${peak} MW. Reserve margin as % of capacity? Round to 2 decimals.`, answer: ans, why: `(${cap} − ${peak}) / ${cap} = ${ans}%.` };
}

function plasticsMolar() {
  const m = pick([['ethylene C₂H₄', 28, '2 × 12 + 4 × 1'], ['propylene C₃H₆', 42, '3 × 12 + 6 × 1'], ['vinyl chloride C₂H₃Cl', 62.5, '24 + 3 + 35.5'], ['styrene C₈H₈', 104, '8 × 12 + 8 × 1']]);
  const n = randInt(5, 40) * 100;
  const ans = round2(m[1] * n);
  return { prompt: `A polymer chain of ${n} ${m[0]} units (C = 12, H = 1, Cl = 35.5). Molar mass in g/mol?`, answer: ans, why: `Monomer = ${m[2]} = ${m[1]}; × ${n} = ${ans}.` };
}

function plasticsCracker() {
  const feed = randInt(5, 20) * 100000;
  const f = pick([['ethane', 80], ['naphtha', 30]]);
  const ans = feed * f[1] / 100;
  return { prompt: `A ${f[0]} cracker processes ${feed} t of feed at a ${f[1]}% ethylene yield. Ethylene output in tonnes?`, answer: ans, why: `${feed} × ${f[1]}% = ${ans}.`, decimals: 0 };
}

function plasticsForwardHedge() {
  const fwd = randInt(1000, 1400);
  const close = fwd + randInt(-150, 150);
  const gain = close - fwd;
  return { prompt: `A converter buys a forward at ${fwd}/t, later closes it at ${close} and buys physical polymer at the ${close} index. Net cost per tonne?`, answer: fwd, why: `Hedge result ${gain}; ${close} − (${gain}) = ${fwd}.`, decimals: 0 };
}

function plasticsSwap() {
  const fixed = randInt(1100, 1400);
  const idx = fixed + randInt(-120, 120);
  const t = pick([200, 500, 800, 1000]);
  const ans = (idx - fixed) * t;
  return { prompt: `Converter pays fixed ${fixed}/t and receives the index on ${t} t. Index averages ${idx}. Swap cash flow to the converter (negative = pays)?`, answer: ans, why: `(${idx} − ${fixed}) × ${t} = ${ans}.`, decimals: 0 };
}

function plasticsOffset() {
  const fwd = randInt(1100, 1400);
  const sale = fwd + randInt(30, 150);
  const t = pick([100, 200, 300, 500]);
  const ans = (sale - fwd) * t;
  return { prompt: `A distributor sells ${t} t at a fixed ${sale}/t and buys a matching forward at ${fwd}. Locked margin?`, answer: ans, why: `(${sale} − ${fwd}) × ${t} = ${ans}.`, decimals: 0 };
}

function plasticsProxy() {
  const beta = pick([6, 8, 9, 10, 12]);
  const t = pick([1000, 2000, 3000, 5000]);
  const ans = beta * t / 1000;
  return { prompt: `Regression: polymer price (USD/t) moves ${beta} × crude (USD/bbl). Hedge ${t} t of polymer with 1,000 bbl crude contracts. Number of contracts?`, answer: ans, why: `${beta} × ${t} / 1,000 = ${ans}.`, decimals: 0 };
}

function plasticsAvgCall() {
  const k = randInt(12, 14) * 100;
  const prem = randInt(15, 40);
  const avg = k + randInt(-150, 150);
  const pay = Math.max(avg - k, 0);
  const ans = avg - pay + prem;
  return { prompt: `Average-price call on PP: strike ${k}, premium ${prem}. The average is ${avg}. Net cost per tonne including premium?`, answer: ans, why: `Payoff ${pay}; ${avg} − ${pay} + ${prem} = ${ans}.`, decimals: 0 };
}

function plasticsFx() {
  const usd = randInt(1000, 1500);
  const fx = pick([1.05, 1.08, 1.1, 1.12, 1.2]);
  const ans = round2(usd / fx);
  return { prompt: `Polymer at USD ${usd}/t; EUR/USD = ${fx}. Price in EUR per tonne? Round to 2 decimals.`, answer: ans, why: `${usd} / ${fx} = ${ans}.` };
}

function plasticsReduction() {
  const before = randInt(100, 160);
  const after = randInt(5, 30);
  const ans = round2((before - after) / before * 100);
  return { prompt: `Bags used per shopper fall from ${before} to ${after} a year. Reduction in %? Round to 2 decimals.`, answer: ans, why: `(${before} − ${after}) / ${before} = ${ans}%.` };
}

function bulkRpRatio() {
  const res = randInt(100, 1500);
  const prod = round2(randInt(20, 120) / 10);
  const ans = round2(res / prod);
  return { prompt: `Reserves ${res} bn t; annual production ${prod} bn t. Reserves-to-production ratio in years? Round to 2 decimals.`, answer: ans, why: `${res} / ${prod} = ${ans}.` };
}

function bulkCoalSwap() {
  const fixed = randInt(50, 120);
  const flt = fixed + randInt(-15, 15);
  const t = pick([5000, 10000, 15000]);
  const ans = (fixed - flt) * t;
  return { prompt: `A producer receives fixed ${fixed}/t and pays floating API2 on ${t} t. API2 averages ${flt}. Swap cash flow to the producer (negative = pays)?`, answer: ans, why: `(${fixed} − ${flt}) × ${t} = ${ans}; with the physical sale it nets ${fixed}/t.`, decimals: 0 };
}

function bulkCoveredCall() {
  const k = randInt(50, 70);
  const prem = round2(randInt(100, 350) / 100);
  const px = k + randInt(-10, 10);
  const ans = round2(Math.min(px, k) + prem);
  return { prompt: `A producer sells a ${k} call for ${prem}/t against its output. The price at expiry is ${px}. Effective price received per tonne? Round to 2 decimals.`, answer: ans, why: `min(${px}, ${k}) + ${prem} = ${ans}.` };
}

function bulkSwaption() {
  const k = randInt(55, 90);
  const prem = round2(randInt(100, 300) / 100);
  const px = k + randInt(-15, 15);
  const ans = round2(Math.max(px, k) - prem);
  return { prompt: `A producer holds a receiver swaption (right to receive fixed ${k}), premium ${prem}/t. At expiry the swap level is ${px}. Net price per tonne after premium? Round to 2 decimals.`, answer: ans, why: `${px < k ? 'Exercise' : 'Let lapse'}: max(${px}, ${k}) − ${prem} = ${ans}.` };
}

function bulkFeAdjust() {
  const idx = randInt(80, 140);
  const g = pick([58, 60, 63.5, 65]);
  const ans = round2(idx * g / 62);
  return { prompt: `62% Fe index at USD ${idx}/t. Pro-rata value of a ${g}% Fe cargo? Round to 2 decimals.`, answer: ans, why: `${idx} × ${g} / 62 = ${ans}.` };
}

function bulkTcToVc() {
  const days = randInt(35, 70);
  const hire = randInt(10, 30) * 1000;
  const fuel = randInt(3, 9) * 100000;
  const t = pick([75000, 120000, 170000, 180000]);
  const ans = round2((days * hire + fuel) / t);
  return { prompt: `Round trip ${days} days at USD ${hire}/day, fuel USD ${fuel}, cargo ${t} t. Equivalent voyage rate in USD/t? Round to 2 decimals.`, answer: ans, why: `(${days} × ${hire} + ${fuel}) / ${t} = ${ans}.` };
}

function bulkMultiplier() {
  const rate = randInt(8, 30) * 1000;
  const contrib = pick([250, 400, 500]);
  const ans = Math.round(contrib / rate * 100000) / 100000;
  return { prompt: `A route assessed at USD ${rate}/day must contribute ${contrib} index points. Multiplier? Round to 5 decimals.`, answer: ans, why: `${contrib} / ${rate} = ${ans}.`, decimals: 5 };
}

function bulkIndexChange() {
  const m = pick([0.025, 0.02, 0.0125, 0.01]);
  const d = randInt(-30, 30) * 100;
  const ans = round2(d * m);
  return { prompt: `A route with multiplier ${m} changes by USD ${d}/day. Change in index points (negative = fall)? Round to 2 decimals.`, answer: ans, why: `${d} × ${m} = ${ans}.` };
}

function bulkBdi() {
  const c = randInt(1000, 4000);
  const p = randInt(1000, 3000);
  const s = randInt(800, 2500);
  const ans = round2(0.4 * c + 0.3 * p + 0.3 * s);
  return { prompt: `Simplified BDI: 40% Capesize ${c}, 30% Panamax ${p}, 30% Supramax ${s}. Weighted value? Round to 2 decimals.`, answer: ans, why: `0.4 × ${c} + 0.3 × ${p} + 0.3 × ${s} = ${ans}.` };
}

function bulkWorldscale() {
  const flat = round2(randInt(500, 2500) / 100);
  const ws = randInt(50, 300);
  const ans = round2(flat * ws / 100);
  return { prompt: `Worldscale flat rate USD ${flat}/t; deal at WS${ws}. Rate in USD/t? Round to 2 decimals.`, answer: ans, why: `${flat} × ${ws} / 100 = ${ans}.` };
}

function bulkVcFfa() {
  const fixed = round2(randInt(800, 2000) / 100);
  const flt = round2(fixed + randInt(-200, 200) / 100);
  const t = pick([10000, 20000, 50000]);
  const ans = round2((flt - fixed) * t);
  return { prompt: `You buy a voyage FFA (pay fixed ${fixed}/t) on ${t} t. The route averages ${flt}. Net cash flow to you (negative = you pay)? Round to 2 decimals.`, answer: ans, why: `(${flt} − ${fixed}) × ${t} = ${ans}.` };
}

function bulkTcFfa() {
  const fixed = randInt(10, 30) * 1000;
  const flt = fixed + randInt(-30, 30) * 100;
  const days = pick([28, 30, 31]);
  const mult = pick([0.5, 1]);
  const ans = round2((fixed - flt) * days * mult);
  return { prompt: `You sell a time-charter FFA (receive fixed USD ${fixed}/day), ${days}-day month, multiplier ${mult}. The index averages ${flt}. Net cash flow to you (negative = you pay)? Round to 2 decimals.`, answer: ans, why: `(${fixed} − ${flt}) × ${days} × ${mult} = ${ans}.` };
}

function bulkTargetPayout() {
  const k = 10000;
  const idx = randInt(70, 130) * 100;
  const days = pick([28, 30, 31]);
  const ans = idx >= k ? (idx - k) * days : -(k - idx) * days * 2;
  return { prompt: `Target payout structure, strike USD 10,000/day, puts at 2×. ${days}-day month, index averages ${idx}. Cash flow to the client (negative = client pays)?`, answer: ans, why: idx >= k ? `Call: (${idx} − 10,000) × ${days} = ${ans}.` : `Put: −(10,000 − ${idx}) × ${days} × 2 = ${ans}.`, decimals: 0 };
}

function bulkReroute() {
  const base = randInt(30, 80);
  const extra = randInt(10, 25);
  const hire = randInt(10, 40) * 1000;
  const ans = extra * hire;
  return { prompt: `A ${base}-day voyage is rerouted and takes ${base + extra} days. Daily hire USD ${hire}. Extra hire cost?`, answer: ans, why: `${extra} × ${hire} = ${ans}.`, decimals: 0 };
}

function climateCo2e() {
  const g = pick([['methane', 25], ['nitrous oxide', 298], ['sulfur hexafluoride', 22800]]);
  const t = randInt(1, 50);
  const ans = t * g[1];
  return { prompt: `${t} t of ${g[0]} (GWP ${g[1]}). Tonnes of CO₂e?`, answer: ans, why: `${t} × ${g[1]} = ${ans}.`, decimals: 0 };
}

function climateAbatement() {
  const short = randInt(2, 20) * 1000;
  const px = randInt(20, 90);
  const abate = randInt(10, 100);
  const ans = Math.min(px, abate) * short;
  return { prompt: `A firm is ${short} t short of allowances. Allowances cost EUR ${px}; abatement costs EUR ${abate}/t. Cheapest compliance cost?`, answer: ans, why: `${abate < px ? 'Abate' : 'Buy allowances'}: min(${px}, ${abate}) × ${short} = ${ans}.`, decimals: 0 };
}

function climateFuelSwitch() {
  const gas = randInt(20, 60);
  const ge = pick([50, 55, 58]);
  const coal = randInt(8, 20);
  const ce = pick([35, 36, 38, 40]);
  const gc = gas / (ge / 100);
  const cc = coal / (ce / 100);
  const ans = round2((gc - cc) / (0.9 - 0.37));
  return { prompt: `Gas EUR ${gas}/MWh(th) at ${ge}% efficiency; coal EUR ${coal}/MWh(th) at ${ce}% efficiency. Emission factors: coal 0.90, gas 0.37 t/MWh. Carbon price at which the two cost the same? (Negative means gas is already cheaper.) Round to 2 decimals.`, answer: ans, why: `Gas ${round2(gc)}, coal ${round2(cc)}; (${round2(gc)} − ${round2(cc)}) / 0.53 = ${ans}.` };
}

function climateMsr() {
  const circ = randInt(850, 2000);
  const rate = pick([12, 24]);
  const ans = round2(circ * rate / 100);
  return { prompt: `${circ} million allowances in circulation (above 833 million); MSR intake rate ${rate}%. Allowances withheld (millions)? Round to 2 decimals.`, answer: ans, why: `${rate}% × ${circ} = ${ans}.` };
}

function climateFairForward() {
  const s = round2(randInt(1500, 9000) / 100);
  const r = pick([-0.5, -0.25, 1, 2, 3, 4]);
  const days = pick([182, 273, 365]);
  const ans = round2(s * (1 + r / 100 * days / 360));
  return { prompt: `Spot EUA ${s}, rate ${r}% (act/360), ${days} days. Fair forward? Round to 2 decimals.`, answer: ans, why: `${s} × (1 + ${r / 100} × ${days}/360) = ${ans}.` };
}

function climateImpliedRate() {
  const s = round2(randInt(1500, 9000) / 100);
  const f = round2(s + randInt(-150, 300) / 100);
  const ans = round2((f / s - 1) * 360 / 365 * 100);
  return { prompt: `Spot EUA ${s}, 1-year (365-day) forward ${f}. Implied act/360 interest rate in %? Round to 2 decimals.`, answer: ans, why: `(${f}/${s} − 1) × 360/365 = ${ans}%.` };
}

function climateRepo() {
  const n = pick([500000, 1000000, 2000000]);
  const f = round2(randInt(1500, 9000) / 100);
  const r = pick([2.5, 3.5, 4.5, 5.5]);
  const repay = round2(n * f);
  const ans = Math.round(repay / (1 + r / 100 * 365 / 360));
  return { prompt: `Repo: ${n} EUAs bought back in 365 days at forward ${f}. Bank rate ${r}% (act/360). Cash proceeds today (nearest euro)?`, answer: ans, why: `${repay} / (1 + ${r / 100} × 365/360) = ${ans}.`, decimals: 0 };
}

function climateSwap() {
  const q = pick([10000, 25000, 50000]);
  const fixed = randInt(15, 90);
  const idx = round2(fixed + randInt(-800, 800) / 100);
  const ans = round2((idx - fixed) * q);
  return { prompt: `You pay fixed EUR ${fixed} on ${q} EUAs; the index on the pricing date is ${idx}. Cash flow to you (negative = you pay)? Round to 2 decimals.`, answer: ans, why: `(${idx} − ${fixed}) × ${q} = ${ans}.` };
}

function climateCall() {
  const q = pick([10000, 30000, 50000]);
  const k = randInt(20, 90);
  const prem = round2(randInt(100, 600) / 100);
  const f = round2(k + randInt(-1000, 1000) / 100);
  const ans = round2(Math.max(f - k, 0) * q - prem * q);
  return { prompt: `EUA call on ${q} allowances, strike ${k}, premium ${prem}. Futures at expiry ${f}. Profit after premium (negative = loss)? Round to 2 decimals.`, answer: ans, why: `max(${f} − ${k}, 0) × ${q} − ${prem} × ${q} = ${ans}.` };
}

function climateHdd() {
  const temps = Array.from({ length: 7 }, () => randInt(30, 70));
  const vals = temps.map(t => Math.max(0, 65 - t));
  const ans = vals.reduce((a, b) => a + b, 0);
  return { prompt: `Daily average temperatures (°F): ${temps.join(', ')}. HDD total (base 65)?`, answer: ans, why: `${vals.join(' + ')} = ${ans}.`, decimals: 0 };
}

function climateCdd() {
  const temps = Array.from({ length: 7 }, () => randInt(60, 100));
  const vals = temps.map(t => Math.max(0, t - 65));
  const ans = vals.reduce((a, b) => a + b, 0);
  return { prompt: `Daily average temperatures (°F): ${temps.join(', ')}. CDD total (base 65)?`, answer: ans, why: `${vals.join(' + ')} = ${ans}.`, decimals: 0 };
}

function climateWeatherSwap() {
  const fixed = randInt(400, 800);
  const real = fixed + randInt(-60, 60);
  const tick = pick([200, 500, 1000]);
  const ans = (real - fixed) * tick;
  return { prompt: `CDD swap: you receive floating and pay fixed ${fixed}, USD ${tick} per point. Realised CDD ${real}. Cash flow to you (negative = you pay)?`, answer: ans, why: `(${real} − ${fixed}) × ${tick} = ${ans}.`, decimals: 0 };
}

function climateWeatherOption() {
  const isCall = pick([true, false]);
  const k = randInt(1000, 2500);
  const idx = k + randInt(-300, 300);
  const tick = pick([100, 200, 500]);
  const cap = pick([50000, 100000]);
  const raw = (isCall ? Math.max(idx - k, 0) : Math.max(k - idx, 0)) * tick;
  const ans = Math.min(raw, cap);
  return { prompt: `HDD ${isCall ? 'call' : 'put'}: strike ${k}, USD ${tick}/point, payout cap ${cap}. Realised HDD ${idx}. Payout?`, answer: ans, why: `${isCall ? `max(${idx} − ${k}, 0)` : `max(${k} − ${idx}, 0)`} × ${tick} = ${raw}; capped at ${cap} → ${ans}.`, decimals: 0 };
}

function climateHddStrike() {
  const t = randInt(30, 55);
  const days = pick([30, 61, 91, 92]);
  const ans = (65 - t) * days;
  return { prompt: `Losses start when the average falls below ${t} °F over a ${days}-day period. HDD strike equivalent?`, answer: ans, why: `(65 − ${t}) × ${days} = ${ans}.`, decimals: 0 };
}

function agEndingStocks() {
  const beg = randInt(50, 350);
  const prod = randInt(400, 1200);
  const imp = randInt(0, 50);
  const use = prod + randInt(-60, 60);
  const ans = beg + prod + imp - use;
  return { prompt: `Beginning stocks ${beg}, production ${prod}, imports ${imp}, total use ${use} (million t). Ending stocks?`, answer: ans, why: `${beg} + ${prod} + ${imp} − ${use} = ${ans}.`, decimals: 0 };
}

function agStocksToUse() {
  const use = randInt(300, 1200);
  const end = randInt(30, 450);
  const ans = round2(end / use * 100);
  return { prompt: `Ending stocks ${end}, total use ${use}. Stocks-to-use in %? Round to 2 decimals.`, answer: ans, why: `${end} / ${use} = ${ans}%.` };
}

function agCrush() {
  const meal = randInt(250, 450);
  const oil = round2(randInt(25, 60) / 100);
  const beans = round2(0.022 * meal + 11 * oil - randInt(-30, 180) / 100);
  const ans = round2(0.022 * meal + 11 * oil - beans);
  return { prompt: `Soymeal USD ${meal}/short ton, soy oil USD ${oil}/lb, soybeans USD ${beans}/bu. Board crush margin per bushel (can be negative)? Round to 2 decimals.`, answer: ans, why: `0.022 × ${meal} + 11 × ${oil} − ${beans} = ${round2(0.022 * meal)} + ${round2(11 * oil)} − ${beans} = ${ans}.` };
}

function agBagsToTonnes() {
  const bags = randInt(50, 180);
  const ans = round2(bags * 60 / 1000);
  return { prompt: `${bags} million 60 kg bags of coffee. Million tonnes? Round to 2 decimals.`, answer: ans, why: `${bags} × 60 / 1,000 = ${ans}.` };
}

function agBushelTonnes() {
  const c = pick([['corn', 56], ['wheat', 60], ['soybeans', 60]]);
  const lots = randInt(1, 50);
  const ans = round2(lots * 5000 * c[1] * 0.45359 / 1000);
  return { prompt: `${lots} ${c[0]} contracts of 5,000 bu (${c[1]} lb per bushel; 1 lb = 0.45359 kg). Tonnes? Round to 2 decimals.`, answer: ans, why: `${lots} × 5,000 × ${c[1]} × 0.45359 / 1,000 = ${ans}.` };
}

function agContractValue() {
  const cents = randInt(300, 1500);
  const lots = randInt(1, 20);
  const ans = round2(cents / 100 * 5000 * lots);
  return { prompt: `${lots} grain contracts (5,000 bu each) at ${cents} cents/bu. Total value in USD?`, answer: ans, why: `${cents / 100} × 5,000 × ${lots} = ${ans}.`, decimals: 0 };
}

function agTickPnl() {
  const ticks = randInt(-40, 40);
  const lots = randInt(1, 25);
  const ans = ticks * 12.5 * lots;
  return { prompt: `Long ${lots} corn contracts; price moves ${ticks} ticks of ¼ cent (USD 12.50 each). P&L in USD?`, answer: ans, why: `${ticks} × 12.50 × ${lots} = ${ans}.`, decimals: 0 };
}

function agCotNet() {
  const l = randInt(10000, 120000);
  const sh = randInt(10000, 120000);
  const ans = l - sh;
  return { prompt: `A COT category is long ${l} and short ${sh} contracts. Net position (negative = net short)?`, answer: ans, why: `${l} − ${sh} = ${ans}.`, decimals: 0 };
}

function agCornSwap() {
  const fixed = round2(randInt(300, 600) / 100);
  const avg = round2(fixed + randInt(-60, 60) / 100);
  const bu = pick([100000, 250000, 700000]);
  const ans = round2((avg - fixed) * bu);
  return { prompt: `You pay fixed USD ${fixed}/bu on ${bu} bu of corn; the first-nearby average is ${avg}. Cash flow to you (negative = you pay)? Round to 2 decimals.`, answer: ans, why: `(${avg} − ${fixed}) × ${bu} = ${ans}.` };
}

function agSpreadPut() {
  const k = pick([-50, 0, 50, 100]);
  const p1 = randInt(150, 400);
  const p2 = randInt(150, 400);
  const ans = Math.max(k - (p1 - p2), 0);
  return { prompt: `Put on the POGO spread (palm − gas oil), strike ${k}. At expiry palm oil ${p1}, gas oil ${p2}. Payoff per tonne?`, answer: ans, why: `max(${k} − (${p1} − ${p2}), 0) = ${ans}.`, decimals: 0 };
}

function agAccumulator() {
  const k = 3.45;
  const px = round2(randInt(290, 400) / 100);
  const qty = px > k ? 10000 : 5000;
  const ans = round2((k - px) * qty);
  return { prompt: `Producer accumulator: strike 3.45, sells 5,000 bu weekly if price < strike, 10,000 if price > strike (knock-out 2.85 not hit). This week’s price is ${px}. Gain vs selling at market (negative = opportunity loss)? Round to 2 decimals.`, answer: ans, why: `Sells ${qty} bu at 3.45: (3.45 − ${px}) × ${qty} = ${ans}.` };
}

function agTarnCost() {
  const put = pick([2.0, 2.2, 2.5]);
  const px = round2(put - randInt(10, 100) / 100);
  const ans = round2(px + 2 * (put - px));
  return { prompt: `TARN collar: sold put strike ${put} on 2× notional. Market price ${px}. Effective cost per base bushel after paying the put? Round to 2 decimals.`, answer: ans, why: `${px} + 2 × (${put} − ${px}) = ${ans}.` };
}

function agTarnCapped() {
  const target = 1.0;
  const cum = round2(randInt(50, 95) / 100);
  const k = 2.65;
  const px = round2(k + randInt(5, 60) / 100);
  const due = round2(px - k);
  const ans = round2(Math.min(due, target - cum));
  return { prompt: `TARN collar with partial redemption: call strike 2.65, target USD 1.00/bu, cumulative receipts so far ${cum}. This month averages ${px}. Payment per bushel this month? Round to 2 decimals.`, answer: ans, why: `Due ${due}; room left ${round2(target - cum)} → min = ${ans}.` };
}

function agPalmOutput() {
  const ha = randInt(5, 100) * 100;
  const yld = pick([3.5, 4, 4.5]);
  const ans = round2(ha * yld);
  return { prompt: `A plantation of ${ha} ha yields ${yld} t of palm oil per hectare. Annual output in tonnes?`, answer: ans, why: `${ha} × ${yld} = ${ans}.`, decimals: 0 };
}

function finTopUp() {
  const v0 = randInt(20, 80) * 100000;
  const adv = pick([70, 75, 80, 85]);
  const loan = v0 * adv / 100;
  const v1 = Math.round(v0 * randInt(80, 99) / 100);
  const ans = round2(Math.max(loan - v1 * adv / 100, 0));
  return { prompt: `Collateral worth ${v0} supports a loan at ${adv}% advance (${loan}). The collateral falls to ${v1}. Repayment needed to restore ${adv}% cover? Round to 2 decimals.`, answer: ans, why: `${loan} − ${adv}% × ${v1} = ${ans}.` };
}

function finDscr() {
  const cash = randInt(20, 80);
  const prin = randInt(8, 25);
  const int = round2(randInt(50, 800) / 100);
  const ans = round2(cash / (prin + int));
  return { prompt: `Cash available for debt service ${cash} m; principal due ${prin} m; interest ${int} m. DSCR? Round to 2 decimals.`, answer: ans, why: `${cash} / (${prin} + ${int}) = ${ans}.` };
}

function finRepoSpot() {
  const fwd = round2(randInt(4000, 9000) / 100);
  const r = round2(randInt(150, 600) / 100);
  const days = pick([7, 14, 30]);
  const ans = round2(fwd / (1 + r / 100 * days / 360));
  return { prompt: `Repo: ${days}-day forward ${fwd}; rate (index + margin) ${r}% act/360. Spot value? Round to 2 decimals.`, answer: ans, why: `${fwd} / (1 + ${r / 100} × ${days}/360) = ${ans}.` };
}

function finHaircut() {
  const spot = round2(randInt(4000, 9000) / 100);
  const h = pick([5, 10, 15]);
  const m = pick([1, 2]);
  const ans = m === 1 ? round2(spot / (1 + h / 100)) : round2(spot * (1 - h / 100));
  return { prompt: `Repo spot value ${spot}/bbl; ${h}% prepayment applied by ${m === 1 ? 'dividing by (1 + h)' : 'multiplying by (1 − h)'}. Cash advanced per barrel? Round to 2 decimals.`, answer: ans, why: m === 1 ? `${spot} / ${1 + h / 100} = ${ans}.` : `${spot} × ${1 - h / 100} = ${ans}.` };
}

function finPrepay() {
  const f = [randInt(5500, 6500), randInt(5500, 6800), randInt(5500, 7000)];
  const z = [pick([1, 2, 3]), pick([1.5, 2.5, 3.5]), pick([2, 3, 4])];
  const pv = f.map((x, i) => x / Math.pow(1 + z[i] / 100, i + 1));
  const ans = round2(pv.reduce((a, b) => a + b, 0));
  return { prompt: `Prepay for 1 t a year for 3 years at forwards ${f.join(', ')}; zero rates ${z.join('%, ')}%. Amount paid today? Round to 2 decimals.`, answer: ans, why: `${pv.map(round2).join(' + ')} = ${ans}.` };
}

function finPvfRatio() {
  const floor = 55;
  const cap = 67;
  const p = randInt(40, 90);
  const ratio = p <= floor ? 1 : p < cap ? floor / p : 1 - (cap - floor) / p;
  const ans = Math.round(ratio * 100000) / 100000;
  return { prompt: `Prepaid variable forward: floor 55, ceiling 67. Price at maturity ${p}. Settlement ratio? Round to 5 decimals.`, answer: ans, why: p <= floor ? 'At or below the floor → 1.' : p < cap ? `Between strikes → 55 / ${p} = ${ans}.` : `At or above the ceiling → 1 − 12 / ${p} = ${ans}.`, decimals: 5 };
}

function finPvfValue() {
  const p = randInt(40, 90);
  const ans = Math.min(Math.max(p, 55), 67) * 10000;
  return { prompt: `Prepaid variable forward on 10,000 t: floor 55, ceiling 67. Price at maturity ${p}. Producer’s total value at maturity (advance FV + coal kept)?`, answer: ans, why: `Clamp ${p} to [55, 67] × 10,000 = ${ans}.`, decimals: 0 };
}

function finCarry() {
  const usd = pick([5, 10, 20]) * 1000000;
  const ru = pick([1, 1.5, 2]);
  const rl = pick([4, 5, 6]);
  const fx0 = 7;
  const fx1 = pick([6.5, 6.8, 7, 7.2, 7.5]);
  const ans = round2(usd * fx0 * (1 + rl / 100) / fx1 - usd * (1 + ru / 100));
  return { prompt: `Carry trade: borrow USD ${usd} at ${ru}% for 1 year, convert at 7.00, invest at ${rl}%, convert back at ${fx1}. Profit in USD (negative = loss)? Round to 2 decimals.`, answer: ans, why: `${usd} × 7 × ${1 + rl / 100} / ${fx1} − ${usd} × ${1 + ru / 100} = ${ans}.` };
}

function finFundingSaving() {
  const inv = randInt(20, 120);
  const w = pick([8, 9, 10, 12]);
  const i = pick([2, 3, 4]);
  const ans = round2(inv * (w - i) / 100);
  return { prompt: `Supply-and-offtake: inventory USD ${inv} m. Refinery funds at ${w}%, intermediary at ${i}%. Annual saving in USD m? Round to 2 decimals.`, answer: ans, why: `${inv} × (${w}% − ${i}%) = ${ans}.` };
}

function finPrepayCost() {
  const px = randInt(40, 90);
  const r = pick([8, 10, 12]);
  const d = pick([14, 21, 30]);
  const ans = round2(px * r / 100 * d / 360);
  return { prompt: `A refinery prepays crude at USD ${px}/bbl ${d} days before delivery; its cost of capital is ${r}% (act/360). Financing cost per barrel? Round to 2 decimals.`, answer: ans, why: `${px} × ${r}% × ${d}/360 = ${ans}.` };
}

function finPutSpread() {
  const hi = randInt(18, 30);
  const lo = hi - randInt(3, 6);
  const s = randInt(lo - 6, hi + 6);
  const vol = pick([40000, 50000, 100000]);
  const ans = Math.min(Math.max(hi - s, 0), hi - lo) * vol;
  return { prompt: `Borrower sold a ${hi} put and bought a ${lo} put on ${vol} bbl. Average price ${s}. Payment by the borrower?`, answer: ans, why: `min(max(${hi} − ${s}, 0), ${hi - lo}) × ${vol} = ${ans}.`, decimals: 0 };
}

function finCaplet() {
  const strike = pick([3, 3.5, 4]);
  const rate = round2(strike + randInt(-100, 150) / 100);
  const n = pick([5, 10, 20]) * 1000000;
  const days = pick([90, 91, 92]);
  const ans = round2(Math.max(rate - strike, 0) / 100 * n * days / 360);
  return { prompt: `Caplet: rate ${rate}%, strike ${strike}%, notional ${n}, ${days} days (act/360). Payout? Round to 2 decimals.`, answer: ans, why: `max(${rate} − ${strike}, 0)% × ${n} × ${days}/360 = ${ans}.` };
}

function finRangeAccrual() {
  const base = pick([1, 1.5, 2]);
  const dig = pick([4, 5, 6]);
  const d = pick([90, 91, 92]);
  const n = randInt(0, d);
  const ans = round2(base + dig * n / d);
  return { prompt: `Range accrual: pay ${base}% + ${dig}% × N/D. Reference price above the strike on ${n} of ${d} days. Rate in %? Round to 2 decimals.`, answer: ans, why: `${base} + ${dig} × ${n}/${d} = ${ans}.` };
}

function finSwapNet() {
  const n = pick([5, 10, 25]) * 1000000;
  const fx = round2(randInt(150, 450) / 100);
  const fl = round2(randInt(100, 500) / 100);
  const days = pick([181, 182, 184]);
  const ans = round2((fx - fl) / 100 * n * days / 365);
  return { prompt: `Swap: ${n} notional, ${days} days (act/365), fixed ${fx}% vs floating ${fl}%. Net to the fixed receiver (negative = pays)? Round to 2 decimals.`, answer: ans, why: `(${fx} − ${fl})% × ${n} × ${days}/365 = ${ans}.` };
}

function invPortfolioVol() {
  const w = pick([0.6, 0.7, 0.8, 0.9]);
  const s1 = pick([0.12, 0.15, 0.18]);
  const s2 = pick([0.2, 0.25, 0.3]);
  const rho = pick([-0.3, -0.1, 0, 0.2, 0.4]);
  const v = Math.sqrt(w * w * s1 * s1 + (1 - w) * (1 - w) * s2 * s2 + 2 * w * (1 - w) * rho * s1 * s2);
  const ans = round2(v * 100);
  return { prompt: `${w * 100}% equities (vol ${s1 * 100}%) and ${round2((1 - w) * 100)}% commodities (vol ${s2 * 100}%), correlation ${rho}. Portfolio volatility in %? Round to 2 decimals.`, answer: ans, why: `√(${w}²·${s1}² + ${round2(1 - w)}²·${s2}² + 2·${w}·${round2(1 - w)}·${rho}·${s1}·${s2}) = ${ans}%.` };
}

function invRealReturn() {
  const n = pick([1, 2, 3, 4, 5]);
  const i = pick([1, 2, 3, 4, 6, 8]);
  const ans = round2(((1 + n / 100) / (1 + i / 100) - 1) * 100);
  return { prompt: `Nominal return ${n}%, inflation ${i}%. Real return in %? Round to 2 decimals.`, answer: ans, why: `(1.0${n} / ${1 + i / 100} − 1) = ${ans}%.` };
}

function invGoldFuture() {
  const s = randInt(1500, 3000);
  const fin = pick([1, 2, 3, 4, 5]);
  const lease = pick([0.5, 1, 2, 3]);
  const d = randInt(10, 180);
  const ans = round2(s * (1 + (fin - lease) / 100 * d / 360));
  return { prompt: `Spot gold ${s}; financing ${fin}%, lease ${lease}% (act/360); ${d} days. Futures price? Round to 2 decimals.`, answer: ans, why: `${s} × (1 + (${fin} − ${lease})% × ${d}/360) = ${ans}.` };
}

function invRollYield() {
  const spot = round2(randInt(-500, 1500) / 10);
  const ry = round2(randInt(-80, 80) / 10);
  const fut = round2(spot + ry);
  return { prompt: `Over a year, spot returned ${spot} and a rolled long futures position returned ${fut}. Roll yield (revised definition)? Round to 2 decimals.`, answer: ry, why: `${fut} − ${spot} = ${ry}.` };
}

function invBasisRoll() {
  const b0 = round2(randInt(-300, 300) / 100);
  const b1 = round2(randInt(-300, 300) / 100);
  const adj = round2(randInt(-800, 800) / 100);
  const ans = round2(b1 - b0 + adj);
  return { prompt: `Basis (future − spot) moves from ${b0} to ${b1}; cumulative roll adjustment ${adj}. Roll yield? Round to 2 decimals.`, answer: ans, why: `(${b1} − ${b0}) + ${adj} = ${ans}.` };
}

function invTrsIndex() {
  const n = pick([50, 100, 200]) * 1000000;
  const i0 = round2(randInt(200000, 400000) / 100);
  const i1 = round2(i0 * (1 + randInt(-60, 60) / 1000));
  const ans = round2(n * (i1 - i0) / i0);
  return { prompt: `TRS on ${n} notional; index moves from ${i0} to ${i1} (start level ${i0}). Index amount to the investor (negative = investor pays)? Round to 2 decimals.`, answer: ans, why: `${n} × (${i1} − ${i0}) / ${i0} = ${ans}.` };
}

function invTrsFee() {
  const n = pick([50, 100, 200]) * 1000000;
  const f = pick([0.15, 0.25, 0.4]);
  const d = pick([28, 30, 31]);
  const ans = round2(n * f / 100 * d / 365);
  return { prompt: `TRS fee ${f}% a year (act/365) on ${n} for a ${d}-day period. Fee amount? Round to 2 decimals.`, answer: ans, why: `${n} × ${f}% × ${d}/365 = ${ans}.` };
}

function invEtcValue() {
  const ent = round2(randInt(9000, 9990) / 100);
  const g = randInt(1200, 3500);
  const ans = round2(ent / 100 * 0.1 * g);
  return { prompt: `Gold ETC: entitlement ${ent}% of 0.1 oz per security; gold USD ${g}/oz. Value per security? Round to 2 decimals.`, answer: ans, why: `${ent}% × 0.1 × ${g} = ${ans}.` };
}

function invLeveragedPath() {
  const a = randInt(-10, 10);
  const b = randInt(-10, 10);
  const lev = pick([2, 3]);
  const ans = round2(100 * (1 + lev * a / 100) * (1 + lev * b / 100));
  return { prompt: `A ${lev}× daily leveraged product starts at 100. The index moves ${a}% on day 1 and ${b}% on day 2 (ignore fees). Product value? Round to 2 decimals.`, answer: ans, why: `100 × (1 + ${lev}×${a}%) × (1 + ${lev}×${b}%) = ${ans}.` };
}

function invZcb() {
  const r = pick([1, 2, 3, 4, 5]);
  const t = pick([3, 4, 5, 7]);
  const ans = round2(100000 / Math.pow(1 + r / 100, t));
  return { prompt: `Capital-protected note of USD 100,000, ${t} years, zero rate ${r}%. Cost of the zero-coupon bond? Round to 2 decimals.`, answer: ans, why: `100,000 / ${1 + r / 100}^${t} = ${ans}.` };
}

function invParticipation() {
  const budget = randInt(50, 250) * 100;
  const prem = randInt(10, 35);
  const ans = round2(budget / (prem / 100 * 100000) * 100);
  return { prompt: `Option budget USD ${budget} on a USD 100,000 note. A call on 100% of notional costs ${prem}% of notional. Participation rate in %? Round to 2 decimals.`, answer: ans, why: `${budget} / ${prem * 1000} = ${ans}%.` };
}

function invBasket() {
  const w0 = 50; const c0 = 2400;
  const w1 = randInt(30, 80); const c1 = randInt(1800, 3000);
  const b = 0.5 * w1 / w0 + 0.5 * c1 / c0;
  const ans = round2(Math.max(b, 1) * 100);
  return { prompt: `Capital-protected 50/50 basket note: WTI 50 → ${w1}, cocoa 2,400 → ${c1}, 100% participation. Redemption in %? Round to 2 decimals.`, answer: ans, why: `Basket = 0.5×${w1}/50 + 0.5×${c1}/2400 = ${round2(b)}; max(basket, 1) → ${ans}%.` };
}

function invReverseConvertible() {
  const cpn = pick([6, 8, 10]);
  const hit = pick([true, false]);
  const fin = hit ? randInt(50, 95) : randInt(81, 120);
  const ans = hit ? cpn + 100 - Math.max(0, 100 - fin) : 100 + cpn;
  return { prompt: `Reverse convertible: ${cpn}% coupon, 80% barrier ${hit ? 'was touched' : 'was never touched'}. Final price = ${fin}% of initial. Redemption in %?`, answer: ans, why: hit ? `100 + ${cpn} − max(0, 100 − ${fin}) = ${ans}.` : `Barrier not hit → 100 + ${cpn} = ${ans}.`, decimals: 0 };
}

function invOutperformance() {
  const a = randInt(60, 150) / 100;
  const b = randInt(60, 150) / 100;
  const m = pick([2, 3]);
  const ans = round2(100 + m * Math.max(a - b, 0) * 100);
  return { prompt: `Outperformance note: 100% + ${m * 100}% × max(A − B, 0). A return ${a}, B return ${b}. Payout in %? Round to 2 decimals.`, answer: ans, why: `100 + ${m} × max(${a} − ${b}, 0) × 100 = ${ans}%.` };
}

function invWorstOf() {
  const a = randInt(-20, 20);
  const b = randInt(-20, 20);
  const ans = 100 + Math.max(0, Math.min(a, b));
  return { prompt: `Worst-of call note: 100% + max(0, worst return). Asset 1 ${a}%, asset 2 ${b}%. Payout in %?`, answer: ans, why: `Worst = ${Math.min(a, b)}% → 100 + max(0, ${Math.min(a, b)}) = ${ans}.`, decimals: 0 };
}

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
  dsMlEigen: [mlEigenScale, mlEigen2d],
  dsMlGrad: [mlGradStep, mlGradStep2d, mlLearningRateScale],
  dsMlSplit: [mlTrainSplit, mlTestSplit, mlKFold],
  dsMlReg: [mlL2Penalty, mlL1Penalty],
  dsMlCv: [mlCvAverage, mlLoocvFolds, mlThreeWaySplit],
  dsMlTune: [mlGridSearch, mlBootstrapUnique],
  dsLrPredict: [lrPredict, lrSlopeTwoPoint],
  dsLrMetrics: [lrMse, lrRmse, lrR2],
  dsClfMetrics: [clfPrecision, clfRecall, clfF1, clfSpecificity, clfAccuracy],
  dsClfSigmoid: [clfSigmoid],
  dsClfEntropy: [clfBinaryEntropy],
  dsEnsBag: [ensBagVar, ensMtrySqrt, ensSoftVote],
  dsEnsBoost: [ensBoostShrink, ensAdaWeightBump],
  dsPcaVar: [pcaCumVar, pcaPc1Share],
  dsClustKmeans: [clustSse1d, clustAssign1d, clustCentroidMean],
  dsNnAct: [nnRelu, nnSigmoidNn, nnTanh, nnSoftplus],
  dsNnBackprop: [nnBackpropGrad, nnSgdStep],
  dsNnTrain: [nnMomentumStep, nnVanishProd, nnDropoutKeep],
  dsRlCore: [rlDiscountReturn, rlQUpdate, rlBellman],
  dsWfFeat: [wfZScore, wfMinMax, wfTrainTestCount],
  dsPsMetrics: [psKFactor, psRetentionRate, psChurnRate, psLtvCac, psStickiness, psPctChange],
  commLinear: [commForwardPnl, commFuturesVM, commInitialMargin, commTicks, commSwapSettle, commDifferential],
  commOptions: [commCallProfit, commPutProfit, commBreakeven, commSpreadPayoff, commAvgCall],
  commValuation: [commCarryForward, commArbProfit, commConvenience, commCarryTrade, commDiscountFactor, commSwapFixed, commParity, commDeltaEquiv, commBachelier],
  commRisk: [commDeltaHedge, commRehedgeLoss, commDailyVol, commThetaIncome, commSwapClaim, commSpreadTrade, commRollCost, commCrack],
  commGold: [goldCarat, goldForward, goldSwapRate, goldImpliedLease, goldGoldInterest, goldUnwind, goldNdf, goldMarginTopUp, goldCoveredCall, goldLocational],
  commBase: [baseConcPayable, baseRc, baseBauxite, baseLots, baseFloatingFwd, baseLendRoll, baseCollar, baseBasketPayoff, baseBasketVol],
  commCrude: [crudeProductRevenue, crude321, crudeCfdImplied, crudeEfp, crudeRoll, crudeBasis, crudeJetHedge, crudeMarginSwap, crudeTonneToBbl],
  commPower: [powerContractVolume, powerContractValue, powerMeritOrder, powerCleanSpark, powerCleanDark, powerMarketHeatRate, powerSparkHeatRate, powerSwapNet, powerCfd, powerCrossBorder, powerLmpCongestion, powerHeatRateCall, powerReserveMargin],
  commPlastics: [plasticsMolar, plasticsCracker, plasticsForwardHedge, plasticsSwap, plasticsOffset, plasticsProxy, plasticsAvgCall, plasticsFx, plasticsReduction],
  commBulk: [bulkRpRatio, bulkCoalSwap, bulkCoveredCall, bulkSwaption, bulkFeAdjust, bulkTcToVc, bulkMultiplier, bulkIndexChange, bulkBdi, bulkWorldscale, bulkVcFfa, bulkTcFfa, bulkTargetPayout, bulkReroute],
  commClimate: [climateCo2e, climateAbatement, climateFuelSwitch, climateMsr, climateFairForward, climateImpliedRate, climateRepo, climateSwap, climateCall, climateHdd, climateCdd, climateWeatherSwap, climateWeatherOption, climateHddStrike],
  commAg: [agEndingStocks, agStocksToUse, agCrush, agBagsToTonnes, agBushelTonnes, agContractValue, agTickPnl, agCotNet, agCornSwap, agSpreadPut, agAccumulator, agTarnCost, agTarnCapped, agPalmOutput],
  commFinance: [finTopUp, finDscr, finRepoSpot, finHaircut, finPrepay, finPvfRatio, finPvfValue, finCarry, finFundingSaving, finPrepayCost, finPutSpread, finCaplet, finRangeAccrual, finSwapNet],
  commInvest: [invPortfolioVol, invRealReturn, invGoldFuture, invRollYield, invBasisRoll, invTrsIndex, invTrsFee, invEtcValue, invLeveragedPath, invZcb, invParticipation, invBasket, invReverseConvertible, invOutperformance, invWorstOf],
};

export function drawFromBank(bankId) {
  const gens = COMPUTE_BANKS[bankId];
  if (!gens || !gens.length) return null;
  return pick(gens)();
}
