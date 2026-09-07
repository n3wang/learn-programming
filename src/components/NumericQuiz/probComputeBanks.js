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
};

export function drawFromBank(bankId) {
  const gens = COMPUTE_BANKS[bankId];
  if (!gens || !gens.length) return null;
  return pick(gens)();
}
