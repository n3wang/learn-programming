import React, {useEffect, useRef, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './routingFundamentals.module.css';

const NODES = {
  pc1: {label: 'PC1', x: 40, y: 44, kind: 'pc'},
  r1: {label: 'R1', x: 180, y: 120, kind: 'rtr'},
  r2: {label: 'R2', x: 360, y: 120, kind: 'rtr'},
  r3: {label: 'R3', x: 540, y: 120, kind: 'rtr'},
  pc3: {label: 'PC3', x: 680, y: 44, kind: 'pc'},
};

const LINKS = [
  {id: 'pc1-r1', a: 'pc1', b: 'r1'},
  {id: 'r1-r2', a: 'r1', b: 'r2'},
  {id: 'r2-r3', a: 'r2', b: 'r3'},
  {id: 'r3-pc3', a: 'r3', b: 'pc3'},
];

const CONNECTED = {
  r1: [
    {code: 'C', net: '192.168.1.0/24', via: 'directly connected', iface: 'GigabitEthernet0/1'},
    {code: 'L', net: '192.168.1.1/32', via: 'directly connected', iface: 'GigabitEthernet0/1'},
    {code: 'C', net: '192.168.12.0/24', via: 'directly connected', iface: 'GigabitEthernet0/0'},
    {code: 'L', net: '192.168.12.1/32', via: 'directly connected', iface: 'GigabitEthernet0/0'},
  ],
  r2: [
    {code: 'C', net: '192.168.12.0/24', via: 'directly connected', iface: 'GigabitEthernet0/0'},
    {code: 'L', net: '192.168.12.2/32', via: 'directly connected', iface: 'GigabitEthernet0/0'},
    {code: 'C', net: '192.168.23.0/24', via: 'directly connected', iface: 'GigabitEthernet0/1'},
    {code: 'L', net: '192.168.23.1/32', via: 'directly connected', iface: 'GigabitEthernet0/1'},
  ],
  r3: [
    {code: 'C', net: '192.168.23.0/24', via: 'directly connected', iface: 'GigabitEthernet0/0'},
    {code: 'L', net: '192.168.23.2/32', via: 'directly connected', iface: 'GigabitEthernet0/0'},
    {code: 'C', net: '192.168.3.0/24', via: 'directly connected', iface: 'GigabitEthernet0/1'},
    {code: 'L', net: '192.168.3.1/32', via: 'directly connected', iface: 'GigabitEthernet0/1'},
  ],
};

const NEEDED = {
  r2: [
    {code: 'S', net: '192.168.1.0/24', via: '192.168.12.1', iface: null, kind: 'recursive'},
    {code: 'S', net: '192.168.3.0/24', via: '192.168.23.2', iface: null, kind: 'recursive'},
  ],
  r3: [{code: 'S', net: '192.168.1.0/24', via: '192.168.23.1', iface: null, kind: 'recursive'}],
};

const STORIES = [
  {
    id: 'local',
    ask: 'PC1 (192.168.1.11/24) sends to PC2 (192.168.1.12). Dest MAC is:',
    type: 'choice',
    answer: 'pc2',
    ok: 'Same prefix. Frame to PC2’s MAC (ARP if needed). R1 is not in the path.',
    bad: 'The gateway is only for dest IPs outside 192.168.1.0/24.',
  },
  {
    id: 'remote',
    ask: 'PC1 sends to 192.168.3.11. First dest MAC is:',
    type: 'choice',
    answer: 'gw',
    ok: 'Off-LAN. Packet dest IP is still PC3. Frame dest MAC is R1 G0/1 (the default gateway).',
    bad: 'PC1 never ARPs a remote host. It ARPs 192.168.1.1.',
  },
  {
    id: 'cl',
    ask: 'R1 G0/1 is 192.168.1.1/24, up/up. show ip route grows:',
    type: 'choice',
    answer: 'cl',
    ok: 'C 192.168.1.0/24 (network route) and L 192.168.1.1/32 (host route). Empty table until the interface is addressed and up.',
    bad: 'Switches learn MACs alone. Routers do not invent remote prefixes.',
  },
  {
    id: 'pick',
    ask: 'Packet dest 192.168.1.1 hits C /24 and L /32. R1:',
    type: 'choice',
    answer: 'local',
    ok: 'Most specific matching route is L /32. Receive for self — do not forward out G0/1.',
    bad: 'Switches want an exact MAC. Routers want the longest prefix that still matches.',
  },
  {
    id: 'drop',
    ask: 'Dest 192.168.3.11, R1 has only connected/local. R1:',
    type: 'choice',
    answer: 'drop',
    ok: 'No matching route → drop. Routers never flood packets. A default /0 would catch it.',
    bad: 'Unknown unicast flood is a switch behavior.',
  },
  {
    id: 'static',
    ask: 'On R1, add a recursive static to 192.168.3.0/24 via 192.168.12.2.',
    type: 'cli',
    ok: 'ip route 192.168.3.0 255.255.255.0 192.168.12.2 — then a second lookup finds G0/0.',
  },
  {
    id: 'deflt',
    ask: 'ip route 0.0.0.0 0.0.0.0 203.0.113.2 is selected when:',
    type: 'choice',
    answer: 'none',
    ok: 'Least specific. Gateway of last resort. Used only if nothing longer matches — typical internet dump.',
    bad: 'A /0 never beats a /24. It is the floor, not the ceiling.',
  },
];

const CHOICES = {
  local: [
    ['pc2', 'PC2’s MAC — same LAN, no router'],
    ['gw', 'R1 G0/1, because every IP packet goes to a gateway'],
    ['bcast', 'ffff.ffff.ffff, because IPv4 is always broadcast'],
  ],
  remote: [
    ['gw', 'R1 G0/1 — default gateway MAC'],
    ['pc3', 'PC3’s MAC, learned by a campus-wide ARP'],
    ['r3', 'R3 G0/1, because that is PC3’s LAN'],
  ],
  cl: [
    ['cl', 'C …/24 connected and L …/32 local'],
    ['ospf', 'OSPF populates everything the moment Gigabit comes up'],
    ['empty', 'Still empty — you must type ip route for connected nets too'],
  ],
  pick: [
    ['local', 'Select L /32 and receive the packet'],
    ['conn', 'Select C /24 and hairpin it out G0/1'],
    ['both', 'Install both actions; routers ECMP every tie'],
  ],
  drop: [
    ['drop', 'Drop it — no flood'],
    ['flood', 'Flood every interface except ingress'],
    ['arp', 'ARP for 192.168.3.11 on every connected LAN'],
  ],
  deflt: [
    ['none', 'No longer prefix matches — including random internet dests'],
    ['always', 'Always, because /0 is the most specific possible route'],
    ['lan', 'Only for dests in 192.168.0.0/16'],
  ],
};

function parseIp(dotted) {
  return dotted.split('.').map((p) => Number(p));
}

function toInt(octets) {
  return octets.reduce((acc, n) => ((acc << 8) + n) >>> 0, 0);
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

function prefixOfMask(mask) {
  return mask
    .split('.')
    .map((o) => Number(o).toString(2).split('1').length - 1)
    .reduce((a, b) => a + b, 0);
}

function matches(ip, cidr) {
  const [net, p] = cidr.split('/');
  const prefix = Number(p);
  const m = maskInt(prefix);
  return (toInt(parseIp(ip)) & m) === (toInt(parseIp(net)) & m);
}

function pickRoute(routes, dest) {
  const hits = routes.filter((r) => matches(dest, r.net));
  if (!hits.length) {
    return null;
  }
  hits.sort((a, b) => Number(b.net.split('/')[1]) - Number(a.net.split('/')[1]));
  return hits[0];
}

function isIface(tok) {
  const t = (tok || '').toLowerCase();
  return t.startsWith('g') || t.startsWith('gigabit');
}

function matchWord(typed, full) {
  return typed.length > 0 && full.startsWith(typed);
}

function firstToken(line) {
  return line.trim().split(/\s+/)[0] || '';
}

function restOf(line) {
  const t = line.trim();
  const i = t.search(/\s/);
  return i === -1 ? '' : t.slice(i + 1).trim();
}

function promptOf(name, mode) {
  if (mode === 'config') {
    return `${name.toUpperCase()}(config)#`;
  }
  if (mode === 'priv') {
    return `${name.toUpperCase()}#`;
  }
  return `${name.toUpperCase()}>`;
}

function formatTable(routes) {
  const def = routes.find((r) => r.net === '0.0.0.0/0');
  const lines = [
    'Codes: L - local, C - connected, S - static',
    def ? `Gateway of last resort is ${def.via} to network 0.0.0.0` : 'Gateway of last resort is not set',
    '',
  ];
  const sorted = [...routes].sort((a, b) => a.net.localeCompare(b.net));
  sorted.forEach((r) => {
    if (r.code === 'C') {
      lines.push(`C    ${r.net} is directly connected, ${r.iface}`);
    } else if (r.code === 'L') {
      lines.push(`L    ${r.net} is directly connected, ${r.iface}`);
    } else if (r.kind === 'connected') {
      lines.push(`S    ${r.net} is directly connected, ${r.iface}`);
    } else if (r.kind === 'full') {
      lines.push(`S    ${r.net} [1/0] via ${r.via}, ${r.iface}`);
    } else {
      const star = r.net === '0.0.0.0/0' ? '*' : ' ';
      lines.push(`S${star}   ${r.net} [1/0] via ${r.via}`);
    }
  });
  return lines;
}

function seedRoutes() {
  return {
    r1: CONNECTED.r1.map((r) => ({...r})),
    r2: CONNECTED.r2.map((r) => ({...r})),
    r3: CONNECTED.r3.map((r) => ({...r})),
  };
}

function addStatic(list, route) {
  const without = list.filter((r) => !(r.code === 'S' && r.net === route.net));
  return [...without, route];
}

function hasRecursiveR1(routes) {
  return routes.r1.some((r) => r.code === 'S' && r.net === '192.168.3.0/24' && r.via === '192.168.12.2');
}

function ifaceName(tok) {
  const t = (tok || '').toLowerCase();
  if (t.includes('0/1')) {
    return 'GigabitEthernet0/1';
  }
  return 'GigabitEthernet0/0';
}

function execLine(box, mode, routes, raw) {
  const line = raw.replace(/\s+/g, ' ').trim();
  const out = [];
  let nextMode = mode;
  let nextRoutes = {
    r1: routes.r1.map((r) => ({...r})),
    r2: routes.r2.map((r) => ({...r})),
    r3: routes.r3.map((r) => ({...r})),
  };
  if (!line) {
    return {mode: nextMode, routes: nextRoutes, out};
  }
  const head = firstToken(line).toLowerCase();
  const rest = restOf(line);

  if (head === 'do') {
    if (nextMode !== 'config') {
      out.push('% Invalid input detected');
      return {mode: nextMode, routes: nextRoutes, out};
    }
    const inner = execLine(box, 'priv', nextRoutes, rest);
    return {mode: nextMode, routes: inner.routes, out: inner.out};
  }
  if (matchWord(head, 'enable') && nextMode === 'user') {
    return {mode: 'priv', routes: nextRoutes, out};
  }
  if ((matchWord(head, 'configure') && matchWord(firstToken(rest).toLowerCase() || 't', 'terminal')) || line.toLowerCase() === 'conf t') {
    if (nextMode === 'user') {
      out.push('% Invalid input detected');
      return {mode: nextMode, routes: nextRoutes, out};
    }
    return {mode: 'config', routes: nextRoutes, out};
  }
  if (head === 'end') {
    return {mode: 'priv', routes: nextRoutes, out};
  }
  if (head === 'exit') {
    return {mode: nextMode === 'config' ? 'priv' : 'user', routes: nextRoutes, out};
  }
  if (head === 'ip' && matchWord(firstToken(rest).toLowerCase(), 'route')) {
    if (nextMode !== 'config') {
      out.push('% Invalid input detected');
      return {mode: nextMode, routes: nextRoutes, out};
    }
    const args = restOf(rest).split(/\s+/).filter(Boolean);
    const dest = args[0];
    const mask = args[1];
    const extra = args.slice(2);
    if (!dest || !mask || !extra.length) {
      out.push('% Incomplete command');
      return {mode: nextMode, routes: nextRoutes, out};
    }
    const prefix = prefixOfMask(mask);
    const net = `${dest}/${prefix}`;
    let route;
    if (extra.length === 1 && isIface(extra[0])) {
      route = {code: 'S', net, via: null, iface: ifaceName(extra[0]), kind: 'connected'};
    } else if (extra.length >= 2 && isIface(extra[0])) {
      route = {code: 'S', net, via: extra[1], iface: ifaceName(extra[0]), kind: 'full'};
    } else {
      route = {code: 'S', net, via: extra[0], iface: null, kind: 'recursive'};
    }
    nextRoutes[box] = addStatic(nextRoutes[box], route);
    return {mode: nextMode, routes: nextRoutes, out};
  }
  if (head === 'no' && /^ip\s+route/i.test(rest)) {
    const args = rest.replace(/^ip\s+route\s+/i, '').split(/\s+/).filter(Boolean);
    const dest = args[0];
    const mask = args[1];
    if (dest && mask) {
      const net = `${dest}/${prefixOfMask(mask)}`;
      nextRoutes[box] = nextRoutes[box].filter((r) => !(r.code === 'S' && r.net === net));
    }
    return {mode: nextMode, routes: nextRoutes, out};
  }
  if (matchWord(head, 'show')) {
    if (nextMode === 'config') {
      out.push("% Invalid input detected at '^' marker.");
      return {mode: nextMode, routes: nextRoutes, out};
    }
    const body = rest.toLowerCase();
    if (matchWord(firstToken(body), 'ip') && matchWord(firstToken(restOf(body)), 'route')) {
      const onlyStatic = body.includes('static');
      const rows = onlyStatic ? nextRoutes[box].filter((r) => r.code === 'S') : nextRoutes[box];
      out.push(...formatTable(rows));
      return {mode: nextMode, routes: nextRoutes, out};
    }
  }
  out.push('% Invalid input detected');
  return {mode: nextMode, routes: nextRoutes, out};
}

function towardR2(route) {
  if (!route || route.code === 'L') {
    return false;
  }
  if (route.via === '192.168.12.2') {
    return true;
  }
  if (route.iface === 'GigabitEthernet0/0' && route.net !== '192.168.1.0/24') {
    return true;
  }
  return false;
}

function pingWalk(routes) {
  const log = ['PC1 ping 192.168.3.11 — dest IP stays PC3.'];
  log.push('Off-LAN: frame to R1 G0/1 (gateway).');
  const r1 = pickRoute(routes.r1, '192.168.3.11');
  if (!r1 || r1.code === 'C' || r1.code === 'L') {
    log.push('R1: no matching route to 192.168.3.0/24. Drop.');
    return {ok: false, log, lit: ['pc1', 'r1', 'pc1-r1']};
  }
  log.push(`R1 longest match ${r1.code} ${r1.net}${r1.via ? ` via ${r1.via}` : ''}.`);
  if (r1.kind === 'recursive' && r1.via) {
    const hop = pickRoute(routes.r1, r1.via);
    log.push(`Recursive lookup for ${r1.via} → ${hop ? hop.iface : 'none'}.`);
  }
  if (!towardR2(r1)) {
    log.push(`Next hop ${r1.via || r1.iface} is not R2. Packet leaves toward the internet (or nowhere useful).`);
    return {ok: false, log, lit: ['pc1', 'r1', 'pc1-r1']};
  }
  const r2 = pickRoute(routes.r2, '192.168.3.11');
  if (!r2 || r2.code === 'L') {
    log.push('R2 has no route to 192.168.3.0/24. Drop. Use Static on R2/R3.');
    return {ok: false, log, lit: ['pc1', 'r1', 'r2', 'pc1-r1', 'r1-r2']};
  }
  log.push(`R2 match ${r2.code} ${r2.net}${r2.via ? ` via ${r2.via}` : ''}.`);
  const r3 = pickRoute(routes.r3, '192.168.3.11');
  if (!r3) {
    log.push('R3 has no match. Drop.');
    return {ok: false, log, lit: ['pc1', 'r1', 'r2', 'r3', 'pc1-r1', 'r1-r2', 'r2-r3']};
  }
  log.push(`R3 match ${r3.code} ${r3.net} — connected last hop, ARP PC3.`);
  log.push('Reply needs S 192.168.1.0/24 on R3 and R2 (Static on R2/R3).');
  return {ok: true, log, lit: ['pc1', 'r1', 'r2', 'r3', 'pc3', 'pc1-r1', 'r1-r2', 'r2-r3', 'r3-pc3']};
}

export default function RoutingFundamentalsSimulator() {
  const [idx, setIdx] = useState(0);
  const [box, setBox] = useState('r1');
  const [mode, setMode] = useState('user');
  const [routes, setRoutes] = useState(seedRoutes);
  const [log, setLog] = useState(['R1/R2/R3 already have C and L. Remote prefixes are missing until you type ip route.']);
  const [draft, setDraft] = useState('');
  const [hist, setHist] = useState([]);
  const [histAt, setHistAt] = useState(-1);
  const [lit, setLit] = useState([]);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const story = STORIES[idx];
  const litSet = new Set(lit);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [log, mode, box]);

  function setStory(i) {
    setIdx(i);
    setPicked(null);
    setFeedback('');
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  function submit(line) {
    const shown = `${promptOf(box, mode)} ${line}`;
    const result = execLine(box, mode, routes, line);
    setLog((prev) => [...prev, shown, ...result.out]);
    setMode(result.mode);
    setRoutes(result.routes);
    if (line) {
      setHist((h) => [...h, line]);
    }
    setHistAt(-1);
    setDraft('');
    if (story.type === 'cli' && hasRecursiveR1(result.routes)) {
      setFeedback(`Yes. ${story.ok}`);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(draft);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const pool =
        mode === 'config'
          ? ['ip route 192.168.3.0 255.255.255.0 192.168.12.2', 'ip route 0.0.0.0 0.0.0.0 203.0.113.2', 'end', 'do show ip route']
          : mode === 'priv'
            ? ['configure terminal', 'show ip route', 'show ip route static']
            : ['enable', 'show ip route'];
      const hits = pool.filter((c) => c.startsWith(draft));
      if (hits.length === 1) {
        setDraft(hits[0]);
      }
    }
    if (e.key === 'ArrowUp' && hist.length) {
      e.preventDefault();
      const at = histAt < 0 ? hist.length - 1 : Math.max(0, histAt - 1);
      setHistAt(at);
      setDraft(hist[at]);
    }
    if (e.key === 'ArrowDown' && histAt >= 0) {
      e.preventDefault();
      const at = histAt + 1;
      if (at >= hist.length) {
        setHistAt(-1);
        setDraft('');
      } else {
        setHistAt(at);
        setDraft(hist[at]);
      }
    }
  }

  function fillOthers() {
    setRoutes((prev) => ({
      r1: prev.r1,
      r2: NEEDED.r2.reduce((list, r) => addStatic(list, r), prev.r2.map((x) => ({...x}))),
      r3: NEEDED.r3.reduce((list, r) => addStatic(list, r), prev.r3.map((x) => ({...x}))),
    }));
    setLog((prev) => [...prev, 'Installed recursive statics on R2 and R3 (the return path).']);
  }

  function ping() {
    const walk = pingWalk(routes);
    setLog((prev) => [...prev, ...walk.log]);
    setLit(walk.lit);
  }

  return (
    <CEBlock
      title="Longest match, then the next hop"
      subtitle="C and L appear when the interface is up. Remote nets need ip route. Dest IP never changes."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <svg className={styles.canvas} viewBox="0 0 720 180" role="img" aria-label="PC1 R1 R2 R3 PC3">
            {LINKS.map((link) => {
              const a = NODES[link.a];
              const b = NODES[link.b];
              const on = litSet.has(link.id);
              return (
                <line
                  key={link.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={on ? '#ef6c00' : '#90a4ae'}
                  strokeWidth={on ? 3.2 : 1.5}
                />
              );
            })}
            {Object.entries(NODES).map(([id, node]) => (
              <g key={id}>
                <rect
                  x={node.x - 28}
                  y={node.y - 16}
                  width={56}
                  height={32}
                  rx={node.kind === 'rtr' ? 2 : 6}
                  fill={litSet.has(id) ? (node.kind === 'rtr' ? '#2e7d32' : '#ef6c00') : node.kind === 'rtr' ? '#66bb6a' : '#455a64'}
                  stroke="#37474f"
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                  {node.label}
                </text>
              </g>
            ))}
            <text x={110} y={168} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.1.0/24
            </text>
            <text x={270} y={88} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.12.0/24
            </text>
            <text x={450} y={88} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.23.0/24
            </text>
            <text x={610} y={168} textAnchor="middle" fontSize="9" fill="#546e7a">
              192.168.3.0/24
            </text>
          </svg>
          <pre className={styles.term} ref={termRef} onClick={() => inputRef.current && inputRef.current.focus()}>
            {log.map((line, i) => (
              <div key={i} className={styles.termLine}>
                {line}
              </div>
            ))}
            <div className={styles.cmdRow}>
              <span className={styles.cmdPrompt}>{promptOf(box, mode)}</span>
              <input
                ref={inputRef}
                className={styles.cmdInput}
                value={draft}
                aria-label="IOS command"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
              />
            </div>
          </pre>
        </div>
        <div className={styles.row}>
          {['r1', 'r2', 'r3'].map((id) => (
            <Button
              key={id}
              size="small"
              variant={box === id ? 'contained' : 'text'}
              onClick={() => {
                setBox(id);
                setMode('user');
              }}
            >
              {id.toUpperCase()}
            </Button>
          ))}
          <Button size="small" variant="outlined" onClick={fillOthers}>
            Static on R2/R3
          </Button>
          <Button size="small" variant="outlined" onClick={ping}>
            PC1 ping PC3
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setRoutes(seedRoutes());
              setMode('user');
              setLit([]);
              setLog(['Tables reset to connected and local only.']);
            }}
          >
            Reset tables
          </Button>
        </div>
        <div className={styles.row}>
          {story.type === 'choice'
            ? (CHOICES[story.id] || []).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.choice} ${picked === id ? styles.choiceOn : ''}`}
                  onClick={() => choose(id)}
                >
                  {label}
                </button>
              ))
            : (
              <Button size="small" variant="outlined" onClick={() => setFeedback(hasRecursiveR1(routes) ? `Yes. ${story.ok}` : 'Need: ip route 192.168.3.0 255.255.255.0 192.168.12.2')}>
                Check route
              </Button>
            )}
        </div>
        <p className={`${styles.hint} ${feedback && (picked === story.answer || (story.type === 'cli' && hasRecursiveR1(routes))) ? styles.ok : feedback ? styles.bad : ''}`}>
          {feedback || 'enable, conf t, ip route … Tab completes a unique prefix. show ip route from EXEC.'}
        </p>
        <p className={styles.legend}>Recursive = next-hop IP only. Directly connected static = exit interface (proxy ARP). Fully specified = both.</p>
      </div>
    </CEBlock>
  );
}
