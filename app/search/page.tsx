import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LessonSearch } from "@/components/course/LessonSearch";
import { LEARNING_AREAS } from "@/lib/learning-areas";
import { searchEntries } from "@/lib/lesson-search-index";

export const metadata: Metadata = { title: "Find a lesson | Perceptron Lab", description: "Search Perceptron Lab lessons and sections by subject." };
export default function SearchPage() {
  return <div className="mx-auto max-w-4xl px-6 py-12">
    <Link href="/#course" className="text-sm text-muted hover:text-foreground">← All learning areas</Link>
    <h1 className="mb-4 mt-7 text-3xl font-semibold">Find a lesson</h1>
    <p className="mb-7 max-w-2xl text-base leading-7 text-muted">Search for a method, a calculation, or a subject you want to work through.</p>
    <Suspense fallback={<p role="status">Loading lesson search…</p>}>
      <LessonSearch entries={searchEntries} areas={LEARNING_AREAS.map(({ id, title }) => ({ id, title }))} />
    </Suspense>
    <noscript><p>Search needs JavaScript. You can <Link href="/#course" className="text-accent underline">browse all learning areas</Link> without it.</p></noscript>
  </div>;
}
