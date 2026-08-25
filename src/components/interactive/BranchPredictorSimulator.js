import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import CEBlock from '@site/src/components/interactive/shell/CEBlock';

const STATES_2BIT = {
  SN: {label: 'Strongly\nNot Taken', predict: 'N', color: '#ef5350'},
  WN: {label: 'Weakly\nNot Taken', predict: 'N', color: '#ff7043'},
  WT: {label: 'Weakly\nTaken', predict: 'T', color: '#66bb6a'},
  ST: {label: 'Strongly\nTaken', predict: 'T', color: '#2e7d32'},
};
const STATE_ORDER = ['SN', 'WN', 'WT', 'ST'];

function next2BitState(state, actual) {
  const idx = STATE_ORDER.indexOf(state);
  return actual === 'T'
    ? STATE_ORDER[Math.min(idx + 1, 3)]
    : STATE_ORDER[Math.max(idx - 1, 0)];
}

const PRESETS = [
  {label: 'Loop (TTTTTN)', seq: 'TTTTTN'},
  {label: 'Alternating (TNTN)', seq: 'TNTNTNTN'},
  {label: 'Mostly Taken', seq: 'TTTNTTTNTTTN'},
  {label: 'Random-ish', seq: 'TTNTTNTNN'},
];

export default function BranchPredictorSimulator() {
  const [mode, setMode] = useState('2bit');
  const [state2, setState2] = useState('WT');
  const [last1, setLast1] = useState('T');
  const [history, setHistory] = useState([]);
  const [seqInput, setSeqInput] = useState('');

  const getPrediction = (m, s2, l1) =>
    m === '2bit' ? STATES_2BIT[s2].predict : l1;

  const step = (outcome) => {
    const pred = getPrediction(mode, state2, last1);
    const correctPred = pred === outcome;
    setHistory((h) => [
      ...h,
      {outcome, pred, correct: correctPred, state: mode === '2bit' ? state2 : null},
    ]);
    if (mode === '2bit') {
      setState2((s) => next2BitState(s, outcome));
    } else {
      setLast1(outcome);
    }
  };

  const runSequence = () => {
    const chars = seqInput.toUpperCase().replace(/[^TN]/g, '');
    if (!chars) {
      return;
    }
    let s2 = state2;
    let l1 = last1;
    const newHistory = [...history];
    for (const ch of chars) {
      const pred = getPrediction(mode, s2, l1);
      newHistory.push({
        outcome: ch,
        pred,
        correct: pred === ch,
        state: mode === '2bit' ? s2 : null,
      });
      if (mode === '2bit') {
        s2 = next2BitState(s2, ch);
      } else {
        l1 = ch;
      }
    }
    setHistory(newHistory);
    if (mode === '2bit') {
      setState2(s2);
    } else {
      setLast1(l1);
    }
  };

  const reset = () => {
    setHistory([]);
    setState2('WT');
    setLast1('T');
  };

  const correctCount = history.filter((h) => h.correct).length;
  const accuracy = history.length > 0 ? (correctCount / history.length) * 100 : null;

  return (
    <CEBlock
      title="Branch Predictor Simulator"
      subtitle="Record Taken / Not Taken and watch a 1-bit or 2-bit predictor update."
    >
      <CEBlock.Section label="Predictor type">
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => {
            if (v) {
              setMode(v);
              reset();
            }
          }}
          size="small"
        >
          <ToggleButton value="1bit">1-bit (Last Outcome)</ToggleButton>
          <ToggleButton value="2bit">2-bit Saturating Counter</ToggleButton>
        </ToggleButtonGroup>
      </CEBlock.Section>

      {mode === '2bit' ? (
        <CEBlock.Section label="2-bit state machine">
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
            sx={{mb: 1}}
          >
            {STATE_ORDER.map((s, idx) => (
              <React.Fragment key={s}>
                <Box
                  sx={{
                    p: 1,
                    minWidth: 86,
                    borderRadius: 2,
                    textAlign: 'center',
                    backgroundColor: STATES_2BIT[s].color,
                    border: s === state2 ? '3px solid #1a1a1a' : '3px solid transparent',
                    boxShadow: s === state2 ? 4 : 1,
                    transition: 'all 0.25s',
                    opacity: s === state2 ? 1 : 0.55,
                  }}
                >
                  <Typography sx={{fontSize: 13, fontWeight: 700, display: 'block'}}>
                    {s}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 9,
                      display: 'block',
                      lineHeight: 1.3,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {STATES_2BIT[s].label}
                  </Typography>
                  <Chip
                    label={`Predict: ${STATES_2BIT[s].predict === 'T' ? 'T' : 'N'}`}
                    size="small"
                    sx={{fontSize: 9, height: 16, mt: 0.5}}
                  />
                </Box>
                {idx < STATE_ORDER.length - 1 ? (
                  <Typography sx={{color: 'text.secondary', fontSize: 18, lineHeight: 1}}>
                    →
                  </Typography>
                ) : null}
              </React.Fragment>
            ))}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', textAlign: 'center'}}
          >
            Taken → shift right &nbsp;|&nbsp; Not Taken → shift left
          </Typography>
        </CEBlock.Section>
      ) : (
        <CEBlock.Section label="1-bit state">
          <Typography variant="body2">
            Predicting:{' '}
            <strong>{last1 === 'T' ? 'Taken' : 'Not Taken'}</strong>
            {' '}(always mirrors the last observed outcome)
          </Typography>
        </CEBlock.Section>
      )}

      <CEBlock.Section label="Record branch outcomes">
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mb: 2}}>
          <Button variant="contained" color="success" onClick={() => step('T')} size="small">
            Branch Taken (T)
          </Button>
          <Button variant="contained" color="error" onClick={() => step('N')} size="small">
            Not Taken (N)
          </Button>
          <Button variant="outlined" onClick={reset} size="small">
            Reset
          </Button>
        </Stack>
        <Typography variant="subtitle2" gutterBottom>
          Run a sequence
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{mb: 1}}>
          <TextField
            size="small"
            label="Sequence (T/N chars)"
            value={seqInput}
            onChange={(e) => setSeqInput(e.target.value)}
            placeholder="e.g. TTTTTN"
            sx={{width: 200}}
          />
          <Button
            variant="contained"
            onClick={runSequence}
            size="small"
            disabled={!seqInput.replace(/[^TtNn]/g, '')}
          >
            Run
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              onClick={() => setSeqInput(p.seq)}
              size="small"
              variant="outlined"
              clickable
            />
          ))}
        </Stack>
      </CEBlock.Section>

      {accuracy !== null ? (
        <CEBlock.Section label="Accuracy">
          <Typography variant="subtitle2" gutterBottom>
            Prediction accuracy: <strong>{accuracy.toFixed(1)}%</strong> ({correctCount}/
            {history.length} correct)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={accuracy}
            sx={{height: 12, borderRadius: 6}}
            color={accuracy >= 80 ? 'success' : accuracy >= 55 ? 'warning' : 'error'}
          />
        </CEBlock.Section>
      ) : null}

      {history.length > 0 ? (
        <CEBlock.Section label="History">
          <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 1}}>
            Green = correct prediction, red = misprediction
          </Typography>
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
            {history.map((h, i) => (
              <Tooltip
                key={i}
                title={`Step ${i + 1}: actual=${h.outcome}, predicted=${h.pred}${
                  h.state ? `, from state ${h.state}` : ''
                } → ${h.correct ? 'CORRECT' : 'MISPREDICTION'}`}
                arrow
              >
                <Chip
                  label={`${i + 1}:${h.outcome}`}
                  size="small"
                  sx={{
                    backgroundColor: h.correct ? '#4caf50' : '#f44336',
                    color: '#fff',
                    fontSize: 10,
                    height: 22,
                    cursor: 'help',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </CEBlock.Section>
      ) : null}
    </CEBlock>
  );
}
