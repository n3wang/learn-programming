import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  CLASS_ROSTERS,
  NAME_PINYIN_OVERRIDES,
} from '@site/src/data/classRosters';
import {pinyin} from 'pinyin-pro';
import {fetchStudentActivity} from '@site/src/api/storeClient';
import {HeatLegend, intensityLevel} from '@site/src/components/activity/activityHeatmap';
import {
  CLASS_BEHAVIOR_CHANGE_EVENT,
  getDailyBehavior,
  localDateKey,
  mergeRosterWithBehavior,
} from '@site/src/data/classBehaviorDb';
import {WEEKDAYS, addDays, mondayOf, shortDate} from '@site/src/components/class/weekUtils';

const WEEKDAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
import {useClassPrefs} from '@site/src/components/class/semester';

function safePinyin(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  if (NAME_PINYIN_OVERRIDES[name]) {
    return NAME_PINYIN_OVERRIDES[name];
  }
  try {
    return pinyin(name, {
      toneType: 'symbol',
      type: 'array',
      mode: 'surname',
    }).join(' ');
  } catch {
    return '';
  }
}

function RosterTable({rows}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <p style={{margin: '0.5rem 0 0', color: 'var(--ifm-color-emphasis-600)'}}>
        这一天没有记录。
      </p>
    );
  }

  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem'}}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>姓名</th>
            <th style={thStyle}>拼音</th>
            <th style={thStyle}>课堂分</th>
            <th style={thStyle}>状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const name = row?.name || '—';
            const points = Number.isFinite(Number(row?.points))
              ? Number(row.points)
              : 0;
            return (
              <tr
                key={`${name}-${index}`}
                style={{
                  opacity: row?.former ? 0.65 : 1,
                  background: row?.absent
                    ? 'rgba(220, 38, 38, 0.08)'
                    : 'transparent',
                }}
              >
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>
                  {name}
                  {row?.former ? (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.75rem',
                        color: 'var(--ifm-color-emphasis-600)',
                      }}
                    >
                      （已离开）
                    </span>
                  ) : null}
                </td>
                <td style={tdStyle}>{safePinyin(name)}</td>
                <td style={{...tdStyle, fontVariantNumeric: 'tabular-nums'}}>
                  {points}
                </td>
                <td style={tdStyle}>{row?.absent ? '缺席' : '出席'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '0.45rem 0.55rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-300)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '0.4rem 0.55rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  verticalAlign: 'top',
};

/** Same none/light/medium/heavy scale as the account strip, softened so numbers stay readable. */
const HEAT_BG = [
  'transparent',
  'rgba(46, 160, 67, 0.18)',
  'rgba(46, 160, 67, 0.38)',
  'rgba(46, 160, 67, 0.6)',
];

function signed(n) {
  return n > 0 ? `+${n}` : String(n);
}

function WeekGrid({rows, days, today, selectedDay, onSelectDay}) {
  const cell = {...tdStyle, textAlign: 'center', padding: '0.3rem 0.35rem', minWidth: 54};
  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', display: 'table'}}>
        <thead>
          <tr>
            <th style={thStyle}>姓名</th>
            {days.map((d, i) => {
              const isSel = selectedDay === d.key;
              return (
                <th key={d.key} style={{...thStyle, textAlign: 'center', padding: '0.3rem'}}>
                  <button
                    type="button"
                    className="clean-btn"
                    onClick={() => onSelectDay(isSel ? null : d.key)}
                    title={`查看 ${d.key} 详情`}
                    style={{
                      fontWeight: d.key === today ? 800 : 600,
                      color: isSel ? 'var(--ifm-color-primary)' : 'inherit',
                      textDecoration: isSel ? 'underline' : 'none',
                      lineHeight: 1.2,
                    }}
                  >
                    {WEEKDAYS_ZH[i]}
                    <div style={{fontSize: '0.72rem', fontWeight: 500, color: 'var(--ifm-color-emphasis-600)'}}>
                      {shortDate(d.date)} · {d.activeCount}
                    </div>
                  </button>
                </th>
              );
            })}
            <th style={{...thStyle, textAlign: 'right'}} title="网站活动（每次 1 分）">活动分</th>
            <th style={{...thStyle, textAlign: 'right'}} title="点名加减分">课堂分</th>
            <th style={{...thStyle, textAlign: 'right'}}>合计</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} style={{opacity: row.former ? 0.65 : 1}}>
              <td style={{...tdStyle, whiteSpace: 'nowrap'}}>
                <span
                  title={row.activity === 0 ? '本周没有网站活动' : undefined}
                  style={{color: row.activity === 0 ? 'var(--ifm-color-danger)' : 'inherit'}}
                >
                  {row.name}
                </span>
                <span style={{marginLeft: 6, fontSize: '0.72rem', color: 'var(--ifm-color-emphasis-600)'}}>
                  {safePinyin(row.name)}
                </span>
              </td>
              {days.map((d) => {
                const c = row.byDay[d.key];
                const future = d.key > today;
                return (
                  <td
                    key={d.key}
                    style={{
                      ...cell,
                      background: c.absent ? 'rgba(220, 38, 38, 0.1)' : HEAT_BG[intensityLevel(c.activity)],
                      color: future ? 'var(--ifm-color-emphasis-400)' : 'inherit',
                    }}
                    title={`${row.name} · ${d.key}\n网站活动：${c.activity}\n课堂分：${signed(c.class)}${c.absent ? '\n缺席' : ''}`}
                  >
                    {future ? '' : (
                      <>
                        <span style={{fontVariantNumeric: 'tabular-nums', fontWeight: c.activity ? 600 : 400}}>
                          {c.activity || '·'}
                        </span>
                        {c.class ? (
                          <span
                            style={{
                              marginLeft: 4,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: c.class > 0 ? 'var(--ifm-color-success-darkest)' : 'var(--ifm-color-danger)',
                            }}
                          >
                            {signed(c.class)}
                          </span>
                        ) : null}
                        {c.absent ? (
                          <span style={{marginLeft: 4, fontSize: '0.72rem', color: 'var(--ifm-color-danger)'}}>缺</span>
                        ) : null}
                      </>
                    )}
                  </td>
                );
              })}
              <td style={{...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{row.activity}</td>
              <td style={{...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{signed(row.class)}</td>
              <td style={{...tdStyle, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>
                {row.activity + row.class}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentReportsPanel() {
  const rosterIds = useMemo(() => Object.keys(CLASS_ROSTERS || {}), []);
  const {rosterId, setRosterId} = useClassPrefs(rosterIds);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [behaviors, setBehaviors] = useState({}); // dateKey -> daily pick record
  const [activityDocs, setActivityDocs] = useState([]);
  const [activityOffline, setActivityOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  const roster = CLASS_ROSTERS[rosterId] || null;
  const today = localDateKey();
  const thisMonday = mondayOf(new Date());
  const isThisWeek = weekStart.getTime() === thisMonday.getTime();

  const dayList = useMemo(
    () =>
      WEEKDAYS.map((_, i) => {
        const date = addDays(weekStart, i);
        return {date, key: localDateKey(date)};
      }),
    [weekStart],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const keys = dayList.map((d) => d.key).filter((k) => k <= today);
    const [records, docs] = await Promise.all([
      Promise.all(keys.map((k) => getDailyBehavior(k, rosterId).catch(() => null))),
      fetchStudentActivity().then(
        (all) => {
          setActivityOffline(false);
          return all;
        },
        () => {
          setActivityOffline(true);
          return null;
        },
      ),
    ]);
    const next = {};
    keys.forEach((k, i) => {
      next[k] = records[i];
    });
    setBehaviors(next);
    if (docs) setActivityDocs(docs);
    setLoading(false);
  }, [dayList, rosterId, today]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // +/− from the Pick student dock updates the report live.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.addEventListener(CLASS_BEHAVIOR_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(CLASS_BEHAVIOR_CHANGE_EVENT, refresh);
  }, [refresh]);

  const {rows, days, summary} = useMemo(() => {
    const keys = dayList.map((d) => d.key);
    const keySet = new Set(keys);
    const byName = new Map();
    const ensure = (name, former) => {
      if (!byName.has(name)) {
        const byDay = {};
        keys.forEach((k) => {
          byDay[k] = {activity: 0, class: 0, absent: false};
        });
        byName.set(name, {name, former, byDay, activity: 0, class: 0});
      }
      return byName.get(name);
    };
    (roster?.names || []).forEach((n) => ensure(n, false));

    for (const doc of activityDocs) {
      if (!doc || doc.roster !== rosterId || !doc.student || !keySet.has(doc.day)) continue;
      const row = ensure(doc.student, true);
      row.byDay[doc.day].activity += 1;
      row.activity += 1;
    }
    for (const k of keys) {
      const students = behaviors[k]?.students || {};
      for (const [name, entry] of Object.entries(students)) {
        const pts = Number(entry?.points) || 0;
        if (!pts && !entry?.absent) continue;
        const row = ensure(name, true);
        row.byDay[k].class += pts;
        row.byDay[k].absent = Boolean(entry?.absent);
        row.class += pts;
      }
    }

    const list = [...byName.values()];
    if (sortBy === 'total') {
      list.sort((a, b) => b.activity + b.class - (a.activity + a.class) || a.name.localeCompare(b.name, 'zh'));
    } else if (sortBy === 'inactive') {
      list.sort((a, b) => a.activity - b.activity || a.name.localeCompare(b.name, 'zh'));
    } else {
      list.sort((a, b) => Number(a.former) - Number(b.former));
    }

    const current = list.filter((r) => !r.former);
    return {
      rows: list,
      days: dayList.map((d) => ({
        ...d,
        activeCount: list.filter((r) => r.byDay[d.key].activity > 0).length,
      })),
      summary: {
        students: current.length,
        active: current.filter((r) => r.activity > 0).length,
        inactive: current.filter((r) => r.activity === 0).map((r) => r.name),
        activity: list.reduce((s, r) => s + r.activity, 0),
        class: list.reduce((s, r) => s + r.class, 0),
      },
    };
  }, [dayList, roster, rosterId, activityDocs, behaviors, sortBy]);

  const dayRows = useMemo(() => {
    if (!selectedDay) return [];
    return mergeRosterWithBehavior(roster?.names || [], behaviors[selectedDay]) || [];
  }, [selectedDay, roster, behaviors]);

  const shiftWeek = (n) => {
    setWeekStart((w) => addDays(w, 7 * n));
    setSelectedDay(null);
  };

  if (!rosterIds.length) {
    return <p>还没有设置班级名单。</p>;
  }

  const weekEnd = addDays(weekStart, 6);

  return (
    <div
      style={{
        display: 'grid',
        gap: '0.8rem',
        padding: '1rem',
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: 12,
        background: 'var(--ifm-background-surface-color)',
      }}
    >
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center'}}>
        <select
          value={rosterId}
          onChange={(e) => {
            setRosterId(e.target.value);
            setSelectedDay(null);
          }}
          aria-label="班级"
          style={{padding: '0.3rem 0.5rem'}}
        >
          {rosterIds.map((id) => (
            <option key={id} value={id}>
              {CLASS_ROSTERS[id]?.label || id}
            </option>
          ))}
        </select>

        <div style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={() => shiftWeek(-1)}
            aria-label="上一周"
          >
            ‹
          </button>
          <span style={{minWidth: 150, textAlign: 'center', fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>
            {weekStart.getFullYear()} · {shortDate(weekStart)} – {shortDate(weekEnd)}
          </span>
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={() => shiftWeek(1)}
            disabled={isThisWeek}
            aria-label="下一周"
          >
            ›
          </button>
          {!isThisWeek ? (
            <button
              type="button"
              className="button button--sm button--link"
              onClick={() => {
                setWeekStart(thisMonday);
                setSelectedDay(null);
              }}
            >
              本周
            </button>
          ) : null}
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="排序" style={{padding: '0.3rem 0.5rem'}}>
          <option value="name">按名单顺序</option>
          <option value="total">总分最高</option>
          <option value="inactive">活动最少</option>
        </select>

        <button type="button" className="button button--sm button--secondary" onClick={refresh} disabled={loading}>
          {loading ? '…' : '刷新'}
        </button>
        <span style={{marginLeft: 'auto'}}>
          <HeatLegend size={11} zh />
        </span>
      </div>

      <div style={{fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)'}}>
        <strong>
          {summary.active}/{summary.students}
        </strong>{' '}
        名学生本周有网站活动 · 活动分 {summary.activity} · 课堂分 {signed(summary.class)}
        {summary.inactive.length && summary.inactive.length < summary.students ? (
          <span style={{color: 'var(--ifm-color-danger)'}}> · 无活动：{summary.inactive.join('、')}</span>
        ) : null}
        {activityOffline ? <span style={{color: 'var(--ifm-color-danger)'}}> · 活动数据服务器离线</span> : null}
      </div>

      <WeekGrid rows={rows} days={days} today={today} selectedDay={selectedDay} onSelectDay={setSelectedDay} />


      {selectedDay ? (
        <div>
          <div style={{fontWeight: 700, margin: '0.3rem 0'}}>{selectedDay} · 课堂分</div>
          <RosterTable rows={dayRows} />
        </div>
      ) : null}
    </div>
  );
}
