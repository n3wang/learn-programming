/** CCNA: classic STP — loops, algorithm, states, PortFast. */

export default {
  title: 'One active path, then wait for the timers',
  lead: 'Ethernet has no TTL. Redundant BUM floods loop forever. STP elects a root, one root port per switch, one designated port per segment, and blocks the rest.',
  note: 'Exam 2.5 names Rapid PVST+. This chapter is 802.1D / PVST+ classic — the algorithm Rapid still uses. Rapid itself waits.',
  steps: [
    {
      caption:
        'A ring of switches plus a broadcast is two circulating copies plus MAC flapping. STP’s job is one active path between any two nodes.',
    },
    {
      ask: 'Lowest BID wins the root. BID is compared as:',
      choices: [
        {label: 'Bridge priority (configurable + VLAN ID), then the switch MAC', ok: true},
        {label: 'The lowest interface MAC on G0/0', ok: false},
        {label: 'Highest priority so the core “wins”', ok: false},
      ],
      caption: 'Default 32768 + VLAN 1 = 32769. Configure only multiples of 4096. priority 0 is the surest root.',
    },
    {
      ask: 'Root port, in order:',
      choices: [
        {label: 'Lowest root cost, then lowest neighbor BID, then lowest neighbor port ID', ok: true},
        {label: 'Lowest local port name, then your own BID', ok: false},
        {label: 'Highest cost so the backup stays idle', ok: false},
      ],
      caption: 'Root advertises cost 0. You add the receiving port’s cost (1 Gbps = 4) when you forward. Neighbor port ID — not yours.',
    },
    {
      ask: 'Designated port on a leftover segment:',
      choices: [
        {label: 'Port on the switch with the lower root cost; tie → lower BID', ok: true},
        {label: 'The port with the higher interface cost', ok: false},
        {label: 'Both ends designated so the link can load-share', ok: false},
      ],
      caption: 'One designated per segment. Root-bridge ports are all designated. The far side of a root port is designated. The rest block.',
    },
    {
      ask: 'A new access port, no PortFast, time to forward:',
      choices: [
        {label: '30 s — listening 15 + learning 15. Failover can be 50 s (max age 20 + 30)', ok: true},
        {label: '2 s — that is the hello, and hello is the only wait', ok: false},
        {label: 'Immediate; classic STP has no transitional states', ok: false},
      ],
      caption: 'BLK / LIS / LRN / FWD. Only FWD sends data. Altn/BLK is the loop breaker. Hello 2 s comes from the root.',
    },
    {
      ask: 'PortFast + BPDU Guard on a PC port:',
      choices: [
        {label: 'Skip LIS/LRN. A BPDU err-disables the port. Bounce after you unplug the extra switch', ok: true},
        {label: 'Enable both on every trunk so the core converges faster', ok: false},
        {label: 'PortFast blocks BPDUs; Guard is only for trunks', ok: false},
      ],
      caption: 'portfast or portfast default (access only). bpduguard enable or portfast bpduguard default. Together on host ports.',
    },
  ],
};
