import acEnergyCost from './ac-energy-cost';
import angleDirection from './angle-direction';
import angleEx2 from './angle-ex2';
import angleEx3 from './angle-ex3';
import angleEx4 from './angle-ex4';
import boltNutMatching from './bolt-nut-matching';
import bookSortingRate from './book-sorting-rate';
import copyShopCost from './copy-shop-cost';
import costProfitBook from './cost-profit-book';
import degreeAdd from './degree-add';
import eqCheckNo from './eq-check-no';
import eqCheckYes from './eq-check-yes';
import errorKindClassify from './error-kind-classify';
import quadraticStableRoot from './quadratic-stable-root';
import errorTradeoffStop from './error-tradeoff-stop';
import sineSeriesStop from './sine-series-stop';
import besselMillerDown from './bessel-miller-down';
import specularCloseOrbit from './specular-close-orbit';
import lcgPseudoRandom from './lcg-pseudo-random';
import randomWalkRms from './random-walk-rms';
import brainDiffusionObstacles from './brain-diffusion-obstacles';
import proteinHpFold from './protein-hp-fold';
import spontaneousDecay from './spontaneous-decay';
import rngUniformTests from './rng-uniform-tests';
import forwardCentralDiff from './forward-central-diff';
import extrapolatedDiff from './extrapolated-diff';
import riemannBoxCounting from './riemann-box-counting';
import rombergIntegration from './romberg-integration';
import gaussianQuadrature from './gaussian-quadrature';
import monteCarloIntegration from './monte-carlo-integration';
import lagrangeInterpolation from './lagrange-interpolation';
import cubicSplineInterpolation from './cubic-spline-interpolation';
import meanValueNd from './mean-value-nd';
import linearEx1 from './linear-ex1';
import linearEx2 from './linear-ex2';
import linearEx3 from './linear-ex3';
import linearEx4 from './linear-ex4';
import matchingPartsDays from './matching-parts-days';
import profitLossPair from './profit-loss-pair';
import sameProfitTwoCosts from './same-profit-two-costs';
import solvingEx31 from './solving-ex3-1';
import solvingEx32 from './solving-ex3-2';
import solvingEx33 from './solving-ex3-3';
import solvingEx34 from './solving-ex3-4';
import ineqCarTime from './ineq-car-time';
import ineqCarDistance from './ineq-car-distance';
import rodBalance from './rod-balance';
import segment2aB from './segment-2a-b';
import solveFraction from './solve-fraction';
import solveParen from './solve-paren';
import solveTranspose from './solve-transpose';
import solveWord from './solve-word';
import subwayPassCost from './subway-pass-cost';
import supplementComplement from './supplement-complement';
import tableWoodPlan from './table-wood-plan';
import waterTierPricing from './water-tier-pricing';

/**
 * Register guided-choice worked examples here.
 * MDX: <GuidedChoiceExplanation preset="linear-ex1" />
 */
const GUIDES = {
  'ac-energy-cost': acEnergyCost,
  'angle-direction': angleDirection,
  'angle-ex2': angleEx2,
  'angle-ex3': angleEx3,
  'angle-ex4': angleEx4,
  'bolt-nut-matching': boltNutMatching,
  'book-sorting-rate': bookSortingRate,
  'copy-shop-cost': copyShopCost,
  'cost-profit-book': costProfitBook,
  'degree-add': degreeAdd,
  'eq-check-no': eqCheckNo,
  'eq-check-yes': eqCheckYes,
  'error-kind-classify': errorKindClassify,
  'quadratic-stable-root': quadraticStableRoot,
  'error-tradeoff-stop': errorTradeoffStop,
  'sine-series-stop': sineSeriesStop,
  'bessel-miller-down': besselMillerDown,
  'specular-close-orbit': specularCloseOrbit,
  'lcg-pseudo-random': lcgPseudoRandom,
  'random-walk-rms': randomWalkRms,
  'brain-diffusion-obstacles': brainDiffusionObstacles,
  'protein-hp-fold': proteinHpFold,
  'spontaneous-decay': spontaneousDecay,
  'rng-uniform-tests': rngUniformTests,
  'forward-central-diff': forwardCentralDiff,
  'extrapolated-diff': extrapolatedDiff,
  'riemann-box-counting': riemannBoxCounting,
  'romberg-integration': rombergIntegration,
  'gaussian-quadrature': gaussianQuadrature,
  'monte-carlo-integration': monteCarloIntegration,
  'lagrange-interpolation': lagrangeInterpolation,
  'cubic-spline-interpolation': cubicSplineInterpolation,
  'mean-value-nd': meanValueNd,
  'linear-ex1': linearEx1,
  'linear-ex2': linearEx2,
  'linear-ex3': linearEx3,
  'linear-ex4': linearEx4,
  'matching-parts-days': matchingPartsDays,
  'profit-loss-pair': profitLossPair,
  'same-profit-two-costs': sameProfitTwoCosts,
  'solving-ex3-1': solvingEx31,
  'solving-ex3-2': solvingEx32,
  'solving-ex3-3': solvingEx33,
  'solving-ex3-4': solvingEx34,
  'ineq-car-time': ineqCarTime,
  'ineq-car-distance': ineqCarDistance,
  'rod-balance': rodBalance,
  'segment-2a-b': segment2aB,
  'solve-fraction': solveFraction,
  'solve-paren': solveParen,
  'solve-transpose': solveTranspose,
  'solve-word': solveWord,
  'subway-pass-cost': subwayPassCost,
  'supplement-complement': supplementComplement,
  'table-wood-plan': tableWoodPlan,
  'water-tier-pricing': waterTierPricing,
};

export function getGuidedChoice(id) {
  return GUIDES[id] || null;
}
