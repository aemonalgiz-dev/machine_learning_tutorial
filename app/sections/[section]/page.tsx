import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonTrailCard, PathProgress } from "@/components/course/LearningMap";
import { CURRICULUM } from "@/lib/curriculum";
import { learningAreaForSection, learningAreaHref, learningAreaSections } from "@/lib/learning-areas";
import {
  courseSectionHref,
  courseSectionId,
  courseTopicId,
  findCourseSection,
  lessonHrefs,
  standsAlone,
} from "@/lib/course-navigation";

type Props = { params: Promise<{ section: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  // Published curriculum entries supply section routes, including new paths.
  return CURRICULUM.map((part) => ({ section: courseSectionId(part) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const part = findCourseSection((await params).section);
  if (!part) notFound();
  return { title: `${part.title} · Perceptron Lab`, description: part.intro };
}

export default async function CourseSectionPage({ params }: Props) {
  const part = findCourseSection((await params).section);
  if (!part) notFound();
  const area = learningAreaForSection(part);
  if (!area) notFound();
  const sections = learningAreaSections(area);
  const index = sections.indexOf(part);
  const previous = sections[index - 1];
  const next = sections[index + 1];
  const showTopics = !standsAlone(part, part.topics[0]);
  const lessons = lessonHrefs(part);

  // Lessons are numbered through the whole section, across its topics, so the
  // numbers here match the "lesson 3 of 7" shown above each lesson.
  const numberOf = new Map(lessons.map((href, at) => [href, at + 1]));

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <nav aria-label="Course location" className="mb-8 font-mono text-xs text-muted">
        <Link href={learningAreaHref(area)} className="transition hover:text-foreground">
          ← {area.title}
        </Link>
      </nav>
      <header id={courseSectionId(part)} className="mb-10 scroll-mt-8">
        <PathProgress lessons={lessons} variant="header" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{part.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{part.intro}</p>
      </header>

      {showTopics && (
        <nav
          aria-label="Topics in this section"
          className="mb-10 rounded-xl border border-line bg-surface p-5 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">In this section</h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {part.topics.map((topic) => (
              <li key={topic.heading}>
                <a
                  href={`#${courseTopicId(topic)}`}
                  className="block text-sm text-accent underline-offset-4 hover:underline"
                >
                  {topic.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-12">
        {part.topics.map((topic) => (
          <section
            key={topic.heading}
            id={showTopics ? courseTopicId(topic) : undefined}
            className="scroll-mt-8"
          >
            {showTopics && (
              <header className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{topic.heading}</h2>
                {topic.blurb && <p className="mt-2 max-w-2xl text-muted">{topic.blurb}</p>}
              </header>
            )}
            <ol className="lesson-trail">
              {topic.concepts.map((concept) => {
                if (!concept.href) {
                  return (
                    <li key={concept.title}>
                      <div className="rounded-xl border border-dashed border-line p-5">
                        <h3 className="font-semibold text-muted">
                          {concept.title}{" "}
                          <span className="ml-2 font-mono text-xs font-normal">coming soon</span>
                        </h3>
                        <p className="mt-2 text-sm text-muted">{concept.blurb}</p>
                      </div>
                    </li>
                  );
                }
                const numbered = numberOf.get(concept.href) ?? 0;
                return (
                  <li key={concept.title}>
                    <LessonTrailCard href={concept.href} title={concept.title} description={concept.blurb} number={numbered} />
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <nav
        aria-label="Adjacent course sections"
        className="mt-12 grid gap-5 border-t border-line pt-6 sm:grid-cols-2"
      >
        {previous ? (
          <Link href={courseSectionHref(previous)} className="text-sm text-accent hover:underline">
            <span className="mb-1 block font-mono text-xs text-muted">Previous section</span>← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={courseSectionHref(next)}
            className="text-sm text-accent hover:underline sm:text-right"
          >
            <span className="mb-1 block font-mono text-xs text-muted">Next section</span>
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}
