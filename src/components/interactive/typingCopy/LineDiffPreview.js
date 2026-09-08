import React, {useEffect, useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import {UI_LANG_CHANGE_EVENT, readUiLang} from '@site/src/components/Translate/translateClient';

function tokenize(line, byChar) {
  const text = String(line);
  if (byChar) return Array.from(text);
  return text.replace(/\s+$/, '').match(/\s+|\S+/g) || [];
}

function diffTokens(expected, typed, byChar) {
  const a = tokenize(expected, byChar);
  const b = tokenize(typed, byChar);
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

export default function LineDiffPreview({expected, typed, byChar = false}) {
  const [hoverLang, setHoverLang] = useState(() => readUiLang());
  useEffect(() => {
    const sync = (event) => setHoverLang(event?.detail?.lang || readUiLang());
    window.addEventListener(UI_LANG_CHANGE_EVENT, sync);
    return () => window.removeEventListener(UI_LANG_CHANGE_EVENT, sync);
  }, []);
  const zh = hoverLang === 'zh-CN';
  const diff = useMemo(() => diffTokens(expected, typed, byChar), [expected, typed, byChar]);

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
        {zh ? '红色是你少打的，绿色是你多打的。' : 'Red is missing. Green is extra.'}
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
