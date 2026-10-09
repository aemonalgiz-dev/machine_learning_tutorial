import type { Build } from "../builds/engine";
import type { Exercise } from "../exercises";
import type { LessonHistory } from "../history/types";
import type { QuizQuestion } from "../quizzes";
import type { ExpandedLessonId } from "./ids";
import type { Scene } from "../intuition/types";

export interface ExpandedLesson {
  id: ExpandedLessonId;
  title: string;
  section: string;
  topic: string;
  blurb: string;
  openingTitle: string;
  opening: string[];
  prerequisites: { title: string; href: string }[];
  appliedIn?: { title: string; href: string }[];
  history: LessonHistory;
  intuition: { title: string; explanation: string; rows: [string, string[]][]; scene?: Scene }[];
  parts: {
    title: string;
    paragraphs: string[];
    calculation?: string;
    interpretation: string[];
    examples?: {
      title: string;
      paragraphs: string[];
      code: string;
      output: string;
      interpretation: string[];
    }[];
  }[];
  quiz: QuizQuestion[];
  practice: Exercise[];
  build: Omit<Build, "id">;
}
