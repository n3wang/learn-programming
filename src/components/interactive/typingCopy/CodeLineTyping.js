import React, {useEffect, useMemo, useRef, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import CodeEditor from '@site/src/components/CodeEditor';
import {UI_LANG_CHANGE_EVENT, readUiLang} from '@site/src/components/Translate/translateClient';
import {imageForWord} from './wordImageIndex';
import LineDiffPreview from './LineDiffPreview';
import {docsForLine as pythonDocsForLine} from './pythonKeywordDocs';
import {docsForLine as javaDocsForLine} from './javaKeywordDocs';
import {docsForLine as cppDocsForLine} from './cppKeywordDocs';

const CODE_LANG = {
  python: {label: 'Python', editor: 'python', docs: pythonDocsForLine},
  java: {label: 'Java', editor: 'java', docs: javaDocsForLine},
  cpp: {label: 'C++', editor: 'c++', docs: cppDocsForLine},
};

function linesOf(code) {
  return String(code || '').replace(/\s+$/, '').split('\n');
}

function sameLine(typed, expected) {
  return String(typed).replace(/\s+$/, '') === String(expected).replace(/\s+$/, '');
}

export default function CodeLineTyping({lines: lineSource, lang = 'python', onAdvance, onComplete}) {
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
  const codeLang = CODE_LANG[lang] || CODE_LANG.python;
  const expected = lines[index] ?? '';
  const docs = codeLang.docs(expected, docLang);
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
          {codeLang.label} · line {Math.min(index + 1, lines.length)} / {lines.length}. Type the highlighted line, then Enter checks the whole line
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
          <CodeEditor value={buffer} onChange={setBuffer} lang={codeLang.editor} height="88px" onEnter={submit} copyAlign />
        ) : (
          <Typography sx={{m: 0, fontWeight: 700}}>Snippet complete.</Typography>
        )}
        {wrong ? (
          <LineDiffPreview expected={expected} typed={buffer} />
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
