import React, {useEffect, useRef, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ipv4Addressing.module.css';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

const SAMPLES = [
  {ip: '192.168.100.100', prefix: 24},
  {ip: '172.20.20.127', prefix: 16},
  {ip: '10.1.2.3', prefix: 8},
  {ip: '192.168.1.1', prefix: 24},
];

const STORIES = [
  {
    id: 'ttl',
    ask: 'A packet is looping R1→R2→R3→R1. What stops it from circling forever?',
    type: 'choice',
    answer: 'ttl',
    ok: 'TTL starts (often 64). Each router subtracts 1. At 0 the packet is dropped.',
    bad: 'Ethernet FCS checks corruption, not loops. IP dest does not expire on its own.',
  },
  {
    id: 'bin',
    ask: 'Click bits until the octet equals 206. (128+64+8+4+2.)',
    type: 'bits',
    ok: '11001110. Add the weights that are 1: 128+64+8+4+2 = 206.',
  },
  {
    id: 'prefix',
    ask: '192.168.100.100/24 — which bits are the network prefix?',
    type: 'choice',
    answer: '24',
    ok: 'The first 24 bits (192.168.100). The last octet is the unique host.',
    bad: '/24 is bit count, not “24 hosts.” Hosts in the LAN share the prefix.',
  },
  {
    id: 'mask',
    ask: 'IOS wants a netmask, not /24. Which mask is /24?',
    type: 'choice',
    answer: '24mask',
    ok: '255.255.255.0 — twenty-four 1s, then eight 0s. /8 → 255.0.0.0; /16 → 255.255.0.0.',
    bad: '1s are the network half, on the left. 0.0.0.255 is not a legal mask.',
  },
  {
    id: 'cli',
    ask: 'On R1 G0/0 set 192.168.1.1/24 and enable the interface (it starts shutdown).',
    type: 'cli',
    ok: 'interface g0/0, then ip address 192.168.1.1 255.255.255.0, then no shutdown.',
  },
  {
    id: 'range',
    ask: 'PC1 is 172.20.20.127/16. Usable addresses on that LAN are:',
    type: 'choice',
    answer: 'c',
    ok: 'Network 172.20.0.0, broadcast 172.20.255.255, usable 172.20.0.1–172.20.255.254.',
    bad: 'Host bits are the last two octets. Do not freeze the third octet at 20.',
  },
  {
    id: 'klass',
    ask: '192.168.1.1 is which class, with which classful prefix?',
    type: 'choice',
    answer: 'cclass',
    ok: 'Class C: first octet 192–223, classful /24. Classful rules are legacy; subnetting is later.',
    bad: 'Class A is 0–127 /8. Class B is 128–191 /16. D/E are reserved.',
  },
];

const CHOICES = {
  ttl: [
    ['ttl', 'TTL hits 0; the router drops the packet'],
    ['fcs', 'Ethernet FCS expires after three hops'],
    ['arp', 'ARP deletes the dest MAC after five minutes'],
  ],
  prefix: [
    ['24', 'The first 24 bits: 192.168.100'],
    ['last', 'The last 24 bits: 168.100.100'],
    ['all', 'All 32 bits — /24 means 24 hosts'],
  ],
  mask: [
    ['24mask', '255.255.255.0'],
    ['rev', '0.0.0.255'],
    ['16', '255.255.0.0'],
  ],
  range: [
    ['c', '172.20.0.1 – 172.20.255.254'],
    ['a', '172.20.20.1 – 172.20.20.254'],
    ['net', '172.20.0.0 – 172.20.255.255 (including network and broadcast)'],
  ],
  klass: [
    ['cclass', 'Class C, classful /24'],
    ['a', 'Class A, classful /8'],
    ['b', 'Class B, classful /16'],
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

function decode(ip, prefix) {
  const n = toInt(parseIp(ip));
  const m = maskInt(prefix);
  const net = n & m;
  const bcast = net | (~m >>> 0);
  const hosts = prefix >= 31 ? 0 : 2 ** (32 - prefix) - 2;
  const firstOctet = parseIp(ip)[0];
  const klass =
    firstOctet < 128 ? 'A /8' : firstOctet < 192 ? 'B /16' : firstOctet < 224 ? 'C /24' : firstOctet < 240 ? 'D multicast' : 'E experimental';
  return {
    mask: fromInt(m),
    net: fromInt(net),
    bcast: fromInt(bcast),
    first: hosts ? fromInt(net + 1) : fromInt(net),
    last: hosts ? fromInt(bcast - 1) : fromInt(bcast),
    hosts,
    klass,
    bits: parseIp(ip)
      .map((o) => o.toString(2).padStart(8, '0'))
      .join(' '),
  };
}

function bitsValue(bits) {
  return bits.reduce((sum, on, i) => sum + (on ? WEIGHTS[i] : 0), 0);
}

function emptyIfaces() {
  return {
    'g0/0': {ip: '', mask: '', shut: true},
    'g0/1': {ip: '', mask: '', shut: true},
    'g0/2': {ip: '', mask: '', shut: true},
    'g0/3': {ip: '', mask: '', shut: true},
  };
}

function prefixOf(iface) {
  if (!iface.mask) {
    return null;
  }
  return iface.mask
    .split('.')
    .map((o) => Number(o).toString(2).split('1').length - 1)
    .reduce((a, b) => a + b, 0);
}

function promptOf(cli) {
  if (cli.mode === 'if') {
    return 'R1(config-if)#';
  }
  if (cli.mode === 'config') {
    return 'R1(config)#';
  }
  if (cli.mode === 'priv') {
    return 'R1#';
  }
  return 'R1>';
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

function briefLine(name, iface) {
  const gig = `GigabitEthernet${name.slice(1)}`;
  const ip = iface.ip || 'unassigned';
  const status = iface.shut ? 'administratively down' : 'up';
  const proto = iface.shut ? 'down' : 'up';
  return `${gig.padEnd(22)} ${ip.padEnd(15)} YES ${iface.ip ? 'manual' : 'unset '} ${status.padEnd(22)} ${proto}`;
}

function execLine(cli, raw) {
  const line = raw.replace(/\s+/g, ' ').trim();
  const next = {
    ...cli,
    ifaces: {
      'g0/0': {...cli.ifaces['g0/0']},
      'g0/1': {...cli.ifaces['g0/1']},
      'g0/2': {...cli.ifaces['g0/2']},
      'g0/3': {...cli.ifaces['g0/3']},
    },
  };
  const out = [];
  if (!line) {
    return {cli: next, out};
  }

  const head = firstToken(line).toLowerCase();
  const rest = restOf(line);

  if (head === 'do') {
    if (next.mode !== 'config' && next.mode !== 'if') {
      out.push('% Invalid input detected');
      return {cli: next, out};
    }
    const inner = execLine({...next, mode: 'priv'}, rest);
    return {cli: {...inner.cli, mode: next.mode, iface: next.iface}, out: inner.out};
  }

  if (matchWord(head, 'enable') && next.mode === 'user' && !rest) {
    next.mode = 'priv';
    return {cli: next, out};
  }
  if (matchWord(head, 'disable') && next.mode === 'priv') {
    next.mode = 'user';
    return {cli: next, out};
  }
  if ((matchWord(head, 'configure') && matchWord(firstToken(rest).toLowerCase() || 't', 'terminal')) || line.toLowerCase() === 'conf t') {
    if (next.mode !== 'priv' && next.mode !== 'config' && next.mode !== 'if') {
      out.push('% Invalid input detected');
      return {cli: next, out};
    }
    next.mode = 'config';
    next.iface = null;
    return {cli: next, out};
  }
  if (head === 'end') {
    next.mode = 'priv';
    next.iface = null;
    return {cli: next, out};
  }
  if (head === 'exit') {
    if (next.mode === 'if') {
      next.mode = 'config';
      next.iface = null;
    } else if (next.mode === 'config') {
      next.mode = 'priv';
    } else if (next.mode === 'priv') {
      next.mode = 'user';
    }
    return {cli: next, out};
  }

  if (matchWord(head, 'interface')) {
    if (next.mode !== 'config' && next.mode !== 'if') {
      out.push('% Invalid input detected');
      return {cli: next, out};
    }
    const name = firstToken(rest).toLowerCase().replace('gigabitethernet', 'g');
    if (!next.ifaces[name]) {
      out.push('% Invalid interface');
      return {cli: next, out};
    }
    next.mode = 'if';
    next.iface = name;
    return {cli: next, out};
  }

  if (head === 'ip' && next.mode === 'if') {
    const kind = firstToken(rest).toLowerCase();
    const args = restOf(rest).split(/\s+/);
    if (matchWord(kind, 'address') && args.length >= 2) {
      next.ifaces[next.iface].ip = args[0];
      next.ifaces[next.iface].mask = args[1];
      return {cli: next, out};
    }
  }

  if (head === 'no' && rest.toLowerCase().startsWith('shut') && next.mode === 'if') {
    next.ifaces[next.iface].shut = false;
    const gig = `GigabitEthernet${next.iface.slice(1)}`;
    out.push(`%LINK-3-UPDOWN: Interface ${gig}, changed state to up`);
    out.push(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${gig}, changed state to up`);
    return {cli: next, out};
  }
  if (matchWord(head, 'shutdown') && next.mode === 'if') {
    next.ifaces[next.iface].shut = true;
    return {cli: next, out};
  }

  if (matchWord(head, 'show')) {
    if (next.mode === 'config' || next.mode === 'if') {
      out.push("% Invalid input detected at '^' marker.");
      return {cli: next, out};
    }
    const body = rest.toLowerCase();
    if (body.startsWith('ip int') && body.includes('br')) {
      out.push('Interface              IP-Address      OK? Method Status                Protocol');
      Object.keys(next.ifaces).forEach((name) => out.push(briefLine(name, next.ifaces[name])));
      return {cli: next, out};
    }
    if (body.startsWith('ip int')) {
      const only = firstToken(restOf(restOf(rest))).toLowerCase().replace('gigabitethernet', 'g');
      const names = next.ifaces[only] ? [only] : Object.keys(next.ifaces);
      names.forEach((name) => {
        const iface = next.ifaces[name];
        const gig = `GigabitEthernet${name.slice(1)}`;
        const up = iface.shut ? 'down' : 'up';
        out.push(`${gig} is ${iface.shut ? 'administratively down' : 'up'}, line protocol is ${up}`);
        if (iface.ip) {
          out.push(`  Internet address is ${iface.ip}/${prefixOf(iface)}`);
        }
        out.push('  Broadcast address is 255.255.255.255');
        out.push('  MTU is 1500 bytes');
      });
      return {cli: next, out};
    }
  }

  out.push('% Invalid input detected');
  return {cli: next, out};
}

function cliReady(cli) {
  const a = cli.ifaces['g0/0'];
  return a.ip === '192.168.1.1' && a.mask === '255.255.255.0' && !a.shut;
}

export default function Ipv4AddressingSimulator() {
  const [idx, setIdx] = useState(0);
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [sample, setSample] = useState(0);
  const [cli, setCli] = useState({mode: 'user', iface: null, ifaces: emptyIfaces()});
  const [log, setLog] = useState(['R1 — factory interfaces are shutdown, no IPv4.']);
  const [draft, setDraft] = useState('');
  const [hist, setHist] = useState([]);
  const [histAt, setHistAt] = useState(-1);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const story = STORIES[idx];
  const octet = bitsValue(bits);
  const decoded = decode(SAMPLES[sample].ip, SAMPLES[sample].prefix);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [log, cli.mode]);

  function setStory(i) {
    setIdx(i);
    setPicked(null);
    setFeedback('');
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  function checkBits() {
    setFeedback(octet === 206 ? `Yes. ${story.ok}` : 'Not 206 yet. 128+64=192, then add 8+4+2.');
  }

  function checkCli() {
    setFeedback(cliReady(cli) ? `Yes. ${story.ok}` : 'Need G0/0 192.168.1.1 255.255.255.0 and no shutdown.');
  }

  function submit(line) {
    const shown = `${promptOf(cli)} ${line}`;
    const result = execLine(cli, line);
    setLog((prev) => [...prev, shown, ...result.out]);
    setCli(result.cli);
    if (line) {
      setHist((h) => [...h, line]);
    }
    setHistAt(-1);
    setDraft('');
    if (story.type === 'cli' && cliReady(result.cli)) {
      setFeedback(`Yes. ${story.ok}`);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(draft);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const pool =
        cli.mode === 'if'
          ? ['ip address ', 'no shutdown', 'shutdown', 'interface g0/1', 'end', 'exit', 'do show ip interface brief']
          : cli.mode === 'config'
            ? ['interface g0/0', 'interface g0/1', 'end', 'exit', 'do show ip interface brief']
            : cli.mode === 'priv'
              ? ['configure terminal', 'show ip interface brief', 'show ip interface g0/0']
              : ['enable', 'show ip interface brief'];
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

  const choices = CHOICES[story.id] || [];

  return (
    <CEBlock
      title="Octets, prefixes, and a router interface"
      subtitle="Toggle bits. Decode a /8 /16 /24. Then type IOS: interface, ip address, no shutdown."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.panel}>
          <h4>One octet · click a weight</h4>
          <div className={styles.bits}>
            {WEIGHTS.map((w, i) => (
              <div key={w} className={`${styles.bit} ${bits[i] ? styles.bitOn : ''}`}>
                <span className={styles.w}>{w}</span>
                <button
                  type="button"
                  aria-pressed={Boolean(bits[i])}
                  aria-label={`bit ${w}`}
                  onClick={() =>
                    setBits((prev) => {
                      const copy = [...prev];
                      copy[i] = copy[i] ? 0 : 1;
                      return copy;
                    })
                  }
                >
                  {bits[i] ? '1' : '0'}
                </button>
              </div>
            ))}
          </div>
          <p className={styles.meta}>
            0b{bits.join('')} = 0d{octet}
            {octet === 206 ? '  ← 206' : ''}
          </p>
        </div>
        <div className={styles.grid}>
          <div className={styles.panel}>
            <h4>Decode an address</h4>
            <div className={styles.row}>
              {SAMPLES.map((s, i) => (
                <Button key={s.ip} size="small" variant={i === sample ? 'contained' : 'text'} onClick={() => setSample(i)}>
                  {s.ip}/{s.prefix}
                </Button>
              ))}
            </div>
            <pre className={styles.decode}>
              {`binary   ${decoded.bits}
netmask  ${decoded.mask}
network  ${decoded.net}
broadcast ${decoded.bcast}
usable   ${decoded.first} – ${decoded.last}   (${decoded.hosts} hosts)
classful ${decoded.klass}`}
            </pre>
          </div>
          <pre className={styles.term} ref={termRef} onClick={() => inputRef.current && inputRef.current.focus()}>
            {log.map((line, i) => (
              <div key={i} className={styles.termLine}>
                {line}
              </div>
            ))}
            <div className={styles.cmdRow}>
              <span className={styles.cmdPrompt}>{promptOf(cli)}</span>
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
          {story.type === 'choice'
            ? choices.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.choice} ${picked === id ? styles.choiceOn : ''}`}
                  onClick={() => choose(id)}
                >
                  {label}
                </button>
              ))
            : null}
          {story.type === 'bits' ? (
            <Button size="small" variant="outlined" onClick={checkBits}>
              Check octet
            </Button>
          ) : null}
          {story.type === 'cli' ? (
            <Button size="small" variant="outlined" onClick={checkCli}>
              Check interface
            </Button>
          ) : null}
        </div>
        <p className={`${styles.hint} ${feedback && (picked === story.answer || (story.type === 'bits' && octet === 206) || (story.type === 'cli' && cliReady(cli))) ? styles.ok : feedback ? styles.bad : ''}`}>
          {feedback || 'Work the bits, the decode panel, or the CLI. Tab completes a unique prefix.'}
        </p>
        <p className={styles.legend}>Router interfaces start administratively down. `no shutdown` after the address.</p>
      </div>
    </CEBlock>
  );
}
