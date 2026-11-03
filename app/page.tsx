import type { Metadata } from "next";
import Link from "next/link";
import { LessonSearchForm } from "@/components/site/LessonSearchForm";
import { LegacyCourseLinks } from "@/components/course/LegacyCourseLinks";
import { LearningAreas } from "@/components/course/LearningMap";
import { LearningDashboard } from "@/components/site/LearningDashboard";
import { legacyCourseDestinations } from "@/lib/course-navigation";
import { SITE_ORIGIN, SITE_SOCIAL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_ORIGIN },
  openGraph: { ...SITE_SOCIAL, url: SITE_ORIGIN },
};

export default function Home() {
  return <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
    <LegacyCourseLinks destinations={legacyCourseDestinations} />
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <p className="game-eyebrow">Perceptron Lab</p>
      <Link href="/account" className="text-sm text-muted hover:text-accent">Your progress ↗</Link>
    </header>
    <LearningDashboard />
    <section id="course" aria-labelledby="learning-areas" className="mt-12 scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 id="learning-areas" className="text-2xl font-semibold">Available Courses</h2>
        <Link href="/lab" className="text-sm text-accent hover:underline">All workshops →</Link>
      </div>
      <LearningAreas />
      <div className="mt-8"><LessonSearchForm /></div>
    </section>
  </div>;
}
