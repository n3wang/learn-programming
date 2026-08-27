import {useCallback, useEffect, useRef, useState} from 'react';
import {
    deleteDraft,
    loadDraft,
    notifyCodeProgress,
    registerPractice,
    saveDraft,
} from './drafts';

const SAVE_MS = 400;

/**
 * @param {string} id
 * @param {string} starter
 * @param {string} [initialStdin]
 * @param {object|null} [practiceMeta]  When set, drafts count as practice progress only after code changes.
 */
export default function useCodeDraft(id, starter, initialStdin = '', practiceMeta = null) {
    const [code, setCode] = useState(starter);
    const [stdin, setStdin] = useState(initialStdin);
    const [ready, setReady] = useState(false);
    const [saveLabel, setSaveLabel] = useState('Autosave');
    const skipSave = useRef(true);
    const timer = useRef(null);
    const starterRef = useRef(starter);
    const stdinRef = useRef(initialStdin);
    const practiceMetaRef = useRef(practiceMeta);
    starterRef.current = starter;
    stdinRef.current = initialStdin;
    practiceMetaRef.current = practiceMeta;

    useEffect(() => {
        let cancelled = false;
        if (!id) {
            setReady(true);
            return undefined;
        }
        loadDraft(id)
            .then((row) => {
                if (cancelled || !row) {
                    return;
                }
                if (typeof row.code === 'string') {
                    setCode(row.code);
                }
                if (typeof row.stdin === 'string') {
                    setStdin(row.stdin);
                }
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) {
                    setReady(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const persist = useCallback(
        (nextCode, nextStdin, immediate) => {
            if (!id) {
                return;
            }
            const write = async () => {
                setSaveLabel('Saving…');
                const starterNow = starterRef.current;
                const meta = practiceMetaRef.current;
                const modified = nextCode !== starterNow;

                try {
                    if (meta) {
                        // Practice exercises: only record after the student edits (or keep an existing row).
                        if (!modified) {
                            const existing = await loadDraft(id);
                            if (existing && !existing.completed && !existing.bookmarked) {
                                await deleteDraft(id);
                                setSaveLabel('Cleared');
                                return;
                            }
                            if (!existing) {
                                setSaveLabel('Autosave');
                                return;
                            }
                            // Keep completed / bookmarked rows; store starter code again.
                            await saveDraft(id, {
                                code: nextCode,
                                stdin: nextStdin,
                                modified: false,
                                starter: starterNow,
                            });
                            notifyCodeProgress();
                            setSaveLabel('Saved');
                            return;
                        }

                        await registerPractice(id, {
                            ...meta,
                            starter: starterNow,
                            code: nextCode,
                            stdin: nextStdin,
                            modified: true,
                        });
                        notifyCodeProgress();
                        setSaveLabel('Saved');
                        return;
                    }

                    // Non-practice drafts (e.g. PistonRunner demos): save as before.
                    await saveDraft(id, {
                        code: nextCode,
                        stdin: nextStdin,
                        modified,
                        starter: starterNow,
                    });
                    setSaveLabel('Saved');
                } catch {
                    setSaveLabel('Save failed');
                }
            };
            if (timer.current) {
                clearTimeout(timer.current);
            }
            if (immediate) {
                write();
            } else {
                timer.current = setTimeout(write, SAVE_MS);
            }
        },
        [id]
    );

    useEffect(() => {
        if (!ready) {
            return undefined;
        }
        if (skipSave.current) {
            skipSave.current = false;
            return undefined;
        }
        persist(code, stdin, false);
        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, [code, stdin, ready, persist]);

    const reset = useCallback(() => {
        setCode(starterRef.current);
        setStdin(stdinRef.current);
        persist(starterRef.current, stdinRef.current, true);
    }, [persist]);

    return {code, setCode, stdin, setStdin, ready, saveLabel, reset};
}
