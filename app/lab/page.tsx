import type { Metadata } from "next";
import Link from "next/link";
import { CURRICULUM } from "@/lib/curriculum";
import { labHref } from "@/lib/labs";
import { buildById } from "@/lib/builds/catalog";
import { Botie } from "@/components/site/Botie";
import { WorkshopDirectory } from "@/components/lab/WorkshopDirectory";
import { JourneyResume } from "@/components/site/JourneyResume";

export const metadata: Metadata = { title: "Botie's workshop | FitLab", description: "Work through machine learning problems with Botie. Try a solution, check what it does to the examples, and use the results to understand why the method works." };
export default function WorkshopsPage() {
  const sections = CURRICULUM.map(s => ({ title: s.title, lessons: s.topics.flatMap(t => t.concepts.flatMap(l => { if (!l.href) return []; const id = l.href.split("/").pop()!; const build = buildById[id]; return [{ id, title: l.title, mission: id === "simple-linear-regression" ? "Predict delivery times with Botie" : build.title, href: labHref(id), draftVersion: build.draftVersion, cases: build.cases.length }]; })) }));
  const guide = buildById["workshop-guide"];
  return <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
    <Link href="/" className="text-sm text-muted hover:text-foreground">← Back to FitLab</Link>
    <header className="mb-8 mt-7 flex flex-wrap items-center gap-5 sm:flex-nowrap"><Botie size={112} /><div><p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">Work through the problems yourself</p><h1 className="text-4xl font-bold tracking-tight">Botie&apos;s workshop</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted">How would you turn the information in a problem into an answer? Choose a workshop and build the calculation with Botie. Follow the values through the pieces you connect, then find out whether your construction still works when the data changes.</p><p className="mt-3 text-sm leading-6 text-muted">The explanation and coding exercises are there whenever you need them. Every workshop is open, so you can return to an earlier idea or investigate a new one.</p></div></header>
    <JourneyResume introWhenNew />
    <WorkshopDirectory sections={[{ title: "Getting started", lessons: [{ id: guide.id, title: "Workshop tutorial", mission: guide.title, href: "/lab/workshop-guide", draftVersion: guide.draftVersion, cases: guide.cases.length }] }, ...sections]} />
  </div>;
}
