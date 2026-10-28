import type { Build } from "./engine";

/** Correct a legacy caption without changing the case names used in saved-draft fingerprints. */
export function caseLabel(build: Pick<Build, "id">, sample: Pick<Build["cases"][number], "name">) {
  if (build.id.replace(/-fresh$/, "") === "class-imbalance" && sample.name === "Equal class recalls") {
    return "Different class sizes and recalls";
  }
  return sample.name;
}
