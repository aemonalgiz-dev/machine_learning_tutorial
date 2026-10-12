import { expressionTools, same, show, type Build, type Construction, type Trace } from "./engine";
import { TOOLS } from "./tools";

export function resultFeedback(build: Build, graph: Construction, trace: Trace, caseIndex: number): string | undefined {
  if (trace.error || trace.output === undefined || same(trace.output, build.cases[caseIndex].expected)) return;
  const data = build.cases[caseIndex].data;
  if (build.id === "statistics" && Array.isArray(data.weeklyCounts)) {
    const values = data.weeklyCounts as number[];
    const total = values.reduce((sum, value) => sum + value, 0);
    if (same(trace.output, total)) return `You have the total across ${values.length} weeks. The question asks about one average week. What would you need to do with that total to account for the number of weeks?`;
    if (same(trace.output, values.length / total)) return "Your division has the two quantities the other way round. Which quantity describes all the deaths, and which describes how many weeks share them? Inspect the Amount and Divisor inputs.";
  }
  const incoming = graph.connections.find(wire => wire.to === "output");
  const last = graph.pieces.find(piece => piece.id === incoming?.from);
  if (last?.tool === "constant") return "This answer stays fixed when the example changes. Which measurements should change the answer? Follow one of those sources through your construction before testing again.";
  if (build.id === "gradient-descent-regression") return "Compare the new coefficient with the old one. A positive gradient calls for a smaller coefficient, a negative gradient for a larger one, and a zero gradient for no change. Then check the size of the step.";
  if (build.id === "convolutional-networks") return "Inspect the window responses before taking the largest value. Does your construction use the supplied filter, and what happens when every response is negative?";
  const short = (value: Parameters<typeof show>[0]) => { const text = show(value); return text.length < 90 ? text : "a different structure of values"; };
  return `This example produced ${short(trace.output)}; it needs ${short(build.cases[caseIndex].expected)}. Select Result, then follow its incoming connection backwards. Find the first operation whose output does not have the meaning the problem asks for.`;
}

export function constructionHints(build: Build): string[] {
  if (build.hints?.length) return build.hints;
  if (build.id === "statistics") return [
    "Imagine sharing the recorded deaths equally across the weeks. First keep track of how much there is to share.",
    "The list also tells you how many weeks were recorded. That number changes between examples, so count the entries instead of entering a fixed divisor.",
    "Add a list and Count items can both read the weekly records. Divide the total by the count, then send that result to the output.",
  ];
  const operations = expressionTools(build.recipe).filter(key => !key.startsWith("source:") && key !== "constant");
  return [
    build.why,
    operations.length ? `Consider ${TOOLS[operations[0]].title}. ${TOOLS[operations[0]].why} Select a piece on the floor to inspect the values reaching its inputs.` : "Follow the source values to the result and check their order.",
    `One route uses these operations: ${operations.map(key => TOOLS[key].title).join(", ")}. Decide what each must receive before connecting it. The worked construction remains available below if you want to inspect the whole route.`,
  ];
}
