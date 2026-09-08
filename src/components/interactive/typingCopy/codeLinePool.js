function shuffle(items) {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

function stripHashComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '#') return line.slice(0, i).replace(/\s+$/, '');
  }
  return line.replace(/\s+$/, '');
}

function stripSlashComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '/' && line[i + 1] === '/') return line.slice(0, i).replace(/\s+$/, '');
  }
  return line.replace(/\s+$/, '');
}

function stripBlockComments(code) {
  let out = '';
  let quote = null;
  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i];
    if (quote) {
      out += ch;
      if (ch === '\\') {
        if (i + 1 < code.length) out += code[i + 1];
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      i = end === -1 ? code.length : end + 1;
      continue;
    }
    out += ch;
  }
  return out;
}

function prepareLines(code, commentStyle) {
  const source = commentStyle === 'slash' ? stripBlockComments(code) : String(code || '');
  const strip = commentStyle === 'slash' ? stripSlashComment : stripHashComment;
  return source
    .split('\n')
    .map(strip)
    .filter((line) => line.trim());
}

function isDecorator(line) {
  return /^\s*@/.test(line);
}

function blocksFromSnippet(code, commentStyle) {
  const lines = prepareLines(code, commentStyle);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (/^[ \t]/.test(lines[i])) {
      i += 1;
      continue;
    }
    const block = [lines[i]];
    i += 1;
    while (i < lines.length) {
      const line = lines[i];
      if (/^[ \t]/.test(line)) {
        block.push(line);
        i += 1;
        continue;
      }
      if (
        commentStyle !== 'slash' &&
        block.every(isDecorator) &&
        /^(async\s+def|def|class)\b/.test(line.trim())
      ) {
        block.push(line);
        i += 1;
        continue;
      }
      break;
    }
    if (!/^[ \t]/.test(block[0])) blocks.push(block);
  }
  return blocks;
}

/** Never starts on an indented line, and never splits a block. */
export function drawFromSnippets(snippets, count, commentStyle) {
  const want = Math.max(1, count || 1);
  const unused = shuffle(
    (snippets || []).flatMap((snippet) => blocksFromSnippet(snippet.code, commentStyle)),
  );
  if (!unused.length) return [];
  const drawn = [];
  while (drawn.length < want && unused.length) {
    const need = want - drawn.length;
    let idx = unused.findIndex((block) => block.length <= need);
    if (idx === -1) idx = 0;
    drawn.push(...unused[idx]);
    unused.splice(idx, 1);
  }
  return drawn;
}
