"use client";

import dynamic from "next/dynamic";
import type { JourneyData } from "@/lib/builds/journey";
const WorkshopJourney = dynamic(() => import("./WorkshopJourney").then(m => m.WorkshopJourney), { loading: () => <p className="py-8 text-muted">Opening Botie&apos;s workshop…</p> });

export function LessonGame({ data, active }: { data: JourneyData; active: boolean }) {
  if (!active) return null;
  return <WorkshopJourney key={data.build.id} data={data} />;
}
