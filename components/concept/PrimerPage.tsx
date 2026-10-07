// A longer-form shell for the foundation-maths primers.
//
// The concept pages fit one idea into a compact history / plain / technical
// layout around a single widget. A primer covers more ground, what a thing is,
// how it behaves, where it breaks and why the models need it, and cramming that
// into two columns leaves no room to read. So a primer is a title and a run of
// full-width sections, each holding one idea, with the widget dropped into
// whichever section introduces it.
//
// Those sections are shown one at a time through the same navigator the concept
// pages use, so the arrows and the section list behave identically whichever
// kind of page a reader is on.

import { Children, isValidElement, ReactNode } from "react";
import { SectionNavigator, NavigableSection } from "./SectionNavigator";
import { sectionId } from "./sectionId";
import { LessonMeta, lessonSummary } from "./ConceptPage";
import type { QuizQuestion } from "@/lib/quizzes";
import type { Exercise } from "@/lib/exercises";
export { Equation } from "./Equation";

interface PrimerSectionProps {
  title: string;
  children: ReactNode;
}

interface PrimerQuizProps {
  title: string;
  questions: QuizQuestion[];
}

interface PrimerPracticeProps {
  title: string;
  exercises: Exercise[];
}

type PrimerChild = React.ReactElement<PrimerSectionProps | PrimerQuizProps | PrimerPracticeProps>;

export function PrimerPage({
  title,
  tagline,
  prerequisites,
  children,
}: {
  title: string;
  tagline: string;
  technicalStart: string;
  prerequisites?: ReactNode;
  children: ReactNode;
}) {
  // The body of each PrimerSection is taken rather than the element itself,
  // because the navigator renders the heading. Rendering the section too would
  // print its title twice. A PrimerQuiz and a PrimerPractice are read the same
  // way and become sections carrying questions or problems instead of prose,
  // so a primer can put either between two parts exactly as a lesson does.
  const declared = Children.toArray(children).filter(
    (child): child is PrimerChild =>
      isValidElement(child) &&
      (child.type === PrimerSection || child.type === PrimerQuiz || child.type === PrimerPractice),
  );

  // Which entry carries the prerequisites, found up front rather than by
  // counting as the map runs. A counter mutated during render is reassigned
  // after the render completes, which React 19 rejects outright.
  const opening = declared.findIndex((child) => child.type === PrimerSection);

  const sections: NavigableSection[] = declared.map((child, index) => {
    if (child.type === PrimerQuiz) {
      const { title, questions } = child.props as PrimerQuizProps;
      return { title, id: sectionId(title), quiz: questions };
    }
    if (child.type === PrimerPractice) {
      const { title, exercises } = child.props as PrimerPracticeProps;
      return { title, id: sectionId(title), practice: exercises };
    }

    const { title, children: body } = child.props as PrimerSectionProps;
    const first = index === opening;
    return {
      title,
      id: sectionId(title),
      content:
        first && prerequisites ? (
          <>
            {body}
            <aside className="mt-8 rounded-lg border border-line bg-surface px-5 py-4 text-sm text-muted">
              <span className="font-semibold text-foreground">Before this: </span>
              {prerequisites}
            </aside>
          </>
        ) : (
          body
        ),
    };
  });
  const { questions, problems } = lessonSummary(sections);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-muted">{tagline}</p>
        <LessonMeta parts={sections.length} questions={questions} problems={problems} />
      </header>

      <SectionNavigator sections={sections} />
    </article>
  );
}

// Declares a quiz as a section of a primer, placed among the PrimerSections in
// the order a reader meets them. Like PrimerSection, its props are read by
// PrimerPage rather than rendered here.
export function PrimerQuiz({ title, questions }: PrimerQuizProps) {
  return (
    <section id={sectionId(title)} data-questions={questions.length} tabIndex={-1}>
      <h2 className="mb-3 text-2xl font-semibold text-foreground">{title}</h2>
    </section>
  );
}

// Declares a set of problems as a section of a primer, read the same way.
export function PrimerPractice({ title, exercises }: PrimerPracticeProps) {
  return (
    <section id={sectionId(title)} data-problems={exercises.length} tabIndex={-1}>
      <h2 className="mb-3 text-2xl font-semibold text-foreground">{title}</h2>
    </section>
  );
}

// Declares one section of a primer. Its props are read by PrimerPage rather
// than rendered here, so that the navigator owns the heading and the spacing.
export function PrimerSection({ title, children }: PrimerSectionProps) {
  return (
    <section id={sectionId(title)} tabIndex={-1} className="scroll-mt-6">
      <h2 className="mb-3 text-2xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-4 text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

// The widget in its own framed box, the same treatment the concept pages give
// their playground.
export function PrimerPlayground({ children }: { children: ReactNode }) {
  return (
    <div className="my-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  );
}
