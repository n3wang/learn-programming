import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ethernetLanSwitching.module.css';

const BCAST = 'ffff.ffff.ffff';

const HOSTS = {
  pc1: {label: 'PC1', mac: 'd8bb.c1cc.ff01', ip: '192.168.1.1', sw: 'sw1', port: 'G0/1', x: 56, y: 36},
  pc2: {label: 'PC2', mac: 'd8bb.c1cc.ff02', ip: '192.168.1.2', sw: 'sw1', port: 'G0/2', x: 56, y: 168},
  pc3: {label: 'PC3', mac: 'd8bb.c1cc.ff03', ip: '192.168.1.3', sw: 'sw2', port: 'G0/1', x: 584, y: 36},
  pc4: {label: 'PC4', mac: 'd8bb.c1cc.ff04', ip: '192.168.1.4', sw: 'sw2', port: 'G0/2', x: 584, y: 168},
};

const SWITCHES = {
  sw1: {label: 'SW1', x: 220, y: 102},
  sw2: {label: 'SW2', x: 420, y: 102},
};

const LINKS = [
  {id: 'pc1-sw1', a: 'pc1', b: 'sw1'},
  {id: 'pc2-sw1', a: 'pc2', b: 'sw1'},
  {id: 'sw1-sw2', a: 'sw1', b: 'sw2'},
  {id: 'sw2-pc3', a: 'sw2', b: 'pc3'},
  {id: 'sw2-pc4', a: 'sw2', b: 'pc4'},
];

const PORTS = {
  sw1: {'G0/0': 'sw2', 'G0/1': 'pc1', 'G0/2': 'pc2'},
  sw2: {'G0/0': 'sw1', 'G0/1': 'pc3', 'G0/2': 'pc4'},
};

const STORIES = [
  {
    id: 'lan',
    ask: 'SW3 and SW4 are cabled to each other. Hosts on either switch talk without a router. How many LANs is that?',
    answer: 'one',
    ok: 'One Layer 2 domain. A router between the switches would split them into two LANs.',
    bad: 'Physical offices are a weak cut. The LAN is “frames switch, no router in the middle.”',
  },
  {
    id: 'flood',
    ask: 'Empty MAC tables. PC1 sends a unicast frame to PC3. What does SW1 do with it?',
    answer: 'flood',
    ok: 'Unknown unicast: flood every port except the one it arrived on (G0/1).',
    bad: 'There is no dest entry yet, so SW1 cannot pick a single exit. It floods.',
  },
  {
    id: 'learn',
    ask: 'That same incoming frame has source d8bb.c1cc.ff01 on SW1 G0/1. What does SW1 write?',
    answer: 'learn',
    ok: 'Learn the source. Table row: d8bb.c1cc.ff01 → G0/1. Later frames to PC1 leave that port.',
    bad: 'Switches learn from the source field, not the destination. Dest is for the lookup.',
  },
  {
    id: 'known',
    ask: 'PC3 replies to PC1. Both switches already learned PC1. The reply is a:',
    answer: 'known',
    ok: 'Known unicast: forward only the table port. SW2 out G0/0, SW1 out G0/1. No flood.',
    bad: 'Flood is for unknown dest or broadcast. PC1 is already in both tables.',
  },
  {
    id: 'arp',
    ask: 'PC1 knows PC3’s IP (192.168.1.3) but not the MAC. The ARP request’s dest MAC is:',
    answer: 'bcast',
    ok: 'Broadcast ffff.ffff.ffff. Switches flood it. Only the host whose IP matches replies.',
    bad: 'PC1 cannot unicast yet — that is why it is asking. The reply will be unicast back.',
  },
  {
    id: 'ping',
    ask: 'After ARP, PC1 runs ping 192.168.1.3. The ICMP echo request and reply are:',
    answer: 'unicast',
    ok: 'Both ICMP messages are unicast. Cisco IOS sends five; ! is a reply, . is a timeout.',
    bad: 'ARP used a broadcast once. Ping itself is one-to-one, like any other known unicast.',
  },
];

const CHOICES = {
  lan: [
    ['one', 'One LAN (one Layer 2 domain)'],
    ['two', 'Two LANs, because there are two switches'],
    ['zero', 'Zero — a LAN requires a router'],
  ],
  flood: [
    ['flood', 'Flood all ports except G0/1'],
    ['g00', 'Forward only out G0/0, guessing the uplink'],
    ['drop', 'Drop it; empty tables mean discard'],
  ],
  learn: [
    ['learn', 'd8bb.c1cc.ff01 on G0/1 (learn the source)'],
    ['dest', 'PC3’s MAC on G0/0 (learn the destination)'],
    ['none', 'Nothing — tables are static only'],
  ],
  known: [
    ['known', 'Known unicast — forward the table port only'],
    ['flood', 'Flood again; replies always flood'],
    ['router', 'Send it to a router; switches never reverse'],
  ],
  arp: [
    ['bcast', 'ffff.ffff.ffff (broadcast)'],
    ['pc3', 'd8bb.c1cc.ff03 — PC1 already knows it'],
    ['sw1', 'SW1’s G0/1 MAC, because the switch is the next hop'],
  ],
  ping: [
    ['unicast', 'Unicast ICMP echo request and echo reply'],
    ['bcast', 'Broadcast, same as ARP, every time you ping'],
    ['l1', 'Preamble bits only — ping never uses Ethernet'],
  ],
};

function emptyTables() {
  return {sw1: {}, sw2: {}};
}

function linkKey(a, b) {
  return [a, b].sort().join('-');
}

function switchPorts(sw) {
  return Object.keys(PORTS[sw]);
}

function farEnd(sw, port) {
  return PORTS[sw][port];
}

function ingressPort(sw, from) {
  return switchPorts(sw).find((p) => farEnd(sw, p) === from);
}

function deliver(sw, inPort, frame, tables, lit, drops, log) {
  const next = {...tables, [sw]: {...tables[sw]}};
  next[sw][frame.src] = inPort;
  log.push(`${SWITCHES[sw].label} learns ${frame.src} on ${inPort}`);

  const known = next[sw][frame.dst];
  const flood = frame.dst === BCAST || !known;
  const outs = flood
    ? switchPorts(sw).filter((p) => p !== inPort)
    : known === inPort
      ? []
      : [known];

  if (flood) {
    log.push(`${SWITCHES[sw].label} floods (${frame.dst === BCAST ? 'broadcast' : 'unknown unicast'})`);
  } else if (!outs.length) {
    log.push(`${SWITCHES[sw].label} drops — dest lives on the ingress port`);
  } else {
    log.push(`${SWITCHES[sw].label} forwards out ${outs.join(', ')}`);
  }

  outs.forEach((port) => {
    const dest = farEnd(sw, port);
    lit.add(linkKey(sw, dest));
    if (HOSTS[dest]) {
      const mine = HOSTS[dest].mac === frame.dst || frame.dst === BCAST;
      if (mine) {
        log.push(`${HOSTS[dest].label} accepts the frame`);
      } else {
        drops.add(dest);
        log.push(`${HOSTS[dest].label} drops — dest MAC is not mine`);
      }
    } else if (SWITCHES[dest]) {
      deliver(dest, ingressPort(dest, sw), frame, next, lit, drops, log);
    }
  });

  Object.assign(tables, next);
}

function runFromState(tablesIn, fromId, dstMac, type, note) {
  const from = HOSTS[fromId];
  const frame = {src: from.mac, dst: dstMac, type, note};
  const tables = {sw1: {...tablesIn.sw1}, sw2: {...tablesIn.sw2}};
  const lit = new Set();
  const drops = new Set();
  const log = [`${from.label} sends ${note}`];
  lit.add(linkKey(fromId, from.sw));
  deliver(from.sw, from.port, frame, tables, lit, drops, log);
  return {frame, tables, lit: [...lit], drops: [...drops], log};
}

export default function EthernetLanSwitchingSimulator() {
  const [idx, setIdx] = useState(0);
  const [tables, setTables] = useState(emptyTables);
  const [arp, setArp] = useState({});
  const [lit, setLit] = useState([]);
  const [drops, setDrops] = useState([]);
  const [frame, setFrame] = useState(null);
  const [log, setLog] = useState(['Empty MAC tables. Send a frame or work a story.']);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');

  const story = STORIES[idx];
  const choices = CHOICES[story.id];
  const litSet = useMemo(() => new Set(lit), [lit]);
  const dropSet = useMemo(() => new Set(drops), [drops]);

  function apply(result, extraLog = []) {
    setTables(result.tables);
    setLit(result.lit);
    setDrops(result.drops);
    setFrame(result.frame);
    setLog([...result.log, ...extraLog]);
  }

  function sendUnicast(fromId, toId) {
    const dest = HOSTS[toId];
    apply(runFromState(tables, fromId, dest.mac, '0x0800 IPv4', `unicast to ${dest.label}`));
  }

  function sendArp() {
    const req = runFromState(tables, 'pc1', BCAST, 'ARP request', 'ARP who-has 192.168.1.3?');
    const afterReq = req.tables;
    const reply = runFromState(afterReq, 'pc3', HOSTS.pc1.mac, 'ARP reply', 'ARP reply ff03 is 192.168.1.3');
    setArp({pc1: {ip: HOSTS.pc3.ip, mac: HOSTS.pc3.mac}, pc3: {ip: HOSTS.pc1.ip, mac: HOSTS.pc1.mac}});
    apply(reply, req.log.concat('PC1 stores 192.168.1.3 → d8bb.c1cc.ff03 in its ARP table'));
  }

  function sendPing() {
    if (!arp.pc1) {
      sendArp();
      setLog((prev) => [...prev, 'No ARP entry yet — request/reply first, then ping can unicast.']);
      return;
    }
    const echo = runFromState(tables, 'pc1', HOSTS.pc3.mac, 'ICMP echo', 'ping 192.168.1.3 (echo request)');
    const reply = runFromState(echo.tables, 'pc3', HOSTS.pc1.mac, 'ICMP echo-reply', 'ICMP echo reply');
    apply(reply, echo.log.concat('!!!!!  5/5  RTT ~3 ms'));
  }

  function clearTables() {
    setTables(emptyTables());
    setArp({});
    setLit([]);
    setDrops([]);
    setFrame(null);
    setLog(['MAC tables and ARP cache cleared (factory-empty LAN).']);
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  return (
    <CEBlock
      title="Flood, learn, forward"
      subtitle="Two switches, four PCs. Empty tables flood; a learned dest is a single exit."
      headerAction={
        <Button
          size="small"
          variant="text"
          onClick={() => {
            setIdx((i) => (i + 1) % STORIES.length);
            setPicked(null);
            setFeedback('');
          }}
        >
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <svg className={styles.canvas} viewBox="0 0 640 210" role="img" aria-label="PC1 PC2 on SW1, PC3 PC4 on SW2">
            {LINKS.map((link) => {
              const left = HOSTS[link.a] || SWITCHES[link.a];
              const right = HOSTS[link.b] || SWITCHES[link.b];
              const key = linkKey(link.a, link.b);
              const on = litSet.has(key);
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
            {Object.entries(SWITCHES).map(([id, node]) => (
              <g key={id}>
                <rect
                  x={node.x - 34}
                  y={node.y - 18}
                  width={68}
                  height={36}
                  rx={4}
                  fill={litSet.has(linkKey(id, 'sw1')) || litSet.has(linkKey(id, 'sw2')) || lit.some((k) => k.includes(id)) ? '#1565c0' : '#cfd8dc'}
                  stroke="#37474f"
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                  {node.label}
                </text>
              </g>
            ))}
            {Object.entries(HOSTS).map(([id, node]) => {
              const dead = dropSet.has(id);
              const hot = litSet.has(linkKey(id, node.sw)) && !dead;
              return (
                <g key={id}>
                  <rect
                    x={node.x - 28}
                    y={node.y - 16}
                    width={56}
                    height={32}
                    rx={6}
                    fill={dead ? '#90a4ae' : hot ? '#ef6c00' : '#455a64'}
                    stroke="#37474f"
                  />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                    {node.label}
                  </text>
                </g>
              );
            })}
            <text x={220} y={128} textAnchor="middle" fontSize="9" fill="#546e7a">
              G0/1 · G0/0 · G0/2
            </text>
            <text x={420} y={128} textAnchor="middle" fontSize="9" fill="#546e7a">
              G0/1 · G0/0 · G0/2
            </text>
          </svg>
          <div className={styles.tables}>
            {['sw1', 'sw2'].map((sw) => {
              const rows = Object.entries(tables[sw]);
              return (
                <div key={sw} className={styles.table}>
                  <h4>{SWITCHES[sw].label} MAC table · VLAN 1</h4>
                  {rows.length ? (
                    <table>
                      <thead>
                        <tr>
                          <th>MAC</th>
                          <th>Port</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(([mac, port]) => (
                          <tr key={mac}>
                            <td>{mac}</td>
                            <td>{port}</td>
                            <td>DYNAMIC</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className={styles.empty}>empty — next unknown unicast floods</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {frame ? (
          <div className={styles.frame} aria-label="Ethernet header and trailer">
            <span className={`${styles.field} ${styles.dst}`}>
              Dst {frame.dst}
            </span>
            <span className={`${styles.field} ${styles.src}`}>
              Src {frame.src}
            </span>
            <span className={`${styles.field} ${styles.type}`}>{frame.type}</span>
            <span className={`${styles.field} ${styles.fcs}`}>FCS · CRC</span>
          </div>
        ) : null}
        <div className={styles.row}>
          <Button size="small" variant="outlined" onClick={() => sendUnicast('pc1', 'pc3')}>
            PC1 → PC3
          </Button>
          <Button size="small" variant="outlined" onClick={() => sendUnicast('pc3', 'pc1')}>
            PC3 → PC1
          </Button>
          <Button size="small" variant="outlined" onClick={sendArp}>
            ARP for .3
          </Button>
          <Button size="small" variant="outlined" onClick={sendPing}>
            ping 192.168.1.3
          </Button>
          <Button size="small" variant="text" onClick={clearTables}>
            Empty tables
          </Button>
        </div>
        <pre className={styles.log}>{log.join('\n')}</pre>
        <div className={styles.row}>
          <span className={styles.label}>Answer</span>
          {choices.map(([id, label]) => (
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
          {feedback || 'Send a frame, then name the action. Orange links are this flood or forward.'}
        </p>
        <div className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{background: '#ef6c00'}} />
            this frame’s path
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#90a4ae'}} />
            host dropped the frame
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#cfd8dc'}} />
            switch
          </span>
        </div>
      </div>
    </CEBlock>
  );
}
