import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './dynamicRouting.module.css';

const IFACES = [
  {name: 'G0/0', ip: '192.168.1.1', mask: '/30'},
  {name: 'G0/1', ip: '192.168.1.5', mask: '/30'},
  {name: 'G0/2', ip: '192.168.2.1', mask: '/24'},
];

const STORIES = [
  {
    id: 'static',
    ask: 'R2–R3 dies. R1 still has S 192.168.30.0/24 via R2. What happens to packets for .30?',
    answer: 'blackhole',
    ok: 'R2 dropped its route (next hop gone). R1 cannot see past a next hop that is still up, so it keeps sending. R2 discards. Static does not hunt.',
    bad: 'A static does not walk around the hole. Dynamic advertisements would withdraw and install the R4 path.',
    mode: 'static',
    down: true,
  },
  {
    id: 'adapt',
    ask: 'Same cut, OSPF (or EIGRP) on everyone. R1’s table after a few seconds:',
    answer: 'reroute',
    ok: 'R2 and R1 withdraw the dead path and install via R4. Restore the cable and the old path comes back. That is adaptability.',
    bad: 'The protocol does not wait for you to retype ip route. Advertisement is how the table moves.',
    mode: 'ospf',
    down: true,
  },
  {
    id: 'kinds',
    ask: 'RIP and EIGRP vs OSPF and IS-IS vs BGP:',
    answer: 'families',
    ok: 'IGP inside one AS: distance-vector (RIP, EIGRP — rumor) or link-state (OSPF, IS-IS — shared map / LSDB). BGP is the EGP: path-vector, AS to AS.',
    bad: 'OSPF is not an EGP. EIGRP is Cisco-born (RFC 7868 exists; few others run it). IS-IS is a provider IGP, not on this exam.',
    mode: 'ospf',
    down: false,
  },
  {
    id: 'metric',
    ask: 'Two OSPF routes to 192.168.3.0/24, costs 2 and 4. show ip route keeps:',
    answer: 'two',
    ok: 'Same protocol, same dest → lowest metric. [110/2] stays. Shut the good iface and [110/4] slides in. RIP hops; EIGRP bandwidth+delay; OSPF bandwidth cost.',
    bad: 'AD is 110 on both, so it cannot break the tie. Metric does.',
    mode: 'metric',
    down: false,
  },
  {
    id: 'ad',
    ask: 'Same 10.0.0.0/24 via EIGRP [90/3584] and OSPF [110/4]. Installed:',
    answer: 'eigrp',
    ok: 'Different protocols → AD, not metric. 90 beats 110. Kilograms vs kilometers. Codes: D EIGRP, O OSPF, R RIP, B BGP.',
    bad: '4 is “smaller” only inside OSPF. You cannot compare 3584 to 4.',
    mode: 'ad',
    down: false,
  },
  {
    id: 'ecmp',
    ask: 'Two OSPF paths, both metric 4, to the same /24:',
    answer: 'both',
    ok: 'Equal-cost multi-path. Both rows install; traffic splits. Default max four. Same dest, same protocol, same metric.',
    bad: 'IOS does not pick one at random and hide the other. That is what unequal metrics do.',
    mode: 'ecmp',
    down: false,
  },
  {
    id: 'float',
    ask: 'You want a static backup behind OSPF. The AD on ip route … must be:',
    answer: '111',
    ok: 'Greater than 110. ip route 10.0.0.0 255.255.255.0 192.168.1.2 111. Static metric is always 0: [111/0]. Equal AD still prefers static — go higher.',
    bad: 'Default static AD is 1 and always beats OSPF. That is a primary, not a float.',
    mode: 'float',
    down: false,
  },
  {
    id: 'overlap',
    ask: 'S /24, RIP /25, EIGRP /26, OSPF /27 — all 203.0.113.0. Table gets:',
    answer: 'all',
    ok: 'Different prefix lengths are different destinations. All four install. Longest match is not an install rule.',
    bad: 'AD 1 does not evict the others. They are not “the same dest.”',
    mode: 'overlap',
    down: false,
  },
  {
    id: 'fwd',
    ask: 'Those four rows are in the table. Packet dest 203.0.113.65. Used route:',
    answer: 'p25',
    ok: 'Match /24 and /25. Bit 26 of .65 is 1, so /26 and /27 miss. Longest match is /25. AD 120 and metric 4 are ignored while forwarding.',
    bad: 'Do not pick the static because AD is 1, and do not pick /27 because it is “more specific” if it does not match.',
    mode: 'overlap',
    down: false,
  },
  {
    id: 'wild',
    ask: 'network 192.168.2.1 0.0.0.0 area 0 does what?',
    answer: 'iface',
    ok: 'Finds the iface with that IP, starts OSPF there, advertises the iface prefix (192.168.2.0/24), not a /32. 0 bits must match. Prefer host + 0.0.0.0.',
    bad: 'The wildcard is not a second netmask and does not name the advertised prefix. 0.0.0.0 255.255.255.255 is a lab-all shortcut.',
    mode: 'wild',
    down: false,
  },
];

const CHOICES = {
  static: [
    ['blackhole', 'R1 keeps forwarding to R2; R2 drops'],
    ['reroute', 'R1 instantly uses the R4 static you never typed'],
    ['hold', 'R1 removes the static because the dest LAN is down'],
  ],
  adapt: [
    ['reroute', 'Dead path withdrawn; R4 path installed'],
    ['stuck', 'Same blackhole — protocols cannot see past R2'],
    ['clear', 'You must clear ip route before anything moves'],
  ],
  kinds: [
    ['families', 'DV: RIP/EIGRP. LS: OSPF/IS-IS. EGP: BGP path-vector'],
    ['ospfegp', 'OSPF is the EGP; BGP is a hop-count IGP'],
    ['alldv', 'All five protocols are distance-vector'],
  ],
  metric: [
    ['two', '[110/2] — lowest OSPF cost'],
    ['four', 'Both, because AD is identical'],
    ['eigrp', 'Neither; you must wait for an EIGRP row'],
  ],
  ad: [
    ['eigrp', 'EIGRP [90/3584] — AD wins'],
    ['ospf', 'OSPF [110/4] — 4 is the smaller metric'],
    ['both', 'Both; mixed protocols always ECMP'],
  ],
  ecmp: [
    ['both', 'Both rows; load-share (ECMP, max 4)'],
    ['one', 'IOS keeps the first neighbor it heard'],
    ['ad', 'It compares AD against itself and picks one'],
  ],
  float: [
    ['111', 'Something above 110, e.g. 111'],
    ['one', 'Leave AD 1 so it is “more static”'],
    ['110', 'AD 110 — tie with OSPF is how a float works'],
  ],
  overlap: [
    ['all', 'All four — prefix length makes them different dests'],
    ['s', 'Only the static (AD 1)'],
    ['long', 'Only the /27 (longest prefix fills the table)'],
  ],
  fwd: [
    ['p25', '/25 — matches, and is longer than /24'],
    ['s24', '/24 static, because AD 1 always forwards'],
    ['p27', '/27, because 27 is the longest number on the page'],
  ],
  wild: [
    ['iface', 'Activate OSPF on that iface; advertise its prefix'],
    ['host', 'Advertise 192.168.2.1/32 only'],
    ['mask', 'Rejected unless the wildcard equals 0.0.0.255'],
  ],
};

function ipToInt(ip) {
  return ip.split('.').reduce((n, o) => (n << 8) + Number(o), 0) >>> 0;
}

function wildMatch(ip, base, wild) {
  const a = ipToInt(ip);
  const b = ipToInt(base);
  const w = ipToInt(wild);
  return ((a ^ b) & ~w) === 0;
}

function cliFor(story, down, floatUp) {
  if (story.mode === 'static') {
    return down
      ? `R1# show ip route
S  192.168.30.0/24 [1/0] via 192.168.1.2
R2# show ip route
     192.168.30.0/24 not in table (next hop down)
R1 still forwards to R2. R2 drops. Black hole.`
      : `R1# show ip route
S  192.168.30.0/24 [1/0] via 192.168.1.2
R2# show ip route
S  192.168.30.0/24 [1/0] via 192.168.1.6`;
  }
  if (story.mode === 'ospf') {
    return down
      ? `R1# show ip route
O  192.168.30.0/24 [110/3] via 192.168.1.10, GigabitEthernet0/1
  (via R4 — R2–R3 withdrawn)`
      : `R1# show ip route
O  192.168.30.0/24 [110/2] via 192.168.1.2, GigabitEthernet0/0`;
  }
  if (story.mode === 'metric') {
    return down
      ? `R1# show ip route
O  192.168.3.0/24 [110/4] via 192.168.1.2, GigabitEthernet0/1`
      : `R1# show ip route
O  192.168.3.0/24 [110/2] via 192.168.1.6, GigabitEthernet0/0`;
  }
  if (story.mode === 'ad') {
    return `R1# show ip route
D  10.0.0.0/24 [90/3584] via 192.168.12.2
  OSPF [110/4] heard — not installed (AD)`;
  }
  if (story.mode === 'ecmp') {
    return `R1# show ip route
O  10.0.0.0/24 [110/4] via 192.168.1.2
O  10.0.0.0/24 [110/4] via 192.168.1.6
  ECMP — both metric 4`;
  }
  if (story.mode === 'float') {
    return floatUp
      ? `R1# show ip route
S  10.0.0.0/24 [111/0] via 192.168.1.2
  OSPF path gone; float installed`
      : `R1# show ip route
O  10.0.0.0/24 [110/4] via 192.168.1.6
  S 10.0.0.0/24 111 is configured, not installed`;
  }
  if (story.mode === 'overlap') {
    return `R1# show ip route
S  203.0.113.0/24 [1/0] via 192.168.1.2
R  203.0.113.0/25 [120/4] via 192.168.1.6
D  203.0.113.0/26 [90/5678] via 192.168.1.10
O  203.0.113.0/27 [110/10] via 192.168.1.14
  dest 203.0.113.65 → match /24 and /25 → use /25`;
  }
  const hits = IFACES.filter((ifc) => wildMatch(ifc.ip, '192.168.2.1', '0.0.0.0')).map((ifc) => ifc.name);
  return `R1(config)# router ospf 1
R1(config-router)# network 192.168.2.1 0.0.0.0 area 0
  matches ${hits.join(', ') || 'nothing'}
  advertise 192.168.2.0/24 (iface prefix), not /32

wildcard 0 = must match, 1 = don't care
/30 mask 255.255.255.252 → wild 0.0.0.3
prefer host + 0.0.0.0`;
}

export default function DynamicRoutingSimulator() {
  const [idx, setIdx] = useState(0);
  const [down, setDown] = useState(true);
  const [floatUp, setFloatUp] = useState(false);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const story = STORIES[idx];

  function setStory(i) {
    const next = STORIES[i];
    setIdx(i);
    setPicked(null);
    setFeedback('');
    setDown(Boolean(next.down));
    setFloatUp(false);
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  const failLink = down && (story.mode === 'static' || story.mode === 'ospf' || story.mode === 'metric' || (story.mode === 'float' && floatUp));

  return (
    <CEBlock
      title="Advertise, then pick a row"
      subtitle="Metric inside one protocol. AD across protocols. Forwarding is longest match."
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
            <svg className={styles.canvas} viewBox="0 0 560 220" role="img" aria-label="Four routers and a dest LAN">
              <line x1="70" y1="70" x2="210" y2="70" stroke={failLink && story.mode !== 'float' ? '#c62828' : '#1565c0'} strokeWidth="5" strokeDasharray={failLink && story.mode !== 'float' ? '6 4' : undefined} />
              <line x1="250" y1="70" x2="390" y2="70" stroke={story.mode === 'static' || story.mode === 'ospf' ? (down ? '#c62828' : '#1565c0') : '#1565c0'} strokeWidth="5" strokeDasharray={story.mode === 'static' || story.mode === 'ospf' ? (down ? '6 4' : undefined) : undefined} />
              <line x1="70" y1="70" x2="70" y2="160" stroke="#1565c0" strokeWidth="5" />
              <line x1="70" y1="160" x2="390" y2="160" stroke="#2e7d32" strokeWidth="4" />
              <line x1="430" y1="70" x2="430" y2="160" stroke="#1565c0" strokeWidth="5" />
              {[
                {id: 'R1', x: 36, y: 48},
                {id: 'R2', x: 210, y: 48},
                {id: 'R3', x: 390, y: 48},
                {id: 'R4', x: 36, y: 138},
              ].map((n) => (
                <g key={n.id}>
                  <rect x={n.x} y={n.y} width="56" height="36" rx="6" fill="#eceff1" stroke="#546e7a" />
                  <text x={n.x + 28} y={n.y + 23} textAnchor="middle" fontSize="13" fontWeight="700">
                    {n.id}
                  </text>
                </g>
              ))}
              <text x="500" y="78" fontSize="11" fill="#37474f">
                .30/24
              </text>
              <text x="280" y="28" fontSize="11" fill={down && (story.mode === 'static' || story.mode === 'ospf') ? '#c62828' : '#546e7a'}>
                {down && (story.mode === 'static' || story.mode === 'ospf') ? 'R2–R3 down' : 'R1—R2—R3'}
              </text>
              <text x="200" y="210" fontSize="11" fill="#2e7d32">
                alternate via R4
              </text>
            </svg>
            <div className={styles.row}>
              <Button size="small" variant={down ? 'contained' : 'outlined'} onClick={() => setDown((v) => !v)}>
                Toggle R2–R3
              </Button>
              {story.mode === 'float' ? (
                <Button size="small" variant={floatUp ? 'contained' : 'outlined'} onClick={() => setFloatUp((v) => !v)}>
                  Fail OSPF path
                </Button>
              ) : null}
            </div>
          </div>
          <div className={styles.panel}>
            <h4>R1 table / OSPF network</h4>
            <pre className={styles.cli}>{cliFor(story, down, floatUp)}</pre>
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
          {feedback || 'AD: C 0 · S 1 · eBGP 20 · EIGRP 90 · OSPF 110 · IS-IS 115 · RIP 120 · iBGP 200 · 255 unusable'}
        </p>
        <p className={styles.legend}>[AD/metric] · same dest = same prefix length · longest match is for packets, not install</p>
      </div>
    </CEBlock>
  );
}
