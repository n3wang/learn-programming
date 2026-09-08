import React, {useEffect, useMemo, useRef, useState} from 'react';
import katex from 'katex';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import {UI_LANG_CHANGE_EVENT, readUiLang} from '@site/src/components/Translate/translateClient';
import {docsForTex, sameTex} from './katexFormulas';
import LineDiffPreview from './LineDiffPreview';

function renderTex(tex, displayMode) {
  try {
    return katex.renderToString(String(tex || ''), {throwOnError: false, displayMode});
  } catch {
    return '';
  }
}

export default function KatexLineTyping({formulas, view = 'script', onAdvance, onComplete}) {
  const items = useMemo(() => (Array.isArray(formulas) ? formulas : []), [formulas]);
  const [index, setIndex] = useState(0);
  const [buffer, setBuffer] = useState('');
  const [wrong, setWrong] = useState(false);
  const [solutionHidden, setSolutionHidden] = useState(false);
  const busy = useRef(false);
  const inputRef = useRef(null);
  const [hoverLang, setHoverLang] = useState(() => readUiLang());
  useEffect(() => {
    const sync = (event) => setHoverLang(event?.detail?.lang || readUiLang());
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);
  const zh = hoverLang === 'zh-CN';
  const expected = items[index] ?? '';
  const docs = docsForTex(expected, zh ? 'zh' : 'en');
  const rendered = useMemo(() => renderTex(expected, true), [expected]);
  const typedRender = useMemo(() => (buffer.trim() ? renderTex(buffer, true) : ''), [buffer]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  const submit = () => {
    if (busy.current || index >= items.length) return;
    busy.current = true;
    queueMicrotask(() => {
      busy.current = false;
    });
    if (sameTex(buffer, expected)) {
      const next = index + 1;
      setWrong(false);
      setBuffer('');
      setSolutionHidden(false);
      setIndex(next);
      onAdvance?.(1, 0);
      if (next >= items.length) onComplete?.();
      return;
    }
    setWrong(true);
    onAdvance?.(0, 1);
  };

  return (
    <Box sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%', minWidth: 0}}>
      <Box sx={{display: 'grid', gap: 1, flex: '1 1 320px', minWidth: 0}}>
        <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
          {view === 'half'
            ? zh
              ? `看渲染和脚本。一开始写，脚本就藏起来。${Math.min(index + 1, items.length)} / ${items.length}。回车检查整条。`
              : `See the render and the script. The script hides when you start typing. ${Math.min(index + 1, items.length)} / ${items.length}. Enter checks the whole formula.`
            : view === 'render'
            ? zh
              ? `看渲染出的公式，打出 KaTeX。${Math.min(index + 1, items.length)} / ${items.length}。回车检查整条。`
              : `Look at the rendered formula and type the KaTeX. ${Math.min(index + 1, items.length)} / ${items.length}. Enter checks the whole formula.`
            : zh
              ? `照着公式脚本打。${Math.min(index + 1, items.length)} / ${items.length}。回车检查整条。`
              : `Type the formula script. ${Math.min(index + 1, items.length)} / ${items.length}. Enter checks the whole formula.`}
        </Typography>

        {view === 'render' || view === 'half' ? (
          <Box
            sx={{
              p: 2,
              minHeight: 72,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflowX: 'auto',
            }}
            dangerouslySetInnerHTML={{__html: rendered}}
          />
        ) : null}
        {view === 'script' || (view === 'half' && !solutionHidden) ? (
          <pre
            translate="no"
            style={{
              margin: 0,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid var(--ifm-color-emphasis-300)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {expected}
          </pre>
        ) : null}

        <Box
          component="input"
          ref={inputRef}
          value={buffer}
          onChange={(e) => {
            const next = e.target.value;
            setBuffer(next);
            if (view === 'half' && next.length > 0) setSolutionHidden(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={zh ? '在这里输入 KaTeX…' : 'Type the KaTeX…'}
          aria-label="KaTeX input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          sx={{
            display: 'block',
            width: '100%',
            p: 1.25,
            fontSize: '1.05rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.paper',
            color: 'text.primary',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {buffer.trim() ? (
          <Box
            sx={{px: 1, overflowX: 'auto', opacity: 0.9}}
            dangerouslySetInnerHTML={{__html: typedRender}}
          />
        ) : null}

        {wrong ? (
          <LineDiffPreview expected={expected} typed={buffer} byChar />
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
        <Typography sx={{fontWeight: 700, m: 0}}>{zh ? '命令' : 'Command'}</Typography>
        {view === 'half' && solutionHidden ? (
          <Typography variant="body2" color="text.secondary" sx={{m: 0}}>
            {zh ? '脚本已藏起。对照渲染打完这一条。' : 'Script hidden. Finish this one from the render.'}
          </Typography>
        ) : docs.length ? (
          docs.slice(0, 4).map((item) => (
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
            {zh ? '这一条主要是数字和字母。' : 'Mostly letters and numbers on this one.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
