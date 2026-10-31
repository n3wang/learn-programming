/**
 * One-off: attach a Commons photo to every classic.json question that lacks one.
 * Downloads a ~1280px thumb into static/img/party/<id>.<ext> and writes image metadata.
 */
import {createWriteStream} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, extname, join} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACK = join(ROOT, 'src', 'data', 'party', 'classic.json');
const OUT_DIR = join(ROOT, 'static', 'img', 'party');
const UA = 'SchoolQuizClassicImages/1.0 (educational classroom quiz; learn-programming)';
const API = 'https://commons.wikimedia.org/w/api.php';

const ITEMS = [
  {id: 'math-planets', force: true, files: ['Planets2013.svg', 'PIA03149.jpg', 'Solar System Montage.jpg'], search: 'NASA eight planets montage', alt: 'The eight planets of the Solar System', altZh: '太阳系的八颗行星'},
  {id: 'math-sun-million-km', files: ["The Sun by the Atmospheric Imaging Assembly of NASA's Solar Dynamics Observatory - 20100819.jpg", 'Sun white.jpg'], search: 'Sun NASA SDO', alt: 'The Sun photographed by NASA’s Solar Dynamics Observatory', altZh: '美国宇航局太阳动力学天文台拍摄的太阳'},
  {id: 'math-continents', files: ['World map (Miller cylindrical projection, 2023).png', 'BlankMap-World.svg', 'WorldMap.svg'], search: 'world map continents', alt: 'A map of Earth’s continents', altZh: '世界各大洲地图'},
  {id: 'math-piano-keys', files: ['Steinway & Sons concert grand piano, model D-274, manufactured at Steinway\'s factory in Hamburg, Germany.png', 'Grand piano.jpg', 'Piano.jpg'], search: 'concert grand piano keyboard', alt: 'A concert grand piano', altZh: '一架三角钢琴'},
  {id: 'math-bones', force: true, files: ['Human skeleton.svg', 'Human skeleton front en.svg', 'Skeleton front.svg'], search: 'anatomical human skeleton unlabeled', alt: 'Front view of a human skeleton', altZh: '人体骨骼正面图'},
  {id: 'math-teeth', force: true, files: ['Human adult teeth numbering notation.svg', 'Permanent teeth.jpg', 'Dental arches.jpg'], search: 'adult human teeth dental arcade', alt: 'Adult human teeth', altZh: '成年人的牙齿'},
  {id: 'math-chess-squares', files: ['Chess board opening staunton.jpg', 'ChessSet.jpg', 'Chess board.jpg'], search: 'chessboard 64 squares', alt: 'A chessboard with 64 squares', altZh: '有 64 格的国际象棋棋盘'},
  {id: 'math-cards', files: ['Piatnikcards.jpg', 'English pattern playing cards deck.svg', 'Bicycle playing cards.jpg'], search: 'standard deck playing cards', alt: 'A standard deck of playing cards', altZh: '一副扑克牌'},
  {id: 'math-hours-week', files: ['Calendar.png', 'Seven-day week.svg', 'ISO 8601 Weeks.svg'], search: 'seven day week calendar', alt: 'A calendar showing the days of the week', altZh: '标出一周七天的日历'},
  {id: 'math-minutes-day', files: ['Big Ben, London.jpg', 'Clock Tower - Palace of Westminster, London - September 2006.jpg', 'Railway clock.jpg'], search: 'analog clock tower', alt: 'A clock tower that marks the hours and minutes', altZh: '一座标明时与分的钟楼'},
  {id: 'math-moon-year', files: ['Aldrin Apollo 11 original.jpg', 'Apollo 11 Lunar Module.jpg'], search: 'Apollo 11 Buzz Aldrin Moon', alt: 'Buzz Aldrin on the Moon during Apollo 11', altZh: '阿波罗 11 号期间奥尔德林站在月球上'},
  {id: 'math-everest-m', files: ['Mount Everest as seen from Drukair2 PLW edit.jpg', 'Everest kalapatthar crop.jpg'], search: 'Mount Everest from Kalapatthar', alt: 'Mount Everest seen from the south', altZh: '从南坡望见的珠穆朗玛峰'},
  {id: 'math-chromosomes', files: ['NHGRI human male karyotype.png', 'Human male karyotpe high resolution.jpg'], search: 'human karyotype 46 chromosomes', alt: 'A human male karyotype of 46 chromosomes', altZh: '有 46 条染色体的人类核型图'},
  {id: 'math-us-states', files: ['Map of USA with state names 2.svg', 'Map of USA with state names.svg', 'Flag of the United States.svg'], search: 'map of the United States 50 states', alt: 'Map of the 50 United States', altZh: '美国五十个州的地图'},
  {id: 'math-circle-deg', files: ['Protractor Rapporteur Degrees V3.jpg', 'Circle degrees 360.svg', 'Protractor.jpg'], search: 'protractor 360 degrees', alt: 'A protractor marked in degrees', altZh: '标有度数的量角器'},
  {id: 'astro-moon-walkers', files: ['Apollo 11 bootprint.jpg', 'Buzz salutes the U.S. Flag.jpg'], search: 'Apollo 11 bootprint Moon', alt: 'A bootprint left on the Moon by Apollo 11', altZh: '阿波罗 11 号留在月面的脚印'},
  {id: 'astro-first-human', files: ['Yuri Gagarin (1961) - Restoration.jpg', 'Gagarin in Sweden.jpg', 'Yuri Gagarin 1961.jpg'], search: 'Yuri Gagarin 1961', alt: 'Yuri Gagarin, the first human in space', altZh: '尤里·加加林，人类第一位进入太空的人'},
  {id: 'astro-iss-orbit', files: ['ISS after STS-134 05-23-11.jpg', 'International Space Station after undocking of STS-134.jpg'], search: 'International Space Station in orbit', alt: 'The International Space Station in orbit', altZh: '在轨的国际空间站'},
  {id: 'astro-apollo-landings', files: ['Apollo 15 flag, rover, LM, Irwin.jpg', 'Apollo 17 The Last Man on the Moon.jpg'], search: 'Apollo lunar module on the Moon', alt: 'An Apollo landing site on the Moon', altZh: '阿波罗登月点'},
  {id: 'astro-shuttles-flew', files: ['Space Shuttle Columbia launching.jpg', 'Atlantis taking off on STS-132.jpg', 'Space Shuttle fleet.jpg'], search: 'Space Shuttle launch', alt: 'A Space Shuttle lifting off', altZh: '航天飞机升空'},
  {id: 'conv-3km-m', files: ['Kilometerstein.jpg', 'Kilometre stone.jpg', 'Milestone.jpg'], search: 'kilometre stone roadside', alt: 'A roadside kilometre marker', altZh: '路边的公里里程碑'},
  {id: 'conv-4m-cm', files: ['Measuring tape.jpg', 'Tape measure.jpg', 'Steel ruler.jpg'], search: 'metric measuring tape centimetres', alt: 'A measuring tape marked in centimetres', altZh: '标有厘米的卷尺'},
  {id: 'conv-hour-s', files: ['Hourglass 2.jpg', 'Hourglass.jpg', 'Stopwatch.jpg'], search: 'hourglass sand timer', alt: 'An hourglass measuring an hour', altZh: '一只沙漏'},
  {id: 'ar-aconcagua-m', files: ['Aconcagua 2012.jpg', 'Aconcagua from Plaza de Mulas.jpg', 'Cerro Aconcagua.jpg'], search: 'Aconcagua mountain Argentina', alt: 'Aconcagua, the highest peak in the Americas', altZh: '美洲最高峰阿空加瓜山'},
  {id: 'ar-obelisco-m', files: ['Obelisco de Buenos Aires.jpg', 'ObeliscoBA2015.jpg', 'El Obelisco Buenos Aires.jpg'], search: 'Obelisco Buenos Aires', alt: 'The Obelisco in the middle of Buenos Aires', altZh: '布宜诺斯艾利斯市中心的方尖碑'},
  {id: 'ar-carbon-m', files: ['Gran Bajo de San Julián.jpg', 'Laguna del Carbon.jpg', 'Patagonia steppe.jpg'], search: 'Gran Bajo de San Julián Patagonia depression', alt: 'The dry depression of southern Patagonia', altZh: '巴塔哥尼亚南部的低洼地'},
  {id: 'ar-plata-km', files: ['Rio de la Plata from space.jpg', 'Río de la Plata.jpg', 'Rio de la Plata estuary.jpg'], search: 'Río de la Plata estuary from space', alt: 'The Río de la Plata estuary from above', altZh: '从高空看拉普拉塔河河口'},
  {id: 'ar-area-km2', files: ['Argentina (orthographic projection).svg', 'Argentina sat.jpg', 'Argentina satellite map.jpg'], search: 'Argentina map orthographic', alt: 'Argentina on a globe', altZh: '地球仪上的阿根廷'},
  {id: 'ar-iguazu-falls', files: ['Iguazu Falls from the Brazilian side, 2014.jpg', 'Iguazu Decembre 2007 - Panorama 8.jpg', 'Iguazu Falls.jpg'], search: 'Iguazu Falls Argentina', alt: 'Iguazú Falls on the Argentina–Brazil border', altZh: '阿根廷与巴西边境的伊瓜苏瀑布'},
  {id: 'ar-provinces', files: ['Argentina provinces named.png', 'Map of Argentina with provinces.svg', 'Argentina administrative.png'], search: 'Argentina provinces map', alt: 'Map of Argentina’s provinces', altZh: '阿根廷各省地图'},
  {id: 'ar-independence', files: ['Casa Histórica de la Independencia.jpg', 'Casa de Tucuman.jpg', 'Congress of Tucumán.jpg'], search: 'Casa Histórica Independencia Tucumán', alt: 'The House of Independence in Tucumán', altZh: '图库曼的独立屋'},
  {id: 'ar-flag', files: ['Flag of Argentina.svg', 'Flag of Argentina (alternative).svg'], search: 'Flag of Argentina', alt: 'The blue-and-white flag of Argentina', altZh: '阿根廷的蓝白国旗'},
  {id: 'ar-subte', files: ['Buenos Aires Underground.jpg', 'Subte Line A car.jpg', 'Estacion Peru Subte.jpg'], search: 'Buenos Aires Subte underground', alt: 'A train of the Buenos Aires Subte', altZh: '布宜诺斯艾利斯地铁列车'},
  {id: 'ar-teatro-colon', files: ['Teatro Colón.jpg', 'Teatro Colon Buenos Aires.jpg', 'Teatro Colón, Buenos Aires.jpg'], search: 'Teatro Colón Buenos Aires', alt: 'The Teatro Colón opera house in Buenos Aires', altZh: '布宜诺斯艾利斯的科隆剧院'},
  {id: 'ar-world-cups', files: ['Argentina national football team 2022.jpg', 'Argentina football team World Cup.jpg', 'FIFA World Cup Trophy 2014.jpg'], search: 'Argentina national football team World Cup', alt: 'Argentina’s national football team', altZh: '阿根廷国家足球队'},
  {id: 'ar-hand-of-god', files: ['Diego Maradona 1986.jpg', 'Diego Maradona 2010 FIFA World Cup.jpg', 'Diego Armando Maradona.JPG'], search: 'Diego Maradona portrait', alt: 'Diego Maradona', altZh: '迭戈·马拉多纳'},
  {id: 'ar-messi-ballon', files: ['Lionel Messi 20180626.jpg', 'Lionel Messi 20180626 (cropped).jpg', 'Lionel Andrés Messi Cuccittini.jpg'], search: 'Lionel Messi Argentina 2018', alt: 'Lionel Messi in an Argentina shirt', altZh: '身穿阿根廷队服的梅西'},
  {id: 'ar-messi-debut', files: ['Lionel Messi 2005.jpg', 'Messi Barcelona 2005.jpg', 'Lionel Messi 2011.jpg'], search: 'Lionel Messi FC Barcelona', alt: 'Lionel Messi playing for Barcelona', altZh: '效力巴塞罗那时的梅西'},
  {id: 'ar-fangio', files: ['Juan Manuel Fangio 1957.jpg', 'Juan Manuel Fangio 1954.jpg', 'Fangio Maserati 250F.jpg'], search: 'Juan Manuel Fangio Formula One', alt: 'Juan Manuel Fangio in a Formula One car', altZh: '驾驶 F1 赛车的方吉奥'},
  {id: 'ar-nobel', files: ['Nobel Prize.png', 'Nobel Prize medal.png', 'Nobel medal.jpg'], search: 'Nobel Prize medal', alt: 'The Nobel Prize medal', altZh: '诺贝尔奖奖章'},
  {id: 'cn-everest-cm', files: ['Everest North Face toward Base Camp Tibet Luca Galuzzi 2006.jpg', 'Mount Everest North Face.jpg'], search: 'Everest North Face Tibet', alt: 'The north face of Mount Everest from Tibet', altZh: '从西藏望见的珠峰北坡'},
  {id: 'cn-great-wall-km', files: ['The Great Wall of China at Jinshanling.jpg', 'Great Wall of China July 2006.JPG'], search: 'Great Wall of China Jinshanling', alt: 'The Great Wall of China at Jinshanling', altZh: '金山岭长城'},
  {id: 'cn-yangtze-km', files: ['Yangtze River in Wuhan.jpg', 'Qutang Gorge.jpg', 'Yangtze River.jpg'], search: 'Yangtze River China', alt: 'The Yangtze River', altZh: '长江'},
  {id: 'cn-grand-canal-km', files: ['Grand Canal Hangzhou.jpg', 'Jinghang Grand Canal.jpg', 'Grand Canal China.jpg'], search: 'Grand Canal Hangzhou China', alt: 'The Grand Canal in Hangzhou', altZh: '杭州段的京杭大运河'},
  {id: 'cn-hzmb-km', files: ['Hong Kong-Zhuhai-Macao Bridge.jpg', 'Hong Kong Zhuhai Macau Bridge.jpg', 'HZMB.jpg'], search: 'Hong Kong-Zhuhai-Macao Bridge', alt: 'The Hong Kong–Zhuhai–Macau Bridge', altZh: '港珠澳大桥'},
  {id: 'cn-three-gorges-m', files: ['ThreeGorgesDam-China2009.jpg', 'Three Gorges Dam.jpg', 'ThreeGorgesDam.jpg'], search: 'Three Gorges Dam Yangtze', alt: 'The Three Gorges Dam on the Yangtze', altZh: '长江三峡大坝'},
  {id: 'cn-shanghai-tower-m', files: ['Shanghai Tower 2015.jpg', 'Shanghai Tower 2016.jpg', 'Shanghai Tower.jpg'], search: 'Shanghai Tower skyscraper', alt: 'The Shanghai Tower', altZh: '上海中心大厦'},
  {id: 'cn-leshan-m', files: ['Leshan Giant Buddha.jpg', 'Leshan Buddha Statue View.JPG', 'Leshan Giant Buddha Statue.jpg'], search: 'Leshan Giant Buddha Sichuan', alt: 'The Giant Buddha of Leshan', altZh: '乐山大佛'},
  {id: 'cn-hsr-kmh', files: ['CR400AF.jpg', 'Fuxing Hao.jpg', 'China Railway High-speed.jpg'], search: 'CR400AF Fuxing high speed train', alt: 'A Fuxing high-speed train', altZh: '复兴号高速列车'},
  {id: 'cn-yao-cm', files: ['Yao Ming.jpg', 'YaoMing.jpg', 'Yao Ming 2008.jpg'], search: 'Yao Ming basketball', alt: 'Yao Ming on the basketball court', altZh: '篮球场上的姚明'},
  {id: 'cn-yao-allstar', files: ['Yao Ming Rockets.jpg', 'YaoMing1.jpg', 'Yao Ming All-Star.jpg'], search: 'Yao Ming Houston Rockets', alt: 'Yao Ming with the Houston Rockets', altZh: '效力休斯顿火箭队的姚明'},
  {id: 'cn-li-na', files: ['Li Na 2013.jpg', 'Li Na Australian Open.jpg', 'Li Na tennis.jpg'], search: 'Li Na tennis', alt: 'Chinese tennis player Li Na', altZh: '中国网球选手李娜'},
  {id: 'cn-ethnic-groups', files: ['56 Ethnic groups of China.jpg', 'Chinese ethnic groups.jpg', 'National Day parade ethnic costumes.jpg'], search: 'China 56 ethnic groups costumes', alt: 'People in the costumes of China’s ethnic groups', altZh: '身着中国各民族服装的人们'},
  {id: 'cn-common-chars', files: ['Kangxi Dictionary.jpg', 'Chinese characters calligraphy.jpg', 'Chinese calligraphy.jpg'], search: 'Chinese characters calligraphy', alt: 'Chinese characters written with a brush', altZh: '用毛笔写下的汉字'},
  {id: 'cn-terracotta', files: ['Terracotta Army, View of Pit 1.jpg', 'Terracotta Army.jpg', 'Xi\'an Terracotta Army.jpg'], search: 'Terracotta Army Pit 1 Xi\'an', alt: 'Rows of soldiers in the Terracotta Army', altZh: '兵马俑一号坑里的陶俑队列'},
  {id: 'cn-wild-pandas', files: ['Giant Panda 2004-03-2.jpg', 'Grosser Panda.JPG', 'Giant Panda eating bamboo.jpg'], search: 'giant panda wild bamboo', alt: 'A giant panda eating bamboo', altZh: '一只正在吃竹子的大熊猫'},
  {id: 'cn-prc-year', files: ['Mao Zedong proclaiming the establishment of the PRC in 1949.jpg', 'Founding ceremony of the People\'s Republic of China.jpg', 'Tiananmen 1949.jpg'], search: 'founding of the People\'s Republic of China 1949', alt: 'The founding ceremony of the People’s Republic of China in 1949', altZh: '1949 年中华人民共和国开国大典'},
  {id: 'cn-yang-liwei', files: ['Yang Liwei.jpg', 'Yang Liwei astronaut.jpg', 'Shenzhou 5.jpg'], search: 'Yang Liwei Shenzhou 5', alt: 'Yang Liwei, China’s first astronaut in space', altZh: '杨利伟，中国第一位进入太空的航天员'},
  {id: 'cn-2008-golds', files: ['Beijing national stadium.jpg', 'Beijing National Stadium.jpg', 'Bird\'s Nest Beijing.jpg'], search: 'Beijing National Stadium Bird\'s Nest 2008', alt: 'The Bird’s Nest stadium from the 2008 Beijing Olympics', altZh: '2008 年北京奥运会的鸟巢体育场'},
  {id: 'cn-winter-olympics', files: ['2022 Winter Olympics opening ceremony.jpg', 'Beijing 2022 Winter Olympics.jpg', 'National Speed Skating Oval.jpg'], search: 'Beijing 2022 Winter Olympics', alt: 'A venue from the Beijing 2022 Winter Olympics', altZh: '2022 年北京冬奥会场馆'},
];

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function shortCredit(meta, fileTitle) {
  const artist = stripHtml(meta.Artist?.value || meta.Credit?.value || '');
  const license = stripHtml(meta.LicenseShortName?.value || meta.UsageTerms?.value || '');
  const artistBit = artist.split(/[,;(]/)[0].trim().slice(0, 60) || 'Wikimedia Commons';
  if (/public domain|pd/i.test(license) || /public domain/i.test(artist)) {
    return `${artistBit}, public domain`;
  }
  return license ? `${artistBit}, ${license}` : artistBit;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(params, attempt = 0) {
  const url = new URL(API);
  url.search = new URLSearchParams({format: 'json', origin: '*', ...params}).toString();
  const res = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json'}});
  if (res.status === 429 && attempt < 6) {
    const wait = 20000 * (attempt + 1);
    console.log(`  rate-limited, wait ${wait / 1000}s`);
    await sleep(wait);
    return api(params, attempt + 1);
  }
  if (!res.ok) throw new Error(`Commons API ${res.status} ${res.statusText}`);
  return res.json();
}

async function infoForTitles(titles) {
  const found = new Map();
  const unique = [...new Set(titles.map((t) => (t.startsWith('File:') ? t : `File:${t}`)))];
  for (let i = 0; i < unique.length; i += 40) {
    const chunk = unique.slice(i, i + 40);
    const data = await api({
      action: 'query',
      titles: chunk.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '1280',
    });
    for (const page of pagesOf(data)) {
      if (page.missing != null || page.invalid != null) continue;
      const ii = page.imageinfo && page.imageinfo[0];
      if (!ii || !ii.url) continue;
      found.set(page.title.replace(/^File:/, ''), {title: page.title, ...ii});
      found.set(page.title, {title: page.title, ...ii});
    }
    await sleep(1500);
  }
  return found;
}

function pagesOf(data) {
  return Object.values(data.query?.pages || {});
}

async function infoForTitle(title) {
  const data = await api({
    action: 'query',
    titles: title.startsWith('File:') ? title : `File:${title}`,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1280',
  });
  const page = pagesOf(data)[0];
  if (!page || page.missing != null || page.invalid != null) return null;
  const ii = page.imageinfo && page.imageinfo[0];
  if (!ii || !ii.url) return null;
  return {title: page.title, ...ii};
}

async function searchFile(query) {
  const data = await api({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: '8',
  });
  const hits = data.query?.search || [];
  for (const hit of hits) {
    const info = await infoForTitle(hit.title);
    if (!info) continue;
    const w = info.thumbwidth || info.width || 0;
    if (w < 400) continue;
    const mime = info.mime || '';
    if (!mime.startsWith('image/')) continue;
    return info;
  }
  return null;
}

async function resolveItem(item, catalog) {
  for (const file of item.files || []) {
    const info = catalog.get(file) || catalog.get(`File:${file}`);
    if (info) return info;
  }
  for (const file of item.files || []) {
    const info = await infoForTitle(file);
    if (info) return info;
    await sleep(800);
  }
  if (item.search) {
    await sleep(1500);
    return searchFile(item.search);
  }
  return null;
}

function extFrom(info) {
  const thumb = info.thumburl || info.url;
  const mime = (info.mime || '').toLowerCase();
  if (thumb.includes('.svg') && mime.includes('svg')) return '.png';
  const fromUrl = extname(new URL(thumb).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fromUrl)) {
    return fromUrl === '.jpeg' ? '.jpg' : fromUrl;
  }
  if (mime.includes('jpeg')) return '.jpg';
  if (mime.includes('png')) return '.png';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('svg')) return '.png';
  return '.jpg';
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {Accept: 'image/*,*/*;q=0.8', 'User-Agent': UA},
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  await mkdir(dirname(dest), {recursive: true});
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  const pack = JSON.parse(await readFile(PACK, 'utf8'));
  const byId = Object.fromEntries(ITEMS.map((item) => [item.id, item]));
  const missing = pack.questions.filter((q) => {
    const item = byId[q.id];
    return item && (!q.image || item.force);
  });
  console.log(`Need images for ${missing.length} questions`);
  const catalog = await infoForTitles(ITEMS.flatMap((item) => item.files || []));
  console.log(`Resolved ${catalog.size / 2} Commons files`);
  const failed = [];

  for (const q of missing) {
    const item = byId[q.id];
    if (!item) {
      failed.push({id: q.id, reason: 'no catalog entry'});
      continue;
    }
    process.stdout.write(`${q.id} … `);
    try {
      const info = await resolveItem(item, catalog);
      if (!info) {
        console.log('NOT FOUND');
        failed.push({id: q.id, reason: 'not found'});
        continue;
      }
      const url = info.thumburl || info.url;
      const ext = extFrom(info);
      const dest = join(OUT_DIR, `${q.id}${ext}`);
      await download(url, dest);
      const fileTitle = info.title.replace(/^File:/, '');
      q.image = {
        src: `/img/party/${q.id}${ext}`,
        alt: item.alt,
        altZh: item.altZh,
        credit: shortCredit(info.extmetadata || {}, fileTitle),
        source: `https://commons.wikimedia.org/wiki/${encodeURI(info.title).replace(/%20/g, '_')}`,
      };
      console.log(fileTitle);
      await sleep(1200);
    } catch (err) {
      console.log('ERROR', err.message);
      failed.push({id: q.id, reason: err.message});
    }
  }

  await writeFile(PACK, `${JSON.stringify(pack, null, 2)}\n`);
  console.log(`\nWrote ${PACK}`);
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
