import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {loadLab, saveLabStep, stepHasProgress} from './labStore';
import styles from './styles.module.css';

const MAX_IMAGES = 6;
const MAX_BYTES = 2.5 * 1024 * 1024;

export function LabStep({title, children}) {
    // Marker child — GuidedLab reads props/children; this is not rendered alone.
    return null;
}

function stepKey(child, index) {
    return child.props?.id || child.props?.title || `step-${index + 1}`;
}

function fileToRecord(file) {
    return new Promise((resolve, reject) => {
        if (!file || !String(file.type || '').startsWith('image/')) {
            reject(new Error('Not an image'));
            return;
        }
        if (file.size > MAX_BYTES) {
            reject(new Error('Image too large (max ~2.5 MB)'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            resolve({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name || 'screenshot.png',
                mime: file.type,
                dataUrl: reader.result,
            });
        };
        reader.onerror = () => reject(reader.error || new Error('Read failed'));
        reader.readAsDataURL(file);
    });
}

function StepPane({
    labId,
    stepId,
    title,
    promptNode,
    data,
    onChange,
    saveLabel,
}) {
    const fileRef = useRef(null);
    const notes = data?.notes || '';
    const images = data?.images || [];

    const addFiles = async (fileList) => {
        const files = Array.from(fileList || []);
        if (!files.length) {
            return;
        }
        const nextImages = [...images];
        for (const file of files) {
            if (nextImages.length >= MAX_IMAGES) {
                break;
            }
            try {
                const rec = await fileToRecord(file);
                nextImages.push(rec);
            } catch {
                /* skip invalid */
            }
        }
        onChange({notes, images: nextImages});
    };

    const onPaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) {
            return;
        }
        const imageItems = Array.from(items).filter((it) => it.type.startsWith('image/'));
        if (!imageItems.length) {
            return;
        }
        e.preventDefault();
        const files = imageItems.map((it) => it.getAsFile()).filter(Boolean);
        await addFiles(files);
    };

    const removeImage = (id) => {
        onChange({notes, images: images.filter((img) => img.id !== id)});
    };

    return (
        <div className={styles.slide} onPaste={onPaste}>
            {title ? <h4 className={styles.stepTitle}>{title}</h4> : null}
            {promptNode ? <div className={styles.prompt}>{promptNode}</div> : null}

            <label className={styles.sectionLabel} htmlFor={`lab-notes-${labId}-${stepId}`}>
                Your notes
            </label>
            <textarea
                id={`lab-notes-${labId}-${stepId}`}
                className={styles.notes}
                value={notes}
                rows={7}
                placeholder="Observations, answers, commands you ran…"
                onChange={(e) => onChange({notes: e.target.value, images})}
            />

            <div className={styles.shotRow}>
                <button
                    type="button"
                    className={styles.fileBtn}
                    onClick={() => fileRef.current?.click()}
                >
                    Add screenshot
                </button>
                <input
                    ref={fileRef}
                    className={styles.hiddenInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
                <p className={styles.shotHint}>
                    Or paste an image here · {images.length}/{MAX_IMAGES} · saved in this browser
                </p>
            </div>

            {images.length > 0 ? (
                <div className={styles.gallery}>
                    {images.map((img) => (
                        <div key={img.id} className={styles.shot}>
                            <img src={img.dataUrl} alt={img.name || 'Screenshot'} />
                            <button
                                type="button"
                                className={styles.removeShot}
                                aria-label="Remove screenshot"
                                onClick={() => removeImage(img.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}

            <p className={styles.status}>{saveLabel}</p>
        </div>
    );
}

/**
 * Multi-step guided lab (ExerciseSet-style tabs) with local notes + screenshots in IndexedDB.
 *
 * <GuidedLab id="unique-lab-id" title="Homework">
 *   <LabStep title="Step 1">Question text…</LabStep>
 * </GuidedLab>
 */
export default function GuidedLab({
    id,
    title = 'Guided lab',
    children,
}) {
    const items = useMemo(
        () => React.Children.toArray(children).filter((c) => React.isValidElement(c)),
        [children]
    );
    const [active, setActive] = useState(0);
    const [steps, setSteps] = useState({});
    const [ready, setReady] = useState(false);
    const [saveLabel, setSaveLabel] = useState('Answers stay on this device only.');
    const saveTimer = useRef(null);

    useEffect(() => {
        let cancelled = false;
        loadLab(id)
            .then((row) => {
                if (cancelled) {
                    return;
                }
                setSteps(row?.steps || {});
                if (row?.updatedAt) {
                    setSaveLabel('Saved in this browser. It will still be here when you come back.');
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

    const persistStep = useCallback(
        (key, data) => {
            setSteps((prev) => ({...prev, [key]: data}));
            setSaveLabel('Saving…');
            if (saveTimer.current) {
                window.clearTimeout(saveTimer.current);
            }
            saveTimer.current = window.setTimeout(() => {
                saveLabStep(id, key, data)
                    .then(() => {
                        setSaveLabel('Saved in this browser. It will still be here when you come back.');
                    })
                    .catch(() => {
                        setSaveLabel('Could not save (storage blocked or full).');
                    });
            }, 280);
        },
        [id]
    );

    useEffect(
        () => () => {
            if (saveTimer.current) {
                window.clearTimeout(saveTimer.current);
            }
        },
        []
    );

    const doneCount = items.filter((child, i) => stepHasProgress(steps[stepKey(child, i)])).length;

    if (!items.length) {
        return null;
    }

    return (
        <div className={styles.lab}>
            <div className={styles.head}>
                <span className={styles.badge}>Lab</span>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.progress}>
                    {doneCount}/{items.length} started
                </span>
            </div>

            <div className={styles.bar}>
                <div className={styles.tiles} role="tablist" aria-label="Lab steps">
                    {items.map((child, i) => {
                        const key = stepKey(child, i);
                        const done = stepHasProgress(steps[key]);
                        const label = child.props?.title || `Step ${i + 1}`;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={i === active}
                                aria-label={label}
                                title={label}
                                className={[
                                    styles.tile,
                                    i === active ? styles.tileActive : '',
                                    done ? styles.tileDone : '',
                                ].join(' ')}
                                onClick={() => setActive(i)}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
                <div className={styles.nav}>
                    <button
                        type="button"
                        className={styles.navBtn}
                        disabled={active === 0}
                        onClick={() => setActive((a) => Math.max(0, a - 1))}
                    >
                        ← Prev
                    </button>
                    <button
                        type="button"
                        className={styles.navBtn}
                        disabled={active >= items.length - 1}
                        onClick={() => setActive((a) => Math.min(items.length - 1, a + 1))}
                    >
                        Next →
                    </button>
                </div>
            </div>

            {ready
                ? items.map((child, i) => {
                      const key = stepKey(child, i);
                      const hidden = i !== active;
                      return (
                          <div
                              key={key}
                              className={hidden ? styles.slideHidden : undefined}
                              hidden={hidden}
                              role="tabpanel"
                          >
                              {!hidden ? (
                                  <StepPane
                                      labId={id}
                                      stepId={key}
                                      title={child.props?.title}
                                      promptNode={child.props?.children}
                                      data={steps[key]}
                                      onChange={(data) => persistStep(key, data)}
                                      saveLabel={saveLabel}
                                  />
                              ) : null}
                          </div>
                      );
                  })
                : (
                    <div className={styles.slide}>
                        <p className={styles.status}>Loading lab…</p>
                    </div>
                  )}
        </div>
    );
}
