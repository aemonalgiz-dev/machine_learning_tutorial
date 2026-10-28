"use client";

import { useMemo } from "react";
import { useLearnerRecords } from "./learner-state";
import { validJourneyProgress, type JourneyProgress } from "./journey-progress";
import { lessonFinished, lessonStarted, useProgress, type Progress } from "./progress";

export const workshopHref = (lesson: string) => {
  const id = lesson.split("/").pop();
  return `/lab/${id === "neurons-and-activations" ? "neuron" : id}`;
};

export function lessonMilestones(progress: Progress, lesson: string, journey?: JourneyProgress) {
  const attempts = journey?.attempts ?? [];
  return {
    explored: Boolean(journey?.exploredAt),
    built: Boolean(journey?.built || attempts.some(attempt => attempt.kind === "built")),
    varied: Boolean(journey?.transferred || attempts.some(attempt => attempt.kind === "transferred")),
    exercises: lessonFinished(progress, lesson),
    started: Boolean(journey?.lastVisitedAt || lessonStarted(progress, lesson)),
  };
}

export function useLearningMap() {
  const progress = useProgress();
  const records = useLearnerRecords("journey-progress:");
  const journeys = useMemo(() => Object.fromEntries(records.flatMap(entry =>
    validJourneyProgress(entry.value) ? [[entry.value.id, entry.value]] : [])), [records]);
  return { progress, journeys, milestones: (lesson: string) => lessonMilestones(progress, lesson, journeys[lesson.split("/").pop()!]) };
}
