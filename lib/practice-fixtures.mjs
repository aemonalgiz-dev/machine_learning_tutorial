export function exerciseSignature(problem) {
  const text = problem.title + "\n" + problem.starter + "\n" + problem.solution;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
}

export function browserOutput(problem, fixtures) {
  const fixture = fixtures.outputs[problem.title];
  return fixture?.signature === exerciseSignature(problem) ? fixture.output : problem.output;
}
