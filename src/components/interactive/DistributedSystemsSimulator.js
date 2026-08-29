import React, {useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import ToggleButtonGroup from '@site/src/components/ui/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'loss', label: 'Packet loss', color: '#ef5350', desc: 'Dropped / corrupted / no buffer'},
  {key: 'udp', label: 'UDP', color: '#ffb74d', desc: 'Unreliable datagrams'},
  {key: 'rel', label: 'Reliable', color: '#66bb6a', desc: 'Ack + timeout/retry + seq'},
  {key: 'rpc', label: 'RPC', color: '#42a5f5', desc: 'Remote call = local call illusion'},
  {key: 'fail', label: 'Failure', color: '#ab47bc', desc: 'Components fail; system need not'},
];

const SCENARIOS = {
  why: {
    label: 'Why',
    subtitle: 'Web services are thousands of machines. Failure is constant — yet the service should appear never to fail.',
    steps: [
      {
        note: 'Crux: build working systems from imperfect parts (like RAID, but harder). Failure is also opportunity: redundant machines → rare whole-system outage.',
        tip: 'beauty of distribution',
      },
      {
        note: 'Also: performance (few messages, low latency, high bandwidth) and security (identity, confidentiality).',
        tip: 'more than failure',
      },
    ],
  },
  udp: {
    label: 'UDP',
    subtitle: 'Communication is inherently unreliable. UDP/IP: datagrams, checksums for corruption, no delivery guarantee — end-to-end argument.',
    steps: [
      {
        note: 'Loss causes: bit flips, cut cables, dead routers — and full buffers in switches/hosts even when everything is “up.”',
        tip: 'buffer overflow → drop',
      },
      {
        note: 'Client UDP_Write → server UDP_Read → reply. Great when the app handles loss; not enough when you need “got it.”',
        flow: ['client', 'UDP', 'server'],
      },
    ],
  },
  reliable: {
    label: 'Reliable',
    subtitle: 'Acks prove receipt. Timeout/retry resends. Sequence numbers give exactly-once delivery despite lost acks.',
    steps: [
      {
        note: 'Sender keeps a copy + timer. No ack → retry. Too-short timeout wastes bandwidth; too-long hurts latency. Under overload: exponential back-off.',
        tip: 'timeout/retry',
      },
      {
        note: 'Lost ack looks like lost request → duplicate delivery. Seq counters: sender stamps N, receiver expects N; duplicates get acked but not delivered up.',
        tip: 'exactly-once',
      },
      {
        note: 'TCP adds congestion control, pipelining, and a forest of tweaks — take a networks course for the rest [VJ88].',
        tip: 'TCP ≫ toy protocol',
      },
    ],
  },
  abs: {
    label: 'Abstractions',
    subtitle: 'DSM looked like shared memory across machines — failure + performance killed it. RPC won: remote call ≈ local call.',
    steps: [
      {
        note: 'DSM via page faults fetching remote pages. One machine dies → holes in your address space. Linked-list next into the void. Yikes.',
        tip: 'DSM not used for reliability',
      },
      {
        note: 'RPC: stub generator marshals args; runtime does naming, transport, timeout/retry. Server often uses a thread pool.',
        tip: 'stubs + runtime',
      },
      {
        note: 'Often built on UDP (avoid double acks under TCP). At-most-once under failure. Also: long calls, fragmentation, endianness (XDR), async RPC.',
        tip: 'gRPC / Thrift / rpcgen',
      },
    ],
  },
  e2e: {
    label: 'End-to-end',
    subtitle: 'Reliability must be checked at the application “ends.” Lower layers help performance but cannot alone guarantee correct file transfer [SRC84].',
    steps: [
      {
        note: 'Reliable network ≠ reliable transfer: corruption in sender RAM or bad disk write still lose. End checksum after write-back.',
        tip: 'functionality at the ends',
      },
    ],
  },
};

export default function DistributedSystemsSimulator() {
  const [scenario, setScenario] = useState('why');
  const [step, setStep] = useState(0);
  const cfg = SCENARIOS[scenario];
  const cur = cfg.steps[step] || cfg.steps[0];

  return (
    <CEBlock
      title="Distributed systems"
      subtitle={cfg.subtitle}
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <Stack spacing={1.5}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={scenario}
            onChange={(_, v) => {
              if (v) {
                setScenario(v);
                setStep(0);
              }
            }}
          >
            {Object.entries(SCENARIOS).map(([k, v]) => (
              <ToggleButton key={k} value={k}>
                {v.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <StepControls
            step={step}
            total={cfg.steps.length}
            onReset={() => setStep(0)}
            onPrev={() => setStep((s) => Math.max(0, s - 1))}
            onNext={() => setStep((s) => Math.min(cfg.steps.length - 1, s + 1))}
          />
        </Stack>
      }
    >
      {cur.flow && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{mb: 1}} flexWrap="wrap" useFlexGap>
          {cur.flow.map((x, i) => (
            <React.Fragment key={x}>
              {i > 0 && <Typography color="text.secondary">→</Typography>}
              <Chip
                size="small"
                label={x}
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: x === 'UDP' ? '#ffb74d' : '#42a5f5',
                  color: '#fff',
                }}
              />
            </React.Fragment>
          ))}
        </Stack>
      )}
      {cur.tip && <Chip size="small" variant="outlined" label={cur.tip} sx={{mb: 1, width: 'fit-content'}} />}
      <Typography variant="body2">{cur.note}</Typography>
    </CEBlock>
  );
}
