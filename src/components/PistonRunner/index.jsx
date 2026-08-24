import React, { useCallback, useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

const FILE_NAMES = {
    'c++': 'main.cpp',
    cpp: 'main.cpp',
    c: 'main.c',
    python: 'main.py',
    java: 'Main.java',
    javascript: 'index.js',
};

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

function connectUrl(execute) {
    const url = new URL(execute);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = url.pathname.replace(/\/execute\/?$/, '/connect');
    return url.toString();
}

export default function PistonRunner({
    lang = 'python',
    version = '*',
    code: initialCode = '',
    filename,
    stdin: initialStdin = '',
    showStdin = false,
    interactive = true,
    editable = true,
    height = '260px',
    api,
}) {
    const { siteConfig } = useDocusaurusContext();
    const [code, setCode] = useState(initialCode);
    const [stdin, setStdin] = useState(initialStdin);
    const [output, setOutput] = useState('');
    const [liveLine, setLiveLine] = useState('');
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(null);
    const [exitCode, setExitCode] = useState(null);
    const [isError, setIsError] = useState(false);
    const [stage, setStage] = useState(null);

    const wsRef = useRef(null);
    const t0Ref = useRef(0);
    const outputRef = useRef(null);

    const fileName = filename || FILE_NAMES[lang] || 'main.txt';
    const usesCin = /\bcin\s*>>/.test(code) || /\bgetline\s*\(/.test(code);
    const stdinVisible = !interactive && (showStdin || initialStdin.length > 0 || usesCin);

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, liveLine]);

    const handleTab = useCallback(
        (e) => {
            if (e.key !== 'Tab') return;
            e.preventDefault();
            const el = e.target;
            const s = el.selectionStart;
            const newCode = code.slice(0, s) + '    ' + code.slice(el.selectionEnd);
            setCode(newCode);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = s + 4;
            });
        },
        [code]
    );

    const finish = useCallback((codeValue, error) => {
        setElapsed(((Date.now() - t0Ref.current) / 1000).toFixed(2));
        if (codeValue != null) setExitCode(codeValue);
        if (error) setIsError(true);
        setRunning(false);
        setStage(null);
        wsRef.current = null;
    }, []);

    const runRest = useCallback(async () => {
        const exec = executeUrl(api, siteConfig);
        const res = await fetch(exec, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: lang,
                version,
                stdin,
                files: [{ name: fileName, content: code }],
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setIsError(true);
            setOutput('API error: ' + (err.message || res.statusText));
            finish(null, true);
            return;
        }

        const data = await res.json();
        const runResult = data.run || {};
        const compile = data.compile || {};

        let text = '';
        if (compile.stderr) text += compile.stderr;
        if (compile.stdout) text += (text ? '\n' : '') + compile.stdout;
        if (runResult.stdout) text += (text ? '\n' : '') + runResult.stdout;
        if (runResult.stderr) text += (text ? '\n' : '') + runResult.stderr;

        const compileFailed = compile.code != null && compile.code !== 0;
        setExitCode(compileFailed ? compile.code : runResult.code ?? null);
        setIsError(compileFailed || (!!runResult.stderr && !runResult.stdout));
        setOutput(text.trimEnd() || '(no output)');
        finish(compileFailed ? compile.code : runResult.code ?? 0, compileFailed);
    }, [api, siteConfig, lang, version, stdin, fileName, code, finish]);

    const run = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        setRunning(true);
        setOutput('');
        setLiveLine('');
        setElapsed(null);
        setExitCode(null);
        setIsError(false);
        setStage(interactive ? 'connecting' : null);
        t0Ref.current = Date.now();

        if (!interactive) {
            runRest().catch((e) => {
                setIsError(true);
                setOutput('Could not reach Piston: ' + e.message);
                finish(null, true);
            });
            return;
        }

        const exec = executeUrl(api, siteConfig);
        let ws;
        try {
            ws = new WebSocket(connectUrl(exec));
        } catch (e) {
            setOutput('WebSocket failed, using batch input…\n');
            runRest().catch((err) => {
                setIsError(true);
                setOutput('Could not reach Piston: ' + err.message);
                finish(null, true);
            });
            return;
        }

        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: 'init',
                    language: lang,
                    version,
                    stdin: '',
                    files: [{ name: fileName, content: code, encoding: 'utf8' }],
                    run_timeout: 30000,
                    compile_timeout: 10000,
                })
            );
        };

        ws.onmessage = (event) => {
            let msg;
            try {
                msg = JSON.parse(event.data);
            } catch {
                return;
            }

            if (msg.type === 'error') {
                setIsError(true);
                setOutput((prev) => prev + (msg.message || 'Piston error') + '\n');
                return;
            }

            if (msg.type === 'runtime') {
                setStage('compile');
                return;
            }

            if (msg.type === 'stage') {
                setStage(msg.stage);
                return;
            }

            if (msg.type === 'data' && (msg.stream === 'stdout' || msg.stream === 'stderr')) {
                if (msg.stream === 'stderr') setIsError(true);
                setOutput((prev) => prev + (msg.data || ''));
                return;
            }

            if (msg.type === 'exit') {
                if (msg.stage === 'run' || msg.code) {
                    setExitCode(msg.code ?? null);
                    if (msg.code && msg.code !== 0) setIsError(true);
                }
            }
        };

        ws.onerror = () => {
            if (wsRef.current !== ws) return;
            setIsError(true);
            setOutput((prev) => prev || 'WebSocket error — is Piston running?');
        };

        ws.onclose = () => {
            if (wsRef.current !== ws && wsRef.current !== null) return;
            finish(null, false);
        };
    }, [interactive, runRest, api, siteConfig, lang, version, fileName, code, finish]);

    const sendLine = useCallback(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const line = liveLine.endsWith('\n') ? liveLine : liveLine + '\n';
        ws.send(JSON.stringify({ type: 'data', stream: 'stdin', data: line }));
        setOutput((prev) => prev + line);
        setLiveLine('');
    }, [liveLine]);

    return (
        <div className={styles.runner}>
            <div className={styles.toolbar}>
                <span className={styles.badge}>{lang}</span>
                <span className={styles.fileTab}>{fileName}</span>
                {stage && running && <span className={styles.meta}>{stage}</span>}
                {elapsed != null && exitCode !== null && (
                    <span className={styles.meta}>
                        exit {exitCode} · {elapsed}s
                    </span>
                )}
                <button className={styles.runBtn} onClick={run} disabled={running} type="button">
                    {running ? 'Running…' : '▶ Run'}
                </button>
            </div>

            <div className={styles.panes} style={{ minHeight: height }}>
                <textarea
                    className={styles.editor}
                    style={{ minHeight: height }}
                    value={code}
                    onChange={(e) => editable && setCode(e.target.value)}
                    onKeyDown={handleTab}
                    readOnly={!editable}
                    spellCheck={false}
                    aria-label="Source code"
                />
                <div className={styles.terminal} style={{ minHeight: height }}>
                    <pre
                        ref={outputRef}
                        className={[
                            styles.output,
                            isError ? styles.outputError : '',
                            !output && !running ? styles.outputEmpty : '',
                        ].join(' ')}
                    >
                        {output ||
                            (interactive
                                ? 'Press Run, then type answers here when the program asks (cin).'
                                : 'Output appears here after you press Run.')}
                    </pre>
                    {interactive && (
                        <input
                            className={styles.liveInput}
                            value={liveLine}
                            disabled={!running || stage === 'compile' || stage === 'connecting'}
                            onChange={(e) => setLiveLine(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    sendLine();
                                }
                            }}
                            placeholder={
                                running && stage === 'run'
                                    ? 'Type input for cin, then Enter'
                                    : 'Input is enabled while the program is running'
                            }
                            aria-label="Live program input"
                        />
                    )}
                </div>
            </div>

            {stdinVisible && (
                <label className={styles.stdinLabel}>
                    Program input (batch)
                    <textarea
                        className={styles.stdin}
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        spellCheck={false}
                        rows={3}
                    />
                </label>
            )}
        </div>
    );
}
