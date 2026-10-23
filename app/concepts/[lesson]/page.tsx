import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { expandedLessonById } from "@/lib/lessons";
import { ExpandedLessonPage } from "@/components/concept/ExpandedLessonPage";

// Cache authored lessons when first requested, as we do for their workshops.
// The source stays in the deployment; hundreds of duplicate HTML/RSC snapshots
// no longer grow the Amplify artifact each time we publish another section.
export const dynamic = "force-static";
export const dynamicParams = true;
export function generateStaticParams() { return []; }
export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson } = await params;
  const page = Object.hasOwn(expandedLessonById, lesson) ? expandedLessonById[lesson] : undefined;
  return page ? { title: `${page.title} · Perceptron Lab`, description: page.blurb } : {};
}
export default async function Page({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!Object.hasOwn(expandedLessonById, lesson)) notFound();
  return <ExpandedLessonPage id={lesson} />;
}
