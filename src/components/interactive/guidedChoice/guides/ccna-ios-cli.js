/** CCNA: first hour on the IOS CLI. */

export default {
  title: 'Which IOS move?',
  lead: 'A new router is on the console. Climb the modes, name it, save it, lock privileged EXEC.',
  note: 'The prompt is the map: > user EXEC, # privileged EXEC, (config)# global config. RAM is live; NVRAM survives reload.',
  steps: [
    {
      caption: 'The wizard asked to set the box up. You typed no. The prompt is Router>.',
    },
    {
      ask: 'Router> is which mode?',
      choices: [
        {label: 'user EXEC', ok: true},
        {label: 'global configuration', ok: false},
        {label: 'privileged EXEC', ok: false},
      ],
      caption: 'Least privilege. show clock works. reload and config changes do not.',
    },
    {
      ask: 'To reach the # prompt you type:',
      choices: [
        {label: 'enable', ok: true},
        {label: 'configure terminal', ok: false},
        {label: 'write erase', ok: false},
      ],
      caption: 'enable (or en). The greater-than becomes a hash.',
    },
    {
      ask: 'From Router#, the command that opens global config is:',
      choices: [
        {label: 'configure terminal', ok: true},
        {label: 'disable', ok: false},
        {label: 'show startup-config', ok: false},
      ],
      caption: 'conf t is enough. The prompt becomes Router(config)#.',
    },
    {
      ask: 'hostname R1 edits which file, and when does the prompt change?',
      choices: [
        {label: 'running-config, immediately (RAM)', ok: true},
        {label: 'startup-config only, after reload', ok: false},
        {label: 'neither; hostnames are painted on the chassis', ok: false},
      ],
      caption: 'Config commands write RAM and take effect now. Save or a reload forgets them.',
    },
    {
      ask: 'Copy RAM to NVRAM with:',
      choices: [
        {label: 'write (or copy running-config startup-config)', ok: true},
        {label: 'enable password', ok: false},
        {label: 'erase nvram:', ok: false},
      ],
      caption: 'write / write memory / copy run start. Erase commands delete startup-config instead.',
    },
    {
      ask: 'The lock you should put on privileged EXEC is:',
      choices: [
        {label: 'enable secret (a hash; wins if both are set)', ok: true},
        {label: 'enable password in cleartext, on purpose', ok: false},
        {label: 'no hostname, so nobody can find the box', ok: false},
      ],
      caption: 'Type 7 on enable password is weak. If both lines exist, only the secret is accepted.',
    },
  ],
};
