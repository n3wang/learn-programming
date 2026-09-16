import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeEditor from '@site/src/components/CodeEditor';
import EditorToolbar from '@site/src/components/codeWorkspace/EditorToolbar';
import useCodeDraft from '@site/src/components/codeWorkspace/useCodeDraft';
import {makeDraftId, markPracticeComplete} from '@site/src/components/codeWorkspace/drafts';
import defaultSourceFilename from '@site/src/components/codeWorkspace/defaultSourceFilename';
import {noTranslateClass} from '@site/src/components/codeWorkspace/noTranslate';
import chrome from '@site/src/components/codeWorkspace/chrome.module.css';
import {
  fetchPistonExecute,
  resolvePistonExecuteUrl,
} from '@site/src/api/pistonClient';
import {PREPEND, buildHarness, buildTargetOnlyHarness} from './pyHarness';
import styles from '@site/src/components/GraphChallenge/styles.module.css';
import sqlStyles from '@site/src/components/SqlExercise/sqlExercise.module.css';

const STR = {
  en: {
    run: 'Run',
    plotCode: 'score code',
    hide: 'hide',
    show: 'show',
    wait: 'press Run',
    loading: '…',
    match: (n) => `match: ${n}%`,
    target: 'target',
    yours: 'yours',
    codeTab: 'Code',
    dataTab: 'Data',
    dataNote: 'These arrays are loaded for you on Run — plot them; do not retype the numbers.',
  },
  'zh-Hans': {
    run: '运行',
    plotCode: '评分代码',
    hide: '隐藏',
    show: '显示',
    wait: '按运行',
    loading: '…',
    match: (n) => `匹配：${n}%`,
    target: '目标',
    yours: '你的',
    codeTab: '代码',
    dataTab: '数据',
    dataNote: '运行时已注入这些数组，直接画图，不用抄数字。',
  },
};

function tablesToPython(tables) {
  if (!tables || !tables.length) {
    return '';
  }
  const prefix = tables.length > 1;
  const lines = [];
  tables.forEach((table) => {
    const p = prefix ? `${table.name}_` : '';
    (table.columns || []).forEach((col, ci) => {
      const vals = (table.rows || []).map((row) => {
        const v = row[ci];
        return typeof v === 'number' ? String(v) : JSON.stringify(v);
      });
      lines.push(`${p}${col} = [${vals.join(', ')}]`);
    });
  });
  return lines.length ? lines.join('\n') + '\n' : '';
}

function DataPreview({tables, data, note}) {
  const [idx, setIdx] = useState(0);
  if (!tables || !tables.length) {
    if (data && String(data).trim()) {
      return (
        <div className={sqlStyles.preview}>
          <CodeEditor value={String(data).trim()} onChange={() => {}} lang="python" height="220px" readOnly />
          <p className={sqlStyles.previewNote}>{note}</p>
        </div>
      );
    }
    return <p className={sqlStyles.empty}>No plot data on this level.</p>;
  }
  const table = tables[Math.min(idx, tables.length - 1)];
  const rows = table.rows || [];
  return (
    <div className={sqlStyles.preview}>
      {tables.length > 1 ? (
        <div className={sqlStyles.tableTabs} role="tablist" aria-label="Plot data">
          {tables.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className={`${sqlStyles.tableTab} ${i === idx ? sqlStyles.tableTabActive : ''}`}
              onClick={() => setIdx(i)}
            >
              {t.name}
              <span className={sqlStyles.rowCount}>{t.rows.length}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className={sqlStyles.tableScroll}>
        <table className={sqlStyles.grid}>
          <thead>
            <tr>
              {(table.columns || []).map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{String(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={sqlStyles.previewNote}>{note}</p>
      {data && String(data).trim() ? (
        <CodeEditor value={String(data).trim()} onChange={() => {}} lang="python" height="160px" readOnly />
      ) : null}
    </div>
  );
}

function sourceCheck(code, check) {
  const re = new RegExp(check.pattern, check.flags || '');
  const hit = re.test(code);
  const must = check.must !== false;
  const pass = must ? hit : !hit;
  return {
    name: check.name || (must ? 'Required pattern' : 'Forbidden pattern'),
    pass,
    detail: pass
      ? 'ok'
      : must
        ? check.hint || check.pattern
        : 'Do not use: ' + (check.hint || check.pattern),
  };
}

function parseOutput(stdout) {
  const lines = (stdout || '').split('\n');
  const pngLine = lines.find((l) => l.startsWith('PISTON_PNG:'));
  const scoreLine = lines.find((l) => l.startsWith('SCORE:'));
  let score = null;
  try {
    score = scoreLine ? JSON.parse(scoreLine.slice('SCORE:'.length)) : null;
  } catch (e) {
    score = null;
  }
  return {
    png: pngLine ? pngLine.slice('PISTON_PNG:'.length) : null,
    score,
  };
}

async function runPiston({endpoint, lang, version, fileName, program}) {
  const res = await fetchPistonExecute(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      language: lang,
      version,
      stdin: '',
      files: [{name: fileName, content: program}],
      run_timeout: 20000,
      run_cpu_time: 15000,
      compile_timeout: 10000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  const data = await res.json();
  const runResult = data.run || {};
  const compile = data.compile || {};
  if (compile.code != null && compile.code !== 0) {
    throw new Error(compile.stderr || compile.stdout || '?');
  }
  if (runResult.stderr && !runResult.stdout) {
    throw new Error(runResult.stderr);
  }
  return runResult.stdout || '';
}

function useSlideVisible(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    const update = () => setVisible(!node.closest('[hidden]'));
    update();
    const slide = node.parentElement && node.parentElement.parentElement;
    if (!slide) {
      return undefined;
    }
    const obs = new MutationObserver(update);
    obs.observe(slide, {attributes: true, attributeFilter: ['hidden']});
    return () => obs.disconnect();
  }, []);
  return visible;
}

/**
 * Graph Detective for matplotlib: target figure on the left, your pyplot
 * on the right. Fix plot / scatter / errorbar / labels until they match.
 */
export default function MatPlotChallenge({
  title,
  hint,
  starter,
  target,
  sourceChecks = [],
  data = '',
  tables = [],
  lang = 'python',
  version = '*',
  api,
  height = '220px',
}) {
  const {siteConfig, i18n} = useDocusaurusContext();
  const locale = i18n.currentLocale === 'zh-Hans' ? 'zh-Hans' : 'en';
  const t = STR[locale];
  const {pathname} = useLocation();
  const fileName = defaultSourceFilename(lang);
  const endpoint = resolvePistonExecuteUrl(api, siteConfig);
  const rootRef = useRef(null);
  const visible = useSlideVisible(rootRef);

  const dataPy = useMemo(() => (data && String(data).trim() ? String(data).trim() + '\n' : tablesToPython(tables)), [data, tables]);
  const hasDataTab = Boolean(dataPy) || (tables && tables.length > 0);

  const draftId = useMemo(
    () => makeDraftId('matplot', pathname, [title, starter, dataPy].join('\0')),
    [pathname, title, starter, dataPy]
  );
  const {code, setCode, saveLabel, reset} = useCodeDraft(draftId, starter, '');

  const [targetPng, setTargetPng] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [view, setView] = useState('code');
  const mounted = useRef(true);
  const loadedKey = useRef('');

  const harness = useMemo(() => buildHarness(target, dataPy), [target, dataPy]);
  const targetHarness = useMemo(() => buildTargetOnlyHarness(target, dataPy), [target, dataPy]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    if (loadedKey.current === target + '\0' + dataPy) {
      return undefined;
    }
    mounted.current = true;
    runPiston({endpoint, lang, version, fileName, program: targetHarness})
      .then((stdout) => {
        if (!mounted.current) return;
        const {png} = parseOutput(stdout);
        if (png) {
          loadedKey.current = target + '\0' + dataPy;
          setTargetPng(png);
        }
      })
      .catch(() => {});
    return () => {
      mounted.current = false;
    };
  }, [visible, target, dataPy, targetHarness, endpoint, lang, version, fileName]);

  const run = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const program = PREPEND + '\n' + dataPy + code + '\n' + harness;
      const stdout = await runPiston({endpoint, lang, version, fileName, program});
      const {png, score} = parseOutput(stdout);
      const checks = (sourceChecks || []).map((rule) => sourceCheck(code, rule));
      const failed = checks.filter((row) => !row.pass);
      if (!png || !score) {
        const checkErr = failed.map((row) => row.name + ': ' + row.detail).join('\n');
        setResult({error: checkErr || stdout || '?'});
      } else {
        const next = {...score};
        if (failed.length) {
          next.shape = Math.min(next.shape ?? 0, 90);
        }
        const checkErr = failed.map((row) => row.name + ': ' + row.detail).join('\n');
        setResult({png, score: next, error: checkErr || undefined});
        if (next.shape === 100 && !failed.length) {
          markPracticeComplete(draftId, {title, pathname, lang, code}).catch(() => {});
        }
      }
    } catch (e) {
      setResult({error: String(e.message || e)});
    }
    setRunning(false);
  }, [endpoint, lang, version, fileName, code, harness, dataPy, draftId, title, pathname, sourceChecks]);

  const handleReset = () => {
    reset();
    setResult(null);
  };

  const matchPct = result?.score?.shape;
  const cleared = matchPct === 100;

  return (
    <div className={chrome.shell} ref={rootRef}>
      <div className={chrome.intro}>
        <div className={chrome.titleRow}>
          <h3 className={chrome.title}>{title}</h3>
          {matchPct != null && (
            <span className={`${styles.matchBadge} ${cleared ? styles.matchCleared : ''}`}>{t.match(matchPct)}</span>
          )}
        </div>
        {hint && <p className={styles.pointsHint}>{hint}</p>}
      </div>

      <div className={styles.plotRow}>
        <div className={styles.plotCell}>
          <span className={styles.plotLabel}>{t.target}</span>
          {targetPng ? (
            <img className={styles.plot} alt="target" src={`data:image/png;base64,${targetPng}`} />
          ) : (
            <div className={styles.plotPlaceholder}>{t.loading}</div>
          )}
        </div>
        <div className={styles.plotCell}>
          <span className={styles.plotLabel}>{t.yours}</span>
          {result?.png ? (
            <img className={styles.plot} alt="yours" src={`data:image/png;base64,${result.png}`} />
          ) : (
            <div className={styles.plotPlaceholder}>{running ? t.loading : t.wait}</div>
          )}
        </div>
      </div>

      {result?.error && (
        <pre
          className={noTranslateClass(chrome.output, chrome.outputError, styles.plotError)}
          translate="no"
        >
          {result.error}
        </pre>
      )}

      <EditorToolbar
        badge={lang}
        practice
        filename={fileName}
        saveLabel={saveLabel}
        running={running}
        onRun={run}
        onReset={handleReset}
        runLabel={t.run}
        runningLabel="…"
      >
        {hasDataTab ? (
          <div className={sqlStyles.viewTabs} role="tablist" aria-label="Editor view">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'code'}
              className={`${sqlStyles.viewTab} ${view === 'code' ? sqlStyles.viewTabActive : ''}`}
              onClick={() => setView('code')}
            >
              {t.codeTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'data'}
              className={`${sqlStyles.viewTab} ${view === 'data' ? sqlStyles.viewTabActive : ''}`}
              onClick={() => setView('data')}
            >
              {t.dataTab}
            </button>
          </div>
        ) : null}
      </EditorToolbar>
      <div className={chrome.editorPane}>
        {view === 'data' && hasDataTab ? (
          <DataPreview tables={tables} data={data} note={t.dataNote} />
        ) : (
          <CodeEditor value={code} onChange={setCode} lang={lang} height={height} />
        )}
      </div>

      <button type="button" className={styles.toggleCode} onClick={() => setShowCode((s) => !s)}>
        {t.plotCode} {showCode ? `(${t.hide})` : `(${t.show})`}
      </button>
      {showCode && (
        <div className={chrome.editorPane}>
          <CodeEditor value={harness.trim()} onChange={() => {}} lang={lang} height="220px" readOnly />
        </div>
      )}
    </div>
  );
}
