import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeEditor from '@site/src/components/CodeEditor';
import EditorToolbar from '@site/src/components/codeWorkspace/EditorToolbar';
import useCodeDraft from '@site/src/components/codeWorkspace/useCodeDraft';
import {makeDraftId, registerExam, markExamComplete, slugifyAnchor} from '@site/src/components/codeWorkspace/drafts';
import defaultSourceFilename from '@site/src/components/codeWorkspace/defaultSourceFilename';
import SplitPanes from '@site/src/components/codeWorkspace/SplitPanes';
import chrome from '@site/src/components/codeWorkspace/chrome.module.css';

function executeUrl(api, siteConfig) {
    if (api) {
        return api.replace(/\/$/, '');
    }
    const fromConfig = siteConfig?.customFields?.pistonExecuteUrl;
    if (fromConfig) {
        return String(fromConfig).replace(/\/$/, '');
    }
    return 'http://127.0.0.1:2000/api/v2/execute';
}

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
    const hay = test.exact ? output.text : normalize(output.text);
    if (test.equals) {
        const want = test.exact ? test.equals : normalize(test.equals);
        return hay === want;
    }
    const needles = test.includes || [];
    return needles.every((n) => hay.includes(test.exact ? n : normalize(n)));
}

/**
 * Piston runs `java Main.java` (source-file mode): main must live on the public
 * class that matches the file name. Lessons historically appended a separate
 * `class Runner { public static void main... }`, which compiles but never runs.
 * Lift Runner's main into Main instead.
 */
function buildProgram(lang, code, wrapPrefix, wrapSuffix) {
    const prefix = wrapPrefix || '';
    const suffix = wrapSuffix || '';
    const isJava = String(lang).toLowerCase() === 'java';
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
    return prefix + code + suffix;
}

export default function CodingExam({
    title = 'Mini exam',
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
}) {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const fileName = useMemo(
        () => defaultSourceFilename(lang, filename),
        [lang, filename]
    );
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

    const {code, setCode, saveLabel, reset} = useCodeDraft(draftId, starter);

    const chapter = typeof document !== 'undefined'
        ? document.title.replace(/\s*[|\u2013\u2014].*$/, '').trim()
        : pathname;

    useEffect(() => {
        registerExam(draftId, {
            title,
            pathname,
            chapter,
            lang,
            starter,
            hash,
            plannedTotal: sourceChecks.length + tests.length,
        }).catch(() => {});
    }, [draftId, title, pathname, chapter, lang, starter, hash, sourceChecks.length, tests.length]);

    const [checking, setChecking] = useState(false);
    const [results, setResults] = useState(null);
    const [split, setSplit] = useState(false);

    const check = useCallback(async () => {
        setSplit(true);
        setChecking(true);
        setResults(null);
        const endpoint = executeUrl(api, siteConfig);
        const next = [];
        const program = buildProgram(lang, code, wrapPrefix, wrapSuffix);

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
                    const res = await fetch(endpoint, {
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
                            detail: 'API error: ' + (err.message || res.statusText),
                        });
                        break;
                    }

                    const data = await res.json();
                    const output = collectOutput(data);
                    if (output.compileFailed) {
                        next.push({
                            name: test.name || 'Test',
                            pass: false,
                            detail: 'Did not compile:\n' + output.text,
                        });
                        break;
                    }

                    const ok = passesTest(output, test);
                    next.push({
                        name: test.name || 'Test',
                        pass: ok,
                        detail: ok
                            ? 'Output matched.\n' + output.text
                            : 'Output did not match.\nGot:\n' + (output.text || '(no output)'),
                    });
                    if (!ok) {
                        break;
                    }
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
            markExamComplete(draftId, {code}).catch(() => {});
        }
    }, [api, siteConfig, tests, sourceChecks, wrapPrefix, wrapSuffix, lang, version, fileName, code, draftId]);

    const plannedTotal = sourceChecks.length + tests.length;
    const passed = results?.filter((r) => r.pass).length ?? 0;
    const ran = results?.length ?? 0;
    const allPass = results && plannedTotal > 0 && passed === plannedTotal;
    const stoppedEarly = results && !allPass && ran < plannedTotal;

    const handleReset = () => {
        reset();
        setResults(null);
        setSplit(false);
    };

    return (
        <div className={chrome.shell}>
            <div className={chrome.intro}>
                <div className={chrome.titleRow}>
                    <span className={`${chrome.badge} ${chrome.badgeExam}`}>Exam</span>
                    <h3 className={chrome.title}>{title}</h3>
                </div>
                {prompt && <p className={chrome.prompt}>{prompt}</p>}
                {sampleLog ? <pre className={chrome.sample}>{sampleLog}</pre> : null}
            </div>

            <EditorToolbar
                badge={lang}
                exam
                filename={fileName}
                saveLabel={saveLabel}
                running={checking}
                onRun={check}
                onReset={handleReset}
            />

            <SplitPanes split={split}>
                <div className={chrome.editorPane}>
                    <CodeEditor value={code} onChange={setCode} lang={lang} height={height} />
                </div>
                {split ? (
                    <div className={chrome.side}>
                        <div className={chrome.sideHead}>Tests</div>
                        {results ? (
                            <>
                                <div className={`${chrome.score} ${allPass ? chrome.scorePass : chrome.scoreFail}`}>
                                    {passed}/{plannedTotal} passed
                                    {allPass
                                        ? ' — all tests passed'
                                        : stoppedEarly
                                          ? ' — stopped at first failure'
                                          : ''}
                                </div>
                                <ul className={chrome.results}>
                                    {results.map((r, i) => (
                                        <li key={i} className={r.pass ? chrome.pass : chrome.fail}>
                                            <strong>
                                                {r.pass ? 'Pass' : 'Fail'} — {r.name}
                                            </strong>
                                            {!r.pass && <pre>{r.detail}</pre>}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <pre className={`${chrome.output} ${chrome.outputEmpty}`}>
                                Running hidden tests…
                            </pre>
                        )}
                    </div>
                ) : null}
            </SplitPanes>
        </div>
    );
}
