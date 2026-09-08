import React, {useEffect, useMemo, useRef, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import CodeEditor from '@site/src/components/CodeEditor';
import {UI_LANG_CHANGE_EVENT, readUiLang} from '@site/src/components/Translate/translateClient';
import {imageForWord} from './wordImageIndex';
import {docsForLine} from './pythonKeywordDocs';

function linesOf(code) {
  return String(code || '').replace(/\s+$/, '').split('\n');
}

function sameLine(typed, expected) {
  return String(typed).replace(/\s+$/, '') === String(expected).replace(/\s+$/, '');
}

function tokenize(line) {
  return String(line).replace(/\s+$/, '').match(/\s+|\S+/g) || [];
}

function diffTokens(expected, typed) {
  const a = tokenize(expected);
  const b = tokenize(typed);
  const n = a.length;
  const m = b.length;
  const dp = Array.from({length: n + 1}, () => new Uint16Array(m + 1));
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const expParts = [];
  const typedParts = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      expParts.push({type: 'eq', text: a[i - 1]});
      typedParts.push({type: 'eq', text: b[j - 1]});
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      typedParts.push({type: 'ins', text: b[j - 1]});
      j -= 1;
    } else {
      expParts.push({type: 'del', text: a[i - 1]});
      i -= 1;
    }
  }
  expParts.reverse();
  typedParts.reverse();
  return {expected: expParts, typed: typedParts};
}

function LineDiffPreview({expected, typed, zh}) {
  const diff = useMemo(() => diffTokens(expected, typed), [expected, typed]);
  return (
    <Box
      translate="no"
      sx={{
        display: 'grid',
        gap: 0.5,
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.88rem',
        lineHeight: 1.55,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{m: 0}}>
        {zh ? '红色是你少打的，绿色是你多打的。' : 'Red is missing from your line. Green is extra in yours.'}
      </Typography>
      <div style={{display: 'flex', gap: 8, whiteSpace: 'pre'}}>
        <span style={{color: '#8f1d1d'}}>-</span>
        <DiffLine parts={diff.expected} kind="del" />
      </div>
      <div style={{display: 'flex', gap: 8, whiteSpace: 'pre'}}>
        <span style={{color: '#145c14'}}>+</span>
        <DiffLine parts={diff.typed} kind="ins" />
      </div>
    </Box>
  );
}

function DiffLine({parts, kind}) {
  const mark = kind === 'del' ? 'del' : 'ins';
  return (
    <span style={{whiteSpace: 'pre', minHeight: '1.4em'}}>
      {parts.length
        ? parts.map((part, i) => (
            <span
              key={i}
              style={
                part.type === mark
                  ? {
                      background: kind === 'del' ? '#ffd6d6' : '#d8f5d2',
                      color: kind === 'del' ? '#8f1d1d' : '#145c14',
                      borderRadius: 3,
                    }
                  : undefined
              }
            >
              {part.text}
            </span>
          ))
        : '\u00a0'}
    </span>
  );
}

export default function CodeLineTyping({lines: lineSource, onAdvance, onComplete}) {
  const lines = useMemo(() => (Array.isArray(lineSource) ? lineSource : linesOf(lineSource)), [lineSource]);
  const [index, setIndex] = useState(0);
  const [buffer, setBuffer] = useState('');
  const [wrong, setWrong] = useState(false);
  const busy = useRef(false);
  const [hoverLang, setHoverLang] = useState(() => readUiLang());
  useEffect(() => {
    const sync = (event) => setHoverLang(event?.detail?.lang || readUiLang());
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);
  const docLang = hoverLang === 'zh-CN' ? 'zh' : 'en';
  const expected = lines[index] ?? '';
  const docs = docsForLine(expected, docLang);
  const imageWord = docs.map((item) => item.token).find((token) => imageForWord(token)) || '';
  const image = imageWord ? imageForWord(imageWord) : '';

  const submit = () => {
    if (busy.current || index >= lines.length) return;
    busy.current = true;
    queueMicrotask(() => {
      busy.current = false;
    });
    if (sameLine(buffer, expected)) {
      const next = index + 1;
      setWrong(false);
      setBuffer('');
      setIndex(next);
      onAdvance?.(1, 0);
      if (next >= lines.length) onComplete?.();
      return;
    }
    setWrong(true);
    onAdvance?.(0, 1);
  };

  return (
    <Box sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%', minWidth: 0}}>
      <Box sx={{display: 'grid', gap: 1, flex: '1 1 320px', minWidth: 0}}>
        <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
          Python · line {Math.min(index + 1, lines.length)} / {lines.length}. Type the highlighted line, then Enter checks the whole line
          {expected === '' && index < lines.length ? ' (this line is blank).' : '.'}
        </Typography>
        <pre
          translate="no"
          style={{
            margin: 0,
            padding: '12px 14px',
            borderRadius: 8,
            border: '1px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-surface-color, #f6f8fa)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.92rem',
            lineHeight: 1.55,
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}
        >
          {lines.slice(0, Math.min(index + 1, lines.length)).map((line, i) => (
            <div
              key={i}
              style={{
                opacity: i < index ? 0.45 : 1,
                fontWeight: i === index ? 700 : 400,
                outline: i === index ? '1px solid var(--ifm-color-primary)' : 'none',
                outlineOffset: 2,
              }}
            >
              {line === '' ? '\u00a0' : line}
            </div>
          ))}
        </pre>
        {index < lines.length ? (
          <CodeEditor value={buffer} onChange={setBuffer} lang="python" height="88px" onEnter={submit} copyAlign />
        ) : (
          <Typography sx={{m: 0, fontWeight: 700}}>Snippet complete.</Typography>
        )}
        {wrong ? (
          <LineDiffPreview expected={expected} typed={buffer} zh={docLang === 'zh'} />
        ) : null}
      </Box>
      <Box
        sx={{
          width: 240,
          flex: '0 0 240px',
          display: 'grid',
          gap: 1,
          alignContent: 'start',
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            style={{width: '100%', height: 120, objectFit: 'contain', borderRadius: 8}}
          />
        ) : null}
        <Typography sx={{fontWeight: 700, m: 0}}>{docLang === 'zh' ? '关键字' : 'Keyword'}</Typography>
        {docs.length ? (
          docs.slice(0, 5).map((item) => (
            <Box key={item.token}>
              <Typography sx={{fontWeight: 700, m: 0, fontFamily: 'ui-monospace, monospace'}}>
                {item.token}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{m: 0, mt: 0.35}}>
                {item.doc}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
            {docLang === 'zh' ? '这一行没有关键字。' : 'No keyword on this line.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
