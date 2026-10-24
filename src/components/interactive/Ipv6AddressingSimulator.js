import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ipv6Addressing.module.css';

const STORIES = [
  {
    id: 'need',
    ask: 'IPv4 is 32 bits. IPv6 is 128 bits. The space is larger by:',
    answer: 'dbl',
    ok: 'Each extra bit doubles the count: 2^128, not “four times.” NAT and private IPv4 only delay exhaustion. Version 5 was ST, so the next IP is 6.',
    bad: '128/32 = 4 is a length ratio, not an address count.',
    view: 'need',
  },
  {
    id: 'hex',
    ask: 'Convert 1101 1011 0010 1111 to one hextet:',
    answer: 'db2f',
    ok: 'Split nibbles → 13, 11, 2, 15 → d b 2 f. One hex digit is four bits. a=10 … f=15.',
    bad: 'Do not glue the decimal 13 onto the hex. Write lowercase.',
    view: 'hex',
  },
  {
    id: 'abbr',
    ask: 'Shortest legal form of 2001:0db8:0000:0000:002f:0001:0000:34bd:',
    answer: 'ok',
    ok: '2001:db8::2f:1:0:34bd. Strip leading zeros. One :: for the longest zero run. A leftover 0000 stays 0.',
    bad: 'Two :: are illegal. Trailing zeros in a hextet stay. 002f → 2f, not 2f00.',
    view: 'abbr',
  },
  {
    id: 'pfx',
    ask: 'Host 2001:db8:1:2:a:b:c:d/64. Network prefix:',
    answer: 'p64',
    ok: '2001:db8:1:2::/64 — zero the last four hextets. Labs stay on /64.',
    bad: 'The host address is not the prefix. /48 would be the global routing prefix, not this host’s subnet.',
    view: 'pfx',
  },
  {
    id: 'cfg',
    ask: 'G0/0 and G0/1 have ipv6 address. Packets still do not cross. You forgot:',
    answer: 'ucast',
    ok: 'ipv6 unicast-routing. IPv4 routing is on by default; IPv6 forwarding is not. A second ipv6 address adds; it does not replace.',
    bad: 'ipv6 enable only creates an LLA. ip routing does not start IPv6.',
    view: 'cfg',
  },
  {
    id: 'eui',
    ask: 'MAC 0060.2f62.b803. Modified EUI-64 interface ID:',
    answer: 'flip',
    ok: 'Split, insert fffe, invert bit 7: 0260:2fff:fe62:b803. That ID plus 2001:db8:0:2::/64 is the global.',
    bad: 'Skipping the flip leaves 0060:…. Inserting fffe at the end is the wrong split.',
    view: 'eui',
  },
  {
    id: 'types',
    ask: 'fd45:93ac:8a8f::1, fe80::1, and 2001:db8::1 are:',
    answer: 'ula',
    ok: 'ULA (fd00::/8), LLA (fe80::/64), GUA. fc00::/8 is reserved. LLA is required and stays on-link. One LLA; a new link-local overwrites.',
    bad: 'ff means multicast. 2000::/3 was the original GUA block; documentation uses 2001:db8::/32.',
    view: 'types',
  },
  {
    id: 'mcast',
    ask: 'IPv6 “everyone on this link” and “all routers on this link”:',
    answer: 'nodes',
    ok: 'ff02::1 all-nodes (no broadcast). ff02::2 all-routers. Scope nibble: 2 link, 5 site, 8 org, e global. Anycast is the same unicast on several boxes.',
    bad: 'ff02::5 is OSPF. ::1 is loopback. :: is unspecified / default dest ::/0.',
    view: 'mcast',
  },
];

const CHOICES = {
  need: [
    ['dbl', '2^128 — each bit doubles'],
    ['four', 'Four times IPv4 (128/32)'],
    ['same', 'Same count, new spelling'],
  ],
  hex: [
    ['db2f', 'db2f'],
    ['bd2f', 'bd2f'],
    ['d13', 'd13bf'],
  ],
  abbr: [
    ['ok', '2001:db8::2f:1:0:34bd'],
    ['two', '2001:db8::2f:1::34bd'],
    ['lead', '2001:0db8::2f:1:0:34bd'],
  ],
  pfx: [
    ['p64', '2001:db8:1:2::/64'],
    ['host', '2001:db8:1:2:a:b:c:d/64'],
    ['slash48', '2001:db8::/64'],
  ],
  cfg: [
    ['ucast', 'ipv6 unicast-routing'],
    ['en', 'ipv6 enable on both ifaces'],
    ['ip', 'ip routing'],
  ],
  eui: [
    ['flip', '0260:2fff:fe62:b803'],
    ['nof', '0060:2fff:fe62:b803'],
    ['end', '0060:2f62:b803:fffe'],
  ],
  types: [
    ['ula', 'ULA, LLA, GUA'],
    ['mix', 'Multicast, GUA, ULA'],
    ['pub', 'All three are public GUA'],
  ],
  mcast: [
    ['nodes', 'ff02::1 and ff02::2'],
    ['ospf', 'ff02::5 and ff02::6'],
    ['loop', '::1 and ::'],
  ],
};

function cliFor(story) {
  if (story.view === 'need') {
    return `IPv4  32 bits   2^32  ~4.3 billion
IPv6 128 bits   2^128  ~340 undecillion

IANA → 5 RIRs
  ARIN / RIPE / APNIC
  LACNIC / AFRINIC

IPv5 = ST version field
  next IP skipped to 6`;
  }
  if (story.view === 'hex') {
    return `1101 1011 0010 1111
  13   11    2   15
   d    b    2    f
        db2f

nibble = 4 bits
hextet  = 16 bits (4 hex)`;
  }
  if (story.view === 'abbr') {
    return `2001:0db8:0000:0000:002f:0001:0000:34bd
      db8  ::         2f    1    0  34bd

RFC 5952
  drop leading zeros
  one ::  (longest, then left)
  lowercase a-f`;
  }
  if (story.view === 'pfx') {
    return `2001:db8:1:2:a:b:c:d /64
network | host
  64    |  64

prefix 2001:db8:1:2::/64`;
  }
  if (story.view === 'cfg') {
    return `R1(config)# ipv6 unicast-routing
R1(config-if)# ipv6 address 2001:db8::1/64
R1# show ipv6 interface brief
Gi0/0  [up/up]
  FE80::260:2FFF:FE62:B801
  2001:DB8::1

2nd ipv6 address adds
no ipv6 address … to remove`;
  }
  if (story.view === 'eui') {
    return `MAC  0060.2f62.b803
1 split   0060 2f | 62 b803
2 fffe    0060 2fff fe62 b803
3 bit 7   00 → 02
        0260:2fff:fe62:b803

ipv6 address 2001:db8:0:2::/64 eui-64`;
  }
  if (story.view === 'types') {
    return `GUA   2000::/3 originally
      2001:db8::/32 docs
ULA   fd00::/8   (fc reserved)
LLA   fe80::/64  required, on-link
      ipv6 enable → LLA only`;
  }
  return `ff02::1  all nodes   (no broadcast)
ff02::2  all routers
ff02::5  OSPF
ff02::6  DR/BDR

anycast = same unicast, closest
::   unspecified
::1  loopback`;
}

function caption(view) {
  if (view === 'need') return '32 bits ran out. 128 bits will not.';
  if (view === 'hex') return 'One hex digit = one nibble';
  if (view === 'abbr') return 'Leading zeros · one ::';
  if (view === 'pfx') return '/64 zeros the host half';
  if (view === 'cfg') return 'unicast-routing, then ipv6 address';
  if (view === 'eui') return 'split · fffe · flip bit 7';
  if (view === 'types') return 'GUA · ULA · LLA';
  return 'ff02 scopes · anycast · :: / ::1';
}

function Board({view}) {
  const title =
    view === 'need'
      ? '2^32 vs 2^128'
      : view === 'hex'
        ? 'nibble → hex'
        : view === 'abbr'
          ? '2001:db8::…'
          : view === 'pfx'
            ? '/64 prefix'
            : view === 'cfg'
              ? 'R1 three ifaces'
              : view === 'eui'
                ? 'EUI-64'
                : view === 'types'
                  ? 'address kinds'
                  : 'ff + anycast';

  return (
    <g>
      <rect x="36" y="24" width="200" height="52" rx="8" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
      <text x="136" y="56" textAnchor="middle" fontSize="16" fontWeight="700">
        {title}
      </text>
      <rect x="260" y="20" width="88" height="40" rx="6" fill="#e8f5e9" stroke="#2e7d32" />
      <text x="304" y="45" textAnchor="middle" fontSize="13" fontWeight="700">
        R1
      </text>
      <rect x="368" y="20" width="72" height="28" rx="5" fill="#fff3e0" stroke="#ef6c00" />
      <text x="404" y="39" textAnchor="middle" fontSize="11">
        LAN
      </text>
      <rect x="456" y="20" width="72" height="28" rx="5" fill="#eceff1" stroke="#546e7a" />
      <text x="492" y="39" textAnchor="middle" fontSize="11">
        inet
      </text>
      <text x="360" y="88" fontSize="12" fill="#37474f">
        {view === 'types'
          ? 'GUA public · ULA fd · LLA fe80'
          : view === 'mcast'
            ? 'ff02 stays on the link'
            : view === 'eui'
              ? 'MAC → 64-bit IID'
              : 'hextet : hextet : … /64'}
      </text>
    </g>
  );
}

export default function Ipv6AddressingSimulator() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const story = STORIES[idx];

  function setStory(i) {
    setIdx(i);
    setPicked(null);
    setFeedback('');
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  return (
    <CEBlock
      title="128 bits, eight hextets"
      subtitle="Hex, /64, ipv6 unicast-routing, EUI-64, GUA / ULA / LLA / ff. Exam 1.8 and 1.9."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <div>
            <svg className={styles.canvas} viewBox="0 0 560 220" role="img" aria-label="IPv6 addressing">
              <Board view={story.view} />
              <text x="24" y="214" fontSize="11" fill="#37474f">
                {caption(story.view)}
              </text>
            </svg>
          </div>
          <div className={styles.panel}>
            <h4>hex / CLI / types</h4>
            <pre className={styles.cli}>{cliFor(story)}</pre>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Answer</span>
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
        <p className={`${styles.hint} ${feedback && picked === story.answer ? styles.ok : feedback ? styles.bad : ''}`}>
          {feedback || 'Nibble to hex. One ::. Slash prefix. unicast-routing. Flip bit 7.'}
        </p>
        <p className={styles.legend}>2^128 · /64 · fe80 · fd · ff02::1 · eui-64</p>
      </div>
    </CEBlock>
  );
}
