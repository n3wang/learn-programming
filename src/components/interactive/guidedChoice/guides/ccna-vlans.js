/** CCNA: VLANs — access, trunk, 802.1Q, native, inter-VLAN. */

export default {
  title: 'Cut the LAN at Layer 2, then route',
  lead: 'Subnets cut Layer 3. VLANs cut the broadcast domain. Access = one VLAN, untagged. Trunk = many VLANs, 802.1Q tags.',
  note: 'Native VLAN is untagged on a trunk. Default VLAN is what access ports start in (VLAN 1, cannot change).',
  steps: [
    {
      caption:
        'Engineering, HR, and Sales can share one switch. Without VLANs they still share one flood domain.',
    },
    {
      ask: 'Three /26s on one switch, no VLANs. An Engineering broadcast is received by:',
      choices: [
        {label: 'Every other port — the switch is not Layer 3 aware', ok: true},
        {label: 'Only the Engineering /26; the subnet mask hides the frame', ok: false},
        {label: 'Nobody; broadcasts stop at the first access port', ok: false},
      ],
      caption: 'VLANs make three virtual switches. Flood stays inside the VLAN.',
    },
    {
      ask: 'Access port vs trunk port:',
      choices: [
        {label: 'Access: one VLAN, untagged. Trunk: many VLANs, 802.1Q tagged', ok: true},
        {label: 'Access carries every VLAN; trunk is only for the native VLAN', ok: false},
        {label: 'Both tag every frame; “access” only means the port faces a PC', ok: false},
      ],
      caption: 'PCs are VLAN-unaware. The switch assigns the access VLAN on the way in.',
    },
    {
      ask: 'switchport trunk allowed vlan 40 when the list was 10,20,30:',
      choices: [
        {label: 'Replaces the list with only 40 — you needed add 40', ok: true},
        {label: 'Adds 40 and keeps 10,20,30', ok: false},
        {label: 'Is rejected; you must use except', ok: false},
      ],
      caption: 'WORD replaces. add / remove edit. all / none / except are the other knobs.',
    },
    {
      ask: 'Default VLAN vs native VLAN:',
      choices: [
        {label: 'Default = access start (VLAN 1, fixed). Native = untagged on a trunk (changeable)', ok: true},
        {label: 'They are two names for VLAN 1 and neither can change', ok: false},
        {label: 'Native is the access-port default; default is the trunk untagged VLAN', ok: false},
      ],
      caption: 'Best practice: unused native (not VLAN 1), same on both ends.',
    },
    {
      ask: 'mode trunk, access vlan 5, trunk native vlan 10. Untagged frames join:',
      choices: [
        {label: 'VLAN 10 — the port is a trunk, so native wins', ok: true},
        {label: 'VLAN 5 — access vlan always applies', ok: false},
        {label: 'VLAN 1 — neither command can move the native off 1', ok: false},
      ],
      caption: 'switchport mode decides which of the other lines matter.',
    },
    {
      ask: 'ROAS on G0/0.10 for VLAN 10. The command that binds the VLAN is:',
      choices: [
        {label: 'encapsulation dot1q 10 (the .10 is only a name)', ok: true},
        {label: 'The .10 in the interface name; encapsulation is optional', ok: false},
        {label: 'switchport access vlan 10 on the router', ok: false},
      ],
      caption: 'Match the numbers anyway. Physical G0/0 needs no shutdown; IPs live on subifs.',
    },
    {
      ask: 'SVI Vlan10 is up/down. First things to check:',
      choices: [
        {label: 'VLAN 10 exists, is not shut, and an up access or allowing trunk exists', ok: true},
        {label: 'Only ip routing — that alone brings Protocol up', ok: false},
        {label: 'Delete the SVI; VLANs route themselves once named', ok: false},
      ],
      caption: 'vlan N is L2. interface vlan N is L3. ip routing lets packets move between SVIs.',
    },
  ],
};
