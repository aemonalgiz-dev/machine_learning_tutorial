import type { Metadata } from "next";
import Link from "next/link";
import { Botie } from "@/components/site/Botie";

export const metadata: Metadata = { title: "About FitLab", description: "Why I built FitLab, and how the lessons help you work through the ideas yourself." };

const FEATURES = [
  ["History and motivation", "Every lesson is grounded in the history of the mathematics, the logic, and the needs of the time."],
  ["Charts that are real models", "Change the data and the model fits again, so you can test what a method does instead of taking my word for it."],
  ["Accessible to everyone", "You don't need a degree or a strong background in mathematics to make progress. The site teaches the mathematics you need."],
  ["Comprehensive quizzes", "Questions throughout each lesson, so you can feel your knowledge growing."],
  ["Interactive coding challenges", "Challenges specific to the topic at hand, with tests so you can verify your results."],
];

export default function AboutPage() {
  return <article className="mx-auto max-w-4xl px-6 py-12">
    <Link href="/" className="text-sm text-muted hover:text-foreground">← Back to FitLab</Link>
    <h1 className="mt-7 text-3xl font-semibold">Why I built FitLab</h1>
    <div className="mt-5 max-w-2xl space-y-4 text-base leading-7 text-muted">
      <p>I built this library to work through machine learning for myself. FitLab follows the same approach: start with the problem people were trying to solve, then work through why their solution makes sense.</p>
      <p>Being handed a formula and shown that it works leaves a lot unexplained. I believe the history and motivation behind these methods make them comprehensible. We will work through their pieces before putting them together, with examples you can change and calculations you can inspect.</p>
    </div>
    <section aria-labelledby="features" className="mt-10">
      <h2 id="features" className="mb-5 text-xl font-semibold">Here is what you get on FitLab.</h2>
      <ul className="grid gap-4 sm:grid-cols-2">{FEATURES.map(([title, detail]) => <li key={title} className="rounded-xl border border-line bg-surface p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{detail}</p></li>)}</ul>
    </section>
    <section aria-labelledby="botie" className="mt-10 flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-6 sm:flex-nowrap">
      <div className="shrink-0"><Botie size={100} /></div>
      <div><h2 id="botie" className="text-xl font-semibold">Build with Botie</h2><p className="mt-3 text-sm leading-7 text-muted">Botie helps you follow the pieces of a method before you build a solution yourself. In his workshop, you choose components, connect their inputs, and inspect the results. He also explains quiz answers and offers hints if you get stuck on a programming challenge.</p><Link href="/lab/workshop-guide" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">Try the workshop tutorial →</Link></div>
    </section>
    <Link href="/#course" className="mt-8 inline-flex rounded-lg bg-accent-fill px-5 py-3 text-sm font-semibold text-accent-ink">Explore the lessons →</Link>
  </article>;
}
