import type { Build } from "../builds/engine";
import type { Exercise, SqlTable } from "../exercises";
import type { LessonHistory } from "../history/types";
import type { QuizQuestion } from "../quizzes";
import type { ExpandedLessonId } from "./ids";
import type { Scene } from "../intuition/types";

export interface FrameworkReference {
  title: string;
  description: string[];
  language: "python" | "yaml" | "json" | "bash" | "sql" | "cypher" | "sparql";
  code: string;
  setup: string[];
  interpretation: string[];
  source: { title: string; url: string };
  checkedOn: string;
}

export interface ExpandedLesson {
  id: ExpandedLessonId;
  title: string;
  section: string;
  topic: string;
  blurb: string;
  openingTitle: string;
  opening: string[];
  technicalStart?: string;
  reading: {
    experimentTitle: string;
    experimentIntro: string;
    connectionTitle: string;
    practiceTitle: string;
    outputLabel: string;
    exampleNote: string;
  };
  prerequisites: { title: string; href: string }[];
  appliedIn?: { title: string; href: string }[];
  history: LessonHistory;
  intuition: { title: string; explanation: string; rows: [string, string[]][]; scene?: Scene }[];
  parts: {
    title: string;
    id?: string;
    paragraphs: string[];
    calculation?: string;
    interpretation: string[];
    references?: FrameworkReference[];
    examples?: {
      language?: "python" | "sql";
      setup?: string;
      tables?: SqlTable[];
      resultTable?: SqlTable;
      title: string;
      paragraphs: string[];
      code: string;
      output: string;
      interpretation: string[];
    }[];
  }[];
  quiz: QuizQuestion[];
  quizId?: string;
  checkpoints?: { after: string; title: string; id?: string; questions: QuizQuestion[] }[];
  practice: Exercise[];
  build: Omit<Build, "id">;
}
