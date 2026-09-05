import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import {pickParagraph, wordsFromEn} from './typingCopy/corpus';

const LEVELS = [
  {
    id: 1,
    title: 'Level 1',
    blurb: '3 minutes. Copy English docs text. Letters, digits, spaces, . and , only.',
    mode: 'timed',
    seconds: 3 * 60,
  },
  {
    id: 2,
    title: 'Level 2',
    blurb: '5 minutes. Same rules as Level 1, longer run.',
    mode: 'timed',
    seconds: 5 * 60,
  },
  {
    id: 3,
    title: 'Level 3',
    blurb:
      'Preview English + Chinese, then Chinese only after first key. Batches of 5. Finish 40 correct words.',
    mode: 'memory',
    batchSize: 5,
    goal: 40,
    previewBeforeType: true,
  },
  {
    id: 4,
    title: 'Level 4',
    blurb:
      'Preview English + Chinese, then Chinese only after first key. Batches of 7. Finish 80 correct words.',
    mode: 'memory',
    batchSize: 7,
    goal: 80,
    previewBeforeType: true,
  },
  {
    id: 5,
    title: 'Level 5',
    blurb:
      'Preview English + Chinese, then Chinese only after first key. Batches of 10. Finish 100 correct words.',
    mode: 'memory',
    batchSize: 10,
    goal: 100,
    previewBeforeType: true,
  },
];

function isAllowedChar(ch) {
  return /^[a-zA-Z0-9., ]$/.test(ch);
}

function formatTime(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function loadTimedParagraph(prevIndex = -1) {
  const row = pickParagraph(prevIndex);
  return {
    paraIndex: row.index,
    en: row.en,
    zh: row.zh,
    words: wordsFromEn(row.en),
  };
}

/** Pull the next batch of English words, renewing paragraphs as needed. */
function takeBatch(batchSize, cursorRef) {
  const words = [];
  const zhSeen = [];
  while (words.length < batchSize) {
    if (!cursorRef.current || cursorRef.current.wordIndex >= cursorRef.current.words.length) {
      const row = pickParagraph(cursorRef.current?.paraIndex ?? -1);
      cursorRef.current = {
        paraIndex: row.index,
        words: wordsFromEn(row.en),
        zh: row.zh,
        en: row.en,
        wordIndex: 0,
      };
    }
    const cur = cursorRef.current;
    if (cur.zh && (zhSeen.length === 0 || zhSeen[zhSeen.length - 1] !== cur.zh)) {
      zhSeen.push(cur.zh);
    }
    while (words.length < batchSize && cur.wordIndex < cur.words.length) {
      words.push(cur.words[cur.wordIndex]);
      cur.wordIndex += 1;
    }
  }
  return {
    words,
    zh: zhSeen.join(' '),
    en: words.join(' '),
  };
}

function WordLane({words, wordIndex, doneFlags, showEnglish}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        lineHeight: 1.85,
        fontSize: '1.05rem',
        fontFamily: showEnglish
          ? 'inherit'
          : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        minHeight: 88,
        maxWidth: 420,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        userSelect: 'none',
      }}
    >
      {words.map((w, i) => {
        let color = 'var(--ifm-color-emphasis-600)';
        let weight = 400;
        let label = '•'.repeat(Math.min(w.length, 12));
        if (showEnglish) {
          label = w;
          color = 'inherit';
          if (doneFlags[i] === 'ok') {
            color = '#2e7d32';
            weight = 700;
          } else if (doneFlags[i] === 'skip') {
            color = 'var(--ifm-color-emphasis-500)';
          } else if (i === wordIndex) {
            color = 'var(--ifm-color-primary)';
            weight = 700;
          }
        } else if (doneFlags[i] === 'ok') {
          color = '#2e7d32';
          weight = 700;
          label = w;
        } else if (doneFlags[i] === 'skip') {
          color = 'var(--ifm-color-emphasis-500)';
          label = w;
        } else if (i === wordIndex) {
          color = 'var(--ifm-color-primary)';
          weight = 700;
          label = '▸' + '•'.repeat(Math.min(w.length, 10));
        }
        return (
          <span key={`${i}-${w}`} style={{color, fontWeight: weight, marginRight: '0.45em'}}>
            {label}
          </span>
        );
      })}
    </Box>
  );
}

export default function TypingCopyGame() {
  const [levelId, setLevelId] = useState(null);
  const level = LEVELS.find((l) => l.id === levelId) || null;

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  const [words, setWords] = useState([]);
  const [zhPrompt, setZhPrompt] = useState('');
  const [enParagraph, setEnParagraph] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [doneFlags, setDoneFlags] = useState([]);
  const [buffer, setBuffer] = useState('');
  const [paraIndex, setParaIndex] = useState(-1);
  /** Levels 3–5: show English until the first typed letter of a batch. */
  const [memoryPreview, setMemoryPreview] = useState(true);

  const inputRef = useRef(null);
  const memoryCursor = useRef(null);
  const startedAt = useRef(null);

  const goal = level?.goal || 0;
  const useMemoryPreview = Boolean(level?.previewBeforeType);

  const renewTimedParagraph = useCallback(() => {
    const next = loadTimedParagraph(paraIndex);
    setParaIndex(next.paraIndex);
    setEnParagraph(next.en);
    setZhPrompt(next.zh);
    setWords(next.words);
    setWordIndex(0);
    setDoneFlags(Array(next.words.length).fill(null));
    setBuffer('');
  }, [paraIndex]);

  const loadMemoryBatch = useCallback((batchSize, withPreview) => {
    const batch = takeBatch(batchSize, memoryCursor);
    setWords(batch.words);
    setZhPrompt(batch.zh);
    setEnParagraph(batch.en);
    setWordIndex(0);
    setDoneFlags(Array(batch.words.length).fill(null));
    setBuffer('');
    setMemoryPreview(Boolean(withPreview));
  }, []);

  const startLevel = (id) => {
    const cfg = LEVELS.find((l) => l.id === id);
    if (!cfg) return;
    setLevelId(id);
    setFinished(false);
    setRunning(true);
    setCorrectCount(0);
    setSkippedCount(0);
    setBuffer('');
    startedAt.current = Date.now();
    memoryCursor.current = null;

    if (cfg.mode === 'timed') {
      setSecondsLeft(cfg.seconds);
      setMemoryPreview(false);
      const next = loadTimedParagraph(-1);
      setParaIndex(next.paraIndex);
      setEnParagraph(next.en);
      setZhPrompt(next.zh);
      setWords(next.words);
      setWordIndex(0);
      setDoneFlags(Array(next.words.length).fill(null));
    } else {
      setSecondsLeft(0);
      loadMemoryBatch(cfg.batchSize, cfg.previewBeforeType);
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const endRun = useCallback(() => {
    setRunning(false);
    setFinished(true);
  }, []);

  // Timer for timed levels
  useEffect(() => {
    if (!running || !level || level.mode !== 'timed') return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          endRun();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, level, endRun]);

  // Win check for memory levels
  useEffect(() => {
    if (!running || !level || level.mode !== 'memory') return;
    if (correctCount >= level.goal) {
      endRun();
    }
  }, [correctCount, running, level, endRun]);

  const advanceAfterWord = useCallback(
    (flags, nextIndex, okDelta, skipDelta) => {
      setDoneFlags(flags);
      if (skipDelta) setSkippedCount((c) => c + skipDelta);

      const finishBatch = nextIndex >= words.length;

      if (okDelta) {
        setCorrectCount((c) => {
          const next = c + okDelta;
          if (finishBatch && level?.mode === 'memory' && next < (level.goal || 0)) {
            queueMicrotask(() => loadMemoryBatch(level.batchSize, level.previewBeforeType));
          }
          return next;
        });
      } else if (finishBatch && level?.mode === 'memory') {
        setCorrectCount((c) => {
          if (c < (level.goal || 0)) {
            queueMicrotask(() => loadMemoryBatch(level.batchSize, level.previewBeforeType));
          }
          return c;
        });
      }

      if (finishBatch) {
        if (level?.mode === 'timed') {
          renewTimedParagraph();
        }
        return;
      }
      setWordIndex(nextIndex);
      setBuffer('');
    },
    [words.length, level, renewTimedParagraph, loadMemoryBatch],
  );

  const onKeyDown = (e) => {
    if (!running || finished) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      if (useMemoryPreview && memoryPreview) setMemoryPreview(false);
      const flags = [...doneFlags];
      flags[wordIndex] = 'skip';
      advanceAfterWord(flags, wordIndex + 1, 0, 1);
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      setBuffer((b) => b.slice(0, -1));
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (useMemoryPreview && memoryPreview && buffer.length > 0) {
        setMemoryPreview(false);
      }
      const target = words[wordIndex] || '';
      if (buffer === target) {
        if (useMemoryPreview && memoryPreview) setMemoryPreview(false);
        const flags = [...doneFlags];
        flags[wordIndex] = 'ok';
        advanceAfterWord(flags, wordIndex + 1, 1, 0);
      } else if (buffer.length === 0) {
        if (useMemoryPreview && memoryPreview) setMemoryPreview(false);
        const flags = [...doneFlags];
        flags[wordIndex] = 'skip';
        advanceAfterWord(flags, wordIndex + 1, 0, 1);
      } else {
        setBuffer('');
      }
      return;
    }
    if (e.key.length !== 1 || !isAllowedChar(e.key) || e.key === ' ') return;
    e.preventDefault();
    if (useMemoryPreview && memoryPreview) {
      setMemoryPreview(false);
    }
    const target = words[wordIndex] || '';
    const next = buffer + e.key;
    if (target.startsWith(next)) {
      setBuffer(next);
    } else {
      setBuffer('');
    }
  };

  const elapsedSec = useMemo(() => {
    if (!startedAt.current) return 0;
    if (level?.mode === 'timed') {
      return (level.seconds || 0) - secondsLeft;
    }
    return Math.floor((Date.now() - startedAt.current) / 1000);
  }, [secondsLeft, level, finished, correctCount]);

  if (!level) {
    return (
      <Box className="notranslate" translate="no" sx={{display: 'grid', gap: 2, maxWidth: 420}}>
        <Typography variant="h2" sx={{fontSize: '1.35rem', m: 0}}>
          Typing copy game
        </Typography>
        <Typography color="text.secondary" sx={{m: 0}}>
          Copy documentation-style English. Wrong key resets the current word. Space after a correct
          word advances. Empty Space or Tab skips a word. Completed words turn green.
        </Typography>
        <Box sx={{display: 'grid', gap: 1.25}}>
          {LEVELS.map((l) => (
            <Box
              key={l.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{minWidth: 0, flex: '1 1 220px'}}>
                <Typography sx={{fontWeight: 700, m: 0}}>{l.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{m: 0, mt: 0.35}}>
                  {l.blurb}
                </Typography>
              </Box>
              <Button size="small" variant="contained" onClick={() => startLevel(l.id)}>
                Start
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  const progressLabel =
    level.mode === 'timed'
      ? `Time ${formatTime(secondsLeft)} · Correct ${correctCount} · Skipped ${skippedCount}`
      : `Correct ${correctCount} / ${goal} · Skipped ${skippedCount} · Batch ${level.batchSize}`;

  return (
    <Box
      className="notranslate"
      translate="no"
      sx={{display: 'grid', gap: 1.5, maxWidth: 420, width: '100%'}}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{fontWeight: 700, m: 0}}>
          {level.title}
          {finished ? (level.mode === 'memory' && correctCount >= goal ? ' — done' : ' — time up') : ''}
        </Typography>
        <Box sx={{display: 'flex', gap: 0.75}}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setLevelId(null);
              setRunning(false);
              setFinished(false);
            }}
          >
            Levels
          </Button>
          <Button size="small" variant="contained" onClick={() => startLevel(level.id)}>
            Restart
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
        {progressLabel}
      </Typography>

      {level.mode === 'memory' ? (
        <Box sx={{display: 'grid', gap: 1}}>
          {useMemoryPreview && memoryPreview ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: 420,
                whiteSpace: 'normal',
                lineHeight: 1.75,
                fontSize: '1.05rem',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.5}}>
                Read the English, then start typing — English hides after the first letter
              </Typography>
              <WordLane
                words={words}
                wordIndex={wordIndex}
                doneFlags={doneFlags}
                showEnglish
              />
            </Box>
          ) : null}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              backgroundColor: 'background.paper',
              maxWidth: 420,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.5}}>
              {memoryPreview
                ? 'Chinese meaning'
                : 'Chinese only — type the English from memory'}
            </Typography>
            <Typography sx={{m: 0, fontSize: '1.05rem', lineHeight: 1.6}}>{zhPrompt}</Typography>
          </Box>
          {!memoryPreview ? (
            <WordLane words={words} wordIndex={wordIndex} doneFlags={doneFlags} showEnglish={false} />
          ) : null}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
          Full paragraph below. New paragraph loads when you finish these words.
        </Typography>
      )}

      {level.mode === 'timed' ? (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '1.05rem',
            lineHeight: 1.75,
            maxWidth: 420,
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'normal',
          }}
        >
          {words.map((w, i) => {
            const flag = doneFlags[i];
            let color = 'inherit';
            if (flag === 'ok') color = '#2e7d32';
            else if (flag === 'skip') color = 'var(--ifm-color-emphasis-500)';
            else if (i === wordIndex) color = 'var(--ifm-color-primary)';
            return (
              <span
                key={`p-${i}-${w}`}
                style={{
                  color,
                  fontWeight: i === wordIndex || flag === 'ok' ? 700 : 400,
                  marginRight: '0.35em',
                  display: 'inline',
                }}
              >
                {w}
              </span>
            );
          })}
        </Box>
      ) : null}

      <Box>
        <Typography variant="caption" color="text.secondary">
          Current word
        </Typography>
        <Box
          component="input"
          ref={inputRef}
          value={buffer}
          readOnly
          onKeyDown={onKeyDown}
          onClick={() => inputRef.current?.focus()}
          placeholder={running && !finished ? 'Type here…' : 'Finished'}
          sx={{
            display: 'block',
            width: '100%',
            mt: 0.5,
            p: 1.25,
            fontSize: '1.25rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.paper',
            color: 'text.primary',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          aria-label="Typing input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={!running || finished}
        />
        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 0.75}}>
          Wrong key resets the word. Space confirms a correct word. Empty Space or Tab skips.
          {level.mode === 'timed' ? ` Target shown: ${words[wordIndex] || '—'}` : ''}
        </Typography>
      </Box>

      {finished ? (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'success.main',
            backgroundColor: 'action.hover',
          }}
        >
          <Typography sx={{fontWeight: 700, m: 0}}>
            {level.mode === 'memory' && correctCount >= goal
              ? 'Level complete.'
              : 'Run finished.'}
          </Typography>
          <Typography variant="body2" sx={{m: 0, mt: 0.5}}>
            Correct words: {correctCount}
            {level.mode === 'memory' ? ` / ${goal}` : ''} · Skipped: {skippedCount} · Elapsed:{' '}
            {formatTime(
              level.mode === 'timed' ? (level.seconds || 0) - secondsLeft : elapsedSec,
            )}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
