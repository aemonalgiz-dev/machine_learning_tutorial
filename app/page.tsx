import Link from "next/link";
import { LegacyCourseLinks } from "@/components/course/LegacyCourseLinks";
import { SectionProgress } from "@/components/course/LessonMarks";
import { CURRICULUM } from "@/lib/curriculum";
import { COFFEE_URL } from "@/lib/site";
import {
  courseSectionHref,
  firstLesson,
  legacyCourseDestinations,
  lessonCount,
  lessonHrefs,
} from "@/lib/course-navigation";

// What a lesson is made of, in the order a reader meets it.
const SHAPE_OF_A_LESSON: [string, string][] = [
  [
    "The problem first",
    "Each lesson opens with something you would want to work out, and names the method only once you can see what it is for.",
  ],
  [
    "Poke a live example",
    "The example is recomputed as you change it, so you can see what each choice does.",
  ],
  [
    "The mechanism, then the maths",
    "Follow the calculation on a handful of numbers before the general form, with the derivation there when you want it.",
  ],
  [
    "Check yourself",
    "Questions between the parts, marked as you answer them, with the reason beside every answer.",
  ],
  [
    "Practise with the library",
    "Problems to work through in Python against the library itself, with the answers to check your own against.",
  ],
];

export default function Home() {
  const total = CURRICULUM.reduce((sum, part) => sum + lessonCount(part), 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-20">
      <LegacyCourseLinks destinations={legacyCourseDestinations} />

      <header className="mb-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Machine learning, one concept at a time
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          I built this library to work through machine learning for myself. This
          site follows the same approach: start with a problem, try a small
          example, and work out why the method behaves as it does.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={firstLesson}
            className="inline-flex items-center gap-2 rounded-md bg-accent-fill px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition hover:brightness-110"
          >
            Start with a prediction <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="#course"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-raised"
          >
            Browse the sections
          </Link>
        </div>
        <p className="mt-6 font-mono text-xs text-muted">
          {CURRICULUM.length} sections · {total} lessons · always free ·{" "}
          {COFFEE_URL ? (
            <a
              href={COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              feel free to buy me a coffee <span aria-hidden="true">↗</span>
            </a>
          ) : (
            "feel free to buy me a coffee"
          )}
        </p>
      </header>

      <section aria-labelledby="shape" className="mb-16">
        <h2 id="shape" className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted">
          How a lesson goes
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SHAPE_OF_A_LESSON.map(([title, detail], index) => (
            <li
              key={title}
              className="rounded-xl border border-line bg-surface p-4 shadow-sm"
            >
              <p className="mb-2 font-mono text-xs text-accent">0{index + 1}</p>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <nav id="course" aria-label="Course sections" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">The course</h2>
          <p className="font-mono text-xs text-muted">
            Follow the sections in order, or pick a subject to revisit.
          </p>
        </div>
        <ol className="relative ml-4 space-y-5 border-l border-line pl-8">
          {CURRICULUM.map((part, index) => {
            const lessons = lessonHrefs(part);
            return (
              <li key={part.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.45rem] top-5 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs font-semibold text-accent"
                >
                  {index + 1}
                </span>
                <Link
                  href={courseSectionHref(part)}
                  className="group block rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-accent-fill/60 hover:bg-raised"
                >
                  <p className="mb-2 font-mono text-xs text-muted">
                    Section {index + 1} · {lessons.length} lessons
                  </p>
                  <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-accent">
                    {part.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{part.intro}</p>
                  <div className="mt-4">
                    <SectionProgress lessons={lessons} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
