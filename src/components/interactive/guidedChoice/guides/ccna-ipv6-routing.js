/** CCNA: IPv6 routing — NDP, table, statics. */

export default {
  title: 'NDP, then the table',
  lead: 'IPv6 does not ARP. NS/NA resolve MACs. RS/RA feed SLAAC. Statics look like IPv4 except Ethernet exit-only and LLA next hops.',
  note: 'No OSPFv3. Neighbor states beyond REACH/INCMP wait. DHCP waits.',
  steps: [
    {
      caption:
        'Solicited-node = ff02::1:ff + last six hex. NS (135) to that group; unicast NA (136). show ipv6 neighbors.',
    },
    {
      ask: 'SLAAC on IOS (ipv6 address autoconfig):',
      choices: [
        {label: 'RS to ff02::2, RA gives the /64, EUI-64 builds the IID. default also installs ::/0 via the RA LLA', ok: true},
        {label: 'Same as typing the prefix with eui-64 — no RA needed', ok: false},
        {label: 'Stateful DHCPv6 is required or the address stays tentative', ok: false},
      ],
      caption: 'DAD: NS to your own solicited-node. Silence = unique. NA = DUP, address unused.',
    },
    {
      ask: 'After two /64 globals, the IPv6 table holds:',
      choices: [
        {label: 'C /64 and L /128 per global, no LLA destinations, FF00::/8 via Null0', ok: true},
        {label: 'C and L rows for every fe80:: address', ok: false},
        {label: 'Only statics — connected IPv6 routes are never automatic', ok: false},
      ],
      caption: 'Longest match. /128 host route beats /64. No match → drop.',
    },
    {
      ask: 'ipv6 route 2001:db8:3::/64 g0/0 on Ethernet:',
      choices: [
        {label: 'Shows in the table, then INCMP — no proxy NDP. Use recursive or fully specified', ok: true},
        {label: 'Works because IPv4 proxy ARP still answers', ok: false},
        {label: 'IOS rejects the command', ok: false},
      ],
      caption: 'LLA next hop must include the iface. Same LLA on two ifaces is legal (per-link unique).',
    },
    {
      ask: 'ipv6 route ::/0 2001:db8::2 plus ipv6 route ::/0 2001:db8:1::2 2:',
      choices: [
        {label: 'AD 1 is installed. AD 2 floats until the primary is gone', ok: true},
        {label: 'Both install as ECMP', ok: false},
        {label: 'Higher AD wins on IPv6', ok: false},
      ],
      caption: '/128 + iface + next hop = host route and fully specified. Network routes are /127 or shorter.',
    },
  ],
};
