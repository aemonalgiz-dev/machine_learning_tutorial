import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEARNING_AREAS, findLearningArea, learningAreaSections } from "@/lib/learning-areas";
import { courseSectionHref, lessonCount, lessonHrefs } from "@/lib/course-navigation";
import { LessonSearchForm } from "@/components/site/LessonSearchForm";
import { labHref } from "@/lib/labs";

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
  const firstLesson = sections.flatMap(lessonHrefs)[0];
  return (
    <article className="mx-auto max-w-4xl px-6 py-10 sm:py-12">
      <Link href="/#course" className="text-sm text-muted hover:text-foreground">← All learning areas</Link>
      <header className="mb-9 mt-7">
        <p className="mb-3 font-mono text-xs text-accent">Learning area</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{area.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{area.introduction}</p>
        {firstLesson && <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href={labHref(firstLesson.split("/").pop()!)} className="rounded-lg bg-accent-fill px-5 py-3 text-sm font-semibold text-accent-ink hover:brightness-110">{area.workshopStart} →</Link>
          <Link href={firstLesson} className="py-3 text-sm text-accent hover:underline">Read the first lesson</Link>
          <Link href="#sections" className="py-3 text-sm text-accent hover:underline">Browse the sections</Link>
        </div>}
        {area.id === "machine-learning" && <p className="mt-4 text-sm leading-6 text-muted">Need a calculation explained first? <Link href="/learn/mathematics-and-programming" className="text-accent underline underline-offset-4">Mathematics and Programming</Link> is there to use whenever you need it.</p>}
      </header>

      {!sections.length ? <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="preparation">
        <h2 id="preparation" className="text-xl font-semibold">Lessons in preparation</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">This area will have its own sections and lessons as they are added. There are no published lessons here yet.</p>
        <Link href="/#course" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent hover:underline">Explore the available lessons →</Link>
      </section> : <>
        <nav aria-label="Browse subjects" className="mb-8 border-y border-line py-4">
          <p className="mb-3 text-sm text-muted">Pick a subject below. You can work through its workshops with Botie or read the lessons, and move between them whenever you need an explanation.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">{area.groups.map(group => <li key={group.id}><a href={`#${group.id}`} className="text-accent hover:underline">{group.title}</a></li>)}</ul>
        </nav>
        <div id="sections" className="space-y-9 scroll-mt-28">
          {area.groups.map(group => <section id={group.id} key={group.id} className="scroll-mt-28" aria-labelledby={`${group.id}-title`}>
            <h2 id={`${group.id}-title`} className="mb-4 text-xl font-semibold">{group.title}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {group.sections.map(title => {
                const section = sections.find(section => section.title === title)!;
                return <li key={title}><Link href={courseSectionHref(section)} className="group flex items-start gap-4 px-5 py-5 hover:bg-raised">
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold group-hover:text-accent">{title}</span>
                    <span className="mt-2 block text-sm leading-6 text-muted">{section.intro}</span>
                    <span className="mt-3 block font-mono text-xs text-muted">{lessonCount(section)} lessons</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-accent">→</span>
                </Link></li>;
              })}
            </ul>
          </section>)}
        </div>
        <div className="mt-10 border-t border-line pt-6"><LessonSearchForm /></div>
      </>}
    </article>
  );
}
