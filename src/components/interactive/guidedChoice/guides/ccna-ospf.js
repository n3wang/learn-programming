/** CCNA: OSPFv2 — LSDB, cost, RID, neighbors, DR/BDR. */

export default {
  title: 'Same map, then SPF',
  lead: 'OSPFv2 floods LSAs so every router in an area holds the same LSDB, then Dijkstra picks the lowest cost. Neighbors at 2-Way; adjacent at Full.',
  note: 'Process ID is local. RID is unique. Exam is single-area; still know area 0, ABR, ASBR. Do not learn OSPFv3.',
  steps: [
    {
      caption:
        'LSA flooding builds one LSDB per area. Multi-area: smaller maps, cheaper SPF, a flap stays local. Inter-area traffic crosses area 0.',
    },
    {
      ask: 'Default cost of a 1 Gbps link (reference 100 Mbps):',
      choices: [
        {label: '1 — anything below 1 floors to 1. Raise auto-cost reference-bandwidth on every router', ok: true},
        {label: '0.1 — OSPF keeps the fraction', ok: false},
        {label: '10 — 1000 divided by 100', ok: false},
      ],
      caption: 'Prefer ip ospf cost on one link. bandwidth (kbps) also feeds the formula but QoS reads it too. Loopback adds 1.',
    },
    {
      ask: 'RID and activation:',
      choices: [
        {label: 'RID: router-id, else highest loopback, else highest physical. Activate with network or ip ospf 1 area 0', ok: true},
        {label: 'Process ID must match the neighbor or they will not form', ok: false},
        {label: 'A loopback added later steals the RID after clear ip ospf process', ok: false},
      ],
      caption: 'Hardcode router-id. Passive = advertise, no hello. default-information originate needs a default in the local table.',
    },
    {
      ask: '2-Way vs Full, and DR/BDR:',
      choices: [
        {label: '2-Way = neighbors. Full = adjacent. Broadcast elects DR/BDR (priority, then RID). No preempt', ok: true},
        {label: 'DROthers exchange LSAs directly with each other', ok: false},
        {label: 'Raising priority immediately steals the DR', ok: false},
      ],
      caption: 'BDR becomes DR if the DR dies; then elect a new BDR. Point-to-point skips the election (FULL/-). Hello 10, dead 40. 224.0.0.5 / .6.',
    },
    {
      ask: 'Neighbor broken in a subtle way:',
      choices: [
        {label: 'Network-type mismatch: Full, but LSDBs do not sync. MTU mismatch: stuck ExStart/Exchange', ok: true},
        {label: 'Area mismatch still reaches Full', ok: false},
        {label: 'Duplicate RID is allowed if process IDs differ', ok: false},
      ],
      caption: 'Type 1 = every router. Type 2 = DR of a broadcast segment. Type 5 = ASBR external (a default is one).',
    },
  ],
};
