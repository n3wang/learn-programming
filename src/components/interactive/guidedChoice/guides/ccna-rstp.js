/** CCNA: Rapid PVST+ vs classic STP — versions, roles, link types, toolkit. */

export default {
  title: 'Same tree, faster ports',
  lead: 'Rapid PVST+ still elects a root, one root port, one designated per segment. Nondesignated splits into alternate and backup. Sync can skip the 30 s walk; three missed hellos is 6 s, not max age 20.',
  note: 'Cisco: mode pvst prints protocol ieee; mode rapid-pvst prints rstp. Edge is PortFast. Do not learn the sync handshake.',
  steps: [
    {
      caption:
        '802.1D / PVST+ vs 802.1w / Rapid PVST+. Per-VLAN trees tax CPU. MSTP (802.1s) groups VLANs and still uses RSTP speed.',
    },
    {
      ask: 'RSTP states, mapped from classic STP:',
      choices: [
        {label: 'Discarding = blocking + listening. Then learning, then forwarding', ok: true},
        {label: 'RSTP deletes learning; every port jumps to forwarding', ok: false},
        {label: 'Blocking stays; discarding is only for shutdown ports', ok: false},
      ],
      caption: 'show spanning-tree still prints BLK. Sync success → FWD now. Sync fail (PC, router, classic STP neighbor) → 15+15.',
    },
    {
      ask: 'Alternate vs backup:',
      choices: [
        {label: 'Alternate: spare path to the root (DP on another switch). Backup: second port on the same hub segment as your own DP', ok: true},
        {label: 'Backup is the new name for every nondesignated port', ok: false},
        {label: 'Alternate only exists on the root bridge', ok: false},
      ],
      caption: 'Hub + two ports: lowest local port ID wins DP/RP. Root is the designated bridge for every segment — not “every root port is designated” if a hub is in play.',
    },
    {
      ask: 'RSTP link types:',
      choices: [
        {label: 'P2P = full duplex (sync). Shared = half (no sync). Edge = PortFast, must be typed', ok: true},
        {label: 'Edge is set with spanning-tree link-type edge', ok: false},
        {label: 'Shared is the default on every gigabit trunk', ok: false},
      ],
      caption: 'IOS shows P2p, Shr, P2p Edge. Edge up/down is not a topology change. RSTP TC is a non-edge port going to forwarding.',
    },
    {
      ask: 'Root Guard vs Loop Guard vs BPDU Filter:',
      choices: [
        {label: 'Root: superior BPDU → ROOT_Inc. Loop: BPDUs stop → LOOP_Inc. Filter on an iface = STP off (dangerous)', ok: true},
        {label: 'Put Root Guard and Loop Guard on the same port for belts and braces', ok: false},
        {label: 'Interface BPDU Filter is the same as BPDU Guard', ok: false},
      ],
      caption: 'Guards auto-recover. Global portfast bpdufilter default: stop sending; a received BPDU turns PortFast and Filter off.',
    },
  ],
};
