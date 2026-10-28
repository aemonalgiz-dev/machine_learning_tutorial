import { expressionTools, same, show, type Build, type Construction, type Trace } from "./engine";
import { TOOLS } from "./tools";
import { journeyPlans } from "./journeys";

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
  const authored = journeyPlans[build.id]?.construction.hints;
  if (authored?.length) return authored;
  if (build.id === "statistics") return [
    "Imagine sharing the recorded deaths equally across the weeks. First keep track of how much there is to share.",
    "The list also tells you how many weeks were recorded. That number changes between examples, so count the entries instead of entering a fixed divisor.",
    "Add a list and Count items can both read the weekly records. Divide the total by the count, then send that result to the output.",
  ];
  const operations = expressionTools(build.recipe).filter(key => !key.startsWith("source:") && key !== "constant");
  return [
    `Look at ${Object.values(build.sources)[0]}. What does it tell us about the problem, and what still needs to be calculated? Place that source and try one operation on it before building the whole route.`,
    operations.length ? `Consider ${TOOLS[operations[0]].title}. ${TOOLS[operations[0]].why} Select a piece on the floor to inspect the values reaching its inputs.` : "Follow the source values to the result and check their order.",
    `One route uses these operations: ${operations.map(key => TOOLS[key].title).join(", ")}. Decide what each must receive before connecting it. The worked construction remains available below if you want to inspect the whole route.`,
  ];
}

export function experimentPrompt(build: Build): string {
  const prompts: Record<string, string> = {
    "workshop-guide": "Try a negative sensor reading. What should doubling it mean? After that, see whether you can double a reading using a different arrangement of pieces.",
    statistics: "Suppose one week had an unusually high number of recorded deaths. Change that week's count and predict how the mean will move. Does the new mean describe most of the weeks well?",
    "linear-algebra": "Change just the bread price. Before looking at the bills, decide which customer should see the largest increase. Then change one customer's purchase and check whether anyone else's bill changes.",
    calculus: "Move the later time closer to the earlier one and change its position to the square of that time, as in the lesson's path. What happens to the estimated speed? Equal times are worth trying too: why can we no longer divide?",
    "polynomial-features": "Try a negative instrument reading, then its positive counterpart. What information disappears when we square them? Would a model need the original reading as well as its square?",
    "recurrent-layers": "Move the same energy from an early audio frame to a later one. Predict which running totals will change and which will stay the same. The final total alone cannot tell us when that sound arrived.",
    "training-diagnostics": "Make two recorded losses equally small. Which position does your construction return? Then make the final loss larger than an earlier one. Would choosing the last training step give the same answer?",
    "graph-representations": "Add one connection to the adjacency matrix. For an undirected graph, change the mirrored entry too. Predict which nodes' neighbour counts will change before checking the output.",
    "neurons-and-activations": "Increase both light readings by the same amount. Should the neuron change its decision? Now keep the right light fixed and move the left reading just across the two-unit difference.",
    attention: "Set both query coordinates to zero and inspect the attention shares. Then change just one source word's value. Can you explain its influence on the answer from the share that word receives? Keep the key dimension consistent with the vectors.",
    "sampling-and-temperature": "Keep the logits fixed and try a very small positive temperature, then a larger one. Which tokens lose probability as the distribution becomes more concentrated? A temperature of zero does not define this division.",
    "gradient-descent-regression": "Try a zero gradient, then reverse its sign. Predict the direction of the parameter update before inspecting the result. What would a much larger gradient do with the same step size?",
    "filters-and-edges": "Brighten both pixels by the same amount. Should the edge response change? Then exchange the left and right brightness values and check the sign.",
    convolution: "Change a single image pixel. Which windows include it, and which responses should therefore change? Follow that pixel through the window matrix before inspecting the final list.",
    pooling: "Change a pixel that is below the maximum in its window. How high must it become before the pooled output changes? Compare this with changing the window's current largest pixel.",
    "convolutional-networks": "Make the filter produce negative responses and inspect what reaches the last piece. Then change one pixel until a positive response survives. Where in the construction does that change first become visible?",
    "template-matching": "Change one pixel in the camera image. Can you make a different window become the best match? Inspect the distances to see whether the winner is convincing or only slightly better than another window.",
    "u-net": "Change one fine-detail value while keeping the coarse map fixed. Find where that detail appears in the combined output. Then change the coarse value and count how many upsampled positions respond.",
    "histogram-of-oriented-gradients": "Multiply every direction magnitude by the same positive amount. Will the normalised result change? Now change only one direction and compare what happens.",
    "pipelines": "Change a held-out reading and inspect the centring reference. Should test data be able to change a reference fitted on training data? Follow the two sources separately to check your construction.",
    "grid-search": "Give one candidate an excellent result on one fold and poor results on the others. Will it still win? Inspect each candidate's mean before looking at the selected setting.",
  };
  return prompts[build.id] ?? "Use a copy of the example to try your own data. Keep the problem's assumptions in mind, and predict the effect of a change before checking the output. You can also add another branch to compare two ways of doing the calculation.";
}
