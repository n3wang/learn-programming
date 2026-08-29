import React, {useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const LEGEND = [
  {key: 'persist', label: 'Persistence', color: '#42a5f5', desc: 'Survive crashes & power loss'},
  {key: 'device', label: 'Devices', color: '#66bb6a', desc: 'Disks, RAID, flash'},
  {key: 'fs', label: 'File systems', color: '#ab47bc', desc: 'FFS, journaling, LFS'},
  {key: 'protect', label: 'Integrity', color: '#ffb74d', desc: 'Checksums, scrubbing'},
];

const STEPS = [
  {
    tag: 'persist',
    title: 'Harder than memory',
    quote: 'Managing data for a long time is harder than managing data that isn’t persistent.',
    note: 'Crash → RAM vanishes. File-system state must survive. Forever is a long time — but “a long time” is still the bar.',
  },
  {
    tag: 'persist',
    title: 'Updates + recovery',
    quote: 'Even simple updates are complicated, because you have to care what happens if you crash.',
    note: 'Crash consistency, journaling, and COW/LFS exist because multi-block updates aren’t atomic on disk.',
  },
  {
    tag: 'device',
    title: 'Disks, RAID, checksums',
    quote: 'Disk scheduling, RAID, and checksums — that stuff is cool.',
    note: 'Scheduling, redundancy, and integrity machinery sit under the FS. Erasure codes get mathematical fast.',
  },
  {
    tag: 'fs',
    title: 'Technology-aware design',
    quote: 'FFS and LFS — being disk-aware seems cool.',
    note: 'Layout and write patterns matter: locality (FFS), sequential segments (LFS), ordered metadata, scrubbing.',
  },
  {
    tag: 'device',
    title: 'Still relevant on Flash',
    quote: 'Even with Flash, many of these ideas remain useful.',
    note: 'FTLs are log-structured inside SSDs. Locality and write amp still matter. Ideas outlive a single medium.',
  },
  {
    tag: 'protect',
    title: 'Not for nothing',
    quote: 'Professors wouldn’t teach this for no reason… would they?',
    note: 'Persistence arc: devices → FS API & implementation → crash consistency → LFS → SSD → integrity. Next: distribution.',
  },
];

const tagColor = (tag) => LEGEND.find((l) => l.key === tag)?.color ?? '#78909c';

export default function PersistenceDialogueSimulator() {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];

  return (
    <CEBlock
      title="Persistence dialogue"
      subtitle="Walk the recap themes from OSTEP Ch. 46."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls
          step={step}
          total={STEPS.length}
          onReset={() => setStep(0)}
          onPrev={() => setStep((s) => Math.max(0, s - 1))}
          onNext={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        />
      }
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={LEGEND.find((l) => l.key === cur.tag)?.label}
            sx={{bgcolor: tagColor(cur.tag), color: '#fff', fontWeight: 700}}
          />
          <Typography variant="subtitle1" fontWeight={700}>
            {cur.title}
          </Typography>
        </Stack>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            borderLeft: `4px solid ${tagColor(cur.tag)}`,
            bgcolor: 'action.hover',
            fontStyle: 'italic',
            fontSize: 14,
          }}
        >
          “{cur.quote}”
        </Box>
        <Typography variant="body2">{cur.note}</Typography>
      </Stack>
    </CEBlock>
  );
}
