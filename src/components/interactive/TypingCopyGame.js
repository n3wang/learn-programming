import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {pinyin} from 'pinyin-pro';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import {pickParagraph, sentenceUnits, wordsFromEn} from './typingCopy/corpus';

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

function fillSentenceCursor(cursorRef) {
  const row = pickParagraph(cursorRef.current?.paraIndex ?? -1);
  cursorRef.current = {
    paraIndex: row.index,
    visit: (cursorRef.current?.visit || 0) + 1,
    units: sentenceUnits(row.en),
    unitIndex: 0,
    wordInUnit: 0,
  };
}

function rememberParagraph(promptSentences, seen, cursor) {
  if (!cursor?.units?.length) return;
  const key = `v-${cursor.visit}`;
  if (seen.has(key)) return;
  seen.add(key);
  cursor.units.forEach((unit, unitIndex) => {
    promptSentences.push({
      zh: unit.zh,
      zhWords: unit.zhWords,
      en: unit.en,
      visit: cursor.visit,
      unitIndex,
      wordStart: null,
      wordEnd: null,
    });
  });
}

/** Pull the next batch of English words, renewing paragraphs as needed. */
function takeBatch(batchSize, cursorRef) {
  const words = [];
  /** Consecutive words that share one English/Chinese sentence. */
  const segments = [];
  /** Full Chinese of every paragraph touched, including sentences not in this batch. */
  const promptSentences = [];
  const seen = new Set();
  if (cursorRef.current) rememberParagraph(promptSentences, seen, cursorRef.current);

  while (words.length < batchSize) {
    const cur = cursorRef.current;
    if (!cur || cur.unitIndex >= cur.units.length) {
      fillSentenceCursor(cursorRef);
      rememberParagraph(promptSentences, seen, cursorRef.current);
    }
    const live = cursorRef.current;
    const unit = live.units[live.unitIndex];
    if (!unit || !unit.words.length) {
      live.unitIndex += 1;
      live.wordInUnit = 0;
      continue;
    }
    const last = segments[segments.length - 1];
    if (!last || last.zh !== unit.zh || last.en !== unit.en) {
      segments.push({
        zh: unit.zh,
        en: unit.en,
        start: words.length,
        length: 0,
        sentWordStart: live.wordInUnit,
      });
    }
    const wordPos = words.length;
    words.push(unit.words[live.wordInUnit]);
    segments[segments.length - 1].length += 1;
    const prompt = promptSentences.find(
      (s) => s.visit === live.visit && s.unitIndex === live.unitIndex,
    );
    if (prompt) {
      if (prompt.wordStart == null) prompt.wordStart = wordPos;
      prompt.wordEnd = wordPos + 1;
    }
    live.wordInUnit += 1;
    if (live.wordInUnit >= unit.words.length) {
      live.unitIndex += 1;
      live.wordInUnit = 0;
    }
  }
  return {
    words,
    segments,
    promptSentences,
    zh: promptSentences.map((s) => s.zh).join(''),
    en: words.join(' '),
  };
}

function segmentAt(segments, wordIndex) {
  return (
    segments.find((s) => wordIndex >= s.start && wordIndex < s.start + s.length) || null
  );
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

function activeSentenceWordIndex(segment, wordIndex) {
  if (!segment) return -1;
  return segment.sentWordStart + (wordIndex - segment.start);
}

function EnglishSentenceReveal({en, activeWordIndex}) {
  const parts = wordsFromEn(en);
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
        minHeight: 88,
        maxWidth: 420,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        userSelect: 'none',
      }}
    >
      {parts.map((w, i) => (
        <span
          key={`${i}-${w}`}
          style={{
            color: i === activeWordIndex ? 'var(--ifm-color-primary)' : 'inherit',
            fontWeight: i === activeWordIndex ? 700 : 400,
            marginRight: '0.45em',
          }}
        >
          {w}
        </span>
      ))}
    </Box>
  );
}

function annotateZh(text) {
  const source = String(text || '');
  try {
    const rows = pinyin(source, {toneType: 'symbol', type: 'all'});
    if (Array.isArray(rows) && rows.length) {
      return rows.map((row) => ({
        ch: row.origin,
        py: row.isZh ? row.pinyin : '',
      }));
    }
  } catch {
    // Fall through and show the characters without readings.
  }
  return Array.from(source).map((ch) => ({ch, py: ''}));
}

function PinyinCells({text, isActive, isCurrentWord}) {
  const color = isCurrentWord ? '#9a3412' : isActive ? 'var(--ifm-color-primary)' : 'inherit';
  const backgroundColor = isCurrentWord
    ? 'color-mix(in srgb, #ea580c 28%, transparent)'
    : isActive
      ? 'color-mix(in srgb, var(--ifm-color-primary) 16%, transparent)'
      : 'transparent';
  const pyColor = isCurrentWord
    ? '#9a3412'
    : isActive
      ? 'var(--ifm-color-primary)'
      : 'var(--ifm-color-emphasis-600)';
  return annotateZh(text).map((cell, ci) => (
    <span
      key={`${ci}-${cell.ch}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        margin: '0 1px',
        minWidth: cell.py ? '1.45em' : '0.45em',
        padding: '1px 1px',
        borderRadius: 4,
        color,
        backgroundColor,
        fontWeight: isActive ? 700 : 400,
      }}
    >
      <span
        style={{
          fontSize: '0.62rem',
          lineHeight: 1.05,
          fontWeight: 500,
          minHeight: '0.85em',
          whiteSpace: 'nowrap',
          color: cell.py ? pyColor : 'transparent',
          userSelect: 'none',
        }}
      >
        {cell.py || '\u00a0'}
      </span>
      <span style={{fontSize: '1.05rem', lineHeight: 1.25}}>{cell.ch}</span>
    </span>
  ));
}

function ChinesePrompt({sentences, wordIndex, activeEnWordIndex}) {
  return (
    <Box
      sx={{
        m: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        rowGap: '0.35rem',
      }}
    >
      {sentences.map((seg, i) => {
        const isActive =
          seg.wordStart != null && wordIndex >= seg.wordStart && wordIndex < seg.wordEnd;
        const prev = sentences[i - 1];
        const newParagraph = prev && prev.visit !== seg.visit;
        const glosses = Array.isArray(seg.zhWords) && seg.zhWords.length ? seg.zhWords : [seg.zh];
        return (
          <React.Fragment key={`${seg.visit}-${seg.unitIndex}`}>
            {newParagraph ? <span style={{width: '0.6em'}} /> : null}
            {glosses.map((gloss, gi) => (
              <span
                key={`${seg.visit}-${seg.unitIndex}-${gi}`}
                style={{display: 'inline-flex', alignItems: 'flex-end', marginRight: '0.2em'}}
              >
                <PinyinCells
                  text={gloss}
                  isActive={isActive}
                  isCurrentWord={isActive && gi === activeEnWordIndex}
                />
              </span>
            ))}
          </React.Fragment>
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
  const [segments, setSegments] = useState([]);
  const [promptSentences, setPromptSentences] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [doneFlags, setDoneFlags] = useState([]);
  const [buffer, setBuffer] = useState('');
  const [paraIndex, setParaIndex] = useState(-1);
  /** Levels 3–5: show English until the first typed letter of a batch. */
  const [memoryPreview, setMemoryPreview] = useState(true);
  /** After a wrong key, show the current English sentence until typing resumes. */
  const [mistakeReveal, setMistakeReveal] = useState(false);

  const inputRef = useRef(null);
  const memoryCursor = useRef(null);
  const startedAt = useRef(null);

  const goal = level?.goal || 0;
  const useMemoryPreview = Boolean(level?.previewBeforeType);

  const renewTimedParagraph = useCallback(() => {
    const next = loadTimedParagraph(paraIndex);
    setParaIndex(next.paraIndex);
    setWords(next.words);
    setWordIndex(0);
    setDoneFlags(Array(next.words.length).fill(null));
    setBuffer('');
  }, [paraIndex]);

  const loadMemoryBatch = useCallback((batchSize, withPreview) => {
    const batch = takeBatch(batchSize, memoryCursor);
    setWords(batch.words);
    setSegments(batch.segments);
    setPromptSentences(batch.promptSentences);
    setWordIndex(0);
    setDoneFlags(Array(batch.words.length).fill(null));
    setBuffer('');
    setMistakeReveal(false);
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
    setMistakeReveal(false);
    startedAt.current = Date.now();
    memoryCursor.current = null;

    if (cfg.mode === 'timed') {
      setSecondsLeft(cfg.seconds);
      setMemoryPreview(false);
      const next = loadTimedParagraph(-1);
      setParaIndex(next.paraIndex);
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

      if (okDelta) setCorrectCount((c) => c + okDelta);

      if (finishBatch) {
        if (level?.mode === 'timed') {
          renewTimedParagraph();
        } else if (level?.mode === 'memory') {
          const nextCorrect = correctCount + (okDelta || 0);
          if (nextCorrect < (level.goal || 0)) {
            loadMemoryBatch(level.batchSize, level.previewBeforeType);
          }
        }
        return;
      }
      setWordIndex(nextIndex);
      setBuffer('');
      setMistakeReveal(false);
    },
    [words.length, level, correctCount, renewTimedParagraph, loadMemoryBatch],
  );

  const onKeyDown = (e) => {
    if (!running || finished) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      const finishesBatch = wordIndex + 1 >= words.length;
      if (useMemoryPreview && memoryPreview && !finishesBatch) setMemoryPreview(false);
      setMistakeReveal(false);
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
      const target = words[wordIndex] || '';
      const finishesBatch = wordIndex + 1 >= words.length;
      if (buffer === target) {
        if (useMemoryPreview && memoryPreview && !finishesBatch) setMemoryPreview(false);
        setMistakeReveal(false);
        const flags = [...doneFlags];
        flags[wordIndex] = 'ok';
        advanceAfterWord(flags, wordIndex + 1, 1, 0);
      } else if (buffer.length === 0) {
        if (useMemoryPreview && memoryPreview && !finishesBatch) setMemoryPreview(false);
        setMistakeReveal(false);
        const flags = [...doneFlags];
        flags[wordIndex] = 'skip';
        advanceAfterWord(flags, wordIndex + 1, 0, 1);
      } else {
        setBuffer('');
        if (useMemoryPreview) {
          setMemoryPreview(false);
          setMistakeReveal(true);
        }
      }
      return;
    }
    if (e.key.length !== 1 || !isAllowedChar(e.key) || e.key === ' ') return;
    e.preventDefault();
    const target = words[wordIndex] || '';
    const next = buffer + e.key;
    if (target.startsWith(next)) {
      if (useMemoryPreview) {
        setMemoryPreview(false);
        setMistakeReveal(false);
      }
      setBuffer(next);
    } else {
      setBuffer('');
      if (useMemoryPreview) {
        setMemoryPreview(false);
        setMistakeReveal(true);
      }
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
          {useMemoryPreview && mistakeReveal && !memoryPreview ? (
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
                Wrong key — English sentence shown again. It hides when you type.
              </Typography>
              <EnglishSentenceReveal
                en={segmentAt(segments, wordIndex)?.en || words[wordIndex] || ''}
                activeWordIndex={activeSentenceWordIndex(segmentAt(segments, wordIndex), wordIndex)}
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
            <ChinesePrompt
              sentences={promptSentences}
              wordIndex={wordIndex}
              activeEnWordIndex={activeSentenceWordIndex(segmentAt(segments, wordIndex), wordIndex)}
            />
          </Box>
          {!memoryPreview && !mistakeReveal ? (
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
          Wrong key resets the word and shows the English sentence again. Space confirms a correct word. Empty Space or Tab skips.
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
