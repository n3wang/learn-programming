import React, {useMemo, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './networkCables.module.css';

const HOST_TX = [1, 2];
const HOST_RX = [3, 6];
const SW_TX = [3, 6];
const SW_RX = [1, 2];

const DEVICES = {
  pc: {label: 'PC', tx: HOST_TX, rx: HOST_RX},
  router: {label: 'Router', tx: HOST_TX, rx: HOST_RX},
  firewall: {label: 'Firewall', tx: HOST_TX, rx: HOST_RX},
  switch: {label: 'Switch', tx: SW_TX, rx: SW_RX},
};

const PAIR_COLOR = {
  1: '#ef6c00',
  2: '#ef6c00',
  3: '#2e7d32',
  6: '#2e7d32',
  4: '#1565c0',
  5: '#1565c0',
  7: '#6a1b9a',
  8: '#6a1b9a',
};

const STRAIGHT = [1, 2, 3, 4, 5, 6, 7, 8];
const CROSS = [3, 6, 1, 7, 8, 2, 4, 5];

const BYTE = [0, 1, 0, 0, 1, 1, 0, 1];

const STORIES = [
  {
    id: 'pc-sw',
    kind: 'pins',
    left: 'pc',
    right: 'switch',
    auto: false,
    expect: 'straight',
    ask: 'A desk PC must talk to an access switch on 100BASE-T. Neither side has Auto MDI-X. Which cable makes Tx land on Rx?',
  },
  {
    id: 'rtr-rtr',
    kind: 'pins',
    left: 'router',
    right: 'router',
    auto: false,
    expect: 'crossover',
    ask: 'Two old routers both transmit on pins 1–2. Without Auto MDI-X, which cable joins Tx to Rx?',
  },
  {
    id: 'sw-sw',
    kind: 'pins',
    left: 'switch',
    right: 'switch',
    auto: false,
    expect: 'crossover',
    ask: 'Two switches, both transmitting on 3–6, no Auto MDI-X. Which cable works?',
  },
  {
    id: 'auto',
    kind: 'pins',
    left: 'router',
    right: 'router',
    auto: true,
    expect: 'either',
    ask: 'Same two routers, but the right one supports Auto MDI-X. Try a straight-through cable. What happens?',
  },
  {
    id: 'desk',
    kind: 'media',
    expect: 'utp',
    ask: 'A laptop 18 m from the floor switch has only an 8P8C jack. Which medium belongs here?',
  },
  {
    id: 'riser',
    kind: 'media',
    expect: 'mmf',
    ask: 'Two switches sit 280 m apart in the same building. Copper’s 100 m cap is gone. Which fiber is the usual pick?',
  },
  {
    id: 'campus',
    kind: 'media',
    expect: 'smf',
    ask: 'A router in Building A must reach Building B 8 km away. Which medium carries that far?',
  },
  {
    id: 'emi',
    kind: 'media',
    expect: 'mmf',
    ask: 'A 90 m run crosses a plant floor packed with motors. Copper would work on length, but EMI is ugly. Which medium ignores that noise?',
  },
];

function sameSet(a, b) {
  return [...a].sort().join(',') === [...b].sort().join(',');
}

function mapPins(cable, pins) {
  const table = cable === 'crossover' ? CROSS : STRAIGHT;
  return pins.map((p) => table[p - 1]);
}

function flipped(device) {
  return {label: device.label, tx: device.rx, rx: device.tx};
}

function resolveRight(left, right, cable, auto) {
  if (!auto) {
    return {device: right, flipped: false};
  }
  const lands = mapPins(cable, left.tx);
  if (sameSet(lands, right.rx)) {
    return {device: right, flipped: false};
  }
  return {device: flipped(right), flipped: true};
}

function linkOk(left, right, cable, auto) {
  const resolved = resolveRight(left, right, cable, auto);
  return sameSet(mapPins(cable, left.tx), resolved.device.rx);
}

function pinY(i) {
  return 52 + (i - 1) * 22;
}

function PinColumn({x, device, side}) {
  return (
    <g>
      <rect x={x - 46} y={18} width={92} height={214} rx={8} fill="#eceff1" stroke="#546e7a" />
      <text x={x} y={36} textAnchor="middle" fontSize="12" fontWeight="700" fill="#37474f">
        {device.label}
      </text>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((pin) => {
        const isTx = device.tx.includes(pin);
        const isRx = device.rx.includes(pin);
        return (
          <g key={`${side}-${pin}`}>
            <circle cx={side === 'left' ? x + 36 : x - 36} cy={pinY(pin)} r={5} fill={PAIR_COLOR[pin]} />
            <text
              x={side === 'left' ? x - 8 : x + 8}
              y={pinY(pin) + 4}
              textAnchor="middle"
              fontSize="10"
              fill="#37474f"
            >
              {pin}
              {isTx ? ' Tx' : isRx ? ' Rx' : ''}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function CopperScene({left, right, cable, auto, pulse}) {
  const resolved = resolveRight(left, right, cable, auto);
  const table = cable === 'crossover' ? CROSS : STRAIGHT;
  const ok = linkOk(left, right, cable, auto);
  return (
    <svg className={styles.canvas} viewBox="0 0 640 250" role="img" aria-label="Eight pins on each end of a UTP cable">
      <PinColumn x={70} device={left} side="left" />
      <PinColumn x={570} device={resolved.device} side="right" />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((pin) => {
        const dest = table[pin - 1];
        const hot = pulse && left.tx.includes(pin);
        return (
          <path
            key={pin}
            d={`M 106 ${pinY(pin)} C 240 ${pinY(pin)}, 400 ${pinY(dest)}, 534 ${pinY(dest)}`}
            fill="none"
            stroke={PAIR_COLOR[pin]}
            strokeWidth={hot ? 3.2 : 1.6}
            opacity={hot ? 1 : 0.72}
          />
        );
      })}
      <text x={320} y={244} textAnchor="middle" fontSize="11" fill={ok ? '#2e7d32' : '#c62828'}>
        {ok
          ? auto && resolved.flipped
            ? 'Link up — Auto MDI-X flipped the right-hand Tx/Rx pairs'
            : 'Link up — each Tx pair lands on the far Rx pair'
          : 'Link down — Tx meets Tx. Swap the cable, or turn on Auto MDI-X'}
      </text>
    </svg>
  );
}

function FiberScene({choice}) {
  const mmf = choice === 'mmf';
  const smf = choice === 'smf';
  const core = smf ? 6 : 16;
  return (
    <svg className={styles.canvas} viewBox="0 0 640 220" role="img" aria-label="Multimode versus single-mode fiber">
      <rect x="24" y="24" width="280" height="172" rx="10" fill="#fff8e1" stroke="#ef6c00" />
      <text x="40" y="46" fontSize="13" fontWeight="700" fill="#e65100">
        Multimode (MMF)
      </text>
      <text x="40" y="66" fontSize="11" fill="#6d4c41">
        LED · wider core · hundreds of meters
      </text>
      <rect x="48" y="88" width="232" height="88" rx="6" fill="#fff" stroke="#bf360c" />
      <ellipse cx="70" cy="132" rx={16} ry={16} fill="#ffe0b2" stroke="#ef6c00" />
      <ellipse cx="70" cy="132" rx={8} ry={8} fill="#ffcc80" />
      <path d="M 78 124 C 140 96, 200 168, 260 118" fill="none" stroke="#ef6c00" strokeWidth="2" />
      <path d="M 78 132 C 150 150, 210 110, 260 140" fill="none" stroke="#ff9800" strokeWidth="2" />
      <path d="M 78 140 C 130 170, 190 90, 260 132" fill="none" stroke="#e65100" strokeWidth="2" />
      {mmf ? <text x="164" y="184" textAnchor="middle" fontSize="11" fill="#2e7d32">Selected</text> : null}

      <rect x="336" y="24" width="280" height="172" rx="10" fill="#e8eaf6" stroke="#6a1b9a" />
      <text x="352" y="46" fontSize="13" fontWeight="700" fill="#4a148c">
        Single-mode (SMF)
      </text>
      <text x="352" y="66" fontSize="11" fill="#4527a0">
        Laser · narrow core · tens of kilometers
      </text>
      <rect x="360" y="88" width="232" height="88" rx="6" fill="#fff" stroke="#6a1b9a" />
      <ellipse cx="382" cy="132" rx={16} ry={16} fill="#d1c4e9" stroke="#6a1b9a" />
      <ellipse cx="382" cy="132" rx={core / 2} ry={core / 2} fill="#7e57c2" />
      <path d="M 388 132 L 572 132" fill="none" stroke="#6a1b9a" strokeWidth="2.4" />
      {smf ? <text x="476" y="184" textAnchor="middle" fontSize="11" fill="#2e7d32">Selected</text> : null}
    </svg>
  );
}

export default function NetworkCablesSimulator() {
  const [idx, setIdx] = useState(0);
  const [cable, setCable] = useState('straight');
  const [media, setMedia] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState('');

  const story = STORIES[idx];
  const left = DEVICES[story.left] || DEVICES.pc;
  const right = DEVICES[story.right] || DEVICES.switch;
  const auto = Boolean(story.auto);
  const okPins = useMemo(() => linkOk(left, right, cable, auto), [left, right, cable, auto]);

  function nextStory() {
    setIdx((i) => (i + 1) % STORIES.length);
    setCable('straight');
    setMedia(null);
    setPulse(false);
    setFeedback('');
  }

  function pickCable(next) {
    setCable(next);
    const works = linkOk(left, right, next, auto);
    if (story.expect === 'either') {
      setFeedback(
        works
          ? 'Yes. Auto MDI-X lets either cable work because one end can swap its pin pairs.'
          : 'This pair should work with Auto MDI-X — check that Auto is on for this story.',
      );
      return;
    }
    if (next === story.expect && works) {
      const name = next === 'crossover' ? 'crossover' : 'straight-through';
      setFeedback(`Yes — a ${name} cable joins Tx to Rx for these two devices.`);
      return;
    }
    if (works && next !== story.expect) {
      setFeedback('The link comes up, but this story asked for the cable that matches the pin roles without Auto MDI-X.');
      return;
    }
    setFeedback('Tx is still aimed at Tx. The other cable crosses the 1–2 pair with the 3–6 pair.');
  }

  function pickMedia(next) {
    setMedia(next);
    if (next === story.expect) {
      if (story.id === 'emi') {
        setFeedback('Yes — light in glass does not pick up the motors’ EMI the way a copper pair does. MMF is enough at 90 m.');
        return;
      }
      setFeedback(`Yes — ${next === 'utp' ? 'copper UTP' : next === 'mmf' ? 'multimode fiber' : 'single-mode fiber'} fits this run.`);
      return;
    }
    if (story.expect === 'utp') {
      setFeedback('The laptop has no SFP. Stay on copper UTP for a short desk run.');
      return;
    }
    if (story.expect === 'smf') {
      setFeedback('Eight kilometers is past MMF and far past the 100 m copper cap. That is single-mode.');
      return;
    }
    if (story.id === 'emi') {
      if (next === 'smf') {
        setFeedback('Glass is right for EMI, but 90 m does not need a laser. Multimode is enough.');
        return;
      }
      setFeedback('UTP is in range, but the plant noise is the point. Fiber ignores EMI.');
      return;
    }
    setFeedback('280 m is past UTP. SMF would work, but MMF is the usual choice for a few hundred meters.');
  }

  const hintClass =
    feedback.startsWith('Yes') || feedback.startsWith('The link comes up')
      ? styles.ok
      : feedback
        ? styles.bad
        : '';

  return (
    <CEBlock
      title="Cables, pins, and light"
      subtitle="Match Tx to Rx on copper, or pick UTP / MMF / SMF for the run."
      headerAction={
        <Button size="small" variant="text" onClick={nextStory}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        {story.kind === 'pins' ? (
          <>
            <CopperScene left={left} right={right} cable={cable} auto={auto} pulse={pulse} />
            <div className={styles.row}>
              <span className={styles.label}>Cable</span>
              {['straight', 'crossover'].map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={`${styles.choice} ${cable === kind ? styles.choiceOn : ''}`}
                  onClick={() => pickCable(kind)}
                >
                  {kind === 'straight' ? 'straight-through' : 'crossover'}
                </button>
              ))}
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setPulse(true);
                  setFeedback(
                    okPins
                      ? 'A byte left as voltages on the Tx pair: 0 = one level, 1 = the other. 01001101 is on the wire.'
                      : 'Nothing useful arrives. The voltages are being driven onto the far device’s Tx pins.',
                  );
                  window.setTimeout(() => setPulse(false), 900);
                }}
              >
                Send 01001101
              </Button>
            </div>
            <div className={styles.bits} aria-hidden="true">
              {BYTE.map((bit, i) => (
                <div key={i} className={`${styles.bit} ${pulse && bit ? styles.bitOn : ''}`}>
                  <div className={styles.bitBar} />
                  {bit}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <FiberScene choice={media} />
            <div className={styles.row}>
              <span className={styles.label}>Medium</span>
              {[
                ['utp', 'copper UTP'],
                ['mmf', 'multimode fiber'],
                ['smf', 'single-mode fiber'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.choice} ${media === id ? styles.choiceOn : ''}`}
                  onClick={() => pickMedia(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        <p className={`${styles.hint} ${hintClass}`}>
          {feedback ||
            (story.kind === 'pins'
              ? auto
                ? 'Auto MDI-X is on for the right-hand device. Try a cable.'
                : 'Pick a cable, then optionally send a byte.'
              : 'Pick the medium that fits distance, ports, and noise.')}
        </p>
        <div className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{background: '#ef6c00'}} />
            1–2
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#2e7d32'}} />
            3–6
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#1565c0'}} />
            4–5
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#6a1b9a'}} />
            7–8
          </span>
        </div>
      </div>
    </CEBlock>
  );
}
