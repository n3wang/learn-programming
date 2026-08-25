import {useCallback, useEffect, useRef, useState} from 'react';
import {loadDraft, saveDraft} from './drafts';

const SAVE_MS = 400;

export default function useCodeDraft(id, starter, initialStdin = '') {
    const [code, setCode] = useState(starter);
    const [stdin, setStdin] = useState(initialStdin);
    const [ready, setReady] = useState(false);
    const [saveLabel, setSaveLabel] = useState('Autosave');
    const skipSave = useRef(true);
    const timer = useRef(null);
    const starterRef = useRef(starter);
    const stdinRef = useRef(initialStdin);
    starterRef.current = starter;
    stdinRef.current = initialStdin;

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
            const write = () => {
                setSaveLabel('Saving…');
                saveDraft(id, {code: nextCode, stdin: nextStdin})
                    .then(() => setSaveLabel('Saved'))
                    .catch(() => setSaveLabel('Save failed'));
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
