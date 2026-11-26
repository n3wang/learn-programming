/**
 * Deterministic ASCII monster per flag id — the same creature for every segment of a
 * flag, so students can tell which flag a revealed word belongs to.
 */

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small PRNG stream seeded by the flag id. */
function picker(seed) {
  let s = seed || 1;
  return (list) => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return list[s % list.length];
  };
}

// Rows are 11 characters wide; the shell's walls sit in columns 1 and 9.
const HORNS = [
  '  \\/   \\/',
  '   ^     ^',
  '  (\\     /)',
  '   ~  ~  ~',
  '  /\\   /\\',
  '     \\|/',
  '   ()   ()',
  '  _/\\_/\\_',
];
const SHELLS = [
  ['.', '-', '.', '|', '|', "'", "'"],
  ['/', '~', '\\', '(', ')', '\\', '/'],
  ['+', '=', '+', '[', ']', '+', '+'],
  ['.', '^', '.', '{', '}', "'", "'"],
  ['/', '*', '\\', '<', '>', '\\', '/'],
];
const EYES = ['o o', 'O O', '@ @', '* *', '^ ^', 'x x', '0 0', '- -', '$ $', '# #', 'O o', '> <'];
const MOUTHS = ['___', 'vvv', '~~~', 'ooo', '\\_/', '===', 'www', '<->', 'wWw', '^^^', '[_]', '.-.'];
const ARMS = [
  '/  |   |  \\',
  '~~ |   | ~~',
  '\\  |   |  /',
  'o  |   |  o',
  '_  |   |  _',
];
const FEET = ['   d   b', '  ^^   ^^', '   |   |', '  _/   \\_', '  UU   UU', '  ()   ()'];
const SYL_A = ['gr', 'bl', 'z', 'kr', 'm', 'sn', 'th', 'v', 'qu', 'dr', 'fl', 'p'];
const SYL_B = ['ub', 'ix', 'oo', 'ak', 'el', 'um', 'ar', 'iz', 'og', 'yn'];
const SYL_C = ['nak', 'bit', 'lox', 'zor', 'pip', 'mog', 'tik', 'ra', 'dle', 'gus'];

/** `{name, art, hue}` — art is a multi-line string, hue a 0–359 accent for styling. */
export function flagMonster(flagId) {
  const seed = hash32(String(flagId || 'flag'));
  const pick = picker(seed);
  const [tl, top, tr, l, r, bl, br] = pick(SHELLS);
  const eyes = pick(EYES);
  const mouth = pick(MOUTHS);
  const art = [
    pick(HORNS),
    ` ${tl}${top.repeat(7)}${tr} `,
    ` ${l}  ${eyes}  ${r} `,
    ` ${l}  ${mouth}  ${r} `,
    ` ${bl}${top.repeat(7)}${br} `,
    pick(ARMS),
    pick(FEET),
  ]
    .map((row) => row.replace(/\s+$/, ''))
    .join('\n');
  const raw = pick(SYL_A) + pick(SYL_B) + pick(SYL_C);
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);
  return {name, art, hue: seed % 360};
}
