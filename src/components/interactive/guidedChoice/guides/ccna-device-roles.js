/** CCNA: pick the device that matches the job. */

export default {
  title: 'Which device?',
  lead:
    'A laptop in Office A opens a page hosted in Office B. An attacker on the public internet also tries to reach Office A. Name the role at each hop.',
  note: 'Client and server are roles, not chassis types. Switch, router, and firewall are infrastructure.',
  steps: [
    {
      caption: 'The person at the laptop starts the request.',
    },
    {
      ask: 'The laptop, while fetching the page, is acting as a:',
      choices: [
        {label: 'client', ok: true},
        {label: 'switch', ok: false},
        {label: 'firewall', ok: false},
      ],
      caption: 'It is accessing a service, so it is a client.',
    },
    {
      ask: 'The machine in Office B that holds the page and sends it is a:',
      choices: [
        {label: 'server', ok: true},
        {label: 'router', ok: false},
        {label: 'client only, because it is also a PC', ok: false},
      ],
      caption: 'Hosting and sending the page is the server role. The same box could be a client later.',
    },
    {
      ask: 'Inside Office A, the laptop and a printer share one box so they can talk. That box is a:',
      choices: [
        {label: 'switch', ok: true},
        {label: 'router', ok: false},
        {label: 'firewall', ok: false},
      ],
      caption: 'A switch forwards among devices in one LAN. It is not the internet edge.',
    },
    {
      ask: 'To reach Office B, the packet must leave Office A’s LAN. The LAN-edge device for that is a:',
      choices: [
        {label: 'router', ok: true},
        {label: 'switch', ok: false},
        {label: 'end host', ok: false},
      ],
      caption: 'Routers sit at the LAN edge and connect LANs or a LAN to an outside network.',
    },
    {
      ask: 'Junk from the public internet hits Office A and is refused. The device that decided is a:',
      choices: [
        {label: 'network firewall', ok: true},
        {label: 'switch with extra ports', ok: false},
        {label: 'client antivirus only', ok: false},
      ],
      caption:
        'A network firewall inspects traffic that enters or leaves the site and allows or denies it by rule. Host firewalls exist too; CCNA cares about the network appliance.',
    },
  ],
};
