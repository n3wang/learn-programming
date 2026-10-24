import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './etherchannel.module.css';

const STORIES = [
  {
    id: 'why',
    ask: 'Four 1 Gbps cables, no EtherChannel. Users still see one gigabit because:',
    answer: 'stp',
    ok: 'STP/RSTP forwards on one link and discards the rest. Extra copper is a spare, not more bandwidth, until you bundle.',
    bad: 'The ports are up. The tree just will not let more than one of them forward toward the same neighbor.',
    view: 'blocked',
  },
  {
    id: 'bundle',
    ask: 'EtherChannel’s job for STP and flooding:',
    answer: 'one',
    ok: 'Po1 is one logical port. All members forward. A BUM frame that entered the bundle is not flooded out sibling members.',
    bad: 'The physical cables stay visible to STP only when they are not in a channel. show spanning-tree lists Po, not Gi0/0.',
    view: 'bundle',
  },
  {
    id: 'pagp',
    ask: 'PAgP. Which pair forms a channel?',
    answer: 'desauto',
    ok: 'desirable + desirable or desirable + auto. auto + auto = two listeners, no bundle. Cisco-only, max 8 links.',
    bad: 'desirable sends. auto answers. Two autos never start. PAgP will not talk to LACP.',
    view: 'pagp',
  },
  {
    id: 'lacp',
    ask: 'Non-Cisco switch on the far side. You configure:',
    answer: 'lacp',
    ok: 'LACP (802.3ad): active / passive. active ≈ desirable, passive ≈ auto. 16 members, 8 forwarding. Exam topic names LACP.',
    bad: 'PAgP is Cisco-proprietary. active + desirable does not form. Two passives do not form.',
    view: 'lacp',
  },
  {
    id: 'on',
    ask: 'Static EtherChannel. The only pair that works:',
    answer: 'onon',
    ok: 'on + on. No negotiation — a mismatch can loop. Prefer LACP unless the neighbor cannot speak it (WLC later).',
    bad: 'on + active, on + desirable, on + auto, on + passive: no channel. The cables become ordinary STP links.',
    view: 'on',
  },
  {
    id: 'flags',
    ask: 'show etherchannel summary: Po1(SU) Gi0/0(P) Gi0/1(I). Read it:',
    answer: 'mix',
    ok: 'S = Layer 2, U = in use. P = bundled. I = stand-alone (that member did not join). s (lowercase) = suspended.',
    bad: 'S is not suspended. P on a member is not “passive.” R would mean Layer 3. D on Po means down.',
    view: 'flags',
  },
  {
    id: 'match',
    ask: 'Native VLAN changed on one member only. That port:',
    answer: 'susp',
    ok: 'Flag s — suspended until speed, duplex, access/trunk, VLANs match. Live edits belong on the port-channel so you do not flap.',
    bad: 'description may differ. Operational settings may not. Group number is local; it does not have to match the neighbor.',
    view: 'mismatch',
  },
  {
    id: 'hash',
    ask: 'Four 1 Gbps members, src-dst-ip. One TCP flow:',
    answer: 'onegig',
    ok: 'Stays on one member (1 Gbps). Bundle bandwidth is 4 Gbps. Highway: more lanes, same speed limit. show etherchannel load-balance.',
    bad: 'IOS does not spray a flow across members. dst-mac alone can pin every frame to the gateway on one cable.',
    view: 'flow',
  },
  {
    id: 'l3',
    ask: 'Layer 3 EtherChannel on a multilayer switch:',
    answer: 'ru',
    ok: 'no switchport on members, channel-group, IP on Po2 (not Gi0/2). Up = Po2(RU). Same mode rules as Layer 2.',
    bad: 'Do not address the members. STP is not why you bundle routed ports — one IP and a hash are.',
    view: 'l3',
  },
];

const CHOICES = {
  why: [
    ['stp', 'STP discards the extras — one active link'],
    ['down', 'The extra ports stay admin-down'],
    ['lic', 'Cisco needs a license per extra gigabit'],
  ],
  bundle: [
    ['one', 'One logical port; BUM does not bounce out siblings'],
    ['four', 'Four STP ports, all designated'],
    ['off', 'STP is disabled on the whole LAN'],
  ],
  pagp: [
    ['desauto', 'desirable + auto (or desirable + desirable)'],
    ['aa', 'auto + auto'],
    ['mix', 'desirable + active'],
  ],
  lacp: [
    ['lacp', 'LACP active or passive'],
    ['pagp', 'PAgP desirable — Cisco silicon requires it'],
    ['ononly', 'mode on is the only multi-vendor option'],
  ],
  on: [
    ['onon', 'on + on'],
    ['onact', 'on + active'],
    ['onauto', 'on + auto'],
  ],
  flags: [
    ['mix', 'L2 in use; one member bundled, one stand-alone'],
    ['l3', 'Layer 3 down; both members passive LACP'],
    ['sus', 'S means both members are suspended'],
  ],
  match: [
    ['susp', 'Suspended (s) until it matches'],
    ['ok', 'Stays bundled; native VLAN is ignored'],
    ['kill', 'Tears the whole Po down permanently'],
  ],
  hash: [
    ['onegig', 'One member, 1 Gbps. Bundle is 4 Gbps'],
    ['fourgig', 'Packets spray — that flow is 4 Gbps'],
    ['maconly', 'Always dst-mac; IP keys do not exist'],
  ],
  l3: [
    ['ru', 'no switchport, IP on the port-channel → RU'],
    ['members', 'IP on each member; Po is STP-only'],
    ['pagponly', 'L3 channels require PAgP'],
  ],
};

function cliFor(story) {
  if (story.view === 'blocked') {
    return `SW1# show spanning-tree
Interface        Role Sts Cost  Prio.Nbr Type
Gi0/0            Root FWD 4     128.1    P2p
Gi0/1            Altn BLK 4     128.2    P2p
Gi0/2            Altn BLK 4     128.3    P2p
Gi0/3            Altn BLK 4     128.4    P2p
  four cables, one forwarding`;
  }
  if (story.view === 'bundle') {
    return `SW1# show spanning-tree
Interface        Role Sts Cost  Prio.Nbr Type
Po1              Root FWD 3     128.65   P2p
  STP sees Po1, not Gi0/0–3
  combined BW → cost 3 (not 4)`;
  }
  if (story.view === 'pagp') {
    return `SW1(config)# interface range g0/0-1
SW1(config-if-range)# channel-group 1 mode desirable
SW2(config-if-range)# channel-group 1 mode auto

SW1# show etherchannel summary
1  Po1(SU)  PAgP  Gi0/0(P)  Gi0/1(P)
  group number is local`;
  }
  if (story.view === 'lacp') {
    return `SW1(config-if-range)# channel-group 1 mode active
SW2(config-if-range)# channel-group 1 mode passive

SW1# show lacp neighbor
  partner flags: Gi0/0 SP  …  (P = passive)
  neighbor passive + channel up → you are active`;
  }
  if (story.view === 'on') {
    return `SW1(config-if-range)# channel-group 1 mode on
SW2(config-if-range)# channel-group 1 mode on

on + LACP/PAgP = no bundle
prefer LACP; on if the neighbor cannot speak`;
  }
  if (story.view === 'flags') {
    return `Flags: D down   P bundled   I stand-alone
       s suspended   H hot-standby (LACP)
       R Layer3   S Layer2   U in use

1  Po1(SU)  LACP  Gi0/0(P)  Gi0/1(I)
  S ≠ s     P on a member ≠ passive`;
  }
  if (story.view === 'mismatch') {
    return `SW1(config-if)# switchport trunk native vlan 10
SW1# show etherchannel summary
1  Po1(SU)  LACP  Gi0/0(s)  Gi0/1(P)  Gi0/2(P)

SW1(config-if)# no switchport trunk native vlan 10
  Gi0/0(P) again`;
  }
  if (story.view === 'flow') {
    return `SW1# show etherchannel load-balance
  Src-dst-ip
  Non-IP: Source XOR Destination MAC

SW1(config)# port-channel load-balance src-dst-mac
  one flow → one member
  4 × 1G = 4G bandwidth, 1G per flow`;
  }
  return `SW3(config)# interface range g0/2-3
SW3(config-if-range)# no switchport
SW3(config-if-range)# channel-group 2 mode active
SW3(config-if)# interface po2
SW3(config-if)# ip address 192.168.1.1 255.255.255.252

SW4# show etherchannel summary
2  Po2(RU)  LACP  Gi0/2(P)  Gi0/3(P)`;
}

function caption(view) {
  if (view === 'blocked') {
    return 'STP: one FWD, three Altn';
  }
  if (view === 'bundle') {
    return 'Po1 = 4 Gbps logical link';
  }
  if (view === 'pagp') {
    return 'PAgP desirable + auto → SU';
  }
  if (view === 'lacp') {
    return 'LACP active + passive → SU';
  }
  if (view === 'on') {
    return 'Static: on + on only';
  }
  if (view === 'flags') {
    return 'SU + P vs I (stand-alone)';
  }
  if (view === 'mismatch') {
    return 'Native VLAN mismatch → (s)';
  }
  if (view === 'flow') {
    return 'Hash by flow, not by packet';
  }
  return 'L3: IP lives on Po2 (RU)';
}

function Links({kind}) {
  const ys = [48, 78, 108, 138];
  return (
    <g>
      {ys.map((y, i) => {
        const blocked = kind === 'blocked' && i > 0;
        const bad = kind === 'mismatch' && i === 0;
        const dash = blocked || bad;
        const color = bad ? '#c62828' : blocked ? '#c62828' : '#1565c0';
        const width = blocked || bad ? 3 : 5;
        return (
          <line
            key={y}
            x1="150"
            y1={y}
            x2="410"
            y2={y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={dash ? '6 4' : undefined}
          />
        );
      })}
    </g>
  );
}

function BundleOval() {
  return <ellipse cx="280" cy="93" rx="88" ry="68" fill="none" stroke="#ef6c00" strokeWidth="2" strokeDasharray="5 4" />;
}

function Boxes({l3}) {
  return (
    <g>
      <rect x="54" y="70" width="72" height="46" rx="6" fill={l3 ? '#e8f5e9' : '#eceff1'} stroke={l3 ? '#2e7d32' : '#546e7a'} strokeWidth={l3 ? 2 : 1} />
      <text x="90" y="98" textAnchor="middle" fontSize="13" fontWeight="700">
        {l3 ? 'SW3' : 'SW1'}
      </text>
      <rect x="434" y="70" width="72" height="46" rx="6" fill={l3 ? '#e8f5e9' : '#eceff1'} stroke={l3 ? '#2e7d32' : '#546e7a'} strokeWidth={l3 ? 2 : 1} />
      <text x="470" y="98" textAnchor="middle" fontSize="13" fontWeight="700">
        {l3 ? 'SW4' : 'SW2'}
      </text>
    </g>
  );
}

export default function EtherChannelSimulator() {
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

  const twoLink = story.view === 'pagp' || story.view === 'lacp' || story.view === 'on';
  const bundled = story.view === 'bundle' || story.view === 'flags' || story.view === 'flow' || story.view === 'l3';

  return (
    <CEBlock
      title="One STP port, several cables"
      subtitle="EtherChannel (port-channel) lets every member forward. STP sees PoN. Prefer LACP."
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
            <svg className={styles.canvas} viewBox="0 0 560 200" role="img" aria-label="EtherChannel topology">
              {story.view === 'blocked' ? <Links kind="blocked" /> : null}
              {story.view === 'mismatch' ? <Links kind="mismatch" /> : null}
              {bundled || story.view === 'bundle' ? <Links kind="up" /> : null}
              {twoLink ? (
                <g>
                  <line x1="150" y1="70" x2="410" y2="70" stroke="#1565c0" strokeWidth="5" />
                  <line x1="150" y1="118" x2="410" y2="118" stroke="#1565c0" strokeWidth="5" />
                </g>
              ) : null}
              {bundled ? <BundleOval /> : null}
              {story.view === 'bundle' || story.view === 'flags' || story.view === 'flow' ? (
                <>
                  <text x="200" y="36" fontSize="12" fontWeight="700" fill="#ef6c00">
                    Po1
                  </text>
                  <text x="340" y="36" fontSize="12" fontWeight="700" fill="#ef6c00">
                    Po1
                  </text>
                </>
              ) : null}
              {story.view === 'l3' ? (
                <>
                  <text x="188" y="34" fontSize="12" fontWeight="700" fill="#2e7d32">
                    Po2 .1
                  </text>
                  <text x="332" y="34" fontSize="12" fontWeight="700" fill="#2e7d32">
                    Po2 .2
                  </text>
                </>
              ) : null}
              {story.view === 'pagp' ? (
                <text x="280" y="98" textAnchor="middle" fontSize="11">
                  desirable ↔ auto
                </text>
              ) : null}
              {story.view === 'lacp' ? (
                <text x="280" y="98" textAnchor="middle" fontSize="11">
                  active ↔ passive
                </text>
              ) : null}
              {story.view === 'on' ? (
                <text x="280" y="98" textAnchor="middle" fontSize="11">
                  on ↔ on
                </text>
              ) : null}
              {story.view === 'flow' ? (
                <>
                  <text x="280" y="64" textAnchor="middle" fontSize="10" fill="#1565c0">
                    PC1→SRV1
                  </text>
                  <text x="280" y="124" textAnchor="middle" fontSize="10" fill="#6a1b9a">
                    PC2→SRV2
                  </text>
                </>
              ) : null}
              <Boxes l3={story.view === 'l3'} />
              <text x="24" y="188" fontSize="11" fill="#37474f">
                {caption(story.view)}
              </text>
            </svg>
          </div>
          <div className={styles.panel}>
            <h4>show etherchannel / neighbor</h4>
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
          {feedback ||
            'STP sees one port. Prefer LACP. Flags: SU / RU / P / I / s. Hash by flow. L3 IP lives on Po.'}
        </p>
        <p className={styles.legend}>desirable/auto · active/passive · on+on · SU vs RU · src-dst-ip</p>
      </div>
    </CEBlock>
  );
}
