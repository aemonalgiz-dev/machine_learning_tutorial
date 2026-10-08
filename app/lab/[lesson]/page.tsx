import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { labLessonById, labLessons } from "@/lib/labs";
import { WorkshopJourney } from "@/components/lab/WorkshopJourney";
import { buildById } from "@/lib/builds/catalog";
import { journeyFor } from "@/lib/builds/journey";

export function generateStaticParams() { return labLessons.filter(l => l.id !== "neurons-and-activations").map(l => ({ lesson: l.id })); }
export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson } = await params;
  const mission = buildById[lesson];
  return { title: mission ? `${mission.title} | Botie's workshop | FitLab` : "Workshop | FitLab", description: mission?.challenge };
}
export default async function LabPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: id } = await params;
  if (id === "neurons-and-activations") redirect("/lab/neuron");
  const mission = buildById[id], lesson = labLessonById[id];
  if (!mission || !lesson) notFound();
  return <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
    <div className="mb-6 flex flex-wrap justify-between gap-3 text-sm"><Link href="/lab" className="text-muted hover:text-foreground">← All workshops</Link><Link href={lesson.href} className="text-accent underline underline-offset-4">Read {lesson.title}</Link></div>
    <header className="mb-7"><p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">{lesson.section}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{mission.title}</h1><p className="mt-3 text-muted">A journey through {lesson.title.toLowerCase()} with Botie.</p></header>
    <WorkshopJourney data={journeyFor(id)} />
  </article>;
}
