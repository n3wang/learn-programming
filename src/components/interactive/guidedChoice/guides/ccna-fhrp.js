/** CCNA: FHRP — VIP, GARP, HSRP / VRRP / GLBP, basic standby. */

export default {
  title: 'One VIP, two boxes',
  lead: 'Hosts keep 10.0.0.1. The active answers ARP with a virtual MAC. Failover is GARP for switches, not a PC rewrite. Exam 3.5 is describe; still type HSRP.',
  note: 'HSRP Cisco, preempt off. VRRP standard, preempt on. GLBP per-host. v1 and v2 do not mix.',
  steps: [
    {
      caption:
        'Two routers without a VIP is not a redundant gateway. The group shares a VIP and a virtual MAC. Hellos are multicast.',
    },
    {
      ask: 'After failover, what must change?',
      choices: [
        {label: 'Switch CAM via GARP (broadcast, src = virtual MAC). Host ARP and gateway stay', ok: true},
        {label: 'Every PC must DHCP again for 10.0.0.2', ok: false},
        {label: 'The VIP moves; the virtual MAC is rewritten to the new burned-in address', ok: false},
      ],
      caption: 'Preempt = the old active takes the role back when it wins again. HSRP preempt is off by default.',
    },
    {
      ask: 'Pick the protocol:',
      choices: [
        {label: 'Juniper peer → VRRP. Same subnet, split hosts → GLBP. Cisco-only active/standby → HSRP', ok: true},
        {label: 'HSRPv2 is the multi-vendor edition because it uses 224.0.0.102', ok: false},
        {label: 'VRRP is the only one that can load-balance inside one subnet', ok: false},
      ],
      caption: 'HSRP/VRRP split by subnet (different active/master per VLAN). GLBP: one VIP, rotating AVF MACs.',
    },
    {
      ask: 'HSRPv1 group 15 virtual MAC and hello dest:',
      choices: [
        {label: '0000.0c07.ac0f and 224.0.0.2', ok: true},
        {label: '0000.0c9f.f00f and 224.0.0.102', ok: false},
        {label: '0000.5e00.010f and 224.0.0.18', ok: false},
      ],
      caption: 'v2: 0000.0c9f.fXXX, 224.0.0.102, groups 0–4095, IPv6. VRRP: 0000.5e00.01XX / .18. GLBP: 0007.b400.XXYY.',
    },
    {
      ask: 'HSRP CLI that makes R1 (.2) active over R2 (.3):',
      choices: [
        {label: 'Same group and VIP, standby version 2 on both, standby 1 priority 105 and preempt on R1', ok: true},
        {label: 'Put 10.0.0.1 on ip address of both routers', ok: false},
        {label: 'v2 on R1 only — version is locally significant', ok: false},
      ],
      caption: 'Election: highest priority (default 100), then highest real IP. show standby brief: Active local, P = preempt.',
    },
  ],
};
