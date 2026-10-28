import type { Metadata } from "next";
import Link from "next/link";
import { LessonSearchForm } from "@/components/site/LessonSearchForm";
import { LegacyCourseLinks } from "@/components/course/LegacyCourseLinks";
import { LearningAreas } from "@/components/course/LearningMap";
import { LearningDashboard } from "@/components/site/LearningDashboard";
import { legacyCourseDestinations } from "@/lib/course-navigation";
import { SITE_ORIGIN, SITE_TITLE, SITE_SOCIAL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_ORIGIN },
  openGraph: { ...SITE_SOCIAL, url: SITE_ORIGIN },
};

export default function Home() {
  return <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
    <LegacyCourseLinks destinations={legacyCourseDestinations} />
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="game-eyebrow">Perceptron Lab</p><h1 className="mt-2 text-xl font-semibold">Your journey into machine learning</h1><span className="sr-only">{SITE_TITLE}</span></div>
      <Link href="/account" className="text-sm text-muted hover:text-accent">Your learning journal ↗</Link>
    </header>
    <LearningDashboard />
    <section id="course" aria-labelledby="learning-areas" className="mt-12 scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="game-eyebrow">The learning paths</p><h2 id="learning-areas" className="mt-2 text-2xl font-semibold">What would you like to learn?</h2></div>
        <Link href="/lab" className="text-sm text-accent hover:underline">All workshops →</Link>
      </div>
      <LearningAreas />
      <div className="mt-8"><LessonSearchForm /></div>
    </section>
  </div>;
}
