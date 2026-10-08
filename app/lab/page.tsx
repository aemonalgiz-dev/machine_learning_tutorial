import type { Metadata } from "next";
import Link from "next/link";
import { CURRICULUM } from "@/lib/curriculum";
import { labHref } from "@/lib/labs";
import { buildById } from "@/lib/builds/catalog";
import { Botie } from "@/components/site/Botie";
import { WorkshopDirectory } from "@/components/lab/WorkshopDirectory";

export const metadata: Metadata = { title: "Botie's workshop | FitLab", description: "Work through machine learning problems with Botie. Try a solution, check what it does to the examples, and use the results to understand why the method works." };
export default function WorkshopsPage() {
  const sections = CURRICULUM.map(s => ({ title: s.title, lessons: s.topics.flatMap(t => t.concepts.flatMap(l => { if (!l.href) return []; const id = l.href.split("/").pop()!; return [{ id, title: l.title, mission: buildById[id].title, href: labHref(id) }]; })) }));
  return <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
    <Link href="/" className="text-sm text-muted hover:text-foreground">← Back to FitLab</Link>
    <header className="mb-10 mt-7 flex flex-wrap items-center gap-5 sm:flex-nowrap"><Botie size={140} /><div><p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">Work through the problems yourself</p><h1 className="text-4xl font-bold tracking-tight">Botie&apos;s workshop</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted">We will follow the problems behind machine learning with Botie, starting with the mathematics. Each lesson explains why a method was needed and what its pieces do. Then you will choose tools, connect them, and build something that solves a related problem.</p><p className="mt-3 text-sm leading-6 text-muted">Later lessons reuse those tools and introduce the next pieces. You can inspect the values moving through your construction, test different deliveries, and write the same ideas in Python.</p></div></header>
    <aside className="mb-8 rounded-2xl border border-accent-fill/40 bg-accent-soft p-5 sm:p-6"><h2 className="text-xl font-semibold">First, learn how the workshop works</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">Meet the sources, operations and connections you will use throughout the course. Botie will help you build and test a small machine before you start the mathematics lessons.</p><Link href="/lab/workshop-guide" className="mt-4 inline-block rounded-lg bg-accent-fill px-4 py-3 text-sm font-semibold text-accent-ink">Start the workshop tutorial →</Link></aside>
    <WorkshopDirectory sections={sections} />
  </div>;
}
