#!/usr/bin/env node
/**
 * Download a Wikimedia Commons file into static/img/party/<name>.<ext>
 * and print credit + source for the JSON image block.
 *
 *   node scripts/fetch-party-commons.mjs 'File:RMS_Titanic_3.jpg' --name hist-titanic
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destDir = path.join(root, 'static/img/party');

const args = process.argv.slice(2);
const fileArg = args.find((a) => !a.startsWith('--'));
const nameIdx = args.indexOf('--name');
const name = nameIdx >= 0 ? args[nameIdx + 1] : null;
if (!fileArg || !name) {
  console.error('Usage: node scripts/fetch-party-commons.mjs File:Foo.jpg --name slug');
  process.exit(1);
}

const title = fileArg.startsWith('File:') ? fileArg : `File:${fileArg}`;
const api = new URL('https://commons.wikimedia.org/w/api.php');
api.searchParams.set('action', 'query');
api.searchParams.set('titles', title);
api.searchParams.set('prop', 'imageinfo');
api.searchParams.set('iiprop', 'url|mime|extmetadata|size');
api.searchParams.set('iiurlwidth', '1280');
api.searchParams.set('format', 'json');

const headers = {
  'User-Agent': 'learn-programming-party-images/1.0 (https://learn.l0l.in; classroom quiz)',
};

const res = await fetch(api, {headers});
if (!res.ok) {
  console.error('API', res.status, await res.text());
  process.exit(1);
}
const json = await res.json();
const page = Object.values(json.query.pages)[0];
const info = page && page.imageinfo && page.imageinfo[0];
if (!info) {
  console.error('No imageinfo for', title, JSON.stringify(page));
  process.exit(1);
}

const artist = String((info.extmetadata.Artist && info.extmetadata.Artist.value) || '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const license = String((info.extmetadata.LicenseShortName && info.extmetadata.LicenseShortName.value) || '')
  .replace(/<[^>]+>/g, '')
  .trim();
const credit = [artist || 'Unknown', license || 'see source'].filter(Boolean).join(', ');
const source = `https://commons.wikimedia.org/wiki/${encodeURI(title.replace(/ /g, '_'))}`;
const url = info.thumburl || info.url;
const extFrom = (url.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
const ext = extFrom === 'jpeg' ? 'jpg' : extFrom === 'svg' || extFrom === 'gif' || extFrom === 'png' || extFrom === 'webp' ? extFrom : 'jpg';
const dest = path.join(destDir, `${name}.${ext === 'svg' ? 'png' : ext === 'gif' ? 'jpg' : ext}`);

const img = await fetch(url, {headers});
if (!img.ok) {
  console.error('Download', img.status, url);
  process.exit(1);
}
const buf = Buffer.from(await img.arrayBuffer());
fs.mkdirSync(destDir, {recursive: true});

if (ext === 'svg' || ext === 'gif') {
  const tmp = path.join(destDir, `${name}.tmp.${ext}`);
  fs.writeFileSync(tmp, buf);
  const {spawnSync} = await import('node:child_process');
  const out = spawnSync('magick', [tmp, '-background', 'white', '-alpha', 'remove', '-alpha', 'off', dest], {encoding: 'utf8'});
  fs.unlinkSync(tmp);
  if (out.status !== 0) {
    console.error(out.stderr || out.stdout);
    process.exit(1);
  }
} else {
  fs.writeFileSync(dest, buf);
}

const rel = `/img/party/${path.basename(dest)}`;
console.log(JSON.stringify({src: rel, credit, source, bytes: fs.statSync(dest).size, mime: info.mime}, null, 2));
