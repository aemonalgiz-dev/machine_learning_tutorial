import type { Build, Data } from "./engine";

/** A separately authored follow-up, never an automatic mutation of a fixture. */
export interface FreshJourneyCase {
  name: string;
  prompt: string;
  data: Record<string, Data>;
  expected: Data;
  why: string;
}

export function freshJourneyBuild(build: Build, fresh: FreshJourneyCase): Build {
  return {
    ...build,
    id: `${build.id}-fresh`,
    title: fresh.name,
    challenge: fresh.prompt,
    why: fresh.why,
    cases: [{ name: fresh.name, data: fresh.data, expected: fresh.expected }, ...build.cases],
  };
}
