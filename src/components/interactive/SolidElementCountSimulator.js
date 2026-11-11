import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import SolidFigureView from '@site/src/components/interactive/solidView/SolidFigureView';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：长方体 6 个面、12 条棱、8 个顶点。 */
const SOLIDS = {
  cuboid: {
    name: '长方体',
    faces: 6,
    edges: 12,
    vertices: 8,
    note: '6 个面都是长方形（相对的面全等）。面和面相交成直的棱。',
  },
  cube: {
    name: '正方体',
    faces: 6,
    edges: 12,
    vertices: 8,
    note: '可以看成特殊的长方体：6 个面都是正方形。',
  },
  triPrism: {
    name: '三棱柱',
    faces: 5,
    edges: 9,
    vertices: 6,
    note: '2 个三角形底面 + 3 个长方形侧面。侧棱有 3 条，上下底各 3 条边。',
  },
  sqPyramid: {
    name: '四棱锥',
    faces: 5,
    edges: 8,
    vertices: 5,
    note: '1 个四边形底面 + 4 个三角形侧面。侧面交于 1 个顶点。',
  },
  triPyramid: {
    name: '三棱锥',
    faces: 4,
    edges: 6,
    vertices: 4,
    note: '4 个面都是三角形，是面数最少的棱锥。',
  },
};

function bookProblem() {
  return { id: 'cuboid' };
}

function generate() {
  const ids = Object.keys(SOLIDS);
  return { id: pickOne(ids) };
}

export default function SolidElementCountSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  const [highlight, setHighlight] = useState('faces');
  const s = useMemo(() => SOLIDS[p.id], [p]);
  usePracticeAnswer([numberField("f", "面", s.faces, "F"), numberField("e", "棱", s.edges, "E"), numberField("v", "顶点", s.vertices, "V")]);

  const solution = (
    <Solution legend={[[GREEN, '数出来的个数']]}>
      <Step b="面" kind="set">
        包围着体的是<b>面</b>。{s.name}有 <M t={c(GREEN, s.faces)} /> 个面。{s.note}
      </Step>
      <Step b="棱" kind="list">
        面和面相交的地方形成<b>线</b>（棱）。一共 <M t={c(GREEN, s.edges)} /> 条。数的时候可以按「上、下、侧面」分组，避免重复。
      </Step>
      <Step b="点" kind="solve">
        线和线相交的地方是<b>点</b>（顶点）。一共 <M t={c(GREEN, s.vertices)} /> 个。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {s.name}有 {s.faces} 个面、{s.edges} 条棱（线）、{s.vertices} 个顶点。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="思考：数面、棱、顶点"
      subtitle="体由面围成，面和面相交成棱，棱和棱相交成顶点"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setHighlight('faces');
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography sx={{ mb: 1 }}>
        下面是一个<b>{s.name}</b>。它有几个面？面和面相交的地方形成了几条棱？棱和棱相交成几个顶点？
      </Typography>
      <SolidFigureView solidId={p.id} highlight={highlight} height={220} caption="拖动转动 · 对照着数" />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {[
          ['faces', '数面'],
          ['edges', '数棱'],
          ['vertices', '数顶点'],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setHighlight(mode)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: highlight === mode ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </ProblemShell>
  );
}
