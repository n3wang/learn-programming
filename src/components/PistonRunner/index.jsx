import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeEditor from '@site/src/components/CodeEditor';
import EditorToolbar from '@site/src/components/codeWorkspace/EditorToolbar';
import useCodeDraft from '@site/src/components/codeWorkspace/useCodeDraft';
import {makeDraftId} from '@site/src/components/codeWorkspace/drafts';
import defaultSourceFilename from '@site/src/components/codeWorkspace/defaultSourceFilename';
import splitChartOutput from '@site/src/components/codeWorkspace/splitChartOutput';
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
    storageKey,
    runTimeout = 20000,
    runCpuTime = 15000,
}) {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const fileName = filename || defaultSourceFilename(lang);
    const draftId = useMemo(
        () =>
            storageKey ||
            makeDraftId('runner', pathname, [lang, fileName, initialCode].join('\0')),
        [storageKey, pathname, lang, fileName, initialCode]
    );
    const {code, setCode, stdin, setStdin, saveLabel, reset} = useCodeDraft(
        draftId,
        initialCode,
        initialStdin
    );

    const [output, setOutput] = useState('');
    const [liveLine, setLiveLine] = useState('');
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(null);
    const [exitCode, setExitCode] = useState(null);
    const [isError, setIsError] = useState(false);
    const [stage, setStage] = useState(null);
    const [split, setSplit] = useState(false);

    const wsRef = useRef(null);
    const t0Ref = useRef(0);
    const outputRef = useRef(null);

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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                language: lang,
                version,
                stdin,
                files: [{name: fileName, content: code}],
                run_timeout: runTimeout,
                run_cpu_time: runCpuTime,
                compile_timeout: 10000,
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
    }, [api, siteConfig, lang, version, stdin, fileName, code, finish, runTimeout, runCpuTime]);

    const run = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        setSplit(true);
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
                    files: [{name: fileName, content: code, encoding: 'utf8'}],
                    run_timeout: runTimeout,
                    run_cpu_time: runCpuTime,
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
    }, [interactive, runRest, api, siteConfig, lang, version, fileName, code, finish, runTimeout, runCpuTime]);

    const sendLine = useCallback(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const line = liveLine.endsWith('\n') ? liveLine : liveLine + '\n';
        ws.send(JSON.stringify({type: 'data', stream: 'stdin', data: line}));
        setOutput((prev) => prev + line);
        setLiveLine('');
    }, [liveLine]);

    const chart = splitChartOutput(output);

    const meta = [
        stage && running ? stage : null,
        elapsed != null && exitCode !== null ? `exit ${exitCode} · ${elapsed}s` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className={chrome.shell}>
            <EditorToolbar
                badge={lang}
                filename={fileName}
                saveLabel={saveLabel}
                meta={meta}
                running={running}
                onRun={run}
                onReset={reset}
            />

            <SplitPanes split={split} minHeight={height}>
                <div className={chrome.editorPane}>
                    <CodeEditor
                        value={code}
                        onChange={(next) => editable && setCode(next)}
                        lang={lang}
                        height={height}
                        readOnly={!editable}
                    />
                </div>
                {split ? (
                    <div className={chrome.side} style={{minHeight: height}}>
                        <div className={chrome.sideHead}>Output</div>
                        <pre
                            ref={outputRef}
                            className={[
                                chrome.output,
                                isError ? chrome.outputError : '',
                                !output && !running ? chrome.outputEmpty : '',
                            ].join(' ')}
                        >
                            {chart.text ||
                                (interactive
                                    ? 'Type below when the program waits for input (cin).'
                                    : 'Output appears here after you press Run.')}
                        </pre>
                        {chart.images.map((b64, i) => (
                            <img
                                key={i}
                                className={chrome.chart}
                                alt={`Chart ${i + 1}`}
                                src={`data:image/png;base64,${b64}`}
                            />
                        ))}
                        {interactive && (
                            <input
                                className={chrome.liveInput}
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
                                        ? 'Type input, then Enter'
                                        : 'Input is enabled while the program is running'
                                }
                                aria-label="Live program input"
                            />
                        )}
                    </div>
                ) : null}
            </SplitPanes>

            {stdinVisible && (
                <label className={chrome.stdinLabel}>
                    Program input (batch)
                    <textarea
                        className={chrome.stdin}
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
