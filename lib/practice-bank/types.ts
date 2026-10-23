import type { QuizQuestion } from "../quizzes";
import type { Exercise } from "../exercises";
import type { Build } from "../builds/engine";
export type PracticeMode = "quiz" | "code" | "workshop";
export interface PracticeFamily {
    id: string;
    title: string;
    group: string;
    lesson: string;
    intro: string;
    variants: number;
    language: "python" | "sql";
}
export interface PracticeCatalog {
    version: number;
    variants: number;
    total: number;
    families: PracticeFamily[];
}
export interface PracticeActivity {
    id: string;
    family: PracticeFamily;
    variant: number;
    mode: PracticeMode;
    quiz?: QuizQuestion[];
    exercise?: Exercise;
    build?: Build;
}
