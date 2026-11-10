import { createContext, useContext, useEffect } from 'react';

/**
 * Set by the 综合练习 runner (shell/MixedPractice.js) around an embedded
 * simulator. When present:
 *  - simulators start on a random problem instead of the book one;
 *  - ProblemShell hides its own header buttons and shows the solution only when
 *    `showAnswer` is true (the runner owns the reveal / next flow);
 *  - simulators report what the student must type via usePracticeAnswer.
 */
const PracticeModeContext = createContext(null);

export function usePracticeMode() {
  return useContext(PracticeModeContext);
}

/**
 * Report the answer fields for the problem currently shown. No-op outside a
 * practice runner, so simulators can call it unconditionally.
 *
 * `fields` — see shell/MixedPractice.js for shapes (number / choice / ineq / range).
 * Pass a value that is cheap to rebuild; it is compared by JSON.
 */
export function usePracticeAnswer(fields) {
  const practice = useContext(PracticeModeContext);
  const report = practice && practice.reportFields;
  const sig = report ? JSON.stringify(fields) : '';
  useEffect(() => {
    if (!report || !fields) return;
    const ok = fields.filter(Boolean);
    if (ok.length !== fields.length && typeof console !== 'undefined') {
      // A helper (ineqField / rangeField …) could not parse the simulator's answer string.
      console.warn('[practice] dropped unparseable answer field(s)', fields);
    }
    report(ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, sig]);
}

export default PracticeModeContext;
