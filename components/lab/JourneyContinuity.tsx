"use client";

import Link from "next/link";
import { useMemo } from "react";
import { fingerprint, useLearnerRecord, useLearnerRecords, type SavedRecord } from "@/lib/learner-state";
import { journeyStatus, newJourneyProgress, savedWorkshopStatus, useJourneySnapshot, validJourneyProgress, type JourneyProgress } from "@/lib/journey-progress";
import { carryConstruction } from "@/lib/builds/journey-reuse";
import type { JourneyConnection } from "@/lib/builds/journey";
import type { Build, Construction } from "@/lib/builds/engine";
import { workshopRecordKey } from "@/lib/builds/workshop-session";
import type { BuildWorkshopProps } from "./BuildWorkshop";
import { stageAssistance, type JourneyAssistance } from "@/lib/builds/journey-attempts";

export const constructionVersion = (build: Build) => fingerprint({ recipe: build.recipe, cases: build.cases });
export const journeyPathKey = (build: Build) => `journey-path:${build.id}:${constructionVersion(build)}:v1`;
export const journeyDraftId = (build: Build, part: string, caseIndex: number) => `journey-${build.id}-${constructionVersion(build)}-${part}${caseIndex === build.cases.length - 1 ? "" : `-case-${caseIndex}`}`;

interface EarlierMemory extends JourneyAssistance { graph: Construction | null; built: boolean; explanation: string }
interface EarlierDraft { graph: Construction | null; results: Record<string, boolean>; hintsShown: number; example: boolean; carriedSupport?: boolean }
const memory = (): EarlierMemory => ({ graph: null, built: false, supported: false, explanation: "" });
const draft = (): EarlierDraft => ({ graph: null, results: {}, hintsShown: 0, example: false });

/** Retained for the historical regression reference panel's fixed connections. */
export function useEarlierWork(connection?: JourneyConnection) {
  const build = connection?.build;
  const id = connection?.lessonId ?? "unstarted";
  const version = build ? constructionVersion(build) : "none";
  const progress = useJourneySnapshot(id, connection?.title ?? "", connection?.href ?? "/lab/workshop-guide");
  const current = useLearnerRecord(build ? journeyPathKey(build) : "journey-path:unstarted", memory).value;
  const legacy = useLearnerRecord(`journey-flow:${id}:${version}`, memory).value;
  const construction = useLearnerRecord(build ? workshopRecordKey(build, journeyDraftId(build, "construction", connection!.caseIndex)) : "workshop:unstarted", draft).value;
  const original = useLearnerRecord(build ? workshopRecordKey(build) : "workshop:unstarted-original", draft).value;
  return earlierWork(connection, progress, current, legacy, construction, original);
}

function earlierWork(connection: JourneyConnection | undefined, progress: JourneyProgress, current: EarlierMemory, legacy: EarlierMemory, construction: EarlierDraft, original: EarlierDraft) {
  const build = connection?.build;
  const tested = (record: EarlierDraft, count: number) => record.graph && Array.from({ length: count }, (_, i) => record.results[i] === true).every(Boolean);
  // A currently edited draft takes precedence over an older successful snapshot.
  const candidate = construction.graph ? (build && tested(construction, build.cases.length - 1) ? construction.graph : undefined)
    : current.graph ? (current.built ? current.graph : undefined)
    : legacy.graph ? (legacy.built ? legacy.graph : undefined)
    : build && tested(original, build.cases.length) ? original.graph : undefined;
  const graph = connection?.reuse && candidate ? carryConstruction(candidate, connection.build, connection.reuse) : undefined;
  // Attribute help to the pieces being carried, rather than every older draft.
  const supported = construction.graph
    ? Boolean(construction.example || construction.hintsShown || construction.carriedSupport || stageAssistance(current, "construction", legacy.supported))
    : current.graph ? stageAssistance(current, "construction", legacy.supported)
    : legacy.graph ? legacy.supported : Boolean(original.example || original.hintsShown || original.carriedSupport);
  const reusable: NonNullable<BuildWorkshopProps["reusable"]>[number] | undefined = graph && connection ? { title: connection.skill, graph, supported } : undefined;
  const note = current.explanation || legacy.explanation;
  const savedStatus = build ? savedWorkshopStatus(construction, build.cases.length - 1) ?? savedWorkshopStatus(original, build.cases.length) : null;
  const fallbackStatus = savedStatus ?? (current.graph || legacy.graph ? "Earlier construction saved" : note ? "Earlier notes saved" : null);
  return { connection, progress, note, reusable, fallbackStatus };
}

function isMemory(value: unknown): value is EarlierMemory {
  if (!value || typeof value !== "object") return false;
  const record = value as EarlierMemory;
  return "graph" in record && typeof record.built === "boolean" && typeof record.supported === "boolean" && typeof record.explanation === "string";
}

function isDraft(value: unknown): value is EarlierDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as EarlierDraft;
  return "graph" in record && !!record.results && typeof record.results === "object" && !Array.isArray(record.results) &&
    typeof record.hintsShown === "number" && Number.isFinite(record.hintsShown) && typeof record.example === "boolean";
}

/** Read the existing keys for every authored connection without creating saves. */
export function earlierWorkFromRecords(connections: JourneyConnection[], records: Pick<SavedRecord, "key" | "value">[]) {
  const values = new Map(records.map(record => [record.key, record.value]));
  return connections.map(connection => {
    const { build, lessonId: id } = connection;
    const current = values.get(journeyPathKey(build)), legacy = values.get(`journey-flow:${id}:${constructionVersion(build)}`);
    const construction = values.get(workshopRecordKey(build, journeyDraftId(build, "construction", connection.caseIndex)));
    const original = values.get(workshopRecordKey(build));
    const progress = values.get(`journey-progress:${id}:v1`);
    return earlierWork(connection,
      validJourneyProgress(progress) && progress.id === id ? progress : newJourneyProgress(id, connection.title, connection.href),
      isMemory(current) ? current : memory(), isMemory(legacy) ? legacy : memory(),
      isDraft(construction) ? construction : draft(), isDraft(original) ? original : draft());
  });
}

/** Two fixed read-only subscriptions can serve any number of prerequisites. */
export function useEarlierWorks(connections: JourneyConnection[]) {
  const journeys = useLearnerRecords("journey-");
  const workshops = useLearnerRecords("workshop:");
  return useMemo(() => earlierWorkFromRecords(connections, [...journeys, ...workshops]), [connections, journeys, workshops]);
}

export function JourneyContinuity({ work, reuseDestination = "this construction" }: { work: ReturnType<typeof useEarlierWork>[]; reuseDestination?: string }) {
  const relevant = work.filter(item => item.connection);
  if (!relevant.length) return null;
  return <details className="mb-5 rounded-xl border border-line bg-surface p-4" data-testid="journey-connections">
    <summary className="cursor-pointer text-sm font-semibold">What carries over from your earlier work?</summary>
    <div className="mt-4 space-y-5">{relevant.map(({ connection, progress, note, reusable, fallbackStatus }) => {
      const status = journeyStatus(progress);
      return <div key={connection!.lessonId}>
        <h3 className="font-semibold">{connection!.skill}</h3>
        <p className="mt-2 text-sm leading-7 text-muted">{connection!.why}</p>
        <p className="mt-2 text-xs leading-6">{status ? `${status.label} in your saved work. ${status.detail}` : fallbackStatus ? `${fallbackStatus}. Open the earlier workshop to inspect it.` : "There is no saved attempt here yet. You can try the earlier workshop whenever you need it."}</p>
        {note && <blockquote className="my-3 border-l-2 border-accent-fill pl-4 text-sm leading-7"><span className="block text-xs text-muted">Your earlier note</span>{note}</blockquote>}
        {reusable && <p className="mt-2 text-sm text-accent">Your saved calculation can be brought into {reuseDestination}. {Object.entries(connection!.reuse!.sourceMap).map(([oldKey, newKey]) => `${connection!.build.sources[oldKey]} becomes ${connection!.reuse!.target.sources[newKey]}`).join("; ")}.</p>}
        <Link href={connection!.href} className="mt-2 inline-block min-h-11 content-center text-sm text-accent underline underline-offset-4">Open {connection!.title}</Link>
      </div>;
    })}</div>
  </details>;
}
