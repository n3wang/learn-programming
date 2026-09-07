import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { unit: 1 };
}

function generate() {
  return { unit: randInt(1, 4) };
}

export default function SegmentEqualPartsSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const u = p.unit;
  const lengths = useMemo(() => ({ ac: 2 * u, cd: u, db: u, ab: 4 * u }), [u]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        设 CD = DB = {u}，则 CB = CD + DB = {2 * u}。又 AC = CB，所以 AC = {2 * u}。因此点 C 是线段 AB 的中点。
        AD = AC + CD = {3 * u}，AC = {2 * u} = (2/3) AD，所以点 C 是线段 AD 的三等分点。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          AC = {lengths.ac}，DB = {lengths.db}，AC 是 DB 的 2 倍。AB = {lengths.ab}，CD = {lengths.cd}，AB 是 CD 的 4 倍。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="习题 4：中点与三等分点"
      subtitle="AC = CB，CD = DB，点 C、D 都在线段 AB 上"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        点 C、D 在线段 AB 上，且 AC = CB，CD = DB。下面按这个单位画出，每一小段长为 {u}。
      </p>
      <svg viewBox="0 0 320 70" width="100%" height="70">
        <line x1="28" y1="28" x2="292" y2="28" stroke="#1565c0" strokeWidth="2" />
        {[28, 160, 226, 292].map((x) => (
          <circle key={x} cx={x} cy="28" r="3.4" fill="#c62828" />
        ))}
        <text x="20" y="50" fontSize="13">A</text>
        <text x="152" y="50" fontSize="13">C</text>
        <text x="218" y="50" fontSize="13">D</text>
        <text x="286" y="50" fontSize="13">B</text>
      </svg>
      <p>点 ______ 是线段 AB 的中点，点 C 是线段 ______ 的三等分点。AC 是 DB 的几倍？AB 是 CD 的几倍？</p>
    </ProblemShell>
  );
}
