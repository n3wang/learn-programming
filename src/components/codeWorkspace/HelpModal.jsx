import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Highlight, themes} from 'prism-react-renderer';
import useHtmlColorMode from '@site/src/components/codeWorkspace/useHtmlColorMode';
import styles from './HelpModal.module.css';

function toPrismLang(lang) {
    const raw = String(lang || '').trim().toLowerCase();
    if (!raw) {
        return 'python';
    }
    if (raw === 'c++' || raw === 'cpp' || raw === 'cc' || raw === 'cxx') {
        return 'cpp';
    }
    if (raw === 'c#' || raw === 'csharp' || raw === 'cs') {
        return 'csharp';
    }
    if (raw === 'js' || raw === 'javascript' || raw === 'jsx') {
        return 'javascript';
    }
    if (raw === 'ts' || raw === 'typescript' || raw === 'tsx') {
        return 'typescript';
    }
    if (raw === 'godot' || raw === 'gdscript' || raw === 'gd') {
        return 'python';
    }
    if (raw === 'py' || raw === 'python3') {
        return 'python';
    }
    return raw;
}

function CopyIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M6 2a2 2 0 0 0-2 2v1H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm6 8h-1V6a2 2 0 0 0-2-2H6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1zM3 6h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
            />
        </svg>
    );
}

/**
 * Minimal overlay: click backdrop or press Escape to close.
 * Portaled to document.body so parent stacking contexts cannot punch through.
 */
export default function HelpModal({
    open,
    title,
    children,
    code = false,
    lang = 'python',
    onClose,
}) {
    const panelRef = useRef(null);
    const colorMode = useHtmlColorMode();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) {
            setCopied(false);
            return undefined;
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    const source = typeof children === 'string' ? children : '';
    const prismLang = toPrismLang(lang);

    const onCopy = useCallback(async () => {
        if (!source) {
            return;
        }
        try {
            await navigator.clipboard.writeText(source);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            // Fallback for older browsers / denied permission.
            try {
                const ta = document.createElement('textarea');
                ta.value = source;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
            } catch {
                /* ignore */
            }
        }
    }, [source]);

    if (!open || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            className={styles.backdrop}
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div
                ref={panelRef}
                className={code ? `${styles.panel} ${styles.panelCode}` : styles.panel}
                role="dialog"
                aria-modal="true"
                aria-label={title || 'Help'}
            >
                <div className={styles.head}>
                    <span className={styles.title}>{title}</span>
                    <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className={styles.body}>
                    {typeof children === 'string' && code ? (
                        <div className={styles.codeWrap}>
                            <button
                                type="button"
                                className={styles.copy}
                                onClick={onCopy}
                                aria-label={copied ? 'Copied' : 'Copy solution'}
                                title={copied ? 'Copied' : 'Copy'}
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </button>
                            <Highlight
                                theme={colorMode === 'dark' ? themes.vsDark : themes.github}
                                code={source.replace(/\n$/, '')}
                                language={prismLang}
                            >
                                {({className, style, tokens, getLineProps, getTokenProps}) => (
                                    <pre
                                        className={[className, styles.code, 'notranslate']
                                            .filter(Boolean)
                                            .join(' ')}
                                        style={style}
                                        translate="no"
                                    >
                                        {tokens.map((line, i) => (
                                            <div key={i} {...getLineProps({line})}>
                                                {line.map((token, key) => (
                                                    <span key={key} {...getTokenProps({token})} />
                                                ))}
                                            </div>
                                        ))}
                                    </pre>
                                )}
                            </Highlight>
                        </div>
                    ) : typeof children === 'string' ? (
                        <p className={styles.prose}>{children}</p>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
