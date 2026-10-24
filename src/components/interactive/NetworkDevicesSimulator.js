import React, { useMemo, useState } from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './networkDevices.module.css';

const ROLES = ['client', 'server', 'switch', 'router', 'firewall'];

const COLORS = {
  client: '#1565c0',
  server: '#00897b',
  switch: '#ef6c00',
  router: '#6a1b9a',
  firewall: '#c62828',
  unknown: '#78909c',
};

const NODES = [
  {id: 'a-pc', role: 'client', x: 70, y: 292, label: 'PC'},
  {id: 'a-phone', role: 'client', x: 150, y: 292, label: 'Phone'},
  {id: 'a-file', role: 'server', x: 230, y: 292, label: 'Files'},
  {id: 'a-sw', role: 'switch', x: 150, y: 200, label: 'SW'},
  {id: 'a-rtr', role: 'router', x: 150, y: 128, label: 'R'},
  {id: 'a-fw', role: 'firewall', x: 150, y: 58, label: 'FW'},
  {id: 'b-pc', role: 'client', x: 650, y: 292, label: 'PC'},
  {id: 'b-cam', role: 'client', x: 730, y: 292, label: 'Cam'},
  {id: 'b-web', role: 'server', x: 570, y: 292, label: 'Web'},
  {id: 'b-sw', role: 'switch', x: 650, y: 200, label: 'SW'},
  {id: 'b-rtr', role: 'router', x: 650, y: 128, label: 'R'},
  {id: 'b-fw', role: 'firewall', x: 650, y: 58, label: 'FW'},
];

const LINKS = [
  ['a-pc', 'a-sw'],
  ['a-phone', 'a-sw'],
  ['a-file', 'a-sw'],
  ['a-sw', 'a-rtr'],
  ['a-rtr', 'a-fw'],
  ['b-pc', 'b-sw'],
  ['b-cam', 'b-sw'],
  ['b-web', 'b-sw'],
  ['b-sw', 'b-rtr'],
  ['b-rtr', 'b-fw'],
];

const PATHS = {
  file: ['a-pc', 'a-sw', 'a-rtr', 'a-fw', 'net', 'b-fw', 'b-rtr', 'b-sw', 'b-web'],
  attack: ['net', 'a-fw'],
};

const PROMPTS = [
  {id: 'pc', ask: 'A person at a desk opens the remote website. Which role is that desk machine playing?', role: 'client'},
  {id: 'web', ask: 'A machine in the other office hosts the webpage and sends it out. Which role is that?', role: 'server'},
  {id: 'sw', ask: 'Several office devices share one box so they can talk inside the LAN. Which device is that box?', role: 'switch'},
  {id: 'rtr', ask: 'Traffic must leave this office and reach another site. Which device sits at the LAN edge for that?', role: 'router'},
  {id: 'fw', ask: 'Someone on the public internet sends junk at the office. Which device inspects and can refuse that traffic?', role: 'firewall'},
  {id: 'both', ask: 'The same laptop later shares a movie with a coworker. In that exchange the laptop is acting as which role?', role: 'server'},
];

function nodeById(id) {
  return NODES.find((n) => n.id === id);
}

function Link({from, to, hot}) {
  const a = nodeById(from);
  const b = nodeById(to);
  if (!a || !b) return null;
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={hot ? '#1565c0' : '#90a4ae'}
      strokeWidth={hot ? 3 : 1.4}
    />
  );
}

function Device({node, selected, guessed, pathHot, onPick}) {
  const known = guessed[node.id];
  const fill = known ? COLORS[known] : COLORS.unknown;
  const ok = known === node.role;
  return (
    <g
      className={styles.node}
      tabIndex={0}
      role="button"
      aria-label={node.label}
      onClick={() => onPick(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick(node.id);
        }
      }}
    >
      <rect
        x={node.x - 26}
        y={node.y - 16}
        width={52}
        height={32}
        rx={6}
        fill={fill}
        stroke={selected === node.id ? '#111' : pathHot ? '#1565c0' : '#37474f'}
        strokeWidth={selected === node.id ? 2.4 : 1.2}
        opacity={0.92}
      />
      <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        {known ? (ok ? node.role : '?') : node.label}
      </text>
    </g>
  );
}

export default function NetworkDevicesSimulator() {
  const [selected, setSelected] = useState(null);
  const [guessed, setGuessed] = useState({});
  const [promptIdx, setPromptIdx] = useState(0);
  const [path, setPath] = useState(null);
  const [feedback, setFeedback] = useState('');

  const prompt = PROMPTS[promptIdx];
  const labeled = Object.keys(guessed).length;
  const correct = NODES.filter((n) => guessed[n.id] === n.role).length;
  const hot = useMemo(() => new Set(path ? PATHS[path] : []), [path]);

  function assign(role) {
    if (!selected) {
      setFeedback('Click a box in the diagram first, then pick its role.');
      return;
    }
    const node = nodeById(selected);
    setGuessed((prev) => ({...prev, [selected]: role}));
    if (node.role === role) {
      const matchStory = role === prompt.role;
      setFeedback(
        matchStory
          ? `Yes — that box is a ${role}, and it matches this story.`
          : `Yes — that box is a ${role}.`,
      );
      return;
    }
    setFeedback(
      `Not a ${role}. Ask: does it use the network, offer a service, stay inside the LAN, leave the LAN, or filter?`,
    );
  }

  return (
    <CEBlock
      title="Two offices over the internet"
      subtitle="Click a box, then name its role. Or answer the story by clicking the matching box."
      headerAction={
        <Button
          size="small"
          variant="text"
          onClick={() => {
            setSelected(null);
            setGuessed({});
            setPath(null);
            setFeedback('');
            setPromptIdx((i) => (i + 1) % PROMPTS.length);
          }}
        >
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{prompt.ask}</p>
        <svg className={styles.canvas} viewBox="0 0 800 360" role="img" aria-label="Enterprise network with two LANs">
          <rect x="28" y="18" width="260" height="322" rx="12" fill="none" stroke="#90a4ae" />
          <text x="40" y="38" fontSize="12" fill="#546e7a">Office A · LAN</text>
          <rect x="512" y="18" width="260" height="322" rx="12" fill="none" stroke="#90a4ae" />
          <text x="524" y="38" fontSize="12" fill="#546e7a">Office B · LAN</text>
          <ellipse cx="400" cy="58" rx="62" ry="28" fill="#eceff1" stroke="#78909c" />
          <text x="400" y="62" textAnchor="middle" fontSize="12" fill="#455a64">
            Internet
          </text>
          <line
            x1={150}
            y1={58}
            x2={338}
            y2={58}
            stroke={hot.has('net') ? '#1565c0' : '#90a4ae'}
            strokeWidth={hot.has('net') ? 3 : 1.4}
          />
          <line
            x1={462}
            y1={58}
            x2={650}
            y2={58}
            stroke={hot.has('net') ? '#1565c0' : '#90a4ae'}
            strokeWidth={hot.has('net') ? 3 : 1.4}
          />
          {LINKS.map(([from, to]) => (
            <Link key={`${from}-${to}`} from={from} to={to} hot={hot.has(from) && hot.has(to)} />
          ))}
          {NODES.map((node) => (
            <Device
              key={node.id}
              node={node}
              selected={selected}
              guessed={guessed}
              pathHot={hot.has(node.id)}
              onPick={(id) => {
                setSelected(id);
                setFeedback('Now pick a role for that box.');
              }}
            />
          ))}
        </svg>
        <div className={styles.choices}>
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className={`${styles.choice} ${guessed[selected] === role ? styles.choiceOn : ''}`}
              onClick={() => assign(role)}
            >
              {role}
            </button>
          ))}
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
          <Button size="small" variant="outlined" onClick={() => setPath('file')}>
            Trace a webpage fetch
          </Button>
          <Button size="small" variant="outlined" onClick={() => setPath('attack')}>
            Trace a blocked attack
          </Button>
          <Button size="small" variant="text" onClick={() => setPath(null)}>
            Clear path
          </Button>
        </div>
        <p className={`${styles.hint} ${feedback.includes('Yes') || feedback.includes('matches') ? styles.ok : feedback ? styles.bad : ''}`}>
          {feedback || `${correct}/${NODES.length} boxes labeled correctly (${labeled} tried).`}
        </p>
        <div className={styles.legend}>
          {ROLES.map((role) => (
            <span key={role}>
              <span className={styles.swatch} style={{background: COLORS[role]}} />
              {role}
            </span>
          ))}
        </div>
      </div>
    </CEBlock>
  );
}
