import React, {useEffect, useMemo, useState} from 'react';
import {CODE_PROGRESS_EVENT, listDrafts, slugifyAnchor} from '@site/src/components/codeWorkspace/drafts';
import styles from './styles.module.css';

export function Exercise({children}) {
    return <div className={styles.pane}>{children}</div>;
}

function itemAnchor(child) {
    const title = child.props?.title || '';
    return (child.props?.anchor || slugifyAnchor(child.props?.heading) || slugifyAnchor(title)).replace(/^#/, '');
}

export default function ExerciseSet({children}) {
    const items = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);
    const [active, setActive] = useState(0);
    const [done, setDone] = useState({});
    const anchors = items.map(itemAnchor).join('|');

    useEffect(() => {
        const applyHash = () => {
            const raw = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '');
            if (!raw) {
                return;
            }
            const idx = items.findIndex((child) => itemAnchor(child) === decodeURIComponent(raw));
            if (idx >= 0) {
                setActive(idx);
            }
        };
        applyHash();
        window.addEventListener('hashchange', applyHash);
        return () => window.removeEventListener('hashchange', applyHash);
    }, [anchors, items]);

    useEffect(() => {
        const raw = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '');
        if (!raw) {
            return undefined;
        }
        const id = decodeURIComponent(raw);
        const t = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({block: 'start'});
        }, 50);
        return () => window.clearTimeout(t);
    }, [active]);

    useEffect(() => {
        let cancelled = false;
        const refresh = () => {
            listDrafts()
                .then((rows) => {
                    if (cancelled) {
                        return;
                    }
                    const next = {};
                    (rows || []).forEach((row) => {
                        if (row.kind === 'exam' && row.completed && row.title) {
                            next[row.title] = true;
                        }
                    });
                    setDone(next);
                })
                .catch(() => {});
        };
        refresh();
        window.addEventListener(CODE_PROGRESS_EVENT, refresh);
        return () => {
            cancelled = true;
            window.removeEventListener(CODE_PROGRESS_EVENT, refresh);
        };
    }, []);

    return (
        <div className={styles.set}>
            <div className={styles.bar}>
                <div className={styles.tiles} role="tablist" aria-label="Exercises">
                    {items.map((child, i) => {
                        const title = child.props?.title || `Exercise ${i + 1}`;
                        const completed = Boolean(done[title]);
                        return (
                            <button
                                key={title + i}
                                type="button"
                                role="tab"
                                aria-selected={i === active}
                                aria-label={title}
                                className={[
                                    styles.tile,
                                    i === active ? styles.tileActive : '',
                                    completed ? styles.tileDone : '',
                                ].join(' ')}
                                onClick={() => setActive(i)}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
            {items.map((child, i) => (
                <div
                    key={i}
                    id={itemAnchor(child) || undefined}
                    className={i === active ? styles.slide : styles.slideHidden}
                    hidden={i !== active}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
