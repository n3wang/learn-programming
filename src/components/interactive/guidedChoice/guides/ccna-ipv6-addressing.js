/** CCNA: IPv6 addressing — hex, abbreviate, /64, CLI, EUI-64, types. */

export default {
  title: '128 bits, still just an address',
  lead: 'IPv4 ran out. IPv6 is hex hextets, usually /64. Enable routing, then ipv6 address. Types: GUA, ULA, LLA, multicast, anycast.',
  note: 'NDP and solicited-node wait. NAT and private IPv4 details wait. Exam 1.8 configure; 1.9 describe types.',
  steps: [
    {
      caption:
        '32 bits vs 128 bits: each extra bit doubles. Version 5 was Stream Protocol, so the next IP is 6. One hex digit is four bits.',
    },
    {
      ask: 'Shorten 2001:0db8:0000:0000:002f:0001:0000:34bd the RFC 5952 way:',
      choices: [
        {label: '2001:db8::2f:1:0:34bd — leading zeros gone, one :: on the longest run', ok: true},
        {label: '2001:db8::2f:1::34bd — two double colons', ok: false},
        {label: '2001:0db8::2f:1:0:34bd — keep the 0 in 0db8', ok: false},
      ],
      caption: '/64 prefix: zero the last four hextets. 2001:db8:1:2:a:b:c:d/64 → 2001:db8:1:2::/64.',
    },
    {
      ask: 'Addresses are on two ifaces but packets do not cross. You need:',
      choices: [
        {label: 'ipv6 unicast-routing — IPv6 forwarding starts off', ok: true},
        {label: 'ip routing — that already covers IPv6', ok: false},
        {label: 'A second ipv6 address, which overwrites like IPv4', ok: false},
      ],
      caption: 'Slash notation, not a dotted mask. Extra ipv6 address commands add. no the old one to replace.',
    },
    {
      ask: 'MAC 0060.2f62.b803 → Modified EUI-64 IID:',
      choices: [
        {label: '0260:2fff:fe62:b803 — split, fffe, invert the seventh bit', ok: true},
        {label: '0060:2fff:fe62:b803 — insert fffe but skip the flip', ok: false},
        {label: 'fe80::260:2fff:fe62:b803 — that is a full LLA, not the 64-bit ID', ok: false},
      ],
      caption: 'ipv6 address 2001:db8:0:2::/64 eui-64. Auto LLA uses the same IID.',
    },
    {
      ask: 'Pick the type:',
      choices: [
        {label: 'fd… ULA, fe80::/64 LLA (required, on-link), ff multicast, same unicast on many hosts = anycast', ok: true},
        {label: 'ff02::1 is all routers; IPv6 still has directed broadcast', ok: false},
        {label: 'ULA is 2000::/3; LLA is optional like IPv4 169.254.0.0/16', ok: false},
      ],
      caption: 'ff02::1 all-nodes, ff02::2 all-routers. :: unspecified, ::1 loopback. GUA: /48 + 16-bit subnet + 64-bit host.',
    },
  ],
};
