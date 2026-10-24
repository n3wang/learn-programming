import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './lifeOfAPacket.module.css';

const BCAST = 'ffff.ffff.ffff';

const MAC = {
  pc1: 'aa01.0000.0011',
  pc2: 'aa01.0000.0012',
  r1g1: '0001.1111.0001',
  r1g0: '0001.1111.0000',
  r2g0: '0002.2222.0000',
  r2g1: '0002.2222.0001',
  r3g0: '0003.3333.0000',
  r3g1: '0003.3333.0001',
  pc3: 'aa03.0000.0011',
  pc4: 'aa03.0000.0012',
};

const NODES = {
  pc1: {label: 'PC1', kind: 'pc', x: 40, y: 40},
  pc2: {label: 'PC2', kind: 'pc', x: 40, y: 200},
  sw1: {label: 'SW1', kind: 'sw', x: 140, y: 120},
  r1: {label: 'R1', kind: 'rtr', x: 250, y: 120},
  r2: {label: 'R2', kind: 'rtr', x: 400, y: 120},
  r3: {label: 'R3', kind: 'rtr', x: 550, y: 120},
  sw2: {label: 'SW2', kind: 'sw', x: 660, y: 120},
  pc3: {label: 'PC3', kind: 'pc', x: 760, y: 40},
  pc4: {label: 'PC4', kind: 'pc', x: 760, y: 200},
};

const LINKS = [
  {id: 'pc1-sw1', a: 'pc1', b: 'sw1'},
  {id: 'pc2-sw1', a: 'pc2', b: 'sw1'},
  {id: 'sw1-r1', a: 'sw1', b: 'r1'},
  {id: 'r1-r2', a: 'r1', b: 'r2'},
  {id: 'r2-r3', a: 'r2', b: 'r3'},
  {id: 'r3-sw2', a: 'r3', b: 'sw2'},
  {id: 'sw2-pc3', a: 'sw2', b: 'pc3'},
  {id: 'sw2-pc4', a: 'sw2', b: 'pc4'},
];

const ROUTES = {
  r1: [
    {net: 'C 192.168.1.0/24', via: 'G0/1', hit: false},
    {net: 'C 192.168.12.0/24', via: 'G0/0', hit: false},
    {net: 'S 192.168.3.0/24', via: '192.168.12.2 G0/0', hit: true},
  ],
  r2: [
    {net: 'S 192.168.1.0/24', via: '192.168.12.1 G0/0', hit: false},
    {net: 'C 192.168.12.0/24', via: 'G0/0', hit: false},
    {net: 'C 192.168.23.0/24', via: 'G0/1', hit: false},
    {net: 'S 192.168.3.0/24', via: '192.168.23.2 G0/1', hit: true},
  ],
  r3: [
    {net: 'S 192.168.1.0/24', via: '192.168.23.1 G0/0', hit: false},
    {net: 'C 192.168.23.0/24', via: 'G0/0', hit: false},
    {net: 'C 192.168.3.0/24', via: 'G0/1', hit: true},
  ],
};

const STORIES = [
  {
    id: 'remote',
    phase: 1,
    ask: 'PC1 (192.168.1.11/24) pings 192.168.3.11. First Ethernet dest MAC is whose?',
    answer: 'gw',
    ok: 'Off-LAN. PC1 frames to the default gateway (R1 G0/1), not to PC3’s MAC. Those two never share a LAN.',
    bad: 'Same-LAN dests use the dest host MAC. 192.168.3.11 is a different /24.',
  },
  {
    id: 'arpwho',
    phase: 2,
    ask: 'PC1 knows the gateway IP 192.168.1.1 but not the MAC. ARP asks for:',
    answer: 'r1',
    ok: 'ARP who-has 192.168.1.1. Dest MAC is ffff.ffff.ffff. PC3 is not on this broadcast domain.',
    bad: 'ARP is hop-to-hop. PC1 needs R1’s MAC so the first frame can leave the LAN.',
  },
  {
    id: 'flood',
    phase: 2,
    ask: 'SW1 sees dest ffff.ffff.ffff. It:',
    answer: 'flood',
    ok: 'Broadcast flood: every port except ingress. PC2 hears it and drops — the target IP is not .12.',
    bad: 'Unknown unicast also floods. This one is broadcast, so the same flood rule applies.',
  },
  {
    id: 'tables',
    phase: 3,
    ask: 'After the ARP reply, which table did what?',
    answer: 'both',
    ok: 'SW1: MAC → port. PC1 and R1: IP → MAC. Different jobs. The switch never rewrites the frame.',
    bad: 'A MAC table is not an ARP table. Switches do not store IPs to forward.',
  },
  {
    id: 'match',
    phase: 5,
    ask: 'R1 de-encapsulates. Dest IP is still 192.168.3.11. The route it uses is:',
    answer: 'static',
    ok: 'Longest prefix that matches: S 192.168.3.0/24 via 192.168.12.2 out G0/0. Connected /24s do not cover .3.11.',
    bad: 'Most specific matching route, not “first row” and not the connected LAN the packet arrived on.',
  },
  {
    id: 'rewrite',
    phase: 7,
    ask: 'R1 forwards toward R2. What stays, what changes?',
    answer: 'macs',
    ok: 'Src/dst IP stay PC1→PC3. New frame: src R1 G0/0, dest R2 G0/0. Layer 3 is end-to-end; Layer 2 is hop-to-hop.',
    bad: 'Routers do not NAT here. They do not keep PC1’s dest MAC. They build a new Ethernet header.',
  },
  {
    id: 'last',
    phase: 9,
    ask: 'R3’s best match is C 192.168.3.0/24. Next Ethernet dest is:',
    answer: 'pc3',
    ok: 'Connected last hop: ARP for 192.168.3.11 (PC3), then frame to PC3’s MAC. SW2 floods that request.',
    bad: 'There is no next router. A connected route means “this LAN — deliver to the host.”',
  },
  {
    id: 'return',
    phase: 11,
    ask: 'PC3’s echo reply walks back. Why no ARP and no flood this time?',
    answer: 'warm',
    ok: 'ARP caches and MAC tables already have the rows. Known unicasts, gateway MACs already known.',
    bad: 'The path is not a special “reply protocol.” Same forwarding, just warm tables.',
  },
];

const CHOICES = {
  remote: [
    ['gw', 'R1 G0/1 — the default gateway'],
    ['pc3', 'PC3’s MAC, because dest IP is PC3'],
    ['sw1', 'SW1’s burned-in address, so the switch can route it'],
  ],
  arpwho: [
    ['r1', '192.168.1.1 (R1 G0/1)'],
    ['pc3', '192.168.3.11 (PC3)'],
    ['all', 'Every host on the internet, using 255.255.255.255'],
  ],
  flood: [
    ['flood', 'Flood every port except the one it arrived on'],
    ['fwd', 'Forward only G0/0 because that is “toward the WAN”'],
    ['drop', 'Drop it; switches never handle ARP'],
  ],
  tables: [
    ['both', 'SW1 learned MACs on ports; PC1 and R1 learned IP→MAC'],
    ['swap', 'SW1 stored IP→MAC; the PCs stored MAC→port'],
    ['none', 'Nobody stored anything until OSPF runs'],
  ],
  match: [
    ['static', 'S 192.168.3.0/24 via 192.168.12.2'],
    ['lan', 'C 192.168.1.0/24, the LAN the frame arrived on'],
    ['host', 'L 192.168.1.1/32, because that is R1 itself'],
  ],
  rewrite: [
    ['macs', 'IPs stay; dest MAC becomes R2 G0/0'],
    ['ips', 'Dest IP becomes 192.168.12.2; MACs stay PC1→PC3'],
    ['both', 'Both IP and MAC are rewritten to R2, like NAT'],
  ],
  last: [
    ['pc3', 'PC3’s MAC, after ARP on 192.168.3.0/24'],
    ['r2', 'R2 again, because replies must retrace'],
    ['bcast', 'ffff.ffff.ffff forever, because the dest is remote'],
  ],
  return: [
    ['warm', 'Tables already have the MACs and ARP entries'],
    ['icmp', 'Echo reply skips Ethernet and rides IP only'],
    ['sw', 'Switches now route, so ARP is illegal on the way back'],
  ],
};

function emptyMac() {
  return {sw1: {}, sw2: {}};
}

function emptyArp() {
  return {pc1: {}, r1: {}, r2: {}, r3: {}, pc3: {}};
}

function snapshot(phase) {
  const mac = emptyMac();
  const arp = emptyArp();
  let frame = null;
  let lit = [];
  let drops = [];
  let router = null;
  const log = [];

  if (phase >= 1) {
    frame = {
      srcIp: '192.168.1.11',
      dstIp: '192.168.3.11',
      srcMac: '—',
      dstMac: 'need GW MAC',
      type: 'ICMP echo (planned)',
    };
    lit = ['pc1'];
    log.push('PC1: 192.168.3.11 is not in 192.168.1.0/24. Send to gateway 192.168.1.1.');
  }
  if (phase >= 2) {
    frame = {
      srcIp: '192.168.1.11',
      dstIp: '192.168.1.1',
      srcMac: MAC.pc1,
      dstMac: BCAST,
      type: 'ARP request',
    };
    mac.sw1[MAC.pc1] = 'G0/1';
    lit = ['pc1-sw1', 'sw1-r1', 'pc2-sw1', 'sw1'];
    drops = ['pc2'];
    log.push('ARP who-has 192.168.1.1? SW1 floods. PC2 drops. SW1 learns PC1 on G0/1.');
  }
  if (phase >= 3) {
    frame = {
      srcIp: '192.168.1.1',
      dstIp: '192.168.1.11',
      srcMac: MAC.r1g1,
      dstMac: MAC.pc1,
      type: 'ARP reply',
    };
    mac.sw1[MAC.r1g1] = 'G0/0';
    arp.r1['192.168.1.11'] = MAC.pc1;
    arp.pc1['192.168.1.1'] = MAC.r1g1;
    lit = ['sw1-r1', 'pc1-sw1', 'r1', 'sw1'];
    drops = [];
    log.push('R1 replies unicast. SW1 learns R1 G0/1 on G0/0 and forwards to PC1. Both add ARP rows.');
  }
  if (phase >= 4) {
    frame = {
      srcIp: '192.168.1.11',
      dstIp: '192.168.3.11',
      srcMac: MAC.pc1,
      dstMac: MAC.r1g1,
      type: 'ICMP echo',
    };
    lit = ['pc1-sw1', 'sw1-r1', 'pc1', 'sw1', 'r1'];
    log.push('PC1 sends the packet in a frame to R1 G0/1. Dest IP is still PC3. SW1 known-unicast forwards.');
  }
  if (phase >= 5) {
    router = 'r1';
    lit = ['r1'];
    log.push('R1 de-encapsulates. Longest match: S 192.168.3.0/24 via 192.168.12.2 out G0/0.');
  }
  if (phase >= 6) {
    frame = {
      srcIp: '192.168.12.1',
      dstIp: '192.168.12.2',
      srcMac: MAC.r1g0,
      dstMac: BCAST,
      type: 'ARP request',
    };
    arp.r2['192.168.12.1'] = MAC.r1g0;
    arp.r1['192.168.12.2'] = MAC.r2g0;
    lit = ['r1-r2', 'r1', 'r2'];
    log.push('R1 ARPs for 192.168.12.2. No switch on that link — only R2 hears the broadcast.');
  }
  if (phase >= 7) {
    frame = {
      srcIp: '192.168.1.11',
      dstIp: '192.168.3.11',
      srcMac: MAC.r1g0,
      dstMac: MAC.r2g0,
      type: 'ICMP echo',
    };
    router = 'r2';
    lit = ['r1-r2', 'r1', 'r2'];
    log.push('New frame: src R1 G0/0, dest R2 G0/0. Packet IPs unchanged.');
  }
  if (phase >= 8) {
    arp.r3['192.168.23.1'] = MAC.r2g1;
    arp.r2['192.168.23.2'] = MAC.r3g0;
    frame = {
      srcIp: '192.168.1.11',
      dstIp: '192.168.3.11',
      srcMac: MAC.r2g1,
      dstMac: MAC.r3g0,
      type: 'ICMP echo',
    };
    router = 'r3';
    lit = ['r2-r3', 'r2', 'r3'];
    log.push('R2: S 192.168.3.0/24 via 192.168.23.2. ARP R3, then new frame R2 G0/1 → R3 G0/0.');
  }
  if (phase >= 9) {
    mac.sw2[MAC.r3g1] = 'G0/0';
    frame = {
      srcIp: '192.168.3.1',
      dstIp: '192.168.3.11',
      srcMac: MAC.r3g1,
      dstMac: BCAST,
      type: 'ARP request',
    };
    lit = ['r3-sw2', 'sw2-pc3', 'sw2-pc4', 'r3', 'sw2'];
    drops = ['pc4'];
    log.push('R3: connected 192.168.3.0/24. ARP who-has 192.168.3.11. SW2 floods. PC4 drops.');
  }
  if (phase >= 10) {
    mac.sw2[MAC.pc3] = 'G0/1';
    arp.r3['192.168.3.11'] = MAC.pc3;
    arp.pc3['192.168.3.1'] = MAC.r3g1;
    frame = {
      srcIp: '192.168.1.11',
      dstIp: '192.168.3.11',
      srcMac: MAC.r3g1,
      dstMac: MAC.pc3,
      type: 'ICMP echo',
    };
    lit = ['r3-sw2', 'sw2-pc3', 'r3', 'sw2', 'pc3'];
    drops = [];
    log.push('PC3 replies ARP. SW2 forwards the echo as known unicast. Packet arrived.');
  }
  if (phase >= 11) {
    frame = {
      srcIp: '192.168.3.11',
      dstIp: '192.168.1.11',
      srcMac: 'hop MAC (GW / next hop)',
      dstMac: 'hop MAC (GW / next hop)',
      type: 'ICMP echo-reply',
    };
    router = 'r1';
    lit = ['sw2-pc3', 'r3-sw2', 'r2-r3', 'r1-r2', 'sw1-r1', 'pc1-sw1', 'pc3', 'sw2', 'r3', 'r2', 'r1', 'sw1', 'pc1'];
    log.push('Reply: dest IP 192.168.1.11. Tables are warm — no ARP, no flood. MACs change each hop again.');
  }

  return {mac, arp, frame, lit, drops, router, log};
}

function fillColor(id, kind, litSet, dropSet) {
  if (dropSet.has(id)) {
    return '#90a4ae';
  }
  if (litSet.has(id)) {
    if (kind === 'rtr') {
      return '#2e7d32';
    }
    if (kind === 'sw') {
      return '#1565c0';
    }
    return '#ef6c00';
  }
  if (kind === 'rtr') {
    return '#66bb6a';
  }
  if (kind === 'sw') {
    return '#cfd8dc';
  }
  return '#455a64';
}

export default function LifeOfAPacketSimulator() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(STORIES[0].phase);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const story = STORIES[idx];
  const snap = snapshot(phase);
  const litSet = new Set(snap.lit);
  const dropSet = new Set(snap.drops);
  const routeRows = snap.router ? ROUTES[snap.router] : null;
  const replyHit = phase >= 11;

  function setStory(i) {
    setIdx(i);
    setPhase(STORIES[i].phase);
    setPicked(null);
    setFeedback('');
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  return (
    <CEBlock
      title="One ping, every hop"
      subtitle="PC1 → R1 → R2 → R3 → PC3. Dest IP never changes. Dest MAC does, every hop."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <svg className={styles.canvas} viewBox="0 0 800 250" role="img" aria-label="PC1 SW1 R1 R2 R3 SW2 PC3">
            {LINKS.map((link) => {
              const left = NODES[link.a];
              const right = NODES[link.b];
              const on = litSet.has(link.id);
              return (
                <line
                  key={link.id}
                  x1={left.x}
                  y1={left.y}
                  x2={right.x}
                  y2={right.y}
                  stroke={on ? '#ef6c00' : '#90a4ae'}
                  strokeWidth={on ? 3.2 : 1.5}
                />
              );
            })}
            {Object.entries(NODES).map(([id, node]) => (
              <g key={id}>
                <rect
                  x={node.x - (node.kind === 'pc' ? 26 : 28)}
                  y={node.y - 16}
                  width={node.kind === 'pc' ? 52 : 56}
                  height={32}
                  rx={node.kind === 'rtr' ? 2 : 6}
                  fill={fillColor(id, node.kind, litSet, dropSet)}
                  stroke="#37474f"
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fill={node.kind === 'sw' && !litSet.has(id) ? '#37474f' : '#fff'} fontSize="11" fontWeight="700">
                  {node.label}
                </text>
              </g>
            ))}
            <text x={140} y={236} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.1.0/24
            </text>
            <text x={325} y={88} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.12.0/24
            </text>
            <text x={475} y={88} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.23.0/24
            </text>
            <text x={660} y={236} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.3.0/24
            </text>
          </svg>
          <div className={styles.tables}>
            <div className={styles.table}>
              <h4>SW1 MAC</h4>
              {Object.keys(snap.mac.sw1).length ? (
                <table>
                  <tbody>
                    {Object.entries(snap.mac.sw1).map(([m, port]) => (
                      <tr key={m}>
                        <td>{m}</td>
                        <td>{port}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>empty</p>
              )}
            </div>
            <div className={styles.table}>
              <h4>SW2 MAC</h4>
              {Object.keys(snap.mac.sw2).length ? (
                <table>
                  <tbody>
                    {Object.entries(snap.mac.sw2).map(([m, port]) => (
                      <tr key={m}>
                        <td>{m}</td>
                        <td>{port}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>empty</p>
              )}
            </div>
            {routeRows ? (
              <div className={styles.table}>
                <h4>{snap.router.toUpperCase()} routes (match highlighted)</h4>
                <table>
                  <tbody>
                    {routeRows.map((row) => {
                      const hit = replyHit ? row.net.includes('192.168.1.0') : row.hit;
                      return (
                        <tr key={row.net} className={hit ? styles.routeHit : undefined}>
                          <td>{row.net}</td>
                          <td>{row.via}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.table}>
                <h4>PC1 ARP</h4>
                {Object.keys(snap.arp.pc1).length ? (
                  <table>
                    <tbody>
                      {Object.entries(snap.arp.pc1).map(([ip, m]) => (
                        <tr key={ip}>
                          <td>{ip}</td>
                          <td>{m}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.empty}>no gateway MAC yet</p>
                )}
              </div>
            )}
          </div>
        </div>
        {snap.frame ? (
          <div className={styles.frame} aria-label="Current packet and frame">
            <span className={`${styles.field} ${styles.ip}`}>Src IP {snap.frame.srcIp}</span>
            <span className={`${styles.field} ${styles.ip}`}>Dst IP {snap.frame.dstIp}</span>
            <span className={`${styles.field} ${styles.src}`}>Src MAC {snap.frame.srcMac}</span>
            <span className={`${styles.field} ${styles.dst}`}>Dst MAC {snap.frame.dstMac}</span>
            <span className={`${styles.field} ${styles.type}`}>{snap.frame.type}</span>
          </div>
        ) : null}
        <div className={styles.row}>
          <Button size="small" variant="outlined" onClick={() => setPhase(story.phase)}>
            Show this hop
          </Button>
          <Button size="small" variant="outlined" onClick={() => setPhase((p) => Math.min(11, p + 1))}>
            Next hop
          </Button>
          <Button size="small" variant="outlined" onClick={() => setPhase(10)}>
            Arrive at PC3
          </Button>
          <Button size="small" variant="outlined" onClick={() => setPhase(11)}>
            PC3 replies
          </Button>
          <Button size="small" variant="text" onClick={() => setPhase(0)}>
            Reset
          </Button>
        </div>
        <pre className={styles.log}>{(snap.log.length ? snap.log : ['Idle campus. Walk a hop or open a story.']).join('\n')}</pre>
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
          {feedback || 'Orange is this hop. Green boxes are routers making a Layer 3 decision.'}
        </p>
        <div className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{background: '#ef6c00'}} />
            this hop
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#2e7d32'}} />
            router lookup
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#90a4ae'}} />
            host dropped
          </span>
        </div>
      </div>
    </CEBlock>
  );
}
