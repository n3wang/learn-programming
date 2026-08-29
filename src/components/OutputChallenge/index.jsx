import React, {useCallback, useMemo, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeEditor from '@site/src/components/CodeEditor';
import EditorToolbar from '@site/src/components/codeWorkspace/EditorToolbar';
import useCodeDraft from '@site/src/components/codeWorkspace/useCodeDraft';
import {makeDraftId, markPracticeComplete} from '@site/src/components/codeWorkspace/drafts';
import defaultSourceFilename from '@site/src/components/codeWorkspace/defaultSourceFilename';
import chrome from '@site/src/components/codeWorkspace/chrome.module.css';
import styles from './styles.module.css';

function executeUrl(api, siteConfig) {
  if (api) return api.replace(/\/$/, '');
  const fromConfig = siteConfig?.customFields?.pistonExecuteUrl;
  if (fromConfig) return String(fromConfig).replace(/\/$/, '');
  return 'http://127.0.0.1:2000/api/v2/execute';
}

const STR = {
  en: {
    run: 'Run',
    reset: 'Reset',
    wait: 'press Run',
    match: (n) => `match: ${n}%`,
    target: 'target',
    yours: 'yours',
  },
  'zh-Hans': {
    run: '运行',
    reset: '重置',
    wait: '按运行',
    match: (n) => `匹配：${n}%`,
    target: '目标',
    yours: '你的',
  },
};

function normalizeOutput(text) {
  return (text || '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
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
 * Graph Detective-style output matching: target text on the left, your output
 * on the right after Run. Optional sourceChecks enforce constructs (for, append).
 */
export default function OutputChallenge({
  title,
  target,
  starter,
  sourceChecks = [],
  lang = 'python',
  version = '*',
  api,
  height = '160px',
}) {
  const {siteConfig, i18n} = useDocusaurusContext();
  const locale = i18n.currentLocale === 'zh-Hans' ? 'zh-Hans' : 'en';
  const t = STR[locale];
  const {pathname} = useLocation();
  const fileName = defaultSourceFilename(lang);

  const draftId = useMemo(
    () => makeDraftId('output', pathname, [title, starter].join('\0')),
    [pathname, title, starter]
  );
  const {code, setCode, saveLabel, reset} = useCodeDraft(draftId, starter, '');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const endpoint = executeUrl(api, siteConfig);
  const want = useMemo(() => normalizeOutput(target), [target]);

  const run = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      for (const rule of sourceChecks) {
        const row = sourceCheck(code, rule);
        if (!row.pass) {
          setResult({error: row.name + ': ' + row.detail, checks: [row]});
          setRunning(false);
          return;
        }
      }

      const stdout = await runPiston({endpoint, lang, version, fileName, program: code});
      const got = normalizeOutput(stdout);
      const pass = got === want;
      setResult({
        output: stdout,
        pass,
        checks: sourceChecks.map((rule) => sourceCheck(code, rule)),
      });
      if (pass) {
        markPracticeComplete(draftId, {title, pathname, lang, code}).catch(() => {});
      }
    } catch (e) {
      setResult({error: String(e.message || e)});
    }
    setRunning(false);
  }, [endpoint, lang, version, fileName, code, want, sourceChecks, draftId, title, pathname]);

  const handleReset = () => {
    reset();
    setResult(null);
  };

  const matchPct = result?.pass ? 100 : result && !result.error ? 0 : null;
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
      </div>

      <div className={styles.outputRow}>
        <div className={styles.outputCell}>
          <span className={styles.outputLabel}>{t.target}</span>
          <pre className={styles.outputBox}>{target}</pre>
        </div>
        <div className={styles.outputCell}>
          <span className={styles.outputLabel}>{t.yours}</span>
          {result?.output != null ? (
            <pre className={`${styles.outputBox} ${cleared ? styles.outputPass : styles.outputFail}`}>{result.output}</pre>
          ) : (
            <div className={styles.outputPlaceholder}>{running ? '…' : t.wait}</div>
          )}
        </div>
      </div>

      {result?.error && (
        <pre className={`${chrome.output} ${chrome.outputError} ${styles.outputError}`}>{result.error}</pre>
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
        <CodeEditor value={code} onChange={setCode} lang={lang} height={height} />
      </div>
    </div>
  );
}
