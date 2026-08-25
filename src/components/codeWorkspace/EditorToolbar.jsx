import React from 'react';
import chrome from './chrome.module.css';

export default function EditorToolbar({
    badge,
    exam,
    filename,
    saveLabel,
    meta,
    running,
    onRun,
    onReset,
    runLabel = '▶ Run',
    runningLabel = 'Running…',
}) {
    return (
        <div className={chrome.toolbar}>
            <span className={`${chrome.badge} ${exam ? chrome.badgeExam : ''}`}>{badge}</span>
            <span className={chrome.fileTab}>{filename}</span>
            <span className={chrome.saveHint}>{saveLabel}</span>
            {meta ? <span className={chrome.meta}>{meta}</span> : null}
            <div className={chrome.actions}>
                <button type="button" className={chrome.resetBtn} onClick={onReset} disabled={running}>
                    Reset
                </button>
                <button type="button" className={chrome.runBtn} onClick={onRun} disabled={running}>
                    {running ? runningLabel : runLabel}
                </button>
            </div>
        </div>
    );
}
