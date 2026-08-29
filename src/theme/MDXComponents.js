import MDXComponents from '@theme-original/MDXComponents';
import PistonRunner from '@site/src/components/PistonRunner';
import CodeExercise from '@site/src/components/CodeExercise';
import CodingExam from '@site/src/components/CodingExam';
import JournalAnswer from '@site/src/components/JournalAnswer';
import GuidedLab, {LabStep} from '@site/src/components/GuidedLab';
import YouTubeEmbed from '@site/src/components/YouTubeEmbed';
import MultipleChoice from '@site/src/components/MultipleChoice';
import YamlEditor from '@site/src/components/YamlEditor';

import ExerciseSet, {Exercise} from '@site/src/components/ExerciseSet';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import GraphChallenge from '@site/src/components/GraphChallenge';
import OutputChallenge from '@site/src/components/OutputChallenge';

export default {
    ...MDXComponents,
    PistonRunner,
    CodeExercise,
    CodingExam, // deprecated alias for CodeExercise
    JournalAnswer,
    GuidedLab,
    LabStep,
    YouTubeEmbed,
    MultipleChoice,
    YamlEditor,
    ExerciseSet,
    Exercise,
    GraphChallenge,
    OutputChallenge,
    p: TranslatableParagraph,
};
