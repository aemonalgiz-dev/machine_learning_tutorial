// The reusable shell every concept page is poured into.
//
// A lesson is one flat run of pages, with navigation beneath the current page.
// The opening, the guided visual
// introduction and the worked example are the first of those sections rather
// than a preamble standing above them, so a reader moving to a later part is
// not made to scroll past the introduction every time.
//
// The lesson title stays above the content. The footer contains the contents
// menu and handles both page changes and neighbouring lessons.

import { ReactNode } from "react";
import { SectionNavigator, NavigableSection } from "./SectionNavigator";
import { sectionId } from "./sectionId";
import { GuidedIntuition, IntuitionConnection } from "./GuidedIntuition";
import type { LessonIntuition } from "@/lib/intuition/types";
import { presentIntuition } from "@/lib/intuition/presentation";
import type { QuizQuestion } from "@/lib/quizzes";
import type { Exercise } from "@/lib/exercises";
import { lessonHistories, type HistoryLessonId } from "@/lib/history";
import { HistoricalContext } from "./HistoricalContext";
import { journeyFor } from "@/lib/builds/journey";
import { addLessonSupplement } from './LessonSupplement';

export interface ConceptSection {
  title: string;
  id?: string;
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
  lessonId: HistoryLessonId;
  title: string;
  tagline: string;
  openingTitle: string;
  technicalStart: string;
  history?: ReactNode;
  intuition?: LessonIntuition;
  playgroundIntro: string;
  playgroundTitle: string;
  playground: ReactNode;
  sections: ConceptSection[];
  prerequisites?: ReactNode;
}

export function ConceptPage({
  lessonId,
  title,
  openingTitle,
  history,
  intuition,
  playgroundIntro,
  playgroundTitle,
  playground,
  sections: authoredSections,
  prerequisites,
}: ConceptPageProps) {
  const sections = addLessonSupplement(lessonId, authoredSections);
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
              <GuidedIntuition lesson={presentIntuition(lessonId, intuition)} />
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
    title: playgroundTitle,
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
    {
      title: lessonHistories[lessonId].title,
      id: "history",
      content: <HistoricalContext lesson={lessonHistories[lessonId]} />,
    },
    opening,
    workedExample,
    ...sections.map((section) => ({
      title: section.title,
      id: section.id ?? sectionId(section.title),
      content: section.content,
      quiz: section.quiz,
      practice: section.practice,
    })),
  ];
  const practiceAt = all.findIndex(section => section.practice?.length);
  all.splice(practiceAt < 0 ? all.length : practiceAt, 0, { title: "Build with Botie", id: "workshop", game: lessonId, journey: journeyFor(lessonId) });

  return (
    <article className="mx-auto max-w-7xl px-6 py-12">
      <header className="mx-auto mb-6 max-w-[45rem]">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      </header>

      <SectionNavigator sections={all} />
    </article>
  );
}
