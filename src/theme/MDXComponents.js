import MDXComponents from '@theme-original/MDXComponents';
import JournalAnswer from '@site/src/components/JournalAnswer';
import GuidedLab, {LabStep} from '@site/src/components/GuidedLab';
import YouTubeEmbed from '@site/src/components/YouTubeEmbed';
import MultipleChoice from '@site/src/components/MultipleChoice';
import NumericQuiz from '@site/src/components/NumericQuiz';
import NumericProblemSet, {NumericProblem} from '@site/src/components/NumericProblemSet';
import ExerciseSet, {Exercise} from '@site/src/components/ExerciseSet';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import {lazyMdxComponent} from '@site/src/components/lazyMdxComponent';
import {lazySimulators} from '@site/src/components/interactive/lazySimulators';

const PistonRunner = lazyMdxComponent(() => import('@site/src/components/PistonRunner'));
const CodeExercise = lazyMdxComponent(() => import('@site/src/components/CodeExercise'));
const YamlEditor = lazyMdxComponent(() => import('@site/src/components/YamlEditor'));
const GraphChallenge = lazyMdxComponent(() => import('@site/src/components/GraphChallenge'));
const OutputChallenge = lazyMdxComponent(() => import('@site/src/components/OutputChallenge'));
const ChartChallenge = lazyMdxComponent(() => import('@site/src/components/ChartChallenge'));

export default {
    ...MDXComponents,
    ...lazySimulators,
    PistonRunner,
    CodeExercise,
    CodingExam: CodeExercise,
    JournalAnswer,
    GuidedLab,
    LabStep,
    YouTubeEmbed,
    MultipleChoice,
    NumericQuiz,
    NumericProblemSet,
    NumericProblem,
    YamlEditor,
    ExerciseSet,
    Exercise,
    GraphChallenge,
    OutputChallenge,
    ChartChallenge,
    p: TranslatableParagraph,
};
