import MDXComponents from '@theme-original/MDXComponents';
import PistonRunner from '@site/src/components/PistonRunner';
import CodeExercise from '@site/src/components/CodeExercise';
import CodingExam from '@site/src/components/CodingExam';
import JournalAnswer from '@site/src/components/JournalAnswer';
import GuidedLab, {LabStep} from '@site/src/components/GuidedLab';
import YouTubeEmbed from '@site/src/components/YouTubeEmbed';
import MultipleChoice from '@site/src/components/MultipleChoice';

import ExerciseSet, {Exercise} from '@site/src/components/ExerciseSet';

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
    ExerciseSet,
    Exercise,
};
