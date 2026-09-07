import linearEx1 from './linear-ex1';
import linearEx2 from './linear-ex2';
import linearEx3 from './linear-ex3';
import linearEx4 from './linear-ex4';

/**
 * Register guided-choice worked examples here.
 * MDX: <GuidedChoiceExplanation preset="linear-ex1" />
 */
const GUIDES = {
  'linear-ex1': linearEx1,
  'linear-ex2': linearEx2,
  'linear-ex3': linearEx3,
  'linear-ex4': linearEx4,
};

export function getGuidedChoice(id) {
  return GUIDES[id] || null;
}
