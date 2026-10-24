import React, {useState} from 'react';
import Button from '@site/src/components/ui/Button';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import styles from './tcpipModel.module.css';

const NODES = [
  {id: 'pc1', label: 'PC1', kind: 'host', x: 48, y: 78},
  {id: 'sw1', label: 'SW1', kind: 'switch', x: 148, y: 78},
  {id: 'r1', label: 'R1', kind: 'router', x: 248, y: 78},
  {id: 'r2', label: 'R2', kind: 'router', x: 392, y: 78},
  {id: 'sw2', label: 'SW2', kind: 'switch', x: 492, y: 78},
  {id: 'srv1', label: 'SRV1', kind: 'host', x: 592, y: 78},
];

const LINKS = [
  ['pc1', 'sw1'],
  ['sw1', 'r1'],
  ['r1', 'r2'],
  ['r2', 'sw2'],
  ['sw2', 'srv1'],
];

const HOPS = [
  {from: 'pc1', to: 'r1', via: ['pc1', 'sw1', 'r1'], srcMac: 'PC1', dstMac: 'R1'},
  {from: 'r1', to: 'r2', via: ['r1', 'r2'], srcMac: 'R1', dstMac: 'R2'},
  {from: 'r2', to: 'srv1', via: ['r2', 'sw2', 'srv1'], srcMac: 'R2', dstMac: 'SRV1'},
];

const STORIES = [
  {
    id: 'l1',
    ask: 'Voltage on copper, light in glass, or radio in the air — which layer is that?',
    answer: 'physical',
    ok: 'Layer 1, Physical: the medium and how bits are encoded onto it.',
    bad: 'Cables and radio are Physical. Data Link names the next hop; it does not define the voltage.',
  },
  {
    id: 'hops',
    ask: 'PC1’s HTTPS request reaches SRV1 via R1 and R2. Switches sit on the LANs. How many Layer 2 hops is that?',
    answer: '3',
    ok: 'Three hops: PC1→R1, R1→R2, R2→SRV1. Crossing a switch is still the same hop.',
    bad: 'A hop is node-to-next-router (or the final host). Switches do not add hops.',
  },
  {
    id: 'mac',
    ask: 'On this path, which address is rewritten at every hop?',
    answer: 'mac',
    ok: 'The destination MAC aims at the next hop only. After R1 takes the frame, it builds a new one toward R2.',
    bad: 'The destination IP stays SRV1 the whole way. MAC is the hop sticker.',
  },
  {
    id: 'ip',
    ask: 'Which address is written once, for the original destination, and left alone until SRV1?',
    answer: 'ip',
    ok: 'Layer 3 is end-to-end. Destination IP is SRV1 on every hop.',
    bad: 'MAC and the L2 header change per hop. The IP destination does not.',
  },
  {
    id: 'port',
    ask: 'Layers 2 and 3 have delivered the bits to SRV1. What still has to pick the HTTPS process?',
    answer: 'port',
    ok: 'Layer 4 port 443 names the application process. Same host, several listeners (53, 80, 443).',
    bad: 'A physical switch port is Layer 1. The number that picks HTTPS is a Layer 4 port.',
  },
  {
    id: 'segment',
    ask: 'Application data plus a Layer 4 header is called what?',
    answer: 'segment',
    ok: 'Data + L4 header = segment (L4PDU). Add IP and it becomes a packet.',
    bad: 'A packet already has the IP header. A frame already has the Ethernet header and trailer.',
  },
  {
    id: 'frame',
    ask: 'What do you call a packet after Layer 2 adds a header and a trailer?',
    answer: 'frame',
    ok: 'Packet + L2 header/trailer = frame (L2PDU). That is what hits the wire.',
    bad: 'The segment stopped at Layer 4. The packet stopped at Layer 3.',
  },
  {
    id: 'adjacent',
    ask: 'On PC1, Layer 3 hands a packet down so Layer 2 can reach the next hop. That relationship is:',
    answer: 'adjacent',
    ok: 'Adjacent-layer: each layer serves the one above it on the same host.',
    bad: 'Same-layer is PC1’s Layer 3 talking to SRV1’s Layer 3. This click is parent-to-child on one box.',
  },
];

const LAYER_CHOICES = [
  ['physical', 'L1 Physical'],
  ['data-link', 'L2 Data Link'],
  ['network', 'L3 Network'],
  ['transport', 'L4 Transport'],
  ['application', 'L7 Application'],
];

function nodeById(id) {
  return NODES.find((n) => n.id === id);
}

function Box({node, hot}) {
  const host = node.kind === 'host';
  const sw = node.kind === 'switch';
  return (
    <g>
      <rect
        x={node.x - 28}
        y={node.y - 16}
        width={56}
        height={32}
        rx={host ? 6 : sw ? 4 : 10}
        fill={hot ? '#1565c0' : sw ? '#cfd8dc' : '#455a64'}
        stroke={hot ? '#0d47a1' : '#37474f'}
        strokeWidth={hot ? 2.2 : 1}
      />
      <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        {node.label}
      </text>
    </g>
  );
}

export default function TcpipModelSimulator() {
  const [idx, setIdx] = useState(0);
  const [hop, setHop] = useState(0);
  const [wrap, setWrap] = useState(3);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');

  const story = STORIES[idx];
  const current = HOPS[hop];
  const hot = new Set(current.via);

  function choose(value) {
    setPicked(value);
    setFeedback(value === story.answer ? story.ok : story.bad);
  }

  function nextStory() {
    setIdx((i) => (i + 1) % STORIES.length);
    setPicked(null);
    setFeedback('');
  }

  const choices =
    story.id === 'hops'
      ? [
          ['2', '2 hops'],
          ['3', '3 hops'],
          ['5', '5 hops (count the switches)'],
        ]
      : story.id === 'mac' || story.id === 'ip' || story.id === 'port'
        ? [
            ['mac', 'destination MAC'],
            ['ip', 'destination IP'],
            ['port', 'Layer 4 port'],
          ]
        : story.id === 'segment' || story.id === 'frame'
          ? [
              ['segment', 'segment'],
              ['packet', 'packet'],
              ['frame', 'frame'],
            ]
          : story.id === 'adjacent'
            ? [
                ['adjacent', 'adjacent-layer interaction'],
                ['same', 'same-layer interaction'],
                ['hop', 'a new Layer 1 hop through SW1'],
              ]
            : LAYER_CHOICES;

  return (
    <CEBlock
      title="HTTPS across the five-layer model"
      subtitle="PC1 asks SRV1 for a page. Watch the hop, the addresses, and the headers."
      headerAction={
        <Button size="small" variant="text" onClick={nextStory}>
          Next story
        </Button>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.prompt}>{story.ask}</p>
        <svg className={styles.canvas} viewBox="0 0 640 150" role="img" aria-label="PC1 to SRV1 through two routers">
          <text x="20" y="24" fontSize="11" fill="#546e7a">
            LAN A
          </text>
          <text x="560" y="24" fontSize="11" fill="#546e7a">
            LAN B
          </text>
          {LINKS.map(([a, b]) => {
            const left = nodeById(a);
            const right = nodeById(b);
            const lit = hot.has(a) && hot.has(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={left.x}
                y1={left.y}
                x2={right.x}
                y2={right.y}
                stroke={lit ? '#1565c0' : '#90a4ae'}
                strokeWidth={lit ? 3 : 1.4}
              />
            );
          })}
          {NODES.map((node) => (
            <Box key={node.id} node={node} hot={hot.has(node.id)} />
          ))}
          <text x={320} y={138} textAnchor="middle" fontSize="11" fill="#37474f">
            Hop {hop + 1}/3 · dst MAC {current.dstMac} · dst IP SRV1 · dst port 443
          </text>
        </svg>
        <div className={styles.row}>
          <Button size="small" variant="outlined" onClick={() => setHop((h) => (h + 1) % HOPS.length)}>
            Next hop
          </Button>
          <Button size="small" variant="text" onClick={() => setWrap((w) => Math.min(3, w + 1))}>
            Wrap
          </Button>
          <Button size="small" variant="text" onClick={() => setWrap((w) => Math.max(0, w - 1))}>
            Unwrap
          </Button>
        </div>
        <div className={styles.stack}>
          {wrap >= 3 ? (
            <div className={`${styles.box} ${styles.l2}`}>
              L2 header → next-hop MAC {current.dstMac} (changes each hop)
              <div className={`${styles.box} ${styles.l3}`}>
                L3 header → dest IP SRV1 (stays)
                {wrap >= 2 ? (
                  <div className={`${styles.box} ${styles.l4}`}>
                    L4 header → port 443 (HTTPS)
                    {wrap >= 1 ? (
                      <div className={`${styles.box} ${styles.data}`}>L7 data · “please send the page”</div>
                    ) : null}
                  </div>
                ) : (
                  <div className={`${styles.box} ${styles.data}`}>segment payload</div>
                )}
              </div>
              <div className={styles.trail}>L2 trailer → error check (FCS)</div>
            </div>
          ) : wrap === 2 ? (
            <div className={`${styles.box} ${styles.l3}`}>
              packet (L3PDU)
              <div className={`${styles.box} ${styles.l4}`}>
                L4 header → port 443
                <div className={`${styles.box} ${styles.data}`}>L7 data</div>
              </div>
            </div>
          ) : wrap === 1 ? (
            <div className={`${styles.box} ${styles.l4}`}>
              segment (L4PDU)
              <div className={`${styles.box} ${styles.data}`}>L7 data</div>
            </div>
          ) : (
            <div className={`${styles.box} ${styles.data}`}>Application data only — not yet on the wire</div>
          )}
        </div>
        <p className={styles.meta}>
          {wrap === 3
            ? 'On the wire this is a frame. Payload of the frame = packet; payload of the packet = segment.'
            : wrap === 2
              ? 'A packet: segment plus an IP header.'
              : wrap === 1
                ? 'A segment: application data plus a Layer 4 header.'
                : 'Unwrap again at the destination: inspect, strip, pass up.'}
        </p>
        <div className={styles.row}>
          <span className={styles.label}>Answer</span>
          {choices.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`${styles.choice} ${picked === id ? styles.choiceOn : ''}`}
              onClick={() => choose(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className={`${styles.hint} ${feedback && picked === story.answer ? styles.ok : feedback ? styles.bad : ''}`}>
          {feedback || 'Name the layer, the address, the hop count, or the PDU.'}
        </p>
        <div className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{background: '#1565c0'}} />
            this hop
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#cfd8dc'}} />
            switch (not a hop)
          </span>
          <span>
            <span className={styles.swatch} style={{background: '#455a64'}} />
            host / router
          </span>
        </div>
      </div>
    </CEBlock>
  );
}
