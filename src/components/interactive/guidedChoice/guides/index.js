import acEnergyCost from './ac-energy-cost';
import angleDirection from './angle-direction';
import angleEx2 from './angle-ex2';
import angleEx3 from './angle-ex3';
import angleEx4 from './angle-ex4';
import costProfitBook from './cost-profit-book';
import degreeAdd from './degree-add';
import eqCheckNo from './eq-check-no';
import eqCheckYes from './eq-check-yes';
import linearEx1 from './linear-ex1';
import linearEx2 from './linear-ex2';
import linearEx3 from './linear-ex3';
import linearEx4 from './linear-ex4';
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
import supplementComplement from './supplement-complement';

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
  'cost-profit-book': costProfitBook,
  'degree-add': degreeAdd,
  'eq-check-no': eqCheckNo,
  'eq-check-yes': eqCheckYes,
  'linear-ex1': linearEx1,
  'linear-ex2': linearEx2,
  'linear-ex3': linearEx3,
  'linear-ex4': linearEx4,
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
  'supplement-complement': supplementComplement,
};

export function getGuidedChoice(id) {
  return GUIDES[id] || null;
}
