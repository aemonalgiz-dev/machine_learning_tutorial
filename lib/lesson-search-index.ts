import { LEARNING_AREAS, learningAreaSections } from "./learning-areas";
import { courseSectionHref } from "./course-navigation";
import type { SearchEntry } from "./lesson-search";

const additionalTerms: Record<string, string> = {
  "/concepts/agent-prompts": "prompt engineering few shot instructions workflow",
  "/concepts/agent-structured-outputs": "structured output JSON schema validation",
  "/concepts/agent-tool-contracts": "tool calling function calling idempotency permissions",
  "/concepts/agent-context": "context engineering RAG retrieval augmented generation token budget",
  "/concepts/agent-loops": "agent loop ReAct stopping retries",
  "/concepts/agent-human-approval": "human in the loop approval permissions",
  "/concepts/agent-mcp": "Model Context Protocol tools resources prompts",
  "/concepts/agent-tracing": "observability OpenTelemetry spans tracing",
  "/concepts/agent-langfuse": "Langfuse observability evaluation experiments scores",
  "/concepts/agent-evaluation-datasets": "agent evaluations datasets regression tests",
  "/concepts/agent-model-judges": "LLM as a judge evaluation rubric calibration",
  "/concepts/agent-release-checks": "promptfoo Phoenix agent evaluation release regression CI",
};

// Only the search page sends this index to the browser.
export const searchEntries: SearchEntry[] = LEARNING_AREAS.flatMap(area => learningAreaSections(area).flatMap(section => [
  { title: section.title, description: section.intro, href: courseSectionHref(section), areaId: area.id, areaTitle: area.title, sectionTitle: section.title, kind: "Section" as const, terms: section.topics.map(topic => topic.heading).join(" ") },
  ...section.topics.flatMap(topic => topic.concepts.flatMap(lesson => lesson.href ? [{ title: lesson.title, description: lesson.blurb, href: lesson.href, areaId: area.id, areaTitle: area.title, sectionTitle: section.title, kind: "Lesson" as const, terms: `${topic.heading} ${lesson.href.split("/").pop()?.replaceAll("-", " ")} ${additionalTerms[lesson.href] ?? ""}` }] : [])),
]));
