/** CCNA: IPv4 addressing — header, binary, prefix, IOS, usable range, class. */

export default {
  title: 'Read the packet, then number the interface',
  lead: 'TTL, one octet, /24 versus a netmask, then type ip address and no shutdown.',
  note: 'Network bits on the left. Host bits on the right. Subtract 2 for usable hosts.',
  steps: [
    {
      caption: 'The IPv4 header carries two 32-bit addresses plus TTL, Protocol, and a header checksum.',
    },
    {
      ask: 'A packet looping R1→R2→R3→R1 finally dies because:',
      choices: [
        {label: 'TTL hits 0; the router drops instead of forwarding', ok: true},
        {label: 'Ethernet FCS expires after three hops', ok: false},
        {label: 'The dest IP is rewritten to 255.255.255.255', ok: false},
      ],
      caption: 'Each hop subtracts 1. Loops should not exist; TTL is the safety net.',
    },
    {
      ask: '11001110 as an octet is decimal:',
      choices: [
        {label: '206 (128+64+8+4+2)', ok: true},
        {label: '47 (the lower five 1s only)', ok: false},
        {label: '255, because any 1 saturates the byte', ok: false},
      ],
      caption: 'Add the weights that are on. 32 and 16 are off in this octet.',
    },
    {
      ask: '192.168.100.100/24 — the shared prefix is:',
      choices: [
        {label: '192.168.100 (first 24 bits)', ok: true},
        {label: '100.100 (last 16 bits, because 100 repeats)', ok: false},
        {label: 'The whole 32 bits; /24 means 24 hosts', ok: false},
      ],
      caption: 'Neighbors keep 192.168.100 and change the last octet.',
    },
    {
      ask: 'IOS ip address needs a netmask. /24 is:',
      choices: [
        {label: '255.255.255.0', ok: true},
        {label: '0.0.0.255', ok: false},
        {label: '255.255.0.0', ok: false},
      ],
      caption: '1s are network bits, on the left. Then no shutdown — interfaces start disabled.',
    },
    {
      ask: '172.20.20.127/16 usable range is:',
      choices: [
        {label: '172.20.0.1 – 172.20.255.254', ok: true},
        {label: '172.20.20.1 – 172.20.20.254', ok: false},
        {label: '172.20.0.0 – 172.20.255.255 including network/broadcast', ok: false},
      ],
      caption: 'Host bits are two octets. Network 172.20.0.0, broadcast 172.20.255.255, then ±1.',
    },
    {
      ask: '192.168.1.1 classfully is:',
      choices: [
        {label: 'Class C, /24 (first octet 192–223)', ok: true},
        {label: 'Class A, /8', ok: false},
        {label: 'Class D multicast', ok: false},
      ],
      caption: 'Classful rules are legacy. Classless prefixes (subnetting) come later.',
    },
  ],
};
