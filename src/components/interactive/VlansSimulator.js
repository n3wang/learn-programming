import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './vlans.module.css';

const HOSTS = {
  pc1: {label: 'PC1', vlan: 10, sw: 'sw1', port: 'G0/1', ip: '172.16.1.10', x: 52, y: 40},
  pc3: {label: 'PC3', vlan: 20, sw: 'sw1', port: 'G0/2', ip: '172.16.1.70', x: 52, y: 120},
  pc4: {label: 'PC4', vlan: 30, sw: 'sw1', port: 'G0/3', ip: '172.16.1.130', x: 52, y: 200},
  pc10: {label: 'PC10', vlan: 10, sw: 'sw2', port: 'G0/1', ip: '172.16.1.20', x: 588, y: 120},
};

const SWITCHES = {
  sw1: {label: 'SW1', x: 220, y: 120},
  sw2: {label: 'SW2', x: 420, y: 120},
};

const R1 = {label: 'R1', x: 220, y: 28};
const COLOR = {1: '#78909c', 10: '#1565c0', 20: '#2e7d32', 30: '#ef6c00'};
const NAME = {1: 'default', 10: 'Engineering', 20: 'HR', 30: 'Sales'};

const STORIES = [
  {
    id: 'why',
    ask: 'Three /26s, one switch, no VLANs. PC1 sends a broadcast. Who hears it?',
    answer: 'all',
    ok: 'SW1 is not Layer 3 aware. Flood every other port. Subnets did not split the broadcast domain.',
    bad: 'The /26 is an IP story. The frame’s dest is ffff.ffff.ffff — the switch floods.',
    cfg: {vlans: false, allowed: [1, 10, 20, 30], native1: 1, native2: 1, route: 'none'},
  },
  {
    id: 'cut',
    ask: 'Same PCs, ports now in VLAN 10 / 20 / 30. PC1 broadcasts again. Who hears it?',
    answer: 'same',
    ok: 'Only VLAN 10. PC10 hears it over the trunk (tagged 10). PC3 and PC4 sit on other virtual switches.',
    bad: 'A VLAN is a virtual switch. Flood does not leave the VLAN except via a router or SVI.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 1, native2: 1, route: 'none'},
  },
  {
    id: 'access',
    ask: 'To put G0/1 in VLAN 10 you configure:',
    answer: 'acc',
    ok: 'switchport mode access, then switchport access vlan 10. Missing VLAN is auto-created. Name it if you care.',
    bad: 'Do not leave DTP to guess. Access = one VLAN, untagged, facing a PC.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 1, native2: 1, route: 'none'},
  },
  {
    id: 'tag',
    ask: 'PC1 unicasts to PC10. On the SW1–SW2 trunk the frame is:',
    answer: 'dot1q',
    ok: '802.1Q tag, TPID 0x8100, 12-bit VID = 10. Access ports on both ends stay untagged.',
    bad: 'The trunk has no single access VLAN. Without a VID, SW2 would not know which virtual switch to use.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 1, native2: 1, route: 'none'},
  },
  {
    id: 'add',
    ask: 'Allowed list is 10,20,30. You type switchport trunk allowed vlan 40. Result:',
    answer: 'replace',
    ok: 'WORD replaces the list. Only VLAN 40 remains. Use add 40 to keep 10,20,30.',
    bad: 'Forgetting add is the classic outage. PC1→PC10 dies even though the cable is up.',
    cfg: {vlans: true, allowed: [40], native1: 1, native2: 1, route: 'none'},
  },
  {
    id: 'native',
    ask: 'Default VLAN vs native VLAN:',
    answer: 'pair',
    ok: 'Default = access ports start in VLAN 1 (fixed). Native = untagged on a trunk (VLAN 1 by default, changeable).',
    bad: 'They are both “1” on a factory switch. Only native can move, and only per trunk port.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 30, native2: 30, route: 'none'},
  },
  {
    id: 'hop',
    ask: 'SW1 native 10, SW2 native 30. PC1 → PC10 over the trunk:',
    answer: 'miss',
    ok: 'SW1 sends VLAN 10 untagged. SW2 assigns that untagged frame to 30. PC10 is in 10 — miss. That is VLAN hopping.',
    bad: 'Match native on both ends. Unused native (not VLAN 1) is the security habit.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 10, native2: 30, route: 'none'},
  },
  {
    id: 'roas',
    ask: 'PC3 (VLAN 20) needs PC10 (VLAN 10). ROAS on R1 G0/0. The frame to the gateway is:',
    answer: 'stick',
    ok: 'Tagged 20 toward R1. encapsulation dot1q 20 on G0/0.20. R1 emits a new frame tagged 10 toward PC10.',
    bad: 'PCs still ARP for the gateway MAC. The router splits on the tag, not on a second physical NIC.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 1, native2: 1, route: 'roas'},
  },
  {
    id: 'svi',
    ask: 'Same PC3 → PC10, SW1 is multilayer with SVIs. The hop is:',
    answer: 'inside',
    ok: 'ip routing + interface vlan. No external R1. SW1 emits VLAN 10 on the trunk toward PC10.',
    bad: 'vlan 10 is L2. interface vlan 10 is the gateway. Four up/up checks, then ip routing to move packets.',
    cfg: {vlans: true, allowed: [10, 20, 30], native1: 1, native2: 1, route: 'svi'},
  },
];

const CHOICES = {
  why: [
    ['all', 'PC3, PC4, and PC10 — one flood domain'],
    ['eng', 'Only other Engineering hosts; the /26 filters L2'],
    ['none', 'Nobody; broadcasts die on an access port'],
  ],
  cut: [
    ['same', 'PC10 only (VLAN 10, including the tagged trunk)'],
    ['all', 'Everyone again; VLANs are names, not flood walls'],
    ['r1', 'R1 only; a broadcast must be routed'],
  ],
  access: [
    ['acc', 'switchport mode access + switchport access vlan 10'],
    ['trk', 'switchport mode trunk + native vlan 10'],
    ['svi', 'interface vlan 10 — that is the L3 SVI, not the port'],
  ],
  tag: [
    ['dot1q', '802.1Q tagged, VID 10 (TPID 0x8100)'],
    ['bare', 'Untagged, because both PCs are “in VLAN 10”'],
    ['isl', 'ISL only; 802.1Q is a router protocol'],
  ],
  add: [
    ['replace', 'List becomes 40 only — PC1 can no longer reach PC10'],
    ['keep', '40 is appended; 10,20,30 stay'],
    ['err', 'IOS rejects WORD; only add / remove are legal'],
  ],
  native: [
    ['pair', 'Default = access start (1, fixed). Native = untagged on a trunk'],
    ['same', 'Two names for VLAN 1; neither can change'],
    ['swap', 'Native is the access default; default is the trunk untagged VLAN'],
  ],
  hop: [
    ['miss', 'Untagged hops into VLAN 30 on SW2; PC10 never sees it'],
    ['ok', 'VID is still 10 inside the payload, so SW2 delivers'],
    ['block', 'The trunk goes down; CDP always err-disables a mismatch'],
  ],
  roas: [
    ['stick', 'Tagged VLAN 20 to R1, then a new frame tagged 10 toward PC10'],
    ['three', 'Impossible on one cable; ROAS needs one NIC per VLAN'],
    ['svi', 'R1 builds interface vlan 20; that command is for a multilayer switch'],
  ],
  svi: [
    ['inside', 'SW1 routes VLAN 20 → 10 internally, then tags 10 on the trunk'],
    ['r1', 'Still needs R1; SVIs only assign names'],
    ['access', 'SW1 turns G0/0 into three access links by itself'],
  ],
};

function accessVlan(host, cfg) {
  return cfg.vlans ? host.vlan : 1;
}

function otherSw(sw) {
  return sw === 'sw1' ? 'sw2' : 'sw1';
}

function nativeOf(sw, cfg) {
  return sw === 'sw1' ? cfg.native1 : cfg.native2;
}

function runFrame(fromId, destKind, cfg) {
  const from = HOSTS[fromId];
  const srcV = accessVlan(from, cfg);
  const lit = [`${fromId}-${from.sw}`];
  const recv = [];
  const tags = [];
  const log = [`${from.label} ${from.port} VLAN ${srcV} → ${destKind === 'bcast' ? 'ffff.ffff.ffff' : destKind}`];

  function deliverOn(sw, vlan) {
    Object.entries(HOSTS).forEach(([id, host]) => {
      if (id === fromId) {
        return;
      }
      if (host.sw === sw && accessVlan(host, cfg) === vlan) {
        recv.push(id);
        lit.push(`${id}-${host.sw}`);
      }
    });
  }

  function crossTrunk(vlan) {
    if (!cfg.allowed.includes(vlan)) {
      log.push(`Trunk does not allow VLAN ${vlan}.`);
      return null;
    }
    const outNative = nativeOf(from.sw, cfg);
    const tagged = vlan !== outNative;
    const peer = otherSw(from.sw);
    const inNative = nativeOf(peer, cfg);
    const assigned = tagged ? vlan : inNative;
    lit.push('sw1-sw2');
    if (tagged) {
      tags.push(`802.1Q VID ${vlan}`);
      log.push(`Trunk: tagged VLAN ${vlan}.`);
    } else {
      tags.push(`untagged (native ${outNative} → assigned ${assigned})`);
      log.push(`Trunk: untagged. ${peer.toUpperCase()} assigns VLAN ${assigned}.`);
    }
    if (assigned !== vlan) {
      log.push('Native mismatch — VLAN hopping. Dest VLAN never sees the frame.');
    }
    return assigned;
  }

  if (destKind === 'bcast') {
    deliverOn(from.sw, srcV);
    const assigned = crossTrunk(srcV);
    if (assigned != null) {
      deliverOn(otherSw(from.sw), assigned);
    }
    return {lit, recv, tags, log, routed: false};
  }

  const toId = destKind;
  const to = HOSTS[toId];
  const dstV = accessVlan(to, cfg);

  if (srcV === dstV) {
    if (from.sw === to.sw) {
      deliverOn(from.sw, srcV);
    } else {
      const assigned = crossTrunk(srcV);
      if (assigned === dstV) {
        deliverOn(to.sw, assigned);
      }
    }
    return {lit, recv, tags, log, routed: false};
  }

  if (cfg.route === 'none') {
    log.push('Different VLAN. No router/SVI — the virtual switch will not flood across.');
    return {lit, recv, tags, log, routed: false, drop: true};
  }

  log.push(
    cfg.route === 'roas'
      ? `Frame to R1 (ROAS). Tag VLAN ${srcV} on SW1–R1. New frame out VLAN ${dstV}.`
      : `SW1 SVI VLAN ${srcV} → VLAN ${dstV}. ip routing is on.`,
  );
  if (cfg.route === 'roas') {
    lit.push('sw1-r1');
    tags.push(`802.1Q VID ${srcV} (to R1)`);
    tags.push(`802.1Q VID ${dstV} (from R1)`);
  }
  if (from.sw === to.sw) {
    deliverOn(to.sw, dstV);
  } else {
    const assigned = crossTrunk(dstV);
    if (assigned === dstV) {
      deliverOn(to.sw, assigned);
    }
  }
  return {lit, recv, tags, log, routed: true};
}

function cliFor(cfg) {
  const lines = ['SW1# show vlan brief', 'VLAN Name             Status    Ports', '---- ---------------- --------- ----------------'];
  const groups = {1: [], 10: [], 20: [], 30: []};
  Object.values(HOSTS).forEach((host) => {
    if (host.sw !== 'sw1') {
      return;
    }
    groups[accessVlan(host, cfg)].push(host.port.replace('G', 'Gi'));
  });
  const ids = cfg.vlans ? [1, 10, 20, 30] : [1];
  ids.forEach((id) => {
    const ports = groups[id].join(', ') || '';
    lines.push(`${String(id).padEnd(5)}${NAME[id].padEnd(17)}active    ${ports}`);
  });
  lines.push('1002 fddi-default     act/unsup');
  lines.push('');
  lines.push('SW1# show interfaces trunk');
  lines.push('Port   Mode  Encapsulation  Status    Native vlan');
  lines.push(`Gi0/0  on    802.1q         trunking  ${cfg.native1}`);
  lines.push('Port   Vlans allowed on trunk');
  lines.push(`Gi0/0  ${cfg.allowed.join(',')}`);
  if (cfg.route === 'roas') {
    lines.push('');
    lines.push('R1# show ip interface brief | include 0/0');
    lines.push('Gi0/0      unassigned      up  up');
    lines.push('Gi0/0.10   172.16.1.1      up  up');
    lines.push('Gi0/0.20   172.16.1.65     up  up');
    lines.push('Gi0/0.30   172.16.1.129    up  up');
  }
  if (cfg.route === 'svi') {
    lines.push('');
    lines.push('SW1# show ip route | include Vlan');
    lines.push('C  172.16.1.0/26   Vlan10');
    lines.push('C  172.16.1.64/26  Vlan20');
    lines.push('C  172.16.1.128/26 Vlan30');
  }
  return lines.join('\n');
}

export default function VlansSimulator() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState({lit: [], recv: [], tags: [], log: ['Assign VLANs, then send a broadcast or a unicast.']});
  const story = STORIES[idx];
  const cfg = story.cfg;
  const litSet = useMemo(() => new Set(result.lit), [result]);

  function setStory(i) {
    setIdx(i);
    setPicked(null);
    setFeedback('');
    setResult({lit: [], recv: [], tags: [], log: ['Story loaded. Send a frame to see the flood wall.']});
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  function hostFill(id) {
    const host = HOSTS[id];
    const vlan = accessVlan(host, cfg);
    if (result.recv.includes(id)) {
      return COLOR[vlan];
    }
    if (litSet.has(`${id}-${host.sw}`)) {
      return '#ef6c00';
    }
    return '#455a64';
  }

  return (
    <CEBlock
      title="One switch, three virtual switches"
      subtitle="Flood stays in the VLAN. Trunks tag. Inter-VLAN needs a router or an SVI."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <svg className={styles.canvas} viewBox="0 0 640 240" role="img" aria-label="SW1 VLANs 10 20 30, trunk to SW2, optional ROAS">
            {[
              ['pc1', 'sw1'],
              ['pc3', 'sw1'],
              ['pc4', 'sw1'],
              ['pc10', 'sw2'],
            ].map(([a, b]) => {
              const left = HOSTS[a];
              const right = SWITCHES[b];
              const on = litSet.has(`${a}-${b}`);
              return (
                <line
                  key={a}
                  x1={left.x}
                  y1={left.y}
                  x2={right.x}
                  y2={right.y}
                  stroke={on ? COLOR[accessVlan(left, cfg)] : '#90a4ae'}
                  strokeWidth={on ? 3.2 : 1.5}
                />
              );
            })}
            <line
              x1={SWITCHES.sw1.x}
              y1={SWITCHES.sw1.y}
              x2={SWITCHES.sw2.x}
              y2={SWITCHES.sw2.y}
              stroke={litSet.has('sw1-sw2') ? '#6a1b9a' : '#90a4ae'}
              strokeWidth={litSet.has('sw1-sw2') ? 4 : 2}
            />
            {cfg.route === 'roas' ? (
              <line
                x1={SWITCHES.sw1.x}
                y1={SWITCHES.sw1.y - 18}
                x2={R1.x}
                y2={R1.y + 14}
                stroke={litSet.has('sw1-r1') ? '#6a1b9a' : '#90a4ae'}
                strokeWidth={litSet.has('sw1-r1') ? 3.2 : 1.5}
              />
            ) : null}
            {cfg.route === 'roas' ? (
              <g>
                <rect x={R1.x - 28} y={R1.y - 14} width={56} height={28} rx={14} fill={litSet.has('sw1-r1') ? '#6a1b9a' : '#37474f'} stroke="#263238" />
                <text x={R1.x} y={R1.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                  {R1.label}
                </text>
              </g>
            ) : null}
            {Object.entries(SWITCHES).map(([id, node]) => (
              <g key={id}>
                <rect
                  x={node.x - 36}
                  y={node.y - 20}
                  width={72}
                  height={40}
                  rx={4}
                  fill={cfg.route === 'svi' && id === 'sw1' ? '#37474f' : '#cfd8dc'}
                  stroke="#37474f"
                />
                <text x={node.x} y={node.y + 5} textAnchor="middle" fill={cfg.route === 'svi' && id === 'sw1' ? '#fff' : '#263238'} fontSize="12" fontWeight="700">
                  {node.label}
                </text>
              </g>
            ))}
            {Object.entries(HOSTS).map(([id, node]) => (
              <g key={id}>
                <rect x={node.x - 28} y={node.y - 16} width={56} height={32} rx={6} fill={hostFill(id)} stroke="#37474f" />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                  {node.label}
                </text>
                <text x={node.x} y={node.y + 28} textAnchor="middle" fontSize="9" fill={COLOR[accessVlan(node, cfg)]}>
                  VLAN {accessVlan(node, cfg)}
                </text>
              </g>
            ))}
            <text x={320} y={108} textAnchor="middle" fontSize="9" fill="#6a1b9a">
              trunk Gi0/0 native {cfg.native1}/{cfg.native2} allow {cfg.allowed.join(',')}
            </text>
          </svg>
          <div className={styles.side}>
            <div className={styles.panel}>
              <h4>IOS (this story)</h4>
              <pre className={styles.cli}>{cliFor(cfg)}</pre>
            </div>
            <div className={styles.panel}>
              <h4>Last tag</h4>
              {result.tags.length ? (
                result.tags.map((t) => (
                  <span key={t} className={t.startsWith('untagged') ? `${styles.tag} ${styles.tagOff}` : styles.tag}>
                    {t}
                  </span>
                ))
              ) : (
                <p className={styles.label}>No trunk hop yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <Button size="small" variant="outlined" onClick={() => setResult(runFrame('pc1', 'bcast', cfg))}>
            PC1 broadcast
          </Button>
          <Button size="small" variant="outlined" onClick={() => setResult(runFrame('pc1', 'pc10', cfg))}>
            PC1 → PC10
          </Button>
          <Button size="small" variant="outlined" onClick={() => setResult(runFrame('pc3', 'pc10', cfg))}>
            PC3 → PC10
          </Button>
        </div>
        <div className={styles.row}>
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
        <p className={`${styles.hint} ${feedback ? (picked === story.answer ? styles.ok : styles.bad) : ''}`}>
          {feedback || 'One subnet per VLAN on the exam. PCs do not know their VLAN; the access port does.'}
        </p>
        <pre className={styles.log}>{result.log.join('\n')}</pre>
        <p className={styles.legend}>
          <span>
            <i className={styles.swatch} style={{background: '#1565c0'}} />
            VLAN 10 Eng
          </span>
          <span>
            <i className={styles.swatch} style={{background: '#2e7d32'}} />
            VLAN 20 HR
          </span>
          <span>
            <i className={styles.swatch} style={{background: '#ef6c00'}} />
            VLAN 30 Sales
          </span>
          <span>
            <i className={styles.swatch} style={{background: '#6a1b9a'}} />
            tagged trunk
          </span>
        </p>
      </div>
    </CEBlock>
  );
}
