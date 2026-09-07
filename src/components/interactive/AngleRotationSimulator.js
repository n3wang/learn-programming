import React, { useState } from 'react';

function rayEnd(deg, len) {
  const rad = (deg * Math.PI) / 180;
  return { x: 150 + Math.cos(rad) * len, y: 118 - Math.sin(rad) * len };
}

export default function AngleRotationSimulator() {
  const [deg, setDeg] = useState(40);
  const end = rayEnd(deg, 92);
  const start = rayEnd(0, 92);
  let name = '锐角或一般的角';
  if (deg === 0 || deg === 360) name = '始边与终边重合，形成周角';
  else if (deg === 180) name = '始边与终边成一条直线，形成平角';
  else if (deg === 90) name = '直角';

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        射线 OA 绕端点 O 旋转。拖动看终止位置：成一条直线时是平角，再转到重合时是周角。
      </p>
      <svg viewBox="0 0 300 160" width="100%" height="150">
        <line x1="150" y1="118" x2={start.x} y2={start.y} stroke="#1565c0" strokeWidth="2" />
        <line x1="150" y1="118" x2={end.x} y2={end.y} stroke="#e91e63" strokeWidth="2" />
        <path
          d={describeArc(150, 118, 28, 0, deg)}
          fill="none"
          stroke="#e91e63"
          strokeWidth="1.6"
        />
        <circle cx="150" cy="118" r="3.4" fill="#c62828" />
        <text x="138" y="136" fontSize="13">O</text>
        <text x={start.x + 4} y={start.y + 4} fontSize="13">A</text>
        <text x={end.x + 4} y={end.y} fontSize="13">B</text>
      </svg>
      <input
        type="range"
        min="0"
        max="360"
        value={deg}
        onChange={(e) => setDeg(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <p style={{ fontSize: 14 }}>
        转过 {deg}°。{name}。
      </p>
    </div>
  );
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const s = rayEnd(startDeg, r);
  const e = rayEnd(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  if (endDeg === 0) return '';
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}
