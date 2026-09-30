import React, {useCallback, useMemo, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeEditor from '@site/src/components/CodeEditor';
import EditorToolbar from '@site/src/components/codeWorkspace/EditorToolbar';
import useCodeDraft from '@site/src/components/codeWorkspace/useCodeDraft';
import {
  makeDraftId,
  markPracticeComplete,
  slugifyAnchor,
} from '@site/src/components/codeWorkspace/drafts';
import defaultSourceFilename from '@site/src/components/codeWorkspace/defaultSourceFilename';
import SplitPanes from '@site/src/components/codeWorkspace/SplitPanes';
import HelpModal from '@site/src/components/codeWorkspace/HelpModal';
import {noTranslateClass} from '@site/src/components/codeWorkspace/noTranslate';
import chrome from '@site/src/components/codeWorkspace/chrome.module.css';
import {
  fetchPistonExecute,
  resolvePistonExecuteUrl,
} from '@site/src/api/pistonClient';
import {buildTradingRunner} from './buildRunner';
import styles from './tradingSim.module.css';

const PREVIEW_LIMIT = 20;
const PISTON_LANG = 'python';
const PISTON_VERSION = '*';
const PISTON_FILENAME = 'main.py';

function collectOutput(data) {
  const runResult = data.run || {};
  const compile = data.compile || {};
  let text = '';
  if (compile.stderr) text += compile.stderr;
  if (compile.stdout) text += (text ? '\n' : '') + compile.stdout;
  if (runResult.stdout) text += (text ? '\n' : '') + runResult.stdout;
  if (runResult.stderr) text += (text ? '\n' : '') + runResult.stderr;
  return {
    text: text.replace(/\r\n/g, '\n'),
    compileFailed: compile.code != null && compile.code !== 0,
    exitCode: compile.code != null && compile.code !== 0 ? compile.code : runResult.code ?? 0,
  };
}

function normalize(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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
      ? must
        ? 'Found the required construct in your code.'
        : 'Did not use the forbidden construct.'
      : must
        ? 'Your solution must use: ' + (check.hint || check.pattern)
        : 'Do not use: ' + (check.hint || check.pattern),
  };
}

function passesTest(output, test) {
  const hay = test.exact ? output.text.trim() : normalize(output.text);
  if (test.equals != null) {
    const want = test.exact ? String(test.equals).trim() : normalize(test.equals);
    return hay === want;
  }
  const needles = test.includes || [];
  return needles.every((n) => hay.includes(test.exact ? n : normalize(n)));
}

function TablePreview({tables}) {
  const [idx, setIdx] = useState(0);
  const table = tables[Math.min(idx, Math.max(tables.length - 1, 0))];
  if (!table) {
    return <p className={styles.empty}>本练习未附带市场表格。</p>;
  }
  const rows = table.rows.slice(0, PREVIEW_LIMIT);
  const truncated = table.rows.length > PREVIEW_LIMIT;

  return (
    <div className={styles.preview}>
      <div className={styles.tableTabs} role="tablist" aria-label="Market tables">
        {tables.map((t, i) => (
          <button
            key={t.name}
            type="button"
            role="tab"
            aria-selected={i === idx}
            className={`${styles.tableTab} ${i === idx ? styles.tableTabActive : ''}`}
            onClick={() => setIdx(i)}
          >
            {t.name}
            <span className={styles.rowCount}>{t.rows.length}</span>
          </button>
        ))}
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.grid}>
          <thead>
            <tr>
              {table.columns.map((c) => (
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
      <p className={styles.previewNote}>
        Showing {rows.length} of {table.rows.length} rows
        {truncated ? ` (first ${PREVIEW_LIMIT})` : ''}. 框架每个 tick 调用你的{' '}
        <code>on_tick</code> — 只需写该钩子。
      </p>
    </div>
  );
}

/**
 * Python trading practice: tick loop + market API, with Code / Data tabs.
 */
export default function TradingSimExercise({
  title = '交易练习',
  prompt,
  sampleLog = '',
  starter = 'def on_tick(market_data, user_data):\n    pass\n',
  companies = [],
  pricesByTick = [],
  startingCash = 10000,
  listedEtfs = {},
  tables = [],
  tests = [],
  sourceChecks = [],
  height = '280px',
  api,
  storageKey,
  heading,
  anchor,
  hint,
  solution,
}) {
  const {siteConfig} = useDocusaurusContext();
  const {pathname} = useLocation();
  const fileName = useMemo(
    () => defaultSourceFilename('python', 'on_tick.py'),
    [],
  );
  const draftId = useMemo(
    () =>
      storageKey ||
      makeDraftId('exam', pathname, [title, fileName, starter].join('\0')),
    [storageKey, pathname, title, fileName, starter],
  );
  const hash = useMemo(
    () => (anchor || slugifyAnchor(heading) || slugifyAnchor(title) || '').replace(/^#/, ''),
    [anchor, heading, title],
  );

  const chapter =
    typeof document !== 'undefined'
      ? document.title.replace(/\s*[|\u2013\u2014].*$/, '').trim()
      : pathname;

  const plannedTotal = sourceChecks.length + tests.length;
  const practiceMeta = useMemo(
    () => ({
      title,
      pathname,
      chapter,
      lang: 'python',
      starter,
      hash,
      plannedTotal,
    }),
    [title, pathname, chapter, starter, hash, plannedTotal],
  );

  const {code, setCode, saveLabel, reset} = useCodeDraft(draftId, starter, '', practiceMeta);

  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [split, setSplit] = useState(false);
  const [help, setHelp] = useState(null);
  const [view, setView] = useState('code');

  const check = useCallback(async () => {
    setView('code');
    setSplit(true);
    setChecking(true);
    setResults(null);
    const endpoint = resolvePistonExecuteUrl(api, siteConfig);
    const next = [];
    const program = buildTradingRunner({
      companies,
      pricesByTick,
      startingCash,
      listedEtfs,
      studentCode: code,
    });

    try {
      let failed = false;
      for (const rule of sourceChecks) {
        const row = sourceCheck(code, rule);
        next.push(row);
        if (!row.pass) {
          failed = true;
          break;
        }
      }

      if (!failed) {
        for (const test of tests) {
          const res = await fetchPistonExecute(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              language: PISTON_LANG,
              version: PISTON_VERSION,
              stdin: test.stdin ?? '',
              files: [{name: PISTON_FILENAME, content: program}],
              run_timeout: 20000,
              run_cpu_time: 15000,
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            next.push({
              name: test.name || 'Test',
              pass: false,
              detail: 'API 错误: ' + (err.message || res.statusText),
            });
            break;
          }

          const data = await res.json();
          const output = collectOutput(data);
          if (output.compileFailed) {
            next.push({
              name: test.name || 'Test',
              pass: false,
              detail: '未能运行:\n' + output.text,
            });
            break;
          }

          const ok = passesTest(output, test) && output.exitCode === 0;
          next.push({
            name: test.name || 'Test',
            pass: ok,
            detail: ok
              ? '输出匹配。\n' + output.text
              : output.exitCode !== 0
                ? '模拟失败:\n' + output.text
                : '输出不匹配。\n得到:\n' + (output.text || '(无输出)'),
          });
          if (!ok) {
            break;
          }
        }
      }
    } catch (e) {
      next.push({
        name: '连接',
        pass: false,
        detail: '无法连接 Piston: ' + e.message,
      });
    }

    setResults(next);
    setChecking(false);
    const passedCount = next.filter((r) => r.pass).length;
    const total = sourceChecks.length + tests.length;
    if (total > 0 && passedCount === total) {
      markPracticeComplete(draftId, {
        code,
        title,
        pathname,
        chapter,
        lang: 'python',
        starter,
        hash,
        plannedTotal: total,
      }).catch(() => {});
    }
  }, [
    api,
    siteConfig,
    tests,
    sourceChecks,
    companies,
    pricesByTick,
    startingCash,
    listedEtfs,
    code,
    draftId,
    title,
    pathname,
    chapter,
    starter,
    hash,
  ]);

  const passed = results?.filter((r) => r.pass).length ?? 0;
  const ran = results?.length ?? 0;
  const allPass = results && plannedTotal > 0 && passed === plannedTotal;
  const stoppedEarly = results && !allPass && ran < plannedTotal;

  const handleReset = () => {
    reset();
    setResults(null);
    setSplit(false);
    setView('code');
  };

  return (
    <div className={chrome.shell} id={hash || undefined}>
      <div className={chrome.intro}>
        <div className={chrome.titleRow}>
          <span className={`${chrome.badge} ${chrome.badgePractice}`}>练习</span>
          <h3 className={chrome.title}>{title}</h3>
          {(hint || solution) && (
            <div className={chrome.helpActions}>
              {hint ? (
                <button
                  type="button"
                  className={chrome.helpBtn}
                  onClick={() => setHelp('hint')}
                >
                  提示
                </button>
              ) : null}
              {solution ? (
                <button
                  type="button"
                  className={chrome.helpBtn}
                  onClick={() => setHelp('solution')}
                >
                  参考答案
                </button>
              ) : null}
            </div>
          )}
        </div>
        {prompt && <p className={chrome.prompt}>{prompt}</p>}
        {sampleLog ? (
          <pre className={noTranslateClass(chrome.sample)} translate="no">
            {sampleLog}
          </pre>
        ) : null}
      </div>

      <EditorToolbar
        badge="python"
        practice
        filename={fileName}
        saveLabel={saveLabel}
        running={checking}
        onRun={check}
        onReset={handleReset}
        runLabel="▶ 运行模拟"
        runningLabel="运行中…"
      >
        <div className={styles.viewTabs} role="tablist" aria-label="Editor view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'code'}
            className={`${styles.viewTab} ${view === 'code' ? styles.viewTabActive : ''}`}
            onClick={() => setView('code')}
          >
            代码
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'data'}
            className={`${styles.viewTab} ${view === 'data' ? styles.viewTabActive : ''}`}
            onClick={() => setView('data')}
          >
            数据
          </button>
        </div>
      </EditorToolbar>

      <SplitPanes split={split && view === 'code'}>
        <div className={chrome.editorPane}>
          {view === 'code' ? (
            <CodeEditor
              value={code}
              onChange={setCode}
              lang="python"
              height={height}
            />
          ) : (
            <TablePreview tables={tables} />
          )}
        </div>
        {split && view === 'code' ? (
          <div className={chrome.side}>
            <div className={chrome.sideHead}>测试</div>
            {results ? (
              <>
                <div
                  className={`${chrome.score} ${allPass ? chrome.scorePass : chrome.scoreFail}`}
                >
                  {passed}/{plannedTotal} 通过
                  {allPass
                    ? ' — 全部通过'
                    : stoppedEarly
                      ? ' — 在首个失败处停止'
                      : ''}
                </div>
                <ul className={chrome.results}>
                  {results.map((r, i) => (
                    <li key={i} className={r.pass ? chrome.pass : chrome.fail}>
                      <strong>
                        {r.pass ? '通过' : '失败'} — {r.name}
                      </strong>
                      {!r.pass && (
                        <pre className="notranslate" translate="no">
                          {r.detail}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={chrome.muted}>运行中…</p>
            )}
          </div>
        ) : null}
      </SplitPanes>

      <HelpModal open={help === 'hint'} title="提示" onClose={() => setHelp(null)}>
        {hint}
      </HelpModal>
      <HelpModal
        open={help === 'solution'}
        title="参考答案"
        code
        lang="python"
        onClose={() => setHelp(null)}
      >
        {solution}
      </HelpModal>
    </div>
  );
}
