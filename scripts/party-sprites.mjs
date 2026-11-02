#!/usr/bin/env node
/**
 * Slice party-game sprite sheets into the single images the games load.
 *
 * Reads assets/party/sprites.json: each sprite names a source sheet, a crop
 * rectangle [x, y, width, height] and an output path. Each "set" instead names
 * a folder of single images (one per character, say): every file in it is
 * resized to `size` px and written to `out` with {name} = the file's name. Each crop is written to
 * static/img/party/<out>, the folder src/components/party/core/Sprite.js reads
 * from — so a game that already asks for that path (with an emoji placeholder
 * until the file exists) shows the real art after one run, with no code change.
 *
 * Usage:
 *   npm run party-sprites                 # slice everything
 *   npm run party-sprites -- --sheet coup-roles
 *   npm run party-sprites -- --check      # list missing or stale exports only
 *
 * Needs ImageMagick 7 (`magick` on PATH).
 */

import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, dirname, extname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets', 'party');
const OUT_ROOT = join(ROOT, 'static', 'img', 'party');

function parseArgs(argv) {
  const out = {sheet: null, check: false};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--sheet') out.sheet = argv[++i];
    else if (argv[i] === '--check') out.check = true;
    else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node scripts/party-sprites.mjs [--sheet <id>] [--check]');
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(1);
    }
  }
  return out;
}

function validRect(rect) {
  return Array.isArray(rect) && rect.length === 4 && rect.every((n) => Number.isInteger(n) && n >= 0) && rect[2] > 0 && rect[3] > 0;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(readFileSync(join(ASSETS, 'sprites.json'), 'utf8'));
  // Expand each set into one whole-image sprite per file.
  const fromSets = Object.entries(manifest.sets || {}).flatMap(([id, set]) =>
    readdirSync(join(ASSETS, set.dir))
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort()
      .map((f) => ({sheet: id, file: join(set.dir, f), size: set.size, name: basename(f, extname(f)), out: set.out.replace('{name}', basename(f, extname(f)))})),
  );
  const sprites = [...manifest.sprites, ...fromSets].filter((s) => !args.sheet || s.sheet === args.sheet);
  if (!sprites.length) {
    console.error(args.sheet ? `No sprites for sheet "${args.sheet}".` : 'No sprites in the manifest.');
    process.exit(1);
  }

  let made = 0;
  let stale = 0;
  for (const sprite of sprites) {
    const sheet = sprite.file ? {file: sprite.file} : manifest.sheets[sprite.sheet];
    if (!sheet) throw new Error(`${sprite.out}: unknown sheet "${sprite.sheet}"`);
    if (!sprite.file && !validRect(sprite.rect)) throw new Error(`${sprite.out}: rect must be [x, y, width, height] in whole pixels`);
    const src = join(ASSETS, sheet.file);
    const out = join(OUT_ROOT, sprite.out);
    if (!existsSync(src)) throw new Error(`${sprite.out}: sheet file missing: ${sheet.file}`);

    // Up to date when the export is newer than both its sheet and the manifest.
    const upToDate =
      existsSync(out) &&
      statSync(out).mtimeMs >= statSync(src).mtimeMs &&
      statSync(out).mtimeMs >= statSync(join(ASSETS, 'sprites.json')).mtimeMs;
    if (args.check) {
      if (!upToDate) {
        stale += 1;
        console.log(`${existsSync(out) ? 'stale  ' : 'missing'} ${sprite.out}`);
      }
      continue;
    }

    mkdirSync(dirname(out), {recursive: true});
    if (sprite.file) {
      const size = sprite.size || 256;
      execFileSync('magick', [src, '-resize', `${size}x${size}`, '-strip', '-quality', '88', out]);
      made += 1;
      console.log(`✓ ${sprite.out}  (${sprite.name}, ${size}px)`);
      continue;
    }
    const [x, y, w, h] = sprite.rect;
    execFileSync('magick', [src, '-crop', `${w}x${h}+${x}+${y}`, '+repage', '-strip', '-quality', '88', out]);
    made += 1;
    console.log(`✓ ${sprite.out}  (${sprite.name || sprite.sheet}, ${w}×${h})`);
  }

  if (args.check) {
    console.log(stale ? `${stale} sprite(s) need \`npm run party-sprites\`.` : 'All sprites are up to date.');
    process.exit(stale ? 1 : 0);
  }
  console.log(`Exported ${made} sprite(s) to static/img/party/.`);
}

main();
