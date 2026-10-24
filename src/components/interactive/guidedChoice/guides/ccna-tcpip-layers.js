/** CCNA: walk an HTTPS fetch through the TCP/IP layers. */

export default {
  title: 'Which layer?',
  lead:
    'A browser on PC1 asks SRV1 for a page over HTTPS. Name the layer or the PDU at each step.',
  note: 'Layer 2 is hop-to-hop (MAC). Layer 3 is end-to-end (IP). Layer 4 picks the process (port). Application is still called Layer 7.',
  steps: [
    {
      caption: 'The browser wants a page. HTTPS prepares the request.',
    },
    {
      ask: 'HTTPS, sitting between the browser and the network, is a protocol of:',
      choices: [
        {label: 'Layer 7 (Application)', ok: true},
        {label: 'Layer 2 (Data Link)', ok: false},
        {label: 'Layer 1 (Physical)', ok: false},
      ],
      caption: 'Layer 7 is the interface. HTTPS is not the browser; it is the language the browser uses on the network.',
    },
    {
      ask: 'A Layer 4 header aimed at port 443 is added. Data plus that header is a:',
      choices: [
        {label: 'segment', ok: true},
        {label: 'frame', ok: false},
        {label: 'voltage sample', ok: false},
      ],
      caption: 'Segment = L4PDU. The port picks the HTTPS process on SRV1, not a physical switch jack.',
    },
    {
      ask: 'An IP header aimed at SRV1 is added. That PDU is a:',
      choices: [
        {label: 'packet', ok: true},
        {label: 'trailer', ok: false},
        {label: 'MAC table', ok: false},
      ],
      caption: 'Packet = L3PDU. The destination IP stays SRV1 on every hop.',
    },
    {
      ask: 'Ethernet adds a header to the next-hop MAC and a trailer. The PDU on the wire is a:',
      choices: [
        {label: 'frame', ok: true},
        {label: 'segment', ok: false},
        {label: 'session', ok: false},
      ],
      caption: 'Frame = L2PDU. The destination MAC is rewritten at R1 and again at R2.',
    },
    {
      ask: 'PC1 → R1 → R2 → SRV1. SW1 and SW2 are on the LANs. How many Layer 2 hops?',
      choices: [
        {label: 'three', ok: true},
        {label: 'five, counting each switch', ok: false},
        {label: 'one, because the IP never changes', ok: false},
      ],
      caption: 'A hop is to the next router or the last host. A switch is transparent at this count.',
    },
  ],
};
