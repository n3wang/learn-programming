import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Stack from '@site/src/components/ui/Stack';
import Chip from '@site/src/components/ui/Chip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import StepControls from '@site/src/components/interactive/shell/StepControls';
import ColorLegend from '@site/src/components/interactive/shell/ColorLegend';

const COLORS = {
  compare: '#ffb74d',
  swap: '#ef9a9a',
  sorted: '#81c784',
  pivot: '#ba68c8',
  write: '#4fc3f7',
  plain: '#eceff1',
};

const LEGEND = [
  {key: 'C', label: 'Compare', color: COLORS.compare, desc: 'Indices being compared'},
  {key: 'S', label: 'Swap / move', color: COLORS.swap, desc: 'Elements swapping or moving'},
  {key: 'W', label: 'Write', color: COLORS.write, desc: 'Written from aux / heapify'},
  {key: 'P', label: 'Pivot', color: COLORS.pivot, desc: 'Quicksort pivot'},
  {key: 'D', label: 'Done / sorted', color: COLORS.sorted, desc: 'Known final position'},
];

const DATASETS = {
  demo: {label: 'Demo [5 2 8 1 9 3]', a: [5, 2, 8, 1, 9, 3]},
  nearly: {label: 'Nearly sorted', a: [1, 2, 4, 3, 5, 6]},
  reverse: {label: 'Reversed', a: [6, 5, 4, 3, 2, 1]},
  dups: {label: 'Duplicates', a: [4, 2, 4, 1, 2, 3]},
};

function frame(arr, roles, msg) {
  return {arr: [...arr], roles: {...roles}, msg};
}

function bubbleFrames(input) {
  const a = [...input];
  const n = a.length;
  const frames = [frame(a, {}, `Bubble sort start. Passes bubble max to the right.`)];
  for (let end = n - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      frames.push(frame(a, {[i]: 'compare', [i + 1]: 'compare'}, `Compare a[${i}]=${a[i]} and a[${i + 1}]=${a[i + 1]}.`));
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        frames.push(frame(a, {[i]: 'swap', [i + 1]: 'swap'}, `Swap → [${a.join(' ')}].`));
      }
    }
    const done = {};
    for (let k = end; k < n; k++) done[k] = 'sorted';
    frames.push(frame(a, done, `a[${end}..${n - 1}] settled after this pass.`));
  }
  const all = {};
  for (let i = 0; i < n; i++) all[i] = 'sorted';
  frames.push(frame(a, all, `Done. [${a.join(' ')}].`));
  return frames;
}

function selectionFrames(input) {
  const a = [...input];
  const n = a.length;
  const frames = [frame(a, {}, `Selection sort: each pass picks the minimum of the unsorted suffix.`)];
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      frames.push(frame(a, {[min]: 'compare', [j]: 'compare', [i]: 'write'}, `Scan j=${j}; current min index=${min} (val ${a[min]}).`));
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      frames.push(frame(a, {[i]: 'swap', [min]: 'swap'}, `Swap min into index ${i}.`));
    }
    frames.push(frame(a, Object.fromEntries([...Array(i + 1).keys()].map((k) => [k, 'sorted'])), `Prefix [0..${i}] sorted.`));
  }
  frames.push(frame(a, Object.fromEntries([...Array(n).keys()].map((i) => [i, 'sorted'])), `Done. [${a.join(' ')}].`));
  return frames;
}

function insertionFrames(input) {
  const a = [...input];
  const n = a.length;
  const frames = [frame(a, {[0]: 'sorted'}, `Insertion sort: grow a sorted prefix; insert a[i] leftward.`)];
  for (let i = 1; i < n; i++) {
    const key = a[i];
    frames.push(frame(a, {[i]: 'write'}, `Pick key=a[${i}]=${key}; shift larger left neighbors right.`));
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      frames.push(frame(a, {[j]: 'compare', [j + 1]: 'swap'}, `a[${j}]=${a[j]} > key → shift right.`));
      a[j + 1] = a[j];
      j -= 1;
      frames.push(frame(a, {[j + 1]: 'write'}, `Wrote ${a[j + 1]} into slot ${j + 1}.`));
    }
    a[j + 1] = key;
    frames.push(frame(a, Object.fromEntries([...Array(i + 1).keys()].map((k) => [k, 'sorted'])), `Inserted key at ${j + 1}. Prefix sorted.`));
  }
  frames.push(frame(a, Object.fromEntries([...Array(n).keys()].map((i) => [i, 'sorted'])), `Done. [${a.join(' ')}].`));
  return frames;
}

function mergeFrames(input) {
  const a = [...input];
  const frames = [frame(a, {}, `Mergesort: divide, then merge sorted halves.`)];

  function mergeSort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    frames.push(frame(a, Object.fromEntries([...Array(hi - lo).keys()].map((k) => [lo + k, 'compare'])), `Divide [${lo}, ${hi}) at mid=${mid}.`));
    mergeSort(lo, mid);
    mergeSort(mid, hi);
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      frames.push(
        frame(a, {[lo + i]: 'compare', [mid + j]: 'compare'}, `Merge: compare ${left[i]} vs ${right[j]}.`),
      );
      if (left[i] <= right[j]) {
        a[k] = left[i++];
      } else {
        a[k] = right[j++];
      }
      frames.push(frame(a, {[k]: 'write'}, `Write ${a[k]} at index ${k}.`));
      k += 1;
    }
    while (i < left.length) {
      a[k] = left[i++];
      frames.push(frame(a, {[k]: 'write'}, `Drain left → a[${k}]=${a[k]}.`));
      k += 1;
    }
    while (j < right.length) {
      a[k] = right[j++];
      frames.push(frame(a, {[k]: 'write'}, `Drain right → a[${k}]=${a[k]}.`));
      k += 1;
    }
    frames.push(
      frame(a, Object.fromEntries([...Array(hi - lo).keys()].map((t) => [lo + t, 'sorted'])), `Merged [${lo}, ${hi}).`),
    );
  }

  mergeSort(0, a.length);
  frames.push(frame(a, Object.fromEntries([...Array(a.length).keys()].map((i) => [i, 'sorted'])), `Done. [${a.join(' ')}].`));
  return frames;
}

function quickFrames(input) {
  const a = [...input];
  const frames = [frame(a, {}, `Quicksort (Lomuto): partition around pivot = a[hi], then recurse.`)];

  function partition(lo, hi) {
    const pivot = a[hi];
    frames.push(frame(a, {[hi]: 'pivot'}, `Pivot a[${hi}]=${pivot} for range [${lo}, ${hi}].`));
    let i = lo;
    for (let j = lo; j < hi; j++) {
      frames.push(frame(a, {[j]: 'compare', [hi]: 'pivot', [i]: 'write'}, `j=${j}: a[j]=${a[j]} vs pivot ${pivot}.`));
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        frames.push(frame(a, {[i]: 'swap', [j]: 'swap', [hi]: 'pivot'}, `a[j] < pivot → swap with i=${i}, then i++.`));
        i += 1;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    frames.push(frame(a, {[i]: 'sorted', [hi]: 'swap'}, `Place pivot at index ${i}.`));
    return i;
  }

  function qs(lo, hi) {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    qs(lo, p - 1);
    qs(p + 1, hi);
  }

  qs(0, a.length - 1);
  frames.push(frame(a, Object.fromEntries([...Array(a.length).keys()].map((i) => [i, 'sorted'])), `Done. [${a.join(' ')}].`));
  return frames;
}

function heapFrames(input) {
  const a = [...input];
  const n = a.length;
  const frames = [frame(a, {}, `Heapsort: build max-heap, then repeatedly swap root with end.`)];

  function siftDown(len, i) {
    while (true) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < len && a[l] > a[largest]) largest = l;
      if (r < len && a[r] > a[largest]) largest = r;
      frames.push(
        frame(a, {[i]: 'compare', [largest]: 'compare'}, `siftDown i=${i}, largest=${largest} within heap size ${len}.`),
      );
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      frames.push(frame(a, {[i]: 'swap', [largest]: 'swap'}, `Swap heap nodes ${i} ↔ ${largest}.`));
      i = largest;
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    frames.push(frame(a, {[i]: 'write'}, `Heapify subtree rooted at ${i}.`));
    siftDown(n, i);
  }
  frames.push(frame(a, {}, `Max-heap built. Extract max repeatedly.`));

  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    frames.push(frame(a, {[0]: 'swap', [end]: 'sorted'}, `Swap max to index ${end}; heap size → ${end}.`));
    siftDown(end, 0);
  }
  frames.push(frame(a, Object.fromEntries([...Array(n).keys()].map((i) => [i, 'sorted'])), `Done. [${a.join(' ')}].`));
  return frames;
}

const ALGOS = {
  bubble: {label: 'Bubble', build: bubbleFrames},
  selection: {label: 'Selection', build: selectionFrames},
  insertion: {label: 'Insertion', build: insertionFrames},
  merge: {label: 'Merge', build: mergeFrames},
  quick: {label: 'Quick', build: quickFrames},
  heap: {label: 'Heap', build: heapFrames},
};

function cellBg(role) {
  if (role === 'compare') return COLORS.compare;
  if (role === 'swap') return COLORS.swap;
  if (role === 'sorted') return COLORS.sorted;
  if (role === 'pivot') return COLORS.pivot;
  if (role === 'write') return COLORS.write;
  return COLORS.plain;
}

export default function SortingVisualizerSimulator() {
  const [algo, setAlgo] = useState('bubble');
  const [dataset, setDataset] = useState('demo');
  const frames = useMemo(
    () => ALGOS[algo].build(DATASETS[dataset].a),
    [algo, dataset],
  );
  const [step, setStep] = useState(0);
  const frame = frames[Math.min(step, frames.length - 1)];

  const selectAlgo = (id) => {
    setAlgo(id);
    setStep(0);
  };
  const selectData = (id) => {
    setDataset(id);
    setStep(0);
  };

  return (
    <CEBlock
      title="Sorting step visualizer"
      subtitle="Watch comparisons, swaps, pivots, and sorted prefixes light up on a 1-D grid."
      legend={<ColorLegend items={LEGEND} />}
      controls={
        <StepControls step={step} max={Math.max(0, frames.length - 1)} onStep={setStep} label="Step" />
      }
    >
      <CEBlock.Section label="Algorithm">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {Object.entries(ALGOS).map(([id, s]) => (
            <Chip
              key={id}
              label={s.label}
              size="small"
              color={id === algo ? 'primary' : 'default'}
              variant={id === algo ? 'filled' : 'outlined'}
              onClick={() => selectAlgo(id)}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Input array">
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {Object.entries(DATASETS).map(([id, s]) => (
            <Chip
              key={id}
              label={s.label}
              size="small"
              color={id === dataset ? 'secondary' : 'default'}
              variant={id === dataset ? 'filled' : 'outlined'}
              onClick={() => selectData(id)}
            />
          ))}
        </Stack>
      </CEBlock.Section>

      <CEBlock.Section label="Array grid">
        <Box sx={{overflowX: 'auto', py: 1}}>
          <Stack direction="row" spacing={0.5} alignItems="flex-end">
            {frame.arr.map((val, i) => {
              const h = 28 + val * 10;
              return (
                <Box key={i} sx={{textAlign: 'center', minWidth: 40}}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {i}
                  </Typography>
                  <Box
                    sx={{
                      height: h,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      border: '1.5px solid #90a4ae',
                      backgroundColor: cellBg(frame.roles[i]),
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 14,
                      transition: 'background-color 120ms linear, height 120ms linear',
                    }}
                  >
                    {val}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </CEBlock.Section>

      <CEBlock.Section label="Narration">
        <Typography variant="body2">{frame.msg}</Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}
