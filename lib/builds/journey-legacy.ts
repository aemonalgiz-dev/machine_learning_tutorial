import { assemble, evaluate, expressionTools, type Build, type Expression } from "./engine";
import { TOOLS } from "./tools";

/** Read compatibility for drafts made by the previous automatic journey.
 * New teaching plans never call this to choose a learning sequence. */
export function earlierJourneyBuilds(original: Build): { construction: Build; variation: Build; preparation?: Build } {
  const construction = { ...original, cases: original.cases.slice(0, -1) };
  const variation = { ...original, cases: [original.cases.at(-1)!, ...construction.cases] };
  const size = (expression: Expression): number => "source" in expression ? 0 : (expression.op === "constant" ? 0 : 1) + expression.inputs.reduce((total, child) => total + size(child), 0);
  if (size(original.recipe) < 3 || "source" in original.recipe) return { construction, variation };
  const candidates: { expression: Expression; count: number }[] = [];
  const visit = (expression: Expression) => {
    const count = size(expression);
    if (count > 0 && count <= 3 && expressionTools(expression).some(tool => tool.startsWith("source:"))) candidates.push({ expression, count });
    if (!("source" in expression)) expression.inputs.forEach(visit);
  };
  original.recipe.inputs.forEach(visit);
  const selected = candidates.find(item => item.count === 2) ?? candidates.find(item => item.count === 1) ?? candidates[0];
  if (!selected) return { construction, variation };
  const recipe = selected.expression;
  const keys = expressionTools(recipe).filter(key => key.startsWith("source:")).map(key => key.slice(7));
  const graph = assemble(recipe, TOOLS);
  return { construction, variation, preparation: { ...construction, recipe,
    title: "Your earlier component calculation",
    challenge: "This is the intermediate calculation from the previous journey. Its saved pieces and original checks remain here.",
    sources: Object.fromEntries(keys.map(key => [key, original.sources[key]])),
    cases: construction.cases.map(sample => ({ ...sample, data: Object.fromEntries(keys.map(key => [key, sample.data[key]])), expected: evaluate(graph, sample.data, TOOLS).output! })),
  } };
}
