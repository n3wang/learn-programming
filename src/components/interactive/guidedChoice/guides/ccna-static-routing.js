/** CCNA: routing fundamentals — local vs remote, C/L, longest match, static forms. */

export default {
  title: 'Pick a MAC, then pick a prefix',
  lead: 'Same LAN frames the dest host. Off-LAN frames the gateway. The router wants the longest match.',
  note: 'C and L appear at up/up. Remote nets need ip route. /0 is the floor, not the ceiling.',
  steps: [
    {
      caption: 'PC1 192.168.1.11/24, gateway 192.168.1.1. PC3 lives at 192.168.3.11.',
    },
    {
      ask: 'PC1 sends to 192.168.1.12. Dest MAC is:',
      choices: [
        {label: 'PC2 — same prefix, ARP the host', ok: true},
        {label: 'R1 G0/1, because IPv4 always uses a gateway', ok: false},
        {label: 'ffff.ffff.ffff; unicast IPv4 is illegal on Ethernet', ok: false},
      ],
      caption: 'Compare dest IP to the local range. Inside it, no router.',
    },
    {
      ask: 'PC1 sends to 192.168.3.11. First dest MAC is:',
      choices: [
        {label: 'R1 G0/1 — default gateway. Dest IP is still PC3', ok: true},
        {label: 'PC3, learned by flooding ARP past the routers', ok: false},
        {label: 'R3 G0/1, because that is PC3’s LAN', ok: false},
      ],
      caption: 'Off-LAN: frame the gateway. ARP 192.168.1.1, not 192.168.3.11.',
    },
    {
      ask: 'G0/1 is 192.168.1.1/24, up/up. The new rows are:',
      choices: [
        {label: 'C 192.168.1.0/24 and L 192.168.1.1/32', ok: true},
        {label: 'Still empty — you must type ip route for connected nets', ok: false},
        {label: 'OSPF O rows for every host that ARPs', ok: false},
      ],
      caption: 'Network route C, host route L. Remote prefixes are still missing.',
    },
    {
      ask: 'Dest 192.168.1.1 matches C /24 and L /32. R1:',
      choices: [
        {label: 'Selects L /32 and receives the packet', ok: true},
        {label: 'Selects C /24 and hairpins it out G0/1', ok: false},
        {label: 'Floods; two hits mean unknown dest', ok: false},
      ],
      caption: 'Longest prefix. Switches want an exact MAC. Routers want the longest match.',
    },
    {
      ask: 'Dest 192.168.3.11, only C/L installed. R1:',
      choices: [
        {label: 'Drops — routers never flood packets', ok: true},
        {label: 'Floods every interface except ingress', ok: false},
        {label: 'ARPs 192.168.3.11 on every connected LAN', ok: false},
      ],
      caption: 'No match → drop. A default 0.0.0.0/0 would have forwarded leftovers.',
    },
    {
      ask: 'ip route 192.168.3.0 255.255.255.0 192.168.12.2 is:',
      choices: [
        {label: 'Recursive network route — second lookup finds G0/0', ok: true},
        {label: 'Directly connected static; IOS ARPs PC3 on G0/0', ok: false},
        {label: 'Host route, because .2 is one next hop', ok: false},
      ],
      caption: 'Next-hop IP only = recursive. Exit interface only = proxy ARP. Both = fully specified.',
    },
    {
      ask: 'S* 0.0.0.0/0 via an ISP is used when:',
      choices: [
        {label: 'Nothing longer matches — including internet dests', ok: true},
        {label: 'Always, because /0 is the most specific prefix', ok: false},
        {label: 'Only for dests in the same classful network as R1', ok: false},
      ],
      caption: 'Gateway of last resort. Campus /24s still beat /0.',
    },
  ],
};
