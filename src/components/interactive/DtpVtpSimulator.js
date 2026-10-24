import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './dtpVtp.module.css';

const MODES = ['access', 'trunk', 'dynamic auto', 'dynamic desirable'];

const STORIES = [
  {
    id: 'autoauto',
    panel: 'dtp',
    ask: 'Factory Cisco ports: both G0/0 are dynamic auto. Operational mode?',
    answer: 'access',
    ok: 'Auto does not ask for a trunk. Two autos stay access. That is why two new Cisco switches do not trunk until someone asks.',
    bad: 'Cisco-to-Cisco is not an automatic trunk. dynamic auto is the default, and auto + auto = access.',
    cfg: {a: 'dynamic auto', b: 'dynamic auto', aNo: false, bNo: false, peer: 'switch'},
  },
  {
    id: 'desauto',
    panel: 'dtp',
    ask: 'SW1 G0/0 is dynamic desirable. SW2 G0/0 stays dynamic auto. Result?',
    answer: 'trunk',
    ok: 'Desirable asks. Auto agrees. Operational mode is trunk on both. Desirable + trunk or auto + trunk also trunks.',
    bad: 'Auto is willing; it just will not start the conversation. Desirable is the one that starts it.',
    cfg: {a: 'dynamic desirable', b: 'dynamic auto', aNo: false, bNo: false, peer: 'switch'},
  },
  {
    id: 'invalid',
    panel: 'dtp',
    ask: 'Which administrative pair should you never use?',
    answer: 'acctrunk',
    ok: 'access + trunk is invalid. The link may block, or only the access VLAN and the trunk native (both untagged) will pass. Pick one mode.',
    bad: 'auto + auto is valid (it stays access). The broken pair is a manual access port facing a manual trunk.',
    cfg: {a: 'access', b: 'trunk', aNo: false, bNo: false, peer: 'switch'},
  },
  {
    id: 'sends',
    panel: 'dtp',
    ask: 'Which admin mode still sends DTP messages?',
    answer: 'trunkyes',
    ok: 'access never sends DTP. trunk still does — so a dynamic neighbor can join the trunk. nonegotiate is how you silence a trunk.',
    bad: 'Manual trunk is not silent. Only access (or nonegotiate) turns Negotiation of Trunking: Off.',
    cfg: {a: 'trunk', b: 'dynamic auto', aNo: false, bNo: false, peer: 'switch'},
  },
  {
    id: 'router',
    panel: 'dtp',
    ask: 'SW1 G0/0 faces a router (ROAS). DTP will not help. You must:',
    answer: 'manual',
    ok: 'Routers do not speak DTP. switchport mode trunk on the switch (and nonegotiate). Same if the other end is a non-Cisco switch.',
    bad: 'dynamic desirable still has nobody to negotiate with. The operational mode stays access unless you pin trunk.',
    cfg: {a: 'dynamic desirable', b: 'access', aNo: false, bNo: false, peer: 'router'},
  },
  {
    id: 'noneg',
    panel: 'dtp',
    ask: 'A PC that speaks DTP can trunk a dynamic auto port and see every VLAN. Hardening step:',
    answer: 'noneg',
    ok: 'Pin switchport mode access (or trunk), then switchport nonegotiate. Access already offs DTP; nonegotiate keeps it off if you later trunk.',
    bad: 'Leaving dynamic auto “because PCs do not trunk” is the hole. Do not teach an attack tool — just stop DTP.',
    cfg: {a: 'access', b: 'access', aNo: true, bNo: false, peer: 'host'},
  },
  {
    id: 'vtpnull',
    panel: 'vtp',
    ask: 'show vtp status: Domain Name is blank (NULL). You create VLAN 10. What is advertised?',
    answer: 'nothing',
    ok: 'NULL does not send VTP. The VLAN is local. First vtp domain Manning is adopted by other NULL switches on trunks.',
    bad: 'Server mode is the default, but a blank domain is not a domain. Advertisements wait for a name.',
    vtp: {ver: 1, domain: '', primary: false, sw4: false, modes: {sw1: 'server', sw2: 'server', sw3: 'server'}, vlans: [1], rev: 0, localOnly: true},
  },
  {
    id: 'sync',
    panel: 'vtp',
    ask: 'Domain Manning. SW1 (server) creates VLANs 2, 3, 4. SW2 and SW3 were NULL. Revision and VLAN count?',
    answer: 'rev3',
    ok: 'Each create bumps the revision by 1 (0→3). Default VLANs 1 + 1002–1005 stay; existing count 8. Neighbors adopt Manning and sync.',
    bad: 'VTP only leaves trunks. Same domain, higher revision. Equal or lower is ignored as old news.',
    vtp: {ver: 1, domain: 'Manning', primary: false, sw4: false, modes: {sw1: 'server', sw2: 'server', sw3: 'server'}, vlans: [1, 2, 3, 4], rev: 3},
  },
  {
    id: 'modes',
    panel: 'vtp',
    ask: 'SW3 is a client. SW2 is transparent. SW1 (server) creates VLAN 5. Who syncs, and can SW3 vlan 5?',
    answer: 'fwd',
    ok: 'Client cannot create VLANs but will sync. Transparent keeps its own DB (revision always 0) and forwards VTP to SW3. Off would not forward.',
    bad: 'Transparent is not a black hole for VTP frames. It just refuses to join the database.',
    vtp: {
      ver: 1,
      domain: 'Manning',
      primary: false,
      sw4: false,
      modes: {sw1: 'server', sw2: 'transparent', sw3: 'client'},
      vlans: [1, 2, 3, 4, 5],
      rev: 4,
      transVlans: [1, 12],
    },
  },
  {
    id: 'v3',
    panel: 'vtp',
    ask: 'vtp version 3. SW1 is a server, not primary. vlan 6 on SW1:',
    answer: 'needpri',
    ok: 'Only the primary server may create / rename / delete, including extended 1006–4094. vtp primary is privileged EXEC (do vtp primary from config). One primary; a second steals it.',
    bad: 'v1/v2 every server can edit. v3 secondary servers act like clients until you promote one.',
    vtp: {ver: 3, domain: 'Manning', primary: false, sw4: false, modes: {sw1: 'server', sw2: 'server', sw3: 'server'}, vlans: [1, 2, 3, 4], rev: 3},
  },
  {
    id: 'bomb',
    panel: 'vtp',
    ask: 'Lab SW4, same domain, revision 50, is trunked into a v1 LAN at revision 5. Hosts in 10/20/30:',
    answer: 'wipe',
    ok: 'Highest revision wins in v1/v2. Production syncs to SW4’s tiny VLAN list. v3 only syncs to the primary server. Reset rev to 0 before you cable a lab box.',
    bad: '“Lower never overwrites” is true for a smaller number — 50 is larger. Domain match + higher rev is the outage.',
    vtp: {
      ver: 1,
      domain: 'Manning',
      primary: false,
      sw4: true,
      modes: {sw1: 'server', sw2: 'server', sw3: 'server'},
      vlans: [1, 99, 200],
      rev: 50,
      before: {vlans: [1, 10, 20, 30], rev: 5},
    },
  },
];

const CHOICES = {
  autoauto: [
    ['access', 'Access on both — auto does not try to trunk'],
    ['trunk', 'Trunk — two Cisco switches always trunk'],
    ['invalid', 'Invalid; auto cannot sit next to auto'],
  ],
  desauto: [
    ['trunk', 'Trunk — desirable asks, auto agrees'],
    ['access', 'Access — auto always wins'],
    ['invalid', 'Invalid, same as access + trunk'],
  ],
  invalid: [
    ['acctrunk', 'access + trunk'],
    ['autoauto', 'dynamic auto + dynamic auto'],
    ['desauto', 'dynamic desirable + dynamic auto'],
  ],
  sends: [
    ['trunkyes', 'trunk (and both dynamic modes). access does not'],
    ['dynonly', 'Only the two dynamic modes; trunk is silent'],
    ['accyes', 'access, so a PC can refuse a trunk'],
  ],
  router: [
    ['manual', 'switchport mode trunk on the switch (routers have no DTP)'],
    ['des', 'dynamic desirable; the router will agree'],
    ['svi', 'interface vlan 1 on the router'],
  ],
  noneg: [
    ['noneg', 'mode access (or trunk) plus switchport nonegotiate'],
    ['auto', 'Leave dynamic auto; PCs cannot send DTP'],
    ['vtp', 'vtp mode off — that is what stops DTP'],
  ],
  vtpnull: [
    ['nothing', 'Nothing — NULL domain does not advertise'],
    ['flood', 'VLAN 10 floods to every switch in the LAN'],
    ['rev1', 'Revision becomes 1 and every server syncs'],
  ],
  sync: [
    ['rev3', 'Revision 3, eight VLANs (1, 2–4, 1002–1005)'],
    ['rev0', 'Revision stays 0; creates are local on a server'],
    ['rev4', 'Revision 4 because VLAN 1 also counts as a change'],
  ],
  modes: [
    ['fwd', 'SW2 forwards, does not sync. SW3 syncs. vlan 5 on SW3 is rejected'],
    ['both', 'SW2 and SW3 both sync; client can create VLANs'],
    ['drop', 'Transparent drops VTP, so SW3 never hears VLAN 5'],
  ],
  v3: [
    ['needpri', 'Rejected until vtp primary (privileged EXEC)'],
    ['ok', 'Any v3 server can edit, like v1'],
    ['off', 'Version 3 cannot create VLANs; use transparent'],
  ],
  bomb: [
    ['wipe', 'They lose connectivity — production syncs to revision 50'],
    ['keep', 'Production keeps 5; a new switch cannot overwrite'],
    ['v1pri', 'Nothing; even v1 only syncs to a primary server'],
  ],
};

function sendsDtp(mode, nonegotiate) {
  if (nonegotiate) {
    return false;
  }
  return mode !== 'access';
}

function operational(mine, peerMode, mineNo, peerNo, peerKind) {
  if (peerKind === 'router' || peerKind === 'host') {
    return mine === 'trunk' ? 'trunk' : 'access';
  }
  if (mine === 'access') {
    return 'access';
  }
  if (mine === 'trunk') {
    return 'trunk';
  }
  const peerSends = sendsDtp(peerMode, peerNo);
  if (mine === 'dynamic auto') {
    if (peerMode === 'trunk' && peerSends) {
      return 'trunk';
    }
    if (peerMode === 'dynamic desirable') {
      return 'trunk';
    }
    return 'access';
  }
  if (peerMode === 'access') {
    return 'access';
  }
  if (peerMode === 'trunk' && !peerSends) {
    return 'access';
  }
  if (peerMode === 'trunk' || peerMode === 'dynamic auto' || peerMode === 'dynamic desirable') {
    return 'trunk';
  }
  return 'access';
}

function pairKind(aOp, bOp, aMode, bMode, peerKind) {
  if (peerKind !== 'switch') {
    return aOp;
  }
  if ((aMode === 'access' && bMode === 'trunk') || (aMode === 'trunk' && bMode === 'access')) {
    return 'invalid';
  }
  return aOp === 'trunk' && bOp === 'trunk' ? 'trunk' : 'access';
}

function adminLabel(mode) {
  if (mode === 'access') {
    return 'static access';
  }
  return mode;
}

function opLabel(op) {
  return op === 'trunk' ? 'trunk' : 'static access';
}

function vlanLine(list) {
  return list.filter((n) => n < 1002).join(', ');
}

function dtpCli(name, mode, op, nonegotiate) {
  return `${name}# show interfaces g0/0 switchport
Name: Gi0/0
Switchport: Enabled
Administrative Mode: ${adminLabel(mode)}
Operational Mode: ${opLabel(op)}
Negotiation of Trunking: ${sendsDtp(mode, nonegotiate) ? 'On' : 'Off'}`;
}

function vtpCli(name, box, existing) {
  const domain = box.domain || '';
  return `${name}# show vtp status
VTP Version capable : 1 to 3
VTP version running : ${box.ver}
VTP Domain Name : ${domain}
VTP Operating Mode : ${box.mode === 'server' && box.ver === 3 ? (box.primary ? 'Primary Server' : 'Server') : box.mode[0].toUpperCase() + box.mode.slice(1)}
Number of existing VLANs : ${existing}
Configuration Revision : ${box.mode === 'transparent' || box.mode === 'off' ? 0 : box.rev}`;
}

export default function DtpVtpSimulator() {
  const [idx, setIdx] = useState(0);
  const [a, setA] = useState('dynamic auto');
  const [b, setB] = useState('dynamic auto');
  const [aNo, setANo] = useState(false);
  const [bNo, setBNo] = useState(false);
  const [peer, setPeer] = useState('switch');
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  const story = STORIES[idx];

  function setStory(i) {
    const next = STORIES[i];
    setIdx(i);
    setPicked(null);
    setFeedback('');
    if (next.cfg) {
      setA(next.cfg.a);
      setB(next.cfg.b);
      setANo(next.cfg.aNo);
      setBNo(next.cfg.bNo);
      setPeer(next.cfg.peer);
    }
  }

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  const aOp = operational(a, b, aNo, bNo, peer);
  const bOp = peer === 'switch' ? operational(b, a, bNo, aNo, 'switch') : peer;
  const link = pairKind(aOp, bOp, a, b, peer);

  const vtp = story.vtp || {
    ver: 1,
    domain: 'Manning',
    primary: true,
    sw4: false,
    modes: {sw1: 'server', sw2: 'server', sw3: 'server'},
    vlans: [1, 2, 3, 4],
    rev: 3,
  };

  const boxes = useMemo(() => {
    const trans = vtp.modes.sw2 === 'transparent' || vtp.modes.sw2 === 'off';
    const sw2Vlans = trans ? vtp.transVlans || [1, 12] : vtp.vlans;
    const sw2Rev = trans ? 0 : vtp.rev;
    return [
      {id: 'SW1', mode: vtp.modes.sw1, vlans: vtp.vlans, rev: vtp.modes.sw1 === 'transparent' ? 0 : vtp.rev, primary: vtp.ver === 3 && vtp.primary},
      {id: 'SW2', mode: vtp.modes.sw2, vlans: sw2Vlans, rev: sw2Rev, primary: false},
      {id: 'SW3', mode: vtp.modes.sw3, vlans: trans && vtp.modes.sw3 !== 'transparent' ? vtp.vlans : vtp.vlans, rev: vtp.modes.sw3 === 'transparent' ? 0 : vtp.rev, primary: false},
    ];
  }, [vtp]);

  const existing = 5 + vtp.vlans.filter((n) => n !== 1 && n < 1002).length;
  const peerLabel = peer === 'router' ? 'R1' : peer === 'host' ? 'PC' : 'SW2';
  const stroke = link === 'trunk' ? '#1565c0' : link === 'invalid' ? '#c62828' : '#78909c';

  return (
    <CEBlock
      title="DTP matrix, then VTP revision"
      subtitle="Admin mode is what you typed. Operational mode is access or trunk after DTP. VTP copies vlan.dat inside one domain."
      headerAction={
        <Button size="small" variant="text" onClick={() => setStory((idx + 1) % STORIES.length)}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        {story.panel === 'dtp' ? (
          <div className={styles.grid}>
            <div>
              <svg className={styles.canvas} viewBox="0 0 640 220" role="img" aria-label="SW1 to neighbor DTP link">
                <rect x="40" y="70" width="140" height="80" rx="8" fill="#eceff1" stroke="#546e7a" />
                <text x="110" y="116" textAnchor="middle" fontSize="16" fontWeight="700">
                  SW1
                </text>
                <text x="110" y="58" textAnchor="middle" fontSize="11" fill="#546e7a">
                  {a}
                </text>
                <rect x="460" y="70" width="140" height="80" rx="8" fill={peer === 'switch' ? '#eceff1' : '#fff3e0'} stroke="#546e7a" />
                <text x="530" y="116" textAnchor="middle" fontSize="16" fontWeight="700">
                  {peerLabel}
                </text>
                <text x="530" y="58" textAnchor="middle" fontSize="11" fill="#546e7a">
                  {peer === 'switch' ? b : peer === 'router' ? 'no DTP' : 'end host'}
                </text>
                <line x1="180" y1="110" x2="460" y2="110" stroke={stroke} strokeWidth="6" />
                <text x="320" y="100" textAnchor="middle" fontSize="13" fontWeight="700" fill={stroke}>
                  {link}
                </text>
                {sendsDtp(a, aNo) ? (
                  <text x="250" y="150" textAnchor="middle" fontSize="11" fill="#1565c0">
                    DTP →
                  </text>
                ) : null}
                {peer === 'switch' && sendsDtp(b, bNo) ? (
                  <text x="390" y="150" textAnchor="middle" fontSize="11" fill="#1565c0">
                    ← DTP
                  </text>
                ) : null}
                <text x="320" y="190" textAnchor="middle" fontSize="12" fill="#37474f">
                  {`SW1 ${opLabel(aOp)}   ${peer === 'switch' ? `SW2 ${opLabel(bOp)}` : `${peerLabel} has no switchport`}`}
                </text>
              </svg>
              <div className={styles.row}>
                <span className={styles.label}>SW1 G0/0</span>
                <div className={styles.modes}>
                  {MODES.map((m) => (
                    <Button key={`a-${m}`} size="small" variant={a === m ? 'contained' : 'text'} onClick={() => setA(m)}>
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
              {peer === 'switch' ? (
                <div className={styles.row}>
                  <span className={styles.label}>SW2 G0/0</span>
                  <div className={styles.modes}>
                    {MODES.map((m) => (
                      <Button key={`b-${m}`} size="small" variant={b === m ? 'contained' : 'text'} onClick={() => setB(m)}>
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className={styles.row}>
                <Button size="small" variant={peer === 'switch' ? 'contained' : 'outlined'} onClick={() => setPeer('switch')}>
                  Neighbor switch
                </Button>
                <Button size="small" variant={peer === 'router' ? 'contained' : 'outlined'} onClick={() => setPeer('router')}>
                  Neighbor router
                </Button>
                <Button size="small" variant={aNo ? 'contained' : 'outlined'} onClick={() => setANo((v) => !v)}>
                  SW1 nonegotiate
                </Button>
              </div>
            </div>
            <div className={styles.panel}>
              <h4>show interfaces g0/0 switchport</h4>
              <pre className={styles.cli}>{dtpCli('SW1', a, aOp, aNo)}</pre>
              {peer === 'switch' ? <pre className={styles.cli}>{dtpCli('SW2', b, bOp, bNo)}</pre> : null}
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            <div>
              <svg className={styles.canvas} viewBox="0 0 640 220" role="img" aria-label="VTP domain switches">
                {boxes.map((box, i) => {
                  const x = 40 + i * 200;
                  return (
                    <g key={box.id}>
                      <rect x={x} y="48" width="160" height="110" rx="8" fill="#eceff1" stroke="#546e7a" />
                      <text x={x + 80} y="74" textAnchor="middle" fontSize="15" fontWeight="700">
                        {box.id}
                      </text>
                      <text x={x + 80} y="94" textAnchor="middle" fontSize="11" fill="#37474f">
                        {`${box.mode}${box.primary ? ' primary' : ''}`}
                      </text>
                      <text x={x + 80} y="112" textAnchor="middle" fontSize="11" fill="#546e7a">
                        {`rev ${box.rev}`}
                      </text>
                      <text x={x + 80} y="132" textAnchor="middle" fontSize="11">
                        {`VLAN ${vlanLine(box.vlans)}`}
                      </text>
                      {i < boxes.length - 1 ? (
                        <line x1={x + 160} y1="100" x2={x + 200} y2="100" stroke="#1565c0" strokeWidth="5" />
                      ) : null}
                    </g>
                  );
                })}
                {vtp.sw4 ? (
                  <text x="320" y="190" textAnchor="middle" fontSize="12" fill="#c62828">
                    SW4 joined, rev 50 — others copied VLAN 1, 99, 200
                  </text>
                ) : (
                  <text x="320" y="190" textAnchor="middle" fontSize="12" fill="#37474f">
                    {vtp.domain ? `domain ${vtp.domain}   VTP v${vtp.ver}` : 'domain NULL — no advertisements'}
                  </text>
                )}
              </svg>
              <p className={styles.legend}>
                <span>
                  <span className={styles.swatch} style={{background: '#1565c0'}} />
                  VTP on trunks only
                </span>
                <span>vlan.dat in flash · 1002–1005 always exist</span>
              </p>
            </div>
            <div className={styles.panel}>
              <h4>show vtp status</h4>
              <pre className={styles.cli}>
                {vtpCli('SW1', {ver: vtp.ver, domain: vtp.domain, mode: vtp.modes.sw1, rev: vtp.rev, primary: vtp.primary}, existing)}
              </pre>
            </div>
          </div>
        )}
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
          {feedback || 'Toggle admin modes. auto + auto stays access. desirable asks. VTP stories start after the DTP matrix.'}
        </p>
      </div>
    </CEBlock>
  );
}
