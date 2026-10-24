import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ospf.module.css';

const STORIES = [
  {
    id: 'lsdb',
    ask: 'Every OSPF router in an area must hold:',
    answer: 'same',
    ok: 'The same LSDB, built by flooding LSAs. Then each box runs SPF on that map. RIP/EIGRP do not give you the diagram.',
    bad: 'Process ID is local. Distance-vector is rumor, not a shared map.',
    view: 'area',
  },
  {
    id: 'areas',
    ask: 'R3 has ifaces in area 0 and area 1. R1 injects a default from the internet. Hats:',
    answer: 'abr',
    ok: 'R3 is ABR (and backbone). R1 is internal + backbone + ASBR. Inter-area traffic crosses area 0. Single-area labs still use 0.',
    bad: 'ABR connects a non-backbone area to 0. ASBR injects external. A box can wear several hats.',
    view: 'multi',
  },
  {
    id: 'cost',
    ask: 'Default reference 100 Mbps. Cost of Gi0/0 (1 Gbps) vs Fa1/0 (100 Mbps):',
    answer: 'both1',
    ok: 'Both 1 — the formula floors below 1. auto-cost reference-bandwidth 1000 makes Fa 10 and Gi 1. Same value on every router.',
    bad: 'OSPF has no 0.1 cost. Prefer ip ospf cost on one link. bandwidth (kbps) also feeds the math but QoS reads it.',
    view: 'cost',
  },
  {
    id: 'rid',
    ask: 'First router ospf 1. Loopback0 172.16.1.1/32 is up. No router-id yet. RID is:',
    answer: 'lo',
    ok: 'Highest up/up loopback. Then physical. Manual router-id wins only after you type it (plus clear if neighbors exist). Unique; not an IP.',
    bad: 'A loopback added later does not steal the RID, even after clear. Process ID may differ from the neighbor.',
    view: 'area',
  },
  {
    id: 'iface',
    ask: 'G0/2 faces PCs. You want them reachable, no hellos on that LAN:',
    answer: 'pasv',
    ok: 'ip ospf 1 area 0 (or network) plus passive-interface g0/2. Prefix is advertised; hellos stop. Loopbacks should be passive too.',
    bad: 'Passive does not stop the advertisement. Do not OSPF the ISP iface if you only need a default out that way.',
    view: 'passive',
  },
  {
    id: 'deflt',
    ask: 'R1 has ip route 0.0.0.0/0 via the ISP. Neighbors should learn a default:',
    answer: 'orig',
    ok: 'default-information originate. R1 becomes ASBR. Neighbors install O*E2 0.0.0.0/0 [110/1]. No local default → originate stays quiet.',
    bad: 'always is out of scope. Originate does not create the static for you.',
    view: 'area',
  },
  {
    id: 'states',
    ask: 'Hellos have listed each other’s RID. No LSAs yet. State and word:',
    answer: 'twoway',
    ok: '2-Way: neighbors, not adjacent. Full (after DBD + LSR/LSU/LSAck) is adjacent. Hello → 224.0.0.5. Hello 10, dead 40.',
    bad: 'Init = hello without my RID. Loading is already swapping LSAs. Down = nothing heard.',
    view: 'states',
  },
  {
    id: 'dr',
    ask: 'Broadcast Ethernet. Priorities all 1. You raise R2’s priority. DR today:',
    answer: 'stay',
    ok: 'Unchanged — no preemption. clear the current DR: BDR becomes DR, then elect a new BDR. Winner was highest RID.',
    bad: 'DROthers stay 2-Way with each other and still learn LSAs through the DR. Priority 0 = never DR/BDR. 224.0.0.6 = DR/BDR only.',
    view: 'dr',
  },
  {
    id: 'p2p',
    ask: 'Two routers on Ethernet. Fastest Full, and a mismatch that lies:',
    answer: 'p2p',
    ok: 'ip ospf network point-to-point on both → FULL/-. Type mismatch can still print Full but will not sync LSDBs. MTU mismatch sticks in ExStart.',
    bad: 'Area, mask, hello/dead, duplicate RID, or shutdown: no neighbor. Point-to-point on one side only is the lying Full.',
    view: 'p2p',
  },
];

const CHOICES = {
  lsdb: [
    ['same', 'The same LSDB, then each runs SPF'],
    ['pid', 'The same process ID'],
    ['dv', 'Only a next-hop rumor, like RIP'],
  ],
  areas: [
    ['abr', 'R3 = ABR. R1 = ASBR (and backbone)'],
    ['swap', 'R3 = ASBR. R1 = ABR only'],
    ['none', 'Single-area forbids the word ABR'],
  ],
  cost: [
    ['both1', 'Both 1 until you raise the reference'],
    ['frac', 'Gi = 0.1, Fa = 1'],
    ['ten', 'Gi = 10, Fa = 1'],
  ],
  rid: [
    ['lo', '172.16.1.1 — highest up/up loopback'],
    ['phy', 'Highest physical, always'],
    ['pid', 'The process ID'],
  ],
  iface: [
    ['pasv', 'Activate OSPF and make G0/2 passive'],
    ['off', 'Do not activate OSPF or the prefix stays hidden'],
    ['dr', 'Force G0/2 to DR so PCs flood LSAs'],
  ],
  deflt: [
    ['orig', 'default-information originate (need a local default)'],
    ['net', 'network 0.0.0.0 0.0.0.0 area 0 on the ISP iface'],
    ['alw', 'originate always is the only legal form'],
  ],
  states: [
    ['twoway', '2-Way — neighbors, not yet adjacent'],
    ['full', 'Full — LSDBs already match'],
    ['load', 'Loading — that is LSR/LSU'],
  ],
  dr: [
    ['stay', 'Same DR — no preempt; BDR promotes if DR is cleared'],
    ['now', 'R2 is DR immediately'],
    ['all', 'Every pair goes Full; DR is cosmetic'],
  ],
  p2p: [
    ['p2p', 'Point-to-point both sides. Type mismatch = Full, no map'],
    ['one', 'Set it on one side; broadcast on the other is fine'],
    ['hello', 'Hello timer 30 is what speeds Full'],
  ],
};

function cliFor(story) {
  if (story.view === 'cost') {
    return `R1# show ip ospf interface brief
Interface PID Area  Cost
Gi0/0     1   0     1
Fa1/0     1   0     1

R1(config-router)# auto-cost reference-bandwidth 1000
Gi0/0  Cost 1
Fa1/0  Cost 10
  same reference on every router`;
  }
  if (story.view === 'passive') {
    return `R3(config-if)# ip ospf 1 area 0
R3(config-router)# passive-interface g0/2
R3(config-router)# passive-interface l0

R3# show ip protocols
  Passive Interface(s):
    GigabitEthernet0/2
    Loopback0
  prefix advertised, no hello`;
  }
  if (story.view === 'states') {
    return `R2# show ip ospf neighbor
Neighbor ID  State
172.16.1.1   INIT/DROTHER     ← hello, no my RID
172.16.1.1   2WAY/DROTHER     ← neighbors
172.16.1.1   FULL/DR          ← adjacent

hello → 224.0.0.5   DR/BDR → .6
hello 10s   dead 40s`;
  }
  if (story.view === 'dr') {
    return `R2(config-if)# ip ospf priority 100
R2# show ip ospf neighbor
172.16.1.5  FULL/DR      still DR
172.16.1.4  FULL/BDR
172.16.1.3  2WAY/DROTHER

R5# clear ip ospf process
  BDR (R4) becomes DR
  then elect a new BDR`;
  }
  if (story.view === 'p2p') {
    return `R1(config-if)# ip ospf network point-to-point
R2(config-if)# ip ospf network point-to-point
R2# show ip ospf neighbor
172.16.1.1  FULL/-

mismatch (P2P vs BROADCAST):
  still FULL, LSDBs diverge
MTU mismatch: stuck ExStart`;
  }
  if (story.view === 'multi') {
    return `area 0 = backbone
ABR: one LSDB per area
ASBR: default-information originate

O  intra-area
O IA inter-area
O*E2  0.0.0.0/0  [110/1]`;
  }
  return `R1# show ip protocols
Routing Protocol is "ospf 1"
  Router ID 172.16.1.1
  Number of areas in this router is 1
  Routing on Interfaces Configured Explicitly (Area 0):
    Loopback0
    GigabitEthernet0/0

show ip ospf database
  Type 1 every router
  Type 2 DR of a segment
  Type 5 ASBR (default)`;
}

function caption(view) {
  if (view === 'multi') {
    return 'Area 0 plus a spoke. ABR sits on the border.';
  }
  if (view === 'cost') {
    return 'Default ref 100 Mbps → Gi and Fa both cost 1';
  }
  if (view === 'passive') {
    return 'G0/2 faces PCs — advertise, do not hello';
  }
  if (view === 'states') {
    return '2-Way = neighbor · Full = adjacent';
  }
  if (view === 'dr') {
    return 'DR/BDR per segment · no preempt';
  }
  if (view === 'p2p') {
    return 'Two routers: skip the election';
  }
  return 'Area 0 · same LSDB · then SPF';
}

function Routers({multi}) {
  const boxes = [
    {id: 'R1', x: 36, y: 28, note: multi ? 'ASBR' : ''},
    {id: 'R2', x: 230, y: 28, note: ''},
    {id: 'R3', x: 36, y: 132, note: multi ? 'ABR' : ''},
    {id: 'R4', x: 230, y: 132, note: ''},
  ];
  return (
    <g>
      <line x1="72" y1="46" x2="230" y2="46" stroke="#1565c0" strokeWidth="5" />
      <line x1="54" y1="64" x2="54" y2="132" stroke="#1565c0" strokeWidth="5" />
      <line x1="248" y1="64" x2="248" y2="132" stroke="#1565c0" strokeWidth="5" />
      <line x1="72" y1="150" x2="230" y2="150" stroke="#1565c0" strokeWidth="4" />
      {multi ? <line x1="72" y1="168" x2="200" y2="188" stroke="#ef6c00" strokeWidth="3" strokeDasharray="5 4" /> : null}
      {boxes.map((b) => (
        <g key={b.id}>
          <rect x={b.x} y={b.y} width="56" height="36" rx="6" fill={b.note ? '#e3f2fd' : '#eceff1'} stroke={b.note ? '#1565c0' : '#546e7a'} strokeWidth={b.note ? 2 : 1} />
          <text x={b.x + 28} y={b.y + 23} textAnchor="middle" fontSize="13" fontWeight="700">
            {b.id}
          </text>
          {b.note ? (
            <text x={b.x + 28} y={b.y + 50} textAnchor="middle" fontSize="10" fill="#1565c0">
              {b.note}
            </text>
          ) : null}
        </g>
      ))}
      {multi ? (
        <text x="220" y="198" fontSize="11" fill="#ef6c00">
          area 1
        </text>
      ) : null}
    </g>
  );
}

export default function OspfSimulator() {
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
      title="Same map, then SPF"
      subtitle="OSPFv2 floods LSAs, then Dijkstra. 2-Way is a neighbor. Full is adjacent. Exam is single-area."
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
            <svg className={styles.canvas} viewBox="0 0 560 220" role="img" aria-label="OSPF topology">
              <Routers multi={story.view === 'multi'} />
              {story.view === 'dr' ? (
                <>
                  <text x="400" y="50" fontSize="12" fontWeight="700">
                    DR R5
                  </text>
                  <text x="400" y="70" fontSize="12">
                    BDR R4
                  </text>
                  <text x="400" y="90" fontSize="12" fill="#546e7a">
                    DROther 2-Way
                  </text>
                </>
              ) : null}
              {story.view === 'p2p' ? (
                <text x="400" y="50" fontSize="12" fontWeight="700">
                  FULL/-
                </text>
              ) : null}
              {story.view === 'passive' ? (
                <text x="360" y="168" fontSize="11" fill="#ef6c00">
                  PCs on G0/2
                </text>
              ) : null}
              <text x="24" y="210" fontSize="11" fill="#37474f">
                {caption(story.view)}
              </text>
            </svg>
          </div>
          <div className={styles.panel}>
            <h4>show ip ospf / protocols</h4>
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
          {feedback || 'Same LSDB in an area. Cost floors to 1. RID unique. 2-Way vs Full. LSA 1 / 2 / 5.'}
        </p>
        <p className={styles.legend}>area 0 · ref/bw · 224.0.0.5 · hello 10 / dead 40 · DR then BDR</p>
      </div>
    </CEBlock>
  );
}
