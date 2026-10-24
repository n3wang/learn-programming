import React, {useEffect, useRef, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './ciscoIosCli.module.css';

const FACTORY = {
  hostname: 'Router',
  enablePassword: '',
  enableSecret: '',
  encrypt: false,
};

const STORIES = [
  {
    id: 'priv',
    ask: 'You just skipped the setup wizard. Reach privileged EXEC (the # prompt).',
    ok: 'enable (or en) from user EXEC. The prompt becomes hostname#.',
    check: (s) => s.mode === 'priv' || s.mode === 'config',
  },
  {
    id: 'host',
    ask: 'From privileged EXEC, enter global config and set the hostname to R1.',
    ok: 'configure terminal, then hostname R1. The prompt updates immediately — that is running-config.',
    check: (s) => s.running.hostname === 'R1',
  },
  {
    id: 'save',
    ask: 'Make R1 survive a reload. Copy running-config into startup-config, then reload.',
    ok: 'write, write memory, or copy running-config startup-config, then reload. Startup lives in NVRAM.',
    check: (s) => s.startup && s.startup.hostname === 'R1' && s.booted && s.running.hostname === 'R1',
  },
  {
    id: 'secret',
    ask: 'Protect privileged EXEC with an enable secret (not the cleartext enable password).',
    ok: 'enable secret <word> in global config. If both exist, only the secret is accepted.',
    check: (s) => Boolean(s.running.enableSecret),
  },
];

function type7(pw) {
  const body = Array.from(pw)
    .map((c) => (c.charCodeAt(0) + 3).toString(16).padStart(2, '0'))
    .join('');
  return `7 ${body || '00'}`;
}

function type9(pw) {
  let h = 2166136261;
  for (let i = 0; i < pw.length; i += 1) {
    h ^= pw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `9 $9$ios$${ (h >>> 0).toString(16) }`;
}

function dump(cfg, which) {
  if (!cfg) {
    return which === 'startup' ? '% Startup-config is not present' : '';
  }
  const lines = ['!', `hostname ${cfg.hostname}`];
  if (cfg.enableSecret) {
    lines.push(`enable secret ${type9(cfg.enableSecret)}`);
  }
  if (cfg.enablePassword) {
    lines.push(
      cfg.encrypt
        ? `enable password ${type7(cfg.enablePassword)}`
        : `enable password ${cfg.enablePassword}`,
    );
  }
  if (cfg.encrypt) {
    lines.push('service password-encryption');
  }
  lines.push('!');
  return lines.join('\n');
}

function promptOf(state) {
  const h = state.running.hostname;
  if (state.gate === 'password') {
    return 'Password:';
  }
  if (state.gate === 'reload') {
    return 'Proceed with reload? [confirm]';
  }
  if (state.mode === 'config') {
    return `${h}(config)#`;
  }
  if (state.mode === 'priv') {
    return `${h}#`;
  }
  return `${h}>`;
}

function matchWord(typed, full) {
  return full.startsWith(typed) && typed.length > 0;
}

function firstToken(line) {
  return line.trim().split(/\s+/)[0] || '';
}

function restOf(line) {
  const t = line.trim();
  const i = t.search(/\s/);
  return i === -1 ? '' : t.slice(i + 1).trim();
}

function execLine(state, raw) {
  const line = raw.replace(/\s+/g, ' ').trim();
  const out = [];
  const next = {
    ...state,
    running: {...state.running},
    startup: state.startup ? {...state.startup} : null,
  };

  if (state.gate === 'password') {
    const secret = state.running.enableSecret;
    const pass = state.running.enablePassword;
    const ok = secret ? raw === secret : raw === pass;
    next.gate = null;
    if (ok) {
      next.mode = 'priv';
    } else {
      out.push('% Bad secrets');
    }
    return {state: next, out};
  }

  if (state.gate === 'reload') {
    next.gate = null;
    if (raw === '' || /^y(es)?$/i.test(raw) || raw === 'confirm') {
      next.running = next.startup ? {...next.startup} : {...FACTORY};
      next.mode = 'user';
      next.booted = true;
      out.push('*** Reloading ***');
    }
    return {state: next, out};
  }

  if (!line) {
    return {state: next, out};
  }

  if (line === '?' || line === 'help') {
    if (next.mode === 'config') {
      out.push('hostname  enable  service  no  end  exit  do');
    } else if (next.mode === 'priv') {
      out.push('show  configure  disable  reload  write  copy  erase  enable');
    } else {
      out.push('enable  show  ?');
    }
    return {state: next, out};
  }

  const head = firstToken(line).toLowerCase();
  const rest = restOf(line);

  if (matchWord(head, 'enable') && next.mode === 'user' && !rest) {
    if (next.running.enableSecret || next.running.enablePassword) {
      next.gate = 'password';
    } else {
      next.mode = 'priv';
    }
    return {state: next, out};
  }

  if (matchWord(head, 'disable') && next.mode === 'priv') {
    next.mode = 'user';
    return {state: next, out};
  }

  if ((matchWord(head, 'configure') && matchWord(firstToken(rest).toLowerCase() || 't', 'terminal')) || line.toLowerCase() === 'conf t') {
    if (next.mode !== 'priv' && next.mode !== 'config') {
      out.push('% Invalid input detected');
      return {state: next, out};
    }
    next.mode = 'config';
    out.push('Enter configuration commands, one per line. End with CNTL/Z.');
    return {state: next, out};
  }

  if (head === 'do') {
    if (next.mode !== 'config') {
      out.push('% Invalid input detected');
      return {state: next, out};
    }
    const inner = execLine({...next, mode: 'priv', gate: null}, rest);
    return {state: {...inner.state, mode: 'config'}, out: inner.out};
  }

  if (head === 'end' || head === 'exit') {
    if (next.mode === 'config') {
      next.mode = 'priv';
      return {state: next, out};
    }
    if (head === 'exit' && next.mode === 'priv') {
      next.mode = 'user';
    }
    return {state: next, out};
  }

  if (matchWord(head, 'hostname') && next.mode === 'config') {
    const name = firstToken(rest);
    if (!name) {
      out.push('% Incomplete command');
      return {state: next, out};
    }
    next.running.hostname = name;
    return {state: next, out};
  }

  if (head === 'no' && next.mode === 'config') {
    const inner = firstToken(rest).toLowerCase();
    if (matchWord(inner, 'hostname')) {
      next.running.hostname = 'Router';
    }
    if (inner === 'enable' && rest.toLowerCase().includes('password')) {
      next.running.enablePassword = '';
    }
    if (inner === 'enable' && rest.toLowerCase().includes('secret')) {
      next.running.enableSecret = '';
    }
    if (matchWord(inner, 'service')) {
      next.running.encrypt = false;
    }
    return {state: next, out};
  }

  if (head === 'enable' && next.mode === 'config') {
    const kind = firstToken(rest).toLowerCase();
    const value = restOf(rest);
    if (matchWord(kind, 'secret')) {
      if (!value) {
        out.push('% Incomplete command');
        return {state: next, out};
      }
      next.running.enableSecret = value;
      return {state: next, out};
    }
    if (matchWord(kind, 'password')) {
      if (!value) {
        out.push('% Incomplete command');
        return {state: next, out};
      }
      next.running.enablePassword = value;
      return {state: next, out};
    }
  }

  if (matchWord(head, 'service') && rest.toLowerCase().includes('password') && next.mode === 'config') {
    next.running.encrypt = true;
    return {state: next, out};
  }

  if (matchWord(head, 'show')) {
    if (next.mode === 'config') {
      out.push("% Invalid input detected at '^' marker.");
      return {state: next, out};
    }
    const what = firstToken(rest).toLowerCase();
    if (matchWord(what, 'clock')) {
      out.push('*12:00:00.000 UTC Tue Jan 6 2026');
      return {state: next, out};
    }
    if (matchWord(what, 'running-config') || what === 'run') {
      if (next.mode !== 'priv') {
        out.push('% Unknown command or computer name');
        return {state: next, out};
      }
      out.push(dump(next.running, 'running'));
      return {state: next, out};
    }
    if (matchWord(what, 'startup-config') || what === 'start') {
      if (next.mode !== 'priv') {
        out.push('% Unknown command or computer name');
        return {state: next, out};
      }
      out.push(dump(next.startup, 'startup'));
      return {state: next, out};
    }
    out.push('% Type "show ?" for a list of subcommands');
    return {state: next, out};
  }

  if (matchWord(head, 'reload')) {
    if (next.mode !== 'priv') {
      out.push('% Unknown command or computer name, or unable to find computer address');
      return {state: next, out};
    }
    next.gate = 'reload';
    return {state: next, out};
  }

  if (matchWord(head, 'write') || (matchWord(head, 'copy') && rest.toLowerCase().includes('running') && rest.toLowerCase().includes('startup'))) {
    if (next.mode !== 'priv') {
      out.push('% Invalid input detected');
      return {state: next, out};
    }
    if (matchWord(head, 'write') && rest.toLowerCase().startsWith('erase')) {
      next.startup = null;
      out.push('Erasing the nvram filesystem');
      return {state: next, out};
    }
    next.startup = {...next.running};
    out.push('Building configuration...');
    out.push('[OK]');
    return {state: next, out};
  }

  if (matchWord(head, 'erase') && (rest.toLowerCase().includes('startup') || rest.toLowerCase().includes('nvram'))) {
    if (next.mode !== 'priv') {
      out.push('% Invalid input detected');
      return {state: next, out};
    }
    next.startup = null;
    out.push('Erasing the nvram filesystem');
    return {state: next, out};
  }

  out.push('% Invalid input detected');
  return {state: next, out};
}

function complete(state, typed) {
  const pool =
    state.mode === 'config'
      ? ['hostname ', 'enable secret ', 'enable password ', 'service password-encryption', 'end', 'exit', 'do show clock', 'do show running-config']
      : state.mode === 'priv'
        ? ['configure terminal', 'show clock', 'show running-config', 'show startup-config', 'write', 'write memory', 'copy running-config startup-config', 'reload', 'disable']
        : ['enable', 'show clock', '?'];
  const hits = pool.filter((c) => c.startsWith(typed));
  if (hits.length === 1) {
    return hits[0];
  }
  return typed;
}

const START = {
  mode: 'user',
  gate: null,
  booted: false,
  running: {...FACTORY},
  startup: null,
};

export default function CiscoIosCliSimulator() {
  const [state, setState] = useState(START);
  const [log, setLog] = useState([
    '--- System Configuration Dialog ---',
    'Would you like to enter the initial configuration dialog? [yes/no]: no',
  ]);
  const [draft, setDraft] = useState('');
  const [hist, setHist] = useState([]);
  const [histAt, setHistAt] = useState(-1);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState('');
  const termRef = useRef(null);
  const inputRef = useRef(null);
  const story = STORIES[idx];

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [log, state.gate]);

  function submit(line) {
    const shown = state.gate === 'password' ? `${promptOf(state)}` : `${promptOf(state)} ${line}`;
    const result = execLine(state, line);
    setLog((prev) => [...prev, shown, ...result.out]);
    setState(result.state);
    if (line && !state.gate) {
      setHist((h) => [...h, line]);
    }
    setHistAt(-1);
    setDraft('');
    if (story.check(result.state)) {
      setFeedback(`Yes. ${story.ok}`);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(draft);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      setDraft(complete(state, draft));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!hist.length) {
        return;
      }
      const at = histAt < 0 ? hist.length - 1 : Math.max(0, histAt - 1);
      setHistAt(at);
      setDraft(hist[at]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histAt < 0) {
        return;
      }
      const at = histAt + 1;
      if (at >= hist.length) {
        setHistAt(-1);
        setDraft('');
        return;
      }
      setHistAt(at);
      setDraft(hist[at]);
      return;
    }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (state.mode === 'config' || state.gate) {
        setState((s) => ({...s, mode: 'priv', gate: null}));
        setLog((prev) => [...prev, `${promptOf(state)}`, '']);
        setDraft('');
      }
    }
  }

  return (
    <CEBlock
      title="A first hour on the IOS CLI"
      subtitle="Type commands. Tab completes a unique prefix. Up-arrow recalls a line."
      headerAction={
        <Button
          size="small"
          variant="text"
          onClick={() => {
            setIdx((i) => (i + 1) % STORIES.length);
            setFeedback('');
          }}
        >
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <div className={styles.grid}>
          <pre
            className={styles.term}
            ref={termRef}
            onClick={() => inputRef.current && inputRef.current.focus()}
          >
            {log.map((line, i) => (
              <div key={i} className={styles.termLine}>
                {line}
              </div>
            ))}
            <div className={styles.cmdRow}>
              <span className={styles.cmdPrompt}>{promptOf(state)}</span>
              <input
                ref={inputRef}
                className={styles.cmdInput}
                value={draft}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                aria-label="IOS command"
              />
            </div>
          </pre>
          <div className={styles.files}>
            <div className={styles.file}>
              <h4>Mode · {state.mode === 'config' ? 'global config' : state.mode === 'priv' ? 'privileged EXEC' : 'user EXEC'}</h4>
              <pre>{promptOf(state)}</pre>
            </div>
            <div className={styles.file}>
              <h4>running-config · RAM (live, lost on reload)</h4>
              <pre>{dump(state.running, 'running')}</pre>
            </div>
            <div className={styles.file}>
              <h4>startup-config · NVRAM (loaded at boot)</h4>
              <pre>{dump(state.startup, 'startup')}</pre>
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              if (story.check(state)) {
                setFeedback(`Yes. ${story.ok}`);
                return;
              }
              setFeedback('Not yet. Look at the prompt: > is user EXEC, # is privileged, (config)# is global config.');
            }}
          >
            Check story
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setState(START);
              setLog([
                '--- System Configuration Dialog ---',
                'Would you like to enter the initial configuration dialog? [yes/no]: no',
              ]);
              setDraft('');
              setFeedback('');
            }}
          >
            Factory reset lab
          </Button>
        </div>
        <p className={`${styles.hint} ${feedback.startsWith('Yes') ? styles.ok : feedback ? styles.bad : ''}`}>
          {feedback || 'Try: enable → configure terminal → hostname R1 → end → write'}
        </p>
        <div className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{background: '#9ecbff'}} />
            prompt
          </span>
          <span>PC — rollover — RJ45 console (not a data NIC)</span>
        </div>
      </div>
    </CEBlock>
  );
}
