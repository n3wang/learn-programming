/**
 * Pull the Wikipedia lead image for a few remaining classic questions.
 */
import {createWriteStream} from 'node:fs';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, extname, join} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACK = join(ROOT, 'src', 'data', 'party', 'classic.json');
const OUT_DIR = join(ROOT, 'static', 'img', 'party');
const UA = 'SchoolQuizClassicImages/1.0 (educational classroom quiz; learn-programming)';

const ITEMS = [
  {id: 'math-teeth', page: 'Human tooth', alt: 'Adult human teeth', altZh: '成年人的牙齿'},
  {id: 'math-hours-week', page: 'Week', alt: 'The seven days of the week', altZh: '一周的七天'},
  {id: 'ar-world-cups', page: '2022 FIFA World Cup Final', alt: 'The 2022 World Cup final', altZh: '2022 年世界杯决赛'},
  {id: 'ar-carbon-m', page: 'Patagonia', alt: 'The dry landscape of Patagonia', altZh: '巴塔哥尼亚的干旱地貌'},
  {id: 'ar-fangio', page: 'Juan Manuel Fangio', alt: 'Juan Manuel Fangio', altZh: '胡安·曼努埃尔·方吉奥'},
  {id: 'ar-nobel', page: 'Nobel Prize', alt: 'The Nobel Prize medal', altZh: '诺贝尔奖奖章'},
  {id: 'cn-ethnic-groups', page: 'List of ethnic groups in China', alt: 'China’s officially recognised ethnic groups', altZh: '中国官方认定的民族'},
  {id: 'cn-grand-canal-km', page: 'Grand Canal (China)', alt: 'The Grand Canal in China', altZh: '中国的京杭大运河'},
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wiki(params, attempt = 0) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({format: 'json', origin: '*', ...params}).toString();
  const res = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json'}});
  if (res.status === 429 && attempt < 5) {
    await sleep(20000 * (attempt + 1));
    return wiki(params, attempt + 1);
  }
  if (!res.ok) throw new Error(`wiki ${res.status}`);
  return res.json();
}

async function commonsInfo(title) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    format: 'json',
    origin: '*',
    action: 'query',
    titles: title.startsWith('File:') ? title : `File:${title}`,
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '1280',
  }).toString();
  const res = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json'}});
  if (!res.ok) throw new Error(`commons ${res.status}`);
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  return page?.imageinfo?.[0] || null;
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortCredit(meta) {
  const artist = stripHtml(meta?.Artist?.value || meta?.Credit?.value || '');
  const license = stripHtml(meta?.LicenseShortName?.value || '');
  const artistBit = artist.split(/[,;(]/)[0].trim().slice(0, 60) || 'Wikimedia Commons';
  if (/public domain|pd/i.test(license)) return `${artistBit}, public domain`;
  return license ? `${artistBit}, ${license}` : artistBit;
}

function extFrom(url, mime) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fromUrl)) return fromUrl === '.jpeg' ? '.jpg' : fromUrl;
  if ((mime || '').includes('png') || (mime || '').includes('svg')) return '.png';
  return '.jpg';
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {Accept: 'image/*,*/*;q=0.8', 'User-Agent': UA},
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  await mkdir(dirname(dest), {recursive: true});
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  const pack = JSON.parse(await readFile(PACK, 'utf8'));
  const failed = [];

  for (const item of ITEMS) {
    const q = pack.questions.find((row) => row.id === item.id);
    process.stdout.write(`${item.id} (${item.page}) … `);
    try {
      const data = await wiki({
        action: 'query',
        titles: item.page,
        prop: 'pageimages',
        piprop: 'original|name',
        pithumbsize: '1280',
      });
      const page = Object.values(data.query?.pages || {})[0];
      const file = page?.pageimage;
      const original = page?.original?.source;
      if (!file || !original) {
        console.log('no lead image');
        failed.push({id: item.id, reason: 'no lead'});
        continue;
      }
      const info = await commonsInfo(file);
      const url = info?.thumburl || original;
      const ext = extFrom(url, info?.mime);
      await download(url, join(OUT_DIR, `${item.id}${ext}`));
      q.image = {
        src: `/img/party/${item.id}${ext}`,
        alt: item.alt,
        altZh: item.altZh,
        credit: shortCredit(info?.extmetadata),
        source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, '_')}`,
      };
      console.log(file);
      await sleep(2500);
    } catch (err) {
      console.log('ERROR', err.message);
      failed.push({id: item.id, reason: err.message});
    }
  }

  // Ballon d'Or photo landed on the debut question; swap it onto the Ballon card.
  const debut = pack.questions.find((row) => row.id === 'ar-messi-debut');
  const ballon = pack.questions.find((row) => row.id === 'ar-messi-ballon');
  if (debut?.image?.src?.includes('ar-messi-debut') && ballon?.image) {
    const debutSrc = join(OUT_DIR, debut.image.src.replace('/img/party/', ''));
    const ballonName = `ar-messi-ballon${extname(debutSrc)}`;
    try {
      await copyFile(debutSrc, join(OUT_DIR, ballonName));
      const oldBallon = ballon.image;
      ballon.image = {
        ...debut.image,
        src: `/img/party/${ballonName}`,
        alt: 'Lionel Messi holding a Ballon d’Or',
        altZh: '手持金球奖的梅西',
      };
      debut.image = {
        ...oldBallon,
        alt: 'Lionel Messi in an Argentina shirt',
        altZh: '身穿阿根廷队服的梅西',
      };
      console.log('swapped Messi Ballon d’Or onto ar-messi-ballon');
    } catch (err) {
      console.log('swap skipped', err.message);
    }
  }

  await writeFile(PACK, `${JSON.stringify(pack, null, 2)}\n`);
  if (failed.length) {
    console.log('Failed:');
    for (const row of failed) console.log(`  ${row.id}: ${row.reason}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
