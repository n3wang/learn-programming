import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import SolidFigureView from '@site/src/components/interactive/solidView/SolidFigureView';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：长方体、三棱锥、圆锥、球、圆柱。 */
const SOLIDS = {
  cuboid: {
    name: '长方体',
    flat: '6 个面都是平的（长方形）',
    curved: '没有曲的面',
  },
  triPyramid: {
    name: '三棱锥',
    flat: '4 个面都是平的（三角形）',
    curved: '没有曲的面',
  },
  cone: {
    name: '圆锥',
    flat: '底面是平的（圆）',
    curved: '侧面是曲的',
  },
  sphere: {
    name: '球',
    flat: '没有平的面',
    curved: '整个表面是曲的',
  },
  cylinder: {
    name: '圆柱',
    flat: '上、下底面是平的（圆）',
    curved: '侧面是曲的',
  },
};

const BOOK = ['cuboid', 'triPyramid', 'cone', 'sphere', 'cylinder'];

function bookProblem() {
  return { ids: BOOK };
}

function generate() {
  return { ids: [pickOne(BOOK)] };
}

export default function FaceFlatCurvedSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const items = useMemo(() => p.ids.map((id) => ({ id, ...SOLIDS[id] })), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((s) => (
        <SolutionStep key={s.id} badge={s.name} badgeClass={stepStyles.badgeSet}>
          平的：{s.flat}。曲的：{s.curved}。
        </SolutionStep>
      ))}
      <SolutionStep badge="记" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          多边形围成的面是平的；圆、圆柱侧面、圆锥侧面、球面是曲的。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：哪些面是平的，哪些面是曲的"
      subtitle="围成体的面，有的是平面，有的是曲面"
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
      <Typography sx={{ mb: 1 }}>
        围成下面这些立体图形的各个面中，哪些面是平的？哪些面是曲的？
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
        {items.map((s, i) => (
          <div key={s.id}>
            <SolidFigureView solidId={s.id} highlight="faces" height={160} caption={`${i + 1}  ${s.name}`} />
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
