/** CCNA: IPv4 subnetting — CIDR, borrow bits, five attributes, FLSM, VLSM. */

export default {
  title: 'Borrow, then read the five numbers',
  lead: 'Classful /8 /16 /24 waste space. CIDR cuts mid-octet. Flip borrowed bits; host bits still 0/1 for net/bcast.',
  note: 'FLSM = equal 2^x slices. VLSM = largest need first, next net = previous bcast + 1.',
  steps: [
    {
      caption: '192.168.1.0/24 is one class C–sized block. You may carve it; you may not jump to 192.168.2.0.',
    },
    {
      ask: 'A 12-PC office with a whole /24 wastes addresses because:',
      choices: [
        {label: 'Classful sizes cannot shrink; 254 usable is the floor for that class', ok: true},
        {label: 'Unused addresses expire after DHCP’s lease', ok: false},
        {label: '/24 cannot be routed past a Cisco gateway', ok: false},
      ],
      caption: 'CIDR lets the prefix be /28 for that office instead.',
    },
    {
      ask: 'Borrow 1 bit from 192.168.1.0/24. Subnets:',
      choices: [
        {label: '.0/25 and .128/25', ok: true},
        {label: 'Four /24s in the last octet', ok: false},
        {label: 'Still one /24; .128 cannot be a network address', ok: false},
      ],
      caption: '2^x subnets. Network address need not end in .0 once the cut is mid-octet.',
    },
    {
      ask: '192.168.1.64/26 broadcast and hosts:',
      choices: [
        {label: '.127 and 62 (six host bits, 2^6−2)', ok: true},
        {label: '.255 and 254; it is still class C', ok: false},
        {label: '.95 and 30, as if it were /27', ok: false},
      ],
      caption: 'Borrowed bits are network. Host all 0 = net. Host all 1 = bcast.',
    },
    {
      ask: '172.16.20.27/28 network address:',
      choices: [
        {label: '172.16.20.16 (host nibble of 00011011 cleared)', ok: true},
        {label: '172.16.20.0, zero the whole last octet', ok: false},
        {label: '172.16.20.27, the host is already unique', ok: false},
      ],
      caption: 'Binary, zero host bits, dotted decimal. Same steps for broadcast (all 1s).',
    },
    {
      ask: '/25 as an IOS subnet mask:',
      choices: [
        {label: '255.255.255.128', ok: true},
        {label: '255.255.255.192 (/26)', ok: false},
        {label: '255.255.255.127 (not contiguous 1s)', ok: false},
      ],
      caption: '/26=192, /27=224, /28=240, /29=248, /30=252, /31=254.',
    },
    {
      ask: 'Four equal subnets from 172.25.190.0/23. Second first-usable:',
      choices: [
        {label: '172.25.190.129/25', ok: true},
        {label: '172.25.191.1/25 (that is subnet 3)', ok: false},
        {label: '172.25.190.65/26 (borrowed 3 bits)', ok: false},
      ],
      caption: 'Borrow 2 → /25. .190.0, .190.128, .191.0, .191.128.',
    },
    {
      ask: 'VLSM 122 then 59 hosts on 10.89.100.0/24. First two prefixes:',
      choices: [
        {label: '.0/25 then .128/26 (largest first)', ok: true},
        {label: 'WAN /30 at .0, then 122 at .4', ok: false},
        {label: 'Equal /26s; 122 will share two of them', ok: false},
      ],
      caption: 'Next network = previous broadcast + 1. /31 is legal on the WAN; /30 is the common lab pick.',
    },
  ],
};
