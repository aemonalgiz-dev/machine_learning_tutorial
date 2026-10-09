import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { expandedLessons, expandedLessonById } from "@/lib/lessons";
import { ExpandedLessonPage } from "@/components/concept/ExpandedLessonPage";

export const dynamicParams = false;
export function generateStaticParams() { return expandedLessons.map(lesson => ({ lesson: lesson.id })); }
export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson } = await params;
  const page = Object.hasOwn(expandedLessonById, lesson) ? expandedLessonById[lesson] : undefined;
  return page ? { title: `${page.title} · FitLab`, description: page.blurb } : {};
}
export default async function Page({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!Object.hasOwn(expandedLessonById, lesson)) notFound();
  return <ExpandedLessonPage id={lesson} />;
}
