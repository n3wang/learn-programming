import React, {useEffect, useMemo, useState} from 'react';
import {pinyin} from 'pinyin-pro';
import {CLASS_ROSTERS, NAME_PINYIN_OVERRIDES} from '@site/src/data/classRosters';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {localDateKey} from '@site/src/data/classBehaviorDb';
import {
  fractionToMark,
  hasScore,
  isMark,
  listGradebookWeeks,
  scoreFraction,
  weekTitle,
} from '@site/src/api/gradebookClient';
import {weekRangeLabel} from '@site/src/components/class/weekUtils';
import {SemesterPicker, semesterKeyOf, semesterLabel, useClassPrefs} from '@site/src/components/class/semester';

const th = {
  padding: '0.45rem 0.5rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-300)',
  whiteSpace: 'nowrap',
  fontSize: '0.82rem',
  textAlign: 'center',
  verticalAlign: 'bottom',
};
const td = {
  padding: '0.4rem 0.5rem',
  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};
const sub = {display: 'block', fontWeight: 400, fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-600)'};
const examEdge = {borderLeft: '2px solid var(--ifm-color-emphasis-300)'};

/**
 * 缺交作业 column + "缺交：…" line in the detail view.
 * Hidden for 2026 下半 — set to true next semester to show parents the missing-homework count again.
 */
const SHOW_MISSING_HOMEWORK = false;

function fold(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/** Pinyin is only used to match the search box — never displayed. */
function namePinyin(name) {
  if (NAME_PINYIN_OVERRIDES[name]) return NAME_PINYIN_OVERRIDES[name];
  try {
    return pinyin(name, {toneType: 'none', type: 'array'}).join('');
  } catch {
    return '';
  }
}

const MARK_COLOR = {
  优: 'var(--ifm-color-success-darkest)',
  '优-': 'var(--ifm-color-success-darkest)',
  良: 'var(--ifm-color-primary-darkest)',
  '良-': 'var(--ifm-color-primary-darkest)',
  及格: 'var(--ifm-color-warning-darkest)',
  差: 'var(--ifm-color-danger)',
  不及格: 'var(--ifm-color-danger)',
  未交: 'var(--ifm-color-danger)',
};

/** Homework / behaviour cell: always a letter mark. */
function Mark({value, col}) {
  if (!hasScore(value)) return <span style={{color: 'var(--ifm-color-emphasis-400)'}}>—</span>;
  const mark = isMark(value) ? value : fractionToMark(scoreFraction(value, col));
  return <span style={{fontWeight: 700, color: MARK_COLOR[mark] || 'inherit'}}>{mark}</span>;
}

/** Exam cell: the number itself (or a mark such as 不及格 / 及格 if that is what was recorded). */
function ExamScore({value}) {
  if (!hasScore(value)) return <span style={{color: 'var(--ifm-color-emphasis-400)'}}>—</span>;
  if (isMark(value)) return <span style={{fontWeight: 700, color: MARK_COLOR[value] || 'inherit'}}>{value}</span>;
  return <span style={{fontWeight: 700, color: value < 60 ? 'var(--ifm-color-danger)' : 'inherit'}}>{value}</span>;
}

const isHomework = (col) => col.type === 'homework';
const isBehavior = (col) => col.type === 'behavior' || (col.type === 'homework' && /课堂|课程/.test(col.name));
const isExam = (col) => col.type === 'exam' || col.type === 'quiz';

/**
 * Shareable links: ?course=2026_1_chuyi&student=3
 *   course  = <year>_<1 上半 | 2 下半>_<roster id>
 *   student = 1-based position in that class roster (filters to that student)
 */
function readLinkParams(rosterIds) {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out = {};
  const m = String(params.get('course') || '').match(/^(\d{4})[_-]([12])[_-]([A-Za-z0-9-]+)$/);
  if (m && rosterIds.includes(m[3])) {
    out.rosterId = m[3];
    out.semester = `${m[1]}-${m[2]}`;
  }
  const n = parseInt(params.get('student'), 10);
  if (n > 0) out.studentIndex = n;
  return out;
}

export function reportLinkQuery(rosterId, semester, studentIndex) {
  const [year, half] = String(semester).split('-');
  const params = new URLSearchParams({course: `${year}_${half}_${rosterId}`});
  if (studentIndex > 0) params.set('student', String(studentIndex));
  return `?${params.toString()}`;
}

function latestWeekWith(weeks, test) {
  for (let i = weeks.length - 1; i >= 0; i--) {
    const cols = weeks[i].columns.filter(test);
    if (cols.length) return {week: weeks[i], cols};
  }
  return null;
}

function StudentDetail({name, weeks}) {
  return (
    <div style={{display: 'grid', gap: '0.4rem', padding: '0.5rem 0'}}>
      {[...weeks].reverse().map((w) => {
        const comment = w.comments?.[name];
        if (!w.columns.length && !comment) return null;
        return (
          <div key={w._id} style={{display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', alignItems: 'baseline', fontSize: '0.86rem'}}>
            <span style={{minWidth: 118, color: 'var(--ifm-color-emphasis-700)'}}>
              <strong>{weekTitle(w)}</strong> <span style={{fontSize: '0.75rem'}}>{weekRangeLabel(w.weekStart)}</span>
            </span>
            {w.columns.map((col) => (
              <span key={col.id}>
                {col.name}{' '}
                {isExam(col) ? <ExamScore value={w.scores?.[name]?.[col.id]} /> : <Mark value={w.scores?.[name]?.[col.id]} col={col} />}
              </span>
            ))}
            {comment ? <span>💬 {comment}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/** 成绩: whole class, filter by name. Homework as marks, exams as numbers. Published weeks only. */
export default function ParentReportPanel() {
  const {auth, isStudent, isAdmin} = useSiteAuth();
  const rosterIds = useMemo(() => Object.keys(CLASS_ROSTERS || {}), []);
  const {rosterId, setRosterId, semester, setSemester} = useClassPrefs(rosterIds, {
    preferRoster: isStudent ? auth?.rosterId : null,
  });
  const [allWeeks, setAllWeeks] = useState([]);
  const [state, setState] = useState('loading');
  const [query, setQuery] = useState(() => (isStudent ? auth?.name || '' : ''));
  const [openName, setOpenName] = useState(null);
  const [previewHidden, setPreviewHidden] = useState(false);
  const [linkRead, setLinkRead] = useState(false);
  const [pendingStudent, setPendingStudent] = useState(null);
  const [copied, setCopied] = useState(false);

  // Apply ?course= / ?student= once (runs after the remembered class/semester is loaded).
  useEffect(() => {
    const link = readLinkParams(rosterIds);
    if (link.rosterId) {
      setRosterId(link.rosterId);
      setSemester(link.semester);
    }
    if (link.studentIndex) setPendingStudent({index: link.studentIndex, rosterId: link.rosterId || null});
    setLinkRead(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingStudent) return;
    const roster = pendingStudent.rosterId || rosterId;
    if (pendingStudent.rosterId && roster !== rosterId) return; // wait for the class switch
    const name = CLASS_ROSTERS[roster]?.names?.[pendingStudent.index - 1];
    if (name) setQuery(name);
    setPendingStudent(null);
  }, [pendingStudent, rosterId]);

  // Keep the address bar = the link for what is on screen, so it can be copied and sent.
  useEffect(() => {
    if (!linkRead || pendingStudent || typeof window === 'undefined' || !rosterId) return;
    const names = CLASS_ROSTERS[rosterId]?.names || [];
    const idx = names.indexOf(query.trim()) + 1;
    const next = reportLinkQuery(rosterId, semester, idx);
    if (window.location.search !== next) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${next}${window.location.hash}`);
    }
  }, [linkRead, pendingStudent, rosterId, semester, query]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('复制这个链接：', window.location.href);
    }
  };

  useEffect(() => {
    if (!rosterId) return undefined;
    let cancelled = false;
    setState('loading');
    listGradebookWeeks(rosterId)
      .then((list) => {
        if (cancelled) return;
        setAllWeeks(list);
        setState('ok');
      })
      .catch(() => !cancelled && setState('offline'));
    return () => {
      cancelled = true;
    };
  }, [rosterId]);

  const today = localDateKey();
  const semesterWeeks = useMemo(
    () => allWeeks.filter((w) => semesterKeyOf(w.weekStart) === semester),
    [allWeeks, semester],
  );
  const hiddenCount = semesterWeeks.filter((w) => !w.published).length;
  const weeks = useMemo(
    () => semesterWeeks.filter((w) => (w.published || (isAdmin && previewHidden)) && w.weekStart <= today),
    [semesterWeeks, isAdmin, previewHidden, today],
  );

  const lastHomework = useMemo(() => latestWeekWith(weeks, isHomework), [weeks]);
  const lastBehavior = useMemo(() => latestWeekWith(weeks, isBehavior), [weeks]);
  const examCols = useMemo(() => weeks.flatMap((w) => w.columns.filter(isExam).map((col) => ({week: w, col}))), [weeks]);
  const homeworkCols = useMemo(() => weeks.flatMap((w) => w.columns.filter(isHomework).map((col) => ({week: w, col}))), [weeks]);

  const rows = useMemo(() => {
    const q = query.trim();
    const fq = fold(q);
    return (CLASS_ROSTERS[rosterId]?.names || [])
      .filter((name) => !q || name.includes(q) || fold(namePinyin(name)).includes(fq))
      .map((name) => {
        const missing = homeworkCols.filter(({week, col}) => {
          const v = week.scores?.[name]?.[col.id];
          return v === '未交' || !hasScore(v);
        });
        const fracs = homeworkCols.map(({week, col}) => scoreFraction(week.scores?.[name]?.[col.id], col)).filter((f) => f !== null);
        const overall = fracs.length ? fractionToMark(fracs.reduce((a, b) => a + b, 0) / fracs.length) : null;
        return {name, missing, overall};
      });
  }, [rosterId, query, homeworkCols]);

  const expanded = rows.length === 1 ? rows[0].name : openName;
  const colCount = (SHOW_MISSING_HOMEWORK ? 5 : 4) + examCols.length;

  return (
    <div style={{display: 'grid', gap: '0.8rem'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center'}}>
        <select
          value={rosterId}
          onChange={(e) => {
            setRosterId(e.target.value);
            setOpenName(null);
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
        <SemesterPicker
          value={semester}
          years={allWeeks.map((w) => Number(semesterKeyOf(w.weekStart).split('-')[0]))}
          onChange={setSemester}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索学生姓名"
          aria-label="搜索学生姓名"
          style={{
            flex: '1 1 180px',
            maxWidth: 240,
            padding: '0.35rem 0.6rem',
            borderRadius: 8,
            border: '1px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-color)',
            color: 'var(--ifm-font-color-base)',
          }}
        />
        {isAdmin ? (
          <button
            type="button"
            className="button button--sm button--secondary"
            onClick={copyLink}
            title="复制当前班级、学期（以及筛选的学生）的链接，发给家长"
          >
            {copied ? '✓ 已复制' : '复制家长链接'}
          </button>
        ) : null}
      </div>

      {state === 'ok' && isAdmin && hiddenCount ? (
        <div style={{fontSize: '0.82rem', color: 'var(--ifm-color-emphasis-700)'}}>
          管理员：{semesterLabel(semester)} 有 {hiddenCount} 周未对家长公开（在成绩册里勾选“对家长可见”）。{' '}
          <label style={{cursor: 'pointer'}}>
            <input type="checkbox" checked={previewHidden} onChange={(e) => setPreviewHidden(e.target.checked)} /> 预览未公开的周
          </label>
        </div>
      ) : null}
      {state === 'offline' ? <div className="alert alert--warning">暂时无法加载成绩（服务器离线），请稍后再试。</div> : null}
      {state === 'loading' ? <p style={{margin: 0}}>加载中…</p> : null}
      {state === 'ok' && weeks.length === 0 ? <p style={{margin: 0}}>{semesterLabel(semester)} 还没有公布的成绩。</p> : null}

      {state === 'ok' && weeks.length ? (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', display: 'table'}}>
            <thead>
              <tr>
                <th style={{...th, textAlign: 'left'}}>姓名</th>
                <th style={th}>
                  上周作业
                  <span style={sub}>{lastHomework ? `${weekTitle(lastHomework.week)} · ${weekRangeLabel(lastHomework.week.weekStart)}` : ''}</span>
                </th>
                <th style={th}>
                  上周课堂表现
                  <span style={sub}>{lastBehavior ? `${weekTitle(lastBehavior.week)} · ${weekRangeLabel(lastBehavior.week.weekStart)}` : ''}</span>
                </th>
                {SHOW_MISSING_HOMEWORK ? (
                  <th style={th}>
                    缺交作业
                    <span style={sub}>共 {homeworkCols.length} 次作业</span>
                  </th>
                ) : null}
                <th style={th}>
                  作业总评
                  <span style={sub}>本学期</span>
                </th>
                {examCols.map(({week, col}, i) => (
                  <th key={`${week._id}:${col.id}`} style={{...th, ...(i === 0 ? examEdge : null)}}>
                    {col.name}
                    <span style={sub}>
                      {weekRangeLabel(week.weekStart).split(' – ')[0]}
                      {col.max !== 100 ? ` · 满分 ${col.max}` : ''}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={colCount} style={{...td, textAlign: 'left', color: 'var(--ifm-color-emphasis-600)'}}>
                    没有找到“{query}”。
                  </td>
                </tr>
              ) : null}
              {rows.map(({name, missing, overall}) => {
                const isOpen = expanded === name;
                const hw = lastHomework?.cols || [];
                const bh = lastBehavior?.cols || [];
                return (
                  <React.Fragment key={name}>
                    <tr
                      onClick={() => setOpenName(isOpen ? null : name)}
                      style={{cursor: 'pointer', background: isOpen ? 'var(--ifm-color-emphasis-100)' : 'transparent'}}
                      title="点击查看每周详情"
                    >
                      <td style={{...td, textAlign: 'left'}}>
                        <span style={{display: 'inline-block', width: 14, color: 'var(--ifm-color-emphasis-500)'}}>{isOpen ? '▾' : '▸'}</span>
                        <strong>{name}</strong>
                      </td>
                      <td style={td}>
                        {hw.length
                          ? hw.map((col, i) => (
                              <React.Fragment key={col.id}>
                                {i ? ' / ' : ''}
                                <Mark value={lastHomework.week.scores?.[name]?.[col.id]} col={col} />
                              </React.Fragment>
                            ))
                          : '—'}
                      </td>
                      <td style={td}>
                        {bh.length
                          ? bh.map((col, i) => (
                              <React.Fragment key={col.id}>
                                {i ? ' / ' : ''}
                                <Mark value={lastBehavior.week.scores?.[name]?.[col.id]} col={col} />
                              </React.Fragment>
                            ))
                          : '—'}
                      </td>
                      {SHOW_MISSING_HOMEWORK ? (
                        <td
                          style={{...td, color: missing.length ? 'var(--ifm-color-danger)' : 'var(--ifm-color-success-darkest)', fontWeight: 700}}
                          title={missing.map(({col}) => col.name).join('、')}
                        >
                          {missing.length ? `${missing.length} 次` : '无'}
                        </td>
                      ) : null}
                      <td style={td}>
                        {overall ? <span style={{fontWeight: 700, color: MARK_COLOR[overall] || 'inherit'}}>{overall}</span> : '—'}
                      </td>
                      {examCols.map(({week, col}, i) => (
                        <td key={`${week._id}:${col.id}`} style={{...td, ...(i === 0 ? examEdge : null)}}>
                          <ExamScore value={week.scores?.[name]?.[col.id]} />
                        </td>
                      ))}
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={colCount} style={{padding: '0 0.5rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)'}}>
                          {SHOW_MISSING_HOMEWORK && missing.length ? (
                            <div style={{fontSize: '0.85rem', color: 'var(--ifm-color-danger)', paddingTop: '0.5rem'}}>
                              缺交：{missing.map(({col}) => col.name).join('、')}
                            </div>
                          ) : null}
                          <StudentDetail name={name} weeks={weeks} />
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
