import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { labLessonById } from "@/lib/labs";
import { WorkshopJourney } from "@/components/lab/WorkshopJourney";
import { buildById } from "@/lib/builds/catalog";
import { journeyFor } from "@/lib/builds/journey";

// Generate and cache each workshop on its first visit. Shipping a separate
// HTML/RSC snapshot for every floor adds tens of MiB to Amplify's artifact.
// Workshop controls and saved learner state still run in the browser.
export const dynamic = "force-static";
export const dynamicParams = true;
export function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson } = await params;
  const mission = Object.hasOwn(buildById, lesson) ? buildById[lesson] : undefined;
  return { title: lesson === "simple-linear-regression" ? "Predict delivery times with Botie | FitLab" : mission ? `${mission.title} | Botie's workshop | FitLab` : "Workshop | FitLab", description: mission?.challenge };
}
export default async function LabPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: id } = await params;
  if (!Object.hasOwn(buildById, id) || !Object.hasOwn(labLessonById, id)) notFound();
  const mission = buildById[id], lesson = labLessonById[id];
  if (!mission || !lesson) notFound();
  return <article className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
    <div className="mb-3 flex flex-wrap justify-between gap-3 text-sm"><Link href="/lab" className="text-muted hover:text-foreground">← All workshops</Link><Link href={lesson.href} className="text-accent underline underline-offset-4">Read {lesson.title}</Link></div>
    <header className="mb-3"><p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">{lesson.section}</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{id === "simple-linear-regression" ? "Predict delivery times with Botie" : mission.title}</h1></header>
    <WorkshopJourney data={journeyFor(id)} />
  </article>;
}
