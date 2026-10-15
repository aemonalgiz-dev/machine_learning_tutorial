"use client";
import dynamic from "next/dynamic";
import { useProgressAccount } from "@/lib/progress";
import type { JourneyData } from "@/lib/builds/journey";
import { LessonJourney } from "./LessonJourney";
const RegressionJourney = dynamic(() => import("./RegressionJourney").then(module => module.RegressionJourney));
export function WorkshopJourney({ data }: { data: JourneyData }) {
  const account = useProgressAccount();
  return data.build.id === "simple-linear-regression"
    ? <RegressionJourney key={`${data.build.id}:${account ?? "guest"}`} data={data} />
    : <LessonJourney key={`${data.build.id}:${account ?? "guest"}`} data={data} />;
}
