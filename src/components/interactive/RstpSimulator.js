import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './rstp.module.css';

const STORIES = [
  {
    id: 'mode',
    ask: 'show spanning-tree says protocol ieee. The switch is running:',
    answer: 'pvst',
    ok: 'Cisco never runs vanilla 802.1D. mode pvst prints ieee. mode rapid-pvst prints rstp. That is Rapid PVST+ — one tree per VLAN.',
    bad: 'ieee is not “the IEEE standard.” It is PVST+. rstp in that line is Rapid PVST+, not 802.1w alone.',
    view: 'mode',
  },
  {
    id: 'same',
    ask: 'RSTP’s tree, compared with classic STP on the same cables:',
    answer: 'altn',
    ok: 'Same election: lowest BID, one root port, one designated per segment. Nondesignated is now alternate (or, rarely, backup).',
    bad: 'The algorithm did not change. Only the leftover role’s name — and the speed — changed.',
    view: 'mesh',
  },
  {
    id: 'bpdu',
    ask: 'Who originates BPDUs every 2 s in RSTP?',
    answer: 'alldesg',
    ok: 'Every switch sends on its designated ports, even if the root went quiet. Classic STP only forwards the root’s hello.',
    bad: 'Do not wait for the root to speak first. That is 802.1D.',
    view: 'mesh',
  },
  {
    id: 'cost',
    ask: 'Long path-cost method. 10 Gbps is 2,000. 1 Gbps is:',
    answer: '20k',
    ok: 'Ten times slower → ten times the cost: 20,000. 100 Gbps = 200. Short method (10M=100, 1G=4, 10G=2) is still default on many boxes. show spanning-tree pathcost method.',
    bad: 'Long costs are not 4 and 2. spanning-tree pathcost method long | short.',
    view: 'cost',
  },
  {
    id: 'state',
    ask: 'An RSTP port that just came up starts in:',
    answer: 'disc',
    ok: 'Discarding (STP blocking + listening). Alternate/backup stay there. Root/designated go FWD now if sync works, else 15+15 like classic.',
    bad: 'show spanning-tree still prints BLK. Learning still exists. Sync internals are not on the exam.',
    view: 'mesh',
  },
  {
    id: 'roles',
    ask: 'SW3 (root) and SW1 share a hub. SW3 G0/1 is:',
    answer: 'back',
    ok: 'SW3 is the designated bridge, so the leftover local port is backup (Back BLK). SW1’s leftover is alternate (other switch is designated). Lowest local port ID wins DP/RP on that hub.',
    bad: 'Backup is not “any blocker.” It is a discarding port that faces a designated port on the same switch, via a hub.',
    view: 'hub',
  },
  {
    id: 'tc',
    ask: 'Root port stays up but BPDUs stop. RSTP waits, then syncs. Worst case is about:',
    answer: 'six',
    ok: 'Three missed hellos (3 × 2 s = 6 s), then sync → FWD. Classic was max age 20 + 30. If the port goes down/down, skip the 6 s — often under 1 s.',
    bad: 'RSTP does not keep max age 20 as the first wait. Edge up/down is not a topology change.',
    view: 'mesh',
  },
  {
    id: 'link',
    ask: 'RSTP link types, and how you get edge:',
    answer: 'p2p',
    ok: 'Full duplex → P2p (sync). Half → Shr (no sync, 30 s). Edge = spanning-tree portfast, not link-type. IOS: P2p Edge or Shr Edge.',
    bad: 'There is no spanning-tree link-type edge. A PC without PortFast still waits 30 s.',
    view: 'types',
  },
  {
    id: 'rootg',
    ask: 'A customer switch with a better BID plugs into your edge. Root Guard on that port:',
    answer: 'rinc',
    ok: 'Superior BPDU → root-inconsistent (BKN *ROOT_Inc). Topology stays yours. Inferior again → auto recover. spanning-tree guard root.',
    bad: 'Root Guard does not wait for missing BPDUs. That is Loop Guard. They cannot share a port.',
    view: 'rootg',
  },
  {
    id: 'loopg',
    ask: 'SW2 stops sending BPDUs (software fault). SW3’s alternate has Loop Guard. The port:',
    answer: 'linc',
    ok: 'Goes loop-inconsistent (BKN *LOOP_Inc) instead of becoming designated/FWD and closing a loop. BPDUs return → auto recover. spanning-tree guard loop.',
    bad: 'Without Loop Guard, max age (or RSTP’s 6 s) would promote the alternate and the triangle would flood.',
    view: 'loopg',
  },
  {
    id: 'filter',
    ask: 'spanning-tree bpdufilter enable on one interface:',
    answer: 'off',
    ok: 'No send, ignore receive — STP is off on that port. A second switch can loop you. Global portfast bpdufilter default only stops sending; a BPDU kills PortFast and Filter.',
    bad: 'Interface Filter is not BPDU Guard (err-disable on a BPDU). Prefer Guard on host ports; treat Filter as a last resort.',
    view: 'filter',
  },
];

const CHOICES = {
  mode: [
    ['pvst', 'PVST+ (Cisco’s 802.1D-per-VLAN)'],
    ['dot1d', 'IEEE 802.1D with one tree for the LAN'],
    ['rstp', 'Rapid PVST+ — ieee always means rapid'],
  ],
  same: [
    ['altn', 'Same roles except leftover ports are alternate (or backup)'],
    ['newroot', 'RSTP elects the highest BID so the core wins'],
    ['two', 'Every switch gets two root ports'],
  ],
  bpdu: [
    ['alldesg', 'Every switch, out of designated ports'],
    ['rootonly', 'Only the root; others just flood its hello'],
    ['altn', 'Only alternate ports, to keep the spare warm'],
  ],
  cost: [
    ['20k', '20,000'],
    ['four', '4 — long method keeps the short table'],
    ['two', '2, same as 10 Gbps short'],
  ],
  state: [
    ['disc', 'Discarding'],
    ['lis', 'Listening, then learning'],
    ['fwd', 'Forwarding — RSTP has no start state'],
  ],
  roles: [
    ['back', 'Backup — same switch is the designated bridge'],
    ['altn', 'Alternate — SW3 is never designated on a hub'],
    ['desg', 'Designated — every root-bridge port always is'],
  ],
  tc: [
    ['six', '6 s (3 hellos), then sync'],
    ['fifty', '50 s — RSTP kept max age + 30'],
    ['zero', '0 s always, even if the old port stays up'],
  ],
  link: [
    ['p2p', 'P2p = full. Shared = half. Edge = PortFast'],
    ['cmd', 'spanning-tree link-type edge on PC ports'],
    ['auto', 'IOS marks every access port Edge by default'],
  ],
  rootg: [
    ['rinc', 'Root-inconsistent until the superior BPDUs stop'],
    ['loop', 'Loop-inconsistent — it missed three hellos'],
    ['filter', 'It ignores the BPDU and stays forwarding'],
  ],
  loopg: [
    ['linc', 'Loop-inconsistent — will not go FWD'],
    ['root', 'Root-inconsistent — that is a superior BID'],
    ['fwd', 'Becomes designated and forwards; that is the point'],
  ],
  filter: [
    ['off', 'STP off: no send, ignore receive (dangerous)'],
    ['guard', 'Same as BPDU Guard: err-disable on a BPDU'],
    ['safe', 'Recommended on every trunk'],
  ],
};

function cliFor(story) {
  if (story.view === 'mode') {
    return `SW1# show spanning-tree
VLAN0001
  Spanning tree enabled protocol ieee

SW1(config)# spanning-tree mode rapid-pvst
SW1# show spanning-tree
VLAN0001
  Spanning tree enabled protocol rstp

mode pvst     → ieee   (PVST+)
mode rapid-pvst → rstp (Rapid PVST+)`;
  }
  if (story.view === 'cost') {
    return `SW1# show spanning-tree pathcost method
Spanning tree default pathcost method used is short

SW1(config)# spanning-tree pathcost method long
  10 Mb  2,000,000    10 Gb     2,000
 100 Mb    200,000   100 Gb       200
   1 Gb     20,000     1 Tb        20
  10 Gb      2,000    10 Tb         2`;
  }
  if (story.view === 'hub') {
    return `SW1# show spanning-tree
Interface        Role Sts Cost  Prio.Nbr Type
Gi0/0            Root FWD 4     128.1    Shr
Gi0/1            Altn BLK 4     128.2    Shr

SW3# show spanning-tree
Interface        Role Sts Cost  Prio.Nbr Type
Gi0/0            Desg FWD 4     128.1    Shr
Gi0/1            Back BLK 4     128.2    Shr
  Sts still says BLK (discarding)`;
  }
  if (story.view === 'types') {
    return `SW1# show spanning-tree
Interface        Role Sts Cost  Prio.Nbr Type
Gi0/0            Root FWD 4     128.1    Shr
Gi0/3            Desg FWD 4     128.4    P2p
Fa1/0            Desg FWD 19    128.9    P2p Edge

edge = spanning-tree portfast
P2p/shared follow duplex (or link-type)`;
  }
  if (story.view === 'rootg') {
    return `SW2(config-if)# spanning-tree guard root
%SPANTREE-2-ROOTGUARD_BLOCK: Root guard
  blocking port Gi0/2 on VLAN0001

Gi0/2  Desg BKN*4  128.3  P2p *ROOT_Inc
  superior BPDU → root-inconsistent
  inferior again → auto recover`;
  }
  if (story.view === 'loopg') {
    return `SW3(config-if)# spanning-tree guard loop
%SPANTREE-2-LOOPGUARD_BLOCK: Loop guard
  blocking port Gi0/1 on VLAN0001

Gi0/1  Desg BKN*4  128.2  P2p *LOOP_Inc
  BPDUs stopped → loop-inconsistent
  cannot sit with Root Guard`;
  }
  if (story.view === 'filter') {
    return `iface:  spanning-tree bpdufilter enable
  no send, ignore receive = STP off

global: spanning-tree portfast bpdufilter default
  PortFast ports: no send
  receive a BPDU → PortFast + Filter off
  port becomes a normal RSTP port`;
  }
  return `SW1# show spanning-tree
VLAN0001
  Spanning tree enabled protocol rstp
  Root ID    Priority    24577
             Address     5254.0016.5d5e

Interface        Role Sts Cost  Prio.Nbr Type
Gi0/0            Altn BLK 4     128.1    P2p
Gi0/1            Root FWD 4     128.2    P2p
Gi0/2            Altn BLK 4     128.3    P2p
Gi0/3            Desg FWD 4     128.4    P2p
  RSTP: all switches send BPDUs on Desg`;
}

function caption(view) {
  if (view === 'hub') {
    return 'Hub: SW1 Altn, SW3 Back (same segment)';
  }
  if (view === 'types') {
    return 'P2p trunk · Shr hub · P2p Edge PC';
  }
  if (view === 'rootg') {
    return 'Customer superior BID → ROOT_Inc';
  }
  if (view === 'loopg') {
    return 'BPDUs stop on Altn → LOOP_Inc';
  }
  if (view === 'filter') {
    return 'Filter on a trunk can loop the LAN';
  }
  if (view === 'cost') {
    return 'Long costs: ×10 speed → ÷10 cost';
  }
  if (view === 'mode') {
    return 'ieee = PVST+ · rstp = Rapid PVST+';
  }
  return 'R root · D designated · A alternate';
}

export default function RstpSimulator() {
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

  const mesh = story.view === 'mesh' || story.view === 'cost' || story.view === 'mode';

  return (
    <CEBlock
      title="Same tree, faster ports"
      subtitle="Rapid PVST+ keeps the STP algorithm. Alternate/backup replace nondesignated. Sync skips the 30 s walk."
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
            <svg className={styles.canvas} viewBox="0 0 560 220" role="img" aria-label="RSTP topology">
              {mesh || story.view === 'types' ? (
                <>
                  <line x1="110" y1="50" x2="250" y2="50" stroke="#1565c0" strokeWidth="5" />
                  <line x1="110" y1="50" x2="70" y2="150" stroke="#1565c0" strokeWidth="5" />
                  <line x1="70" y1="150" x2="430" y2="150" stroke="#1565c0" strokeWidth="4" />
                  <line x1="250" y1="50" x2="430" y2="50" stroke="#c62828" strokeWidth="3" strokeDasharray="6 4" />
                  <line x1="430" y1="50" x2="430" y2="150" stroke="#1565c0" strokeWidth="5" />
                  <text x="300" y="42" fontSize="11" fontWeight="700" fill="#37474f">
                    A
                  </text>
                  <text x="170" y="42" fontSize="11" fontWeight="700">
                    R
                  </text>
                  <text x="80" y="100" fontSize="11" fontWeight="700">
                    D
                  </text>
                </>
              ) : null}
              {story.view === 'hub' ? (
                <>
                  <circle cx="280" cy="110" r="18" fill="#fff3e0" stroke="#ef6c00" />
                  <text x="280" y="114" textAnchor="middle" fontSize="10">
                    hub
                  </text>
                  <line x1="140" y1="70" x2="262" y2="100" stroke="#ef6c00" strokeWidth="4" />
                  <line x1="140" y1="150" x2="262" y2="120" stroke="#c62828" strokeWidth="3" strokeDasharray="6 4" />
                  <line x1="420" y1="70" x2="298" y2="100" stroke="#1565c0" strokeWidth="5" />
                  <line x1="420" y1="150" x2="298" y2="120" stroke="#c62828" strokeWidth="3" strokeDasharray="6 4" />
                  <text x="175" y="78" fontSize="11" fontWeight="700">
                    R
                  </text>
                  <text x="175" y="168" fontSize="11" fontWeight="700">
                    A
                  </text>
                  <text x="400" y="78" fontSize="11" fontWeight="700">
                    D
                  </text>
                  <text x="400" y="168" fontSize="11" fontWeight="700">
                    B
                  </text>
                </>
              ) : null}
              {['SW1', 'SW2', 'SW3', 'SW4'].map((id, i) => {
                if (story.view === 'hub' && (id === 'SW2' || id === 'SW4')) {
                  return null;
                }
                const pos =
                  story.view === 'hub'
                    ? id === 'SW1'
                      ? {x: 70, y: 88}
                      : {x: 420, y: 88}
                    : [
                        {x: 80, y: 28},
                        {x: 220, y: 28},
                        {x: 36, y: 132},
                        {x: 400, y: 132},
                      ][i];
                const root = id === 'SW3';
                return (
                  <g key={id}>
                    <rect x={pos.x} y={pos.y} width="56" height="36" rx="6" fill={root ? '#e3f2fd' : '#eceff1'} stroke={root ? '#1565c0' : '#546e7a'} strokeWidth={root ? 2 : 1} />
                    <text x={pos.x + 28} y={pos.y + 23} textAnchor="middle" fontSize="13" fontWeight="700">
                      {id}
                    </text>
                  </g>
                );
              })}
              <text x="24" y="208" fontSize="11" fill="#37474f">
                {caption(story.view)}
              </text>
            </svg>
          </div>
          <div className={styles.panel}>
            <h4>show spanning-tree / toolkit</h4>
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
          {feedback || 'Same algorithm as classic STP. Discarding = BLK+LIS. Edge is PortFast. Sync details are out of scope.'}
        </p>
        <p className={styles.legend}>ieee = PVST+ · rstp = Rapid PVST+ · 3 × hello = 6 s · long 10 Gbps = 2,000</p>
      </div>
    </CEBlock>
  );
}
