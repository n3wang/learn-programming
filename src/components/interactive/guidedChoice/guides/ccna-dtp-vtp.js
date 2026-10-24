/** CCNA: DTP negotiation matrix and VTP database sync. */

export default {
  title: 'Negotiate the port, then sync the VLAN list',
  lead: 'Admin mode is what you typed. Operational mode is access or trunk after DTP. VTP copies vlan.dat inside one domain, highest revision wins — unless version 3 has a primary server.',
  note: 'Best practice: mode access or trunk yourself, then switchport nonegotiate. Reset a lab switch’s revision to 0 before it touches production.',
  steps: [
    {
      caption:
        'Factory Cisco ports are dynamic auto. Two autos do not trunk. A router never speaks DTP — ROAS needs mode trunk on the switch.',
    },
    {
      ask: 'SW1 dynamic auto, SW2 dynamic auto. Operational mode:',
      choices: [
        {label: 'Access on both — auto does not try to trunk', ok: true},
        {label: 'Trunk — Cisco always trunks to Cisco', ok: false},
        {label: 'Invalid; auto cannot sit next to auto', ok: false},
      ],
      caption: 'Desirable is the one that asks. Auto only says yes.',
    },
    {
      ask: 'SW1 dynamic desirable, SW2 dynamic auto. Result:',
      choices: [
        {label: 'Trunk — desirable asks, auto agrees', ok: true},
        {label: 'Access — auto always wins', ok: false},
        {label: 'Invalid, same as access + trunk', ok: false},
      ],
      caption: 'Trunk + auto or trunk + desirable also trunks. Access + anything dynamic stays access.',
    },
    {
      ask: 'Which admin mode still sends DTP?',
      choices: [
        {label: 'trunk (and both dynamic modes). access does not', ok: true},
        {label: 'Only the two dynamic modes; trunk is silent', ok: false},
        {label: 'access, so a PC can refuse a trunk', ok: false},
      ],
      caption: 'nonegotiate stops the messages even on a manual trunk. Pair it with an explicit mode.',
    },
    {
      ask: 'VTP messages leave which ports?',
      choices: [
        {label: 'Trunks only. Access ports do not carry VTP', ok: true},
        {label: 'Every port, including PC access ports', ok: false},
        {label: 'Only the native VLAN’s access ports', ok: false},
      ],
      caption: 'Domain NULL (no name) means no advertisements yet. First vtp domain name is adopted by other NULLs.',
    },
    {
      ask: 'VTP client vs server vs transparent:',
      choices: [
        {label: 'Client cannot vlan N. Transparent has its own DB, rev 0, but forwards VTP', ok: true},
        {label: 'Client is the only mode that can create VLANs', ok: false},
        {label: 'Transparent syncs like a server but will not forward', ok: false},
      ],
      caption: 'Off neither syncs nor forwards. Version 3 added a real off; v1/v2 used transparent as the closest thing.',
    },
    {
      ask: 'Lab switch, same domain, revision 50, joins a LAN at revision 5 (VTP v1/v2):',
      choices: [
        {label: 'Production syncs to 50 and can lose VLANs 10/20/30', ok: true},
        {label: 'Production keeps 5; lower never overwrites higher', ok: false},
        {label: 'Nothing happens unless the lab box is the primary server in v1', ok: false},
      ],
      caption: 'Version 3 only syncs to the primary server. Reset rev to 0: change domain and back (all versions); or transparent/off then back (v1/v2 only).',
    },
  ],
};
