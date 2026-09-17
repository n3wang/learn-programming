#!/usr/bin/env node
/**
 * Download a remote lesson image into static/img/ and print an MDX reference.
 *
 * Usage:
 *   node scripts/fetch-lesson-image.mjs <url> --dir <subdir> [--name <file>] [--alt <text>]
 *
 * Examples:
 *   node scripts/fetch-lesson-image.mjs 'https://cdn.mathpix.com/cropped/....jpg?height=531&width=680' \
 *     --dir calculus --name fig-13-1-extrema --alt 'Fig. 13-1 relative extrema'
 *
 *   npm run fetch-image -- 'https://...' --dir calculus --name fig-13-1
 *
 * Writes: static/img/<dir>/<name>.<ext>
 * Prints a <LessonFigure /> MDX snippet (compact preview + click-to-zoom modal).
 */

import {createWriteStream} from 'node:fs';
import {mkdir, access} from 'node:fs/promises';
import {dirname, extname, join, posix} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATIC_IMG = join(ROOT, 'static', 'img');

function usage(exit = 1) {
  console.error(`Usage:
  node scripts/fetch-lesson-image.mjs <url> --dir <subdir> [--name <file>] [--alt <text>] [--force]

  --dir    Folder under static/img/ (required), e.g. calculus or computational-physics
  --name   Basename without extension (default: derived from URL path)
  --alt    Markdown alt text (default: name)
  --force  Overwrite if the file already exists
`);
  process.exit(exit);
}

function parseArgs(argv) {
  const out = {url: null, dir: null, name: null, alt: null, force: false};
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--help' || a === '-h') usage(0);
    if (a === '--force') {
      out.force = true;
      continue;
    }
    if (a === '--dir' || a === '--name' || a === '--alt') {
      const val = args[++i];
      if (!val) usage();
      out[a.slice(2)] = val;
      continue;
    }
    if (a.startsWith('-')) {
      console.error(`Unknown flag: ${a}`);
      usage();
    }
    if (!out.url) out.url = a;
    else {
      console.error(`Unexpected argument: ${a}`);
      usage();
    }
  }
  if (!out.url || !out.dir) usage();
  return out;
}

function sanitizeSegment(s) {
  return String(s)
    .trim()
    .replace(/\\/g, '/')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._/-]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');
}

function basenameFromUrl(url) {
  let pathPart = url.pathname || '';
  // Mathpix cropped URLs look like /cropped/<id>.jpg — keep the id stem
  const base = pathPart.split('/').filter(Boolean).pop() || 'image';
  return base.replace(/\.[a-zA-Z0-9]+$/, '') || 'image';
}

function extFromContentType(ct) {
  if (!ct) return '';
  const mime = ct.split(';')[0].trim().toLowerCase();
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  return map[mime] || '';
}

function extFromUrl(url) {
  const e = extname(url.pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(e)) {
    return e === '.jpeg' ? '.jpg' : e;
  }
  return '';
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  let url;
  try {
    url = new URL(opts.url);
  } catch {
    console.error('Invalid URL:', opts.url);
    process.exit(1);
  }
  if (!/^https?:$/i.test(url.protocol)) {
    console.error('Only http(s) URLs are supported');
    process.exit(1);
  }

  const dir = sanitizeSegment(opts.dir);
  if (!dir) {
    console.error('--dir must be a non-empty path under static/img/');
    process.exit(1);
  }

  const nameStem = sanitizeSegment(opts.name || basenameFromUrl(url)).replace(/\//g, '-');
  if (!nameStem) {
    console.error('Could not derive a file name; pass --name');
    process.exit(1);
  }

  const res = await fetch(url.href, {
    headers: {
      // Some CDNs are picky; a normal browser Accept helps.
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'User-Agent': 'learn-programming-fetch-lesson-image/1.0',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    console.error(`Download failed: HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct && !ct.toLowerCase().startsWith('image/') && !ct.toLowerCase().includes('svg')) {
    console.error(`Refusing non-image Content-Type: ${ct}`);
    process.exit(1);
  }

  const ext = extFromContentType(ct) || extFromUrl(url) || '.jpg';
  const fileName = `${nameStem}${ext}`;
  const absPath = join(STATIC_IMG, ...dir.split('/'), fileName);
  const publicPath = posix.join('/img', dir, fileName);
  const alt = opts.alt || nameStem;

  if ((await exists(absPath)) && !opts.force) {
    console.error(`Already exists: ${absPath}`);
    console.error('Pass --force to overwrite, or choose a different --name.');
    console.log(`\nMDX:\n<LessonFigure\n  src="${publicPath}"\n  alt="${alt.replace(/"/g, '\\"')}"\n  caption="${alt.replace(/"/g, '\\"')}"\n/>\n`);
    process.exit(1);
  }

  await mkdir(dirname(absPath), {recursive: true});

  if (!res.body) {
    console.error('Empty response body');
    process.exit(1);
  }

  await pipeline(res.body, createWriteStream(absPath));

  console.log(`Saved: ${absPath}`);
  console.log(`Public: ${publicPath}`);
  console.log(`\nMDX:\n<LessonFigure\n  src="${publicPath}"\n  alt="${alt.replace(/"/g, '\\"')}"\n  caption="${alt.replace(/"/g, '\\"')}"\n/>\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
