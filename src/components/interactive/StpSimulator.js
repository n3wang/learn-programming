import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './stp.module.css';

const VLAN = 1;
const COST = 4;

const MAC = {
  sw1: '5254.000f.adab',
  sw2: '5254.0013.cf9a',
  sw3: '5254.0016.5d5e',
  sw4: '5254.001d.d23a',
};

const POS = {
  sw1: {x: 250, y: 42, label: 'SW1'},
  sw3: {x: 70, y: 168, label: 'SW3'},
  sw2: {x: 430, y: 42, label: 'SW2'},
  sw4: {x: 430, y: 168, label: 'SW4'},
};

const LINKS = [
  {id: 's3s1a', a: 'sw3', ap: 'G0/0', an: 1, b: 'sw1', bp: 'G0/1', bn: 2},
  {id: 's3s1b', a: 'sw3', ap: 'G0/1', an: 2, b: 'sw1', bp: 'G0/0', bn: 1},
  {id: 's3s4', a: 'sw3', ap: 'G0/2', an: 3, b: 'sw4', bp: 'G0/0', bn: 1},
  {id: 's1s4', a: 'sw1', ap: 'G0/2', an: 3, b: 'sw4', bp: 'G0/1', bn: 2},
  {id: 's1s2', a: 'sw1', ap: 'G0/3', an: 4, b: 'sw2', bp: 'G0/0', bn: 1},
  {id: 's4s2', a: 'sw4', ap: 'G0/2', an: 3, b: 'sw2', bp: 'G0/1', bn: 2},
];

const RING = [
  {id: 'r12', a: 'sw1', ap: 'G0/0', an: 1, b: 'sw2', bp: 'G0/0', bn: 1},
  {id: 'r13', a: 'sw1', ap: 'G0/1', an: 2, b: 'sw3', bp: 'G0/0', bn: 1},
  {id: 'r23', a: 'sw2', ap: 'G0/1', an: 2, b: 'sw3', bp: 'G0/1', bn: 2},
];

const STORIES = [
  {
    id: 'loop',
    ask: 'Three switches in a ring, no STP. PC1 broadcasts. What happens to the frame?',
    answer: 'storm',
    ok: 'Two copies circle forever (no Ethernet TTL). Broadcast storm plus MAC flapping — SW1 keeps rewriting PC1 onto G0/0 and G0/1.',
    bad: 'A switch does not drop a looping frame. That job is IPv4 TTL on routers, not the Ethernet header.',
    cfg: {mesh: 'ring', stp: false, pri: {}, view: 'sw1'},
  },
  {
    id: 'block',
    ask: 'STP’s one-sentence job is:',
    answer: 'onepath',
    ok: 'Block redundant links so any two nodes have exactly one active path. The blocked link is the spare, not a load-share.',
    bad: 'STP does not hash flows across both uplinks in this chapter. It leaves one path; Rapid STP is a later speed-up of the same idea.',
    cfg: {mesh: 'ring', stp: true, pri: {}, view: 'sw3'},
  },
  {
    id: 'root',
    ask: 'All four switches at default priority 32768, VLAN 1. Who is the root?',
    answer: 'sw1',
    ok: 'Displayed priority is 32769 on everyone. Lowest MAC wins: SW1 5254.000f.adab. All of SW1’s ports are designated.',
    bad: 'Lowest number wins, not “the core.” Compare priority first, then the switch MAC — not G0/0’s burned-in address.',
    cfg: {mesh: 'full', stp: true, pri: {}, view: 'sw1'},
  },
  {
    id: 'pri',
    ask: 'You want SW3 root and SW4 next. Legal commands:',
    answer: 'inc',
    ok: 'priority must be a multiple of 4096 (the four high bits). 24576 on SW3, 28672 on SW4. Displayed = value + VLAN 1. priority 0 is the surest root.',
    bad: '20000 is rejected. root primary is 24576 (or the next multiple that wins) and will not go to 0. root secondary is 28672 — not a promise if someone else is lower.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw4'},
  },
  {
    id: 'rpcost',
    ask: 'SW3 is root. How does SW4 pick its root port?',
    answer: 'g00',
    ok: 'Root advertises cost 0. SW4 hears 0 on G0/0 (+4 = 4) and 4 on G0/1 (+4 = 8). Lowest root cost wins: G0/0.',
    bad: 'Do not add both sides of the same link. Received cost + this port’s cost. 1 Gbps = 4; 100 Mbps = 19; 10 Mbps = 100; 10 Gbps = 2.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw4'},
  },
  {
    id: 'nbid',
    ask: 'SW2’s G0/0 (to SW1) and G0/1 (to SW4) both cost 8. Root port is:',
    answer: 'g01',
    ok: 'Tie on cost → lowest neighbor BID. SW4 28673 beats SW1 32769. SW2 G0/1 is the root port. SW4’s far side must be designated.',
    bad: 'You do not pick the local lower name. Neighbor BID, then neighbor port ID.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw2'},
  },
  {
    id: 'npid',
    ask: 'SW1 has two equal-cost links to the root. It picks G0/1 because:',
    answer: 'nbr',
    ok: 'Same cost, same neighbor BID. Tiebreak is the neighbor’s port ID (SW3 G0/0 = 128.1 beats G0/1 = 128.2). Not SW1’s own names.',
    bad: 'Exam trap: local G0/0 looks “lower.” STP compares the far Prio.Nbr.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw1'},
  },
  {
    id: 'dp',
    ask: 'Leftover segment SW1 G0/2 — SW4 G0/1. Who is designated?',
    answer: 'sw4d',
    ok: 'Compare each switch’s root cost (via its RP), not the leftover port. Both are 4. Then lower BID: SW4. SW1 G0/2 blocks. SW1 G0/3 beats SW2 (4 vs 8).',
    bad: 'One designated per segment. Two Ds on the same cable is a loop. Root-bridge ports are already D; the far side of a root port is already D.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw1'},
  },
  {
    id: 'timers',
    ask: 'G0/1 was the root port and silently stops getting BPDUs (link stays up). Worst-case wait before the backup forwards:',
    answer: 'fifty',
    ok: 'Max age 20, then listening 15, then learning 15 = 50 s. If the old port goes down/down, skip max age (still 30 s). Hello is 2 s; timers follow the root.',
    bad: 'Classic STP is slow on purpose so a port does not forward into a loop. PortFast is only for host ports.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw1'},
  },
  {
    id: 'fast',
    ask: 'A PC on G1/0 should not wait 30 s. Best practice:',
    answer: 'both',
    ok: 'spanning-tree portfast (or portfast default on access ports) plus bpduguard enable (or portfast bpduguard default). A BPDU err-disables; unplug, then shutdown / no shutdown.',
    bad: 'Do not PortFast a trunk to another switch. Guard without PortFast is legal; the habit is both, host ports only.',
    cfg: {mesh: 'full', stp: true, pri: {sw3: 24576, sw4: 28672}, view: 'sw1', host: true},
  },
];

const CHOICES = {
  loop: [
    ['storm', 'It loops both ways forever — storm and MAC flap'],
    ['ttl', 'TTL hits 0 and SW2 drops it'],
    ['once', 'Each switch floods once, then the frame dies'],
  ],
  block: [
    ['onepath', 'Leave one active path; block the spare'],
    ['hash', 'Hash each flow onto a different uplink'],
    ['off', 'Shutdown every redundant cable permanently'],
  ],
  root: [
    ['sw1', 'SW1 — same 32769, lowest MAC'],
    ['sw3', 'SW3 — it sits closest to the router in the drawing'],
    ['all', 'All four are root until someone types a command'],
  ],
  pri: [
    ['inc', 'priority 24576 and 28672 (multiples of 4096), or priority 0'],
    ['any', 'priority 20000 is fine; IOS scales it'],
    ['pri0fail', 'root primary always sets 0, so never use priority'],
  ],
  rpcost: [
    ['g00', 'G0/0 — received 0 plus 4 beats received 4 plus 4'],
    ['g01', 'G0/1 — two hops must be better than one'],
    ['both', 'Both become root ports so SW4 can load-share'],
  ],
  nbid: [
    ['g01', 'G0/1 toward SW4 (lower neighbor BID)'],
    ['g00', 'G0/0 toward SW1 because 0 is a lower port name'],
    ['none', 'Neither; SW2 has no root port if costs tie'],
  ],
  npid: [
    ['nbr', 'SW3 G0/0 has port ID 128.1, lower than 128.2'],
    ['local', 'SW1 G0/0 is the lower local name, so it wins'],
    ['mac', 'The lower burned-in MAC on SW1 G0/1'],
  ],
  dp: [
    ['sw4d', 'SW4 — same root cost 4, lower BID'],
    ['sw1d', 'SW1 — leftover ports always designated'],
    ['bothd', 'Both designated; designated means “can share”'],
  ],
  timers: [
    ['fifty', '50 s = max age 20 + listening 15 + learning 15'],
    ['two', '2 s, the next hello'],
    ['zero', 'Immediate; classic STP has no max age'],
  ],
  fast: [
    ['both', 'PortFast plus BPDU Guard on the host port'],
    ['trunk', 'PortFast default on the SW1–SW3 trunks'],
    ['guardonly', 'BPDU Guard on the core; PortFast is deprecated'],
  ],
};

function bidParts(id, pri) {
  return {p: (pri[id] ?? 32768) + VLAN, m: MAC[id].replace(/\./g, '').toLowerCase(), raw: MAC[id]};
}

function cmpBid(a, b) {
  if (a.p !== b.p) {
    return a.p - b.p;
  }
  return a.m < b.m ? -1 : a.m > b.m ? 1 : 0;
}

function neighbors(links) {
  const map = {};
  links.forEach((l) => {
    (map[l.a] ||= []).push({port: l.ap, nbr: l.an, peer: l.b, pport: l.bp, pnbr: l.bn, link: l.id});
    (map[l.b] ||= []).push({port: l.bp, nbr: l.bn, peer: l.a, pport: l.ap, pnbr: l.an, link: l.id});
  });
  return map;
}

function compute(links, pri) {
  const ids = [...new Set(links.flatMap((l) => [l.a, l.b]))];
  const parts = Object.fromEntries(ids.map((id) => [id, bidParts(id, pri)]));
  const root = ids.slice().sort((a, b) => cmpBid(parts[a], parts[b]))[0];
  const adj = neighbors(links);
  const rootCost = Object.fromEntries(ids.map((id) => [id, id === root ? 0 : Infinity]));
  const q = [root];
  while (q.length) {
    const cur = q.shift();
    (adj[cur] || []).forEach((n) => {
      const next = rootCost[cur] + COST;
      if (next < rootCost[n.peer]) {
        rootCost[n.peer] = next;
        q.push(n.peer);
      }
    });
  }
  const role = {};
  ids.forEach((id) => {
    role[id] = {};
    const ports = adj[id] || [];
    if (id === root) {
      ports.forEach((n) => {
        role[id][n.port] = {role: 'Desg', sts: 'FWD', cost: COST, nbr: n.nbr, peer: n.peer};
      });
      return;
    }
    const ranked = ports
      .map((n) => ({
        ...n,
        rcost: rootCost[n.peer] + COST,
        nbid: parts[n.peer],
        npid: n.pnbr,
      }))
      .sort((a, b) => {
        if (a.rcost !== b.rcost) {
          return a.rcost - b.rcost;
        }
        const nb = cmpBid(a.nbid, b.nbid);
        if (nb) {
          return nb;
        }
        return a.npid - b.npid;
      });
    const rp = ranked[0];
    ports.forEach((n) => {
      role[id][n.port] = {
        role: n.port === rp.port ? 'Root' : 'Altn',
        sts: n.port === rp.port ? 'FWD' : 'BLK',
        cost: COST,
        nbr: n.nbr,
        peer: n.peer,
        rcost: rootCost[n.peer] + COST,
      };
    });
  });
  links.forEach((l) => {
    const a = role[l.a][l.ap];
    const b = role[l.b][l.bp];
    if (a.role === 'Root') {
      b.role = 'Desg';
      b.sts = 'FWD';
    } else if (b.role === 'Root') {
      a.role = 'Desg';
      a.sts = 'FWD';
    } else if (l.a === root) {
      a.role = 'Desg';
      a.sts = 'FWD';
    } else if (l.b === root) {
      b.role = 'Desg';
      b.sts = 'FWD';
    } else {
      const left = rootCost[l.a] !== rootCost[l.b] ? rootCost[l.a] - rootCost[l.b] : cmpBid(parts[l.a], parts[l.b]);
      if (left < 0) {
        a.role = 'Desg';
        a.sts = 'FWD';
        if (b.role !== 'Root') {
          b.role = 'Altn';
          b.sts = 'BLK';
        }
      } else {
        b.role = 'Desg';
        b.sts = 'FWD';
        if (a.role !== 'Root') {
          a.role = 'Altn';
          a.sts = 'BLK';
        }
      }
    }
  });
  return {root, parts, rootCost, role, adj};
}

function portLine(port, info) {
  const name = port.replace('G', 'Gi');
  return `${name.padEnd(20)}${info.role.padEnd(5)}${info.sts.padEnd(4)}${String(info.cost).padEnd(10)}${`128.${info.nbr}`.padEnd(9)}P2p`;
}

function cliFor(id, tree, pri) {
  const me = tree.parts[id];
  const root = tree.parts[tree.root];
  const ports = Object.entries(tree.role[id] || {}).sort((a, b) => a[1].nbr - b[1].nbr);
  const isRoot = id === tree.root;
  return `${id.toUpperCase()}# show spanning-tree
VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    ${root.p}
             Address     ${root.raw}
             ${isRoot ? 'This bridge is the root' : `Cost         ${tree.rootCost[id]}`}
  Bridge ID  Priority    ${me.p} (priority ${pri[id] ?? 32768} sys-id-ext ${VLAN})
             Address     ${me.raw}

Interface           Role Sts Cost      Prio.Nbr Type
${ports.map(([p, info]) => portLine(p, info)).join('\n')}`;
}

function roleMark(info) {
  if (!info) {
    return '';
  }
  if (info.role === 'Root') {
    return 'R';
  }
  if (info.role === 'Desg') {
    return 'D';
  }
  return 'N';
}

export default function StpSimulator() {
  const [idx, setIdx] = useState(0);
  const [pri, setPri] = useState({});
  const [view, setView] = useState('sw1');
  const [flaps, setFlaps] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const story = STORIES[idx];
  const links = story.cfg.mesh === 'ring' ? RING : LINKS;
  const tree = useMemo(() => compute(links, pri), [links, pri]);

  function setStory(i) {
    const next = STORIES[i];
    setIdx(i);
    setPicked(null);
    setFeedback('');
    setFlaps(0);
    setPri(next.cfg.pri);
    setView(next.cfg.view);
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  const ids = story.cfg.mesh === 'ring' ? ['sw1', 'sw2', 'sw3'] : ['sw1', 'sw2', 'sw3', 'sw4'];

  return (
    <CEBlock
      title="One path, then the timers"
      subtitle="Elect a root, one root port per switch, one designated port per segment. The rest block."
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
            <svg className={styles.canvas} viewBox="0 0 560 260" role="img" aria-label="STP switch topology">
              {links.map((l) => {
                const A = POS[l.a];
                const B = POS[l.b];
                const aInfo = tree.role[l.a]?.[l.ap];
                const bInfo = tree.role[l.b]?.[l.bp];
                const blocked = story.cfg.stp && (aInfo?.sts === 'BLK' || bInfo?.sts === 'BLK');
                const midX = (A.x + B.x) / 2;
                const midY = (A.y + B.y) / 2;
                return (
                  <g key={l.id}>
                    <line
                      x1={A.x + 36}
                      y1={A.y + 22}
                      x2={B.x + 36}
                      y2={B.y + 22}
                      stroke={blocked ? '#c62828' : story.cfg.stp ? '#1565c0' : '#ef6c00'}
                      strokeWidth={blocked ? 3 : 5}
                      strokeDasharray={blocked ? '6 4' : undefined}
                    />
                    {story.cfg.stp ? (
                      <>
                        <text x={A.x + 36 + (midX - A.x) * 0.28} y={A.y + 18 + (midY - A.y) * 0.28} fontSize="11" fontWeight="700" fill="#37474f">
                          {roleMark(aInfo)}
                        </text>
                        <text x={B.x + 36 + (midX - B.x) * 0.28} y={B.y + 18 + (midY - B.y) * 0.28} fontSize="11" fontWeight="700" fill="#37474f">
                          {roleMark(bInfo)}
                        </text>
                      </>
                    ) : null}
                  </g>
                );
              })}
              {ids.map((id) => {
                const p = POS[id];
                const isRoot = story.cfg.stp && tree.root === id;
                return (
                  <g key={id}>
                    <rect x={p.x} y={p.y} width="72" height="44" rx="7" fill={isRoot ? '#e3f2fd' : '#eceff1'} stroke={isRoot ? '#1565c0' : '#546e7a'} strokeWidth={isRoot ? 2.4 : 1.2} />
                    <text x={p.x + 36} y={p.y + 19} textAnchor="middle" fontSize="13" fontWeight="700">
                      {p.label}
                    </text>
                    <text x={p.x + 36} y={p.y + 35} textAnchor="middle" fontSize="9" fill="#546e7a">
                      {story.cfg.stp ? `${tree.parts[id].p}` : 'no STP'}
                    </text>
                  </g>
                );
              })}
              {story.cfg.mesh === 'ring' ? (
                <text x="36" y="36" fontSize="11" fill="#ef6c00">
                  {story.cfg.stp ? 'SW3 G0/1 blocked — one path' : flaps ? `flap ×${flaps}  PC1 MAC hops ports` : 'PC1  →  flood A and B'}
                </text>
              ) : (
                <text x="24" y="248" fontSize="11" fill="#37474f">
                  {`root ${tree.root.toUpperCase()}   R root port   D designated   N non-designated (block)`}
                </text>
              )}
              {story.cfg.host ? (
                <text x="24" y="232" fontSize="11" fill="#2e7d32">
                  G1/0 PortFast + BPDU Guard — FWD now; BPDU → err-disable
                </text>
              ) : null}
            </svg>
            <div className={styles.row}>
              {ids.map((id) => (
                <Button key={id} size="small" variant={view === id ? 'contained' : 'outlined'} onClick={() => setView(id)}>
                  {id.toUpperCase()}
                </Button>
              ))}
              {story.cfg.mesh === 'ring' && !story.cfg.stp ? (
                <Button size="small" variant="outlined" onClick={() => setFlaps((n) => n + 1)}>
                  PC1 broadcast
                </Button>
              ) : null}
              <Button
                size="small"
                variant={pri.sw3 === 24576 ? 'contained' : 'outlined'}
                onClick={() => setPri({sw3: 24576, sw4: 28672})}
              >
                SW3 24576 / SW4 28672
              </Button>
              <Button size="small" variant="text" onClick={() => setPri({})}>
                All default
              </Button>
            </div>
          </div>
          <div className={styles.panel}>
            <h4>{story.cfg.stp ? 'show spanning-tree' : 'No STP — flood'}</h4>
            <pre className={styles.cli}>
              {story.cfg.stp
                ? cliFor(view, tree, pri)
                : `SW1# show mac address-table
          PC1  ${['G0/2', 'G0/0', 'G0/1'][flaps % 3]}
${flaps ? 'MAC flapping — entry for PC1 keeps moving.' : 'Connect a PC, then click PC1 broadcast.'}
Ethernet has no TTL. The frame does not age out.`}
            </pre>
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
          {feedback || 'Next story elects a root, then a root port, then a designated port. Costs assume 1 Gbps = 4.'}
        </p>
        <p className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{background: '#1565c0'}} />
            forwarding
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#c62828'}} />
            blocked
          </span>
          <span>BPDU hello 2 s · LIS/LRN 15+15 · max age 20</span>
        </p>
      </div>
    </CEBlock>
  );
}
