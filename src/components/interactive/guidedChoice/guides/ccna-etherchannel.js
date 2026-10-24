/** CCNA: EtherChannel — bundle, modes, flags, hash, Layer 3. */

export default {
  title: 'One STP port, several cables',
  lead: 'EtherChannel glues physical links into PoN. STP and flooding treat the group as one. Prefer LACP; on is a last resort. Hash by flow, not by packet.',
  note: 'Non-Cisco neighbor → LACP. Group numbers are local. Live VLAN edits go on the port-channel. L3: no switchport, IP on Po.',
  steps: [
    {
      caption:
        'Without a bundle, STP discards extras. With a bundle, BUM that entered one member does not leave the sibling members. Some Po links in a larger LAN still sit Altn BLK.',
    },
    {
      ask: 'Which mode pair forms a channel?',
      choices: [
        {label: 'desirable + auto, active + passive, or on + on. Same protocol on both ends', ok: true},
        {label: 'auto + auto and passive + passive — silent ends still negotiate', ok: false},
        {label: 'active + desirable — LACP and PAgP interoperate', ok: false},
      ],
      caption: 'PAgP = Cisco, 8 links. LACP = 802.3ad, 16 members / 8 active. show pagp neighbor / show lacp neighbor tell you the partner’s mode.',
    },
    {
      ask: 'Po1(SU) Gi0/0(P) vs Gi0/1(s) vs Gi0/2(I):',
      choices: [
        {label: 'SU = L2 in use. P = bundled. s = suspended (mismatch). I = stand-alone', ok: true},
        {label: 'S means suspended; s means Layer 2', ok: false},
        {label: 'I means the port is the LACP initiator', ok: false},
      ],
      caption: 'R = Layer 3. D on Po = down. Change live settings on the port-channel so members stay identical.',
    },
    {
      ask: 'Four 1 Gbps members, src-dst-ip hash. One flow:',
      choices: [
        {label: 'Stays on one member (1 Gbps). Bundle bandwidth is 4 Gbps', ok: true},
        {label: 'Stripes packets so that flow is 4 Gbps', ok: false},
        {label: 'Ignores IP and always uses dst-mac toward the gateway', ok: false},
      ],
      caption: 'port-channel load-balance / show etherchannel load-balance. Non-IP falls back to MAC. dst-mac alone can pin gateway traffic on one cable.',
    },
    {
      ask: 'Layer 3 EtherChannel on a multilayer switch:',
      choices: [
        {label: 'no switchport on members, channel-group, IP on the port-channel → RU', ok: true},
        {label: 'Address each member; Po is only an STP handle', ok: false},
        {label: 'Requires PAgP; LACP is Layer 2 only', ok: false},
      ],
      caption: 'Same mode rules as L2. One IP, one routing neighbor, hash across the cables.',
    },
  ],
};
