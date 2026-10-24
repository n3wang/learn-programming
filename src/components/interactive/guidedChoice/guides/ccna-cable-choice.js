/** CCNA: pick the cable or medium that matches the run. */

export default {
  title: 'Which cable?',
  lead:
    'Wire a floor, then a pair of old routers, then two buildings. Name the medium or the pin-out at each hop.',
  note: 'Copper UTP is the short, cheap desk run. Fiber is distance or noise. Old 10/100 gear still cares about straight-through versus crossover.',
  steps: [
    {
      caption: 'A laptop on this floor needs the access switch 15 m away.',
    },
    {
      ask: 'The laptop only has an 8P8C jack. The run is 15 m. Use:',
      choices: [
        {label: 'copper UTP', ok: true},
        {label: 'single-mode fiber', ok: false},
        {label: 'two unused pairs and no connector', ok: false},
      ],
      caption: 'Desk runs stay on copper. Most PCs have no SFP, and 15 m is well under 100 m.',
    },
    {
      ask: 'On 100BASE-T, a PC transmits on pins 1–2 and a switch receives on 1–2. The cable should be:',
      choices: [
        {label: 'straight-through', ok: true},
        {label: 'crossover', ok: false},
        {label: 'SMF with an SFP in the laptop', ok: false},
      ],
      caption: 'Same pin number to same pin number puts the PC’s Tx on the switch’s Rx.',
    },
    {
      ask: 'Two old routers both transmit on 1–2 and have no Auto MDI-X. They need a:',
      choices: [
        {label: 'crossover cable', ok: true},
        {label: 'straight-through cable', ok: false},
        {label: 'Cat 3 cable, because routers ignore pins', ok: false},
      ],
      caption: 'A crossover swaps 1–2 with 3–6 so each Tx pair lands on the far Rx pair.',
    },
    {
      ask: 'Modern gear on the same two routers would also accept a straight-through cable because of:',
      choices: [
        {label: 'Auto MDI-X', ok: true},
        {label: 'a hidden fifth wire pair', ok: false},
        {label: 'Wi-Fi standing in for the pins', ok: false},
      ],
      caption: 'Auto MDI-X lets one end flip its Tx/Rx pairs to match whatever cable you plugged in.',
    },
    {
      ask: 'A router 8 km away in the next building is past copper and past typical MMF. Use:',
      choices: [
        {label: 'single-mode fiber', ok: true},
        {label: 'Cat 5e UTP', ok: false},
        {label: 'multimode fiber with an LED only', ok: false},
      ],
      caption: 'SMF’s narrow core and laser reach tens of kilometers. MMF is the hundreds-of-meters tool.',
    },
  ],
};
