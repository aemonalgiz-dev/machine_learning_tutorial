import Link from "next/link";
import Image from "next/image";
import { LegacyCourseLinks } from "@/components/course/LegacyCourseLinks";
import { CURRICULUM } from "@/lib/curriculum";
import { COFFEE_URL } from "@/lib/site";
import {
  courseSectionHref,
  firstLesson,
  legacyCourseDestinations,
  lessonCount,
  lessonHrefs,
} from "@/lib/course-navigation";

// The author's description of FitLab, adapted from the Patreon introduction.
const WHAT_YOU_GET: [string, string][] = [
  [
    "History and motivation",
    "Every lesson is grounded in the history of the mathematics, the logic, and the needs of the time.",
  ],
  [
    "Charts that are real models",
    "Change the data and the model fits again, so you can test what a method does instead of taking my word for it.",
  ],
  [
    "Accessible to everyone",
    "You don't need a degree or a strong background in mathematics to make progress. The site teaches the mathematics you need.",
  ],
  [
    "Comprehensive quizzes",
    "Questions throughout each lesson, so you can feel your knowledge growing.",
  ],
  [
    "Interactive coding challenges",
    "Challenges specific to the topic at hand, with tests so you can verify your results.",
  ],
];

export default function Home() {
  const total = CURRICULUM.reduce((sum, part) => sum + lessonCount(part), 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-12 pt-6 sm:pb-20 sm:pt-8">
      <LegacyCourseLinks destinations={legacyCourseDestinations} />

      <header className="mb-12">
        <h1 className="sr-only">FitLab: Machine Learning for Everyone</h1>
        <div
          role="img"
          aria-label="FitLab. Machine Learning for Everyone. A fitted line, a matrix, and a neural network connect the ideas in the course."
          className="relative mb-8 overflow-hidden rounded-2xl border border-line bg-[#060d15] shadow-sm"
        >
          <div aria-hidden="true" className="relative hidden h-64 sm:block lg:h-[300px]">
            {/* Crop the artwork's extra left margin to center its title and diagrams together. */}
            <div className="absolute inset-y-0 right-0 w-[120%]">
              <Image
                src="/branding/fitlab-banner.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 1172px, calc(120vw - 57.6px)"
                loading="eager"
                fetchPriority="high"
                className="object-cover object-[right_40%]"
              />
            </div>
          </div>
          <div aria-hidden="true" className="relative min-h-52 sm:hidden">
            <div className="absolute inset-y-0 right-0 w-[46%] max-w-60">
              <Image
                src="/branding/fitlab-banner.png"
                alt=""
                fill
                sizes="560px"
                loading="eager"
                className="object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060d15] via-[#060d15]/20 to-transparent" />
            </div>
            <div className="relative max-w-[75%] px-6 py-9">
              <p className="text-5xl font-bold tracking-tight text-[#ffbc24]">FitLab</p>
              <p className="mt-3 max-w-48 text-base leading-6 text-[#f5eee3]">Machine Learning for Everyone</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
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
        <p className="mt-6 text-center font-mono text-xs text-muted">
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
        <h2 id="shape" className="mb-5 text-xl font-semibold text-foreground">
          Here is what you get on FitLab.
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {WHAT_YOU_GET.map(([title, detail], index) => (
            <li key={title} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
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
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
