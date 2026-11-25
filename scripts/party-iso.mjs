/**
 * `npm run party-iso`: export the 64×64 party art (assets/asetsprite/
 * 64x64_party.aseprite, mapped by party_64.csv) to static/img/party/iso/ by
 * running scripts/party-iso.lua in Aseprite's batch mode. Set ASEPRITE to the
 * executable if it is not in one of the usual places.
 */
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  process.env.ASEPRITE,
  'C:/Program Files/Aseprite/Aseprite.exe',
  'C:/Program Files (x86)/Steam/steamapps/common/Aseprite/Aseprite.exe',
  '/Applications/Aseprite.app/Contents/MacOS/aseprite',
  '/usr/bin/aseprite',
].filter(Boolean);
const exe = candidates.find((p) => existsSync(p));
if (!exe) {
  console.error('Aseprite not found. Set ASEPRITE to its executable.');
  process.exit(1);
}
const out = execFileSync(exe, ['-b', '--script-param', `root=${root}`, '--script', join(root, 'scripts', 'party-iso.lua')], {encoding: 'utf8'});
// Third-party Aseprite extensions can print noise in batch mode; keep only our lines.
for (const line of out.split(/\r?\n/)) if (line.startsWith('party-iso')) console.log(line);
