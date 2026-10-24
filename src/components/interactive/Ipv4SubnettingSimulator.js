import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ipv4Subnetting.module.css';

const BLOCKS = [
  {id: 'c24', ip: '192.168.1.0', prefix: 24, label: '192.168.1.0/24'},
  {id: 'b16', ip: '192.168.0.0', prefix: 16, label: '192.168.0.0/16'},
  {id: 'a23', ip: '172.25.190.0', prefix: 23, label: '172.25.190.0/23'},
  {id: 'vlsm', ip: '10.89.100.0', prefix: 24, label: '10.89.100.0/24 VLSM', vlsm: true},
];

const VLSM_NEEDS = [
  {name: 'Toronto A', hosts: 122},
  {name: 'Tokyo A', hosts: 59},
  {name: 'Toronto B', hosts: 30},
  {name: 'Tokyo B', hosts: 11},
  {name: 'WAN', hosts: 2},
];

const STORIES = [
  {
    id: 'why',
    ask: 'A 12-host office gets a whole class C. The waste is:',
    type: 'choice',
    answer: 'waste',
    ok: 'Class C is 254 usable. Most of the block sits unused. CIDR lets the prefix stop mid-octet.',
    bad: 'Classful sizes are /8 /16 /24 only. That rigidity is why CIDR exists.',
  },
  {
    id: 'borrow',
    ask: 'Borrow 1 bit from 192.168.1.0/24. You get:',
    type: 'choice',
    answer: 'two25',
    ok: '2¹ = 2 subnets: 192.168.1.0/25 and 192.168.1.128/25. Each has 126 usable.',
    bad: 'The original /24 network bits stay fixed. Only the borrowed bit flips.',
  },
  {
    id: 'five',
    ask: '192.168.1.64/26 — network, broadcast, usable, hosts:',
    type: 'choice',
    answer: 'a64',
    ok: '.64 net, .127 bcast, .65–.126 usable, 2⁶−2 = 62 hosts. Borrowed bits are network now.',
    bad: 'Host bits are the last 6. All 0 = net. All 1 = bcast. ±1 for usable.',
  },
  {
    id: 'find',
    ask: 'PC is 172.16.20.27/28. Network address of its subnet:',
    type: 'choice',
    answer: 'n16',
    ok: 'Last octet 00011011. Host nibble → 0000 → 172.16.20.16.',
    bad: 'Zero the host bits, not the whole last octet. /28 is not a /24.',
  },
  {
    id: 'mask',
    ask: '/25 in dotted decimal (what IOS wants on ip address):',
    type: 'choice',
    answer: 'm128',
    ok: 'Twenty-five 1s: 255.255.255.128. /26=192, /27=224, /28=240, /29=248, /30=252.',
    bad: '1s on the left. 255.255.255.192 is /26, not /25.',
  },
  {
    id: 'p2p',
    ask: 'Two routers on a point-to-point link. Most efficient legal pair:',
    type: 'choice',
    answer: 'p31',
    ok: '/31 uses two addresses and skips net/bcast. /30 still works (four addresses) and is more common.',
    bad: '2¹−2 = 0 would forbid /31, but RFC 3021 allows it on a P2P link.',
  },
  {
    id: 'flsm',
    ask: 'Split 172.25.190.0/23 into four equal subnets. Prefix and first usable of subnet 2:',
    type: 'choice',
    answer: 's2',
    ok: 'Borrow 2 → /25. Subnets .190.0, .190.128, .191.0, .191.128. Second first-usable is 172.25.190.129.',
    bad: '2² = 4. New prefix = 23+2. Count the borrowed bits in binary: 00, 01, 10, 11.',
  },
  {
    id: 'vlsm',
    ask: 'VLSM 10.89.100.0/24. 122, 59, 30, 11, then 2 hosts. First two subnets:',
    type: 'choice',
    answer: 'vfirst',
    ok: 'Largest first: /25 at .0 (126 hosts), /26 at .128 (62 hosts). Next net is previous bcast + 1.',
    bad: 'Do not start with the WAN. Equal /26s cannot fit 122 hosts.',
  },
];

const CHOICES = {
  why: [
    ['waste', '200+ addresses unused — classful sizes cannot shrink'],
    ['ok', '254 is the smallest legal LAN; leftover addresses expire'],
    ['nat', 'Class C cannot be routed; only class A leaves a site'],
  ],
  borrow: [
    ['two25', '192.168.1.0/25 and 192.168.1.128/25'],
    ['four', 'Four /24s: .0 .1 .2 .3'],
    ['same', 'Still one /24; borrowing does not change the prefix'],
  ],
  five: [
    ['a64', '.64 / .127 / .65–.126 / 62 hosts'],
    ['a0', '.0 / .255 / .1–.254 / 254, because it is still class C'],
    ['a64b', '.64 / .95 / .65–.94 / 30, treating it as /27'],
  ],
  find: [
    ['n16', '172.16.20.16'],
    ['n0', '172.16.20.0, zeroing the last octet'],
    ['n27', '172.16.20.27 — the host address is already the network'],
  ],
  mask: [
    ['m128', '255.255.255.128'],
    ['m192', '255.255.255.192'],
    ['m127', '255.255.255.127'],
  ],
  p2p: [
    ['p31', '/31 (two addresses) or /30 (four, still common)'],
    ['p24', '/24, because every interface needs a class C'],
    ['p32', '/32 on both ends; each router is its own subnet'],
  ],
  flsm: [
    ['s2', '/25, first usable 172.25.190.129'],
    ['s24', '/24, first usable 172.25.191.1'],
    ['s26', '/26, first usable 172.25.190.65'],
  ],
  vlsm: [
    ['vfirst', '10.89.100.0/25 then 10.89.100.128/26'],
    ['vequal', 'Four /26s from .0, leftover for the WAN'],
    ['vwan', 'WAN /30 at .0, then pack LANs after it'],
  ],
};

function parseIp(dotted) {
  return dotted.split('.').map((p) => Number(p));
}

function toInt(octets) {
  return octets.reduce((acc, n) => ((acc << 8) + n) >>> 0, 0);
}

function fromInt(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function maskInt(prefix) {
  if (prefix <= 0) {
    return 0;
  }
  if (prefix >= 32) {
    return 0xffffffff;
  }
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function dottedMask(prefix) {
  return fromInt(maskInt(prefix));
}

function attrsOf(netInt, prefix) {
  const m = maskInt(prefix);
  const net = netInt & m;
  const bcast = (net | (~m >>> 0)) >>> 0;
  const y = 32 - prefix;
  let first = net;
  let last = bcast;
  let usable;
  if (prefix === 32) {
    usable = 1;
  } else if (prefix === 31) {
    usable = 2;
  } else {
    first = (net + 1) >>> 0;
    last = (bcast - 1) >>> 0;
    usable = 2 ** y - 2;
  }
  return {
    net: fromInt(net),
    bcast: fromInt(bcast),
    first: fromInt(first),
    last: fromInt(last),
    usable,
    mask: dottedMask(prefix),
    prefix,
    netInt: net,
  };
}

function minPrefixForHosts(need) {
  if (need <= 2) {
    return 30;
  }
  for (let y = 2; y <= 24; y += 1) {
    if (2 ** y - 2 >= need) {
      return 32 - y;
    }
  }
  return 8;
}

function packVlsm(block) {
  const base = toInt(parseIp(block.ip)) & maskInt(block.prefix);
  const end = base + 2 ** (32 - block.prefix);
  let cursor = base;
  const sorted = [...VLSM_NEEDS].sort((a, b) => b.hosts - a.hosts);
  return sorted.map((need) => {
    const prefix = minPrefixForHosts(need.hosts);
    const size = 2 ** (32 - prefix);
    if (cursor % size !== 0) {
      cursor += size - (cursor % size);
    }
    const row = {name: need.name, hosts: need.hosts, ...attrsOf(cursor, prefix)};
    cursor += size;
    row.overflow = cursor > end;
    return row;
  });
}

function flsmList(block, newPrefix) {
  const borrow = newPrefix - block.prefix;
  const count = 2 ** borrow;
  const size = 2 ** (32 - newPrefix);
  const base = toInt(parseIp(block.ip)) & maskInt(block.prefix);
  const shown = Math.min(count, 16);
  const rows = [];
  for (let i = 0; i < shown; i += 1) {
    rows.push(attrsOf((base + i * size) >>> 0, newPrefix));
  }
  return {count, rows, borrow, size};
}

function bitCells(ip, prefix, newPrefix) {
  const octets = parseIp(ip);
  const bits = octets.map((o) => o.toString(2).padStart(8, '0')).join('');
  return bits.split('').map((b, i) => {
    let kind = 'host';
    if (i < prefix) {
      kind = 'fixed';
    } else if (i < newPrefix) {
      kind = 'borrow';
    }
    return {b, kind, i};
  });
}

export default function Ipv4SubnettingSimulator() {
  const [idx, setIdx] = useState(0);
  const [blockId, setBlockId] = useState('c24');
  const [borrow, setBorrow] = useState(1);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [sel, setSel] = useState(0);
  const story = STORIES[idx];
  const block = BLOCKS.find((b) => b.id === blockId) || BLOCKS[0];
  const maxBorrow = Math.min(6, 30 - block.prefix);
  const newPrefix = Math.min(block.prefix + borrow, 30);
  const flsm = useMemo(() => flsmList(block, newPrefix), [block, newPrefix]);
  const vlsm = useMemo(() => packVlsm(block), [block]);
  const isVlsm = Boolean(block.vlsm);
  const rows = isVlsm ? vlsm : flsm.rows;
  const current = rows[Math.min(sel, rows.length - 1)] || rows[0];
  const cells = bitCells(current ? current.net : block.ip, block.prefix, isVlsm ? current.prefix : newPrefix);

  function setStory(i) {
    const next = STORIES[i];
    setIdx(i);
    setPicked(null);
    setFeedback('');
    setSel(0);
    if (next.id === 'borrow' || next.id === 'five' || next.id === 'mask' || next.id === 'why') {
      setBlockId('c24');
      setBorrow(next.id === 'five' ? 2 : 1);
      setSel(next.id === 'five' ? 1 : 0);
    } else if (next.id === 'flsm') {
      setBlockId('a23');
      setBorrow(2);
      setSel(1);
    } else if (next.id === 'vlsm') {
      setBlockId('vlsm');
      setBorrow(1);
      setSel(0);
    } else if (next.id === 'p2p') {
      setBlockId('c24');
      setBorrow(6);
      setSel(0);
    }
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  const barCount = isVlsm ? vlsm.length : Math.min(flsm.count, 16);
  const barWidth = 640 / Math.max(barCount, 1);

  return (
    <CEBlock
      title="Borrow host bits, then read the five attributes"
      subtitle="Each borrowed bit doubles subnets and halves size. VLSM packs largest first."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <div className={styles.panel}>
            <h4>Address block</h4>
            <div className={styles.row}>
              {BLOCKS.map((b) => (
                <Button
                  key={b.id}
                  size="small"
                  variant={blockId === b.id ? 'contained' : 'text'}
                  onClick={() => {
                    setBlockId(b.id);
                    setSel(0);
                    setBorrow(b.vlsm ? 1 : Math.min(2, 30 - b.prefix));
                  }}
                >
                  {b.label}
                </Button>
              ))}
            </div>
            {!isVlsm ? (
              <div className={styles.row} style={{marginTop: '0.45rem'}}>
                <span className={styles.label}>
                  Borrow {borrow} → /{newPrefix} · {flsm.count} subnets · {current ? current.usable : 0} hosts
                </span>
                <Button size="small" variant="outlined" onClick={() => setBorrow((n) => Math.max(0, n - 1))} disabled={borrow <= 0}>
                  −
                </Button>
                <Button size="small" variant="outlined" onClick={() => setBorrow((n) => Math.min(maxBorrow, n + 1))} disabled={borrow >= maxBorrow}>
                  +
                </Button>
              </div>
            ) : (
              <p className={styles.label} style={{marginTop: '0.45rem'}}>
                Largest need first. /31 would also fit the WAN; this pack uses /30.
              </p>
            )}
            <svg className={styles.bars} viewBox="0 0 640 56" role="img" aria-label="Subnets in the block">
              {rows.slice(0, barCount).map((row, i) => (
                <g key={`${row.net}/${row.prefix}`} className={styles.barBtn} onClick={() => setSel(i)}>
                  <rect
                    x={i * barWidth + 1}
                    y={6}
                    width={Math.max(barWidth - 2, 2)}
                    height={28}
                    rx={3}
                    fill={i === sel ? '#1565c0' : '#90caf9'}
                    stroke="#37474f"
                  />
                  {barWidth > 48 ? (
                    <text x={i * barWidth + barWidth / 2} y={24} textAnchor="middle" fill={i === sel ? '#fff' : '#0d47a1'} fontSize="9">
                      /{row.prefix}
                    </text>
                  ) : null}
                </g>
              ))}
              <text x={4} y={50} fontSize="10" fill="#546e7a">
                {isVlsm
                  ? vlsm.map((r) => `${r.name} ${r.net}/${r.prefix}`).join(' · ')
                  : `${flsm.count} × /${newPrefix} (showing ${rows.length})`}
              </text>
            </svg>
            <div className={styles.bits} aria-label="32-bit view">
              {cells.map((cell) => (
                <div key={cell.i} className={styles.bit}>
                  <div className={`${styles.cell} ${styles[cell.kind]}`}>{cell.b}</div>
                  {cell.i % 8 === 7 ? <span>.</span> : <span>{cell.i < 8 ? 128 >> cell.i : ''}</span>}
                </div>
              ))}
            </div>
            <p className={styles.legend}>
              <span>Grey = original network</span>
              <span>Blue = borrowed</span>
              <span>Empty = host</span>
            </p>
          </div>
          <div className={styles.panel}>
            <h4>Five attributes</h4>
            {current ? (
              <pre className={styles.attrs}>
                {isVlsm ? `${current.name} needs ${current.hosts} hosts\n` : ''}
                {`Network   ${current.net}/${current.prefix}
Broadcast ${current.bcast}
First     ${current.first}
Last      ${current.last}
Hosts     ${current.usable}   (2^${32 - current.prefix}${current.prefix >= 31 ? ' special' : ' − 2'})
Mask      ${current.mask}`}
              </pre>
            ) : null}
            {isVlsm ? (
              <ol className={styles.list}>
                {vlsm.map((row) => (
                  <li key={row.name}>
                    {row.name}: {row.net}/{row.prefix} · {row.first}–{row.last}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </div>
        <div className={styles.row}>
          {(CHOICES[story.id] || []).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`${styles.choice} ${picked === id ? styles.choiceOn : ''}`}
              onClick={() => choose(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className={`${styles.hint} ${feedback ? (picked === story.answer ? styles.ok : styles.bad) : ''}`}>
          {feedback || 'Grey bits cannot change. Flip borrowed bits to count subnets. Host bits all 0 / all 1 are net / bcast.'}
        </p>
      </div>
    </CEBlock>
  );
}
