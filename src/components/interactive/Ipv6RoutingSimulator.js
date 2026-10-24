import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ipv6Routing.module.css';

const STORIES = [
  {
    id: 'sn',
    ask: 'Unicast 2001:db8:123::1. Solicited-node multicast:',
    answer: 'ff',
    ok: 'ff02::1:ff + last six hex (00:0001) → ff02::1:ff00:1. Scope is link-local. One group per unicast on the iface.',
    bad: 'ff02::1 is all-nodes. The last six hex are not the first hextets.',
    view: 'sn',
  },
  {
    id: 'ns',
    ask: 'R1 needs R2’s MAC. NDP address resolution:',
    answer: 'nsna',
    ok: 'NS (135) to R2’s solicited-node. Unicast NA (136). show ipv6 neighbors — REACH. No broadcast.',
    bad: 'ARP does not run for IPv6. RA is router discovery, not MAC learning for a peer host.',
    view: 'ns',
  },
  {
    id: 'slaac',
    ask: 'ipv6 address autoconfig on R2. What happens:',
    answer: 'rs',
    ok: 'RS to ff02::2. RA (prefix) to ff02::1. IOS glues EUI-64. Add default to install ::/0 via the RA LLA.',
    bad: 'eui-64 with a typed prefix does not learn the LAN. DHCP is stateful; SLAAC is not.',
    view: 'slaac',
  },
  {
    id: 'dad',
    ask: 'You type the same GUA as the neighbor. DAD:',
    answer: 'dup',
    ok: 'NS to your own solicited-node. An NA means DUP — syslog, unused address. Silence means unique. Also runs on up/up.',
    bad: 'Manual addresses still DAD. IPv6 made it mandatory.',
    view: 'dad',
  },
  {
    id: 'table',
    ask: 'Two /64 globals, up/up. show ipv6 route shows:',
    answer: 'cl',
    ok: 'C /64 and L /128 per global. No LLA dest. FF00::/8 via Null0 (do not forward multicast; still send/receive NDP).',
    bad: 'LLAs are next hops, not destinations. Null0 does not block local NS.',
    view: 'table',
  },
  {
    id: 'lpm',
    ask: 'Dest 2001:db8:1::1 matches C …:1::/64 and L …:1::1/128. R1:',
    answer: 'recv',
    ok: 'Longest match — the /128 local, receive. Host route = /128. No match → drop.',
    bad: 'AD does not break a C vs L tie when both match. Two matches are not a conflict.',
    view: 'table',
  },
  {
    id: 'eth',
    ask: 'ipv6 route 2001:db8:3::/64 g0/0 on Ethernet. Ping PC3:',
    answer: 'incmp',
    ok: 'Row appears. NS for PC3 on this LAN. INCMP. No proxy NDP. Use recursive or fully specified.',
    bad: 'IPv4 proxy ARP does not save IPv6. IOS accepts the command; that is the trap.',
    view: 'eth',
  },
  {
    id: 'lla',
    ask: 'ipv6 route 2001:db8:1::/64 fe80::1',
    answer: 'needif',
    ok: 'Rejected: Interface has to be specified for a link-local nexthop. Fully specify. Same LLA on two ifaces is legal.',
    bad: 'Recursive LLA is ambiguous because every link is fe80::/64.',
    view: 'lla',
  },
  {
    id: 'def',
    ask: '::/0 via ISP-A (AD 1) and ::/0 via ISP-B AD 2. Table holds:',
    answer: 'float',
    ok: 'Only AD 1. Shut the primary → the floater ([2/0]) appears. Default matches everything if nothing longer hits.',
    bad: 'Higher AD does not win. Not ECMP. autoconfig default is a different way to learn ::/0.',
    view: 'def',
  },
];

const CHOICES = {
  sn: [
    ['ff', 'ff02::1:ff00:1'],
    ['all', 'ff02::1'],
    ['rtr', 'ff02::2'],
  ],
  ns: [
    ['nsna', 'NS to solicited-node, unicast NA'],
    ['arp', 'Broadcast ARP request'],
    ['ra', 'Wait for a periodic RA'],
  ],
  slaac: [
    ['rs', 'RS/RA, then EUI-64 on IOS'],
    ['typed', 'You must type the /64 first'],
    ['dhcp', 'Needs a DHCPv6 server'],
  ],
  dad: [
    ['dup', 'NS to self; NA → DUP, unused'],
    ['skip', 'Manual addresses skip DAD'],
    ['ping', 'Ping ff02::1 first'],
  ],
  table: [
    ['cl', 'C /64, L /128, no LLA dest, FF00::/8 Null0'],
    ['lla', 'C and L for each fe80::'],
    ['stat', 'Statics only until you redistribute'],
  ],
  lpm: [
    ['recv', 'Receive — /128 wins'],
    ['fwd', 'Forward on the C /64'],
    ['drop', 'Drop — two matches'],
  ],
  eth: [
    ['incmp', 'Shows, then INCMP — no proxy NDP'],
    ['ok', 'Works like IPv4 exit-only'],
    ['rej', 'IOS rejects the command'],
  ],
  lla: [
    ['needif', 'Rejected until you add the iface'],
    ['rec', 'Recursive LLA is preferred'],
    ['def', 'Becomes ::/0'],
  ],
  def: [
    ['float', 'AD 1 installed; AD 2 floats'],
    ['both', 'Both, ECMP'],
    ['hi', 'AD 2 wins'],
  ],
};

function cliFor(story) {
  if (story.view === 'sn') {
    return `2001:db8:123::1
 last 6 hex   00:0001
 ff02::1:ff + 00:0001
        ff02::1:ff00:1

show ipv6 interface g0/0
  FF02::1
  FF02::2
  FF02::1:FF00:1`;
  }
  if (story.view === 'ns') {
    return `R1 NS  dst ff02::1:ff00:2
R2 NA  unicast to R1

R1# show ipv6 neighbors
2001:DB8::2     5254.000a.fc35  REACH
FE80::…         5254.000a.fc35  REACH

NS 135   NA 136`;
  }
  if (story.view === 'slaac') {
    return `R2(config-if)# ipv6 address autoconfig
  RS  → ff02::2
  RA  ← ff02::1  prefix 2001:db8::/64
  IID = EUI-64 (IOS)

autoconfig default
  also S ::/0 via RA LLA`;
  }
  if (story.view === 'dad') {
    return `R2(config-if)# ipv6 address 2001:db8::1/64
%IPV6_ND-4-DUPLICATE
show ipv6 interface
  2001:DB8::1  [DUP]

NS to own solicited-node
no NA → unique`;
  }
  if (story.view === 'eth') {
    return `R1(config)# ipv6 route 2001:db8:3::/64 g0/0
S  2001:DB8:3::/64
   via GigabitEthernet0/0, directly connected

show ipv6 neighbors
2001:DB8:3::13   -   INCMP
  no proxy NDP`;
  }
  if (story.view === 'lla') {
    return `R2(config)# ipv6 route 2001:db8:1::/64 fe80::1
% Interface has to be specified
   for a link-local nexthop

R2(config)# ipv6 route 2001:db8:1::/64 g0/0 fe80::1
S  2001:DB8:1::/64
   via FE80::1, GigabitEthernet0/0`;
  }
  if (story.view === 'def') {
    return `R1(config)# ipv6 route ::/0 2001:db8::2
R1(config)# ipv6 route ::/0 2001:db8:1::2 2

S  ::/0 [1/0]  via 2001:DB8::2

g0/0 shutdown
S  ::/0 [2/0]  via 2001:DB8:1::2`;
  }
  return `C  2001:DB8::/64      via G0/0
L  2001:DB8::1/128    receive
C  2001:DB8:1::/64    via G0/1
L  2001:DB8:1::1/128  receive
L  FF00::/8           Null0

no C/L for FE80::
longest prefix wins`;
}

function caption(view) {
  if (view === 'sn') return 'ff02::1:ff + last six hex';
  if (view === 'ns') return 'NS 135 · NA 136';
  if (view === 'slaac') return 'RS / RA · slack';
  if (view === 'dad') return 'NS to self';
  if (view === 'eth') return 'Exit-only on Ethernet fails';
  if (view === 'lla') return 'LLA next hop needs an iface';
  if (view === 'def') return '::/0 · floating AD';
  return 'C /64 · L /128 · longest match';
}

function Board({view}) {
  const title =
    view === 'sn'
      ? 'solicited-node'
      : view === 'ns'
        ? 'NS → NA'
        : view === 'slaac'
          ? 'SLAAC'
          : view === 'dad'
            ? 'DAD'
            : view === 'eth'
              ? 'exit-only'
              : view === 'lla'
                ? 'LLA hop'
                : view === 'def'
                  ? '::/0'
                  : 'IPv6 table';

  return (
    <g>
      <rect x="36" y="22" width="88" height="40" rx="6" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2" />
      <text x="80" y="47" textAnchor="middle" fontSize="14" fontWeight="700">
        R1
      </text>
      <rect x="236" y="22" width="88" height="40" rx="6" fill="#e3f2fd" stroke="#1565c0" strokeWidth="2" />
      <text x="280" y="47" textAnchor="middle" fontSize="14" fontWeight="700">
        R2
      </text>
      <rect x="436" y="22" width="88" height="40" rx="6" fill="#fff8e1" stroke="#ef6c00" strokeWidth="2" />
      <text x="480" y="47" textAnchor="middle" fontSize="14" fontWeight="700">
        R3
      </text>
      <line x1="124" y1="42" x2="236" y2="42" stroke="#90a4ae" strokeWidth="4" />
      <line x1="324" y1="42" x2="436" y2="42" stroke="#90a4ae" strokeWidth="4" />
      <rect x="36" y="100" width="72" height="28" rx="5" fill="#fff3e0" stroke="#ef6c00" />
      <text x="72" y="119" textAnchor="middle" fontSize="11">
        PC1
      </text>
      <rect x="452" y="100" width="72" height="28" rx="5" fill="#fff3e0" stroke="#ef6c00" />
      <text x="488" y="119" textAnchor="middle" fontSize="11">
        PC3
      </text>
      <line x1="72" y1="62" x2="72" y2="100" stroke="#90a4ae" strokeWidth="2" />
      <line x1="480" y1="62" x2="480" y2="100" stroke="#90a4ae" strokeWidth="2" />
      <rect x="180" y="148" width="200" height="36" rx="8" fill="#eceff1" stroke="#546e7a" />
      <text x="280" y="171" textAnchor="middle" fontSize="13" fontWeight="700">
        {title}
      </text>
    </g>
  );
}

export default function Ipv6RoutingSimulator() {
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
      title="NDP, then longest match"
      subtitle="Solicited-node, NS/NA, SLAAC, DAD, C/L, ipv6 route. No OSPFv3. Exam 3.1–3.3."
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
            <svg className={styles.canvas} viewBox="0 0 560 220" role="img" aria-label="IPv6 routing">
              <Board view={story.view} />
              <text x="24" y="214" fontSize="11" fill="#37474f">
                {caption(story.view)}
              </text>
            </svg>
          </div>
          <div className={styles.panel}>
            <h4>NDP / show ipv6 route</h4>
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
          {feedback || 'ff02::1:ff + last six. NS/NA. Exit-only Ethernet fails. LLA hop needs an iface.'}
        </p>
        <p className={styles.legend}>NS 135 · RA 134 · /128 · ::/0 · floating AD</p>
      </div>
    </CEBlock>
  );
}
