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

function collectOutput(data) {
    const runResult = data.run || {};
    const compile = data.compile || {};
    let text = '';
    if (compile.stderr) text += compile.stderr;
    if (compile.stdout) text += (text ? '\n' : '') + compile.stdout;
    if (runResult.stdout) text += (text ? '\n' : '') + runResult.stdout;
    if (runResult.stderr) text += (text ? '\n' : '') + runResult.stderr;
    // Grade against program stdout when present so optional runtime stderr
    // (e.g. Godot missing libfontconfig) does not fail equals/includes checks.
    const stdout = String(runResult.stdout || '')
        .replace(/\r\n/g, '\n')
        .replace(/\n$/, '');
    return {
        text: text.replace(/\r\n/g, '\n'),
        stdout,
        compileFailed: compile.code != null && compile.code !== 0,
        exitCode: compile.code != null && compile.code !== 0 ? compile.code : runResult.code ?? 0,
    };
}

function normalize(s) {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
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
    const source = output.stdout !== undefined ? output.stdout : output.text;
    const hay = test.exact ? source : normalize(source);
    if (test.equals) {
        const want = test.exact ? test.equals : normalize(test.equals);
        return hay === want;
    }
    const needles = test.includes || [];
    return needles.every((n) => hay.includes(test.exact ? n : normalize(n)));
}

function expectedDisplay(test) {
    if (test.equals != null && test.equals !== '') {
        return String(test.equals);
    }
    if (Array.isArray(test.includes) && test.includes.length) {
        return test.includes.map(String).join('\n');
    }
    return '(any output)';
}

function receivedDisplay(output) {
    const raw = output?.stdout !== undefined ? output.stdout : output?.text;
    const text = String(raw ?? '').replace(/\r\n/g, '\n').replace(/\n$/, '');
    return text || '(no output)';
}

/**
 * Piston runs `java Main.java` (source-file mode): main must live on the public
 * class that matches the file name. Lessons historically appended a separate
 * `class Runner { public static void main... }`, which compiles but never runs.
 * Lift Runner's main into Main instead.
 */
function normalizeGodotIndent(src) {
    // CodeMirror uses spaces; MDX/starters may use tabs. GDScript forbids mixing.
    return String(src).replace(/^\t+/gm, (tabs) => '    '.repeat(tabs.length));
}

function buildProgram(lang, code, wrapPrefix, wrapSuffix) {
    const prefix = wrapPrefix || '';
    const suffix = wrapSuffix || '';
    const langKey = String(lang).toLowerCase();
    const isJava = langKey === 'java';
    if (isJava && /class\s+Runner\b/.test(suffix)) {
        const m = suffix.match(/class\s+Runner\s*\{([\s\S]*)\}\s*$/);
        if (m) {
            const mainBody = m[1].replace(/^\n+/, '').replace(/\n+$/, '');
            const stripped = code.replace(/\}\s*$/, '');
            if (stripped !== code) {
                return `${prefix}${stripped}\n${mainBody}\n}\n`;
            }
        }
    }
    const program = prefix + code + suffix;
    if (langKey === 'godot' || langKey === 'gdscript' || langKey === 'gd') {
        return normalizeGodotIndent(program);
    }
    return program;
}

/** Interactive practice exercise with hidden tests (and optional hint/solution). */
export default function CodeExercise({
    title = 'Practice',
    prompt,
    sampleLog = '',
    starter = '',
    lang = 'c++',
    version = '*',
    filename,
    tests = [],
    sourceChecks = [],
    wrapPrefix = '',
    wrapSuffix = '',
    height = '280px',
    api,
    storageKey,
    heading,
    anchor,
    hint,
    solution,
    disablePaste: disablePasteProp,
}) {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const disablePaste =
        disablePasteProp ?? pathname.includes('/springboot/');
    const fileName = useMemo(
        () => defaultSourceFilename(lang, filename),
        [lang, filename]
    );
    // Keep draft id prefix "exam" so existing IndexedDB progress still matches.
    const draftId = useMemo(
        () =>
            storageKey ||
            makeDraftId('exam', pathname, [title, fileName, starter].join('\0')),
        [storageKey, pathname, title, fileName, starter]
    );
    const hash = useMemo(
        () => (anchor || slugifyAnchor(heading) || slugifyAnchor(title) || '').replace(/^#/, ''),
        [anchor, heading, title]
    );

    const chapter = typeof document !== 'undefined'
        ? document.title.replace(/\s*[|\u2013\u2014].*$/, '').trim()
        : pathname;

    const plannedTotal = sourceChecks.length + tests.length;

    const practiceMeta = useMemo(
        () => ({
            title,
            pathname,
            chapter,
            lang,
            starter,
            hash,
            plannedTotal,
        }),
        [title, pathname, chapter, lang, starter, hash, plannedTotal]
    );

    const {code, setCode, saveLabel, reset} = useCodeDraft(draftId, starter, '', practiceMeta);

    const [checking, setChecking] = useState(false);
    const [results, setResults] = useState(null);
    const [split, setSplit] = useState(false);
    const [help, setHelp] = useState(null);

    const closeHelp = useCallback(() => setHelp(null), []);

    const check = useCallback(async () => {
        setSplit(true);
        setChecking(true);
        setResults(null);
        const endpoint = resolvePistonExecuteUrl(api, siteConfig);
        const next = [];
        const program = buildProgram(lang, code, wrapPrefix, wrapSuffix);

        try {
            let failed = false;
            for (const rule of sourceChecks) {
                const row = sourceCheck(code, rule);
                next.push({...row, kind: 'source'});
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
                            language: lang,
                            version,
                            stdin: test.stdin ?? '',
                            files: [{name: fileName, content: program}],
                            run_timeout: 20000,
                            run_cpu_time: 15000,
                        }),
                    });

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        next.push({
                            name: test.name || 'Test',
                            pass: false,
                            kind: 'runtime',
                            expected: expectedDisplay(test),
                            received: '',
                            detail: 'API error: ' + (err.message || res.statusText),
                        });
                        continue;
                    }

                    const data = await res.json();
                    const output = collectOutput(data);
                    if (output.compileFailed) {
                        next.push({
                            name: test.name || 'Test',
                            pass: false,
                            kind: 'runtime',
                            expected: expectedDisplay(test),
                            received: receivedDisplay(output),
                            detail: 'Did not compile:\n' + output.text,
                        });
                        continue;
                    }

                    const ok = passesTest(output, test);
                    next.push({
                        name: test.name || 'Test',
                        pass: ok,
                        kind: 'runtime',
                        expected: expectedDisplay(test),
                        received: receivedDisplay(output),
                        detail: ok
                            ? 'Output matched.'
                            : 'Output did not match expected value.',
                    });
                }
            }
        } catch (e) {
            next.push({
                name: 'Connection',
                pass: false,
                detail: 'Could not reach Piston: ' + e.message,
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
                lang,
                starter,
                hash,
                plannedTotal: total,
            }).catch(() => {});
        }
    }, [api, siteConfig, tests, sourceChecks, wrapPrefix, wrapSuffix, lang, version, fileName, code, draftId, title, pathname, chapter, starter, hash]);

    const passed = results?.filter((r) => r.pass).length ?? 0;
    const ran = results?.length ?? 0;
    const allPass = results && plannedTotal > 0 && passed === plannedTotal;
    const runtimeRows = (results || []).filter((r) => r.kind === 'runtime');
    const sourceRows = (results || []).filter((r) => r.kind !== 'runtime');

    const handleReset = () => {
        reset();
        setResults(null);
        setSplit(false);
    };

    return (
        <div className={chrome.shell}>
            <div className={chrome.intro}>
                <div className={chrome.titleRow}>
                    <span className={`${chrome.badge} ${chrome.badgePractice}`}>Practice</span>
                    <h3 className={chrome.title}>{title}</h3>
                    {(hint || solution) && (
                        <div className={chrome.helpActions}>
                            {hint ? (
                                <button
                                    type="button"
                                    className={chrome.helpBtn}
                                    onClick={() => setHelp('hint')}
                                >
                                    Hint
                                </button>
                            ) : null}
                            {solution ? (
                                <button
                                    type="button"
                                    className={chrome.helpBtn}
                                    onClick={() => setHelp('solution')}
                                >
                                    Solution
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
                badge={lang}
                practice
                filename={fileName}
                saveLabel={saveLabel}
                running={checking}
                onRun={check}
                onReset={handleReset}
            />

            <SplitPanes split={split}>
                <div className={chrome.editorPane}>
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        lang={lang}
                        height={height}
                        disablePaste={disablePaste}
                    />
                </div>
                {split ? (
                    <div className={chrome.side}>
                        <div className={chrome.sideHead}>Tests</div>
                        {results ? (
                            <>
                                <div className={`${chrome.score} ${allPass ? chrome.scorePass : chrome.scoreFail}`}>
                                    {passed}/{plannedTotal} passed
                                    {allPass ? ' — all tests passed' : ''}
                                </div>
                                {sourceRows.length ? (
                                    <ul className={chrome.results}>
                                        {sourceRows.map((r, i) => (
                                            <li key={`src-${i}`} className={r.pass ? chrome.pass : chrome.fail}>
                                                <strong>
                                                    {r.pass ? 'Pass' : 'Fail'} — {r.name}
                                                </strong>
                                                {!r.pass && r.detail ? (
                                                    <pre className="notranslate" translate="no">
                                                        {r.detail}
                                                    </pre>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                                {runtimeRows.length ? (
                                    <div className={chrome.compareTableWrap}>
                                        <table className={chrome.compareTable}>
                                            <thead>
                                                <tr>
                                                    <th>Test</th>
                                                    <th>Expected</th>
                                                    <th>Received</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {runtimeRows.map((r, i) => (
                                                    <tr key={`rt-${i}`}>
                                                        <td>{r.name}</td>
                                                        <td className={`${chrome.compareCell} notranslate`} translate="no">
                                                            {r.expected}
                                                        </td>
                                                        <td className={`${chrome.compareCell} notranslate`} translate="no">
                                                            {r.received}
                                                        </td>
                                                        <td className={r.pass ? chrome.comparePass : chrome.compareFail}>
                                                            {r.pass ? 'Pass' : 'Fail'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : null}
                                {runtimeRows.some((r) => !r.pass && r.detail && r.detail.startsWith('Did not compile')) ? (
                                    <ul className={chrome.results}>
                                        {runtimeRows
                                            .filter((r) => !r.pass && r.detail && r.detail.startsWith('Did not compile'))
                                            .map((r, i) => (
                                                <li key={`cmp-${i}`} className={chrome.fail}>
                                                    <strong>Compile error — {r.name}</strong>
                                                    <pre className="notranslate" translate="no">
                                                        {r.detail}
                                                    </pre>
                                                </li>
                                            ))}
                                    </ul>
                                ) : null}
                            </>
                        ) : (
                            <pre
                                className={noTranslateClass(chrome.output, chrome.outputEmpty)}
                                translate="no"
                            >
                                Running tests…
                            </pre>
                        )}
                    </div>
                ) : null}
            </SplitPanes>

            <HelpModal open={help === 'hint'} title="Hint" onClose={closeHelp}>
                {hint}
            </HelpModal>
            <HelpModal open={help === 'solution'} title="Solution" code onClose={closeHelp}>
                {solution}
            </HelpModal>
        </div>
    );
}
