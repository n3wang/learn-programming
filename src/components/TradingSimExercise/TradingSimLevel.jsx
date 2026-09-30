import React from 'react';
import TradingSimExercise from '@site/src/components/TradingSimExercise';
import {getLevel} from './levels';

/**
 * One trading-sim level from the bank (tick loop + Data tables).
 */
export default function TradingSimLevel({
  levelId,
  title: titleProp,
  prompt,
  hint,
  starter,
  sourceChecks,
  ...rest
}) {
  const level = getLevel(levelId);
  if (!level) {
    return <p>未知交易关卡 id: {levelId}</p>;
  }
  const title = titleProp || level.title;
  return (
    <TradingSimExercise
      title={title}
      prompt={prompt || level.prompt}
      starter={starter || level.starter}
      solution={level.solution}
      hint={hint || level.hint}
      companies={level.companies}
      pricesByTick={level.pricesByTick}
      startingCash={level.startingCash}
      listedEtfs={level.listedEtfs || {}}
      tables={level.tables}
      tests={level.tests}
      sourceChecks={sourceChecks || level.sourceChecks}
      {...rest}
    />
  );
}
