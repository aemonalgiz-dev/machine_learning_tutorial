import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEARNING_AREAS, findLearningArea, learningAreaSections } from "@/lib/learning-areas";
import { courseSectionHref, lessonCount, lessonHrefs } from "@/lib/course-navigation";
import { LessonSearchForm } from "@/components/site/LessonSearchForm";
import { PathProgress } from "@/components/course/LearningMap";

type Props = { params: Promise<{ area: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return LEARNING_AREAS.map(area => ({ area: area.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = findLearningArea((await params).area);
  if (!area) notFound();
  return { title: `${area.title} | Perceptron Lab`, description: area.description };
}

export default async function LearningAreaPage({ params }: Props) {
  const area = findLearningArea((await params).area);
  if (!area) notFound();
  const sections = learningAreaSections(area);
  return (
    <article className="mx-auto max-w-4xl px-6 py-10 sm:py-12">
      <Link href="/#course" className="text-sm text-muted hover:text-foreground">← All learning areas</Link>
      <header className="mb-9 mt-7">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{area.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{area.description}</p>
      </header>

      {!sections.length ? <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="preparation">
        <h2 id="preparation" className="text-xl font-semibold">Lessons in preparation</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">This area will have its own sections and lessons as they are added. There are no published lessons here yet.</p>
        <Link href="/#course" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent hover:underline">Explore the available lessons →</Link>
      </section> : <>
        <div id="sections" className="space-y-9 scroll-mt-28">
          {area.groups.map(group => {
            const showGroupHeading = area.groups.length > 1 && group.sections.length > 1;
            const Heading = showGroupHeading ? "h3" : "h2";
            return <section id={group.id} key={group.id} className="scroll-mt-28" aria-label={group.title}>
            {showGroupHeading && <h2 className="mb-4 text-xl font-semibold">{group.title}</h2>}
            <ul className="space-y-5">
              {group.sections.map(title => {
                const section = sections.find(section => section.title === title)!;
                return <li key={title} className="journal-panel overflow-hidden"><Link href={courseSectionHref(section)} aria-label={title} className="group flex items-start gap-4 px-5 py-5 hover:bg-raised">
                  <span className="area-emblem" aria-hidden="true">{String(sections.indexOf(section) + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <Heading className="text-lg font-semibold group-hover:text-accent">{title}</Heading>
                    <span className="mt-2 block text-sm leading-6 text-muted">{section.intro}</span>
                    <span className="mt-3 block font-mono text-xs text-muted">{lessonCount(section)} lessons</span>
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-accent">→</span>
                </Link><PathProgress lessons={lessonHrefs(section)} compact /></li>;
              })}
            </ul>
          </section>;
          })}
        </div>
        <div className="mt-10 border-t border-line pt-6"><LessonSearchForm /></div>
      </>}
    </article>
  );
}
