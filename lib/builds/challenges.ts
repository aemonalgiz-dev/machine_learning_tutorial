import { assemble, evaluate, expressionTools, type Build, type Data, type Expression } from "./engine";
import { TOOLS } from "./tools";
import { planFor } from "./journeys";
import type { JourneyPlan } from "./journey-plan";

export interface ConstructionJourney {
  preparation?: { build: Build; tool: string; feedsInto: string; calculation: string };
  construction: Build;
  variation: { build: Build; changedSources: string[]; previous: Build["cases"][number] };
}

const sourcesIn = (expression: Expression) => expressionTools(expression).filter(key => key.startsWith("source:")).map(key => key.slice(7));

export function preparationExpression(recipe: Expression, path: number[]): { expression: Expression; parent: string } {
  if (!path.length) throw new Error("A preparation must name a smaller calculation within the full recipe.");
  let expression = recipe;
  let parent = "";
  for (const index of path) {
    if ("source" in expression || !Number.isInteger(index) || index < 0 || !expression.inputs[index]) throw new Error("Invalid authored preparation path.");
    parent = expression.op;
    expression = expression.inputs[index];
  }
  if ("source" in expression || !sourcesIn(expression).length) throw new Error("A preparation must calculate with this problem's data.");
  return { expression, parent };
}

function describeCalculation(expression: Expression, sources: Record<string, string>, indent = 0): string {
  if ("source" in expression) return sources[expression.source];
  if (expression.op === "constant") return String(expression.settings?.value);
  const tool = TOOLS[expression.op], padding = "  ".repeat(indent);
  const inputs = expression.inputs.map((input, index) => `${padding}  ${tool.inputs[index]}: ${describeCalculation(input, sources, indent + 1)}`);
  const settings = tool.settings?.map(setting => `${padding}  ${setting.label}: ${expression.settings?.[setting.key] ?? setting.initial}`) ?? [];
  return `${tool.title}(\n${[...inputs, ...settings].join("\n")}\n${padding})`;
}

export function constructionJourney(original: Build, authored?: JourneyPlan): ConstructionJourney {
  if (original.cases.length < 2) throw new Error(`${original.id}: a journey needs a build example and a different case.`);
  // The controls tutorial has its own hand-built onboarding component.
  const plan = authored ?? (original.id === "workshop-guide" ? undefined : planFor(original.id));
  const caseIndex = plan?.investigation.caseIndex ?? original.cases.length - 1;
  if (!Number.isInteger(caseIndex) || caseIndex < 1 || caseIndex >= original.cases.length) throw new Error(`${original.id}: choose a changed case after the first example.`);
  const variationCase = original.cases[caseIndex];
  const contextual = plan ? { ...original, title: plan.construction.title, problem: plan.premise, why: plan.construction.outcome, hints: plan.construction.hints ?? original.hints } : original;
  const construction: Build = { ...contextual, cases: original.cases.filter((_, index) => index !== caseIndex) };
  const previous = construction.cases[0];
  const changedSources = Object.keys(original.sources).filter(key => JSON.stringify(previous.data[key]) !== JSON.stringify(variationCase.data[key]));
  if (!changedSources.length) throw new Error(`${original.id}: the variation must change the input data.`);
  const variation = {
    previous, changedSources,
    // Keep the earlier examples as regression checks. Passing a new case must
    // not mean breaking the construction that worked on the earlier records.
    build: { ...contextual, title: plan?.investigation.title ?? original.title, why: plan?.investigation.outcome ?? original.why, cases: [variationCase, ...construction.cases] },
  };
  const first = plan?.preparation ? preparationExpression(original.recipe, plan.preparation.path) : undefined;
  if (!first || "source" in first.expression) return { construction, variation };
  const tool = first.expression.op;
  const sourceKeys = sourcesIn(first.expression);
  const sources = Object.fromEntries(sourceKeys.map(key => [key, original.sources[key]]));
  const graph = assemble(first.expression, TOOLS);
  const cases = construction.cases.map(sample => {
    const data = Object.fromEntries(sourceKeys.map(key => [key, sample.data[key]]));
    const trace = evaluate(graph, data, TOOLS);
    if (trace.error || trace.output === undefined) throw new Error(`${original.id}: invalid intermediate calculation.`);
    return { name: sample.name, data, expected: trace.output };
  });
  const operations = expressionTools(first.expression).filter(key => !key.startsWith("source:"));
  const feedsInto = TOOLS[first.parent].title;
  return { construction, variation, preparation: { tool, feedsInto, calculation: describeCalculation(first.expression, sources), build: {
    ...original, sources, cases, recipe: first.expression,
    title: plan!.preparation!.title,
    challenge: plan!.preparation!.challenge,
    why: plan!.preparation!.why,
    extras: [...new Set([...(original.extras ?? []), ...operations])],
    hints: plan!.preparation!.hints ?? [
      plan!.preparation!.why,
      `${TOOLS[tool].title} needs ${TOOLS[tool].inputs.join(" and ")}. ${TOOLS[tool].why}`,
      `One construction uses ${operations.map(key => TOOLS[key].title).join(", ")}. Follow what each operation produces before connecting it to the next input.`,
    ],
  } } };
}

export function readPrediction(text: string, expected: Data): { value?: Data; error?: string } {
  if (!text.trim()) return { error: "Write your prediction first so you can compare it with the result." };
  if (typeof expected === "string") return { value: text.trim().replace(/^"(.*)"$/, "$1") };
  try {
    const value: unknown = JSON.parse(text);
    if (value === null || typeof value === "number" || typeof value === "boolean" || typeof value === "string" || typeof value === "object") return { value: value as Data };
  } catch { /* Explain the format without losing what the learner wrote. */ }
  return { error: "Use a number, true or false, or an array such as [2, 4]. For a table, put each row in brackets: [[2, 4], [1, 3]]." };
}
