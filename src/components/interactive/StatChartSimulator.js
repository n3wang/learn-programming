import React, { useEffect, useMemo, useState } from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

/**
 * 第十二章 数据的收集、整理与描述: one widget for every table and chart in the
 * chapter. A preset gives the data; the widget shows the 划记 table and lets
 * the student switch between 条形图 / 扇形图 / 折线图 (and 复合 charts for two
 * series). Presets with raw data can be tallied one item at a time.
 *
 * <StatChartSimulator preset="activities-class" />
 */

const COLORS = ['#1fa7e1', '#f26b2b', '#9e9e9e', '#f7c531', '#5cb85c', '#8e6bd6', '#e05b8c', '#3cb8a8', '#b07a4f', '#6d7fe0'];

const BMI = [
  25.2, 17.9, 22.2, 23.3, 29.0, 21.4, 18.0, 19.2,
  21.0, 17.5, 18.9, 22.9, 27.2, 21.2, 18.8, 18.3,
  20.7, 16.7, 18.4, 17.5, 22.3, 22.1, 24.1, 20.0,
  34.6, 17.4, 21.2, 22.5, 26.1, 21.5, 20.8, 19.4,
  20.8, 17.5, 18.8, 22.6, 27.0, 19.1, 24.4, 23.8,
  21.7, 22.1, 19.5, 23.7, 23.7, 21.4, 19.7, 19.3,
  23.4, 29.1, 23.2, 27.6, 23.8, 23.9, 23.5, 31.0,
  18.4, 23.9, 23.4, 31.0,
];

const SNACK = 'CCCBADBCC DCCABDCEC ECCABECBC CBCCBCBDC'.replace(/ /g, '').split('');

const ACTIVITIES = ['文学（A）', '科技（B）', '体育（C）', '艺术（D）', '劳技（E）'];

const YEARS = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];

const REGIONS = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
];

const PRESETS = {
  'activities-class': {
    title: '表 12.1-1 全班同学最喜爱的课外活动',
    categories: ACTIVITIES,
    counts: [7, 8, 17, 14, 4],
    unit: '人',
    countLabel: '人数',
    tally: true,
    charts: ['bar', 'pie'],
  },
  'activities-sample': {
    title: '表 12.1-2 抽样调查 100 名学生最喜爱的课外活动',
    categories: ACTIVITIES,
    counts: [13, 18, 32, 27, 10],
    unit: '人',
    countLabel: '人数',
    tally: true,
    charts: ['pie', 'bar'],
  },
  'activities-compare': {
    title: '全班（全面调查）与样本（抽样调查）的百分比对比',
    xLabels: ['文学', '科技', '体育', '艺术', '劳技'],
    series: [
      { name: '全班 50 人', values: [14, 16, 34, 28, 8] },
      { name: '样本 100 人', values: [13, 18, 32, 27, 10] },
    ],
    unit: '%',
    charts: ['groupBar'],
  },
  bmi: {
    title: '某公司 60 名员工的体重指数（BMI）',
    raw: BMI,
    rawFormat: (x) => x.toFixed(1),
    categories: ['体重过低', '体重正常', '超重', '肥胖'],
    rules: ['m < 18.5', '18.5 ≤ m < 24.0', '24.0 ≤ m < 28.0', 'm ≥ 28.0'],
    classify: (m) => (m < 18.5 ? 0 : m < 24 ? 1 : m < 28 ? 2 : 3),
    unit: '人',
    countLabel: '人数',
    tally: true,
    charts: ['bar', 'pie'],
  },
  clubs: {
    title: '七年级参加社团活动的人数（改编）',
    categories: ['文学社', '美术社', '舞蹈社', '篮球社'],
    counts: [80, 40, 60, 20],
    unit: '人',
    countLabel: '人数',
    hidden: [3],
    charts: ['bar', 'pie'],
  },
  villages: {
    title: '学生来自三个村庄的人数',
    categories: ['青山村', '绿水村', '向阳村'],
    counts: [20, 40, 40],
    unit: '人',
    countLabel: '人数',
    hidden: [0, 1, 2],
    charts: ['pie', 'bar'],
  },
  budget: {
    title: '张华家下个月各项消费支出的预算额',
    categories: ['食品', '住房贷款', '教育', '交通', '衣着', '医疗', '生活用品及水、电费', '其他'],
    counts: [2100, 1750, 1100, 550, 350, 500, 350, 300],
    unit: '元',
    countLabel: '预算额／元',
    hidden: [0, 1, 2, 3, 4, 5, 6, 7],
    charts: ['pie', 'bar'],
  },
  trade: {
    title: '表 12.2-3 2013—2022 年我国货物进、出口总额（亿元）',
    xLabels: YEARS,
    series: [
      { name: '货物出口总额', values: [137131, 143884, 141167, 138419, 153309, 164129, 172374, 179279, 214255, 236337] },
      { name: '货物进口总额', values: [121038, 120358, 104336, 104967, 124790, 140881, 143254, 142936, 173137, 180391] },
    ],
    unit: '亿元',
    charts: ['line', 'groupBar'],
  },
  reserves: {
    title: '某年我国分地区国家级自然保护区的个数',
    categories: REGIONS,
    counts: [2, 3, 14, 8, 29, 19, 24, 49, 2, 3, 11, 8, 17, 16, 7, 13, 22, 23, 15, 23, 10, 7, 32, 11, 21, 11, 26, 21, 7, 9, 15],
    unit: '个',
    countLabel: '个数',
    charts: ['bar'],
    sortable: true,
  },
  snack: {
    title: '顾客对某种点心咸度的评价',
    raw: SNACK,
    rawFormat: (x) => x,
    categories: ['A 太咸', 'B 稍咸', 'C 适中', 'D 稍淡', 'E 太淡'],
    classify: (x) => 'ABCDE'.indexOf(x),
    unit: '人',
    countLabel: '人数',
    tally: true,
    charts: ['bar', 'pie'],
  },
};

const CHART_NAMES = { bar: '条形图', pie: '扇形图', line: '复合折线图', groupBar: '复合条形图' };

/** 划记: every full 正 is five; the partial character shows the strokes so far. */
export function tallyMarks(n) {
  return '正'.repeat(Math.floor(n / 5)) + ['', '一', '丅', '下', '止'][n % 5];
}

/** 16.666… → "16.7", 34 → "34". */
export function percent(part, total) {
  if (!total) return '0';
  return String(Math.round((part / total) * 1000) / 10);
}

const fmt = (n) => (Math.abs(n) >= 10000 ? n.toLocaleString('en-US') : String(n));

/** A round step for the value axis: 1, 2, 5 × 10^k, about 5 gridlines. */
function niceStep(max) {
  const raw = max / 5;
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const m = raw / pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * pow;
}

function Axis({ max, step, x0, x1, y0, y1, unit }) {
  const lines = [];
  for (let v = 0; v <= max + 1e-9; v += step) {
    const y = y0 - ((y0 - y1) * v) / max;
    lines.push(
      <g key={v}>
        <line x1={x0} x2={x1} y1={y} y2={y} stroke="var(--ifm-color-emphasis-300)" strokeWidth="1" />
        <text x={x0 - 6} y={y + 4} textAnchor="end" fontSize="11" fill="var(--ifm-color-emphasis-700)">
          {fmt(v)}
        </text>
      </g>,
    );
  }
  return (
    <g>
      {lines}
      <text x={x0 - 6} y={y1 - 10} textAnchor="end" fontSize="11" fill="var(--ifm-color-emphasis-700)">
        {unit}
      </text>
    </g>
  );
}

function BarChart({ labels, series, unit, highlight }) {
  const W = 640;
  const H = 300;
  const x0 = 58;
  const x1 = W - 12;
  const y0 = H - 46;
  const y1 = 22;
  const all = series.flatMap((s) => s.values);
  const step = niceStep(Math.max(...all, 1));
  const max = Math.ceil(Math.max(...all, 1) / step) * step;
  const band = (x1 - x0) / labels.length;
  const groupW = band * 0.72;
  const barW = groupW / series.length;
  const many = labels.length > 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="条形图">
      <Axis max={max} step={step} x0={x0} x1={x1} y0={y0} y1={y1} unit={unit} />
      {labels.map((label, i) => (
        <g key={label}>
          {series.map((s, k) => {
            const v = s.values[i];
            if (v == null) return null;
            const h = ((y0 - y1) * v) / max;
            const x = x0 + band * i + (band - groupW) / 2 + barW * k;
            const color = series.length > 1 ? COLORS[k] : COLORS[i % COLORS.length];
            return (
              <g key={s.name}>
                <rect x={x} y={y0 - h} width={barW - 1} height={h} fill={color} opacity={highlight == null || highlight === i ? 1 : 0.35}>
                  <title>{`${label}：${fmt(v)}`}</title>
                </rect>
                {!many && series.length * labels.length <= 12 ? (
                  <text x={x + barW / 2} y={y0 - h - 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ifm-font-color-base)">
                    {fmt(v)}
                  </text>
                ) : null}
              </g>
            );
          })}
          <text
            x={x0 + band * i + band / 2}
            y={y0 + 16}
            textAnchor={many ? 'end' : 'middle'}
            fontSize={many ? 10 : 12}
            fill="var(--ifm-font-color-base)"
            transform={many ? `rotate(-50 ${x0 + band * i + band / 2} ${y0 + 12})` : undefined}>
            {label.replace(/（.*）/, '')}
          </text>
        </g>
      ))}
      <line x1={x0} x2={x1} y1={y0} y2={y0} stroke="var(--ifm-font-color-base)" />
    </svg>
  );
}

function LineChart({ labels, series, unit }) {
  const W = 640;
  const H = 300;
  const x0 = 70;
  const x1 = W - 16;
  const y0 = H - 40;
  const y1 = 22;
  const all = series.flatMap((s) => s.values);
  const step = niceStep(Math.max(...all, 1));
  const max = Math.ceil(Math.max(...all, 1) / step) * step;
  const xAt = (i) => x0 + ((x1 - x0) * i) / Math.max(1, labels.length - 1);
  const yAt = (v) => y0 - ((y0 - y1) * v) / max;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="折线图">
      <Axis max={max} step={step} x0={x0} x1={x1} y0={y0} y1={y1} unit={unit} />
      {labels.map((label, i) => (
        <text key={label} x={xAt(i)} y={y0 + 18} textAnchor="middle" fontSize="11" fill="var(--ifm-font-color-base)">
          {label}
        </text>
      ))}
      {series.map((s, k) => (
        <g key={s.name}>
          <polyline points={s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')} fill="none" stroke={COLORS[k]} strokeWidth="2.5" strokeDasharray={k ? '6 4' : undefined} />
          {s.values.map((v, i) => (
            <circle key={i} cx={xAt(i)} cy={yAt(v)} r="4" fill={COLORS[k]}>
              <title>{`${labels[i]} ${s.name}：${fmt(v)}`}</title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}

function PieChart({ labels, values }) {
  const total = values.reduce((a, b) => a + b, 0);
  const R = 110;
  const cx = 130;
  const cy = 130;
  let angle = -Math.PI / 2;
  const slices = values.map((v, i) => {
    const a0 = angle;
    const a1 = angle + (total ? (2 * Math.PI * v) / total : 0);
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)];
    const p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
    const mid = (a0 + a1) / 2;
    const d = v === total ? `M ${cx - R} ${cy} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0` : `M ${cx} ${cy} L ${p0[0]} ${p0[1]} A ${R} ${R} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`;
    return { d, mid, v, i, deg: Math.round((360 * v) / (total || 1)) };
  });
  return (
    <svg viewBox="0 0 470 260" style={{ width: '100%', maxWidth: 520, height: 'auto' }} role="img" aria-label="扇形图">
      {slices.map((s) =>
        s.v > 0 ? (
          <g key={s.i}>
            <path d={s.d} fill={COLORS[s.i % COLORS.length]} stroke="#fff" strokeWidth="1.5">
              <title>{`${labels[s.i]}：${percent(s.v, total)}%，圆心角约 ${s.deg}°`}</title>
            </path>
            {s.v / total >= 0.04 ? (
              <text x={cx + R * 0.66 * Math.cos(s.mid)} y={cy + R * 0.66 * Math.sin(s.mid) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#141414">
                {percent(s.v, total)}%
              </text>
            ) : null}
          </g>
        ) : null,
      )}
      {labels.map((label, i) => (
        <g key={label} transform={`translate(270 ${18 + i * 22})`}>
          <rect width="14" height="14" fill={COLORS[i % COLORS.length]} />
          <text x="20" y="12" fontSize="12" fill="var(--ifm-font-color-base)">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function StatChartSimulator({ preset = 'activities-class', chart }) {
  const p = PRESETS[preset];
  const [type, setType] = useState(chart || p.charts[0]);
  const [revealed, setRevealed] = useState(!p.hidden);
  const [step, setStep] = useState(p.raw ? 0 : null);
  const [playing, setPlaying] = useState(false);
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    if (step >= p.raw.length) {
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setStep((s) => s + 1), p.raw.length > 40 ? 90 : 160);
    return () => clearTimeout(t);
  }, [playing, step, p.raw]);

  const counts = useMemo(() => {
    if (!p.raw) return p.counts;
    const c = p.categories.map(() => 0);
    p.raw.slice(0, step).forEach((x) => {
      c[p.classify(x)] += 1;
    });
    return c;
  }, [p, step]);

  const isSeries = Boolean(p.series);
  const total = isSeries ? 0 : counts.reduce((a, b) => a + b, 0);
  const hide = (i) => !revealed && p.hidden && p.hidden.includes(i);
  const lastClass = p.raw && step > 0 ? p.classify(p.raw[step - 1]) : null;

  let order = (p.categories || []).map((_, i) => i);
  if (sorted) order = [...order].sort((a, b) => counts[b] - counts[a]);
  const shownCats = order.filter((i) => !hide(i));

  const btn = (active) => ({
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: 8,
    padding: '4px 12px',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: active ? 700 : 400,
    background: active ? 'var(--ifm-color-primary-lightest)' : 'transparent',
    color: active ? '#141414' : 'inherit',
  });
  const cell = { padding: '4px 10px', border: '1px solid var(--ifm-color-emphasis-300)', textAlign: 'center' };

  return (
    <CEBlock title={p.title} subtitle={p.raw ? '逐个划记原始数据，表格和统计图会同步更新' : '切换统计图，看同一组数据的不同表示'}>
      {p.raw ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontFamily: 'var(--ifm-font-family-monospace)', fontSize: '0.85rem' }}>
            {p.raw.map((x, i) => (
              <span
                key={i}
                style={{
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: i === step - 1 ? 'var(--ifm-color-warning-lighter)' : i < step ? 'var(--ifm-color-emphasis-200)' : 'transparent',
                  color: i < step ? 'var(--ifm-color-emphasis-600)' : 'inherit',
                  textDecoration: i < step - 1 ? 'line-through' : 'none',
                }}>
                {p.rawFormat(x)}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <button type="button" style={btn(false)} onClick={() => setStep((s) => Math.min(p.raw.length, s + 1))} disabled={step >= p.raw.length}>
              划记下一个
            </button>
            <button type="button" style={btn(playing)} onClick={() => setPlaying(!playing)} disabled={step >= p.raw.length}>
              {playing ? '暂停' : '自动划记'}
            </button>
            <button type="button" style={btn(false)} onClick={() => setStep(p.raw.length)}>
              全部划记
            </button>
            <button type="button" style={btn(false)} onClick={() => { setPlaying(false); setStep(0); }}>
              重来
            </button>
            <span style={{ color: 'var(--ifm-color-emphasis-700)' }}>
              已划记 {step} / {p.raw.length}
              {lastClass != null ? `：${p.rawFormat(p.raw[step - 1])} → ${p.categories[lastClass]}` : ''}
            </span>
          </div>
        </div>
      ) : null}

      {!isSeries ? (
        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
          <table style={{ borderCollapse: 'collapse', margin: 0, display: 'table', width: '100%' }}>
            <thead>
              <tr>
                <th style={cell}>类别</th>
                {p.rules ? <th style={cell}>标准</th> : null}
                {p.tally ? <th style={cell}>划记</th> : null}
                <th style={cell}>{p.countLabel}</th>
                <th style={cell}>百分比</th>
              </tr>
            </thead>
            <tbody>
              {order.map((i) => (
                <tr key={i} style={{ background: lastClass === i ? 'var(--ifm-color-warning-contrast-background)' : undefined }}>
                  <td style={cell}>{p.categories[i]}</td>
                  {p.rules ? <td style={cell}>{p.rules[i]}</td> : null}
                  {p.tally ? <td style={{ ...cell, letterSpacing: 2, minWidth: 90 }}>{tallyMarks(counts[i])}</td> : null}
                  <td style={cell}>{hide(i) ? '？' : fmt(counts[i])}</td>
                  <td style={cell}>{hide(i) || !total ? '？' : `${percent(counts[i], total)}%`}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...cell, fontWeight: 700 }}>合计</td>
                {p.rules ? <td style={cell} /> : null}
                {p.tally ? <td style={cell} /> : null}
                <td style={{ ...cell, fontWeight: 700 }}>{revealed ? fmt(total) : '？'}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{total ? '100%' : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        {p.charts.map((c) => (
          <button key={c} type="button" style={btn(type === c)} onClick={() => setType(c)}>
            {CHART_NAMES[c]}
          </button>
        ))}
        {p.sortable ? (
          <button type="button" style={btn(sorted)} onClick={() => setSorted(!sorted)}>
            {sorted ? '按原顺序' : '从多到少排序'}
          </button>
        ) : null}
        {p.hidden ? (
          <button type="button" style={btn(revealed)} onClick={() => setRevealed(!revealed)}>
            {revealed ? '隐藏答案' : '显示完整统计图'}
          </button>
        ) : null}
      </div>

      {isSeries && type === 'line' ? <LineChart labels={p.xLabels} series={p.series} unit={p.unit} /> : null}
      {isSeries && type === 'groupBar' ? <BarChart labels={p.xLabels} series={p.series} unit={p.unit} /> : null}
      {isSeries ? (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {p.series.map((s, k) => (
            <span key={s.name}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS[k], marginRight: 6 }} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}

      {!isSeries && type === 'bar' ? (
        <BarChart labels={shownCats.map((i) => p.categories[i])} series={[{ name: p.countLabel, values: shownCats.map((i) => counts[i]) }]} unit={p.unit} highlight={lastClass != null ? shownCats.indexOf(lastClass) : null} />
      ) : null}
      {!isSeries && type === 'pie' ? (
        total > 0 && shownCats.length === order.length ? (
          <PieChart labels={order.map((i) => p.categories[i])} values={order.map((i) => counts[i])} />
        ) : (
          <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>{p.hidden && !revealed ? '先自己算出每部分的百分比，再点「显示完整统计图」核对。' : '划记几个数据后，扇形图就会出现。'}</p>
        )
      ) : null}
    </CEBlock>
  );
}
