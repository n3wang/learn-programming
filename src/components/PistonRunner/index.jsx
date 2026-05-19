import React, { useRef, useState, useCallback } from 'react';
import styles from './styles.module.css';

/**
 * PistonRunner — inline code execution widget for Docusaurus lesson pages.
 *
 * Props:
 *   lang      {string}  Piston language name, e.g. "python", "javascript"
 *   version   {string}  Semver-ish version constraint, default "*" (latest)
 *   code      {string}  Initial code shown in the editor
 *   editable  {bool}    Whether the student can edit the code, default true
 *   height    {string}  Editor height (CSS), default "200px"
 *   api       {string}  Override the Piston API base URL
 */
const PISTON_API =
    process.env.PISTON_API_URL ||
    (typeof window !== 'undefined' && window.__PISTON_API_URL__) ||
    'https://YOUR_PISTON_SERVER';

export default function PistonRunner({
    lang = 'python',
    version = '*',
    code: initialCode = '',
    editable = true,
    height = '200px',
    api = PISTON_API,
}) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(null);
    const [exitCode, setExitCode] = useState(null);

    const handleTab = useCallback((e) => {
        if (e.key !== 'Tab') return;
        e.preventDefault();
        const el = e.target;
        const s = el.selectionStart;
        const newCode = code.slice(0, s) + '    ' + code.slice(el.selectionEnd);
        setCode(newCode);
        // Restore cursor after React re-render
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = s + 4;
        });
    }, [code]);

    const run = useCallback(async () => {
        setRunning(true);
        setOutput(null);
        setElapsed(null);
        setExitCode(null);

        const t0 = Date.now();
        try {
            const res = await fetch(`${api.replace(/\/$/, '')}/api/v2/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: lang,
                    version,
                    files: [{ content: code }],
                }),
            });

            const secs = ((Date.now() - t0) / 1000).toFixed(2);
            setElapsed(secs);

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setOutput({ text: 'API error: ' + (err.message || res.statusText), isError: true });
                return;
            }

            const data = await res.json();
            const run = data.run || {};
            const compile = data.compile || {};

            let text = '';
            if (compile.stderr) text += compile.stderr + '\n';
            if (compile.stdout) text += compile.stdout + '\n';
            text += run.stdout || '';
            if (run.stderr) text += (run.stdout ? '\n' : '') + run.stderr;

            setExitCode(run.code ?? null);
            setOutput({
                text: text.trimEnd() || '(no output)',
                isEmpty: !text.trim(),
                isError: !!run.stderr && !run.stdout,
            });
        } catch (e) {
            setOutput({ text: 'Could not reach Piston: ' + e.message, isError: true });
        } finally {
            setRunning(false);
        }
    }, [api, lang, version, code]);

    return (
        <div className={styles.runner}>
            <div className={styles.toolbar}>
                <span className={styles.badge}>{lang}</span>
                {elapsed && exitCode !== null && (
                    <span className={styles.meta}>exit {exitCode} · {elapsed}s</span>
                )}
                <button
                    className={styles.runBtn}
                    onClick={run}
                    disabled={running}
                >
                    {running ? 'Running…' : '▶ Run'}
                </button>
            </div>

            <textarea
                className={styles.editor}
                style={{ height }}
                value={code}
                onChange={e => editable && setCode(e.target.value)}
                onKeyDown={handleTab}
                readOnly={!editable}
                spellCheck={false}
            />

            {output !== null && (
                <pre
                    className={[
                        styles.output,
                        output.isError ? styles.outputError : '',
                        output.isEmpty ? styles.outputEmpty : '',
                    ].join(' ')}
                >
                    {output.text}
                </pre>
            )}
        </div>
    );
}
