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

/**
 * Register guided-choice worked examples here.
 * MDX: <GuidedChoiceExplanation preset="linear-ex1" />
 */
const GUIDES = {
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
};

export function getGuidedChoice(id) {
  return GUIDES[id] || null;
}
