import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import styles from './HelpModal.module.css';

/**
 * Minimal overlay: click backdrop or press Escape to close.
 * Portaled to document.body so parent stacking contexts cannot punch through.
 */
export default function HelpModal({open, title, children, code = false, onClose}) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) {
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
                className={styles.panel}
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
                        <pre className={styles.code}>{children}</pre>
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
