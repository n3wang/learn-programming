/** CCNA: life of a packet — gateway ARP, switch, longest match, hop rewrite, return. */

export default {
  title: 'Walk one ping across the campus',
  lead: 'PC1 to PC3 via R1, R2, R3. Dest IP is constant. Dest MAC is the next hop.',
  note: 'Off-LAN → gateway. Longest prefix. Connected last hop ARPs the host.',
  steps: [
    {
      caption: 'PC1 192.168.1.11/24 pings 192.168.3.11. SW1, R1, R2, R3, SW2, PC3.',
    },
    {
      ask: 'Is PC3 on PC1’s LAN? First dest MAC is:',
      choices: [
        {label: 'R1 G0/1, the default gateway', ok: true},
        {label: 'PC3’s MAC, learned by a campus-wide ARP', ok: false},
        {label: 'SW1’s BIA, because the switch will route it', ok: false},
      ],
      caption: 'Different /24. Hosts ARP a gateway, not a remote dest.',
    },
    {
      ask: 'The ARP request dest MAC is ffff.ffff.ffff. SW1:',
      choices: [
        {label: 'Floods every port except ingress', ok: true},
        {label: 'Forwards only the uplink, guessing “toward PC3”', ok: false},
        {label: 'Drops ARP; only routers may see it', ok: false},
      ],
      caption: 'PC2 drops. R1 replies unicast and stores PC1 in ARP too.',
    },
    {
      ask: 'R1’s dest MAC is itself. Next it:',
      choices: [
        {label: 'De-encapsulates and takes the longest matching route', ok: true},
        {label: 'Forwards the same Ethernet header to R2', ok: false},
        {label: 'Changes dest IP to 192.168.12.2 before looking up', ok: false},
      ],
      caption: 'S 192.168.3.0/24 via 192.168.12.2. Then ARP that next hop.',
    },
    {
      ask: 'The frame R1 sends to R2 keeps which addresses?',
      choices: [
        {label: 'IPs PC1→PC3; new MACs R1 G0/0 → R2 G0/0', ok: true},
        {label: 'Original PC1 dest MAC; IPs hop-NATed to .12.2', ok: false},
        {label: 'No MAC at all — routers emit bare IP', ok: false},
      ],
      caption: 'Layer 3 end-to-end. Layer 2 hop-to-hop. R2 then R3 repeat the movie.',
    },
    {
      ask: 'R3 matches C 192.168.3.0/24. It ARPs for:',
      choices: [
        {label: 'PC3 (192.168.3.11)', ok: true},
        {label: 'R2 again, so the packet can bounce', ok: false},
        {label: 'PC1, to write a reverse path into the packet', ok: false},
      ],
      caption: 'Connected last hop delivers to the host. SW2 floods that ARP; PC4 ignores it.',
    },
    {
      ask: 'The echo reply needs no ARP because:',
      choices: [
        {label: 'ARP and MAC tables are already warm', ok: true},
        {label: 'Replies skip Ethernet', ok: false},
        {label: '192.168.1.11 is now local to PC3’s /24', ok: false},
      ],
      caption: 'Same forwarding. Known unicasts. Gateway MACs already cached.',
    },
  ],
};
