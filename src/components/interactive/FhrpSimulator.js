import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './fhrp.module.css';

const STORIES = [
  {
    id: 'why',
    ask: 'R1 10.0.0.1 dies. Hosts still use 10.0.0.1. No FHRP. Traffic to the internet:',
    answer: 'black',
    ok: 'The second router does not steal .1. Hosts keep ARPing for a dead gateway. Recovery is not “re-type every PC.”',
    bad: 'OSPF between R1 and R2 does not rewrite a host default gateway.',
    view: 'dead',
  },
  {
    id: 'vip',
    ask: 'R1 and R2 share VIP 10.0.0.1. A host ARPs for .1. Who answers, and with which MAC?',
    answer: 'vmac',
    ok: 'The active replies with the virtual MAC, not its burned-in address. Switches learn that MAC toward the active. Each box still has a real IP for hellos.',
    bad: 'The VIP is extra. Putting .1 on both ip address commands is a duplicate, not an FHRP.',
    view: 'vip',
  },
  {
    id: 'fail',
    ask: 'R1 (active) dies. R2 takes over. Hosts keep the same ARP row. What must move?',
    answer: 'garp',
    ok: 'R2 sends GARP: src = virtual MAC, dst = ffff.ffff.ffff. Switches flood and re-learn. Hosts stay on 10.0.0.1 → same vMAC.',
    bad: 'Hellos going quiet elects the new active. GARP is for CAM, not for PC ARP.',
    view: 'fail',
  },
  {
    id: 'hsrp',
    ask: 'HSRPv1 group 15 hello dest and virtual MAC:',
    answer: 'v1',
    ok: '224.0.0.2 and 0000.0c07.ac0f. Cisco, active/standby, preempt off. v2 is 224.0.0.102 and 0000.0c9f.fXXX (groups 0–4095).',
    bad: 'VRRP is 224.0.0.18 / 0000.5e00.01XX. GLBP shares .102 with HSRPv2 but uses 0007.b400.XXYY.',
    view: 'table',
  },
  {
    id: 'vrrp',
    ask: 'Cisco router + Juniper, same LAN gateway. Protocol and default preempt:',
    answer: 'std',
    ok: 'VRRP: master/backup, standard, preempt on, hello 224.0.0.18. HSRP and GLBP are Cisco-only.',
    bad: 'HSRPv2 is not the multi-vendor edition. 224.0.0.2 does not make a Juniper speak HSRP.',
    view: 'table',
  },
  {
    id: 'glbp',
    ask: 'One subnet. Half the PCs should use R1, half R2. You run:',
    answer: 'rr',
    ok: 'GLBP: one VIP, AVG answers ARP round-robin with each AVF’s virtual MAC (up to four AVFs). HSRP/VRRP only split by putting a different active on different subnets.',
    bad: 'Raising both HSRP priorities does not split one subnet.',
    view: 'glbp',
  },
  {
    id: 'cfg',
    ask: 'R1 .2 and R2 .3, group 1, VIP .1. Make R1 stay active (and return after a death):',
    answer: 'pri',
    ok: 'standby version 2 on both. standby 1 ip 10.0.0.1. standby 1 priority 105 and preempt on R1. Default priority 100; election is priority then highest real IP.',
    bad: 'v1 and v2 do not mix. Do not put the VIP on ip address.',
    view: 'cfg',
  },
  {
    id: 'show',
    ask: 'show standby brief: State Active, Active local, Standby 10.0.0.3, Pri 105 P. This box is:',
    answer: 'act',
    ok: 'Active, preempt on, peer .3 is standby. Long show standby adds vMAC 0000.0c9f.f001 (v2 group 1) and hello 3 / hold 10.',
    bad: 'P is not passive-interface. 105 is priority, not the hold timer.',
    view: 'cfg',
  },
];

const CHOICES = {
  why: [
    ['black', 'Black-hole until someone changes the gateway'],
    ['r2', 'Hosts ARP for .2 because it is on-LAN'],
    ['ospf', 'OSPF installs R2 as the host default'],
  ],
  vip: [
    ['vmac', 'Active: virtual MAC, not the interface MAC'],
    ['burn', 'Active: its own burned-in MAC'],
    ['both', 'Both routers ARP-reply with their own MACs'],
  ],
  fail: [
    ['garp', 'Switch CAM, via GARP from the new active'],
    ['pc', 'Every PC must clear ARP'],
    ['vip', 'The VIP itself changes to 10.0.0.2'],
  ],
  hsrp: [
    ['v1', '224.0.0.2 and 0000.0c07.ac0f'],
    ['v2', '224.0.0.102 and 0000.0c9f.f00f'],
    ['vrrp', '224.0.0.18 and 0000.5e00.010f'],
  ],
  vrrp: [
    ['std', 'VRRP — preempt on'],
    ['hsrp', 'HSRPv2 — “open” version'],
    ['glbp', 'GLBP — AVG can assign a Juniper'],
  ],
  glbp: [
    ['rr', 'GLBP — AVG rotates AVF virtual MACs'],
    ['hsrp', 'HSRP — one active owns the subnet'],
    ['pri', 'Two HSRP groups with priority 105 each'],
  ],
  cfg: [
    ['pri', 'Match version + VIP; priority 105 + preempt on R1'],
    ['ip', 'ip address 10.0.0.1 on both G0/0s'],
    ['v2one', 'standby version 2 on R1 only'],
  ],
  show: [
    ['act', 'Active, preempt on, R2 is standby'],
    ['stb', 'Standby; local means the VIP is only here'],
    ['pasv', 'P = hellos off (passive)'],
  ],
};

function cliFor(story) {
  if (story.view === 'dead') {
    return `PC> ping 8.8.8.8
  dest MAC = R1 (10.0.0.1)
  R1 is down — black hole

R2 is 10.0.0.2
  hosts do not know that`;
  }
  if (story.view === 'vip') {
    return `VIP 10.0.0.1
R1 G0/0  10.0.0.2   ACTIVE
R2 G0/0  10.0.0.3   STANDBY

PC ARP  who-has 10.0.0.1
R1 reply  vMAC 0000.0c9f.f001
  (not R1's burned-in MAC)`;
  }
  if (story.view === 'fail') {
    return `R1 hellos stop
R2 → Active

R2 GARP
  src  0000.0c9f.f001
  dst  ffff.ffff.ffff

PC ARP  10.0.0.1 → same vMAC
switches re-learn the port`;
  }
  if (story.view === 'table') {
    return `HSRP  active/standby  Cisco
  v1  224.0.0.2    0000.0c07.acXX
  v2  224.0.0.102  0000.0c9f.fXXX
  preempt off   per-subnet LB

VRRP  master/backup  standard
  224.0.0.18   0000.5e00.01XX
  preempt on

GLBP  AVG/AVF  Cisco
  224.0.0.102  0007.b400.XXYY
  per-host`;
  }
  if (story.view === 'glbp') {
    return `VIP 10.0.0.1
R1 = AVG + AVF 1   0007.b400.0101
R2 = AVF 2         0007.b400.0102

PC-A ARP → AVG replies AVF1 MAC
PC-B ARP → AVG replies AVF2 MAC
  round-robin`;
  }
  return `R1(config-if)# standby version 2
R1(config-if)# standby 1 ip 10.0.0.1
R1(config-if)# standby 1 priority 105
R1(config-if)# standby 1 preempt

R1# show standby brief
Gi0/0  1  105  P  Active  local  10.0.0.3  10.0.0.1

hello 3s   hold 10s
vMAC 0000.0c9f.f001`;
}

function caption(view) {
  if (view === 'dead') return 'Two routers. Still one gateway address.';
  if (view === 'vip') return 'Shared VIP + virtual MAC';
  if (view === 'fail') return 'Failover: GARP moves the CAM';
  if (view === 'table') return 'HSRP · VRRP · GLBP';
  if (view === 'glbp') return 'One VIP, two virtual MACs';
  return 'standby version / ip / priority / preempt';
}

function Lan({view}) {
  const r1Down = view === 'dead' || view === 'fail';
  const r1Active = view === 'vip' || view === 'cfg' || view === 'table';
  const r2Active = view === 'fail' || view === 'glbp';
  const r1Fill = r1Down ? '#eceff1' : r1Active ? '#e8f5e9' : '#fff8e1';
  const r2Fill = r2Active ? '#e8f5e9' : view === 'dead' ? '#e3f2fd' : '#fff8e1';
  const r1Stroke = r1Down ? '#90a4ae' : '#2e7d32';
  const r2Stroke = r2Active ? '#2e7d32' : '#1565c0';

  return (
    <g>
      <rect x="200" y="88" width="160" height="36" rx="6" fill="#eceff1" stroke="#546e7a" />
      <text x="280" y="111" textAnchor="middle" fontSize="12" fontWeight="700">
        LAN / SW
      </text>
      <line x1="230" y1="88" x2="90" y2="56" stroke="#90a4ae" strokeWidth="3" />
      <line x1="330" y1="88" x2="470" y2="56" stroke="#90a4ae" strokeWidth="3" />
      <line x1="240" y1="124" x2="150" y2="168" stroke="#90a4ae" strokeWidth="2" />
      <line x1="320" y1="124" x2="410" y2="168" stroke="#90a4ae" strokeWidth="2" />

      <rect x="36" y="20" width="88" height="44" rx="6" fill={r1Fill} stroke={r1Stroke} strokeWidth="2" />
      <text x="80" y="40" textAnchor="middle" fontSize="13" fontWeight="700">
        R1
      </text>
      <text x="80" y="56" textAnchor="middle" fontSize="10" fill="#37474f">
        {view === 'dead' ? '.1 down' : view === 'glbp' ? 'AVG' : r1Active ? 'ACTIVE' : 'standby'}
      </text>

      <rect x="436" y="20" width="88" height="44" rx="6" fill={r2Fill} stroke={r2Stroke} strokeWidth="2" />
      <text x="480" y="40" textAnchor="middle" fontSize="13" fontWeight="700">
        R2
      </text>
      <text x="480" y="56" textAnchor="middle" fontSize="10" fill="#37474f">
        {view === 'dead' ? '.2 idle' : view === 'glbp' ? 'AVF' : r2Active ? 'ACTIVE' : 'STANDBY'}
      </text>

      <rect x="110" y="168" width="72" height="28" rx="5" fill="#fff3e0" stroke="#ef6c00" />
      <text x="146" y="187" textAnchor="middle" fontSize="11">
        PC-A
      </text>
      <rect x="378" y="168" width="72" height="28" rx="5" fill="#fff3e0" stroke="#ef6c00" />
      <text x="414" y="187" textAnchor="middle" fontSize="11">
        PC-B
      </text>

      <text x="280" y="78" textAnchor="middle" fontSize="11" fill="#1565c0">
        {view === 'dead' ? 'gw 10.0.0.1  (R1 only)' : 'VIP 10.0.0.1'}
      </text>
    </g>
  );
}

export default function FhrpSimulator() {
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
      title="First hop stays 10.0.0.1"
      subtitle="VIP + virtual MAC. Failover is GARP for switches. HSRP / VRRP / GLBP. Exam 3.5 is describe."
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
            <svg className={styles.canvas} viewBox="0 0 560 220" role="img" aria-label="FHRP LAN">
              <Lan view={story.view} />
              <text x="24" y="214" fontSize="11" fill="#37474f">
                {caption(story.view)}
              </text>
            </svg>
          </div>
          <div className={styles.panel}>
            <h4>VIP / hello / CLI</h4>
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
          {feedback || 'Shared VIP. GARP after failover. HSRP Cisco, VRRP standard, GLBP per-host.'}
        </p>
        <p className={styles.legend}>active/standby · 224.0.0.2 / .102 / .18 · preempt · standby 1 ip</p>
      </div>
    </CEBlock>
  );
}
