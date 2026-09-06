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
import {buildHarness, buildTargetOnlyHarness, parseHintPoints} from './pyHarness';
import styles from './styles.module.css';

function executeUrl(api, siteConfig) {
  if (api) return api.replace(/\/$/, '');
  const fromConfig = siteConfig?.customFields?.pistonExecuteUrl;
  if (fromConfig) return String(fromConfig).replace(/\/$/, '');
  return 'https://piston.l.l0l.in/api/v2/execute';
}

const STR = {
  en: {
    run: 'Run',
    reset: 'Reset',
    code: 'plot code',
    hide: 'hide',
    show: 'show',
    wait: 'press Run',
    loading: '…',
    match: (n) => `match: ${n}%`,
    target: 'target',
    yours: 'yours',
  },
  'zh-Hans': {
    run: '运行',
    reset: '重置',
    code: '画图代码',
    hide: '隐藏',
    show: '显示',
    wait: '按运行',
    loading: '…',
    match: (n) => `匹配：${n}%`,
    target: '目标',
    yours: '你的',
  },
};

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
  const res = await fetch(endpoint, {
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

/**
 * A RepliCube-style coding game: the target shape is shown up front (no
 * hints about what's broken) — fix the function, press Run, and see your
 * curve overlaid on the target. The plotting/scoring code is shown read-only
 * below the editable function so students see real matplotlib, not a black
 * box.
 */
export default function GraphChallenge({
  title,
  hint,
  functionName,
  starter,
  targetBody,
  xMin,
  xMax,
  yMin,
  yMax,
  lang = 'python',
  version = '*',
  api,
}) {
  const {siteConfig, i18n} = useDocusaurusContext();
  const locale = i18n.currentLocale === 'zh-Hans' ? 'zh-Hans' : 'en';
  const t = STR[locale];
  const {pathname} = useLocation();
  const fileName = defaultSourceFilename(lang);
  const endpoint = executeUrl(api, siteConfig);

  const draftId = useMemo(
    () => makeDraftId('graph', pathname, [functionName, starter].join('\0')),
    [pathname, functionName, starter]
  );
  const {code, setCode, saveLabel, reset} = useCodeDraft(draftId, starter, '');

  const [targetPng, setTargetPng] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null); // {png, score} | {error}
  const [showCode, setShowCode] = useState(false);
  const mounted = useRef(true);

  const hintPoints = useMemo(() => parseHintPoints(hint), [hint]);

  const harness = useMemo(
    () => buildHarness({functionName, targetBody, xMin, xMax, yMin, yMax, hintPoints}),
    [functionName, targetBody, xMin, xMax, yMin, yMax, hintPoints]
  );

  // Show the target curve up front — the puzzle is guessing the fix, not
  // guessing what the goal looks like.
  useEffect(() => {
    mounted.current = true;
    const targetHarness = buildTargetOnlyHarness({targetBody, xMin, xMax, yMin, yMax, hintPoints});
    runPiston({endpoint, lang, version, fileName, program: targetHarness})
      .then((stdout) => {
        if (!mounted.current) return;
        const {png} = parseOutput(stdout);
        if (png) setTargetPng(png);
      })
      .catch(() => {});
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetBody, xMin, xMax, yMin, yMax, hintPoints]);

  const run = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const stdout = await runPiston({endpoint, lang, version, fileName, program: code + '\n' + harness});
      const {png, score} = parseOutput(stdout);
      if (!png || !score) {
        setResult({error: stdout || '?'});
      } else {
        setResult({png, score});
        if (score.shape === 100) {
          markPracticeComplete(draftId, {title, pathname, lang, code}).catch(() => {});
        }
      }
    } catch (e) {
      setResult({error: String(e.message || e)});
    }
    setRunning(false);
  }, [endpoint, lang, version, fileName, code, harness, draftId, title, pathname]);

  const handleReset = () => {
    reset();
    setResult(null);
  };

  const matchPct = result?.score?.shape;
  const cleared = matchPct === 100;

  return (
    <div className={chrome.shell}>
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
            <img className={styles.plot} alt="yours vs target" src={`data:image/png;base64,${result.png}`} />
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
      />
      <div className={chrome.editorPane}>
        <CodeEditor value={code} onChange={setCode} lang={lang} height="120px" />
      </div>

      <button type="button" className={styles.toggleCode} onClick={() => setShowCode((s) => !s)}>
        {t.code} {showCode ? `(${t.hide})` : `(${t.show})`}
      </button>
      {showCode && (
        <div className={chrome.editorPane}>
          <CodeEditor value={harness.trim()} onChange={() => {}} lang={lang} height="220px" readOnly />
        </div>
      )}
    </div>
  );
}
