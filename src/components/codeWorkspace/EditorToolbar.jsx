import React from 'react';
import chrome from './chrome.module.css';

export default function EditorToolbar({
    badge,
    practice,
    exam, // deprecated alias
    filename,
    saveLabel,
    meta,
    running,
    onRun,
    onReset,
    runLabel = '▶ Run',
    runningLabel = 'Running…',
    hideRun = false,
    children,
}) {
    const isPractice = practice || exam;
    return (
        <div className={chrome.toolbar}>
            <span className={`${chrome.badge} ${isPractice ? chrome.badgePractice : ''}`}>{badge}</span>
            <span className={chrome.fileTab}>{filename}</span>
            <span className={chrome.saveHint}>{saveLabel}</span>
            {meta ? <span className={chrome.meta}>{meta}</span> : null}
            <div className={chrome.actions}>
                {children}
                <button type="button" className={chrome.resetBtn} onClick={onReset} disabled={running}>
                    Reset
                </button>
                {!hideRun && onRun ? (
                    <button type="button" className={chrome.runBtn} onClick={onRun} disabled={running}>
                        {running ? runningLabel : runLabel}
                    </button>
                ) : null}
            </div>
        </div>
    );
}
