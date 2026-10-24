/** CCNA: dynamic vs static, AD/metric, network command. */

export default {
  title: 'Advertise, then pick who sits in the table',
  lead: 'Dynamic routing is routers advertising prefixes so the table rebuilds after a cut. Same destination: metric inside one protocol, AD across protocols. Packet forwarding ignores both and uses the most specific match.',
  note: 'Memorize AD: C 0, S 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, iBGP 200, unusable 255. Different prefix lengths are different destinations.',
  steps: [
    {
      caption:
        'Static cannot see past a next hop that is still reachable. R2–R3 dies; R1 still has S via R2; R2 drops. A protocol reroutes in seconds.',
    },
    {
      ask: 'IGP vs EGP, and the two IGP algorithm families:',
      choices: [
        {label: 'IGP inside one AS. Distance-vector = rumor (RIP, EIGRP). Link-state = map (OSPF, IS-IS). BGP is the EGP (path-vector)', ok: true},
        {label: 'OSPF is the only EGP; BGP is a distance-vector IGP', ok: false},
        {label: 'EIGRP and OSPF are both path-vector; RIP is link-state', ok: false},
      ],
      caption: 'D = EIGRP (DUAL). O = OSPF. R = RIP. Exam OSPF is later; this chapter is why a protocol exists.',
    },
    {
      ask: 'Two OSPF paths to the same /24, metrics 2 and 4. Table gets:',
      choices: [
        {label: 'The metric-2 route. Same protocol, same dest → lowest metric', ok: true},
        {label: 'Both, because AD is 110 either way', ok: false},
        {label: 'Neither until you type a static', ok: false},
      ],
      caption: 'Equal metrics → ECMP (up to four). Different protocols → ignore the numbers; compare AD.',
    },
    {
      ask: 'EIGRP [90/3584] and OSPF [110/4] to 10.0.0.0/24. Installed:',
      choices: [
        {label: 'EIGRP — AD 90 beats 110. 3584 vs 4 is not comparable', ok: true},
        {label: 'OSPF — 4 is a smaller metric so it must be better', ok: false},
        {label: 'Both; different protocols always ECMP', ok: false},
      ],
      caption: 'A floating static is ip route … 111 so OSPF 110 still wins until the OSPF path dies. Same AD as OSPF still prefers static.',
    },
    {
      ask: '203.0.113.0/24 S, /25 RIP, /26 EIGRP, /27 OSPF. Table gets:',
      choices: [
        {label: 'All four — different prefix lengths are different destinations', ok: true},
        {label: 'Only the static; AD 1 always wins the set', ok: false},
        {label: 'Only the /27; longest prefix fills the table', ok: false},
      ],
      caption: 'Longest match is for forwarding, not for install. Packet to .65 matches /24 and /25, not /26 or /27. Forward on /25. AD is irrelevant.',
    },
    {
      ask: 'network 192.168.2.1 0.0.0.0 area 0 means:',
      choices: [
        {label: 'Activate OSPF on the interface with that IP; advertise that interface’s prefix (e.g. /24), not a /32', ok: true},
        {label: 'Advertise 192.168.2.1/32 and nothing else', ok: false},
        {label: 'The wildcard must equal the interface mask or IOS rejects it', ok: false},
      ],
      caption: '0 bits must match. Prefer host + 0.0.0.0. 0.0.0.0 255.255.255.255 arms every interface (lab only). Areas wait.',
    },
  ],
};
