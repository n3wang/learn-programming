/** CCNA: Ethernet LAN switching — flood, learn, ARP, ping. */

export default {
  title: 'What does the switch do?',
  lead: 'PC1 wants PC3 on a two-switch LAN. Empty tables, then a reply, then ARP and ping.',
  note: 'Learn the source. Look up the dest. Known unicast forwards; unknown or broadcast floods.',
  steps: [
    {
      caption: 'SW1 and SW2 are cabled together. PC1–PC2 hang off SW1. PC3–PC4 hang off SW2. No router.',
    },
    {
      ask: 'This whole picture is how many LANs?',
      choices: [
        {label: 'One Layer 2 domain', ok: true},
        {label: 'Four, one per PC', ok: false},
        {label: 'Two, because there are two switches', ok: false},
      ],
      caption: 'Frames switch from PC1 to PC3 with no router hop. That is one LAN.',
    },
    {
      ask: 'Tables are empty. PC1 sends unicast to PC3’s MAC. SW1:',
      choices: [
        {label: 'Floods every port except the ingress', ok: true},
        {label: 'Drops the frame until an admin adds a static MAC', ok: false},
        {label: 'Forwards only G0/0 by guessing the uplink', ok: false},
      ],
      caption: 'Unknown unicast. PC2 drops. SW2 floods again. PC4 drops. PC3 accepts.',
    },
    {
      ask: 'What did SW1 learn from that frame?',
      choices: [
        {label: 'PC1’s source MAC on the ingress port', ok: true},
        {label: 'PC3’s dest MAC on every flooded port', ok: false},
        {label: 'Nothing — learning waits for ARP', ok: false},
      ],
      caption: 'Source teaches. Dest is the lookup. SW2 also learned PC1 on its G0/0.',
    },
    {
      ask: 'PC3 replies to PC1. Both tables already have PC1. The reply is:',
      choices: [
        {label: 'Known unicast — one exit per switch', ok: true},
        {label: 'Broadcast, so PC2 sees the reply too', ok: false},
        {label: 'Flooded again; replies never use the table', ok: false},
      ],
      caption: 'SW2 out G0/0, SW1 out G0/1. The conversation is now a thin path.',
    },
    {
      ask: 'If PC1 had only the IP, the first Ethernet dest MAC would be:',
      choices: [
        {label: 'ffff.ffff.ffff (ARP request)', ok: true},
        {label: 'SW1’s burned-in address', ok: false},
        {label: 'PC3’s MAC, already printed on the chassis', ok: false},
      ],
      caption: 'ARP request floods. ARP reply is unicast. Then ping’s ICMP echoes are unicast too.',
    },
  ],
};
