import Link from "next/link";
import Image from "next/image";
import { Botie } from "@/components/site/Botie";
import { LessonSearchForm } from "@/components/site/LessonSearchForm";
import { LegacyCourseLinks } from "@/components/course/LegacyCourseLinks";
import { legacyCourseDestinations } from "@/lib/course-navigation";
import { LEARNING_AREAS, learningAreaHref, learningAreaSections } from "@/lib/learning-areas";
import { JourneyResume } from "@/components/site/JourneyResume";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-12 pt-6 sm:pb-20 sm:pt-8">
      <LegacyCourseLinks destinations={legacyCourseDestinations} />
      <header className="mb-10">
        <h1 className="sr-only">FitLab: Machine Learning for Everyone</h1>
        <div role="img" aria-label="FitLab. Machine Learning for Everyone. A fitted line, a matrix, and a neural network connect the ideas in the course." className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-[#060d15] shadow-sm">
          <div aria-hidden="true" className="relative hidden h-64 sm:block lg:h-[300px]">
            {/* Crop the artwork's extra left margin to center its title and diagrams together. */}
            <div className="absolute inset-y-0 right-0 w-[120%]">
              <Image src="/branding/fitlab-banner.png" alt="" fill sizes="(min-width: 1024px) 1172px, calc(120vw - 57.6px)" loading="eager" fetchPriority="high" className="object-cover object-[right_40%]" />
            </div>
          </div>
          <div aria-hidden="true" className="relative min-h-52 sm:hidden">
            <div className="absolute inset-y-0 right-0 w-[46%] max-w-60">
              <Image src="/branding/fitlab-banner.png" alt="" fill sizes="560px" loading="eager" className="object-cover object-right" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060d15] via-[#060d15]/20 to-transparent" />
            </div>
            <div className="relative max-w-[75%] px-6 py-9">
              <p className="text-5xl font-bold tracking-tight text-[#ffbc24]">FitLab</p>
              <p className="mt-3 max-w-48 text-base leading-6 text-[#f5eee3]">Machine Learning for Everyone</p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/lab/workshop-guide" className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-accent-fill px-5 py-3 text-sm font-semibold text-accent-ink hover:brightness-110">Build your first machine with Botie <span aria-hidden="true">→</span></Link>
            <Link href="#course" className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold hover:bg-raised">Browse the lessons</Link>
          </div>
          <p className="mt-3 text-sm text-muted">All lessons and workshops are free.</p>
        </div>
      </header>

      <JourneyResume />

      <section id="course" aria-labelledby="learning-areas" className="scroll-mt-28">
        <h2 id="learning-areas" className="text-2xl font-semibold">What would you like to learn?</h2>
        <nav aria-label="Learning areas" className="mt-5">
          <ul className="space-y-3">
            {LEARNING_AREAS.map(area => (
              <li key={area.id}>
                <Link href={learningAreaHref(area)} className="group flex items-center gap-5 rounded-xl border border-line bg-surface p-5 transition hover:border-accent-fill/60 hover:bg-raised sm:p-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-accent">{area.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{area.description}</p>
                    {!learningAreaSections(area).length && <p className="mt-2 text-xs text-accent">Lessons in preparation</p>}
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-xl text-accent">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-7"><LessonSearchForm /></div>
      </section>

      <aside aria-labelledby="meet-botie" className="mt-10 flex items-start gap-4 border-t border-line pt-7 sm:items-center">
        <div className="shrink-0"><Botie size={72} /></div>
        <div>
          <h2 id="meet-botie" className="text-lg font-semibold">Have a problem you want to work through?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">There is a workshop for every lesson. Choose the topic you want to understand, build a solution with Botie, and see what happens when the example changes.</p>
          <Link href="/lab" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">Find a workshop →</Link>
        </div>
      </aside>
    </div>
  );
}
