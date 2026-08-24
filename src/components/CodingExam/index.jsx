import React, { useCallback, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

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
 * Split exam widget: expected behaviour + sample log vs student editor.
 * "Check" runs each test case through Piston REST (stdin in, stdout compared).
 */
export default function CodingExam({
    title = 'Mini exam',
    prompt,
    sampleLog = '',
    starter = '',
    lang = 'c++',
    version = '*',
    filename = 'main.cpp',
    tests = [],
    height = '280px',
    api,
}) {
    const { siteConfig } = useDocusaurusContext();
    const [code, setCode] = useState(starter);
    const [checking, setChecking] = useState(false);
    const [results, setResults] = useState(null);

    const handleTab = useCallback(
        (e) => {
            if (e.key !== 'Tab') return;
            e.preventDefault();
            const el = e.target;
            const s = el.selectionStart;
            const next = code.slice(0, s) + '    ' + code.slice(el.selectionEnd);
            setCode(next);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = s + 4;
            });
        },
        [code]
    );

    const check = useCallback(async () => {
        setChecking(true);
        setResults(null);
        const endpoint = executeUrl(api, siteConfig);
        const next = [];

        try {
            for (const test of tests) {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        language: lang,
                        version,
                        stdin: test.stdin ?? '',
                        files: [{ name: filename, content: code }],
                    }),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    next.push({
                        name: test.name || 'Test',
                        pass: false,
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
                        detail: 'Did not compile:\n' + output.text,
                    });
                    continue;
                }

                const ok = passesTest(output, test);
                next.push({
                    name: test.name || 'Test',
                    pass: ok,
                    detail: ok
                        ? 'Output matched.\n' + output.text
                        : 'Output did not match.\nGot:\n' + (output.text || '(no output)'),
                });
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
    }, [api, siteConfig, tests, lang, version, filename, code]);

    const passed = results?.filter((r) => r.pass).length ?? 0;
    const total = results?.length ?? 0;
    const allPass = results && total > 0 && passed === total;

    return (
        <div className={styles.exam}>
            <div className={styles.header}>
                <span className={styles.badge}>Exam</span>
                <h3 className={styles.title}>{title}</h3>
            </div>
            {prompt && <p className={styles.prompt}>{prompt}</p>}

            <div className={styles.split}>
                <div className={styles.spec}>
                    <h4>Expected behaviour</h4>
                    <p>
                        Your program is run with hidden test inputs. Match the sample log (prompts
                        and the computed result). Extra spaces are ignored.
                    </p>
                    <h4>Sample run</h4>
                    <pre className={styles.log}>{sampleLog}</pre>
                </div>
                <div className={styles.work}>
                    <div className={styles.workBar}>
                        <span>{filename}</span>
                        <button type="button" className={styles.reset} onClick={() => setCode(starter)}>
                            Reset starter
                        </button>
                    </div>
                    <textarea
                        className={styles.editor}
                        style={{ minHeight: height }}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={handleTab}
                        spellCheck={false}
                        aria-label="Your solution"
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button type="button" className={styles.checkBtn} onClick={check} disabled={checking}>
                    {checking ? 'Checking…' : 'Check my program'}
                </button>
                {results && (
                    <span className={allPass ? styles.scorePass : styles.scoreFail}>
                        {passed}/{total} tests passed
                    </span>
                )}
            </div>

            {results && (
                <ul className={styles.results}>
                    {results.map((r, i) => (
                        <li key={i} className={r.pass ? styles.pass : styles.fail}>
                            <strong>
                                {r.pass ? 'Pass' : 'Fail'} — {r.name}
                            </strong>
                            <pre>{r.detail}</pre>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
