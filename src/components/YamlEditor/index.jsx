import React, {useCallback, useMemo, useState} from 'react';
import {useLocation} from '@docusaurus/router';
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
import chrome from '@site/src/components/codeWorkspace/chrome.module.css';
import {runManifestChecks} from './manifestChecks';

/** Editable manifest/config buffer with autosave, optional checks, and reference answer. */
export default function YamlEditor({
    filename,
    starter = '',
    code,
    solution,
    hint,
    title,
    height = '280px',
    lang = 'yaml',
    storageKey,
    checks = [],
    heading,
    anchor,
}) {
    const initial = code ?? starter;
    const {pathname} = useLocation();
    const fileName = filename || defaultSourceFilename(lang);
    const hash = useMemo(
        () => (anchor || slugifyAnchor(heading) || slugifyAnchor(title) || '').replace(/^#/, ''),
        [anchor, heading, title]
    );
    const draftId = useMemo(
        () => storageKey || makeDraftId('yaml', pathname, [fileName, initial].join('\0')),
        [storageKey, pathname, fileName, initial]
    );

    const chapter = typeof document !== 'undefined'
        ? document.title.replace(/\s*[|\u2013\u2014].*$/, '').trim()
        : pathname;

    const plannedTotal = checks.length;
    const isPractice = plannedTotal > 0;

    const practiceMeta = useMemo(
        () =>
            isPractice
                ? {
                      title: title || fileName,
                      pathname,
                      chapter,
                      lang,
                      starter: initial,
                      hash,
                      plannedTotal,
                  }
                : null,
        [isPractice, title, fileName, pathname, chapter, lang, initial, hash, plannedTotal]
    );

    const {code: value, setCode, saveLabel, reset} = useCodeDraft(draftId, initial, '', practiceMeta);

    const [checking, setChecking] = useState(false);
    const [results, setResults] = useState(null);
    const [split, setSplit] = useState(false);
    const [help, setHelp] = useState(null);

    const closeHelp = useCallback(() => setHelp(null), []);

    const runCheck = useCallback(() => {
        setSplit(true);
        setChecking(true);
        setResults(null);

        const next = runManifestChecks(value, checks);
        setResults(next);
        setChecking(false);

        const passedCount = next.filter((r) => r.pass).length;
        if (plannedTotal > 0 && passedCount === plannedTotal) {
            markPracticeComplete(draftId, {
                code: value,
                title: title || fileName,
                pathname,
                chapter,
                lang,
                starter: initial,
                hash,
                plannedTotal,
            }).catch(() => {});
        }
    }, [value, checks, plannedTotal, draftId, title, fileName, pathname, chapter, lang, initial, hash]);

    const applyAnswer = useCallback(() => {
        if (solution) {
            setCode(solution);
        }
        setHelp(null);
    }, [solution, setCode]);

    const handleReset = useCallback(() => {
        reset();
        setResults(null);
        setSplit(false);
    }, [reset]);

    const passed = results?.filter((r) => r.pass).length ?? 0;
    const ran = results?.length ?? 0;
    const allPass = results && plannedTotal > 0 && passed === plannedTotal;
    const stoppedEarly = results && !allPass && ran < plannedTotal;

    const prompt = title && hint ? hint : !title ? hint : null;
    const displayTitle = title || (isPractice ? fileName : null);

    return (
        <div className={chrome.shell}>
            {(displayTitle || prompt) && (
                <div className={chrome.intro}>
                    {displayTitle ? (
                        <div className={chrome.titleRow}>
                            {isPractice ? (
                                <span className={`${chrome.badge} ${chrome.badgePractice}`}>Practice</span>
                            ) : null}
                            <h3 className={chrome.title}>{displayTitle}</h3>
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
                    ) : null}
                    {prompt ? <p className={chrome.prompt}>{prompt}</p> : null}
                </div>
            )}

            <EditorToolbar
                badge={lang}
                practice={isPractice}
                filename={fileName}
                saveLabel={saveLabel}
                running={checking}
                hideRun={!isPractice}
                onRun={isPractice ? runCheck : undefined}
                onReset={handleReset}
                runLabel="✓ Check"
                runningLabel="Checking…"
            />

            <SplitPanes split={split} minHeight={height}>
                <div className={chrome.editorPane}>
                    <CodeEditor value={value} onChange={setCode} lang={lang} height={height} />
                </div>
                {split ? (
                    <div className={chrome.side} style={{minHeight: height}}>
                        <div className={chrome.sideHead}>Checks</div>
                        {results ? (
                            <>
                                <div
                                    className={`${chrome.score} ${allPass ? chrome.scorePass : chrome.scoreFail}`}
                                >
                                    {passed}/{plannedTotal} passed
                                    {allPass
                                        ? ' — manifest looks correct'
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
                            <pre className={`${chrome.output} ${chrome.outputEmpty}`}>Running checks…</pre>
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
