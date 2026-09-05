import React, {useMemo, useState} from 'react';
import Box from '@site/src/components/ui/Box';
import Button from '@site/src/components/ui/Button';
import Chip from '@site/src/components/ui/Chip';
import Stack from '@site/src/components/ui/Stack';
import Typography from '@site/src/components/ui/Typography';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {pickOne, randInt} from '@site/src/components/interactive/shell/mathRandom';

const CATEGORIES = [
  {key: 'all', label: 'All'},
  {key: 'opening', label: 'Opening'},
  {key: 'situational', label: 'Tell me about a time'},
  {key: 'data', label: 'Data science'},
  {key: 'project', label: 'Project walk-through'},
  {key: 'ask', label: 'Ask the interviewer'},
];

/** Practice prompts for DS behavioral rounds (common interview patterns). */
const QUESTIONS = [
  {
    category: 'opening',
    prompt: 'Tell me about yourself.',
    tip: 'Keep it to 1–2 minutes. Cover (1) who you are, (2) how you got here with 1–2 wins, (3) why this role and company. Mirror language from the job description and company values.',
  },
  {
    category: 'opening',
    prompt: 'Why did you choose data science?',
    tip: 'Make the path intentional. Tie prior skills to DS work even if you are switching fields. Treat a non-linear background as subject-matter strength and fresh perspective, not a gap to apologize for.',
  },
  {
    category: 'situational',
    prompt: 'Tell me about a time you dealt with a setback — how did you handle it?',
    tip: 'Use STAR. Emphasize what you owned, what you changed, and what you learned. Growth mindset beats a perfect outcome.',
  },
  {
    category: 'situational',
    prompt: 'Tell me about a time you had to deal with a particularly difficult co-worker — how did you manage it?',
    tip: 'Stay professional. Show empathy, clear communication, and a focus on shared goals rather than blaming the other person.',
  },
  {
    category: 'situational',
    prompt: 'Tell me about a time you made a decision that wasn’t popular — how did you go about implementing it?',
    tip: 'Explain the trade-off, how you got buy-in (or managed dissent), and the result. Interviewers want judgment under social pressure.',
  },
  {
    category: 'situational',
    prompt: 'Tell me about a time you accomplished something in your career that made you very proud — why was that moment meaningful?',
    tip: 'Pick a story with measurable impact. Connect pride to skills or values this team cares about.',
  },
  {
    category: 'data',
    prompt: 'Tell me about a time when data helped drive a business decision.',
    tip: 'STAR with a clear stakeholder decision. Quantify the impact and name how you communicated insights to non-technical audiences.',
  },
  {
    category: 'data',
    prompt: 'Tell me about a time when the results of your analysis were very different from what you expected. Why? What did you do?',
    tip: 'Show scientific humility: you checked assumptions, dug into data quality or confounders, and updated the recommendation.',
  },
  {
    category: 'data',
    prompt: 'Tell me about a time you had to make a decision but the data you needed wasn’t available.',
    tip: 'Describe proxies, experiments, expert judgment, and how you communicated uncertainty and risk.',
  },
  {
    category: 'data',
    prompt: 'Tell me about a time you had an interesting hypothesis — how did you validate it?',
    tip: 'State the hypothesis, the test or analysis design, the result, and how it changed the product or process.',
  },
  {
    category: 'data',
    prompt: 'Tell me about a time you disagreed with a PM or engineer.',
    tip: 'Lead with data and shared goals. Show you can escalate constructively without burning trust.',
  },
  {
    category: 'data',
    prompt: 'Tell me about a time you were not satisfied with the status quo.',
    tip: 'Great for “customer obsession” / invent-and-simplify cultures. Show you challenged a default with analysis and moved a roadmap.',
  },
  {
    category: 'project',
    prompt: 'Walk me through a project: how did you collect and clean the data? What issues did you hit interpreting it?',
    tip: 'Be specific about sources, joins, missingness, and how you avoided misleading conclusions.',
  },
  {
    category: 'project',
    prompt: 'How did you decide which models or techniques to use? What did you try, and what did you ship?',
    tip: 'Discuss baselines first, then complexity trade-offs. Interviewers check that you actually did the work.',
  },
  {
    category: 'project',
    prompt: 'How did you evaluate success? Was there a baseline? Which metrics measured impact?',
    tip: 'Name offline metrics and online/business metrics. Tie evaluation to the decision the project supported.',
  },
  {
    category: 'project',
    prompt: 'Did you deploy the final solution? What challenges did you face launching it?',
    tip: 'Cover monitoring, rollout, ownership, and what broke in production — not only the notebook result.',
  },
  {
    category: 'project',
    prompt: 'What tough technical problems did you face on a project, and how did you overcome them?',
    tip: 'Pick one hard constraint (scale, latency, sparse labels, drift) and walk through your debugging loop.',
  },
  {
    category: 'project',
    prompt: 'How did you work with stakeholders and teammates to make the project successful? How did you resolve conflicts?',
    tip: 'Show communication cadence, expectation setting, and a concrete conflict resolution example.',
  },
  {
    category: 'project',
    prompt: 'If you did that project again, what would you do differently?',
    tip: 'A strong answer shows reflection without trash-talking past teammates. Name one process and one technical improvement.',
  },
  {
    category: 'ask',
    prompt: 'Ask the interviewer: How did you come into this role or company?',
    tip: 'Personal questions get people talking. Listen for values and team norms you can connect back to.',
  },
  {
    category: 'ask',
    prompt: 'Ask the interviewer: What’s the most interesting project you’ve worked on?',
    tip: 'Use their answer to show genuine curiosity and relate your experience to their work.',
  },
  {
    category: 'ask',
    prompt: 'Ask the interviewer: What do you think is the most exciting opportunity for the company or product?',
    tip: 'Signals product interest. Follow up with a thoughtful observation from your pre-interview research.',
  },
  {
    category: 'ask',
    prompt: 'Ask the interviewer: In your opinion, what are the top three challenges facing the business?',
    tip: 'Shows you think about the business, not only models. Avoid compensation or vacation questions until you have an offer.',
  },
  {
    category: 'ask',
    prompt: 'Ask the interviewer: What do you think is the hardest part of this role?',
    tip: 'Useful, but keep selling fit: react with how you’d approach that hardness.',
  },
  {
    category: 'ask',
    prompt: 'Ask the interviewer: How do you see the company values in action during day-to-day work?',
    tip: 'Culture-fit gold. Prepare stories that map to those values before the interview.',
  },
];

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function pickQuestion(pool, avoidId) {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  let next = pickOne(pool);
  let guard = 0;
  while (next.id === avoidId && guard < 8) {
    next = pickOne(pool);
    guard += 1;
  }
  return next;
}

const QUESTIONS_WITH_IDS = QUESTIONS.map((q, i) => ({...q, id: i}));

export default function BehavioralInterviewSimulator() {
  const [filter, setFilter] = useState('all');
  const [showTip, setShowTip] = useState(false);
  const [seed, setSeed] = useState(0);

  const pool = useMemo(() => {
    if (filter === 'all') return QUESTIONS_WITH_IDS;
    return QUESTIONS_WITH_IDS.filter((q) => q.category === filter);
  }, [filter]);

  const [current, setCurrent] = useState(() => pickOne(QUESTIONS_WITH_IDS));

  const nextQuestion = () => {
    const q = pickQuestion(pool, current?.id);
    if (q) {
      setCurrent(q);
      setShowTip(false);
      setSeed((s) => s + 1);
    }
  };

  const onFilter = (key) => {
    setFilter(key);
    const nextPool =
      key === 'all' ? QUESTIONS_WITH_IDS : QUESTIONS_WITH_IDS.filter((q) => q.category === key);
    const q = pickOne(nextPool);
    setCurrent(q);
    setShowTip(false);
    setSeed((s) => s + 1 + randInt(0, 3));
  };

  if (!current) return null;

  return (
    <CEBlock
      title="Behavioral question randomizer"
      subtitle="Draw a practice prompt, answer out loud under two minutes, then reveal the tip"
    >
      <Stack direction="row" spacing={1} sx={{mb: 2, flexWrap: 'wrap'}} useFlexGap>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            onClick={() => onFilter(c.key)}
            variant={filter === c.key ? 'filled' : 'outlined'}
            color={filter === c.key ? 'primary' : 'default'}
            sx={{cursor: 'pointer'}}
          />
        ))}
      </Stack>

      <CEBlock.Section label="Question">
        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 1}}>
          {categoryLabel(current.category)} · {pool.length} in this filter · draw #{seed + 1}
        </Typography>
        <Typography sx={{fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.45}}>
          {current.prompt}
        </Typography>
      </CEBlock.Section>

      <Stack direction="row" spacing={1} sx={{mt: 1, flexWrap: 'wrap'}} useFlexGap>
        <Button variant="contained" onClick={nextQuestion}>
          Next random question
        </Button>
        <Button variant="outlined" onClick={() => setShowTip((s) => !s)}>
          {showTip ? 'Hide tip' : 'Show tip'}
        </Button>
      </Stack>

      {showTip ? (
        <Box sx={{mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider'}}>
          <Typography variant="caption" color="text.secondary" sx={{fontWeight: 600, textTransform: 'uppercase'}}>
            Answer tip
          </Typography>
          <Typography sx={{mt: 0.5}}>{current.tip}</Typography>
        </Box>
      ) : null}
    </CEBlock>
  );
}
