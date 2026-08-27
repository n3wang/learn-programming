import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'hit', label: 'TLB hit', color: '#66bb6a', desc: 'Translation found in TLB — no page-table walk'},
  {key: 'miss', label: 'TLB miss', color: '#ef5350', desc: 'Must consult page table (or trap to OS)'},
  {key: 'page', label: 'Array page', color: '#42a5f5', desc: 'VPN holding array elements'},
];

/** Array of 10 ints at VA 100; 16B pages → VPN 6,7,8 */
const ARRAY_ACCESSES = [
  {i: 0, vpn: 6, hit: false},
  {i: 1, vpn: 6, hit: true},
  {i: 2, vpn: 6, hit: true},
  {i: 3, vpn: 7, hit: false},
  {i: 4, vpn: 7, hit: true},
  {i: 5, vpn: 7, hit: true},
  {i: 6, vpn: 7, hit: true},
  {i: 7, vpn: 8, hit: false},
  {i: 8, vpn: 8, hit: true},
  {i: 9, vpn: 8, hit: true},
];

const SCENARIOS = {
  flow: {
    label: 'Hit vs miss',
    subtitle: 'Fig 19.1 — look up VPN in TLB; hit → translate; miss → page table then retry.',
    steps: [
      {
        note: 'Extract VPN from VA. Parallel search of fully-associative TLB.',
        phase: 'lookup',
      },
      {
        note: 'TLB hit: check protect bits, form PA = (PFN << SHIFT) | offset, AccessMemory.',
        phase: 'hit',
      },
      {
        note: 'TLB miss (hardware-managed): walk page table, insert into TLB, retry instruction → hit.',
        phase: 'miss-hw',
      },
      {
        note: 'TLB miss (software-managed): RaiseException(TLB_MISS); OS handler updates TLB; return-from-trap retries same PC.',
        phase: 'miss-sw',
      },
    ],
  },
  array: {
    label: 'Array trace',
    subtitle: 'Fig 19.2 — 10 ints @ VA 100, 16B pages → miss,hit,hit, miss,hit,hit,hit, miss,hit,hit (70%).',
    steps: ARRAY_ACCESSES.map((a, idx) => ({
      ...a,
      note:
        idx === 0
          ? `a[${a.i}] on VPN ${a.vpn} — cold miss; load translation into TLB.`
          : a.hit
            ? `a[${a.i}] still on VPN ${a.vpn} — spatial locality → TLB hit.`
            : `a[${a.i}] crosses to VPN ${a.vpn} — another miss, then hits on this page.`,
    })),
  },
  context: {
    label: 'Context switch',
    subtitle: 'P1 VPN10→100 and P2 VPN10→170 collide unless you flush or use ASIDs.',
    steps: [
      {
        note: 'Without ASID: two VPN 10 entries — hardware cannot tell which process owns which.',
        problem: true,
      },
      {
        note: 'Flush TLB on switch (valid=0). Safe but next process pays cold misses.',
        flush: true,
      },
      {
        note: 'ASID tags each entry. Both translations can coexist; OS sets current ASID register.',
        asid: true,
      },
    ],
  },
  replace: {
    label: 'Replacement',
    subtitle: 'Which TLB entry to evict? LRU vs random — and the n+1 page loop trap.',
    steps: [
      {
        note: 'LRU: evict least-recently-used — good when locality holds.',
        policy: 'LRU',
      },
      {
        note: 'Loop over n+1 pages with TLB size n: LRU misses every access. Random often does better.',
        policy: 'pathological',
      },
      {
        note: 'Exceeding TLB coverage (working set > TLB entries) → many misses. Larger pages help (next chapter).',
        policy: 'coverage',
      },
    ],
  },
};

function ArrayPageMap({activeVpn, accessIdx}) {
  const pages = [6, 7, 8];
  const labels = {
    6: 'a[0..2]',
    7: 'a[3..6]',
    8: 'a[7..9]',
  };
  return (
    <Stack spacing={1} mb={1}>
      <Stack direction="row" spacing={0.5}>
        {pages.map((vpn) => (
          <Box
            key={vpn}
            sx={{
              flex: 1,
              py: 1.5,
              textAlign: 'center',
              borderRadius: 1,
              backgroundColor: vpn === activeVpn ? '#42a5f5' : '#e3f2fd',
              color: vpn === activeVpn ? '#fff' : 'text.primary',
              fontWeight: 700,
              fontSize: 12,
              border: vpn === activeVpn ? '2px solid #1565c0' : '1px solid #90caf9',
            }}
          >
            VPN {String(vpn).padStart(2, '0')}
            <Typography variant="caption" display="block">
              {labels[vpn]}
            </Typography>
          </Box>
        ))}
      </Stack>
      {accessIdx != null && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {ARRAY_ACCESSES.slice(0, accessIdx + 1).map((a, i) => (
            <Chip
              key={i}
              size="small"
              label={`a[${a.i}]`}
              sx={{
                backgroundColor: a.hit ? '#66bb6a' : '#ef5350',
                color: '#fff',
                fontWeight: 700,
                opacity: i === accessIdx ? 1 : 0.55,
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function TlbTable({rows}) {
  return (
    <Box component="table" sx={{fontSize: 12, borderCollapse: 'collapse', mb: 1, width: '100%'}}>
      <thead>
        <tr>
          {['VPN', 'PFN', 'valid', 'prot', 'ASID'].map((h) => (
            <th key={h} style={{border: '1px solid #ddd', padding: '4px 8px', textAlign: 'left'}}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {[r.vpn, r.pfn, r.valid, r.prot, r.asid ?? '—'].map((c, j) => (
              <td key={j} style={{border: '1px solid #ddd', padding: '4px 8px', fontFamily: 'monospace'}}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Box>
  );
}

export default function TlbSimulator() {
  const [scenario, setScenario] = useState('array');
  const [step, setStep] = useState(0);
  const data = SCENARIOS[scenario];
  const current = data.steps[step];

  const switchScenario = (_, v) => {
    if (!v) return;
    setScenario(v);
    setStep(0);
  };

  const hits = ARRAY_ACCESSES.filter((a) => a.hit).length;
  const hitRate =
    scenario === 'array' ? Math.round((ARRAY_ACCESSES.slice(0, step + 1).filter((a) => a.hit).length / (step + 1)) * 100) : null;

  return (
    <CEBlock title="TLB — Faster Translations" subtitle={data.subtitle}>
      <CEBlock.Section label="Scenario">
        <ToggleButtonGroup value={scenario} exclusive onChange={switchScenario} size="small" sx={{flexWrap: 'wrap'}}>
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <ToggleButton key={key} value={key} sx={{textTransform: 'none'}}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </CEBlock.Section>

      <CEBlock.Section label="Step">
        {scenario === 'array' && (
          <>
            <ArrayPageMap activeVpn={current.vpn} accessIdx={step} />
            <Chip
              size="small"
              label={current.hit ? 'HIT' : 'MISS'}
              sx={{
                backgroundColor: current.hit ? '#66bb6a' : '#ef5350',
                color: '#fff',
                fontWeight: 700,
                mb: 1,
                mr: 1,
              }}
            />
            <Chip size="small" variant="outlined" label={`hit rate so far ${hitRate}% (final ${Math.round((hits / 10) * 100)}%)`} />
          </>
        )}
        {scenario === 'flow' && (
          <Chip
            size="small"
            label={
              current.phase === 'hit'
                ? 'TLB HIT path'
                : current.phase === 'miss-hw'
                  ? 'Hardware walk'
                  : current.phase === 'miss-sw'
                    ? 'OS TLB miss trap'
                    : 'TLB_Lookup(VPN)'
            }
            color="primary"
            sx={{mb: 1}}
          />
        )}
        {scenario === 'context' && current.problem && (
          <TlbTable
            rows={[
              {vpn: 10, pfn: 100, valid: 1, prot: 'rwx', asid: '—'},
              {vpn: 10, pfn: 170, valid: 1, prot: 'rwx', asid: '—'},
            ]}
          />
        )}
        {scenario === 'context' && current.flush && (
          <Chip size="small" label="all valid bits → 0" color="warning" sx={{mb: 1}} />
        )}
        {scenario === 'context' && current.asid && (
          <TlbTable
            rows={[
              {vpn: 10, pfn: 100, valid: 1, prot: 'rwx', asid: 1},
              {vpn: 10, pfn: 170, valid: 1, prot: 'rwx', asid: 2},
            ]}
          />
        )}
        {scenario === 'replace' && current.policy && (
          <Chip size="small" label={current.policy} variant="outlined" sx={{mb: 1}} />
        )}
        <Typography variant="body2" mt={1} color="text.secondary" lineHeight={1.55}>
          {current.note}
        </Typography>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <ColorLegend items={LEGEND} />
        <Box mt={1}>
          <StepControls step={step} max={data.steps.length - 1} onStep={setStep} label="Step" />
        </Box>
      </CEBlock.Section>
    </CEBlock>
  );
}
