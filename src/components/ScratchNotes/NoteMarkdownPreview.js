import React from 'react';
import MathText from '@site/src/components/ProblemSet/MathText';
import styles from './notePreview.module.css';

/**
 * Lightweight markdown preview for scratch notes.
 * Supports headings, hr, bold, lists, paragraphs, and `$...$` / `$$...$$` math via MathText.
 */
export default function NoteMarkdownPreview({markdown}) {
  const source = typeof markdown === 'string' ? markdown : '';
  if (!source.trim()) {
    return <p className={styles.empty}>Nothing to preview.</p>;
  }

  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${i}`} className={styles.hr} />);
      i += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level}`;
      blocks.push(
        <Tag key={`h-${i}`} className={styles[`h${level}`]}>
          <InlineMarkdown text={heading[2]} />
        </Tag>,
      );
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className={styles.ul}>
          {items.map((item, idx) => (
            <li key={idx}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} className={styles.ol}>
          {items.map((item, idx) => (
            <li key={idx}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      i += 1;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) {
        i += 1;
      }
      blocks.push(
        <pre key={`pre-${i}`} className={styles.pre} data-lang={lang || undefined}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const para = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^(#{1,4})\s+/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} className={styles.p}>
        <InlineMarkdown text={para.join(' ')} />
      </p>,
    );
  }

  return <div className={styles.preview}>{blocks}</div>;
}

function InlineMarkdown({text}) {
  const raw = String(text || '');
  // Split on **bold** while preserving math for MathText.
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) {
      parts.push(
        <MathText key={`t-${key++}`} text={raw.slice(last, match.index)} />,
      );
    }
    parts.push(
      <strong key={`b-${key++}`}>
        <MathText text={match[1]} />
      </strong>,
    );
    last = re.lastIndex;
  }
  if (last < raw.length) {
    parts.push(<MathText key={`t-${key++}`} text={raw.slice(last)} />);
  }
  return <>{parts}</>;
}
