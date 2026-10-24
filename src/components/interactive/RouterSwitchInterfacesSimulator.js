import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './routerSwitchInterfaces.module.css';

const PRIORITY = [
  {speed: 1000, duplex: 'full'},
  {speed: 100, duplex: 'full'},
  {speed: 100, duplex: 'half'},
  {speed: 10, duplex: 'full'},
  {speed: 10, duplex: 'half'},
];

const SPEED_OPTS = ['auto', '10', '100', '1000'];
const DUPLEX_OPTS = ['auto', 'full', 'half'];

const STORIES = [
  {
    id: 'default',
    ask: 'You cable a brand-new router G0/1 to a brand-new switch G0/1. Who is up?',
    answer: 'sw',
    ok: 'Switch ports start enabled (plug-and-play). Router interfaces start shutdown — you must no shutdown.',
    bad: 'Do not treat them the same. Only the switch side comes up by itself.',
  },
  {
    id: 'range',
    ask: 'SW1 F0/1 and F0/2 should say “access PCs”. Fastest IOS path?',
    answer: 'range',
    ok: 'interface range f0/1-2 then description access PCs. Comma mixes types: f0/3-8, g0/2.',
    bad: 'You can type each port, but range is the exam/time-saver. Hash marks in the string are optional.',
  },
  {
    id: 'hub',
    ask: 'Four PCs on a hub vs four PCs on a switch. Collision domains?',
    answer: 'onefour',
    ok: 'Hub = one shared medium, one collision domain, half duplex, CSMA/CD. Switch = one domain per port, full duplex.',
    bad: 'A hub repeats bits with no buffer. Two talkers at once collide. A switch stores and forwards.',
  },
  {
    id: 'bothauto',
    ask: 'Both G0/1 ends are speed auto / duplex auto (10/100/1000). They pick:',
    answer: 'gfull',
    ok: 'Best common mode: 1 Gbps full. Status shows a-full and a-1000 — the a- means autoneg chose it.',
    bad: 'Faster beats slower; full beats half. They will not settle on 100 if both can do 1000/full.',
  },
  {
    id: 'oneside',
    ask: 'SW1 F0/1 is speed 100 duplex full. R1 G0/1 is auto/auto. R1 will:',
    answer: 'half',
    ok: 'Senses 100, matches speed, then half duplex because 10/100 + auto duplex → half. Duplex mismatch. Link stays up/up.',
    bad: 'Auto does not copy the neighbor’s duplex. Only ≥1 Gbps auto-duplex is full.',
  },
  {
    id: 'speedmm',
    ask: 'One end speed 100, the other speed 1000. show ip interface brief shows:',
    answer: 'downdown',
    ok: 'Speed mismatch → both down/down. They cannot talk. Almost always a typing error.',
    bad: 'That “still up” behavior is a duplex mismatch, not a speed mismatch.',
  },
  {
    id: 'late',
    ask: 'Switched Ethernet, late collisions climbing on one side. First suspect:',
    answer: 'duplex',
    ok: 'Late collision = after byte 64. CSMA/CD should have finished by then. Usually the half-duplex end of a mismatch.',
    bad: 'Runts/CRC also rise on the full-duplex side (it sees jammed leftovers). Speed mismatch would be down, not counters.',
  },
];

const CHOICES = {
  default: [
    ['sw', 'Switch up; router still administratively down'],
    ['both', 'Both up — Ethernet always autostarts'],
    ['rtr', 'Router up; switch ports start shutdown'],
  ],
  range: [
    ['range', 'interface range f0/1-2, then description …'],
    ['vlan', 'vlan 1 name access PCs — descriptions live on VLANs'],
    ['each', 'You must enter each interface; range is NX-OS only'],
  ],
  hub: [
    ['onefour', 'Hub: 1 domain. Switch: 4 (one per port)'],
    ['fourone', 'Hub: 4 domains. Switch: 1 shared medium'],
    ['zero', 'Neither has collisions; CSMA/CD is wireless-only'],
  ],
  bothauto: [
    ['gfull', '1000 / full (shown as a-1000 a-full)'],
    ['hund', '100 / half, the safest common floor'],
    ['ten', '10 / full, because auto always starts slow'],
  ],
  oneside: [
    ['half', 'Run 100 / half — duplex mismatch, still up/up'],
    ['copy', 'Copy full duplex because it sensed 100'],
    ['down', 'Go down/down; auto never talks to a manual neighbor'],
  ],
  speedmm: [
    ['downdown', 'down / down on both ends'],
    ['upup', 'up / up, with late collisions only'],
    ['errd', 'err-disabled until you bounce the ports'],
  ],
  late: [
    ['duplex', 'Duplex mismatch — half-duplex end thinks it collided'],
    ['mtu', 'Giants from a 1500-byte MTU, which is always illegal'],
    ['hubok', 'Normal hub tax; ignore the counter on a switch'],
  ],
};

const PRESETS = {
  bothauto: {sw: {speed: 'auto', duplex: 'auto'}, r1: {speed: 'auto', duplex: 'auto'}},
  oneside: {sw: {speed: '100', duplex: 'full'}, r1: {speed: 'auto', duplex: 'auto'}},
  speedmm: {sw: {speed: '1000', duplex: 'full'}, r1: {speed: '100', duplex: 'full'}},
};

function caps(kind) {
  return kind === 'g' ? [10, 100, 1000] : [10, 100];
}

function canDo(kind, speed, duplex) {
  if (!caps(kind).includes(speed)) {
    return false;
  }
  if (speed >= 1000 && duplex === 'half') {
    return false;
  }
  return true;
}

function isAuto(side) {
  return side.speed === 'auto' && side.duplex === 'auto';
}

function oneSided(autoKind, manual) {
  const want = Number(manual.speed);
  const sensed = caps(autoKind).includes(want);
  const speed = sensed ? want : Math.min(...caps(autoKind));
  const duplex = speed >= 1000 ? 'full' : 'half';
  const issue = speed !== want ? 'speed' : duplex !== manual.duplex ? 'duplex' : null;
  return {
    auto: {speed, duplex, via: 'auto'},
    manual: {speed: want, duplex: manual.duplex, via: 'manual'},
    status: issue === 'speed' ? 'down' : 'up',
    issue,
  };
}

function resolve(sw, r1) {
  if (isAuto(sw) && isAuto(r1)) {
    const mode = PRIORITY.find((m) => canDo('g', m.speed, m.duplex) && canDo('g', m.speed, m.duplex));
    return {
      sw: {...mode, via: 'auto'},
      r1: {...mode, via: 'auto'},
      status: 'up',
      issue: null,
    };
  }
  if (isAuto(sw) && !isAuto(r1)) {
    const got = oneSided('g', r1);
    return {sw: got.auto, r1: got.manual, status: got.status, issue: got.issue};
  }
  if (!isAuto(sw) && isAuto(r1)) {
    const got = oneSided('g', sw);
    return {sw: got.manual, r1: got.auto, status: got.status, issue: got.issue};
  }
  const a = Number(sw.speed);
  const b = Number(r1.speed);
  if (a !== b) {
    return {
      sw: {speed: a, duplex: sw.duplex, via: 'manual'},
      r1: {speed: b, duplex: r1.duplex, via: 'manual'},
      status: 'down',
      issue: 'speed',
    };
  }
  const issue = sw.duplex !== r1.duplex ? 'duplex' : null;
  return {
    sw: {speed: a, duplex: sw.duplex, via: 'manual'},
    r1: {speed: b, duplex: r1.duplex, via: 'manual'},
    status: 'up',
    issue,
  };
}

function showDuplex(op, idle) {
  if (idle) {
    return 'auto';
  }
  if (op.via === 'auto') {
    return `a-${op.duplex}`;
  }
  return op.duplex;
}

function showSpeed(op, idle) {
  if (idle) {
    return 'auto';
  }
  if (op.via === 'auto') {
    return `a-${op.speed}`;
  }
  return String(op.speed);
}

export default function RouterSwitchInterfacesSimulator() {
  const [idx, setIdx] = useState(0);
  const [sw, setSw] = useState({speed: 'auto', duplex: 'auto'});
  const [r1, setR1] = useState({speed: 'auto', duplex: 'auto'});
  const [named, setNamed] = useState(false);
  const [unusedOff, setUnusedOff] = useState(false);
  const [bursts, setBursts] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const story = STORIES[idx];
  const link = useMemo(() => resolve(sw, r1), [sw, r1]);
  const late = link.issue === 'duplex' ? bursts * 3 : 0;
  const crc = link.issue === 'duplex' ? bursts * 2 : 0;

  function setStory(i) {
    const next = STORIES[i];
    setIdx(i);
    setPicked(null);
    setFeedback('');
    const preset = PRESETS[next.id];
    if (preset) {
      setSw(preset.sw);
      setR1(preset.r1);
    }
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  const rows = [
    {
      port: 'Fa0/1',
      name: named ? 'access PCs' : '',
      status: 'connected',
      duplex: 'a-full',
      speed: 'a-100',
    },
    {
      port: 'Fa0/2',
      name: named ? 'access PCs' : '',
      status: 'connected',
      duplex: 'a-full',
      speed: 'a-100',
    },
    {
      port: 'Fa0/3',
      name: unusedOff ? 'unused' : '',
      status: unusedOff ? 'disabled' : 'notconnect',
      duplex: 'auto',
      speed: 'auto',
    },
    {
      port: 'Gi0/1',
      name: named ? 'to R1' : '',
      status: link.status === 'up' ? 'connected' : 'down',
      duplex: showDuplex(link.sw, false),
      speed: showSpeed(link.sw, false),
      hit: true,
    },
    {
      port: 'Gi0/2',
      name: unusedOff ? 'unused' : '',
      status: unusedOff ? 'disabled' : 'notconnect',
      duplex: 'auto',
      speed: 'auto',
    },
  ];

  return (
    <CEBlock
      title="Speed, duplex, and a status line"
      subtitle="Autoneg picks the best common mode. One-sided auto can half-duplex you into a mismatch."
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
            <h4>R1 G0/1 — SW1 Gi0/1</h4>
            <div className={styles.ends}>
              <div>
                <p className={styles.label}>SW1 Gi0/1</p>
                <div className={styles.row}>
                  {SPEED_OPTS.map((s) => (
                    <Button
                      key={`sw-s-${s}`}
                      size="small"
                      variant={sw.speed === s ? 'contained' : 'text'}
                      onClick={() => setSw((p) => ({speed: s, duplex: s === 'auto' ? 'auto' : p.duplex === 'auto' ? 'full' : p.duplex}))}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <div className={styles.row}>
                  {DUPLEX_OPTS.map((d) => (
                    <Button
                      key={`sw-d-${d}`}
                      size="small"
                      variant={sw.duplex === d ? 'contained' : 'text'}
                      onClick={() => setSw((p) => ({speed: d === 'auto' ? 'auto' : p.speed === 'auto' ? '1000' : p.speed, duplex: d}))}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className={styles.label}>R1 G0/1</p>
                <div className={styles.row}>
                  {SPEED_OPTS.map((s) => (
                    <Button
                      key={`r1-s-${s}`}
                      size="small"
                      variant={r1.speed === s ? 'contained' : 'text'}
                      onClick={() => setR1((p) => ({speed: s, duplex: s === 'auto' ? 'auto' : p.duplex === 'auto' ? 'full' : p.duplex}))}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <div className={styles.row}>
                  {DUPLEX_OPTS.map((d) => (
                    <Button
                      key={`r1-d-${d}`}
                      size="small"
                      variant={r1.duplex === d ? 'contained' : 'text'}
                      onClick={() => setR1((p) => ({speed: d === 'auto' ? 'auto' : p.speed === 'auto' ? '1000' : p.speed, duplex: d}))}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <p
              className={`${styles.result} ${link.status === 'down' ? styles.down : link.issue === 'duplex' ? styles.warn : styles.up}`}
            >
              {`SW1 ${showSpeed(link.sw)}/${showDuplex(link.sw)}   R1 ${showSpeed(link.r1)}/${showDuplex(link.r1)}
status ${link.status === 'up' ? 'up/up' : 'down/down'}${link.issue ? `   ${link.issue} mismatch` : ''}
late collisions ${late}   CRC ${crc}`}
            </p>
            <div className={styles.row}>
              <Button size="small" variant="outlined" onClick={() => setBursts((n) => n + 1)} disabled={link.issue !== 'duplex'}>
                Burst traffic
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setSw({speed: 'auto', duplex: 'auto'});
                  setR1({speed: 'auto', duplex: 'auto'});
                  setBursts(0);
                }}
              >
                Both auto
              </Button>
            </div>
          </div>
          <div className={styles.panel}>
            <h4>show interfaces status</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Duplex</th>
                  <th>Speed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.port} className={row.hit ? styles.hit : undefined}>
                    <td>{row.port}</td>
                    <td>{row.name || '—'}</td>
                    <td>{row.status}</td>
                    <td>{row.duplex}</td>
                    <td>{row.speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.row} style={{marginTop: '0.45rem'}}>
              <Button size="small" variant="outlined" onClick={() => setNamed(true)}>
                range + description
              </Button>
              <Button size="small" variant="outlined" onClick={() => setUnusedOff(true)}>
                shutdown unused
              </Button>
            </div>
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
          {feedback || 'Set both ends, then read Status / Duplex / Speed. a- means autoneg picked it.'}
        </p>
        <p className={styles.legend}>Unused switch ports: shutdown. Access PCs: leave auto. Infra links: auto is fine; if you hard-set, hard-set both ends the same.</p>
      </div>
    </CEBlock>
  );
}
