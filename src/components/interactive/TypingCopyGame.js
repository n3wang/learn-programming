import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {pinyin} from 'pinyin-pro';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import {pickParagraph, sentenceUnits, wordsFromEn} from './typingCopy/corpus';
import {imageForWord} from './typingCopy/wordImageIndex';
import {WORD_GLOSS, glossWords} from './typingCopy/wordGloss';
import {UI_LANG_CHANGE_EVENT, readUiLang, translateParagraph} from '@site/src/components/Translate/translateClient';
import {drawCodeLines} from './typingCopy/pythonSolutions';
import {JAVA_SOLUTIONS} from './typingCopy/javaSolutions';
import {CPP_SOLUTIONS} from './typingCopy/cppSolutions';
import {drawFromSnippets} from './typingCopy/codeLinePool';
import {drawMathFormulas} from './typingCopy/katexFormulas';
import CodeLineTyping from './typingCopy/CodeLineTyping';
import LineDiffPreview from './typingCopy/LineDiffPreview';
import KatexLineTyping from './typingCopy/KatexLineTyping';

function memoryLevel(id, batchSize, goal) {
  return {
    id,
    title: `Level ${id}`,
    blurb: `Preview English + Chinese, then Chinese only after first key. Batches of ${batchSize}. Finish ${goal} correct words.`,
    mode: 'memory',
    batchSize,
    goal,
    previewBeforeType: true,
  };
}

function zhLevel(id, title, goal, hideChinese, batchSize) {
  const batch = hideChinese ? batchSize || Math.min(goal, 3) : 80;
  return {
    id,
    title,
    blurb: hideChinese
      ? `Type the Chinese. English stays below. Chinese hides after the first character. Batches of ${batch}. Finish ${goal} correct words.`
      : `Type the Chinese. English stays below. Chinese stays visible. One sentence at a time, up to the period. Finish ${goal} correct words.`,
    mode: 'zh',
    batchSize: batch,
    goal,
    previewBeforeType: hideChinese,
    script: 'zh',
    wholeSentence: !hideChinese,
  };
}

const LEVELS = [
  {
    id: 1,
    title: 'Level 1',
    blurb: '1 minute. Copy English docs text.',
    mode: 'timed',
    seconds: 60,
  },
  {
    id: 2,
    title: 'Level 2',
    blurb: '3 minutes. Copy English docs text. Letters, digits, spaces, . and , only.',
    mode: 'timed',
    seconds: 3 * 60,
  },
  {
    id: 3,
    title: 'Level 3',
    blurb: '5 minutes. Same rules as Level 2, longer run.',
    mode: 'timed',
    seconds: 5 * 60,
  },
  {
    id: 4,
    title: 'Level 4',
    blurb: '10 minutes. Copy English docs text.',
    mode: 'timed',
    seconds: 10 * 60,
  },
  {
    id: 5,
    title: 'Level 5',
    blurb: 'Type 10 English words.',
    mode: 'count',
    goal: 10,
  },
  {
    id: 6,
    title: 'Level 6',
    blurb: 'Type 20 English words.',
    mode: 'count',
    goal: 20,
  },
  memoryLevel(7, 2, 10),
  memoryLevel(8, 3, 20),
  memoryLevel(9, 3, 30),
  memoryLevel(10, 3, 40),
  memoryLevel(11, 4, 20),
  memoryLevel(12, 4, 40),
  memoryLevel(13, 5, 30),
  {
    id: 14,
    title: 'Level 14',
    blurb: 'Type 50 English words.',
    mode: 'count',
    goal: 50,
  },
  {
    id: 15,
    title: 'Level 15',
    blurb: 'Type 60 English words.',
    mode: 'count',
    goal: 60,
  },
  memoryLevel(16, 4, 40),
  memoryLevel(17, 5, 40),
  zhLevel(18, 'Level 18', 10, false),
  zhLevel(19, 'Level 19', 20, false),
  zhLevel(20, 'Level 20', 30, false),
  memoryLevel(21, 5, 20),
  zhLevel(22, 'Level 22', 10, true, 2),
  zhLevel(23, 'Level 23', 20, true, 2),
  zhLevel(24, 'Level 24', 10, true, 3),
  zhLevel(25, 'Level 25', 20, true, 3),
  zhLevel(26, 'Level 26', 10, true, 4),
  zhLevel(27, 'Level 27', 20, true, 4),
  zhLevel(28, 'Level 28', 20, true, 5),
  memoryLevel(29, 5, 50),
  codeLevel(30, 10, 'python', 'Python'),
  codeLevel(31, 15, 'python', 'Python'),
  codeLevel(32, 20, 'python', 'Python'),
  codeLevel(33, 25, 'python', 'Python'),
  codeLevel(34, 30, 'python', 'Python'),
  codeLevel(35, 10, 'java', 'Java'),
  codeLevel(36, 15, 'java', 'Java'),
  codeLevel(37, 20, 'java', 'Java'),
  codeLevel(38, 25, 'java', 'Java'),
  codeLevel(39, 30, 'java', 'Java'),
  codeLevel(40, 10, 'cpp', 'C++'),
  codeLevel(41, 15, 'cpp', 'C++'),
  codeLevel(42, 20, 'cpp', 'C++'),
  codeLevel(43, 25, 'cpp', 'C++'),
  codeLevel(44, 30, 'cpp', 'C++'),
  mathLevel(45, 6, 'script'),
  mathLevel(46, 10, 'script'),
  mathLevel(47, 14, 'script'),
  mathLevel(48, 5, 'render'),
  mathLevel(49, 8, 'render'),
  mathLevel(50, 12, 'render'),
];

function isAllowedChar(ch) {
  return /^[a-zA-Z0-9., ]$/.test(ch);
}

function codeLevel(id, lineCount, lang = 'python', label = 'Python') {
  return {
    id,
    title: `Level ${id}`,
    blurb: `Type ${lineCount} ${label} lines from a mixed pool of lesson snippets. Enter checks each line.`,
    mode: 'code',
    lang,
    goal: lineCount,
  };
}

function drawLangLines(lang, count) {
  if (lang === 'java') return drawFromSnippets(JAVA_SOLUTIONS, count, 'slash');
  if (lang === 'cpp') return drawFromSnippets(CPP_SOLUTIONS, count, 'slash');
  return drawCodeLines(count);
}

function mathLevel(id, count, view) {
  const fromRender = view === 'render';
  return {
    id,
    title: `Level ${id}`,
    blurb: fromRender
      ? `Type ${count} KaTeX formulas from the rendered math. Enter checks each formula.`
      : `Type ${count} KaTeX formula scripts. Enter checks each formula.`,
    mode: 'math',
    mathView: view,
    goal: count,
  };
}

function isGoalMode(mode) {
  return mode === 'memory' || mode === 'count' || mode === 'zh' || mode === 'code' || mode === 'math';
}

function showsEnglishCopy(mode) {
  return mode === 'timed' || mode === 'count';
}

const COMPLETED_KEY = 'typing-copy-completed';

function loadCompletedIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(COMPLETED_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function wordsPerMinute(correct, seconds) {
  const minutes = seconds / 60;
  if (minutes <= 0) return 0;
  return correct / minutes;
}

/** Word levels: finish the goal at 50%+ accuracy. Timed: survive the clock at 3 WPM. */
function didPassLevel(cfg, correct, skipped) {
  if (!cfg) return false;
  if (cfg.mode === 'timed') {
    return wordsPerMinute(correct, cfg.seconds || 0) >= 3;
  }
  const attempted = correct + skipped;
  if (correct < (cfg.goal || 0) || attempted === 0) return false;
  return correct / attempted >= 0.5;
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

function rememberSentence(promptSentences, seen, cursor) {
  const unit = cursor?.units?.[cursor.unitIndex];
  if (!unit) return;
  const key = `v-${cursor.visit}-u-${cursor.unitIndex}`;
  if (seen.has(key)) return;
  seen.add(key);
  promptSentences.push({
    zh: unit.zh,
    zhWords: unit.zhWords,
    en: unit.en,
    visit: cursor.visit,
    unitIndex: cursor.unitIndex,
    wordStart: null,
    wordEnd: null,
  });
}

function wordEndsSentence(word) {
  return /[.]$/.test(word);
}

/**
 * Next set of words to memorize. Stops at batchSize or at the sentence period,
 * whichever comes first. A shorter set is fine so a batch never crosses `.`.
 */
function takeBatch(batchSize, cursorRef) {
  const words = [];
  /** Consecutive words that share one English/Chinese sentence. */
  const segments = [];
  /** Only the sentence this batch is drawn from. */
  const promptSentences = [];
  const seen = new Set();

  while (words.length < batchSize) {
    const cur = cursorRef.current;
    if (!cur || cur.unitIndex >= cur.units.length) {
      fillSentenceCursor(cursorRef);
    }
    const live = cursorRef.current;
    const unit = live.units[live.unitIndex];
    if (!unit || !unit.words.length) {
      live.unitIndex += 1;
      live.wordInUnit = 0;
      continue;
    }
    const last = segments[segments.length - 1];
    const sameSentence = last && last.visit === live.visit && last.unitIndex === live.unitIndex;
    if (words.length > 0 && !sameSentence) break;

    rememberSentence(promptSentences, seen, live);
    if (!last || !sameSentence) {
      segments.push({
        zh: unit.zh,
        en: unit.en,
        visit: live.visit,
        unitIndex: live.unitIndex,
        start: words.length,
        length: 0,
        sentWordStart: live.wordInUnit,
      });
    }
    const taken = unit.words[live.wordInUnit];
    const wordPos = words.length;
    words.push(taken);
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
    if (wordEndsSentence(taken)) break;
  }
  const seg = segments[0];
  const prompt = promptSentences[0];
  if (seg && prompt && Array.isArray(prompt.zhWords)) {
    prompt.zhWords = prompt.zhWords.slice(seg.sentWordStart, seg.sentWordStart + seg.length);
    prompt.zh = prompt.zhWords.join('');
  }
  const zhTypeWords =
    prompt?.zhWords?.length === words.length ? prompt.zhWords : glossWords(words);
  return {
    words,
    zhTypeWords,
    segments,
    promptSentences,
    zh: promptSentences.map((s) => s.zh).join(''),
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

function cueWord(word) {
  return String(word || '').replace(/[.,]/g, '').trim();
}

function WordCueImage({word, nextWord}) {
  const current = imageForWord(word);
  const next = imageForWord(nextWord);
  const [hoverLang, setHoverLang] = useState(() => readUiLang());
  const [caption, setCaption] = useState('');

  useEffect(() => {
    const sync = (event) => setHoverLang(event?.detail?.lang || readUiLang());
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);

  const captionLang = hoverLang === 'es' ? 'es' : 'zh-CN';

  useEffect(() => {
    const text = cueWord(word);
    if (!text) {
      setCaption('');
      return undefined;
    }
    if (captionLang === 'zh-CN') {
      setCaption(WORD_GLOSS[text.toLowerCase()] || '');
      return undefined;
    }
    let cancelled = false;
    setCaption('');
    translateParagraph(text, 'es')
      .then((result) => {
        if (!cancelled) setCaption(result);
      })
      .catch(() => {});
    const upcoming = cueWord(nextWord);
    if (upcoming) translateParagraph(upcoming, 'es').catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [word, nextWord, captionLang]);

  useEffect(() => {
    if (!next || next === current) return undefined;
    const img = new Image();
    img.decoding = 'async';
    img.src = next;
    return undefined;
  }, [current, next]);

  if (!current && !next && !caption) return null;

  return (
    <Box
      aria-hidden={!current}
      sx={{
        flex: current ? '0 1 200px' : '0 0 0',
        width: current ? 'min(200px, 34%)' : 0,
        maxWidth: current ? '100%' : 0,
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        alignSelf: 'flex-start',
      }}
    >
      {current ? (
        <img
          src={current}
          alt=""
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            maxWidth: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'contain',
            borderRadius: 8,
          }}
        />
      ) : null}
      {caption ? (
        captionLang === 'zh-CN' ? (
          <Box
            lang="zh-CN"
            sx={{
              mt: 0.75,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <PinyinCells text={caption} isActive={false} isCurrentWord={false} />
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{m: 0, mt: 0.75, textAlign: 'center', fontWeight: 700}}
            lang="es"
          >
            {caption}
          </Typography>
        )
      ) : null}
      {next && next !== current ? (
        <img
          src={next}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            maxWidth: 'none',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </Box>
  );
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
                style={{display: 'inline-flex', alignItems: 'flex-end'}}
              >
                <PinyinCells
                  text={gloss}
                  isActive={isActive}
                  isCurrentWord={isActive && gi === activeEnWordIndex}
                />
                <span
                  aria-hidden
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minWidth: '0.7em',
                    margin: '0 1px',
                  }}
                >
                  <span style={{fontSize: '0.62rem', lineHeight: 1.05, minHeight: '0.85em'}}>{'\u00a0'}</span>
                  <span style={{fontSize: '1.05rem', lineHeight: 1.25}}>{'\u00a0'}</span>
                </span>
              </span>
            ))}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

const LEVEL_GROUPS = [
  {id: 'en', label: 'Type in English', modes: ['timed', 'count', 'memory']},
  {id: 'zh', label: 'Type in Chinese', modes: ['zh']},
  {id: 'lang', label: 'Programming languages', modes: ['code']},
  {id: 'katex', label: 'katex', modes: ['math']},
];

function LevelBoard({shownId, completedIds, onHover, onPin, onStart, wide}) {
  const shown = LEVELS.find((l) => l.id === shownId) || null;
  const boardWidth = wide ? 600 : 280;
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        width: boardWidth,
        maxWidth: '100%',
        flex: wide ? '1 1 496px' : '0 0 280px',
        alignContent: 'start',
      }}
    >
      {shown ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            height: 168,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{minWidth: 0, flex: '1 1 100px', overflow: 'hidden', marginBottom: '3rem', paddingBottom: '3rem'}}>
            <Typography sx={{fontWeight: 700, m: 0}}>{shown.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{m: 0, mt: 0.35}}>
              {shown.blurb}
            </Typography>
          </Box>
          <Button size="small" variant="contained" onClick={() => onStart(shown.id)}>
            Start
          </Button>
        </Box>
      ) : (
        <Box sx={{height: 168, boxSizing: 'border-box'}} />
      )}
      <Box sx={{display: 'grid', gap: 1.5}}>
        {LEVEL_GROUPS.map((group) => {
          const levels = LEVELS.filter(
            (l) =>
              group.modes.includes(l.mode) &&
              (!group.langs || group.langs.includes(l.lang)) &&
              (!group.views || group.views.includes(l.mathView)),
          );
          if (!levels.length) return null;
          return (
            <Box key={group.id} sx={{display: 'grid', gap: 0.75}}>
              <Typography sx={{fontWeight: 700, m: 0}}>{group.label}</Typography>
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                {levels.map((l) => {
                  const active = l.id === shownId;
                  const done = completedIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onMouseEnter={() => onHover(l.id)}
                      onMouseLeave={() => onHover(null)}
                      onFocus={() => onHover(l.id)}
                      onBlur={() => onHover(null)}
                      onClick={() => onPin(l.id)}
                      aria-label={l.title}
                      aria-pressed={active}
                      style={{
                        width: 52,
                        height: 52,
                        padding: 0,
                        borderRadius: 6,
                        border: active
                          ? '2px solid var(--ifm-color-primary)'
                          : done
                            ? '1px solid #2e7d32'
                            : '1px solid var(--ifm-color-emphasis-400)',
                        background: done ? '#c8e6c9' : 'transparent',
                        color: done ? '#1b5e20' : 'inherit',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      {l.id}
                    </button>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function TypingCopyGame() {
  const [levelId, setLevelId] = useState(null);
  const level = LEVELS.find((l) => l.id === levelId) || null;
  const [menuPinnedId, setMenuPinnedId] = useState(null);
  const [menuHoverId, setMenuHoverId] = useState(null);
  const [completedIds, setCompletedIds] = useState(loadCompletedIds);
  const [lastResult, setLastResult] = useState(null);

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [codeLines, setCodeLines] = useState([]);

  const [words, setWords] = useState([]);
  /** English tokens aligned with `words`. Used for the cue line and images. */
  const [cueWords, setCueWords] = useState([]);
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
  const [wordDiff, setWordDiff] = useState(null);

  const inputRef = useRef(null);
  const memoryCursor = useRef(null);
  const startedAt = useRef(null);
  const statsRef = useRef({correct: 0, skipped: 0});
  const codeGoalRef = useRef(0);
  const levelRef = useRef(null);
  levelRef.current = level;
  statsRef.current = {correct: correctCount, skipped: skippedCount};
  /** Swallow the Space that commits an IME candidate so it does not skip the next word. */
  const ignoreSpaceRef = useRef(false);

  const goal = level?.goal || 0;
  const useMemoryPreview = Boolean(level?.previewBeforeType);
  const typingZh = level?.script === 'zh';

  const renewTimedParagraph = useCallback(() => {
    const next = loadTimedParagraph(paraIndex);
    setParaIndex(next.paraIndex);
    setWords(next.words);
    setCueWords(next.words);
    setWordIndex(0);
    setDoneFlags(Array(next.words.length).fill(null));
    setBuffer('');
  }, [paraIndex]);

  const loadMemoryBatch = useCallback((batchSize, withPreview, script) => {
    const batch = takeBatch(batchSize, memoryCursor);
    const typed = script === 'zh' ? batch.zhTypeWords : batch.words;
    setWords(typed);
    setCueWords(batch.words);
    setSegments(batch.segments);
    setPromptSentences(batch.promptSentences);
    setWordIndex(0);
    setDoneFlags(Array(typed.length).fill(null));
    setBuffer('');
    setMistakeReveal(false);
    setMemoryPreview(Boolean(withPreview));
  }, []);

  const startLevel = (id) => {
    const cfg = LEVELS.find((l) => l.id === id);
    if (!cfg) return;
    setLevelId(id);
    setFinished(false);
    setLastResult(null);
    setRunning(true);
    setCorrectCount(0);
    setSkippedCount(0);
    setBuffer('');
    setMistakeReveal(false);
    setWordDiff(null);
    startedAt.current = Date.now();
    memoryCursor.current = null;

    if (cfg.mode === 'code' || cfg.mode === 'math') {
      setSecondsLeft(0);
      setMemoryPreview(false);
      const lines =
        cfg.mode === 'math'
          ? drawMathFormulas(cfg.goal, {commands: cfg.mathView === 'render'})
          : drawLangLines(cfg.lang, cfg.goal);
      codeGoalRef.current = lines.length;
      setCodeLines(lines);
    } else if (showsEnglishCopy(cfg.mode)) {
      setSecondsLeft(cfg.mode === 'timed' ? cfg.seconds : 0);
      setMemoryPreview(false);
      const next = loadTimedParagraph(-1);
      setParaIndex(next.paraIndex);
      setWords(next.words);
      setCueWords(next.words);
      setWordIndex(0);
      setDoneFlags(Array(next.words.length).fill(null));
    } else {
      setSecondsLeft(0);
      loadMemoryBatch(cfg.batchSize, cfg.previewBeforeType, cfg.script);
    }
  };

  useEffect(() => {
    if (!running || finished || !level || level.mode === 'code' || level.mode === 'math') return undefined;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [running, finished, levelId, level?.mode]);

  const endRun = useCallback(() => {
    const cfg = levelRef.current;
    const {correct, skipped} = statsRef.current;
    const passed = didPassLevel(
      cfg?.mode === 'code' || cfg?.mode === 'math' ? {...cfg, goal: codeGoalRef.current || cfg.goal} : cfg,
      correct,
      skipped,
    );
    const elapsed =
      cfg?.mode === 'timed'
        ? cfg.seconds || 0
        : startedAt.current
          ? Math.max(1, (Date.now() - startedAt.current) / 1000)
          : 0;
    const wpm = wordsPerMinute(correct, elapsed);
    const attempted = correct + skipped;
    setLastResult({
      passed,
      correct,
      skipped,
      accuracy: attempted ? correct / attempted : 0,
      wpm,
    });
    if (cfg) {
      const nextLevel = LEVELS.find((l) => l.id === cfg.id + 1);
      setMenuPinnedId((nextLevel || cfg).id);
    }
    if (passed && cfg) {
      setCompletedIds((prev) => {
        if (prev.includes(cfg.id)) return prev;
        const next = [...prev, cfg.id];
        try {
          window.localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage failures; the square still turns green this session.
        }
        return next;
      });
    }
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

  // Win check for word-goal levels
  useEffect(() => {
    if (!running || !level || !isGoalMode(level.mode)) return;
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
        const nextCorrect = correctCount + (okDelta || 0);
        if (showsEnglishCopy(level?.mode)) {
          if (!(level.mode === 'count' && nextCorrect >= (level.goal || 0))) {
            renewTimedParagraph();
          }
        } else if (level?.mode === 'memory' || level?.mode === 'zh') {
          if (nextCorrect < (level.goal || 0)) {
            loadMemoryBatch(level.batchSize, level.previewBeforeType, level.script);
          }
        }
        return;
      }
      setWordIndex(nextIndex);
      setBuffer('');
      setMistakeReveal(false);
      setWordDiff(null);
    },
    [words.length, level, correctCount, renewTimedParagraph, loadMemoryBatch],
  );

  const acceptZhValue = (value) => {
    const target = words[wordIndex] || '';
    if (value && value === target) {
      ignoreSpaceRef.current = true;
      const finishesBatch = wordIndex + 1 >= words.length;
      if (useMemoryPreview && memoryPreview && !finishesBatch) setMemoryPreview(false);
      setMistakeReveal(false);
      setWordDiff(null);
      const flags = [...doneFlags];
      flags[wordIndex] = 'ok';
      advanceAfterWord(flags, wordIndex + 1, 1, 0);
      return;
    }
    if (target.startsWith(value)) {
      if (useMemoryPreview && value) {
        setMemoryPreview(false);
        setMistakeReveal(false);
      }
      setWordDiff(null);
      setBuffer(value);
      return;
    }
    setWordDiff({expected: target, typed: value});
    setBuffer('');
    if (useMemoryPreview) {
      setMemoryPreview(false);
      setMistakeReveal(true);
    }
  };

  const onZhChange = (e) => {
    if (!running || finished) return;
    if (e.nativeEvent.isComposing) {
      setBuffer(e.target.value);
      return;
    }
    acceptZhValue(e.target.value);
  };

  const onKeyDown = (e) => {
    if (!running || finished) return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
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
      if (ignoreSpaceRef.current) {
        ignoreSpaceRef.current = false;
        return;
      }
      const target = words[wordIndex] || '';
      const finishesBatch = wordIndex + 1 >= words.length;
      if (buffer === target) {
        if (useMemoryPreview && memoryPreview && !finishesBatch) setMemoryPreview(false);
        setMistakeReveal(false);
        setWordDiff(null);
        const flags = [...doneFlags];
        flags[wordIndex] = 'ok';
        advanceAfterWord(flags, wordIndex + 1, 1, 0);
      } else if (buffer.length === 0) {
        if (useMemoryPreview && memoryPreview && !finishesBatch) setMemoryPreview(false);
        setMistakeReveal(false);
        setWordDiff(null);
        const flags = [...doneFlags];
        flags[wordIndex] = 'skip';
        advanceAfterWord(flags, wordIndex + 1, 0, 1);
      } else {
        setWordDiff({expected: target, typed: buffer});
        setBuffer('');
        if (useMemoryPreview) {
          setMemoryPreview(false);
          setMistakeReveal(true);
        }
      }
      return;
    }
    if (typingZh || e.key.length !== 1 || !isAllowedChar(e.key) || e.key === ' ') return;
    e.preventDefault();
    const target = words[wordIndex] || '';
    const next = buffer + e.key;
    if (target.startsWith(next)) {
      if (useMemoryPreview) {
        setMemoryPreview(false);
        setMistakeReveal(false);
      }
      setWordDiff(null);
      setBuffer(next);
    } else {
      setWordDiff({expected: target, typed: next});
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

  const levelBoard = (wide) => (
    <LevelBoard
      shownId={menuHoverId ?? menuPinnedId}
      completedIds={completedIds}
      onHover={setMenuHoverId}
      onPin={setMenuPinnedId}
      onStart={startLevel}
      wide={wide}
    />
  );

  if (!level) {
    return (
      <Box className="notranslate" translate="no" sx={{display: 'grid', gap: 2, maxWidth: 720, width: '100%'}}>
        {levelBoard(true)}
      </Box>
    );
  }

  const progressLabel =
    level.mode === 'timed'
      ? `Time ${formatTime(secondsLeft)} · Correct ${correctCount} · Skipped ${skippedCount}`
      : level.mode === 'count'
        ? `Correct ${correctCount} / ${goal} · Skipped ${skippedCount}`
        : level.mode === 'code'
          ? `Lines ${correctCount} / ${codeLines.length || goal} · Missed ${skippedCount}`
          : level.mode === 'math'
          ? `Formulas ${correctCount} / ${codeLines.length || goal} · Missed ${skippedCount}`
          : level.wholeSentence
          ? `Correct ${correctCount} / ${goal} · Skipped ${skippedCount} · Sentence`
          : `Correct ${correctCount} / ${goal} · Skipped ${skippedCount} · Batch ${level.batchSize}`;

  return (
    <Box
      className="notranslate"
      translate="no"
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        maxWidth: finished || level.mode === 'code' || level.mode === 'math' ? 980 : 640,
        width: '100%',
      }}
    >
    <Box sx={{display: 'grid', gap: 1.5, flex: '1 1 420px', minWidth: 0}}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{fontWeight: 700, m: 0}}>
          {level.title}
          {finished ? (lastResult?.passed ? ' — done' : ' — not passed') : ''}
        </Typography>
        <Button size="small" variant="text" onClick={() => startLevel(level.id)}>
          Restart
        </Button>
        <Button size="small" variant="text" onClick={() => setLevelId(null)}>
          Levels
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
        {progressLabel}
      </Typography>

      {level.mode === 'code' ? (
        <CodeLineTyping
          key={`${level.id}:${codeLines.join('\n')}`}
          lines={codeLines}
          lang={level.lang || 'python'}
          onAdvance={(ok, skip) => {
            const next = {
              correct: statsRef.current.correct + ok,
              skipped: statsRef.current.skipped + skip,
            };
            statsRef.current = next;
            if (ok) setCorrectCount(next.correct);
            if (skip) setSkippedCount(next.skipped);
          }}
          onComplete={() => endRun()}
        />
      ) : null}

      {level.mode === 'math' ? (
        <KatexLineTyping
          key={`${level.id}:${codeLines.join('\n')}`}
          formulas={codeLines}
          view={level.mathView || 'script'}
          onAdvance={(ok, skip) => {
            const next = {
              correct: statsRef.current.correct + ok,
              skipped: statsRef.current.skipped + skip,
            };
            statsRef.current = next;
            if (ok) setCorrectCount(next.correct);
            if (skip) setSkippedCount(next.skipped);
          }}
          onComplete={() => endRun()}
        />
      ) : null}

      {level.mode !== 'code' && level.mode === 'memory' ? (
        <Box sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%', minWidth: 0}}>
        <Box sx={{display: 'grid', gap: 1, flex: '1 1 280px', minWidth: 0}}>
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
                en={words.join(' ')}
                activeWordIndex={wordIndex}
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
              activeEnWordIndex={wordIndex}
            />
          </Box>
          {!memoryPreview && !mistakeReveal ? (
            <WordLane words={words} wordIndex={wordIndex} doneFlags={doneFlags} showEnglish={false} />
          ) : null}
        </Box>
        <WordCueImage word={cueWords[wordIndex] || words[wordIndex]} nextWord={cueWords[wordIndex + 1] || words[wordIndex + 1]} />
        </Box>
      ) : null}

      {level.mode === 'zh' ? (
        <Box sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%', minWidth: 0}}>
        <Box sx={{display: 'grid', gap: 1, flex: '1 1 280px', minWidth: 0}}>
          {!useMemoryPreview || memoryPreview || mistakeReveal ? (
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
                {useMemoryPreview && mistakeReveal && !memoryPreview
                  ? 'Wrong key — Chinese shown again. It hides when you type.'
                  : useMemoryPreview
                    ? '背诵中文句子'
                    : '用中文打字'}
              </Typography>
              <ChinesePrompt
                sentences={promptSentences}
                wordIndex={wordIndex}
                activeEnWordIndex={wordIndex}
              />
            </Box>
          ) : null}
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
              English
            </Typography>
            <WordLane words={cueWords} wordIndex={wordIndex} doneFlags={doneFlags} showEnglish />
          </Box>
        </Box>
        <WordCueImage word={cueWords[wordIndex]} nextWord={cueWords[wordIndex + 1]} />
        </Box>
      ) : null}

      {showsEnglishCopy(level.mode) ? (
        <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
          Full paragraph below. New paragraph loads when you finish these words.
        </Typography>
      ) : null}

      {showsEnglishCopy(level.mode) ? (
        <Box sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%', minWidth: 0}}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '1.05rem',
            lineHeight: 1.75,
            maxWidth: 420,
            flex: '1 1 280px',
            minWidth: 0,
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
        <WordCueImage word={cueWords[wordIndex] || words[wordIndex]} nextWord={cueWords[wordIndex + 1] || words[wordIndex + 1]} />
        </Box>
      ) : null}

      {level.mode === 'code' || level.mode === 'math' ? null : <Box>
        <Typography variant="caption" color="text.secondary">
          Current word
        </Typography>
        <Box
          component="input"
          ref={inputRef}
          value={buffer}
          readOnly={!typingZh}
          lang={typingZh ? 'zh-CN' : undefined}
          onChange={typingZh ? onZhChange : undefined}
          onKeyDown={onKeyDown}
          onClick={() => inputRef.current?.focus()}
          placeholder={running && !finished ? (typingZh ? 'Type the Chinese…' : 'Type here…') : 'Finished'}
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
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={!running || finished}
        />
        {wordDiff ? (
          <LineDiffPreview expected={wordDiff.expected} typed={wordDiff.typed} byChar />
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 0.75}}>
          Wrong key resets the word
          {typingZh
            ? useMemoryPreview
              ? ' and shows the Chinese again.'
              : '.'
            : ' and shows the English sentence again.'}{' '}
          Space confirms a correct word. Empty Space or Tab skips.
          {showsEnglishCopy(level.mode) ? ` Target shown: ${words[wordIndex] || '—'}` : ''}
        </Typography>
      </Box>}

      {finished ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'success.main',
            backgroundColor: 'action.hover',
          }}
        >
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontWeight: 700, m: 0}}>
              {lastResult?.passed ? 'Level complete.' : 'Not passed.'}
            </Typography>
            <Typography variant="body2" sx={{m: 0, mt: 0.5}}>
              {level.mode === 'code' ? 'Correct lines' : level.mode === 'math' ? 'Correct formulas' : 'Correct words'}: {correctCount}
              {isGoalMode(level.mode) ? ` / ${level.mode === 'code' || level.mode === 'math' ? codeLines.length || goal : goal}` : ''} · Skipped: {skippedCount} · Elapsed:{' '}
              {formatTime(
                level.mode === 'timed' ? (level.seconds || 0) - secondsLeft : elapsedSec,
              )}
              {` · ${lastResult ? lastResult.wpm.toFixed(1) : '0.0'} WPM`}
              {level.mode === 'timed'
                ? ' (need 3)'
                : ` · ${lastResult ? Math.round(lastResult.accuracy * 100) : 0}% accuracy (need 50%)`}
            </Typography>
          </Box>
          <Box sx={{display: 'flex', gap: 1, flexShrink: 0}}>
            <Button size="small" variant="text" onClick={() => setLevelId(null)}>
              Levels
            </Button>
            <Button size="small" variant="contained" onClick={() => startLevel(level.id)}>
              Restart
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
    {finished ? levelBoard(false) : null}
    </Box>
  );
}
