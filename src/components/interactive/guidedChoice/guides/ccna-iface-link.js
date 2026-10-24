/** CCNA: router/switch interfaces — defaults, autoneg, mismatches, counters. */

export default {
  title: 'Read the link before you hard-set it',
  lead: 'Switch ports start up. Auto picks the best common mode. One-sided auto can half-duplex you.',
  note: 'Speed mismatch is down/down. Duplex mismatch stays up and burns late collisions.',
  steps: [
    {
      caption: 'R1 G0/1 cabled to SW1 G0/1. Access PCs on F0/1–2. Unused ports exist.',
    },
    {
      ask: 'Factory boxes, no config yet. Who is forwarding?',
      choices: [
        {label: 'The switch port is up; the router is still shutdown', ok: true},
        {label: 'Both ends are up — Ethernet autostarts', ok: false},
        {label: 'The router is up; switch ports start disabled', ok: false},
      ],
      caption: 'no shutdown on the router. Optional: shutdown unused switch jacks.',
    },
    {
      ask: 'Four PCs on a hub. Collision domains?',
      choices: [
        {label: 'One shared domain — half duplex, CSMA/CD', ok: true},
        {label: 'Four, same as a switch', ok: false},
        {label: 'Zero; hubs store-and-forward now', ok: false},
      ],
      caption: 'A switch gives each port its own domain. That is point-to-point Ethernet.',
    },
    {
      ask: 'Both G0/1 ends auto on 10/100/1000. They run:',
      choices: [
        {label: '1000 / full (a-1000 a-full)', ok: true},
        {label: '100 / half, the safe floor', ok: false},
        {label: '10 / full, because auto starts slow', ok: false},
      ],
      caption: 'Fastest common, full over half.',
    },
    {
      ask: 'SW hard-set 100/full. R1 auto/auto. R1 chooses:',
      choices: [
        {label: '100 / half — duplex mismatch, still up/up', ok: true},
        {label: '100 / full, copying the neighbor', ok: false},
        {label: 'down/down; auto will not peer with manual', ok: false},
      ],
      caption: 'Sense speed. 10 or 100 → half. 1000+ → full.',
    },
    {
      ask: '100 vs 1000 hard-set. show ip interface brief:',
      choices: [
        {label: 'down / down on both ends', ok: true},
        {label: 'up / up with late collisions', ok: false},
        {label: 'err-disabled until you bounce it', ok: false},
      ],
      caption: 'Speed mismatch is loud. Duplex mismatch is the quiet performance killer.',
    },
    {
      ask: 'Late collisions on a switched port. First suspect:',
      choices: [
        {label: 'Duplex mismatch (half-duplex end “hears” a collision)', ok: true},
        {label: 'Normal hub tax on every Cisco access port', ok: false},
        {label: 'Giants from the default 1500-byte MTU', ok: false},
      ],
      caption: 'After byte 64 is too late for honest CSMA/CD. Full-duplex side often shows runts/CRC.',
    },
  ],
};
