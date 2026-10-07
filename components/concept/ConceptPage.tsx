// The reusable shell every concept page is poured into.
//
// A lesson is one flat run of sections, shown one at a time, with the arrows
// and the section list at the top of the page. The opening, the guided visual
// introduction and the worked example are the first of those sections rather
// than a preamble standing above them, so a reader moving to a later part is
// not made to scroll past the introduction every time.
//
// The separate lesson-navigation panel is gone with it. It offered a link to
// the opening, a link to the mechanism and a collapsed list of every section,
// and the section list at the top of the page now answers all three.

import { ReactNode } from "react";
import { SectionNavigator, NavigableSection } from "./SectionNavigator";
import { sectionId } from "./sectionId";
import { GuidedIntuition, IntuitionConnection } from "./GuidedIntuition";
import type { LessonIntuition } from "@/lib/intuition/types";
import type { QuizQuestion } from "@/lib/quizzes";
import type { Exercise } from "@/lib/exercises";

export interface ConceptSection {
  title: string;
  // A section holds prose, or a quiz, or a set of problems. A quiz section
  // supplies questions and no content and sits in the section list beside the
  // parts it draws on; a practice section supplies problems to work through
  // with the library. See lib/quizzes.ts and lib/exercises.ts for when each
  // earns a place.
  content?: ReactNode;
  defaultOpen?: boolean;
  quiz?: QuizQuestion[];
  practice?: Exercise[];
}

interface ConceptPageProps {
  title: string;
  tagline: string;
  openingTitle: string;
  technicalStart: string;
  history?: ReactNode;
  intuition?: LessonIntuition;
  playgroundIntro: string;
  playground: ReactNode;
  sections: ConceptSection[];
  prerequisites?: ReactNode;
}

// What a lesson holds, for the line under its title.
export function lessonSummary(sections: { quiz?: QuizQuestion[]; practice?: Exercise[] }[]) {
  const questions = sections.reduce((sum, section) => sum + (section.quiz?.length ?? 0), 0);
  const problems = sections.reduce((sum, section) => sum + (section.practice?.length ?? 0), 0);
  return { questions, problems };
}

export function LessonMeta({
  parts,
  questions,
  problems,
}: {
  parts: number;
  questions: number;
  problems: number;
}) {
  const pieces = [
    `${parts} ${parts === 1 ? "section" : "sections"}`,
    questions > 0 ? `${questions} ${questions === 1 ? "question" : "questions"}` : null,
    problems > 0 ? `${problems} ${problems === 1 ? "problem" : "problems"} to work through` : null,
  ].filter((piece): piece is string => piece !== null);
  return <p className="mt-4 font-mono text-xs text-muted">{pieces.join(" · ")}</p>;
}

export function ConceptPage({
  title,
  tagline,
  openingTitle,
  history,
  intuition,
  playgroundIntro,
  playground,
  sections,
  prerequisites,
}: ConceptPageProps) {
  const opening: NavigableSection = {
    title: openingTitle,
    id: sectionId(openingTitle),
    content: (
      <>
        {intuition
          ? intuition.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          : history}

        {intuition && (
          <>
            <div className="my-8" aria-label="Guided visual introduction">
              <GuidedIntuition lesson={intuition} />
            </div>
            <IntuitionConnection lesson={intuition} />
          </>
        )}

        {prerequisites && (
          <aside className="mt-8 rounded-lg border border-line bg-surface px-5 py-4 text-sm text-muted">
            <span className="font-semibold text-foreground">Before this: </span>
            {prerequisites}
          </aside>
        )}
      </>
    ),
  };

  // The worked example keeps the id it had as a details element, so links
  // written against "full-example" still reach it.
  const workedExample: NavigableSection = {
    title: intuition ? "Explore the full example" : "Try it with the example",
    id: "full-example",
    content: (
      <>
        <p>{playgroundIntro}</p>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {playground}
        </div>
      </>
    ),
  };

  const all: NavigableSection[] = [
    opening,
    workedExample,
    ...sections.map((section) => ({
      title: section.title,
      id: sectionId(section.title),
      content: section.content,
      quiz: section.quiz,
      practice: section.practice,
    })),
  ];
  const { questions, problems } = lessonSummary(sections);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-muted">{tagline}</p>
        <LessonMeta parts={all.length} questions={questions} problems={problems} />
      </header>

      <SectionNavigator sections={all} />
    </article>
  );
}
