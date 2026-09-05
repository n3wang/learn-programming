import React from 'react';
import katex from 'katex';

function renderSegment(expr, displayMode) {
  try {
    return katex.renderToString(expr, {throwOnError: false, displayMode});
  } catch {
    return expr;
  }
}

const MATH_RE = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;

/**
 * Renders plain text with inline `$...$` / display `$$...$$` KaTeX math mixed in.
 * Used for problem prompts and explanations, which are plain JS strings (not
 * markdown), so remark-math never sees them.
 */
export default function MathText({text}) {
  if (!text) return null;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  MATH_RE.lastIndex = 0;
  while ((match = MATH_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const isDisplay = match[1] !== undefined;
    const expr = (isDisplay ? match[1] : match[2]).trim();
    const Tag = isDisplay ? 'div' : 'span';
    parts.push(
      <Tag
        key={key++}
        dangerouslySetInnerHTML={{__html: renderSegment(expr, isDisplay)}}
      />,
    );
    lastIndex = MATH_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}
