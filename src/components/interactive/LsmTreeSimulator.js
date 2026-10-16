import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';
import TextField from '@site/src/components/ui/TextField';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const MEMTABLE_LIMIT = 4;

const LEGEND = [
  {key: 'wal', label: 'WAL', color: '#ffb74d', desc: 'Append-only durability log for unflushed writes'},
  {key: 'mem', label: 'Memtable', color: '#42a5f5', desc: 'In-memory sorted buffer for recent writes'},
  {key: 'sst', label: 'SSTable', color: '#66bb6a', desc: 'Immutable sorted segment on disk'},
  {key: 'hit', label: 'Found here', color: '#2e7d32', desc: 'Lookup stopped at this layer'},
  {key: 'skip', label: 'Bloom skip', color: '#90a4ae', desc: 'Filter said definitely not present'},
  {key: 'tomb', label: 'Tombstone', color: '#ef5350', desc: 'Delete marker — hides older values'},
];

const COLORS = {
  wal: '#ffb74d',
  mem: '#42a5f5',
  sst: '#66bb6a',
  hit: '#2e7d32',
  skip: '#90a4ae',
  miss: '#bdbdbd',
  tomb: '#ef5350',
};

let nextId = 1;

function emptyState() {
  return {
    wal: [],
    memtable: {},
    sstables: [],
    note: 'Write keys into the memtable. When it fills (or you flush), it becomes a new SSTable. Reads check memtable, then newest SSTable first.',
    path: [],
    lastResult: null,
  };
}

function sortedEntries(map) {
  return Object.keys(map)
    .sort()
    .map((key) => ({key, value: map[key]}));
}

function mergeMaps(newer, older) {
  return {...older, ...newer};
}

function bloomMightContain(keys, key) {
  // Teaching model: perfect membership (no false positives).
  // Real Bloom filters can false-positive; they never false-negative.
  return keys.includes(key);
}

function KvChip({entry, emphasize}) {
  const tomb = entry.value === null;
  return (
    <Chip
      size="small"
      label={tomb ? `${entry.key}✗` : `${entry.key}=${entry.value}`}
      sx={{
        fontFamily: 'monospace',
        fontWeight: emphasize ? 700 : 500,
        bgcolor: tomb ? COLORS.tomb : emphasize ? COLORS.hit : '#eceff1',
        color: tomb || emphasize ? '#fff' : 'text.primary',
        border: emphasize ? `2px solid ${COLORS.hit}` : '1px solid transparent',
      }}
    />
  );
}

function LayerCard({title, subtitle, color, status, children}) {
  const border =
    status === 'hit'
      ? COLORS.hit
      : status === 'skip'
        ? COLORS.skip
        : status === 'miss'
          ? COLORS.miss
          : color;
  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: border,
        borderRadius: 1.5,
        p: 1.25,
        backgroundColor: status === 'skip' ? 'grey.50' : 'background.paper',
        opacity: status === 'skip' ? 0.65 : 1,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={0.75} gap={1}>
        <Typography variant="caption" sx={{fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.4}}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}

export default function LsmTreeSimulator() {
  const [state, setState] = useState(emptyState);
  const [keyIn, setKeyIn] = useState('tabby');
  const [valIn, setValIn] = useState('12');

  const memCount = Object.keys(state.memtable).length;
  const memEntries = useMemo(() => sortedEntries(state.memtable), [state.memtable]);

  const pathStatus = (layerId) => {
    const hit = state.path.find((p) => p.layer === layerId);
    return hit ? hit.status : null;
  };

  const applyWrite = (key, value, isDelete) => {
    const k = key.trim();
    if (!k) {
      return;
    }
    setState((prev) => {
      const wal = [...prev.wal, {key: k, value: isDelete ? null : value, op: isDelete ? 'del' : 'put'}];
      const memtable = {...prev.memtable, [k]: isDelete ? null : value};
      let {sstables} = prev;
      let note = isDelete
        ? `Wrote tombstone for "${k}" into memtable (and WAL).`
        : `Wrote ${k}=${value} into memtable (and WAL).`;
      let flushed = null;

      if (Object.keys(memtable).length >= MEMTABLE_LIMIT) {
        const entries = sortedEntries(memtable);
        flushed = {
          id: nextId++,
          entries,
          keys: entries.map((e) => e.key),
        };
        sstables = [flushed, ...sstables];
        note += ` Memtable full → flushed SSTable #${flushed.id} (sorted). WAL for those keys can be discarded.`;
        return {
          ...prev,
          wal: [],
          memtable: {},
          sstables,
          note,
          path: [],
          lastResult: null,
        };
      }

      return {
        ...prev,
        wal,
        memtable,
        sstables,
        note,
        path: [],
        lastResult: null,
      };
    });
  };

  const flush = () => {
    setState((prev) => {
      if (Object.keys(prev.memtable).length === 0) {
        return {...prev, note: 'Memtable is empty — nothing to flush.', path: [], lastResult: null};
      }
      const entries = sortedEntries(prev.memtable);
      const sst = {
        id: nextId++,
        entries,
        keys: entries.map((e) => e.key),
      };
      return {
        ...prev,
        wal: [],
        memtable: {},
        sstables: [sst, ...prev.sstables],
        note: `Flushed memtable → SSTable #${sst.id}. Keys are sorted; segment is immutable.`,
        path: [],
        lastResult: null,
      };
    });
  };

  const doGet = () => {
    const k = keyIn.trim();
    if (!k) {
      return;
    }
    setState((prev) => {
      const path = [];
      if (Object.prototype.hasOwnProperty.call(prev.memtable, k)) {
        path.push({layer: 'mem', status: 'hit'});
        const value = prev.memtable[k];
        return {
          ...prev,
          path,
          lastResult: value,
          note:
            value === null
              ? `Found tombstone for "${k}" in memtable — key is deleted (stop searching).`
              : `Found ${k}=${value} in memtable — newest layer wins, stop searching.`,
        };
      }
      path.push({layer: 'mem', status: 'miss'});

      for (const sst of prev.sstables) {
        const layer = `sst-${sst.id}`;
        if (!bloomMightContain(sst.keys, k)) {
          path.push({layer, status: 'skip'});
          continue;
        }
        const entry = sst.entries.find((e) => e.key === k);
        if (entry) {
          path.push({layer, status: 'hit'});
          return {
            ...prev,
            path,
            lastResult: entry.value,
            note:
              entry.value === null
                ? `Bloom said maybe → opened SSTable #${sst.id}, found tombstone for "${k}".`
                : `Bloom said maybe → opened SSTable #${sst.id}, found ${k}=${entry.value}.`,
          };
        }
        path.push({layer, status: 'miss'});
      }

      return {
        ...prev,
        path,
        lastResult: undefined,
        note: `Checked memtable and every SSTable — "${k}" does not exist. (This is the expensive miss Bloom filters try to avoid.)`,
      };
    });
  };

  const compact = () => {
    setState((prev) => {
      if (prev.sstables.length < 2) {
        return {
          ...prev,
          note: 'Need at least two SSTables to compact. Flush a few writes first.',
          path: [],
          lastResult: null,
        };
      }
      const [newer, older, ...rest] = prev.sstables;
      const mergedMap = mergeMaps(
        Object.fromEntries(newer.entries.map((e) => [e.key, e.value])),
        Object.fromEntries(older.entries.map((e) => [e.key, e.value])),
      );
      // Drop keys whose newest value is a tombstone once compacted away from older data.
      const kept = {};
      for (const [key, value] of Object.entries(mergedMap)) {
        if (value !== null) {
          kept[key] = value;
        }
      }
      const entries = sortedEntries(kept);
      const sst = {
        id: nextId++,
        entries,
        keys: entries.map((e) => e.key),
      };
      return {
        ...prev,
        sstables: [sst, ...rest],
        note: `Compacted #${newer.id}+#${older.id} → #${sst.id}. Newer values win; satisfied tombstones drop old data.`,
        path: [],
        lastResult: null,
      };
    });
  };

  const seedDemo = () => {
    nextId = 1;
    setState({
      wal: [],
      memtable: {tabby: '17'},
      sstables: [
        {
          id: nextId++,
          entries: [
            {key: 'siamese', value: '30'},
            {key: 'tabby', value: '13'},
          ],
          keys: ['siamese', 'tabby'],
        },
        {
          id: nextId++,
          entries: [
            {key: 'bengal', value: '9'},
            {key: 'persian', value: null},
            {key: 'tabby', value: '12'},
          ],
          keys: ['bengal', 'persian', 'tabby'],
        },
      ],
      note: 'Demo loaded: memtable has tabby=17; two SSTables underneath. Try Get tabby, Get persian, Get ghost, then Compact.',
      path: [],
      lastResult: null,
    });
    setKeyIn('tabby');
    setValIn('17');
  };

  const reset = () => {
    nextId = 1;
    setState(emptyState());
    setKeyIn('tabby');
    setValIn('12');
  };

  const resultLabel =
    state.lastResult === null
      ? 'deleted (tombstone)'
      : state.lastResult === undefined
        ? 'not found'
        : String(state.lastResult);

  return (
    <CEBlock
      title="LSM-tree / SSTable playground"
      subtitle="Write → memtable (+WAL) → flush to sorted SSTables → read newest-first. Bloom filters skip cold segments; compaction merges and drops garbage."
      legend={<ColorLegend items={LEGEND} />}
    >
      <CEBlock.Section label="Engine state">
        <Stack spacing={1.25}>
          <LayerCard
            title="Write-ahead log"
            subtitle={`${state.wal.length} pending`}
            color={COLORS.wal}
          >
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {state.wal.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  empty (cleared on flush)
                </Typography>
              ) : (
                state.wal.map((w, i) => (
                  <Chip
                    key={`${w.key}-${i}`}
                    size="small"
                    label={w.op === 'del' ? `del ${w.key}` : `${w.key}=${w.value}`}
                    sx={{fontFamily: 'monospace', bgcolor: COLORS.wal, color: '#fff'}}
                  />
                ))
              )}
            </Stack>
          </LayerCard>

          <LayerCard
            title="Memtable"
            subtitle={`${memCount} / ${MEMTABLE_LIMIT} keys · auto-flush at ${MEMTABLE_LIMIT}`}
            color={COLORS.mem}
            status={pathStatus('mem')}
          >
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {memEntries.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  empty — writes land here first
                </Typography>
              ) : (
                memEntries.map((e) => (
                  <KvChip key={e.key} entry={e} emphasize={pathStatus('mem') === 'hit' && keyIn.trim() === e.key} />
                ))
              )}
            </Stack>
          </LayerCard>

          {state.sstables.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No SSTables yet — flush the memtable to create one.
            </Typography>
          ) : (
            state.sstables.map((sst, idx) => (
              <LayerCard
                key={sst.id}
                title={`SSTable #${sst.id}`}
                subtitle={`${idx === 0 ? 'newest' : idx === state.sstables.length - 1 ? 'oldest' : `L0+${idx}`} · bloom over {${sst.keys.join(', ')}}`}
                color={COLORS.sst}
                status={pathStatus(`sst-${sst.id}`)}
              >
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {sst.entries.map((e) => (
                    <KvChip
                      key={e.key}
                      entry={e}
                      emphasize={pathStatus(`sst-${sst.id}`) === 'hit' && keyIn.trim() === e.key}
                    />
                  ))}
                </Stack>
              </LayerCard>
            ))
          )}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Controls">
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <TextField
              size="small"
              label="key"
              value={keyIn}
              onChange={(e) => setKeyIn(e.target.value)}
              sx={{width: 120}}
            />
            <TextField
              size="small"
              label="value"
              value={valIn}
              onChange={(e) => setValIn(e.target.value)}
              sx={{width: 120}}
            />
            <Button variant="contained" size="small" onClick={() => applyWrite(keyIn, valIn, false)}>
              Write
            </Button>
            <Button variant="outlined" size="small" onClick={() => applyWrite(keyIn, valIn, true)}>
              Delete
            </Button>
            <Button variant="outlined" size="small" onClick={flush}>
              Flush
            </Button>
            <Button variant="contained" size="small" onClick={doGet}>
              Get
            </Button>
            <Button variant="outlined" size="small" onClick={compact}>
              Compact
            </Button>
            <Button variant="text" size="small" onClick={seedDemo}>
              Load demo
            </Button>
            <Button variant="text" size="small" onClick={reset}>
              Reset
            </Button>
          </Stack>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              backgroundColor: 'grey.100',
              borderLeft: '4px solid',
              borderColor: COLORS.mem,
            }}
          >
            <Typography variant="body2" sx={{lineHeight: 1.55}}>
              {state.note}
            </Typography>
            {state.path.length > 0 && (
              <Typography variant="caption" display="block" mt={0.75} fontFamily="monospace">
                path:{' '}
                {state.path
                  .map((p) => `${p.layer}:${p.status}`)
                  .join(' → ')}
                {state.lastResult !== undefined || state.path.some((p) => p.status === 'hit')
                  ? ` · result=${resultLabel}`
                  : state.path.length
                    ? ` · result=${resultLabel}`
                    : ''}
              </Typography>
            )}
          </Box>
        </Stack>
      </CEBlock.Section>
    </CEBlock>
  );
}
